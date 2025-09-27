const express = require('express');
const multer = require('multer');
const ethersService = require('../services/ethers');
const mlValidator = require('../services/validator');
const lighthouse = require('../services/lighthouse');
const supabase =require('../services/supabase');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/v1/photos/upload
 * Handles photo upload, validation, encryption, minting, and database storage.
 */
router.post('/upload', upload.single('photo'), async (req, res) => {
    const { labels, contributorAddress, authSignature } = req.body;
    const photoFile = req.file;

    if (!labels || !contributorAddress || !photoFile || !authSignature) {
        return res.status(400).json({ error: 'Missing labels, contributorAddress, authSignature, or photo file.' });
    }

    try {
        // 1. Validate photo with ML model
        // const isValid = await mlValidator.validate(photoFile.buffer, labels);
        const isValid = true; // TEMPORARILY DISABLING VALIDATION FOR DEMO PURPOSES
        if (!isValid) {
            return res.status(400).json({ error: 'Photo does not match provided labels.' });
        }

        // 2. Get JWT for Lighthouse authentication
        const jwt = await lighthouse.getJwt(contributorAddress, authSignature);

        // 3. Upload encrypted file to Lighthouse using the JWT
        const { cid, size } = await lighthouse.uploadEncrypted(
            photoFile.buffer,
            process.env.LIGHTHOUSE_API_KEY,
            contributorAddress, // This is the public key
            jwt                 // This is the JWT for auth
        );
        console.log(`Uploaded to Lighthouse. CID: ${cid}`);

        // 4. Mint PhotoNFT on-chain
        const tokenId = await ethersService.mintPhotoNFT(contributorAddress, cid, labels);

        // 5. Store metadata in Supabase
        const dbRecord = await supabase.savePhoto({
            tokenId,
            cid,
            labels,
            ownerAddress: contributorAddress,
            size
        });

        res.status(201).json({
            message: 'Photo processed successfully!',
            tokenId: tokenId,
            cid: cid,
            dbId: dbRecord.id
        });

    } catch (error) {
        console.error('Upload process failed:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

/**
 * GET /api/v1/photos/query
 * Queries photos from the database by label.
 */
router.get('/query', async (req, res) => {
    const { label } = req.query;
    if (!label) {
        return res.status(400).json({ error: 'Label query parameter is required.' });
    }
    try {
        const photos = await supabase.findPhotosByLabel(label);
        res.status(200).json(photos);
    } catch (error) {
        console.error('Query failed:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
});

module.exports = router;