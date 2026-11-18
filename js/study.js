// =====================================
// LEXIQUE — Study session
// Flashcard-first vocabulary practice
// =====================================

(() => {
    const setup = document.getElementById("study-setup");
    if (!setup) return;

    const categorySelect = document.getElementById("study-category");
    const countSelect = document.getElementById("study-count");
    const startButton = document.getElementById("start-study-btn");
    const loadMessage = document.getElementById("study-load-message");
    const session = document.getElementById("study-session");
    const complete = document.getElementById("study-complete");
    const revealButton = document.getElementById("reveal-answer-btn");
    const ratingPanel = document.getElementById("study-rating");

    let vocabulary = [];
    let queue = [];
    let currentIndex = 0;
    let completedCount = 0;
    let sessionTotal = 0;
    let currentWord = null;
    let sessionRatings = { again: 0, hard: 0, good: 0, easy: 0 };

    const byId = id => document.getElementById(id);

    async function loadStudyVocabulary() {
        startButton.disabled = true;
        loadMessage.textContent = "Loading your vocabulary…";
        try {
            vocabulary = await getVocabulary();
            vocabulary = Array.isArray(vocabulary) ? vocabulary.filter(item =>
                String(item.word || "").trim() && String(item.meaning || "").trim()
            ) : [];
            loadMessage.textContent = vocabulary.length
                ? vocabulary.length + " words ready to study."
                : "No vocabulary found yet. Add words in Import or Library first.";
        } catch (error) {
            console.error("Study vocabulary loading failed:", error);
            loadMessage.textContent = "Unable to load vocabulary. Please refresh and try again.";
        } finally {
            startButton.disabled = vocabulary.length === 0;
        }
    }

    function startSession() {
        const selectedCategory = categorySelect.value;
        const filtered = selectedCategory === "all"
            ? [...vocabulary]
            : vocabulary.filter(item => String(item.category || "").trim().toLowerCase() === selectedCategory.toLowerCase());

        if (!filtered.length) {
            loadMessage.textContent = selectedCategory === "all"
                ? "No vocabulary is available for this session."
                : "No words found in this collection yet.";
            return;
        }

        const requestedCount = countSelect.value === "all" ? filtered.length : Number(countSelect.value);
        queue = filtered.slice(0, requestedCount);
        currentIndex = 0;
        completedCount = 0;
        sessionTotal = queue.length;
        sessionRatings = { again: 0, hard: 0, good: 0, easy: 0 };

        byId("session-category-label").textContent = selectedCategory === "all" ? "ALL VOCABULARY" : selectedCategory.toUpperCase();
        setup.hidden = true;
        complete.hidden = true;
        session.hidden = false;
        renderCard();
    }

    function renderCard() {
        if (!queue.length) {
            finishSession();
            return;
        }

        currentWord = queue[0];
        byId("study-word").textContent = currentWord.word || "";
        byId("study-meaning").textContent = currentWord.meaning || "";
        byId("study-word-level").textContent = currentWord.level || "VOCABULARY";
        byId("study-word-category").textContent = currentWord.category || "GENERAL";
        byId("study-card-front").hidden = false;
        byId("study-card-back").hidden = true;
        ratingPanel.hidden = true;
        revealButton.hidden = false;

        const position = completedCount + 1;
        byId("study-progress-label").textContent = position + " / " + sessionTotal;
        byId("study-progress-fill").style.width = (completedCount / sessionTotal * 100) + "%";
    }

    function revealAnswer() {
        byId("study-card-back").hidden = false;
        revealButton.hidden = true;
        ratingPanel.hidden = false;
    }

    function rateCard(rating) {
        if (!currentWord) return;
        sessionRatings[rating]++;

        if (rating === "again") {
            queue.push(currentWord);
        }

        queue.shift();
        completedCount++;
        currentWord = null;

        if (completedCount >= sessionTotal && queue.length === 0) {
            finishSession();
            return;
        }

        // An "Again" card returns to the end; the session remains finite.
        renderCard();
    }

    function finishSession() {
        session.hidden = true;
        complete.hidden = false;
        const rated = Object.values(sessionRatings).reduce((sum, value) => sum + value, 0);
        byId("study-complete-summary").textContent =
            "You reviewed " + rated + " cards: " +
            sessionRatings.again + " again, " +
            sessionRatings.hard + " hard, " +
            sessionRatings.good + " good and " +
            sessionRatings.easy + " easy.";
        byId("study-progress-fill").style.width = "100%";
    }

    function exitSession() {
        session.hidden = true;
        complete.hidden = true;
        setup.hidden = false;
        loadMessage.textContent = vocabulary.length + " words ready to study.";
    }

    startButton.addEventListener("click", startSession);
    revealButton.addEventListener("click", revealAnswer);
    byId("exit-study-btn").addEventListener("click", exitSession);
    byId("study-again-btn").addEventListener("click", exitSession);

    ratingPanel.querySelectorAll("[data-rating]").forEach(button => {
        button.addEventListener("click", () => rateCard(button.dataset.rating));
    });

    loadStudyVocabulary();
})();
