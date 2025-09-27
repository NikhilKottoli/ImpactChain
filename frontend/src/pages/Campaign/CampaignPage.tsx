import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { WalletConnect } from '../../components/WalletConnect';
import useCampaignContract from '../../hooks/useCampaign';
import { CampaignStatus } from '../../utils/campaignContract';
import type { Campaign, RSVP } from '../../utils/campaignContract';
import CreateCampaignForm from './CreateCampaignForm';

export default function CampaignPage() {
  const navigate = useNavigate();
  const {
    isInitialized,
    isLoading,
    error,
    currentAccount,
    isOwner,
    isWalletConnected,
    getUserCampaignsWithDetails,
    getCampaignWithDetails,
    formatEthAmount,
    getCampaignStatusString,
    initialize
  } = useCampaignContract();

  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<{
    campaign: Campaign;
    rsvps: RSVP[];
    stats: any;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage'>('overview');

  // Load user campaigns on mount
  useEffect(() => {
    if (currentAccount && isInitialized) {
      loadUserCampaigns();
    }
  }, [currentAccount, isInitialized]);

  const loadUserCampaigns = async () => {
    if (!currentAccount) return;
    try {
      const campaigns = await getUserCampaignsWithDetails(currentAccount);
      setUserCampaigns(campaigns);
    } catch (error) {
      console.error('Failed to load user campaigns:', error);
    }
  };

  const handleCampaignSelect = async (campaignId: string) => {
    try {
      const details = await getCampaignWithDetails(campaignId);
      setSelectedCampaign(details);
    } catch (error) {
      console.error('Failed to load campaign details:', error);
    }
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.CREATED:
        return 'bg-yellow-100 text-yellow-800';
      case CampaignStatus.BOUNTY_PAID:
        return 'bg-blue-100 text-blue-800';
      case CampaignStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Campaign Management
            </h1>
            <p className="text-gray-600 mb-8">
              Connect your wallet to start managing campaigns
            </p>
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Wallet Required</h2>
                <p className="text-gray-600">
                  Please connect your MetaMask wallet to access campaign features.
                </p>
              </div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Initializing campaign contract...</p>
            <button
              onClick={initialize}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Retry Initialization
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Campaign Management
          </h1>
          <p className="text-gray-600 mb-6">
            Create and manage decentralized campaigns with bounty rewards
          </p>
          
          {/* Wallet Connection */}
          <div className="flex justify-center mb-6">
            <WalletConnect />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
            Error: {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Create Campaign
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('manage')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'manage'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Manage
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto">
            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Connected Account:</span>
                  <p className="font-mono text-sm break-all">{currentAccount || 'Not connected'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Contract Owner:</span>
                  <p className="font-mono text-sm">{isOwner ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* User Campaigns */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Your Campaigns ({userCampaigns.length})</h2>
              
              {userCampaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created any campaigns yet.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Create Your First Campaign
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCampaigns.map((campaign, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCampaignSelect(`campaign-${index}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-sm">Campaign #{index + 1}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                          {getCampaignStatusString(campaign.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Bounty: {formatEthAmount(campaign.bountyAmount)} ETH</p>
                        <p>Stake: {formatEthAmount(campaign.stakingAmount)} ETH</p>
                        <p>Type: {campaign.isFundraiser ? 'Fundraiser' : 'Bounty'}</p>
                        <p>Verifiers: {campaign.publicAddresses.length}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Campaign Details */}
            {selectedCampaign && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Campaign Info</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Creator:</span> {selectedCampaign.campaign.creator}</p>
                      <p><span className="text-gray-600">Status:</span> {getCampaignStatusString(selectedCampaign.campaign.status)}</p>
                      <p><span className="text-gray-600">Type:</span> {selectedCampaign.campaign.isFundraiser ? 'Fundraiser' : 'Bounty'}</p>
                      <p><span className="text-gray-600">Bounty Amount:</span> {formatEthAmount(selectedCampaign.campaign.bountyAmount)} ETH</p>
                      <p><span className="text-gray-600">Staking Amount:</span> {formatEthAmount(selectedCampaign.campaign.stakingAmount)} ETH</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Total Participants:</span> {selectedCampaign.stats.totalParticipants}</p>
                      <p><span className="text-gray-600">Total Staked:</span> {formatEthAmount(selectedCampaign.stats.totalStaked)} ETH</p>
                      <p><span className="text-gray-600">Verifiers:</span> {selectedCampaign.campaign.publicAddresses.length}</p>
                    </div>
                  </div>
                </div>
                
                {/* RSVPs */}
                {selectedCampaign.rsvps.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Participants ({selectedCampaign.rsvps.length})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Participant</th>
                            <th className="text-left p-2">Stake</th>
                            <th className="text-left p-2">Verified</th>
                            <th className="text-left p-2">Stake Returned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCampaign.rsvps.map((rsvp, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-mono text-xs">{rsvp.participant}</td>
                              <td className="p-2">{formatEthAmount(rsvp.stakeAmount)} ETH</td>
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
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto">
            <CreateCampaignForm onCampaignCreated={loadUserCampaigns} />
          </div>
        )}

        {activeTab === 'manage' && isOwner && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Contract Management</h2>
              <p className="text-gray-600 mb-4">Contract owner functions will be available here.</p>
              <div className="space-y-4">
                <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                  Emergency Withdraw
                </button>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  Set Paymaster
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
