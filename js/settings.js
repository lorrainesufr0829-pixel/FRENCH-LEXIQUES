// LEXIQUE global appearance and language preferences
(function () {
    const themeSelect = document.getElementById("theme-select");
    const accentSelect = document.getElementById("accent-select");
    const languageSelect = document.getElementById("language-select");
    const englishFontSelect = document.getElementById("english-font-select");
    const frenchFontSelect = document.getElementById("french-font-select");
    const chineseFontSelect = document.getElementById("chinese-font-select");

    const fontOptions = {
        english: ["Inter", "Poppins", "Roboto"],
        french: ["EB Garamond", "Libre Baskerville", "Cormorant Garamond"],
        chinese: ["Noto Sans SC", "Source Han Sans", "LXGW WenKai"]
    };
    const fontStorageKeys = {
        english: "lexique_font_english",
        french: "lexique_font_french",
        chinese: "lexique_font_chinese"
    };
    const fontFamilies = {
        "Inter": 'Inter, "Segoe UI", Arial, sans-serif',
        "Poppins": 'Poppins, "Segoe UI", sans-serif',
        "Roboto": 'Roboto, Arial, sans-serif',
        "EB Garamond": '"EB Garamond", Georgia, serif',
        "Libre Baskerville": '"Libre Baskerville", Georgia, serif',
        "Cormorant Garamond": '"Cormorant Garamond", Georgia, serif',
        "Noto Sans SC": '"Noto Sans SC", "Microsoft YaHei", sans-serif',
        "Source Han Sans": '"Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
        "LXGW WenKai": '"LXGW WenKai", "Kaiti SC", KaiTi, serif'
    };

    function getFont(language) {
        const saved = localStorage.getItem(fontStorageKeys[language]);
        return fontOptions[language].includes(saved) ? saved : fontOptions[language][0];
    }

    function applyFonts() {
        const root = document.documentElement;
        const fonts = {
            english: getFont("english"),
            french: getFont("french"),
            chinese: getFont("chinese")
        };
        root.style.setProperty("--lexique-font-en", fontFamilies[fonts.english]);
        root.style.setProperty("--lexique-font-fr", fontFamilies[fonts.french]);
        root.style.setProperty("--lexique-font-zh", fontFamilies[fonts.chinese]);

        const language = window.lexiqueI18n?.getLanguage?.() || "en";
        const activeFont = language === "zh" ? fonts.chinese : language === "fr" ? fonts.french : fonts.english;
        root.style.setProperty("--lexique-font-current", fontFamilies[activeFont]);
        document.body.dataset.interfaceLanguage = language;

        if (englishFontSelect) englishFontSelect.value = fonts.english;
        if (frenchFontSelect) frenchFontSelect.value = fonts.french;
        if (chineseFontSelect) chineseFontSelect.value = fonts.chinese;
    }

    const palettes = {
        green: {
            accent: "#247a52",
            strong: "#1d6845",
            soft: "#e8f3ec",
            wash: "#f1f7f3"
        },
        blue: {
            accent: "#326da8",
            strong: "#285887",
            soft: "#eaf1f8",
            wash: "#f2f6fb"
        },
        purple: {
            accent: "#7655a6",
            strong: "#604487",
            soft: "#f0ebf6",
            wash: "#f7f4fa"
        },
        orange: {
            accent: "#bd6b2c",
            strong: "#985321",
            soft: "#fbefe5",
            wash: "#fdf7f1"
        }
    };

    const themes = ["light", "dark"];

    function normalize(value, aliases) {
        const key = String(value || "").trim().toLowerCase();
        return aliases[key] || key;
    }

    function getTheme() {
        const aliases = {
            light: "light",
            clair: "light",
            浅色: "light",
            浅色模式: "light",
            dark: "dark",
            sombre: "dark",
            深色: "dark",
            深色模式: "dark"
        };
        const value = normalize(localStorage.getItem("lexique_theme"), aliases);
        return themes.includes(value) ? value : "light";
    }

    function getAccent() {
        const aliases = {
            green: "green",
            vert: "green",
            vert: "green",
            绿色: "green",
            蓝色: "blue",
            blue: "blue",
            bleu: "blue",
            purple: "purple",
            violet: "purple",
            紫色: "purple",
            orange: "orange",
            橙色: "orange"
        };
        const value = normalize(localStorage.getItem("lexique_accent"), aliases);
        return Object.prototype.hasOwnProperty.call(palettes, value) ? value : "green";
    }

    function applyPreferences() {
        const theme = getTheme();
        const accent = getAccent();
        const palette = palettes[accent];
        const root = document.documentElement;
        const body = document.body;

        // Persist canonical values so older translated labels cannot break the theme.
        localStorage.setItem("lexique_theme", theme);
        localStorage.setItem("lexique_accent", accent);

        body.dataset.theme = theme;
        body.dataset.accent = accent;

        // Apply the complete palette directly to the page root. This keeps every
        // page and legacy component in sync even if an older selector overrides
        // a data-attribute rule.
        const variables = {
            "--lexique-accent": palette.accent,
            "--lexique-accent-strong": palette.strong,
            "--lexique-accent-soft": palette.soft,
            "--lexique-accent-wash": palette.wash,
            "--lexique-accent-hover": palette.strong,
            "--lexique-focus-ring": "color-mix(in srgb, " + palette.accent + " 24%, transparent)"
        };

        if (theme === "dark") {
            Object.assign(variables, {
                "--lexique-page": "#151b18",
                "--lexique-surface": "#202923",
                "--lexique-surface-muted": "#252f29",
                "--lexique-text": "#edf3ee",
                "--lexique-muted": "#aab8af",
                "--lexique-border": "#39483f",
                "--lexique-shadow": "0 8px 26px rgba(0, 0, 0, .18)",
                "--lexique-accent-soft": "#293d31",
                "--lexique-accent-wash": "#26362c"
            });
        } else {
            Object.assign(variables, {
                "--lexique-page": "#f4f7f5",
                "--lexique-surface": "#ffffff",
                "--lexique-surface-muted": "#f7faf8",
                "--lexique-text": "#202b25",
                "--lexique-muted": "#68766e",
                "--lexique-border": "#dce6df",
                "--lexique-shadow": "0 8px 26px rgba(28, 58, 40, .055)"
            });
        }

        Object.entries(variables).forEach(([name, value]) => {
            root.style.setProperty(name, value);
        });
        root.style.colorScheme = theme;

        if (themeSelect) {
            themeSelect.selectedIndex = themes.indexOf(theme);
        }
        if (accentSelect) {
            accentSelect.selectedIndex = Object.keys(palettes).indexOf(accent);
        }
        if (languageSelect && window.lexiqueI18n) {
            languageSelect.value = window.lexiqueI18n.getLanguage();
        }
        applyFonts();
    }

    applyPreferences();

    themeSelect?.addEventListener("change", () => {
        const theme = themes[themeSelect.selectedIndex] || "light";
        localStorage.setItem("lexique_theme", theme);
        applyPreferences();
    });

    accentSelect?.addEventListener("change", () => {
        const accent = Object.keys(palettes)[accentSelect.selectedIndex] || "green";
        localStorage.setItem("lexique_accent", accent);
        applyPreferences();
    });

    [
        [englishFontSelect, "english"],
        [frenchFontSelect, "french"],
        [chineseFontSelect, "chinese"]
    ].forEach(([select, language]) => {
        select?.addEventListener("change", () => {
            if (!fontOptions[language].includes(select.value)) return;
            localStorage.setItem(fontStorageKeys[language], select.value);
            applyFonts();
        });
    });

    document.addEventListener("change", event => {
        if (event.target?.id === "language-select") window.setTimeout(applyFonts, 0);
    });
})();
