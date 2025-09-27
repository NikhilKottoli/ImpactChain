// Lighthouse API types
export interface LighthouseConfig {
  apiKey: string;
  gateway: string;
}

export interface LighthouseUploadResponse {
  data: {
    Name: string;
    Hash: string;
    Size: string;
  };
}

export interface FileUploadResult {
  success: boolean;
  ipfsHash?: string;
  error?: string;
  size?: number;
  name?: string;
}

export interface LighthouseFileInfo {
  publicKey: string;
  fileName: string;
  mimeType: string;
  txHash: string;
  status: string;
  createdAt: number;
  fileSizeInBytes: string;
  cid: string;
  id: string;
  lastUpdate: number;
  encryption: boolean;
}
