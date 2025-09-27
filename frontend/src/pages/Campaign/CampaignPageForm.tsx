import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Input from '@/components/Input';
import { WalletConnect } from '@/components/WalletConnect';
import { walletConnection } from '@/utils/wallet';
import { createCampaign, type CreateCampaignParams, CAMPAIGN_CONTRACT_CONFIG } from '@/utils/campaignContract';
import { ethers } from 'ethers';

interface CampaignFormData {
  isFundraiser: boolean;
  bountyAmount: string;
  stakingAmount: string;
  bountyPayer: string;
}

export default function CampaignPageForm() {
  const [formData, setFormData] = useState<CampaignFormData>({
    isFundraiser: false,
    bountyAmount: '',
    stakingAmount: '',
    bountyPayer: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check wallet connection status
  React.useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await walletConnection.isConnected();
      setIsConnected(connected);
    } catch (err) {
      setIsConnected(false);
    }
  };

  const handleInputChange = (field: keyof CampaignFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.bountyAmount || parseFloat(formData.bountyAmount) <= 0) {
      return 'Bounty amount must be greater than 0';
    }

    if (!formData.stakingAmount || parseFloat(formData.stakingAmount) <= 0) {
      return 'Staking amount must be greater than 0';
    }

    const minBounty = ethers.formatEther(CAMPAIGN_CONTRACT_CONFIG.minBountyAmount);
    const minStake = ethers.formatEther(CAMPAIGN_CONTRACT_CONFIG.minStakeAmount);

    if (parseFloat(formData.bountyAmount) < parseFloat(minBounty)) {
      return `Bounty amount must be at least ${minBounty} ETH`;
    }

    if (parseFloat(formData.stakingAmount) < parseFloat(minStake)) {
      return `Staking amount must be at least ${minStake} ETH`;
    }

    if (!formData.isFundraiser && (!formData.bountyPayer || !ethers.isAddress(formData.bountyPayer))) {
      return 'Valid bounty payer address is required for non-fundraiser campaigns';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const currentAccount = await walletConnection.getCurrentAccount();
      
      const params: CreateCampaignParams = {
        isFundraiser: formData.isFundraiser,
        bountyAmount: formData.bountyAmount,
        stakingAmount: formData.stakingAmount,
        bountyPayer: formData.isFundraiser ? currentAccount! : formData.bountyPayer
      };

      const result = await createCampaign(params);
      
      setSuccess(`Campaign created successfully! Campaign ID: ${result.campaignId}`);
      
      // Reset form
      setFormData({
        isFundraiser: false,
        bountyAmount: '',
        stakingAmount: '',
        bountyPayer: ''
      });

    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Campaign</h2>
        <p className="text-gray-400">Set up a new campaign with bounty and staking requirements</p>
      </div>

      {/* Wallet Connection */}
      <div className="mb-6">
        <WalletConnect />
      </div>

      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-300 text-sm">Please connect your wallet to create a campaign</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Type */}
        <div>
          <label className="block text-white font-medium mb-3">Campaign Type</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="campaignType"
                checked={formData.isFundraiser}
                onChange={() => handleInputChange('isFundraiser', true)}
                className="mr-2 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-white">Fundraiser</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="campaignType"
                checked={!formData.isFundraiser}
                onChange={() => handleInputChange('isFundraiser', false)}
                className="mr-2 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-white">Sponsored</span>
            </label>
          </div>
        </div>

        {/* Bounty Amount */}
        <div>
          <label htmlFor="bountyAmount" className="block text-white font-medium mb-2">
            Bounty Amount (ETH)
          </label>
          <Input
            id="bountyAmount"
            type="number"
            step="0.0001"
            placeholder={`Min: ${ethers.formatEther(CAMPAIGN_CONTRACT_CONFIG.minBountyAmount)} ETH`}
            value={formData.bountyAmount}
            onChange={(e) => handleInputChange('bountyAmount', e.target.value)}
            disabled={!isConnected}
          />
        </div>

        {/* Staking Amount */}
        <div>
          <label htmlFor="stakingAmount" className="block text-white font-medium mb-2">
            Staking Amount (ETH)
          </label>
          <Input
            id="stakingAmount"
            type="number"
            step="0.00001"
            placeholder={`Min: ${ethers.formatEther(CAMPAIGN_CONTRACT_CONFIG.minStakeAmount)} ETH`}
            value={formData.stakingAmount}
            onChange={(e) => handleInputChange('stakingAmount', e.target.value)}
            disabled={!isConnected}
          />
        </div>

        {/* Bounty Payer (only for non-fundraiser campaigns) */}
        {!formData.isFundraiser && (
          <div>
            <label htmlFor="bountyPayer" className="block text-white font-medium mb-2">
              Bounty Payer Address
            </label>
            <Input
              id="bountyPayer"
              type="text"
              placeholder="0x..."
              value={formData.bountyPayer}
              onChange={(e) => handleInputChange('bountyPayer', e.target.value)}
              disabled={!isConnected}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isConnected || isLoading}
          className="w-full py-4 rounded-xl font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Campaign...
            </div>
          ) : (
            'Create Campaign'
          )}
        </Button>
      </form>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h4 className="text-blue-300 font-medium mb-2">Campaign Types:</h4>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• <strong>Fundraiser:</strong> You pay the bounty from your own funds</li>
          <li>• <strong>Sponsored:</strong> Another address pays the bounty</li>
        </ul>
      </div>
    </div>
  );
}
