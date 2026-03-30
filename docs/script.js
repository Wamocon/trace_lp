/* ==============================================
   TRACE Landing Page : Immersive Interactions v3
   Vanilla JS, no dependencies
   ============================================== */

(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, min, max) { return Math.min(Math.max(v, min), max); };

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==============================================
     1. REVEAL ON SCROLL
     ============================================== */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;

    els.forEach(function (el) {
      var parent = el.parentElement;
      if (!parent) return;
      var siblings = Array.prototype.slice.call(parent.children).filter(function (c) { return c.classList.contains('reveal'); });
      if (siblings.length > 1) {
        var idx = siblings.indexOf(el);
        if (idx > 0) {
          el.style.transitionDelay = Math.min(idx * 0.08, 0.4) + 's';
        }
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
        } else {
          var rect = entry.boundingClientRect;
          if (rect.top > 0) {
            entry.target.classList.remove('reveal--visible');
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ==============================================
     2. COUNT-UP COUNTER
     ============================================== */
  function formatNumber(num, separator) {
    if (!separator) return String(num);
    var str = String(num);
    var result = '';
    for (var i = str.length - 1, c = 0; i >= 0; i--, c++) {
      if (c > 0 && c % 3 === 0) result = separator + result;
      result = str[i] + result;
    }
    return result;
  }

  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var prefix = el.dataset.prefix || '';
    var separator = el.dataset.separator || '';
    var duration = 1600;
    var start = null;

    if (el._raf) cancelAnimationFrame(el._raf);

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(ease * target);
      el.textContent = prefix + formatNumber(current, separator) + suffix;
      if (progress < 1) {
        el._raf = requestAnimationFrame(step);
      }
    }
    el._raf = requestAnimationFrame(step);
  }

  function resetCounter(el) {
    if (el._raf) cancelAnimationFrame(el._raf);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    el.textContent = prefix + '0' + suffix;
  }

  function initCounters() {
    var counters = $$('[data-target]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
        } else {
          resetCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ==============================================
     3. NAVBAR
     ============================================== */
  function initNavbar() {
    var nav = $('#nav');
    if (!nav) return;
    var navLinks = $$('.nav-link[data-nav-section]');
    var ticking = false;

    function setActive(sectionId) {
      navLinks.forEach(function (l) {
        l.classList.toggle('nav-link--active', l.dataset.navSection === sectionId);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('nav-scrolled', window.scrollY > 60);
        var active = null;
        navLinks.forEach(function (l) {
          var sec = document.getElementById(l.dataset.navSection);
          if (!sec) return;
          var rect = sec.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.5 && rect.bottom > 100) {
            active = l.dataset.navSection;
          }
        });
        if (active) setActive(active);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==============================================
     4. SMOOTH SCROLL
     ============================================== */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 118;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ==============================================
     5. FAQ ACCORDION
     ============================================== */
  function initFAQ() {
    var faqList = $('#faqList');
    if (!faqList) return;

    faqList.addEventListener('click', function (e) {
      var button = e.target.closest('.faq-question');
      if (!button) return;

      var item = button.parentElement;
      var isOpen = item.classList.contains('faq-item--open');

      $$('.faq-item--open', faqList).forEach(function (openItem) {
        openItem.classList.remove('faq-item--open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('faq-item--open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ==============================================
     6. IMMERSIVE ROADMAP
     ============================================== */
  function initRoadmap() {
    var timeline = document.getElementById('roadmapTimeline');
    var svg = document.getElementById('rmSvg');
    var pathFill = document.getElementById('rmPathFill');
    var glow = document.getElementById('rmGlow');
    if (!timeline || !svg || !pathFill) return;

    var rows = $$('.rm__row', timeline);
    var ticking = false;
    var totalLen = 0;

    function buildSnakePath() {
      var lineEl = document.getElementById('rmLine');
      if (!lineEl) return;
      var h = timeline.offsetHeight;
      var isMobile = window.innerWidth < 768;
      var d, w, cx;

      if (isMobile) {
        w = 40; cx = 20;
        lineEl.style.left = '0';
        lineEl.style.transform = 'none';
      } else {
        w = 120; cx = w / 2;
        lineEl.style.left = '';
        lineEl.style.transform = '';
      }

      lineEl.style.width = w + 'px';
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);

      if (isMobile) {
        d = 'M ' + cx + ' 0 L ' + cx + ' ' + h;
      } else {
        var amp = 40;
        var segH = 260;
        var segments = Math.ceil(h / segH);
        d = 'M ' + cx + ' 0';
        for (var i = 0; i < segments; i++) {
          var y0 = i * segH;
          var yEnd = Math.min(y0 + segH, h);
          var dir = (i % 2 === 0) ? 1 : -1;
          d += ' C ' + (cx + amp * dir) + ' ' + (y0 + segH * 0.25) + ', ' + (cx + amp * dir) + ' ' + (y0 + segH * 0.75) + ', ' + cx + ' ' + yEnd;
        }
      }

      var pathBg = document.getElementById('rmPathBg');
      if (pathBg) pathBg.setAttribute('d', d);
      pathFill.setAttribute('d', d);

      totalLen = pathFill.getTotalLength();
      pathFill.style.strokeDasharray = totalLen;
      pathFill.style.strokeDashoffset = totalLen;
    }

    buildSnakePath();
    window.addEventListener('resize', buildSnakePath);

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var rect = timeline.getBoundingClientRect();
        var vh = window.innerHeight;
        var start = rect.top - vh * 0.65;
        var end = rect.bottom - vh * 0.25;
        var range = end - start;
        var progress = range > 0 ? clamp(-start / range, 0, 1) : 0;

        if (totalLen) {
          pathFill.style.strokeDashoffset = totalLen * (1 - progress);
        }

        if (glow && totalLen) {
          var pt = pathFill.getPointAtLength(progress * totalLen);
          glow.style.top = pt.y + 'px';
          glow.style.left = pt.x + 'px';
          glow.style.opacity = (progress > 0.01 && progress < 0.98) ? '1' : '0';
        }

        rows.forEach(function (row) {
          var card = row.querySelector('.rm__card');
          var rect = row.getBoundingClientRect();
          if (rect.top < vh * 0.65) {
            row.querySelector('.rm__dot').classList.add('rm__dot--active');
            if (card) card.classList.add('rm__card--active');
          }
        });

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ==============================================
     7. HERO PARTICLES
     ============================================== */
  function initParticles() {
    if (prefersReduced) return;

    var canvas = document.getElementById('heroParticles');
    var hero = document.getElementById('hero');
    if (!canvas || !hero) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    var isMobile = window.innerWidth < 768;
    var count = isMobile ? 180 : 350;
    var connectDist = isMobile ? 100 : 180;
    var running = true;
    var time = 0;

    var trPhase = 'chaos';
    var trTimer = 0;
    var textPositions = [];
    var textCenterX = 0;
    var textCenterY = 0;
    var scatterApplied = false;

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      if (particles.length > 0) assignTargets();
    }

    function sampleTextPositions() {
      var offCanvas = document.createElement('canvas');
      var oW = canvas.width;
      var oH = canvas.height;
      offCanvas.width = oW;
      offCanvas.height = oH;
      var offCtx = offCanvas.getContext('2d');

      var fontSize = Math.min(oW * 0.18, oH * 0.40);
      offCtx.font = '900 ' + fontSize + 'px Inter, system-ui, sans-serif';
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';

      textCenterX = oW / 2;
      textCenterY = oH * 0.40;

      var letters = ['T', 'R', 'A', 'C', 'E'];
      var letterSpacing = fontSize * 0.08;
      var letterWidths = letters.map(function (l) { return offCtx.measureText(l).width; });
      var totalWidth = letterWidths.reduce(function(a,b){return a+b;}, 0) + letterSpacing * (letters.length - 1);

      offCtx.strokeStyle = '#fff';
      offCtx.lineWidth = Math.max(2, fontSize * 0.03);
      offCtx.lineJoin = 'round';

      var curX = textCenterX - totalWidth / 2;
      for (var li = 0; li < letters.length; li++) {
        offCtx.strokeText(letters[li], curX + letterWidths[li] / 2, textCenterY);
        curX += letterWidths[li] + letterSpacing;
      }

      var imageData = offCtx.getImageData(0, 0, oW, oH);
      var pixels = imageData.data;
      var positions = [];
      var step = isMobile ? 5 : 4;

      for (var y = 0; y < oH; y += step) {
        for (var x = 0; x < oW; x += step) {
          var idx = (y * oW + x) * 4;
          if (pixels[idx + 3] > 100) {
            positions.push({ x: x, y: y });
          }
        }
      }
      return positions;
    }

    function create() {
      var angle = Math.random() * Math.PI * 2;
      var speed = (Math.random() * 0.5 + 0.1);
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        targetX: 0,
        targetY: 0,
        hasTarget: false
      };
    }

    function assignTargets() {
      var pos = sampleTextPositions();
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (i < pos.length) {
          p.targetX = pos[i].x;
          p.targetY = pos[i].y;
          p.hasTarget = true;
        } else {
          p.hasTarget = false;
        }
      }
    }

    function init() {
      resize();
      for (var i = 0; i < count; i++) particles.push(create());
      assignTargets();

      function animate() {
        if (!running) return;
        time += 0.016;
        trTimer += 0.016;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var influence = 0;
        if (trPhase === 'chaos' && trTimer > 2) { trPhase = 'forming'; trTimer = 0; }
        else if (trPhase === 'forming') {
          influence = Math.min(trTimer / 2, 1);
          if (influence >= 1 && trTimer > 4) { trPhase = 'scattering'; trTimer = 0; }
        } else if (trPhase === 'scattering') {
          influence = Math.max(0, 1 - trTimer);
          if (!scatterApplied) {
            particles.forEach(function(p){ 
              if(p.hasTarget){ 
                p.vx = (p.x - textCenterX) * 0.05 + (Math.random()-0.5)*5;
                p.vy = (p.y - textCenterY) * 0.05 + (Math.random()-0.5)*5;
              }
            });
            scatterApplied = true;
          }
          if (trTimer > 2) { trPhase = 'chaos'; trTimer = 0; scatterApplied = false; assignTargets(); }
        }

        particles.forEach(function (p) {
          if (p.hasTarget && influence > 0) {
            p.vx += (p.targetX - p.x) * 0.05 * influence;
            p.vy += (p.targetY - p.y) * 0.05 * influence;
            p.vx *= 0.85; p.vy *= 0.85;
          } else {
            p.vx *= 0.99; p.vy *= 0.99;
          }

          p.x += p.vx; p.y += p.vy;

          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, ' + p.opacity + ')';
          ctx.fill();
        });

        requestAnimationFrame(animate);
      }
      animate();
    }

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    init();
    window.addEventListener('resize', resize);
  }

  /* ==============================================
     8. MISC
     ============================================== */
  function initMagneticButtons() {
    $$('.magnetic-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        var y = (e.clientY - rect.top - rect.height / 2) * 0.2;
        btn.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  function initTyping() {
    var el = document.getElementById('heroTyping');
    if (!el) return;
    var words = ['Echtzeit-Tracking', 'Team-Synchronisation', 'Supabase-Power', 'Monatsberichte', 'Urlaubsverwaltung'];
    var wordIdx = 0, charIdx = 0, isDeleting = false;
    function tick() {
      var full = words[wordIdx];
      el.textContent = isDeleting ? full.substring(0, charIdx--) : full.substring(0, charIdx++);
      var speed = isDeleting ? 50 : 100;
      if (!isDeleting && charIdx > full.length) { isDeleting = true; speed = 2000; }
      else if (isDeleting && charIdx < 0) { isDeleting = false; wordIdx = (wordIdx + 1) % words.length; charIdx = 0; speed = 500; }
      setTimeout(tick, speed);
    }
    setTimeout(tick, 1000);
  }

  function initTiltCards() {
    $$('.tilt-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - y) * 10;
        var ry = (x - 0.5) * 10;
        card.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale3d(1.02,1.02,1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  function initBentoGlow() {
    $$('.bento-featured').forEach(function (card) {
      var glow = document.createElement('div');
      glow.style.cssText = 'position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(56,189,248,0.15),transparent 70%);pointer-events:none;opacity:0;transition:opacity 0.3s;transform:translate(-50%,-50%);z-index:0;';
      card.appendChild(glow);
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
        glow.style.opacity = '1';
      });
      card.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
    });
  }

  function initMobileMenu() {
    var btn = $('#mobileMenuBtn');
    var menu = $('#mobileMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function() {
      menu.classList.toggle('hidden');
    });
  }

  function init() {
    initReveal();
    initCounters();
    initNavbar();
    initSmoothScroll();
    initFAQ();
    initRoadmap();
    initParticles();
    initMagneticButtons();
    initTyping();
    initTiltCards();
    initBentoGlow();
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ── Ticker ── */
(function () {
  var track = document.querySelector('.ticker-track');
  if (!track) return;
  var speed = 0.5, pos = 0;
  function step() {
    pos -= speed;
    if (pos <= -(track.scrollWidth / 2)) pos = 0;
    track.style.transform = 'translate3d(' + pos + 'px,0,0)';
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();

/* ── Team Section ── */
(function() {
  var teamNodes = document.querySelectorAll('.team-node');
  if (!teamNodes.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, { threshold: 0.1 });
  teamNodes.forEach(function(node, i) {
    node.style.transitionDelay = (i * 0.1) + 's';
    observer.observe(node);
  });
})();
