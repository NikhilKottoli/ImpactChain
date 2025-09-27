import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Input from '@/components/Input';
import { WalletConnect } from '@/components/WalletConnect';
import { walletConnection } from '@/utils/wallet';
import { createCampaign, type CreateCampaignParams, CAMPAIGN_CONTRACT_CONFIG } from '@/utils/campaignContract';
import { ethers } from 'ethers';
import { useLighthouseUpload } from '../../hooks/useLighthouse';

interface Web3FormData {
  isFundraiser: boolean;
  bountyAmount: string;
  stakingAmount: string;
  bountyPayer: string;
}
interface Web2FormData {
  title: string;
  description: string;
  location_name: string;
  category: string;
  event_date: string;
  max_participants: string;
  imageFile: File | null; 
}

// Combined interface for component state
interface CampaignFormData extends Web3FormData, Web2FormData {}

export default function CampaignPageForm() {

  const { 
    isUploading, 
    uploadProgress, 
    error: uploadError, 
    uploadCompletePost,
    reset 
  } = useLighthouseUpload();

  const [formData, setFormData] = useState<CampaignFormData>({
    isFundraiser: false,
    bountyAmount: '',
    stakingAmount: '',
    bountyPayer: '',
    // Web2 fields
    title: '',
    description: '',
    location_name: '',
    category: '',
    event_date: '',
    max_participants: '0',
    imageFile: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadedHashes, setUploadedHashes] = useState<{ imageHash: string, metadataHash: string } | null>(null);

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

  const handleInputChange = (field: keyof CampaignFormData, value: string | boolean | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      setUploadedHashes(null);
      setError(null);
    }
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
    let metadataHash: string | undefined;

    try {
      const currentAccount = await walletConnection.getCurrentAccount();
      
      const uploadResult = await uploadCompletePost(
        formData.imageFile,
        formData.title,
        formData.description,
        [
          { trait_type: 'Type', value: 'Social Media Post' },
          { trait_type: 'Platform', value: 'Social Impact Platform' },
          { trait_type: 'Storage', value: 'Lighthouse' },
          { trait_type: 'Created', value: new Date().toISOString() }
        ],
        (imgH, metaH) => {
          setUploadedHashes({ imageHash: imgH, metadataHash: metaH });
        }
      );

      if (!uploadResult?.success || !uploadResult.metadataHash) {
        throw new Error(uploadResult?.error || 'Failed to upload to IPFS');
      }
      
      metadataHash = uploadResult.metadataHash;
      const web3Params: CreateCampaignParams = {
        isFundraiser: formData.isFundraiser,
        bountyAmount: formData.bountyAmount,
        stakingAmount: formData.stakingAmount,
        bountyPayer: formData.isFundraiser ? currentAccount! : formData.bountyPayer
      };

      const web3Result = await createCampaign(web3Params);
      const postData = {
        id: web3Result.campaignId,
        creator_id: currentAccount,
        title: formData.title.trim(),
        description: formData.description.trim(),
        bounty_paid: false,
        bounty_paid_by: web3Params.bountyPayer,
        location_name: formData.location_name.trim(),
        category: formData.category.trim(),
        event_date: formData.event_date,
        deadline_crossed: false,
        max_participants: parseInt(formData.max_participants),
        no_of_participants: 0,
        bounty_amount: ethers.parseEther(formData.bountyAmount).toString(),
        paymaster_id: web3Params.bountyPayer,
        campaign_status: 'ACTIVE',
        ipfs_hash: metadataHash, // IPFS hash from Step 1
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:3000/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dbResult = await response.json();
      console.log('Database post successful:', dbResult);

      setSuccess(`Campaign created successfully! Campaign ID: ${web3Result.campaignId} (DB record created)`);

      // Reset form
      setFormData({
        isFundraiser: false,
        bountyAmount: '',
        stakingAmount: '',
        bountyPayer: '',
        title: '',
        description: '',
        location_name: '',
        category: '',
        event_date: '',
        max_participants: '0',
        imageFile: null,
      });
      setUploadedHashes(null);

    } catch (err) {
      console.error('Error creating campaign or posting to DB:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign or post to database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-black backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Campaign</h2>
        <p className="text-gray-400">Define your campaign details and set the web3 parameters.</p>
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
        <h3 className="text-xl text-white pt-4">Campaign Details (Web2)</h3>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-white font-medium mb-2">
            Campaign Title
          </label>
          <Input
            id="title"
            type="text"
            placeholder="e.g., Beach Cleanup in Bali"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={!isConnected}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-white font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full bg-white/5 border border-white/20 text-white p-3 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-colors"
            placeholder="A detailed description of the campaign..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={!isConnected}
          />
        </div>
        
        {/* Image File Input */}
        <div>
            <label htmlFor="imageFile" className="block text-white font-medium mb-2">
                Campaign Image (Max 50MB)
            </label>
            <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={!isConnected}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
            />
            {formData.imageFile && (
                <p className="text-sm text-gray-400 mt-2">Selected: {formData.imageFile.name}</p>
            )}
        </div>

        {/* Location Name */}
        <div>
          <label htmlFor="location_name" className="block text-white font-medium mb-2">
            Location Name
          </label>
          <Input
            id="location_name"
            type="text"
            placeholder="e.g., Kuta Beach, Bali"
            value={formData.location_name}
            onChange={(e) => handleInputChange('location_name', e.target.value)}
            disabled={!isConnected}
          />
        </div>

        <div className="flex gap-4">
            {/* Category */}
            <div className="flex-1">
            <label htmlFor="category" className="block text-white font-medium mb-2">
                Category
            </label>
            <Input
                id="category"
                type="text"
                placeholder="e.g., Environmental"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={!isConnected}
            />
            </div>

            {/* Max Participants */}
            <div className="flex-1">
            <label htmlFor="max_participants" className="block text-white font-medium mb-2">
                Max Participants
            </label>
            <Input
                id="max_participants"
                type="number"
                placeholder="e.g., 50"
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', e.target.value)}
                disabled={!isConnected}
            />
            </div>
        </div>

        {/* Event Date */}
        <div>
          <label htmlFor="event_date" className="block text-white font-medium mb-2">
            Event Date
          </label>
          <Input
            id="event_date"
            type="date"
            value={formData.event_date}
            onChange={(e) => handleInputChange('event_date', e.target.value)}
            disabled={!isConnected}
          />
        </div>
        
        <hr className="border-t border-white/10" />

        {/* ========================================================= */}
        {/* START: WEB3 / CONTRACT FIELDS */}
        {/* ========================================================= */}
        <h3 className="text-xl text-white pt-4">Contract Parameters (Web3)</h3>

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
        
        {/* ========================================================= */}
        {/* END: WEB3 / CONTRACT FIELDS */}
        {/* ========================================================= */}


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
            {uploadedHashes && (
                <p className="text-xs text-green-300/80 mt-1">IPFS Metadata Hash: {uploadedHashes.metadataHash}</p>
            )}
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
      
      <hr className="border-t border-white/10 mt-6" />

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