/* ============================================================
   aiNando — Main JavaScript v3
   Testimonial Carousel, Scroll Reveal, Nav, Forms, Canvas
   ============================================================ */
'use strict';

// ── 1. PROGRESS BAR ──────────────────────────────────────────
(function() {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`;
  }, { passive: true });
})();

// ── 2. CURSOR GLOW ────────────────────────────────────────────
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
})();

// ── 3. NAVIGATION ─────────────────────────────────────────────
(function() {
  const nav    = document.getElementById('nav');
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.getElementById('nav-menu');
  const links  = document.querySelectorAll('.nav-link');

  const updateNav = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('open'); menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    }));
  }

  const sections = document.querySelectorAll('section[id]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => obs.observe(s));
})();

// ── 4. SCROLL REVEAL ──────────────────────────────────────────
(function() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });
  els.forEach(el => io.observe(el));
})();

// ── 5. HERO CANVAS ────────────────────────────────────────────
(function() {
  const canvas = document.getElementById('connection-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], rafId;
  const PALETTE = ['rgba(17,17,17,', 'rgba(37,99,235,', 'rgba(176,141,87,'];

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  class Node {
    constructor() { this.init(); }
    init() {
      this.x = Math.random()*W; this.y = Math.random()*H;
      this.vx = (Math.random()-.5)*.28; this.vy = (Math.random()-.5)*.28;
      this.r = Math.random()*2+.8; this.c = PALETTE[Math.floor(Math.random()*PALETTE.length)];
    }
    update() { this.x+=this.vx; this.y+=this.vy; if(this.x<-20||this.x>W+20||this.y<-20||this.y>H+20) this.init(); }
    draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.c+'.28)'; ctx.fill(); }
  }
  function build() {
    resize(); nodes = [];
    const n = Math.min(50, Math.floor(W*H/16000));
    for(let i=0;i<n;i++) nodes.push(new Node());
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<nodes.length;i++) {
      nodes[i].update(); nodes[i].draw();
      for(let j=i+1;j<nodes.length;j++) {
        const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<145) { ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.strokeStyle=nodes[i].c+(1-d/145)*.13+')'; ctx.lineWidth=.65; ctx.stroke(); }
      }
    }
    rafId = requestAnimationFrame(draw);
  }
  const hero = document.getElementById('hero');
  if (hero) new IntersectionObserver(([e]) => { if(e.isIntersecting){if(!rafId)draw();}else{cancelAnimationFrame(rafId);rafId=null;} }).observe(hero);
  window.addEventListener('resize', () => { resize(); nodes.forEach(n=>n.init()); }, { passive: true });
  build(); draw();
})();

// ── 6. TESTIMONIAL CAROUSEL ───────────────────────────────────
(function() {
  const track   = document.getElementById('testi-track');
  const dotsWrap= document.getElementById('testi-dots');
  const prevBtn = document.querySelector('.testi-prev');
  const nextBtn = document.querySelector('.testi-next');
  if (!track || !prevBtn || !nextBtn) return;

  const cards = Array.from(track.querySelectorAll('.testi-card'));
  const total = cards.length;
  let current = 0;
  let startX = 0, isDragging = false, dragX = 0;
  let autoId = null;

  function getVisible() {
    const vw = window.innerWidth;
    if (vw < 640) return 1;
    if (vw < 900) return 2;
    return 3;
  }

  function maxIndex() { return Math.max(0, total - getVisible()); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'testi-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Empfehlung ${i + 1}`);
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll('.testi-dot');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
  }

  function updateButtons() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
  }

  function updateCardWidths() {
    const visible = getVisible();
    const gap = 16;
    cards.forEach(c => {
      c.style.flex = `0 0 calc((100% - ${gap * (visible - 1)}px) / ${visible})`;
    });
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const visible = getVisible();
    const gap = 16;
    const cardW = track.parentElement.offsetWidth;
    const stepW = (cardW - gap * (visible - 1)) / visible + gap;
    track.style.transform = `translateX(${-current * stepW}px)`;
    updateDots();
    updateButtons();
  }

  function startAuto() {
    clearInterval(autoId);
    autoId = setInterval(() => {
      if (current >= maxIndex()) goTo(0);
      else goTo(current + 1);
    }, 5000);
  }

  function stopAuto() { clearInterval(autoId); }

  prevBtn.addEventListener('click', () => { goTo(current - 1); stopAuto(); startAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); stopAuto(); startAuto(); });

  // Touch / mouse drag
  const viewport = track.parentElement;
  function onDragStart(e) { isDragging = true; startX = (e.touches ? e.touches[0].clientX : e.clientX); stopAuto(); }
  function onDragMove(e) { if (!isDragging) return; dragX = (e.touches ? e.touches[0].clientX : e.clientX) - startX; }
  function onDragEnd() {
    if (!isDragging) return; isDragging = false;
    if (dragX < -50) goTo(current + 1);
    else if (dragX > 50) goTo(current - 1);
    dragX = 0;
    startAuto();
  }
  viewport.addEventListener('touchstart', onDragStart, { passive: true });
  viewport.addEventListener('touchmove',  onDragMove,  { passive: true });
  viewport.addEventListener('touchend',   onDragEnd);
  viewport.addEventListener('mousedown',  onDragStart);
  document.addEventListener('mousemove',  onDragMove);
  document.addEventListener('mouseup',    onDragEnd);

  // Keyboard nav
  document.addEventListener('keydown', e => {
    const section = document.getElementById('testimonials');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowLeft') { goTo(current - 1); stopAuto(); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); stopAuto(); startAuto(); }
  });

  // Init & resize
  function init() {
    updateCardWidths();
    buildDots();
    goTo(0);
    startAuto();
  }
  window.addEventListener('resize', () => { updateCardWidths(); buildDots(); goTo(Math.min(current, maxIndex())); }, { passive: true });
  init();
})();

