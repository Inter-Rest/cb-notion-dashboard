/* assets/config.js */

/* Links */
window.CB_LINKS = {
  // Modules
  prompts:   "notion://www.notion.so/Prompts-Database-24bb58038c4b80f69976cc0d47ee1850?source=copy_link",
  outreach:  "notion://www.notion.so/249b58038c4b80538c12d0e0ff8e935d?v=249b58038c4b818c8d13000c3f3b54de&source=copy_link",
  inventory: "notion://www.notion.so/249b58038c4b804ea81bd8c2b005349b?v=249b58038c4b81d5ba28000cc8344855&source=copy_link",
  seo:       "notion://www.notion.so/SEO-Tracker-24cb58038c4b8018aa8bdd427d1b3f94?source=copy_link",
  perf:      "notion://www.notion.so/Website-Health-Checklist-24cb58038c4b80aebee8e6c425c43e5a?source=copy_link",
  sops:      "#",
  automation:"#",
  events:    "#",
  training:  "#",
  revenue:   "#",

  // Metric tiles (filtered views or GA4 explorations)
  metricActivePrompts:      "#",
  metricHotLeads:           "#",
  metricRevenueThisMonth:   "#",
  metricClicks7d:           "#", // Website Clicks — This Week
  metricClicks30d:          "#"  // Website Clicks — Last 30 Days
};

/* Optional numeric injections (Apps Script or server can overwrite) */
window.CB_NUMS = {
  revenueThisMonth: null, // e.g., "$12,340"
  hotLeads:         null, // e.g., 7
  clicks7d:         null, // e.g., 312
  clicks30d:        null  // e.g., 1284
};

/* Back-compat alias (older script.js may read window.L) */
window.L = window.CB_LINKS;