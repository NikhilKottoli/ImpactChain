import React, { useState, useEffect } from 'react';
import { lighthouseService } from '../utils/lighthouse';
import { socialMediaContract, CONTRACT_CONFIG } from '../utils/contract';
import { walletConnection } from '../utils/wallet';
import { NetworkSwitcher } from './NetworkSwitcher';

export const ConfigurationTest: React.FC = () => {
  const [tests, setTests] = useState({
    lighthouseConnection: { status: 'pending', message: '' },
    contractABI: { status: 'pending', message: '' },
    walletConnection: { status: 'pending', message: '' },
    gatewayAccess: { status: 'pending', message: '' }
  });

  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    
    // Test 1: Lighthouse Connection
    setTests(prev => ({
      ...prev,
      lighthouseConnection: { status: 'testing', message: 'Testing Lighthouse API connection...' }
    }));

    try {
      const isConnected = await lighthouseService.testAuthentication();
      setTests(prev => ({
        ...prev,
        lighthouseConnection: {
          status: isConnected ? 'success' : 'error',
          message: isConnected ? 'Lighthouse API connected successfully!' : 'Lighthouse API connection failed - check your API key'
        }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        lighthouseConnection: {
          status: 'error',
          message: `Lighthouse connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
    }

    // Test 2: Contract ABI
    setTests(prev => ({
      ...prev,
      contractABI: { status: 'testing', message: 'Checking contract ABI and network...' }
    }));

    try {
      // First check if we're on the right network
      const network = await walletConnection.getNetwork();
      const sepoliaChainId = parseInt('0xaa36a7', 16); // 11155111
      
      if (network?.chainId !== BigInt(sepoliaChainId)) {
        setTests(prev => ({
          ...prev,
          contractABI: {
            status: 'warning',
            message: `Wrong network detected: ${network?.name} (${network?.chainId}). Please switch to Sepolia testnet.`
          }
        }));
      } else {
        // Try to get contract info
        const contract = socialMediaContract.getReadOnlyContract();
        
        // Try a simple read operation instead of isDeployed
        try {
          const totalSupply = await contract.totalSupply();
          setTests(prev => ({
            ...prev,
            contractABI: {
              status: 'success',
              message: `Contract ABI loaded successfully! Total posts: ${totalSupply}. Network: Sepolia ✅`
            }
          }));
        } catch (contractError) {
          console.error('Contract read error:', contractError);
          setTests(prev => ({
            ...prev,
            contractABI: {
              status: 'error',
              message: `Contract not found at address ${CONTRACT_CONFIG.address} on Sepolia. Please verify the contract is deployed.`
            }
          }));
        }
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        contractABI: {
          status: 'error',
          message: `Contract ABI error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
    }

    // Test 3: Wallet Connection
    setTests(prev => ({
      ...prev,
      walletConnection: { status: 'testing', message: 'Checking wallet availability...' }
    }));

    try {
      const hasMetaMask = walletConnection.isMetaMaskInstalled();
      if (hasMetaMask) {
        const isConnected = await walletConnection.isConnected();
        setTests(prev => ({
          ...prev,
          walletConnection: {
            status: 'success',
            message: `MetaMask detected! Connected: ${isConnected}`
          }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          walletConnection: {
            status: 'warning',
            message: 'MetaMask not detected. Please install MetaMask to use the app.'
          }
        }));
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        walletConnection: {
          status: 'error',
          message: `Wallet connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
    }

    // Test 4: Gateway Access
    setTests(prev => ({
      ...prev,
      gatewayAccess: { status: 'testing', message: 'Testing IPFS gateway access...' }
    }));

    try {
      // Test with a known IPFS hash (IPFS logo)
      const testHash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
      const response = await fetch(lighthouseService.getGatewayUrl(testHash), { method: 'HEAD' });
      
      if (response.ok) {
        setTests(prev => ({
          ...prev,
          gatewayAccess: {
            status: 'success',
            message: 'Primary gateway (gateway.lighthouse.storage) accessible!'
          }
        }));
      } else {
        // Try fallback
        const fallbackResponse = await fetch(lighthouseService.getFallbackGatewayUrl(testHash), { method: 'HEAD' });
        setTests(prev => ({
          ...prev,
          gatewayAccess: {
            status: fallbackResponse.ok ? 'warning' : 'error',
            message: fallbackResponse.ok 
              ? 'Primary gateway failed, but fallback (ipfs.io) works'
              : 'Both primary and fallback gateways failed'
          }
        }));
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        gatewayAccess: {
          status: 'error',
          message: `Gateway access error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="text-green-500">✅</span>;
      case 'warning':
        return <span className="text-yellow-500">⚠️</span>;
      case 'error':
        return <span className="text-red-500">❌</span>;
      case 'testing':
        return <span className="text-blue-500">🔄</span>;
      default:
        return <span className="text-gray-500">⏳</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'testing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration Test</h2>
        <p className="text-gray-600">
          Testing your Lighthouse, contract, and wallet configuration...
        </p>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(tests).map(([key, test]) => (
          <div
            key={key}
            className={`p-4 border rounded-lg transition-colors ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <h3 className="font-semibold capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{test.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Configuration Details:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Contract Address:</strong> {CONTRACT_CONFIG.address}</p>
          <p><strong>Owner Address:</strong> {CONTRACT_CONFIG.ownerAddress}</p>
          <p><strong>Network:</strong> Sepolia Testnet (Chain ID: 11155111)</p>
          <p><strong>Primary Gateway:</strong> gateway.lighthouse.storage</p>
          <p><strong>Fallback Gateway:</strong> ipfs.io</p>
          <p><strong>Lighthouse API Key:</strong> {import.meta.env.VITE_LIGHTHOUSE_API_KEY || '239777d2.c5fe3f8d06e34c27be7f7d5cf99f007d' ? 'Configured ✅' : 'Missing ❌'}</p>
        </div>
        
        {/* Network Switcher */}
        <div className="mt-4">
          <NetworkSwitcher onNetworkSwitch={() => runTests()} />
        </div>
      </div>

      {Object.values(tests).every(test => test.status === 'success') && (
        <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-500 text-xl">🎉</span>
            <div>
              <h3 className="font-semibold text-green-800">All Tests Passed!</h3>
              <p className="text-green-700 text-sm">
                Your configuration is ready. You can now create and view posts on the decentralized social media platform with permanent Lighthouse storage!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
