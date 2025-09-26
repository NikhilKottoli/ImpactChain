import React from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  DollarSign,
  MapPin,
  Calendar,
  Users,
  Award,
} from "lucide-react";

interface SocialPostProps {
  id: string;
  username: string;
  walletAddress: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  category: string;
  likes: number;
  cheerAmount: number;
  isLiked?: boolean;
  timestamp: string;
  aiLabels: string[];
}

const SocialPost: React.FC<SocialPostProps> = ({
  username,
  walletAddress,
  title,
  description,
  imageUrl,
  location,
  category,
  likes,
  cheerAmount,
  isLiked = false,
  timestamp,
  aiLabels,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{username}</h3>
            <p className="text-sm text-gray-500">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">{timestamp}</div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-700 mb-3">{description}</p>

        {/* Image */}
        <div className="rounded-xl overflow-hidden mb-3">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Location and Category */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {category}
          </div>
        </div>

        {/* AI Labels */}
        <div className="flex flex-wrap gap-2 mb-4">
          {aiLabels.map((label, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-200"
            >
              🤖 {label}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            className="flex items-center space-x-2 rounded-full"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{likes}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 rounded-full bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
          >
            <DollarSign className="w-4 h-4" />
            <span>Cheer ${cheerAmount}</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Award className="w-4 h-4" />
          <span>NFT Minted</span>
        </div>
      </div>
    </div>
  );
};

export default SocialPost;
