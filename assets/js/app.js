/**
 * Arcane Lab - Main Application
 * Guides + Games. CONFIG from config.js.
 */

const COPY_BTN_STATE = {
  default: '<span class="copy-icon">📋</span> Copy',
  copied: '<span class="copy-icon">✅</span> Copied!',
  failed: '<span class="copy-icon">❌</span> Failed',
};

function getSkeletonHtml() {
  return `
  <div class="skeleton-header"></div>
  <div class="${CONFIG.SKELETON_BLOCK_CLASS}"></div>
  <div class="${CONFIG.SKELETON_BLOCK_CLASS}"></div>
  <div class="${CONFIG.SKELETON_BLOCK_CLASS}"></div>
`.trim();
}

const cache = {};
let categoriesData = null;
let gamesData = null;

// ============ Utility Functions ============

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeDetails(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '{{BR}}')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{\{BR\}\}/g, '<br>');
}

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

// ============ URL State Management ============

function getUrlCategory() {
  const params = new URLSearchParams(window.location.search);
  return params.get('cat');
}

function setUrlCategory(categoryId) {
  const url = new URL(window.location);
  url.searchParams.set('cat', categoryId);
  url.searchParams.delete('game');
  window.history.pushState({}, '', url);
}

function getUrlGame() {
  return new URLSearchParams(window.location.search).get('game');
}

function setUrlGame(gameId) {
  const url = new URL(window.location);
  url.searchParams.set('game', gameId);
  url.searchParams.delete('cat');
  window.history.pushState({}, '', url);
}

// ============ Section (Landing / Guides / Games) ============

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
    if (siteTitleEl) siteTitleEl.textContent = 'Guides';
    loadGuidesSection();
    return;
  }

  if (section === 'games') {
    if (siteTitleEl) siteTitleEl.textContent = 'Game';
    loadGamesSection();
  }
}

async function loadGuidesSection() {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  try {
    const res = await fetch(`${CONFIG.GUIDES_PATH}/categories.json`);
    if (!res.ok) throw new Error('Failed to load categories');
    categoriesData = JSON.parse(await res.text());
    renderCategoryButtons(nav);

    const urlCategory = getUrlCategory();
    const validCategory = categoriesData.find((c) => c.id === urlCategory);
    if (validCategory) {
      loadCategory(urlCategory);
    } else {
      const content = document.getElementById('content');
      content.innerHTML = '<h2>👋 Guides</h2><p>Chọn một guide từ sidebar.</p>';
    }
    updatePageTitleAndMeta();
  } catch (error) {
    console.error('Error loading categories:', error);
    nav.innerHTML = '<p class="error-msg">Failed to load categories</p>';
  }
}

async function loadGamesSection() {
  const nav = document.getElementById('game-nav');
  if (!nav) return;

  try {
    const res = await fetch(`${CONFIG.GAMES_PATH}/games.json`);
    if (!res.ok) {
      gamesData = [];
    } else {
      gamesData = JSON.parse(await res.text());
    }
    renderGameButtons();

    const urlGame = getUrlGame();
    const validGame = gamesData?.find((g) => g.id === urlGame);
    if (validGame) {
      loadGame(urlGame);
    } else {
      const content = document.getElementById('content');
      content.innerHTML = '<h2>👋 Game</h2><p>Chọn một game từ sidebar.</p>';
    }
    document.title = `${CONFIG.SITE_NAME} - Game`;
  } catch (error) {
    console.error('Error loading games:', error);
    nav.innerHTML = '<p class="error-msg">Failed to load games</p>';
  }
}

// ============ Category Loading ============

