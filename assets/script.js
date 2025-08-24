/* =========================================================
   assets/script.js — full replacement (no <script> wrapper)
   - Robust Notion links (app-first, web fallback)
   - Metrics injection from /assets/nums.json (no decimals, $)
   ========================================================= */

/* ---------- helpers ---------- */
function normalizeWeb(url) {
  if (!url) return '';
  let u = String(url).trim();
  if (u.startsWith('notion://')) u = 'https://' + u.slice('notion://'.length);
  return u.replace(/^http:\/\//i, 'https://');
}
function toAppUrl(webUrl) {
  return webUrl ? webUrl.replace(/^https:\/\//i, 'notion://') : '';
}
function openPreferApp(appUrl, webUrl) {
  try {
    const nav = (window.top || window);
    if (appUrl) nav.location.href = appUrl;
    setTimeout(() => { if (webUrl) nav.location.href = webUrl; }, 600);
  } catch (_) {
    if (webUrl) window.location.href = webUrl;
  }
}

/* ---------- 1) Module links ---------- */
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

function applyLinksOnce() {
  const L = window.CB_LINKS;
  if (!L) return false;
  let setCount = 0;
  for (const [id, key] of Object.entries(ID_TO_KEY)) {
    const a = document.getElementById(id);
    const v = L[key];
    if (a && v) {
      a.href = normalizeWeb(v);
      setCount++;
    }
  }
  return setCount > 0;
}

function initLinks() {
  // Try now, then poll briefly until CB_LINKS/DOM are ready
  if (applyLinksOnce()) return;
  let tries = 0;
  const t = setInterval(() => {
    tries++;
    if (applyLinksOnce() || tries > 32) clearInterval(t);
  }, 250);

  // Click fallback: even if href is "#", resolve from CB_LINKS
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[id^="lnk-"]');
    if (!a) return;

    const key = ID_TO_KEY[a.id];
    const L = window.CB_LINKS || {};
    let web = a.getAttribute('href');
    if (!web || web === '#') web = L?.[key];
    web = normalizeWeb(web);
    if (!web) return;

    e.preventDefault();
    openPreferApp(toAppUrl(web), web);
  });
}

/* ---------- 2) Metric tiles ---------- */
function wireMetric(tileId, valueKey, linkKey) {
  const tile = document.getElementById(tileId);
  if (!tile) return;

  const L = window.CB_LINKS || {};
  const href = L[linkKey];
  if (href) {
    tile.style.cursor = 'pointer';
    tile.addEventListener('click', () => {
      const web = normalizeWeb(href);
      openPreferApp(toAppUrl(web), web);
    });
  }
}

function setMetricValue(id, val, money = false) {
  if (val == null) return;
  const el = document.querySelector(`#${id} .value`);
  if (!el) return;
  if (money) {
    const n = Math.round(Number(val) || 0);
    el.textContent = n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }).replace('.00','');
  } else {
    el.textContent = String(Math.round(Number(val) || 0));
  }
}

async function loadMetrics() {
  // 1) start with any inline globals (if present)
  const N = window.CB_NUMS || {};
  if (Object.keys(N).length) {
    setMetricValue('metric-events-this-month',        N.eventsThisMonth);
    setMetricValue('metric-revenue-this-month',       N.revenueThisMonth, true);
    setMetricValue('metric-events-booked-this-month', N.eventsBookedThisMonth);
    setMetricValue('metric-ytd-revenue',              N.ytdRevenue, true);
    setMetricValue('metric-clicks-7d',                N.clicks7d);
    setMetricValue('metric-clicks-30d',               N.clicks30d);
  }

  // 2) then fetch the latest file (overrides the above)
  try {
    const r = await fetch('/assets/nums.json', { cache: 'no-store' });
    if (!r.ok) return;
    const M = await r.json();
    setMetricValue('metric-events-this-month',        M.eventsThisMonth);
    setMetricValue('metric-revenue-this-month',       M.revenueThisMonth, true);
    setMetricValue('metric-events-booked-this-month', M.eventsBookedThisMonth);
    setMetricValue('metric-ytd-revenue',              M.ytdRevenue, true);
    setMetricValue('metric-clicks-7d',                M.clicks7d);
    setMetricValue('metric-clicks-30d',               M.clicks30d);
  } catch {}
}

function initMetricTiles() {
  wireMetric('metric-events-this-month',        'eventsThisMonth',       'metricEventsThisMonth');
  wireMetric('metric-revenue-this-month',       'revenueThisMonth',      'metricRevenueThisMonth');
  wireMetric('metric-events-booked-this-month', 'eventsBookedThisMonth', 'metricEventsBookedThisMonth');
  wireMetric('metric-ytd-revenue',              'ytdRevenue',            'metricYTDRevenue');
  wireMetric('metric-clicks-7d',                'clicks7d',              'metricClicks7d');
  wireMetric('metric-clicks-30d',               'clicks30d',             'metricClicks30d');
}

/* ---------- boot ---------- */
window.addEventListener('DOMContentLoaded', () => {
  initLinks();
  initMetricTiles();
  loadMetrics();
});