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

// Each vocabulary item contributes at most once to Today's Review per local day.
// Re-rating an Again card does not count the same word twice.
async function recordStudyReview(word, rating) {
    if (!word || !word.id || !["again", "hard", "good", "easy"].includes(rating)) {
        throw new Error("Invalid study review.");
    }

    const progress = await getUserProgress();
    if (!progress || !progress.id) {
        throw new Error("The user_progress row could not be found.");
    }

    const now = new Date();
    const dateKey = date => {
        const d = new Date(date);
        return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
    };
    const today = dateKey(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = dateKey(yesterdayDate);

    // Read the latest database state rather than relying on the initially loaded card.
    const { data: latestWord, error: readWordError } = await supabaseClient
        .from("vocabulary")
        .select("id,is_mastered,last_reviewed_date")
        .eq("id", word.id)
        .single();

    if (readWordError || !latestWord) {
        console.error("Read vocabulary review state failed:", readWordError);
        throw readWordError || new Error("Vocabulary word not found.");
    }

    const newlyReviewed = latestWord.last_reviewed_date !== today;
    const newlyMastered = rating === "easy" && latestWord.is_mastered !== true;

    const wordUpdates = {};
    if (newlyReviewed) wordUpdates.last_reviewed_date = today;
    if (newlyMastered) wordUpdates.is_mastered = true;

    if (Object.keys(wordUpdates).length) {
        const { error: wordUpdateError } = await supabaseClient
            .from("vocabulary")
            .update(wordUpdates)
            .eq("id", word.id);

        if (wordUpdateError) {
            console.error("Update vocabulary study state failed:", wordUpdateError);
            throw wordUpdateError;
        }
    }

    // Dedicated date field avoids confusing a database maintenance update with a study day.
    const lastStudyDate = progress.last_study_date || null;
    const isNewStudyDay = lastStudyDate !== today;

    const updates = {
        reviewed_today: (isNewStudyDay ? 0 : Number(progress.reviewed_today || 0)) + (newlyReviewed ? 1 : 0),
        learned_today: (isNewStudyDay ? 0 : Number(progress.learned_today || 0)) + (newlyMastered ? 1 : 0),
        mastered_words: Number(progress.mastered_words || 0) + (newlyMastered ? 1 : 0),
        streak: isNewStudyDay
            ? (lastStudyDate === yesterday ? Number(progress.streak || 0) + 1 : 1)
            : Number(progress.streak || 0),
        last_study_date: today,
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

    word.is_mastered = latestWord.is_mastered === true || newlyMastered;
    word.last_reviewed_date = newlyReviewed ? today : latestWord.last_reviewed_date;

    return { progress: data, newlyMastered, newlyReviewed };
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
