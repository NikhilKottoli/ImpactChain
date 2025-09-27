import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  campaignContract, 
  campaignHelpers,
  CampaignStatus
} from '../utils/campaignContract';
import type {
  Campaign,
  RSVP,
  CampaignStats,
  CreateCampaignParams,
  PayBountyParams
} from '../utils/campaignContract';
import { walletConnection } from '../utils/wallet';

// Hook state interface
interface CampaignHookState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  currentAccount: string | null;
  isOwner: boolean;
  isWalletConnected: boolean;
}

// Hook return interface
interface UseCampaignContractReturn extends CampaignHookState {
  // Contract operations
  createCampaign: (params: CreateCampaignParams) => Promise<string>;
  payBountyToEscrow: (params: PayBountyParams) => Promise<void>;
  rsvpToCampaign: (campaignId: string, stakeAmount: bigint) => Promise<void>;
  dummyDAO: (campaignId: string) => Promise<void>;
  completeCampaign: (campaignId: string) => Promise<void>;
  
  // Read operations
  getCampaign: (campaignId: string) => Promise<Campaign>;
  getCampaignRSVPs: (campaignId: string) => Promise<RSVP[]>;
  getCampaignStats: (campaignId: string) => Promise<CampaignStats>;
  getUserCampaigns: (userAddress: string) => Promise<string[]>;
  hasUserRSVPed: (campaignId: string, userAddress: string) => Promise<boolean>;
  isVerifierForCampaign: (campaignId: string, verifier: string) => Promise<boolean>;
  doesCampaignExist: (campaignId: string) => Promise<boolean>;
  
  // Utility functions
  isCurrentUserOwner: () => Promise<boolean>;
  isCurrentUserCampaignCreator: (campaignId: string) => Promise<boolean>;
  isCurrentUserVerifier: (campaignId: string) => Promise<boolean>;
  hasCurrentUserRSVPed: (campaignId: string) => Promise<boolean>;
  canUserRSVP: (campaignId: string, userAddress: string) => Promise<{ canRSVP: boolean; reason?: string }>;
  canUserCompleteCampaign: (campaignId: string, userAddress: string) => Promise<{ canComplete: boolean; reason?: string }>;
  
  // Helper functions
  getCampaignWithDetails: (campaignId: string) => Promise<{ campaign: Campaign; rsvps: RSVP[]; stats: CampaignStats }>;
  getUserCampaignsWithDetails: (userAddress: string) => Promise<Campaign[]>;
  getCampaignParticipants: (campaignId: string) => Promise<{ verified: RSVP[]; unverified: RSVP[]; total: number }>;
  
  // Formatting functions
  formatEthAmount: (amount: bigint) => string;
  parseEthAmount: (amount: string) => bigint;
  getCampaignStatusString: (status: CampaignStatus) => string;
  
  // Gas estimation
  estimateCreateCampaignGas: (params: CreateCampaignParams) => Promise<bigint>;
  estimatePayBountyGas: (params: PayBountyParams) => Promise<bigint>;
  estimateRSVPGas: (campaignId: string, stakeAmount: bigint) => Promise<bigint>;
  estimateCompleteCampaignGas: (campaignId: string) => Promise<bigint>;
  
  // Event listeners
  onCampaignCreated: (callback: (campaignId: string, creator: string, stakingAmount: bigint, isFundraiser: boolean) => void) => void;
  onCampaignUpdated: (callback: (campaignId: string, status: CampaignStatus, timestamp: number) => void) => void;
  onBountyPaid: (callback: (campaignId: string, amount: bigint, bountyPayer: string, verifiers: string[]) => void) => void;
  onRSVPCreated: (callback: (campaignId: string, participant: string, stakeAmount: bigint, timestamp: number) => void) => void;
  onCampaignCompleted: (callback: (campaignId: string, verifiedParticipants: string[], bountyPerParticipant: bigint, totalStakesForfeited: bigint) => void) => void;
  onBountyDistributed: (callback: (campaignId: string, participant: string, amount: bigint) => void) => void;
  onStakeReturned: (callback: (campaignId: string, participant: string, amount: bigint) => void) => void;
  onStakeForfeited: (callback: (campaignId: string, participant: string, amount: bigint) => void) => void;
  