// ── 7. SMOOTH SCROLL ──────────────────────────────────────────
(function() {
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });
})();

// ── 8. HERO PARALLAX ──────────────────────────────────────────
(function() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const heroText = document.querySelector('.hero-text');
  if (!heroText) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroText.style.transform = `translateY(${y * 0.13}px)`;
      heroText.style.opacity   = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
    }
  }, { passive: true });
})();

// ── 9. STATION STAGGER ────────────────────────────────────────
(function() {
  const items = document.querySelectorAll('.station-item');
  const ease = 'cubic-bezier(0.16,1,0.3,1)';
  items.forEach((el, i) => {
    el.style.cssText += `opacity:0;transform:translateX(-14px);transition:opacity .5s ${ease} ${i*.065}s,transform .5s ${ease} ${i*.065}s`;
  });
  const list = document.querySelector('.station-list');
  if (!list) return;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { items.forEach(el => { el.style.opacity='1'; el.style.transform='translateX(0)'; }); }
  }, { threshold: 0.1 }).observe(list);
})();

// ── 10. KONTAKT FORM ──────────────────────────────────────────
(function() {
  const form      = document.getElementById('kontakt-form');
  const submitBtn = document.getElementById('submit-btn');
  const successEl = document.getElementById('form-success');
  if (!form) return;

  function openMailto(subject, lines) {
    const body = lines.filter(Boolean).join('\n');
    const url = `mailto:iN@ndo.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    submitBtn.classList.add('loading'); submitBtn.disabled = true;
    successEl.className = 'form-success'; successEl.textContent = '';

    const data = {
      name:      form.elements['name'].value.trim(),
      email:     form.elements['email'].value.trim(),
      firma:     form.elements['firma'].value.trim(),
      interesse: form.elements['interesse'].value,
      nachricht: form.elements['nachricht'].value.trim(),
      timestamp: new Date().toISOString(),
    };
    openMailto('Kontaktanfrage via ki-sparring.ch', [
      'Kontaktanfrage via ki-sparring.ch',
      '',
      `Name: ${data.name}`,
      `E-Mail: ${data.email}`,
      `Firma: ${data.firma || '-'}`,
      `Interesse: ${data.interesse}`,
      '',
      'Nachricht:',
      data.nachricht,
      '',
      `Zeitpunkt: ${data.timestamp}`,
    ]);
    successEl.className = 'form-success success';
    successEl.textContent = '✓ Ihr Mailprogramm öffnet sich jetzt mit der ausgefüllten Anfrage.';
    form.reset();
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  });
})();

// ── 11. NEWSLETTER ────────────────────────────────────────────
(function() {
  const form    = document.getElementById('newsletter-form');
  const success = document.getElementById('nl-success');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.elements['email'].value.trim();
    if (!email) return;
    const subject = 'Newsletter-Anmeldung via ki-sparring.ch';
    const body = [
      'Bitte mich für den Newsletter eintragen.',
      '',
      `E-Mail: ${email}`,
      `Zeitpunkt: ${new Date().toISOString()}`,
    ].join('\n');
    window.location.href = `mailto:iN@ndo.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    success.textContent = '✓ Ihr Mailprogramm öffnet sich jetzt mit der Anmeldung.';
    form.reset();
  });
})();
