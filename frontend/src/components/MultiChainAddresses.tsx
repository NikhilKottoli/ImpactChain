import React from 'react'
import { Copy, ExternalLink } from 'lucide-react'
import { formatAddress } from '../hooks/useENS'

// Chain configurations
const SUPPORTED_CHAINS = {
  60: { name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500', explorer: 'https://etherscan.io' },
  137: { name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-500', explorer: 'https://polygonscan.com' },
  42161: { name: 'Arbitrum', symbol: 'ARB', color: 'bg-blue-600', explorer: 'https://arbiscan.io' },
  8453: { name: 'Base', symbol: 'BASE', color: 'bg-blue-400', explorer: 'https://basescan.org' },
  10: { name: 'Optimism', symbol: 'OP', color: 'bg-red-500', explorer: 'https://optimistic.etherscan.io' }
}

interface Address {
  coinType: number
  address: string
}

interface MultiChainAddressesProps {
  addresses: Address[]
  title?: string
  className?: string
}

export const MultiChainAddresses: React.FC<MultiChainAddressesProps> = ({
  addresses,
  title = 'Multi-Chain Addresses',
  className = ''
}) => {
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
    // You could add a toast notification here
  }

  const openInExplorer = (coinType: number, address: string) => {
    const chain = SUPPORTED_CHAINS[coinType as keyof typeof SUPPORTED_CHAINS]
    if (chain?.explorer) {
      window.open(`${chain.explorer}/address/${address}`, '_blank')
    }
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <ExternalLink className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm">No multi-chain addresses configured</p>
          <p className="text-xs mt-1">Add addresses to ENS records to display them here</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map(({ coinType, address }) => {
          const chain = SUPPORTED_CHAINS[coinType as keyof typeof SUPPORTED_CHAINS]
          
          if (!chain) return null

          return (
            <div
              key={coinType}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Chain Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 ${chain.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">
                    {chain.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{chain.name}</h4>
                  <p className="text-xs text-gray-500">{chain.symbol}</p>
                </div>
              </div>

              {/* Address */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded font-mono text-sm">
                  <span className="flex-1 truncate" title={address}>
                    {formatAddress(address)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(address)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openInExplorer(coinType, address)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on Explorer
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add More Chains Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ExternalLink className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Add More Chains</h4>
            <p className="text-xs text-blue-600 mt-1">
              Configure additional chain addresses in your ENS records to support more networks.
              Supported chains: Ethereum, Polygon, Arbitrum, Base, Optimism.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact version for campaign cards
export const MultiChainBadges: React.FC<{
  addresses: Address[]
  maxDisplay?: number
  className?: string
}> = ({ addresses, maxDisplay = 3, className = '' }) => {
  const displayAddresses = addresses.slice(0, maxDisplay)
  const hasMore = addresses.length > maxDisplay

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {displayAddresses.map(({ coinType }) => {
        const chain = SUPPORTED_CHAINS[coinType as keyof typeof SUPPORTED_CHAINS]
        if (!chain) return null

        return (
          <div
            key={coinType}
            className={`inline-flex items-center gap-1 px-2 py-1 ${chain.color} text-white rounded-full text-xs`}
            title={`${chain.name} address available`}
          >
            <span className="font-medium">{chain.symbol}</span>
          </div>
        )
      })}
      
      {hasMore && (
        <div className="inline-flex items-center px-2 py-1 bg-gray-500 text-white rounded-full text-xs">
          +{addresses.length - maxDisplay} more
        </div>
      )}
    </div>
  )
}
