/* assets/config.js */

/* Module links (keep or change as needed) */
window.CB_LINKS = {
  // Modules
  bookings:   "https://www.notion.so/24eb58038c4b80ba99dbd0ac3362b9d9?v=24eb58038c4b80718393000c2dafdee2&source=copy_link",
  kpi:      "https://www.notion.so/24fb58038c4b80cfa178f7dc7ef63689?v=24fb58038c4b81a084e1000c24bef12f&source=copy_link",
  health:   "https://www.notion.so/24eb58038c4b80069217c8513c22cd82?v=24eb58038c4b803f8d59000c3a2d8e96&source=copy_link",
  perf:      "https://www.notion.so/GA4-Performance-24db58038c4b80fa97f1ec01420a1f92?source=copy_
  outreach:  "notion://www.notion.so/249b58038c4b80538c12d0e0ff8e935d?v=249b58038c4b818c8d13000c3f3b54de&source=copy_link",
  inventory: "notion://www.notion.so/249b58038c4b804ea81bd8c2b005349b?v=249b58038c4b81d5ba28000cc8344855&source=copy_link",
  seo:       "notion://www.notion.so/SEO-Tracker-24cb58038c4b8018aa8bdd427d1b3f94?source=copy_link",
  
  automation:"#",
  events:    "#",
  training:  "#",


  /* Metric tiles (click-through targets) */
  metricEventsThisMonth:       "#", // Events this Month
  metricRevenueThisMonth:      "#", // This Month’s Revenue
  metricEventsBookedThisMonth: "#", // Events Booked This Month
  metricYTDRevenue:            "#", // YTD Revenue
  metricClicks7d:              "#", // Website Clicks — This Week
  metricClicks30d:             "#"  // Website Clicks — Last 30 Days
};

/* Numeric injections from Sheets (Apps Script writes these) */
window.CB_NUMS = {
  eventsThisMonth:       null, // number
  revenueThisMonth:      null, // formatted string or number
  eventsBookedThisMonth: null, // number
  ytdRevenue:            null, // formatted string or number
  clicks7d:              null, // number
  clicks30d:             null  // number
};

/* Back-compat alias */
window.L = window.CB_LINKS;