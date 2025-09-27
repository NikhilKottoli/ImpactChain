import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Database,
  Download,
  DollarSign,
  BarChart3,
  MapPin,
  Calendar,
  Filter,
  TrendingUp,
} from "lucide-react";

interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  totalDataPoints: number;
  pricePerAccess: number;
  accessCount: number;
  revenueGenerated: number;
  lastUpdated: string;
  tags: string[];
  sampleData: any[];
}

const DatasetMarketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const mockDatasets: DatasetInfo[] = [
    {
      id: "1",
      name: "Urban River Pollution Dataset",
      description:
        "Comprehensive dataset of river pollution levels across 15 major cities. Includes water quality measurements, pollution sources, and cleanup effectiveness data.",
      category: "Environmental",
      totalDataPoints: 15847,
      pricePerAccess: 299.99,
      accessCount: 23,
      revenueGenerated: 6899.77,
      lastUpdated: "2025-09-25",
      tags: [
        "River Pollution",
        "Water Quality",
        "Urban Environment",
        "Cleanup Data",
      ],
      sampleData: [
        {
          location: "Central River, Austin",
          pollution_level: 7.2,
          cleanup_effectiveness: 85,
        },
        {
          location: "Downtown Creek, Seattle",
          pollution_level: 5.8,
          cleanup_effectiveness: 92,
        },
        {
          location: "Metro River, Portland",
          pollution_level: 6.4,
          cleanup_effectiveness: 78,
        },
      ],
    },
    {
      id: "2",
      name: "Street Infrastructure Damage Assessment",
      description:
        "AI-labeled dataset of road damage including potholes, cracks, and surface deterioration across urban areas.",
      category: "Infrastructure",
      totalDataPoints: 8932,
      pricePerAccess: 199.99,
      accessCount: 41,
      revenueGenerated: 8199.59,
      lastUpdated: "2025-09-24",
      tags: ["Potholes", "Road Damage", "Infrastructure", "AI Labels"],
      sampleData: [
        {
          location: "Main St Block 400",
          damage_type: "pothole",
          severity: 8,
          repair_cost_estimate: 150,
        },
        {
          location: "Oak Ave Block 200",
          damage_type: "crack",
          severity: 4,
          repair_cost_estimate: 75,
        },
        {
          location: "Pine St Block 100",
          damage_type: "surface_wear",
          severity: 6,
          repair_cost_estimate: 200,
        },
      ],
    },
    {
      id: "3",
      name: "Community Animal Welfare Metrics",
      description:
        "Dataset tracking street animal populations, feeding programs effectiveness, and health outcomes across different neighborhoods.",
      category: "Animal Welfare",
      totalDataPoints: 4567,
      pricePerAccess: 149.99,
      accessCount: 17,
      revenueGenerated: 2549.83,
      lastUpdated: "2025-09-23",
      tags: [
        "Street Animals",
        "Animal Health",
        "Community Programs",
        "Welfare Metrics",
      ],
      sampleData: [
        {
          neighborhood: "Downtown",
          animal_count: 45,
          health_score: 7.2,
          feeding_frequency: 2.1,
        },
        {
          neighborhood: "Riverside",
          animal_count: 32,
          health_score: 8.1,
          feeding_frequency: 2.8,
        },
        {
          neighborhood: "Industrial",
          animal_count: 28,
          health_score: 6.8,
          feeding_frequency: 1.9,
        },
      ],
    },
    {
      id: "4",
      name: "Waste Management Efficiency Study",
      description:
        "Comprehensive analysis of waste collection patterns, recycling rates, and cleanup campaign effectiveness across urban zones.",
      category: "Waste Management",
      totalDataPoints: 12456,
      pricePerAccess: 249.99,
      accessCount: 29,
      revenueGenerated: 7249.71,
      lastUpdated: "2025-09-22",
      tags: [
        "Waste Collection",
        "Recycling",
        "Urban Cleanup",
        "Efficiency Metrics",
      ],
      sampleData: [
        {
          zone: "Commercial District",
          waste_volume: 145.2,
          recycling_rate: 0.68,
          cleanup_frequency: 3.2,
        },
        {
          zone: "Residential Area A",
          waste_volume: 89.7,
          recycling_rate: 0.74,
          cleanup_frequency: 2.1,
        },
        {
          zone: "Parks & Recreation",
          waste_volume: 67.3,
          recycling_rate: 0.82,
          cleanup_frequency: 4.1,
        },
      ],
    },
  ];

  const categories = [
    "all",
    "Environmental",
    "Infrastructure",
    "Animal Welfare",
    "Waste Management",
  ];

  const filteredDatasets =
    activeCategory === "all"
      ? mockDatasets
      : mockDatasets.filter((dataset) => dataset.category === activeCategory);

  const totalRevenue = mockDatasets.reduce(
    (sum, dataset) => sum + dataset.revenueGenerated,
    0
  );
  const totalDataPoints = mockDatasets.reduce(
    (sum, dataset) => sum + dataset.totalDataPoints,
    0
  );
  const totalAccesses = mockDatasets.reduce(
    (sum, dataset) => sum + dataset.accessCount,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dataset Marketplace
              </h1>
              <p className="text-gray-600">
                Monetize social impact data for government and organizations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Data DAO Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDataPoints.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Accesses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAccesses}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Datasets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockDatasets.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-orange-600" />
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
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {dataset.name}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {dataset.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {dataset.description}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {dataset.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {dataset.totalDataPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">Data Points</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    ${dataset.pricePerAccess}
                  </p>
                  <p className="text-xs text-gray-600">Per Access</p>
                </div>
              </div>

              {/* Sample Data Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Sample Data Preview
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-xs text-gray-800">
                    {JSON.stringify(dataset.sampleData[0], null, 2)}
                  </pre>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{dataset.accessCount} accesses</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      ${dataset.revenueGenerated.toLocaleString()} revenue
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Updated {new Date(dataset.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  Purchase Access
                </Button>
                <Button variant="outline" className="rounded-full">
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Distribution Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Revenue Distribution Model
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">60%</span>
              </div>
              <h4 className="font-semibold text-gray-900">Data Contributors</h4>
              <p className="text-sm text-gray-600">
                Users who provided campaign data
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">25%</span>
              </div>
              <h4 className="font-semibold text-gray-900">Platform</h4>
              <p className="text-sm text-gray-600">
                Infrastructure and maintenance
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">15%</span>
              </div>
              <h4 className="font-semibold text-gray-900">DAO Treasury</h4>
              <p className="text-sm text-gray-600">
                Future platform development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetMarketplace;
