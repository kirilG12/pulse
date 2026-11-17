(() => {
  const fmt = (n) => n.toLocaleString('uk-UA').replace(/ | /g, ' ');
  const round10 = (n) => Math.round(n / 10) * 10;

  /* ---------- Header: scroll border + burger ---------- */
  const header = document.querySelector('.header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const closeMenu = () => {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* ---------- Pricing ---------- */
  const discounts = { 1: 0, 3: 0.10, 12: 0.25 };
  const periodNames = { 1: '1 місяць', 3: '3 місяці', 12: '12 місяців' };
  let period = 1;

  const tabs = document.querySelectorAll('.period__tabs button');
  const plans = document.querySelectorAll('.plan');
  const choiceName = document.getElementById('choiceName');
  const choiceSum = document.getElementById('choiceSum');

  const monthly = (base, p) => round10(base * (1 - discounts[p]));

  function renderPrices() {
    document.querySelectorAll('[data-price]').forEach((el) => {
      el.textContent = fmt(monthly(+el.dataset.price, period));
    });
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = fmt(monthly(+el.dataset.year, 12));
    });
    const checked = document.querySelector('.plan input:checked');
    plans.forEach((p) => p.classList.toggle('is-selected', p.contains(checked)));
    const base = +checked.closest('.plan').querySelector('[data-price]').dataset.price;
    choiceName.textContent = `${checked.value} · ${periodNames[period]}`;
    choiceSum.textContent = `${fmt(monthly(base, period) * period)} грн`;
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
    period = +tab.dataset.period;
    renderPrices();
  }));
  plans.forEach((p) => p.querySelector('input').addEventListener('change', renderPrices));
  renderPrices();

  /* ---------- Schedule: highlight today ---------- */
  const day = new Date().getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  if (day >= 1 && day <= 6) {
    const table = document.getElementById('scheduleTable');
    const th = table.tHead.rows[0].cells[day];
    th.textContent += ' · сьогодні';
    th.classList.add('is-today');
    [...table.tBodies[0].rows].forEach((r) => r.cells[day].classList.add('is-today'));
  }

  /* ---------- Directions -> preselect in form ---------- */
  const select = document.getElementById('directionSelect');
  document.querySelectorAll('[data-dir]').forEach((a) => {
    a.addEventListener('click', () => { select.value = a.dataset.dir; });
  });

  /* ---------- Trial form ---------- */
  const form = document.getElementById('trialForm');
  const success = document.getElementById('formSuccess');
  const phone = form.elements.phone;

  phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+380 '; });
  phone.addEventListener('input', () => {
    let digits = phone.value.replace(/\D/g, '');
    if (!digits.startsWith('380')) digits = '380' + digits.replace(/^3?8?0?/, '');
    digits = digits.slice(0, 12);
    const p = digits.slice(3);
    let out = '+380';
    if (p.length) out += ' ' + p.slice(0, 2);
    if (p.length > 2) out += ' ' + p.slice(2, 5);
    if (p.length > 5) out += ' ' + p.slice(5, 7);
    if (p.length > 7) out += ' ' + p.slice(7, 9);
    phone.value = out;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const nameOk = name.value.trim().length >= 2;
    const phoneOk = phone.value.replace(/\D/g, '').length === 12;
    name.closest('.field').classList.toggle('is-invalid', !nameOk);
    phone.closest('.field').classList.toggle('is-invalid', !phoneOk);
    if (!nameOk || !phoneOk) return;
    success.hidden = false;
    form.reset();
    setTimeout(() => { success.hidden = true; }, 6000);
  });
  form.querySelectorAll('input').forEach((i) =>
    i.addEventListener('input', () => i.closest('.field').classList.remove('is-invalid')));

  /* ---------- Plan CTA -> form ---------- */
  document.getElementById('choiceBtn').addEventListener('click', () => {
    form.elements.name.focus({ preventScroll: true });
  });

  /* ---------- Reveal on scroll ---------- */
  const targets = document.querySelectorAll('.section__head, .directions, .trainer, .gallery, .plans, .choice, .schedule-wrap, .quote, .trial__body, .intro, .footer__cols');
  targets.forEach((el) => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('is-visible'));
  }
})();
