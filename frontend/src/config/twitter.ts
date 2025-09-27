// Twitter Configuration (Web Intent Approach)
export const TWITTER_CONFIG = {
  // Note: Using web intents instead of direct API calls to avoid CORS issues
  // API Keys are not needed for web intent approach
  apiKey: import.meta.env.VITE_TWITTER_API_KEY || '',
  apiSecret: import.meta.env.VITE_TWITTER_API_SECRET || '',
  
  // Optional: Access tokens for user-specific actions (not used in web intent approach)
  accessToken: import.meta.env.VITE_TWITTER_ACCESS_TOKEN || '',
  accessTokenSecret: import.meta.env.VITE_TWITTER_ACCESS_TOKEN_SECRET || '',
  
  // Web Intent Endpoints (CORS-safe)
  endpoints: {
    intent: 'https://twitter.com/intent/tweet',
    base: 'https://api.twitter.com/2', // Not used due to CORS
    upload: 'https://upload.twitter.com/1.1', // Not used due to CORS
    oauth: 'https://api.twitter.com/oauth2/token', // Not used due to CORS
  },
  
  // Default messages for different types of shares
  defaultMessages: {
    general: 'Join us on ImpactChain to light up the world! 🌍✨ Verify your social impact, earn crypto rewards, and build a better future together. #ImpactChain #SocialGood #Web3 #CryptoForGood',
    socialPost: '🌟 Just made an impact on ImpactChain! Join us to light up the world! 🌍✨ #ImpactChain #SocialGood #MakingADifference',
    campaign: '🚀 New Campaign on ImpactChain! Join us to participate and earn rewards! 🌍✨ #ImpactChain #Campaign #SocialImpact',
  },
  
  // Settings
  settings: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxTextLength: 280,
  }
};

// Helper function to validate Twitter configuration
export const validateTwitterConfig = (): boolean => {
  return !!(TWITTER_CONFIG.apiKey && TWITTER_CONFIG.apiSecret);
};

// Helper function to get Twitter share URL (fallback for direct web sharing)
export const getTwitterShareUrl = (text: string, url?: string): string => {
  const params = new URLSearchParams({
    text,
    ...(url && { url }),
  });
  
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};

export default TWITTER_CONFIG;
