import React from 'react';
import { Twitter, ExternalLink } from 'lucide-react';
import { getTwitterShareUrl } from '../config/twitter';

interface TwitterShareFallbackProps {
  text: string;
  url?: string;
  hashtags?: string[];
  via?: string;
  variant?: 'default' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Fallback Twitter share component that uses Twitter's web intent URL
 * This opens Twitter in a new tab with pre-filled content
 * Use this as a backup when the API-based sharing fails due to CORS or authentication issues
 */
export const TwitterShareFallback: React.FC<TwitterShareFallbackProps> = ({
  text,
  url,
  hashtags = [],
  via,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const handleShare = () => {
    // Add hashtags to text if provided
    const hashtagText = hashtags.length > 0 ? ` ${hashtags.map(tag => `#${tag}`).join(' ')}` : '';
    const finalText = `${text}${hashtagText}`;
    
    // Create Twitter intent URL
    const params = new URLSearchParams({
      text: finalText,
      ...(url && { url }),
      ...(via && { via }),
    });
    
    const twitterUrl = `https://twitter.com/intent/tweet?${params.toString()}`;
    
    // Open Twitter in new tab
    window.open(twitterUrl, '_blank', 'width=550,height=420');
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
    const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:scale-105';
    
    switch (variant) {
      case 'icon':
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white p-2`;
      case 'minimal':
        return `${baseClasses} text-blue-600 hover:text-blue-700 hover:bg-blue-50 ${sizeClasses[size]}`;
      default:
        return `${baseClasses} bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg ${sizeClasses[size]}`;
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`${getVariantClasses()} ${className}`}
      title="Share on Twitter"
    >
      <Twitter className={iconSizeClasses[size]} />
      {variant !== 'icon' && (
        <span>Share on Twitter</span>
      )}
      <ExternalLink className={`${iconSizeClasses[size]} opacity-70`} />
    </button>
  );
};

// Pre-configured fallback components
export const TwitterShareImpactChainFallback: React.FC<Omit<TwitterShareFallbackProps, 'text'>> = (props) => (
  <TwitterShareFallback
    {...props}
    text="Join us on ImpactChain to light up the world! 🌍✨ Verify your social impact, earn crypto rewards, and build a better future together."
    hashtags={['ImpactChain', 'SocialGood', 'Web3', 'CryptoForGood']}
  />
);

export const TwitterShareSocialPostFallback: React.FC<Omit<TwitterShareFallbackProps, 'text'> & { title: string; description: string }> = ({ title, description, ...props }) => (
  <TwitterShareFallback
    {...props}
    text={`🌟 Just made an impact! ${title}\n\n${description}\n\nJoin us on ImpactChain to light up the world! 🌍✨`}
    hashtags={['ImpactChain', 'SocialGood', 'MakingADifference']}
  />
);

export const TwitterShareCampaignFallback: React.FC<Omit<TwitterShareFallbackProps, 'text'> & { title: string; description: string }> = ({ title, description, ...props }) => (
  <TwitterShareFallback
    {...props}
    text={`🚀 New Campaign Alert! ${title}\n\n${description}\n\nJoin us on ImpactChain to participate and earn rewards! 🌍✨`}
    hashtags={['ImpactChain', 'Campaign', 'SocialImpact']}
  />
);

export default TwitterShareFallback;
