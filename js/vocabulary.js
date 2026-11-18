// =====================================
// LEXIQUE VOCABULARY
// Supabase import, duplicate checking and library rendering
// =====================================

const wordInput = document.getElementById("new-word");
const meaningInput = document.getElementById("new-meaning");
const addButton = document.getElementById("add-word-btn");
const fileInput = document.getElementById("file-upload");

let knownWords = [];
let knownWordsLoaded = false;
let duplicateMessage = null;

function normalizeWord(value) {
    return String(value || "").trim().toLocaleLowerCase();
}

async function loadKnownWords() {
    const words = await getVocabulary();
    knownWords = Array.isArray(words) ? words : [];
    knownWordsLoaded = true;
    return knownWords;
}

function isDuplicate(value) {
    const target = normalizeWord(value);
    return !!target && knownWords.some(item => normalizeWord(item.word) === target);
}

function showDuplicateStatus(message, duplicate = false) {
    if (!wordInput) return;
    if (!duplicateMessage) {
        duplicateMessage = document.createElement("p");
        duplicateMessage.id = "word-duplicate-status";
        duplicateMessage.setAttribute("role", "status");
        duplicateMessage.style.marginTop = "-8px";
        duplicateMessage.style.fontSize = "14px";
        wordInput.insertAdjacentElement("afterend", duplicateMessage);
    }
    duplicateMessage.textContent = message;
    duplicateMessage.style.color = duplicate ? "#c0392b" : "#1d8f5a";
    if (addButton) addButton.disabled = duplicate;
}

if (wordInput) {
    wordInput.addEventListener("input", async () => {
        const value = wordInput.value.trim();
        if (!value) {
            showDuplicateStatus("");
            if (addButton) addButton.disabled = false;
            return;
        }
        try {
            if (!knownWordsLoaded) await loadKnownWords();
            if (isDuplicate(value)) {
                showDuplicateStatus("您已记录这个单词！", true);
            } else {
                showDuplicateStatus("");
                if (addButton) addButton.disabled = false;
            }
        } catch (error) {
            console.error("Duplicate check failed:", error);
            showDuplicateStatus("暂时无法查重，请检查网络后重试。", true);
        }
    });
}

async function saveWordsToSupabase(words) {
    const cleanWords = words
        .map(item => ({
            word: String(item.word || "").trim(),
            meaning: String(item.meaning || "").trim(),
            category: String(item.category || "").trim() || null,
            level: String(item.level || "").trim() || null
        }))
        .filter(item => item.word && item.meaning);

    if (!cleanWords.length) {
        return { inserted: 0, duplicates: 0, invalid: words.length };
    }

    if (!knownWordsLoaded) await loadKnownWords();

    const seen = new Set(knownWords.map(item => normalizeWord(item.word)));
    const uniqueWords = [];
    let duplicates = 0;

    for (const item of cleanWords) {
        const key = normalizeWord(item.word);
        if (seen.has(key)) {
            duplicates++;
            continue;
        }
        seen.add(key);
        uniqueWords.push(item);
    }

    if (!uniqueWords.length) {
        return { inserted: 0, duplicates, invalid: words.length - cleanWords.length };
    }

    const inserted = await addVocabulary(uniqueWords);
    if (!Array.isArray(inserted) || inserted.length !== uniqueWords.length) {
        throw new Error("Supabase did not confirm that all vocabulary entries were saved.");
    }

    knownWords.push(...inserted);
    return {
        inserted: inserted.length,
        duplicates,
        invalid: words.length - cleanWords.length
    };
}

// Manual entry
if (addButton) {
    addButton.addEventListener("click", async () => {
        const word = wordInput?.value.trim() || "";
        const meaning = meaningInput?.value.trim() || "";
        if (!word || !meaning) {
            alert("Please enter both the word and its meaning.");
            return;
        }

        addButton.disabled = true;
        try {
            if (!knownWordsLoaded) await loadKnownWords();
            if (isDuplicate(word)) {
                showDuplicateStatus("您已记录这个单词！", true);
                return;
            }

            const result = await saveWordsToSupabase([{
                word,
                meaning,
                category: document.getElementById("new-category")?.value || "",
                level: document.getElementById("new-level")?.value || ""
            }]);

            if (result.inserted) {
                alert("Vocabulary added successfully!");
                wordInput.value = "";
                meaningInput.value = "";
                showDuplicateStatus("");
                if (addButton) addButton.disabled = false;
            } else if (result.duplicates) {
                showDuplicateStatus("您已记录这个单词！", true);
            } else {
                alert("Please check the word and meaning fields.");
            }
        } catch (error) {
            console.error("Vocabulary save failed:", error);
            alert("保存失败，请检查网络连接及 Supabase 数据库权限。");
        } finally {
            if (addButton && !isDuplicate(wordInput?.value || "")) addButton.disabled = false;
        }
    });
}

// Excel / CSV import
if (fileInput) {
    fileInput.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (typeof XLSX === "undefined") {
            alert("Excel import library is not loaded.");
            return;
        }

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

            const importedWords = rows.map(item => ({
                word: item.Word || item.word || "",
                meaning: item.Meaning || item.meaning || "",
                category: item.Category || item.category || "",
                level: item.Level || item.level || ""
            }));

            const result = await saveWordsToSupabase(importedWords);
            alert(`导入完成：成功保存 ${result.inserted} 个，重复跳过 ${result.duplicates} 个，无效记录 ${result.invalid} 个。`);
        } catch (error) {
            console.error("Vocabulary import failed:", error);
            alert("导入失败，请确认文件格式、Supabase 权限及数据库字段。");
        } finally {
            fileInput.value = "";
        }
    });
}

// Library rendering
async function loadLibrary() {
    const wordList = document.getElementById("word-list");
    const wordCount = document.getElementById("word-count");
    if (!wordList) return;

    try {
        const words = await getVocabulary();
        wordList.innerHTML = "";
        if (wordCount) wordCount.textContent = `${words.length} Words`;

        words.forEach(word => {
            const card = document.createElement("div");
            card.className = "word-card";
            const heading = document.createElement("h3");
            heading.textContent = word.word || "";
            const meaning = document.createElement("p");
            meaning.textContent = word.meaning || "";
            card.append(heading, meaning);
            wordList.appendChild(card);
        });
    } catch (error) {
        console.error("Library loading failed:", error);
        wordList.textContent = "Unable to load vocabulary. Please refresh and try again.";
    }
}

if (document.getElementById("word-list")) loadLibrary();
