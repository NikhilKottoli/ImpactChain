import { ethers } from 'ethers';

// Wallet connection utilities
export class WalletConnection {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  // Connect to wallet
  async connect(): Promise<{ address: string; provider: ethers.BrowserProvider }> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      return { address, provider: this.provider };
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error}`);
    }
  }

  // Get current account
  async getCurrentAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) return null;
    
    try {
      // If we have a provider, use it
      if (this.provider) {
        const signer = await this.provider.getSigner();
        return await signer.getAddress();
      }
      
      // Otherwise, check MetaMask directly
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0 ? accounts[0] : null;
    } catch {
      return null;
    }
  }

  // Get provider
  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  // Get signer
  async getSigner(): Promise<ethers.Signer | null> {
    if (!this.provider) return null;
    return await this.provider.getSigner();
  }

  // Check if connected
  async isConnected(): Promise<boolean> {
    if (!this.isMetaMaskInstalled()) return false;
    
    try {
      // First check if we have a provider
      if (this.provider) {
        const accounts = await this.provider.listAccounts();
        return accounts.length > 0;
      }
      
      // If no provider, check MetaMask directly
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  // Initialize provider if MetaMask is connected but provider isn't set
  async initializeProvider(): Promise<void> {
    if (!this.isMetaMaskInstalled()) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0 && !this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  // Switch to a specific network
  async switchNetwork(chainId: string): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not found');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        throw new Error('Network not found in wallet');
      }
      throw error;
    }
  }

  // Get network info
  async getNetwork(): Promise<ethers.Network | null> {
    if (!this.provider) return null;
    return await this.provider.getNetwork();
  }

  // Listen for account changes
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen for network changes
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  // Remove event listeners
  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  // Disconnect wallet
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.removeAllListeners();
  }
}

// Global wallet instance
export const walletConnection = new WalletConnection();

// Utility functions
export const formatEther = (value: bigint): string => {
  return ethers.formatEther(value);
};

export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value);
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Check if address is valid
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};
