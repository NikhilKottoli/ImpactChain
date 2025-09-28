import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Input from '@/components/Input'
import { EnsProfile } from '@/components/EnsProfile'
import { 
  UserPlus, 
  Users, 
  Heart, 
  MessageCircle, 
  Search,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface FollowedUser {
  ensName: string
  address: string
  avatar?: string
  lastActivity: string
  isOnline: boolean
}

interface Mention {
  id: string
  from: string
  fromEnsName?: string
  content: string
  timestamp: string
  read: boolean
}

interface EnsSocialFeaturesProps {
  currentUserAddress?: `0x${string}`
  currentUserEnsName?: string
}

export const EnsSocialFeatures: React.FC<EnsSocialFeaturesProps> = ({
  currentUserAddress,
  currentUserEnsName
}) => {
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([
    {
      ensName: 'vitalik.eth',
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      lastActivity: '2 hours ago',
      isOnline: true
    },
    {
      ensName: 'nick.eth',
      address: '0x1234567890123456789012345678901234567890',
      lastActivity: '1 day ago',
      isOnline: false
    }
  ])
  
  const [mentions, setMentions] = useState<Mention[]>([
    {
      id: '1',
      from: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      fromEnsName: 'vitalik.eth',
      content: 'Great work on the campaign! @you',
      timestamp: '1 hour ago',
      read: false
    },
    {
      id: '2',
      from: '0x1234567890123456789012345678901234567890',
      fromEnsName: 'nick.eth',
      content: 'Thanks for the support! @you',
      timestamp: '3 hours ago',
      read: true
    }
  ])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollow = async (address: string, ensName: string) => {
    setIsFollowing(true)
    try {
      // Simulate follow action
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newFollow: FollowedUser = {
        ensName,
        address,
        lastActivity: 'now',
        isOnline: true
      }
      
      setFollowedUsers(prev => [...prev, newFollow])
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setIsFollowing(false)
    }
  }

  const handleUnfollow = (address: string) => {
    setFollowedUsers(prev => prev.filter(user => user.address !== address))
  }

  const markMentionAsRead = (mentionId: string) => {
    setMentions(prev => 
      prev.map(mention => 
        mention.id === mentionId ? { ...mention, read: true } : mention
      )
    )
  }

  const unreadMentionsCount = mentions.filter(m => !m.read).length

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ENS Social Features
        </h1>
        <p className="text-gray-600">
          Follow users by ENS name and get notified when mentioned
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follow Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Follow Users
            </CardTitle>
            <CardDescription>
              Follow other users by their ENS name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ENS name..."
                  className="flex-1"
                />
                <Button size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {searchQuery && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <EnsProfile 
                      address={searchQuery.includes('0x') ? searchQuery as `0x${string}` : undefined}
                      name={searchQuery.includes('0x') ? undefined : searchQuery}
                      size="sm"
                      showAddress={true}
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleFollow(
                        searchQuery.includes('0x') ? searchQuery : '0x0000000000000000000000000000000000000000',
                        searchQuery.includes('0x') ? '' : searchQuery
                      )}
                      disabled={isFollowing}
                    >
                      Follow
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Following List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Following ({followedUsers.length})
            </CardTitle>
            <CardDescription>
              Users you're following
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {followedUsers.map((user) => (
                <div key={user.address} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <EnsProfile 
                      address={user.address as `0x${string}`}
                      name={user.ensName}
                      size="sm"
                      showAddress={false}
                    />
                    <div className="text-xs text-gray-500">
                      {user.lastActivity}
                      {user.isOnline && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUnfollow(user.address)}
                  >
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mentions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Mentions
              {unreadMentionsCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadMentionsCount}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              When others mention you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mentions.map((mention) => (
                <div 
                  key={mention.id} 
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    mention.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                  }`}
                  onClick={() => markMentionAsRead(mention.id)}
                >
                  <div className="flex items-start gap-3">
                    <EnsProfile 
                      address={mention.from as `0x${string}`}
                      name={mention.fromEnsName}
                      size="sm"
                      showAddress={false}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{mention.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{mention.timestamp}</p>
                    </div>
                    {!mention.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mention System Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How ENS Mentions Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Following Users</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Follow users by ENS name or address
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Get notified of their new posts and activities
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  See their online status and last activity
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Mention System</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Mention users with @ensname.eth in posts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Get real-time notifications when mentioned
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Track mention history and engagement
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
