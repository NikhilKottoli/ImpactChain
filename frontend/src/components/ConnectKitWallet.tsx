import React from 'react';
import { useAccount, useEnsName, useEnsAvatar, useConnect, useDisconnect } from 'wagmi';
import { formatAddress } from '../hooks/useENS';

// React 19 compatible wallet component with ENS integration
export const ENSWalletConnect: React.FC = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { data: ensName } = useEnsName({ 
    address,
    chainId: 1 
  });
  const { data: avatar } = useEnsAvatar({ 
    name: ensName,
    chainId: 1 
  });

  if (isConnecting) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border">
        <img
          src={avatar || '/default-avatar.svg'}
          alt={ensName || 'User avatar'}
          className="h-8 w-8 rounded-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-avatar.svg';
          }}
        />
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {ensName || formatAddress(address)}
          </span>
          {ensName && (
            <span className="text-xs text-gray-500 font-mono">
              {formatAddress(address)}
            </span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs text-red-600 hover:text-red-800 underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
};

// Simple account display component
export const ENSAccountDisplay: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ 
    address,
    chainId: 1 
  });
  const { data: avatar } = useEnsAvatar({ 
    name: ensName,
    chainId: 1 
  });

  if (!isConnected || !address) {
    return <ENSWalletConnect />;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm border">
      <img
        src={avatar || '/default-avatar.svg'}
        alt={ensName || 'User avatar'}
        className="h-8 w-8 rounded-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/default-avatar.svg';
        }}
      />
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {ensName || formatAddress(address)}
        </span>
        {ensName && (
          <span className="text-xs text-gray-500 font-mono">
            {formatAddress(address)}
          </span>
        )}
      </div>
    </div>
  );
};
