import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Input from "@/components/Input";
import { WalletConnect } from "@/components/WalletConnect";
import { walletConnection } from "@/utils/wallet";
import {
  createCampaign,
  type CreateCampaignParams,
  CAMPAIGN_CONTRACT_CONFIG,
} from "@/utils/campaignContract";
import { ethers } from "ethers";
import { useLighthouseUpload } from "../../hooks/useLighthouse";

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
  const navigate = useNavigate();
  const {
    isUploading,
    uploadProgress,
    error: uploadError,
    uploadCompletePost,
    reset,
  } = useLighthouseUpload();

  const [formData, setFormData] = useState<CampaignFormData>({
    isFundraiser: false,
    bountyAmount: "",
    stakingAmount: "",
    bountyPayer: "",
    // Web2 fields
    title: "",
    description: "",
    location_name: "",
    category: "",
    event_date: "",
    max_participants: "0",
    imageFile: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [uploadedHashes, setUploadedHashes] = useState<{
    imageHash: string;
    metadataHash: string;
  } | null>(null);

  let imageHash: string | undefined;
  let metadataHash: string | undefined;

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

  const handleInputChange = (
    field: keyof CampaignFormData,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));
      setUploadedHashes(null);
      setError(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.bountyAmount || parseFloat(formData.bountyAmount) <= 0) {
      return "Bounty amount must be greater than 0";
    }

    if (!formData.stakingAmount || parseFloat(formData.stakingAmount) <= 0) {
      return "Staking amount must be greater than 0";
    }

    const minBounty = ethers.formatEther(
      CAMPAIGN_CONTRACT_CONFIG.minBountyAmount
    );
    const minStake = ethers.formatEther(
      CAMPAIGN_CONTRACT_CONFIG.minStakeAmount
    );

    if (parseFloat(formData.bountyAmount) < parseFloat(minBounty)) {
      return `Bounty amount must be at least ${minBounty} ETH`;
    }

    if (parseFloat(formData.stakingAmount) < parseFloat(minStake)) {
      return `Staking amount must be at least ${minStake} ETH`;
    }

    if (
      !formData.isFundraiser &&
      (!formData.bountyPayer || !ethers.isAddress(formData.bountyPayer))
    ) {
      return "Valid bounty payer address is required for non-fundraiser campaigns";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError("Please connect your wallet first");
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
          { trait_type: "Type", value: "Social Media Post" },
          { trait_type: "Platform", value: "Social Impact Platform" },
          { trait_type: "Storage", value: "Lighthouse" },
          { trait_type: "Created", value: new Date().toISOString() },
        ],
        (imgH, metaH) => {
          imageHash = imgH;
          metadataHash = metaH;
          setUploadedHashes({ imageHash: imgH, metadataHash: metaH });
        }
      );

      if (!uploadResult?.success || !uploadResult.metadataHash) {
        throw new Error(uploadResult?.error || "Failed to upload to IPFS");
      }

      metadataHash = uploadResult.metadataHash;
      const web3Params: CreateCampaignParams = {
        isFundraiser: formData.isFundraiser,
        bountyAmount: formData.bountyAmount,
        stakingAmount: formData.stakingAmount,
        bountyPayer: formData.isFundraiser
          ? currentAccount!
          : formData.bountyPayer,
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
        campaign_status: "ACTIVE",
        ipfs_hash: imageHash,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await fetch("http://localhost:3000/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dbResult = await response.json();
      console.log("Database post successful:", dbResult);

      setSuccess(
        `Campaign created successfully! Campaign ID: ${web3Result.campaignId} (DB record created)`
      );

      // Reset form
      setFormData({
        isFundraiser: false,
        bountyAmount: "",
        stakingAmount: "",
        bountyPayer: "",
        title: "",
        description: "",
        location_name: "",
        category: "",
        event_date: "",
        max_participants: "0",
        imageFile: null,
      });
      setUploadedHashes(null);
    } catch (err) {
      console.error("Error creating campaign or posting to DB:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create campaign or post to database"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col md:flex-row px-4 md:px-32 ">
      {/* Left Column - fixed on desktop, top on mobile */}
      <div className="w-full md:w-1/3 md:fixed md:top-40 md:left-0 md:h-[calc(100vh-5rem)] md:overflow-y-auto p-4 md:p-8 md:ml-0">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/campaign")}
            className="mb-4 text-primary hover:text-primary/80"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Campaigns
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Create New Campaign
          </h1>
          <p className="text-muted-foreground">
            Launch a social impact campaign with blockchain rewards
          </p>

          <div className="mb-4 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <h3 className="text-sm font-medium text-accent-foreground mb-2">
              How Campaign Creation Works
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <strong>Smart Contract Deployment:</strong> Your campaign
                creates an on-chain contract
              </li>
              <li>
                <strong>Bounty Pool:</strong> Set reward amounts for
                participants
              </li>
              <li>
                <strong>Staking Mechanism:</strong> Participants stake to join
                campaigns
              </li>
              <li>
                <strong>IPFS Storage:</strong> Campaign data stored on
                decentralized network
              </li>
              <li>
                <strong>Automated Payouts:</strong> Smart contracts handle
                rewards distribution
              </li>
              <li>
                <strong>Community Driven:</strong> Transparent tracking and
                validation
              </li>
            </ul>
          </div>

          {/* Campaign Types Info */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="text-primary font-medium mb-2">Campaign Types:</h4>
            <ul className="text-primary/80 text-sm space-y-1">
              <li>
                • <strong>Fundraiser:</strong> You pay the bounty from your own
                funds
              </li>
              <li>
                • <strong>Sponsored:</strong> Another address pays the bounty
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Column - scrollable, full width on mobile */}
      <div className="relative w-full md:w-1/2 md:ml-[50%] min-h-screen overflow-y-auto mt-6 md:mt-0 ">
        <div className="p-4 pl-0 md:p-8">
          {/* Wallet Connection Check */}
          {!isConnected ? (
            <div className="max-w-md mx-auto text-center py-8 md:py-12 pl-0">
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You need to connect your Web3 wallet to create campaigns on
                  the blockchain
                </p>
                <WalletConnect />
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-semibold text-card-foreground pt-4">
                  Campaign Details
                </h3>

                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-card-foreground font-medium mb-2"
                  >
                    Campaign Title
                  </label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Beach Cleanup in Bali"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={!isConnected}
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-card-foreground font-medium mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400"
                    placeholder="A detailed description of the campaign..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    disabled={!isConnected}
                  />
                </div>

                {/* Image File Input */}
                <div>
                  <label
                    htmlFor="imageFile"
                    className="block text-card-foreground font-medium mb-2"
                  >
                    Campaign Image (Max 50MB)
                  </label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!isConnected}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {formData.imageFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {formData.imageFile.name}
                    </p>
                  )}
                </div>

                {/* Location Name */}
                <div>
                  <label
                    htmlFor="location_name"
                    className="block text-card-foreground font-medium mb-2"
                  >
                    Location Name
                  </label>
                  <Input
                    id="location_name"
                    type="text"
                    placeholder="e.g., Kuta Beach, Bali"
                    value={formData.location_name}
                    onChange={(e) =>
                      handleInputChange("location_name", e.target.value)
                    }
                    disabled={!isConnected}
                  />
                </div>

                <div className="flex gap-4">
                  {/* Category */}
                  <div className="flex-1">
                    <label
                      htmlFor="category"
                      className="block text-card-foreground font-medium mb-2"
                    >
                      Category
                    </label>
                    <Input
                      id="category"
                      type="text"
                      placeholder="e.g., Environmental"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      disabled={!isConnected}
                    />
                  </div>

                  {/* Max Participants */}
                  <div className="flex-1">
                    <label
                      htmlFor="max_participants"
                      className="block text-card-foreground font-medium mb-2"
                    >
                      Max Participants
                    </label>
                    <Input
                      id="max_participants"
                      type="number"
                      placeholder="e.g., 50"
                      value={formData.max_participants}
                      onChange={(e) =>
                        handleInputChange("max_participants", e.target.value)
                      }
                      disabled={!isConnected}
                    />
                  </div>
                </div>

                {/* Event Date */}
                <div>
                  <label
                    htmlFor="event_date"
                    className="block text-card-foreground font-medium mb-2"
                  >
                    Event Date
                  </label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      handleInputChange("event_date", e.target.value)
                    }
                    disabled={!isConnected}
                  />
                </div>

                <hr className="border-t border-border" />

                {/* Web3 Contract Parameters */}
                <h3 className="text-xl font-semibold text-card-foreground pt-4">
                  Contract Parameters
                </h3>

                {/* Campaign Type */}
                <div>
                  <label className="block text-card-foreground font-medium mb-3">
                    Campaign Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="campaignType"
                        checked={formData.isFundraiser}
                        onChange={() => handleInputChange("isFundraiser", true)}
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      <span className="text-card-foreground">Fundraiser</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="campaignType"
                        checked={!formData.isFundraiser}
                        onChange={() =>
                          handleInputChange("isFundraiser", false)
                        }
                        className="mr-2 text-primary focus:ring-primary"
                      />
                      <span className="text-card-foreground">Sponsored</span>
                    </label>
                  </div>
                </div>

                {/* Bounty Amount */}
                <div>
                  <label
                    htmlFor="bountyAmount"
                    className="block text-card-foreground font-medium mb-2"
                  >
                    Bounty Amount (ETH)
                  </label>
                  <Input
                    id="bountyAmount"
                    type="number"
                    step="0.0001"
                    placeholder={`Min: ${ethers.formatEther(
                      CAMPAIGN_CONTRACT_CONFIG.minBountyAmount
                    )} ETH`}
                    value={formData.bountyAmount}
                    onChange={(e) =>
                      handleInputChange("bountyAmount", e.target.value)
                    }
                    disabled={!isConnected}
                  />
                </div>

                {/* Staking Amount */}
                <div>
                  <label
                    htmlFor="stakingAmount"
                    className="block text-card-foreground font-medium mb-2"
                  >
                    Staking Amount (ETH)
                  </label>
                  <Input
                    id="stakingAmount"
                    type="number"
                    step="0.00001"
                    placeholder={`Min: ${ethers.formatEther(
                      CAMPAIGN_CONTRACT_CONFIG.minStakeAmount
                    )} ETH`}
                    value={formData.stakingAmount}
                    onChange={(e) =>
                      handleInputChange("stakingAmount", e.target.value)
                    }
                    disabled={!isConnected}
                  />
                </div>

                {/* Bounty Payer (only for non-fundraiser campaigns) */}
                {!formData.isFundraiser && (
                  <div>
                    <label
                      htmlFor="bountyPayer"
                      className="block text-card-foreground font-medium mb-2"
                    >
                      Bounty Payer Address
                    </label>
                    <Input
                      id="bountyPayer"
                      type="text"
                      placeholder="0x..."
                      value={formData.bountyPayer}
                      onChange={(e) =>
                        handleInputChange("bountyPayer", e.target.value)
                      }
                      disabled={!isConnected}
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-green-600 text-sm">{success}</p>
                    {uploadedHashes && (
                      <p className="text-xs text-green-600/80 mt-1">
                        IPFS Metadata Hash: {uploadedHashes.metadataHash}
                      </p>
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
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                      Creating Campaign...
                    </div>
                  ) : (
                    "Create Campaign"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      <img
        src="/campaign.png"
        alt=""
        className="w-full md:w-[50%] object-contain md:fixed -bottom-[0px] left-0 hidden md:block grayscale"
      />
    </div>
  );
}
