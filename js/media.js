'use strict';
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navLinks');
  const toggle = document.getElementById('navToggle');
  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };
  toggle.addEventListener('click', () => toggle.setAttribute('aria-label', nav.classList.contains('open') ? 'Cerrar menú' : 'Abrir menú'));
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); toggle.focus(); }
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
  const loaderTemplate = document.querySelector('#pageLoader video');
  const animationTimers = new WeakMap();
  function scheduleAnimation(container) {
    animationTimers.set(container, setTimeout(() => {
      if (!container.closest('.is-loading') || container.querySelector('.loading-animation')) return;
      const animation = document.createElement('span');
      animation.className = 'loading-animation';
      animation.setAttribute('aria-hidden', 'true');
      const video = loaderTemplate.cloneNode(true);
      video.removeAttribute('src');
      animation.append(video);
      container.prepend(animation);
      window.portfolioLoading.start(video);
    }, 350));
  }
  const animationObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      animationObserver.unobserve(entry.target);
      scheduleAnimation(entry.target);
    }
  }) : null;
  function addLoadingAnimation(container) {
    if (!loaderTemplate || window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        window.navigator?.connection?.saveData) return;
    if (animationObserver) animationObserver.observe(container);
    else scheduleAnimation(container);
  }
  function removeLoadingAnimation(container) {
    animationObserver?.unobserve(container);
    clearTimeout(animationTimers.get(container));
    const animation = container.querySelector('.loading-animation');
    if (animation) {
      window.portfolioLoading.stop(animation.querySelector('video'));
      animation.remove();
    }
  }
  document.querySelectorAll('.cert-thumb, .proyecto-thumb, .foto-principal, .hero-illustration').forEach(frame => {
    const img = frame.querySelector('img');
    if (!img) return;
    const label = document.createElement('span');
    label.className = 'image-status';
    const message = document.createElement('span');
    message.className = 'image-status-text';
    message.textContent = 'Cargando imagen…';
    label.append(message);
    frame.append(label);
    const settle = () => {
      frame.classList.remove('is-loading');
      const failed = img.naturalWidth === 0;
      frame.classList.toggle('image-failed', failed);
      message.textContent = failed ? 'Vista previa no disponible' : '';
      removeLoadingAnimation(label);
    };
    img.addEventListener('load', settle);
    img.addEventListener('error', settle);
    if (img.complete) settle(); else {
      frame.classList.add('is-loading');
      addLoadingAnimation(label);
    }
  });
  const modal = document.getElementById('certModal');
  const slot = document.getElementById('modalMedia');
  const status = document.getElementById('modalStatus');
  const retry = document.getElementById('modalRetry');
  const details = document.getElementById('demoDetails');
  const demoTitle = document.getElementById('demoTitle');
  const demoDescription = document.getElementById('demoDescription');
  const demoTech = document.getElementById('demoTech');
  let current, opener, timer, generation = 0;
  function clear() {
    generation++;
    clearTimeout(timer);
    const video = slot.querySelector('video');
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    slot.replaceChildren();
    removeLoadingAnimation(status.parentElement);
  }
  function load() {
    clear();
    const request = generation;
    retry.hidden = true;
    modal.setAttribute('aria-busy', 'true');
    modal.classList.add('is-loading');
    addLoadingAnimation(status.parentElement);
    status.textContent = current.video ? 'Cargando demo…' : 'Cargando certificado…';
    const media = document.createElement(current.video ? 'video' : 'img');
    media.hidden = true;
    const failed = () => {
      if (request !== generation) return;
      clearTimeout(timer);
      modal.setAttribute('aria-busy', 'false');
      modal.classList.remove('is-loading');
      removeLoadingAnimation(status.parentElement);
      status.textContent = 'No se pudo cargar el archivo. Comprobá tu conexión y volvé a intentar.';
      retry.hidden = false;
    };
    media.addEventListener(current.video ? 'loadeddata' : 'load', () => {
      if (request !== generation) return;
      clearTimeout(timer);
      modal.setAttribute('aria-busy', 'false');
      modal.classList.remove('is-loading');
      removeLoadingAnimation(status.parentElement);
      media.hidden = false;
      status.textContent = '';
      retry.hidden = true;
      if (current.video) media.play().catch(() => {
        failed();
        status.textContent = 'El navegador bloqueó la reproducción. Tocá Reintentar para iniciar la demo.';
      });
    }, {once:true});
    media.addEventListener('error', failed, {once:true});
    if (current.video) {
      media.controls = false;
      media.disablePictureInPicture = true;
      media.disableRemotePlayback = true;
      media.tabIndex = -1;
      media.autoplay = true;
      media.muted = true;
      media.defaultMuted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = 'auto';
      media.setAttribute('aria-label', current.title);
    } else media.alt = current.title;
    slot.append(media);
    timer = setTimeout(failed, 30000);
    media.src = current.url;
  }
  document.querySelectorAll('.cert-card .link-arrow, .btn-demo[data-demo-video]').forEach(link => {
    link.addEventListener('click', e => {
      if (typeof modal.showModal !== 'function') return;
      const video = link.hasAttribute('data-demo-video');
      const url = new URL(video ? link.dataset.demoVideo : link.getAttribute('href'), location.href);
      const allowedFile = video ? /\.mp4$/i : /\.(?:webp|png|jpe?g)$/i;
      if (url.origin !== location.origin || !url.pathname.startsWith('/assets/img/') ||
          !allowedFile.test(url.pathname) || url.search || url.hash || url.username || url.password) return;
      e.preventDefault();
      opener = link;
      current = {video, url:url.href, title:video ? `Demo de ${link.closest('article').querySelector('h3').textContent}` : link.closest('.cert-card').querySelector('img').alt};
      document.getElementById('modalTitle').textContent = current.title;
      modal.classList.toggle('is-demo', video);
      details.hidden = !video;
      demoTech.replaceChildren();
      if (video) {
        const project = link.closest('.proyecto-card');
        demoTitle.textContent = project.querySelector('h3').textContent;
        demoDescription.textContent = project.querySelector('.proyecto-desc').textContent;
        demoTech.replaceChildren(...[...project.querySelectorAll('.proyecto-tech > li')].map(tag => tag.cloneNode(true)));
      }
      modal.showModal();
      document.body.classList.add('modal-open');
      load();
    });
  });
  retry.addEventListener('click', load);
  document.getElementById('certModalClose').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => {
    if (e.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  });
  modal.addEventListener('close', () => {
    clear();
    modal.classList.remove('is-demo', 'is-loading');
    modal.setAttribute('aria-busy', 'false');
    details.hidden = true;
    demoTitle.textContent = '';
    demoDescription.textContent = '';
    demoTech.replaceChildren();
    document.body.classList.remove('modal-open');
    opener?.focus();
  });
});
