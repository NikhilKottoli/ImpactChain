import React from 'react'
import { EnsSocialFeatures } from '../../components/EnsSocialFeatures'

export default function SocialFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnsSocialFeatures 
        currentUserAddress="0x742d35Cc6634C0532925a3b8D0C0C6"
        currentUserEnsName="example.eth"
      />
    </div>
  )
}
