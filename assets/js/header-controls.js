(() => {
  const THEME_ORDER = Object.freeze(['light', 'dark', 'system']);
  const ICONS = Object.freeze({
    language: 'A文',
    light: '☼',
    dark: '☾',
    system: '◐',
  });

  let openControl = null;

  function createIcon(name) {
    const icon = document.createElement('span');
    icon.className = 'control-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = ICONS[name] || '';
    return icon;
  }

  function getOptions(select) {
    return Array.from(select.options).map((option) => ({
      value: option.value,
      label: option.textContent,
    }));
  }

  function syncControl(control) {
    const select = control.querySelector('select[data-control]');
    const button = control.querySelector('.control-trigger');
    const value = select?.value;
    const option = select?.selectedOptions[0];
    if (!select || !button || !option) return;

    button.querySelector('.control-value').textContent = option.textContent;
    button.setAttribute('aria-label', select.getAttribute('aria-label') || '');

    if (select.dataset.control === 'theme') {
      button.querySelector('.control-icon').textContent = ICONS[value] || ICONS.system;
    }

    control.querySelectorAll('[role="option"]').forEach((item) => {
      const sourceOption = Array.from(select.options).find((source) => source.value === item.dataset.value);
      const selected = item.dataset.value === value;
      if (sourceOption) item.textContent = sourceOption.textContent;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(selected));
    });
  }

  function closeControl(control) {
    if (!control) return;
    control.classList.remove('is-open');
    control.querySelector('.control-trigger')?.setAttribute('aria-expanded', 'false');
    const list = control.querySelector('[role="listbox"]');
    if (list) list.hidden = true;
    if (openControl === control) openControl = null;
  }

  function closeOpenControl() {
    closeControl(openControl);
  }

  function openControlMenu(control) {
    if (openControl && openControl !== control) closeOpenControl();

    const select = control.querySelector('select[data-control]');
    const button = control.querySelector('.control-trigger');
    const list = control.querySelector('[role="listbox"]');
    if (!select || !button || !list) return;

    control.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
    list.hidden = false;
    openControl = control;

    const selected = Array.from(list.querySelectorAll('[role="option"]'))
      .find((option) => option.dataset.value === select.value);
    selected?.focus();
  }

  function chooseOption(control, value) {
    const select = control.querySelector('select[data-control]');
    if (!select || !Array.from(select.options).some((option) => option.value === value)) return;

    if (select.value !== value) {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    syncControl(control);
    closeControl(control);
    control.querySelector('.control-trigger')?.focus();
  }

  function moveActiveOption(control, direction) {
    const options = Array.from(control.querySelectorAll('[role="option"]'));
    if (!options.length) return;

    const current = options.indexOf(document.activeElement);
    const next = current < 0 ? 0 : Math.min(options.length - 1, Math.max(0, current + direction));
    options[next].focus();
    options[next].scrollIntoView({ block: 'nearest' });
  }

  function focusEdgeOption(control, last) {
    const options = Array.from(control.querySelectorAll('[role="option"]'));
    if (options.length) options[last ? options.length - 1 : 0].focus();
  }

  function handleKeydown(event, control) {
    const button = control.querySelector('.control-trigger');
    const activeOption = document.activeElement?.closest?.('[role="option"]');

    if (event.target === button) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        openControlMenu(control);
      }
      return;
    }

    if (!control.classList.contains('is-open') || !activeOption) return;

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
        closeControl(control);
        button?.focus();
        break;
      case 'Tab':
        chooseOption(control, activeOption.dataset.value);
        break;
      default:
        break;
    }
  }

  function createCustomControl(select) {
    const control = document.createElement('div');
    control.className = 'custom-select';
    control.dataset.control = select.dataset.control;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'control-trigger';
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
    chevron.textContent = '⌄';
    button.appendChild(chevron);

    const list = document.createElement('ul');
    list.className = 'control-menu';
    list.id = `${select.dataset.control}-menu`;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    button.setAttribute('aria-controls', list.id);

    getOptions(select).forEach((option) => {
      const item = document.createElement('li');
      item.className = 'control-option';
      item.dataset.value = option.value;
      item.setAttribute('role', 'option');
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
