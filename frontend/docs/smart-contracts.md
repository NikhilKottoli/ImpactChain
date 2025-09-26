# Smart Contract Architecture for Web3 Social Impact Platform

## Contract Overview

### 1. SocialImpactNFT Contract

**Purpose**: Mint NFTs for social impact posts with metadata stored on IPFS

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SocialImpactNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct PostMetadata {
        string ipfsHash;
        address creator;
        string category;
        uint256 timestamp;
        uint256 cheerAmount;
    }

    mapping(uint256 => PostMetadata) public tokenMetadata;
    mapping(address => uint256[]) public userTokens;

    event PostMinted(uint256 indexed tokenId, address indexed creator, string ipfsHash);
    event CheerReceived(uint256 indexed tokenId, address indexed sender, uint256 amount);

    function mintPost(string memory ipfsHash, string memory category) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);

        tokenMetadata[newTokenId] = PostMetadata({
            ipfsHash: ipfsHash,
            creator: msg.sender,
            category: category,
            timestamp: block.timestamp,
            cheerAmount: 0
        });

        userTokens[msg.sender].push(newTokenId);

        emit PostMinted(newTokenId, msg.sender, ipfsHash);
        return newTokenId;
    }

    function cheer(uint256 tokenId) public payable {
        require(_exists(tokenId), "Token does not exist");
        require(msg.value > 0, "Must send ETH to cheer");

        tokenMetadata[tokenId].cheerAmount += msg.value;

        // Transfer ETH to token creator
        payable(tokenMetadata[tokenId].creator).transfer(msg.value);

        emit CheerReceived(tokenId, msg.sender, msg.value);
    }
}
```

### 2. CampaignManager Contract

**Purpose**: Handle campaign creation, RSVP with staking, and bounty management

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignManager is ReentrancyGuard, Ownable {

    struct Campaign {
        address creator;
        string title;
        string ipfsHash;
        uint256 eventDate;
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 stakeAmount;
        bool hasBounty;
        uint256 bountyAmount;
        address bountyFunder;
        address[] daoVoters;
        bool isCompleted;
        bool isCancelled;
    }

    struct RSVP {
        address participant;
        uint256 stakeAmount;
        bool attended;
        bool stakeReturned;
        bool bountyReceived;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => RSVP)) public campaignRSVPs;
    mapping(uint256 => address[]) public campaignParticipants;

    uint256 public campaignCounter;

    event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title);
    event RSVPCreated(uint256 indexed campaignId, address indexed participant, uint256 stakeAmount);
    event CampaignCompleted(uint256 indexed campaignId);
    event StakeReturned(uint256 indexed campaignId, address indexed participant, uint256 amount);
    event BountyDistributed(uint256 indexed campaignId, address indexed participant, uint256 amount);

    function createCampaign(
        string memory title,
        string memory ipfsHash,
        uint256 eventDate,
        uint256 maxParticipants,
        uint256 stakeAmount,
        bool hasBounty,
        address[] memory daoVoters
    ) public payable returns (uint256) {
        require(eventDate > block.timestamp, "Event date must be in future");
        require(maxParticipants > 0, "Must allow at least 1 participant");
        require(stakeAmount > 0, "Stake amount must be greater than 0");

        if (hasBounty) {
            require(msg.value > 0, "Must fund bounty");
            require(daoVoters.length >= 2, "Need at least 2 DAO voters for bounty campaigns");
        }

        campaignCounter++;
        uint256 campaignId = campaignCounter;

        campaigns[campaignId] = Campaign({
            creator: msg.sender,
            title: title,
            ipfsHash: ipfsHash,
            eventDate: eventDate,
            maxParticipants: maxParticipants,
            currentParticipants: 0,
            stakeAmount: stakeAmount,
            hasBounty: hasBounty,
            bountyAmount: msg.value,
            bountyFunder: msg.sender,
            daoVoters: daoVoters,
            isCompleted: false,
            isCancelled: false
        });

        emit CampaignCreated(campaignId, msg.sender, title);
        return campaignId;
    }

    function rsvp(uint256 campaignId) public payable nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.isCompleted && !campaign.isCancelled, "Campaign not active");
        require(campaign.currentParticipants < campaign.maxParticipants, "Campaign full");
        require(msg.value == campaign.stakeAmount, "Incorrect stake amount");
        require(campaignRSVPs[campaignId][msg.sender].participant == address(0), "Already registered");

        campaignRSVPs[campaignId][msg.sender] = RSVP({
            participant: msg.sender,
            stakeAmount: msg.value,
            attended: false,
            stakeReturned: false,
            bountyReceived: false
        });

        campaignParticipants[campaignId].push(msg.sender);
        campaign.currentParticipants++;

        emit RSVPCreated(campaignId, msg.sender, msg.value);
    }

    function cancelCampaign(uint256 campaignId) public {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.creator, "Only creator can cancel");
        require(!campaign.isCompleted, "Campaign already completed");

        campaign.isCancelled = true;

        // Return all stakes
        address[] memory participants = campaignParticipants[campaignId];
        for (uint i = 0; i < participants.length; i++) {
            address participant = participants[i];
            RSVP storage rsvp = campaignRSVPs[campaignId][participant];
            if (!rsvp.stakeReturned) {
                rsvp.stakeReturned = true;
                payable(participant).transfer(rsvp.stakeAmount);
            }
        }

        // Return bounty to funder
        if (campaign.hasBounty && campaign.bountyAmount > 0) {
            payable(campaign.bountyFunder).transfer(campaign.bountyAmount);
        }
    }
}
```

