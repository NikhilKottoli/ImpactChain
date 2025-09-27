require('dotenv').config();
const { ethers } = require('ethers');

async function sign() {
    const privateKey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey);

    // PASTE THE MESSAGE FROM STEP 2 HERE:
    const message = "Please sign this message to prove you are owner of this account: 437cb48896134887852c896baad6de92"; 
    
    const signature = await wallet.signMessage(message);
    console.log('Your Signature is:', signature);
}

sign();