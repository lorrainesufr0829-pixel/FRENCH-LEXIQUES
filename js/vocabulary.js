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

function showComicFeedback(title, message = "", type = "success") {
    const container = document.querySelector(".import-container");
    if (!container) {
        alert([title, message].filter(Boolean).join("\n"));
        return;
    }

    let notice = document.getElementById("import-comic-feedback");
    if (!notice) {
        notice = document.createElement("section");
        notice.id = "import-comic-feedback";
        notice.className = "comic-feedback";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");
        container.prepend(notice);
    }

    notice.className = "comic-feedback comic-feedback--" + type;
    notice.innerHTML = "";
    const burst = document.createElement("span");
    burst.className = "comic-feedback__burst";
    burst.setAttribute("aria-hidden", "true");
    burst.textContent = type === "success" ? "✦ POW! ✦" : "!";
    const heading = document.createElement("strong");
    heading.className = "comic-feedback__title";
    heading.textContent = title;
    notice.append(burst, heading);

    if (message) {
        const detail = document.createElement("p");
        detail.className = "comic-feedback__detail";
        detail.textContent = message;
        notice.appendChild(detail);
    }

    notice.classList.remove("is-visible");
    requestAnimationFrame(() => notice.classList.add("is-visible"));
    window.clearTimeout(notice.dismissTimer);
    notice.dismissTimer = window.setTimeout(() => {
        notice.classList.remove("is-visible");
    }, 6500);
}

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
    duplicateMessage.style.color = duplicate ? "#9a6700" : "#1d8f5a";
    if (addButton) addButton.disabled = false;
}

if (wordInput) {
    wordInput.addEventListener("input", async () => {
        const value = wordInput.value.trim();
        if (!value) {
            showDuplicateStatus("");
            return;
        }
        try {
            if (!knownWordsLoaded) await loadKnownWords();
            if (isDuplicate(value)) {
                showDuplicateStatus("该单词已存在；保存时会为它添加所选分类。", true);
            } else {
                showDuplicateStatus("");
            }
        } catch (error) {
            console.error("Duplicate check failed:", error);
            showDuplicateStatus("暂时无法查重，请检查网络后重试。", true);
        }
    });
}

// Resolve existing shared category IDs and attach category links to a user's word.
async function attachWordCategories(wordId, item, categoryMap) {
    const requested = [
        { name: String(item.category || "").trim(), type: "collection" },
        { name: String(item.level || "").trim(), type: "level" }
    ].filter(entry => entry.name);

    const links = requested
        .map(entry => categoryMap.get(entry.type + ":" + entry.name))
        .filter(Boolean)
        .map(categoryId => ({
            vocabulary_id: wordId,
            category_id: categoryId
        }));

    if (!links.length) {
        return {
            linked: 0,
            missing: requested.filter(entry =>
                !categoryMap.has(entry.type + ":" + entry.name)
            ).map(entry => entry.name)
        };
    }

    const { error } = await supabaseClient
        .from("vocabulary_category_links")
        .upsert(links, {
            onConflict: "vocabulary_id,category_id",
            ignoreDuplicates: true
        });

    if (error) {
        console.error("Attach vocabulary categories failed:", error);
        throw error;
    }

    // Verify persisted rows instead of assuming an upsert request means success.
    const categoryIds = links.map(link => link.category_id);
    const { data: savedLinks, error: verifyError } = await supabaseClient
        .from("vocabulary_category_links")
        .select("vocabulary_id,category_id")
        .eq("vocabulary_id", wordId)
        .in("category_id", categoryIds);

    if (verifyError) {
        console.error("Verify vocabulary category links failed:", verifyError);
        throw verifyError;
    }

    const savedIds = new Set((savedLinks || []).map(link => link.category_id));
    const missingLinks = links.filter(link => !savedIds.has(link.category_id));
    if (missingLinks.length) {
        throw new Error("Some category links were not persisted. Check vocabulary_category_links RLS policies and foreign keys.");
    }

    return {
        linked: savedIds.size,
        missing: requested.filter(entry =>
            !categoryMap.has(entry.type + ":" + entry.name)
        ).map(entry => entry.name)
    };
}

