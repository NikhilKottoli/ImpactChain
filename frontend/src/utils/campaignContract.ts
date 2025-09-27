import { ethers, Contract } from 'ethers';
import { walletConnection } from './wallet';
import contractABI from '../contracts/abi2.json';

// Campaign contract configuration
export const CAMPAIGN_CONTRACT_CONFIG = {
  address: '0x6102dfC400028d4E3d1469f7C7c99A48BECbd92E', // Campaign contract address
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
  creator: string; //this is the address of the campaign creator
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

// Campaign creation parameters interface
export interface CreateCampaignParams {
  isFundraiser: boolean;
  bountyAmount: string; 
  stakingAmount: string; 
  bountyPayer?: string; 
}

export interface PayBountyParams {
  campaignId: string;
  verifiers: string[];
  bountyAmount: string; 
}

// Interface for RSVP parameters
export interface RSVPParams {
  campaignId: string;
  stakeAmount: string; // In ETH as string
}

// Generate UUID using crypto.randomUUID() or fallback
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get contract instance
async function getContractInstance(): Promise<Contract> {
  const signer = await walletConnection.getSigner();
  if (!signer) {
    throw new Error('Wallet not connected');
  }
  
  return new Contract(CAMPAIGN_CONTRACT_CONFIG.address, contractABI, signer);
}

// Create campaign function
export async function createCampaign(params: CreateCampaignParams): Promise<{
  campaignId: string;
  transactionHash: string;
}> {
  try {
    // Get current account
    const creator = await walletConnection.getCurrentAccount();
    if (!creator) {
      throw new Error('Wallet not connected');
    }

    // Generate campaign ID
    const campaignId = generateUUID();

    // Parse amounts to wei
    const bountyAmountWei = ethers.parseEther(params.bountyAmount);
    const stakingAmountWei = ethers.parseEther(params.stakingAmount);



    // Get contract instance
    const contract = await getContractInstance();

    // Call createCampaign function
    const tx = await contract.createCampaign(
      campaignId,
      creator,
      params.isFundraiser,
      params.bountyPayer,
      bountyAmountWei,
      stakingAmountWei
    );

    // Wait for transaction confirmation
    await tx.wait();

    return {
      campaignId,
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error creating campaign:', error);
    throw new Error(`Failed to create campaign: ${error}`);
  }
}

export async function payBountyToEscrow(params: PayBountyParams): Promise<{
  transactionHash: string;
}> {
  try {
    // Get current account
    const bountyPayer = await walletConnection.getCurrentAccount();
    if (!bountyPayer) {
      throw new Error('Wallet not connected');
    }

    // Parse bounty amount to wei
    const bountyAmountWei = ethers.parseEther(params.bountyAmount);

    // Validate minimum bounty amount
    if (bountyAmountWei < CAMPAIGN_CONTRACT_CONFIG.minBountyAmount) {
      throw new Error(`Bounty amount must be at least ${ethers.formatEther(CAMPAIGN_CONTRACT_CONFIG.minBountyAmount)} ETH`);
    }

    // Validate verifiers
    if (params.verifiers.length === 0) {
      throw new Error('At least one verifier address is required');
    }

    // Validate verifier addresses
    for (const verifier of params.verifiers) {
      if (!ethers.isAddress(verifier)) {
        throw new Error(`Invalid verifier address: ${verifier}`);
      }
    }

    // Get contract instance
    const contract = await getContractInstance();

    // Call payBountyToEscrow function
    const tx = await contract.payBountyToEscrow(
      params.campaignId,
      params.verifiers,
      {
        value: bountyAmountWei
      }
    );

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error paying bounty to escrow:', error);
    throw new Error(`Failed to pay bounty to escrow: ${error}`);
  }
}

// RSVP to campaign with stake
export async function rsvpToCampaign(params: RSVPParams): Promise<{
  transactionHash: string;
}> {
  try {
    // Get current account
    const participant = await walletConnection.getCurrentAccount();
    if (!participant) {
      throw new Error('Wallet not connected');
    }

    // Parse stake amount to wei
    const stakeAmountWei = ethers.parseEther(params.stakeAmount);

    // Validate minimum stake amount
    if (stakeAmountWei < CAMPAIGN_CONTRACT_CONFIG.minStakeAmount) {
      throw new Error(`Stake amount must be at least ${ethers.formatEther(CAMPAIGN_CONTRACT_CONFIG.minStakeAmount)} ETH`);
    }

    // Get contract instance
    const contract = await getContractInstance();

    // Call rsvpToCampaign function
    const tx = await contract.rsvpToCampaign(
      params.campaignId,
      {
        value: stakeAmountWei
      }
    );

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error RSVPing to campaign:', error);
    throw new Error(`Failed to RSVP to campaign: ${error}`);
  }
}

export async function completeCampaign(campaignId: string): Promise<{
  transactionHash: string;
}> {
  try {
    // Get current account
    const caller = await walletConnection.getCurrentAccount();
    if (!caller) {
      throw new Error('Wallet not connected');
    }

    // Get contract instance
    const contract = await getContractInstance();

    // Call completeCampaign function
    const tx = await contract.completeCampaign(campaignId);

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error completing campaign:', error);
    throw new Error(`Failed to complete campaign: ${error}`);
  }
}

export async function hasUserRSVPed(campaignId: string, userAddress?: string): Promise<boolean> {
  try {
    const address = userAddress || await walletConnection.getCurrentAccount();
    if (!address) {
      throw new Error('No address provided and wallet not connected');
    }

    const contract = await getContractInstance();
    return await contract.hasUserRSVPed(campaignId, address);
  } catch (error) {
    console.error('Error checking user RSVP status:', error);
    throw new Error(`Failed to check user RSVP status: ${error}`);
  }
}

// Get participant stake amount
export async function getParticipantStake(campaignId: string, participantAddress?: string): Promise<bigint> {
  try {
    const address = participantAddress || await walletConnection.getCurrentAccount();
    if (!address) {
      throw new Error('No address provided and wallet not connected');
    }

    const contract = await getContractInstance();
    return await contract.getParticipantStake(campaignId, address);
  } catch (error) {
    console.error('Error getting participant stake:', error);
    throw new Error(`Failed to get participant stake: ${error}`);
  }
}

// Check if address is verifier for campaign
export async function isVerifierForCampaign(campaignId: string, verifierAddress?: string): Promise<boolean> {
  try {
    const address = verifierAddress || await walletConnection.getCurrentAccount();
    if (!address) {
      throw new Error('No address provided and wallet not connected');
    }

    const contract = await getContractInstance();
    return await contract.isVerifierForCampaign(campaignId, address);
  } catch (error) {
    console.error('Error checking verifier status:', error);
    throw new Error(`Failed to check verifier status: ${error}`);
  }
}

// Get contract balance
export async function getContractBalance(): Promise<bigint> {
  try {
    const contract = await getContractInstance();
    return await contract.getContractBalance();
  } catch (error) {
    console.error('Error getting contract balance:', error);
    throw new Error(`Failed to get contract balance: ${error}`);
  }
}

// Dummy DAO function (for testing purposes)
export async function dummyDAO(campaignId: string): Promise<{
  transactionHash: string;
}> {
  try {
    // Get current account
    const caller = await walletConnection.getCurrentAccount();
    if (!caller) {
      throw new Error('Wallet not connected');
    }

    // Get contract instance
    const contract = await getContractInstance();

    // Call dummyDAO function
    const tx = await contract.dummyDAO(campaignId);

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error calling dummy DAO:', error);
    throw new Error(`Failed to call dummy DAO: ${error}`);
  }
}


// Get campaign by ID
export async function getCampaign(campaignId: string): Promise<Campaign> {
  try {
    const contract = await getContractInstance();
    const campaignData = await contract.getCampaign(campaignId);
    console.log(campaignData);
    return {
      creator: campaignData.creator,
      isFundraiser: campaignData.isFundraiser,
      bountyAmount: campaignData.bountyAmount,
      bountyPayer: campaignData.bountyPayer,
      stakingAmount: campaignData.stakingAmount,
      status: campaignData.status,
      publicAddresses: campaignData.publicAddresses
    };
  } catch (error) {
    console.error('Error getting campaign:', error);
    throw new Error(`Failed to get campaign: ${error}`);
  }
}

// Get campaign RSVPs
export async function getCampaignRSVPs(campaignId: string): Promise<RSVP[]> {
  try {
    const contract = await getContractInstance();
    const rsvpData = await contract.getCampaignRSVPs(campaignId);
    
    return rsvpData.map((rsvp: any) => ({
      participant: rsvp.participant,
      stakeAmount: rsvp.stakeAmount,
      rsvpTimestamp: Number(rsvp.rsvpTimestamp),
      stakeReturned: rsvp.stakeReturned,
      verified: rsvp.verified
    }));
  } catch (error) {
    console.error('Error getting campaign RSVPs:', error);
    throw new Error(`Failed to get campaign RSVPs: ${error}`);
  }
}

// Check if campaign exists
export async function doesCampaignExist(campaignId: string): Promise<boolean> {
  try {
    const contract = await getContractInstance();
    return await contract.doesCampaignExist(campaignId);
  } catch (error) {
    console.error('Error checking campaign existence:', error);
    throw new Error(`Failed to check campaign existence: ${error}`);
  }
}

// Get user's campaigns
export async function getUserCampaigns(userAddress?: string): Promise<string[]> {
  try {
    const address = userAddress || await walletConnection.getCurrentAccount();
    if (!address) {
      throw new Error('No address provided and wallet not connected');
    }

    const contract = await getContractInstance();
    return await contract.getUserCampaigns(address);
  } catch (error) {
    console.error('Error getting user campaigns:', error);
    throw new Error(`Failed to get user campaigns: ${error}`);
  }
}

// Get campaign statistics
export async function getCampaignStats(campaignId: string): Promise<{
  totalParticipants: number;
  totalStaked: bigint;
  bountyAmount: bigint;
  status: CampaignStatus;
}> {
  try {
    const contract = await getContractInstance();
    const stats = await contract.getCampaignStats(campaignId);
    
    return {
      totalParticipants: Number(stats.totalParticipants),
      totalStaked: stats.totalStaked,
      bountyAmount: stats.bountyAmount,
      status: stats.status
    };
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    throw new Error(`Failed to get campaign stats: ${error}`);
  }
}

