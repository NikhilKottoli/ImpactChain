const express = require('express');
const CampaignService = require('../services/CampaignService');
const router = express.Router();

/*
    * GET /campaigns
    * Fetch all active campaigns

*/
router.get('/', async (req, res) => {
    try {
        const campaigns = await CampaignService.getAllCampaigns();
        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/*
    * POST /campaigns
    * Create a new campaign
*/
router.post('/', async (req, res) => {
    try {
        // Destructure ALL fields being sent from the frontend/database schema
        const { 
            id, 
            creator_id, 
            title, 
            description, 
            bounty_paid, 
            bounty_paid_by, 
            location_name, 
            category, 
            event_date, 
            deadline_crossed, 
            max_participants, 
            no_of_participants, 
            bounty_amount, 
            paymaster_id, 
            campaign_status, 
            ipfs_hash, 
            created_at, 
            updated_at 
        } = req.body;
        
        // Basic validation (Ensure critical new fields are present)
        if (!id || !creator_id || !title || !description || !location_name || !category || !event_date || typeof max_participants !== 'number' || !bounty_amount || !paymaster_id) {
            return res.status(400).json({ error: 'Missing or invalid fields required for campaign persistence' });
        }

        // The CampaignService.createCampaign function must be updated on the backend 
        // to accept the full set of database fields. Assuming it is updated, we pass all fields.
        const newCampaign = await CampaignService.createCampaign({
            id,
            creator_id,
            title,
            description,
            bounty_paid: bounty_paid || false, // Use received value or default
            bounty_paid_by,
            location_name,
            category,
            event_date,
            deadline_crossed: deadline_crossed || false, // Use received value or default
            max_participants,
            no_of_participants: no_of_participants || 0, // Use received value or default
            bounty_amount,
            paymaster_id,
            campaign_status: campaign_status || 'ACTIVE', // Use received value or default
            ipfs_hash,
            created_at, 
            updated_at 
        });

        res.status(201).json(newCampaign);
    } catch (error) {
        console.error('Error creating campaign:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;