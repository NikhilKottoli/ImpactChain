import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Input from '@/components/Input';
import { WalletConnect } from '@/components/WalletConnect';
import { EnsProfile } from '@/components/EnsProfile';
import { walletConnection } from '@/utils/wallet';
import { 
  payBountyToEscrow, 
  rsvpToCampaign, 
  getCampaign,
  hasUserRSVPed,
  getParticipantStake,
  getCampaignRSVPs,
  dummyDAO,
  completeCampaign,
  type Campaign,
  type RSVP,
  CampaignStatus,
  type PayBountyParams,
  type RSVPParams
} from '@/utils/campaignContract';
import { createDAO, addUser, type CreateDAOParams, type AddUserParams } from '@/utils/daoContract';
import { ethers } from 'ethers';

export default function CampaignFeed() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign & { id: string } | null>(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  
  // Bounty payment state
  const [bountyAmount, setBountyAmount] = useState('0.1');
  const [verifiers, setVerifiers] = useState<string>('');
  const [isPayingBounty, setIsPayingBounty] = useState(false);
  const [bountyError, setBountyError] = useState<string | null>(null);
  const [bountySuccess, setBountySuccess] = useState<string | null>(null);

  // DAO creation state
  const [isCreatingDAO, setIsCreatingDAO] = useState(false);
  const [daoError, setDAOError] = useState<string | null>(null);
  const [daoSuccess, setDAOSuccess] = useState<string | null>(null);

  // RSVP state
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [isRSVPing, setIsRSVPing] = useState(false);
  const [rsvpError, setRSVPError] = useState<string | null>(null);
  const [rsvpSuccess, setRSVPSuccess] = useState<string | null>(null);
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [userStake, setUserStake] = useState<bigint>(0n);
  const [isAddingToDAO, setIsAddingToDAO] = useState(false);

  // Testing/Debug state
  const [campaignRSVPs, setCampaignRSVPs] = useState<RSVP[]>([]);
  const [isLoadingRSVPs, setIsLoadingRSVPs] = useState(false);
  const [isDummyDAORunning, setIsDummyDAORunning] = useState(false);
  const [dummyDAOError, setDummyDAOError] = useState<string | null>(null);
  const [dummyDAOSuccess, setDummyDAOSuccess] = useState<string | null>(null);
  const [isCompletingCampaign, setIsCompletingCampaign] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completionSuccess, setCompletionSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (uuid) {
      loadCampaignData();
    }
  }, [uuid]);

  useEffect(() => {
    if (isConnected && currentAccount && campaign) {
      checkUserRSVPStatus();
      loadCampaignRSVPs();
    }
  }, [isConnected, currentAccount, campaign?.status]);

  const checkConnection = async () => {
    try {
      const connected = await walletConnection.isConnected();
      setIsConnected(connected);

      if (connected) {
        const account = await walletConnection.getCurrentAccount();
        setCurrentAccount(account);
      }
    } catch (err) {
      setIsConnected(false);
      setCurrentAccount(null);
    }
  };

  const loadCampaignData = async () => {
    if (!uuid) {
      setCampaignError('No campaign ID provided');
      setIsLoadingCampaign(false);
      return;
    }

    setIsLoadingCampaign(true);
    setCampaignError(null);

    try {
      const campaignData = await getCampaign(uuid);
      setCampaign({
        ...campaignData,
        id: uuid
      });
      console.log(campaignData);
      
      // Set default bounty amount from campaign data
      setBountyAmount(ethers.formatEther(campaignData.bountyAmount));
      setStakeAmount(ethers.formatEther(campaignData.stakingAmount));
      
    } catch (err) {
      console.error('Error loading campaign:', err);
      setCampaignError(err instanceof Error ? err.message : 'Failed to load campaign');
    } finally {
      setIsLoadingCampaign(false);
    }
  };

  const checkUserRSVPStatus = async () => {
    if (!currentAccount || !campaign) return;
    
    try {
      const rsvpStatus = await hasUserRSVPed(campaign.id, currentAccount);
      setHasRSVPed(rsvpStatus);
      
      if (rsvpStatus) {
        const stake = await getParticipantStake(campaign.id, currentAccount);
        setUserStake(stake);
      }
    } catch (err) {
      console.error('Error checking RSVP status:', err);
    }
  };

  const loadCampaignRSVPs = async () => {
    if (!campaign) return;
    
    setIsLoadingRSVPs(true);
    try {
      const rsvps = await getCampaignRSVPs(campaign.id);
      setCampaignRSVPs(rsvps);
    } catch (err) {
      console.error('Error loading RSVPs:', err);
      setCampaignRSVPs([]);
    } finally {
      setIsLoadingRSVPs(false);
    }
  };

  const handlePayBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setBountyError('Please connect your wallet first');
      return;
    }

    if (!campaign) {
      setBountyError('Campaign not loaded');
      return;
    }

    // Parse verifier addresses
    const verifierAddresses = verifiers
      .split(',')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);

    if (verifierAddresses.length === 0) {
      setBountyError('Please enter at least one verifier address');
      return;
    }

    // Validate addresses
    for (const addr of verifierAddresses) {
      if (!ethers.isAddress(addr)) {
        setBountyError(`Invalid address: ${addr}`);
        return;
      }
    }

    setIsPayingBounty(true);
    setBountyError(null);
    setBountySuccess(null);
    setDAOError(null);
    setDAOSuccess(null);

    try {
      // Step 1: Pay bounty to escrow
      const params: PayBountyParams = {
        campaignId: campaign.id,
        verifiers: verifierAddresses,
        bountyAmount: bountyAmount
      };

      const result = await payBountyToEscrow(params);
      
      // Step 2: Create DAO with the same campaign ID and verifiers
      setIsCreatingDAO(true);
      const daoParams: CreateDAOParams = {
        uuid: campaign.id,
        verifiers: verifierAddresses
      };

      const daoResult = await createDAO(daoParams);
      setIsCreatingDAO(false);

      setBountySuccess(`Bounty paid and DAO created successfully! Bounty TX: ${result.transactionHash}... DAO TX: ${daoResult.transactionHash}`);
      
      // Update campaign status
      setCampaign(prev => ({
        ...prev!,
        status: CampaignStatus.BOUNTY_PAID,
        bountyPayer: currentAccount!,
        publicAddresses: verifierAddresses
      }));

    } catch (err) {
      console.error('Error paying bounty or creating DAO:', err);
      setBountyError(err instanceof Error ? err.message : 'Failed to pay bounty or create DAO');
      setIsCreatingDAO(false);
    } finally {
      setIsPayingBounty(false);
    }
  };

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setRSVPError('Please connect your wallet first');
      return;
    }

    if (!campaign) {
      setRSVPError('Campaign not loaded');
      return;
    }

    if (campaign.status !== CampaignStatus.BOUNTY_PAID) {
      setRSVPError('Campaign bounty must be paid before RSVPing');
      return;
    }

    if (hasRSVPed) {
      setRSVPError('You have already RSVPed to this campaign');
      return;
    }

    if (!currentAccount) {
      setRSVPError('Wallet not connected');
      return;
    }

    setIsRSVPing(true);
    setRSVPError(null);
    setRSVPSuccess(null);

    try {
      // Step 1: RSVP to campaign with stake
      const params: RSVPParams = {
        campaignId: campaign.id,
        stakeAmount: stakeAmount
      };

      const result = await rsvpToCampaign(params);
      
      // Step 2: Add user to the DAO
      setIsAddingToDAO(true);
      const addUserParams: AddUserParams = {
        uuid: campaign.id,
        userAddress: currentAccount
      };

      const daoResult = await addUser(addUserParams);
      setIsAddingToDAO(false);

      setRSVPSuccess(`RSVP successful and added to DAO! RSVP TX: ${result.transactionHash.slice(0, 10)}... DAO TX: ${daoResult.transactionHash.slice(0, 10)}...`);
      
      // Update RSVP status
      setHasRSVPed(true);
      setUserStake(ethers.parseEther(stakeAmount));
      
      // Reload RSVPs to see the new participant
      await loadCampaignRSVPs();

    } catch (err) {
      console.error('Error RSVPing or adding to DAO:', err);
      setRSVPError(err instanceof Error ? err.message : 'Failed to RSVP or add to DAO');
      setIsAddingToDAO(false);
    } finally {
      setIsRSVPing(false);
    }
  };

  const handleDummyDAO = async () => {
    if (!isConnected) {
      setDummyDAOError('Please connect your wallet first');
      return;
    }

    setIsDummyDAORunning(true);
    setDummyDAOError(null);
    setDummyDAOSuccess(null);

    try {
      const result = await dummyDAO(campaign.id);
      console.log(result);
      setDummyDAOSuccess(`Transaction: ${result.transactionHash}`);
      
      // Reload RSVPs to see verification changes
      await loadCampaignRSVPs();

    } catch (err) {
      console.error('Error running dummy DAO:', err);
      setDummyDAOError(err instanceof Error ? err.message : 'Failed to run dummy DAO verification');
    } finally {
      setIsDummyDAORunning(false);
    }
  };

  const handleCompleteCampaign = async () => {
    if (!isConnected) {
      setCompletionError('Please connect your wallet first');
      return;
    }

    setIsCompletingCampaign(true);
    setCompletionError(null);
    setCompletionSuccess(null);

    try {
      const result = await completeCampaign(campaign.id);
      console.log(result);
      setCompletionSuccess(`Campaign completed! Payouts distributed. Transaction: ${result.transactionHash}`);
      
      // Update campaign status
      setCampaign(prev => ({
        ...prev,
        status: CampaignStatus.COMPLETED
      }));

    } catch (err) {
      console.error('Error completing campaign:', err);
      setCompletionError(err instanceof Error ? err.message : 'Failed to complete campaign');
    } finally {
      setIsCompletingCampaign(false);
    }
  };

  const getStatusText = (status: CampaignStatus): string => {
    switch (status) {
      case CampaignStatus.CREATED:
        return 'Created - Waiting for Bounty';
      case CampaignStatus.BOUNTY_PAID:
        return 'Bounty Paid - Accepting RSVPs';
      case CampaignStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case CampaignStatus.CREATED:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case CampaignStatus.BOUNTY_PAID:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case CampaignStatus.COMPLETED:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Show loading state
  if (isLoadingCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            <span className="text-white">Loading campaign...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <h3 className="text-red-300 font-medium mb-2">Error Loading Campaign</h3>
            <p className="text-red-200">{campaignError || 'Campaign not found'}</p>
            <Button onClick={loadCampaignData} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Campaign Details</h1>
            <p className="text-gray-400">Manage campaign interactions and verification</p>
          </div>
          <WalletConnect />
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
            <h3 className="text-yellow-300 font-medium mb-2">Wallet Not Connected</h3>
            <p className="text-yellow-200">Please connect your wallet to interact with campaigns.</p>
          </div>
        )}

        {/* Campaign Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          {/* Campaign Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {campaign.isFundraiser ? 'Fundraiser' : 'Sponsored'} Campaign
              </h2>
              <p className="text-sm text-gray-400 font-mono mb-2">
                ID: {campaign.id}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                {getStatusText(campaign.status)}
              </span>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Required Bounty:</span>
                <span className="text-white font-medium">
                  {ethers.formatEther(campaign.bountyAmount)} ETH
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Staking Amount:</span>
                <span className="text-white font-medium">
                  {ethers.formatEther(campaign.stakingAmount)} ETH
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Creator:</span>
                <span className="text-white font-medium text-xs font-mono">
                  {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {campaign.bountyPayer !== '0x0000000000000000000000000000000000000000' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bounty Payer:</span>
                  <EnsProfile 
                    address={campaign.bountyPayer as `0x${string}`}
                    size="sm"
                    showAddress={false}
                    className="text-white"
                  />
                </div>
              )}
              
              {campaign.publicAddresses.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-2">Verifiers:</span>
                  {campaign.publicAddresses.map((addr, index) => (
                    <div key={index} className="mb-1">
                      <EnsProfile 
                        address={addr as `0x${string}`}
                        size="sm"
                        showAddress={false}
                        className="text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {hasRSVPed && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Your Stake:</span>
                  <span className="text-green-300 font-medium">
                    {ethers.formatEther(userStake)} ETH
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pay Bounty Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Pay Bounty</h3>
              
              {campaign.status === CampaignStatus.CREATED ? (
                <form onSubmit={handlePayBounty} className="space-y-4">
                  <div>
                    <label htmlFor="bountyAmount" className="block text-white font-medium mb-2">
                      Bounty Amount (ETH)
                    </label>
                    <Input
                      id="bountyAmount"
                      type="number"
                      step="0.001"
                      placeholder="0.1"
                      value={bountyAmount}
                      onChange={(e) => setBountyAmount(e.target.value)}
                      disabled={!isConnected || isPayingBounty}
                    />
                  </div>

                  <div>
                    <label htmlFor="verifiers" className="block text-white font-medium mb-2">
                      Verifier Addresses (comma-separated)
                    </label>
                    <Input
                      id="verifiers"
                      type="text"
                      placeholder="0x123..., 0x456..."
                      value={verifiers}
                      onChange={(e) => setVerifiers(e.target.value)}
                      disabled={!isConnected || isPayingBounty}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter wallet addresses that can verify campaign completion and will be part of the DAO verifying presence of the RSVPed participants attesting proof of work by voting
                    </p>
                  </div>

                  {bountyError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 text-sm">{bountyError}</p>
                    </div>
                  )}

                  {bountySuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 text-sm">{bountySuccess}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!isConnected || isPayingBounty}
                    className="w-full"
                  >
                    {isPayingBounty ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isCreatingDAO ? 'Creating DAO...' : 'Paying Bounty...'}
                      </div>
                    ) : (
                      'Pay Bounty & Create DAO'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {campaign.status === CampaignStatus.BOUNTY_PAID 
                      ? 'Bounty has been paid and DAO created!' 
                      : 'Campaign is completed'}
                  </p>
                </div>
              )}
            </div>

            {/* RSVP Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">RSVP & Join DAO</h3>
              
              {campaign.status === CampaignStatus.BOUNTY_PAID && !hasRSVPed ? (
                <form onSubmit={handleRSVP} className="space-y-4">
                  <div>
                    <label htmlFor="stakeAmount" className="block text-white font-medium mb-2">
                      Stake Amount (ETH)
                    </label>
                    <Input
                      id="stakeAmount"
                      type="number"
                      step="0.001"
                      placeholder="0.01"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={!isConnected || isRSVPing}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Required: {ethers.formatEther(campaign.stakingAmount)} ETH
                    </p>
                  </div>

                  {rsvpError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 text-sm">{rsvpError}</p>
                    </div>
                  )}

                  {rsvpSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 text-sm">{rsvpSuccess}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!isConnected || isRSVPing}
                    className="w-full"
                    variant="outline"
                  >
                    {isRSVPing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isAddingToDAO ? 'Adding to DAO...' : 'RSVPing...'}
                      </div>
                    ) : (
                      'RSVP & Join DAO'
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {campaign.status === CampaignStatus.CREATED
                      ? 'Waiting for bounty to be paid'
                      : hasRSVPed
                      ? 'You have already RSVPed and joined the DAO!'
                      : 'Campaign is completed'}
                  </p>
                  {hasRSVPed && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 text-sm">
                        ✅ Your stake: {ethers.formatEther(userStake)} ETH
                      </p>
                      <p className="text-green-300 text-xs mt-1">
                        You're now part of the DAO for verification
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Verification & Voting Section */}
          {campaign.status === CampaignStatus.BOUNTY_PAID && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-300 mb-4">🗳️ Verification & Voting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Go to Voting */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Participant Verification</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Go to the voting page to verify participants through the DAO system.
                  </p>
                  
                  <Button
                    onClick={() => navigate(`/voting/${campaign.id}`)}
                    disabled={!isConnected}
                    className="w-full mb-4"
                  >
                    Go to Voting Page
                  </Button>
                </div>

                {/* Dummy DAO for Demo */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Stop Voting: Final Step</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    This will stop the voting in the DAO which was created according to the user who made the campaign.
                  </p>
                  
                  {dummyDAOError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-300 text-sm">{dummyDAOError}</p>
                    </div>
                  )}

                  {dummyDAOSuccess && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 text-sm">{dummyDAOSuccess}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleDummyDAO}
                    disabled={!isConnected || isDummyDAORunning}
                    variant="outline"
                    className="w-full mb-4"
                  >
                    {isDummyDAORunning ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Stopping and Calculating Results...
                      </div>
                    ) : (
                      'Stop Voting'
                    )}
                  </Button>
                </div>
              </div>

              {/* Complete Campaign Section */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-3">Complete Campaign</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Distribute bounties to verified participants and handle stake returns/forfeitures.
                </p>
                
                {completionError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-300 text-sm">{completionError}</p>
                  </div>
                )}

                {completionSuccess && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-300 text-sm">{completionSuccess}</p>
                  </div>
                )}

                <Button
                  onClick={handleCompleteCampaign}
                  disabled={!isConnected || isCompletingCampaign}
                  className="w-full mb-4"
                >
                  {isCompletingCampaign ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completing Campaign...
                    </div>
                  ) : (
                    'Complete Campaign & Distribute Payouts'
                  )}
                </Button>
              </div>

              {/* RSVP List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-medium text-white">Campaign Participants</h4>
                  <Button
                    onClick={loadCampaignRSVPs}
                    disabled={isLoadingRSVPs}
                    variant="outline"
                    size="sm"
                  >
                    {isLoadingRSVPs ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>
                
                {isLoadingRSVPs ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                  </div>
                ) : campaignRSVPs.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No participants yet</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {campaignRSVPs.map((rsvp, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          rsvp.verified 
                            ? 'bg-green-500/10 border-green-500/20' 
                            : 'bg-gray-500/10 border-gray-500/20'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-mono text-sm">
                              {rsvp.participant.slice(0, 6)}...{rsvp.participant.slice(-4)}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Stake: {ethers.formatEther(rsvp.stakeAmount)} ETH
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              rsvp.verified 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {rsvp.verified ? '✅ Verified' : '⏳ Pending'}
                            </span>
                            {rsvp.stakeReturned && (
                              <p className="text-xs text-blue-300 mt-1">Stake Returned</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-medium text-blue-300 mb-2">1. Pay Bounty & Create DAO</h4>
              <p className="text-gray-400 text-sm">
                Pay the bounty into escrow and automatically create a DAO with your specified verifiers. 
                This enables decentralized verification of participants.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-purple-300 mb-2">2. RSVP & Join DAO</h4>
              <p className="text-gray-400 text-sm">
                Participants RSVP with their stake and are automatically added to the DAO as users. 
                This allows them to be verified by the DAO verifiers.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-green-300 mb-2">3. Verify & Complete</h4>
              <p className="text-gray-400 text-sm">
                Verifiers vote on participants through the DAO system. 
                Once verified, complete the campaign to distribute rewards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}