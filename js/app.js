// =====================================
// LEXIQUE
// Library Page
// =====================================

document.addEventListener("DOMContentLoaded", async function () {

    const wordList = document.getElementById("word-list");

    if (!wordList) {
        return;
    }

    const wordCount = document.getElementById("word-count");

    try {

        const words = await getVocabulary();

        console.log("WORDS:", words);

        wordCount.textContent = `${words.length} Words`;

        wordList.innerHTML = "";

        words.forEach(function (word) {

            const card = document.createElement("div");

            card.className = "word-card";

            card.innerHTML = `
                <h3>${word.word || ""}</h3>
                <p>${word.meaning || ""}</p>
                <div>
                    ${word.category || ""}
                    ${word.level || ""}
                </div>
            `;

            wordList.appendChild(card);

        });


        console.log(
            "Rendered cards:",
            wordList.children.length
        );


    } catch (error) {

        console.error(
            "Library loading error:",
            error
        );

    }

});


// =====================================
// Home Dashboard
// Words Learned
// =====================================

async function loadWordsLearned() {

    const wordsLearned = document.getElementById("words-learned");

    if (!wordsLearned) {
        return;
    }

    const words = await getVocabulary();

    wordsLearned.textContent = words.length;

}


document.addEventListener(
    "DOMContentLoaded",
    loadWordsLearned
);