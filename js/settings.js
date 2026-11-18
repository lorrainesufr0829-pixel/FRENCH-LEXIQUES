// LEXIQUE appearance and language preferences
(function () {
    const themeSelect = document.getElementById("theme-select");
    const accentSelect = document.getElementById("accent-select");
    const languageSelect = document.getElementById("language-select");

    function applyPreferences() {
        const theme = localStorage.getItem("lexique_theme") || "light";
        const accent = localStorage.getItem("lexique_accent") || "green";
        document.body.dataset.theme = theme;
        document.body.dataset.accent = accent;
        if (themeSelect) themeSelect.value = theme === "dark" ? "Dark" : "Light";
        if (accentSelect) {
            const option = Array.from(accentSelect.options).find(
                item => item.textContent.trim().toLowerCase() === accent
            );
            if (option) accentSelect.value = option.value;
        }
        if (languageSelect && window.lexiqueI18n) {
            languageSelect.value = window.lexiqueI18n.getLanguage();
        }
    }

    applyPreferences();

    themeSelect?.addEventListener("change", () => {
        localStorage.setItem("lexique_theme", themeSelect.value.toLowerCase());
        applyPreferences();
    });

    accentSelect?.addEventListener("change", () => {
        const accent = (accentSelect.selectedOptions[0]?.textContent || "Green").trim().toLowerCase();
        localStorage.setItem("lexique_accent", accent);
        applyPreferences();
    });
})();