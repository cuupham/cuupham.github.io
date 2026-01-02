const cache = {};

function stripComments(text) {
  return text.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function loadCategory(category) {
  const content = document.getElementById("content");
  content.innerHTML = `<p>Loading...</p>`;

  try {
    let data;
    if (cache[category]) {
      data = cache[category];
    } else {
      const res = await fetch(`assets/posts/${category}_post.json`);
      if (!res.ok) throw new Error('Network response was not ok');
      const raw = await res.text();
      data = JSON.parse(stripComments(raw));
      cache[category] = data;
    }

    content.innerHTML = `<h2>${category.toUpperCase()}</h2>`;
    data.forEach(item => {
      if (item.is_show === false) return;
      const block = document.createElement("div");
      block.className = "snippet";
      block.innerHTML = `
        <h3>${escapeHtml(item.title)}</h3>
        <pre><code>${escapeHtml(item.command)}</code></pre>
        ${item.details ? `<p class="details">${item.details}</p>` : ''}
        <button class="copy-btn">Copy</button>
      `;
      content.appendChild(block);
    });

    // attach copy handlers
    content.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const snippet = e.target.closest('.snippet');
        const codeEl = snippet ? snippet.querySelector('pre > code') : null;
        const text = codeEl ? codeEl.innerText : '';
        if (!text) return;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
          }
          const prev = btn.textContent;
          btn.textContent = 'Copied';
          setTimeout(() => btn.textContent = prev || 'Copy', 1100);
        } catch (err) {
          console.error('Copy failed', err);
          btn.textContent = 'Copy failed';
          setTimeout(() => btn.textContent = 'Copy', 1100);
        }
      });
    });
  } catch (error) {
    content.innerHTML = `<p>Error loading category.</p>`;
    console.error(error);
  }
}