  // Cleanup
  removeAllListeners: () => void;
  initialize: () => Promise<void>;
}

export const useCampaignContract = (): UseCampaignContractReturn => {
  const [state, setState] = useState<CampaignHookState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    currentAccount: null,
    isOwner: false,
    isWalletConnected: false
  });

  // Check wallet connection status
  const checkWalletConnection = useCallback(async () => {
    try {
      // Initialize provider if needed
      await walletConnection.initializeProvider();
      
      const isConnected = await walletConnection.isConnected();
      const currentAccount = await walletConnection.getCurrentAccount();
      
      setState(prev => ({
        ...prev,
        isWalletConnected: isConnected,
        currentAccount: currentAccount
      }));
      
      return { isConnected, currentAccount };
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setState(prev => ({
        ...prev,
        isWalletConnected: false,
        currentAccount: null
      }));
      return { isConnected: false, currentAccount: null };
    }
  }, []);

  // Initialize contract
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // First check wallet connection
      const { isConnected, currentAccount } = await checkWalletConnection();
      
      if (!isConnected || !currentAccount) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Please connect your wallet first',
          isWalletConnected: false
        }));
        return;
      }

      // Initialize contract
      await campaignContract.initialize();
      const isOwner = await campaignContract.isCurrentUserOwner();
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        currentAccount,
        isOwner,
        isWalletConnected: true
      }));
    } catch (error) {
      console.error('Contract initialization error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize contract'
      }));
    }
  }, [checkWalletConnection]);

  // Check wallet connection on mount and listen for changes
  useEffect(() => {
    checkWalletConnection();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState(prev => ({
          ...prev,
          isWalletConnected: false,
          currentAccount: null,
          isInitialized: false
        }));
      } else {
        checkWalletConnection();
      }
    };

    // Listen for network changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [checkWalletConnection]);

  // Auto-initialize when wallet is connected
  useEffect(() => {
    if (state.isWalletConnected && state.currentAccount && !state.isInitialized && !state.isLoading) {
      initialize();
    }
  }, [state.isWalletConnected, state.currentAccount, state.isInitialized, state.isLoading, initialize]);

  // Contract operations with error handling
  const createCampaign = useCallback(async (params: CreateCampaignParams): Promise<string> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const campaignId = await campaignHelpers.createCampaignAndWait(params);
      setState(prev => ({ ...prev, isLoading: false }));
      return campaignId;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign'
      }));
      throw error;
    }
  }, []);

  const payBountyToEscrow = useCallback(async (params: PayBountyParams): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await campaignHelpers.payBountyAndWait(params);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to pay bounty'
      }));
      throw error;
    }
  }, []);

  const rsvpToCampaign = useCallback(async (campaignId: string, stakeAmount: bigint): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await campaignHelpers.rsvpAndWait(campaignId, stakeAmount);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to RSVP to campaign'
      }));
      throw error;
    }
  }, []);

  const dummyDAO = useCallback(async (campaignId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const tx = await campaignContract.dummyDAO(campaignId);
      await tx.wait();
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to run DAO verification'
      }));
      throw error;
    }
  }, []);

  const completeCampaign = useCallback(async (campaignId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await campaignHelpers.completeCampaignAndWait(campaignId);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to complete campaign'
      }));
      throw error;
    }
  }, []);

  // Read operations
  const getCampaign = useCallback(async (campaignId: string): Promise<Campaign> => {
    try {
      return await campaignContract.getCampaign(campaignId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get campaign');
    }
  }, []);

  const getCampaignRSVPs = useCallback(async (campaignId: string): Promise<RSVP[]> => {
    try {
      return await campaignContract.getCampaignRSVPs(campaignId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get campaign RSVPs');
    }
  }, []);

  const getCampaignStats = useCallback(async (campaignId: string): Promise<CampaignStats> => {
    try {
      return await campaignContract.getCampaignStats(campaignId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get campaign stats');
    }
  }, []);

  const getUserCampaigns = useCallback(async (userAddress: string): Promise<string[]> => {
    try {
      return await campaignContract.getUserCampaigns(userAddress);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user campaigns');
    }
  }, []);

  const hasUserRSVPed = useCallback(async (campaignId: string, userAddress: string): Promise<boolean> => {
    try {
      return await campaignContract.hasUserRSVPed(campaignId, userAddress);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check RSVP status');
    }
  }, []);

  const isVerifierForCampaign = useCallback(async (campaignId: string, verifier: string): Promise<boolean> => {
    try {
      return await campaignContract.isVerifierForCampaign(campaignId, verifier);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check verifier status');
    }
  }, []);

  const doesCampaignExist = useCallback(async (campaignId: string): Promise<boolean> => {
    try {
      return await campaignContract.doesCampaignExist(campaignId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check campaign existence');
    }
  }, []);

  // Utility functions
  const isCurrentUserOwner = useCallback(async (): Promise<boolean> => {
    try {
      return await campaignContract.isCurrentUserOwner();
    } catch (error) {
      return false;
    }
  }, []);

  const isCurrentUserCampaignCreator = useCallback(async (campaignId: string): Promise<boolean> => {
    try {
      return await campaignContract.isCurrentUserCampaignCreator(campaignId);
    } catch (error) {
      return false;
    }
  }, []);

  const isCurrentUserVerifier = useCallback(async (campaignId: string): Promise<boolean> => {
    try {
      return await campaignContract.isCurrentUserVerifier(campaignId);
    } catch (error) {
      return false;
    }
  }, []);

  const hasCurrentUserRSVPed = useCallback(async (campaignId: string): Promise<boolean> => {
    try {
      return await campaignContract.hasCurrentUserRSVPed(campaignId);
    } catch (error) {
      return false;
    }
  }, []);

  const canUserRSVP = useCallback(async (campaignId: string, userAddress: string) => {
    try {
      return await campaignHelpers.canUserRSVP(campaignId, userAddress);
    } catch (error) {
      return { canRSVP: false, reason: 'Failed to check RSVP eligibility' };
    }
  }, []);

  const canUserCompleteCampaign = useCallback(async (campaignId: string, userAddress: string) => {
    try {
      return await campaignHelpers.canUserCompleteCampaign(campaignId, userAddress);
    } catch (error) {
      return { canComplete: false, reason: 'Failed to check completion eligibility' };
    }
  }, []);

  // Helper functions
  const getCampaignWithDetails = useCallback(async (campaignId: string) => {
    try {
      return await campaignHelpers.getCampaignWithDetails(campaignId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get campaign details');
    }
  }, []);

  const getUserCampaignsWithDetails = useCallback(async (userAddress: string): Promise<Campaign[]> => {
    try {
      return await campaignHelpers.getUserCampaignsWithDetails(userAddress);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user campaigns with details');
    }
  }, []);

  const getCampaignParticipants = useCallback(async (campaignId: string) => {
    try {
      return await campaignHelpers.getCampaignParticipants(campaignId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get campaign participants');
    }
  }, []);

  // Formatting functions
  const formatEthAmount = useCallback((amount: bigint): string => {
    return campaignContract.formatEthAmount(amount);
  }, []);

  const parseEthAmount = useCallback((amount: string): bigint => {
    return campaignContract.parseEthAmount(amount);
  }, []);

  const getCampaignStatusString = useCallback((status: CampaignStatus): string => {
    return campaignContract.getCampaignStatusString(status);
  }, []);

  // Gas estimation
  const estimateCreateCampaignGas = useCallback(async (params: CreateCampaignParams): Promise<bigint> => {
    try {
      return await campaignContract.estimateCreateCampaignGas(params);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to estimate gas');
    }
  }, []);

  const estimatePayBountyGas = useCallback(async (params: PayBountyParams): Promise<bigint> => {
    try {
      return await campaignContract.estimatePayBountyGas(params);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to estimate gas');
    }
  }, []);

  const estimateRSVPGas = useCallback(async (campaignId: string, stakeAmount: bigint): Promise<bigint> => {
    try {
      return await campaignContract.estimateRSVPGas(campaignId, stakeAmount);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to estimate gas');
    }
  }, []);

  const estimateCompleteCampaignGas = useCallback(async (campaignId: string): Promise<bigint> => {
    try {
      return await campaignContract.estimateCompleteCampaignGas(campaignId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to estimate gas');
    }
  }, []);

  // Event listeners
  const onCampaignCreated = useCallback((callback: (campaignId: string, creator: string, stakingAmount: bigint, isFundraiser: boolean) => void) => {
    campaignContract.onCampaignCreated(callback);
  }, []);

  const onCampaignUpdated = useCallback((callback: (campaignId: string, status: CampaignStatus, timestamp: number) => void) => {
    campaignContract.onCampaignUpdated(callback);
  }, []);

  const onBountyPaid = useCallback((callback: (campaignId: string, amount: bigint, bountyPayer: string, verifiers: string[]) => void) => {
    campaignContract.onBountyPaid(callback);
  }, []);

  const onRSVPCreated = useCallback((callback: (campaignId: string, participant: string, stakeAmount: bigint, timestamp: number) => void) => {
    campaignContract.onRSVPCreated(callback);
  }, []);

  const onCampaignCompleted = useCallback((callback: (campaignId: string, verifiedParticipants: string[], bountyPerParticipant: bigint, totalStakesForfeited: bigint) => void) => {
    campaignContract.onCampaignCompleted(callback);
  }, []);

  const onBountyDistributed = useCallback((callback: (campaignId: string, participant: string, amount: bigint) => void) => {
    campaignContract.onBountyDistributed(callback);
  }, []);

  const onStakeReturned = useCallback((callback: (campaignId: string, participant: string, amount: bigint) => void) => {
    campaignContract.onStakeReturned(callback);
  }, []);

  const onStakeForfeited = useCallback((callback: (campaignId: string, participant: string, amount: bigint) => void) => {
    campaignContract.onStakeForfeited(callback);
  }, []);

  // Cleanup
  const removeAllListeners = useCallback(() => {
    campaignContract.removeAllListeners();
  }, []);

  return {
    ...state,
    createCampaign,
    payBountyToEscrow,
    rsvpToCampaign,
    dummyDAO,
    completeCampaign,
    getCampaign,
    getCampaignRSVPs,
    getCampaignStats,
    getUserCampaigns,
    hasUserRSVPed,
    isVerifierForCampaign,
    doesCampaignExist,
    isCurrentUserOwner,
    isCurrentUserCampaignCreator,
    isCurrentUserVerifier,
    hasCurrentUserRSVPed,
    canUserRSVP,
    canUserCompleteCampaign,
    getCampaignWithDetails,
    getUserCampaignsWithDetails,
    getCampaignParticipants,
    formatEthAmount,
    parseEthAmount,
    getCampaignStatusString,
    estimateCreateCampaignGas,
    estimatePayBountyGas,
    estimateRSVPGas,
    estimateCompleteCampaignGas,
    onCampaignCreated,
    onCampaignUpdated,
    onBountyPaid,
    onRSVPCreated,
    onCampaignCompleted,
    onBountyDistributed,
    onStakeReturned,
    onStakeForfeited,
    removeAllListeners,
    initialize
  };
};

// Export the hook
export default useCampaignContract;
