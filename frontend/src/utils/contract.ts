import { ethers, Contract, BrowserProvider, JsonRpcProvider } from 'ethers'; // 🛑 ADD BrowserProvider, JsonRpcProvider
import { walletConnection } from './wallet';
import contractABI from '../contracts/abi.json';
import type { Post, Interaction, CreatePostParams, ContractConfig } from '../types/contract';

// Contract configuration (unchanged)
export const CONTRACT_CONFIG: ContractConfig = {
  address: '0x585c92d25283e7FFEEBc14935d0f95B114BfD840', // Your contract address
  ownerAddress: '0x623505d675c9FD4B0579Ee666CC6bC9660ced109', // Your owner address
  minCheerAmount: ethers.parseEther('0.01') // 0.01 ETH
};

// 🛑 Updated World Chain configuration (using recommended values for World Chain)
export const WORLD_CHAIN_CONFIG = {
  chainId: '0x672', // 1650 in decimal (World Chain Mainnet)
  chainName: 'World Chain',
  rpcUrls: ['https://mainnet.rpc.worldcoin.org'],
  blockExplorerUrls: ['https://explorer.worldcoin.org'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

export class SocialMediaContract {
  private contract: Contract | null = null;
  // Provider type updated to handle both Browser and JsonRpc
  private provider: ethers.Provider | null = null; 

  // Initialize contract with provider
  async initialize(): Promise<void> {
    this.provider = walletConnection.getProvider();
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    // 🛑 CRITICAL FIX: Conditionally run network switch logic
    if (this.provider instanceof BrowserProvider) {
      console.log("Browser wallet detected. Checking network...");
      await this.ensureWorldChainNetwork(); // 🛑 CALL NEW FUNCTION
    } else {
      console.log("RPC wallet detected. Skipping network check.");
    }

    const signer = await walletConnection.getSigner();
    if (!signer) {
      throw new Error('No signer available');
    }

    this.contract = new Contract(CONTRACT_CONFIG.address, contractABI, signer);
  }

  // 🛑 NEW FUNCTION: Check and switch to World Chain (replaces ensureSepoliaNetwork)
  async ensureWorldChainNetwork(): Promise<void> {
    // Only call this function when this.provider is guaranteed to be BrowserProvider
    if (!(this.provider instanceof BrowserProvider)) {
         throw new Error('Internal Error: ensureWorldChainNetwork called with non-BrowserProvider.');
    }
    
    try {
      const network = await this.provider.getNetwork();
      const targetChainId = parseInt(WORLD_CHAIN_CONFIG.chainId, 16);
      const targetBigInt = BigInt(targetChainId);

      if (network.chainId !== targetBigInt) {
        console.log(`Current network: ${network.name} (${network.chainId})`);
        console.log(`Switching to ${WORLD_CHAIN_CONFIG.chainName} (${targetChainId})...`);
        
        await this.switchToWorldChain(); // 🛑 CALL NEW FUNCTION
        
        // Verify the switch
        const newNetwork = await this.provider.getNetwork();
        if (newNetwork.chainId !== targetBigInt) {
          throw new Error(`Failed to switch to ${WORLD_CHAIN_CONFIG.chainName} network`);
        }
        console.log(`Successfully switched to ${WORLD_CHAIN_CONFIG.chainName}`);
      } else {
        console.log(`Already on ${WORLD_CHAIN_CONFIG.chainName}`);
      }
    } catch (error) {
      console.error('Network check failed:', error);
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 🛑 NEW FUNCTION: Switch to World Chain (replaces switchToSepolia)
  async switchToWorldChain(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Wallet not found for chain switch');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WORLD_CHAIN_CONFIG.chainId }],
      });
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [WORLD_CHAIN_CONFIG], // Pass the full config object
          });
        } catch (addError) {
          throw new Error(`Failed to add ${WORLD_CHAIN_CONFIG.chainName} network to wallet`);
        }
      } else {
        throw new Error(`Failed to switch to ${WORLD_CHAIN_CONFIG.chainName}: ${error.message}`);
      }
    }
  }

  // 🛑 REMOVED old ensureSepoliaNetwork and switchToSepolia functions.
  // The rest of the class methods are unchanged as they correctly use the
  // already initialized this.contract or this.provider/walletConnection.getSigner().

  // Get contract instance (read-only with provider)
  getReadOnlyContract(): Contract {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return new Contract(CONTRACT_CONFIG.address, contractABI, this.provider);
  }

  // Ensure contract is initialized
  private ensureContract(): Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }
    return this.contract;
  }

  // ============ READ FUNCTIONS ============

  // Get post by token ID
  async getPost(tokenId: number): Promise<Post> {
    const contract = this.contract || this.getReadOnlyContract();
    const post = await contract.getPost(tokenId);
    
    return {
      tokenId, // Include the tokenId
      creator: post.creator,
      timestamp: post.timestamp,
      likes: Number(post.likes),
      isActive: post.isActive,
      totalEarnings: post.totalEarnings,
      ipfsHash: post.ipfsHash,
      title: post.title,
      description: post.description,
      aiLabels: post.aiLabels
    };
  }

  // Get post interactions
  async getPostInteractions(tokenId: number): Promise<Interaction[]> {
    const contract = this.contract || this.getReadOnlyContract();
    const interactions = await contract.getPostInteractions(tokenId);
    
    return interactions.map((interaction: any) => ({
      user: interaction.user,
      timestamp: interaction.timestamp,
      amount: Number(interaction.amount),
      interactionType: Number(interaction.interactionType)
    }));
  }

  // Get user's posts
  async getUserPosts(userAddress: string): Promise<number[]> {
    const contract = this.contract || this.getReadOnlyContract();
    const posts = await contract.getUserPosts(userAddress);
    return posts.map((id: any) => Number(id));
  }

  // Get AI labels for a post
  async getAILabels(tokenId: number): Promise<string[]> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.getAILabels(tokenId);
  }

  // Get total supply of posts
  async getTotalSupply(): Promise<number> {
    const contract = this.contract || this.getReadOnlyContract();
    const total = await contract.totalSupply();
    return Number(total);
  }

  // Check if token exists
  async tokenExists(tokenId: number): Promise<boolean> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.exists(tokenId);
  }

  // Get next token ID
  async getNextTokenId(): Promise<number> {
    const contract = this.contract || this.getReadOnlyContract();
    const nextId = await contract.getNextTokenId();
    return Number(nextId);
  }

  // Check if user has liked a post
  async hasUserLiked(tokenId: number, userAddress: string): Promise<boolean> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.hasLiked(tokenId, userAddress);
  }

  // Get cheer amount by user for a post
  async getUserCheerAmount(tokenId: number, userAddress: string): Promise<bigint> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.cheerAmounts(tokenId, userAddress);
  }

  // Get token owner
  async getTokenOwner(tokenId: number): Promise<string> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.ownerOf(tokenId);
  }

  // Get token URI
  async getTokenURI(tokenId: number): Promise<string> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.tokenURI(tokenId);
  }

  // ============ WRITE FUNCTIONS ============

  // Create a new post
  async createPost(params: CreatePostParams): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    
    return await contract.createPost(
      params.ipfsHash,
      params.title,
      params.description
    );
  }

  // Like a post
  async likePost(tokenId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.likePost(tokenId);
  }

  // Cheer a post with ETH
  async cheerPost(tokenId: number, amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    const value = ethers.parseEther(amount);
    
    if (value < CONTRACT_CONFIG.minCheerAmount) {
      throw new Error(`Minimum cheer amount is ${ethers.formatEther(CONTRACT_CONFIG.minCheerAmount)} ETH`);
    }
    
    return await contract.cheerPost(tokenId, { value });
  }

  // Deactivate a post (owner or creator only)
  async deactivatePost(tokenId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.deactivatePost(tokenId);
  }

  // Add AI labels (contract owner only)
  async addAILabels(tokenId: number, labels: string[]): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.addAILabels(tokenId, labels);
  }

  // Withdraw platform funds (contract owner only)
  async withdrawPlatformFunds(): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.withdrawPlatformFunds();
  }

  // ============ EVENT LISTENERS ============

  // Listen for PostCreated events
  onPostCreated(callback: (tokenId: number, creator: string, ipfsHash: string) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('PostCreated', (tokenId, creator, ipfsHash) => {
      callback(Number(tokenId), creator, ipfsHash);
    });
  }

  // Listen for PostLiked events
  onPostLiked(callback: (tokenId: number, liker: string) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('PostLiked', (tokenId, liker) => {
      callback(Number(tokenId), liker);
    });
  }

  // Listen for PostCheered events
  onPostCheered(callback: (tokenId: number, cheerGiver: string, amount: bigint) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('PostCheered', (tokenId, cheerGiver, amount) => {
      callback(Number(tokenId), cheerGiver, amount);
    });
  }

  // Remove all event listeners
  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  // ============ UTILITY FUNCTIONS ============

  // Get contract address
  getContractAddress(): string {
    return CONTRACT_CONFIG.address;
  }

  // Get owner address
  getOwnerAddress(): string {
    return CONTRACT_CONFIG.ownerAddress;
  }

  // Get minimum cheer amount
  getMinCheerAmount(): bigint {
    return CONTRACT_CONFIG.minCheerAmount;
  }

  // Format cheer amount for display
  formatCheerAmount(amount: bigint): string {
    return ethers.formatEther(amount);
  }

  // Parse cheer amount from string
  parseCheerAmount(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  // Check if current user is contract owner
  async isCurrentUserOwner(): Promise<boolean> {
    const currentAccount = await walletConnection.getCurrentAccount();
    return currentAccount?.toLowerCase() === CONTRACT_CONFIG.ownerAddress.toLowerCase();
  }

  // Estimate gas for create post
  async estimateCreatePostGas(params: CreatePostParams): Promise<bigint> {
    const contract = this.ensureContract();
    return await contract.createPost.estimateGas(
      params.ipfsHash,
      params.title,
      params.description
    );
  }

  // Estimate gas for cheer post
  async estimateCheerPostGas(tokenId: number, amount: string): Promise<bigint> {
    const contract = this.ensureContract();
    const value = ethers.parseEther(amount);
    return await contract.cheerPost.estimateGas(tokenId, { value });
  }
}

