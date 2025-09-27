import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PostCreatorWithLighthouse } from "../../components/PostCreatorWithLighthouse";
import { SimpleCreatePost } from "../../components/SimpleCreatePost";
import { WalletConnect } from "../../components/WalletConnect";
import { useWallet } from "../../hooks/useContract";
import { Button } from "../../components/ui/button";

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
    <div className="min-h-screen pt-20 flex flex-col md:flex-row px-4 md:px-32">
      {/* Left Column - fixed on desktop, top on mobile */}
      <div className="w-full md:w-1/3 md:fixed md:top-40 md:left-0 md:h-[calc(100vh-5rem)] md:overflow-y-auto p-4 md:p-8 md:ml-32">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/social")}
            className="mb-4 text-primary hover:text-primary/80"
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
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Create New Post
          </h1>
          <p className="text-muted-foreground">
            Share your content on the decentralized social network
          </p>

          <div className="mb-4 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <h3 className="text-sm font-medium text-accent-foreground mb-2">
              How Decentralized Storage Works
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <strong>Permanent Storage:</strong> Your files are stored
                forever with one-time payment
              </li>
              <li>
                <strong>Decentralized Network:</strong> Files stored across the
                Filecoin network for reliability and redundancy
              </li>
              <li>
                <strong>Fast Access:</strong> Optimized IPFS gateways for quick
                retrieval of your content
              </li>
              <li>
                <strong>No Recurring Costs:</strong> Pay once, store forever
              </li>
              <li>
                Images and metadata are uploaded to IPFS for permanent storage
              </li>
              <li>
                An NFT is minted on the blockchain containing your content's
                reference
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Column - scrollable, full width on mobile */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen overflow-y-auto mt-6 md:mt-0">
        <div className="p-4 md:p-8">
          {/* Wallet Connection Check */}
          {!isConnected ? (
            <div className="max-w-md mx-auto text-center py-8 md:py-12">
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
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
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground mb-6">
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

      <img
        src="/share.png"
        alt=""
        className="w-full md:w-[50%] object-contain md:fixed -bottom-[170px] left-0 hidden md:block"
      />
    </div>
  );
}
