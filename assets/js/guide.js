import { escapeHtml, getSkeletonHtml, updateActiveNavButton, renderNavButtons, copyToClipboard } from './utils.js';

const cache = {};
let categoriesData = null;

const COPY_BTN_STATE = {
  default: '<span class="copy-icon">📋</span> Copy',
  copied: '<span class="copy-icon">✅</span> Copied!',
  failed: '<span class="copy-icon">❌</span> Failed',
};

export async function loadGuidesSection() {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  try {
    const res = await fetch(`${CONFIG.GUIDES_PATH}/categories.json`);
    if (!res.ok) throw new Error('Failed to load categories');
    categoriesData = JSON.parse(await res.text());
    renderNavButtons('category-nav', categoriesData, 'categoryId', 'Xem', loadCategory);

    const urlCategory = getUrlCategory();
    const validCategory = categoriesData.find((c) => c.id === urlCategory);
    if (validCategory) {
      loadCategory(urlCategory);
    } else {
      const content = document.getElementById('content');
      content.innerHTML = `<h2>👋 ${CONFIG.LABEL_GUIDES}</h2><p>Chọn một guide từ sidebar.</p>`;
    }
    updatePageTitleAndMeta();
  } catch (error) {
    console.error('Error loading categories:', error);
    nav.innerHTML = '<p class="error-msg">Failed to load categories</p>';
  }
}

async function fetchGuideData(guideId) {
  if (cache[guideId]) return cache[guideId];

  const res = await fetch(`${CONFIG.GUIDES_PATH}/${guideId}.json`);
  if (!res.ok) throw new Error('Failed to load guide');
  const data = await res.json();
  cache[guideId] = data;
  return data;
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

export async function loadCategory(category) {
  const content = document.getElementById('content');

  content.innerHTML = getSkeletonHtml();

  updateActiveNavButton('category-nav', 'categoryId', category);
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

      const success = await copyToClipboard(text);
      if (success) {
        btn.innerHTML = COPY_BTN_STATE.copied;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = COPY_BTN_STATE.default;
          btn.classList.remove('copied');
        }, CONFIG.COPY_FEEDBACK_MS);
      } else {
        btn.innerHTML = COPY_BTN_STATE.failed;
        setTimeout(() => {
          btn.innerHTML = COPY_BTN_STATE.default;
        }, CONFIG.COPY_FEEDBACK_MS);
      }
    });
  });
}

/** Cập nhật title, header và meta từ CONFIG + categories. */
function updatePageTitleAndMeta() {
  document.title = `${CONFIG.SITE_NAME} - ${CONFIG.LABEL_GUIDES}`;
  const siteTitleEl = document.getElementById('site-title');
  if (siteTitleEl) siteTitleEl.textContent = CONFIG.LABEL_GUIDES;

  if (!categoriesData || categoriesData.length === 0) return;

  const labels = categoriesData.map((c) => c.label).join(', ');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${CONFIG.SITE_NAME} - Bộ sưu tập: ${labels}`);

  const keywords = ['guides', 'commands', ...categoriesData.map((c) => c.id), 'developer tools'].join(', ');
  const metaKw = document.querySelector('meta[name="keywords"]');
  if (metaKw) metaKw.setAttribute('content', keywords);
}

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
