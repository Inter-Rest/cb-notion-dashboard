<script>
/* =========================================================
   assets/script.js — full replacement
   - Robustly wires Notion links (app-first, web fallback)
   - Injects metrics from /assets/nums.json
   ========================================================= */

/* ---------------------------
   0) Helpers for Notion links
   --------------------------- */
(function () {
  const ID_TO_KEY = {
    'lnk-health':'health',
    'lnk-outreach':'outreach',
    'lnk-inventory':'inventory',
    'lnk-seo':'seo',
    'lnk-perf':'perf',
    'lnk-kpi':'kpi',
    'lnk-automation':'automation',
    'lnk-events':'events',
    'lnk-training':'training',
    'lnk-bookings':'bookings',
  };

  function normalizeWeb(url) {
    if (!url) return '';
    let u = String(url).trim();
    // turn notion://… into https://…
    if (u.startsWith('notion://')) u = 'https://' + u.slice('notion://'.length);
    // enforce https for any bare http
    u = u.replace(/^http:\/\//i,'https://');
    return u;
  }

  function toAppUrl(webUrl) {
    if (!webUrl) return '';
    // generic: https://… → notion://…
    return webUrl.replace(/^https:\/\//i,'notion://');
  }

  function openPreferApp(appUrl, webUrl) {
    try {
      const nav = (window.top || window);
      if (appUrl) nav.location.href = appUrl;
      // quick fallback to web
      setTimeout(() => { if (webUrl) nav.location.href = webUrl; }, 600);
    } catch (_) {
      if (webUrl) window.location.href = webUrl;
    }
  }

  /* ----------------------------------------------------
     1) Apply CB_LINKS → anchor hrefs (with retry until
        CB_LINKS and the anchors are both present)
     ---------------------------------------------------- */
  function applyLinks() {
    const L = window.CB_LINKS;
    let applied = 0;
    if (!L) return false;

    Object.entries(ID_TO_KEY).forEach(([id,key])=>{
      const a = document.getElementById(id);
      const v = L[key];
      if (a && v) {
        a.href = normalizeWeb(v);
        applied++;
      }
    });
    return applied > 0;
  }

  // Try immediately, then poll up to ~8s for CB_LINKS/DOM
  (function waitAndApply(){
    if (applyLinks()) return;
    let tries = 0;
    const t = setInterval(()=>{
      tries++;
      if (applyLinks() || tries > 32) clearInterval(t);
    }, 250);
  })();

  /* ----------------------------------------------------------
     2) Click handler for all module cards: even if href="#",
        look up the link from CB_LINKS using the element id.
     ---------------------------------------------------------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[id^="lnk-"]');
    if (!a) return;

    const L = window.CB_LINKS || {};
    const key = ID_TO_KEY[a.id];
    let webUrl = a.getAttribute('href');

    if (!webUrl || webUrl === '#') webUrl = L[key];
    webUrl = normalizeWeb(webUrl);

    if (!webUrl) return; // nothing to do

    e.preventDefault();
    openPreferApp(toAppUrl(webUrl), webUrl);
  });
})();

/* -------------------------------------------------
   3) Metric tiles: inject values + optional links
   ------------------------------------------------- */
(function () {
  const L = window.CB_LINKS || {};
  const N = window.CB_NUMS  || {};

  function openMetric(link){
    if (!link) return;
    const web = link.startsWith('http') || link.startsWith('https')
      ? link : String(link).replace('notion://','https://');
    const app = web.replace(/^https:\/\//i,'notion://');
    try {
      const nav = (window.top || window);
      nav.location.href = app;
      setTimeout(()=>{ nav.location.href = web; }, 600);
    } catch(_) {
      window.location.href = web;
    }
  }

  function wireMetric(tileId, valueKey, linkKey){
    const tile = document.getElementById(tileId);
    if(!tile) return;

    const v = N[valueKey];
    if(v != null){
      const el = tile.querySelector('.value');
      if(el) el.textContent = String(v);
    }

    const href = L[linkKey];
    if(href){
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', () => openMetric(href));
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

/* -------------------------------------------------
   4) Load static metrics JSON written by automation
   ------------------------------------------------- */
(async function(){
  try{
    const r = await fetch('/assets/nums.json', {cache:'no-store'});
    if(!r.ok) return;
    const M = await r.json();
    const set = (id,val, money=false) => {
      if(val==null) return;
      const el = document.querySelector(`#${id} .value`);
      if(!el) return;
      if (money) {
        const n = Math.round(Number(val)||0);
        el.textContent = n.toLocaleString(undefined,{style:'currency',currency:'USD'}).replace('.00','');
      } else {
        el.textContent = String(Math.round(Number(val)||0));
      }
    };
    set('metric-events-this-month',        M.eventsThisMonth);
    set('metric-revenue-this-month',       M.revenueThisMonth, true);
    set('metric-events-booked-this-month', M.eventsBookedThisMonth);
    set('metric-ytd-revenue',              M.ytdRevenue, true);
    set('metric-clicks-7d',                M.clicks7d);
    set('metric-clicks-30d',               M.clicks30d);
  }catch(e){}
})();
</script>