import { useEnsName, useEnsAvatar, useEnsText } from 'wagmi'

export const useEnsProfile = (address?: `0x${string}`) => {
  const { data: name } = useEnsName({ address, chainId: 1 })
  const { data: avatar } = useEnsAvatar({ name, chainId: 1 })
  
  return {
    name,
    avatar,
    address,
  }
}

export const useEnsTexts = (name?: string, keys?: string[]) => {
  const textRecords: Record<string, string | undefined> = {}
  
  keys?.forEach(key => {
    const { data } = useEnsText({ name, key, chainId: 1 })
    textRecords[key] = data
  })
  
  return textRecords
}

export const useEnsAddresses = (name?: string, coinTypes?: number[]) => {
  // This would require additional implementation for multi-chain address resolution
  // For now, we'll focus on the basic ENS name and avatar functionality
  return {}
}
