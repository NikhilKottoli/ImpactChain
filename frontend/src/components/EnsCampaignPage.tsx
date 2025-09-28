import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { EnsProfile } from '@/components/EnsProfile'
import { 
  Star, 
  Trophy, 
  Award, 
  TrendingUp, 
  Users, 
  Target,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react'

interface CampaignReputation {
  ensName: string
  address: string
  reputationScore: number
  campaignsCreated: number
  campaignsCompleted: number
  totalContributed: number
  badges: string[]
  level: string
}

interface EnsCampaignPageProps {
  campaignId: string
  ensName?: string
}

export const EnsCampaignPage: React.FC<EnsCampaignPageProps> = ({ 
  campaignId, 
  ensName 
}) => {
  const [reputationData] = useState<CampaignReputation[]>([
    {
      ensName: 'vitalik.eth',
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      reputationScore: 95,
      campaignsCreated: 12,
      campaignsCompleted: 8,
      totalContributed: 5.2,
      badges: ['Founder', 'Early Adopter', 'Community Leader'],
      level: 'Legendary'
    },
    {
      ensName: 'nick.eth',
      address: '0x1234567890123456789012345678901234567890',
      reputationScore: 78,
      campaignsCreated: 5,
      campaignsCompleted: 3,
      totalContributed: 2.1,
      badges: ['Contributor', 'Verifier'],
      level: 'Expert'
    }
  ])

  const getReputationColor = (score: number) => {
    if (score >= 90) return 'text-purple-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legendary': return 'bg-purple-100 text-purple-800'
      case 'Expert': return 'bg-blue-100 text-blue-800'
      case 'Advanced': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ENS Campaign Hub
        </h1>
        <p className="text-gray-600">
          Campaign pages powered by ENS identities and reputation
        </p>
      </div>

      {/* Campaign Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Overview
          </CardTitle>
          <CardDescription>
            Campaign details and participant information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Campaign Creator</h3>
                <EnsProfile 
                  address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                  name="vitalik.eth"
                  size="md"
                  showAddress={false}
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Bounty Payer</h3>
                <EnsProfile 
                  address="0x1234567890123456789012345678901234567890"
                  name="nick.eth"
                  size="md"
                  showAddress={false}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Bounty Amount:</span>
                <span className="font-semibold">0.5 ETH</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Participants:</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Deadline:</span>
                <span className="font-semibold">Dec 31, 2024</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Progress:</span>
                <span className="font-semibold">75%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputation Leaderboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Reputation Leaderboard
          </CardTitle>
          <CardDescription>
            Top contributors ranked by reputation score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reputationData.map((user, index) => (
              <div key={user.address} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <EnsProfile 
                    address={user.address as `0x${string}`}
                    name={user.ensName}
                    size="md"
                    showAddress={false}
                  />
                  <div className="text-sm text-gray-600">
                    <span className={`font-semibold ${getReputationColor(user.reputationScore)}`}>
                      {user.reputationScore}/100
                    </span>
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-200">
                      {user.level}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{user.campaignsCreated}</div>
                    <div className="text-xs">Created</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{user.campaignsCompleted}</div>
                    <div className="text-xs">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{user.totalContributed} ETH</div>
                    <div className="text-xs">Contributed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge System */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievement Badges
          </CardTitle>
          <CardDescription>
            Earn badges for campaign participation and contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Founder', description: 'Created 10+ campaigns', icon: Star, earned: true },
              { name: 'Contributor', description: 'Completed 5+ campaigns', icon: CheckCircle, earned: true },
              { name: 'Verifier', description: 'Verified 20+ campaigns', icon: Award, earned: false },
              { name: 'Community Leader', description: 'Top 10% reputation', icon: Trophy, earned: true },
              { name: 'Early Adopter', description: 'Joined in first month', icon: TrendingUp, earned: true },
              { name: 'Philanthropist', description: 'Donated 10+ ETH', icon: DollarSign, earned: false },
              { name: 'Consistency', description: 'Active for 6+ months', icon: Calendar, earned: false },
              { name: 'Team Player', description: 'Collaborated on 15+ campaigns', icon: Users, earned: false }
            ].map((badge) => (
              <div 
                key={badge.name}
                className={`p-4 rounded-lg border-2 transition-all ${
                  badge.earned 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <badge.icon className={`h-5 w-5 ${badge.earned ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-semibold ${badge.earned ? 'text-green-800' : 'text-gray-500'}`}>
                    {badge.name}
                  </span>
                </div>
                <p className={`text-xs ${badge.earned ? 'text-green-700' : 'text-gray-500'}`}>
                  {badge.description}
                </p>
                {badge.earned && (
                  <div className="mt-2 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Earned</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reputation Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Reputation Benefits</CardTitle>
          <CardDescription>
            How reputation affects your experience on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 mb-2">Higher Visibility</h3>
              <p className="text-sm text-blue-800">
                High-reputation users appear first in search results and recommendations
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900 mb-2">Priority Access</h3>
              <p className="text-sm text-green-800">
                Get early access to new campaigns and exclusive opportunities
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900 mb-2">Governance Rights</h3>
              <p className="text-sm text-purple-800">
                Participate in platform governance and decision-making processes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
