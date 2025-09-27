// config/supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use process.env for Node.js backend environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// The client is only created if credentials exist
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!supabase) {
  console.warn("Supabase client not fully initialized. Check SUPABASE_URL and SUPABASE_ANON_KEY environment variables.");
}

module.exports = {
  supabase
};