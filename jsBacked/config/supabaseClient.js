const { createClient } = require('@supabase/supabase-js');

// Use environment variables for security
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
