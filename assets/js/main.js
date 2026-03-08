import { loadGuidesSection, loadCategory } from './guide.js';
import { loadGamesSection, loadGame } from './game.js';

function getSection() {
  const params = new URLSearchParams(window.location.search);
  const s = params.get('section');
  return s === 'guides' || s === 'games' ? s : 'landing';
}

function setSection(section) {
  const url = new URL(window.location);
  if (section === 'landing') {
    url.search = '';
  } else {
    url.searchParams.set('section', section);
  }
  window.history.pushState({}, '', url);
}

function applySection(section) {
  const body = document.body;
  body.classList.remove('section-landing', 'section-guides', 'section-games');
  body.classList.add(`section-${section}`);

  const siteTitleEl = document.getElementById('site-title');
  const landingLogo = document.getElementById('landing-logo-img');
  const landingName = document.getElementById('landing-site-name');
  const landingSlogan = document.getElementById('landing-slogan');

  if (section === 'landing') {
    if (landingLogo) {
      landingLogo.src = CONFIG.LOGO_SVG_PATH;
      landingLogo.alt = CONFIG.SITE_NAME;
    }
    if (landingName) landingName.textContent = CONFIG.SITE_NAME;
    if (landingSlogan) landingSlogan.textContent = CONFIG.SITE_SLOGAN;
    document.title = CONFIG.SITE_NAME;
    return;
  }

  if (section === 'guides') {
    if (siteTitleEl) siteTitleEl.textContent = CONFIG.LABEL_GUIDES;
    loadGuidesSection();
    return;
  }

  if (section === 'games') {
    if (siteTitleEl) siteTitleEl.textContent = CONFIG.LABEL_GAMES;
    loadGamesSection();
  }
}

function initSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const body = document.body;
  if (!toggle || !body) return;

  const closed = localStorage.getItem(CONFIG.STORAGE_KEY_SIDEBAR) === 'true';
  if (closed) body.classList.add('sidebar-closed');

  function updateA11y() {
    const isClosed = body.classList.contains('sidebar-closed');
    toggle.setAttribute('aria-expanded', String(!isClosed));
    toggle.setAttribute('aria-label', isClosed ? 'Mở sidebar' : 'Đóng sidebar');
    toggle.title = isClosed ? 'Mở sidebar' : 'Đóng sidebar';
  }
  updateA11y();

  function setClosed(closed) {
    body.classList.toggle('sidebar-closed', closed);
    localStorage.setItem(CONFIG.STORAGE_KEY_SIDEBAR, String(closed));
    updateA11y();
  }

  toggle.addEventListener('click', () => setClosed(!body.classList.contains('sidebar-closed')));

  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', () => setClosed(true));
}

document.addEventListener('DOMContentLoaded', () => {
  const section = getSection();
  applySection(section);

  const landingGuides = document.getElementById('landing-guides');
  const landingGames = document.getElementById('landing-games');
  const homeLink = document.getElementById('sidebar-home-link');

  if (landingGuides) {
    landingGuides.addEventListener('click', (e) => {
      e.preventDefault();
      setSection('guides');
      applySection('guides');
    });
  }
  if (landingGames) {
    landingGames.addEventListener('click', (e) => {
      e.preventDefault();
      setSection('games');
      applySection('games');
    });
  }
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      setSection('landing');
      applySection('landing');
    });
  }

  initSidebarToggle();
});

window.addEventListener('popstate', () => {
  applySection(getSection());
});
