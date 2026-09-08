(() => {
  const STORAGE = { lang: 'cuu-lang', theme: 'cuu-theme' };
  const supportedLanguages = ['en', 'vi'];
  const supportedThemes = ['light', 'dark', 'system'];

  const translations = {
    en: {
      home: 'Home', topics: 'Topics', articles: 'Articles', archive: 'Archive', tags: 'Tags', about: 'About',
      language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System',
      skip: 'Skip to content', brandLabel: 'Home',
      heroEyebrow: 'A space for ideas', heroTitle: 'Ideas worth<br><em>sharing.</em>',
      heroLead: 'Knowledge, experiments, stories, games and things worth exploring — collected in one place.',
      exploreTopics: 'Explore topics', explore: 'Explore', viewAll: 'View all', featured: 'Featured', selectedReading: 'Selected reading',
      latest: 'Latest', allArticles: 'All articles',
      technology: 'Technology', technologyDesc: 'Software, systems, tools and the ideas behind them.',
      ai: 'AI', aiDesc: 'Artificial intelligence, experiments, workflows and practical lessons.',
      programming: 'Programming', programmingDesc: 'Engineering notes, patterns, architecture and development.',
      games: 'Games', gamesDesc: 'Games worth playing, understanding and talking about.',
      manga: 'Manga & Comics', mangaDesc: 'Stories, recommendations, reviews and collections.',
      novels: 'Novels', novelsDesc: 'Books and stories worth reading and remembering.',
      music: 'Music', musicDesc: 'Albums, artists, discoveries and listening notes.',
      articleTechnology: 'Article · Technology', welcomeTitle: 'Welcome to the archive', welcomeDesc: 'Why this space exists and how the content is organized.',
      footer: 'Ideas worth sharing.'
    },
    vi: {
      home: 'Trang chủ', topics: 'Chủ đề', articles: 'Bài viết', archive: 'Lưu trữ', tags: 'Thẻ', about: 'Giới thiệu',
      language: 'Ngôn ngữ', theme: 'Giao diện', light: 'Sáng', dark: 'Tối', system: 'Theo hệ thống',
      skip: 'Đến nội dung', brandLabel: 'Trang chủ',
      heroEyebrow: 'Một không gian cho ý tưởng', heroTitle: 'Những điều đáng<br><em>chia sẻ.</em>',
      heroLead: 'Kiến thức, thử nghiệm, câu chuyện, trò chơi và những điều đáng khám phá — được tập hợp tại một nơi.',
      exploreTopics: 'Khám phá chủ đề', explore: 'Khám phá', viewAll: 'Xem tất cả', featured: 'Nổi bật', selectedReading: 'Bài đọc chọn lọc',
      latest: 'Mới nhất', allArticles: 'Tất cả bài viết',
      technology: 'Công nghệ', technologyDesc: 'Phần mềm, hệ thống, công cụ và những ý tưởng phía sau chúng.',
      ai: 'AI', aiDesc: 'Trí tuệ nhân tạo, thử nghiệm, quy trình và kinh nghiệm thực tế.',
      programming: 'Lập trình', programmingDesc: 'Ghi chú kỹ thuật, pattern, kiến trúc và phát triển phần mềm.',
      games: 'Trò chơi', gamesDesc: 'Những trò chơi đáng chơi, tìm hiểu và bàn luận.',
      manga: 'Manga & Comics', mangaDesc: 'Câu chuyện, đề xuất, đánh giá và bộ sưu tập.',
      novels: 'Tiểu thuyết', novelsDesc: 'Những cuốn sách và câu chuyện đáng đọc và ghi nhớ.',
      music: 'Âm nhạc', musicDesc: 'Album, nghệ sĩ, khám phá mới và ghi chú nghe nhạc.',
      articleTechnology: 'Bài viết · Công nghệ', welcomeTitle: 'Chào mừng đến với kho lưu trữ', welcomeDesc: 'Lý do không gian này tồn tại và cách nội dung được tổ chức.',
      footer: 'Những điều đáng chia sẻ.'
    }
  };

  const getStored = (key, fallback) => {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  };

  const getLanguage = () => supportedLanguages.includes(getStored(STORAGE.lang, 'en')) ? getStored(STORAGE.lang, 'en') : 'en';
  const getTheme = () => supportedThemes.includes(getStored(STORAGE.theme, 'system')) ? getStored(STORAGE.theme, 'system') : 'system';

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'system' ? '' : theme;
  }

  function applyLanguage(lang) {
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.dataset.i18nAria;
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });
    document.querySelectorAll('[data-lang-option]').forEach((el) => el.toggleAttribute('aria-current', el.dataset.langOption === lang));
  }

  function createControls() {
    const header = document.querySelector('.site-header');
    if (!header || header.querySelector('.site-controls')) return;

    const controls = document.createElement('div');
    controls.className = 'site-controls';
    controls.innerHTML = `
      <div class="control-group" aria-label="Language">
        <button type="button" class="control-button" data-lang-option="en" aria-label="English">EN</button>
        <button type="button" class="control-button" data-lang-option="vi" aria-label="Tiếng Việt">VI</button>
      </div>
      <div class="control-group theme-group" aria-label="Theme">
        <button type="button" class="control-button theme-button" data-theme-option="light" title="Light">☼</button>
        <button type="button" class="control-button theme-button" data-theme-option="system" title="System">◐</button>
        <button type="button" class="control-button theme-button" data-theme-option="dark" title="Dark">◑</button>
      </div>`;

    header.appendChild(controls);
    controls.addEventListener('click', (event) => {
      const lang = event.target.closest('[data-lang-option]')?.dataset.langOption;
      const theme = event.target.closest('[data-theme-option]')?.dataset.themeOption;
      if (lang) { localStorage.setItem(STORAGE.lang, lang); applyLanguage(lang); }
      if (theme) { localStorage.setItem(STORAGE.theme, theme); applyTheme(theme); updateThemeButtons(theme); }
    });
    updateThemeButtons(getTheme());
  }

  function updateThemeButtons(theme) {
    document.querySelectorAll('[data-theme-option]').forEach((button) => {
      button.toggleAttribute('aria-pressed', button.dataset.themeOption === theme);
    });
  }

  function init() {
    applyTheme(getTheme());
    createControls();
    applyLanguage(getLanguage());
    updateThemeButtons(getTheme());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
