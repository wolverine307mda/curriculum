// Currículum: tema compartido con el portfolio, cabecera, apariciones, línea de tiempo,
// visor de certificados e impresión. Sin dependencias.
(() => {
  const html = document.documentElement;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tema: modo día/noche/sistema y color (mismas claves que el portfolio) ---------- */
  const store = {
    get: (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  let mode = store.get('mode', 'system');
  let color = store.get('color', 'naranja');

  const render = () => {
    const dark = mode === 'dark' || (mode === 'system' && systemDark.matches);
    html.dataset.mode = dark ? 'dark' : 'light';
    html.dataset.color = color;
    document.querySelectorAll('[data-mode-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modeSet === mode)));
    document.querySelectorAll('[data-color-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.colorSet === color)));
    metaTheme.content = getComputedStyle(document.querySelector('.hero')).backgroundColor;
  };

  // El nuevo tema se abre en círculo desde el botón pulsado
  const applyTheme = (change, origin) => {
    const r = origin.getBoundingClientRect();
    html.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
    html.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    const run = () => { change(); render(); };
    if (document.startViewTransition && !reduced()) document.startViewTransition(run);
    else { html.classList.add('is-theming'); run(); setTimeout(() => html.classList.remove('is-theming'), 600); }
  };
  document.querySelectorAll('[data-mode-set]').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(() => { mode = btn.dataset.modeSet; store.set('mode', mode); }, btn));
  });
  document.querySelectorAll('[data-color-set]').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(() => { color = btn.dataset.colorSet; store.set('color', color); }, btn));
  });
  systemDark.addEventListener('change', () => { if (mode === 'system') render(); });
  render();

  /* ---------- Panel del pincel ---------- */
  const paletteBtn = document.querySelector('[data-palette-toggle]');
  const palette = document.getElementById('palette');
  const setPalette = (open) => {
    palette.hidden = !open;
    palette.classList.toggle('is-open', open);
    paletteBtn.setAttribute('aria-expanded', String(open));
    if (open) palette.querySelector('[aria-pressed="true"], button')?.focus({ preventScroll: true });
  };
  paletteBtn.addEventListener('click', () => setPalette(palette.hidden));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !palette.hidden) { setPalette(false); paletteBtn.focus(); } });
  document.addEventListener('pointerdown', (e) => {
    if (!palette.hidden && !palette.contains(e.target) && !paletteBtn.contains(e.target)) setPalette(false);
  });

  /* ---------- Cabecera: fondo al salir de la portada, se esconde al bajar ---------- */
  const top = document.querySelector('[data-top]');
  const hero = document.querySelector('.hero');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    top.classList.toggle('is-stuck', y > hero.offsetHeight - 80);
    top.classList.toggle('is-hidden', y > lastY && y > 160 && palette.hidden);
    lastY = y;
    growTimeline();
  };

  /* ---------- Línea de tiempo: se dibuja al bajar ---------- */
  const timeline = document.querySelector('[data-timeline]');
  const growTimeline = () => {
    if (reduced()) return;
    const r = timeline.getBoundingClientRect();
    const g = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    timeline.style.setProperty('--grow', g.toFixed(3));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Apariciones al entrar en pantalla ---------- */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); reveal.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));

  /* ---------- Visor de certificados ---------- */
  const viewer = document.querySelector('[data-viewer]');
  const vImg = viewer.querySelector('[data-viewer-img]');
  const vName = viewer.querySelector('[data-viewer-name]');
  document.querySelectorAll('[data-cert]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.querySelector('.cert__name').textContent;
      vImg.src = btn.dataset.cert;
      vImg.alt = `Certificado del curso ${name}`;
      vName.textContent = `${name} · ${btn.querySelector('.cert__meta').textContent}`;
      viewer.showModal();
    });
  });
  viewer.querySelector('[data-viewer-close]').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });

  /* ---------- Imprimir y año ---------- */
  document.querySelector('[data-print]').addEventListener('click', () => {
    // al imprimir todo tiene que estar visible, aunque no se haya llegado con el scroll
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    print();
  });
  addEventListener('beforeprint', () => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in')));
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
})();
