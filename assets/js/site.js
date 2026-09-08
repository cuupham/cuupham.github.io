(() => {
  const STORAGE = Object.freeze({ lang: 'cuu-lang', theme: 'cuu-theme' });
  const supportedLanguages = Object.freeze(['en', 'vi']);
  const supportedThemes = Object.freeze(['light', 'dark', 'system']);

  const translations = {
    en: {
      home: 'Home', topics: 'Topics', articles: 'Articles', archive: 'Archive', tags: 'Tags', about: 'About', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System',
      skip: 'Skip to content', brandLabel: 'Home', heroEyebrow: 'A space for ideas', heroTitle: 'Ideas worth<br><em>sharing.</em>', heroLead: 'Knowledge, experiments, stories, games and things worth exploring — collected in one place.',
      exploreTopics: 'Explore topics', explore: 'Explore', viewAll: 'View all', featured: 'Featured', selectedReading: 'Selected reading', latest: 'Latest', allArticles: 'All articles',
      technology: 'Technology', technologyDesc: 'Software, systems, tools and the ideas behind them.', ai: 'AI', aiDesc: 'Artificial intelligence, experiments, workflows and practical lessons.', programming: 'Programming', programmingDesc: 'Engineering notes, patterns, architecture and development.', games: 'Games', gamesDesc: 'Games worth playing, understanding and talking about.', manga: 'Manga & Comics', mangaDesc: 'Stories, recommendations, reviews and collections.', novels: 'Novels', novelsDesc: 'Books and stories worth reading and remembering.', music: 'Music', musicDesc: 'Albums, artists, discoveries and listening notes.',
      welcomeTitle: 'Welcome to the archive', welcomeDesc: 'Why this space exists and how the content is organized.', footer: 'Ideas worth sharing.', allTopics: '← All topics', topic: 'Topic', allTags: '← All tags', tag: 'Tag', noArticles: 'No published articles yet. This topic is ready for the first one.',
      exploreDesc: 'Browse ideas and stories by subject. The taxonomy is intentionally open-ended, so new subjects can be added without changing the site\'s runtime.', tagsDesc: 'Small labels for connecting related ideas across topics.', articlesDesc: 'Knowledge, observations, guides and ideas worth keeping.', archiveEyebrow: 'Chronological', archiveDesc: 'A simple timeline of published work, ordered from newest to oldest.', publishedArticles: 'Published articles',
      aboutEyebrow: 'About this space', aboutTitle: 'A place to share what matters.', aboutDesc: 'This site is built around ideas, knowledge and things worth exploring. It is intentionally open-ended: technology can sit beside games, stories, music and everything else that deserves a thoughtful write-up.', tagMetaDesc: 'Articles about the site, its structure and publishing model.', tagWebsiteDesc: 'Notes about the site and its publishing system.', nothingHere: 'Nothing here.', returnHome: 'Return home →', welcomeIntro: 'This is the first note in the archive.',
      welcomePara1: 'The site is built around a simple idea: <strong>share useful things</strong>. Topics can grow over time, and each topic can contain articles, guides, reviews, notes and other forms of writing.', durableTitle: 'A small, durable system', durablePara1: 'The site is intentionally static. Every published page is plain HTML with shared CSS, so there is no server, runtime or build pipeline required to read the content.', durablePara2: 'That keeps the publishing model simple: add a page, link it from the relevant topic and article index, and push the files to GitHub Pages.', durablePara3: 'The goal is not to publish everything. It is to keep ideas that are worth returning to.', metadata: 'Article metadata', tagsLabel: 'Tags',
      pageTitleHome: 'Ideas worth sharing.', pageTitleTopics: 'Topics — Ideas worth sharing.', pageTitleArticles: 'Articles — Ideas worth sharing.', pageTitleArchive: 'Archive — Ideas worth sharing.', pageTitleTags: 'Tags — Ideas worth sharing.', pageTitleAbout: 'About — Ideas worth sharing.', pageTitleWelcome: 'Welcome to the archive — Ideas worth sharing.', pageTitleTechnology: 'Technology — Ideas worth sharing.', pageTitleAi: 'AI — Ideas worth sharing.', pageTitleProgramming: 'Programming — Ideas worth sharing.', pageTitleGames: 'Games — Ideas worth sharing.', pageTitleManga: 'Manga & Comics — Ideas worth sharing.', pageTitleNovels: 'Novels — Ideas worth sharing.', pageTitleMusic: 'Music — Ideas worth sharing.', pageTitleMetaTag: 'meta — Tags — Ideas worth sharing.', pageTitleWebsiteTag: 'website — Tags — Ideas worth sharing.'
    },
    vi: {
      home: 'Trang chủ', topics: 'Chủ đề', articles: 'Bài viết', archive: 'Lưu trữ', tags: 'Thẻ', about: 'Giới thiệu', language: 'Ngôn ngữ', theme: 'Giao diện', light: 'Sáng', dark: 'Tối', system: 'Theo hệ thống',
      skip: 'Đến nội dung', brandLabel: 'Trang chủ', heroEyebrow: 'Một không gian cho ý tưởng', heroTitle: 'Những điều đáng<br><em>chia sẻ.</em>', heroLead: 'Kiến thức, thử nghiệm, câu chuyện, trò chơi và những điều đáng khám phá — được tập hợp tại một nơi.',
      exploreTopics: 'Khám phá chủ đề', explore: 'Khám phá', viewAll: 'Xem tất cả', featured: 'Nổi bật', selectedReading: 'Bài đọc chọn lọc', latest: 'Mới nhất', allArticles: 'Tất cả bài viết',
      technology: 'Công nghệ', technologyDesc: 'Phần mềm, hệ thống, công cụ và những ý tưởng phía sau chúng.', ai: 'AI', aiDesc: 'Trí tuệ nhân tạo, thử nghiệm, quy trình và kinh nghiệm thực tế.', programming: 'Lập trình', programmingDesc: 'Ghi chú kỹ thuật, pattern, kiến trúc và phát triển phần mềm.', games: 'Trò chơi', gamesDesc: 'Những trò chơi đáng chơi, tìm hiểu và bàn luận.', manga: 'Manga & Comics', mangaDesc: 'Câu chuyện, đề xuất, đánh giá và bộ sưu tập.', novels: 'Tiểu thuyết', novelsDesc: 'Những cuốn sách và câu chuyện đáng đọc và ghi nhớ.', music: 'Âm nhạc', musicDesc: 'Album, nghệ sĩ, khám phá mới và ghi chú nghe nhạc.',
      welcomeTitle: 'Chào mừng đến với kho lưu trữ', welcomeDesc: 'Lý do không gian này tồn tại và cách nội dung được tổ chức.', footer: 'Những điều đáng chia sẻ.', allTopics: '← Tất cả chủ đề', topic: 'Chủ đề', allTags: '← Tất cả thẻ', tag: 'Thẻ', noArticles: 'Chưa có bài viết nào được xuất bản. Chủ đề này đã sẵn sàng cho bài viết đầu tiên.',
      exploreDesc: 'Khám phá ý tưởng và câu chuyện theo chủ đề. Hệ thống phân loại được thiết kế mở để có thể thêm chủ đề mới mà không cần thay đổi phần runtime của website.', tagsDesc: 'Các nhãn nhỏ giúp kết nối những ý tưởng liên quan giữa các chủ đề.', articlesDesc: 'Kiến thức, quan sát, hướng dẫn và những ý tưởng đáng lưu giữ.', archiveEyebrow: 'Theo thời gian', archiveDesc: 'Dòng thời gian đơn giản của các nội dung đã xuất bản, từ mới nhất đến cũ nhất.', publishedArticles: 'Bài viết đã xuất bản',
      aboutEyebrow: 'Về không gian này', aboutTitle: 'Nơi chia sẻ những điều đáng quan tâm.', aboutDesc: 'Website này xoay quanh ý tưởng, kiến thức và những điều đáng khám phá. Nội dung được giữ mở để công nghệ có thể đứng cạnh trò chơi, câu chuyện, âm nhạc và bất cứ điều gì xứng đáng được viết một cách có chiều sâu.', tagMetaDesc: 'Các bài viết về website, cấu trúc và cách xuất bản nội dung.', tagWebsiteDesc: 'Ghi chú về website và hệ thống xuất bản nội dung.', nothingHere: 'Không có nội dung ở đây.', returnHome: 'Về trang chủ →', welcomeIntro: 'Đây là ghi chú đầu tiên trong kho lưu trữ.',
      welcomePara1: 'Website được xây dựng quanh một ý tưởng đơn giản: <strong>chia sẻ những điều hữu ích</strong>. Các chủ đề có thể phát triển theo thời gian, và mỗi chủ đề có thể chứa bài viết, hướng dẫn, đánh giá, ghi chú cùng nhiều hình thức nội dung khác.', durableTitle: 'Một hệ thống nhỏ và bền vững', durablePara1: 'Website được xây dựng theo hướng tĩnh. Mỗi trang đã xuất bản là HTML thuần với CSS dùng chung, vì vậy không cần máy chủ, runtime hay quy trình build để đọc nội dung.', durablePara2: 'Điều này giữ cho quy trình xuất bản đơn giản: thêm một trang, liên kết trang đó từ chủ đề và danh sách bài viết phù hợp, rồi đẩy các file lên GitHub Pages.', durablePara3: 'Mục tiêu không phải là xuất bản mọi thứ. Mục tiêu là lưu lại những ý tưởng đáng quay lại.', metadata: 'Thông tin bài viết', tagsLabel: 'Thẻ',
      pageTitleHome: 'Những điều đáng chia sẻ.', pageTitleTopics: 'Chủ đề — Những điều đáng chia sẻ.', pageTitleArticles: 'Bài viết — Những điều đáng chia sẻ.', pageTitleArchive: 'Lưu trữ — Những điều đáng chia sẻ.', pageTitleTags: 'Thẻ — Những điều đáng chia sẻ.', pageTitleAbout: 'Giới thiệu — Những điều đáng chia sẻ.', pageTitleWelcome: 'Chào mừng đến với kho lưu trữ — Những điều đáng chia sẻ.', pageTitleTechnology: 'Công nghệ — Những điều đáng chia sẻ.', pageTitleAi: 'AI — Những điều đáng chia sẻ.', pageTitleProgramming: 'Lập trình — Những điều đáng chia sẻ.', pageTitleGames: 'Trò chơi — Những điều đáng chia sẻ.', pageTitleManga: 'Manga & Comics — Những điều đáng chia sẻ.', pageTitleNovels: 'Tiểu thuyết — Những điều đáng chia sẻ.', pageTitleMusic: 'Âm nhạc — Những điều đáng chia sẻ.', pageTitleMetaTag: 'meta — Thẻ — Những điều đáng chia sẻ.', pageTitleWebsiteTag: 'website — Thẻ — Những điều đáng chia sẻ.'
    }
  };

  const getStored = (key, fallback) => {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  };
  const setStored = (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* storage can be unavailable */ }
  };
  const getLanguage = () => {
    const value = getStored(STORAGE.lang, 'en');
    return supportedLanguages.includes(value) ? value : 'en';
  };
  const getTheme = () => {
    const value = getStored(STORAGE.theme, 'system');
    return supportedThemes.includes(value) ? value : 'system';
  };

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === 'system' ? '' : theme;
    updateThemeMeta();
    updateThemeButtons(theme);
  }

  function updateThemeMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const styles = getComputedStyle(document.documentElement);
    const value = styles.getPropertyValue('--theme-color').trim() || styles.getPropertyValue('--bg').trim();
    if (value) meta.content = value;
  }

  function applyLanguage(lang) {
    const t = translations[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.dataset.i18nHtml;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.dataset.i18nAria;
      if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.dataset.i18nTitle;
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-content]').forEach((el) => {
      const key = el.dataset.i18nContent;
      if (t[key] !== undefined) el.setAttribute('content', t[key]);
    });
    document.querySelectorAll('[data-i18n-date]').forEach((el) => {
      const date = new Date(`${el.dateTime}T00:00:00`);
      if (Number.isNaN(date.getTime())) return;
      const style = el.dataset.i18nDate === 'long' ? 'long' : 'short';
      el.textContent = new Intl.DateTimeFormat(lang, { year: 'numeric', month: style, day: 'numeric' }).format(date);
    });
    updateControlLabels(lang);
  }

  function updateControlLabels(lang) {
    const t = translations[lang];
    const languageSelect = document.querySelector('[data-control="language"]');
    const themeSelect = document.querySelector('[data-control="theme"]');
    languageSelect?.setAttribute('aria-label', t.language);
    themeSelect?.setAttribute('aria-label', t.theme);
  }

  function createControls() {
    const header = document.querySelector('.site-header');
    if (!header || header.querySelector('.site-controls')) return;
    const controls = document.createElement('div');
    controls.className = 'site-controls';
    controls.innerHTML = `
      <div class="control-group" data-control-group="language">
        <select class="control-button control-select" data-control="language" aria-label="Language">
          <option value="en">EN</option>
          <option value="vi">VI</option>
        </select>
      </div>
      <div class="control-group theme-group" data-control-group="theme">
        <select class="control-button control-select theme-select" data-control="theme" aria-label="Theme">
          <option value="light" data-i18n="light">Light</option>
          <option value="system" data-i18n="system">System</option>
          <option value="dark" data-i18n="dark">Dark</option>
        </select>
      </div>`;
    header.appendChild(controls);
    controls.querySelector('[data-control="language"]').value = getLanguage();
    controls.querySelector('[data-control="theme"]').value = getTheme();
    controls.addEventListener('change', (event) => {
      const control = event.target.closest('[data-control]');
      if (!control) return;
      if (control.dataset.control === 'language' && supportedLanguages.includes(control.value)) {
        setStored(STORAGE.lang, control.value);
        applyLanguage(control.value);
      }
      if (control.dataset.control === 'theme' && supportedThemes.includes(control.value)) {
        setStored(STORAGE.theme, control.value);
        applyTheme(control.value);
      }
    });
    updateThemeButtons(getTheme());
  }

  function updateThemeButtons(theme) {
    const themeSelect = document.querySelector('[data-control="theme"]');
    if (themeSelect) themeSelect.value = theme;
  }

  function initSystemThemeListener() {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      if (getTheme() === 'system') applyTheme('system');
    };
    if (typeof media.addEventListener === 'function') media.addEventListener('change', sync);
    else media.addListener(sync);
  }

  function init() {
    applyTheme(getTheme());
    createControls();
    applyLanguage(getLanguage());
    initSystemThemeListener();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
