import React, { useState } from 'react';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Search, User, Globe } from 'lucide-react';
import { ENSSearch } from './ENSSearch';
import { ENSUserProfile } from './ENSUserProfile';
import { useENSProfile, useReverseENS, useStandardTextRecords, formatAddress } from '../hooks/useENS';

export const ENSTestingDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [testAddress, setTestAddress] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'); // vitalik.eth
  const [testName, setTestName] = useState('vitalik.eth');
  const [searchResults, setSearchResults] = useState<any>(null);

  // Test current user's ENS
  const userENS = useENSProfile(address);
  
  // Test known ENS name
  const testENSProfile = useENSProfile(testAddress);
  const testReverseENS = useReverseENS(testName);
  const testTextRecords = useStandardTextRecords(testName);

  const tests = [
    {
      name: 'Wagmi Connection',
      status: isConnected ? 'success' : 'error',
      message: isConnected ? `Connected to ${address}` : 'Wallet not connected'
    },
    {
      name: 'User ENS Resolution',
      status: userENS.isLoading ? 'loading' : userENS.hasENS ? 'success' : 'warning',
      message: userENS.isLoading ? 'Loading...' : userENS.hasENS ? `Resolved: ${userENS.ensName}` : 'No ENS name for connected wallet'
    },
    {
      name: 'User Avatar Resolution',
      status: userENS.isLoading ? 'loading' : userENS.avatar ? 'success' : 'warning',
      message: userENS.isLoading ? 'Loading...' : userENS.avatar ? 'Avatar found' : 'No avatar set'
    },
    {
      name: 'Test ENS → Address',
      status: testReverseENS.isLoading ? 'loading' : testReverseENS.address ? 'success' : 'error',
      message: testReverseENS.isLoading ? 'Loading...' : testReverseENS.address ? `${testName} → ${formatAddress(testReverseENS.address)}` : 'Resolution failed'
    },
    {
      name: 'Test Address → ENS',
      status: testENSProfile.isLoading ? 'loading' : testENSProfile.hasENS ? 'success' : 'warning',
      message: testENSProfile.isLoading ? 'Loading...' : testENSProfile.hasENS ? `${formatAddress(testAddress)} → ${testENSProfile.ensName}` : 'No ENS name found'
    },
    {
      name: 'Text Records',
      status: testTextRecords.isLoading ? 'loading' : testTextRecords.data && testTextRecords.data.length > 0 ? 'success' : 'warning',
      message: testTextRecords.isLoading ? 'Loading...' : `Found ${testTextRecords.data?.length || 0} text records`
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">ENS Integration Testing Dashboard</h2>
      
      {/* Connection Status */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-blue-600">Wallet:</span>
            <p className="font-mono text-sm">{address || 'Not connected'}</p>
          </div>
          <div>
            <span className="text-sm text-blue-600">ENS Name:</span>
            <p className="font-medium">{userENS.ensName || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Test Results</h3>
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="font-medium text-gray-800">{test.name}</div>
                <div className="text-sm text-gray-600">{test.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Tests */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Interactive Tests</h3>
        
        {/* Test Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Address (for ENS lookup):
            </label>
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test ENS Name (for address lookup):
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="vitalik.eth"
            />
          </div>
        </div>

        {/* ENS Search Component Test */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ENS Search Component Test:
          </label>
          <ENSSearch
            placeholder="Search ENS names or addresses..."
            onSelect={(result) => {
              setSearchResults(result);
              console.log('ENS Search Result:', result);
            }}
          />
          {searchResults && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm text-green-800">
                <strong>Search Result:</strong> {JSON.stringify(searchResults, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ENS Profile Previews */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">ENS Profile Previews</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current User Profile */}
          {isConnected && address && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Profile:</h4>
              <div className="p-4 border border-gray-200 rounded-lg">
                <ENSUserProfile address={address} size="lg" />
              </div>
            </div>
          )}

          {/* Test Profile */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Test Profile (Vitalik):</h4>
            <div className="p-4 border border-gray-200 rounded-lg">
              <ENSUserProfile address={testAddress} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Text Records Display */}
      {testTextRecords.data && testTextRecords.data.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Text Records for {testName}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testTextRecords.data.map(({ key, value }) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm text-gray-800 truncate ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">How to Test</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>1. <strong>Connect your wallet</strong> - If you have an ENS name, you should see it in the navbar</p>
          <p>2. <strong>Try ENS search</strong> - Search for known ENS names like "vitalik.eth" or "nick.eth"</p>
          <p>3. <strong>Create a campaign</strong> - Your ENS name should appear as the creator</p>
          <p>4. <strong>Check campaign cards</strong> - Look for ENS domain badges and creator profiles</p>
          <p>5. <strong>View ENS demo section</strong> - See rich metadata and multi-chain addresses</p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Search, User, Globe } from 'lucide-react';
import { ENSSearch } from './ENSSearch';
import { ENSUserProfile } from './ENSUserProfile';
import { useENSProfile, useReverseENS, useStandardTextRecords, formatAddress } from '../hooks/useENS';

export const ENSTestingDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [testAddress, setTestAddress] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'); // vitalik.eth
  const [testName, setTestName] = useState('vitalik.eth');
  const [searchResults, setSearchResults] = useState<any>(null);

  // Test current user's ENS
  const userENS = useENSProfile(address);
  
  // Test known ENS name
  const testENSProfile = useENSProfile(testAddress);
  const testReverseENS = useReverseENS(testName);
  const testTextRecords = useStandardTextRecords(testName);

  const tests = [
    {
      name: 'Wagmi Connection',
      status: isConnected ? 'success' : 'error',
      message: isConnected ? `Connected to ${address}` : 'Wallet not connected'
    },
    {
      name: 'User ENS Resolution',
      status: userENS.isLoading ? 'loading' : userENS.hasENS ? 'success' : 'warning',
      message: userENS.isLoading ? 'Loading...' : userENS.hasENS ? `Resolved: ${userENS.ensName}` : 'No ENS name for connected wallet'
    },
    {
      name: 'User Avatar Resolution',
      status: userENS.isLoading ? 'loading' : userENS.avatar ? 'success' : 'warning',
      message: userENS.isLoading ? 'Loading...' : userENS.avatar ? 'Avatar found' : 'No avatar set'
    },
    {
      name: 'Test ENS → Address',
      status: testReverseENS.isLoading ? 'loading' : testReverseENS.address ? 'success' : 'error',
      message: testReverseENS.isLoading ? 'Loading...' : testReverseENS.address ? `${testName} → ${formatAddress(testReverseENS.address)}` : 'Resolution failed'
    },
    {
      name: 'Test Address → ENS',
      status: testENSProfile.isLoading ? 'loading' : testENSProfile.hasENS ? 'success' : 'warning',
      message: testENSProfile.isLoading ? 'Loading...' : testENSProfile.hasENS ? `${formatAddress(testAddress)} → ${testENSProfile.ensName}` : 'No ENS name found'
    },
    {
      name: 'Text Records',
      status: testTextRecords.isLoading ? 'loading' : testTextRecords.data && testTextRecords.data.length > 0 ? 'success' : 'warning',
      message: testTextRecords.isLoading ? 'Loading...' : `Found ${testTextRecords.data?.length || 0} text records`
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">ENS Integration Testing Dashboard</h2>
      
      {/* Connection Status */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Connection Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-blue-600">Wallet:</span>
            <p className="font-mono text-sm">{address || 'Not connected'}</p>
          </div>
          <div>
            <span className="text-sm text-blue-600">ENS Name:</span>
            <p className="font-medium">{userENS.ensName || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Test Results</h3>
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="font-medium text-gray-800">{test.name}</div>
                <div className="text-sm text-gray-600">{test.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Tests */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Interactive Tests</h3>
        
        {/* Test Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Address (for ENS lookup):
            </label>
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test ENS Name (for address lookup):
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="vitalik.eth"
            />
          </div>
        </div>

        {/* ENS Search Component Test */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ENS Search Component Test:
          </label>
          <ENSSearch
            placeholder="Search ENS names or addresses..."
            onSelect={(result) => {
              setSearchResults(result);
              console.log('ENS Search Result:', result);
            }}
          />
          {searchResults && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm text-green-800">
                <strong>Search Result:</strong> {JSON.stringify(searchResults, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ENS Profile Previews */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">ENS Profile Previews</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current User Profile */}
          {isConnected && address && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Profile:</h4>
              <div className="p-4 border border-gray-200 rounded-lg">
                <ENSUserProfile address={address} size="lg" />
              </div>
            </div>
          )}

          {/* Test Profile */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Test Profile (Vitalik):</h4>
            <div className="p-4 border border-gray-200 rounded-lg">
              <ENSUserProfile address={testAddress} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Text Records Display */}
      {testTextRecords.data && testTextRecords.data.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Text Records for {testName}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testTextRecords.data.map(({ key, value }) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm text-gray-800 truncate ml-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-3">How to Test</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>1. <strong>Connect your wallet</strong> - If you have an ENS name, you should see it in the navbar</p>
          <p>2. <strong>Try ENS search</strong> - Search for known ENS names like "vitalik.eth" or "nick.eth"</p>
          <p>3. <strong>Create a campaign</strong> - Your ENS name should appear as the creator</p>
          <p>4. <strong>View ENS demo section</strong> - See rich metadata and multi-chain addresses</p>
        </div>
      </div>
    </div>
  );
};
