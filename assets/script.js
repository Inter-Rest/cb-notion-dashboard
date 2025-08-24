<!-- /assets/script.js -->
/* =========================
   cb-notion-dashboard script
   ========================= */

(function () {
  // Wait until DOM is ready
  function onReady(fn){ 
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, {once:true});
    } else { fn(); }
  }

  // Resolve a config link to a normal web URL
  function toWebUrl(raw){
    if (!raw) return '';
    let url = String(raw).trim();
    // normalize notion:// → https://
    url = url.replace(/^notion:\/\//i, 'https://');
    return url;
  }

  // Build a Notion app deep link if host is notion.so
  function toAppUrl(webUrl){
    try {
      const u = new URL(webUrl);
      if (u.hostname.endsWith('notion.so')) {
        return webUrl.replace(/^https:\/\//i, 'notion://');
      }
    } catch(_){}
    return ''; // non-Notion or invalid → no app deep link
  }

  // App-first open with fallback to web
  function openNotionPreferApp(webUrl){
    const appUrl = toAppUrl(webUrl);
    if (!appUrl){
      // Non‑Notion link → just follow
      window.location.href = webUrl;
      return;
    }
    try {
      const nav = (window.top || window);
      nav.location.href = appUrl;
      setTimeout(() => { nav.location.href = webUrl; }, 700);
    } catch (_) {
      window.location.href = webUrl;
    }
  }

  // Wire a single card
  function wireCard(a, webUrl){
    a.href = webUrl || '#';
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return; // no link set → let the click do nothing
      e.preventDefault();
      openNotionPreferApp(href);
    }, {passive:false});
  }

  // Try to set links now; if CB_LINKS not ready, retry for a short window
  function initLinksWithRetry(){
    const L = (window.CB_LINKS || {});
    const idsToKeys = {
      'lnk-health':'health',
      'lnk-outreach':'outreach',
      'lnk-inventory':'inventory',
      'lnk-seo':'seo',
      'lnk-perf':'perf',
      'lnk-kpi':'kpi',
      'lnk-automation':'automation',
      'lnk-events':'events',
      'lnk-training':'training',
      'lnk-bookings':'bookings'
    };

    let setCount = 0;
    Object.entries(idsToKeys).forEach(([id,key]) => {
      const a = document.getElementById(id);
      if (!a) return;
      const val = L[key];
      const webUrl = toWebUrl(val);
      if (webUrl) { setCount++; }
      wireCard(a, webUrl);
    });

    // If nothing was set, retry a few times while config loads
    if (setCount === 0) {
      let attempts = 0;
      const t = setInterval(() => {
        attempts++;
        const L2 = (window.CB_LINKS || {});
        let any = 0;
        Object.entries(idsToKeys).forEach(([id,key]) => {
          const a = document.getElementById(id);
          if (!a) return;
          if (a.getAttribute('href') && a.getAttribute('href') !== '#') return;
          const webUrl = toWebUrl(L2[key]);
          if (webUrl){
            a.setAttribute('href', webUrl);
            any++;
          }
        });
        if (any || attempts >= 10) clearInterval(t); // try up to ~2s (10 * 200ms)
      }, 200);
    }
  }

  // Metric tiles: value fill + click-through
  function wireMetrics(){
    const L = (window.CB_LINKS || {});
    const N = (window.CB_NUMS  || {});
    const fmtInt = (v) => (v==null ? '' : String(Math.round(Number(v)||0)));
    const fmtMoney = (v) => {
      const n = Math.round(Number(v)||0);
      return n.toLocaleString('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0});
    };

    function setValue(tileId, value, money=false){
      const el = document.querySelector(`#${tileId} .value`);
      if (!el) return;
      el.textContent = money ? fmtMoney(value) : fmtInt(value);
    }

    function makeClickable(tileId, linkKey){
      const tile = document.getElementById(tileId);
      const link = L[linkKey];
      const webUrl = toWebUrl(link);
      if (!tile || !webUrl) return;
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', () => openNotionPreferApp(webUrl));
    }

    // Fill values from CB_NUMS (already loaded by fetch below)
    setValue('metric-events-this-month',        N.eventsThisMonth);
    setValue('metric-revenue-this-month',       N.revenueThisMonth, true);
    setValue('metric-events-booked-this-month', N.eventsBookedThisMonth);
    setValue('metric-ytd-revenue',              N.ytdRevenue, true);
    setValue('metric-clicks-7d',                N.clicks7d);
    setValue('metric-clicks-30d',               N.clicks30d);

    // Click-throughs from CB_LINKS (optional)
    makeClickable('metric-events-this-month',        'metricEventsThisMonth');
    makeClickable('metric-revenue-this-month',       'metricRevenueThisMonth');
    makeClickable('metric-events-booked-this-month', 'metricEventsBookedThisMonth');
    makeClickable('metric-ytd-revenue',              'metricYTDRevenue');
    makeClickable('metric-clicks-7d',                'metricClicks7d');
    makeClickable('metric-clicks-30d',               'metricClicks30d');
  }

  // Pull nums.json fresh (no cache) then wire metrics
  async function loadNums(){
    try{
      const r = await fetch('/assets/nums.json', {cache:'no-store'});
      if (!r.ok) return;
      const M = await r.json();
      window.CB_NUMS = M;
      wireMetrics();
    }catch(_){}
  }

  onReady(() => {
    initLinksWithRetry();
    loadNums();
  });
})();
