import React from 'react';
import TestConfig from '../Social/TestConfig';
import { ENSTestingDashboard } from '../../components/ENSTestingDashboard';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Testing Dashboard</h1>
          <p className="text-gray-600">Test all configuration and ENS functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Test Config */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Social Configuration Tests
            </h2>
            <TestConfig />
          </div>

          {/* ENS Testing Dashboard */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              ENS Functionality Tests
            </h2>
            <ENSTestingDashboard />
          </div>
        </div>

        {/* Additional Test Info */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Test Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Social Tests</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Test Lighthouse file uploads</li>
                <li>• Verify IPFS integration</li>
                <li>• Check Supabase connections</li>
                <li>• Test wallet connections</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">ENS Tests</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Test ENS name resolution</li>
                <li>• Verify avatar loading</li>
                <li>• Check text record parsing</li>
                <li>• Test multi-chain addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
