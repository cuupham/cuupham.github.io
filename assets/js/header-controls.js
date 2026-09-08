(() => {
  const WEB_AWESOME_BASE = 'https://ka-f.webawesome.com/@awesome.me/webawesome@3.12.0';
  const THEME_ICONS = Object.freeze({
    light: 'sun',
    system: 'desktop',
    dark: 'moon',
  });

  function loadStyles() {
    if (document.querySelector('link[data-web-awesome-theme]')) return;

    const theme = document.createElement('link');
    theme.rel = 'stylesheet';
    theme.href = `${WEB_AWESOME_BASE}/styles/themes/default.css`;
    theme.dataset.webAwesomeTheme = 'true';
    document.head.appendChild(theme);

    const overrides = document.createElement('link');
    overrides.rel = 'stylesheet';
    overrides.href = '/assets/css/header-controls.css';
    overrides.dataset.headerControls = 'true';
    document.head.appendChild(overrides);
  }

  async function loadComponents() {
    await import(`${WEB_AWESOME_BASE}/components/select/select.js`);
    await customElements.whenDefined('wa-select');
    await customElements.whenDefined('wa-option');
    await customElements.whenDefined('wa-icon');
  }

  function createSelect(source, iconName) {
    const select = document.createElement('wa-select');
    select.className = source.className.replace(/\bcontrol-select\b/g, '').trim();
    select.dataset.control = source.dataset.control;
    select.setAttribute('aria-label', source.getAttribute('aria-label') || '');
    select.setAttribute('size', 'small');
    select.setAttribute('pill', '');
    select.setAttribute('appearance', 'filled');
    select.setAttribute('placement', 'bottom');
    select.value = source.value;

    const icon = document.createElement('wa-icon');
    icon.setAttribute('slot', 'start');
    icon.setAttribute('name', iconName);
    icon.setAttribute('aria-hidden', 'true');
    select.appendChild(icon);

    Array.from(source.options).forEach((option) => {
      const item = document.createElement('wa-option');
      item.value = option.value;
      item.textContent = option.textContent;
      if (option.dataset.i18n) item.dataset.i18n = option.dataset.i18n;
      select.appendChild(item);
    });

    return select;
  }

  function updateThemeIcon(themeSelect) {
    const icon = themeSelect.querySelector('wa-icon[slot="start"]');
    if (!icon) return;

    icon.name = THEME_ICONS[themeSelect.value] || THEME_ICONS.system;
  }

  function upgradeControls() {
    const language = document.querySelector('[data-control="language"]');
    const theme = document.querySelector('[data-control="theme"]');
    if (!language || !theme || language.localName === 'wa-select') return;

    const languageSelect = createSelect(language, 'language');
    const themeSelect = createSelect(theme, THEME_ICONS[theme.value] || THEME_ICONS.system);
    language.replaceWith(languageSelect);
    theme.replaceWith(themeSelect);

    updateThemeIcon(themeSelect);
    themeSelect.addEventListener('change', () => updateThemeIcon(themeSelect));
  }

  async function init() {
    loadStyles();
    try {
      await loadComponents();
      upgradeControls();
    } catch (error) {
      console.warn('[header-controls] Web Awesome failed to load; keeping native controls.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
