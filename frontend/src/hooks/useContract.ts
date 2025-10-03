import { useState, useEffect, useCallback } from 'react';
import { socialMediaContract, initializeContract } from '../utils/contract';
import { walletConnection } from '../utils/wallet';
import { supabaseService } from '../utils/supabaseService';
import type { Post, CreatePostParams } from '../types/contract';
import { MiniKit, tokenToDecimals, Tokens } from '@worldcoin/minikit-js'
import type { PayCommandInput } from '@worldcoin/minikit-js' 


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
        // Sync to Supabase
        try {
          const blockchainPost = await socialMediaContract.getPost(tokenId);
          await supabaseService.syncBlockchainPostToSupabase(blockchainPost);
          console.log('Post synced to Supabase successfully');
        } catch (syncError) {
          console.error('Failed to sync post to Supabase:', syncError);
          // Don't fail the transaction if Supabase sync fails
        }
        
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
      
      // Sync interaction to Supabase
      try {
        const currentAddress = await walletConnection.getCurrentAccount();
        if (currentAddress) {
          const post = await socialMediaContract.getPost(tokenId);
          await supabaseService.recordInteraction({
            postId: tokenId.toString(), // Using tokenId as postId for now
            userAddress: currentAddress,
            interactionType: 'like',
          });
          
          // Update post likes in Supabase
          await supabaseService.updatePostLikes(tokenId, post.likes);
          console.log('Like interaction synced to Supabase');
        }
      } catch (syncError) {
        console.error('Failed to sync like to Supabase:', syncError);
        // Don't fail the transaction if Supabase sync fails
      }
      
      onSuccess?.();
      return true;
    });
  }, [executeTransaction]);

  // Cheer post
const cheerPost = useCallback(async (
    tokenId: number,
    amount: string, // The amount of WLD to send (e.g., "1.5")
    onSuccess?: () => void
  ) => {
    // ⚠️ NOTE: We are removing the custom executeTransaction wrapper
    // because MiniKit.commandsAsync.pay handles the transaction execution.
    // Replace `executeTransaction(async () => { ... })` with direct async logic.

    if (!MiniKit.isInstalled()) {
      alert("Please open this app in the World App to use payment features.");
      return false; // Return false or handle error appropriately
    }

    try {
      // 1. Creating the transaction (Initiation)
      // Call your backend to get a unique reference ID
      const initiateRes = await fetch('/api/initiate-pay', {
        method: 'POST',
        // Optional: Send the intended recipient and amount to the backend for storage
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId,
          amount,
          token: 'WLD',
          recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Replace with your whitelisted contract/user address
        })
      });

      if (!initiateRes.ok) throw new Error('Failed to initiate payment reference.');
      const { id: referenceId } = await initiateRes.json();
      
      const recipientAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // **YOUR WHITELISTED RECIPIENT ADDRESS**
      
      const payload: PayCommandInput = {
        reference: referenceId,
        to: recipientAddress,
        tokens: [
          {
            symbol: Tokens.WLD,
            // Convert the user-entered amount string (e.g., "1.5") to token decimals
            token_amount: tokenToDecimals(Number(amount), Tokens.WLD).toString(), 
          },
        ],
        description: `Cheer for Post ID: ${tokenId} with ${amount} WLD`,
      };

      // 2. Sending the command
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

      // Check for command success
      if (finalPayload.status === 'success') {
        const successPayload = finalPayload as MiniAppPaymentSuccessPayload;

        // 3. Verifying the payment (Post-payment Backend Call)
        // Call your backend to verify the transaction ID and update your database
        const confirmRes = await fetch(`/api/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payload: successPayload }),
        });

        const paymentConfirmation = await confirmRes.json();
        
        if (paymentConfirmation.success) {
          // 🎉 Payment confirmed by your backend!
          console.log('Payment successful and verified!');
          
          // You can now execute your *non-payment* contract logic if any,
          // or solely rely on the backend verification to update earnings.
          
          // Sync interaction to Supabase (using the verified amount)
          try {
            // Note: The payment is already successful, so we sync the *cheer* and earnings
            const currentAddress = successPayload.from; // Sender's address from the payload
            
            await supabaseService.recordInteraction({
              postId: tokenId.toString(),
              userAddress: currentAddress,
              interactionType: 'cheer_payment', // Use a specific type for payments
              amount: amount, // Store the human-readable amount
            });

            // Update post earnings in Supabase based on the *confirmed* payment
            // You might want to get the actual earnings from the successful transaction data
            // or simply add the cheer amount to the post's total WLD earnings.
            await supabaseService.updatePostEarnings(tokenId, amount); // Add WLD amount
            console.log('Cheer payment synced to Supabase');
          } catch (syncError) {
            console.error('Failed to sync cheer to Supabase:', syncError);
          }

          onSuccess?.();
          return true;
        } else {
          // Backend verification failed (e.g., status is 'failed' after polling)
          console.error('Payment failed backend verification.');
          return false;
        }
      } else {
        // MiniKit command was cancelled or returned an error
        console.log(`Payment command failed or was cancelled. Status: ${finalPayload.status}`);
        return false;
      }
    } catch (error) {
      console.error('An error occurred during the payment process:', error);
      return false;
    }
  }, []);

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
// Hook for fetching posts
export const usePosts = (limit: number = 3) => {

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Helper function to create a delay
  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  const loadPosts = useCallback(async (offset: number = 0, append: boolean = false) => {
    
    // Initial 1-second stabilization delay (Retained from previous fix)
    console.log("Starting network fetch with 1s stabilization delay...");
    await delay(1000); 
    
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

      // Step 2: Throttle the loop that fetches individual posts
      for (let i = start; i >= end; i--) {
        try {
          const post = await socialMediaContract.getPost(i);
          if (post.isActive) {
            newPosts.push(post);
          }
        } catch (err) {
          console.warn(`Failed to fetch post ${i} (Contract Read Error):`, err);
        }
        
        // ✅ FIX: Add a small delay (200ms) between each individual request
        // This prevents hitting the RPC "requests per second" rate limit.
        await delay(200); 
      }

      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(end > 1);
    } catch (err) {
      // Improved error message to reflect the rate limit issue
      console.error('RPC Rate Limit Error or Failed to load posts:', err);
      setError('Failed to load posts. You may be exceeding the public RPC rate limit. Please try refreshing in a moment.');
    } finally {
      setIsLoading(false);
    }
  }, [limit]); // Dependencies remain the same

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
