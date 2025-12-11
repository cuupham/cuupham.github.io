async function loadCategory(category) {
  const content = document.getElementById("content");
  content.innerHTML = `<p>Loading...</p>`;

  try {
    const res = await fetch(`assets/data/${category}.json`);
    const data = await res.json();

    content.innerHTML = `<h2>${category.toUpperCase()}</h2>`;

    data.forEach(item => {
      const block = document.createElement("div");
      block.className = "snippet";

      block.innerHTML = `
        <h3>${item.title}</h3>
        <pre><code>${item.content}</code></pre>
      `;

      content.appendChild(block);
    });
  } catch (error) {
    content.innerHTML = `<p>Error loading category.</p>`;
  }
}
