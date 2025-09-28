// NetworkSwitcher.tsx

import React, { useState } from 'react';
// 🛑 IMPORTANT: Assuming this file now exports WORLD_CHAIN_CONFIG
import { WORLD_CHAIN_CONFIG } from '../utils/contract'; 

interface NetworkSwitcherProps {
  onNetworkSwitch?: () => void;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ onNetworkSwitch }) => {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetChainName = WORLD_CHAIN_CONFIG.chainName; // "World Chain"

  const switchToWorldChain = async () => {
    setIsSwitching(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      // Try to switch to World Chain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WORLD_CHAIN_CONFIG.chainId }],
      });

      onNetworkSwitch?.();
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            // 🛑 Use the complete WORLD_CHAIN_CONFIG object here
            params: [WORLD_CHAIN_CONFIG], 
          });
          onNetworkSwitch?.();
        } catch (addError) {
          // 🛑 Updated error message
          setError(`Failed to add ${targetChainName} network to wallet.`);
        }
      } else {
        // 🛑 Updated error message
        setError(`Failed to switch to ${targetChainName}: ${error.message}`);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-sm font-medium text-blue-900 mb-2">🌐 Network Configuration</h3>
      <p className="text-xs text-blue-800 mb-3">
        {/* 🛑 Updated text */}
        This app requires the **{targetChainName}** network for contract interactions.
      </p>
      
      <button
        onClick={switchToWorldChain} // 🛑 Updated function call
        disabled={isSwitching}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm"
      >
        {/* 🛑 Updated text */}
        {isSwitching ? 'Switching...' : `Switch to ${targetChainName}`}
      </button>

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-200 text-red-700 rounded text-xs">
          {error}
        </div>
      )}

      <div className="mt-3 text-xs text-blue-700">
        <p><strong>{targetChainName} Details:</strong></p>
        {/* 🛑 Updated details to pull from the config object */}
        <p>• Chain ID: {parseInt(WORLD_CHAIN_CONFIG.chainId, 16)}</p>
        <p>• RPC: {WORLD_CHAIN_CONFIG.rpcUrls[0]}</p>
        <p>• Explorer: {WORLD_CHAIN_CONFIG.blockExplorerUrls[0]}</p>
      </div>
    </div>
  );
};