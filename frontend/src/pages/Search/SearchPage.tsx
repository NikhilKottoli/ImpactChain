import React, { useState } from 'react'
import { useEnsProfile, useEnsTexts } from '../../hooks/useEns'
import { EnsProfile } from '../../components/EnsProfile'
import { Search, User, Globe, Mail, Twitter, Github } from 'lucide-react'

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState<string | undefined>()
  
  // Convert search input to address if it looks like an address, otherwise treat as ENS name
  const isAddress = searchInput.startsWith('0x') && searchInput.length === 42
  const address = isAddress ? searchInput as `0x${string}` : undefined
  const name = !isAddress ? searchInput : undefined
  
  const { name: ensName, avatar } = useEnsProfile(address)
  const textRecords = useEnsTexts(ensName || name, ['url', 'email', 'twitter', 'github', 'description'])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim())
    }
  }
  
  const displayName = ensName || name || searchQuery
  const displayAddress = address || (ensName ? undefined : searchQuery)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ENS Profile Search</h1>
          <p className="text-gray-600">Look up ENS names and Ethereum addresses to view their profiles</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter ENS name (e.g., vitalik.eth) or Ethereum address"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchQuery && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <EnsProfile 
                address={displayAddress as `0x${string}`}
                name={displayName}
                size="lg"
                showAddress={false}
                className="mb-4"
              />
            </div>

            {/* Text Records */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textRecords.url && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Website</p>
                      <a 
                        href={textRecords.url.startsWith('http') ? textRecords.url : `https://${textRecords.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {textRecords.url}
                      </a>
                    </div>
                  </div>
                )}

                {textRecords.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <a 
                        href={`mailto:${textRecords.email}`}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        {textRecords.email}
                      </a>
                    </div>
                  </div>
                )}

                {textRecords.twitter && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Twitter</p>
                      <a 
                        href={`https://twitter.com/${textRecords.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        @{textRecords.twitter}
                      </a>
                    </div>
                  </div>
                )}

                {textRecords.github && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Github className="h-5 w-5 text-gray-700" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">GitHub</p>
                      <a 
                        href={`https://github.com/${textRecords.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        {textRecords.github}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {textRecords.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm">{textRecords.description}</p>
                </div>
              )}

              {Object.values(textRecords).every(value => !value) && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No additional profile information found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Tips */}
        {!searchQuery && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Enter an ENS name like <code className="bg-gray-100 px-2 py-1 rounded">vitalik.eth</code></p>
              <p>• Or enter a full Ethereum address like <code className="bg-gray-100 px-2 py-1 rounded">0x1234...</code></p>
              <p>• View profile information, social links, and text records</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
