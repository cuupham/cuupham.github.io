document.querySelectorAll('.card').forEach(card => {
  const btn = card.querySelector('.copy');
  const codeEl = card.querySelector('pre code');

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeEl.innerText);
      btn.innerText = 'Copied!';
      setTimeout(() => btn.innerText = 'Copy', 900);
    } catch (e) {
      console.error(e);
    }
  });
});
