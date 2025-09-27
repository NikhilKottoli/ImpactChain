import { useState, useEffect, useCallback } from 'react';
import { socialMediaContract, initializeContract } from '../utils/contract';
import { walletConnection } from '../utils/wallet';
import type { Post, CreatePostParams } from '../types/contract';

// Hook for wallet connection
export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Connecting wallet...');
      const { address } = await walletConnection.connect();
      console.log('Wallet connected:', address);
      
      setAddress(address);
      setIsConnected(true);
      
      // Initialize contract after wallet connection
      console.log('Initializing contract...');
      await initializeContract();
      console.log('Contract initialized successfully');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    walletConnection.disconnect();
    setIsConnected(false);
    setAddress(null);
    setError(null);
  }, []);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await walletConnection.isConnected();
        if (connected) {
          const currentAddress = await walletConnection.getCurrentAccount();
          setAddress(currentAddress);
          setIsConnected(true);
          
          console.log('Wallet connected, initializing contract...');
          try {
            await initializeContract();
            console.log('Contract initialized successfully');
          } catch (err) {
            console.warn('Failed to initialize contract:', err);
            setError('Failed to initialize contract connection');
          }
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setError('Failed to check wallet connection');
      }
    };

    checkConnection();

    // Listen for account changes
    walletConnection.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    });

    // Listen for network changes
    walletConnection.onChainChanged(() => {
      window.location.reload(); // Reload on network change
    });

    return () => {
      walletConnection.removeAllListeners();
    };
  }, [disconnect]);

  return {
    isConnected,
    address,
    isLoading,
    error,
    connect,
    disconnect
  };
};

// Hook for contract interactions
export const useContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = useCallback(async <T>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (
    params: CreatePostParams,
    onSuccess?: (tokenId: number) => void
  ): Promise<number | null> => {
    return executeTransaction(async () => {
      console.log('Creating post with params:', params);
      
      // Initialize contract if needed
      try {
        await socialMediaContract.initialize();
      } catch (error) {
        console.warn('Contract already initialized or initialization failed:', error);
      }
      
      const tx = await socialMediaContract.createPost(params);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Extract token ID from event logs
      let tokenId: number | null = null;
      
      for (const log of receipt?.logs || []) {
        try {
          const parsed = socialMediaContract.getReadOnlyContract().interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          if (parsed?.name === 'PostCreated') {
            tokenId = Number(parsed.args[0]);
            console.log('Found PostCreated event with tokenId:', tokenId);
            break;
          }
        } catch (error) {
          // Skip logs that can't be parsed
          continue;
        }
      }
      
      if (tokenId !== null) {
        onSuccess?.(tokenId);
        return tokenId;
      }
      
      // Fallback: try to get the next token ID - 1
      try {
        const nextTokenId = await socialMediaContract.getNextTokenId();
        const fallbackTokenId = nextTokenId - 1;
        console.log('Using fallback token ID:', fallbackTokenId);
        onSuccess?.(fallbackTokenId);
        return fallbackTokenId;
      } catch (error) {
        console.error('Failed to get fallback token ID:', error);
      }
      
      throw new Error('Failed to get token ID from transaction');
    });
  }, [executeTransaction]);

  // Like post
  const likePost = useCallback(async (
    tokenId: number,
    onSuccess?: () => void
  ) => {
    return executeTransaction(async () => {
      const tx = await socialMediaContract.likePost(tokenId);
      await tx.wait();
      onSuccess?.();
      return true;
    });
  }, [executeTransaction]);

  // Cheer post
  const cheerPost = useCallback(async (
    tokenId: number,
    amount: string,
    onSuccess?: () => void
  ) => {
    return executeTransaction(async () => {
      const tx = await socialMediaContract.cheerPost(tokenId, amount);
      await tx.wait();
      onSuccess?.();
      return true;
    });
  }, [executeTransaction]);

  return {
    isLoading,
    error,
    createPost,
    likePost,
    cheerPost,
    executeTransaction
  };
};

// Hook for fetching posts
export const usePosts = (limit: number = 10) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (offset: number = 0, append: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const totalSupply = await socialMediaContract.getTotalSupply();
      
      if (offset >= totalSupply) {
        setHasMore(false);
        return;
      }

      const newPosts: Post[] = [];
      const start = Math.max(1, totalSupply - offset);
      const end = Math.max(1, start - limit + 1);

      for (let i = start; i >= end; i--) {
        try {
          const post = await socialMediaContract.getPost(i);
          if (post.isActive) {
            newPosts.push(post);
          }
        } catch (err) {
          console.warn(`Failed to fetch post ${i}:`, err);
        }
      }

      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(end > 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPosts(posts.length, true);
    }
  }, [loadPosts, posts.length, isLoading, hasMore]);

  const refresh = useCallback(() => {
    loadPosts(0, false);
  }, [loadPosts]);

  // Load initial posts
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

// Hook for user posts
export const useUserPosts = (userAddress: string | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserPosts = useCallback(async () => {
    if (!userAddress) {
      setPosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const postIds = await socialMediaContract.getUserPosts(userAddress);
      const userPosts: Post[] = [];

      for (const id of postIds) {
        try {
          const post = await socialMediaContract.getPost(id);
          userPosts.push(post);
        } catch (err) {
          console.warn(`Failed to fetch post ${id}:`, err);
        }
      }

      setPosts(userPosts.reverse()); // Most recent first
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user posts');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    loadUserPosts();
  }, [loadUserPosts]);

  return {
    posts,
    isLoading,
    error,
    refresh: loadUserPosts
  };
};

// Hook for single post
export const usePost = (tokenId: number | null) => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (tokenId === null) {
      setPost(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const postData = await socialMediaContract.getPost(tokenId);
      setPost(postData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  return {
    post,
    isLoading,
    error,
    refresh: loadPost
  };
};
