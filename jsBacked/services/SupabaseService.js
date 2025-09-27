// services/SupabaseService.js
const { supabase } = require('../config/supabaseClient');

class SupabaseService {
  /**
   * Utility to check if supabase is configured
   */

  _checkSupabase() {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
    }
  }

  // ===== POSTS =====
  
    /**
   * Count number of posts
   */

  async getAllPostsCount() {
    this._checkSupabase();
    const { count, error } = await supabase
      .from('social_posts')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Create a new post in Supabase
   */
  async createPost(postData) {
    this._checkSupabase();
    const tokenId = await this.getAllPostsCount() + 1;
    const insertData = {
      creator_id: postData.creator,
      title: postData.title,
      description: postData.description,
      ipfs_hash: postData.ipfsHash,
      location: postData.location || null,
      like_count: 0,
      total_earnings: '0',
      is_active: true,
      ai_labels: postData.aiLabels || [],
      token_id: tokenId
    };

    const { data, error } = await supabase
      .from('social_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all posts from Supabase
   */
  async getAllPosts() {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get posts by creator
   */
  async getPostsByCreator(creator) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('creator', creator)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user posts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update post data by its primary key (UUID)
   */
  async updatePost(id, updates) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', id) // Use the primary key 'id' column
      .select()
      .single();

    if (error) {
      console.error(`Error updating post ${id}:`, error.message);
      throw new Error(`Failed to update post ${id}`);
    }

    return data;
  }

  async getAllUsers(){
    this._checkSupabase();
    const {data,error} = await supabase
      .from('users')
      .select('*')
      .order('created_at',{ascending: false});

    if(error){
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single post by its primary key (UUID).
   * This is needed for the AI classification route.
   */
  async getPostById(id) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching post with ID ${id}:`, error.message);
      // Return null if not found, throw for other errors
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch post with ID ${id}`);
    }

    return data;
  }



  /**
   * Get a single post by token ID
   */
  async getPostByTokenId(tokenId) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('token_id', tokenId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Post not found
      }
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    return data;
  }

  /**
   * Update post data by its primary key (UUID)
   */
  async updatePost(id, updates) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', id) // Use the primary key 'id' column
      .select()
      .single();

    if (error) {
      console.error(`Error updating post ${id}:`, error.message);
      throw new Error(`Failed to update post ${id}`);
    }

    return data;
  }

  /**
   * Update by aiLabels by Post ID
   */
  async updatePostAILabels(id, aiLabels) {
    await this.updatePost(id, aiLabels);
  }

  /**
   * Update post likes
   */
  async updatePostLikes(tokenId, newLikeCount) {
    await this.updatePost(tokenId, { likes: newLikeCount });
  }

  /**
   * Update post earnings
   */
  async updatePostEarnings(tokenId, newEarnings) {
    await this.updatePost(tokenId, { total_earnings: newEarnings });
  }

  /**
   * Deactivate a post
   */
  async deactivatePost(tokenId) {
    await this.updatePost(tokenId, { is_active: false });
  }

  // ===== USERS =====

  /**
   * Create or update user profile
   */
  async upsertUser(userData) {
    this._checkSupabase();
    const insertData = {
      wallet_address: userData.walletAddress,
      username: userData.username || null,
      bio: userData.bio || null,
      avatar_url: userData.avatarUrl || null,
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(insertData, {
        onConflict: 'wallet_address',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert user: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user profile
   */
  async updateUser(walletAddress, updates) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  // ===== INTERACTIONS =====

  /**
   * Record an interaction (like or cheer)
   */
  async recordInteraction(interactionData) {
    this._checkSupabase();
    const insertData = {
      post_id: interactionData.postId,
      user_address: interactionData.userAddress,
      interaction_type: interactionData.interactionType,
      amount: interactionData.amount || null,
    };

    const { data, error } = await supabase
      .from('interactions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record interaction: ${error.message}`);
    }

    return data;
  }

  /**
   * Get interactions for a post
   */
  async getPostInteractions(postId) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch interactions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get user's interactions
   */
  async getUserInteractions(userAddress) {
    this._checkSupabase();
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user interactions: ${error.message}`);
    }

    return data || [];
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Sync blockchain post data to Supabase
   * NOTE: This method is typically used by an event listener/worker, not a direct API route.
   */
  async syncBlockchainPostToSupabase(blockchainPost) {
    try {
      // Check if post exists in Supabase
      const existingPost = await this.getPostByTokenId(blockchainPost.tokenId);
      
      if (existingPost) {
        // Update existing post
        await this.updatePost(blockchainPost.tokenId, {
          likes: blockchainPost.likes,
          total_earnings: blockchainPost.totalEarnings.toString(),
          is_active: blockchainPost.isActive,
        });
      } else {
        // Create new post
        await this.createPost({
          tokenId: blockchainPost.tokenId,
          creator: blockchainPost.creator,
          title: blockchainPost.title,
          description: blockchainPost.description,
          ipfsHash: blockchainPost.ipfsHash,
          aiLabels: blockchainPost.aiLabels,
        });
      }
    } catch (error) {
      console.error('Failed to sync blockchain post to Supabase:', error);
      // Log the error but continue execution
    }
  }
}

// Export singleton instance
module.exports = new SupabaseService();