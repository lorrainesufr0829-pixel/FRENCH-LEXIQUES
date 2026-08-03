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

    const { data, error } = await supabase
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


    const { data, error } = await supabase
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


    const { error } = await supabase
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


    const { data, error } = await supabase

        .from("user_progress")

        .select("*")

        .limit(1)

        .single();



    if (error) {


        console.error(
            "Get progress failed:",
            error
        );


        return {

            learned_today:0,

            reviewed_today:0,

            streak:0,

            mastered_words:0,

            daily_goal:20

        };


    }


    return data;


}








async function updateUserProgress(updates) {



    const progress = await getUserProgress();



    const { data, error } = await supabase

        .from("user_progress")

        .update(updates)

        .eq("id", progress.id)

        .select()

        .single();




    if (error) {


        console.error(
            "Update progress failed:",
            error
        );


        return null;


    }



    return data;


}







// =====================================
// Learning Actions
// =====================================



async function increaseLearnedToday(number = 1) {


    const progress = await getUserProgress();



    return updateUserProgress({

        learned_today:
        progress.learned_today + number,


        mastered_words:
        progress.mastered_words + number,


        updated_at:
        new Date()

    });


}








async function increaseReviewedToday(number = 1) {


    const progress = await getUserProgress();



    return updateUserProgress({

        reviewed_today:
        progress.reviewed_today + number,


        updated_at:
        new Date()

    });


}








async function updateStreak() {


    const progress = await getUserProgress();



    return updateUserProgress({

        streak:
        progress.streak + 1,


        updated_at:
        new Date()

    });


}






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