import { useEnsName, useEnsAvatar, useEnsText, useEnsAddress, useEnsResolver } from 'wagmi'
import { useState, useEffect } from 'react'
import { normalize } from 'viem/ens'

// Hook for getting ENS name and avatar with enhanced features
export const useENSProfile = (address?: string) => {
  const { data: ensName, isLoading: nameLoading, error: nameError } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1,
  })
  
  const { data: avatar, isLoading: avatarLoading, error: avatarError } = useEnsAvatar({
    name: ensName,
    chainId: 1,
  })

  // Get resolver info for advanced features
  const { data: resolver } = useEnsResolver({
    name: ensName,
    chainId: 1,
  })

  return {
    ensName,
    avatar,
    resolver,
    isLoading: nameLoading || avatarLoading,
    hasENS: !!ensName,
    errors: {
      name: nameError,
      avatar: avatarError
    }
  }
}

// Enhanced hook for reverse ENS resolution
export const useReverseENS = (name?: string) => {
  // Add validation to prevent empty labels
  const isValidInput = name && name.trim().length > 0 && !name.includes('..') && !name.startsWith('.') && !name.endsWith('.')
  
  let normalizedName: string | undefined
  try {
    normalizedName = isValidInput ? normalize(name) : undefined
  } catch (error) {
    normalizedName = undefined
  }
  
  const { data: address, isLoading, error } = useEnsAddress({
    name: normalizedName,
    chainId: 1,
  })

  return {
    address,
    isLoading,
    error,
    isValidName: !!normalizedName,
    isValidInput: !!isValidInput
  }
}

// Hook for getting multiple text records
export const useENSTexts = ({ name, keys }: { name?: string; keys: string[] }) => {
  const [texts, setTexts] = useState<Array<{ key: string; value: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Individual text record hooks
  const textResults = keys.map(key => 
    useEnsText({
      name,
      key,
      chainId: 1,
    })
  )

  useEffect(() => {
    if (!name) return

    setIsLoading(textResults.some(result => result.isLoading))
    
    const newTexts = keys.map((key, index) => ({
      key,
      value: textResults[index].data || ''
    })).filter(item => item.value)

    setTexts(newTexts)
  }, [name, ...textResults.map(r => r.data), ...textResults.map(r => r.isLoading)])

  return {
    data: texts,
    isLoading
  }
}

// Hook for advanced text records with standard keys
export const useStandardTextRecords = (name?: string) => {
  const standardKeys = [
    'email',
    'url', 
    'avatar',
    'description',
    'display',
    'keywords',
    'com.discord',
    'com.github',
    'com.reddit',
    'com.twitter',
    'org.telegram'
  ]

  return useENSTexts({ name, keys: standardKeys })
}

// Hook for contenthash (for decentralized websites)
export const useContentHash = (name?: string) => {
  const { data: contentHash, isLoading, error } = useEnsText({
    name,
    key: 'contenthash',
    chainId: 1,
  })

  // Parse contenthash to get IPFS/Swarm info
  const parseContentHash = (hash?: string) => {
    if (!hash) return null
    
    // Basic parsing for IPFS hashes (starts with 'ipfs://')
    if (hash.startsWith('ipfs://')) {
      return {
        protocol: 'ipfs',
        hash: hash.replace('ipfs://', ''),
        url: `https://ipfs.io/ipfs/${hash.replace('ipfs://', '')}`
      }
    }
    
    // Basic parsing for Swarm hashes
    if (hash.startsWith('bzz://')) {
      return {
        protocol: 'swarm',
        hash: hash.replace('bzz://', ''),
        url: `https://swarm-gateways.net/bzz/${hash.replace('bzz://', '')}`
      }
    }
    
    return { protocol: 'unknown', hash, url: null }
  }

  return {
    contentHash,
    parsedHash: parseContentHash(contentHash),
    isLoading,
    error,
    hasContentHash: !!contentHash
  }
}

// Hook for campaign-specific ENS data with enhanced features
export const useCampaignENS = (campaignId: string, creatorAddress?: string) => {
  const campaignDomain = `${campaignId}.campaigns.eth`
  
  const creatorProfile = useENSProfile(creatorAddress)
  const contentHash = useContentHash(campaignDomain)
  
  const campaignTexts = useENSTexts({
    name: campaignDomain,
    keys: [
      'description',
      'url',
      'com.twitter',
      'com.discord',
      'com.github',
      'org.telegram',
      'location',
      'campaign.category',
      'campaign.type',
      'campaign.goal',
      'campaign.startDate',
      'campaign.endDate',
      'campaign.requirements',
      'campaign.rewards'
    ]
  })

  return {
    campaignDomain,
    creatorProfile,
    campaignTexts,
    contentHash,
    isLoading: creatorProfile.isLoading || campaignTexts.isLoading || contentHash.isLoading
  }
}

// Utility function to format address
export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
