import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SocialPost from "@/components/SocialPost";
import { Plus, Filter, TrendingUp, Heart, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const SocialFeed: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const mockPosts = [
    {
      id: "1",
      username: "EcoWarrior_Sarah",
      walletAddress: "0x742d35Cc6636C0532925a3b8D23CAC0EDFF5C0C6",
      title: "Cleaned the Riverside Park today! 🌊",
      description:
        "Spent 3 hours with my team cleaning up plastic waste and debris from Riverside Park. We collected over 50 pounds of trash and made the area safe for wildlife again. Every small action counts towards a cleaner planet!",
      imageUrl: "/api/placeholder/600/400",
      location: "Riverside Park, Austin, TX",
      category: "River Cleaning",
      likes: 47,
      cheerAmount: 15.5,
      isLiked: true,
      timestamp: "2 hours ago",
      aiLabels: [
        "Plastic Waste",
        "River Bank",
        "Environmental Action",
        "Group Activity",
      ],
    },
    {
      id: "2",
      username: "DogLover_Mike",
      walletAddress: "0x8ba1f109551bD432803012645Hac136c6c4Fd2",
      title: "Fed 20+ street dogs today ❤️",
      description:
        "Made homemade dog food and distributed it to street dogs in the downtown area. Also provided clean water and basic medical care to a few injured pups. These angels deserve love and care!",
      imageUrl: "/api/placeholder/600/400",
      location: "Downtown District",
      category: "Animal Care",
      likes: 89,
      cheerAmount: 32.75,
      timestamp: "5 hours ago",
      aiLabels: [
        "Street Dogs",
        "Animal Feeding",
        "Community Service",
        "Pet Care",
      ],
    },
    {
      id: "3",
      username: "FixItFred",
      walletAddress: "0x1f717Ce8B02B4b2A0dE2ebb7fD1C9F2d6D34a7f5",
      title: "Fixed dangerous potholes on Main Street! 🛣️",
      description:
        "Working with the city council, we identified and filled 12 major potholes that were causing accidents. Used sustainable materials and proper techniques to ensure long-lasting repairs.",
      imageUrl: "/api/placeholder/600/400",
      location: "Main Street, Block 400-500",
      category: "Infrastructure",
      likes: 34,
      cheerAmount: 8.25,
      timestamp: "1 day ago",
      aiLabels: [
        "Road Repair",
        "Pothole",
        "Infrastructure",
        "Safety Improvement",
      ],
    },
  ];

  const categories = [
    "all",
    "River Cleaning",
    "Animal Care",
    "Infrastructure",
    "Waste Management",
  ];

  const filteredPosts =
    activeFilter === "all"
      ? mockPosts
      : mockPosts.filter((post) => post.category === activeFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Social Impact Feed
              </h1>
              <p className="text-gray-600">
                Share your good deeds and inspire others
              </p>
            </div>
            <Link to="/create-post">
              <Button className="rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900">15,892</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cheers</p>
                <p className="text-2xl font-bold text-gray-900">$2,847</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">
              Filter by Category
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(category)}
                className="rounded-full"
              >
                {category === "all" ? "All Posts" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <SocialPost key={post.id} {...post} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full px-8">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
