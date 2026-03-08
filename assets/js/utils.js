export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Copy failed', err);
    return false;
  }
}

export function getSkeletonHtml() {
  return `
  <div class="skeleton-header"></div>
  <div class="${CONFIG.SKELETON_BLOCK_CLASS}"></div>
  <div class="${CONFIG.SKELETON_BLOCK_CLASS}"></div>
  <div class="${CONFIG.SKELETON_BLOCK_CLASS}"></div>
`.trim();
}

export function updateActiveNavButton(activeNavId, dataKey, activeId) {
  ['category-nav', 'game-nav'].forEach((navId) => {
    const nav = document.getElementById(navId);
    if (!nav) return;
    nav.querySelectorAll('button').forEach((btn) => {
      if (navId === activeNavId) {
        btn.classList.toggle('active', btn.dataset[dataKey] === activeId);
      } else {
        btn.classList.remove('active');
      }
    });
  });
}

export function renderNavButtons(navId, data, dataKey, actionLabel, clickHandler) {
  const nav = document.getElementById(navId);
  if (!nav || !data?.length) return;
  nav.innerHTML = '';
  data.forEach((item) => {
    const btn = document.createElement('button');
    const icon = item.icon || CONFIG.DEFAULT_ICON;

    btn.innerHTML = `
      <span class="cat-icon">${icon}</span>
      <span class="cat-label">${escapeHtml(item.label)}</span>
    `;
    btn.dataset[dataKey] = item.id;
    btn.setAttribute('aria-label', `${actionLabel} ${item.label}`);
    btn.addEventListener('click', () => clickHandler(item.id));
    nav.appendChild(btn);
  });
}
