/* ==========================================================
   Dóra Makeup – kisegítő szkript
   A görgetéses animációk (megjelenés, rúzs, vissza a tetejére
   gomb) alapból tiszta CSS-ből működnek. Ez a fájl csak egy
   tartalék azokhoz a böngészőkhöz, amelyek ezt még nem tudják.
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var supports = function (rule) {
    return window.CSS && CSS.supports && CSS.supports(rule);
  };
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1) Tartalék a „megjelenés görgetéskor" hatásra */
  if (!supports('animation-timeline: view()') && !reduceMotion) {
    root.classList.add('no-view');
    var items = document.querySelectorAll('.rv');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* 2) Tartalék a rúzs-jelzőhöz és a „vissza a tetejére" gombhoz */
  if (!supports('animation-timeline: scroll()')) {
    root.classList.add('no-scroll');
    var toTop = document.querySelector('.totop');
    var ticking = false;

    var update = function () {
      var max = root.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty('--p', p.toFixed(4));
      if (toTop) toTop.classList.toggle('show', window.scrollY > 360);
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* 3) Lenyitható (hamburger) menü kisebb képernyőn
        - a gombra kattintva nyílik/záródik,
        - egy menüpontra, az Esc gombra vagy a menün kívüli kattintásra bezárul,
        - ha az ablak megnő (pl. telefon elforgatása), alaphelyzetbe áll. */
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
    };

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('nav-open'));
    });

    /* menüpontra kattintás: a menü bezárul (a görgetést a böngésző végzi) */
    nav.querySelectorAll('#menu a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1000) setOpen(false);
    });
  }
})();
