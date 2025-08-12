
(function(){
  const L = window.CB_LINKS || {};
  const set = (id, key)=>{
    const a = document.getElementById(id);
    if(a && L[key]) a.href = L[key];
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

  // metrics: click-through to views if provided
  const m1 = document.getElementById('metric-prompts');
  if(m1 && L.metricActivePrompts && L.metricActivePrompts !== '#'){ m1.style.cursor='pointer'; m1.addEventListener('click', ()=>window.open(L.metricActivePrompts,'_blank')); }
  const m2 = document.getElementById('metric-hotleads');
  if(m2 && L.metricHotLeads && L.metricHotLeads !== '#'){ m2.style.cursor='pointer'; m2.addEventListener('click', ()=>window.open(L.metricHotLeads,'_blank')); }
  const m3 = document.getElementById('metric-revenue');
  if(m3 && L.metricRevenueThisMonth && L.metricRevenueThisMonth !== '#'){ m3.style.cursor='pointer'; m3.addEventListener('click', ()=>window.open(L.metricRevenueThisMonth,'_blank')); }
})();
