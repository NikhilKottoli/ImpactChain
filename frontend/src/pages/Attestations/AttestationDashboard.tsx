import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Award,
  FileText,
} from "lucide-react";

interface AttestationRecord {
  id: string;
  campaignTitle: string;
  participantName: string;
  participantAddress: string;
  voterSignatures: VoterSignature[];
  attestationHash: string;
  ipfsProofHash: string;
  isVerified: boolean;
  verificationCount: number;
  totalVoters: number;
  createdAt: string;
}

interface VoterSignature {
  voterAddress: string;
  voterName: string;
  signature: string;
  vote: boolean;
  timestamp: string;
}

const AttestationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const mockAttestations: AttestationRecord[] = [
    {
      id: "1",
      campaignTitle: "Clean the Central River Project",
      participantName: "Alice Cooper",
      participantAddress: "0x742d35Cc6636C0532925a3b8D23CAC0EDFF5C0C6",
      voterSignatures: [
        {
          voterAddress: "0x8ba1f109551bD432803012645Hac136c6c4Fd2",
          voterName: "GreenEarth Validator",
          signature: "0x1234567890abcdef...",
          vote: true,
          timestamp: "2025-09-26T10:30:00Z",
        },
        {
          voterAddress: "0x1f717Ce8B02B4b2A0dE2ebb7fD1C9F2d6D34a7f5",
          voterName: "EcoWatch Observer",
          signature: "0xabcdef1234567890...",
          vote: true,
          timestamp: "2025-09-26T11:45:00Z",
        },
      ],
      attestationHash: "0xabc123def456...",
      ipfsProofHash: "QmX7YZ9ABC123...",
      isVerified: true,
      verificationCount: 2,
      totalVoters: 3,
      createdAt: "2025-09-26T09:00:00Z",
    },
    {
      id: "2",
      campaignTitle: "Community Dog Feeding Drive",
      participantName: "Bob Martinez",
      participantAddress: "0x9c2E7B3F8D1A4B5C6D7E8F9A0B1C2D3E4F5A6B7C",
      voterSignatures: [
        {
          voterAddress: "0xA1B2C3D4E5F6789012345678901234567890ABCD",
          voterName: "PawsCare Supervisor",
          signature: "0xfedcba0987654321...",
          vote: false,
          timestamp: "2025-09-26T14:20:00Z",
        },
      ],
      attestationHash: "0xdef789ghi012...",
      ipfsProofHash: "QmA1B2C3DEF789...",
      isVerified: false,
      verificationCount: 0,
      totalVoters: 2,
      createdAt: "2025-09-26T13:00:00Z",
    },
    {
      id: "3",
      campaignTitle: "Fix Main Street Potholes",
      participantName: "Carol Johnson",
      participantAddress: "0x5A6B7C8D9E0F1234567890ABCDEF1234567890AB",
      voterSignatures: [
        {
          voterAddress: "0xBCDEF1234567890ABCDEF1234567890ABCDEF12",
          voterName: "City Infrastructure Team",
          signature: "0x567890abcdef1234...",
          vote: true,
          timestamp: "2025-09-26T16:10:00Z",
        },
      ],
      attestationHash: "0x456789abc012...",
      ipfsProofHash: "QmB2C3D4EFG890...",
      isVerified: false,
      verificationCount: 1,
      totalVoters: 2,
      createdAt: "2025-09-26T15:30:00Z",
    },
  ];

  const getFilteredAttestations = () => {
    switch (activeTab) {
      case "verified":
        return mockAttestations.filter((a) => a.isVerified);
      case "rejected":
        return mockAttestations.filter(
          (a) => !a.isVerified && a.verificationCount === 0
        );
      case "pending":
      default:
        return mockAttestations.filter(
          (a) => !a.isVerified && a.verificationCount > 0
        );
    }
  };

  const getStatusIcon = (attestation: AttestationRecord) => {
    if (attestation.isVerified) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    } else if (attestation.verificationCount === 0) {
      return <XCircle className="w-6 h-6 text-red-500" />;
    } else {
      return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusText = (attestation: AttestationRecord) => {
    if (attestation.isVerified) return "Verified";
    if (attestation.verificationCount === 0) return "Rejected";
    return "Pending";
  };

  const getStatusBadgeClass = (attestation: AttestationRecord) => {
    if (attestation.isVerified) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (attestation.verificationCount === 0) {
      return "bg-red-100 text-red-800 border-red-200";
    } else {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Attestation Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and verify campaign participation proofs
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">
                Blockchain Secured
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
                <p className="text-sm text-gray-600">Total Attestations</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">189</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">43</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">DAO Voters</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { key: "pending", label: "Pending Verification", count: "43" },
              { key: "verified", label: "Verified", count: "189" },
              { key: "rejected", label: "Rejected", count: "15" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Attestation Records */}
        <div className="space-y-6">
          {getFilteredAttestations().map((attestation) => (
            <div
              key={attestation.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(attestation)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {attestation.campaignTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Participant: {attestation.participantName}
                      <span className="ml-2 font-mono text-xs">
                        ({attestation.participantAddress.slice(0, 8)}...
                        {attestation.participantAddress.slice(-6)})
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                    attestation
                  )}`}
                >
                  {getStatusText(attestation)}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Verification Progress</span>
                  <span>
                    {attestation.verificationCount}/{attestation.totalVoters}{" "}
                    Votes
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (attestation.verificationCount /
                          attestation.totalVoters) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Voter Signatures */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  DAO Voter Signatures
                </h4>
                <div className="space-y-2">
                  {attestation.voterSignatures.map((signature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            signature.vote ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {signature.voterName}
                          </p>
                          <p className="text-xs text-gray-600 font-mono">
                            {signature.voterAddress.slice(0, 8)}...
                            {signature.voterAddress.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-medium ${
                            signature.vote ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {signature.vote ? "Verified" : "Rejected"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(signature.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Attestation Hash:</p>
                    <p className="font-mono text-gray-900 truncate">
                      {attestation.attestationHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">IPFS Proof:</p>
                    <p className="font-mono text-gray-900 truncate">
                      {attestation.ipfsProofHash}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-gray-500">
                    Created: {new Date(attestation.createdAt).toLocaleString()}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      View on IPFS
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Verify on Chain
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttestationDashboard;
