import { ethers, Contract } from 'ethers';
import { walletConnection } from './wallet';
import daoABI from '../contracts/abi3.json';

// DAO contract configuration
export const DAO_CONTRACT_CONFIG = {
  address: '0x1347124Ee08E21d23804599B6845837161d97513', // DAO contract address
};

// Vote option enum
export const VoteOption = {
  YES: 0,
  NO: 1
} as const;

export type VoteOption = typeof VoteOption[keyof typeof VoteOption];

// Vote interface
export interface Vote {
  verifier: string;
  vote: VoteOption;
  timestamp: number;
  reason: string;
}

// User interface (matches the smart contract User struct)
export interface DAOUser {
  walletAddress: string;
  votes: Vote[];
  hasAttestation: boolean;
  attestationResult: boolean;
  ipfsMetadataHash: string;
  attestationHash: string;
  createdAt: number;
  attestedAt: number;
  yesVotes: number;
  noVotes: number;
}

// DAO statistics interface
export interface DAOStats {
  totalUsers: number;
  totalVerifiers: number;
  usersWithAttestations: number;
  approvedUsers: number;
}

// Voting summary interface
export interface VotingSummary {
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  hasAttestation: boolean;
  attestationResult: boolean;
}

// Attestation check result interface
export interface AttestationCheck {
  hasValidAttestation: boolean;
  attestationHash: string;
}

// Parameter interfaces for function calls
export interface CreateDAOParams {
  uuid: string;
  verifiers: string[];
}

export interface AddUserParams {
  uuid: string;
  userAddress: string;
}

export interface AddUsersBatchParams {
  uuid: string;
  userAddresses: string[];
}

export interface AddVerifierParams {
  uuid: string;
  verifierAddress: string;
}

export interface CastVoteParams {
  uuid: string;
  userAddress: string;
  vote: VoteOption;
  reason: string;
}

export interface VerifyAttestationParams {
  uuid: string;
  userAddress: string;
  attestationHash: string;
}

