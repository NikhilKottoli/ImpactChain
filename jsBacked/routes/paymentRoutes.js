const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Import the verification logic service
const { verifyPaymentTransaction } = require('../services/paymentService');

// --- MOCK DATABASE FUNCTIONS (REPLACE WITH YOUR ACTUAL DB LOGIC) ---
// In a real application, you would connect to Supabase/Postgres here.
const db = {
    // Stores { referenceId: { tokenId: number, amount: string, recipient: string } }
    transactionRefs: new Map(), 
    saveTransactionRef: (id, details) => {
        console.log(`[DB MOCK] Saving reference: ${id}`);
        db.transactionRefs.set(id, details);
    },
    getTransactionRef: (id) => {
        const details = db.transactionRefs.get(id);
        console.log(`[DB MOCK] Retrieved details for ${id}:`, details);
        return details;
    },
    markTransactionCompleted: (id) => {
        console.log(`[DB MOCK] Marking transaction ${id} as completed.`);
        // In a real app, update a 'status' field in your transactions table.
        return true;
    }
};
// ----------------------------------------------------------------------


// POST /api/initiate-pay (Step 1: Creates a unique transaction reference)
router.post('/initiate-pay', async (req, res) => {
    try {
        const requestDetails = req.body;
        // Use crypto to generate a unique 32-character hex ID (similar to UUID)
        const referenceId = crypto.randomBytes(16).toString('hex'); 
        
        // ⚠️ TODO: Replace this mock function with your actual Supabase/DB call
        db.saveTransactionRef(referenceId, requestDetails); 
        
        // Return the unique ID to the frontend
        res.status(200).json({ id: referenceId });
    } catch (error) {
        console.error('Initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate payment reference' });
    }
});


// POST /api/confirm-payment (Step 3: Verifies the on-chain transaction)
router.post('/confirm-payment', async (req, res) => {
    const { payload } = req.body;
    
    // 1. Retrieve the expected transaction details from your database
    const expectedDetails = db.getTransactionRef(payload.reference);

    if (!expectedDetails) {
        return res.status(400).json({ success: false, reason: 'Invalid or expired payment reference.' });
    }
    
    // The transaction ID comes from the MiniKit payload
    const transactionId = payload.transaction_id;

    try {
        // 2. Call the secure verification service
        const verificationResult = await verifyPaymentTransaction(
            transactionId,
            payload.reference
        );

        if (verificationResult.success) {
            
            // 3. FINAL SECURITY CHECK (HIGHLY RECOMMENDED):
            // Check that the amount/token in verificationResult.transactionData 
            // matches the expectedDetails saved in your DB.

            // 4. Update the DB: Mark transaction as complete and record the cheer.
            // ⚠️ TODO: Replace this mock function with your actual DB updates
            db.markTransactionCompleted(payload.reference); 
            
            // Example: Update the cheer count/earnings in your 'posts' table
            // supabaseService.updatePostEarnings(expectedDetails.tokenId, expectedDetails.amount);

            return res.status(200).json({ success: true, message: 'Payment confirmed and verified.' });
        } else {
            // Transaction failed on-chain or reference mismatch in Worldcoin API
            return res.status(400).json({ success: false, reason: verificationResult.reason });
        }
    } catch (error) {
        console.error('Confirmation error:', error);
        return res.status(500).json({ success: false, reason: 'Server verification failed.' });
    }
});

module.exports = router;
