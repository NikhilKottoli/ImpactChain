import React, { useState } from 'react';
import { Share, Twitter, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { twitterService, type TwitterPostResponse } from '../services/twitterService';

export interface TwitterShareButtonProps {
  // Content to share
  text?: string;
  title?: string;
  description?: string;
  image?: File | string;
  
  // Share type
  type?: 'general' | 'social-post' | 'campaign';
  
  // Styling
  variant?: 'default' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // Callbacks
  onSuccess?: (response: TwitterPostResponse) => void;
  onError?: (error: string) => void;
}

export const TwitterShareButton: React.FC<TwitterShareButtonProps> = ({
  text,
  title = '',
  description = '',
  image,
  type = 'general',
  variant = 'default',
  size = 'md',
  className = '',
  onSuccess,
  onError,
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleShare = async () => {
    setIsSharing(true);
    setShareStatus('idle');
    setStatusMessage('');

    try {
      let response: TwitterPostResponse;
      let imageFile: File | undefined;

      // Handle image conversion
      if (image) {
        if (image instanceof File) {
          imageFile = image;
        } else if (typeof image === 'string') {
          // If image is a URL, we'd need to fetch and convert to File
          // For now, we'll skip image upload for URL-based images
          console.warn('URL-based images not yet supported for Twitter upload');
        }
      }

      // Share based on type
      switch (type) {
        case 'social-post':
          response = await twitterService.shareSocialPost(title, description, imageFile);
          break;
        case 'campaign':
          response = await twitterService.shareCampaign(title, description, imageFile);
          break;
        default:
          response = await twitterService.shareImpactChain(text, imageFile);
          break;
      }

      if (response.success) {
        setShareStatus('success');
        setStatusMessage('Successfully shared on Twitter!');
        onSuccess?.(response);
        
        // Open the tweet in a new tab
        if (response.data?.url) {
          window.open(response.data.url, '_blank');
        }
      } else {
        setShareStatus('error');
        setStatusMessage(response.error || 'Failed to share on Twitter');
        onError?.(response.error || 'Failed to share on Twitter');
      }
    } catch (error: any) {
      setShareStatus('error');
      setStatusMessage(error.message || 'Failed to share on Twitter');
      onError?.(error.message || 'Failed to share on Twitter');
    } finally {
      setIsSharing(false);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setShareStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Variant styles
  const getVariantClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    switch (variant) {
      case 'icon':
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white p-2`;
      case 'minimal':
        return `${baseClasses} text-blue-600 hover:text-blue-700 hover:bg-blue-50 ${sizeClasses[size]}`;
      default:
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg ${sizeClasses[size]}`;
    }
  };

  // Status icon
  const getStatusIcon = () => {
    if (isSharing) {
      return <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />;
    }
    
    switch (shareStatus) {
      case 'success':
        return <CheckCircle className={`${iconSizeClasses[size]} text-green-500`} />;
      case 'error':
        return <XCircle className={`${iconSizeClasses[size]} text-red-500`} />;
      default:
        return variant === 'icon' ? 
          <Twitter className={iconSizeClasses[size]} /> : 
          <Share className={iconSizeClasses[size]} />;
    }
  };

  // Button text
  const getButtonText = () => {
    if (isSharing) return 'Sharing...';
    if (shareStatus === 'success') return 'Shared!';
    if (shareStatus === 'error') return 'Failed';
    return variant === 'icon' ? '' : 'Share on Twitter';
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`${getVariantClasses()} ${className} ${
          isSharing ? 'opacity-75 cursor-not-allowed' : ''
        }`}
        title="Share on Twitter"
      >
        {getStatusIcon()}
        {variant !== 'icon' && (
          <span>{getButtonText()}</span>
        )}
      </button>
      
      {/* Status message tooltip */}
      {statusMessage && shareStatus !== 'idle' && (
        <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 rounded-md text-sm whitespace-nowrap z-10 ${
          shareStatus === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

// Pre-configured components for specific use cases
export const TwitterShareImpactChain: React.FC<Omit<TwitterShareButtonProps, 'type'>> = (props) => (
  <TwitterShareButton {...props} type="general" />
);

export const TwitterShareSocialPost: React.FC<Omit<TwitterShareButtonProps, 'type'>> = (props) => (
  <TwitterShareButton {...props} type="social-post" />
);

export const TwitterShareCampaign: React.FC<Omit<TwitterShareButtonProps, 'type'>> = (props) => (
  <TwitterShareButton {...props} type="campaign" />
);

export default TwitterShareButton;
