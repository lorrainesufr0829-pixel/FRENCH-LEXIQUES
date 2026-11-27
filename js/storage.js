// =====================================
// LEXIQUE
// Storage Layer
// Supabase Database
// =====================================

console.log("storage.js loaded");

// =====================================
// Authentication context
// =====================================

// Share one in-flight session lookup across all storage calls on this page.
// getSession() reads the persisted Supabase session; unlike getUser(), it avoids
// a separate Auth /user network request for every database helper.
let currentUserIdPromise = null;

supabaseClient.auth.onAuthStateChange(() => {
    // A sign-in, sign-out, or token refresh may change the active user/session.
    currentUserIdPromise = null;
});

async function getCurrentUserId() {
    if (!currentUserIdPromise) {
        currentUserIdPromise = supabaseClient.auth.getSession()
            .then(({ data, error }) => {
                if (error) {
                    console.error("Unable to get authenticated session:", error);
                    return null;
                }
                return data?.session?.user?.id || null;
            })
            .catch(error => {
                currentUserIdPromise = null;
                console.error("Unable to get authenticated session:", error);
                return null;
            });
    }

    return currentUserIdPromise;
}

// =====================================
// Vocabulary
// =====================================

async function getVocabulary() {
    const userId = await getCurrentUserId();
    if (!userId) return [];

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
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Get vocabulary failed:", error);
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
    const userId = await getCurrentUserId();
    if (!userId) {
        console.error("Cannot add vocabulary: no authenticated user.");
        return [];
    }

    const userWords = (Array.isArray(words) ? words : [words]).map(word => ({
        ...word,
        user_id: userId
    }));

    const { data, error } = await supabaseClient
        .from("vocabulary")
        .insert(userWords)
        .select();

    if (error) {
        console.error("Add vocabulary failed:", error);
        return [];
    }

    return data || [];
}

async function deleteVocabulary(id) {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabaseClient
        .from("vocabulary")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

    if (error) {
        console.error("Delete vocabulary failed:", error);
        return false;
    }

    return true;
}

// =====================================
// User Progress
// =====================================

async function getUserProgress() {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabaseClient
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Get progress failed:", error);
        return null;
    }

    return data;
}

async function updateUserProgress(updates) {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const progress = await getUserProgress();
    if (!progress || !progress.id) {
        console.error("Cannot update progress: user_progress row or id is missing.");
        return null;
    }

    const { data, error } = await supabaseClient
        .from("user_progress")
        .update(updates)
        .eq("id", progress.id)
        .eq("user_id", userId)
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

    const userId = await getCurrentUserId();
    if (!userId) {
        throw new Error("You must be logged in to record a study review.");
    }

    const progress = await getUserProgress();
    if (!progress || !progress.id) {
        throw new Error("The user_progress row could not be found for this account.");
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
        .eq("user_id", userId)
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
            .eq("user_id", userId)
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
        .eq("user_id", userId)
        .select()
        .maybeSingle();

    if (progressError || !savedProgress) {
        console.error("Save study progress failed:", progressError);

        if (Object.keys(wordUpdates).length) {
            const rollback = {
                is_mastered: latestWord.is_mastered,
                last_reviewed_date: latestWord.last_reviewed_date
            };
            const { error: rollbackError } = await supabaseClient
                .from("vocabulary")
                .update(rollback)
                .eq("id", word.id)
                .eq("user_id", userId);

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
// Spaced repetition (SM-2-inspired scheduler)
// Requires supabase/migrations/20261126_study_review_state.sql
// =====================================
async function getStudyReviewStates() {
    const userId = await getCurrentUserId();
    if (!userId) return {};
    const { data, error } = await supabaseClient
        .from("vocabulary_review_state")
        .select("vocabulary_id,due_at,interval_days,ease_factor,repetitions,lapses,last_rating,last_reviewed_at")
        .eq("user_id", userId);
    if (error) {
        console.error("Study schedule loading failed:", error);
        if (error.code === "42P01" || error.code === "PGRST205") {
            throw new Error("STUDY_REVIEW_TABLE_MISSING");
        }
        throw error;
    }
    return Object.fromEntries((data || []).map(row => [row.vocabulary_id, row]));
}

async function saveSpacedRepetitionReview(word, rating) {
    if (!word?.id || !["again", "hard", "good", "easy"].includes(rating)) {
        throw new Error("Invalid spaced-repetition review.");
    }
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Please sign in to save your review schedule.");

    const { data: previous, error: readError } = await supabaseClient
        .from("vocabulary_review_state")
        .select("interval_days,ease_factor,repetitions,lapses")
        .eq("user_id", userId)
        .eq("vocabulary_id", word.id)
        .maybeSingle();
    if (readError) {
        if (readError.code === "42P01" || readError.code === "PGRST205") {
            throw new Error("STUDY_REVIEW_TABLE_MISSING");
        }
        throw readError;
    }

    const oldInterval = Number(previous?.interval_days || 0);
    let ease = Number(previous?.ease_factor || 2.5);
    let repetitions = Number(previous?.repetitions || 0);
    let lapses = Number(previous?.lapses || 0);
    let intervalDays;

    if (rating === "again") {
        repetitions = 0;
        lapses += 1;
        ease = Math.max(1.3, ease - 0.2);
        intervalDays = 10 / 1440; // retry in ten minutes
    } else if (rating === "hard") {
        ease = Math.max(1.3, ease - 0.15);
        intervalDays = Math.max(1, Math.ceil(oldInterval ? oldInterval * 1.2 : 1));
        repetitions += 1;
    } else if (rating === "good") {
        intervalDays = repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.max(1, Math.round(oldInterval * ease));
        repetitions += 1;
    } else {
        ease = Math.min(3.0, ease + 0.15);
        intervalDays = repetitions === 0 ? 4 : Math.max(2, Math.round((oldInterval || 3) * ease * 1.3));
        repetitions += 1;
    }

    const now = new Date();
    const dueAt = new Date(now.getTime() + intervalDays * 86400000);
    const payload = {
        user_id: userId,
        vocabulary_id: word.id,
        due_at: dueAt.toISOString(),
        interval_days: intervalDays,
        ease_factor: Number(ease.toFixed(2)),
        repetitions,
        lapses,
        last_rating: rating,
        last_reviewed_at: now.toISOString(),
        updated_at: now.toISOString()
    };
    const { data, error } = await supabaseClient
        .from("vocabulary_review_state")
        .upsert(payload, { onConflict: "user_id,vocabulary_id" })
        .select()
        .single();
    if (error) throw error;
    return data;
}

window.getStudyReviewStates = getStudyReviewStates;
window.saveSpacedRepetitionReview = saveSpacedRepetitionReview;

// =====================================
// Export (Global)
// =====================================

window.getVocabulary = getVocabulary;
window.addVocabulary = addVocabulary;
window.deleteVocabulary = deleteVocabulary;
