// LEXIQUE interface language controller
(() => {
  const dictionaries = {
    zh: {
      "French Vocabulary Learning Platform":"法语词汇学习平台",
      "Words Learned":"已掌握词汇","Today's Review":"今日复习","Memory Streak":"连续学习","Level":"学习等级",
      "HOME":"首页","LIBRARY":"词库","STUDY":"学习","IMPORT":"导入","STATISTICS":"学习统计","SETTINGS":"设置",
      "Today's Featured Word":"今日精选词汇","Category:":"分类：",
      "Settings":"设置","Appearance":"外观","Language":"语言","Display":"显示","Learning":"学习",
      "Synchronization":"数据同步","Library":"词库","About":"关于","Theme":"主题","Light":"浅色","Dark":"深色",
      "Accent Color":"主题颜色","Green":"绿色","Blue":"蓝色","Purple":"紫色","Orange":"橙色",
      "English Font":"英文字体","French Font":"法文字体","Chinese Font":"中文字体",
      "Interface Language":"界面语言","English":"English","Français":"Français","中文":"简体中文",
      "Show IPA":"显示国际音标","Show Part of Speech":"显示词性","Show Example Sentence":"显示例句",
      "Card Density":"卡片密度","Comfortable":"舒适","Compact":"紧凑","Daily Goal":"每日目标",
      "Review Reminder":"复习提醒","On":"开启","Off":"关闭","Review Order":"复习顺序",
      "Newest First":"最新优先","Oldest First":"最早优先","Random":"随机",
      "Cloud Status":"云端状态","Connected":"已连接","Last Sync":"上次同步","Sync Now":"立即同步",
      "Import Vocabulary":"导入词汇","Export Vocabulary":"导出词汇","Download Backup":"下载备份",
      "Version":"版本","Vocabulary":"词汇量","Platform":"平台","Developer":"开发者",
      "Learning Statistics":"学习统计","YOUR LEARNING OVERVIEW":"学习概览","A clear view of your vocabulary progress.":"清晰了解你的词汇学习进度。",
      "Total Vocabulary":"词汇总量","Words Mastered":"已掌握词汇","Mastery Progress":"掌握进度",
      "Words stored in your Library":"词库中保存的单词","Words rated Easy at least once":"至少被标记为 Easy 一次的单词",
      "YOUR COLLECTION":"你的词库","Vocabulary Distribution":"词汇分布","Based on your Library":"根据你的词库统计",
      "By Level":"按等级","By Category":"按分类","DAILY PRACTICE":"每日练习","Learning Activity":"学习活动",
      "Reviewed Today":"今日复习","Mastered Today":"今日掌握","Current Streak":"连续学习",
      "Unique words reviewed today":"今日复习的不重复单词","New words marked as mastered":"今日新标记为掌握的单词",
      "Consecutive days of learning":"连续学习天数","No vocabulary recorded yet.":"尚未记录词汇。",
      "Statistics could not be loaded. Please refresh the page.":"无法加载统计数据，请刷新页面。",
      "YOUR DAILY PRACTICE":"每日练习","Build lasting vocabulary, one word at a time.":"每天积累词汇，稳步提升。",
      "Ready to study?":"准备好开始学习了吗？","Choose a collection and set the length of your session.":"选择词汇分类并设置本次学习数量。",
      "Collection":"词汇分类","All Vocabulary":"全部词汇","Words per session":"本次学习数量",
      "10 words":"10 个单词","20 words":"20 个单词","All available words":"全部可用单词",
      "Start studying":"开始学习","Loading your vocabulary…":"正在加载词汇…",
      "No vocabulary yet. Add words in Import to begin.":"词库为空，请先前往导入页面添加词汇。",
      "Unable to load vocabulary. Please refresh and try again.":"无法加载词汇，请刷新页面重试。",
      "STUDY":"学习","Flashcards":"单词卡","Exit session":"退出本次学习","FRENCH WORD":"法语单词",
      "Reveal meaning":"显示释义","MEANING":"释义","How well did you remember this word?":"你对这个单词的记忆程度如何？",
      "Again":"重学","Hard":"困难","Good":"良好","Easy":"简单","Your rating guides the next card in this session.":"你的评价将用于安排本次学习。",
      "SESSION COMPLETE":"本次学习完成","Well done.":"做得好！","Study again":"再次学习",
      "Import and organize your vocabulary database.":"导入并整理你的词汇库。",
      "Add New Vocabulary":"添加新词汇","Create a new vocabulary entry manually.":"手动创建一条词汇记录。",
      "Word":"单词","Meaning":"释义","Select Category":"选择分类","Select Level":"选择等级","+ Add Word":"添加单词",
      "Upload Vocabulary File":"上传词汇文件","Upload your vocabulary list to add new words into LEXIQUE.":"上传词汇表，将新单词添加到 LEXIQUE。",
      "+ Choose Vocabulary File":"选择词汇文件","Supported formats:":"支持的格式：","Required Data Format":"所需数据格式",
      "Your file should include the following fields:":"文件应包含以下字段：","Import History":"导入历史","No recent imports.":"暂无导入记录。",
      "Search vocabulary...":"搜索词汇…","Vocabulary List":"词汇列表","All Vocabulary":"全部词汇",
      "Business French":"商务法语","Legal French":"法律法语","Daily French":"日常法语",
      "Unable to load vocabulary. Please refresh and try again.":"无法加载词汇，请刷新页面重试。",
      "No words found in this category.":"此分类下没有单词。",
      "DAILY TARGET":"每日目标","Daily Learning Goal":"每日学习目标","Daily learning goal progress":"每日学习目标进度",
      "WORDS":"个单词","Words":"个单词","completed":"已完成","% completed":"% 已完成",
      "READING PRACTICE":"阅读练习","Daily Reading":"每日阅读","One carefully selected article from France 24, chosen for B2–C1 learners.":"精选一篇适合 B2–C1 学习者的 France 24 文章。",
      "Today's article will appear here":"今日文章将在此显示","A daily selection focused on society, politics, education and international affairs.":"每日精选内容聚焦社会、政治、教育与国际事务。",
      "Daily article selection is being prepared.":"今日文章正在准备中。",
      "LISTENING PRACTICE":"听力练习","Daily Listening":"每日听力","A selected RFI podcast episode, preferably with a French transcript.":"精选一期 RFI 播客，优先选择附有法语文本的节目。",
      "Today's listening episode will appear here":"今日听力节目将在此显示","Selections will prioritize B2–C1 topics and episodes with an accompanying transcript.":"优先选择适合 B2–C1 水平且附有文字稿的节目。",
      "Daily podcast selection is being prepared.":"今日播客正在准备中。",
      "All Vocabulary":"全部词汇","Vocabulary":"词汇","Search vocabulary...":"搜索词汇…","Search vocabulary…":"搜索词汇…",
      "Words":"个单词","No words match your search in this category.":"此分类中没有符合搜索条件的单词。",
      "There are no words in this category yet.":"此分类下暂时没有单词。",
      "Loading vocabulary…":"正在加载词汇…","No vocabulary recorded yet.":"尚未记录词汇。",
      "Unable to load vocabulary. Please refresh the page.":"无法加载词汇，请刷新页面。",
      "No vocabulary is available for study.":"目前没有可供学习的词汇。",
      "There are no words in this collection yet.":"此词汇分类下暂时没有单词。",
      "Your review could not be synced. Please try again.":"复习记录同步失败，请重试。",
      "Your review was not saved. Please check your connection and try again.":"复习记录未能保存，请检查网络连接后重试。",
      "You reviewed ":"你本次复习了 "," cards. ":" 张卡片。"," again · ":" 个重学 · "," hard · ":" 个困难 · "," good · ":" 个良好 · "," easy.":" 个简单。",
      "ALL VOCABULARY":"全部词汇","VOCABULARY":"词汇","GENERAL":"通用",
      "CURRENT LEARNING PATH":"当前学习路径","French proficiency goal":"法语能力目标",
      "Words stored in your Library":"词库中保存的单词数量","Words rated Easy at least once":"至少被标记为“简单”一次的单词数量",
      "Unique words reviewed today":"今日复习的不重复单词数","New words marked as mastered":"今日新标记为已掌握的单词数",
      "Consecutive days of learning":"连续学习天数","0 days":"0 天","1 day":"1 天"," days":" 天"," day":" 天",
      "0 Days":"0 天"," Days":" 天"," Words":" 个单词",
      "Ready to study?":"准备好开始学习了吗？","Choose a collection and set the length of your session.":"选择词汇分类并设置本次学习数量。",
      "Collection":"词汇分类","Words per session":"本次学习数量","Start studying":"开始学习",
      "Flashcards":"单词卡","Exit session":"退出本次学习","FRENCH WORD":"法语单词","Reveal meaning":"显示释义","MEANING":"释义",
      "How well did you remember this word?":"你对这个单词的记忆程度如何？","Again":"重学","Hard":"困难","Good":"良好","Easy":"简单",
      "Your rating guides the next card in this session.":"你的评价将用于安排本次学习。","SESSION COMPLETE":"本次学习完成","Well done.":"做得好！","Study again":"再次学习",
      "Import and organize your vocabulary database.":"导入并整理你的词汇库。",
      "Add New Vocabulary":"添加新词汇","Create a new vocabulary entry manually.":"手动创建一条词汇记录。",
      "Word":"单词","Meaning":"释义","Select Category":"选择分类","Select Level":"选择等级","+ Add Word":"添加单词",
      "Upload Vocabulary File":"上传词汇文件","Upload your vocabulary list to add new words into LEXIQUE.":"上传词汇表，将新单词添加到 LEXIQUE。",
      "+ Choose Vocabulary File":"选择词汇文件","Supported formats:":"支持的文件格式：","Required Data Format":"所需数据格式",
      "Your file should include the following fields:":"文件应包含以下字段：","Import History":"导入历史","No recent imports.":"暂无导入记录。",
      "YOUR LEARNING OVERVIEW":"学习概览","A clear view of your vocabulary progress.":"清晰了解你的词汇学习进度。",
      "Total Vocabulary":"词汇总量","Words Mastered":"已掌握词汇","Mastery Progress":"掌握进度",
      "YOUR COLLECTION":"你的词库","Vocabulary Distribution":"词汇分布","Based on your Library":"根据你的词库统计",
      "By Level":"按等级","By Category":"按分类","DAILY PRACTICE":"每日练习","Learning Activity":"学习活动",
      "Reviewed Today":"今日复习","Mastered Today":"今日掌握","Current Streak":"连续学习",
      "Statistics could not be loaded. Please refresh the page.":"无法加载学习统计，请刷新页面。",
      "Settings":"设置","Appearance":"外观","Language":"语言","Display":"显示","Learning":"学习",
      "Synchronization":"数据同步","Library":"词库","About":"关于","Theme":"主题","Light":"浅色","Dark":"深色",
      "Accent Color":"主题颜色","Green":"绿色","Blue":"蓝色","Purple":"紫色","Orange":"橙色",
      "English Font":"英文字体","French Font":"法文字体","Chinese Font":"中文字体",
      "Interface Language":"界面语言","Show IPA":"显示国际音标","Show Part of Speech":"显示词性","Show Example Sentence":"显示例句",
      "Card Density":"卡片密度","Comfortable":"舒适","Compact":"紧凑","Daily Goal":"每日目标",
      "Review Reminder":"复习提醒","On":"开启","Off":"关闭","Review Order":"复习顺序",
      "Newest First":"最新优先","Oldest First":"最早优先","Random":"随机",
      "Cloud Status":"云端状态","Connected":"已连接","Last Sync":"上次同步","Sync Now":"立即同步",
      "Import Vocabulary":"导入词汇","Export Vocabulary":"导出词汇","Download Backup":"下载备份",
      "Version":"版本","Platform":"平台","Developer":"开发者","Account":"账户",
      "Welcome to LEXIQUE":"欢迎使用 LEXIQUE","Sign in to access your personal vocabulary library and learning progress.":"登录以访问个人词库和学习进度。",
      "Log in":"登录","Sign up":"注册","Email":"电子邮箱","Password":"密码","Create account":"创建账户",
      "Forgot password?":"忘记密码？","Back to Home":"返回首页","Signing in...":"正在登录…",
      "Login successful. Redirecting...":"登录成功，正在跳转…","Creating your account...":"正在创建账户…",
      "Account created. Redirecting...":"账户创建成功，正在跳转…",
      "Account created. Please check your email and confirm your address before logging in.":"账户已创建。请检查邮箱并完成验证后再登录。",
      "Enter your email address first, then select Forgot password.":"请先输入电子邮箱，再点击“忘记密码”。",
      "Sending password reset email...":"正在发送密码重置邮件…",
      "If an account exists for this address, a password reset email has been sent.":"如果该邮箱对应的账户存在，密码重置邮件已发送。",
      "LOG IN / SIGN UP":"登录 / 注册","SIGNED IN":"已登录","LOG OUT":"退出登录","LOGGING OUT…":"正在退出…","Signed in":"已登录",
      "新增 ":"新增 "," 个单词":" 个单词","已有单词 ":"已有单词 ","添加分类关联 ":"添加分类关联 ",
      "导入完成：":"导入完成：","导入失败，请确认文件格式、登录状态及 Supabase 数据库权限。":"导入失败，请确认文件格式、登录状态及数据库权限。"
    },
    fr: {
      "French Vocabulary Learning Platform":"Plateforme d’apprentissage du vocabulaire français",
      "Words Learned":"Mots maîtrisés","Today's Review":"Révisions du jour","Memory Streak":"Série d’apprentissage","Level":"Niveau",
      "HOME":"ACCUEIL","LIBRARY":"LEXIQUE","STUDY":"APPRENTISSAGE","IMPORT":"IMPORTER","STATISTICS":"STATISTIQUES","SETTINGS":"PARAMÈTRES",
      "Today's Featured Word":"Mot du jour","Settings":"Paramètres","Appearance":"Apparence","Language":"Langue","Display":"Affichage",
      "Learning":"Apprentissage","Synchronization":"Synchronisation","Library":"Lexique","About":"À propos",
      "Theme":"Thème","Light":"Clair","Dark":"Sombre","Accent Color":"Couleur d’accentuation",
      "English Font":"Police anglaise","French Font":"Police française","Chinese Font":"Police chinoise",
      "Interface Language":"Langue de l’interface","Show IPA":"Afficher l’API","Show Part of Speech":"Afficher la catégorie grammaticale",
      "Show Example Sentence":"Afficher les exemples","Card Density":"Densité des cartes","Comfortable":"Aérée","Compact":"Compacte",
      "Daily Goal":"Objectif quotidien","Review Reminder":"Rappel de révision","On":"Activé","Off":"Désactivé",
      "Review Order":"Ordre de révision","Newest First":"Les plus récents d’abord","Oldest First":"Les plus anciens d’abord","Random":"Aléatoire",
      "Cloud Status":"État du cloud","Connected":"Connecté","Last Sync":"Dernière synchronisation","Sync Now":"Synchroniser",
      "Import Vocabulary":"Importer du vocabulaire","Export Vocabulary":"Exporter le vocabulaire","Download Backup":"Télécharger une sauvegarde",
      "Version":"Version","Vocabulary":"Vocabulaire","Platform":"Plateforme","Developer":"Développeur",
      "Learning Statistics":"Statistiques d’apprentissage","YOUR LEARNING OVERVIEW":"VUE D’ENSEMBLE","A clear view of your vocabulary progress.":"Suivez clairement votre progression en vocabulaire.",
      "Total Vocabulary":"Vocabulaire total","Words Mastered":"Mots maîtrisés","Mastery Progress":"Progression de la maîtrise",
      "Words stored in your Library":"Mots enregistrés dans votre lexique","Words rated Easy at least once":"Mots évalués « Facile » au moins une fois",
      "YOUR COLLECTION":"VOTRE COLLECTION","Vocabulary Distribution":"Répartition du vocabulaire","Based on your Library":"Selon votre lexique",
      "By Level":"Par niveau","By Category":"Par catégorie","DAILY PRACTICE":"PRATIQUE QUOTIDIENNE","Learning Activity":"Activité d’apprentissage",
      "Reviewed Today":"Révisés aujourd’hui","Mastered Today":"Maîtrisés aujourd’hui","Current Streak":"Série actuelle",
      "No vocabulary recorded yet.":"Aucun vocabulaire enregistré pour le moment.",
      "YOUR DAILY PRACTICE":"VOTRE PRATIQUE QUOTIDIENNE","Build lasting vocabulary, one word at a time.":"Enrichissez durablement votre vocabulaire, un mot à la fois.",
      "Ready to study?":"Prêt à commencer ?","Choose a collection and set the length of your session.":"Choisissez une collection et la durée de votre séance.",
      "Collection":"Collection","All Vocabulary":"Tout le vocabulaire","Words per session":"Mots par séance",
      "10 words":"10 mots","20 words":"20 mots","All available words":"Tous les mots disponibles",
      "Start studying":"Commencer","Loading your vocabulary…":"Chargement du vocabulaire…",
      "No vocabulary yet. Add words in Import to begin.":"Aucun mot pour le moment. Ajoutez-en dans Importer pour commencer.",
      "Unable to load vocabulary. Please refresh and try again.":"Impossible de charger le vocabulaire. Actualisez la page et réessayez.",
      "Flashcards":"Cartes mémoire","Exit session":"Quitter la séance","FRENCH WORD":"MOT FRANÇAIS",
      "Reveal meaning":"Afficher le sens","MEANING":"SIGNIFICATION","How well did you remember this word?":"Dans quelle mesure avez-vous mémorisé ce mot ?",
      "Again":"À revoir","Hard":"Difficile","Good":"Bien","Easy":"Facile","Your rating guides the next card in this session.":"Votre évaluation détermine la suite de cette séance.",
      "SESSION COMPLETE":"SÉANCE TERMINÉE","Well done.":"Bravo !","Study again":"Recommencer",
      "Import and organize your vocabulary database.":"Importez et organisez votre base de vocabulaire.",
      "Add New Vocabulary":"Ajouter du vocabulaire","Create a new vocabulary entry manually.":"Créer manuellement une entrée de vocabulaire.",
      "Word":"Mot","Meaning":"Signification","Select Category":"Choisir une catégorie","Select Level":"Choisir un niveau","+ Add Word":"Ajouter le mot",
      "Upload Vocabulary File":"Importer un fichier de vocabulaire","Upload your vocabulary list to add new words into LEXIQUE.":"Importez votre liste pour ajouter des mots dans LEXIQUE.",
      "+ Choose Vocabulary File":"Choisir un fichier","Required Data Format":"Format des données requis",
      "Your file should include the following fields:":"Votre fichier doit contenir les champs suivants :","Import History":"Historique des imports",
      "No recent imports.":"Aucun import récent.","Search vocabulary...":"Rechercher un mot…","Vocabulary List":"Liste de vocabulaire",
      "Business French":"Français des affaires","Legal French":"Français juridique","Daily French":"Français courant"
    }
  };

  const storageKey = "lexique_language";
  const current = () => localStorage.getItem(storageKey) || "en";
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  function translateNode(node, language) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (parent?.closest('[data-no-translate], .word-info, #study-word, #study-meaning, .daily-content-entry h3, .daily-content-entry a')) return;

    const currentValue = node.nodeValue;
    if (!originalText.has(node)) originalText.set(node, currentValue);
    let original = originalText.get(node);
    const originalTrimmed = original.trim();
    const isExistingTranslation = Object.values(dictionaries).some(
      dict => dict && dict[originalTrimmed] === currentValue.trim()
    );

    // Detect text replaced by dynamic UI scripts, while preserving the source
    // text when switching between English, French and Chinese.
    if (currentValue.trim() && currentValue.trim() !== originalTrimmed && !isExistingTranslation) {
      original = currentValue;
      originalText.set(node, original);
    }

    const trimmed = original.trim();
    if (!trimmed) return;
    const translated = dictionaries[language]?.[trimmed] || trimmed;
    node.nodeValue = original.replace(trimmed, translated);
  }
  function translateTree(root, language) {
    if (root.nodeType === Node.TEXT_NODE) { translateNode(root, language); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document) return;
    root.childNodes.forEach(child => translateTree(child, language));
    if (root.nodeType === Node.ELEMENT_NODE) {
      ["placeholder", "aria-label", "title"].forEach(attr => {
        if (!originalAttributes.has(root)) originalAttributes.set(root, {});
        const saved = originalAttributes.get(root);
        if (root.hasAttribute(attr) && saved[attr] === undefined) saved[attr] = root.getAttribute(attr);
        if (saved[attr] !== undefined) {
          const value = saved[attr];
          root.setAttribute(attr, dictionaries[language]?.[value] || value);
        }
      });
    }
  }
  function applyLanguage(language = current()) {
    const lang = ["en", "fr", "zh"].includes(language) ? language : "en";
    localStorage.setItem(storageKey, lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    translateTree(document.body, lang);
    const selector = document.getElementById("language-select");
    if (selector) selector.value = lang;
  }
  window.lexiqueI18n = { applyLanguage, getLanguage: current };
  applyLanguage();
  document.addEventListener("change", event => {
    if (event.target && event.target.id === "language-select") applyLanguage(event.target.value);
  });
  const observer = new MutationObserver(records => {
    for (const record of records) {
      record.addedNodes.forEach(node => translateTree(node, current()));
    }
  });
  observer.observe(document.body, { childList: true, characterData: true, subtree: true });
})();