(() => {
  const THEME_ORDER = Object.freeze(['light', 'dark', 'system']);
  const TYPEAHEAD_TIMEOUT = 700;
  const ICONS = Object.freeze({
    language: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.4 2.4 3.6 9 0 9s-2.4 6.6-3.6 9c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3Z"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6a8.5 8.5 0 1 0 11.6 11.6Z"/></svg>',
    system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 18v3"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  });

  let openControl = null;

  function createIcon(name) {
    const icon = document.createElement('span');
    icon.className = 'control-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = ICONS[name] || '';
    return icon;
  }

  function getOptions(select) {
    return Array.from(select.options).map((option) => ({
      value: option.value,
      label: option.textContent.trim(),
    }));
  }

  function getOptionElements(control) {
    return Array.from(control.querySelectorAll('[role="option"]'));
  }

  function getActiveIndex(control) {
    const button = control.querySelector('.control-trigger');
    const activeId = button?.getAttribute('aria-activedescendant');
    const options = getOptionElements(control);
    const index = options.findIndex((option) => option.id === activeId);
    return index >= 0 ? index : 0;
  }

  function getSelectedIndex(control) {
    const select = control.querySelector('select[data-control]');
    const options = getOptionElements(control);
    if (!select || !options.length) return 0;
    const index = options.findIndex((option) => option.dataset.value === select.value);
    return index >= 0 ? index : 0;
  }

  function setActiveOption(control, index) {
    const button = control.querySelector('.control-trigger');
    const options = getOptionElements(control);
    if (!button || !options.length) return;

    const next = options[Math.min(options.length - 1, Math.max(0, index))];
    button.setAttribute('aria-activedescendant', next.id);
    options.forEach((option) => {
      const active = option === next;
      option.classList.toggle('is-active', active);
      option.setAttribute('aria-selected', String(active));
    });
    next.scrollIntoView({ block: 'nearest' });
  }

  function syncControl(control) {
    const select = control.querySelector('select[data-control]');
    const button = control.querySelector('.control-trigger');
    const value = select?.value;
    const option = select?.selectedOptions[0];
    if (!select || !button || !option) return;

    button.querySelector('.control-value').textContent = option.textContent.trim();
    button.setAttribute('aria-label', select.getAttribute('aria-label') || '');

    if (select.dataset.control === 'theme') {
      button.querySelector('.control-icon').innerHTML = ICONS[value] || ICONS.system;
    }

    control.querySelectorAll('[role="option"]').forEach((item) => {
      const sourceOption = Array.from(select.options).find((source) => source.value === item.dataset.value);
      const selected = item.dataset.value === value;
      if (sourceOption) item.textContent = sourceOption.textContent.trim();
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(control.classList.contains('is-open')
        ? item.classList.contains('is-active')
        : selected));
    });
  }

  function closeControl(control, { restoreFocus = false } = {}) {
    if (!control) return;
    const button = control.querySelector('.control-trigger');
    const list = control.querySelector('[role="listbox"]');
    const select = control.querySelector('select[data-control]');
    control.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
    button?.removeAttribute('aria-activedescendant');
    list?.setAttribute('hidden', '');
    getOptionElements(control).forEach((option) => {
      option.classList.remove('is-active');
      option.setAttribute('aria-selected', String(option.dataset.value === select?.value));
    });
    if (openControl === control) openControl = null;
    if (restoreFocus) button?.focus();
  }

  function closeOpenControl(options) {
    closeControl(openControl, options);
  }

  function openControlMenu(control, initialIndex) {
    if (openControl && openControl !== control) closeOpenControl();

    const select = control.querySelector('select[data-control]');
    const button = control.querySelector('.control-trigger');
    const list = control.querySelector('[role="listbox"]');
    if (!select || !button || !list) return;

    control.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    list.removeAttribute('hidden');
    openControl = control;

    const selectedIndex = getSelectedIndex(control);
    setActiveOption(control, initialIndex ?? selectedIndex);
  }

  function chooseOption(control, value, { restoreFocus = true } = {}) {
    const select = control.querySelector('select[data-control]');
    if (!select || !Array.from(select.options).some((option) => option.value === value)) return;

    if (select.value !== value) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    syncControl(control);
    closeControl(control, { restoreFocus });
  }

  function moveActiveOption(control, direction) {
    const options = getOptionElements(control);
    if (!options.length) return;
    setActiveOption(control, getActiveIndex(control) + direction);
  }

  function focusEdgeOption(control, last) {
    const options = getOptionElements(control);
    if (options.length) setActiveOption(control, last ? options.length - 1 : 0);
  }

  function findTypeaheadOption(control, key) {
    const state = control._typeahead || { buffer: '', lastKey: '', lastTime: 0 };
    const now = Date.now();
    const lowerKey = key.toLocaleLowerCase();
    const expired = now - state.lastTime > TYPEAHEAD_TIMEOUT;
    const nextBuffer = expired ? lowerKey : `${state.buffer}${lowerKey}`;
    const options = getOptionElements(control);
    const labels = options.map((option) => option.textContent.trim().toLocaleLowerCase());

    const start = getActiveIndex(control);
    let match = labels.findIndex((label) => label.startsWith(nextBuffer));

    if (match < 0 && !expired) {
      match = labels.findIndex((label) => label.startsWith(lowerKey));
    }

    if (match < 0) return null;

    if (!expired && nextBuffer.length === 1 && state.lastKey === lowerKey) {
      for (let offset = 1; offset <= options.length; offset += 1) {
        const candidate = (start + offset) % options.length;
        if (labels[candidate].startsWith(lowerKey)) {
          match = candidate;
          break;
        }
      }
    }

    control._typeahead = { buffer: nextBuffer, lastKey: lowerKey, lastTime: now };
    return match;
  }

  function handleTypeahead(event, control) {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return false;
    const match = findTypeaheadOption(control, event.key);
    if (match === null) return false;
    event.preventDefault();
    if (!control.classList.contains('is-open')) openControlMenu(control, match);
    else setActiveOption(control, match);
    return true;
  }

  function handleKeydown(event, control) {
    const button = control.querySelector('.control-trigger');
    const activeOption = getOptionElements(control).find(
      (option) => option.id === button?.getAttribute('aria-activedescendant'),
    );

    if (event.target === button) {
      if (handleTypeahead(event, control)) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          openControlMenu(control);
          break;
        case 'ArrowDown':
          event.preventDefault();
          openControlMenu(control, getSelectedIndex(control));
          break;
        case 'ArrowUp':
          event.preventDefault();
          openControlMenu(control, 0);
          break;
        case 'Home':
          event.preventDefault();
          openControlMenu(control, 0);
          break;
        case 'End':
          event.preventDefault();
          openControlMenu(control, getOptionElements(control).length - 1);
          break;
        case 'Escape':
          if (control.classList.contains('is-open')) {
            event.preventDefault();
            closeControl(control, { restoreFocus: true });
          }
          break;
        default:
          break;
      }
      return;
    }

    if (!control.classList.contains('is-open') || !activeOption) return;
    if (handleTypeahead(event, control)) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActiveOption(control, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActiveOption(control, -1);
        break;
      case 'Home':
        event.preventDefault();
        focusEdgeOption(control, false);
        break;
      case 'End':
        event.preventDefault();
        focusEdgeOption(control, true);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        chooseOption(control, activeOption.dataset.value);
        break;
      case 'Escape':
        event.preventDefault();
        closeControl(control, { restoreFocus: true });
        break;
      case 'Tab':
        chooseOption(control, activeOption.dataset.value, { restoreFocus: false });
        break;
      default:
        break;
    }
  }

  function createCustomControl(select) {
    const control = document.createElement('div');
    control.className = 'custom-select';
    control.dataset.control = select.dataset.control;
    control._typeahead = { buffer: '', lastKey: '', lastTime: 0 };

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'control-trigger';
    button.setAttribute('role', 'combobox');
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');

    const iconName = select.dataset.control === 'language' ? 'language' : select.value;
    button.appendChild(createIcon(iconName));

    const value = document.createElement('span');
    value.className = 'control-value';
    button.appendChild(value);

    const chevron = document.createElement('span');
    chevron.className = 'control-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.innerHTML = ICONS.chevron;
    button.appendChild(chevron);

    const list = document.createElement('ul');
    list.className = 'control-menu';
    list.id = `${select.dataset.control}-menu`;
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', select.getAttribute('aria-label') || 'Options');
    list.hidden = true;
    button.setAttribute('aria-controls', list.id);

    getOptions(select).forEach((option, index) => {
      const item = document.createElement('li');
      item.className = 'control-option';
      item.id = `${select.dataset.control}-option-${index}`;
      item.dataset.value = option.value;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.tabIndex = -1;
      item.textContent = option.label;
      item.addEventListener('click', () => chooseOption(control, option.value));
      list.appendChild(item);
    });

    select.hidden = true;
    select.setAttribute('aria-hidden', 'true');
    select.tabIndex = -1;
    control.append(select, button, list);

    button.addEventListener('click', () => {
      if (control.classList.contains('is-open')) closeControl(control);
      else openControlMenu(control);
    });

    select.addEventListener('change', () => syncControl(control));
    control.addEventListener('keydown', (event) => handleKeydown(event, control));
    syncControl(control);

    return control;
  }

  function orderThemeOptions() {
    const theme = document.querySelector('[data-control="theme"]');
    if (!theme) return;

    const options = Array.from(theme.options);
    options.sort((a, b) => THEME_ORDER.indexOf(a.value) - THEME_ORDER.indexOf(b.value));
    options.forEach((option) => theme.appendChild(option));
  }

  function enhanceControls() {
    const controls = document.querySelector('.site-controls');
    if (!controls || controls.dataset.customized === 'true') return;

    orderThemeOptions();
    controls.querySelectorAll('select[data-control]').forEach((select) => {
      const custom = createCustomControl(select);
      const group = select.closest('.control-group');
      if (group) group.replaceChildren(custom);
      else select.replaceWith(custom);
    });

    controls.dataset.customized = 'true';
  }

  document.addEventListener('click', (event) => {
    if (openControl && !openControl.contains(event.target)) closeOpenControl();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOpenControl();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceControls, { once: true });
  } else {
    enhanceControls();
  }
})();
