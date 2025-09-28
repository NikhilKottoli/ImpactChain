<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/f368e47f-8d74-46e9-b8e5-a31e1bde5d7a" />

# 🌍 ImpactChain - Web3 Social Impact Platform

<div align="center">

[Demo Link](https://app.supademo.com/demo/cmg2xdgpp01wk1y0i2v3vmaet?utm_source=link)

**Empowering Communities Through Blockchain-Verified Social Impact**

[![Built with](https://img.shields.io/badge/Built%20with-React%20+%20TypeScript-blue)](https://reactjs.org/)
[![Blockchain](https://img.shields.io/badge/Blockchain-World%20Chain-green)](https://worldcoin.org/)
[![Storage](https://img.shields.io/badge/Storage-Filecoin%20+%20IPFS-orange)](https://filecoin.io/)
[![Identity](https://img.shields.io/badge/Identity-ENS%20Domain-purple)](https://ens.domains/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

</div>

## 🚀 Overview

ImpactChain is a revolutionary Web3 social impact platform that combines social media, campaign management, and data monetization to create verified, blockchain-backed social good initiatives. Our platform enables users to document their social impact work, organize community campaigns with bounty rewards, and monetize collected impact data for governmental and organizational use.

### 🌟 Key Features

- **📱 Social Impact Posts**: Create NFT-backed posts of your social work with IPFS metadata storage
- **🎯 Campaign Management**: Organize community events with bounty rewards and DAO verification
- **🗳️ Decentralized Verification**: DAO-based attestation system for campaign participation
- **💰 Economic Incentives**: Stake-based RSVP system with bounty rewards for verified participants
- **📊 Data Monetization**: AI-labeled impact data sold as datasets to governments and organizations
- **🎪 Cheer System**: Support impactful posts with cryptocurrency payments
- **🏛️ ENS Integration**: Subdomain-based identity system for enhanced user experience

## 🏗️ Architecture

### Core Components

```mermaid
graph TB
    A[Frontend React App] --> B[Smart Contracts]
    A --> C[IPFS/Filecoin Storage]
    A --> D[ENS Domains]
    A --> E[Supabase Database]
    
    B --> F[Campaign Contract]
    B --> G[Social Media Contract]
    B --> H[DAO Contract]
    
    C --> I[Lighthouse Storage]
    C --> J[Metadata Storage]
    
    E --> K[User Data]
    E --> L[Campaign Data]
    E --> M[Attestations]
```

### Technology Stack
<img width="818" height="532" alt="Screenshot 2025-09-28 at 4 53 23 AM" src="https://github.com/user-attachments/assets/c4b9d35a-bac8-4322-9687-49b2b62a5d89" />
<img width="1280" height="1214" alt="image" src="https://github.com/user-attachments/assets/ddf15468-f07c-4b05-8f5b-f423c0d9aedc" />



#### 🔗 Blockchain & Web3
- **World Chain**: Primary blockchain for smart contract deployment
- **ENS Domains**: Decentralized identity and subdomain management
- **Ethers.js**: Blockchain interaction library
- **Wagmi**: React hooks for Ethereum

#### 📁 Storage & Data
- **Filecoin/IPFS**: Decentralized storage for media and metadata
- **Lighthouse**: IPFS pinning and storage management
- **Supabase**: Centralized database for app state and relationships

#### 🎨 Frontend
- **React 18 + TypeScript**: Modern React with type safety
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **GSAP**: Advanced animations
- **React Query**: Data fetching and caching

#### 🔧 Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Zustand**: State management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Wallet with World Chain testnet/mainnet access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NikhilKottoli/EthGlobal2025.git
   cd EthGlobal2025
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend services
   cd ../jsBacked
   npm install
   
   cd ../photo-pipeline
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in respective directories:
   
   **Frontend (.env)**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_LIGHTHOUSE_API_KEY=your_lighthouse_api_key
   VITE_PINATA_JWT=your_pinata_jwt
   VITE_WORLD_CHAIN_RPC_URL=your_world_chain_rpc
   VITE_CONTRACT_ADDRESS=deployed_contract_address
   ```

4. **Database Setup**
   
   Run the database schema from `frontend/docs/database-schema.md` in your Supabase instance.

5. **Smart Contract Deployment**
   ```bash
   # Deploy contracts to World Chain
   # See contracts/ directory for deployment scripts
   ```

6. **Start Development Servers**
   ```bash
   # Frontend
   cd frontend && npm run dev
   
   # Backend services
   cd jsBacked && npm start
   cd photo-pipeline && npm start
   ```

## 📋 Core Workflows

### 1. 📱 Social Media Posts Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant C as Contract
    participant I as IPFS
    participant D as Database
    
    U->>A: Create Post with Image
    A->>I: Upload image to IPFS
    I-->>A: Return IPFS hash
    A->>C: Mint NFT with metadata
    C-->>A: Return token ID
    A->>D: Store post data
    D-->>A: Confirmation
    A-->>U: Post created successfully
```

**Features:**
- Upload images and descriptions of social impact work
- Automatic NFT minting with IPFS metadata
- AI labeling for data categorization
- Community engagement through likes and cheers
- Cheer system allows monetary appreciation

### 2. 🎯 Campaign & Bounty Flow

```mermaid
sequenceDiagram
    participant C as Creator
    participant F as Funder
    participant P as Participant
    participant D as DAO
    participant SC as Smart Contract
    
    C->>SC: Create Campaign
    F->>SC: Pay Bounty + Set DAO Voters
    P->>SC: RSVP with Stake
    SC-->>P: Stake Held in Escrow
    Note over C,D: Event Happens
    D->>SC: Vote on Attendance
    SC->>SC: Process Attestations
    SC->>P: Distribute Bounty + Return Stake
```

**Campaign Types:**
- **Fundraiser Campaigns**: Community-funded initiatives
- **Self-Funded Campaigns**: Creator-funded events

**Staking Mechanism:**
- Participants stake cryptocurrency to RSVP
- Verified attendees receive stake back + bounty share
- Unverified participants forfeit stake to verified pool

### 3. 🗳️ Attestation Flow

```mermaid
sequenceDiagram
    participant P as Participant
    participant D as DAO Voters
    participant A as Attestation System
    participant I as IPFS
    participant BC as Blockchain
    
    P->>A: Submit Attendance Proof
    A->>D: Request Verification
    D->>D: Multi-sig Voting Process
    D->>A: Submit Signatures
    A->>A: Generate Attestation Hash
    A->>I: Store Proof on IPFS
    A->>BC: Record On-Chain Reference
    BC-->>P: Attestation Complete
```

**Verification Process:**
- Campaign funder assigns trusted DAO voters
- Voters independently verify attendance
- Multi-signature attestation system
- Cryptographic proof stored on IPFS
- On-chain attestation reference for immutability

### 4. 📊 Dataset Monetization

```mermaid
graph LR
    A[Social Posts] --> B[AI Labeling]
    C[Campaign Data] --> B
    B --> D[Dataset Creation]
    D --> E[Government Purchase]
    E --> F[Revenue Distribution]
    F --> G[Contributors]
    F --> H[Platform]
```

**Monetization Strategy:**
- Aggregate impact data from posts and campaigns
- AI-powered labeling and categorization
- Create purchasable datasets for:
  - Government infrastructure planning
  - NGO impact measurement
  - Urban planning initiatives
- Revenue sharing with data contributors

## 🎨 User Interface

### Key Pages & Components

- **🏠 Landing Page**: Platform introduction and wallet connection
- **📱 Social Feed**: Browse and interact with impact posts
- **🎯 Campaign Hub**: Discover and join community campaigns
- **📊 Dashboard**: Personal impact metrics and earnings
- **👤 Profile Builder**: ENS-based profile management
- **🏛️ DAO Interface**: Voting and attestation management

### 🎪 ENS Integration

- **Subdomain Creation**: Users can create personalized subdomains
- **Identity Management**: ENS-based profile system
- **Social Features**: Follow users via ENS names
- **Campaign URLs**: Human-readable campaign addresses

## 📜 Smart Contracts

### Core Contracts

#### 1. `CampaignBountyManager.sol`
- **Purpose**: Campaign creation, bounty escrow, RSVP staking
- **Key Functions**:
  - `createCampaign()`: Initialize new campaigns
  - `payBountyToEscrow()`: Fund campaigns with bounties
  - `rsvpToCampaign()`: Stake-based participation
  - `completeCampaign()`: Distribute rewards post-verification

#### 2. `SocialMediaContract.sol`
- **Purpose**: NFT minting for social posts
- **Key Functions**:
  - `mintPost()`: Create NFT for social impact posts
  - `cheerPost()`: Monetary appreciation system

#### 3. `DataDAO.sol`
- **Purpose**: Decentralized verification and governance
- **Key Functions**:
  - `assignVoters()`: Set campaign verifiers
  - `submitVote()`: Attendance verification voting
  - `generateAttestation()`: Create cryptographic proofs

### Contract Deployment

Contracts are deployed on World Chain with the following addresses:
- Campaign Manager: `0x...` (to be deployed)
- Social Media: `0x...` (to be deployed)
- DAO Contract: `0x...` (to be deployed)

## 🗄️ Database Schema

Our hybrid architecture uses both on-chain and off-chain storage:

### Key Tables
- **Users**: Profile data and reputation scores
- **Social Posts**: Content metadata and engagement metrics
- **Campaigns**: Event details and participation tracking
- **Attestations**: Verification proofs and DAO voting records
- **Datasets**: Monetized data packages and revenue tracking

*Full schema available in `frontend/docs/database-schema.md`*

## 🔒 Security & Privacy

### Security Measures
- **Smart Contract Auditing**: Comprehensive security reviews
- **Multi-Signature Verification**: DAO-based attestation system
- **Stake-Based Participation**: Economic incentives for honest behavior
- **IPFS Content Addressing**: Immutable content storage

### Privacy Considerations
- **Pseudonymous Participation**: Wallet-based identity
- **Optional Profile Information**: User-controlled data sharing
- **Decentralized Storage**: No single point of failure
- **ENS Privacy**: Optional identity revelation

## 🤝 Contributing

We welcome contributions to ImpactChain! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style
- Test smart contract changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **World Chain** for providing scalable blockchain infrastructure
- **ENS Domains** for decentralized identity solutions
- **Filecoin/IPFS** for decentralized storage capabilities
- **Lighthouse** for IPFS pinning services
- **Supabase** for reliable database infrastructure

## 📞 Contact & Support

- **Project Repository**: [GitHub](https://github.com/NikhilKottoli/EthGlobal2025)
- **Documentation**: [Project Docs](frontend/docs/)
- **Issues**: [GitHub Issues](https://github.com/NikhilKottoli/EthGlobal2025/issues)

---

<img width="1470" height="831" alt="Screenshot 2025-09-28 at 6 59 43 AM" src="https://github.com/user-attachments/assets/5fe425da-cac9-4a2f-ab1f-abe9e70ad164" />
<img width="1920" height="1080" alt="Screenshot From 2025-09-28 06-01-03" src="https://github.com/user-attachments/assets/7731e187-62d0-46b4-a566-ea3557c8962d" />
<img width="1920" height="1080" alt="Screenshot From 2025-09-28 00-18-47" src="https://github.com/user-attachments/assets/687e7172-3c6b-44a5-aa2a-d971f667f587" />
<img width="1920" height="1080" alt="Screenshot From 2025-09-28 06-51-16" src="https://github.com/user-attachments/assets/8ac673f2-b489-4043-92c7-f70ca9910da4" />
<img width="1920" height="1080" alt="Screenshot From 2025-09-28 06-52-28" src="https://github.com/user-attachments/assets/f816b710-54c1-4b2c-96d0-295c38df82cb" />
<img width="1920" height="1080" alt="Screenshot From 2025-09-28 00-15-12" src="https://github.com/user-attachments/assets/546f3212-a2af-412e-86f3-e747bf8c4995" />
<img width="1449" height="749" alt="Screenshot 2025-09-28 at 7 28 53 AM" src="https://github.com/user-attachments/assets/46f59ee4-16a6-4dc4-9903-93adad8dc9ce" />
<img width="1470" height="832" alt="Screenshot 2025-09-28 at 8 27 51 AM" src="https://github.com/user-attachments/assets/226d25f7-93ef-4540-a6aa-4ff8b6912ebf" />







<div align="center">

**🌍 Making Social Impact Verifiable, Sustainable, and Rewarding**

Built with ❤️ for EthGlobal 2025

</div>
