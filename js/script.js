// ============ SCRIPT PRINCIPAL DEL PORTAFOLIO ============

document.addEventListener('DOMContentLoaded', () => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => motion.matches ? 'auto' : 'smooth';
  // ============ MENÚ MÓVIL ============
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============ MODO CLARO / OSCURO ============
  const themeToggle = document.getElementById('themeToggle');
  const rootEl = document.documentElement;
  let themeTimer;

  function applyTheme(theme){
    const isDark = theme === 'dark';
    rootEl.setAttribute('data-theme', theme);
    if (themeToggle){
      const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
      themeToggle.setAttribute('aria-checked', String(isDark));
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
  }

  applyTheme(rootEl.dataset.theme);

  if (themeToggle){
    themeToggle.addEventListener('click', () => {
      // La clase habilita una transición suave de colores solo durante el cambio
      rootEl.classList.add('theme-transition');
      applyTheme(rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem('portfolio-theme', rootEl.dataset.theme); } catch {}
      clearTimeout(themeTimer);
      themeTimer = setTimeout(() => rootEl.classList.remove('theme-transition'), 450);
    });
  }

  // ============ CARRUSELES (CERTIFICADOS Y PROYECTOS) ============

  function positions(track) {
    const cards = [...track.children];
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const first = cards[0].getBoundingClientRect().left;
    const values = [...new Set(cards.map(card => Math.round(Math.min(max, Math.max(0, card.getBoundingClientRect().left - first)))))];
    if (values[values.length - 1] !== max) values.push(max);
    return values;
  }
  function nearest(track, values) {
    return values.reduce((best, value, i) => Math.abs(value - track.scrollLeft) < Math.abs(values[best] - track.scrollLeft) ? i : best, 0);
  }
  function makeScrollByCard(track) {
    return direction => {
      if (!track) return;
      const values = positions(track);
      const index = Math.max(0, Math.min(values.length - 1, nearest(track, values) + direction));
      track.scrollTo({left: values[index], behavior: scrollBehavior()});
    };
  }
  function setupCarouselDots(track, dots) {
    if (!track || !dots) return;
    const prev = document.getElementById(track.id === 'certTrack' ? 'certPrev' : 'proyPrev');
    const next = document.getElementById(track.id === 'certTrack' ? 'certNext' : 'proyNext');
    let values = [];
    function update() {
      const index = nearest(track, values);
      const firstVisible = Math.max(0, Math.min(index - 3, values.length - 7));
      [...dots.children].forEach((dot,i) => {
        // Keep long certificate carousels compact, with the current position visible.
        dot.hidden = i < firstVisible || i >= firstVisible + 7;
        dot.classList.toggle('active', i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }
    function build() {
      values = positions(track);
      dots.replaceChildren(...values.map((value,i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Ir a la posición ${i+1} de ${values.length}`);
        dot.setAttribute('aria-controls', track.id);
        dot.addEventListener('click', () => track.scrollTo({left: value, behavior: scrollBehavior()}));
        return dot;
      }));
      update();
    }
    track.addEventListener('scroll', update, {passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(track);
    else window.addEventListener('resize', build);
    build();
  }

  // --- Certificados ---
  const track = document.getElementById('certTrack');
  const prevBtn = document.getElementById('certPrev');
  const nextBtn = document.getElementById('certNext');
  const certDots = document.getElementById('certDots');
  const scrollByCard = makeScrollByCard(track);

  if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));

  if (track) {
    track.addEventListener('keydown', (e) => {
      if (e.target !== track) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCard(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1); }
    });
    setupCarouselDots(track, certDots);
  }

  // --- Proyectos ---
  const proyTrack = document.getElementById('proyTrack');
  const proyPrevBtn = document.getElementById('proyPrev');
  const proyNextBtn = document.getElementById('proyNext');
  const proyDots = document.getElementById('proyDots');
  const scrollProyByCard = makeScrollByCard(proyTrack);

  if (proyPrevBtn) proyPrevBtn.addEventListener('click', () => scrollProyByCard(-1));
  if (proyNextBtn) proyNextBtn.addEventListener('click', () => scrollProyByCard(1));

  if (proyTrack) {
    proyTrack.addEventListener('keydown', (e) => {
      if (e.target !== proyTrack) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollProyByCard(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollProyByCard(1); }
    });
    setupCarouselDots(proyTrack, proyDots);
  }

  // ============ SCROLL TO TOP ============
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    });

    window.addEventListener('scroll', () => {
      const shouldShow = window.scrollY > 300;
      scrollBtn.style.opacity = shouldShow ? '1' : '0.4';
      scrollBtn.style.transform = shouldShow
        ? 'translateX(-50%) scale(1)'
        : 'translateX(-50%) scale(0.85)';
    });
  }

  // ============ NAV LINKS ACTIVE STATE ============
  const sections = document.querySelectorAll('section[id]');
  const navLinkItems = document.querySelectorAll('.nav-links a');

  if (sections.length && navLinkItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinkItems.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
            if (isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-20px 0px -20px 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  // ============ ANIMACIÓN DE ENTRADA ============
  function animateOnScroll(selector, delay = 0.08) {
    const elements = document.querySelectorAll(selector);
    if (motion.matches || !elements.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(25px)';
      el.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${Math.min(index, 3) * delay}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${Math.min(index, 3) * delay}s`;
      observer.observe(el);
    });
  }

  animateOnScroll('.proyecto-card', 0.06);
  animateOnScroll('.cert-card', 0.05);
  animateOnScroll('.skill-block', 0.1);
  animateOnScroll('.sobre-texto, .sobre-fotos', 0.1);
  animateOnScroll('.section-title', 0);
  animateOnScroll('.footer-grid > div', 0.08);

  // ============ BARRA DE PROGRESO DE SCROLL ============
  const progressBar = document.getElementById('scrollProgressBar');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  // ============ CONTADOR DE PROYECTOS ============
  const proyectosSection = document.querySelector('#proyectos .section-title');
  if (proyectosSection) {
    const count = document.querySelectorAll('.proyecto-card').length;
    const span = document.createElement('span');
    span.style.cssText = `
      font-family: var(--font-mono);
      font-size: 14px;
      color: var(--mustard);
      margin-left: 12px;
      font-weight: 400;
      letter-spacing: 0.5px;
    `;
    span.textContent = `(${count} proyectos)`;
    proyectosSection.appendChild(span);
  }

});
