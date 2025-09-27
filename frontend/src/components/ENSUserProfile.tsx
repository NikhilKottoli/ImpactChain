import React from 'react'
import { useENSProfile, formatAddress } from '../hooks/useENS'

interface ENSUserProfileProps {
  address: string
  showAddress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ENSUserProfile: React.FC<ENSUserProfileProps> = ({
  address,
  showAddress = true,
  size = 'md',
  className = ''
}) => {
  const { ensName, avatar, isLoading, hasENS } = useENSProfile(address)

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          {showAddress && <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={avatar || '/default-avatar.svg'}
        alt={ensName || formatAddress(address)}
        className={`${sizeClasses[size]} rounded-full object-cover bg-gray-100`}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/default-avatar.svg'
        }}
      />
      <div className="flex flex-col leading-tight">
        <span className={`font-semibold ${textSizeClasses[size]} ${hasENS ? 'text-blue-600' : 'text-gray-800'}`}>
          {ensName || formatAddress(address)}
        </span>
        {showAddress && ensName && (
          <span className="text-gray-500 text-xs font-mono">
            {formatAddress(address)}
          </span>
        )}
      </div>
    </div>
  )
}

// Compact version for lists
export const ENSUserProfileCompact: React.FC<{ address: string; className?: string }> = ({
  address,
  className = ''
}) => {
  const { ensName, avatar, hasENS } = useENSProfile(address)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={avatar || '/default-avatar.svg'}
        alt={ensName || formatAddress(address)}
        className="h-6 w-6 rounded-full object-cover bg-gray-100"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/default-avatar.svg'
        }}
      />
      <span className={`text-sm ${hasENS ? 'text-blue-600 font-medium' : 'text-gray-600 font-mono'}`}>
        {ensName || formatAddress(address)}
      </span>
    </div>
  )
}

// Avatar only version
export const ENSAvatar: React.FC<{ 
  address: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ address, size = 'md', className = '' }) => {
  const { ensName, avatar } = useENSProfile(address)

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <img
      src={avatar || '/default-avatar.svg'}
      alt={ensName || formatAddress(address)}
      className={`${sizeClasses[size]} rounded-full object-cover bg-gray-100 ${className}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.src = '/default-avatar.svg'
      }}
    />
  )
}
