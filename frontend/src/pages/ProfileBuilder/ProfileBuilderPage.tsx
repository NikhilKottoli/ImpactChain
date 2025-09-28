import React from 'react'
import { EnsProfileBuilder } from '../../components/EnsProfileBuilder'

export default function ProfileBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnsProfileBuilder 
        ensName="example.eth"
        address="0x742d35Cc6634C0532925a3b8D0C0C6"
        isOwner={true}
      />
    </div>
  )
}
