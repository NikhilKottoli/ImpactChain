// services/paymentService.js
const fetch = require('node-fetch'); // You might need to run: npm install node-fetch

const APP_ID = process.env.APP_ID;
const DEV_PORTAL_API_KEY = process.env.DEV_PORTAL_API_KEY;

/**
 * Verifies a World App payment transaction against the Developer Portal API.
 * @param {string} transactionId The ID received from the MiniKit Pay success payload.
 * @param {string} expectedReferenceId The reference ID you initiated and stored in your DB.
 */
async function verifyPaymentTransaction(transactionId, expectedReferenceId) {
    if (!APP_ID || !DEV_PORTAL_API_KEY) {
        console.error('FATAL: Worldcoin API keys are not configured in .env.');
        throw new Error('Server configuration error: Missing API keys.');
    }

    try {
        const verificationUrl = `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${APP_ID}`;
        
        const response = await fetch(verificationUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${DEV_PORTAL_API_KEY}`,
            },
        });

        const transaction = await response.json();

        // 1. Check if the transaction exists and the reference matches your initiation
        if (transaction.reference !== expectedReferenceId) {
            return { success: false, reason: 'Verification failed: Reference ID mismatch.' };
        }
        
        // 2. Check the transaction status
        // A status of 'pending' or 'mined' is typically good. 'failed' is bad.
        if (transaction.status === 'failed') {
            return { success: false, reason: `Transaction failed on-chain with status: ${transaction.status}` };
        }

        // 3. (Optional but recommended) Check recipient, token, and amount 
        // against your DB to ensure the user didn't modify the recipient address in the frontend.

        return { success: true, transactionData: transaction };

    } catch (error) {
        console.error('Error calling Worldcoin verification API:', error);
        throw new Error('Verification service error during API call.');
    }
}

module.exports = {
    verifyPaymentTransaction
};
