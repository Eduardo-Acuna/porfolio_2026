(() => {
  let theme;
  try { theme = localStorage.getItem('portfolio-theme'); } catch { /* Storage may be disabled. */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;

  // Video keeps the original animation without downloading a multi-megabyte GIF.
  window.portfolioLoading = {
    start(video) {
      if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          window.navigator?.connection?.saveData) return;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'none';
      video.src = window.matchMedia('(max-width: 820px)').matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
      video.play().catch(() => {});
    },
    stop(video) {
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    },
  };

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
    if (loader) {
      loader.hidden = true;
      window.portfolioLoading.stop(loader.querySelector('video'));
    }
  };
  window.addEventListener('load', dismissLoader, {once: true});
  window.addEventListener('pageshow', event => {
    if (event.persisted) dismissLoader();
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (finished) return;
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    const hero = document.querySelector('.hero-name-img');
    if (!hero || hero.complete) { dismissLoader(); return; }
    hero.addEventListener('load', dismissLoader, {once: true});
    hero.addEventListener('error', dismissLoader, {once: true});
    revealTimer = setTimeout(() => {
      if (finished) return;
      loader.hidden = false;
      document.documentElement.classList.add('page-is-loading');
      window.portfolioLoading.start(loader.querySelector('video'));
    }, 180);
    // Do not wait for offscreen images, fonts or decorative backgrounds.
    cutoffTimer = setTimeout(dismissLoader, 1500);
  }, {once: true});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') dismissLoader();
  });
})();
