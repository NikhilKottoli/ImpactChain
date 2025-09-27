// Contract types for SocialMediaPosts
export interface Post {
  tokenId: number; // Add tokenId for interactions
  creator: string;
  timestamp: bigint;
  likes: number;
  isActive: boolean;
  totalEarnings: bigint;
  ipfsHash: string;
  title: string;
  description: string;
  aiLabels: string[];
}

export interface Interaction {
  user: string;
  timestamp: bigint;
  amount: number;
  interactionType: InteractionType;
}

export const InteractionType = {
  LIKE: 0,
  CHEER: 1
} as const;

export type InteractionType = typeof InteractionType[keyof typeof InteractionType];

export interface ContractConfig {
  address: string;
  ownerAddress: string;
  minCheerAmount: bigint;
}

export interface CreatePostParams {
  ipfsHash: string;
  title: string;
  description: string;
}

// Window ethereum type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: (event?: string) => void;
      isMetaMask?: boolean;
    };
  }
}
