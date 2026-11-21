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
        .select(`
            *,
            vocabulary_category_links (
                category_id,
                vocabulary_categories (
                    id,
                    name,
                    category_type
                )
            )
        `)
        .order("created_at", { ascending: true });


    if (error) {

        console.error(
            "Get vocabulary failed:",
            error
        );

        return [];

    }


    return (data || []).map(word => {
        const categories = (word.vocabulary_category_links || [])
            .map(link => link.vocabulary_categories)
            .filter(Boolean);

        return {
            ...word,
            categories,
            category_names: categories
                .filter(item => item.category_type === "collection")
                .map(item => item.name),
            level_names: categories
                .filter(item => item.category_type === "level")
                .map(item => item.name)
        };
    });

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
// A failed progress write rolls back the vocabulary markers so retrying is safe.
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

    let updatedWord = latestWord;
    if (Object.keys(wordUpdates).length) {
        const { data, error } = await supabaseClient
            .from("vocabulary")
            .update(wordUpdates)
            .eq("id", word.id)
            .select("id,is_mastered,last_reviewed_date")
            .maybeSingle();

        if (error) {
            console.error("Update vocabulary study state failed:", error);
            throw error;
        }
        if (!data) {
            throw new Error("Vocabulary update was blocked or no row was updated. Check the vocabulary UPDATE policy.");
        }
        updatedWord = data;
    }

    const lastStudyDate = progress.last_study_date || null;
    const isNewStudyDay = lastStudyDate !== today;
    const updates = {
        reviewed_today: (isNewStudyDay ? 0 : Number(progress.reviewed_today || 0)) + (newlyReviewed ? 1 : 0),
        learned_today: (isNewStudyDay ? 0 : Number(progress.learned_today || 0)) + (newlyMastered ? 1 : 0),
        mastered_words: Number(progress.mastered_words || 0) + (newlyMastered ? 1 : 0),
        streak: isNewStudyDay
            ? (lastStudyDate === yesterday ? Number(progress.streak || 0) + 1 : 1)
            : (Number(progress.streak || 0) === 0 ? 1 : Number(progress.streak || 0)),
        last_study_date: today,
        updated_at: now.toISOString()
    };

    const { data: savedProgress, error: progressError } = await supabaseClient
        .from("user_progress")
        .update(updates)
        .eq("id", progress.id)
        .select()
        .maybeSingle();

    if (progressError || !savedProgress) {
        console.error("Save study progress failed:", progressError);
        // Restore the per-word markers; otherwise a retry would be incorrectly treated as a duplicate.
        if (Object.keys(wordUpdates).length) {
            const rollback = {
                is_mastered: latestWord.is_mastered,
                last_reviewed_date: latestWord.last_reviewed_date
            };
            const { error: rollbackError } = await supabaseClient
                .from("vocabulary")
                .update(rollback)
                .eq("id", word.id);
            if (rollbackError) console.error("Study marker rollback failed:", rollbackError);
        }
        throw progressError || new Error("No user_progress row was updated.");
    }

    word.is_mastered = updatedWord.is_mastered === true;
    word.last_reviewed_date = updatedWord.last_reviewed_date;
    return { progress: savedProgress, newlyMastered, newlyReviewed };
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
