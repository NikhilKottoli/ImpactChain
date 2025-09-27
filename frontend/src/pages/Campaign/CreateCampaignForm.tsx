import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useLighthouseUpload } from '../../hooks/useLighthouse';
import { lighthouseUtils } from '../../utils/lighthouse';
import useCampaignContract from '../../hooks/useCampaign';
import { CampaignStatus } from '../../utils/campaignContract';
import type { CreateCampaignParams } from '../../utils/campaignContract';

interface CreateCampaignFormProps {
  onCampaignCreated?: () => void;
}

function CreateCampaignForm({ onCampaignCreated }: CreateCampaignFormProps) {
  const {
    currentAccount,
    isWalletConnected,
    createCampaign,
    isLoading,
    error,
    formatEthAmount,
    parseEthAmount,
    estimateCreateCampaignGas,
    initialize
  } = useCampaignContract();

  const { isUploading, uploadImage, uploadJSON } = useLighthouseUpload();

  const [formData, setFormData] = useState({
    campaignId: '',
    title: '',
    description: '',
    isFundraiser: false,
    bountyAmount: '',
    stakingAmount: '',
    verifiers: '',
    imageFile: null as File | null
  });

  const [uploadedHashes, setUploadedHashes] = useState<{
    imageHash?: string;
    metadataHash?: string;
  }>({});

  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (50MB max for Lighthouse)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };

  const handleImageUpload = async () => {
    if (!formData.imageFile) return;

    try {
      const result = await uploadImage(formData.imageFile);
      if (result?.success && result.ipfsHash) {
        setUploadedHashes(prev => ({ ...prev, imageHash: result.ipfsHash }));
        return result.ipfsHash;
      } else {
        throw new Error(result?.error || 'Image upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleMetadataUpload = async (imageHash: string) => {
    const metadata = {
      title: formData.title,
      description: formData.description,
      image: `ipfs://${imageHash}`,
      campaignId: formData.campaignId,
      isFundraiser: formData.isFundraiser,
      bountyAmount: formData.bountyAmount,
      stakingAmount: formData.stakingAmount,
      verifiers: formData.verifiers.split(',').map(v => v.trim()).filter(v => v),
      createdAt: new Date().toISOString()
    };

    try {
      const result = await uploadJSON(metadata, `${formData.campaignId}_metadata.json`);
      if (result?.success && result.ipfsHash) {
        setUploadedHashes(prev => ({ ...prev, metadataHash: result.ipfsHash }));
        return result.ipfsHash;
      } else {
        throw new Error(result?.error || 'Metadata upload failed');
      }
    } catch (error) {
      console.error('Metadata upload error:', error);
      throw error;
    }
  };

  const estimateGas = async () => {
    if (!currentAccount || !formData.campaignId || !formData.bountyAmount || !formData.stakingAmount) {
      return;
    }

    try {
      const params: CreateCampaignParams = {
        campaignId: formData.campaignId,
        creator: currentAccount,
        isFundraiser: formData.isFundraiser,
        bountyPayer: formData.isFundraiser ? ethers.ZeroAddress : currentAccount,
        bountyAmount: parseEthAmount(formData.bountyAmount),
        stakingAmount: parseEthAmount(formData.stakingAmount)
      };

      const estimate = await estimateCreateCampaignGas(params);
      setGasEstimate(estimate);
    } catch (error) {
      console.error('Gas estimation failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAccount) {
      alert('Please connect your wallet first');
      return;
    }

    if (!formData.campaignId || !formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.bountyAmount || !formData.stakingAmount) {
      alert('Please specify bounty and staking amounts');
      return;
    }

    setIsCreating(true);
    setSuccess(null);

    try {
      let imageHash = uploadedHashes.imageHash;
      let metadataHash = uploadedHashes.metadataHash;

      // Upload image if not already uploaded
      if (formData.imageFile && !imageHash) {
        imageHash = await handleImageUpload();
      }

      // Upload metadata if not already uploaded
      if (imageHash && !metadataHash) {
        metadataHash = await handleMetadataUpload(imageHash);
      }

      // Create campaign parameters
      const params: CreateCampaignParams = {
        campaignId: formData.campaignId,
        creator: currentAccount,
        isFundraiser: formData.isFundraiser,
        bountyPayer: formData.isFundraiser ? ethers.ZeroAddress : currentAccount,
        bountyAmount: parseEthAmount(formData.bountyAmount),
        stakingAmount: parseEthAmount(formData.stakingAmount)
      };

      // Create campaign
      const campaignId = await createCampaign(params);
      
      setSuccess(`Campaign created successfully! Campaign ID: ${campaignId}`);
      
      // Reset form
      setFormData({
        campaignId: '',
        title: '',
        description: '',
        isFundraiser: false,
        bountyAmount: '',
        stakingAmount: '',
        verifiers: '',
        imageFile: null
      });
      setUploadedHashes({});
      setGasEstimate(null);

      // Notify parent component
      onCampaignCreated?.();

    } catch (error) {
      console.error('Campaign creation failed:', error);
      alert(`Campaign creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.campaignId && formData.title && formData.description && 
                     formData.bountyAmount && formData.stakingAmount;

  if (!isWalletConnected) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Create New Campaign</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Wallet Required</h3>
          <p className="text-gray-600 mb-6">
            Please connect your MetaMask wallet to create campaigns.
          </p>
          <button
            onClick={initialize}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Create New Campaign</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign ID *
          </label>
          <input
            type="text"
            name="campaignId"
            value={formData.campaignId}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., beach-cleanup-2024"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Unique identifier for your campaign (letters, numbers, hyphens only)
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Beach Cleanup Drive"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your campaign goals, activities, and impact..."
            required
          />
        </div>

        {/* Campaign Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {formData.imageFile && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Selected: {formData.imageFile.name} ({(formData.imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              {uploadedHashes.imageHash && (
                <p className="text-sm text-green-600">
                  ✓ Image uploaded to IPFS: {uploadedHashes.imageHash}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Campaign Type */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isFundraiser"
              checked={formData.isFundraiser}
              onChange={handleInputChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              This is a fundraising campaign (bounty will be paid by external donors)
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Check this if you're raising funds for a cause. Uncheck for bounty campaigns where you pay participants.
          </p>
        </div>

        {/* Bounty Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bounty Amount (ETH) *
          </label>
          <input
            type="number"
            name="bountyAmount"
            value={formData.bountyAmount}
            onChange={handleInputChange}
            step="0.001"
            min="0.001"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum: 0.1 ETH. Total reward pool for participants.
          </p>
        </div>

        {/* Staking Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staking Amount (ETH) *
          </label>
          <input
            type="number"
            name="stakingAmount"
            value={formData.stakingAmount}
            onChange={handleInputChange}
            step="0.001"
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.001"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum: 0.001 ETH. Amount participants must stake to join.
          </p>
        </div>

        {/* Verifiers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verifier Addresses (comma-separated)
          </label>
          <textarea
            name="verifiers"
            value={formData.verifiers}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0x123..., 0x456..., 0x789..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Addresses that can verify participant completion (optional for now)
          </p>
        </div>

        {/* Gas Estimate */}
        {gasEstimate && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Gas Estimate</h3>
            <p className="text-sm text-blue-600">
              Estimated gas: {gasEstimate.toString()} units
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={estimateGas}
            disabled={!isFormValid || isLoading}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            Estimate Gas
          </button>
          
          <button
            type="submit"
            disabled={!isFormValid || isCreating || isLoading}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {isCreating ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </div>

        {/* Status Messages */}
        {isUploading && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">Uploading files to IPFS...</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
      </form>

      {/* Uploaded Content Preview */}
      {(uploadedHashes.imageHash || uploadedHashes.metadataHash) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Uploaded Content</h3>
          <div className="space-y-2 text-sm">
            {uploadedHashes.imageHash && (
              <p>
                <span className="font-medium">Image:</span> 
                <a 
                  href={lighthouseUtils.getImageUrl(uploadedHashes.imageHash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  View Image
                </a>
                <span className="text-gray-500 ml-2">({uploadedHashes.imageHash})</span>
              </p>
            )}
            {uploadedHashes.metadataHash && (
              <p>
                <span className="font-medium">Metadata:</span> 
                <a 
                  href={lighthouseUtils.getImageUrl(uploadedHashes.metadataHash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  View Metadata
                </a>
                <span className="text-gray-500 ml-2">({uploadedHashes.metadataHash})</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCampaignForm;
