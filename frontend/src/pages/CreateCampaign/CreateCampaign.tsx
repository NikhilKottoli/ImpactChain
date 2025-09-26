import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Shield,
  Sparkles,
  FileText,
  Camera,
} from "lucide-react";

const CreateCampaign: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    eventDate: "",
    eventTime: "",
    maxParticipants: "",
    stakeAmount: "",
    hasBounty: false,
    bountyAmount: "",
    bountyFunder: "",
    daoVoters: [""],
  });
  const [isCreating, setIsCreating] = useState(false);

  const categories = [
    "River Cleaning",
    "Beach Cleanup",
    "Animal Care",
    "Infrastructure Repair",
    "Waste Management",
    "Tree Planting",
    "Community Garden",
    "Other",
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addVoterField = () => {
    setFormData((prev) => ({
      ...prev,
      daoVoters: [...prev.daoVoters, ""],
    }));
  };

  const updateVoter = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      daoVoters: prev.daoVoters.map((voter, i) =>
        i === index ? value : voter
      ),
    }));
  };

  const removeVoter = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      daoVoters: prev.daoVoters.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsCreating(false);
    alert("Campaign created successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Social Impact Campaign
              </h1>
              <p className="text-gray-600">
                Organize community action with optional bounties and DAO
                verification
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g., Clean the Central River Project"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe the campaign goals, activities, and expected impact..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="Event location"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Event Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) =>
                        handleInputChange("eventDate", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Time *
                    </label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) =>
                        handleInputChange("eventTime", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants *
                    </label>
                    <input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) =>
                        handleInputChange("maxParticipants", e.target.value)
                      }
                      placeholder="50"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Stake Amount (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.stakeAmount}
                      onChange={(e) =>
                        handleInputChange("stakeAmount", e.target.value)
                      }
                      placeholder="25"
                      min="1"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Participants must stake this amount to RSVP
                  </p>
                </div>
              </div>

              {/* Bounty Configuration */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bounty Configuration
                  </h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasBounty"
                      checked={formData.hasBounty}
                      onChange={(e) =>
                        handleInputChange("hasBounty", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="hasBounty"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Add bounty reward
                    </label>
                  </div>
                </div>

                {formData.hasBounty && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bounty Amount (USD) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.bountyAmount}
                            onChange={(e) =>
                              handleInputChange("bountyAmount", e.target.value)
                            }
                            placeholder="500"
                            min="1"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={formData.hasBounty}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bounty Funder Name
                        </label>
                        <input
                          type="text"
                          value={formData.bountyFunder}
                          onChange={(e) =>
                            handleInputChange("bountyFunder", e.target.value)
                          }
                          placeholder="Organization or individual name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* DAO Voters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DAO Voter Wallet Addresses *
                      </label>
                      <p className="text-sm text-gray-500 mb-3">
                        These addresses will vote on participant verification
                        after the event
                      </p>

                      <div className="space-y-3">
                        {formData.daoVoters.map((voter, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="text"
                              value={voter}
                              onChange={(e) =>
                                updateVoter(index, e.target.value)
                              }
                              placeholder="0x742d35Cc6636C0532925a3b8D23CAC0EDFF5C0C6"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                              required={formData.hasBounty}
                            />
                            {formData.daoVoters.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeVoter(index)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}

                        <Button
                          type="button"
                          onClick={addVoterField}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          + Add Voter Address
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg font-semibold"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Process Flow */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Flow
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Campaign Creation
                    </p>
                    <p className="text-sm text-gray-600">
                      Campaign goes live for RSVPs
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">User RSVPs</p>
                    <p className="text-sm text-gray-600">
                      Participants stake required amount
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Event Execution</p>
                    <p className="text-sm text-gray-600">
                      Campaign takes place as scheduled
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      DAO Verification
                    </p>
                    <p className="text-sm text-gray-600">
                      Voters verify participant attendance
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    5
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Rewards Distribution
                    </p>
                    <p className="text-sm text-gray-600">
                      Stakes returned, bounties distributed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DAO Info */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200 p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">
                <Shield className="w-5 h-5 inline mr-2" />
                DAO Verification System
              </h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>• Prevents fake participation claims</li>
                <li>• Ensures legitimate bounty distribution</li>
                <li>• Creates verifiable attestations on-chain</li>
                <li>• Builds reputation for future campaigns</li>
                <li>• Stored permanently on IPFS</li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                💡 Campaign Tips
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Set realistic participant limits</li>
                <li>• Choose trusted DAO voters</li>
                <li>• Stake amount should deter no-shows</li>
                <li>• Clear goals increase participation</li>
                <li>• Document everything for dataset value</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
