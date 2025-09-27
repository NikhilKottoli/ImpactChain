import React from "react";
import { useNavigate } from "react-router-dom";
import { ConfigurationTest } from "../../components/ConfigurationTest";

export default function TestConfig() {
  const navigate = useNavigate();

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
            System Configuration Test
          </h1>
          <p className="text-gray-600">
            Verify that all components are properly configured
          </p>
        </div>

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
      </div>
    </div>
  );
}
