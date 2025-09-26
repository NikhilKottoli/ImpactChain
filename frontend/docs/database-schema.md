# Web3 Social Cause App - Database Schema

## Core Tables

### 1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    profile_image_url TEXT,
    bio TEXT,
    reputation_score INTEGER DEFAULT 0,
    total_campaigns_created INTEGER DEFAULT 0,
    total_campaigns_participated INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Social Posts Table

```sql
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_urls TEXT[], -- Array of image URLs
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name VARCHAR(255),
    category_type VARCHAR(50), -- 'river_cleaning', 'dog_feeding', 'pothole_fixing', etc.
    nft_token_id VARCHAR(255), -- On-chain NFT token ID
    nft_contract_address VARCHAR(42),
    ipfs_metadata_hash VARCHAR(255), -- IPFS hash for metadata
    ai_labels JSONB, -- AI-generated labels for the post
    like_count INTEGER DEFAULT 0,
    cheer_amount DECIMAL(18, 8) DEFAULT 0, -- Total amount received in cheers
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Post Interactions Table

```sql
CREATE TABLE post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL, -- 'like', 'cheer'
    cheer_amount DECIMAL(18, 8), -- Amount if it's a cheer
    transaction_hash VARCHAR(66), -- Blockchain transaction hash for cheers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id, interaction_type)
);
```

### 4. Campaigns Table

```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_type VARCHAR(50) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_name VARCHAR(255),
    event_date TIMESTAMP NOT NULL,
    registration_deadline TIMESTAMP,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    has_bounty BOOLEAN DEFAULT FALSE,
    bounty_amount DECIMAL(18, 8),
    bounty_funder_id UUID REFERENCES users(id),
    stake_amount DECIMAL(18, 8), -- Required stake for RSVP
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    ipfs_data_hash VARCHAR(255), -- IPFS hash for campaign data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Campaign RSVPs Table

```sql
CREATE TABLE campaign_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stake_amount DECIMAL(18, 8) NOT NULL,
    stake_transaction_hash VARCHAR(66),
    attendance_verified BOOLEAN DEFAULT FALSE,
    bounty_received BOOLEAN DEFAULT FALSE,
    stake_returned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, user_id)
);
```

### 6. DAO Voters Table

```sql
CREATE TABLE dao_voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    voter_wallet_address VARCHAR(42) NOT NULL,
    voter_name VARCHAR(255),
    assigned_by_id UUID REFERENCES users(id), -- Who assigned this voter
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, voter_wallet_address)
);
```

### 7. Attestations Table

```sql
CREATE TABLE attestations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rsvp_id UUID REFERENCES campaign_rsvps(id) ON DELETE CASCADE,
    voter_signatures JSONB, -- Array of voter signatures
    attestation_hash VARCHAR(255), -- Generated attestation hash
    ipfs_proof_hash VARCHAR(255), -- IPFS hash for attestation proof
    on_chain_reference VARCHAR(255), -- On-chain attestation reference
    is_verified BOOLEAN DEFAULT FALSE,
    verification_count INTEGER DEFAULT 0,
    total_voters INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Voter Signatures Table

```sql
CREATE TABLE voter_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attestation_id UUID REFERENCES attestations(id) ON DELETE CASCADE,
    voter_wallet_address VARCHAR(42) NOT NULL,
    signature VARCHAR(255) NOT NULL,
    vote BOOLEAN NOT NULL, -- TRUE for verified attendance, FALSE for not verified
    signature_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attestation_id, voter_wallet_address)
);
```

### 9. Data Labels Table

```sql
CREATE TABLE data_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    label_type VARCHAR(50) NOT NULL, -- 'pothole', 'river_pollution', 'waste_accumulation', etc.
    confidence_score DECIMAL(5, 4), -- AI confidence score (0-1)
    bounding_box JSONB, -- Coordinates for object detection
    metadata JSONB, -- Additional label metadata
    ai_model_version VARCHAR(50),
    human_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. Datasets Table

```sql
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    total_data_points INTEGER DEFAULT 0,
    price_per_access DECIMAL(18, 8),
    access_count INTEGER DEFAULT 0,
    revenue_generated DECIMAL(18, 8) DEFAULT 0,
    ipfs_hash VARCHAR(255), -- IPFS hash for dataset
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. Dataset Purchases Table

```sql
CREATE TABLE dataset_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    buyer_organization VARCHAR(255) NOT NULL,
    buyer_contact_email VARCHAR(255),
    purchase_amount DECIMAL(18, 8) NOT NULL,
    transaction_hash VARCHAR(66),
    access_granted_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 12. Revenue Sharing Table

```sql
CREATE TABLE revenue_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_purchase_id UUID REFERENCES dataset_purchases(id) ON DELETE CASCADE,
    contributor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    contribution_type VARCHAR(50), -- 'post', 'campaign', 'label_verification'
    share_percentage DECIMAL(5, 4), -- Percentage of revenue (0-1)
    share_amount DECIMAL(18, 8),
    transaction_hash VARCHAR(66),
    paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Smart Contract Integration Tables

### 13. NFT Metadata Table

```sql
CREATE TABLE nft_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
    token_id VARCHAR(255) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    metadata_uri VARCHAR(255), -- IPFS URI
    mint_transaction_hash VARCHAR(66),
    owner_wallet_address VARCHAR(42),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_address, token_id)
);
```

### 14. Paymaster Transactions Table

```sql
CREATE TABLE paymaster_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50), -- 'stake_return', 'bounty_payment', 'cheer_payment'
    amount DECIMAL(18, 8),
    gas_sponsored BOOLEAN DEFAULT TRUE,
    transaction_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Relationships and Constraints

### Foreign Key Relationships:

1. **Users** ← (1:many) → **Social Posts**
2. **Users** ← (1:many) → **Campaigns**
3. **Campaigns** ← (1:many) → **Campaign RSVPs**
4. **Campaigns** ← (1:many) → **DAO Voters**
5. **Campaign RSVPs** ← (1:1) → **Attestations**
6. **Attestations** ← (1:many) → **Voter Signatures**
7. **Social Posts/Campaigns** ← (1:many) → **Data Labels**
8. **Datasets** ← (1:many) → **Dataset Purchases**

### Business Logic Constraints:

1. A user can only RSVP once per campaign
2. Attestations can only be created after campaign completion
3. Bounty can only be distributed after successful attestation
4. Stakes are returned only for verified attendees or campaign cancellation
5. DAO voters must be assigned before campaign completion
6. Dataset revenue is distributed based on contribution percentage

## Indexes for Performance:

```sql
-- User lookup indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);

-- Post and campaign lookup indexes
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX idx_social_posts_category ON social_posts(category_type);
CREATE INDEX idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_event_date ON campaigns(event_date);

-- RSVP and attestation indexes
CREATE INDEX idx_campaign_rsvps_campaign_id ON campaign_rsvps(campaign_id);
CREATE INDEX idx_campaign_rsvps_user_id ON campaign_rsvps(user_id);
CREATE INDEX idx_attestations_campaign_id ON attestations(campaign_id);

-- DAO and voting indexes
CREATE INDEX idx_dao_voters_campaign_id ON dao_voters(campaign_id);
CREATE INDEX idx_voter_signatures_attestation_id ON voter_signatures(attestation_id);
```

This schema supports all the flows mentioned:

1. **Social Media Posts** with NFT generation and cheering
2. **Campaign & Bounty** management with staking and DAO voting
3. **Attestation** system with cryptographic proofs
4. **Dataset Monetization** with revenue sharing
