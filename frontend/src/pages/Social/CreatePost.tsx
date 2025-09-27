import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PostCreatorWithLighthouse } from "../../components/PostCreatorWithLighthouse";
import { SimpleCreatePost } from "../../components/SimpleCreatePost";
import { WalletConnect } from "../../components/WalletConnect";
import { useWallet } from "../../hooks/useContract";

export default function CreatePost() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [hasLighthouseKey, setHasLighthouseKey] = useState(true); // Lighthouse has default key

  useEffect(() => {
    // Check if Lighthouse API key is configured (we have a default one)
    const apiKey =
      import.meta.env.VITE_LIGHTHOUSE_API_KEY ||
      "239777d2.c5fe3f8d06e34c27be7f7d5cf99f007d";
    setHasLighthouseKey(!!apiKey);
  }, []);

  return (
    <div className="  pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/social")}
            className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 mb-4"
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
            Create New Post
          </h1>
          <p className="text-gray-600">
            Share your content on the decentralized social network
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 mb-6">
                You need to connect your Web3 wallet to create posts on the
                blockchain
              </p>
              <WalletConnect />
            </div>
          </div>
        ) : hasLighthouseKey ? (
          <PostCreatorWithLighthouse />
        ) : (
          <SimpleCreatePost />
        )}
      </div>
    </div>
  );
}
