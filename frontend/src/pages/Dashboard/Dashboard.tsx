import React from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Calendar,
  Shield,
  Database,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  ArrowRight,
  Plus,
  BarChart3,
  FileText,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const stats = {
    totalPosts: 1247,
    totalCampaigns: 47,
    totalAttestations: 247,
    totalRevenue: 24847,
    activeUsers: 2891,
    completedCampaigns: 189,
  };

  const quickActions = [
    {
      title: "Create Social Post",
      description: "Share your good deed and mint as NFT",
      icon: Camera,
      color: "from-green-500 to-blue-500",
      link: "/create-post",
    },
    {
      title: "Create Campaign",
      description: "Organize community action with bounties",
      icon: Calendar,
      color: "from-purple-500 to-blue-500",
      link: "/create-campaign",
    },
    {
      title: "View Datasets",
      description: "Browse monetized impact data",
      icon: Database,
      color: "from-blue-500 to-teal-500",
      link: "/datasets",
    },
    {
      title: "Check Attestations",
      description: "Verify campaign participation",
      icon: Shield,
      color: "from-indigo-500 to-purple-500",
      link: "/attestations",
    },
  ];

  const recentActivity = [
    {
      type: "post",
      title: 'New post: "Cleaned Riverside Park today!"',
      user: "EcoWarrior_Sarah",
      time: "2 hours ago",
      icon: Camera,
      color: "text-green-600 bg-green-100",
    },
    {
      type: "campaign",
      title: 'Campaign "Clean Central River" reached 30 participants',
      user: "GreenEarth NGO",
      time: "4 hours ago",
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
    {
      type: "attestation",
      title: "Attestation verified for Beach Cleanup Marathon",
      user: "OceanGuard Alliance",
      time: "6 hours ago",
      icon: Shield,
      color: "text-blue-600 bg-blue-100",
    },
    {
      type: "dataset",
      title: "New dataset purchase: Urban River Pollution Data",
      user: "City of Austin",
      time: "8 hours ago",
      icon: Database,
      color: "text-teal-600 bg-teal-100",
    },
  ];

  const flows = [
    {
      title: "Social Media Posts Flow",
      description:
        "Users create posts → AI labels → NFT minted → Community engagement",
      steps: [
        "User creates impact post",
        "AI analyzes and labels content",
        "NFT minted with metadata",
        "Stored on IPFS",
        "Community likes/cheers",
      ],
      color: "border-green-200 bg-green-50",
    },
    {
      title: "Campaign & Bounty Flow",
      description:
        "Campaign creation → RSVP with stakes → DAO verification → Reward distribution",
      steps: [
        "Creator sets up campaign",
        "Users RSVP with stakes",
        "Event execution",
        "DAO votes on attendance",
        "Bounties distributed",
      ],
      color: "border-purple-200 bg-purple-50",
    },
    {
      title: "Attestation Flow",
      description:
        "DAO signatures → Cryptographic proof → IPFS storage → On-chain reference",
      steps: [
        "DAO voters sign verification",
        "Generate attestation hash",
        "Store proof on IPFS",
        "Create on-chain reference",
        "Build user reputation",
      ],
      color: "border-blue-200 bg-blue-50",
    },
    {
      title: "Dataset Monetization",
      description:
        "Data aggregation → AI labeling → Dataset creation → Government sales",
      steps: [
        "Aggregate campaign data",
        "AI labels and categorizes",
        "Create structured datasets",
        "Sell to organizations",
        "Share revenue with contributors",
      ],
      color: "border-teal-200 bg-teal-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Social Impact Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Web3 platform for social cause campaigns with DAO verification
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Connected</p>
                <p className="text-xs text-gray-600">0x742d...C0C6</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPosts.toLocaleString()}
                </p>
              </div>
              <Camera className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCampaigns}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attestations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAttestations}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeUsers.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedCampaigns}
                </p>
              </div>
              <Award className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-800">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Explore Platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/social-feed">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8 text-red-500" />
                  <span className="text-sm text-gray-500">Live Feed</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Social Feed
                </h3>
                <p className="text-gray-600 text-sm">
                  Browse community impact posts
                </p>
              </div>
            </Link>

            <Link to="/campaigns">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-500" />
                  <span className="text-sm text-gray-500">Join Now</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Campaigns
                </h3>
                <p className="text-gray-600 text-sm">
                  Join community impact campaigns
                </p>
              </div>
            </Link>

            <Link to="/attestations">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <span className="text-sm text-gray-500">Verify</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Attestations
                </h3>
                <p className="text-gray-600 text-sm">
                  Verify campaign participation
                </p>
              </div>
            </Link>

            <Link to="/datasets">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-teal-500" />
                  <span className="text-sm text-gray-500">Browse</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Datasets
                </h3>
                <p className="text-gray-600 text-sm">
                  Monetized impact data marketplace
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Platform Flows */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Platform Flows
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {flows.map((flow, index) => (
              <div
                key={index}
                className={`rounded-2xl p-6 border-2 ${flow.color}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {flow.title}
                </h3>
                <p className="text-gray-700 text-sm mb-4">{flow.description}</p>
                <div className="space-y-2">
                  {flow.steps.map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold">
                        {stepIndex + 1}
                      </div>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}
                    >
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
