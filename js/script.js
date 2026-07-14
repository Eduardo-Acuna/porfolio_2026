// ============ SCRIPT PRINCIPAL DEL PORTAFOLIO ============

document.addEventListener('DOMContentLoaded', () => {
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

  // ============ CARRUSEL DE CERTIFICADOS ============
  const track = document.getElementById('certTrack');
  const prevBtn = document.getElementById('certPrev');
  const nextBtn = document.getElementById('certNext');

  function scrollByCard(direction, count = 4){
    if(!track) return;
    const card = track.querySelector('.cert-card');
    if (!card) return;
    const gap = 20;
    const distance = (card.offsetWidth + gap) * count;
    const targetScroll = track.scrollLeft + (direction * distance);
    track.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));

  if (track) {
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCard(-1, 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1, 1); }
    });
  }

  // ============ SCROLL TO TOP ============
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!elements.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.08 });

    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(25px)';
      el.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * delay}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * delay}s`;
      observer.observe(el);
    });
  }

  animateOnScroll('.proyecto-card', 0.06);
  animateOnScroll('.cert-card', 0.05);
  animateOnScroll('.galeria-item', 0.04);
  animateOnScroll('.skill-block', 0.1);
  animateOnScroll('.sobre-texto, .polaroid', 0.1);
  animateOnScroll('.section-title', 0);
  animateOnScroll('.footer-grid > div', 0.08);

  // ============ ENTRADA INICIAL DEL HERO ============
  const heroEls = document.querySelectorAll('.hero-name-img, .role-tag, .hero-actions, .hero-illustration-img');
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${0.15 + i * 0.12}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${0.15 + i * 0.12}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });

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

  // ============ TYPING EFFECT PARA EL ROL ============
  const roleTag = document.querySelector('.role-tag');
  if (roleTag) {
    const prefix = 'DESARROLLADOR ';
    const words = ['WEB', 'APP', 'SOFTWARE'];
    let currentIndex = 0;
    let isDeleting = false;
    let charIndex = 0;

    function typeEffect() {
      const fullWord = words[currentIndex];

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      const currentWord = fullWord.substring(0, charIndex);
      roleTag.innerHTML = `&lt;${prefix}${currentWord}&gt;`;

      let speed = isDeleting ? 40 : 70;

      if (!isDeleting && charIndex === fullWord.length) {
        speed = 1400;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % words.length;
        speed = 400;
      }

      setTimeout(typeEffect, speed);
    }

    // Iniciar después de un breve delay
    setTimeout(typeEffect, 1000);
  }

  // ============ PARALLAX SUAVE EN HERO ============
  const heroIllustration = document.querySelector('.hero-illustration-img');
  if (heroIllustration && window.innerWidth > 760) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      heroIllustration.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
  }

  // ============ MODAL DE CERTIFICADOS ============
  const certModal = document.getElementById('certModal');
  const certModalImg = document.getElementById('certModalImg');
  const certModalClose = document.getElementById('certModalClose');
  const certLinks = document.querySelectorAll('.cert-card .link-arrow');

  function openCertModal(src, alt){
    if (!certModal || !certModalImg) return;
    certModalImg.src = src;
    certModalImg.alt = alt || 'Certificado';
    certModal.classList.add('open');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCertModal(){
    if (!certModal) return;
    certModal.classList.remove('open');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  certLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const card = link.closest('.cert-card');
      const thumbImg = card ? card.querySelector('.cert-thumb img') : null;
      const src = link.getAttribute('href');
      const alt = thumbImg ? thumbImg.alt : 'Certificado';
      openCertModal(src, alt);
    });
  });

  if (certModalClose) certModalClose.addEventListener('click', closeCertModal);
  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeCertModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCertModal();
  });

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