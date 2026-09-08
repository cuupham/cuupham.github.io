(() => {
  const WEB_AWESOME_BASE = 'https://ka-f.webawesome.com/@awesome.me/webawesome@3.12.0';
  const CDN_ORIGIN = 'https://ka-f.webawesome.com';
  const LOAD_TIMEOUT_MS = 4000;
  const THEME_ICONS = Object.freeze({
    light: 'sun',
    dark: 'moon',
    system: 'desktop',
  });
  const THEME_ORDER = Object.freeze(['light', 'dark', 'system']);

  function preconnect() {
    if (document.head.querySelector(`link[data-web-awesome-preconnect="true"]`)) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = CDN_ORIGIN;
    link.dataset.webAwesomePreconnect = 'true';
    document.head.appendChild(link);
  }

  function loadStylesheet(href, attribute) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (attribute) link.dataset[attribute] = 'true';
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', () => reject(new Error(`Stylesheet failed to load: ${href}`)), { once: true });
      document.head.appendChild(link);
    });
  }

  function loadStyles() {
    return Promise.all([
      loadStylesheet(`${WEB_AWESOME_BASE}/styles/themes/default.css`, 'webAwesomeTheme'),
      loadStylesheet('/assets/css/header-controls.css', 'headerControls'),
    ]);
  }

  function withTimeout(promise, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(`${label} timed out`)), LOAD_TIMEOUT_MS);
    });

    return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
  }

  function orderThemeOptions() {
    const theme = document.querySelector('[data-control="theme"]');
    if (!theme) return;

    const options = Array.from(theme.options);
    options.sort((a, b) => THEME_ORDER.indexOf(a.value) - THEME_ORDER.indexOf(b.value));
    options.forEach((option) => theme.appendChild(option));
  }

  async function loadComponents() {
    await withTimeout(
      import(`${WEB_AWESOME_BASE}/components/select/select.js`),
      'Web Awesome component load',
    );
    await customElements.whenDefined('wa-select');
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
    preconnect();
    orderThemeOptions();

    try {
      await Promise.all([loadComponents(), loadStyles()]);
      upgradeControls();
    } catch (error) {
      console.warn('[header-controls] Web Awesome enhancement unavailable; keeping native controls.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
