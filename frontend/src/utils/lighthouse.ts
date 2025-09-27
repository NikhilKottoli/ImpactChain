import lighthouse from '@lighthouse-web3/sdk';
import type {
  LighthouseConfig,
  LighthouseUploadResponse,
  FileUploadResult
} from '../types/lighthouse';

// Lighthouse configuration
const LIGHTHOUSE_CONFIG: LighthouseConfig = {
  apiKey: import.meta.env.VITE_LIGHTHOUSE_API_KEY || '239777d2.c5fe3f8d06e34c27be7f7d5cf99f007d',
  gateway: 'https://gateway.lighthouse.storage/ipfs/'
};

// Fallback gateway configuration
const FALLBACK_GATEWAY = 'https://ipfs.io/ipfs/';

export class LighthouseService {
  private apiKey: string;
  private gateway: string;

  constructor(apiKey?: string, gateway?: string) {
    this.apiKey = apiKey || LIGHTHOUSE_CONFIG.apiKey;
    this.gateway = gateway || LIGHTHOUSE_CONFIG.gateway;

    if (!this.apiKey) {
      console.warn('Lighthouse API key not found. Using default key.');
    }
  }

  // Upload file to Lighthouse
  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      console.log('Uploading file to Lighthouse:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const response = await lighthouse.upload([file], this.apiKey);
      console.log('Lighthouse upload response:', response);

      if (response && response.data && response.data.Hash) {
        return {
          success: true,
          ipfsHash: response.data.Hash,
          size: typeof response.data.Size === 'number' ? response.data.Size : file.size,
          name: response.data.Name || file.name
        };
      } else {
        throw new Error('Invalid response from Lighthouse');
      }
    } catch (error) {
      console.error('Lighthouse upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Upload text/JSON to Lighthouse
  async uploadText(text: string, filename: string = 'data.txt'): Promise<FileUploadResult> {
    try {
      const blob = new Blob([text], { type: 'text/plain' });
      const file = new File([blob], filename, { type: 'text/plain' });
      
      return await this.uploadFile(file);
    } catch (error) {
      console.error('Lighthouse text upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Text upload failed'
      };
    }
  }

  // Upload JSON to Lighthouse
  async uploadJSON(data: any, filename: string = 'metadata.json'): Promise<FileUploadResult> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], filename, { type: 'application/json' });
      
      return await this.uploadFile(file);
    } catch (error) {
      console.error('Lighthouse JSON upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'JSON upload failed'
      };
    }
  }

  // Get file from IPFS via Lighthouse gateway
  async getFile(ipfsHash: string): Promise<Response> {
    const url = this.getGatewayUrl(ipfsHash);
    return fetch(url);
  }

  // Get JSON from IPFS
  async getJSON<T = any>(ipfsHash: string): Promise<T> {
    const response = await this.getFile(ipfsHash);
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`);
    }
    return response.json();
  }

  // Get file as blob
  async getBlob(ipfsHash: string): Promise<Blob> {
    const response = await this.getFile(ipfsHash);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return response.blob();
  }

  // Get file as text
  async getText(ipfsHash: string): Promise<string> {
    const response = await this.getFile(ipfsHash);
    if (!response.ok) {
      throw new Error(`Failed to fetch text: ${response.statusText}`);
    }
    return response.text();
  }

  // Get gateway URL for IPFS hash
  getGatewayUrl(ipfsHash: string): string {
    return `${FALLBACK_GATEWAY}${ipfsHash}`; // Use ipfs.io as primary gateway
  }

  // Get fallback gateway URL
  getFallbackGatewayUrl(ipfsHash: string): string {
    return `${FALLBACK_GATEWAY}${ipfsHash}`;
  }

  // Get multiple gateway URLs for redundancy
  getAllGatewayUrls(ipfsHash: string): string[] {
    return [
      `${FALLBACK_GATEWAY}${ipfsHash}`, // Start with ipfs.io as primary
      `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
      `https://dweb.link/ipfs/${ipfsHash}`,
      `${this.gateway}${ipfsHash}`, // Lighthouse gateway as fallback
      `https://ipfs.filebase.io/ipfs/${ipfsHash}`,
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    ];
  }

  // Test API connection
  async testAuthentication(): Promise<boolean> {
    try {
      // Test upload with a small text file
      const testText = 'Lighthouse connection test';
      const result = await this.uploadText(testText, 'test.txt');
      return result.success;
    } catch (error) {
      console.error('Lighthouse authentication test failed:', error);
      return false;
    }
  }

  // Get file size
  async getFileSize(ipfsHash: string): Promise<number | null> {
    try {
      const response = await fetch(this.getGatewayUrl(ipfsHash), {
        method: 'HEAD'
      });
      
      if (!response.ok) return null;
      
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength, 10) : null;
    } catch (error) {
      console.error('Error getting file size:', error);
      return null;
    }
  }

  // Get upload status
  async getUploadStatus(ipfsHash: string): Promise<any> {
    try {
      const response = await lighthouse.getUploads(this.apiKey);
      const uploads = response.data.fileList || [];
      return uploads.find((upload: any) => upload.cid === ipfsHash) || null;
    } catch (error) {
      console.error('Error getting upload status:', error);
      return null;
    }
  }

  // Get all uploads
  async getAllUploads(): Promise<any[]> {
    try {
      const response = await lighthouse.getUploads(this.apiKey);
      return response.data.fileList || [];
    } catch (error) {
      console.error('Error getting uploads:', error);
      return [];
    }
  }
}

