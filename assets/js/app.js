/**
 * Guides - Main Application
 * Command guides reference (Python, Git, SSH, ...)
 */

// ============ Constants (single source of truth) ============

const CONFIG = {
  SITE_TITLE: 'Guides',
  GUIDES_PATH: 'assets/guides',
  CODE_BLOCK_CLASS: 'code-block',
  SKELETON_BLOCK_CLASS: 'skeleton-block',
  DEFAULT_ICON: '📄',
  COPY_FEEDBACK_MS: 1500,
  STORAGE_KEY_SIDEBAR: 'guides-sidebar-closed',
};

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
  window.history.pushState({}, '', url);
}

// ============ Category Loading ============

/** Cập nhật title, header và meta từ CONFIG + categories (single source of truth). */
function updatePageTitleAndMeta() {
  document.title = CONFIG.SITE_TITLE;
  const siteTitleEl = document.getElementById('site-title');
  if (siteTitleEl) siteTitleEl.textContent = `📋 ${CONFIG.SITE_TITLE}`;

  if (!categoriesData || categoriesData.length === 0) return;

  const labels = categoriesData.map((c) => c.label).join(', ');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${CONFIG.SITE_TITLE} - Bộ sưu tập: ${labels}`);

  const keywords = ['guides', 'commands', ...categoriesData.map((c) => c.id), 'developer tools'].join(', ');
  const metaKw = document.querySelector('meta[name="keywords"]');
  if (metaKw) metaKw.setAttribute('content', keywords);
}

async function loadCategories() {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  try {
    const res = await fetch(`${CONFIG.GUIDES_PATH}/categories.json`);
    if (!res.ok) throw new Error('Failed to load categories');
    categoriesData = JSON.parse(await res.text());

    renderCategoryButtons(nav);

    // Load from URL or show welcome
    const urlCategory = getUrlCategory();
    const validCategory = categoriesData.find(c => c.id === urlCategory);
    if (validCategory) {
      loadCategory(urlCategory);
    } else if (categoriesData.length > 0) {
      // Don't auto-load, show welcome screen
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    nav.innerHTML = '<p class="error-msg">Failed to load categories</p>';
  }

  updatePageTitleAndMeta();
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
  if (!nav) return;

  nav.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.categoryId === categoryId);
  });
}

// ============ Content Loading ============

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
  initSidebarToggle();
  loadCategories();
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
  const cat = getUrlCategory();
  if (cat && categoriesData?.find(c => c.id === cat)) {
    loadCategory(cat);
  }
});
