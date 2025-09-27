const { supabase } = require('../config/supabaseClient');


class CampaignService {
    /**
     * Utility to check if supabase is configured
     */
    _checkSupabase() {
        if (!supabase) {
            throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
        }
    }

    // ===== CAMPAIGNS =====

    /**
     * Fetch all active campaigns from Supabase
     */
    async getAllCampaigns() {
        this._checkSupabase();
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('is_active', true) 
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to fetch campaigns: ${error.message}`);
        }

        return data;
    }

    /**
     * Create a new campaign in Supabase
     * Now accepts and maps all database fields sent from the frontend/controller.
     */
    async createCampaign(campaignData) {
        this._checkSupabase();
        
        const insertData = {
            // New fields from the database schema:
            id: campaignData.id,
            creator_id: campaignData.creator_id,
            title: campaignData.title,
            description: campaignData.description,
            bounty_paid: campaignData.bounty_paid,
            bounty_paid_by: campaignData.bounty_paid_by,
            location_name: campaignData.location_name,
            category: campaignData.category,
            event_date: campaignData.event_date,
            deadline_crossed: campaignData.deadline_crossed,
            max_participants: campaignData.max_participants,
            no_of_participants: campaignData.no_of_participants,
            bounty_amount: campaignData.bounty_amount,
            paymaster_id: campaignData.paymaster_id,
            campaign_status: campaignData.campaign_status,
            ipfs_hash: campaignData.ipfs_hash,
            created_at: campaignData.created_at,
            updated_at: campaignData.updated_at,
        };

        const { data, error } = await supabase
            .from('campaigns')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create campaign: ${error.message}`);
        }

        return data;
    }
}

module.exports = new CampaignService();