/** Cập nhật title, header và meta từ CONFIG + categories. */
function updatePageTitleAndMeta() {
  document.title = `${CONFIG.SITE_NAME} - Guides`;
  const siteTitleEl = document.getElementById('site-title');
  if (siteTitleEl) siteTitleEl.textContent = 'Guides';

  if (!categoriesData || categoriesData.length === 0) return;

  const labels = categoriesData.map((c) => c.label).join(', ');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${CONFIG.SITE_NAME} - Bộ sưu tập: ${labels}`);

  const keywords = ['guides', 'commands', ...categoriesData.map((c) => c.id), 'developer tools'].join(', ');
  const metaKw = document.querySelector('meta[name="keywords"]');
  if (metaKw) metaKw.setAttribute('content', keywords);
}

async function fetchGuideData(guideId) {
  if (cache[guideId]) return cache[guideId];

  const res = await fetch(`${CONFIG.GUIDES_PATH}/${guideId}.json`);
  if (!res.ok) throw new Error('Failed to load guide');
  const data = await res.json();
  cache[guideId] = data;
  return data;
}

function renderCategoryButtons(nav) {
  nav.innerHTML = '';

  categoriesData.forEach((cat) => {
    const btn = document.createElement('button');
    const icon = cat.icon || CONFIG.DEFAULT_ICON;

    btn.innerHTML = `
      <span class="cat-icon">${icon}</span>
      <span class="cat-label">${escapeHtml(cat.label)}</span>
    `;
    btn.dataset.categoryId = cat.id;
    btn.setAttribute('aria-label', `Xem ${cat.label}`);
    btn.addEventListener('click', () => loadCategory(cat.id));
    nav.appendChild(btn);
  });
}

function getCategoryLabel(categoryId) {
  if (!categoriesData) return categoryId.toUpperCase();
  const cat = categoriesData.find(c => c.id === categoryId);
  return cat ? cat.label : categoryId.toUpperCase();
}

function getCategoryIcon(categoryId) {
  if (!categoriesData) return CONFIG.DEFAULT_ICON;
  const cat = categoriesData.find(c => c.id === categoryId);
  return cat?.icon || CONFIG.DEFAULT_ICON;
}

function updateActiveButton(categoryId) {
  const nav = document.getElementById('category-nav');
  if (nav) {
    nav.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.categoryId === categoryId);
    });
  }
  const gameNav = document.getElementById('game-nav');
  if (gameNav) {
    gameNav.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
  }
}

function renderGameButtons() {
  const nav = document.getElementById('game-nav');
  if (!nav || !gamesData?.length) return;

  nav.innerHTML = '';
  gamesData.forEach((game) => {
    const btn = document.createElement('button');
    const icon = game.icon || CONFIG.DEFAULT_ICON;
    btn.innerHTML = `
      <span class="cat-icon">${icon}</span>
      <span class="cat-label">${escapeHtml(game.label)}</span>
    `;
    btn.dataset.gameId = game.id;
    btn.setAttribute('aria-label', `Chơi ${game.label}`);
    btn.addEventListener('click', () => loadGame(game.id));
    nav.appendChild(btn);
  });
}

function updateActiveGameButton(gameId) {
  const gameNav = document.getElementById('game-nav');
  if (gameNav) {
    gameNav.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.gameId === gameId);
    });
  }
  const catNav = document.getElementById('category-nav');
  if (catNav) {
    catNav.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
  }
}

// ============ Content Loading ============

function loadGame(gameId) {
  const content = document.getElementById('content');
  updateActiveGameButton(gameId);
  setUrlGame(gameId);

  if (gameId === 'caro') {
    renderGameCaro(content);
  } else if (gameId === 'rps') {
    renderGameRPS(content);
  } else {
    content.innerHTML = '<p class="error-msg">Game chưa có.</p>';
  }
}

function renderGameCaro(container) {
  const N = CONFIG.CARO_SIZE;
  const WIN = CONFIG.CARO_WIN_LENGTH;
  let board = Array(N * N).fill('');
  let currentPlayer = 'X';
  let gameOver = false;

  const getGame = () => ({ board, currentPlayer, gameOver });
  const setGame = (next) => {
    board = next.board;
    currentPlayer = next.currentPlayer;
    gameOver = next.gameOver;
  };

  function checkWin(r, c, mark) {
    const at = (rr, cc) => (rr >= 0 && rr < N && cc >= 0 && cc < N ? board[rr * N + cc] : null);
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of dirs) {
      let count = 1;
      for (let t = 1; t < WIN; t++) if (at(r + dr * t, c + dc * t) === mark) count++;
      for (let t = 1; t < WIN; t++) if (at(r - dr * t, c - dc * t) === mark) count++;
      if (count >= WIN) return true;
    }
    return false;
  }

  const statusEl = document.createElement('p');
  statusEl.className = 'game-status';
  statusEl.textContent = `Lượt: ${currentPlayer}`;

  const boardEl = document.createElement('div');
  boardEl.className = 'game-caro-board';
  boardEl.style.gridTemplateColumns = `repeat(${N}, 32px)`;

  for (let i = 0; i < N * N; i++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'game-caro-cell';
    cell.dataset.index = String(i);
    cell.addEventListener('click', () => {
      const { gameOver: over } = getGame();
      if (over || board[i]) return;
      const r = Math.floor(i / N);
      const c = i % N;
      board[i] = currentPlayer;
      cell.textContent = currentPlayer;
      cell.disabled = true;

      if (checkWin(r, c, currentPlayer)) {
        setGame({ board, currentPlayer, gameOver: true });
        statusEl.textContent = `Thắng: ${currentPlayer}`;
        boardEl.querySelectorAll('.game-caro-cell').forEach((b) => (b.disabled = true));
        return;
      }
      if (board.every(Boolean)) {
        setGame({ board, currentPlayer, gameOver: true });
        statusEl.textContent = 'Hòa!';
        return;
      }
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setGame({ board, currentPlayer, gameOver: false });
      statusEl.textContent = `Lượt: ${currentPlayer}`;
    });
    boardEl.appendChild(cell);
  }

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'game-rps-btn';
  resetBtn.style.fontSize = '14px';
  resetBtn.textContent = 'Chơi lại';
  resetBtn.addEventListener('click', () => loadGame('caro'));

  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'game-container';
  wrap.innerHTML = '<h2>⭕ Caro</h2>';
  wrap.appendChild(statusEl);
  wrap.appendChild(boardEl);
  wrap.appendChild(resetBtn);
  container.appendChild(wrap);
}

function renderGameRPS(container) {
  const choices = [
    { id: 'rock', label: 'Búa', icon: '✊' },
    { id: 'paper', label: 'Bao', icon: '✋' },
    { id: 'scissors', label: 'Kéo', icon: '✌️' },
  ];
  const resultText = { win: 'Bạn thắng!', lose: 'Bạn thua!', draw: 'Hòa!' };
  let score = { win: 0, lose: 0, draw: 0 };

  const resultEl = document.createElement('div');
  resultEl.className = 'game-rps-result';
  resultEl.textContent = 'Chọn Búa, Kéo hoặc Bao.';

  const scoreEl = document.createElement('p');
  scoreEl.className = 'game-rps-score';
  scoreEl.textContent = 'Thắng: 0 — Thua: 0 — Hòa: 0';

  function play(playerId) {
    const comp = choices[Math.floor(Math.random() * 3)];
    const player = choices.find((c) => c.id === playerId);
    let outcome = 'draw';
    if (player.id !== comp.id) {
      const win =
        (player.id === 'rock' && comp.id === 'scissors') ||
        (player.id === 'scissors' && comp.id === 'paper') ||
        (player.id === 'paper' && comp.id === 'rock');
      outcome = win ? 'win' : 'lose';
    }
    score[outcome]++;
    scoreEl.textContent = `Thắng: ${score.win} — Thua: ${score.lose} — Hòa: ${score.draw}`;
    resultEl.textContent = `Bạn: ${player.icon} ${player.label} — Máy: ${comp.icon} ${comp.label}. ${resultText[outcome]}`;
  }

  container.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'game-container';
  wrap.innerHTML = '<h2>✊ Oẳn tù tì</h2>';
  const choicesEl = document.createElement('div');
  choicesEl.className = 'game-rps-choices';
  choices.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'game-rps-btn';
    btn.textContent = `${c.icon} ${c.label}`;
    btn.title = c.label;
    btn.addEventListener('click', () => play(c.id));
    choicesEl.appendChild(btn);
  });
  wrap.appendChild(choicesEl);
  wrap.appendChild(resultEl);
  wrap.appendChild(scoreEl);
}

async function loadCategory(category) {
  const content = document.getElementById('content');

  content.innerHTML = getSkeletonHtml();

  updateActiveButton(category);
  setUrlCategory(category);

  try {
    const data = await fetchGuideData(category);
    if (!data?.sections) {
      content.innerHTML = '<p class="error-msg">Error loading guide.</p>';
      return;
    }
    renderGuide(category, data);
    attachCopyHandlers(content);
  } catch (error) {
    content.innerHTML = '<p class="error-msg">Error loading guide.</p>';
    console.error(error);
  }
}

function renderGuide(guideId, data) {
  const content = document.getElementById('content');
  const label = getCategoryLabel(guideId);
  const icon = getCategoryIcon(guideId);

  content.innerHTML = `<h2>${icon} ${escapeHtml(label)}</h2>`;

  if (!data.sections || data.sections.length === 0) {
    content.innerHTML += '<p class="empty-msg">No content available.</p>';
    return;
  }

  data.sections.forEach(section => {
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = section.title;
    content.appendChild(sectionTitle);

    (section.blocks || []).forEach(block => {
      if (block.type === 'code') {
        const div = document.createElement('div');
        div.className = CONFIG.CODE_BLOCK_CLASS;
        div.innerHTML = `
          <pre><code>${escapeHtml(block.content)}</code></pre>
          <button class="copy-btn" aria-label="Copy command">${COPY_BTN_STATE.default}</button>
        `;
        content.appendChild(div);
      } else {
        const p = document.createElement('p');
        p.className = 'guide-comment';
        p.textContent = block.content || '';
        content.appendChild(p);
      }
    });
  });
}

function attachCopyHandlers(container) {
  const blockClass = CONFIG.CODE_BLOCK_CLASS;
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const block = e.target.closest(`.${blockClass}`);
      const codeEl = block?.querySelector('pre > code');
      const text = codeEl?.innerText || '';
      if (!text) return;

      try {
        await copyToClipboard(text);
        btn.innerHTML = COPY_BTN_STATE.copied;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = COPY_BTN_STATE.default;
          btn.classList.remove('copied');
        }, CONFIG.COPY_FEEDBACK_MS);
      } catch (err) {
        console.error('Copy failed', err);
        btn.innerHTML = COPY_BTN_STATE.failed;
        setTimeout(() => {
          btn.innerHTML = COPY_BTN_STATE.default;
        }, CONFIG.COPY_FEEDBACK_MS);
      }
    });
  });
}

// ============ Sidebar Toggle ============

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

// ============ Initialize ============

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
