import React, { useState, useEffect, useCallback } from 'react';
import { walletConnection } from '../utils/wallet';
import { formatAddress } from '../utils/wallet';

export const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Centralized function to check and update connection status
  const checkConnection = useCallback(async () => {
    try {
      // NOTE: We rely on walletConnection.getProvider() to be set by connect()
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
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Connecting wallet...');
      // This calls connect() which includes the MetaMask try/catch/fallback logic
      const { address } = await walletConnection.connect(); 
      console.log('Wallet connected:', address);
      
      setAddress(address);
      setIsConnected(true);
      
      // Since the contract initialization happens after connect in useWallet hook,
      // we don't call it here, but we rely on its success for transactions.

    } catch (err) {
      console.error('Error connecting wallet:', err);
      // The error can now come from EITHER the browser connect OR the RPC fallback
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // This assumes walletConnection.disconnect() handles cleanup for both types
    walletConnection.disconnect();
    setIsConnected(false);
    setAddress(null);
    setError(null);
    
    // Force a UI refresh to clear any lingering connection state
    // window.location.reload(); // Optional, but can ensure clean slate
  }, []);

  // Set up connection check and listeners on mount
  useEffect(() => {
    // 1. Initial check (also handles post-fallback state check)
    checkConnection();
    
    // 2. Set up listeners ONLY if the browser provider object exists.
    // RPC fallback connections cannot use these listeners.
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        // If accounts are available, check the full connection status
        if (accounts.length > 0) {
            checkConnection(); 
        } else {
            // No accounts means explicit disconnect or lock
            disconnect();
        }
      };
  
      const handleChainChanged = () => {
        // This is necessary for the browser wallet to reset its provider on network change
        window.location.reload();
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        // Cleanup listeners
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      };
    }

    // Return empty cleanup if window.ethereum doesn't exist (RPC fallback scenario)
    return () => {};
  }, [checkConnection, disconnect]);


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
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium hidden md:inline-block"
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