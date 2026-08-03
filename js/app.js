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
            progress.learned_today;

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
