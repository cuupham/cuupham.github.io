/* Static mock navigation only; production routes and dictionaries belong to Astro. */
(() => {
  "use strict";
  const select = document.querySelector("[data-review-locale]");
  if (select) {
    select.value = document.documentElement.lang;
    select.addEventListener("change", () => {
      const option = select.selectedOptions[0];
      const target = new URL(option.dataset.href, location.href);
      target.hash = location.hash;
      location.assign(target.href);
    });
  }
  document.querySelectorAll("[data-locale-link], [data-variant-link]").forEach(link => {
    const target = new URL(link.href);
    target.hash = location.hash;
    link.href = target.href;
  });
  document.querySelectorAll("[data-load-embed]").forEach(button => {
    button.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.src = button.dataset.loadEmbed;
      frame.title = button.dataset.frameTitle;
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      const box = button.closest(".embed-box");
      button.replaceWith(frame);
      const status = box.querySelector("[role=status]");
      status.textContent = document.documentElement.lang === "en" ? "External video loaded." : "Đã tải video bên ngoài.";
    }, { once: true });
  });
})();
