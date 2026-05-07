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
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));

// ===== SMOOTH SCROLL =====
const NAV_H = () => document.getElementById('nav').offsetHeight;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY, duration, onDone) {
  const startY = window.scrollY;
  const dist   = targetY - startY;
  const t0     = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / duration, 1);
    window.scrollTo(0, startY + dist * easeInOutCubic(p));
    if (p < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  }
  requestAnimationFrame(step);
}

document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    history.pushState(null, '', href);
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    // resetear reveals de la sección destino
    target.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      el.classList.remove('visible');
      revealObserver.observe(el);
    });
    smoothScrollTo(target.getBoundingClientRect().top + window.scrollY - NAV_H(), 800);
  });
});

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

// ===== CARRUSEL CONTINUO =====
(function () {
  const track   = document.getElementById('car-track');
  const viewport= document.getElementById('car-viewport');
  const curEl   = document.getElementById('car-cur');
  const btnPrev = document.getElementById('car-prev');
  const btnNext = document.getElementById('car-next');
  const slides  = Array.from(track.querySelectorAll('.car-slide'));
  const N       = slides.length;
  const GAP     = 16;
  const SPEED   = 1.1;
  let pos       = 0;
  let paused    = false;
  let snapTarget= null;

  slides.forEach(s => track.appendChild(s.cloneNode(true)));

  function slideWidth() { return slides[0].offsetWidth + GAP; }
  function loopWidth()  { return N * slideWidth(); }

  function updateCounter() {
    if (!curEl) return;
    const idx = (Math.floor((pos + slideWidth() / 2) / slideWidth()) % N) + 1;
    curEl.textContent = Math.max(1, Math.min(idx, N));
  }

  function animate() {
    if (snapTarget !== null) {
      const diff = snapTarget - pos;
      if (Math.abs(diff) < 0.5) {
        pos = ((snapTarget % loopWidth()) + loopWidth()) % loopWidth();
        snapTarget = null;
      } else {
        pos += diff * 0.18;
        if (pos >= loopWidth()) pos -= loopWidth();
        if (pos < 0) pos += loopWidth();
      }
      track.style.transform = `translateX(-${pos}px)`;
      updateCounter();
    } else if (!paused) {
      pos += SPEED;
      if (pos >= loopWidth()) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      updateCounter();
    }
    requestAnimationFrame(animate);
  }

  function snapTo(dir) {
    const sw = slideWidth();
    const target = (Math.round(pos / sw) + dir) * sw;
    snapTarget = target;
    paused = false;
  }

  if (btnPrev) btnPrev.addEventListener('click', () => snapTo(-1));
  if (btnNext) btnNext.addEventListener('click', () => snapTo(1));

  viewport.addEventListener('mouseenter', () => { if (snapTarget === null) paused = true; });
  viewport.addEventListener('mouseleave', () => { paused = false; });

  // Touch: arrastre manual + snap al soltar
  let touchStartX = 0;
  viewport.addEventListener('touchstart', e => {
    paused = true;
    snapTarget = null;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchmove', e => {
    const delta = touchStartX - e.touches[0].clientX;
    pos = ((pos + delta * 0.4) % loopWidth() + loopWidth()) % loopWidth();
    touchStartX = e.touches[0].clientX;
    track.style.transform = `translateX(-${pos}px)`;
    updateCounter();
  }, { passive: true });
  viewport.addEventListener('touchend', () => {
    const sw = slideWidth();
    snapTarget = Math.round(pos / sw) * sw;
  });

  requestAnimationFrame(animate);
})();

// ===== LOGOS TICKER CONTINUO =====
(function () {
  const inner = document.querySelector('.logos-ticker-inner');
  if (!inner) return;
  const items = Array.from(inner.querySelectorAll('.logos-ticker-item'));
  const half  = items.length / 2;
  const SPEED = 1.1;
  let pos     = 0;
  let paused  = false;
  let loop    = 0;

  function loopWidth() {
    if (loop) return loop;
    for (let i = 0; i < half; i++) loop += items[i].offsetWidth;
    return loop;
  }

  function animate() {
    if (!paused) {
      pos += SPEED;
      if (pos >= loopWidth()) pos = 0;
      inner.style.transform = `translateX(-${pos}px)`;
    }
    requestAnimationFrame(animate);
  }

  const wrap = inner.closest('.logos-ticker-wrap');
  wrap.addEventListener('mouseenter', () => paused = true);
  wrap.addEventListener('mouseleave', () => paused = false);

  window.addEventListener('resize', () => { loop = 0; });

  requestAnimationFrame(animate);
})();

// ===== MOBILE: redirigir #contacto → #formulario =====
(function () {
  if (window.innerWidth > 900) return;
  document.querySelectorAll('.mobile-menu a[href="#contacto"], .footer-links a[href="#contacto"]')
    .forEach(a => a.setAttribute('href', '#formulario'));
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
