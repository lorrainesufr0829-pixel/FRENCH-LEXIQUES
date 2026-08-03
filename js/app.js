// =====================================
// LEXIQUE
// Global App
// =====================================

document.addEventListener("DOMContentLoaded", async () => {

    await updateProgress();

});



// =====================================
// Update Top Progress
// =====================================

async function updateProgress() {

    try {

        const words = await getVocabulary();

        const totalWords = words.length;

        // Words Learned
        document.querySelectorAll("#words-learned")
            .forEach(el => {
                el.textContent = totalWords;
            });

        // Today's Review（先固定）
        document.querySelectorAll("#today-review")
            .forEach(el => {
                el.textContent = Math.min(20, totalWords) + " Words";
            });

        // Level（先根据数量计算）
        document.querySelectorAll("#current-level")
            .forEach(el => {

                let level = "A1";

                if (totalWords >= 300) level = "A2";
                if (totalWords >= 600) level = "B1";
                if (totalWords >= 1200) level = "B2";
                if (totalWords >= 2000) level = "C1";

                el.textContent = level;

            });

    }

    catch(err){

        console.error(err);

    }

}