async function loadLibrary() {

    const wordList = document.getElementById("word-list");

    if (!wordList) return;

    const words = await getVocabulary();

    console.log("WORDS:", words);

    document.getElementById("word-count").textContent =
        `${words.length} Words`;


    words.forEach(word => {

      const card = document.createElement("div");

card.style.border = "1px solid red";
card.style.padding = "10px";
card.style.margin = "10px";

card.innerHTML = `
<h3>${word.word}</h3>
<p>${word.meaning}</p>
`;

wordList.appendChild(card);

    });

}

document.addEventListener("DOMContentLoaded", loadLibrary);