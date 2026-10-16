(() => {
  "use strict";
  const initialLanguage = document.documentElement.lang;
  const translations = window.CPM_TRANSLATIONS || {};
  const selectors = [...document.querySelectorAll("[data-language]")];
  const originalLabels = new Map(selectors.map(select => [select, select.getAttribute("aria-label")]));
  const nodes = [...document.querySelectorAll("[data-t]")];
  const originals = new Map(nodes.map(node => [node, node.textContent]));
  function setLanguage(language) {
    if (language !== initialLanguage && !translations[language]) return;
    const copy = translations[language] || {};
    document.documentElement.lang = language;
    nodes.forEach(node => { node.textContent = copy[node.dataset.t] ?? originals.get(node); });
    selectors.forEach(select => {
      select.value = language;
      select.setAttribute("aria-label", copy.language ?? originalLabels.get(select));
    });
  }
  selectors.forEach(select => {
    select.value = initialLanguage;
    select.addEventListener("change", () => setLanguage(select.value));
  });
})();
