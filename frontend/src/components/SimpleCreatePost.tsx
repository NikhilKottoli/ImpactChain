import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { lighthouseUtils } from '../utils/lighthouse';
import type { CreatePostParams } from '../types/contract';

export const SimpleCreatePost: React.FC = () => {
  const { createPost, isLoading, error } = useContract();
  const [formData, setFormData] = useState<CreatePostParams>({
    ipfsHash: '',
    title: '',
    description: ''
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    // Validate IPFS hash format using Lighthouse utilities
    if (!lighthouseUtils.isValidIPFSHash(formData.ipfsHash)) {
      alert('Please enter a valid IPFS hash (starts with Qm or bafy)');
      return;
    }

    try {
      const tokenId = await createPost(formData, (id) => {
        setSuccess(`Post created successfully! Token ID: ${id}`);
        setFormData({ ipfsHash: '', title: '', description: '' });
      });
      
      console.log('Post created with token ID:', tokenId);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Create New Post (Simple Mode)
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">📝 Simple Mode Instructions:</h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>This mode allows you to create posts without direct IPFS upload</li>
          <li>You need to provide an existing IPFS hash for your content</li>
          <li>Use a test hash like: <code className="bg-blue-100 px-1 rounded">QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG</code></li>
          <li>Or upload your content to IPFS manually and paste the hash here</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Post Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a catchy title for your post"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe your post, share your thoughts, or tell a story..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        <div>
          <label htmlFor="ipfsHash" className="block text-sm font-medium text-gray-700 mb-2">
            IPFS Hash *
          </label>
          <input
            type="text"
            id="ipfsHash"
            name="ipfsHash"
            value={formData.ipfsHash}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid IPFS hash (Qm... or bafy...)
          </p>
          
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2"><strong>Test IPFS Hashes:</strong></p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({...prev, ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'}))}
                className="block text-xs text-blue-600 hover:text-blue-800 font-mono bg-white px-2 py-1 rounded border"
              >
                QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG (IPFS Logo)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({...prev, ipfsHash: 'QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq'}))}
                className="block text-xs text-blue-600 hover:text-blue-800 font-mono bg-white px-2 py-1 rounded border"
              >
                QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq (Test Image)
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Post on Blockchain...</span>
            </div>
          ) : (
            'Create Post'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="text-sm font-medium text-green-900 mb-2">🚀 Upgrade to Full Lighthouse Upload</h4>
        <p className="text-xs text-green-800 mb-2">
          This simple mode works with existing IPFS hashes. For full image upload functionality, 
          you already have Lighthouse configured! The app will automatically switch to full mode.
        </p>
        <div className="text-xs text-green-700">
          <strong>Lighthouse Benefits:</strong> Permanent storage • Pay once, store forever • Decentralized • Fast retrieval
        </div>
      </div>
    </div>
  );
};
