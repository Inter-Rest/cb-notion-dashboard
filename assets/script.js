/* assets/script.js — full replacement */

/* =========================
   0) Helpers
   ========================= */
function normalizeWeb(url) {
  if (!url) return "";
  return String(url).replace(/^notion:\/\//, "https://");
}
function toAppUrl(webUrl) {
  return String(webUrl).replace(
    /^https:\/\/www\.notion\.so\//,
    "notion://www.notion.so/"
  );
}
function openTop(appUrl, webUrl) {
  const nav = (window.top || window);
  try {
    // Try deep-linking into the Notion app first
    nav.location.href = appUrl;
    // Fallback to web after a short delay
    setTimeout(() => { nav.location.href = webUrl; }, 700);
  } catch {
    window.location.href = webUrl;
  }
}

/* =========================================
   1) Module links → set hrefs + open in top
   ========================================= */
(function () {
  const L = window.CB_LINKS || {};

  // Map element id → key in CB_LINKS (matches your updated index.html)
  const MAP = {
    "lnk-bookings":   "bookings",
    "lnk-kpi":        "kpi",
    "lnk-health":     "health",
    "lnk-perf":       "perf",
    "lnk-outreach":   "outreach",
    "lnk-inventory":  "inventory",
    "lnk-seo":        "seo",
    "lnk-automation": "automation",
    "lnk-events":     "events",
    "lnk-training":   "training"
  };

  Object.entries(MAP).forEach(([id, key]) => {
    const a = document.getElementById(id);
    if (!a) return;
    const webUrl = normalizeWeb(L[key] || a.getAttribute("data-fallback") || "");
    if (!webUrl) return;
    a.setAttribute("href", webUrl);
    a.setAttribute("target", "_top");             // safety if JS is blocked
    a.setAttribute("rel", "noopener noreferrer");

    // App-first open, break out of the Notion embed
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const appUrl = toAppUrl(webUrl);
      openTop(appUrl, webUrl);
    });
  });
})();

/* ===================================================
   2) Metrics: values + click-through (top-level open)
   =================================================== */
(function () {
  const L = window.CB_LINKS || {};
  const N = window.CB_NUMS  || {};

  function wireMetric(tileId, valueKey, linkKey){
    const tile = document.getElementById(tileId);
    if(!tile) return;

    // inject value from in-memory (if present)
    const v = N[valueKey];
    if(v != null){
      const el = tile.querySelector('.value');
      if(el) el.textContent = String(v);
    }

    // click-through to detail
    const href = L[linkKey];
    if(href){
      const webUrl = normalizeWeb(href);
      const appUrl = toAppUrl(webUrl);
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', () => openTop(appUrl, webUrl));
    }
  }

  /* Top row */
  wireMetric('metric-revenue-this-month',       'revenueThisMonth',      'metricRevenueThisMonth');
  wireMetric('metric-ytd-revenue',              'ytdRevenue',            'metricYTDRevenue');
  wireMetric('metric-events-this-month',        'eventsThisMonth',       'metricEventsThisMonth');
  wireMetric('metric-events-booked-this-month', 'eventsBookedThisMonth', 'metricEventsBookedThisMonth');

  /* Clicks row */
  wireMetric('metric-clicks-7d',  'clicks7d',  'metricClicks7d');
  wireMetric('metric-clicks-30d', 'clicks30d', 'metricClicks30d');
})();

/* =======================================
   3) Load static metrics JSON (no-cache)
   ======================================= */
(async function(){
  try{
    const r = await fetch('/assets/nums.json', { cache: 'no-store' });
    if(!r.ok) return;
    const M = await r.json();

    const set = (id,val, money=false) => {
      if(val==null) return;
      const el = document.querySelector(`#${id} .value`);
      if(!el) return;
      if (money) {
        el.textContent = '$' + Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 });
      } else {
        el.textContent = Number(val).toLocaleString('en-US', { maximumFractionDigits: 0 });
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
