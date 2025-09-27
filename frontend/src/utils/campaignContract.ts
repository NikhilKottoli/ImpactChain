import { ethers, Contract } from 'ethers';
import { walletConnection } from './wallet';
import contractABI from '../contracts/abi2.json';

// Campaign contract configuration
export const CAMPAIGN_CONTRACT_CONFIG = {
  address: '0x6102dfC400028d4E3d1469f7C7c99A48BECbd92E', // Campaign contract address
  ownerAddress: '0x42bB782189817C7aA9c7a8C1BaeDf194c9d73f6e', // Owner address
  minStakeAmount: ethers.parseEther('0.00001'), // 0.001 ETH
  minBountyAmount: ethers.parseEther('0.0001') // 0.1 ETH
};

// Campaign status enum
export const CampaignStatus = {
  CREATED: 0,
  BOUNTY_PAID: 1,
  COMPLETED: 2
} as const;

export type CampaignStatus = typeof CampaignStatus[keyof typeof CampaignStatus];

// Campaign interface
export interface Campaign {
  creator: string;
  isFundraiser: boolean;
  bountyAmount: bigint;
  bountyPayer: string;
  stakingAmount: bigint;
  status: CampaignStatus;
  publicAddresses: string[];
}

// RSVP interface
export interface RSVP {
  participant: string;
  stakeAmount: bigint;
  rsvpTimestamp: number;
  stakeReturned: boolean;
  verified: boolean;
}

// Campaign stats interface
export interface CampaignStats {
  totalParticipants: number;
  totalStaked: bigint;
  bountyAmount: bigint;
  status: CampaignStatus;
}

// Create campaign parameters
export interface CreateCampaignParams {
  campaignId: string;
  creator: string;
  isFundraiser: boolean;
  bountyPayer: string;
  bountyAmount: bigint;
  stakingAmount: bigint;
}

// Pay bounty parameters
export interface PayBountyParams {
  campaignId: string;
  verifiers: string[];
  value: bigint;
}

export class CampaignBountyManager {
  private contract: Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;

  // Initialize contract with provider
  async initialize(): Promise<void> {
    this.provider = walletConnection.getProvider();
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    // Check and switch to Sepolia if needed
    await this.ensureSepoliaNetwork();

    const signer = await walletConnection.getSigner();
    if (!signer) {
      throw new Error('No signer available');
    }

    this.contract = new Contract(CAMPAIGN_CONTRACT_CONFIG.address, contractABI, signer);
  }

  // Ensure we're on Sepolia testnet
  async ensureSepoliaNetwork(): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const network = await this.provider.getNetwork();
      const sepoliaChainId = 11155111; // Sepolia chain ID

