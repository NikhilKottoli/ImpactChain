
// ============================================================================
// CONTRACT 3: SocialMediaPostsInteractions
// ============================================================================
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SocialMediaPostsInteractions {
    
    error UnauthorizedCaller();
    
    enum InteractionType { LIKE, CHEER }
    
    struct Interaction {
        address user;
        uint64 timestamp;
        uint32 amount;
        InteractionType interactionType;
    }
    
    address public coreContractAddress;
    mapping(uint256 => Interaction[]) public postInteractions;
    
    event InteractionRecorded(uint256 indexed tokenId, address indexed user, InteractionType iType);
    
    constructor(address _coreContract) {
        coreContractAddress = _coreContract;
    }
    
    modifier onlyCore() {
        if (msg.sender != coreContractAddress) revert UnauthorizedCaller();
        _;
    }
    
    function recordLike(uint256 _tokenId, address _user) external onlyCore {
        postInteractions[_tokenId].push(Interaction({
            user: _user,
            timestamp: uint64(block.timestamp),
            amount: 0,
            interactionType: InteractionType.LIKE
        }));
        emit InteractionRecorded(_tokenId, _user, InteractionType.LIKE);
    }
    
    function recordCheer(uint256 _tokenId, address _user, uint256 _amount) external onlyCore {
        postInteractions[_tokenId].push(Interaction({
            user: _user,
            timestamp: uint64(block.timestamp),
            amount: uint32(_amount),
            interactionType: InteractionType.CHEER
        }));
        emit InteractionRecorded(_tokenId, _user, InteractionType.CHEER);
    }
    
    function getPostInteractions(uint256 _tokenId) external view returns (Interaction[] memory) {
        return postInteractions[_tokenId];
    }
    
    function getInteractionCount(uint256 _tokenId) external view returns (uint256) {
        return postInteractions[_tokenId].length;
    }
}