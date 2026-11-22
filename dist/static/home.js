(() => {
  const intro = document.querySelector('#inizio');
  const services = document.querySelector('#servizi');
  const stage = document.querySelector('main');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active;
  let animations = [];
  let sequence = 0;
  let pauseMotion = false;
  try { pauseMotion = localStorage.getItem('sc-motion-paused') === 'true'; } catch {}

  window.addEventListener('sc-motion-change', event => { pauseMotion = event.detail; });
  window.addEventListener('storage', event => {
    if (event.key === 'sc-motion-paused') pauseMotion = event.newValue === 'true';
  });

  function showPanel() {
    const hash = location.hash;
    const oldSections = ['#profilo', '#design', '#video', '#web', '#tech', '#turismo', '#esperienze', '#progetti', '#contatti'];
    if (oldSections.includes(hash)) {
      location.replace('profilo.html' + hash);
      return;
    }
    const next = hash === '#servizi' || hash === '#competenze' ? services : intro;
    if (next === active) return;
    const previous = active;
    active = next;
    const version = ++sequence;
    for (const animation of animations) animation.cancel();
    animations = [];
    stage.classList.remove('in-motion');
    for (const panel of [intro, services]) {
      panel.classList.remove('departing');
      panel.hidden = panel !== next;
      panel.inert = panel !== next;
    }
    if (!previous) return;
    next.querySelector('h1, h2').focus({preventScroll: true});
    window.scrollTo(0, 0);
    if (reduced.matches || pauseMotion || !next.animate) return;

    const direction = next === services ? -1 : 1;
    previous.hidden = false;
    previous.classList.add('departing');
    stage.classList.add('in-motion');
    const slide = (panel, from, to) => panel.animate([
      {transform: 'translateX(' + from + '%)'},
      {transform: 'translateX(' + to + '%)'}
    ], {duration: 530, easing: 'cubic-bezier(.25,.76,.24,1)', fill: 'both'});
    animations = [slide(previous, 0, 105 * direction), slide(next, -105 * direction, 0)];
    Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (version !== sequence) return;
      previous.hidden = true;
      previous.classList.remove('departing');
      stage.classList.remove('in-motion');
      for (const animation of animations) animation.cancel();
      animations = [];
    });
  }

  window.addEventListener('hashchange', showPanel);
  showPanel();
})();
