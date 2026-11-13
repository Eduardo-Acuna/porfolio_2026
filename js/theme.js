(() => {
  let theme;
  try { theme = localStorage.getItem('portfolio-theme'); } catch { /* Storage may be disabled. */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();
