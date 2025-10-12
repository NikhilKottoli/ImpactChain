// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SocialMediaPosts {
    
    error PostNotFound();
    error PostNotActive();
    error InsufficientCheerAmount();
    
    struct Post {
        address creator;
        bool isActive;
        uint128 totalEarnings;
    }
    
    string public constant name = "SocialMediaPost";
    string public constant symbol = "SMP";
    
    address public owner;
    uint256 public _nextTokenId = 1;
    
    mapping(uint256 => Post) public posts;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256[]) public userPosts;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event PostCreated(uint256 indexed tokenId, address indexed creator);
    event PostCheered(uint256 indexed tokenId, address indexed user, uint256 amount);
    event PostDeactivated(uint256 indexed tokenId);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createPost() external returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        ownerOf[tokenId] = msg.sender;
        
        posts[tokenId] = Post({
            creator: msg.sender,
            isActive: true,
            totalEarnings: 0
        });
        
        userPosts[msg.sender].push(tokenId);
        emit Transfer(address(0), msg.sender, tokenId);
        emit PostCreated(tokenId, msg.sender);
    }
    
    function cheerPost(uint256 _tokenId) external payable {
        Post storage post = posts[_tokenId];
        
        if (post.creator == address(0)) revert PostNotFound();
        if (!post.isActive) revert PostNotActive();
        if (msg.value < 1e16) revert InsufficientCheerAmount();
        
        post.totalEarnings += uint128(msg.value);
        
        (bool success, ) = payable(post.creator).call{value: msg.value}("");
        require(success, "Failed");
        
        emit PostCheered(_tokenId, msg.sender, msg.value);
    }
    
    function deactivatePost(uint256 _tokenId) external {
        if (ownerOf[_tokenId] != msg.sender && msg.sender != owner) revert();
        posts[_tokenId].isActive = false;
        emit PostDeactivated(_tokenId);
    }
    
    function withdrawPlatformFunds() external {
        if (msg.sender != owner) revert();
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Failed");
    }
}