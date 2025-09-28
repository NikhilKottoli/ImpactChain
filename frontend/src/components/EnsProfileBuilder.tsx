import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Input from '@/components/Input'
import { EnsProfile } from '@/components/EnsProfile'
import { 
  Save, 
  Globe, 
  Mail, 
  Twitter, 
  Github, 
  User, 
  Link, 
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'

interface ProfileData {
  url?: string
  email?: string
  twitter?: string
  github?: string
  description?: string
  avatar?: string
}

interface ProfileBuilderProps {
  ensName?: string
  address?: `0x${string}`
  isOwner?: boolean
}

export const EnsProfileBuilder: React.FC<ProfileBuilderProps> = ({ 
  ensName, 
  address,
  isOwner = false 
}) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    url: '',
    email: '',
    twitter: '',
    github: '',
    description: '',
    avatar: ''
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      // Simulate saving profile data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would call the actual ENS text record update functions
      console.log('Saving profile data:', profileData)
      
      setSaveStatus('success')
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const textRecordFields = [
    {
      key: 'url' as keyof ProfileData,
      label: 'Website',
      icon: Globe,
      placeholder: 'https://example.com',
      description: 'Your personal or professional website'
    },
    {
      key: 'email' as keyof ProfileData,
      label: 'Email',
      icon: Mail,
      placeholder: 'contact@example.com',
      description: 'Contact email address'
    },
    {
      key: 'twitter' as keyof ProfileData,
      label: 'Twitter',
      icon: Twitter,
      placeholder: 'username',
      description: 'Twitter username (without @)'
    },
    {
      key: 'github' as keyof ProfileData,
      label: 'GitHub',
      icon: Github,
      placeholder: 'username',
      description: 'GitHub username'
    },
    {
      key: 'description' as keyof ProfileData,
      label: 'Bio',
      icon: User,
      placeholder: 'Tell us about yourself...',
      description: 'Short bio or description'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ENS Profile Builder
        </h1>
        <p className="text-gray-600">
          Customize your ENS profile with text records and social links
        </p>
      </div>

      {/* Profile Preview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Preview</CardTitle>
          <CardDescription>
            How your profile will appear to others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <EnsProfile 
              address={address}
              name={ensName}
              size="lg"
              showAddress={false}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                {profileData.description || 'No bio set'}
              </p>
              <div className="flex gap-4 text-sm">
                {profileData.url && (
                  <a href={profileData.url} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profileData.twitter && (
                  <a href={`https://twitter.com/${profileData.twitter}`} className="text-blue-400 hover:text-blue-600 flex items-center gap-1">
                    <Twitter className="h-4 w-4" />
                    @{profileData.twitter}
                  </a>
                )}
                {profileData.github && (
                  <a href={`https://github.com/${profileData.github}`} className="text-gray-600 hover:text-gray-800 flex items-center gap-1">
                    <Github className="h-4 w-4" />
                    {profileData.github}
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Editor */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Edit Profile Information</CardTitle>
          <CardDescription>
            Update your ENS text records to customize your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {textRecordFields.map((field) => {
              const IconComponent = field.icon
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IconComponent className="h-4 w-4 inline mr-2" />
                    {field.label}
                  </label>
                  <Input
                    value={profileData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {field.description}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !isOwner}
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
          
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 mt-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Profile saved successfully!</span>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 mt-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to save profile</span>
            </div>
          )}
          
          {!isOwner && (
            <div className="flex items-center gap-2 text-yellow-600 mt-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Only the ENS owner can edit this profile</span>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* ENS Registration */}
      <Card>
        <CardHeader>
          <CardTitle>ENS Registration</CardTitle>
          <CardDescription>
            Don't have an ENS name yet? Register one to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Get Your ENS Name</h3>
              <p className="text-blue-800 text-sm mb-3">
                Register a .eth domain to create your decentralized identity
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  Visit ENS App
                </Button>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>• ENS names cost approximately $5-50 per year</p>
              <p>• Names are registered for 1 year and can be renewed</p>
              <p>• You can set text records, avatars, and multi-chain addresses</p>
              <p>• ENS names work across all Ethereum-compatible networks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
