/* =========================================================
   Asha — Portfolio Script
   =========================================================
   1.  Navbar: sticky shadow + mobile toggle
   2.  Active nav link
   3.  Dark / light mode toggle
   4.  Skill tag click-to-highlight
   5.  Project filter
   6.  Contact form validation
   7.  Footer year
   8.  Scroll-reveal (IntersectionObserver)
   ========================================================= */

/* ── helpers ─────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────────────────
   1. Navbar — add shadow on scroll + mobile open/close
   ───────────────────────────────────────────────────────── */
const header = $('.site-header');

if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

const menuToggle = $('#menu-toggle');
const nav        = $('nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuToggle.textContent = open ? '✕' : '☰';
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (header && !header.contains(e.target)) {
      nav.classList.remove('open');
      menuToggle.textContent = '☰';
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.textContent = '☰';
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ─────────────────────────────────────────────────────────
   2. Active nav link
   ───────────────────────────────────────────────────────── */
(function () {
  const cur = window.location.pathname.replace(/\/$/, '');
  $$('.nav-links a').forEach(a => {
    const href = new URL(a.href, location.origin).pathname.replace(/\/$/, '');
    if (href === cur) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();

/* ─────────────────────────────────────────────────────────
   3. Dark / light mode toggle
   ───────────────────────────────────────────────────────── */
const themeBtn = $('#theme-toggle');
const THEME_KEY = 'asha-theme';

function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  if (themeBtn) themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

const saved = localStorage.getItem(THEME_KEY);
if (saved !== null) {
  applyTheme(saved === 'dark');
} else {
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const nowDark = !document.body.classList.contains('dark');
    applyTheme(nowDark);
    localStorage.setItem(THEME_KEY, nowDark ? 'dark' : 'light');
  });
}

/* ─────────────────────────────────────────────────────────
   4. Skill tags — hover only, no click
   ───────────────────────────────────────────────────────── */
// No click behaviour — hover effect handled by CSS only

/* ─────────────────────────────────────────────────────────
   5. Project filter
   ───────────────────────────────────────────────────────── */
$$('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.project-card').forEach(card => {
      const show = f === 'all' || card.dataset.category === f;
      card.style.display = show ? '' : 'none';
    });
  });
});

/* ─────────────────────────────────────────────────────────
   6. Contact form validation
   ───────────────────────────────────────────────────────── */
const form = $('#contact-form');
if (form) {
  const nameEl    = $('#name',         form);
  const emailEl   = $('#email',        form);
  const msgEl     = $('#message',      form);
  const nameErr   = $('#name-error',   form);
  const emailErr  = $('#email-error',  form);
  const msgErr    = $('#message-error',form);
  const successEl = $('#form-success', form);

  const setErr = (el, msg) => { if (el) el.textContent = msg; };
  const clearErrs = () => {
    [nameErr, emailErr, msgErr].forEach(e => { if (e) e.textContent = ''; });
    if (successEl) successEl.textContent = '';
  };

  /* live blur validation */
  nameEl?.addEventListener('blur', () => {
    setErr(nameErr, nameEl.value.trim().length < 3
      ? 'Name must be at least 3 characters.' : '');
  });
  emailEl?.addEventListener('blur', () => {
    setErr(emailErr, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())
      ? '' : 'Enter a valid email address.');
  });
  msgEl?.addEventListener('blur', () => {
    setErr(msgErr, msgEl.value.trim().length < 10
      ? 'Message must be at least 10 characters.' : '');
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrs();
    let ok = true;

    if (!nameEl || nameEl.value.trim().length < 3) {
      setErr(nameErr, 'Name must be at least 3 characters.');
      ok = false;
    }
    if (!emailEl || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      setErr(emailErr, 'Enter a valid email address.');
      ok = false;
    }
    if (!msgEl || msgEl.value.trim().length < 10) {
      setErr(msgErr, 'Message must be at least 10 characters.');
      ok = false;
    }

    if (ok) {
      if (successEl) successEl.textContent = '✓ Message sent! I will get back to you soon.';
      form.reset();
    }
  });
}

/* ─────────────────────────────────────────────────────────
   7. Footer year
   ───────────────────────────────────────────────────────── */
$$('.current-year').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ─────────────────────────────────────────────────────────
   8. Scroll-reveal via IntersectionObserver
   ───────────────────────────────────────────────────────── */
(function () {
  const targets = $$('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 55);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => obs.observe(el));
})();