async function saveWordsToSupabase(words) {
    const cleanWords = words
        .map(item => ({
            word: String(item.word || "").trim(),
            meaning: String(item.meaning || "").trim(),
            category: String(item.category || "").trim(),
            level: String(item.level || "").trim()
        }))
        .filter(item => item.word && item.meaning);

    if (!cleanWords.length) {
        return { inserted: 0, duplicates: 0, linked: 0, invalid: words.length, missingCategories: [] };
    }

    if (!knownWordsLoaded) await loadKnownWords();

    const existingByWord = new Map(
        knownWords.map(item => [normalizeWord(item.word), item])
    );
    const newWords = [];
    const pendingLinks = [];
    let duplicates = 0;

    for (const item of cleanWords) {
        const existing = existingByWord.get(normalizeWord(item.word));
        if (existing) {
            duplicates++;
            if (existing.pending) {
                pendingLinks.push({ wordKey: normalizeWord(item.word), item });
            } else {
                pendingLinks.push({ wordId: existing.id, item });
            }
        } else {
            newWords.push(item);
            // Prevent duplicate rows within the same uploaded file.
            existingByWord.set(normalizeWord(item.word), { pending: true, item });
        }
    }

    const inserted = newWords.length ? await addVocabulary(newWords) : [];
    if (newWords.length && (!Array.isArray(inserted) || inserted.length !== newWords.length)) {
        throw new Error("Supabase did not confirm that all new vocabulary entries were saved.");
    }

    const insertedByWord = new Map(
        (inserted || []).map(item => [normalizeWord(item.word), item])
    );

    // Include new words in the same category-linking pass.
    for (const item of newWords) {
        const saved = insertedByWord.get(normalizeWord(item.word));
        if (saved) pendingLinks.push({ wordId: saved.id, item });
    }

    // Resolve repeated words inside the same file to the single inserted record.
    pendingLinks.forEach(entry => {
        if (!entry.wordId && entry.wordKey) {
            entry.wordId = insertedByWord.get(entry.wordKey)?.id;
        }
    });

    if (inserted?.length) knownWords.push(...inserted);

    const { data: categories, error: categoryError } = await supabaseClient
        .from("vocabulary_categories")
        .select("id,name,category_type");

    if (categoryError) {
        console.error("Load category directory failed:", categoryError);
        throw categoryError;
    }

    const categoryMap = new Map(
        (categories || []).map(category => [
            category.category_type + ":" + category.name,
            category.id
        ])
    );

    let linked = 0;
    const missingCategories = new Set();
    for (const entry of pendingLinks) {
        if (!entry.wordId) continue;
        const result = await attachWordCategories(entry.wordId, entry.item, categoryMap);
        linked += result.linked;
        result.missing.forEach(name => missingCategories.add(name));
    }

    return {
        inserted: inserted?.length || 0,
        duplicates,
        linked,
        invalid: words.length - cleanWords.length,
        missingCategories: [...missingCategories]
    };
}

// Manual entry
if (addButton) {
    addButton.addEventListener("click", async () => {
        const word = wordInput?.value.trim() || "";
        const meaning = meaningInput?.value.trim() || "";
        if (!word || !meaning) {
            showComicFeedback("先补充完整信息哦！", "请填写单词和释义。", "error");
            return;
        }

        addButton.disabled = true;
        try {
            const result = await saveWordsToSupabase([{
                word,
                meaning,
                category: document.getElementById("new-category")?.value || "",
                level: document.getElementById("new-level")?.value || ""
            }]);

            if (result.inserted || result.linked) {
                const messages = [];
                if (result.inserted) messages.push("新增 " + result.inserted + " 个单词");
                if (result.duplicates) messages.push("已有单词 " + result.duplicates + " 个");
                if (result.linked) messages.push("添加分类关联 " + result.linked + " 条");
                if (result.missingCategories.length) {
                    messages.push("未匹配到分类目录：" + result.missingCategories.join("、"));
                }
                showComicFeedback("成功！离大师又进一步！", messages.join("；") + "。");
                wordInput.value = "";
                meaningInput.value = "";
                showDuplicateStatus("");
            } else if (result.duplicates) {
                showComicFeedback("分类已更新！", "这个单词已经在词库中，所选分类无需重复添加。");
            } else {
                showComicFeedback("再检查一下！", "请确认单词和释义都已填写。", "error");
            }
        } catch (error) {
            console.error("Vocabulary save failed:", error);
            showComicFeedback("哎呀，保存没有成功！", "请检查网络连接或稍后重试。", "error");
        } finally {
            if (addButton) addButton.disabled = false;
        }
    });
}

