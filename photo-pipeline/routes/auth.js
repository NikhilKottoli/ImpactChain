const express = require('express');
const kavach = require("@lighthouse-web3/kavach");
const { ethers } = require('ethers');

const router = express.Router();

/**
 * GET /api/v1/auth/message
 * Provides a message for a user to sign to authenticate with Lighthouse.
 */
router.get('/message', async (req, res) => {
    const { address } = req.query;

    if (!address || !ethers.isAddress(address)) {
        return res.status(400).json({ error: 'A valid Ethereum address is required.' });
    }

    try {
        const authMessage = await kavach.getAuthMessage(address);
        res.status(200).json(authMessage);
    } catch (error) {
        console.error('Failed to get auth message:', error);
        res.status(500).json({ error: 'Could not retrieve authentication message.' });
    }
});

module.exports = router;