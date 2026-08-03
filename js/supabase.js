// =====================================
// Supabase Client
// =====================================


const SUPABASE_URL = 
"https://uccznppecrkdbgykrucx.supabase.co";


const SUPABASE_KEY =
"sb_publishable_TWW6H1Xuq8gXp1xgDRKSbA_Gq2aNXwA";



const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



window.supabaseClient = supabaseClient;



console.log(
    "Supabase client:",
    supabaseClient
);