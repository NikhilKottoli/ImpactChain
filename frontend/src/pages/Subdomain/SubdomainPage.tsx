import React from 'react'
import { SubdomainManager } from '../../components/SubdomainManager'

export default function SubdomainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <SubdomainManager 
        parentDomain="example.eth"
        isOwner={true}
      />
    </div>
  )
}
