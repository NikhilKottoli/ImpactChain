// ============================================================================
// CONTRACT 4: SocialMediaPostsMetadata
// ============================================================================
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SocialMediaPostsMetadata {
    
    error PostNotFound();
    error UnauthorizedCaller();
    
    struct PostMeta {
        string title;
        string description;
    }
    
    address public coreContractAddress;
    address public owner;
    
    mapping(uint256 => PostMeta) public postMeta;
    mapping(uint256 => string[]) public aiLabels;
    
    event MetadataStored(uint256 indexed tokenId, string title, string description);
    event AILabelsAdded(uint256 indexed tokenId, string[] labels);
    
    constructor(address _coreContract) {
        coreContractAddress = _coreContract;
        owner = msg.sender;
    }
    
    modifier onlyCore() {
        if (msg.sender != coreContractAddress) revert UnauthorizedCaller();
        _;
    }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert UnauthorizedCaller();
        _;
    }
    
    function storeMetadata(
        uint256 _tokenId,
        string calldata _title,
        string calldata _description
    ) external onlyCore {
        postMeta[_tokenId] = PostMeta({
            title: _title,
            description: _description
        });
        emit MetadataStored(_tokenId, _title, _description);
    }
    
    function addAILabels(uint256 _tokenId, string[] calldata _labels) external onlyOwner {
        if (bytes(postMeta[_tokenId].title).length == 0) revert PostNotFound();
        
        for (uint256 i = 0; i < _labels.length;) {
            aiLabels[_tokenId].push(_labels[i]);
            unchecked { ++i; }
        }
        
        emit AILabelsAdded(_tokenId, _labels);
    }
    
    function getPostMetadata(uint256 _tokenId) external view returns (PostMeta memory) {
        return postMeta[_tokenId];
    }
    
    function getAILabels(uint256 _tokenId) external view returns (string[] memory) {
        return aiLabels[_tokenId];
    }
}