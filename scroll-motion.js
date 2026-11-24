'use strict';

(() => {
  const main = document.querySelector('#main') || document.querySelector('main');
  if (!main || !('IntersectionObserver' in window)) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const EXCLUDE_ANCESTOR =
    '[data-no-scroll-reveal], nav, dialog, #opening, .opening, .guestbook-list, #gift-details, #music-toggle, #toast';
  const ATOMIC_SELECTOR =
    '.couple-portrait, .photo-button, .keepsake-item, .closing-medallion, .countdown-grid > div, .swatches > div, button, a';
  const TARGET_SELECTOR = [
    ATOMIC_SELECTOR,
    '.ornament',
    '.small-symbol',
    '.hanging-fixture',
    '.rsvp-seal',
    '.dress-fan',
    '.portrait-flower',
    '.closing-fan',
    '.couple-knot-ornament',
    '.events-peony',
    '.events-tulip',
    '.story-peony',
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'p',
    'blockquote',
    '.couple-and',
    '.fine-rule',
    '.ornamental-rule',
    'form > label',
    'fieldset',
    'form > input',
    'form > select',
    'form > textarea',
  ].join(', ');
  const ASSET_SELECTOR =
    'img, .couple-portrait, .photo-button, .keepsake-item, .closing-medallion, .ornament, .small-symbol, .hanging-fixture, .rsvp-seal, .dress-fan, .portrait-flower, .closing-fan, .couple-knot-ornament, .events-peony, .events-tulip, .story-peony';

  let observer = null;
  let items = [];
  const timers = new Set();

  function clearTimers() {
    timers.forEach(id => clearTimeout(id));
    timers.clear();
  }

  function scheduleDone(el, delayMs) {
    const id = setTimeout(() => {
      timers.delete(id);
      if (el.dataset.sr === 'in') el.dataset.sr = 'done';
    }, delayMs + 860);
    timers.add(id);
  }

  function revealBatch(elements) {
    if (!elements.length) return;
    elements.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      if (Math.abs(ra.top - rb.top) > 16) return ra.top - rb.top;
      return ra.left - rb.left;
    });
    elements.forEach((el, idx) => {
      const delay = Math.min(idx * 80, 480);
      el.style.setProperty('--sr-delay', `${delay}ms`);
      el.dataset.sr = 'in';
      scheduleDone(el, delay);
    });
  }

  function setup() {
    if (observer) observer.disconnect();
    clearTimers();

    const active = !reducedMotion.matches && !main.inert;
    main.classList.add('sr-root');
    main.classList.toggle('sr-active', active);

    // Legacy scene transitions yield to individually staggered elements
    main.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right').forEach(el =>
      el.classList.add('visible')
    );

    if (!active) {
      items.forEach(el => {
        el.dataset.sr = 'done';
      });
      return;
    }

    const rootRect = main.getBoundingClientRect();
    const rootCenterX = rootRect.left + rootRect.width / 2;
    const candidates = [...main.querySelectorAll(TARGET_SELECTOR)];
    const selected = [];
    const selectedSet = new Set();

    for (const el of candidates) {
      if (el.closest(EXCLUDE_ANCESTOR)) continue;
      let ancestor = el.parentElement;
      let insideSelected = false;
      while (ancestor && ancestor !== main) {
        if (selectedSet.has(ancestor)) {
          insideSelected = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (insideSelected) continue;

      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (cs.position === 'fixed' || cs.position === 'sticky') continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;

      // Skip full-bleed section background artwork
      if (el.tagName === 'IMG' && cs.position === 'absolute') {
        const parent = el.offsetParent;
        if (parent) {
          const pr = parent.getBoundingClientRect();
          if (pr.width > 0 && pr.height > 0 && rect.width >= pr.width * 0.88 && rect.height >= pr.height * 0.88) {
            continue;
          }
        }
      }

      const hasTranslate = Boolean(cs.translate && cs.translate !== 'none');
      const hasScale = Boolean(cs.scale && cs.scale !== 'none');
      if (hasTranslate || hasScale) {
        el.dataset.srFade = 'true';
      } else if (el.matches(ASSET_SELECTOR)) {
        const dx = rect.left + rect.width / 2 - rootCenterX;
        el.style.setProperty('--sr-x', dx < -42 ? '-18px' : dx > 42 ? '18px' : '0px');
        el.style.setProperty('--sr-y', '20px');
        el.style.setProperty('--sr-scale', '0.95');
      } else {
        el.style.setProperty('--sr-x', '0px');
        el.style.setProperty('--sr-y', '18px');
        el.style.setProperty('--sr-scale', '1');
      }

      el.classList.add('sr-item');
      el.dataset.sr = rect.bottom < 0 ? 'done' : 'out';
      selected.push(el);
      selectedSet.add(el);
    }

    items = selected;
    observer = new IntersectionObserver(
      entries => {
        const entering = [];
        for (const entry of entries) {
          const el = entry.target;
          if (entry.isIntersecting) {
            if (el.dataset.sr === 'out') entering.push(el);
          } else if (
            entry.boundingClientRect.top >= innerHeight + 60 &&
            !el.matches(':focus-within') &&
            !el.matches('input, select, textarea')
          ) {
            el.style.setProperty('--sr-delay', '0ms');
            el.dataset.sr = 'out';
          }
        }
        if (entering.length) requestAnimationFrame(() => revealBatch(entering));
      },
      { threshold: 0.05, rootMargin: '0px 0px -24px 0px' }
    );

    items.forEach(el => observer.observe(el));
  }

  new MutationObserver(setup).observe(main, { attributes: true, attributeFilter: ['inert'] });
  reducedMotion.addEventListener('change', setup);
  main.addEventListener('focusin', e => {
    const item = e.target.closest?.('.sr-item');
    if (item && item.dataset.sr === 'out') {
      item.style.setProperty('--sr-delay', '0ms');
      item.dataset.sr = 'done';
    }
  });

  setup();
})();
