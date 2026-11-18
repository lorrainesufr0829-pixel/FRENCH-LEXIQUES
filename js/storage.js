// =====================================
// LEXIQUE
// Storage Layer
// Supabase Database
// =====================================



console.log("storage.js loaded");




// =====================================
// Vocabulary
// =====================================



async function getVocabulary() {

    const { data, error } = await supabaseClient
        .from("vocabulary")
        .select("*")
        .order("created_at", { ascending: true });


    if (error) {

        console.error(
            "Get vocabulary failed:",
            error
        );

        return [];

    }


    return data || [];

}





async function addVocabulary(words) {


    const { data, error } = await supabaseClient
        .from("vocabulary")
        .insert(words)
        .select();


    if (error) {

        console.error(
            "Add vocabulary failed:",
            error
        );

        return [];

    }


    return data || [];

}






async function deleteVocabulary(id) {


    const { error } = await supabaseClient
        .from("vocabulary")
        .delete()
        .eq("id", id);



    if (error) {

        console.error(
            "Delete vocabulary failed:",
            error
        );

        return false;

    }


    return true;

}






// =====================================
// User Progress
// =====================================

async function getUserProgress() {
    const { data, error } = await supabaseClient
        .from("user_progress")
        .select("*")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Get progress failed:", error);
        return null;
    }

    return data;
}

async function updateUserProgress(updates) {
    const progress = await getUserProgress();

    if (!progress || !progress.id) {
        console.error("Cannot update progress: user_progress row or id is missing.");
        return null;
    }

    const { data, error } = await supabaseClient
        .from("user_progress")
        .update(updates)
        .eq("id", progress.id)
        .select()
        .single();

    if (error) {
        console.error("Update progress failed:", error);
        return null;
    }

    return data;
}

// Record one completed flashcard rating in Supabase.
// updated_at is used as the last study date, so no extra date column is needed.
async function recordStudyReview(word, rating) {
    if (!word || !word.id || !["again", "hard", "good", "easy"].includes(rating)) {
        throw new Error("Invalid study review.");
    }

    const progress = await getUserProgress();
    if (!progress || !progress.id) {
        throw new Error("The user_progress row could not be found.");
    }

    const now = new Date();
    const localDateKey = date => {
        const d = new Date(date);
        return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
    };

    const today = localDateKey(now);
    const lastStudyDate = progress.updated_at ? localDateKey(progress.updated_at) : null;
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = localDateKey(yesterdayDate);
    const isNewStudyDay = lastStudyDate !== today;

    let newlyMastered = false;

    if (rating === "easy" && word.is_mastered !== true) {
        const { data, error } = await supabaseClient
            .from("vocabulary")
            .update({ is_mastered: true })
            .eq("id", word.id)
            .eq("is_mastered", false)
            .select("id");

        if (error) {
            console.error("Mark vocabulary as mastered failed:", error);
            throw error;
        }

        newlyMastered = Array.isArray(data) && data.length > 0;
        if (newlyMastered) word.is_mastered = true;
    }

    const updates = {
        reviewed_today: (isNewStudyDay ? 0 : Number(progress.reviewed_today || 0)) + 1,
        learned_today: (isNewStudyDay ? 0 : Number(progress.learned_today || 0)) + (newlyMastered ? 1 : 0),
        mastered_words: Number(progress.mastered_words || 0) + (newlyMastered ? 1 : 0),
        streak: isNewStudyDay
            ? (lastStudyDate === yesterday ? Number(progress.streak || 0) + 1 : 1)
            : Number(progress.streak || 0),
        updated_at: now.toISOString()
    };

    const { data, error } = await supabaseClient
        .from("user_progress")
        .update(updates)
        .eq("id", progress.id)
        .select()
        .single();

    if (error) {
        console.error("Save study progress failed:", error);
        throw error;
    }

    return { progress: data, newlyMastered };
}

window.getUserProgress = getUserProgress;
window.updateUserProgress = updateUserProgress;
window.recordStudyReview = recordStudyReview;

// =====================================
// Export (Global)
// =====================================


window.getVocabulary = getVocabulary;

window.addVocabulary = addVocabulary;

window.deleteVocabulary = deleteVocabulary;


window.getUserProgress = getUserProgress;

window.updateUserProgress = updateUserProgress;

window.increaseLearnedToday = increaseLearnedToday;

window.increaseReviewedToday = increaseReviewedToday;

window.updateStreak = updateStreak;