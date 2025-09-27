// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SocialMediaPosts
/// @notice NFT-based social media posts with interaction and monetization features
/// @dev Inherits from ERC721URIStorage for metadata storage
/// @author Social Impact Platform Team

contract SocialMediaPosts is ERC721, ERC721URIStorage, Ownable {
    
    /// @notice Custom errors for gas optimization
    error PostNotFound();
    error PostNotActive();
    error AlreadyLiked();
    error InsufficientCheerAmount();
    error NotAuthorized();
    error InvalidInput();
    
    /// @notice Interaction types
    enum InteractionType { LIKE, CHEER }
    
    /// @notice Packed post struct for gas optimization
    struct Post {
        address creator;           // 20 bytes
        uint64 timestamp;         // 8 bytes
        uint32 likes;             // 4 bytes
        bool isActive;            // 1 byte (packed with above)
        uint128 totalEarnings;    // 16 bytes
        string ipfsHash;          // Dynamic - separate slot
        string title;             // Dynamic - separate slot
        string description;       // Dynamic - separate slot
        string[] aiLabels;        // Dynamic - separate slot
    }
    
    /// @notice Packed interaction struct for gas optimization
    struct Interaction {
        address user;             // 20 bytes
        uint64 timestamp;         // 8 bytes
        uint32 amount;            // 4 bytes
        InteractionType interactionType; // 1 byte
    }
    
    uint256 private _nextTokenId;
    
    /// @notice Storage mappings
    mapping(uint256 => Post) public posts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(uint256 => mapping(address => uint256)) public cheerAmounts;
    mapping(uint256 => Interaction[]) public postInteractions;
    mapping(address => uint256[]) public userPosts;
    
    /// @notice Constants
    uint256 public constant MIN_CHEER_AMOUNT = 1e16; // 0.01 ETH
    
    /// @notice Events
    event PostCreated(uint256 indexed tokenId, address indexed creator, string ipfsHash);
    event PostLiked(uint256 indexed tokenId, address indexed liker);
    event PostCheered(uint256 indexed tokenId, address indexed cheerGiver, uint256 amount);
    event AILabelsAdded(uint256 indexed tokenId, string[] labels);
    event PostDeactivated(uint256 indexed tokenId);
    event ContractDeployed(address indexed owner, uint256 timestamp);
    
    /// @notice Constructor - only sets up the contract, NO NFTs created here
    /// @param _initialOwner Address that will own the contract
    constructor(
        address _initialOwner
    ) ERC721("SocialMediaPost", "SMP") Ownable(_initialOwner) {
        _nextTokenId = 1; // Start token IDs at 1 (0 is reserved)
        
        // Emit event to confirm successful deployment
        emit ContractDeployed(_initialOwner, block.timestamp);
    }
    
    /// @notice Creates a new post and mints NFT - THIS is where NFTs are created
    /// @param _ipfsHash IPFS hash of the post content
    /// @param _title Title of the post
    /// @param _description Description of the post
    /// @return tokenId The ID of the created post/NFT
    function createPost(
        string calldata _ipfsHash,
        string calldata _title,
        string calldata _description
    ) external returns (uint256 tokenId) {
        if (bytes(_ipfsHash).length == 0) revert InvalidInput();
        if (bytes(_title).length == 0) revert InvalidInput();
        if (bytes(_description).length == 0) revert InvalidInput();
        
        tokenId = _nextTokenId++;
        
        // THIS is where the NFT gets minted
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _ipfsHash);
        
        // Store post data
        posts[tokenId] = Post({
            creator: msg.sender,
            timestamp: uint64(block.timestamp),
            likes: 0,
            isActive: true,
            totalEarnings: 0,
            ipfsHash: _ipfsHash,
            title: _title,
            description: _description,
            aiLabels: new string[](0)
        });
        
        userPosts[msg.sender].push(tokenId);
        
        emit PostCreated(tokenId, msg.sender, _ipfsHash);
    }
    
    /// @notice Likes a post (free interaction)
    /// @param _tokenId The post token ID to like
    function likePost(uint256 _tokenId) external {
        Post storage post = posts[_tokenId];
        
        if (post.creator == address(0)) revert PostNotFound();
        if (!post.isActive) revert PostNotActive();
        if (hasLiked[_tokenId][msg.sender]) revert AlreadyLiked();
        
        hasLiked[_tokenId][msg.sender] = true;
        unchecked { ++post.likes; }
        
        postInteractions[_tokenId].push(Interaction({
            user: msg.sender,
            timestamp: uint64(block.timestamp),
            amount: 0,
            interactionType: InteractionType.LIKE
        }));
        
        emit PostLiked(_tokenId, msg.sender);
    }
    
    /// @notice Cheers a post with payment
    /// @param _tokenId The post token ID to cheer
    function cheerPost(uint256 _tokenId) external payable {
        Post storage post = posts[_tokenId];
        
        if (post.creator == address(0)) revert PostNotFound();
        if (!post.isActive) revert PostNotActive();
        if (msg.value < MIN_CHEER_AMOUNT) revert InsufficientCheerAmount();
        
        cheerAmounts[_tokenId][msg.sender] += msg.value;
        post.totalEarnings += uint128(msg.value);
        
        postInteractions[_tokenId].push(Interaction({
            user: msg.sender,
            timestamp: uint64(block.timestamp),
            amount: uint32(msg.value),
            interactionType: InteractionType.CHEER
        }));
        
        // Transfer 100% to creator
        (bool success, ) = payable(post.creator).call{value: msg.value}("");
        require(success, "Transfer to creator failed");
        
        emit PostCheered(_tokenId, msg.sender, msg.value);
    }
    
    /// @notice Adds AI-generated labels to a post (owner only)
    function addAILabels(uint256 _tokenId, string[] calldata _labels) external onlyOwner {
        Post storage post = posts[_tokenId];
        if (post.creator == address(0)) revert PostNotFound();
        
        for (uint256 i = 0; i < _labels.length;) {
            post.aiLabels.push(_labels[i]);
            unchecked { ++i; }
        }
        
        emit AILabelsAdded(_tokenId, _labels);
    }
    
    /// @notice Gets post data
    function getPost(uint256 _tokenId) external view returns (Post memory) {
        Post memory post = posts[_tokenId];
        if (post.creator == address(0)) revert PostNotFound();
        return post;
    }
    
    /// @notice Gets post interactions
    function getPostInteractions(uint256 _tokenId) external view returns (Interaction[] memory) {
        return postInteractions[_tokenId];
    }
    
    /// @notice Gets user's posts
    function getUserPosts(address _user) external view returns (uint256[] memory) {
        return userPosts[_user];
    }
    
    /// @notice Gets AI labels for a post
    function getAILabels(uint256 _tokenId) external view returns (string[] memory) {
        Post memory post = posts[_tokenId];
        if (post.creator == address(0)) revert PostNotFound();
        return post.aiLabels;
    }
    
    /// @notice Deactivates a post
    function deactivatePost(uint256 _tokenId) external {
        Post storage post = posts[_tokenId];
        if (post.creator == address(0)) revert PostNotFound();
        if (ownerOf(_tokenId) != msg.sender && msg.sender != owner()) revert NotAuthorized();
        
        post.isActive = false;
        emit PostDeactivated(_tokenId);
    }
    
    /// @notice Withdraws any ETH stuck in contract
    function withdrawPlatformFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(owner()).call{value: balance}("");
            require(success, "Withdrawal failed");
        }
    }
    
    /// @notice Gets total number of posts created
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /// @notice Checks if a token exists
    function exists(uint256 tokenId) external view returns (bool) {
        return posts[tokenId].creator != address(0);
    }
    
    /// @notice Get next token ID that will be minted
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
    
    /// @notice Check if contract is properly deployed
    function isDeployed() external view returns (bool) {
        return _nextTokenId > 0;
    }

    /// @notice Override tokenURI function
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /// @notice Override supportsInterface for proper interface support
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}