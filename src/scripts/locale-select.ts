for (const select of document.querySelectorAll<HTMLSelectElement>('[data-locale-select]')) {
  select.addEventListener('change', () => {
    const option = select.selectedOptions[0];
    if (!option?.dataset.href) return;
    const url = new URL(option.dataset.href, window.location.origin);
    url.hash = window.location.hash;
    window.location.assign(url.href);
  });
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-load-embed]')) {
  button.addEventListener('click', () => {
    if (!button.dataset.loadEmbed) return;
    const frame = document.createElement('iframe');
    frame.src = button.dataset.loadEmbed;
    frame.title = button.dataset.frameTitle || '';
    frame.referrerPolicy = 'no-referrer';
    frame.allowFullscreen = true;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    button.replaceWith(frame);
  }, { once: true });
}
