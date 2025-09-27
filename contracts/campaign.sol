// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title CampaignBountyManager
/// @notice Simplified campaign and bounty management system with escrow functionality
/// @dev Handles campaign creation, bounty escrow, RSVP staking, and manual completion
/// @author Social Impact Platform Team

contract CampaignBountyManager is Ownable, ReentrancyGuard {
    
    /// @notice Custom errors for gas optimization
    error CampaignNotFound();
    error CampaignDeadlinePassed();
    error MaxParticipantsReached();
    error AlreadyRSVPed();
    error InsufficientStakeAmount();
    error CampaignNotInCorrectStatus();
    error InsufficientBountyAmount();
    error InvalidInput();
    error NotAuthorized();
    error TransferFailed();
    error NoVerifiedAddresses();
    error NotVerifier();
    
    address private paymaster;

    function setPaymaster(address _paymaster) external onlyOwner {
        if (_paymaster == address(0)) revert InvalidInput();
        paymaster = _paymaster;
    }

    function getPaymaster() external view returns (address) {
        return paymaster;
    }

    
    /// @notice Campaign status enum
    enum CampaignStatus { 
        CREATED,           // Campaign created, waiting for bounty
        BOUNTY_PAID,       // Bounty paid, verifiers set, accepting RSVPs
        COMPLETED          // Campaign completed, bounties distributed
    }
    
    //Add a getter setter for the paymaster

    /// @notice Campaign struct for storing campaign data
    struct Campaign {
        address creator;              // Campaign creator
        bool isFundraiser;           // Whether it's a fundraising campaign denoting self or NGO
        // string title;                 // Campaign title 
        // string description;           // Campaign description
        uint256 bountyAmount;         // Total bounty amount in escrow
        address bountyPayer;          // Who paid the bounty
        uint256 stakingAmount;        // Required stake amount for RSVP
        // address paymaster;           // Paymaster for handling stakes
        // string locationName;         // Event location
        // string category;             // Campaign category
        // uint64 eventDate;            // Event timestamp
        // uint32 maxParticipants;      // Maximum participants allowed
        // uint32 currentParticipants;  // Current number of participants
        CampaignStatus status;       // Current campaign status
        address[] publicAddresses;   // Public addresses who are the part of the DAO
        // string ipfsHash;             // IPFS hash for additional data
        // uint64 createdAt;            // Creation timestamp
        // uint64 updatedAt;            // Last update timestamp
    }
    
    /// @notice RSVP struct for tracking participant stakes
    struct RSVP {
        address participant;
        uint256 stakeAmount;
        uint64 rsvpTimestamp;
        bool stakeReturned;
        bool verified; //This is after the campaign and DAO voting
    }
    
    /// @notice Storage mappings
    mapping(string => Campaign) public campaigns;
    mapping(string => RSVP[]) public campaignRSVPs;
    mapping(string => mapping(address => bool)) public hasRSVPed;
    mapping(string => mapping(address => uint256)) public participantStakes;
    mapping(string => address[]) public verifierAddresses;
    mapping(string => mapping(address => bool)) public isVerifier;
    mapping(string => bool) public campaignExists;
    mapping(address => string[]) public userCampaigns;
    
    /// @notice Constants
    uint256 public constant MIN_STAKE_AMOUNT = 1e15; // 0.001 ETH
    uint256 public constant MIN_BOUNTY_AMOUNT = 1e17; // 0.1 ETH
    uint256 public constant MAX_PARTICIPANTS = 1000;
    
    /// @notice Events
    event CampaignCreated(
        string indexed campaignId, 
        address indexed creator, 
        string title, 
        uint256 stakingAmount,
        bool isFundraiser
    );
    event CampaignUpdated(string indexed campaignId, CampaignStatus status, uint64 timestamp);
    event BountyPaid(
        string indexed campaignId, 
        uint256 amount, 
        address indexed bountyPayer,
        address[] verifiers
    );
    event RSVPCreated(
        string indexed campaignId, 
        address indexed participant, 
        uint256 stakeAmount, 
        uint64 timestamp
    );
    event VerifiersSet(string indexed campaignId, address[] verifiers);
    event CampaignCompleted(
        string indexed campaignId, 
        address[] verifiedParticipants,
        uint256 bountyPerParticipant,
        uint256 totalStakesForfeited
    );
    event BountyDistributed(string indexed campaignId, address indexed participant, uint256 amount);
    event StakeReturned(string indexed campaignId, address indexed participant, uint256 amount);
    event StakeForfeited(string indexed campaignId, address indexed participant, uint256 amount);
    event EmergencyWithdraw(string indexed campaignId, uint256 amount, address indexed recipient);
    event totalStakeForfeited(string indexed campaignId, uint256 amount);
    /// @notice Constructor
    /// @param _initialOwner Address that will own the contract
    constructor(address _initialOwner) Ownable(_initialOwner) {}


    function createCampaign(
        string calldata _campaignId, //this will be generated by the app and used in the hash map mapping and the primary key of the database
        address _creator,
        bool _isFundraiser,
        address _bountyPayer, // in case if the person is the bounty payer
        uint256 _bountyamount,
        uint256 _stakingAmount
        //the paymaster is the deployable address hardcoded in the app
    ) external {
        if (bytes(_campaignId).length == 0) revert InvalidInput();
        if (campaignExists[_campaignId]) revert InvalidInput();
        // if (_stakingAmount < MIN_STAKE_AMOUNT) revert InsufficientStakeAmount();
        // if (_bountyPayer == address(0)) revert InvalidInput();
        if (_isFundraiser){
            _bountyPayer = address(0);
        } 
        else{
            _bountyPayer = _creator;
        }
        campaigns[_campaignId] = Campaign({
            creator: msg.sender,
            isFundraiser: _isFundraiser,
            bountyAmount: _bountyamount,
            bountyPayer: _bountyPayer,
            stakingAmount: _stakingAmount,
            // paymaster: _paymaster,
            status: CampaignStatus.CREATED,
            publicAddresses: new address[](0)
            // ipfsHash: "",
            // createdAt: uint64(block.timestamp),
            // updatedAt: uint64(block.timestamp)
        });
        
        // campaignExists[_campaignId] = true;
        userCampaigns[msg.sender].push(_campaignId);
        campaignExists[_campaignId] = true;
        
    }
    
    /// @notice Pay bounty to escrow and set verifier addresses
    /// @param _campaignId Campaign identifier
    /// @param _verifiers Array of verifier addresses who can complete the campaign
    function payBountyToEscrow(
        string calldata _campaignId,
        address[] calldata _verifiers
        // address _bountyPayer
    ) external payable {
        if (campaigns[_campaignId].isFundraiser == false) revert InvalidInput();
        Campaign storage campaign = campaigns[_campaignId];
        // // if (!campaignExists[_campaignId]) revert CampaignNotFound();
        if (campaign.status != CampaignStatus.CREATED) revert CampaignNotInCorrectStatus();
        if (msg.value < MIN_BOUNTY_AMOUNT) revert InsufficientBountyAmount();
        if (msg.value < campaign.bountyAmount) revert InsufficientBountyAmount();
        if (_verifiers.length == 0) revert InvalidInput();
        
        // Validate verifier addresses
        // for (uint256 i = 0; i < _verifiers.length;) {
        //     if (_verifiers[i] == address(0)) revert InvalidInput();
        //     unchecked { ++i; }
        // }
        
        // Update campaign with bounty info
        // Every campaign is mapped by the value in the escrow which is stored in the campaign.boundyAmount
        campaign.bountyAmount = msg.value;
        campaign.bountyPayer = msg.sender;
        campaign.status = CampaignStatus.BOUNTY_PAID;
        campaign.publicAddresses = _verifiers;
        // campaign.updatedAt = uint64(block.timestamp);
        
        // Set verifier addresses
        // delete verifierAddresses[_campaignId]; // Clear existing verifiers
        for (uint256 i = 0; i < _verifiers.length;) {
            isVerifier[_campaignId][_verifiers[i]] = true;
            unchecked { ++i; }
        }
        
        emit BountyPaid(_campaignId, msg.value, msg.sender, _verifiers);
        emit CampaignUpdated(_campaignId, CampaignStatus.BOUNTY_PAID, uint64(block.timestamp));
    }
    
    /// @notice RSVP for a campaign with stake (stake goes directly to paymaster)
    /// @param _campaignId Campaign identifier
    function rsvpToCampaign(string calldata _campaignId) external payable nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        // if (!campaignExists[_campaignId]) revert CampaignNotFound();
        if (campaign.status != CampaignStatus.BOUNTY_PAID) revert CampaignNotInCorrectStatus();
        // if (block.timestamp >= campaign.eventDate) revert CampaignDeadlinePassed();
        // if (campaign.currentParticipants >= campaign.maxParticipants) revert MaxParticipantsReached();
        if (hasRSVPed[_campaignId][msg.sender]) revert AlreadyRSVPed();
        if (msg.value != campaign.stakingAmount) revert InsufficientStakeAmount();
        // if (paymaster == address(0)) revert InvalidInput();
        
        // Mark as RSVPed
        hasRSVPed[_campaignId][msg.sender] = true;
        participantStakes[_campaignId][msg.sender] = msg.value;
        // campaign.currentParticipants++;
        // campaign.updatedAt = uint64(block.timestamp);
        
        // Add to RSVP list
        campaignRSVPs[_campaignId].push(RSVP({
            participant: msg.sender,
            stakeAmount: msg.value,
            rsvpTimestamp: uint64(block.timestamp),
            stakeReturned: false,
            verified: false //This will become true later after the DAO voting
        }));
        
        //The amount is there in the particpant stakes as msg.value properly and can be used later on
        emit RSVPCreated(_campaignId, msg.sender, msg.value, uint64(block.timestamp));
    }
    
    function dummyDAO(
        string calldata _campaignId
       // address[] calldata _publicaddresses // use in the actual function for th e same 
    )external{
        RSVP[] storage rsvps = campaignRSVPs[_campaignId];
        for (uint256 i = 0; i < rsvps.length;) {
            if (rsvps[i].verified == false && i % 2 == 0) {
                //Add logic for DAO 
                rsvps[i].verified = true;
            }
            unchecked { ++i; }
        }
    }
    



    function completeCampaign(
        string calldata _campaignId
    ) external nonReentrant {
        //Only the given creator of the given campaign can release the funds finally
        Campaign storage campaign = campaigns[_campaignId];
        if (campaign.creator != msg.sender) revert NotVerifier();
        // if (campaign.status != CampaignStatus.RSVP_CLOSED) revert CampaignNotInCorrectStatus();
        
        RSVP[] memory rsvps = campaignRSVPs[_campaignId];

        uint256 totalverifed = 0;
        for (uint256 i = 0; i < rsvps.length;) {
            if (rsvps[i].verified == true){
                totalverifed++;
            }
            unchecked { ++i; }
        }
        
        uint256 bountyPerParticipant = campaign.bountyAmount / totalverifed;
        uint256 totalStakesForfeited = 0;
        
        for (uint256 i = 0; i < rsvps.length;) {
            address participant = rsvps[i].participant;
            uint256 stakeAmount = rsvps[i].stakeAmount;
            
            if (rsvps[i].verified == true) {
                // VERIFIED PARTICIPANT
                // 1. Pay bounty from escrow (contract balance)
                (bool success, ) = participant.call{value : bountyPerParticipant}("");
                if(!success) revert TransferFailed();
                // 2. Request paymaster to return stake
                // Note: This requires paymaster to have a function to return stakes
                // For now, we just emit the event - paymaster should listen and return stakes

                
                emit BountyDistributed(_campaignId, participant, bountyPerParticipant);
                emit StakeReturned(_campaignId, participant, stakeAmount);
            } else {
                // UNVERIFIED PARTICIPANT - stake forfeited
                totalStakesForfeited += stakeAmount;
                emit StakeForfeited(_campaignId, participant, stakeAmount);
            }
            
            unchecked { ++i; }
        }

        campaign.status = CampaignStatus.COMPLETED;
        // campaign.updatedAt = uint64(block.timestamp);
        
        
        // emit CampaignCompleted(
        //     _campaignId, 
        //     rsvps, 
        //     bountyPerParticipant,
        //     totalStakesForfeited
        // );
        emit CampaignUpdated(_campaignId, CampaignStatus.COMPLETED, uint64(block.timestamp));
        emit totalStakeForfeited(_campaignId, totalStakesForfeited);
    }
    
    
    /// @notice Emergency withdraw function (only owner)
    /// @param _campaignId Campaign identifier
    function emergencyWithdraw(string calldata _campaignId) external onlyOwner nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        // if (!campaignExists[_campaignId]) revert CampaignNotFound();
        
        uint256 balance = campaign.bountyAmount;
        if (balance > 0) {
            campaign.bountyAmount = 0;
            
            (bool success, ) = payable(owner()).call{value: balance}("");
            if (!success) revert TransferFailed();
            
            emit EmergencyWithdraw(_campaignId, balance, owner());
        }
    }
    
    /// @notice Get campaign data
    function getCampaign(string calldata _campaignId) external view returns (Campaign memory) {
        // if (!campaignExists[_campaignId]) revert CampaignNotFound();
        return campaigns[_campaignId];
    }
    
    /// @notice Get campaign RSVPs
    function getCampaignRSVPs(string calldata _campaignId) external view returns (RSVP[] memory) {
        // if (!campaignExists[_campaignId]) revert CampaignNotFound();
        return campaignRSVPs[_campaignId];
    }
    
    /// @notice Get verifier addresses for a campaign
    function getVerifiers(string calldata _campaignId) external view returns (address[] memory) {
        // if (!campaignExists[_campaignId]) revert CampaignNotFound();
        return verifierAddresses[_campaignId];
    }
    
    /// @notice Get user's campaigns
    function getUserCampaigns(address _user) external view returns (string[] memory) {
        return userCampaigns[_user];
    }
    
    /// @notice Check if user has RSVPed to campaign
    function hasUserRSVPed(string calldata _campaignId, address _user) external view returns (bool) {
        return hasRSVPed[_campaignId][_user];
    }
    
    /// @notice Get participant stake amount
    function getParticipantStake(string calldata _campaignId, address _participant) external view returns (uint256) {
        return participantStakes[_campaignId][_participant];
    }
    
    /// @notice Check if address is verifier for campaign
    function isVerifierForCampaign(string calldata _campaignId, address _verifier) external view returns (bool) {
        return isVerifier[_campaignId][_verifier];
    }
    
    /// @notice Get campaign statistics
    function getCampaignStats(string calldata _campaignId) external view returns (
        uint256 totalParticipants,
        uint256 totalStaked,
        uint256 bountyAmount,
        CampaignStatus status
    ) {
        // if (!campaignExists[_campaignId]) revert CampaignNotFound();
        
        Campaign memory campaign = campaigns[_campaignId];
        RSVP[] memory rsvps = campaignRSVPs[_campaignId];
        
        totalParticipants = rsvps.length;
        bountyAmount = campaign.bountyAmount;
        status = campaign.status;
        
        for (uint256 i = 0; i < rsvps.length;) {
            totalStaked += rsvps[i].stakeAmount;
            unchecked { ++i; }
        }
    }
    
    /// @notice Check if campaign exists
    function doesCampaignExist(string calldata _campaignId) external view returns (bool) {
        return campaignExists[_campaignId];
    }
    
    /// @notice Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /// @notice Receive function to accept ETH
    receive() external payable {}
    
    /// @notice Fallback function
    fallback() external payable {}
}
