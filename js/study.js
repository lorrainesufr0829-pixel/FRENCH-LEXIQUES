// =====================================
// LEXIQUE — Minimal flashcard study
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
    const byId = id => document.getElementById(id);

    let vocabulary = [];
    let queue = [];
    let currentWord = null;
    let completedCount = 0;
    let sessionTotal = 0;
    let sessionRatings = { again: 0, hard: 0, good: 0, easy: 0 };

    async function loadStudyVocabulary() {
        startButton.disabled = true;
        loadMessage.textContent = "Loading your vocabulary…";
        try {
            const words = await getVocabulary();
            vocabulary = Array.isArray(words) ? words.filter(item =>
                String(item.word || "").trim() && String(item.meaning || "").trim()
            ) : [];
            loadMessage.textContent = vocabulary.length
                ? vocabulary.length + " words available"
                : "No vocabulary yet. Add words in Import to begin.";
        } catch (error) {
            console.error("Study vocabulary loading failed:", error);
            loadMessage.textContent = "Unable to load vocabulary. Please refresh and try again.";
        } finally {
            startButton.disabled = vocabulary.length === 0;
        }
    }

    function startSession() {
        const category = categorySelect.value;
        const filtered = category === "all"
            ? [...vocabulary]
            : vocabulary.filter(item =>
                String(item.category || "").trim().toLowerCase() === category.toLowerCase()
            );

        if (!filtered.length) {
            loadMessage.textContent = category === "all"
                ? "No vocabulary is available for study."
                : "There are no words in this collection yet.";
            return;
        }

        const amount = countSelect.value === "all" ? filtered.length : Number(countSelect.value);
        queue = filtered.slice(0, amount);
        sessionTotal = queue.length;
        completedCount = 0;
        sessionRatings = { again: 0, hard: 0, good: 0, easy: 0 };

        byId("session-category-label").textContent = category === "all" ? "ALL VOCABULARY" : category.toUpperCase();
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
        byId("study-word").textContent = currentWord.word;
        byId("study-meaning").textContent = currentWord.meaning;
        byId("study-word-level").textContent = currentWord.level || "VOCABULARY";
        byId("study-word-category").textContent = currentWord.category || "GENERAL";
        byId("study-card-front").hidden = false;
        byId("study-card-back").hidden = true;
        revealButton.hidden = false;
        ratingPanel.hidden = true;

        const displayedPosition = Math.min(completedCount + 1, sessionTotal);
        byId("study-progress-label").textContent = displayedPosition + " / " + sessionTotal;
        byId("study-progress-fill").style.width = (Math.min(completedCount, sessionTotal) / sessionTotal * 100) + "%";
    }

    function revealAnswer() {
        if (!currentWord) return;
        byId("study-card-back").hidden = false;
        revealButton.hidden = true;
        ratingPanel.hidden = false;
    }

    async function rateCard(rating) {
        if (!currentWord || !Object.prototype.hasOwnProperty.call(sessionRatings, rating)) return;

        const reviewedWord = currentWord;
        const ratingButtons = [...ratingPanel.querySelectorAll("[data-rating]")];
        ratingButtons.forEach(button => button.disabled = true);

        try {
            await recordStudyReview(reviewedWord, rating);
            sessionRatings[rating]++;
            queue.shift();

            if (rating === "again") queue.push(reviewedWord);

            completedCount++;
            currentWord = null;

            if (typeof window.updateProgress === "function") {
                await window.updateProgress();
            }

            renderCard();
        } catch (error) {
            console.error("Unable to save this study review:", error);
            loadMessage.textContent = "Your review could not be synced. Please try again.";
            alert("Your review was not saved. Please check your connection and try again.");
        } finally {
            ratingButtons.forEach(button => button.disabled = false);
        }
    }

    function finishSession() {
        session.hidden = true;
        complete.hidden = false;

        const totalRatings = Object.values(sessionRatings).reduce((sum, value) => sum + value, 0);
        byId("study-complete-summary").textContent =
            "You reviewed " + totalRatings + " cards. " +
            sessionRatings.again + " again · " +
            sessionRatings.hard + " hard · " +
            sessionRatings.good + " good · " +
            sessionRatings.easy + " easy.";
        byId("study-progress-fill").style.width = "100%";
    }

    function exitSession() {
        session.hidden = true;
        complete.hidden = true;
        setup.hidden = false;
        loadMessage.textContent = vocabulary.length + " words available";
    }

    startButton.addEventListener("click", startSession);
    revealButton.addEventListener("click", revealAnswer);
    byId("exit-study-btn").addEventListener("click", exitSession);
    byId("study-again-btn").addEventListener("click", exitSession);

    ratingPanel.querySelectorAll("[data-rating]").forEach(button => {
        button.addEventListener("click", () => rateCard(button.dataset.rating));
    });

    // Keyboard controls: Space reveals; 1–4 selects a rating after reveal.
    document.addEventListener("keydown", event => {
        if (session.hidden || event.repeat || event.target.matches("input, textarea, select")) return;
        if (event.code === "Space" && !revealButton.hidden) {
            event.preventDefault();
            revealAnswer();
            return;
        }
        if (!ratingPanel.hidden && ["1", "2", "3", "4"].includes(event.key)) {
            const rating = ["again", "hard", "good", "easy"][Number(event.key) - 1];
            rateCard(rating);
        }
    });

    loadStudyVocabulary();
})();
