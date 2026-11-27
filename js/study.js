// =====================================
// LEXIQUE — Multi-mode study + spaced repetition
// =====================================
(() => {
    const $ = id => document.getElementById(id);
    const setup = $("study-setup");
    const isSessionPage = document.body.dataset.studyPage === "session";
    if (!setup && !isSessionPage) return;

    const categorySelect = $("study-category");
    const countSelect = $("study-count");
    const modeSelect = $("study-mode");
    const focusSelect = $("study-focus");
    const startButton = $("start-study-btn");
    const loadMessage = $("study-load-message");
    let sessionConfig = null;
    try { sessionConfig = JSON.parse(sessionStorage.getItem("lexique_study_session") || "null"); }
    catch (_) { sessionConfig = null; }
    const getMode = () => isSessionPage ? (sessionConfig?.mode || "flashcards") : modeSelect.value;
    const session = $("study-session");
    const complete = $("study-complete");
    const ratingPanel = $("study-rating");
    const ratings = ["again", "hard", "good", "easy"];
    const ratingLabels = { again: "Again", hard: "Hard", good: "Good", easy: "Easy" };

    let vocabulary = [];
    let reviewStates = {};
    let queue = [];
    let currentWord = null;
    let completedCount = 0;
    let sessionTotal = 0;
    let sessionRatings = { again: 0, hard: 0, good: 0, easy: 0 };
    let answerCount = 0;
    let correctCount = 0;
    let startedAt = 0;
    let saving = false;
    let scheduleReady = false;

    const shuffle = items => {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };
    const wordCategories = word => [
        ...(Array.isArray(word.category_names) ? word.category_names : []),
        ...(Array.isArray(word.categories) ? word.categories.map(item => item.name) : []),
        word.category
    ].filter(Boolean).map(String);
    const cleanPronunciationWord = value => String(value ?? "")
        .replace(/[\u00A0\u202F]/g, " ")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .normalize("NFC").trim();
    const normalize = value => String(value || "").trim().toLocaleLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[’']/g, "'").replace(/[^\p{L}\p{N}' -]/gu, "").replace(/\s+/g, " ");

    function getSchedule(word) {
        return reviewStates[word.id] || null;
    }
    function isDue(word) {
        const state = getSchedule(word);
        if (!state) return true;
        return new Date(state.due_at).getTime() <= Date.now();
    }
    function isNew(word) {
        return !getSchedule(word) && !word.last_reviewed_date;
    }
    function isWeak(word) {
        const state = getSchedule(word);
        return state ? Number(state.lapses || 0) > 0 || state.last_rating === "again" || Number(state.ease_factor || 2.5) < 2.1 : false;
    }

    async function loadStudyVocabulary() {
        if (startButton) startButton.disabled = true;
        if (loadMessage) loadMessage.textContent = "Loading your personal vocabulary and review schedule…";
        try {
            vocabulary = (await getVocabulary() || []).filter(word =>
                String(word.word || "").trim() && String(word.meaning || "").trim()
            );
            try {
                reviewStates = await getStudyReviewStates();
                scheduleReady = true;
            } catch (error) {
                scheduleReady = false;
                reviewStates = {};
                console.warn("Spaced repetition schedule unavailable:", error);
                if (loadMessage) loadMessage.textContent = error.message === "STUDY_REVIEW_TABLE_MISSING"
                    ? "Vocabulary loaded. Run the Supabase migration to activate long-term review scheduling."
                    : "Vocabulary loaded, but review schedules could not be retrieved.";
            }
            if (categorySelect) {
                populateCategories();
                if (sessionConfig?.category) categorySelect.value = sessionConfig.category;
                if (sessionConfig?.focus) focusSelect.value = sessionConfig.focus;
                if (sessionConfig?.count) countSelect.value = sessionConfig.count;
                if (sessionConfig?.mode) modeSelect.value = sessionConfig.mode;
            }
            if (loadMessage && scheduleReady) {
                const due = vocabulary.filter(isDue).length;
                loadMessage.textContent = vocabulary.length + " words available · " + due + " due for review";
            } else if (loadMessage && !loadMessage.textContent.startsWith("Vocabulary loaded")) {
                loadMessage.textContent = vocabulary.length + " words available";
            }
        } catch (error) {
            console.error("Study vocabulary loading failed:", error);
            if (loadMessage) loadMessage.textContent = "Unable to load vocabulary. Please refresh and try again.";
        } finally {
            if (startButton) startButton.disabled = vocabulary.length === 0;
        }
    }

    function populateCategories() {
        if (!categorySelect) return;
        const categories = [...new Set(vocabulary.flatMap(wordCategories))].sort((a, b) => a.localeCompare(b));
        const selected = categorySelect.value;
        categorySelect.innerHTML = '<option value="all">All Vocabulary</option>';
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        if (categories.includes(selected)) categorySelect.value = selected;
    }

    function startSession() {
        if (!isSessionPage) {
            sessionConfig = {
                mode: modeSelect.value,
                focus: focusSelect.value,
                category: categorySelect.value,
                count: countSelect.value
            };
            sessionStorage.setItem("lexique_study_session", JSON.stringify(sessionConfig));
            window.location.href = "study-session.html";
            return;
        }
        if (!sessionConfig) {
            window.location.replace("study.html");
            return;
        }
        const category = sessionConfig.category || "all";
        const focus = sessionConfig.focus || "all";
        let filtered = vocabulary.filter(word => category === "all" || wordCategories(word).some(name => name.toLowerCase() === category.toLowerCase()));
        if (focus === "due") filtered = filtered.filter(isDue);
        if (focus === "new") filtered = filtered.filter(isNew);
        if (focus === "weak") filtered = filtered.filter(isWeak);
        if (getMode() === "choice") {
            filtered = filtered.filter(word => String(word.meaning || "").trim());
            const distinctMeanings = new Set(vocabulary.map(word => normalize(word.meaning)).filter(Boolean));
            if (distinctMeanings.size < 2) {
                if (session) session.hidden = true;
                if (loadMessage) {
                    loadMessage.hidden = false;
                    loadMessage.textContent = "Multiple Choice needs at least two vocabulary entries with different saved meanings. Add more words, then try again.";
                }
                return;
            }
        }
        if (getMode() === "listening") {
            const distinctWords = new Set(vocabulary.map(word => normalizeRecallAnswer(word.word)).filter(Boolean));
            if (distinctWords.size < 2) {
                if (session) session.hidden = true;
                if (loadMessage) {
                    loadMessage.hidden = false;
                    loadMessage.textContent = "Listening practice needs at least two different French words in your vocabulary. Add more words, then try again.";
                }
                return;
            }
        }
        if (!filtered.length) {
            if (loadMessage) loadMessage.textContent = "No words match this selection. Return to Study and try another category or study focus.";
            else window.location.replace("study.html");
            return;
        }

        const amount = sessionConfig.count === "all" ? filtered.length : Number(sessionConfig.count || 20);
        queue = shuffle(filtered).slice(0, amount).map(word => ({ word, retries: 0 }));
        sessionTotal = queue.length;
        completedCount = 0;
        answerCount = 0;
        correctCount = 0;
        sessionRatings = { again: 0, hard: 0, good: 0, easy: 0 };
        startedAt = Date.now();

        $("session-category-label").textContent = (category === "all" ? "ALL VOCABULARY" : category.toUpperCase());
        const modeNames = { flashcards: "Flashcards", choice: "Multiple choice", recall: "Active recall", listening: "Listening" };
        $("session-mode-title").textContent = modeNames[getMode()] || "Vocabulary practice";
        if (setup) setup.hidden = true;
        complete.hidden = true;
        session.hidden = false;
        renderCard();
    }

    function renderCard() {
        if (!queue.length) return finishSession();
        currentWord = queue[0].word;
        const mode = getMode();
        ["flashcards", "choice", "recall", "listening"].forEach(name => $("mode-" + name).hidden = name !== mode);
        $("study-word-level").textContent = currentWord.level || (currentWord.level_names || []).join(" · ") || "VOCABULARY";
        $("study-word-category").textContent = wordCategories(currentWord).join(" · ") || "GENERAL";
        ratingPanel.hidden = true;
        ratingPanel.querySelectorAll("button").forEach(button => button.disabled = false);
        if (mode === "flashcards") {
            $("study-word").textContent = currentWord.word;
            $("study-meaning").textContent = currentWord.meaning;
            $("study-card-front").hidden = false;
            $("study-card-back").hidden = true;
            $("reveal-answer-btn").hidden = false;
            $("reveal-answer-btn").setAttribute("aria-expanded", "false");
            $("flashcard-feedback").textContent = "";
            $("flashcard-feedback").className = "study-feedback flashcard-feedback";
        } else if (mode === "choice") {
            $("choice-target-word").textContent = currentWord.word;
            $("choice-feedback").textContent = "";
            renderChoices(mode);
        } else if (mode === "recall") {
            $("recall-meaning").textContent = currentWord.meaning;
            $("study-answer").value = "";
            $("recall-feedback").textContent = "";
            $("recall-feedback").className = "study-feedback recall-feedback";
            $("recall-correct-answer").textContent = "";
            $("recall-correct-answer").hidden = true;
            $("study-answer").disabled = false;
            $("check-answer-btn").disabled = false;
        } else if (mode === "listening") {
            stopListeningAudio();
            $("listening-feedback").textContent = "";
            $("listening-feedback").className = "study-feedback listening-feedback";
            $("listening-correct-answer").textContent = "";
            $("listening-correct-answer").hidden = true;
            $("listening-audio-status").textContent = "Preparing pronunciation…";
            if ($("listening-audio-attribution")) { $("listening-audio-attribution").replaceChildren(); $("listening-audio-attribution").hidden = true; }
            $("study-audio-btn").disabled = true;
            $("study-audio-btn").textContent = "Preparing audio…";
            renderChoices(mode);
            prepareListeningAudio(cleanPronunciationWord(currentWord.word));
        }
        const position = Math.min(completedCount + 1, sessionTotal);
        $("study-progress-label").textContent = position + " / " + sessionTotal;
        $("study-progress-fill").style.width = (completedCount / sessionTotal * 100) + "%";
    }

    function renderChoices(mode) {
        const panel = $(mode === "listening" ? "listening-options" : "choice-options");
        let options;

        if (mode === "choice") {
            // Meaning options must be distinct; duplicate translations make the question ambiguous.
            const seenMeanings = new Set();
            const candidates = shuffle([
                currentWord,
                ...shuffle(vocabulary.filter(word => word.id !== currentWord.id))
            ]).filter(word => {
                const meaning = String(word.meaning || "").trim();
                const key = normalize(meaning);
                if (!meaning || !key || seenMeanings.has(key)) return false;
                seenMeanings.add(key);
                return true;
            });
            const correctOption = candidates.find(word => word.id === currentWord.id);
            options = shuffle([
                ...(correctOption ? [correctOption] : []),
                ...candidates.filter(word => word.id !== currentWord.id).slice(0, 3)
            ]);
        } else {
            // Listening choices are unique French headwords, never translations or duplicate spellings.
            const seenWords = new Set();
            const candidates = shuffle([
                currentWord,
                ...shuffle(vocabulary.filter(word => word.id !== currentWord.id))
            ]).filter(word => {
                const key = normalizeRecallAnswer(word.word);
                if (!key || seenWords.has(key)) return false;
                seenWords.add(key);
                return true;
            });
            const correctOption = candidates.find(word => word.id === currentWord.id);
            options = shuffle([
                ...(correctOption ? [correctOption] : []),
                ...candidates.filter(word => word.id !== currentWord.id).slice(0, 3)
            ]);
        }

        panel.innerHTML = "";
        options.forEach((option, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "study-choice-option";
            button.dataset.correct = String(option.id === currentWord.id);
            button.setAttribute("aria-pressed", "false");

            if (mode === "choice") {
                const letter = document.createElement("span");
                letter.className = "choice-option-letter";
                letter.textContent = String.fromCharCode(65 + index);
                const meaning = document.createElement("span");
                meaning.className = "choice-option-text";
                meaning.textContent = option.meaning;
                button.append(letter, meaning);
            } else {
                button.textContent = option.word;
            }

            button.addEventListener("click", () => {
                if (saving || button.disabled) return;
                const correct = option.id === currentWord.id;
                answerCount++;
                if (correct) correctCount++;
                [...panel.children].forEach(item => {
                    item.disabled = true;
                    item.setAttribute("aria-pressed", String(item === button));
                    if (item.dataset.correct === "true") item.classList.add("is-correct");
                });
                if (!correct) button.classList.add("is-incorrect");

                const feedback = $(mode === "listening" ? "listening-feedback" : "choice-feedback");
                feedback.textContent = mode === "choice"
                    ? (correct ? "Correct — well done." : "Not quite. Correct meaning: " + currentWord.meaning)
                    : (correct ? "Correct — well heard." : "Not quite. The word you heard was " + currentWord.word + ".");
                feedback.className = "study-feedback " + (correct ? "is-correct" : "is-incorrect");

                if (mode === "listening") {
                    $("listening-correct-answer").textContent = currentWord.word + " — " + currentWord.meaning;
                    $("listening-correct-answer").hidden = false;
                    $("study-audio-btn").disabled = false;
                    $("study-audio-btn").textContent = "Replay pronunciation";
                }
                ratingPanel.hidden = false;
            });
            panel.appendChild(button);
        });

        panel.hidden = false;
        if (mode === "choice" && options.length < 2) {
            $("choice-feedback").textContent = "There are not enough distinct meanings in your vocabulary for a multiple-choice question yet.";
            $("choice-feedback").className = "study-feedback is-incorrect";
            panel.hidden = true;
            ratingPanel.hidden = true;
        }
    }

    let listeningAudio = null;
    let listeningAudioWord = "";
    let listeningAudioReady = false;
    let listeningAudioRequest = 0;

    function stopListeningAudio() {
        listeningAudioRequest++;
        if (listeningAudio) {
            listeningAudio.pause();
            listeningAudio.currentTime = 0;
            listeningAudio = null;
        }
        listeningAudioWord = "";
        listeningAudioReady = false;
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }

    function renderAudioAttribution(data) {
        const panel = $("listening-audio-attribution");
        if (!panel) return;
        panel.replaceChildren();
        const source = document.createElement("a");
        source.href = data.sourceUrl;
        source.target = "_blank";
        source.rel = "noopener noreferrer";
        source.textContent = data.source || "Audio source";
        panel.append("Source: ", source);
        if (data.attribution) panel.append(" · " + data.attribution);
        if (data.license) {
            panel.append(" · ");
            if (data.licenseUrl) {
                const license = document.createElement("a");
                license.href = data.licenseUrl;
                license.target = "_blank";
                license.rel = "noopener noreferrer";
                license.textContent = data.license;
                panel.append(license);
            } else {
                panel.append(data.license);
            }
        }
        panel.hidden = false;
    }

    async function prepareListeningAudio(word) {
        const requestId = ++listeningAudioRequest;
        const status = $("listening-audio-status");
        const button = $("study-audio-btn");
        const attribution = $("listening-audio-attribution");
        if (attribution) {
            attribution.replaceChildren();
            attribution.hidden = true;
        }
        button.disabled = true;
        button.textContent = "Preparing audio…";
        status.textContent = "Searching for an existing French pronunciation…";

        try {
            const { data, error } = await supabaseClient.functions.invoke(
                "french-pronunciation",
                { body: { word } }
            );
            if (requestId !== listeningAudioRequest) return;
            if (error) throw error;
            if (!data || typeof data.audioUrl !== "string" || !data.audioUrl) {
                throw new Error(data?.error || "No pronunciation audio is available for this word.");
            }

            renderAudioAttribution(data);
            const audio = new Audio();
            listeningAudio = audio;
            listeningAudioWord = word;
            audio.preload = "auto";
            audio.oncanplay = () => {
                if (requestId !== listeningAudioRequest || listeningAudio !== audio) return;
                listeningAudioReady = true;
                button.disabled = false;
                button.textContent = "Play pronunciation";
                const humanRecording = String(data.source || "").includes("Wiktionnaire");
                status.textContent = humanRecording
                    ? "A recorded human pronunciation is ready. Tap to listen."
                    : "Pronunciation audio is ready. Tap to listen.";
            };
            audio.onended = () => {
                if (requestId !== listeningAudioRequest || listeningAudio !== audio) return;
                status.textContent = "Listen again or choose the word you heard.";
                button.textContent = "Replay pronunciation";
            };
            audio.onerror = () => {
                if (requestId !== listeningAudioRequest || listeningAudio !== audio) return;
                listeningAudioReady = false;
                button.disabled = true;
                status.textContent = "The audio file could not be loaded. Please check the Supabase Storage bucket.";
            };
            audio.src = data.audioUrl;
            audio.load();
        } catch (error) {
            if (requestId !== listeningAudioRequest) return;
            console.error("French pronunciation service unavailable:", error);
            listeningAudioReady = false;
            button.disabled = true;
            button.textContent = "Audio unavailable";
            status.textContent = error?.message || "No French audio could be found for this word.";
        }
    }

    function speakWord() {
        if (!currentWord || getMode() !== "listening") return;
        const word = cleanPronunciationWord(currentWord.word);
        if (!word) return;
        const status = $("listening-audio-status");
        const button = $("study-audio-btn");
        if (!listeningAudio || listeningAudioWord !== word || !listeningAudioReady) {
            status.textContent = "Pronunciation is still loading. Please wait until it is ready.";
            return;
        }
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        try {
            listeningAudio.currentTime = 0;
            const playback = listeningAudio.play();
            button.textContent = "Replay pronunciation";
            if (playback && typeof playback.catch === "function") {
                playback.catch(error => {
                    console.warn("Audio playback was blocked:", error);
                    listeningAudioReady = false;
                    button.disabled = true;
                    status.textContent = "The browser blocked audio playback. Check site sound permissions and try again.";
                });
            }
        } catch (error) {
            console.warn("Audio playback could not start:", error);
            status.textContent = "The browser could not start audio playback. Check site sound permissions.";
        }
    }

    function revealAnswer() {
        if (!currentWord || getMode() !== "flashcards") return;
        $("study-card-back").hidden = false;
        $("reveal-answer-btn").setAttribute("aria-expanded", "true");
        $("reveal-answer-btn").hidden = true;
        ratingPanel.hidden = false;
    }

    function normalizeRecallAnswer(value) {
        return String(value || "").trim().normalize("NFC").toLocaleLowerCase()
            .replace(/[’]/g, "'").replace(/\s+/g, " ");
    }

    function checkRecall() {
        if (!currentWord || saving || $("study-answer").disabled) return;
        const rawAnswer = $("study-answer").value.trim();
        if (!rawAnswer) {
            $("recall-feedback").textContent = "Enter your French answer first.";
            $("study-answer").focus();
            return;
        }
        // Accents are significant in French spelling; only case, apostrophe style and extra spaces are normalized.
        const correct = normalizeRecallAnswer(rawAnswer) === normalizeRecallAnswer(currentWord.word);
        answerCount++;
        if (correct) correctCount++;
        $("study-answer").disabled = true;
        $("check-answer-btn").disabled = true;
        $("recall-feedback").textContent = correct
            ? "Correct — your spelling is right."
            : "Not quite. Your answer: " + rawAnswer;
        $("recall-feedback").className = "study-feedback recall-feedback " + (correct ? "is-correct" : "is-incorrect");
        $("recall-correct-answer").textContent = correct
            ? "✓ " + currentWord.word
            : "Correct spelling: " + currentWord.word;
        $("recall-correct-answer").hidden = false;
        ratingPanel.hidden = false;
    }

    async function rateCard(rating) {
        if (!currentWord || saving || !ratings.includes(rating)) return;
        saving = true;
        const buttons = [...ratingPanel.querySelectorAll("[data-rating]")];
        buttons.forEach(button => button.disabled = true);
        const reviewed = currentWord;
        try {
            if (scheduleReady) {
                const state = await saveSpacedRepetitionReview(reviewed, rating);
                reviewStates[reviewed.id] = state;
            }
            await recordStudyReview(reviewed, rating);
            sessionRatings[rating]++;
            const current = queue.shift();
            if (rating === "again" && current.retries < 1) {
                current.retries++;
                queue.push(current);
            }
            completedCount++;
            currentWord = null;
            if (typeof window.updateProgress === "function") await window.updateProgress();
            renderCard();
        } catch (error) {
            console.error("Unable to save study review:", error);
            const feedbackId = getMode() === "flashcards" ? "flashcard-feedback" : getMode() === "recall" ? "recall-feedback" : getMode() === "listening" ? "listening-feedback" : "choice-feedback";
            $(feedbackId).textContent = error.message === "STUDY_REVIEW_TABLE_MISSING"
                ? "Run the Supabase migration before using long-term review scheduling."
                : "Could not save this review. Check your connection and try again.";
            buttons.forEach(button => button.disabled = false);
        } finally {
            saving = false;
        }
    }

    function finishSession() {
        session.hidden = true;
        complete.hidden = false;
        const total = Object.values(sessionRatings).reduce((sum, value) => sum + value, 0);
        const accuracy = answerCount ? Math.round(correctCount / answerCount * 100) : null;
        const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
        $("study-complete-summary").textContent =
            "Ratings: " + ratings.map(key => ratingLabels[key] + " " + sessionRatings[key]).join(" · ") +
            (scheduleReady ? ". Your next reviews have been scheduled." : ". Run the database migration to save review schedules.");
        $("study-result-accuracy").textContent = accuracy === null ? "—" : accuracy + "%";
        $("study-result-reviewed").textContent = total;
        $("study-result-time").textContent = elapsed + "m";
        $("study-progress-fill").style.width = "100%";
    }

    function exitSession() {
        stopListeningAudio();
        session.hidden = true;
        complete.hidden = true;
        window.location.href = "study.html";
    }

    if (startButton) startButton.addEventListener("click", startSession);
    $("reveal-answer-btn").addEventListener("click", revealAnswer);
    $("study-audio-btn").addEventListener("click", speakWord);
    $("recall-answer-form").addEventListener("submit", event => {
        event.preventDefault();
        checkRecall();
    });
    $("exit-study-btn").addEventListener("click", exitSession);
    $("study-again-btn").addEventListener("click", exitSession);
    ratingPanel.querySelectorAll("[data-rating]").forEach(button => {
        button.addEventListener("click", () => rateCard(button.dataset.rating));
    });

    document.addEventListener("keydown", event => {
        if (session.hidden || event.repeat || event.target.matches("input, textarea, select")) return;
        if (event.code === "Space" && getMode() === "flashcards" && !$("reveal-answer-btn").hidden) {
            event.preventDefault();
            revealAnswer();
        }
        if (!ratingPanel.hidden && ["1", "2", "3", "4"].includes(event.key)) {
            rateCard(ratings[Number(event.key) - 1]);
        }
    });

    loadStudyVocabulary().then(() => {
        if (isSessionPage && vocabulary.length) startSession();
    });
})();