// Global Lighthouse service instance
export const lighthouseService = new LighthouseService();

// Utility functions
export const lighthouseUtils = {
  // Upload image and return IPFS hash
  uploadImage: async (file: File): Promise<FileUploadResult> => {
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image'
      };
    }

    return lighthouseService.uploadFile(file);
  },

  // Upload post metadata as JSON
  uploadPostMetadata: async (metadata: {
    title: string;
    description: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  }): Promise<FileUploadResult> => {
    const filename = `${metadata.title.replace(/[^a-zA-Z0-9]/g, '_')}_metadata.json`;
    return lighthouseService.uploadJSON(metadata, filename);
  },

  // Create and upload complete post (image + metadata)
  uploadCompletePost: async (
    imageFile: File,
    title: string,
    description: string,
    attributes?: Array<{ trait_type: string; value: string | number }>
  ): Promise<{ success: boolean; metadataHash?: string; imageHash?: string; error?: string }> => {
    try {
      console.log('Starting complete post upload to Lighthouse...', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        title,
        description
      });

      // Upload image first
      const imageResult = await lighthouseUtils.uploadImage(imageFile);
      
      if (!imageResult.success || !imageResult.ipfsHash) {
        return {
          success: false,
          error: imageResult.error || 'Failed to upload image'
        };
      }

      console.log('Image uploaded successfully:', imageResult.ipfsHash);

      // Create metadata with image reference
      const metadata = {
        title,
        description,
        image: `ipfs://${imageResult.ipfsHash}`,
        attributes: attributes || []
      };

      // Upload metadata
      const metadataResult = await lighthouseUtils.uploadPostMetadata(metadata);

      if (!metadataResult.success || !metadataResult.ipfsHash) {
        return {
          success: false,
          imageHash: imageResult.ipfsHash,
          error: metadataResult.error || 'Failed to upload metadata'
        };
      }

      console.log('Metadata uploaded successfully:', metadataResult.ipfsHash);

      return {
        success: true,
        imageHash: imageResult.ipfsHash,
        metadataHash: metadataResult.ipfsHash
      };
    } catch (error) {
      console.error('Complete post upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  },

  // Get image URL from IPFS hash
  getImageUrl: (ipfsHash: string): string => {
    return lighthouseService.getGatewayUrl(ipfsHash);
  },

  // Get image URL with fallback options
  getImageUrlWithFallback: (ipfsHash: string): string[] => {
    return lighthouseService.getAllGatewayUrls(ipfsHash);
  },

  // Download file from IPFS
  downloadFile: async (ipfsHash: string, filename?: string): Promise<void> => {
    try {
      const response = await lighthouseService.getFile(ipfsHash);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `file_${ipfsHash}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Validate IPFS hash format
  isValidIPFSHash: (hash: string): boolean => {
    // Basic IPFS hash validation (CIDv0 and CIDv1)
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const cidv1Regex = /^[a-z2-7]{59}$/;
    
    return cidv0Regex.test(hash) || cidv1Regex.test(hash) || hash.startsWith('bafy');
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Export default service
export default lighthouseService;
