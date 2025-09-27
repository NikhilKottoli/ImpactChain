// routes/posts.js
const express = require('express');
const supabaseService = require('../services/SupabaseService');
// --- Transformers.js Setup ---
// Use a dynamic import for ES Modules
let pipeline;
import('@xenova/transformers').then(mod => {
    // Get the pipeline function
    pipeline = mod.pipeline;
    console.log('[ML Loader] Transformers.js loaded successfully.');
}).catch(err => {
    console.error('[ML Loader] Failed to load Transformers.js:', err);
});

let classifier = null;
// Use the Xenova-converted model which is optimized for Transformers.js
const ML_MODEL_NAME = "Xenova/clip-vit-large-patch14";
// --- End Setup ---

const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const CANDIDATE_LABELS = [
    'community service', 'volunteering', 'environmental conservation', 'animal welfare',
    'education', 'health and wellness', 'fundraising', 'charity',
    'humanitarian aid', 'social activism', 'community building', 'tree planting',
    'recycling', 'food drive', 'mentorship'
];

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
    const { creator, title, description, ipfs_hash, ai_labels, location } = req.body;
    if (!creator || !ipfs_hash) {
        return res.status(400).json({ error: 'Missing required post fields.' });
    }

    const newPost = await supabaseService.createPost({
      creator, title, description, ipfs_hash, ai_labels, location
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /posts/:id/classify
 * Triggers AI classification for a post using a locally-run model.
 */
router.patch('/:id/classify', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Load the classifier if it hasn't been loaded yet.
        // This will only run on the first request.
        if (!classifier) {
            console.log('[ML Classifier] Initializing local zero-shot-image-classification model...');
            // The model will be downloaded and cached on the first run.
            // Using the Xenova model, we can use the default (quantized) version.
            classifier = await pipeline('zero-shot-image-classification', ML_MODEL_NAME);
            console.log('[ML Classifier] Model initialized successfully.');
        }

        // 2. Fetch the post from the database to get the IPFS hash
        const post = await supabaseService.getPostById(id);
        if (!post || !post.ipfs_hash) {
            return res.status(404).json({ error: 'Post or IPFS hash not found.' });
        }
        const ipfs = post.ipfs_hash.replace('ipfs://', '');

        // 3. Download the image from an IPFS gateway
        const ipfsGatewayUrl = `https://gateway.lighthouse.storage/ipfs/${ipfs}`;
        console.log(`[ML Classifier] Downloading image from: ${ipfsGatewayUrl}`);
        
        // 4. Classify the image using the local model
        console.log(`[ML Classifier] Classifying image for post ${id}...`);
        const classificationResponse = await classifier(ipfsGatewayUrl, CANDIDATE_LABELS);

        // 5. Extract the top 3 labels
        const topLabels = classificationResponse
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(labelInfo => labelInfo.label);

        console.log(`[ML Classifier] Top 3 labels found: ${topLabels.join(', ')}`);

        // 6. Update the post in the database with the new labels
        const updatedPost = await supabaseService.updatePostAILabels(id, { ai_labels: topLabels });

        res.status(200).json(updatedPost);

    } catch (error) {
        console.error(`[ML Classifier] Error processing post ${id}:`, error.message);
        res.status(500).json({ error: 'Failed to classify image and update post.' });
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