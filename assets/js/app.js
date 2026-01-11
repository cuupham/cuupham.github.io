/**
 * Snippets Hub - Main Application
 * A lightweight code snippets manager
 */

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
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
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

async function loadCategories() {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  try {
    const res = await fetch('assets/posts/categories.json');
    if (!res.ok) throw new Error('Failed to load categories');
    categoriesData = JSON.parse(await res.text());

    // Pre-fetch all category data for counts
    await Promise.all(categoriesData.map(cat => fetchCategoryData(cat.id)));

    renderCategoryButtons(nav);
    setupKeyboardShortcuts();

    // Load category from URL or first category
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
}

async function fetchCategoryData(categoryId) {
  if (cache[categoryId]) return cache[categoryId];

  try {
    const res = await fetch(`assets/posts/${categoryId}_post.json`);
    if (!res.ok) return [];
    const data = await res.json();
    cache[categoryId] = data;
    return data;
  } catch {
    return [];
  }
}

function getSnippetCount(categoryId) {
  const data = cache[categoryId];
  if (!data) return 0;
  return data.filter(item => item.is_show !== false).length;
}

function renderCategoryButtons(nav) {
  nav.innerHTML = '';

  categoriesData.forEach((cat, index) => {
    const btn = document.createElement('button');
    const count = getSnippetCount(cat.id);
    const icon = cat.icon || '📄';
    const shortcutNum = index + 1;

    btn.innerHTML = `
      <span class="cat-icon">${icon}</span>
      <span class="cat-label">${escapeHtml(cat.label)}</span>
      <span class="cat-count">${count}</span>
      ${shortcutNum <= 9 ? `<span class="cat-shortcut">${shortcutNum}</span>` : ''}
    `;
    btn.dataset.categoryId = cat.id;
    btn.setAttribute('aria-label', `View ${cat.label} snippets, ${count} items`);
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
  if (!categoriesData) return '📄';
  const cat = categoriesData.find(c => c.id === categoryId);
  return cat?.icon || '📄';
}

function updateActiveButton(categoryId) {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  nav.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.categoryId === categoryId);
  });
}

// ============ Keyboard Shortcuts ============

function setupKeyboardShortcuts() {
  // Update hint text dynamically
  updateShortcutHint();

  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Number keys 1-9 for categories (max 9)
    const num = parseInt(e.key);
    const maxShortcuts = Math.min(categoriesData.length, 9);
    if (num >= 1 && num <= maxShortcuts) {
      loadCategory(categoriesData[num - 1].id);
    }
  });
}

function updateShortcutHint() {
  const hint = document.getElementById('shortcut-hint');
  if (!hint || !categoriesData) return;

  const maxNum = Math.min(categoriesData.length, 9);
  if (maxNum > 0) {
    hint.innerHTML = `💡 Mẹo: Nhấn phím <kbd>1</kbd>-<kbd>${maxNum}</kbd> để chuyển nhanh giữa các categories.`;
  }
}

// ============ Content Loading ============

async function loadCategory(category) {
  const content = document.getElementById('content');

  // Show loading skeleton
  content.innerHTML = `
    <div class="skeleton-header"></div>
    <div class="skeleton-snippet"></div>
    <div class="skeleton-snippet"></div>
    <div class="skeleton-snippet"></div>
  `;

  updateActiveButton(category);
  setUrlCategory(category);

  try {
    const data = await fetchCategoryData(category);
    renderSnippets(category, data);
    attachCopyHandlers(content);
  } catch (error) {
    content.innerHTML = '<p class="error-msg">Error loading category.</p>';
    console.error(error);
  }
}

function renderSnippets(category, data) {
  const content = document.getElementById('content');
  const label = getCategoryLabel(category);
  const icon = getCategoryIcon(category);

  content.innerHTML = `<h2>${icon} ${escapeHtml(label)}</h2>`;

  const visibleItems = data.filter(item => item.is_show !== false);

  if (visibleItems.length === 0) {
    content.innerHTML += '<p class="empty-msg">No snippets available.</p>';
    return;
  }

  visibleItems.forEach(item => {
    const block = document.createElement('div');
    block.className = 'snippet';
    block.innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <pre><code>${escapeHtml(item.command)}</code></pre>
      ${item.details ? `<p class="details">${sanitizeDetails(item.details)}</p>` : ''}
      <button class="copy-btn" aria-label="Copy command">
        <span class="copy-icon">📋</span> Copy
      </button>
    `;
    content.appendChild(block);
  });
}

function attachCopyHandlers(container) {
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const snippet = e.target.closest('.snippet');
      const codeEl = snippet?.querySelector('pre > code');
      const text = codeEl?.innerText || '';
      if (!text) return;

      try {
        await copyToClipboard(text);
        btn.innerHTML = '<span class="copy-icon">✅</span> Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<span class="copy-icon">📋</span> Copy';
          btn.classList.remove('copied');
        }, 1500);
      } catch (err) {
        console.error('Copy failed', err);
        btn.innerHTML = '<span class="copy-icon">❌</span> Failed';
        setTimeout(() => {
          btn.innerHTML = '<span class="copy-icon">📋</span> Copy';
        }, 1500);
      }
    });
  });
}

// ============ Initialize ============

document.addEventListener('DOMContentLoaded', loadCategories);

// Handle browser back/forward
window.addEventListener('popstate', () => {
  const cat = getUrlCategory();
  if (cat && categoriesData?.find(c => c.id === cat)) {
    loadCategory(cat);
  }
});
