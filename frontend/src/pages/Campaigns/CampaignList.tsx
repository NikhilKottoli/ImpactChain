import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CampaignCard from "@/components/CampaignCard";
import {
  Plus,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const CampaignList: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const mockCampaigns = [
    {
      id: "1",
      title: "Clean the Central River Project",
      description:
        "Join us for a massive river cleaning initiative. We'll be removing plastic waste, organizing debris, and restoring the natural ecosystem of Central River.",
      creator: "GreenEarth NGO",
      location: "Central River, Austin, TX",
      eventDate: "2025-10-15T09:00:00Z",
      maxParticipants: 50,
      currentParticipants: 23,
      hasBounty: true,
      bountyAmount: 500,
      stakeAmount: 25,
      category: "River Cleaning",
      status: "active" as const,
      imageUrl: "/api/placeholder/600/300",
    },
    {
      id: "2",
      title: "Community Dog Feeding Drive",
      description:
        "Monthly community initiative to feed and care for street dogs. We provide food, water, and basic medical care to our furry friends.",
      creator: "PawsCare Foundation",
      location: "Downtown District",
      eventDate: "2025-10-20T08:00:00Z",
      maxParticipants: 30,
      currentParticipants: 18,
      hasBounty: false,
      stakeAmount: 10,
      category: "Animal Care",
      status: "active" as const,
      imageUrl: "/api/placeholder/600/300",
    },
    {
      id: "3",
      title: "Fix Main Street Potholes",
      description:
        "Community-driven infrastructure repair project. We'll identify, mark, and help the city fix dangerous potholes on Main Street.",
      creator: "City Volunteers",
      location: "Main Street, Blocks 400-600",
      eventDate: "2025-10-25T07:00:00Z",
      maxParticipants: 20,
      currentParticipants: 12,
      hasBounty: true,
      bountyAmount: 300,
      stakeAmount: 15,
      category: "Infrastructure",
      status: "active" as const,
      imageUrl: "/api/placeholder/600/300",
    },
    {
      id: "4",
      title: "Beach Cleanup Marathon",
      description:
        "Successfully completed beach cleanup with 45 volunteers. Removed over 200 pounds of plastic waste and debris.",
      creator: "OceanGuard Alliance",
      location: "Sunset Beach",
      eventDate: "2025-09-15T08:00:00Z",
      maxParticipants: 50,
      currentParticipants: 45,
      hasBounty: true,
      bountyAmount: 750,
      stakeAmount: 30,
      category: "Beach Cleaning",
      status: "completed" as const,
      imageUrl: "/api/placeholder/600/300",
    },
  ];

  const categories = [
    "all",
    "River Cleaning",
    "Animal Care",
    "Infrastructure",
    "Beach Cleaning",
    "Waste Management",
  ];
  const statusOptions = ["active", "completed", "all"];

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const categoryMatch =
      activeFilter === "all" || campaign.category === activeFilter;
    const statusMatch =
      statusFilter === "all" || campaign.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Social Impact Campaigns
              </h1>
              <p className="text-gray-600">
                Create and join campaigns for positive change
              </p>
            </div>
            <Link to="/create-campaign">
              <Button className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">2,891</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bounties</p>
                <p className="text-2xl font-bold text-gray-900">$12,547</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cities Covered</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filters</span>
          </div>

          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(category)}
                    className="rounded-full"
                  >
                    {category === "all" ? "All Categories" : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="rounded-full"
                  >
                    {status === "all"
                      ? "All Status"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full px-8">
            Load More Campaigns
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignList;
