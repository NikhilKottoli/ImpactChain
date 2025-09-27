import React from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Shield,
  Clock,
} from "lucide-react";
import { TwitterShareCampaign } from "./TwitterShareButton";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  creator: string;
  location: string;
  eventDate: string;
  maxParticipants: number;
  currentParticipants: number;
  hasBounty: boolean;
  bountyAmount?: number;
  stakeAmount: number;
  category: string;
  status: "active" | "completed" | "cancelled";
  imageUrl: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  title,
  description,
  creator,
  location,
  eventDate,
  maxParticipants,
  currentParticipants,
  hasBounty,
  bountyAmount,
  stakeAmount,
  category,
  status,
  imageUrl,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              status
            )}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        {hasBounty && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
            💰 ${bountyAmount} Bounty
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              {category}
            </span>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Stake: ${stakeAmount}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-3">{description}</p>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>By {creator}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(eventDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {currentParticipants}/{maxParticipants} Participants
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Participation</span>
            <span>
              {Math.round((currentParticipants / maxParticipants) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentParticipants / maxParticipants) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          {status === "active" && (
            <>
              <Button className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                RSVP & Stake
              </Button>
              <Button variant="outline" className="rounded-full">
                <Clock className="w-4 h-4" />
              </Button>
              <TwitterShareCampaign
                title={title}
                description={description}
                image={imageUrl}
                variant="icon"
                size="md"
                className="rounded-full"
                onSuccess={(response) => {
                  console.log('Successfully shared campaign:', response);
                }}
                onError={(error) => {
                  console.error('Failed to share campaign:', error);
                }}
              />
            </>
          )}
          {status === "completed" && (
            <>
              <Button variant="outline" className="flex-1 rounded-full">
                View Results
              </Button>
              <TwitterShareCampaign
                title={title}
                description={`${description} - Campaign completed!`}
                image={imageUrl}
                variant="icon"
                size="md"
                className="rounded-full"
                onSuccess={(response) => {
                  console.log('Successfully shared completed campaign:', response);
                }}
                onError={(error) => {
                  console.error('Failed to share completed campaign:', error);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