### 3. AttestationService Contract

**Purpose**: Handle DAO voting and attestation creation for campaign verification

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AttestationService is ReentrancyGuard {
    using ECDSA for bytes32;

    struct Attestation {
        uint256 campaignId;
        address participant;
        bytes32 attestationHash;
        string ipfsProofHash;
        uint256 verificationCount;
        uint256 totalVoters;
        bool isVerified;
        uint256 timestamp;
    }

    struct VoterSignature {
        address voter;
        bool vote;
        bytes signature;
        uint256 timestamp;
    }

    mapping(bytes32 => Attestation) public attestations;
    mapping(bytes32 => mapping(address => VoterSignature)) public voterSignatures;
    mapping(bytes32 => address[]) public attestationVoters;

    CampaignManager public campaignManager;

    event AttestationCreated(bytes32 indexed attestationHash, uint256 indexed campaignId, address indexed participant);
    event VoterSignatureAdded(bytes32 indexed attestationHash, address indexed voter, bool vote);
    event AttestationVerified(bytes32 indexed attestationHash, address indexed participant);

    constructor(address _campaignManager) {
        campaignManager = CampaignManager(_campaignManager);
    }

    function createAttestation(
        uint256 campaignId,
        address participant,
        string memory ipfsProofHash
    ) public returns (bytes32) {
        // Verify campaign exists and is completed
        (,,,,,,,, bool isCompleted,) = campaignManager.campaigns(campaignId);
        require(isCompleted, "Campaign not completed");

        // Create unique attestation hash
        bytes32 attestationHash = keccak256(
            abi.encodePacked(campaignId, participant, block.timestamp)
        );

        // Get DAO voters for this campaign
        (, address[] memory daoVoters) = campaignManager.getCampaignVoters(campaignId);

        attestations[attestationHash] = Attestation({
            campaignId: campaignId,
            participant: participant,
            attestationHash: attestationHash,
            ipfsProofHash: ipfsProofHash,
            verificationCount: 0,
            totalVoters: daoVoters.length,
            isVerified: false,
            timestamp: block.timestamp
        });

        emit AttestationCreated(attestationHash, campaignId, participant);
        return attestationHash;
    }

    function submitVoterSignature(
        bytes32 attestationHash,
        bool vote,
        bytes memory signature
    ) public {
        Attestation storage attestation = attestations[attestationHash];
        require(attestation.timestamp > 0, "Attestation does not exist");
        require(!attestation.isVerified, "Already verified");

        // Verify voter is authorized for this campaign
        require(isAuthorizedVoter(attestation.campaignId, msg.sender), "Not authorized voter");

        // Prevent double voting
        require(voterSignatures[attestationHash][msg.sender].voter == address(0), "Already voted");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(attestationHash, vote, msg.sender));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredAddress = ethSignedMessageHash.recover(signature);
        require(recoveredAddress == msg.sender, "Invalid signature");

        voterSignatures[attestationHash][msg.sender] = VoterSignature({
            voter: msg.sender,
            vote: vote,
            signature: signature,
            timestamp: block.timestamp
        });

        attestationVoters[attestationHash].push(msg.sender);

        if (vote) {
            attestation.verificationCount++;
        }

        // Check if majority reached
        if (attestation.verificationCount > attestation.totalVoters / 2) {
            attestation.isVerified = true;
            emit AttestationVerified(attestationHash, attestation.participant);

            // Trigger bounty distribution in CampaignManager
            campaignManager.distributeRewards(attestation.campaignId, attestation.participant);
        }

        emit VoterSignatureAdded(attestationHash, msg.sender, vote);
    }

    function isAuthorizedVoter(uint256 campaignId, address voter) public view returns (bool) {
        (, address[] memory daoVoters) = campaignManager.getCampaignVoters(campaignId);
        for (uint i = 0; i < daoVoters.length; i++) {
            if (daoVoters[i] == voter) {
                return true;
            }
        }
        return false;
    }
}
```

### 4. DatasetRegistry Contract

**Purpose**: Track dataset creation and sales with revenue sharing

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DatasetRegistry is Ownable, ReentrancyGuard {

    struct Dataset {
        string name;
        string ipfsHash;
        string category;
        uint256 pricePerAccess;
        uint256 totalDataPoints;
        address[] contributors;
        mapping(address => uint256) contributorShares; // Percentage in basis points (10000 = 100%)
        uint256 totalSales;
        uint256 accessCount;
        bool isActive;
        uint256 createdAt;
    }

    struct Purchase {
        address buyer;
        uint256 amount;
        uint256 timestamp;
        string buyerInfo; // IPFS hash of buyer details
    }

    mapping(uint256 => Dataset) public datasets;
    mapping(uint256 => Purchase[]) public datasetPurchases;
    mapping(address => uint256) public pendingWithdrawals;

    uint256 public datasetCounter;
    uint256 public constant PLATFORM_FEE = 2000; // 20%
    uint256 public constant DAO_FEE = 500; // 5%

    event DatasetCreated(uint256 indexed datasetId, string name, uint256 pricePerAccess);
    event DatasetPurchased(uint256 indexed datasetId, address indexed buyer, uint256 amount);
    event RevenueDistributed(uint256 indexed datasetId, address indexed contributor, uint256 amount);

    function createDataset(
        string memory name,
        string memory ipfsHash,
        string memory category,
        uint256 pricePerAccess,
        uint256 totalDataPoints,
        address[] memory contributors,
        uint256[] memory shares // In basis points
    ) public onlyOwner returns (uint256) {
        require(contributors.length == shares.length, "Contributors and shares length mismatch");
        require(pricePerAccess > 0, "Price must be greater than 0");

        // Verify shares sum to 100% minus platform fees
        uint256 totalShares = 0;
        for (uint i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares <= 10000 - PLATFORM_FEE - DAO_FEE, "Shares exceed available percentage");

        datasetCounter++;
        uint256 datasetId = datasetCounter;

        Dataset storage dataset = datasets[datasetId];
        dataset.name = name;
        dataset.ipfsHash = ipfsHash;
        dataset.category = category;
        dataset.pricePerAccess = pricePerAccess;
        dataset.totalDataPoints = totalDataPoints;
        dataset.contributors = contributors;
        dataset.totalSales = 0;
        dataset.accessCount = 0;
        dataset.isActive = true;
        dataset.createdAt = block.timestamp;

        // Set contributor shares
        for (uint i = 0; i < contributors.length; i++) {
            dataset.contributorShares[contributors[i]] = shares[i];
        }

        emit DatasetCreated(datasetId, name, pricePerAccess);
        return datasetId;
    }

    function purchaseDatasetAccess(
        uint256 datasetId,
        string memory buyerInfo
    ) public payable nonReentrant {
        Dataset storage dataset = datasets[datasetId];
        require(dataset.isActive, "Dataset not active");
        require(msg.value == dataset.pricePerAccess, "Incorrect payment amount");

        // Record purchase
        datasetPurchases[datasetId].push(Purchase({
            buyer: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            buyerInfo: buyerInfo
        }));

        dataset.totalSales += msg.value;
        dataset.accessCount++;

        // Distribute revenue
        distributeRevenue(datasetId, msg.value);

        emit DatasetPurchased(datasetId, msg.sender, msg.value);
    }

    function distributeRevenue(uint256 datasetId, uint256 amount) internal {
        Dataset storage dataset = datasets[datasetId];

        // Platform fee
        uint256 platformFee = (amount * PLATFORM_FEE) / 10000;
        pendingWithdrawals[owner()] += platformFee;

        // DAO fee (could be sent to DAO treasury)
        uint256 daoFee = (amount * DAO_FEE) / 10000;
        pendingWithdrawals[owner()] += daoFee; // For now, goes to owner

        // Distribute to contributors
        uint256 remainingAmount = amount - platformFee - daoFee;
        for (uint i = 0; i < dataset.contributors.length; i++) {
            address contributor = dataset.contributors[i];
            uint256 contributorShare = dataset.contributorShares[contributor];
            uint256 contributorAmount = (remainingAmount * contributorShare) / 10000;

            pendingWithdrawals[contributor] += contributorAmount;

            emit RevenueDistributed(datasetId, contributor, contributorAmount);
        }
    }

    function withdraw() public nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
```

