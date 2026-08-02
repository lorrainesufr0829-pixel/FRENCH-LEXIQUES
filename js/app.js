async function loadLibrary() {

    const wordList = document.getElementById("word-list");

    console.log("wordList =", wordList);

    if (!wordList) return;

    const words = await getVocabulary();

    console.log("WORDS:", words);

    // 先只测试插入一个元素
    const card = document.createElement("div");
    card.textContent = "TEST";
    card.style.border = "1px solid red";

    wordList.appendChild(card);
}

document.addEventListener("DOMContentLoaded", loadLibrary);