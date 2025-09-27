import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import useCampaignContract from '../hooks/useCampaign';
import { CampaignStatus } from '../utils/campaignContract';
import type { CreateCampaignParams, PayBountyParams } from '../utils/campaignContract';

// Example component demonstrating campaign contract usage
const CampaignManager: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    error,
    currentAccount,
    isOwner,
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
  } = useCampaignContract();

  // State for form inputs
  const [campaignId, setCampaignId] = useState('');
  const [creator, setCreator] = useState('');
  const [isFundraiser, setIsFundraiser] = useState(false);
  const [bountyPayer, setBountyPayer] = useState('');
  const [bountyAmount, setBountyAmount] = useState('');
  const [stakingAmount, setStakingAmount] = useState('');
  const [verifiers, setVerifiers] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');

  // State for campaign data
  const [campaign, setCampaign] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [userCampaigns, setUserCampaigns] = useState<string[]>([]);

  // State for gas estimates
  const [gasEstimates, setGasEstimates] = useState<{
    createCampaign?: bigint;
    payBounty?: bigint;
    rsvp?: bigint;
    completeCampaign?: bigint;
  }>({});

  // Load user campaigns on mount
  useEffect(() => {
    if (currentAccount && isInitialized) {
      loadUserCampaigns();
    }
  }, [currentAccount, isInitialized]);

  // Set up event listeners
  useEffect(() => {
    if (isInitialized) {
      onCampaignCreated((campaignId, creator, stakingAmount, isFundraiser) => {
        console.log('Campaign created:', { campaignId, creator, stakingAmount, isFundraiser });
        loadUserCampaigns(); // Refresh user campaigns
      });

      onCampaignUpdated((campaignId, status, timestamp) => {
        console.log('Campaign updated:', { campaignId, status, timestamp });
        if (campaignId === campaign?.campaignId) {
          loadCampaignDetails(); // Refresh current campaign
        }
      });

      onBountyPaid((campaignId, amount, bountyPayer, verifiers) => {
        console.log('Bounty paid:', { campaignId, amount, bountyPayer, verifiers });
        if (campaignId === campaign?.campaignId) {
          loadCampaignDetails(); // Refresh current campaign
        }
      });

      onRSVPCreated((campaignId, participant, stakeAmount, timestamp) => {
        console.log('RSVP created:', { campaignId, participant, stakeAmount, timestamp });
        if (campaignId === campaign?.campaignId) {
          loadCampaignDetails(); // Refresh current campaign
        }
      });

      onCampaignCompleted((campaignId, verifiedParticipants, bountyPerParticipant, totalStakesForfeited) => {
        console.log('Campaign completed:', { campaignId, verifiedParticipants, bountyPerParticipant, totalStakesForfeited });
        if (campaignId === campaign?.campaignId) {
          loadCampaignDetails(); // Refresh current campaign
        }
      });

      onBountyDistributed((campaignId, participant, amount) => {
        console.log('Bounty distributed:', { campaignId, participant, amount });
      });

      onStakeReturned((campaignId, participant, amount) => {
        console.log('Stake returned:', { campaignId, participant, amount });
      });

      onStakeForfeited((campaignId, participant, amount) => {
        console.log('Stake forfeited:', { campaignId, participant, amount });
      });
    }

    return () => {
      removeAllListeners();
    };
  }, [isInitialized, campaign?.campaignId]);

  const loadUserCampaigns = async () => {
    if (!currentAccount) return;
    try {
      const campaigns = await getUserCampaigns(currentAccount);
      setUserCampaigns(campaigns);
    } catch (error) {
      console.error('Failed to load user campaigns:', error);
    }
  };

  const loadCampaignDetails = async () => {
    if (!campaignId) return;
    try {
      const details = await getCampaignWithDetails(campaignId);
      setCampaign(details.campaign);
      setRsvps(details.rsvps);
      setStats(details.stats);
    } catch (error) {
      console.error('Failed to load campaign details:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!currentAccount) return;

    try {
      const params: CreateCampaignParams = {
        campaignId,
        creator: currentAccount,
        isFundraiser,
        bountyPayer: isFundraiser ? ethers.ZeroAddress : currentAccount,
        bountyAmount: parseEthAmount(bountyAmount),
        stakingAmount: parseEthAmount(stakingAmount)
      };

      const createdCampaignId = await createCampaign(params);
      console.log('Campaign created with ID:', createdCampaignId);
      
      // Clear form
      setCampaignId('');
      setBountyAmount('');
      setStakingAmount('');
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handlePayBounty = async () => {
    if (!currentAccount) return;

    try {
      const verifierList = verifiers.split(',').map(v => v.trim()).filter(v => v);
      
      const params: PayBountyParams = {
        campaignId,
        verifiers: verifierList,
        value: parseEthAmount(bountyAmount)
      };

      await payBountyToEscrow(params);
      console.log('Bounty paid successfully');
      
      // Clear form
      setBountyAmount('');
      setVerifiers('');
    } catch (error) {
      console.error('Failed to pay bounty:', error);
    }
  };

  const handleRSVP = async () => {
    if (!currentAccount) return;

    try {
      await rsvpToCampaign(campaignId, parseEthAmount(stakeAmount));
      console.log('RSVP successful');
      
      // Clear form
      setStakeAmount('');
    } catch (error) {
      console.error('Failed to RSVP:', error);
    }
  };

  const handleDummyDAO = async () => {
    try {
      await dummyDAO(campaignId);
      console.log('DAO verification completed');
    } catch (error) {
      console.error('Failed to run DAO verification:', error);
    }
  };

  const handleCompleteCampaign = async () => {
    try {
      await completeCampaign(campaignId);
      console.log('Campaign completed successfully');
    } catch (error) {
      console.error('Failed to complete campaign:', error);
    }
  };

  const handleLoadCampaign = async () => {
    try {
      const exists = await doesCampaignExist(campaignId);
      if (!exists) {
        alert('Campaign does not exist');
        return;
      }

      await loadCampaignDetails();
    } catch (error) {
      console.error('Failed to load campaign:', error);
    }
  };

  const estimateGas = async () => {
    if (!currentAccount) return;

    try {
      const estimates: any = {};

      // Estimate create campaign gas
      if (campaignId && bountyAmount && stakingAmount) {
        const createParams: CreateCampaignParams = {
          campaignId,
          creator: currentAccount,
          isFundraiser,
          bountyPayer: isFundraiser ? ethers.ZeroAddress : currentAccount,
          bountyAmount: parseEthAmount(bountyAmount),
          stakingAmount: parseEthAmount(stakingAmount)
        };
        estimates.createCampaign = await estimateCreateCampaignGas(createParams);
      }

      // Estimate pay bounty gas
      if (campaignId && bountyAmount && verifiers) {
        const verifierList = verifiers.split(',').map(v => v.trim()).filter(v => v);
        const payParams: PayBountyParams = {
          campaignId,
          verifiers: verifierList,
          value: parseEthAmount(bountyAmount)
        };
        estimates.payBounty = await estimatePayBountyGas(payParams);
      }

      // Estimate RSVP gas
      if (campaignId && stakeAmount) {
        estimates.rsvp = await estimateRSVPGas(campaignId, parseEthAmount(stakeAmount));
      }

      // Estimate complete campaign gas
      if (campaignId) {
        estimates.completeCampaign = await estimateCompleteCampaignGas(campaignId);
      }

      setGasEstimates(estimates);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Campaign Manager</h2>
        <div className="text-center">
          <button 
            onClick={initialize}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Initialize Contract
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Campaign Manager</h2>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Campaign Manager</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Campaign Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create Campaign</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign ID</label>
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter campaign ID"
              />
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isFundraiser}
                  onChange={(e) => setIsFundraiser(e.target.checked)}
                  className="mr-2"
                />
                Is Fundraiser
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bounty Amount (ETH)</label>
              <input
                type="text"
                value={bountyAmount}
                onChange={(e) => setBountyAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Staking Amount (ETH)</label>
              <input
                type="text"
                value={stakingAmount}
                onChange={(e) => setStakingAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0.001"
              />
            </div>
            
            <button
              onClick={handleCreateCampaign}
              disabled={!campaignId || !bountyAmount || !stakingAmount}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Create Campaign
            </button>
          </div>
        </div>

        {/* Pay Bounty Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Pay Bounty</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign ID</label>
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter campaign ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bounty Amount (ETH)</label>
              <input
                type="text"
                value={bountyAmount}
                onChange={(e) => setBountyAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Verifiers (comma-separated)</label>
              <input
                type="text"
                value={verifiers}
                onChange={(e) => setVerifiers(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0x123..., 0x456..."
              />
            </div>
            
            <button
              onClick={handlePayBounty}
              disabled={!campaignId || !bountyAmount || !verifiers}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Pay Bounty
            </button>
          </div>
        </div>

        {/* RSVP Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">RSVP to Campaign</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign ID</label>
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter campaign ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Stake Amount (ETH)</label>
              <input
                type="text"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="0.001"
              />
            </div>
            
            <button
              onClick={handleRSVP}
              disabled={!campaignId || !stakeAmount}
              className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              RSVP
            </button>
          </div>
        </div>

        {/* Campaign Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Campaign Actions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign ID</label>
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter campaign ID"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleLoadCampaign}
                disabled={!campaignId}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 disabled:bg-gray-400"
              >
                Load Campaign
              </button>
              
              <button
                onClick={handleDummyDAO}
                disabled={!campaignId}
                className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
              >
                Run DAO
              </button>
              
              <button
                onClick={handleCompleteCampaign}
                disabled={!campaignId}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                Complete
              </button>
            </div>
            
            <button
              onClick={estimateGas}
              disabled={!campaignId}
              className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600 disabled:bg-gray-400"
            >
              Estimate Gas
            </button>
          </div>
        </div>
      </div>

      {/* Gas Estimates */}
      {Object.keys(gasEstimates).length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Gas Estimates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gasEstimates.createCampaign && (
              <div className="text-center">
                <div className="text-sm text-gray-600">Create Campaign</div>
                <div className="font-mono">{gasEstimates.createCampaign.toString()}</div>
              </div>
            )}
            {gasEstimates.payBounty && (
              <div className="text-center">
                <div className="text-sm text-gray-600">Pay Bounty</div>
                <div className="font-mono">{gasEstimates.payBounty.toString()}</div>
              </div>
            )}
            {gasEstimates.rsvp && (
              <div className="text-center">
                <div className="text-sm text-gray-600">RSVP</div>
                <div className="font-mono">{gasEstimates.rsvp.toString()}</div>
              </div>
            )}
            {gasEstimates.completeCampaign && (
              <div className="text-center">
                <div className="text-sm text-gray-600">Complete Campaign</div>
                <div className="font-mono">{gasEstimates.completeCampaign.toString()}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campaign Details */}
      {campaign && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Creator</div>
              <div className="font-mono text-sm">{campaign.creator}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div>{getCampaignStatusString(campaign.status)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Is Fundraiser</div>
              <div>{campaign.isFundraiser ? 'Yes' : 'No'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Bounty Amount</div>
              <div>{formatEthAmount(campaign.bountyAmount)} ETH</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Staking Amount</div>
              <div>{formatEthAmount(campaign.stakingAmount)} ETH</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Verifiers</div>
              <div>{campaign.publicAddresses.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Stats */}
      {stats && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Campaign Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Participants</div>
              <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Staked</div>
              <div className="text-2xl font-bold">{formatEthAmount(stats.totalStaked)} ETH</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Bounty Amount</div>
              <div className="text-2xl font-bold">{formatEthAmount(stats.bountyAmount)} ETH</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Status</div>
              <div className="text-2xl font-bold">{getCampaignStatusString(stats.status)}</div>
            </div>
          </div>
        </div>
      )}

      {/* RSVPs */}
      {rsvps.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">RSVPs ({rsvps.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Participant</th>
                  <th className="text-left p-2">Stake Amount</th>
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Verified</th>
                  <th className="text-left p-2">Stake Returned</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((rsvp, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-mono text-xs">{rsvp.participant}</td>
                    <td className="p-2">{formatEthAmount(rsvp.stakeAmount)} ETH</td>
                    <td className="p-2">{new Date(rsvp.rsvpTimestamp * 1000).toLocaleString()}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${rsvp.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {rsvp.verified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${rsvp.stakeReturned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {rsvp.stakeReturned ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Campaigns */}
      {userCampaigns.length > 0 && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Your Campaigns ({userCampaigns.length})</h3>
          <div className="space-y-2">
            {userCampaigns.map((id, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm">{id}</span>
                <button
                  onClick={() => {
                    setCampaignId(id);
                    handleLoadCampaign();
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Current Account</div>
            <div className="font-mono text-sm">{currentAccount || 'Not connected'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Is Owner</div>
            <div>{isOwner ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;
