// =====================================
// LEXIQUE
// Supabase Configuration
// =====================================

const SUPABASE_URL = "https://uccznppecrkdbgykrucx.supabase.co/";

const SUPABASE_ANON_KEY = "sb_publishable_TWW6H1Xuq8gXp1xgDRKSbA_Gq2aNXwA";


window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);



console.log(
    "Supabase client:",
    window.supabaseClient
);
