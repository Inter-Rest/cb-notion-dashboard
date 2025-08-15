/* assets/script.js — full replacement */

/* =========================
   1) Module links → set hrefs
   ========================= */
(function () {
  const L = window.CB_LINKS || {};
  const set = (id, key) => {
    const a = document.getElementById(id);
    if (!a || !L[key]) return;
    const url = String(L[key]).replace('notion://', 'https://'); // normalize
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
})();

/* =========================================
   2) App-first open for all dashboard cards
   ========================================= */
(function () {
  function openNotion(appUrl, webUrl) {
    try {
      const nav = (window.top || window);
      nav.location.href = appUrl;                       // try app deep link
      setTimeout(() => { nav.location.href = webUrl; }, 700); // fallback to web
    } catch (_) {
      window.location.href = webUrl;
    }
  }

  document.querySelectorAll('a[id^="lnk-"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const webUrl = a.getAttribute('href');
      if (!webUrl || webUrl === '#') return;
      const appUrl = webUrl.replace('https://www.notion.so/','notion://www.notion.so/');
      e.preventDefault();
      openNotion(appUrl, webUrl);
    });
  });
})();

/* ===================================================
   3) Metrics: values from Sheets + click-through links
   =================================================== */
(function () {
  const L = window.CB_LINKS || {};
  const N = window.CB_NUMS  || {};

  // Helper: normalize link and open with app-first behavior
  function openMetricLink(link){
    if(!link || link === '#') return;
    const webUrl = String(link).replace('notion://','https://');
    const appUrl = webUrl.replace('https://www.notion.so/','notion://www.notion.so/');
    // same behavior as cards
    try {
      const nav = (window.top || window);
      nav.location.href = appUrl;
      setTimeout(() => { nav.location.href = webUrl; }, 700);
    } catch(_) {
      window.location.href = webUrl;
    }
  }

  function wireMetric(tileId, valueKey, linkKey){
    const tile = document.getElementById(tileId);
    if(!tile) return;

    // value injection
    const v = N[valueKey];
    if(v != null){
      const el = tile.querySelector('.value');
      if(el) el.textContent = String(v);
    }

    // click-through
    const href = L[linkKey];
    if(href && href !== '#'){
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', () => openMetricLink(href));
    }
  }

  /* Top row */
  wireMetric('metric-events-this-month',        'eventsThisMonth',       'metricEventsThisMonth');
  wireMetric('metric-revenue-this-month',       'revenueThisMonth',      'metricRevenueThisMonth');
  wireMetric('metric-events-booked-this-month', 'eventsBookedThisMonth', 'metricEventsBookedThisMonth');
  wireMetric('metric-ytd-revenue',              'ytdRevenue',            'metricYTDRevenue');

  /* Second row */
  wireMetric('metric-clicks-7d',                'clicks7d',              'metricClicks7d');
  wireMetric('metric-clicks-30d',               'clicks30d',             'metricClicks30d');
})();

// Load static metrics JSON written daily by automation
(async function(){
  try{
    const r = await fetch('/assets/nums.json', {cache:'no-store'});
    if(!r.ok) return;
    const M = await r.json();
    const set = (id,val, fmt=false) => {
      if(val==null) return;
      const el = document.querySelector(`#${id} .value`);
      if(!el) return;
      el.textContent = fmt ? Number(val).toLocaleString() : String(val);
    };
    set('metric-events-this-month',        M.eventsThisMonth);
    set('metric-revenue-this-month',       M.revenueThisMonth, true);
    set('metric-events-booked-this-month', M.eventsBookedThisMonth);
    set('metric-ytd-revenue',              M.ytdRevenue, true);
    set('metric-clicks-7d',                M.clicks7d);
    set('metric-clicks-30d',               M.clicks30d);
  }catch(e){}
})();