// Global contract instance
export const socialMediaContract = new SocialMediaContract();

// Helper function to initialize contract
export const initializeContract = async (): Promise<void> => {
  await socialMediaContract.initialize();
};

// Helper functions for common operations
export const contractHelpers = {
  // Create and wait for post creation
  createPostAndWait: async (params: CreatePostParams): Promise<number> => {
    const tx = await socialMediaContract.createPost(params);
    const receipt = await tx.wait();
    
    // Find the PostCreated event to get the token ID
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = socialMediaContract.getReadOnlyContract().interface.parseLog(log);
        return parsed?.name === 'PostCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = socialMediaContract.getReadOnlyContract().interface.parseLog(event);
      return Number(parsed?.args[0]);
    }
    
    throw new Error('Failed to get token ID from transaction');
  },

  // Get all posts with pagination
  getAllPosts: async (limit: number = 10, offset: number = 0): Promise<Post[]> => {
    const totalSupply = await socialMediaContract.getTotalSupply();
    const posts: Post[] = [];
    
    const start = Math.max(1, totalSupply - offset);
    const end = Math.max(1, start - limit + 1);
    
    for (let i = start; i >= end; i--) {
      try {
        const post = await socialMediaContract.getPost(i);
        if (post.isActive) {
          posts.push(post);
        }
      } catch (error) {
        console.warn(`Failed to fetch post ${i}:`, error);
      }
    }
    
    return posts;
  },

  // Get posts by user with details
  getUserPostsWithDetails: async (userAddress: string): Promise<Post[]> => {
    const postIds = await socialMediaContract.getUserPosts(userAddress);
    const posts: Post[] = [];
    
    for (const id of postIds) {
      try {
        const post = await socialMediaContract.getPost(id);
        posts.push(post);
      } catch (error) {
        console.warn(`Failed to fetch post ${id}:`, error);
      }
    }
    
    return posts.reverse(); // Most recent first
  }
};