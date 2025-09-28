import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/WalletConnect";
import { ChevronLeft, Lock } from "lucide-react";
import {
  createDAO,
  addUser,
  addVerifier,
  getDAOStats,
  getDAOUsers,
  getDAOVerifiers,
  checkVerifier,
  checkUser,
  type DAOStats,
} from "@/utils/daoContract";
import { walletConnection } from "@/utils/wallet";
import { toast } from "react-toastify";

interface DAOInfo {
  uuid: string;
  stats: DAOStats;
  users: string[];
  verifiers: string[];
  isUserVerifier: boolean;
  isUserInDAO: boolean;
}

const DAOHomepage: React.FC = () => {
  const navigate = useNavigate();
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [daoInfo, setDaoInfo] = useState<DAOInfo | null>(null);

  // Form states
  const [daoUuid, setDaoUuid] = useState("");
  const [verifiersInput, setVerifiersInput] = useState("");
  const [userAddressInput, setUserAddressInput] = useState("");
  const [verifierAddressInput, setVerifierAddressInput] = useState("");
  const [searchUuid, setSearchUuid] = useState("");

  useEffect(() => {
    const getCurrentAccount = async () => {
      const account = await walletConnection.getCurrentAccount();
      if (account) {
        setCurrentAccount(account);
      }
    };
    getCurrentAccount();
  }, []);

  const handleCreateDAO = async () => {
    if (!daoUuid.trim() || !verifiersInput.trim()) {
      toast.error("Please enter both DAO UUID and verifier addresses");
      return;
    }

    setLoading(true);
    try {
      const verifiers = verifiersInput
        .split(",")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0);

      if (verifiers.length === 0) {
        throw new Error("Please provide at least one verifier address");
      }

      const result = await createDAO({ uuid: daoUuid.trim(), verifiers });
      toast.success(`DAO created successfully with UUID: ${daoUuid}`);
      console.log("Transaction hash:", result.transactionHash);

      // Clear form
      setVerifiersInput("");
    } catch (error: any) {
      console.error("Error creating DAO:", error);
      toast.error(error.message || "Failed to create DAO");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!daoUuid.trim() || !userAddressInput.trim()) {
      toast.error("Please enter both DAO UUID and user address");
      return;
    }

    setLoading(true);
    try {
      const result = await addUser({
        uuid: daoUuid.trim(),
        userAddress: userAddressInput.trim(),
      });

      toast.success("User added successfully");
      console.log("Transaction hash:", result.transactionHash);

      // Clear form
      setUserAddressInput("");

      // Refresh DAO info if we're viewing this DAO
      if (daoInfo && daoInfo.uuid === daoUuid.trim()) {
        await loadDAOInfo(daoUuid.trim());
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVerifier = async () => {
    if (!daoUuid.trim() || !verifierAddressInput.trim()) {
      toast.error("Please enter both DAO UUID and verifier address");
      return;
    }

    setLoading(true);
    try {
      const result = await addVerifier({
        uuid: daoUuid.trim(),
        verifierAddress: verifierAddressInput.trim(),
      });

      toast.success("Verifier added successfully");
      console.log("Transaction hash:", result.transactionHash);

      // Clear form
      setVerifierAddressInput("");

      // Refresh DAO info if we're viewing this DAO
      if (daoInfo && daoInfo.uuid === daoUuid.trim()) {
        await loadDAOInfo(daoUuid.trim());
      }
    } catch (error: any) {
      console.error("Error adding verifier:", error);
      toast.error(error.message || "Failed to add verifier");
    } finally {
      setLoading(false);
    }
  };

  const loadDAOInfo = async (uuid: string) => {
    if (!uuid.trim()) {
      toast.error("Please enter a DAO UUID");
      return;
    }

    setLoading(true);
    try {
      const [stats, users, verifiers, isUserVerifier, isUserInDAO] =
        await Promise.all([
          getDAOStats(uuid),
          getDAOUsers(uuid),
          getDAOVerifiers(uuid),
          currentAccount
            ? checkVerifier(uuid, currentAccount)
            : Promise.resolve(false),
          currentAccount
            ? checkUser(uuid, currentAccount)
            : Promise.resolve(false),
        ]);

      setDaoInfo({
        uuid,
        stats,
        users,
        verifiers,
        isUserVerifier,
        isUserInDAO,
      });

      toast.success("DAO information loaded successfully");
    } catch (error: any) {
      console.error("Error loading DAO info:", error);
      toast.error(error.message || "Failed to load DAO information");
      setDaoInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDAO = async () => {
    await loadDAOInfo(searchUuid);
  };

  return (
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
            DAO Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Create and manage DAOs for campaign verification
          </p>

          <div className="mb-4 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <h3 className="text-sm font-medium text-accent-foreground mb-2">
              How DAO Verification Works
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <strong>Decentralized Governance:</strong> Community-driven
                verification through voting
              </li>
              <li>
                <strong>Verifier Network:</strong> Trusted members validate
                campaign submissions
              </li>
              <li>
                <strong>Transparent Process:</strong> All verification
                activities are recorded on-chain
              </li>
              <li>
                <strong>Democratic Consensus:</strong> Multiple verifiers must
                agree on decisions
              </li>
              <li>
                Create DAOs with initial verifiers who can validate campaigns
              </li>
              <li>Add users and additional verifiers as the community grows</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Column - scrollable, full width on mobile */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen overflow-y-auto mt-6 md:mt-0">
        <div className="p-4 md:p-8">
          {/* Wallet Connection Check */}
          {!currentAccount ? (
            <div className="max-w-md mx-auto text-center py-8 md:py-12">
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You need to connect your Web3 wallet to manage DAOs on the
                  blockchain
                </p>
                <WalletConnect />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create DAO Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create New DAO</CardTitle>
                    <CardDescription>
                      Create a new DAO for campaign verification with initial
                      verifiers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        DAO UUID (Campaign ID)
                      </label>
                      <input
                        type="text"
                        value={daoUuid}
                        onChange={(e) => setDaoUuid(e.target.value)}
                        placeholder="Enter DAO UUID"
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        Verifier Addresses (comma-separated)
                      </label>
                      <textarea
                        value={verifiersInput}
                        onChange={(e) => setVerifiersInput(e.target.value)}
                        placeholder="0x123..., 0x456..., 0x789..."
                        rows={3}
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleCreateDAO}
                      disabled={loading || !currentAccount}
                      className="w-full"
                    >
                      {loading ? "Creating DAO..." : "Create DAO"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Search DAO Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Search DAO</CardTitle>
                    <CardDescription>
                      Load and view information about an existing DAO
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-foreground">
                        DAO UUID (Campaign ID)
                      </label>
                      <input
                        type="text"
                        value={searchUuid}
                        onChange={(e) => setSearchUuid(e.target.value)}
                        placeholder="Enter DAO UUID to search"
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSearchDAO}
                      disabled={loading || !searchUuid.trim()}
                      className="w-full"
                      variant="outline"
                    >
                      {loading ? "Loading..." : "Search DAO"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* DAO Information Display */}
              {daoInfo && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>DAO Information</CardTitle>
                    <CardDescription>UUID: {daoInfo.uuid}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-primary">
                          Total Users
                        </h3>
                        <p className="text-2xl font-bold text-foreground">
                          {daoInfo.stats.totalUsers}
                        </p>
                      </div>
                      <div className="bg-accent/20 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-accent-foreground">
                          Total Verifiers
                        </h3>
                        <p className="text-2xl font-bold text-foreground">
                          {daoInfo.stats.totalVerifiers}
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          With Attestations
                        </h3>
                        <p className="text-2xl font-bold text-foreground">
                          {daoInfo.stats.usersWithAttestations}
                        </p>
                      </div>
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-primary">
                          Approved Users
                        </h3>
                        <p className="text-2xl font-bold text-foreground">
                          {daoInfo.stats.approvedUsers}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">
                          Users ({daoInfo.users.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto border border-border rounded p-2 bg-background">
                          {daoInfo.users.map((user, index) => (
                            <div
                              key={index}
                              className="text-sm py-1 px-2 hover:bg-accent/20 rounded text-foreground"
                            >
                              {user}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 text-foreground">
                          Verifiers ({daoInfo.verifiers.length})
                        </h4>
                        <div className="max-h-40 overflow-y-auto border border-border rounded p-2 bg-background">
                          {daoInfo.verifiers.map((verifier, index) => (
                            <div
                              key={index}
                              className="text-sm py-1 px-2 hover:bg-accent/20 rounded text-foreground"
                            >
                              {verifier}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                      {daoInfo.isUserVerifier && (
                        <div className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm">
                          You are a verifier
                        </div>
                      )}
                      {daoInfo.isUserInDAO && (
                        <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                          You are in this DAO
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() =>
                        (window.location.href = `/dao/voting?uuid=${daoInfo.uuid}`)
                      }
                      className="w-full"
                    >
                      Go to Voting Page
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Management Actions */}
              {daoInfo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Add Single User */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Add User</CardTitle>
                      <CardDescription>
                        Add a single user to the DAO
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <input
                        type="text"
                        value={userAddressInput}
                        onChange={(e) => setUserAddressInput(e.target.value)}
                        placeholder="User address"
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={handleAddUser}
                        disabled={loading || !currentAccount}
                        className="w-full"
                        size="sm"
                      >
                        Add User
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Add Verifier */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Verifier</CardTitle>
                      <CardDescription>
                        Add a new verifier to the DAO
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <input
                        type="text"
                        value={verifierAddressInput}
                        onChange={(e) =>
                          setVerifierAddressInput(e.target.value)
                        }
                        placeholder="Verifier address"
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={handleAddVerifier}
                        disabled={loading || !currentAccount}
                        className="w-full"
                        size="sm"
                      >
                        Add Verifier
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <img
        src="/dao.png"
        alt=""
        className="w-full md:w-[50%] object-contain md:fixed -bottom-[100px] left-0 hidden md:block grayscale"
      />
    </div>
  );
};

export default DAOHomepage;
