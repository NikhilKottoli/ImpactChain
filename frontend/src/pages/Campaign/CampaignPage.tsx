import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/WalletConnect";
import { walletConnection } from "@/utils/wallet";
import {
  getUserCampaigns,
  getCampaign,
  getCampaignStats,
  dummyDAO,
  completeCampaign,
  type Campaign,
  CampaignStatus,
} from "@/utils/campaignContract";
import { ethers } from "ethers";
import CampaignPageForm from "./CampaignPageForm";
import { useNavigate } from "react-router-dom";

interface CampaignWithStats extends Campaign {
  id: string;
  totalParticipants: number;
  totalStaked: bigint;
}

export default function CampaignPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  // Payout states
  const [processingPayouts, setProcessingPayouts] = useState<Set<string>>(
    new Set()
  );
  const [payoutErrors, setPayoutErrors] = useState<Map<string, string>>(
    new Map()
  );
  const [payoutSuccess, setPayoutSuccess] = useState<Map<string, string>>(
    new Map()
  );

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected && currentAccount) {
      loadCampaigns();
    }
  }, [isConnected, currentAccount]);

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

  const loadCampaigns = async () => {
    if (!currentAccount) return;

    setIsLoading(true);
    setError(null);

    try {
      const campaignIds = await getUserCampaigns(currentAccount);

      const campaignsWithStats = await Promise.all(
        campaignIds.map(async (id) => {
          try {
            const [campaign, stats] = await Promise.all([
              getCampaign(id),
              getCampaignStats(id),
            ]);

            return {
              ...campaign,
              id,
              totalParticipants: stats.totalParticipants,
              totalStaked: stats.totalStaked,
            };
          } catch (err) {
            console.error(`Error loading campaign ${id}:`, err);
            return null;
          }
        })
      );

      setCampaigns(campaignsWithStats.filter(Boolean) as CampaignWithStats[]);
    } catch (err) {
      console.error("Error loading campaigns:", err);
      setError("Failed to load campaigns");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDummyDAOVerification = async (campaignId: string) => {
    if (!currentAccount) return;

    setProcessingPayouts((prev) => new Set(prev).add(campaignId));
    setPayoutErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(campaignId);
      return newMap;
    });
    setPayoutSuccess((prev) => {
      const newMap = new Map(prev);
      newMap.delete(campaignId);
      return newMap;
    });

    try {
      const result = await dummyDAO(campaignId);
      setPayoutSuccess((prev) =>
        new Map(prev).set(
          campaignId,
          `DAO verification completed! Transaction: ${result.transactionHash.slice(
            0,
            10
          )}...`
        )
      );

      // Refresh campaign data after verification
      await loadCampaigns();
    } catch (err) {
      console.error("Error calling dummy DAO:", err);
      setPayoutErrors((prev) =>
        new Map(prev).set(
          campaignId,
          err instanceof Error ? err.message : "Failed to verify participants"
        )
      );
    } finally {
      setProcessingPayouts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
    }
  };

  const handleCompleteCampaign = async (campaignId: string) => {
    if (!currentAccount) return;

    setProcessingPayouts((prev) => new Set(prev).add(campaignId));
    setPayoutErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(campaignId);
      return newMap;
    });
    setPayoutSuccess((prev) => {
      const newMap = new Map(prev);
      newMap.delete(campaignId);
      return newMap;
    });

    try {
      const result = await completeCampaign(campaignId);
      setPayoutSuccess((prev) =>
        new Map(prev).set(
          campaignId,
          `Campaign completed and payouts distributed! Transaction: ${result.transactionHash.slice(
            0,
            10
          )}...`
        )
      );

      // Refresh campaign data after completion
      await loadCampaigns();
    } catch (err) {
      console.error("Error completing campaign:", err);
      setPayoutErrors((prev) =>
        new Map(prev).set(
          campaignId,
          err instanceof Error ? err.message : "Failed to complete campaign"
        )
      );
    } finally {
      setProcessingPayouts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(campaignId);
        return newSet;
      });
    }
  };

  const getStatusText = (status: CampaignStatus): string => {
    switch (status) {
      case CampaignStatus.CREATED:
        return "Created";
      case CampaignStatus.BOUNTY_PAID:
        return "Bounty Paid";
      case CampaignStatus.COMPLETED:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case CampaignStatus.CREATED:
        return "bg-accent/20 text-accent-foreground border-accent/30";
      case CampaignStatus.BOUNTY_PAID:
        return "bg-primary/20 text-primary border-primary/30";
      case CampaignStatus.COMPLETED:
        return "bg-primary/20 text-primary border-primary/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const canManageCampaign = (campaign: CampaignWithStats): boolean => {
    return currentAccount?.toLowerCase() === campaign.creator.toLowerCase();
  };

  if (showForm) {
    return (
      <div className="min-h-screen pt-20 p-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              onClick={() => setShowForm(false)}
              variant="ghost"
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
              Back to Dashboard
            </Button>
          </div>
          <CampaignPageForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 p-6 ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Campaign Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your campaigns and track participation
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* <WalletConnect /> */}
            {isConnected && (
              <Button
                onClick={() => navigate("/create-campaign")}
                className="px-6 py-2 rounded-xl font-semibold"
              >
                Create Campaign
              </Button>
            )}
          </div>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="mb-8 p-6 bg-accent/20 border border-accent/30 rounded-lg">
            <h3 className="text-accent-foreground font-medium mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-muted-foreground">
              Please connect your wallet to view and manage your campaigns.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            <span className="text-foreground">Loading campaigns...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h3 className="text-destructive font-medium mb-2">Error</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadCampaigns} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        )}

        {/* Campaigns Grid */}
        {isConnected && !isLoading && (
          <>
            {/* Summary Stats */}
            {campaigns.length > 0 && (
              <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {campaigns.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Campaigns
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {campaigns.reduce(
                        (sum, c) => sum + c.totalParticipants,
                        0
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Participants
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {ethers.formatEther(
                        campaigns.reduce((sum, c) => sum + c.bountyAmount, 0n)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Bounties (ETH)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {ethers.formatEther(
                        campaigns.reduce((sum, c) => sum + c.totalStaked, 0n)
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Staked (ETH)
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="h-12 w-full"></div>

            {campaigns.length === 0 ? (
              <div className="text-center py-12 mb-20">
                <div className="bg-card border border-border rounded-lg p-8 shadow-md max-w-md mx-auto">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-4">
                    No Campaigns Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first campaign to get started
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-2 font-semibold"
                  >
                    Create Your First Campaign
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {campaigns.map((campaign) => {
                  const isProcessing = processingPayouts.has(campaign.id);
                  const error = payoutErrors.get(campaign.id);
                  const success = payoutSuccess.get(campaign.id);
                  const canManage = canManageCampaign(campaign);

                  return (
                    <div
                      key={campaign.id}
                      className="bg-card border border-border rounded-lg p-6 hover:border-border/80 transition-all shadow-sm"
                    >
                      {/* Campaign Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-card-foreground mb-1">
                            {campaign.isFundraiser ? "Fundraiser" : "Sponsored"}{" "}
                            Campaign
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {campaign.id.slice(0, 8)}...
                          </p>
                          {canManage && (
                            <span className="inline-block mt-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                              Your Campaign
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {getStatusText(campaign.status)}
                        </span>
                      </div>

                      {/* Campaign Stats */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Bounty Amount:
                          </span>
                          <span className="text-card-foreground font-medium">
                            {ethers.formatEther(campaign.bountyAmount)} ETH
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Staking Amount:
                          </span>
                          <span className="text-card-foreground font-medium">
                            {ethers.formatEther(campaign.stakingAmount)} ETH
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Participants:
                          </span>
                          <span className="text-card-foreground font-medium">
                            {campaign.totalParticipants}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Staked:
                          </span>
                          <span className="text-card-foreground font-medium">
                            {ethers.formatEther(campaign.totalStaked)} ETH
                          </span>
                        </div>

                        {!campaign.isFundraiser &&
                          campaign.bountyPayer !==
                            "0x0000000000000000000000000000000000000000" && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Bounty Payer:
                              </span>
                              <span className="text-card-foreground font-medium text-xs font-mono">
                                {campaign.bountyPayer.slice(0, 6)}...
                                {campaign.bountyPayer.slice(-4)}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Payout Messages */}
                      {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <p className="text-destructive text-sm">{error}</p>
                        </div>
                      )}

                      {success && (
                        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-primary text-sm">{success}</p>
                        </div>
                      )}

                      {/* Campaign Actions */}
                      <div className="pt-4 border-t border-border space-y-3">
                        {/* Only show payout controls if user is the campaign creator */}
                        {canManage &&
                          campaign.status === CampaignStatus.BOUNTY_PAID &&
                          campaign.totalParticipants > 0 && (
                            <>
                              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4">
                                <h4 className="text-accent-foreground font-medium mb-2">
                                  Campaign Management
                                </h4>
                                <p className="text-muted-foreground text-sm mb-3">
                                  Ready to complete your campaign? First verify
                                  participants, then distribute payouts.
                                </p>

                                <div className="space-y-2">
                                  <Button
                                    onClick={() =>
                                      handleDummyDAOVerification(campaign.id)
                                    }
                                    disabled={isProcessing}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    {isProcessing ? (
                                      <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                        Verifying...
                                      </div>
                                    ) : (
                                      "1. Verify Participants (Dummy DAO)"
                                    )}
                                  </Button>

                                  <Button
                                    onClick={() =>
                                      handleCompleteCampaign(campaign.id)
                                    }
                                    disabled={isProcessing}
                                    size="sm"
                                    className="w-full"
                                  >
                                    {isProcessing ? (
                                      <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                        Processing...
                                      </div>
                                    ) : (
                                      "2. Complete & Distribute Payouts"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}

                        {/* General View Details Button */}
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Instructions for Campaign Creators */}
            {campaigns.some(
              (c) =>
                canManageCampaign(c) && c.status === CampaignStatus.BOUNTY_PAID
            ) && (
              <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-card-foreground mb-4">
                  Campaign Completion Process
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-primary mb-2">
                      Step 1: Verify Participants
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Use the Dummy DAO function to simulate participant
                      verification. This will mark every other participant as
                      verified (for testing purposes).
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-accent-foreground mb-2">
                      Step 2: Complete Campaign
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Distribute bounty rewards to verified participants and
                      return/forfeit stakes. Only verified participants receive
                      bounties and get their stakes back.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
