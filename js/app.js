// =====================================
// LEXIQUE
// Global Progress Controller
// =====================================


document.addEventListener(
    "DOMContentLoaded",
    async function(){

        await updateProgress();

    }
);




// =====================================
// Update Header Progress
// =====================================


async function updateProgress(){


    try{


        const progress = await getUserProgress();



        if(!progress){

            console.warn(
                "No user progress found"
            );

            return;

        }




        // -------------------------------
        // Words Learned
        // -------------------------------

        document
        .querySelectorAll("#words-learned")
        .forEach(function(el){

            el.textContent =
            progress.mastered_words ?? 0;

        });





        // -------------------------------
        // Today's Review
        // -------------------------------

        document
        .querySelectorAll("#today-review")
        .forEach(function(el){

            el.textContent =
            progress.reviewed_today
            + " Words";

        });






        // -------------------------------
        // Memory Streak
        // -------------------------------

        document
        .querySelectorAll("#memory-streak")
        .forEach(function(el){

            el.textContent =
            progress.streak
            + " Days";

        });






        // -------------------------------
        // Level
        // -------------------------------


        let level = "A1";


        if(progress.mastered_words >= 300){

            level = "A2";

        }


        if(progress.mastered_words >= 600){

            level = "B1";

        }


        if(progress.mastered_words >= 1200){

            level = "B2";

        }


        if(progress.mastered_words >= 2000){

            level = "C1";

        }




        document
        .querySelectorAll("#current-level")
        .forEach(function(el){

            el.textContent = level;

        });




        console.log(
            "Progress Loaded:",
            progress
        );



    }


    catch(error){


        console.error(
            "Progress update failed:",
            error
        );


    }



}


// =====================================
// Cross-page progress synchronization
// =====================================

window.updateProgress = updateProgress;

document.addEventListener("DOMContentLoaded", function () {
    // Realtime updates are delivered to other open pages when Supabase
    // Realtime is enabled for the user_progress table.
    if (window.supabaseClient) {
        window.supabaseClient
            .channel("lexique-user-progress")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "user_progress" },
                function () { updateProgress(); }
            )
            .subscribe();
    }

    // Fallback refresh also keeps pages in sync if Realtime is not enabled.
    window.setInterval(function () {
        if (document.visibilityState === "visible") updateProgress();
    }, 30000);

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") updateProgress();
    });
});
