const copyEmail = document.querySelector('[data-copy-email]');
const email = document.querySelector('.contact-list a[href^="mailto:"]');
const status = document.querySelector('[data-copy-status]');
copyEmail.hidden = false;
copyEmail.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email.textContent.trim());
    status.textContent = 'Email copiata.';
  } catch {
    status.textContent = 'Puoi copiare l’indirizzo email qui sopra.';
  }
});

for (const gallery of document.querySelectorAll('[data-gallery]')) {
  const slides = gallery.querySelector('.project-media').children;
  const controls = gallery.querySelector('.trip-controls');
  const [previous, next] = controls.querySelectorAll('button');
  const counter = controls.querySelector('span');
  const enlarge = gallery.querySelector('.enlarge-shot');
  let current = 0;

  function showSlide(step) {
    slides[current].hidden = true;
    current = (current + step + slides.length) % slides.length;
    slides[current].hidden = false;
    const caption = slides[current].dataset.caption;
    const prefix = caption ? caption + ' · ' : gallery.dataset.gallery + ' ';
    counter.textContent = prefix + (current + 1) + ' di ' + slides.length;
    if (enlarge) enlarge.href = slides[current].href;
  }

  previous.addEventListener('click', () => showSlide(-1));
  next.addEventListener('click', () => showSlide(1));
  controls.hidden = false;
}

const appGallery = document.querySelector('.app-gallery');
const viewer = document.querySelector('.shot-viewer');
const fullShot = viewer.querySelector('img');
let opener;

appGallery.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
      typeof viewer.showModal !== 'function') return;
  event.preventDefault();
  const slide = appGallery.querySelector('.project-media a:not([hidden])');
  fullShot.src = slide.href;
  fullShot.alt = slide.querySelector('img').alt;
  viewer.querySelector('#shot-title').textContent = slide.dataset.caption;
  opener = link;
  viewer.showModal();
});

viewer.addEventListener('close', () => opener?.focus({preventScroll: true}));
