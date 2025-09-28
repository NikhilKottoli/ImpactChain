import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Input from '@/components/Input'
import { EnsProfile } from '@/components/EnsProfile'
import { Plus, Trash2, Users, Settings, Globe } from 'lucide-react'

interface Subdomain {
  name: string
  owner: string
  resolver: string
  ttl: number
}

interface SubdomainManagerProps {
  parentDomain: string
  isOwner: boolean
}

export const SubdomainManager: React.FC<SubdomainManagerProps> = ({ 
  parentDomain, 
  isOwner 
}) => {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([
    {
      name: 'admin',
      owner: '0x742d35Cc6634C0532925a3b8D0C0C6',
      resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
      ttl: 300
    },
    {
      name: 'community',
      owner: '0x1234567890123456789012345678901234567890',
      resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
      ttl: 300
    }
  ])
  
  const [newSubdomain, setNewSubdomain] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSubdomain = async () => {
    if (!newSubdomain.trim() || !newOwner.trim()) return
    
    setIsCreating(true)
    try {
      // Simulate subdomain creation
      const subdomain: Subdomain = {
        name: newSubdomain.trim(),
        owner: newOwner.trim(),
        resolver: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
        ttl: 300
      }
      
      setSubdomains(prev => [...prev, subdomain])
      setNewSubdomain('')
      setNewOwner('')
    } catch (error) {
      console.error('Error creating subdomain:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteSubdomain = (name: string) => {
    setSubdomains(prev => prev.filter(sub => sub.name !== name))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subdomain Management
        </h1>
        <p className="text-gray-600">
          Manage subdomains for <span className="font-mono font-semibold">{parentDomain}</span>
        </p>
      </div>

      {/* Create New Subdomain */}
      {isOwner && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Subdomain
            </CardTitle>
            <CardDescription>
              Create a new subdomain and assign ownership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain Name
                </label>
                <div className="flex">
                  <Input
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value)}
                    placeholder="admin"
                    className="rounded-r-none"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                    .{parentDomain}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Address
                </label>
                <Input
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="0x..."
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateSubdomain}
              disabled={isCreating || !newSubdomain.trim() || !newOwner.trim()}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Subdomain'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Subdomains List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Existing Subdomains ({subdomains.length})
        </h2>
        
        {subdomains.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No subdomains created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subdomains.map((subdomain) => (
              <Card key={subdomain.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {subdomain.name}.{parentDomain}
                      </CardTitle>
                      <CardDescription>
                        TTL: {subdomain.ttl}s
                      </CardDescription>
                    </div>
                    {isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSubdomain(subdomain.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Owner</label>
                      <div className="mt-1">
                        <EnsProfile 
                          address={subdomain.owner as `0x${string}`}
                          size="sm"
                          showAddress={true}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Resolver</label>
                      <p className="text-sm text-gray-600 font-mono">
                        {subdomain.resolver.slice(0, 6)}...{subdomain.resolver.slice(-4)}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Transfer
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About Subdomains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              • Subdomains allow you to create hierarchical naming within your ENS domain
            </p>
            <p>
              • Each subdomain can have its own owner, resolver, and text records
            </p>
            <p>
              • Subdomains are useful for organizations, teams, or different services
            </p>
            <p>
              • Only the parent domain owner can create and manage subdomains
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
