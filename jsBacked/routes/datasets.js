const express = require('express');
const router = express.Router();
const supabaseService = require('../services/SupabaseService');
const { ethers } = require('ethers');

/**
 * GET /api/datadao/label/:label
 * Fetches all token_ids from the data pipeline that match a given label.
 * This is used to assemble a dataset for the DataDAO.
 */
router.get('/label/:label', async (req, res) => {
  const { label } = req.params;
  if (!label) {
    return res.status(400).json({ error: 'Label parameter is required.' });
  }

  try {
    console.log(`Searching for dataset token_ids with label: "${label}"`);
    const tokenIds = await supabaseService.getTokenIdsByLabelFromPipeline(label);

    if (!tokenIds || tokenIds.length === 0) {
      console.log(`No token_ids found for label: "${label}"`);
      return res.status(404).json({ message: 'No matching data found for this label.' });
    }
    
    console.log(`Found ${tokenIds.length} token_ids for label "${label}".`);
    res.json(tokenIds);
  } catch (error) {
    console.error(`Error fetching dataset token_ids for label "${label}":`, error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/datadao/sign
 * Creates a cryptographic signature for a given list of token IDs.
 * This signature is required by the DataDAO smart contract to create a dataset NFT.
 */
router.post('/sign', async (req, res) => {
  const { tokenIds } = req.body;

  if (!tokenIds || !Array.isArray(tokenIds) || tokenIds.length === 0) {
    return res.status(400).json({ error: "A non-empty 'tokenIds' array is required." });
  }

  try {
    const privateKey = process.env.VALIDATOR_PRIVATE_KEY;
    if (!privateKey) {
      console.error("FATAL: VALIDATOR_PRIVATE_KEY is not set in the .env file.");
      return res.status(500).json({ error: "Server configuration error: Validator not configured." });
    }
    const validatorWallet = new ethers.Wallet(privateKey);
    console.log(`Signing with validator address: ${validatorWallet.address}`);

    const messageHash = ethers.solidityPackedKeccak256(["uint256[]"], [tokenIds]);
    const signature = await validatorWallet.signMessage(ethers.getBytes(messageHash));

    console.log(`Successfully signed dataset with ${tokenIds.length} token(s).`);

    res.status(200).json({
      tokenIds: tokenIds,
      apiSignature: signature,
    });
    
  } catch (error) {
    console.error("Error signing dataset:", error.message);
    res.status(500).json({ error: "Failed to create dataset signature." });
  }
});

module.exports = router;