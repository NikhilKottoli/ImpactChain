import React, { useState, useEffect } from 'react';
import { walletConnection } from '../utils/wallet';
import { formatAddress } from '../utils/wallet';

export const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
    
    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAddress(null);
      } else {
        checkConnection();
      }
    };

    // Listen for network changes
    const handleChainChanged = () => {
      window.location.reload();
    };

    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const checkConnection = async () => {
    try {
      await walletConnection.initializeProvider();
      const connected = await walletConnection.isConnected();
      if (connected) {
        const currentAddress = await walletConnection.getCurrentAccount();
        setAddress(currentAddress);
        setIsConnected(true);
        setError(null);
      } else {
        setIsConnected(false);
        setAddress(null);
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
      setIsConnected(false);
      setAddress(null);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Connecting wallet...');
      const { address } = await walletConnection.connect();
      console.log('Wallet connected:', address);
      
      setAddress(address);
      setIsConnected(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    walletConnection.disconnect();
    setIsConnected(false);
    setAddress(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-800 font-medium">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connect}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
      >
        Connect Wallet
      </button>
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};