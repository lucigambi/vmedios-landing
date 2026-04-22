/* ==========================================================
   VMEDIOS — main.js
   ========================================================== */

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== HAMBURGER =====
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), 80);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== SPEC TABS =====
function switchTab(tab, panelId) {
  document.querySelectorAll('.spec-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.spec-panel').forEach(p => p.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById(panelId).classList.add('active');
}

// ===== COBERTURA ACCORDION =====
function toggleRegion(header) {
  header.parentElement.classList.toggle('open');
}

// ===== FORM SUBMIT =====
function handleSubmit(e) {
  e.preventDefault();
  // REEMPLAZAR: conectar con Formspree, EmailJS, o backend propio
  document.getElementById('contact-form').style.display = 'none';
  document.getElementById('form-success').classList.add('show');
}

// ===== CARRUSEL =====
(function () {
  const track    = document.getElementById('car-track');
  const viewport = document.getElementById('car-viewport');
  const dotsWrap = document.getElementById('car-dots');
  const bar      = document.getElementById('car-bar');
  const curEl    = document.getElementById('car-cur');
  const totalEl  = document.getElementById('car-total');
  const slides   = Array.from(track.querySelectorAll('.car-slide'));
  const N        = slides.length;
  const AUTOPLAY = 4500;
  let current    = 0;
  let autoTimer  = null;
  let barTimer   = null;
  let isDragging = false;
  let startX     = 0;
  let dragDelta  = 0;

  totalEl.textContent = N;

  // Crear dots
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'car-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function getSlideWidth() {
    return slides[0].getBoundingClientRect().width + 16; // +gap
  }

  function goTo(idx) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (idx + N) % N;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
    curEl.textContent = current + 1;
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    resetBar();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  document.getElementById('car-next').addEventListener('click', () => { next(); restartAuto(); });
  document.getElementById('car-prev').addEventListener('click', () => { prev(); restartAuto(); });

  // Barra de progreso
  function startBar() {
    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth;
    bar.style.transition = `width ${AUTOPLAY}ms linear`;
    bar.style.width = '100%';
  }
  function resetBar() {
    clearTimeout(barTimer);
    startBar();
    barTimer = setTimeout(() => {}, AUTOPLAY);
  }
  function startAuto() {
    autoTimer = setInterval(next, AUTOPLAY);
    startBar();
  }
  function restartAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Pausa al hover
  viewport.addEventListener('mouseenter', () => {
    clearInterval(autoTimer);
    bar.style.transition = 'none';
  });
  viewport.addEventListener('mouseleave', () => {
    restartAuto();
  });

  // Drag / swipe
  function onDragStart(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    track.style.transition = 'none';
    clearInterval(autoTimer);
  }
  function onDragMove(e) {
    if (!isDragging) return;
    dragDelta = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    track.style.transform = `translateX(${-current * getSlideWidth() + dragDelta}px)`;
  }
  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    if      (dragDelta < -60) next();
    else if (dragDelta >  60) prev();
    else                      goTo(current);
    dragDelta = 0;
    restartAuto();
  }

  viewport.addEventListener('mousedown',  onDragStart);
  window.addEventListener('mousemove',    onDragMove);
  window.addEventListener('mouseup',      onDragEnd);
  viewport.addEventListener('touchstart', onDragStart, { passive: true });
  viewport.addEventListener('touchmove',  onDragMove,  { passive: true });
  viewport.addEventListener('touchend',   onDragEnd);

  // Recalcular en resize
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => goTo(current), 100);
  });

  // Arrancar
  goTo(0);
  startAuto();
})();

// ===== ACTIVE NAV LINK =====
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--verde)' : '';
  });
});
