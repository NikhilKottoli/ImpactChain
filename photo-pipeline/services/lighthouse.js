const lighthouse = require('@lighthouse-web3/sdk');
const kavach = require("@lighthouse-web3/kavach");
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

/**
 * Generates a JWT for Lighthouse authentication.
 * @param {string} publicKey - The user's public key (wallet address).
 * @param {string} signedMessage - The signature from the user's wallet.
 * @returns {Promise<string>} The generated JWT.
 */
async function getJwt(publicKey, signedMessage) {
    const { JWT, error } = await kavach.getJWT(publicKey, signedMessage);
    if (error) {
        throw new Error("Failed to generate Lighthouse JWT.");
    }
    return JWT;
}

/**
 * Uploads an encrypted file to Lighthouse.
 * @param {Buffer} fileBuffer - The file content as a buffer.
 * @param {string} apiKey - The Lighthouse API key.
 * @param {string} publicKey - User's public key for encryption.
 * @param {string} jwt - The JWT for authentication.
 * @returns {Promise<{cid: string, size: number}>} The IPFS CID and size of the uploaded file.
 */
async function uploadEncrypted(fileBuffer, apiKey, publicKey, jwt) {
    // The SDK requires a file path, so we write the buffer to a temporary file.
    const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}`);
    await fs.writeFile(tempFilePath, fileBuffer);

    try {
        const response = await lighthouse.uploadEncrypted(
            tempFilePath,
            apiKey,
            publicKey,
            jwt // Use the JWT as the signed message
        );

        // The SDK returns data in the format { data: { Name, Hash, Size } }
        const { Hash, Size } = response.data[0];

        return {
            cid: Hash,
            size: parseInt(Size, 10)
        };
    } finally {
        // Clean up the temporary file
        await fs.unlink(tempFilePath);
    }
}

module.exports = {
    getJwt,
    uploadEncrypted
};