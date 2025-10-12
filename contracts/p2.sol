
// ============================================================================
// CONTRACT 2: SocialMediaPostsLikes
// ============================================================================
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SocialMediaPostsLikes {
    
    error AlreadyLiked();
    
    mapping(uint256 => uint32) public postLikes;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    
    event PostLiked(uint256 indexed tokenId, address indexed liker);
    
    function likePost(uint256 _tokenId) external {
        if (hasLiked[_tokenId][msg.sender]) revert AlreadyLiked();
        
        hasLiked[_tokenId][msg.sender] = true;
        unchecked { ++postLikes[_tokenId]; }
        
        emit PostLiked(_tokenId, msg.sender);
    }
    
    function getLikes(uint256 _tokenId) external view returns (uint32) {
        return postLikes[_tokenId];
    }
}
