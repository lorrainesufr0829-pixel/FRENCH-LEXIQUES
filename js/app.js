async function loadLibrary() {

    const wordList = document.getElementById("word-list");

    if (!wordList) return;

    const words = await getVocabulary();

    console.log("WORDS:", words);

    document.getElementById("word-count").textContent =
        `${words.length} Words`;
        

    words.forEach(word => {

        wordList.innerHTML += `
            <div class="word-card">
                <h3>${word.word ?? ""}</h3>
                <p>${word.meaning ?? ""}</p>
            </div>
        `;

    });

}

document.addEventListener("DOMContentLoaded", loadLibrary);