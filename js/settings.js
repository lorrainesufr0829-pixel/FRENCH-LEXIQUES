// LEXIQUE appearance preferences
(function () {
    const themeSelect = document.getElementById("theme-select");
    const accentSelect = document.getElementById("accent-select");

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
    }

    applyPreferences();

    themeSelect?.addEventListener("change", () => {
        const theme = themeSelect.value.toLowerCase();
        localStorage.setItem("lexique_theme", theme);
        applyPreferences();
    });

    accentSelect?.addEventListener("change", () => {
        const accent = (accentSelect.selectedOptions[0]?.textContent || "Green").trim().toLowerCase();
        localStorage.setItem("lexique_accent", accent);
        applyPreferences();
    });
})();