export interface UserVotingDetails {
    userAddress: string;
    yesVotes: number;
    noVotes: number;
    totalVotes: number;
    hasAttestation: boolean;
    attestationResult: boolean;
    attestationHash: string;
    ipfsMetadataHash: string;
    createdAt: number;
    attestedAt: number;
    votes: Vote[];
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
async function getDAOContractInstance(): Promise<Contract> {
  const signer = await walletConnection.getSigner();
  if (!signer) {
    throw new Error('Wallet not connected');
  }
  
  return new Contract(DAO_CONTRACT_CONFIG.address, daoABI, signer);
}

// Create a new DAO with initial verifiers
export async function createDAO(params: CreateDAOParams): Promise<{
  transactionHash: string;
}> {
  try {
    // Validate UUID
    if (!params.uuid || params.uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    // Validate verifiers
    if (params.verifiers.length === 0) {
      throw new Error('At least one verifier is required');
    }

    // Validate verifier addresses
    for (const verifier of params.verifiers) {
      if (!ethers.isAddress(verifier)) {
        throw new Error(`Invalid verifier address: ${verifier}`);
      }
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call createDAO function
    const tx = await contract.createDAO(params.uuid, params.verifiers);

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error creating DAO:', error);
    throw new Error(`Failed to create DAO: ${error}`);
  }
}

// Add a single user to the DAO
export async function addUser(params: AddUserParams): Promise<{
  transactionHash: string;
}> {
  try {
    // Validate parameters
    if (!params.uuid || params.uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(params.userAddress)) {
      throw new Error(`Invalid user address: ${params.userAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call addUser function
    const tx = await contract.addUser(params.uuid, params.userAddress);

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error adding user:', error);
    throw new Error(`Failed to add user: ${error}`);
  }
}

// Add multiple users to the DAO in batch
export async function addUsersBatch(params: AddUsersBatchParams): Promise<{
  transactionHash: string;
}> {
  try {
    // Validate parameters
    if (!params.uuid || params.uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (params.userAddresses.length === 0) {
      throw new Error('At least one user address is required');
    }

    // Validate user addresses
    for (const userAddress of params.userAddresses) {
      if (!ethers.isAddress(userAddress)) {
        throw new Error(`Invalid user address: ${userAddress}`);
      }
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call addUsersBatch function
    const tx = await contract.addUsersBatch(params.uuid, params.userAddresses);

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error adding users batch:', error);
    throw new Error(`Failed to add users batch: ${error}`);
  }
}

// Add a new verifier to the DAO
export async function addVerifier(params: AddVerifierParams): Promise<{
  transactionHash: string;
}> {
  try {
    // Validate parameters
    if (!params.uuid || params.uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(params.verifierAddress)) {
      throw new Error(`Invalid verifier address: ${params.verifierAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call addVerifier function
    const tx = await contract.addVerifier(params.uuid, params.verifierAddress);

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error adding verifier:', error);
    throw new Error(`Failed to add verifier: ${error}`);
  }
}

// Cast a vote for a user (only verifiers can vote)
export async function castVote(params: CastVoteParams): Promise<{
  transactionHash: string;
}> {
  try {
    // Validate parameters
    if (!params.uuid || params.uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(params.userAddress)) {
      throw new Error(`Invalid user address: ${params.userAddress}`);
    }

    if (params.vote !== VoteOption.YES && params.vote !== VoteOption.NO) {
      throw new Error('Invalid vote option');
    }

    // Get current account to verify it's a verifier
    const verifier = await walletConnection.getCurrentAccount();
    if (!verifier) {
      throw new Error('Wallet not connected');
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call castVote function
    const tx = await contract.castVote(
      params.uuid,
      params.userAddress,
      params.vote,
      params.reason || ''
    );

    // Wait for transaction confirmation
    await tx.wait();

    return {
      transactionHash: tx.hash
    };

  } catch (error) {
    console.error('Error casting vote:', error);
    throw new Error(`Failed to cast vote: ${error}`);
  }
}

// Get complete user data including all votes
export async function getUser(uuid: string, userAddress: string): Promise<DAOUser> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call getUser function
    const userData = await contract.getUser(uuid, userAddress);

    return {
      walletAddress: userData.walletAddress,
      votes: userData.votes.map((vote: any) => ({
        verifier: vote.verifier,
        vote: Number(vote.vote),
        timestamp: Number(vote.timestamp),
        reason: vote.reason
      })),
      hasAttestation: userData.hasAttestation,
      attestationResult: userData.attestationResult,
      ipfsMetadataHash: userData.ipfsMetadataHash,
      attestationHash: userData.attestationHash,
      createdAt: Number(userData.createdAt),
      attestedAt: Number(userData.attestedAt),
      yesVotes: Number(userData.yesVotes),
      noVotes: Number(userData.noVotes)
    };

  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error(`Failed to get user: ${error}`);
  }
}

// Get all votes for a specific user
export async function getUserVotes(uuid: string, userAddress: string): Promise<Vote[]> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call getUserVotes function
    const votes = await contract.getUserVotes(uuid, userAddress);

    return votes.map((vote: any) => ({
      verifier: vote.verifier,
      vote: Number(vote.vote),
      timestamp: Number(vote.timestamp),
      reason: vote.reason
    }));

  } catch (error) {
    console.error('Error getting user votes:', error);
    throw new Error(`Failed to get user votes: ${error}`);
  }
}

// Get voting summary for a user
export async function getVotingSummary(uuid: string, userAddress: string): Promise<VotingSummary> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call getVotingSummary function
    const summary = await contract.getVotingSummary(uuid, userAddress);

    return {
      yesVotes: Number(summary.yesVotes),
      noVotes: Number(summary.noVotes),
      totalVotes: Number(summary.totalVotes),
      hasAttestation: summary.hasAttestation,
      attestationResult: summary.attestationResult
    };

  } catch (error) {
    console.error('Error getting voting summary:', error);
    throw new Error(`Failed to get voting summary: ${error}`);
  }
}

// Get all users in a DAO
export async function getDAOUsers(uuid: string): Promise<string[]> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call getDAOUsers function
    return await contract.getDAOUsers(uuid);

  } catch (error) {
    console.error('Error getting DAO users:', error);
    throw new Error(`Failed to get DAO users: ${error}`);
  }
}

// Get all verifiers for a DAO
export async function getDAOVerifiers(uuid: string): Promise<string[]> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call getDAOVerifiers function
    return await contract.getDAOVerifiers(uuid);

  } catch (error) {
    console.error('Error getting DAO verifiers:', error);
    throw new Error(`Failed to get DAO verifiers: ${error}`);
  }
}

// Check if an address is a verifier for the DAO
export async function checkVerifier(uuid: string, address?: string): Promise<boolean> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    const checkAddress = address || await walletConnection.getCurrentAccount();
    if (!checkAddress) {
      throw new Error('No address provided and wallet not connected');
    }

    if (!ethers.isAddress(checkAddress)) {
      throw new Error(`Invalid address: ${checkAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call checkVerifier function
    return await contract.checkVerifier(uuid, checkAddress);

  } catch (error) {
    console.error('Error checking verifier:', error);
    throw new Error(`Failed to check verifier: ${error}`);
  }
}

// Check if an address is a user in the DAO
export async function checkUser(uuid: string, address?: string): Promise<boolean> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    const checkAddress = address || await walletConnection.getCurrentAccount();
    if (!checkAddress) {
      throw new Error('No address provided and wallet not connected');
    }

    if (!ethers.isAddress(checkAddress)) {
      throw new Error(`Invalid address: ${checkAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call checkUser function
    return await contract.checkUser(uuid, checkAddress);

  } catch (error) {
    console.error('Error checking user:', error);
    throw new Error(`Failed to check user: ${error}`);
  }
}

// Check if user has valid attestation
export async function checkAttestation(uuid: string, userAddress: string): Promise<AttestationCheck> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(userAddress)) {
      throw new Error(`Invalid user address: ${userAddress}`);
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call checkAttestation function
    const result = await contract.checkAttestation(uuid, userAddress);

    return {
      hasValidAttestation: result.hasValidAttestation,
      attestationHash: result.attestationHash
    };

  } catch (error) {
    console.error('Error checking attestation:', error);
    throw new Error(`Failed to check attestation: ${error}`);
  }
}

