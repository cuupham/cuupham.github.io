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
      btn.addEventListener('click', (e) => {
        const codeEl = e.target.previousElementSibling.querySelector('code');
        const text = codeEl ? codeEl.innerText : '';
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(() => {
            const prev = btn.textContent;
            btn.textContent = 'Copied';
            setTimeout(() => btn.textContent = prev || 'Copy', 1500);
          }).catch(() => {
            btn.textContent = 'Copy failed';
            setTimeout(() => btn.textContent = 'Copy', 1500);
          });
        }
      });
    });
  } catch (error) {
    content.innerHTML = `<p>Error loading category.</p>`;
    console.error(error);
  }
}
