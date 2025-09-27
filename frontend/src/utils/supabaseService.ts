import { supabase } from './supabase';
import type { Database } from './supabase';
import type { Post, Interaction } from '../types/contract';

type PostRow = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];
type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];
type InteractionRow = Database['public']['Tables']['interactions']['Row'];
type InteractionInsert = Database['public']['Tables']['interactions']['Insert'];

export class SupabaseService {
  // ===== POSTS =====
  
  /**
   * Create a new post in Supabase
   */
  async createPost(postData: {
    tokenId: number;
    creator: string;
    title: string;
    description: string;
    ipfsHash: string;
    aiLabels?: string[];
  }): Promise<PostRow> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    const insertData: PostInsert = {
      token_id: postData.tokenId,
      creator: postData.creator,
      title: postData.title,
      description: postData.description,
      ipfs_hash: postData.ipfsHash,
      likes: 0,
      total_earnings: '0',
      is_active: true,
      ai_labels: postData.aiLabels || [],
    };

    const { data, error } = await supabase
      .from('posts')
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
  async getAllPosts(): Promise<PostRow[]> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
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
  async getPostsByCreator(creator: string): Promise<PostRow[]> {
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
   * Get a single post by token ID
   */
  async getPostByTokenId(tokenId: number): Promise<PostRow | null> {
    const { data, error } = await supabase
      .from('posts')
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
   * Update post data
   */
  async updatePost(tokenId: number, updates: PostUpdate): Promise<PostRow> {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('token_id', tokenId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    return data;
  }

  /**
   * Update post likes
   */
  async updatePostLikes(tokenId: number, newLikeCount: number): Promise<void> {
    await this.updatePost(tokenId, { likes: newLikeCount });
  }

  /**
   * Update post earnings
   */
  async updatePostEarnings(tokenId: number, newEarnings: string): Promise<void> {
    await this.updatePost(tokenId, { total_earnings: newEarnings });
  }

  /**
   * Deactivate a post
   */
  async deactivatePost(tokenId: number): Promise<void> {
    await this.updatePost(tokenId, { is_active: false });
  }

  // ===== USERS =====

  /**
   * Create or update user profile
   */
  async upsertUser(userData: {
    walletAddress: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<UserRow> {
    const insertData: UserInsert = {
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
  async getUserByWallet(walletAddress: string): Promise<UserRow | null> {
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
  async updateUser(walletAddress: string, updates: UserUpdate): Promise<UserRow> {
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
  async recordInteraction(interactionData: {
    postId: string;
    userAddress: string;
    interactionType: 'like' | 'cheer';
    amount?: string;
  }): Promise<InteractionRow> {
    const insertData: InteractionInsert = {
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
  async getPostInteractions(postId: string): Promise<InteractionRow[]> {
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
  async getUserInteractions(userAddress: string): Promise<InteractionRow[]> {
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
   * Convert Supabase post to our Post interface
   */
  convertSupabasePostToPost(supabasePost: PostRow): Post {
    return {
      tokenId: supabasePost.token_id,
      creator: supabasePost.creator,
      timestamp: BigInt(new Date(supabasePost.created_at).getTime()),
      likes: supabasePost.likes,
      isActive: supabasePost.is_active,
      totalEarnings: BigInt(supabasePost.total_earnings),
      ipfsHash: supabasePost.ipfs_hash,
      title: supabasePost.title,
      description: supabasePost.description,
      aiLabels: supabasePost.ai_labels,
    };
  }

  /**
   * Sync blockchain post data to Supabase
   */
  async syncBlockchainPostToSupabase(blockchainPost: Post): Promise<void> {
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
      // Don't throw error to avoid breaking blockchain operations
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
