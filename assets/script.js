(function(){
  const L = window.CB_LINKS || {};

  // normalize any URL from config: accept https:// or notion://
  const norm = (url) => {
    if (!url || url === '#') return { web:'#', app:null };
    if (url.startsWith('notion://')) {
      return { web: url.replace('notion://','https://'), app: url };
    }
    // default: web given
    return { web: url, app: url.replace('https://www.notion.so/','notion://www.notion.so/') };
  };

  const wire = (id, key) => {
    const a = document.getElementById(id);
    if (!a) return;
    const { web, app } = norm(L[key]);
    if (web && web !== '#') a.href = web;           // fallback web URL
    if (app) a.setAttribute('data-app', app);        // app deep link
    a.classList.add('nl');                           // ensure app-first click handler applies
    a.removeAttribute('target');                     // avoid _blank (breaks deep links)
  };

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

  // metrics: click-through to views if provided
  const m1 = document.getElementById('metric-prompts');
  if(m1 && L.metricActivePrompts && L.metricActivePrompts !== '#'){ m1.style.cursor='pointer'; m1.addEventListener('click', ()=>window.open(L.metricActivePrompts,'_blank')); }
  const m2 = document.getElementById('metric-hotleads');
  if(m2 && L.metricHotLeads && L.metricHotLeads !== '#'){ m2.style.cursor='pointer'; m2.addEventListener('click', ()=>window.open(L.metricHotLeads,'_blank')); }
  const m3 = document.getElementById('metric-revenue');
  if(m3 && L.metricRevenueThisMonth && L.metricRevenueThisMonth !== '#'){ m3.style.cursor='pointer'; m3.addEventListener('click', ()=>window.open(L.metricRevenueThisMonth,'_blank')); }
})();

(function () {
  function openNotion(appUrl, webUrl) {
    var to = null;
    try {
      var nav = (window.top || window);
      nav.location.href = appUrl;

      to = setTimeout(function () {
        nav.location.href = webUrl;
      }, 700);
    } catch (e) {
      window.location.href = webUrl;
    }
  }

  document.querySelectorAll('a.nl[data-app]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var appUrl = a.getAttribute('data-app');
      var webUrl = a.getAttribute('href');
      if (!appUrl || !webUrl) return;
      e.preventDefault();
      openNotion(appUrl, webUrl);
    });
  });
})();
