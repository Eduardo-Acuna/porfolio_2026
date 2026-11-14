(() => {
  let theme;
  try { theme = localStorage.getItem('portfolio-theme'); } catch { /* Storage may be disabled. */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;

  // Reveal only on slower loads; the page stays usable without JavaScript.
  let finished = document.readyState === 'complete';
  let revealTimer;
  let cutoffTimer;
  const dismissLoader = () => {
    finished = true;
    clearTimeout(revealTimer);
    clearTimeout(cutoffTimer);
    document.documentElement.classList.remove('page-is-loading');
    const loader = document.getElementById('pageLoader');
    if (loader) loader.hidden = true;
  };
  window.addEventListener('load', dismissLoader, {once: true});
  window.addEventListener('pageshow', event => {
    if (event.persisted) dismissLoader();
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (finished) return;
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    revealTimer = setTimeout(() => {
      if (finished) return;
      loader.hidden = false;
      document.documentElement.classList.add('page-is-loading');
    }, 180);
    cutoffTimer = setTimeout(dismissLoader, 10000);
  }, {once: true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') dismissLoader();
  });
})();
