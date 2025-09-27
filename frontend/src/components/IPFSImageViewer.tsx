import React, { useState, useEffect } from 'react';
import { lighthouseUtils } from '../utils/lighthouse';

interface IPFSImageViewerProps {
  ipfsHash: string;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
  showHash?: boolean;
}

export const IPFSImageViewer: React.FC<IPFSImageViewerProps> = ({
  ipfsHash,
  alt = "IPFS Image",
  className = "",
  fallback,
  showHash = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (!ipfsHash || !lighthouseUtils.isValidIPFSHash(ipfsHash)) {
      setError(true);
      setLoading(false);
      return;
    }

    // Start with primary gateway
    const url = lighthouseUtils.getImageUrl(ipfsHash);
    setImageUrl(url);
    setLoading(false);
  }, [ipfsHash]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    
    // Try fallback gateways
    const fallbackUrls = lighthouseUtils.getImageUrlWithFallback(ipfsHash);
    const currentIndex = fallbackUrls.indexOf(imageUrl.split('?')[0]);
    
    if (currentIndex < fallbackUrls.length - 1) {
      // Try next gateway
      const nextUrl = fallbackUrls[currentIndex + 1];
      console.log(`Trying fallback gateway: ${nextUrl}`);
      setImageUrl(`${nextUrl}?t=${Date.now()}`);
      setLoading(true);
    } else {
      // All gateways failed
      setError(true);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    // Start over with primary gateway
    const url = lighthouseUtils.getImageUrl(ipfsHash);
    setImageUrl(`${url}?t=${Date.now()}`);
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 ${className}`}>
        {fallback || (
          <>
            <div className="w-12 h-12 text-gray-400 mb-2">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center mb-2">Failed to load image</p>
            <button
              onClick={handleRetry}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover rounded-lg ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      />
      
      {showHash && !loading && !error && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black bg-opacity-50 text-white text-xs p-2 rounded backdrop-blur-sm">
            <p className="font-mono truncate">IPFS: {ipfsHash}</p>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-100 underline"
            >
              View on IPFS
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

interface PostImageViewerProps {
  post: {
    ipfsHash: string;
    title: string;
    description: string;
  };
  className?: string;
}

export const PostImageViewer: React.FC<PostImageViewerProps> = ({
  post,
  className = ""
}) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch metadata from IPFS
        const response = await fetch(lighthouseUtils.getImageUrl(post.ipfsHash));
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        }
      } catch (err) {
        setError('Failed to load post metadata');
        console.error('Error fetching metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    if (post.ipfsHash) {
      fetchMetadata();
    }
  }, [post.ipfsHash]);

  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
          <div className="bg-gray-300 h-4 rounded mb-2"></div>
          <div className="bg-gray-300 h-3 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const imageHash = metadata?.image?.replace('ipfs://', '') || '';

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {imageHash && (
        <IPFSImageViewer
          ipfsHash={imageHash}
          alt={metadata?.title || post.title}
          className="w-full h-48"
        />
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {metadata?.title || post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {metadata?.description || post.description}
        </p>
        
        {metadata?.attributes && metadata.attributes.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Attributes:</p>
            <div className="flex flex-wrap gap-1">
              {metadata.attributes.map((attr: any, index: number) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-mono">
            Metadata: {post.ipfsHash.slice(0, 10)}...
            <a
              href={lighthouseUtils.getImageUrl(post.ipfsHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 hover:text-blue-700 underline"
            >
              View JSON
            </a>
          </p>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <p className="text-xs text-yellow-700">{error}</p>
        </div>
      )}
    </div>
  );
};
