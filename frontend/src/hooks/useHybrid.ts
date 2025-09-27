import { useState, useEffect, useCallback } from 'react';
import { useSupabasePosts, useSupabaseUserPosts, useSupabasePost, useSupabaseUser } from './useSupabase';
import { usePosts, useUserPosts, usePost } from './useContract';
import { supabaseService } from '../utils/supabaseService';
import type { Post } from '../types/contract';

// Hybrid hook that combines blockchain and Supabase data
export const useHybridPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'blockchain' | 'supabase' | 'hybrid'>('hybrid');

  const blockchainPosts = usePosts();
  const supabasePosts = useSupabasePosts();

  const fetchHybridPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try Supabase first (faster)
      if (supabasePosts.posts.length > 0) {
        setPosts(supabasePosts.posts);
        setDataSource('supabase');
        setLoading(false);
        return;
      }

      // Fallback to blockchain
      if (blockchainPosts.posts.length > 0) {
        setPosts(blockchainPosts.posts);
        setDataSource('blockchain');
        
        // Sync blockchain posts to Supabase in background
        blockchainPosts.posts.forEach(async (post) => {
          try {
            await supabaseService.syncBlockchainPostToSupabase(post);
          } catch (error) {
            console.error('Failed to sync post to Supabase:', error);
          }
        });
      } else {
        setPosts([]);
        setDataSource('hybrid');
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      setLoading(false);
    }
  }, [blockchainPosts.posts, supabasePosts.posts]);

  useEffect(() => {
    fetchHybridPosts();
  }, [fetchHybridPosts]);

  return {
    posts,
    loading: loading || blockchainPosts.isLoading || supabasePosts.loading,
    error: error || blockchainPosts.error || supabasePosts.error,
    dataSource,
    refetch: fetchHybridPosts,
  };
};

export const useHybridUserPosts = (creator: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'blockchain' | 'supabase' | 'hybrid'>('hybrid');

  const blockchainPosts = useUserPosts(creator);
  const supabasePosts = useSupabaseUserPosts(creator);

  const fetchHybridUserPosts = useCallback(async () => {
    if (!creator) return;

    try {
      setLoading(true);
      setError(null);

      // Try Supabase first (faster)
      if (supabasePosts.posts.length > 0) {
        setPosts(supabasePosts.posts);
        setDataSource('supabase');
        setLoading(false);
        return;
      }

      // Fallback to blockchain
      if (blockchainPosts.posts.length > 0) {
        setPosts(blockchainPosts.posts);
        setDataSource('blockchain');
        
        // Sync blockchain posts to Supabase in background
        blockchainPosts.posts.forEach(async (post) => {
          try {
            await supabaseService.syncBlockchainPostToSupabase(post);
          } catch (error) {
            console.error('Failed to sync post to Supabase:', error);
          }
        });
      } else {
        setPosts([]);
        setDataSource('hybrid');
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user posts');
      setLoading(false);
    }
  }, [creator, blockchainPosts.posts, supabasePosts.posts]);

  useEffect(() => {
    fetchHybridUserPosts();
  }, [fetchHybridUserPosts]);

  return {
    posts,
    loading: loading || blockchainPosts.isLoading || supabasePosts.loading,
    error: error || blockchainPosts.error || supabasePosts.error,
    dataSource,
    refetch: fetchHybridUserPosts,
  };
};

export const useHybridPost = (tokenId: number) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'blockchain' | 'supabase' | 'hybrid'>('hybrid');

  const blockchainPost = usePost(tokenId);
  const supabasePost = useSupabasePost(tokenId);

  const fetchHybridPost = useCallback(async () => {
    if (!tokenId) return;

    try {
      setLoading(true);
      setError(null);

      // Try Supabase first (faster)
      if (supabasePost.post) {
        setPost(supabasePost.post);
        setDataSource('supabase');
        setLoading(false);
        return;
      }

      // Fallback to blockchain
      if (blockchainPost.post) {
        setPost(blockchainPost.post);
        setDataSource('blockchain');
        
        // Sync blockchain post to Supabase in background
        try {
          await supabaseService.syncBlockchainPostToSupabase(blockchainPost.post);
        } catch (error) {
          console.error('Failed to sync post to Supabase:', error);
        }
      } else {
        setPost(null);
        setDataSource('hybrid');
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
      setLoading(false);
    }
  }, [tokenId, blockchainPost.post, supabasePost.post]);

  useEffect(() => {
    fetchHybridPost();
  }, [fetchHybridPost]);

  return {
    post,
    loading: loading || blockchainPost.isLoading || supabasePost.loading,
    error: error || blockchainPost.error || supabasePost.error,
    dataSource,
    refetch: fetchHybridPost,
  };
};

// Hook for managing user profiles
export const useHybridUser = (walletAddress: string) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseUserHook = useSupabaseUser(walletAddress);

  const fetchHybridUser = useCallback(async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get user from Supabase
      if (supabaseUserHook.user) {
        setUser(supabaseUserHook.user);
      } else {
        // Create a basic user profile if none exists
        try {
          const newUser = await supabaseUserHook.createUser({
            username: walletAddress.slice(0, 8) + '...',
            bio: 'Blockchain user',
          });
          setUser(newUser);
        } catch (createError) {
          console.error('Failed to create user:', createError);
          setUser(null);
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      setLoading(false);
    }
  }, [walletAddress, supabaseUserHook.user]);

  useEffect(() => {
    fetchHybridUser();
  }, [fetchHybridUser]);

  return {
    user,
    loading: loading || supabaseUserHook.loading,
    error: error || supabaseUserHook.error,
    updateUser: supabaseUserHook.updateUser,
    createUser: supabaseUserHook.createUser,
    refetch: fetchHybridUser,
  };
};
