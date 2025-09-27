import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
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
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const addVoterField = () =>
    setFormData((p) => ({ ...p, daoVoters: [...p.daoVoters, ""] }));

  const updateVoter = (i: number, v: string) =>
    setFormData((p) => ({
      ...p,
      daoVoters: p.daoVoters.map((addr, idx) => (idx === i ? v : addr)),
    }));

  const removeVoter = (i: number) =>
    setFormData((p) => ({
      ...p,
      daoVoters: p.daoVoters.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsCreating(false);
    alert("Campaign created successfully!");
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col md:flex-row px-4 md:px-32">
      {/* LEFT COLUMN */}
      <div className="w-full md:w-1/3 md:fixed md:top-28 md:left-0 md:h-[calc(100vh-7rem)] md:overflow-y-auto p-4 md:p-8 md:ml-32 space-y-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/social")}
            className="mb-5 text-primary hover:text-primary/80"
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
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Create Campaign
          </h1>
          <p className="text-muted-foreground">
            Launch a social impact event with staking and optional bounty + DAO
            verification.
          </p>
        </div>

        <div className="bg-accent/20 rounded-lg border border-accent/30 p-5">
          <h3 className="text-sm font-medium mb-3 text-accent-foreground flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Campaign Flow
          </h3>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>1. Creation & RSVP window opens</li>
            <li>2. Users stake & register</li>
            <li>3. Event executes on scheduled date</li>
            <li>4. DAO voters verify attendance</li>
            <li>5. Stakes returned & bounty distributed</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="text-sm font-medium mb-3 flex items-center text-foreground">
            <Shield className="w-4 h-4 mr-2" />
            DAO Verification
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Prevents fake participation</li>
            <li>• Ensures fair bounty payout</li>
            <li>• On-chain attestations</li>
            <li>• Builds contributor reputation</li>
          </ul>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
          <h3 className="text-sm font-medium text-primary mb-3">Tips</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use clear measurable goals</li>
            <li>• Stake should deter no-shows</li>
            <li>• Pick trusted voter wallets</li>
            <li>• Add a bounty to boost turnout</li>
            <li>• Capture media for future proof</li>
          </ul>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full md:w-1/2 md:ml-[50%] min-h-screen overflow-y-auto mt-8 md:mt-0">
        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-semibold text-foreground">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Central River Cleanup"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  placeholder="Goals, activities, expected impact..."
                  className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City / coordinates / venue"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-semibold text-foreground">
              Event Details
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) =>
                    handleInputChange("eventDate", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Time *
                </label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) =>
                    handleInputChange("eventTime", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Max Participants *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    handleInputChange("maxParticipants", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Required Stake (USD) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.stakeAmount}
                  onChange={(e) =>
                    handleInputChange("stakeAmount", e.target.value)
                  }
                  className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="25"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Users stake this amount to RSVP and get it back if verified.
              </p>
            </div>
          </div>

          {/* Bounty */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground flex items-center">
                Bounty Configuration
              </h2>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.hasBounty}
                  onChange={(e) =>
                    handleInputChange("hasBounty", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <span>Add bounty</span>
              </label>
            </div>

            {formData.hasBounty && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bounty Amount (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.bountyAmount}
                        onChange={(e) =>
                          handleInputChange("bountyAmount", e.target.value)
                        }
                        className="w-full pl-8 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bounty Funder (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.bountyFunder}
                      onChange={(e) =>
                        handleInputChange("bountyFunder", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Org / Sponsor name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    DAO Voter Wallets *
                  </label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Addresses that verify attendance & trigger payouts.
                  </p>
                  <div className="space-y-3">
                    {formData.daoVoters.map((v, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={v}
                          onChange={(e) => updateVoter(idx, e.target.value)}
                          placeholder="0x..."
                          required
                          className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {formData.daoVoters.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeVoter(idx)}
                            className="text-destructive"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVoterField}
                    >
                      + Add Voter
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="bg-card border border-border rounded-lg p-6">
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full h-12 text-base font-semibold flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                  Creating...
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

      <img
        src="/share.png"
        alt=""
        className="w-full md:w-[40%] object-contain md:fixed -bottom-[100px] left-0 hidden md:block pointer-events-none select-none"
      />
    </div>
  );
};

export default CreateCampaign;
