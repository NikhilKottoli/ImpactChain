// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DataCoin
 * @dev An ERC20 token used for payments within the DataDAO ecosystem.
 * This is a simple implementation with a minting function restricted to the contract owner.
 */
contract DataCoin is ERC20, Ownable {
    constructor(address initialOwner) ERC20("ShaunTestCoin", "STC") Ownable(initialOwner) {}

    /**
     * @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply. Only callable by the owner.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title DAOTreasury
 * @dev A simple contract to collect the DAO's share of revenue from dataset sales.
 * Funds can only be withdrawn by the contract owner (e.g., a governance contract).
 */
contract DAOTreasury is Ownable {
    DataCoin public immutable dataCoin;

    constructor(address initialOwner, address dataCoinAddress) Ownable(initialOwner) {
        require(dataCoinAddress != address(0), "Invalid DataCoin address");
        dataCoin = DataCoin(dataCoinAddress);
    }

    /**
     * @dev Allows the treasury to receive DataCoin.
     */
    function deposit(uint256 amount) external {
        // This function is not strictly necessary if using direct transfers,
        // but it makes the treasury's role explicit.
        require(dataCoin.transferFrom(msg.sender, address(this), amount), "Deposit failed");
    }

    /**
     * @dev Allows the owner to withdraw the entire balance of DataCoin from the treasury.
     */
    function withdraw() external onlyOwner {
        uint256 balance = dataCoin.balanceOf(address(this));
        require(balance > 0, "No funds to withdraw");
        require(dataCoin.transfer(owner(), balance), "Withdrawal failed");
    }
}


/**
 * @title DatasetRegistry
 * @dev The core contract of the DataDAO. It handles the creation of datasets,
 * off-chain validation via signature, payment splitting, and minting of
 * DatasetAccess NFTs to buyers. This corresponds to Steps 3, 7, and 8 in the flow.
 */
contract DatasetRegistry is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _datasetIdCounter;

    // --- State Variables ---

    // External contract addresses
    ERC721 public immutable SocialMediaPosts;
    DataCoin public immutable dataCoin;
    DAOTreasury public immutable daoTreasury;

    // Configuration
    address public validatorAddress; // The address of the trusted off-chain API signer.
    uint256 public daoFeePercentage; // e.g., 10 for 10%
    uint256 public pricePerPhoto; // Price in DataCoin for each photo in a dataset.

    // Data Storage
    // Mapping from a DatasetAccess NFT ID to the array of PhotoNFT IDs it contains.
    mapping(uint256 => uint256[]) public datasetPhotos;

    // NEW: Mapping from a contributor's address to their claimable balance.
    mapping(address => uint256) public claimableBalances;


    // --- Events ---
    event DatasetCreated(uint256 indexed datasetId, address indexed buyer, uint256 photoCount, uint256 totalCost);
    // NEW: Event for when a contributor claims their royalties.
    event RoyaltiesClaimed(address indexed contributor, uint256 amount);


    // --- Constructor ---
    constructor(
        address initialOwner,
        address _socialMediaPostsAddress,
        address _dataCoinAddress,
        address _daoTreasuryAddress,
        address _validatorAddress,
        uint256 _daoFeePercentage,
        uint256 _pricePerPhoto
    ) ERC721("DataDAO Dataset Access NFT", "DSET") Ownable(initialOwner) {
        socialMediaPosts = ERC721(_socialMediaNFTAddress);
        dataCoin = DataCoin(_dataCoinAddress);
        daoTreasury = DAOTreasury(_daoTreasuryAddress);
        validatorAddress = _validatorAddress;
        daoFeePercentage = _daoFeePercentage;
        pricePerPhoto = _pricePerPhoto;
    }


    // --- Core Logic: Dataset Creation ---

    /**
     * @dev Creates a new dataset, verifies it, splits payment, and mints an access NFT.
     * The buyer must first approve this contract to spend the required amount of DataCoin.
     * @param _photoIDs An array of PhotoNFT token IDs that make up the dataset.
     * @param _apiSignature A signature from the off-chain validator, proving the dataset's validity.
     */
    function createDataset(
        uint256[] calldata _photoIDs,
        bytes calldata _apiSignature
    ) external {
        uint256 photoCount = _photoIDs.length;
        require(photoCount > 0, "Dataset cannot be empty");

        // 1. Verify the off-chain API signature (Step 3 Action)
        _verifySignature(_photoIDs, _apiSignature);

        // 2. Handle Payment
        uint256 totalCost = photoCount * pricePerPhoto;
        require(dataCoin.balanceOf(msg.sender) >= totalCost, "Insufficient DataCoin balance");
        require(dataCoin.allowance(msg.sender, address(this)) >= totalCost, "DatasetRegistry not approved to spend DataCoin");

        // Pull payment from the buyer
        dataCoin.transferFrom(msg.sender, address(this), totalCost);

        // 3. Split Payment (Step 3 Action, Step 7 Logic)
        _updateContributorBalances(totalCost, _photoIDs);

        // 4. Mint DatasetAccess NFT to the buyer (Step 3 Action)
        uint256 datasetId = _datasetIdCounter.current();
        _safeMint(msg.sender, datasetId);
        
        // 5. Store dataset information on-chain
        datasetPhotos[datasetId] = _photoIDs;

        _datasetIdCounter.increment();
        emit DatasetCreated(datasetId, msg.sender, photoCount, totalCost);
    }

    // --- Internal Helper Functions ---

    /**
     * @dev Verifies that the provided signature was created by the trusted validator
     * for the given set of photo IDs.
     */
    function _verifySignature(uint256[] calldata _photoIDs, bytes calldata _signature) internal view {
        bytes32 messageHash = keccak256(abi.encodePacked(_photoIDs));
        // Use toEthSignedMessageHash to reconstruct the hash as signed by web3.js/ethers.js
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);

        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, _signature);
        
        require(recoveredSigner == validatorAddress, "Invalid API signature");
        require(recoveredSigner != address(0), "Invalid signature recovery");
    }

    /**
     * @dev Calculates royalty shares and updates the internal balances for contributors.
     * This is a gas-efficient approach that avoids direct transfers in a loop.
     * Contributors can withdraw their funds later using the `claimRoyalties` function.
     */
    function _updateContributorBalances(uint256 _totalCost, uint256[] calldata _photoIDs) internal {
        // Calculate DAO treasury cut
        uint256 daoAmount = (_totalCost * daoFeePercentage) / 100;

        // Calculate total amount for contributors and per-photo share
        uint256 contributorTotalAmount = _totalCost - daoAmount;
        if (contributorTotalAmount > 0) {
            uint256 sharePerPhoto = contributorTotalAmount / _photoIDs.length;
            
            // Update the claimable balance for each SocialMediaPost owner
            for (uint i = 0; i < _photoIDs.length; i++) {
                address owner = SocialMediaPosts.ownerOf(_photoIDs[i]);
                if (sharePerPhoto > 0) {
                    claimableBalances[owner] += sharePerPhoto;
                }
            }

            // Calculate the total amount assigned to contributors
            uint256 distributedAmount = sharePerPhoto * _photoIDs.length;
            // Any remaining dust from rounding is added to the DAO's share
            uint256 dust = contributorTotalAmount - distributedAmount;
            daoAmount += dust;
        }

        // Transfer the final DAO share to the treasury
        if (daoAmount > 0) {
            dataCoin.transfer(address(daoTreasury), daoAmount);
        }
    }


    // --- Public Getter Functions ---

    /**
     * @dev Returns the list of PhotoNFT IDs associated with a given DatasetAccess NFT.
     */
    function getDatasetPhotos(uint256 _datasetId) external view returns (uint256[] memory) {
        return datasetPhotos[_datasetId];
    }

    // --- NEW: Royalty Claim Function ---

    /**
     * @dev Allows a contributor to withdraw their accumulated royalties.
     */
    function claimRoyalties() external {
        uint256 amount = claimableBalances[msg.sender];
        require(amount > 0, "No royalties to claim");

        // Reset the balance to zero before transferring to prevent re-entrancy attacks.
        claimableBalances[msg.sender] = 0;

        // Transfer the funds to the contributor.
        require(dataCoin.transfer(msg.sender, amount), "Royalty transfer failed");

        emit RoyaltiesClaimed(msg.sender, amount);
    }


    // --- Admin Functions ---

    /**
     * @dev Updates the address of the trusted off-chain API validator.
     */
    function setValidatorAddress(address _newValidator) external onlyOwner {
        validatorAddress = _newValidator;
    }

    /**
     * @dev Updates the DAO's fee percentage.
     */
    function setDaoFeePercentage(uint256 _newFee) external onlyOwner {
        require(_newFee <= 100, "Fee cannot exceed 100%");
        daoFeePercentage = _newFee;
    }

    /**
     * @dev Updates the price per photo for datasets.
     */
    function setPricePerPhoto(uint256 _newPrice) external onlyOwner {
        pricePerPhoto = _newPrice;
    }
}
