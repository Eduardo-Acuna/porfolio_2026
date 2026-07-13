// ============ SEPARADOR DE ÍCONOS DE LÍNEA ============
const doodleIcons = {
  skate: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 20c8 4 20 4 28 0"/><circle cx="12" cy="26" r="3"/><circle cx="28" cy="26" r="3"/></svg>`,
  bird: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 24c4-10 12-14 18-12-2 1-3 3-2 5 6 0 9 3 10 6-3-1-6-1-8 0 1 3-1 6-5 6-6 0-10-2-13-5Z"/><circle cx="21" cy="17" r="1"/></svg>`,
  coffee: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 16h18v9a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z"/><path d="M27 18h2a4 4 0 0 1 0 8h-2"/><path d="M14 10c0 2-2 2-2 4M20 10c0 2-2 2-2 4"/></svg>`,
  dog: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 26c0-7 4-11 9-11s9 4 9 11"/><circle cx="26" cy="12" r="4"/><path d="M23 8l-3-4M29 8l2-5"/><circle cx="27" cy="11" r=".6" fill="currentColor"/></svg>`
};

function buildDoodleTrack(){
  const order = ['skate','bird','coffee','dog'];
  const items = [...order, ...order, ...order] // x3 para loop parejo
    .map(key => `<span class="doodle">${doodleIcons[key]}</span>`).join('');
  return `<div class="doodle-track">${items}</div>`;
}

['doodleMarquee1', 'doodleMarquee2'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = buildDoodleTrack();
});

// ============ MENÚ MÓVIL ============
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ============ CARRUSEL DE CERTIFICADOS ============
const track = document.getElementById('certTrack');
const prevBtn = document.getElementById('certPrev');
const nextBtn = document.getElementById('certNext');

function scrollByCard(direction){
  if(!track) return;
  const card = track.querySelector('.cert-card');
  const gap = 20;
  const distance = card ? card.offsetWidth + gap : 280;
  track.scrollBy({ left: direction * distance, behavior: 'smooth' });
}

prevBtn?.addEventListener('click', () => scrollByCard(-1));
nextBtn?.addEventListener('click', () => scrollByCard(1));

// ============ SCROLL TO TOP ============
document.getElementById('scrollTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
