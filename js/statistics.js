// =====================================
// LEXIQUE — Live learning statistics
// =====================================
document.addEventListener("DOMContentLoaded", loadStatistics);

async function loadStatistics() {
    const message = document.getElementById("statistics-message");
    try {
        const [words, progress] = await Promise.all([getVocabulary(), getUserProgress()]);
        const vocabulary = Array.isArray(words) ? words : [];
        const mastered = vocabulary.filter(word => word.is_mastered === true).length;
        const goal = 3000;
        const percent = Math.min(100, Math.round(mastered / goal * 100));

        setStat("stat-total-vocabulary", vocabulary.length.toLocaleString());
        setStat("stat-mastered-words", mastered.toLocaleString());
        setStat("stat-goal-percent", percent + "%");
        setStat("stat-goal-count", mastered.toLocaleString());
        const fill = document.getElementById("stat-goal-fill");
        if (fill) fill.style.width = percent + "%";

        const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
        const levelCounts = {};
        levels.forEach(level => levelCounts[level] = 0);
        vocabulary.forEach(word => {
            const level = String(word.level || "").trim().toUpperCase();
            if (Object.prototype.hasOwnProperty.call(levelCounts, level)) levelCounts[level]++;
        });
        renderBreakdown("statistics-level-distribution", levelCounts, vocabulary.length);

        const categoryCounts = {};
        vocabulary.forEach(word => {
            const category = String(word.category || "Uncategorized").trim() || "Uncategorized";
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        renderBreakdown("statistics-category-distribution", categoryCounts, vocabulary.length);

        const reviewed = Number(progress?.reviewed_today || 0);
        const learned = Number(progress?.learned_today || 0);
        const streak = Number(progress?.streak || 0);
        setStat("stat-reviewed-today", reviewed.toLocaleString());
        setStat("stat-mastered-today", learned.toLocaleString());
        setStat("stat-current-streak", streak + (streak === 1 ? " day" : " days"));
    } catch (error) {
        console.error("Statistics loading failed:", error);
        if (message) message.textContent = "Statistics could not be loaded. Please refresh the page.";
    }
}

function setStat(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function renderBreakdown(containerId, counts, total) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!entries.length || total === 0) {
        container.innerHTML = '<p class="statistics-empty">No vocabulary recorded yet.</p>';
        return;
    }
    container.innerHTML = entries.map(([label, count]) => {
        const percentage = total ? Math.round(count / total * 100) : 0;
        return '<div class="statistics-breakdown-row">' +
            '<div class="statistics-breakdown-label"><span></span><strong>' +
            escapeStatisticsText(label) + '</strong><b>' + count + '</b></div>' +
            '<div class="statistics-breakdown-track"><i style="width:' + percentage + '%"></i></div>' +
            '</div>';
    }).join("");
}

function escapeStatisticsText(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
}
