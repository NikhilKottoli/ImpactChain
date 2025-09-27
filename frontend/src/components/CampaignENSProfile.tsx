import React from 'react'
import { ExternalLink, MapPin, Users, Target, Twitter, Globe, Github, MessageCircle, Calendar, Award, FileText, Link } from 'lucide-react'
import { useCampaignENS } from '../hooks/useENS'
import { ENSUserProfile } from './ENSUserProfile'

interface CampaignENSProfileProps {
  campaignId: string
  creatorAddress: string
  className?: string
}

export const CampaignENSProfile: React.FC<CampaignENSProfileProps> = ({
  campaignId,
  creatorAddress,
  className = ''
}) => {
  const { campaignDomain, creatorProfile, campaignTexts, contentHash, isLoading } = useCampaignENS(
    campaignId,
    creatorAddress
  )

  const getTextValue = (key: string) => {
    return campaignTexts.data?.find(item => item.key === key)?.value
  }

  const getIconForKey = (key: string) => {
    switch (key) {
      case 'location':
        return <MapPin className="h-4 w-4" />
      case 'com.twitter':
        return <Twitter className="h-4 w-4" />
      case 'com.github':
        return <Github className="h-4 w-4" />
      case 'com.discord':
        return <MessageCircle className="h-4 w-4" />
      case 'org.telegram':
        return <MessageCircle className="h-4 w-4" />
      case 'url':
        return <Globe className="h-4 w-4" />
      case 'campaign.category':
        return <Target className="h-4 w-4" />
      case 'campaign.goal':
        return <Users className="h-4 w-4" />
      case 'campaign.startDate':
      case 'campaign.endDate':
        return <Calendar className="h-4 w-4" />
      case 'campaign.rewards':
        return <Award className="h-4 w-4" />
      case 'campaign.requirements':
        return <FileText className="h-4 w-4" />
      case 'description':
        return <FileText className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  const formatKey = (key: string) => {
    const keyMap: { [key: string]: string } = {
      'description': 'Description',
      'url': 'Website',
      'com.twitter': 'Twitter',
      'com.github': 'GitHub',
      'com.discord': 'Discord',
      'org.telegram': 'Telegram',
      'location': 'Location',
      'campaign.category': 'Category',
      'campaign.type': 'Type',
      'campaign.goal': 'Goal',
      'campaign.startDate': 'Start Date',
      'campaign.endDate': 'End Date',
      'campaign.requirements': 'Requirements',
      'campaign.rewards': 'Rewards'
    }
    return keyMap[key] || key
  }

  const getLinkUrl = (key: string, value: string) => {
    switch (key) {
      case 'com.twitter':
        return `https://twitter.com/${value.replace('@', '')}`
      case 'com.github':
        return `https://github.com/${value.replace('@', '')}`
      case 'org.telegram':
        return `https://t.me/${value.replace('@', '')}`
      case 'url':
        return value.startsWith('http') ? value : `https://${value}`
      default:
        return value.startsWith('http') ? value : null
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Campaign Domain Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">Campaign Domain</h3>
        </div>
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <code className="text-blue-700 font-mono text-sm">{campaignDomain}</code>
          <button
            onClick={() => navigator.clipboard.writeText(campaignDomain)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Copy domain"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Creator Profile */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Campaign Creator</h4>
        <ENSUserProfile address={creatorAddress} size="md" />
      </div>

      {/* Decentralized Website Content Hash */}
      {contentHash.hasContentHash && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Decentralized Website</h4>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Link className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                {contentHash.parsedHash?.protocol?.toUpperCase()} Content
              </span>
            </div>
            {contentHash.parsedHash?.url && (
              <a
                href={contentHash.parsedHash.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline text-sm break-all"
              >
                View Decentralized Site
              </a>
            )}
            <p className="text-xs text-purple-600 mt-1 font-mono break-all">
              {contentHash.parsedHash?.hash}
            </p>
          </div>
        </div>
      )}

      {/* ENS Text Records */}
      {campaignTexts.data && campaignTexts.data.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Campaign Metadata</h4>
          <div className="space-y-3">
            {campaignTexts.data.map(({ key, value }) => {
              const linkUrl = getLinkUrl(key, value)
              return (
                <div key={key} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getIconForKey(key)}
                    <span className="text-sm font-medium text-gray-600">
                      {formatKey(key)}:
                    </span>
                  </div>
                  <div className="text-sm text-gray-800 text-right min-w-0 flex-1">
                    {linkUrl ? (
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="break-words">{value}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No ENS Data Message */}
      {(!campaignTexts.data || campaignTexts.data.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No ENS metadata found for this campaign</p>
          <p className="text-xs mt-1">
            Set up ENS records at {campaignDomain} to display campaign information
          </p>
        </div>
      )}
    </div>
  )
}

// Compact version for campaign cards
export const CampaignENSBadge: React.FC<{
  campaignId: string
  className?: string
}> = ({ campaignId, className = '' }) => {
  const campaignDomain = `${campaignId}.campaigns.eth`

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs ${className}`}>
      <Globe className="h-3 w-3" />
      <code className="font-mono">{campaignDomain}</code>
    </div>
  )
}
