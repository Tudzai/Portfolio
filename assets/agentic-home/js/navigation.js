(() => {
  const toggles = [...document.querySelectorAll('[data-stage-menu-toggle], [data-menu-toggle], [data-mobile-menu-toggle], .mobile-menu-toggle')];

  toggles.forEach((toggle) => {
    const header = toggle.closest('header');
    const menu = header?.querySelector('[data-stage-menu], [data-mobile-nav], .mobile-nav') ?? document.querySelector('[data-stage-menu], [data-mobile-nav], .mobile-nav');
    if (!menu) return;

    const setState = (open, moveFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      menu.inert = !open;
      menu.classList.toggle('is-open', open);
      if (menu.matches('[data-stage-menu]')) {
        menu.hidden = !open;
      }
      if (open && moveFocus) menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])')?.focus();
    };

    setState(toggle.getAttribute('aria-expanded') === 'true');

    toggle.addEventListener('click', () => setState(toggle.getAttribute('aria-expanded') !== 'true', true));
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && !event.shiftKey && toggle.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])')?.focus();
      }
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setState(false)));

    document.addEventListener('pointerdown', (event) => {
      if (toggle.getAttribute('aria-expanded') === 'true' && event.target instanceof Element && !header?.contains(event.target)) {
        setState(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setState(false);
        toggle.focus();
      }
    });
  });
})();
