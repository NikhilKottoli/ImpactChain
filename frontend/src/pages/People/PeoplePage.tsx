import React, { useState } from 'react';
import { Search, User, Globe, ExternalLink, AlertCircle, Copy, Check, Users, UserCheck, MapPin, Calendar, Award, Link as LinkIcon } from 'lucide-react';
import { ENSSearch } from '../../components/ENSSearch';
import { ENSUserProfile, ENSUserProfileCompact } from '../../components/ENSUserProfile';
import { MultiChainAddresses, MultiChainBadges } from '../../components/MultiChainAddresses';
import { ENSTestingDashboard } from '../../components/ENSTestingDashboard';
import { useENSProfile, useENSTexts, formatAddress } from '../../hooks/useENS';

interface SearchResult {
  name?: string;
  address?: string;
  type: 'name' | 'address';
}

const PeoplePage: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'profiles' | 'testing'>('search');

  const handleSelect = (result: SearchResult) => {
    setSelectedResult(result);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">People & ENS</h1>
          <p className="text-gray-600">Discover and interact with ENS profiles, avatars, and rich metadata</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 flex">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Search
            </button>
            <button
              onClick={() => setActiveTab('profiles')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'profiles'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Profiles
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'testing'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <UserCheck className="h-4 w-4 inline mr-2" />
              Testing
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'search' && (
          <div className="space-y-8">
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search ENS Names or Addresses
                </label>
                <ENSSearch 
                  onSelect={handleSelect}
                  placeholder="Enter ENS name (e.g., vitalik.eth) or address..."
                  className="w-full"
                />
              </div>

              {/* Search Tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Search Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-1">ENS Names:</h4>
                    <ul className="space-y-1">
                      <li>• vitalik.eth</li>
                      <li>• nick.eth</li>
                      <li>• jefflau.eth</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Addresses:</h4>
                    <ul className="space-y-1">
                      <li>• 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</li>
                      <li>• 0x123...abc (partial)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {selectedResult && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Search Result</h2>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {selectedResult.type === 'name' ? (
                        <Globe className="h-6 w-6 text-blue-600" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {selectedResult.type === 'name' ? 'ENS Name' : 'Ethereum Address'}
                      </h3>
                      <p className="text-gray-600 font-mono">
                        {selectedResult.type === 'name' ? selectedResult.name : selectedResult.address}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(selectedResult.type === 'name' ? selectedResult.name! : selectedResult.address!)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {/* ENS Profile Details */}
                  {selectedResult.address && (
                    <ENSProfileDetails address={selectedResult.address} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="space-y-8">
            {/* Featured Profiles */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Featured ENS Profiles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['vitalik.eth', 'nick.eth', 'jefflau.eth'].map((ensName) => (
                  <div key={ensName} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                    <ENSUserProfileCompact 
                      address="0x0000000000000000000000000000000000000000" // Placeholder
                      className="text-center"
                    />
                    <div className="mt-4 text-center">
                      <h3 className="font-medium text-gray-900">{ensName}</h3>
                      <p className="text-sm text-gray-600">Ethereum Foundation</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Chain Addresses Demo */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Multi-Chain Addresses</h2>
              <MultiChainAddresses 
                addresses={{
                  ethereum: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
                  polygon: "0x1234567890123456789012345678901234567890",
                  arbitrum: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
                }}
                className="max-w-2xl"
              />
            </div>

            {/* Multi-Chain Address Demo */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Multi-Chain Address Integration</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <MultiChainBadges 
                    addresses={{
                      ethereum: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
                      polygon: "0x1234567890123456789012345678901234567890"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">ENS Testing Dashboard</h2>
            <ENSTestingDashboard />
          </div>
        )}
      </div>
    </div>
  );
};

// Component to show detailed ENS profile information
const ENSProfileDetails: React.FC<{ address: string }> = ({ address }) => {
  const { ensName, avatar, isLoading, hasENS } = useENSProfile(address);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!hasENS) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">No ENS name found</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          This address doesn't have an associated ENS name.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center gap-3">
        <img
          src={avatar || '/default-avatar.svg'}
          alt={ensName}
          className="h-10 w-10 rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/default-avatar.svg';
          }}
        />
        <div>
          <h4 className="font-medium text-green-900">{ensName}</h4>
          <p className="text-sm text-green-700 font-mono">{formatAddress(address)}</p>
        </div>
      </div>
    </div>
  );
};

export default PeoplePage;
