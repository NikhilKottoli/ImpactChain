import React from 'react'
import { EnsCampaignPage } from '../../components/EnsCampaignPage'

export default function CampaignHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <EnsCampaignPage 
        campaignId="campaign-123"
        ensName="example.eth"
      />
    </div>
  )
}
