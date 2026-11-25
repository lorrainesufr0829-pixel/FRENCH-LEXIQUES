// LEXIQUE appearance and language preferences
(function () {
    const themeSelect = document.getElementById("theme-select");
    const accentSelect = document.getElementById("accent-select");
    const languageSelect = document.getElementById("language-select");

    // Keep preference values independent from translated option labels.
    const themes = ["light", "dark"];
    const accents = ["green", "blue", "purple", "orange"];

    function applyPreferences() {
        let theme = localStorage.getItem("lexique_theme") || "light";
        let accent = localStorage.getItem("lexique_accent") || "green";

        if (!themes.includes(theme)) theme = "light";
        if (!accents.includes(accent)) accent = "green";

        document.body.dataset.theme = theme;
        document.body.dataset.accent = accent;

        if (themeSelect) {
            themeSelect.selectedIndex = themes.indexOf(theme);
        }
        if (accentSelect) {
            accentSelect.selectedIndex = accents.indexOf(accent);
        }
        if (languageSelect && window.lexiqueI18n) {
            languageSelect.value = window.lexiqueI18n.getLanguage();
        }
    }

    applyPreferences();

    themeSelect?.addEventListener("change", () => {
        const theme = themes[themeSelect.selectedIndex] || "light";
        localStorage.setItem("lexique_theme", theme);
        applyPreferences();
    });

    accentSelect?.addEventListener("change", () => {
        const accent = accents[accentSelect.selectedIndex] || "green";
        localStorage.setItem("lexique_accent", accent);
        applyPreferences();
    });
})();
