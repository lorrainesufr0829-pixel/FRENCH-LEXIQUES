async function loadLibrary() {

    const wordList = document.getElementById("word-list");

    if (!wordList) return;

    const words = await getVocabulary();

    document.getElementById("word-count").textContent =
        `${words.length} Words`;

    wordList.innerHTML = "";

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