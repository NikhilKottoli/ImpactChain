// routes/posts.js
const express = require('express');
const supabaseService = require('../services/SupabaseService');
const router = express.Router();

/**
 * GET /posts
 * Fetch all active posts
 */
router.get('/', async (req, res) => {
  try {
    const posts = await supabaseService.getAllPosts();
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /posts/creator/:creatorAddress
 * Fetch posts by creator wallet address
 */
router.get('/creator/:creatorAddress', async (req, res) => {
    try {
        const posts = await supabaseService.getPostsByCreator(req.params.creatorAddress);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts by creator:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /posts/:tokenId
 * Get a single post by token ID
 */
router.get('/:tokenId', async (req, res) => {
    try {
        const tokenId = parseInt(req.params.tokenId, 10);
        if (isNaN(tokenId)) {
            return res.status(400).json({ error: 'Invalid Token ID' });
        }

        const post = await supabaseService.getPostByTokenId(tokenId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        console.error('Error fetching post by ID:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// NOTE: POST/PUT/DELETE routes are usually protected by an authentication layer
// but are included here for completeness based on the service methods.

/**
 * POST /posts
 * Create a new post (Typically used by a minting service or authenticated user)
 */
router.post('/', async (req, res) => {
  try {
    // Basic validation
    const { creator, title, description, ipfs_hash, ai_labels } = req.body;
    if (!creator || !ipfs_hash) {
        return res.status(400).json({ error: 'Missing required post fields.' });
    }

    const newPost = await supabaseService.createPost({
      creator, title, description, ipfs_hash, ai_labels
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /posts/:tokenId/deactivate
 * Deactivate a post
 */
router.put('/:tokenId/deactivate', async (req, res) => {
    try {
        const tokenId = parseInt(req.params.tokenId, 10);
        if (isNaN(tokenId)) {
            return res.status(400).json({ error: 'Invalid Token ID' });
        }
        await supabaseService.deactivatePost(tokenId);
        res.status(200).json({ message: `Post ${tokenId} deactivated successfully.` });
    } catch (error) {
        console.error('Error deactivating post:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;