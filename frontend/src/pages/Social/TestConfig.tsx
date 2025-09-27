import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigurationTest } from "../../components/ConfigurationTest";
import { TwitterDemo } from "../../components/TwitterDemo";

export default function TestConfig() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'config' | 'twitter'>('config');

  return (
    <div className="pt-20 overflow-y-scroll">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/social")}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Social Feed
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            System Testing Dashboard
          </h1>
          <p className="text-gray-600">
            Test and verify all platform integrations
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mt-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('config')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'config'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Configuration Test
              </button>
              <button
                onClick={() => setActiveTab('twitter')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'twitter'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Twitter Integration
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'config' && (
          <>
            <ConfigurationTest />
            <div className="mt-8 text-center">
              <div className="space-x-4">
                <button
                  onClick={() => navigate("/createpost")}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Create Test Post
                </button>
                <button
                  onClick={() => navigate("/social")}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  View Social Feed
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'twitter' && <TwitterDemo />}
      </div>
    </div>
  );
}
