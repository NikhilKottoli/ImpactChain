import React, { useState } from 'react';
import { Card } from './ui/card';
import { TwitterShareButton, TwitterShareImpactChain, TwitterShareSocialPost, TwitterShareCampaign } from './TwitterShareButton';
import { TwitterShareFallback, TwitterShareImpactChainFallback } from './TwitterShareFallback';
import { Upload, Twitter, AlertCircle, CheckCircle } from 'lucide-react';

export const TwitterDemo: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [customText, setCustomText] = useState('');
  const [shareStatus, setShareStatus] = useState<string>('');

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSuccess = (response: any) => {
    setShareStatus('✅ Successfully shared on Twitter!');
    console.log('Twitter share success:', response);
  };

  const handleError = (error: string) => {
    setShareStatus(`❌ Error: ${error}`);
    console.error('Twitter share error:', error);
  };

  // Sample data for demo
  const samplePost = {
    title: "Community River Cleanup",
    description: "Organized a community cleanup at the local river, removing 50+ pounds of trash and debris. Making our waterways cleaner for wildlife and future generations! 🌊♻️",
    image: "/heropattern.png"
  };

  const sampleCampaign = {
    title: "Plant 1000 Trees Campaign",
    description: "Join us in our mission to plant 1000 trees in the city park. Help combat climate change while earning crypto rewards for your environmental impact! 🌱",
    image: "/heropattern.png"
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Twitter Integration Demo</h1>
        <p className="text-gray-600">Test the Twitter sharing functionality for ImpactChain</p>
      </div>

      {/* Status Display */}
      {shareStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          shareStatus.includes('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {shareStatus.includes('✅') ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {shareStatus}
        </div>
      )}

      {/* General ImpactChain Sharing */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Twitter className="w-6 h-6 text-blue-500" />
          General ImpactChain Sharing
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message (optional)
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add your own message to promote ImpactChain..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedImage && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedImage.name}
              </p>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <TwitterShareImpactChain
              text={customText}
              image={selectedImage || undefined}
              onSuccess={handleSuccess}
              onError={handleError}
            />
            <TwitterShareImpactChain
              text={customText}
              image={selectedImage || undefined}
              variant="icon"
              onSuccess={handleSuccess}
              onError={handleError}
            />
            <TwitterShareImpactChain
              text={customText}
              image={selectedImage || undefined}
              variant="minimal"
              onSuccess={handleSuccess}
              onError={handleError}
            />
            <TwitterShareImpactChainFallback
              variant="minimal"
              className="border border-gray-300"
            />
          </div>
        </div>
      </Card>

      {/* Social Post Sharing */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Social Post Sharing</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-900">{samplePost.title}</h3>
          <p className="text-gray-700 text-sm mt-1">{samplePost.description}</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <TwitterShareSocialPost
            title={samplePost.title}
            description={samplePost.description}
            image={samplePost.image}
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <TwitterShareSocialPost
            title={samplePost.title}
            description={samplePost.description}
            image={samplePost.image}
            variant="icon"
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <TwitterShareSocialPost
            title={samplePost.title}
            description={samplePost.description}
            image={samplePost.image}
            variant="minimal"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </Card>

      {/* Campaign Sharing */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Campaign Sharing</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-900">{sampleCampaign.title}</h3>
          <p className="text-gray-700 text-sm mt-1">{sampleCampaign.description}</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <TwitterShareCampaign
            title={sampleCampaign.title}
            description={sampleCampaign.description}
            image={sampleCampaign.image}
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <TwitterShareCampaign
            title={sampleCampaign.title}
            description={sampleCampaign.description}
            image={sampleCampaign.image}
            variant="icon"
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <TwitterShareCampaign
            title={sampleCampaign.title}
            description={sampleCampaign.description}
            image={sampleCampaign.image}
            variant="minimal"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </Card>

      {/* Custom Twitter Share */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Custom Twitter Share</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Tweet Text
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Write your custom tweet here..."
              id="customTweet"
            />
          </div>
          <TwitterShareButton
            text="🌍 Building the future of social impact with blockchain! Join ImpactChain to verify your good deeds and earn crypto rewards! #ImpactChain #Web3 #SocialGood"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">How to Use</h2>
        <div className="space-y-2 text-blue-800">
          <p>• <strong>API Method:</strong> Uses Twitter API v2 for direct posting (requires proper authentication)</p>
          <p>• <strong>Fallback Method:</strong> Opens Twitter in a new tab with pre-filled content (no authentication needed)</p>
          <p>• <strong>Image Support:</strong> Upload images to be included in tweets (API method only)</p>
          <p>• <strong>Variants:</strong> Default (full button), Icon (icon only), Minimal (text link style)</p>
        </div>
      </Card>

      {/* Configuration Info */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h2 className="text-xl font-semibold mb-4 text-green-900">✅ CORS-Safe Implementation</h2>
        <div className="space-y-2 text-green-800 text-sm">
          <p>• <strong>Web Intent Approach</strong>: Uses Twitter's web intent URLs</p>
          <p>• <strong>No CORS Issues</strong>: Opens Twitter in new tab</p>
          <p>• <strong>No API Keys Required</strong>: Works immediately</p>
          <p>• <strong>User Authentication</strong>: Users tweet with their own accounts</p>
          <p>• <strong>No Rate Limits</strong>: Not subject to API restrictions</p>
        </div>
      </Card>

      {/* CORS Explanation */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Why Web Intents?</h2>
        <div className="space-y-2 text-blue-800 text-sm">
          <p>• <strong>CORS Policy</strong>: Twitter API blocks direct browser requests</p>
          <p>• <strong>Security</strong>: Prevents unauthorized API access</p>
          <p>• <strong>OAuth Flow</strong>: Requires server-side authentication</p>
          <p>• <strong>Web Intents</strong>: Official Twitter solution for client-side sharing</p>
          <p>• <strong>User Experience</strong>: Users tweet with their own accounts</p>
        </div>
      </Card>
    </div>
  );
};

export default TwitterDemo;