// Verify attestation hash for a user
export async function verifyAttestationHash(params: VerifyAttestationParams): Promise<boolean> {
  try {
    // Validate parameters
    if (!params.uuid || params.uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    if (!ethers.isAddress(params.userAddress)) {
      throw new Error(`Invalid user address: ${params.userAddress}`);
    }

    if (!params.attestationHash || params.attestationHash.length !== 66) {
      throw new Error('Invalid attestation hash');
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call verifyAttestationHash function
    return await contract.verifyAttestationHash(
      params.uuid,
      params.userAddress,
      params.attestationHash
    );

  } catch (error) {
    console.error('Error verifying attestation hash:', error);
    throw new Error(`Failed to verify attestation hash: ${error}`);
  }
}

// Get DAO statistics
export async function getDAOStats(uuid: string): Promise<DAOStats> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    // Get contract instance
    const contract = await getDAOContractInstance();

    // Call getDAOStats function
    const stats = await contract.getDAOStats(uuid);

    return {
      totalUsers: Number(stats.totalUsers),
      totalVerifiers: Number(stats.totalVerifiers),
      usersWithAttestations: Number(stats.usersWithAttestations),
      approvedUsers: Number(stats.approvedUsers)
    };

  } catch (error) {
    console.error('Error getting DAO stats:', error);
    throw new Error(`Failed to get DAO stats: ${error}`);
  }
}

// Custom function: Get comprehensive DAO overview
export async function getDAOOverview(uuid: string): Promise<{
  stats: DAOStats;
  users: string[];
  verifiers: string[];
  userDetails: Array<{
    address: string;
    votingSummary: VotingSummary;
    attestationCheck: AttestationCheck;
  }>;
}> {
  try {
    // Validate parameters
    if (!uuid || uuid.trim().length === 0) {
      throw new Error('Invalid UUID provided');
    }

    // Get basic DAO information
    const [stats, users, verifiers] = await Promise.all([
      getDAOStats(uuid),
      getDAOUsers(uuid),
      getDAOVerifiers(uuid)
    ]);

    // Get detailed information for each user
    const userDetails = await Promise.all(
      users.map(async (userAddress) => {
        const [votingSummary, attestationCheck] = await Promise.all([
          getVotingSummary(uuid, userAddress),
          checkAttestation(uuid, userAddress)
        ]);

        return {
          address: userAddress,
          votingSummary,
          attestationCheck
        };
      })
    );

    return {
      stats,
      users,
      verifiers,
      userDetails
    };

  } catch (error) {
    console.error('Error getting DAO overview:', error);
    throw new Error(`Failed to get DAO overview: ${error}`);
  }
}


export async function getUserVotingDetails(uuid: string, userAddress: string): Promise<UserVotingDetails> {
    try {
      // Validate parameters
      if (!uuid || uuid.trim().length === 0) {
        throw new Error('Invalid UUID provided');
      }
  
      if (!ethers.isAddress(userAddress)) {
        throw new Error(`Invalid user address: ${userAddress}`);
      }
  
      // Get complete user data
      const user = await getUser(uuid, userAddress);
  
      return {
        userAddress: user.walletAddress,
        yesVotes: user.yesVotes,
        noVotes: user.noVotes,
        totalVotes: user.votes.length,
        hasAttestation: user.hasAttestation,
        attestationResult: user.attestationResult,
        attestationHash: user.attestationHash,
        ipfsMetadataHash: user.ipfsMetadataHash,
        createdAt: user.createdAt,
        attestedAt: user.attestedAt,
        votes: user.votes
      };
  
    } catch (error) {
      console.error('Error getting user voting details:', error);
      throw new Error(`Failed to get user voting details: ${error}`);
    }
  }
  
  // Custom function: Get all users voting details for a DAO
  export async function getAllUsersVotingDetails(uuid: string): Promise<UserVotingDetails[]> {
    try {
      // Validate parameters
      if (!uuid || uuid.trim().length === 0) {
        throw new Error('Invalid UUID provided');
      }
  
      // Get all users in the DAO
      const users = await getDAOUsers(uuid);
  
      // Get voting details for each user
      const usersVotingDetails = await Promise.all(
        users.map(userAddress => getUserVotingDetails(uuid, userAddress))
      );
  
      return usersVotingDetails;
  
    } catch (error) {
      console.error('Error getting all users voting details:', error);
      throw new Error(`Failed to get all users voting details: ${error}`);
    }
  }
