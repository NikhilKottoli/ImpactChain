import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  castVote,
  getDAOUsers,
  getUserVotingDetails,
  checkVerifier,
  VoteOption,
  type UserVotingDetails,
} from "@/utils/daoContract";
import { walletConnection } from "@/utils/wallet";
import { toast } from "react-toastify";

const VotingPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>(); // Get UUID from URL path parameter
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);

  // DAO data
  const [daoUuid, setDaoUuid] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [usersVotingDetails, setUsersVotingDetails] = useState<
    UserVotingDetails[]
  >([]);

  // UI state
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [voteReason, setVoteReason] = useState("");
  const [expandedUser, setExpandedUser] = useState<string>("");

  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing with UUID:", uuid);

      // Get current account
      const account = await walletConnection.getCurrentAccount();
      if (account) {
        setCurrentAccount(account);
        console.log("Connected account:", account);
      }

      // Set UUID from URL params
      if (uuid) {
        setDaoUuid(uuid);
        console.log("Loading DAO data for UUID:", uuid);
        await loadDAOData(uuid, account);
      } else {
        console.log("No UUID provided in URL");
      }
    };

    initialize();
  }, [uuid]); // Depend on uuid from useParams

  const loadDAOData = async (uuid: string, account?: string) => {
    console.log("Loading DAO data for UUID:", uuid);
    setLoading(true);
    try {
      // Load basic DAO data
      console.log("Fetching DAO users...");
      const daoUsers = await getDAOUsers(uuid);
      console.log("DAO users:", daoUsers);
      setUsers(daoUsers);

      // Check if current user is a verifier
      if (account) {
        console.log("Checking if user is verifier...");
        const verifierStatus = await checkVerifier(uuid, account);
        console.log("Is verifier:", verifierStatus);
        setIsVerifier(verifierStatus);
      }

      // Load all users voting details
      if (daoUsers.length > 0) {
        console.log("Loading voting details for all users...");
        const allUsersDetails = await Promise.all(
          daoUsers.map(async (userAddress) => {
            console.log("Loading details for user:", userAddress);
            return await getUserVotingDetails(uuid, userAddress);
          })
        );
        console.log("All users voting details:", allUsersDetails);
        setUsersVotingDetails(allUsersDetails);
      }
    } catch (error: any) {
      console.error("Error loading DAO data:", error);
      toast.error(error.message || "Failed to load DAO data");
    } finally {
      setLoading(false);
    }
  };

  const handleCastVote = async (userAddress: string, vote: VoteOption) => {
    if (!daoUuid || !currentAccount) {
      toast.error("DAO UUID or wallet not available");
      return;
    }

    setLoading(true);
    try {
      const result = await castVote({
        uuid: daoUuid,
        userAddress,
        vote,
        reason: voteReason,
      });

      const voteText = vote === VoteOption.YES ? "YES" : "NO";
      toast.success(`Vote cast successfully: ${voteText}`);
      console.log("Transaction hash:", result.transactionHash);

      // Clear form
      setVoteReason("");
      setSelectedUser("");

      // Reload data
      await loadDAOData(daoUuid, currentAccount);
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error(error.message || "Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatVoteOption = (vote: VoteOption): string => {
    return vote === VoteOption.YES ? "YES" : "NO";
  };

  // Show loading state while initializing
  if (loading && !daoUuid) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading DAO data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no UUID provided
  if (!uuid) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No DAO UUID Provided</h2>
            <p className="text-gray-600">
              Please provide a DAO UUID in the URL path
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Example: /voting/your-dao-uuid
            </p>
            <Button
              onClick={() => (window.location.href = "/dao")}
              className="mt-4"
            >
              Go to DAO Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DAO Voting Dashboard</h1>
        <p className="text-gray-600">Vote on users for campaign verification</p>
        <p className="text-sm text-gray-500">DAO UUID: {daoUuid}</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.length}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {usersVotingDetails.filter((u) => u.hasAttestation).length}
              </div>
              <div className="text-sm text-gray-600">With Attestations</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {
                  usersVotingDetails.filter(
                    (u) => u.hasAttestation && u.attestationResult
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet and Verifier Status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentAccount ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm">
                  {currentAccount
                    ? `Connected: ${currentAccount.slice(
                        0,
                        6
                      )}...${currentAccount.slice(-4)}`
                    : "Wallet not connected"}
                </span>
              </div>

              {isVerifier && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  ✓ Verifier
                </div>
              )}

              {!isVerifier && currentAccount && (
                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  Not a Verifier
                </div>
              )}
            </div>

            <Button
              onClick={() => loadDAOData(daoUuid, currentAccount)}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Users to Vote On ({usersVotingDetails.length})
        </h2>

        {loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </CardContent>
          </Card>
        ) : usersVotingDetails.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No users found in this DAO</p>
              <p className="text-sm text-gray-500 mt-2">
                Users need to be added to the DAO first
              </p>
            </CardContent>
          </Card>
        ) : (
          usersVotingDetails.map((userDetails) => {
            const isExpanded = expandedUser === userDetails.userAddress;

            return (
              <Card key={userDetails.userAddress} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {userDetails.userAddress.slice(0, 6)}...
                        {userDetails.userAddress.slice(-4)}
                      </CardTitle>
                      <CardDescription>
                        Votes: {userDetails.totalVotes} | Yes:{" "}
                        {userDetails.yesVotes} | No: {userDetails.noVotes}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      {userDetails.hasAttestation && (
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userDetails.attestationResult
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {userDetails.attestationResult
                            ? "✓ APPROVED"
                            : "✗ REJECTED"}
                        </div>
                      )}

                      {!userDetails.hasAttestation && (
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          ⏳ PENDING
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Voting Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {userDetails.yesVotes}
                      </div>
                      <div className="text-sm text-green-700">Yes Votes</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">
                        {userDetails.noVotes}
                      </div>
                      <div className="text-sm text-red-700">No Votes</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {userDetails.totalVotes}
                      </div>
                      <div className="text-sm text-blue-700">Total Votes</div>
                    </div>
                  </div>

                  {/* Attestation Info */}
                  {userDetails.hasAttestation && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">
                        Attestation Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Hash:</strong>
                          <code className="bg-white px-2 py-1 rounded text-xs break-all ml-2">
                            {userDetails.attestationHash}
                          </code>
                        </div>
                        <div>
                          <strong>Result:</strong>{" "}
                          {userDetails.attestationResult
                            ? "Approved"
                            : "Rejected"}
                        </div>
                        <div>
                          <strong>Created:</strong>{" "}
                          {formatTimestamp(userDetails.createdAt)}
                        </div>
                        {userDetails.attestedAt > 0 && (
                          <div>
                            <strong>Attested:</strong>{" "}
                            {formatTimestamp(userDetails.attestedAt)}
                          </div>
                        )}
                        {userDetails.ipfsMetadataHash && (
                          <div>
                            <strong>IPFS:</strong>
                            <code className="bg-white px-2 py-1 rounded text-xs break-all ml-2">
                              {userDetails.ipfsMetadataHash}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Voting Actions */}
                  {isVerifier && !userDetails.hasAttestation && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Cast Your Vote</h4>

                      <div className="space-y-3">
                        <textarea
                          value={
                            selectedUser === userDetails.userAddress
                              ? voteReason
                              : ""
                          }
                          onChange={(e) => {
                            setSelectedUser(userDetails.userAddress);
                            setVoteReason(e.target.value);
                          }}
                          placeholder="Reason for your vote (optional)"
                          rows={2}
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              handleCastVote(
                                userDetails.userAddress,
                                VoteOption.YES
                              )
                            }
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {loading ? "Voting..." : "👍 Vote YES"}
                          </Button>
                          <Button
                            onClick={() =>
                              handleCastVote(
                                userDetails.userAddress,
                                VoteOption.NO
                              )
                            }
                            disabled={loading}
                            variant="destructive"
                            className="flex-1"
                          >
                            {loading ? "Voting..." : "👎 Vote NO"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Non-verifier message */}
                  {!isVerifier && currentAccount && (
                    <div className="border-t pt-4">
                      <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm">
                        <strong>Note:</strong> You are not a verifier for this
                        DAO and cannot vote.
                      </div>
                    </div>
                  )}

                  {/* No wallet connected message */}
                  {!currentAccount && (
                    <div className="border-t pt-4">
                      <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
                        <strong>Connect your wallet</strong> to participate in
                        voting.
                      </div>
                    </div>
                  )}

                  {/* Show Individual Votes */}
                  <div className="border-t pt-4 mt-4">
                    <Button
                      onClick={() =>
                        setExpandedUser(
                          isExpanded ? "" : userDetails.userAddress
                        )
                      }
                      variant="ghost"
                      size="sm"
                      className="mb-3"
                    >
                      {isExpanded ? "🔼 Hide" : "🔽 Show"} Individual Votes (
                      {userDetails.votes.length})
                    </Button>

                    {isExpanded && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {userDetails.votes.length === 0 ? (
                          <p className="text-gray-500 text-sm italic">
                            No votes cast yet
                          </p>
                        ) : (
                          userDetails.votes.map((vote, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-3 rounded border-l-4 border-l-blue-500"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium">
                                  {vote.verifier.slice(0, 6)}...
                                  {vote.verifier.slice(-4)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      vote.vote === VoteOption.YES
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {formatVoteOption(vote.vote)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(vote.timestamp)}
                                  </span>
                                </div>
                              </div>
                              {vote.reason && (
                                <p className="text-sm text-gray-600 mt-1 italic">
                                  "{vote.reason}"
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div>UUID from URL: {uuid}</div>
            <div>DAO UUID: {daoUuid}</div>
            <div>Current Account: {currentAccount}</div>
            <div>Is Verifier: {isVerifier.toString()}</div>
            <div>Users Count: {users.length}</div>
            <div>Loading: {loading.toString()}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VotingPage;
