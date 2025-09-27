import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  createDAO, 
  addUser, 
  addVerifier,
  getDAOStats,
  getDAOUsers,
  getDAOVerifiers,
  checkVerifier,
  checkUser,
  type DAOStats
} from '@/utils/daoContract';
import { walletConnection } from '@/utils/wallet';
import { toast } from 'react-toastify';

interface DAOInfo {
  uuid: string;
  stats: DAOStats;
  users: string[];
  verifiers: string[];
  isUserVerifier: boolean;
  isUserInDAO: boolean;
}

const DAOHomepage: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [daoInfo, setDaoInfo] = useState<DAOInfo | null>(null);
  
  // Form states
  const [daoUuid, setDaoUuid] = useState('');
  const [verifiersInput, setVerifiersInput] = useState('');
  const [userAddressInput, setUserAddressInput] = useState('');
  const [verifierAddressInput, setVerifierAddressInput] = useState('');
  const [searchUuid, setSearchUuid] = useState('');

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
      toast.error('Please enter both DAO UUID and verifier addresses');
      return;
    }

    setLoading(true);
    try {
      const verifiers = verifiersInput
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);

      if (verifiers.length === 0) {
        throw new Error('Please provide at least one verifier address');
      }

      const result = await createDAO({ uuid: daoUuid.trim(), verifiers });
      toast.success(`DAO created successfully with UUID: ${daoUuid}`);
      console.log('Transaction hash:', result.transactionHash);
      
      // Clear form
      setVerifiersInput('');
      
    } catch (error: any) {
      console.error('Error creating DAO:', error);
      toast.error(error.message || 'Failed to create DAO');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!daoUuid.trim() || !userAddressInput.trim()) {
      toast.error('Please enter both DAO UUID and user address');
      return;
    }

    setLoading(true);
    try {
      const result = await addUser({
        uuid: daoUuid.trim(),
        userAddress: userAddressInput.trim()
      });

      toast.success('User added successfully');
      console.log('Transaction hash:', result.transactionHash);
      
      // Clear form
      setUserAddressInput('');
      
      // Refresh DAO info if we're viewing this DAO
      if (daoInfo && daoInfo.uuid === daoUuid.trim()) {
        await loadDAOInfo(daoUuid.trim());
      }
      
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVerifier = async () => {
    if (!daoUuid.trim() || !verifierAddressInput.trim()) {
      toast.error('Please enter both DAO UUID and verifier address');
      return;
    }

    setLoading(true);
    try {
      const result = await addVerifier({
        uuid: daoUuid.trim(),
        verifierAddress: verifierAddressInput.trim()
      });

      toast.success('Verifier added successfully');
      console.log('Transaction hash:', result.transactionHash);
      
      // Clear form
      setVerifierAddressInput('');
      
      // Refresh DAO info if we're viewing this DAO
      if (daoInfo && daoInfo.uuid === daoUuid.trim()) {
        await loadDAOInfo(daoUuid.trim());
      }
      
    } catch (error: any) {
      console.error('Error adding verifier:', error);
      toast.error(error.message || 'Failed to add verifier');
    } finally {
      setLoading(false);
    }
  };

  const loadDAOInfo = async (uuid: string) => {
    if (!uuid.trim()) {
      toast.error('Please enter a DAO UUID');
      return;
    }

    setLoading(true);
    try {
      const [stats, users, verifiers, isUserVerifier, isUserInDAO] = await Promise.all([
        getDAOStats(uuid),
        getDAOUsers(uuid),
        getDAOVerifiers(uuid),
        currentAccount ? checkVerifier(uuid, currentAccount) : Promise.resolve(false),
        currentAccount ? checkUser(uuid, currentAccount) : Promise.resolve(false)
      ]);

      setDaoInfo({
        uuid,
        stats,
        users,
        verifiers,
        isUserVerifier,
        isUserInDAO
      });

      toast.success('DAO information loaded successfully');
      
    } catch (error: any) {
      console.error('Error loading DAO info:', error);
      toast.error(error.message || 'Failed to load DAO information');
      setDaoInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchDAO = async () => {
    await loadDAOInfo(searchUuid);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DAO Management Dashboard</h1>
        <p className="text-gray-600">Create and manage DAOs for campaign verification</p>
      </div>

      {/* Wallet Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Wallet Status</CardTitle>
        </CardHeader>
        <CardContent>
          {currentAccount ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Connected: {currentAccount}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Wallet not connected</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create DAO Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create New DAO</CardTitle>
            <CardDescription>
              Create a new DAO for campaign verification with initial verifiers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                DAO UUID (Campaign ID)
              </label>
              <input
                type="text"
                value={daoUuid}
                onChange={(e) => setDaoUuid(e.target.value)}
                placeholder="Enter DAO UUID"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Verifier Addresses (comma-separated)
              </label>
              <textarea
                value={verifiersInput}
                onChange={(e) => setVerifiersInput(e.target.value)}
                placeholder="0x123..., 0x456..., 0x789..."
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateDAO}
              disabled={loading || !currentAccount}
              className="w-full"
            >
              {loading ? 'Creating DAO...' : 'Create DAO'}
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
              <label className="block text-sm font-medium mb-2">
                DAO UUID (Campaign ID)
              </label>
              <input
                type="text"
                value={searchUuid}
                onChange={(e) => setSearchUuid(e.target.value)}
                placeholder="Enter DAO UUID to search"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              {loading ? 'Loading...' : 'Search DAO'}
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Total Users</h3>
                <p className="text-2xl font-bold text-blue-900">{daoInfo.stats.totalUsers}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Total Verifiers</h3>
                <p className="text-2xl font-bold text-green-900">{daoInfo.stats.totalVerifiers}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-600">With Attestations</h3>
                <p className="text-2xl font-bold text-yellow-900">{daoInfo.stats.usersWithAttestations}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Approved Users</h3>
                <p className="text-2xl font-bold text-purple-900">{daoInfo.stats.approvedUsers}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Users ({daoInfo.users.length})</h4>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {daoInfo.users.map((user, index) => (
                    <div key={index} className="text-sm py-1 px-2 hover:bg-gray-50 rounded">
                      {user}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Verifiers ({daoInfo.verifiers.length})</h4>
                <div className="max-h-40 overflow-y-auto border rounded p-2">
                  {daoInfo.verifiers.map((verifier, index) => (
                    <div key={index} className="text-sm py-1 px-2 hover:bg-gray-50 rounded">
                      {verifier}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              {daoInfo.isUserVerifier && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  You are a verifier
                </div>
              )}
              {daoInfo.isUserInDAO && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  You are in this DAO
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => window.location.href = `/dao/voting?uuid=${daoInfo.uuid}`}
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
              <CardDescription>Add a single user to the DAO</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={userAddressInput}
                onChange={(e) => setUserAddressInput(e.target.value)}
                placeholder="User address"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <CardDescription>Add a new verifier to the DAO</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={verifierAddressInput}
                onChange={(e) => setVerifierAddressInput(e.target.value)}
                placeholder="Verifier address"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
  );
};

export default DAOHomepage;