### 5. PaymasterService Contract

**Purpose**: Handle gasless transactions and automated payments

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymasterService is Ownable, ReentrancyGuard {

    struct SponsoredTransaction {
        address user;
        address target;
        bytes data;
        uint256 gasLimit;
        uint256 gasPrice;
        uint256 timestamp;
        bool executed;
    }

    mapping(bytes32 => SponsoredTransaction) public sponsoredTxs;
    mapping(address => bool) public authorizedCallers;
    mapping(address => uint256) public userGasCredits;

    uint256 public gasDepositPool;

    event TransactionSponsored(bytes32 indexed txHash, address indexed user);
    event TransactionExecuted(bytes32 indexed txHash, bool success);
    event GasDeposited(address indexed user, uint256 amount);

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    function setAuthorizedCaller(address caller, bool authorized) public onlyOwner {
        authorizedCallers[caller] = authorized;
    }

    function depositGas() public payable {
        require(msg.value > 0, "Must deposit ETH");
        gasDepositPool += msg.value;
        emit GasDeposited(msg.sender, msg.value);
    }

    function sponsorTransaction(
        address user,
        address target,
        bytes memory data,
        uint256 gasLimit
    ) public onlyAuthorized returns (bytes32) {
        bytes32 txHash = keccak256(abi.encodePacked(user, target, data, block.timestamp));

        sponsoredTxs[txHash] = SponsoredTransaction({
            user: user,
            target: target,
            data: data,
            gasLimit: gasLimit,
            gasPrice: tx.gasprice,
            timestamp: block.timestamp,
            executed: false
        });

        emit TransactionSponsored(txHash, user);
        return txHash;
    }

    function executeSponsored(bytes32 txHash) public onlyAuthorized nonReentrant {
        SponsoredTransaction storage txData = sponsoredTxs[txHash];
        require(!txData.executed, "Already executed");
        require(txData.timestamp > 0, "Transaction not found");

        uint256 gasBefore = gasleft();

        // Execute the transaction
        (bool success, ) = txData.target.call{gas: txData.gasLimit}(txData.data);

        uint256 gasUsed = gasBefore - gasleft();
        uint256 gasCost = gasUsed * txData.gasPrice;

        // Deduct gas cost from pool
        require(gasDepositPool >= gasCost, "Insufficient gas funds");
        gasDepositPool -= gasCost;

        txData.executed = true;

        emit TransactionExecuted(txHash, success);
    }

    // Emergency withdrawal for owner
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
```

## Deployment Strategy

### 1. Contract Deployment Order

1. **PaymasterService** - Deploy first for gasless transactions
2. **SocialImpactNFT** - For post minting
3. **CampaignManager** - For campaign and bounty management
4. **AttestationService** - Pass CampaignManager address
5. **DatasetRegistry** - For dataset monetization

### 2. Integration Points

- All contracts should be registered with PaymasterService for gasless transactions
- AttestationService needs CampaignManager address for verification
- Frontend should interact with all contracts through a unified service layer
- IPFS integration for metadata and proof storage

### 3. Security Considerations

- All contracts use OpenZeppelin's security modules (ReentrancyGuard, Ownable)
- Signature verification for DAO voting
- Proper access controls for sensitive functions
- Emergency pause functionality should be added for production

### 4. Gas Optimization

- Use events for off-chain indexing
- Batch operations where possible
- Implement proxy patterns for upgradability
- Consider Layer 2 deployment for lower gas costs

This smart contract architecture supports all the flows defined in your database schema and provides a complete Web3 backend for your social impact platform.