// Excel / CSV import
if (fileInput) {
    fileInput.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (typeof XLSX === "undefined") {
            showComicFeedback("文件读取组件暂不可用！", "请刷新页面后重试。", "error");
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
            const summary = [
                "新增 " + result.inserted + " 个单词",
                "重复单词 " + result.duplicates + " 个",
                "新增分类关联 " + result.linked + " 条",
                "无效记录 " + result.invalid + " 条"
            ];
            if (result.missingCategories.length) {
                summary.push("未匹配分类：" + result.missingCategories.join("、"));
            }
            showComicFeedback("成功！离大师又进一步！", summary.join("；") + "。");
        } catch (error) {
            console.error("Vocabulary import failed:", error);
            showComicFeedback("这次导入遇到一点小麻烦！", "请确认文件格式、登录状态及网络连接后重试。", "error");
        } finally {
            fileInput.value = "";
        }
    });
}

// Library rendering and category filtering
let libraryWords = [];
let activeLibraryCategory = "all";
let librarySearchTerm = "";

async function loadLibrary() {
    const wordList = document.getElementById("word-list");
    if (!wordList) return;

    try {
        libraryWords = await getVocabulary();
        if (!Array.isArray(libraryWords)) libraryWords = [];
        renderLibrary();
        setupLibraryFilters();
    } catch (error) {
        console.error("Library loading failed:", error);
        wordList.textContent = "Unable to load vocabulary. Please refresh and try again.";
    }
}

function setupLibraryFilters() {
    const categoryList = document.getElementById("library-category-list");
    const searchInput = document.getElementById("library-search");

    if (categoryList && !categoryList.dataset.bound) {
        categoryList.dataset.bound = "true";
        categoryList.addEventListener("click", event => {
            const item = event.target.closest("li[data-category]");
            if (!item) return;

            activeLibraryCategory = item.dataset.category;
            categoryList.querySelectorAll("li").forEach(li => {
                li.classList.toggle("active", li === item);
            });
            renderLibrary();
        });
    }

    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = "true";
        searchInput.addEventListener("input", () => {
            librarySearchTerm = searchInput.value.trim().toLocaleLowerCase();
            renderLibrary();
        });
    }
}

function renderLibrary() {
    const wordList = document.getElementById("word-list");
    const wordCount = document.getElementById("word-count");
    const title = document.querySelector(".library-header h2");
    if (!wordList) return;

    const filteredWords = libraryWords.filter(word => {
        const categoryNames = Array.isArray(word.category_names)
            ? word.category_names
            : [word.category].filter(Boolean);
        const levelNames = Array.isArray(word.level_names)
            ? word.level_names
            : [word.level].filter(Boolean);
        const allCategoryNames = [...categoryNames, ...levelNames]
            .map(value => String(value || "").trim().toLocaleLowerCase())
            .filter(Boolean);

        const matchesCategory = activeLibraryCategory === "all" ||
            allCategoryNames.includes(activeLibraryCategory.toLocaleLowerCase());

        const searchable = [
            word.word,
            word.meaning,
            ...categoryNames,
            ...levelNames
        ].map(value => String(value || "").toLocaleLowerCase()).join(" ");

        return matchesCategory && searchable.includes(librarySearchTerm);
    });

    if (wordCount) wordCount.textContent = filteredWords.length + " Words";
    if (title) {
        const activeItem = document.querySelector("#library-category-list li.active");
        const categoryTitle = activeItem?.dataset.category === "all"
            ? "All Vocabulary"
            : (activeItem?.dataset.category || "Vocabulary");
        title.textContent = categoryTitle;
    }

    wordList.innerHTML = "";
    if (!filteredWords.length) {
        const empty = document.createElement("p");
        empty.className = "library-empty-state";
        empty.textContent = librarySearchTerm
            ? "No words match your search in this category."
            : "There are no words in this category yet.";
        wordList.appendChild(empty);
        return;
    }

    filteredWords.forEach(word => {
        const row = document.createElement("article");
        row.className = "word-row";

        const info = document.createElement("div");
        info.className = "word-info";

        const heading = document.createElement("h3");
        heading.textContent = word.word || "";
        const meaning = document.createElement("p");
        meaning.textContent = word.meaning || "";
        info.append(heading, meaning);

        const meta = document.createElement("div");
        meta.className = "library-word-meta";
        const categoryTags = [
            ...(Array.isArray(word.category_names) ? word.category_names : [word.category]),
            ...(Array.isArray(word.level_names) ? word.level_names : [word.level])
        ];
        [...new Set(categoryTags.map(value => String(value || "").trim()).filter(Boolean))]
            .forEach(value => {
                const tag = document.createElement("span");
                tag.textContent = value;
                meta.appendChild(tag);
            });

        row.append(info, meta);
        wordList.appendChild(row);
    });
}

if (document.getElementById("word-list")) loadLibrary();
