require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000/api/v1';
const LABEL_TO_SEARCH = 'cat'; // The label you used when uploading photos
// --- End Configuration ---

// ABIs needed for on-chain interaction
const dataCoinAbi = [
    "function approve(address spender, uint256 amount) public returns (bool)"
];
const datasetRegistryAbi = [
    "function createDataset(uint256[] calldata _photoIDs, bytes calldata _apiSignature, bytes32 _zkProofHash) external",
    "event DatasetCreated(uint256 indexed datasetId, address indexed buyer, uint256 photoCount, uint256 totalCost)"
];

async function runPurchaseTest() {
    // 1. Setup Buyer's Wallet
    const buyerPrivateKey = process.env.PRIVATE_KEY; // Using the validator as the buyer for simplicity
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const buyerWallet = new ethers.Wallet(buyerPrivateKey, provider);
    console.log(`Running test as buyer: ${buyerWallet.address}`);

    // 2. Query for Photos
    console.log(`\n--- Step 1: Querying for photos with label "${LABEL_TO_SEARCH}" ---`);
    let photos;
    try {
        const response = await axios.get(`${API_BASE_URL}/photos/query`, { params: { label: LABEL_TO_SEARCH } });
        photos = response.data;
        if (!photos || photos.length === 0) {
            console.error(`❌ No photos found for label "${LABEL_TO_SEARCH}". Please upload some first.`);
            return;
        }
        console.log(`Found ${photos.length} photos. Using their DB IDs:`, photos.map(p => p.id));
    } catch (error) {
        console.error('Error querying photos:', error.response ? error.response.data : error.message);
        return;
    }

    // 3. Get Signed Transaction Data from API
    console.log('\n--- Step 2: Getting signed transaction data from API ---');
    let transactionData;
    try {
        const dbPhotoIds = photos.map(p => p.id);
        const response = await axios.post(`${API_BASE_URL}/datasets/sign-transaction`, { dbPhotoIds });
        transactionData = response.data;
        console.log('Received data from API:');
        console.log(`  - On-chain Token IDs: [${transactionData.tokenIds.join(', ')}]`);
        console.log(`  - Total Cost: ${ethers.formatUnits(transactionData.totalCost, 18)} STC`);
        console.log(`  - API Signature: ${transactionData.apiSignature.substring(0, 25)}...`);
    } catch (error) {
        console.error('Error getting signed transaction:', error.response ? error.response.data : error.message);
        return;
    }

    // 4. Execute On-Chain Purchase
    console.log('\n--- Step 3: Executing on-chain purchase ---');
    const { tokenIds, totalCost, apiSignature } = transactionData;
    
    const dataCoinContract = new ethers.Contract(process.env.DATA_COIN_ADDRESS, dataCoinAbi, buyerWallet);
    const datasetRegistryContract = new ethers.Contract(process.env.DATASET_REGISTRY_ADDRESS, datasetRegistryAbi, buyerWallet);

    try {
        // A. Approve the DatasetRegistry contract to spend our DataCoin
        console.log(`Approving ${ethers.formatUnits(totalCost, 18)} STC for spending...`);
        const approveTx = await dataCoinContract.approve(process.env.DATASET_REGISTRY_ADDRESS, totalCost);
        await approveTx.wait();
        console.log('Approval successful.');

        // B. Call createDataset
        console.log('Calling createDataset on the smart contract...');
        const zkProofHash = ethers.ZeroHash; // Using a placeholder zero hash
        const purchaseTx = await datasetRegistryContract.createDataset(tokenIds, apiSignature, zkProofHash);
        
        console.log(`Purchase transaction sent! Hash: ${purchaseTx.hash}`);
        console.log('Waiting for confirmation...');
        const receipt = await purchaseTx.wait();

        // C. Find the event to get the new Dataset ID
        const event = receipt.logs.map(log => {
            try { return datasetRegistryContract.interface.parseLog(log); } catch (e) { return null; }
        }).find(e => e && e.name === 'DatasetCreated');

        console.log('\n✅ Purchase Successful!');
        if (event) {
            console.log(`New Dataset NFT created with ID: ${event.args.datasetId}`);
        } else {
            console.log("Could not find DatasetCreated event, but transaction was successful.");
        }

    } catch (error) {
        console.error('\n❌ On-chain purchase failed!');
        console.error(error.reason || error.message);
    }
}

runPurchaseTest();