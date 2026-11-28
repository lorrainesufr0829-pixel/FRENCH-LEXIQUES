/* LEXIQUE — shared, manually curated homepage content.
   Update this file to publish new daily recommendations.
   The word of the day rotates by UTC date, so every visitor sees the same word.
   Add article/audio records when editorial selections are ready; empty slots stay hidden behind a clear status.
*/
(() => {
  "use strict";

  const words = [
    { word:"persévérant", ipa:"/pɛʁ.se.ve.ʁɑ̃/", pos:{en:"adjective",fr:"adjectif",zh:"形容词"},
      meaning:{en:"Showing steady determination despite difficulty.",fr:"Qui continue ses efforts malgré les difficultés.",zh:"坚持不懈的；锲而不舍的"},
      example:"Elle reste persévérante malgré les obstacles.",
      exampleMeaning:{en:"She remains persistent despite the obstacles.",fr:"Elle continue malgré les difficultés.",zh:"尽管困难重重，她依然坚持不懈。"},
      level:"B2",topic:"Personality" },
    { word:"nuancer", ipa:"/ny.ɑ̃.se/", pos:{en:"verb",fr:"verbe",zh:"动词"},
      meaning:{en:"To qualify a statement by adding distinctions or reservations.",fr:"Apporter des distinctions pour rendre une idée moins catégorique.",zh:"使……更有 nuance；对观点作细致区分"},
      example:"Il faut nuancer cette affirmation.",
      exampleMeaning:{en:"This statement needs to be qualified.",fr:"Cette affirmation doit être précisée.",zh:"这一说法需要进一步斟酌。"},
      level:"C1",topic:"Argumentation" },
    { word:"enjeu", ipa:"/ɑ̃.ʒø/", pos:{en:"masculine noun",fr:"nom masculin",zh:"阳性名词"},
      meaning:{en:"A significant issue, stake or challenge at hand.",fr:"Ce qui peut être gagné ou perdu dans une situation.",zh:" enjeux；重大问题；利害关系"},
      example:"L'éducation constitue un enjeu majeur pour la société.",
      exampleMeaning:{en:"Education is a major issue for society.",fr:"L'éducation représente un défi essentiel pour la société.",zh:"教育是社会面临的一项重大议题。"},
      level:"B2",topic:"Society" },
    { word:"incontournable", ipa:"/ɛ̃.kɔ̃.tuʁ.nabl/", pos:{en:"adjective",fr:"adjectif",zh:"形容词"},
      meaning:{en:"Essential; impossible to avoid or overlook.",fr:"Qu'on ne peut éviter ou ignorer.",zh:"不可回避的；必不可少的"},
      example:"La transition écologique est devenue un sujet incontournable.",
      exampleMeaning:{en:"The ecological transition has become an unavoidable topic.",fr:"La transition écologique est désormais un sujet essentiel.",zh:"生态转型已成为一个不可回避的话题。"},
      level:"B2",topic:"Environment" },
    { word:"préconiser", ipa:"/pʁe.kɔ.ni.ze/", pos:{en:"verb",fr:"verbe",zh:"动词"},
      meaning:{en:"To recommend or advocate a particular measure.",fr:"Recommander une mesure ou une solution.",zh:"建议；主张；推荐采取某项措施"},
      example:"Le rapport préconise une réforme en profondeur.",
      exampleMeaning:{en:"The report recommends a far-reaching reform.",fr:"Le rapport recommande une réforme importante.",zh:"报告建议进行一场深层次改革。"},
      level:"C1",topic:"Public policy" },
    { word:"déceler", ipa:"/de.slə/", pos:{en:"verb",fr:"verbe",zh:"动词"},
      meaning:{en:"To detect or identify something not immediately obvious.",fr:"Découvrir quelque chose de difficile à percevoir.",zh:"察觉；发现（不易察觉的事物）"},
      example:"Les chercheurs ont décelé une tendance préoccupante.",
      exampleMeaning:{en:"Researchers detected a worrying trend.",fr:"Les chercheurs ont découvert une tendance inquiétante.",zh:"研究人员发现了一种令人担忧的趋势。"},
      level:"C1",topic:"Analysis" },
    { word:"aboutir", ipa:"/a.bu.tiʁ/", pos:{en:"verb",fr:"verbe",zh:"动词"},
      meaning:{en:"To lead to a result; to reach a successful conclusion.",fr:"Arriver à un résultat ou parvenir au terme d'un processus.",zh:"取得结果；达成；最终导致"},
      example:"Les négociations ont finalement abouti à un accord.",
      exampleMeaning:{en:"The negotiations eventually resulted in an agreement.",fr:"Les négociations ont finalement donné lieu à un accord.",zh:"谈判最终达成了一项协议。"},
      level:"B2",topic:"Current affairs" }
  ];

  // Editorially selected records. Keep the original source URL and publication date with every item.
  const article = null;
  const listening = null;

  const copy = {
    en:{
      wordTitle:"Daily Featured Word",readingTitle:"Daily Reading",listeningTitle:"Daily Listening",
      wordIntro:"A shared word selection for all LEXIQUE learners.",
      pronunciation:"Pronunciation",meaning:"Meaning",example:"Example",translation:"Translation",
      level:"LEVEL",topic:"THEME",play:"Play pronunciation",add:"Add to my library",
      readingIntro:"An editor-selected France 24 article for B2–C1 learners.",
      listeningIntro:"An editor-selected RFI audio resource for B2–C1 learners.",
      preparing:"The next editorial selection is being prepared.",
      openArticle:"Read the article",listen:"Listen",transcript:"Read transcript",
      source:"SOURCE",published:"PUBLISHED",duration:"DURATION",empty:"No selection published yet."
    },
    fr:{
      wordTitle:"Mot du jour",readingTitle:"Lecture du jour",listeningTitle:"Écoute du jour",
      wordIntro:"Un mot commun à tous les apprenants de LEXIQUE.",
      pronunciation:"Prononciation",meaning:"Sens",example:"Exemple",translation:"Traduction",
      level:"NIVEAU",topic:"THÈME",play:"Écouter la prononciation",add:"Ajouter à ma bibliothèque",
      readingIntro:"Un article de France 24 sélectionné pour les niveaux B2–C1.",
      listeningIntro:"Une ressource audio de RFI sélectionnée pour les niveaux B2–C1.",
      preparing:"La prochaine sélection éditoriale est en préparation.",
      openArticle:"Lire l'article",listen:"Écouter",transcript:"Lire la transcription",
      source:"SOURCE",published:"DATE",duration:"DURÉE",empty:"Aucune sélection n'a encore été publiée."
    },
    zh:{
      wordTitle:"每日精选词汇",readingTitle:"每日阅读",listeningTitle:"每日听力",
      wordIntro:"LEXIQUE 全体学习者共享的每日精选词汇。",
      pronunciation:"音标",meaning:"释义",example:"例句",translation:"例句翻译",
      level:"难度",topic:"主题",play:"播放发音",add:"加入我的词库",
      readingIntro:"人工精选的 France 24 文章，适合 B2–C1 学习者。",
      listeningIntro:"人工精选的 RFI 听力材料，适合 B2–C1 学习者。",
      preparing:"下一期人工精选内容正在准备中。",
      openArticle:"阅读原文",listen:"播放音频",transcript:"查看文字稿",
      source:"内容来源",published:"发布日期",duration:"时长",empty:"暂未发布本期精选内容。"
    }
  };

  const lang = () => ["en","fr","zh"].includes(window.lexiqueI18n?.getLanguage?.()) ? window.lexiqueI18n.getLanguage() : "en";
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const dateIndex = () => {
    const date = new Date();
    const start = Date.UTC(date.getUTCFullYear(),0,0);
    const day = Math.floor((Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())-start)/86400000);
    return day % words.length;
  };

  function renderWord(language) {
    const item = words[dateIndex()];
    const t = copy[language];
    const root = document.getElementById("daily-featured-word");
    if (!root) return;
    root.innerHTML = `
      <div class="daily-word-topline"><span class="daily-pill">${escapeHtml(item.level)}</span><span class="daily-topic">${escapeHtml(item.topic)}</span></div>
      <h3 lang="fr">${escapeHtml(item.word)}</h3>
      <p class="daily-ipa">${escapeHtml(item.ipa)} <span>·</span> ${escapeHtml(item.pos[language])}</p>
      <div class="daily-word-detail"><span class="daily-field-label">${t.meaning}</span><p>${escapeHtml(item.meaning[language])}</p></div>
      <div class="daily-word-example"><span class="daily-field-label">${t.example}</span><p lang="fr">${escapeHtml(item.example)}</p><p class="daily-example-translation">${escapeHtml(item.exampleMeaning[language])}</p></div>
      <div class="daily-card-actions"><button type="button" class="daily-text-button" data-speak-word="${escapeHtml(item.word)}">${t.play}</button></div>`;
    const speak = root.querySelector("[data-speak-word]");
    speak?.addEventListener("click", () => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.word);
      utterance.lang = "fr-FR";
      window.speechSynthesis.speak(utterance);
    });
  }

  function renderEditorial(rootId, item, type, language) {
    const root = document.getElementById(rootId);
    if (!root) return;
    const t = copy[language];
    const isArticle = type === "article";
    const title = isArticle ? t.readingTitle : t.listeningTitle;
    const intro = isArticle ? t.readingIntro : t.listeningIntro;
    const source = isArticle ? "FRANCE 24 · FRANÇAIS" : "RFI · PODCASTS";
    const action = isArticle ? t.openArticle : t.listen;
    if (!item) {
      root.innerHTML = `<p class="daily-content-source">${source}</p><h3>${title}</h3><p class="daily-content-description">${intro}</p><p class="daily-content-status">${t.preparing}</p>`;
      return;
    }
    const summary = item.summary?.[language] || item.summary?.en || "";
    const links = isArticle
      ? `<a class="daily-action-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${action}</a>`
      : `<audio controls preload="none" src="${escapeHtml(item.audioUrl)}"></audio><div class="daily-card-actions">${item.transcriptUrl ? `<a class="daily-action-link secondary" href="${escapeHtml(item.transcriptUrl)}" target="_blank" rel="noopener noreferrer">${t.transcript}</a>` : ""}</div>`;
    root.innerHTML = `<p class="daily-content-source">${source}</p><p class="daily-editorial-meta">${escapeHtml(item.level || "B2–C1")} · ${escapeHtml(item.publishedAt || "")}${item.duration ? " · "+escapeHtml(item.duration) : ""}</p><h3>${escapeHtml(item.title?.[language] || item.title?.fr || "")}</h3><p class="daily-content-description">${escapeHtml(summary)}</p>${links}`;
  }

  function render() {
    const language = lang();
    renderWord(language);
    renderEditorial("daily-reading-entry", article, "article", language);
    renderEditorial("daily-listening-entry", listening, "listening", language);
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("change", event => {
    if (event.target?.id === "language-select") setTimeout(render, 0);
  });
  // i18n can initialize after this file; render once more when its API is ready.
  render();
})();
