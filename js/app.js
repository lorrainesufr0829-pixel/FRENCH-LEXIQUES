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

    const words = await getVocabulary();

    console.log("FIRST WORD:", words[0]);

    wordCount.textContent = `${words.length} Words`;

    wordList.innerHTML = "";

    words.forEach((word, index) => {

        console.log(index, word);

        const card = document.createElement("div");

        card.style.border = "1px solid #ddd";
        card.style.padding = "12px";
        card.style.marginBottom = "10px";
        card.style.borderRadius = "8px";
        card.style.background = "#fff";

        // 这里只输出 word，先确认字段
        card.textContent = word.word;

        wordList.appendChild(card);

    });

});