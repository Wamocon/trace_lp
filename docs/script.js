/* ==============================================
   TRACE Landing Page v2 – Interactions
   Vanilla JS, no dependencies
   ============================================== */

(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ==============================================
     1. REVEAL ON SCROLL
     ============================================== */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--vis');
        } else {
          var rect = entry.boundingClientRect;
          if (rect.top > 0) {
            entry.target.classList.remove('reveal--vis');
          }
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

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
    var navLinks = $$('.nav-l[data-section]');
    var ticking = false;

    function setActive(sectionId) {
      navLinks.forEach(function (l) {
        l.classList.toggle('nav-l--active', l.dataset.section === sectionId);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('nav-scrolled', window.scrollY > 60);
        var active = null;
        navLinks.forEach(function (l) {
          var sec = document.getElementById(l.dataset.section);
          if (!sec) return;
          var rect = sec.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.5 && rect.bottom > 100) {
            active = l.dataset.section;
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
      var button = e.target.closest('.faq-q');
      if (!button) return;

      var item = button.parentElement;
      var isOpen = item.classList.contains('faq-item--open');

      $$('.faq-item--open', faqList).forEach(function (openItem) {
        openItem.classList.remove('faq-item--open');
        openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('faq-item--open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* ==============================================
     6. BILLING TOGGLE (Preise)
     ============================================== */
  function initPriceToggle() {
    var toggle  = $('#billToggle');
    var knob    = $('#billKnob');
    var label   = $('#billLabel');
    var litePriceEl  = $('#litePrice');
    var proPriceEl   = $('#proPrice');
    var liteAnnualEl = $('#liteAnnual');
    var proAnnualEl  = $('#proAnnual');
    if (!toggle) return;

    var isAnnual = false;
    var prices = {
      monthly: { lite: '5,90', pro: '11,90' },
      annual:  { lite: '4,90', pro: '9,90'  }
    };

    function update() {
      var p = isAnnual ? prices.annual : prices.monthly;
      if (litePriceEl) litePriceEl.textContent = p.lite;
      if (proPriceEl)  proPriceEl.textContent  = p.pro;
      if (liteAnnualEl) liteAnnualEl.textContent = isAnnual ? 'zzgl. USt. · jährlich abgerechnet' : '';
      if (proAnnualEl)  proAnnualEl.textContent  = isAnnual ? 'zzgl. USt. · jährlich abgerechnet' : '';
      if (knob) {
        knob.style.left     = isAnnual ? '22px' : '1px';
        knob.style.background = isAnnual ? '#34d399' : '#64748b';
      }
      if (toggle) toggle.setAttribute('aria-checked', String(isAnnual));
      if (label)  label.textContent = isAnnual ? 'Monatlich' : 'Monatlich';
    }

    toggle.addEventListener('click', function () {
      isAnnual = !isAnnual;
      update();
    });

    update();
  }

  /* ==============================================
     7. BACK TO TOP
     ============================================== */
  function initBackToTop() {
    var btn = $('#btt');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('btt--vis', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==============================================
     8. COOKIE BANNER
     ============================================== */
  function initCookieBanner() {
    var banner = $('#cookieBanner');
    var btnOk  = $('#cookieOk');
    var btnNo  = $('#cookieNo');
    if (!banner) return;

    var COOKIE_KEY = 'trace_cookie_consent';
    if (sessionStorage.getItem(COOKIE_KEY)) return;

    setTimeout(function () {
      banner.classList.add('cookie-banner--vis');
    }, 1800);

    function dismiss() {
      banner.classList.remove('cookie-banner--vis');
      sessionStorage.setItem(COOKIE_KEY, '1');
    }

    if (btnOk) btnOk.addEventListener('click', dismiss);
    if (btnNo) btnNo.addEventListener('click', dismiss);
  }

  /* v1 initRoadmap / initParticles / initMagneticButtons / initTyping removed in v2 */



  function initMobileMenu() {
    var hbg    = $('#navHbg');
    var menu   = $('#mobileMenu');
    var closer = $('#mmClose');
    if (!hbg || !menu) return;

    function open() {
      menu.classList.add('open');
      hbg.classList.add('open');
      hbg.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      menu.classList.remove('open');
      hbg.classList.remove('open');
      hbg.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hbg.addEventListener('click', function () {
      menu.classList.contains('open') ? close() : open();
    });
    if (closer) closer.addEventListener('click', close);

    $$('a', menu).forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  function init() {
    initReveal();
    initNavbar();
    initSmoothScroll();
    initFAQ();
    initPriceToggle();
    initBackToTop();
    initCookieBanner();
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* v2: Ticker uses CSS animation – no JS override needed */

