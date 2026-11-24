(() => {
  const key = 'sc-color-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;
  const chromeColor = document.querySelector('meta[name="theme-color"]');
  let preference;
  let button;

  function render() {
    const dark = preference === 'dark' || (preference !== 'light' && system.matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    chromeColor.content = dark ? '#302439' : '#f8f8f6';
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Attiva tema chiaro' : 'Attiva tema scuro';
    }
  }

  function restore() {
    try { preference = localStorage.getItem(key); } catch {}
    render();
  }

  restore();
  system.addEventListener('change', render);
  window.addEventListener('pageshow', restore);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) restore();
  });
  document.addEventListener('DOMContentLoaded', () => {
    button = document.querySelector('.theme-toggle');
    render();
    button.hidden = false;
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch {}
      render();
    });
  });
})();