      if (network.chainId !== BigInt(sepoliaChainId)) {
        console.log(`Current network: ${network.name} (${network.chainId})`);
        console.log(`Switching to Sepolia (${sepoliaChainId})...`);
        
        await this.switchToSepolia();
        
        // Verify the switch
        const newNetwork = await this.provider.getNetwork();
        if (newNetwork.chainId !== BigInt(sepoliaChainId)) {
          throw new Error('Failed to switch to Sepolia network');
        }
        console.log('Successfully switched to Sepolia testnet');
      } else {
        console.log('Already on Sepolia testnet');
      }
    } catch (error) {
      console.error('Network check failed:', error);
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Switch to Sepolia testnet
  async switchToSepolia(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const sepoliaConfig = {
      chainId: '0xaa36a7', // 11155111 in hex
      chainName: 'Sepolia',
      rpcUrls: ['https://sepolia.infura.io/v3/'],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
    };

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaConfig.chainId }],
      });
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [sepoliaConfig],
          });
        } catch (addError) {
          throw new Error('Failed to add Sepolia network to MetaMask');
        }
      } else {
        throw new Error(`Failed to switch to Sepolia: ${error.message}`);
      }
    }
  }

  // Get contract instance (read-only with provider)
  getReadOnlyContract(): Contract {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    return new Contract(CAMPAIGN_CONTRACT_CONFIG.address, contractABI, this.provider);
  }

  // Ensure contract is initialized
  private ensureContract(): Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }
    return this.contract;
  }

  // ============ READ FUNCTIONS ============

  // Get campaign data
  async getCampaign(campaignId: string): Promise<Campaign> {
    const contract = this.contract || this.getReadOnlyContract();
    const campaign = await contract.getCampaign(campaignId);
    
    return {
      creator: campaign.creator,
      isFundraiser: campaign.isFundraiser,
      bountyAmount: campaign.bountyAmount,
      bountyPayer: campaign.bountyPayer,
      stakingAmount: campaign.stakingAmount,
      status: Number(campaign.status) as CampaignStatus,
      publicAddresses: campaign.publicAddresses
    };
  }

  // Get campaign RSVPs
  async getCampaignRSVPs(campaignId: string): Promise<RSVP[]> {
    const contract = this.contract || this.getReadOnlyContract();
    const rsvps = await contract.getCampaignRSVPs(campaignId);
    
    return rsvps.map((rsvp: any) => ({
      participant: rsvp.participant,
      stakeAmount: rsvp.stakeAmount,
      rsvpTimestamp: Number(rsvp.rsvpTimestamp),
      stakeReturned: rsvp.stakeReturned,
      verified: rsvp.verified
    }));
  }

  // Get campaign statistics
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const contract = this.contract || this.getReadOnlyContract();
    const stats = await contract.getCampaignStats(campaignId);
    
    return {
      totalParticipants: Number(stats.totalParticipants),
      totalStaked: stats.totalStaked,
      bountyAmount: stats.bountyAmount,
      status: Number(stats.status) as CampaignStatus
    };
  }

  // Check if campaign exists
  async doesCampaignExist(campaignId: string): Promise<boolean> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.doesCampaignExist(campaignId);
  }

  // Get user's campaigns
  async getUserCampaigns(userAddress: string): Promise<string[]> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.getUserCampaigns(userAddress);
  }

  // Check if user has RSVPed to campaign
  async hasUserRSVPed(campaignId: string, userAddress: string): Promise<boolean> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.hasUserRSVPed(campaignId, userAddress);
  }

  // Get participant stake amount
  async getParticipantStake(campaignId: string, participant: string): Promise<bigint> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.getParticipantStake(campaignId, participant);
  }

  // Get verifier addresses for a campaign
  async getVerifiers(campaignId: string): Promise<string[]> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.getVerifiers(campaignId);
  }

  // Check if address is verifier for campaign
  async isVerifierForCampaign(campaignId: string, verifier: string): Promise<boolean> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.isVerifierForCampaign(campaignId, verifier);
  }

  // Get contract balance
  async getContractBalance(): Promise<bigint> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.getContractBalance();
  }

  // Get paymaster address
  async getPaymaster(): Promise<string> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.getPaymaster();
  }

  // Get contract owner
  async getOwner(): Promise<string> {
    const contract = this.contract || this.getReadOnlyContract();
    return await contract.owner();
  }

  // ============ WRITE FUNCTIONS ============

  // Create a new campaign
  async createCampaign(params: CreateCampaignParams): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    
    return await contract.createCampaign(
      params.campaignId,
      params.creator,
      params.isFundraiser,
      params.bountyPayer,
      params.bountyAmount,
      params.stakingAmount
    );
  }

  // Pay bounty to escrow and set verifiers
  async payBountyToEscrow(params: PayBountyParams): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    
    return await contract.payBountyToEscrow(
      params.campaignId,
      params.verifiers,
      { value: params.value }
    );
  }

  // RSVP to a campaign with stake
  async rsvpToCampaign(campaignId: string, stakeAmount: bigint): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    
    return await contract.rsvpToCampaign(campaignId, { value: stakeAmount });
  }

  // Run dummy DAO verification
  async dummyDAO(campaignId: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.dummyDAO(campaignId);
  }

  // Complete campaign and distribute bounties
  async completeCampaign(campaignId: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.completeCampaign(campaignId);
  }

  // Set paymaster address (owner only)
  async setPaymaster(paymasterAddress: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.setPaymaster(paymasterAddress);
  }

  // Emergency withdraw (owner only)
  async emergencyWithdraw(campaignId: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.emergencyWithdraw(campaignId);
  }

  // Transfer ownership (owner only)
  async transferOwnership(newOwner: string): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.transferOwnership(newOwner);
  }

  // Renounce ownership (owner only)
  async renounceOwnership(): Promise<ethers.ContractTransactionResponse> {
    const contract = this.ensureContract();
    return await contract.renounceOwnership();
  }

  // ============ EVENT LISTENERS ============

  // Listen for CampaignCreated events
  onCampaignCreated(callback: (campaignId: string, creator: string, stakingAmount: bigint, isFundraiser: boolean) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('CampaignCreated', (campaignId, creator, stakingAmount, isFundraiser) => {
      callback(campaignId, creator, stakingAmount, isFundraiser);
    });
  }

  // Listen for CampaignUpdated events
  onCampaignUpdated(callback: (campaignId: string, status: CampaignStatus, timestamp: number) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('CampaignUpdated', (campaignId, status, timestamp) => {
      callback(campaignId, Number(status) as CampaignStatus, Number(timestamp));
    });
  }

  // Listen for BountyPaid events
  onBountyPaid(callback: (campaignId: string, amount: bigint, bountyPayer: string, verifiers: string[]) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('BountyPaid', (campaignId, amount, bountyPayer, verifiers) => {
      callback(campaignId, amount, bountyPayer, verifiers);
    });
  }

  // Listen for RSVPCreated events
  onRSVPCreated(callback: (campaignId: string, participant: string, stakeAmount: bigint, timestamp: number) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('RSVPCreated', (campaignId, participant, stakeAmount, timestamp) => {
      callback(campaignId, participant, stakeAmount, Number(timestamp));
    });
  }

  // Listen for CampaignCompleted events
  onCampaignCompleted(callback: (campaignId: string, verifiedParticipants: string[], bountyPerParticipant: bigint, totalStakesForfeited: bigint) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('CampaignCompleted', (campaignId, verifiedParticipants, bountyPerParticipant, totalStakesForfeited) => {
      callback(campaignId, verifiedParticipants, bountyPerParticipant, totalStakesForfeited);
    });
  }

  // Listen for BountyDistributed events
  onBountyDistributed(callback: (campaignId: string, participant: string, amount: bigint) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('BountyDistributed', (campaignId, participant, amount) => {
      callback(campaignId, participant, amount);
    });
  }

  // Listen for StakeReturned events
  onStakeReturned(callback: (campaignId: string, participant: string, amount: bigint) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('StakeReturned', (campaignId, participant, amount) => {
      callback(campaignId, participant, amount);
    });
  }

  // Listen for StakeForfeited events
  onStakeForfeited(callback: (campaignId: string, participant: string, amount: bigint) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('StakeForfeited', (campaignId, participant, amount) => {
      callback(campaignId, participant, amount);
    });
  }

  // Listen for EmergencyWithdraw events
  onEmergencyWithdraw(callback: (campaignId: string, amount: bigint, recipient: string) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('EmergencyWithdraw', (campaignId, amount, recipient) => {
      callback(campaignId, amount, recipient);
    });
  }

  // Listen for VerifiersSet events
  onVerifiersSet(callback: (campaignId: string, verifiers: string[]) => void): void {
    const contract = this.contract || this.getReadOnlyContract();
    contract.on('VerifiersSet', (campaignId, verifiers) => {
      callback(campaignId, verifiers);
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
    return CAMPAIGN_CONTRACT_CONFIG.address;
  }

  // Get owner address
  getOwnerAddress(): string {
    return CAMPAIGN_CONTRACT_CONFIG.ownerAddress;
  }

  // Get minimum stake amount
  getMinStakeAmount(): bigint {
    return CAMPAIGN_CONTRACT_CONFIG.minStakeAmount;
  }

  // Get minimum bounty amount
  getMinBountyAmount(): bigint {
    return CAMPAIGN_CONTRACT_CONFIG.minBountyAmount;
  }

  // Get maximum participants
  getMaxParticipants(): bigint {
    return BigInt(1000); // MAX_PARTICIPANTS constant
  }

  // Format ETH amount for display
  formatEthAmount(amount: bigint): string {
    return ethers.formatEther(amount);
  }

  // Parse ETH amount from string
  parseEthAmount(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  // Check if current user is contract owner
  async isCurrentUserOwner(): Promise<boolean> {
    const currentAccount = await walletConnection.getCurrentAccount();
    const owner = await this.getOwner();
    return currentAccount?.toLowerCase() === owner.toLowerCase();
  }

  // Check if current user is campaign creator
  async isCurrentUserCampaignCreator(campaignId: string): Promise<boolean> {
    const currentAccount = await walletConnection.getCurrentAccount();
    const campaign = await this.getCampaign(campaignId);
    return currentAccount?.toLowerCase() === campaign.creator.toLowerCase();
  }

  // Check if current user is verifier for campaign
  async isCurrentUserVerifier(campaignId: string): Promise<boolean> {
    const currentAccount = await walletConnection.getCurrentAccount();
    if (!currentAccount) return false;
    return await this.isVerifierForCampaign(campaignId, currentAccount);
  }

  // Check if current user has RSVPed to campaign
  async hasCurrentUserRSVPed(campaignId: string): Promise<boolean> {
    const currentAccount = await walletConnection.getCurrentAccount();
    if (!currentAccount) return false;
    return await this.hasUserRSVPed(campaignId, currentAccount);
  }

  // Get campaign status as string
  getCampaignStatusString(status: CampaignStatus): string {
    switch (status) {
      case CampaignStatus.CREATED:
        return 'Created';
      case CampaignStatus.BOUNTY_PAID:
        return 'Bounty Paid';
      case CampaignStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  }

  // Validate campaign ID
  validateCampaignId(campaignId: string): boolean {
    return campaignId.length > 0 && campaignId.trim().length > 0;
  }

  // Validate verifier addresses
  validateVerifiers(verifiers: string[]): boolean {
    if (verifiers.length === 0) return false;
    return verifiers.every(addr => ethers.isAddress(addr));
  }

  // Estimate gas for create campaign
  async estimateCreateCampaignGas(params: CreateCampaignParams): Promise<bigint> {
    const contract = this.ensureContract();
    return await contract.createCampaign.estimateGas(
      params.campaignId,
      params.creator,
      params.isFundraiser,
      params.bountyPayer,
      params.bountyAmount,
      params.stakingAmount
    );
  }

  // Estimate gas for pay bounty
  async estimatePayBountyGas(params: PayBountyParams): Promise<bigint> {
    const contract = this.ensureContract();
    return await contract.payBountyToEscrow.estimateGas(
      params.campaignId,
      params.verifiers,
      { value: params.value }
    );
  }

  // Estimate gas for RSVP
  async estimateRSVPGas(campaignId: string, stakeAmount: bigint): Promise<bigint> {
    const contract = this.ensureContract();
    return await contract.rsvpToCampaign.estimateGas(campaignId, { value: stakeAmount });
  }

  // Estimate gas for complete campaign
  async estimateCompleteCampaignGas(campaignId: string): Promise<bigint> {
    const contract = this.ensureContract();
    return await contract.completeCampaign.estimateGas(campaignId);
  }
}

// Global campaign contract instance
export const campaignContract = new CampaignBountyManager();

// Helper function to initialize campaign contract
export const initializeCampaignContract = async (): Promise<void> => {
  await campaignContract.initialize();
};

// Helper functions for common operations
export const campaignHelpers = {
  // Create campaign and wait for confirmation
  createCampaignAndWait: async (params: CreateCampaignParams): Promise<string> => {
    const tx = await campaignContract.createCampaign(params);
    const receipt = await tx.wait();
    
    // Find the CampaignCreated event to get the campaign ID
    const event = receipt?.logs.find((log: any) => {
      try {
        const parsed = campaignContract.getReadOnlyContract().interface.parseLog(log);
        return parsed?.name === 'CampaignCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = campaignContract.getReadOnlyContract().interface.parseLog(event);
      return parsed?.args[0];
    }
    
    throw new Error('Failed to get campaign ID from transaction');
  },

  // Pay bounty and wait for confirmation
  payBountyAndWait: async (params: PayBountyParams): Promise<void> => {
    const tx = await campaignContract.payBountyToEscrow(params);
    await tx.wait();
  },

  // RSVP to campaign and wait for confirmation
  rsvpAndWait: async (campaignId: string, stakeAmount: bigint): Promise<void> => {
    const tx = await campaignContract.rsvpToCampaign(campaignId, stakeAmount);
    await tx.wait();
  },

  // Complete campaign and wait for confirmation
  completeCampaignAndWait: async (campaignId: string): Promise<void> => {
    const tx = await campaignContract.completeCampaign(campaignId);
    await tx.wait();
  },

  // Get all campaigns for a user with details
  getUserCampaignsWithDetails: async (userAddress: string): Promise<Campaign[]> => {
    const campaignIds = await campaignContract.getUserCampaigns(userAddress);
    const campaigns: Campaign[] = [];
    
    for (const id of campaignIds) {
      try {
        const campaign = await campaignContract.getCampaign(id);
        campaigns.push(campaign);
      } catch (error) {
        console.warn(`Failed to fetch campaign ${id}:`, error);
      }
    }
    
    return campaigns.reverse(); // Most recent first
  },

  // Get campaign with RSVPs and stats
  getCampaignWithDetails: async (campaignId: string): Promise<{
    campaign: Campaign;
    rsvps: RSVP[];
    stats: CampaignStats;
  }> => {
    const [campaign, rsvps, stats] = await Promise.all([
      campaignContract.getCampaign(campaignId),
      campaignContract.getCampaignRSVPs(campaignId),
      campaignContract.getCampaignStats(campaignId)
    ]);

    return { campaign, rsvps, stats };
  },

  // Check if user can RSVP to campaign
  canUserRSVP: async (campaignId: string, userAddress: string): Promise<{
    canRSVP: boolean;
    reason?: string;
  }> => {
    try {
      const campaign = await campaignContract.getCampaign(campaignId);
      const hasRSVPed = await campaignContract.hasUserRSVPed(campaignId, userAddress);
      
      if (hasRSVPed) {
        return { canRSVP: false, reason: 'User has already RSVPed' };
      }
      
      if (campaign.status !== CampaignStatus.BOUNTY_PAID) {
        return { canRSVP: false, reason: 'Campaign is not accepting RSVPs' };
      }
      
      return { canRSVP: true };
    } catch (error) {
      return { canRSVP: false, reason: 'Campaign not found' };
    }
  },

  // Check if user can complete campaign
  canUserCompleteCampaign: async (campaignId: string, userAddress: string): Promise<{
    canComplete: boolean;
    reason?: string;
  }> => {
    try {
      const campaign = await campaignContract.getCampaign(campaignId);
      
      if (campaign.creator.toLowerCase() !== userAddress.toLowerCase()) {
        return { canComplete: false, reason: 'Only campaign creator can complete campaign' };
      }
      
      if (campaign.status === CampaignStatus.COMPLETED) {
        return { canComplete: false, reason: 'Campaign is already completed' };
      }
      
      return { canComplete: true };
    } catch (error) {
      return { canComplete: false, reason: 'Campaign not found' };
    }
  },

  // Get campaign participants with verification status
  getCampaignParticipants: async (campaignId: string): Promise<{
    verified: RSVP[];
    unverified: RSVP[];
    total: number;
  }> => {
    const rsvps = await campaignContract.getCampaignRSVPs(campaignId);
    const verified = rsvps.filter(rsvp => rsvp.verified);
    const unverified = rsvps.filter(rsvp => !rsvp.verified);
    
    return {
      verified,
      unverified,
      total: rsvps.length
    };
  },

  // Calculate bounty per participant
  calculateBountyPerParticipant: (bountyAmount: bigint, verifiedCount: number): bigint => {
    if (verifiedCount === 0) return BigInt(0);
    return bountyAmount / BigInt(verifiedCount);
  },

  // Calculate total stakes forfeited
  calculateTotalStakesForfeited: (rsvps: RSVP[]): bigint => {
    return rsvps
      .filter(rsvp => !rsvp.verified)
      .reduce((total, rsvp) => total + rsvp.stakeAmount, BigInt(0));
  },

  // Format campaign data for display
  formatCampaignForDisplay: (campaign: Campaign): {
    creator: string;
    isFundraiser: boolean;
    bountyAmount: string;
    bountyPayer: string;
    stakingAmount: string;
    status: string;
    verifierCount: number;
  } => {
    return {
      creator: campaign.creator,
      isFundraiser: campaign.isFundraiser,
      bountyAmount: campaignContract.formatEthAmount(campaign.bountyAmount),
      bountyPayer: campaign.bountyPayer,
      stakingAmount: campaignContract.formatEthAmount(campaign.stakingAmount),
      status: campaignContract.getCampaignStatusString(campaign.status),
      verifierCount: campaign.publicAddresses.length
    };
  },

  // Format RSVP data for display
  formatRSVPForDisplay: (rsvp: RSVP): {
    participant: string;
    stakeAmount: string;
    rsvpTimestamp: string;
    stakeReturned: boolean;
    verified: boolean;
  } => {
    return {
      participant: rsvp.participant,
      stakeAmount: campaignContract.formatEthAmount(rsvp.stakeAmount),
      rsvpTimestamp: new Date(rsvp.rsvpTimestamp * 1000).toLocaleString(),
      stakeReturned: rsvp.stakeReturned,
      verified: rsvp.verified
    };
  }
};
