const express = require('express');
const ethersService = require('../services/ethers');
const supabase = require('../services/supabase');

const router = express.Router();

/**
 * POST /api/v1/datasets/sign-transaction
 * Creates a signature for a dataset purchase transaction.
 */
router.post('/sign-transaction', async (req, res) => {
    const { dbPhotoIds } = req.body; // Expecting an array of database IDs

    if (!dbPhotoIds || !Array.isArray(dbPhotoIds) || dbPhotoIds.length === 0) {
        return res.status(400).json({ error: 'dbPhotoIds must be a non-empty array.' });
    }

    try {
        // 1. Get on-chain token IDs from database IDs
        const tokenIds = await supabase.getTokenIdsFromDbIds(dbPhotoIds);
        if (tokenIds.length !== dbPhotoIds.length) {
            return res.status(404).json({ error: 'One or more photo IDs not found.' });
        }

        // 2. Get current price per photo from the smart contract
        const pricePerPhoto = await ethersService.getPricePerPhoto();
        const totalCost = BigInt(tokenIds.length) * pricePerPhoto;

        // 3. Sign the array of token IDs
        const apiSignature = await ethersService.signDataset(tokenIds);

        // 4. Return data needed by the frontend to call the smart contract
        res.status(200).json({
            tokenIds,
            totalCost: totalCost.toString(),
            apiSignature
        });

    } catch (error) {
        console.error('Failed to sign dataset transaction:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

module.exports = router;