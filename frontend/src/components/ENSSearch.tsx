import React, { useState, useEffect, useRef } from 'react'
import { Search, User, Globe, ExternalLink, AlertCircle } from 'lucide-react'
import { useReverseENS, useENSProfile, formatAddress } from '../hooks/useENS'

interface ENSSearchProps {
  onSelect?: (result: { name?: string; address?: string; type: 'name' | 'address' }) => void
  placeholder?: string
  className?: string
}

export const ENSSearch: React.FC<ENSSearchProps> = ({
  onSelect,
  placeholder = 'Search ENS names or addresses...',
  className = ''
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchType, setSearchType] = useState<'name' | 'address' | 'unknown'>('unknown')
  const searchRef = useRef<HTMLDivElement>(null)

  // Determine if query is an address or ENS name
  useEffect(() => {
    if (!query) {
      setSearchType('unknown')
      return
    }

    if (query.startsWith('0x') && query.length === 42) {
      setSearchType('address')
    } else if (query.includes('.eth') || query.includes('.')) {
      setSearchType('name')
    } else {
      setSearchType('unknown')
    }
  }, [query])

  // ENS resolution hooks with validation
  const reverseENS = useReverseENS(searchType === 'name' ? query : undefined)
  const ensProfile = useENSProfile(searchType === 'address' ? query : undefined)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result: { name?: string; address?: string; type: 'name' | 'address' }) => {
    onSelect?.(result)
    setIsOpen(false)
    setQuery('')
  }

  const isLoading = reverseENS.isLoading || ensProfile.isLoading
  const hasResults = (searchType === 'name' && reverseENS.address) || 
                    (searchType === 'address' && ensProfile.ensName)

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          placeholder={placeholder}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {!isLoading && searchType === 'unknown' && (
            <div className="p-4 text-center text-gray-500">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Enter a valid ENS name (.eth) or Ethereum address</p>
            </div>
          )}

          {/* Address -> ENS Name Results */}
          {!isLoading && searchType === 'address' && (
            <>
              {ensProfile.ensName ? (
                <div
                  onClick={() => handleSelect({ name: ensProfile.ensName!, address: query, type: 'address' })}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ensProfile.avatar || '/default-avatar.svg'}
                      alt={ensProfile.ensName}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600">{ensProfile.ensName}</span>
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{formatAddress(query)}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <User className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No ENS name found for this address</p>
                  <button
                    onClick={() => handleSelect({ address: query, type: 'address' })}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Use address anyway
                  </button>
                </div>
              )}
            </>
          )}

          {/* ENS Name -> Address Results */}
          {!isLoading && searchType === 'name' && (
            <>
              {reverseENS.error || !reverseENS.isValidInput ? (
                <div className="p-4 text-center text-red-500">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                  <p className="text-sm">Invalid ENS name format</p>
                </div>
              ) : reverseENS.address ? (
                <div
                  onClick={() => handleSelect({ name: query, address: reverseENS.address!, type: 'name' })}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600">{query}</span>
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{formatAddress(reverseENS.address)}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ) : reverseENS.error ? (
                <div className="p-4 text-center text-gray-500">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                  <p className="text-sm">ENS name not found or invalid</p>
                </div>
              ) : null}
            </>
          )}

          {/* No results */}
          {!isLoading && !hasResults && searchType !== 'unknown' && (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for inline use
export const ENSSearchCompact: React.FC<{
  onSelect: (result: string) => void
  placeholder?: string
}> = ({ onSelect, placeholder = 'ENS name or address' }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSelect(query.trim())
      setQuery('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim()}
        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm rounded transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}
