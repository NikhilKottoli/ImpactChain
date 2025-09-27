import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../utils/supabaseService';
import { typedSupabase } from '../utils/supabase';
import type { Post } from '../types/contract';

// ===== POSTS HOOKS =====

export const useSupabasePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabasePosts = await supabaseService.getAllPosts();
      const convertedPosts = supabasePosts.map(post => 
        supabaseService.convertSupabasePostToPost(post)
      );
      setPosts(convertedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
};

export const useSupabaseUserPosts = (creator: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPosts = useCallback(async () => {
    if (!creator) return;
    
    try {
      setLoading(true);
      setError(null);
      const supabasePosts = await supabaseService.getPostsByCreator(creator);
      const convertedPosts = supabasePosts.map(post => 
        supabaseService.convertSupabasePostToPost(post)
      );
      setPosts(convertedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user posts');
    } finally {
      setLoading(false);
    }
  }, [creator]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  return { posts, loading, error, refetch: fetchUserPosts };
};

export const useSupabasePost = (tokenId: number) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!tokenId) return;
    
    try {
      setLoading(true);
      setError(null);
      const supabasePost = await supabaseService.getPostByTokenId(tokenId);
      if (supabasePost) {
        setPost(supabaseService.convertSupabasePostToPost(supabasePost));
      } else {
        setPost(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return { post, loading, error, refetch: fetchPost };
};

// ===== USER HOOKS =====

export const useSupabaseUser = (walletAddress: string) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      setLoading(true);
      setError(null);
      const userData = await supabaseService.getUserByWallet(walletAddress);
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = useCallback(async (updates: any) => {
    try {
      const updatedUser = await supabaseService.updateUser(walletAddress, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, [walletAddress]);

  const createUser = useCallback(async (userData: any) => {
    try {
      const newUser = await supabaseService.upsertUser({
        walletAddress,
        ...userData,
      });
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  }, [walletAddress]);

  return { user, loading, error, updateUser, createUser, refetch: fetchUser };
};

// ===== INTERACTION HOOKS =====

export const useSupabaseInteractions = (postId: string) => {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);
      const interactionData = await supabaseService.getPostInteractions(postId);
      setInteractions(interactionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interactions');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const recordInteraction = useCallback(async (interactionData: any) => {
    try {
      const newInteraction = await supabaseService.recordInteraction(interactionData);
      setInteractions(prev => [newInteraction, ...prev]);
      return newInteraction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record interaction');
      throw err;
    }
  }, []);

  return { interactions, loading, error, recordInteraction, refetch: fetchInteractions };
};

// ===== REALTIME HOOKS =====

export const useSupabaseRealtime = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to posts changes
    const postsSubscription = typedSupabase
      .channel('posts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Posts changed:', payload);
          // You can emit events or update state here
        }
      )
      .subscribe((status) => {
        console.log('Posts subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to interactions changes
    const interactionsSubscription = typedSupabase
      .channel('interactions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'interactions' },
        (payload) => {
          console.log('Interactions changed:', payload);
          // You can emit events or update state here
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
      interactionsSubscription.unsubscribe();
    };
  }, []);

  return { isConnected };
};

// ===== SYNC HOOKS =====

export const useSupabaseSync = () => {
  const syncPost = useCallback(async (blockchainPost: Post) => {
    try {
      await supabaseService.syncBlockchainPostToSupabase(blockchainPost);
    } catch (error) {
      console.error('Failed to sync post:', error);
    }
  }, []);

  const syncUser = useCallback(async (walletAddress: string, userData?: any) => {
    try {
      await supabaseService.upsertUser({
        walletAddress,
        ...userData,
      });
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  }, []);

  const syncInteraction = useCallback(async (interactionData: any) => {
    try {
      await supabaseService.recordInteraction(interactionData);
    } catch (error) {
      console.error('Failed to sync interaction:', error);
    }
  }, []);

  return { syncPost, syncUser, syncInteraction };
};
