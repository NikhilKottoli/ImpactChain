import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useLighthouseUpload } from '../hooks/useLighthouse';
import { lighthouseUtils } from '../utils/lighthouse';

export const PostCreatorWithLighthouse: React.FC = () => {
  const { createPost, isLoading: isCreatingPost, error: contractError } = useContract();
  const { 
    isUploading, 
    uploadProgress, 
    error: uploadError, 
    uploadCompletePost,
    reset 
  } = useLighthouseUpload();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageFile: null as File | null
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedHashes, setUploadedHashes] = useState<{
    imageHash?: string;
    metadataHash?: string;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (50MB max for Lighthouse)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    reset();

    if (!formData.imageFile || !formData.title || !formData.description) {
      alert('Please fill in all fields and select an image');
      return;
    }

    try {
      // Step 1: Upload image and metadata to Lighthouse
      console.log('Uploading to Lighthouse...');
      const uploadResult = await uploadCompletePost(
        formData.imageFile,
        formData.title,
        formData.description,
        [
          { trait_type: 'Type', value: 'Social Media Post' },
          { trait_type: 'Platform', value: 'Social Impact Platform' },
          { trait_type: 'Storage', value: 'Lighthouse' },
          { trait_type: 'Created', value: new Date().toISOString() }
        ],
        (imageHash, metadataHash) => {
          setUploadedHashes({ imageHash, metadataHash });
          console.log('Upload successful:', { imageHash, metadataHash });
        }
      );

      if (!uploadResult?.success || !uploadResult.metadataHash) {
        throw new Error(uploadResult?.error || 'Failed to upload to IPFS');
      }

      // Step 2: Create post on blockchain
      console.log('Creating post on blockchain...');
      const tokenId = await createPost({
        ipfsHash: uploadResult.metadataHash,
        title: formData.title,
        description: formData.description
      }, (id) => {
        setSuccess(`Post created successfully! Token ID: ${id}`);
        console.log('Post created with token ID:', id);
      });

      // Reset form on success
      setFormData({
        title: '',
        description: '',
        imageFile: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const isLoading = isUploading || isCreatingPost;
  const error = uploadError || contractError;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Create New Post
      </h2>
      
      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-sm font-medium text-green-900 mb-2">🚀 Powered by Lighthouse Storage</h3>
        <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
          <li><strong>Permanent Storage:</strong> Your files are stored forever with one-time payment</li>
          <li><strong>Decentralized:</strong> Files stored across Filecoin network for reliability</li>
          <li><strong>Fast Access:</strong> Optimized IPFS gateways for quick retrieval</li>
          <li><strong>No Recurring Costs:</strong> Pay once, store forever</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Post Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter a catchy title for your post"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Describe your post, share your thoughts, or tell a story..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
            Post Image *
          </label>
          <div className="relative">
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF, WebP (max 50MB)
            </p>
          </div>
          
          {/* Image Preview */}
          {formData.imageFile && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(formData.imageFile)}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              <p className="text-xs text-gray-600 mt-2">
                File: {formData.imageFile.name} ({lighthouseUtils.formatFileSize(formData.imageFile.size)})
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>
                {isUploading ? 'Uploading to Lighthouse...' : 'Creating Post...'}
              </span>
            </div>
          ) : (
            'Create Post'
          )}
        </button>
      </form>

      {/* Upload Progress */}
      {isUploading && uploadProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Upload Progress</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Uploaded Hashes Info */}
      {uploadedHashes.imageHash && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">IPFS Upload Complete</h4>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium">Image Hash:</span>
              <br />
              <span className="font-mono text-gray-600">{uploadedHashes.imageHash}</span>
              <a
                href={lighthouseUtils.getImageUrl(uploadedHashes.imageHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-green-500 hover:underline"
              >
                View
              </a>
            </div>
            {uploadedHashes.metadataHash && (
              <div>
                <span className="font-medium">Metadata Hash:</span>
                <br />
                <span className="font-mono text-gray-600">{uploadedHashes.metadataHash}</span>
                <a
                  href={lighthouseUtils.getImageUrl(uploadedHashes.metadataHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-green-500 hover:underline"
                >
                  View JSON
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={reset}
            className="text-xs underline hover:no-underline mt-2"
          >
            Dismiss Error
          </button>
        </div>
      )}

      {/* Success Display */}
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

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How it works with Lighthouse:</h4>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Your image is uploaded to IPFS via Lighthouse's permanent storage</li>
          <li>Post metadata (title, description, image reference) is created and uploaded to IPFS</li>
          <li>An NFT is minted on the blockchain with the metadata IPFS hash</li>
          <li>Your post becomes part of the decentralized social network with permanent storage!</li>
        </ol>
        <p className="text-xs text-blue-700 mt-2">
          <strong>Lighthouse Benefits:</strong> Pay once, store forever • Decentralized • Fast retrieval • No recurring costs
        </p>
      </div>
    </div>
  );
};
