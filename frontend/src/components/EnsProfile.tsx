import React from 'react'
import { useEnsProfile } from '../hooks/useEns'

interface EnsProfileProps {
  address?: `0x${string}`
  name?: string
  showAddress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const EnsProfile: React.FC<EnsProfileProps> = ({ 
  address, 
  name, 
  showAddress = true, 
  size = 'md',
  className = ''
}) => {
  const { name: ensName, avatar } = useEnsProfile(address)
  
  const displayName = ensName || name || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown')
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={avatar || '/img/fallback-avatar.svg'} 
        className={`${sizeClasses[size]} rounded-full`}
        alt={`${displayName} avatar`}
        onError={(e) => {
          e.currentTarget.src = '/img/fallback-avatar.svg'
        }}
      />
      <div className="flex flex-col leading-none">
        <span className={`font-semibold ${textSizeClasses[size]}`}>
          {displayName}
        </span>
        {showAddress && address && (
          <span className={`text-gray-500 ${textSizeClasses[size]}`}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        )}
      </div>
    </div>
  )
}
