// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract SimpleDAOVoting {
    
    enum VoteOption { YES, NO }
    
    struct Vote {
        address verifier;      // Who voted
        VoteOption vote;       // YES or NO
        uint64 timestamp;      // When they voted
        string reason;         // Optional reason
    }
    
    /// @notice User struct containing all voting data
    struct User {
        address walletAddress;     // User's wallet address
        Vote[] votes;              // Array of all votes for this user
        bool hasAttestation;       // Whether attestation is generated
        bool attestationResult;    // Final result (true = approved, false = rejected)
        string ipfsMetadataHash;   // IPFS hash for metadata
        bytes32 attestationHash;   // Final attestation hash for proof
        uint64 createdAt;          // When user was added
        uint64 attestedAt;         // When attestation was generated
        uint256 yesVotes;          // Count of YES votes
        uint256 noVotes;           // Count of NO votes
    }
    
    /// @notice Main storage mappings
    mapping(string => mapping(address => User)) public daoUsers;  // uuid => userAddress => User
    mapping(string => address[]) public daoUserList;             // uuid => array of user addresses
    mapping(string => mapping(address => bool)) public isUserInDao; // uuid => userAddress => bool
    
    // Verifier mappings (people who can vote)
    mapping(string => address[]) public daoVerifiers;            // uuid => array of verifier addresses
    mapping(string => mapping(address => bool)) public isVerifier; // uuid => verifierAddress => bool
    mapping(string => mapping(address => mapping(address => bool))) public hasVoted; // uuid => verifier => user => bool
    
    /// @notice Events
    event UserAdded(string indexed uuid, address indexed user);
    event VoteCast(string indexed uuid, address indexed verifier, address indexed user, VoteOption vote);
    event AttestationGenerated(string indexed uuid, address indexed user, bool result, bytes32 attestationHash);
    event MetadataUpdated(string indexed uuid, address indexed user, string ipfsHash);
    event DAOCreated(string indexed uuid, address[] verifiers);
    event VerifierAdded(string indexed uuid, address indexed verifier);
    
    /// @notice Create a new DAO with initial verifiers
    /// @param _uuid Unique identifier for the DAO
    /// @param _verifiers Array of verifier addresses (people who can vote)
    function createDAO(string calldata _uuid, address[] calldata _verifiers) external {
        require(bytes(_uuid).length > 0, "Invalid UUID");
        require(_verifiers.length > 0, "Need at least one verifier");
        require(daoVerifiers[_uuid].length == 0, "DAO already exists");
        
        // Add verifiers
        for (uint256 i = 0; i < _verifiers.length; i++) {
            require(_verifiers[i] != address(0), "Invalid verifier address");
            daoVerifiers[_uuid].push(_verifiers[i]);
            isVerifier[_uuid][_verifiers[i]] = true;
        }
        
        emit DAOCreated(_uuid, _verifiers);
    }
    
    /// @notice Add a new verifier to the DAO
    /// @param _uuid DAO identifier
    /// @param _verifier Verifier address to add
    function addVerifier(string calldata _uuid, address _verifier) external {
        require(_verifier != address(0), "Invalid verifier address");
        require(daoVerifiers[_uuid].length > 0, "DAO does not exist");
        require(!isVerifier[_uuid][_verifier], "Already a verifier");
        
        daoVerifiers[_uuid].push(_verifier);
        isVerifier[_uuid][_verifier] = true;
        
        emit VerifierAdded(_uuid, _verifier);
    }
    
    /// @notice Add a user to a DAO for voting (user needs attestation)
    /// @param _uuid DAO identifier
    /// @param _userAddress User's wallet address
    function addUser(string calldata _uuid, address _userAddress) external {
        require(_userAddress != address(0), "Invalid user address");
        require(daoVerifiers[_uuid].length > 0, "DAO does not exist");
        require(!isUserInDao[_uuid][_userAddress], "User already exists in DAO");
        
        // Initialize user struct
        User storage user = daoUsers[_uuid][_userAddress];
        user.walletAddress = _userAddress;
        user.hasAttestation = false;
        user.attestationResult = false;
        user.createdAt = uint64(block.timestamp);
        user.yesVotes = 0;
        user.noVotes = 0;
        
        // Add to tracking arrays
        daoUserList[_uuid].push(_userAddress);
        isUserInDao[_uuid][_userAddress] = true;
        
        emit UserAdded(_uuid, _userAddress);
    }
    
    /// @notice Add multiple users to a DAO
    /// @param _uuid DAO identifier
    /// @param _userAddresses Array of user wallet addresses
    function addUsersBatch(string calldata _uuid, address[] calldata _userAddresses) external {
        require(daoVerifiers[_uuid].length > 0, "DAO does not exist");
        
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            address userAddr = _userAddresses[i];
            if (userAddr != address(0) && !isUserInDao[_uuid][userAddr]) {
                // Initialize user struct
                User storage user = daoUsers[_uuid][userAddr];
                user.walletAddress = userAddr;
                user.hasAttestation = false;
                user.attestationResult = false;
                user.createdAt = uint64(block.timestamp);
                user.yesVotes = 0;
                user.noVotes = 0;
                
                // Add to tracking arrays
                daoUserList[_uuid].push(userAddr);
                isUserInDao[_uuid][userAddr] = true;
                
                emit UserAdded(_uuid, userAddr);
            }
        }
    }
    
    /// @notice Cast a vote for a user (only verifiers can vote)
    /// @param _uuid DAO identifier
    /// @param _userAddress User being voted on
    /// @param _vote YES or NO vote
    /// @param _reason Optional reason for the vote
    function castVote(
        string calldata _uuid,
        address _userAddress, // this represents the user address of the user being voted
        VoteOption _vote,
        string calldata _reason
    ) external {
        require(isVerifier[_uuid][msg.sender], "Not a verifier for this DAO");
        require(isUserInDao[_uuid][_userAddress], "User not in DAO");
        require(!hasVoted[_uuid][msg.sender][_userAddress], "Already voted for this user");
        require(!daoUsers[_uuid][_userAddress].hasAttestation, "User already has attestation");
        
        // Mark as voted
        hasVoted[_uuid][msg.sender][_userAddress] = true;
        
        // Add vote to user's votes array
        User storage user = daoUsers[_uuid][_userAddress];
        user.votes.push(Vote({
            verifier: msg.sender,
            vote: _vote,
            timestamp: uint64(block.timestamp),
            reason: _reason
        }));
        
        // Update vote counts
        if (_vote == VoteOption.YES) {
            user.yesVotes++;
        } else {
            user.noVotes++;
        }

        emit VoteCast(_uuid, msg.sender, _userAddress, _vote);
        
        // Check if all verifiers have voted
        uint256 totalVotes = user.votes.length;
        uint256 totalVerifiers = daoVerifiers[_uuid].length;
        
        if (totalVotes == totalVerifiers) {
            _generateAttestation(_uuid, _userAddress);
        }
    }
    

    /// @notice Generate attestation for a user after all votes are cast
    /// @param _uuid DAO identifier
    /// @param _userAddress User address
    function _generateAttestation(string memory _uuid, address _userAddress) internal {
        User storage user = daoUsers[_uuid][_userAddress];
        
        // Determine result for the attestation to be generated or not
        uint256 totalVerifiers = daoVerifiers[_uuid].length;
        bool result = user.yesVotes > (totalVerifiers / 2);
        
        // Generate attestation hash
        bytes32 attestationHash = keccak256(abi.encodePacked(
            _uuid,
            _userAddress,
            user.yesVotes,
            user.noVotes,
            totalVerifiers,
            block.timestamp,
            address(this)
        ));
        
        // Update user struct
        user.hasAttestation = true;
        user.attestationResult = result;
        user.attestationHash = attestationHash;
        user.attestedAt = uint64(block.timestamp);
        
        emit AttestationGenerated(_uuid, _userAddress, result, attestationHash);
    }
    
    /// @notice Get user data including all votes
    /// @param _uuid DAO identifier
    /// @param _userAddress User address
    /// @return user Complete user struct with all data
    function getUser(string calldata _uuid, address _userAddress) external view returns (User memory user) {
        require(isUserInDao[_uuid][_userAddress], "User not in DAO");
        return daoUsers[_uuid][_userAddress];
    }
    
    /// @notice Get all votes for a user
    /// @param _uuid DAO identifier
    /// @param _userAddress User address
    /// @return votes Array of all votes cast for the user
    function getUserVotes(string calldata _uuid, address _userAddress) external view returns (Vote[] memory votes) {
        require(isUserInDao[_uuid][_userAddress], "User not in DAO");
        return daoUsers[_uuid][_userAddress].votes;
    }
    
    /// @notice Get voting summary for a user
    /// @param _uuid DAO identifier
    /// @param _userAddress User address
    /// @return yesVotes Number of YES votes
    /// @return noVotes Number of NO votes
    /// @return totalVotes Total votes cast
    /// @return hasAttestation Whether attestation is generated
    /// @return attestationResult Final result if attested
    function getVotingSummary(string calldata _uuid, address _userAddress) external view returns (
        uint256 yesVotes,
        uint256 noVotes,
        uint256 totalVotes,
        bool hasAttestation,
        bool attestationResult
    ) {
        require(isUserInDao[_uuid][_userAddress], "User not in DAO");
        
        User memory user = daoUsers[_uuid][_userAddress];
        return (
            user.yesVotes,
            user.noVotes,
            user.votes.length,
            user.hasAttestation,
            user.attestationResult
        );
    }
    
    /// @notice Get all users in a DAO (users being voted on)
    /// @param _uuid DAO identifier
    /// @return users Array of user addresses
    function getDAOUsers(string calldata _uuid) external view returns (address[] memory users) {
        return daoUserList[_uuid];
    }
    
    /// @notice Get all verifiers for a DAO (people who can vote)
    /// @param _uuid DAO identifier
    /// @return verifiers Array of verifier addresses
    function getDAOVerifiers(string calldata _uuid) external view returns (address[] memory verifiers) {
        return daoVerifiers[_uuid];
    }
    
    /// @notice Check if address is a verifier
    /// @param _uuid DAO identifier
    /// @param _address Address to check
    /// @return isVerifierAddress Whether the address is a verifier
    function checkVerifier(string calldata _uuid, address _address) external view returns (bool isVerifierAddress) {
        return isVerifier[_uuid][_address];
    }
    
    /// @notice Check if address is a user in the DAO
    /// @param _uuid DAO identifier
    /// @param _address Address to check
    /// @return isUser Whether the address is a user in the DAO
    function checkUser(string calldata _uuid, address _address) external view returns (bool isUser) {
        return isUserInDao[_uuid][_address];
    }
    
    /// @notice Check if user has valid attestation
    /// @param _uuid DAO identifier
    /// @param _userAddress User address
    /// @return hasValidAttestation Whether user has approved attestation
    /// @return attestationHash The attestation hash for verification
    function checkAttestation(string calldata _uuid, address _userAddress) external view returns (
        bool hasValidAttestation,
        bytes32 attestationHash
    ) {
        if (!isUserInDao[_uuid][_userAddress]) {
            return (false, bytes32(0));
        }
        
        User memory user = daoUsers[_uuid][_userAddress];
        hasValidAttestation = user.hasAttestation && user.attestationResult;
        attestationHash = user.attestationHash;
    }
    
    /// @notice Verify attestation hash for a user
    /// @param _uuid DAO identifier
    /// @param _userAddress User address
    /// @param _attestationHash Hash to verify
    /// @return isValid Whether the hash matches
    function verifyAttestationHash(
        string calldata _uuid,
        address _userAddress,
        bytes32 _attestationHash
    ) external view returns (bool isValid) {
        if (!isUserInDao[_uuid][_userAddress]) {
            return false;
        }
        
        User memory user = daoUsers[_uuid][_userAddress];
        return user.hasAttestation && user.attestationHash == _attestationHash;
    }
    
    /// @notice Get DAO statistics
    /// @param _uuid DAO identifier
    /// @return totalUsers Total users in DAO (being voted on)
    /// @return totalVerifiers Total verifiers in DAO
    /// @return usersWithAttestations Users who have attestations
    /// @return approvedUsers Users with approved attestations
    function getDAOStats(string calldata _uuid) external view returns (
        uint256 totalUsers,
        uint256 totalVerifiers,
        uint256 usersWithAttestations,
        uint256 approvedUsers
    ) {
        address[] memory users = daoUserList[_uuid];
        totalUsers = users.length;
        totalVerifiers = daoVerifiers[_uuid].length;
        
        for (uint256 i = 0; i < users.length; i++) {
            User memory user = daoUsers[_uuid][users[i]];
            if (user.hasAttestation) {
                usersWithAttestations++;
                if (user.attestationResult) {
                    approvedUsers++;
                }
            }
        }
    }
    
}