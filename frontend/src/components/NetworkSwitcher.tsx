import React, { useState } from 'react';
import { SEPOLIA_CONFIG } from '../utils/contract';

interface NetworkSwitcherProps {
  onNetworkSwitch?: () => void;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ onNetworkSwitch }) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchToSepolia = async () => {
    setIsSwitching(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      // Try to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });

      onNetworkSwitch?.();
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          });
          onNetworkSwitch?.();
        } catch (addError) {
          setError('Failed to add Sepolia network to MetaMask');
        }
      } else {
        setError(`Failed to switch to Sepolia: ${error.message}`);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-blue-900 mb-2">🌐 Network Configuration</h3>
      <p className="text-xs text-blue-800 mb-3">
        This app requires Sepolia testnet for contract interactions. Make sure you're connected to Sepolia.
      </p>
      
      <button
        onClick={switchToSepolia}
        disabled={isSwitching}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm"
      >
        {isSwitching ? 'Switching...' : 'Switch to Sepolia Testnet'}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-200 text-red-700 rounded text-xs">
          {error}
        </div>
      )}

      <div className="mt-3 text-xs text-blue-700">
        <p><strong>Sepolia Details:</strong></p>
        <p>• Chain ID: 11155111</p>
        <p>• RPC: https://sepolia.infura.io/v3/</p>
        <p>• Explorer: https://sepolia.etherscan.io</p>
      </div>
    </div>
  );
};
