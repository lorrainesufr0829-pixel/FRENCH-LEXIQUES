// =====================================
// LEXIQUE
// Supabase Configuration
// =====================================

// Replace with your own Project URL
const SUPABASE_URL = "https://uccznppecrkdbgykrucx.supabase.co/";

// Replace with your own Publishable (anon) Key
const SUPABASE_ANON_KEY = "sb_publishable_TWW6H1Xuq8gXp1xgDRKSbA_Gq2aNXwA";

// Create Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);