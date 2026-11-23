const stage = document.querySelector('.knot-stage');
const intro = document.querySelector('#inizio');
const canvas = stage.querySelector('canvas');
const poster = stage.querySelector('img');
const button = stage.querySelector('.knot-motion');
const hint = stage.querySelector('.knot-hint');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionKey = 'sc-motion-paused';
const cycleMs = 12000;
const releaseHoldMs = 2000;
const wrap = value => value - Math.floor(value);
let paused = reduced.matches;
try { paused ||= localStorage.getItem(motionKey) === 'true'; } catch {}

let scene;
let loading = false;
let failed = false;
let inView = false;
let pageActive = true;
let phase = 0;
let pointer = null;
let lastX = 0;
let resumeAt = 0;
let frame = 0;
let lastTime = null;
let dirty = true;

function visible() {
  return inView && pageActive && !intro.inert && !intro.hidden && !document.hidden;
}

function updateControl() {
  button.toggleAttribute('data-paused', paused);
  button.title = paused ? 'Avvia movimento' : 'Pausa movimento';
  button.setAttribute('aria-label', button.title);
}

function draw() {
  scene.render(phase);
  const percent = Math.round(phase * 100);
  canvas.setAttribute('aria-valuenow', percent);
  canvas.setAttribute('aria-valuetext', percent + '% del ciclo');
  dirty = false;
}

function tick(now) {
  frame = 0;
  if (!visible() || !scene || failed) return;
  const flowing = !paused && pointer === null;
  if (flowing && lastTime !== null && now >= resumeAt) {
    phase = wrap(phase + (now - Math.max(lastTime, resumeAt)) / cycleMs);
    dirty = true;
  }
  lastTime = now;
  if (dirty) draw();
  if (flowing) frame = requestAnimationFrame(tick);
}

async function sync() {
  cancelAnimationFrame(frame);
  frame = 0;
  lastTime = null;
  if (!visible() || failed) return;
  if (!scene) {
    if (loading) return;
    loading = true;
    try {
      const {createKnotScene} = await import('./knot-scene.js');
      if (!visible()) return;
      scene = createKnotScene(canvas);
      scene.resize(stage.clientWidth, devicePixelRatio);
      draw();
      canvas.tabIndex = 0;
      canvas.hidden = false;
      poster.hidden = true;
      button.hidden = hint.hidden = false;
      updateControl();
    } catch {
      showPoster();
      return;
    } finally {
      loading = false;
    }
  }
  frame = requestAnimationFrame(tick);
}

function showPoster() {
  failed = true;
  cancelAnimationFrame(frame);
  frame = 0;
  canvas.hidden = button.hidden = hint.hidden = true;
  poster.hidden = false;
}

function pull(distance) {
  phase = wrap(phase + distance);
  dirty = true;
  resumeAt = performance.now() + releaseHoldMs;
  sync();
}

button.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem(motionKey, String(paused)); } catch {}
  window.dispatchEvent(new CustomEvent('sc-motion-change', {detail: paused}));
  updateControl();
  sync();
});
reduced.addEventListener('change', () => {
  paused = reduced.matches;
  try { paused ||= localStorage.getItem(motionKey) === 'true'; } catch {}
  updateControl();
  sync();
});
window.addEventListener('storage', event => {
  if (event.key !== motionKey) return;
  paused = reduced.matches || event.newValue === 'true';
  updateControl();
  sync();
});
canvas.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || pointer !== null) return;
  pointer = event.pointerId;
  lastX = event.clientX;
  canvas.setPointerCapture(pointer);
  sync();
});
canvas.addEventListener('pointermove', event => {
  if (event.pointerId !== pointer) return;
  const dx = event.clientX - lastX;
  lastX = event.clientX;
  const width = canvas.getBoundingClientRect().width;
  pull(dx / width);
});
function release(event) {
  if (event.pointerId !== pointer) return;
  pointer = null;
  resumeAt = performance.now() + releaseHoldMs;
  sync();
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('lostpointercapture', release);
canvas.addEventListener('keydown', event => {
  const step = .025;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    pull(step * direction);
  } else if (event.key === 'Home') pull(-phase);
  else if (event.key === 'End') pull(.999 - phase);
  else return;
  event.preventDefault();
});
canvas.addEventListener('webglcontextlost', showPoster);
new ResizeObserver(() => {
  if (scene && stage.clientWidth && !failed) {
    scene.resize(stage.clientWidth, devicePixelRatio);
    dirty = true;
    sync();
  }
}).observe(stage);
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  sync();
}).observe(stage);
new MutationObserver(sync).observe(intro, {attributes: true, attributeFilter: ['hidden', 'inert']});
document.addEventListener('visibilitychange', sync);
window.addEventListener('pagehide', () => { pageActive = false; sync(); });
window.addEventListener('pageshow', () => { pageActive = true; sync(); });
