// routes/users.js
const express = require('express');
const supabaseService = require('../services/SupabaseService');
const router = express.Router();

/**
 * GET /api/users/:walletAddress
 * Get user by wallet address
 */
router.get('/:walletAddress', async (req, res) => {
    try {
        const user = await supabaseService.getUserByWallet(req.params.walletAddress);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.get('/',async (req,res) =>{
    try{
        const users = await supabaseService.getAllUsers();

        if(!users){
            return res.send(500).json({error: 'No users found'});
        }

        return res.json(users);
    }catch(error){
        console.error('Error fetching users:', error.message);
        res.status(500).json({error: error.message});
    }
})

/**
 * POST /api/users (for upsert)
 * Create or update user profile
 */
router.post('/', async (req, res) => {
    try {
        const { walletAddress, username, bio, avatarUrl } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required.' });
        }

        const user = await supabaseService.upsertUser({ walletAddress, username, bio, avatarUrl });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error upserting user:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;