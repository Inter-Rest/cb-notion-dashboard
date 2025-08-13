// assets/script.js  — minimal + stable

// --- ORIGINAL BEHAVIOR: set hrefs from config (web URLs only) ---
(function () {
  const L = window.CB_LINKS || {};
  const set = (id, key) => {
    const a = document.getElementById(id);
    if (!a || !L[key]) return;
    // Always store a normal web URL in href (even if config had notion://)
    const url = String(L[key]).replace('notion://', 'https://');
    a.href = url;
  };

  set('lnk-prompts','prompts');
  set('lnk-outreach','outreach');
  set('lnk-inventory','inventory');
  set('lnk-seo','seo');
  set('lnk-perf','perf');
  set('lnk-sops','sops');
  set('lnk-automation','automation');
  set('lnk-events','events');
  set('lnk-training','training');
  set('lnk-revenue','revenue');

  // metrics (unchanged)
  const m1 = document.getElementById('metric-prompts');
  if (m1 && L.metricActivePrompts && L.metricActivePrompts !== '#') {
    m1.style.cursor = 'pointer';
    m1.addEventListener('click', () => window.open(L.metricActivePrompts,'_blank'));
  }
  const m2 = document.getElementById('metric-hotleads');
  if (m2 && L.metricHotLeads && L.metricHotLeads !== '#') {
    m2.style.cursor = 'pointer';
    m2.addEventListener('click', () => window.open(L.metricHotLeads,'_blank'));
  }
  const m3 = document.getElementById('metric-revenue');
  if (m3 && L.metricRevenueThisMonth && L.metricRevenueThisMonth !== '#') {
    m3.style.cursor = 'pointer';
    m3.addEventListener('click', () => window.open(L.metricRevenueThisMonth,'_blank'));
  }
})();

// --- ADD-ON: app-first open (derives notion:// from current href) ---
(function () {
  function openNotion(appUrl, webUrl) {
    try {
      const nav = (window.top || window);
      nav.location.href = appUrl;                 // try app deep link
      setTimeout(() => { nav.location.href = webUrl; }, 700); // fallback to web
    } catch (_) {
      window.location.href = webUrl;
    }
  }

  // Attach to all dashboard cards by id pattern; no HTML changes required
  document.querySelectorAll('a[id^="lnk-"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const webUrl = a.getAttribute('href');
      if (!webUrl || webUrl === '#') return;      // nothing to do
      const appUrl = webUrl.replace('https://www.notion.so/','notion://www.notion.so/');
      e.preventDefault();
      openNotion(appUrl, webUrl);
    });
  });
})();