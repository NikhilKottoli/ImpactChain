import axios from "axios";
import { TWITTER_CONFIG, validateTwitterConfig } from "../config/twitter";

export interface TwitterCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

export interface TwitterPostData {
  text: string;
  imageUrl?: string;
  imageFile?: File;
}

export interface TwitterPostResponse {
  success: boolean;
  data?: {
    id: string;
    text: string;
    url: string;
  };
  error?: string;
}

class TwitterService {
  private credentials: TwitterCredentials;

  constructor() {
    this.credentials = {
      apiKey: TWITTER_CONFIG.apiKey,
      apiSecret: TWITTER_CONFIG.apiSecret,
      accessToken: TWITTER_CONFIG.accessToken,
      accessTokenSecret: TWITTER_CONFIG.accessTokenSecret,
    };

    if (!validateTwitterConfig()) {
      console.warn("Twitter API credentials not properly configured");
    }
  }

  // Generate OAuth 1.0a signature for Twitter API
  private generateOAuthSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    tokenSecret?: string
  ): string {
    // This is a simplified version - in production, use a proper OAuth library
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = Math.random().toString(36).substring(2);

    const oauthParams = {
      oauth_consumer_key: this.credentials.apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_version: "1.0",
      ...(this.credentials.accessToken && {
        oauth_token: this.credentials.accessToken,
      }),
    };

    // In a real implementation, you'd properly generate the OAuth signature
    // For now, we'll use a placeholder that works with Twitter API v2 Bearer token
    return "placeholder_signature";
  }

  // Get Bearer token for Twitter API v2
  private async getBearerToken(): Promise<string> {
    try {
      const credentials = btoa(
        `${this.credentials.apiKey}:${this.credentials.apiSecret}`
      );

      const response = await axios.post(
        TWITTER_CONFIG.endpoints.oauth,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error("Error getting Twitter bearer token:", error);
      throw new Error("Failed to authenticate with Twitter API");
    }
  }

  // Upload image to Twitter
  private async uploadImage(imageFile: File): Promise<string> {
    try {
      const bearerToken = await this.getBearerToken();

      const formData = new FormData();
      formData.append("media", imageFile);

      const response = await axios.post(
        `${TWITTER_CONFIG.endpoints.upload}/media/upload.json`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.media_id_string;
    } catch (error) {
      console.error("Error uploading image to Twitter:", error);
      throw new Error("Failed to upload image to Twitter");
    }
  }

  // Post to Twitter using Web Intent (CORS-safe approach)
  async createPost(postData: TwitterPostData): Promise<TwitterPostResponse> {
    try {
      // Use web intent URL instead of direct API call to avoid CORS issues
      const params = new URLSearchParams({
        text: postData.text,
        hashtags: "ImpactChain,SocialGood,Web3",
      });

      const twitterUrl = `${
        TWITTER_CONFIG.endpoints.intent
      }?${params.toString()}`;

      // Open Twitter in new tab
      window.open(twitterUrl, "_blank", "width=550,height=420");

      return {
        success: true,
        data: {
          id: "web-intent",
          text: postData.text,
          url: twitterUrl,
        },
      };
    } catch (error: any) {
      console.error("Error creating Twitter intent:", error);

      return {
        success: false,
        error: error.message || "Failed to create Twitter share",
      };
    }
  }

  // Create a post about ImpactChain
  async shareImpactChain(
    additionalText?: string,
    imageFile?: File
  ): Promise<TwitterPostResponse> {
    const baseText = TWITTER_CONFIG.defaultMessages.general;

    const finalText = additionalText
      ? `${additionalText}\n\n${baseText}`
      : baseText;

    return this.createPost({
      text: finalText,
      imageFile,
    });
  }

  // Share a social impact post
  async shareSocialPost(
    postTitle: string,
    postDescription: string,
    imageFile?: File
  ): Promise<TwitterPostResponse> {
    const text = `🌟 Just made an impact! ${postTitle}\n\n${postDescription}\n\nJoin us on ImpactChain to light up the world! 🌍✨ #ImpactChain #SocialGood #MakingADifference`;

    return this.createPost({
      text,
      imageFile,
    });
  }

  // Share a campaign
  async shareCampaign(
    campaignTitle: string,
    campaignDescription: string,
    imageFile?: File
  ): Promise<TwitterPostResponse> {
    const text = `🚀 New Campaign Alert! ${campaignTitle}\n\n${campaignDescription}\n\nJoin us on ImpactChain to participate and earn rewards! 🌍✨ #ImpactChain #Campaign #SocialImpact`;

    return this.createPost({
      text,
      imageFile,
    });
  }
}

// Export singleton instance
export const twitterService = new TwitterService();
export default TwitterService;
