const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.SUPABASE_URL,
});

// This function runs on server start to ensure the 'photos' table exists.
(async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS photos (
            id SERIAL PRIMARY KEY,
            token_id INTEGER NOT NULL UNIQUE,
            cid VARCHAR(255) NOT NULL,
            labels TEXT,
            owner_address VARCHAR(42) NOT NULL,
            size_bytes BIGINT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("[DB] Table 'photos' is ready.");
    } catch (err) {
        console.error("[DB] Error creating or verifying 'photos' table:", err);
    }
})();

/**
 * Saves photo metadata to the database.
 * @param {object} photoData - The data to save.
 * @returns {Promise<object>} The newly created database record.
 */
async function savePhoto(photoData) {
    const { tokenId, cid, labels, ownerAddress, size } = photoData;
    const query = `
        INSERT INTO photos (token_id, cid, labels, owner_address, size_bytes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `;
    const values = [tokenId, cid, labels, ownerAddress, size];
    const res = await pool.query(query, values);
    console.log(`[DB] Saved photo with CID ${cid}. DB ID: ${res.rows[0].id}`);
    return res.rows[0];
}

/**
 * Finds photos in the database by a given label.
 * @param {string} label - The label to search for.
 * @returns {Promise<Array<object>>} An array of matching photo records.
 */
async function findPhotosByLabel(label) {
    const query = `
        SELECT id, token_id, cid, labels, owner_address, size_bytes FROM photos
        WHERE labels ILIKE $1;
    `;
    const values = [`%${label}%`];
    const res = await pool.query(query, values);
    console.log(`[DB] Found ${res.rowCount} photos for label: ${label}`);
    return res.rows;
}

/**
 * Retrieves on-chain token IDs from an array of database IDs.
 * @param {Array<number>} dbIds - The database primary keys.
 * @returns {Promise<Array<number>>} An array of corresponding on-chain token IDs.
 */
async function getTokenIdsFromDbIds(dbIds) {
    const query = `
        SELECT token_id FROM photos
        WHERE id = ANY($1::int[]);
    `;
    const values = [dbIds];
    const res = await pool.query(query, values);
    return res.rows.map(r => r.token_id);
}

module.exports = {
    savePhoto,
    findPhotosByLabel,
    getTokenIdsFromDbIds
};