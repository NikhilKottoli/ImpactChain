import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletConnect } from "../../components/WalletConnect";
import {
  useWallet,
  usePosts,
  useContract,
  useUserPosts,
} from "../../hooks/useContract";
import {
  IPFSImageViewer,
  PostImageViewer,
} from "../../components/IPFSImageViewer";
import { formatEther } from "../../utils/wallet";

export default function SocialMedia() {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { posts, isLoading, hasMore, loadMore, refresh } = usePosts(6);
  const [activeTab, setActiveTab] = useState<"feed" | "profile">("feed");

  return (
    <div className=" pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Decentralized Social Media
          </h1>
          <p className="text-gray-600 mb-6">
            Share your moments on the blockchain with IPFS storage
          </p>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-6 space-x-4">
            <WalletConnect />
            <button
              onClick={() => navigate("/testconfig")}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Test Config
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-8 space-x-4">
          <div className="bg-white rounded-lg p-1 shadow-md flex">
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "feed"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              disabled={!isConnected}
            >
              My Profile
            </button>
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => navigate("/createpost")}
            disabled={!isConnected}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create Post</span>
          </button>
        </div>

        {/* Content */}
        {!isConnected && activeTab !== "feed" && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
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
              <p className="text-gray-600 mb-4">
                Connect your Web3 wallet to view your profile and interact with
                the platform
              </p>
              <WalletConnect />
            </div>
          </div>
        )}

        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Latest Posts</h2>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md p-4 animate-pulse"
                  >
                    <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-300 h-4 rounded mb-2"></div>
                    <div className="bg-gray-300 h-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to create a post!
                </p>
                <button
                  onClick={() => navigate("/createpost")}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <PostCard key={post.tokenId} post={post} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMore}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Load More Posts
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && isConnected && (
          <div className="max-w-4xl mx-auto">
            <ProfileSection
              address={address!}
              onCreatePost={() => navigate("/createpost")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Post Card Component
interface PostCardProps {
  post: {
    tokenId: number;
    creator: string;
    timestamp: bigint;
    likes: number;
    isActive: boolean;
    totalEarnings: bigint;
    ipfsHash: string;
    title: string;
    description: string;
    aiLabels: string[];
  };
}

function PostCard({ post }: PostCardProps) {
  const { likePost, cheerPost } = useContract();
  const [isLiking, setIsLiking] = useState(false);
  const [isCheeringOpen, setIsCheeringOpen] = useState(false);
  const [cheerAmount, setCheerAmount] = useState("0.01");

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await likePost(post.tokenId, () => {
        console.log("Post liked successfully!");
        // You might want to refresh the posts here
      });
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCheer = async () => {
    try {
      await cheerPost(post.tokenId, cheerAmount, () => {
        console.log("Post cheered successfully!");
        // You might want to refresh the posts here
      });
      setIsCheeringOpen(false);
    } catch (error) {
      console.error("Error cheering post:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <PostImageViewer
        post={{
          ipfsHash: post.ipfsHash,
          title: post.title,
          description: post.description,
        }}
        className="w-full"
      />

      <div className="p-4">
        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              {post.likes}
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              {formatEther(post.totalEarnings)} ETH
            </span>
          </div>
          <span>
            {new Date(Number(post.timestamp) * 1000).toLocaleDateString()}
          </span>
        </div>

        {/* Creator */}
        <p className="text-xs text-gray-500 mb-3">
          By: {post.creator.slice(0, 6)}...{post.creator.slice(-4)}
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span>{isLiking ? "Liking..." : "Like"}</span>
          </button>

          <button
            onClick={() => setIsCheeringOpen(true)}
            className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <span>Cheer</span>
          </button>
        </div>

        {/* Cheer Modal */}
        {isCheeringOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Cheer this post</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  value={cheerAmount}
                  onChange={(e) => setCheerAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: 0.01 ETH</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsCheeringOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheer}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Send Cheer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Section Component
function ProfileSection({
  address,
  onCreatePost,
}: {
  address: string;
  onCreatePost: () => void;
}) {
  const { posts: userPosts, isLoading } = useUserPosts(address);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-600 font-mono text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <p className="text-gray-500 text-sm">
              {userPosts.length} posts created
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Posts</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-4 animate-pulse"
              >
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't created any posts yet.</p>
            <button
              onClick={onCreatePost}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map((post) => (
              <PostCard key={post.tokenId} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
