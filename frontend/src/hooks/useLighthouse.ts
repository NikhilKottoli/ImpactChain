import { useState, useCallback } from 'react';
import { lighthouseService, lighthouseUtils } from '../utils/lighthouse';
import type { FileUploadResult } from '../types/lighthouse';

// Hook for file uploads
export const useLighthouseUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    onSuccess?: (result: FileUploadResult) => void
  ): Promise<FileUploadResult | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress (Lighthouse doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await lighthouseService.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        onSuccess?.(result);
      } else {
        setError(result.error || 'Upload failed');
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const uploadImage = useCallback(async (
    file: File,
    onSuccess?: (result: FileUploadResult) => void
  ): Promise<FileUploadResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await lighthouseUtils.uploadImage(file);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        setError(result.error || 'Image upload failed');
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadJSON = useCallback(async (
    data: any,
    filename: string = 'data.json',
    onSuccess?: (result: FileUploadResult) => void
  ): Promise<FileUploadResult | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await lighthouseService.uploadJSON(data, filename);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        setError(result.error || 'JSON upload failed');
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadCompletePost = useCallback(async (
    imageFile: File,
    title: string,
    description: string,
    attributes?: Array<{ trait_type: string; value: string | number }>,
    onSuccess?: (imageHash: string, metadataHash: string) => void
  ) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log('Starting complete post upload to Lighthouse...', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        title,
        description
      });

      const result = await lighthouseUtils.uploadCompletePost(
        imageFile,
        title,
        description,
        attributes
      );

      console.log('Upload complete post result:', result);

      if (result.success && result.imageHash && result.metadataHash) {
        console.log('Upload successful:', {
          imageHash: result.imageHash,
          metadataHash: result.metadataHash
        });
        onSuccess?.(result.imageHash, result.metadataHash);
        return result;
      } else {
        const errorMsg = result.error || 'Complete post upload failed';
        console.error('Upload failed:', errorMsg);
        setError(errorMsg);
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Complete post upload failed';
      console.error('Upload error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setUploadProgress(0);
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadFile,
    uploadImage,
    uploadJSON,
    uploadCompletePost,
    reset
  };
};

// Hook for fetching data from IPFS
export const useLighthouseFetch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJSON = useCallback(async <T = any>(
    ipfsHash: string,
    onSuccess?: (data: T) => void
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await lighthouseService.getJSON<T>(ipfsHash);
      onSuccess?.(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch JSON');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchText = useCallback(async (
    ipfsHash: string,
    onSuccess?: (text: string) => void
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await lighthouseService.getText(ipfsHash);
      onSuccess?.(text);
      return text;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch text');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBlob = useCallback(async (
    ipfsHash: string,
    onSuccess?: (blob: Blob) => void
  ): Promise<Blob | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const blob = await lighthouseService.getBlob(ipfsHash);
      onSuccess?.(blob);
      return blob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (
    ipfsHash: string,
    filename?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await lighthouseUtils.downloadFile(ipfsHash, filename);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fetchJSON,
    fetchText,
    fetchBlob,
    downloadFile
  };
};

// Hook for managing Lighthouse uploads
export const useLighthouseManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllUploads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const uploads = await lighthouseService.getAllUploads();
      return uploads;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get uploads');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const isConnected = await lighthouseService.testAuthentication();
      if (!isConnected) {
        setError('Authentication failed - check your API key');
      }
      return isConnected;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUploadStatus = useCallback(async (ipfsHash: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await lighthouseService.getUploadStatus(ipfsHash);
      return status;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get upload status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getAllUploads,
    testConnection,
    getUploadStatus
  };
};
