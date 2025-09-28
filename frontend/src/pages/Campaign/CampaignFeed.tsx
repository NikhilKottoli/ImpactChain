import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from "@/components/Input";
import { WalletConnect } from "@/components/WalletConnect";
import { EnsProfile } from "@/components/EnsProfile";
import { ChevronLeft, Lock, Users, Vote, Award } from "lucide-react";
import { walletConnection } from "@/utils/wallet";
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
  type RSVPParams,
} from "@/utils/campaignContract";
import {
  createDAO,
  addUser,
  type CreateDAOParams,
  type AddUserParams,
} from "@/utils/daoContract";
import { ethers } from "ethers";
import { toast } from "react-toastify";

export default function CampaignFeed() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<(Campaign & { id: string }) | null>(
    null
  );
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  // Bounty payment state
  const [bountyAmount, setBountyAmount] = useState("0.1");
  const [verifiers, setVerifiers] = useState<string>("");
  const [isPayingBounty, setIsPayingBounty] = useState(false);
  const [bountyError, setBountyError] = useState<string | null>(null);
  const [bountySuccess, setBountySuccess] = useState<string | null>(null);

  // DAO creation state
  const [isCreatingDAO, setIsCreatingDAO] = useState(false);
  const [daoError, setDAOError] = useState<string | null>(null);
  const [daoSuccess, setDAOSuccess] = useState<string | null>(null);

  // RSVP state
  const [stakeAmount, setStakeAmount] = useState("0.01");
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
  const [completionSuccess, setCompletionSuccess] = useState<string | null>(
    null
  );

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
      setCampaignError("No campaign ID provided");
      setIsLoadingCampaign(false);
      return;
    }

    setIsLoadingCampaign(true);
    setCampaignError(null);

    try {
      const campaignData = await getCampaign(uuid);
      setCampaign({
        ...campaignData,
        id: uuid,
      });
      console.log(campaignData);

      // Set default bounty amount from campaign data
      setBountyAmount(ethers.formatEther(campaignData.bountyAmount));
      setStakeAmount(ethers.formatEther(campaignData.stakingAmount));
    } catch (err) {
      console.error("Error loading campaign:", err);
      setCampaignError(
        err instanceof Error ? err.message : "Failed to load campaign"
      );
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
      console.error("Error checking RSVP status:", err);
    }
  };

  const loadCampaignRSVPs = async () => {
    if (!campaign) return;

    setIsLoadingRSVPs(true);
    try {
      const rsvps = await getCampaignRSVPs(campaign.id);
      setCampaignRSVPs(rsvps);
    } catch (err) {
      console.error("Error loading RSVPs:", err);
      setCampaignRSVPs([]);
    } finally {
      setIsLoadingRSVPs(false);
    }
  };

  const handlePayBounty = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!campaign) {
      toast.error("Campaign not loaded");
      return;
    }

    // Parse verifier addresses
    const verifierAddresses = verifiers
      .split(",")
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);

    if (verifierAddresses.length === 0) {
      toast.error("Please enter at least one verifier address");
      return;
    }

    // Validate addresses
    for (const addr of verifierAddresses) {
      if (!ethers.isAddress(addr)) {
        toast.error(`Invalid address: ${addr}`);
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
        bountyAmount: bountyAmount,
      };

      const result = await payBountyToEscrow(params);

      // Step 2: Create DAO with the same campaign ID and verifiers
      setIsCreatingDAO(true);
      const daoParams: CreateDAOParams = {
        uuid: campaign.id,
        verifiers: verifierAddresses,
      };

      const daoResult = await createDAO(daoParams);
      setIsCreatingDAO(false);

      toast.success(`Bounty paid and DAO created successfully!`);
      setBountySuccess(
        `Bounty TX: ${result.transactionHash}... DAO TX: ${daoResult.transactionHash}`
      );

      // Update campaign status
      setCampaign((prev) => ({
        ...prev!,
        status: CampaignStatus.BOUNTY_PAID,
        bountyPayer: currentAccount!,
        publicAddresses: verifierAddresses,
      }));
    } catch (err) {
      console.error("Error paying bounty or creating DAO:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to pay bounty or create DAO"
      );
      setBountyError(
        err instanceof Error
          ? err.message
          : "Failed to pay bounty or create DAO"
      );
      setIsCreatingDAO(false);
    } finally {
      setIsPayingBounty(false);
    }
  };

  const handleRSVP = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!campaign) {
      toast.error("Campaign not loaded");
      return;
    }

    if (campaign.status !== CampaignStatus.BOUNTY_PAID) {
      toast.error("Campaign bounty must be paid before RSVPing");
      return;
    }

    if (hasRSVPed) {
      toast.error("You have already RSVPed to this campaign");
      return;
    }

    if (!currentAccount) {
      toast.error("Wallet not connected");
      return;
    }

    setIsRSVPing(true);
    setRSVPError(null);
    setRSVPSuccess(null);

    try {
      // Step 1: RSVP to campaign with stake
      const params: RSVPParams = {
        campaignId: campaign.id,
        stakeAmount: stakeAmount,
      };

      const result = await rsvpToCampaign(params);

      // Step 2: Add user to the DAO
      setIsAddingToDAO(true);
      const addUserParams: AddUserParams = {
        uuid: campaign.id,
        userAddress: currentAccount,
      };

      const daoResult = await addUser(addUserParams);
      setIsAddingToDAO(false);

      toast.success("RSVP successful and added to DAO!");
      setRSVPSuccess(
        `RSVP TX: ${result.transactionHash.slice(
          0,
          10
        )}... DAO TX: ${daoResult.transactionHash.slice(0, 10)}...`
      );

      // Update RSVP status
      setHasRSVPed(true);
      setUserStake(ethers.parseEther(stakeAmount));

      // Reload RSVPs to see the new participant
      await loadCampaignRSVPs();
    } catch (err) {
      console.error("Error RSVPing or adding to DAO:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to RSVP or add to DAO"
      );
      setRSVPError(
        err instanceof Error ? err.message : "Failed to RSVP or add to DAO"
      );
      setIsAddingToDAO(false);
    } finally {
      setIsRSVPing(false);
    }
  };

  const handleDummyDAO = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsDummyDAORunning(true);
    setDummyDAOError(null);
    setDummyDAOSuccess(null);

    try {
      const result = await dummyDAO(campaign.id);
      console.log(result);
      toast.success("Voting stopped and results calculated");
      setDummyDAOSuccess(`Transaction: ${result.transactionHash}`);

      // Reload RSVPs to see verification changes
      await loadCampaignRSVPs();
    } catch (err) {
      console.error("Error running dummy DAO:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to run dummy DAO verification"
      );
      setDummyDAOError(
        err instanceof Error
          ? err.message
          : "Failed to run dummy DAO verification"
      );
    } finally {
      setIsDummyDAORunning(false);
    }
  };

  const handleCompleteCampaign = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsCompletingCampaign(true);
    setCompletionError(null);
    setCompletionSuccess(null);

    try {
      const result = await completeCampaign(campaign.id);
      console.log(result);
      toast.success("Campaign completed! Payouts distributed.");
      setCompletionSuccess(`Transaction: ${result.transactionHash}`);

      // Update campaign status
      setCampaign((prev) => ({
        ...prev,
        status: CampaignStatus.COMPLETED,
      }));
    } catch (err) {
      console.error("Error completing campaign:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to complete campaign"
      );
      setCompletionError(
        err instanceof Error ? err.message : "Failed to complete campaign"
      );
    } finally {
      setIsCompletingCampaign(false);
    }
  };

  const getStatusText = (status: CampaignStatus): string => {
    switch (status) {
      case CampaignStatus.CREATED:
        return "Created - Waiting for Bounty";
      case CampaignStatus.BOUNTY_PAID:
        return "Bounty Paid - Accepting RSVPs";
      case CampaignStatus.COMPLETED:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case CampaignStatus.CREATED:
        return "bg-yellow-500/20 text-black border-yellow-500/30";
      case CampaignStatus.BOUNTY_PAID:
        return "bg-blue-500/20 text-black border-blue-500/30";
      case CampaignStatus.COMPLETED:
        return "bg-green-500/20 text-black border-green-500/30";
      default:
        return "bg-gray-500/20 text-black border-gray-500/30";
    }
  };

  // Show loading state
  if (isLoadingCampaign) {
    return (
      <div className="min-h-screen pt-20 px-4 md:px-32">
        <div className="max-w-md mx-auto text-center py-8 md:py-12">
          <Card className="border border-border shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Loading Campaign
              </h3>
              <p className="text-muted-foreground">
                Please wait while we fetch the campaign details...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state
  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen pt-20 px-4 md:px-32">
        <div className="max-w-md mx-auto text-center py-8 md:py-12">
          <Card className="border border-destructive/20 shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Error Loading Campaign
              </h3>
              <p className="text-muted-foreground mb-6">
                {campaignError || "Campaign not found"}
              </p>
              <Button onClick={loadCampaignData} variant="outline">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen pt-20 flex flex-col md:flex-row px-4 md:px-32">
        {/* Left Column - fixed on desktop, top on mobile */}
        <div className="w-full md:w-1/3 md:fixed md:top-40 md:left-0 md:h-[calc(100vh-5rem)] md:overflow-y-auto p-4 md:p-8 md:ml-32">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4 text-primary hover:text-primary/80"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Campaign Management
            </h1>
            <p className="text-muted-foreground">
              Manage campaign interactions and verification
            </p>

            {/* Campaign Status Info */}
            <div className="mb-4 p-4 bg-accent/20 rounded-lg border border-accent/30">
              <h3 className="text-sm font-medium text-accent-foreground mb-2">
                Campaign Workflow
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  <strong>Pay Bounty:</strong> Fund the campaign and create
                  verification DAO
                </li>
                <li>
                  <strong>RSVP & Stake:</strong> Participants join with required
                  stake
                </li>
                <li>
                  <strong>Verification:</strong> DAO verifiers validate
                  participation
                </li>
                <li>
                  <strong>Completion:</strong> Distribute rewards to verified
                  participants
                </li>
                <li>
                  Campaign creators set bounty amounts and staking requirements
                </li>
                <li>
                  Decentralized verification ensures fair reward distribution
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column - scrollable, full width on mobile */}
        <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen overflow-y-auto mt-6 md:mt-0">
          <div className="p-4 md:p-8">
            {/* Wallet Connection Check */}
            {!isConnected ? (
              <div className="max-w-md mx-auto text-center py-8 md:py-12">
                <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-md">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You need to connect your Web3 wallet to interact with
                    campaigns
                  </p>
                  <WalletConnect />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Campaign Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {campaign.isFundraiser ? "Fundraiser" : "Sponsored"}{" "}
                      Campaign
                    </CardTitle>
                    <CardDescription>
                      Campaign ID: {campaign.id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {getStatusText(campaign.status)}
                      </span>
                    </div>

                    {/* Campaign Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Required Bounty:
                          </span>
                          <span className="text-foreground font-medium">
                            {ethers.formatEther(campaign.bountyAmount)} ETH
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Staking Amount:
                          </span>
                          <span className="text-foreground font-medium">
                            {ethers.formatEther(campaign.stakingAmount)} ETH
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Creator:
                          </span>
                          <span className="text-foreground font-medium text-xs font-mono">
                            {campaign.creator.slice(0, 6)}...
                            {campaign.creator.slice(-4)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {campaign.bountyPayer !==
                          "0x0000000000000000000000000000000000000000" && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Bounty Payer:
                            </span>
                            <EnsProfile
                              address={campaign.bountyPayer as `0x${string}`}
                              size="sm"
                              showAddress={false}
                              className="text-foreground"
                            />
                          </div>
                        )}

                        {campaign.publicAddresses.length > 0 && (
                          <div>
                            <span className="text-muted-foreground block mb-2">
                              Verifiers:
                            </span>
                            {campaign.publicAddresses.map((addr, index) => (
                              <div key={index} className="mb-1">
                                <EnsProfile
                                  address={addr as `0x${string}`}
                                  size="sm"
                                  showAddress={false}
                                  className="text-foreground"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {hasRSVPed && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Your Stake:
                            </span>
                            <span className="text-primary font-medium">
                              {ethers.formatEther(userStake)} ETH
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pay Bounty Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Pay Bounty
                      </CardTitle>
                      <CardDescription>
                        Fund the campaign and create verification DAO
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {campaign.status === CampaignStatus.CREATED ? (
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="bountyAmount"
                              className="block text-foreground font-medium mb-2"
                            >
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
                              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="verifiers"
                              className="block text-foreground font-medium mb-2"
                            >
                              Verifier Addresses (comma-separated)
                            </label>
                            <textarea
                              id="verifiers"
                              placeholder="0x123..., 0x456..., 0x789..."
                              rows={3}
                              value={verifiers}
                              onChange={(e) => setVerifiers(e.target.value)}
                              disabled={!isConnected || isPayingBounty}
                              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Enter wallet addresses that will verify campaign
                              completion through DAO voting
                            </p>
                          </div>

                          {bountyError && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                              <p className="text-destructive text-sm">
                                {bountyError}
                              </p>
                            </div>
                          )}

                          {bountySuccess && (
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                              <p className="text-primary text-sm">
                                {bountySuccess}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            {campaign.status === CampaignStatus.BOUNTY_PAID
                              ? "Bounty has been paid and DAO created!"
                              : "Campaign is completed"}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    {campaign.status === CampaignStatus.CREATED && (
                      <CardFooter>
                        <Button
                          onClick={handlePayBounty}
                          disabled={!isConnected || isPayingBounty}
                          className="w-full"
                        >
                          {isPayingBounty ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              {isCreatingDAO
                                ? "Creating DAO..."
                                : "Paying Bounty..."}
                            </div>
                          ) : (
                            "Pay Bounty & Create DAO"
                          )}
                        </Button>
                      </CardFooter>
                    )}
                  </Card>

                  {/* RSVP Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        RSVP & Join DAO
                      </CardTitle>
                      <CardDescription>
                        Participate in the campaign and join verification DAO
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {campaign.status === CampaignStatus.BOUNTY_PAID &&
                      !hasRSVPed ? (
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="stakeAmount"
                              className="block text-foreground font-medium mb-2"
                            >
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
                              className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Required:{" "}
                              {ethers.formatEther(campaign.stakingAmount)} ETH
                            </p>
                          </div>

                          {rsvpError && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                              <p className="text-destructive text-sm">
                                {rsvpError}
                              </p>
                            </div>
                          )}

                          {rsvpSuccess && (
                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                              <p className="text-primary text-sm">
                                {rsvpSuccess}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            {campaign.status === CampaignStatus.CREATED
                              ? "Waiting for bounty to be paid"
                              : hasRSVPed
                              ? "You have already RSVPed and joined the DAO!"
                              : "Campaign is completed"}
                          </p>
                          {hasRSVPed && (
                            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                              <p className="text-primary text-sm">
                                ✅ Your stake: {ethers.formatEther(userStake)}{" "}
                                ETH
                              </p>
                              <p className="text-primary text-xs mt-1">
                                You're now part of the DAO for verification
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                    {campaign.status === CampaignStatus.BOUNTY_PAID &&
                      !hasRSVPed && (
                        <CardFooter>
                          <Button
                            onClick={handleRSVP}
                            disabled={!isConnected || isRSVPing}
                            className="w-full"
                            variant="outline"
                          >
                            {isRSVPing ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                {isAddingToDAO
                                  ? "Adding to DAO..."
                                  : "RSVPing..."}
                              </div>
                            ) : (
                              "RSVP & Join DAO"
                            )}
                          </Button>
                        </CardFooter>
                      )}
                  </Card>
                </div>

                {/* Verification & Voting Section */}
                {campaign.status === CampaignStatus.BOUNTY_PAID && (
                  <Card className="bg-accent/20 border-accent/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-accent-foreground">
                        <Vote className="w-5 h-5" />
                        Verification & Voting
                      </CardTitle>
                      <CardDescription>
                        Manage participant verification through DAO voting
                        system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Go to Voting */}
                        <div>
                          <h4 className="text-lg font-medium text-foreground mb-3">
                            Participant Verification
                          </h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            Go to the voting page to verify participants through
                            the DAO system.
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
                          <h4 className="text-lg font-medium text-foreground mb-3">
                            Stop Voting: Final Step
                          </h4>
                          <p className="text-muted-foreground text-sm mb-4">
                            This will stop the voting in the DAO which was
                            created according to the user who made the campaign.
                          </p>

                          {dummyDAOError && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                              <p className="text-destructive text-sm">
                                {dummyDAOError}
                              </p>
                            </div>
                          )}

                          {dummyDAOSuccess && (
                            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                              <p className="text-primary text-sm">
                                {dummyDAOSuccess}
                              </p>
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
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Stopping and Calculating Results...
                              </div>
                            ) : (
                              "Stop Voting"
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Complete Campaign Section */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-foreground mb-3">
                          Complete Campaign
                        </h4>
                        <p className="text-muted-foreground text-sm mb-4">
                          Distribute bounties to verified participants and
                          handle stake returns/forfeitures.
                        </p>

                        {completionError && (
                          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-destructive text-sm">
                              {completionError}
                            </p>
                          </div>
                        )}

                        {completionSuccess && (
                          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            <p className="text-primary text-sm">
                              {completionSuccess}
                            </p>
                          </div>
                        )}

                        <Button
                          onClick={handleCompleteCampaign}
                          disabled={!isConnected || isCompletingCampaign}
                          className="w-full mb-4"
                        >
                          {isCompletingCampaign ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Completing Campaign...
                            </div>
                          ) : (
                            "Complete Campaign & Distribute Payouts"
                          )}
                        </Button>
                      </div>

                      {/* RSVP List */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-lg font-medium text-foreground">
                            Campaign Participants
                          </h4>
                          <Button
                            onClick={loadCampaignRSVPs}
                            disabled={isLoadingRSVPs}
                            variant="outline"
                            size="sm"
                          >
                            {isLoadingRSVPs ? "Loading..." : "Refresh"}
                          </Button>
                        </div>

                        {isLoadingRSVPs ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                          </div>
                        ) : campaignRSVPs.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">
                            No participants yet
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {campaignRSVPs.map((rsvp, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border ${
                                  rsvp.verified
                                    ? "bg-primary/10 border-primary/20"
                                    : "bg-muted border-border"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-foreground font-mono text-sm">
                                      {rsvp.participant.slice(0, 6)}...
                                      {rsvp.participant.slice(-4)}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Stake:{" "}
                                      {ethers.formatEther(rsvp.stakeAmount)} ETH
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        rsvp.verified
                                          ? "bg-primary/20 text-primary"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {rsvp.verified
                                        ? "✅ Verified"
                                        : "⏳ Pending"}
                                    </span>
                                    {rsvp.stakeReturned && (
                                      <p className="text-xs text-primary mt-1">
                                        Stake Returned
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                      Understanding the campaign verification workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-primary mb-2">
                          1. Pay Bounty & Create DAO
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Pay the bounty into escrow and automatically create a
                          DAO with your specified verifiers. This enables
                          decentralized verification of participants.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-accent-foreground mb-2">
                          2. RSVP & Join DAO
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Participants RSVP with their stake and are
                          automatically added to the DAO as users. This allows
                          them to be verified by the DAO verifiers.
                        </p>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-primary mb-2">
                          3. Verify & Complete
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Verifiers vote on participants through the DAO system.
                          Once verified, complete the campaign to distribute
                          rewards.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <img
          src="/campman.png"
          alt=""
          className="w-full md:w-[50%] object-contain md:fixed -bottom-[100px] left-0 hidden md:block grayscale"
        />
      </div>
    </div>
  );
}
