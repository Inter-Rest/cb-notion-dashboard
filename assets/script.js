// assets/script.js
document.addEventListener('DOMContentLoaded', function () {
  const L = window.CB_LINKS || {};

  // Accept https:// or notion:// and produce both
  const norm = (url) => {
    if (!url || url === '#') return { web: '#', app: null };
    if (url.startsWith('notion://')) {
      return { web: url.replace('notion://', 'https://'), app: url };
    }
    return {
      web: url,
      app: url.replace('https://www.notion.so/', 'notion://www.notion.so/')
    };
  };

  // Wire one card by id -> key in config
  const wire = (id, key) => {
    const a = document.getElementById(id);
    if (!a) return;
    const { web, app } = norm(L[key]);
    if (web && web !== '#') a.setAttribute('href', web); else a.removeAttribute('href');
    if (app) a.setAttribute('data-app', app); else a.removeAttribute('data-app');
    a.classList.add('nl');            // mark for app-first handler
    a.removeAttribute('target');      // deep links break in _blank
  };

  // Cards
  wire('lnk-prompts','prompts');
  wire('lnk-outreach','outreach');
  wire('lnk-inventory','inventory');
  wire('lnk-seo','seo');
  wire('lnk-perf','perf');
  wire('lnk-sops','sops');
  wire('lnk-automation','automation');
  wire('lnk-events','events');
  wire('lnk-training','training');
  wire('lnk-revenue','revenue');

  // Metrics (click-through to optional views)
  const clickMetric = (id, key) => {
    const el = document.getElementById(id);
    const url = L[key];
    if (el && url && url !== '#') {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window.open(url, '_blank'));
    }
  };
  clickMetric('metric-prompts','metricActivePrompts');
  clickMetric('metric-hotleads','metricHotLeads');
  clickMetric('metric-revenue','metricRevenueThisMonth');

  // App-first open with web fallback (works in embeds)
  function openNotion(appUrl, webUrl) {
    try {
      const nav = (window.top || window);
      if (appUrl) {
        nav.location.href = appUrl;
        setTimeout(() => { nav.location.href = webUrl; }, 700);
      } else {
        nav.location.href = webUrl;
      }
    } catch (_) {
      window.location.href = webUrl;
    }
  }

  document.querySelectorAll('a.nl').forEach((a) => {
    a.addEventListener('click', (e) => {
      const webUrl = a.getAttribute('href');
      const appUrl = a.getAttribute('data-app') ||
                     (webUrl ? webUrl.replace('https://www.notion.so/','notion://www.notion.so/') : null);
      if (!webUrl) return;
      e.preventDefault();
      openNotion(appUrl, webUrl);
    });
  });
});