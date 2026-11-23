const stage = document.querySelector('.knot-stage');
const intro = document.querySelector('#inizio');
const canvas = stage.querySelector('canvas');
const poster = stage.querySelector('img');
const button = stage.querySelector('.knot-motion');
const hint = stage.querySelector('.knot-hint');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionKey = 'sc-motion-paused';
const fullTurn = 2 * Math.PI;
let paused = reduced.matches;
try { paused ||= localStorage.getItem(motionKey) === 'true'; } catch {}

let scene;
let loading = false;
let failed = false;
let inView = false;
let pageActive = true;
let angle = 0;
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
  button.title = paused ? 'Avvia rotazione' : 'Pausa rotazione';
  button.setAttribute('aria-label', button.title);
}

function draw() {
  scene.render(angle);
  const degrees = Math.floor(((angle / fullTurn % 1 + 1) % 1) * 360);
  canvas.setAttribute('aria-valuenow', degrees);
  canvas.setAttribute('aria-valuetext', degrees + ' gradi');
  dirty = false;
}

function tick(now) {
  frame = 0;
  if (!visible() || !scene || failed) return;
  const turning = !paused && pointer === null;
  if (turning && lastTime !== null && now >= resumeAt) {
    angle += (now - Math.max(lastTime, resumeAt)) * fullTurn / 30000;
    dirty = true;
  }
  lastTime = now;
  if (dirty) draw();
  if (turning) frame = requestAnimationFrame(tick);
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

function rotate(radians) {
  angle += radians;
  dirty = true;
  resumeAt = performance.now() + 2000;
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
  rotate(dx / stage.clientWidth * fullTurn);
});
function release(event) {
  if (event.pointerId !== pointer) return;
  pointer = null;
  resumeAt = performance.now() + 2000;
  sync();
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
canvas.addEventListener('lostpointercapture', release);
canvas.addEventListener('keydown', event => {
  const step = Math.PI / 18;
  if (event.key === 'ArrowLeft') rotate(-step);
  else if (event.key === 'ArrowRight') rotate(step);
  else if (event.key === 'Home') rotate(-angle);
  else if (event.key === 'End') rotate(fullTurn * 359 / 360 - angle);
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
