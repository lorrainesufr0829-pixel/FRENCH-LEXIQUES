// =====================================
// Supabase Client
// =====================================

const SUPABASE_URL =
    "https://uccznppecrkdbgykrucx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_TWW6H1Xuq8gXp1xgDRKSbA_Gq2aNXwA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    }
);

window.supabaseClient = supabaseClient;

// =====================================
// Authentication Helpers
// =====================================

window.lexiqueAuth = {
    async getSession() {
        return await supabaseClient.auth.getSession();
    },

    async getUser() {
        return await supabaseClient.auth.getUser();
    },

    async signUp(email, password) {
        return await supabaseClient.auth.signUp({
            email: email.trim(),
            password
        });
    },

    async signIn(email, password) {
        return await supabaseClient.auth.signInWithPassword({
            email: email.trim(),
            password
        });
    },

    async signOut() {
        return await supabaseClient.auth.signOut();
    },

    async resetPassword(email) {
        return await supabaseClient.auth.resetPasswordForEmail(
            email.trim(),
            {
                redirectTo: window.location.origin
            }
        );
    },

    onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange(callback);
    }
};

console.log("Supabase client and authentication helpers initialized.");
