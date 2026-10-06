(() => {
  'use strict';
  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motionQuery.matches;
  try { paused = motionQuery.matches || localStorage.getItem('sc-motion-paused') === 'true'; } catch {}
  const motionButton = document.querySelector('.motion-toggle');
  const setMotion = (value) => {
    paused = value;
    root.classList.toggle('motion-paused', value);
    root.classList.toggle('js-motion', !value);
    motionButton.setAttribute('aria-pressed', String(value));
    motionButton.textContent = value ? 'Attiva animazioni' : 'Pausa animazioni';
  };
  setMotion(paused);
  motionButton.addEventListener('click', () => {
    setMotion(!paused);
    try { localStorage.setItem('sc-motion-paused', String(paused)); } catch {}
  });
  motionQuery.addEventListener('change', event => setMotion(event.matches));
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  const sections = [...document.querySelectorAll('.section-theme')];
  sections.forEach(section => section.style.setProperty('--section-accent', section.dataset.accent));
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    reveals.forEach(element => observer.observe(element));
  } else reveals.forEach(element => element.classList.add('is-visible'));
  const progress = document.querySelector('.reading-progress');
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  let pending = false;
  function syncScroll() {
    const at = window.innerHeight * .45;
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= at) current = section; });
    root.style.setProperty('--accent', current.dataset.accent);
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
    let active = current.id;
    if (['design', 'video', 'web', 'tech', 'turismo'].includes(active)) active = 'competenze';
    navLinks.forEach(link => {
      if (link.hash === '#' + active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    pending = false;
  }
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(syncScroll); } }, { passive: true });
  addEventListener('resize', syncScroll);
  syncScroll();
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  function closeMenu(focus) {
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Apri menu');
    if (focus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)));
  addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) closeMenu(true); });
  document.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu(false); });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(false); });
  const role = document.querySelector('.role-word');
  const roles = ['Designer', 'Video editor', 'Web creator', 'Supporto tech', 'Tour coordinator'];
  let roleIndex = 0;
  setInterval(() => {
    if (paused || document.hidden) return;
    role.classList.add('changing');
    setTimeout(() => { roleIndex = (roleIndex + 1) % roles.length; role.textContent = roles[roleIndex]; role.classList.remove('changing'); }, 180);
  }, 3000);
  const toast = document.querySelector('.toast');
  let toastTimer;
  const notify = message => {
    clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
  };
  document.querySelector('[data-copy-email]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('stefanocaccamo1@outlook.com');
      notify('Email copiata. A presto!');
    } catch { notify('Puoi copiare l’indirizzo email visibile qui sopra.'); }
  });
  document.querySelector('.print-button').addEventListener('click', () => window.print());
})();
