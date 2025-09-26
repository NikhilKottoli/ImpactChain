import React from 'react';
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum, base, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, walletConnect, metaMask } from 'wagmi/connectors';

// Manual Wagmi configuration (React 19 compatible)
export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, base, optimism],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: "314b8a40c646aea9ef1050a70828c8c9",
      metadata: {
        name: "Campaign Manager",
        description: "Decentralized Campaign Management with ENS Integration",
        url: "https://localhost:5173",
        icons: ["https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"]
      }
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
  },
});

// Create QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Web3Provider component (React 19 compatible)
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
