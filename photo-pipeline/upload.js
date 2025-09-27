require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000/api/v1';
const IMAGE_PATH = path.join(__dirname, 'test.jpg'); // Assumes test.jpg is in the root photo-pipeline folder
const LABELS = 'cat,animal,pet';
// --- End Configuration ---

async function runUploadTest() {
    // 1. Setup Wallet
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('PRIVATE_KEY not found in .env file.');
        return;
    }
    const wallet = new ethers.Wallet(privateKey);
    const contributorAddress = wallet.address;
    console.log(`Using contributor address: ${contributorAddress}`);

    // 2. Get Auth Message from API
    let authMessage;
    try {
        console.log('Fetching auth message from API...');
        const response = await axios.get(`${API_BASE_URL}/auth/message`, {
            params: { address: contributorAddress }
        });
        authMessage = response.data.message;
        console.log(`Received message to sign: "${authMessage}"`);
    } catch (error) {
        console.error('Error fetching auth message:', error.response ? error.response.data : error.message);
        return;
    }

    // 3. Sign the Message
    console.log('Signing the message...');
    const signature = await wallet.signMessage(authMessage);
    console.log(`Generated Signature: ${signature.substring(0, 20)}...`);

    // 4. Prepare and Send the Upload Request
    const form = new FormData();
    form.append('photo', fs.createReadStream(IMAGE_PATH));
    form.append('labels', LABELS);
    form.append('contributorAddress', contributorAddress);
    form.append('authSignature', signature);

    console.log('Uploading photo...');
    try {
        const response = await axios.post(`${API_BASE_URL}/photos/upload`, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        console.log('\n✅ Upload Successful!');
        console.log('API Response:', response.data);
    } catch (error) {
        console.error('\n❌ Upload Failed!');
        console.error('Error during upload:', error.response ? error.response.data : error.message);
    }
}

runUploadTest();