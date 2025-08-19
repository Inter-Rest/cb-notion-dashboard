// Notion + Google Sheets → assets/nums.json
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { google } = require('googleapis');

/* env */
const NOTION_TOKEN   = process.env.NOTION_TOKEN;
const NOTION_DB_ID   = process.env.NOTION_DB_ID;
const CREDS_JSON     = process.env.GOOGLE_CREDENTIALS;          // full JSON
const SHEET_ID_7D    = process.env.SHEET_ID_HEALTH;              // same id ok
const SHEET_ID_30D   = process.env.SHEET_ID_EXPORT;              // can be same
const RANGE_7D       = process.env.RANGE_CLICKS_7D || 'GSC_Raw!B2';
const RANGE_30D      = process.env.RANGE_CLICKS_30D || 'GSC_Raw!C2';
const OUT_PATH       = 'public/assets/nums.json';

/* utils */
const toNum = v => { const n = Number(String(v ?? '').replace(/[, ]+/g,'')); return Number.isFinite(n) ? n : 0; };
const i     = v => Math.round(toNum(v));

/* Google auth (service account JSON from secret) */
const creds = JSON.parse(CREDS_JSON);
if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');
const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
});
await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth });

async function getCell(sheetId, range){
  const r = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  return toNum(r.data.values?.[0]?.[0] ?? 0);
}

/* Notion KPIs */
async function fetchNotionKPIs(){
  // Build "08-2025" to match your Month column
  const d = new Date();
  const monthLabel = `${String(d.getMonth() + 1).padStart(2,'0')}-${d.getFullYear()}`;

  // Query current month row. Support text/title/select/formula.
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,{
    method:'POST',
    headers:{
      'Authorization':`Bearer ${NOTION_TOKEN}`,
      'Notion-Version':'2022-06-28',
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      filter: {
        or: [
          { property:'Month', rich_text: { equals: monthLabel } },
          { property:'Month', title:     { equals: monthLabel } },
          { property:'Month', select:    { equals: monthLabel } },
          { property:'Month', formula:   { string: { equals: monthLabel } } }
        ]
      },
      page_size: 1
    })
  });
  if(!res.ok) throw new Error('Query: ' + await res.text());
  const j = await res.json();
  if(!j.results?.length) throw new Error(`No KPI row found for ${monthLabel}`);

  const page  = j.results[0];
  const p     = page.properties || {};
  const num   = k => toNum(p[k]?.number ?? 0);

  // Log row and raw values for visibility
  console.log('NOTION ROW', {
    pageId: page.id,
    monthLabel,
    propsSeen: Object.keys(p),
    values: {
      eventsThisMonth:          p['Events this Month']?.number,
      revenueThisMonthCurl:     p['This Month’s Revenue']?.number,
      revenueThisMonthStraight: p["This Month's Revenue"]?.number,
      eventsBookedThisMonth:    p['Events Booked This Month']?.number,
      ytdRevenue:               p['YTD Revenue']?.number
    }
  });

  return {
    eventsThisMonth:       num('Events this Month'),
    revenueThisMonth:      num('This Month’s Revenue') || num("This Month's Revenue"),
    eventsBookedThisMonth: num('Events Booked This Month'),
    ytdRevenue:            num('YTD Revenue')
  };
}

/* run */
try{
  const [kpis, clicks7dRaw, clicks30dRaw] = await Promise.all([
    fetchNotionKPIs(),
    getCell(SHEET_ID_7D,  RANGE_7D),
    getCell(SHEET_ID_30D, RANGE_30D)
  ]);

  const out = {
    eventsThisMonth:       i(kpis.eventsThisMonth),
    revenueThisMonth:      i(kpis.revenueThisMonth),
    eventsBookedThisMonth: i(kpis.eventsBookedThisMonth),
    ytdRevenue:            i(kpis.ytdRevenue),
    clicks7d:              i(clicks7dRaw),
    clicks30d:             i(clicks30dRaw)
  };

  await fs.mkdir('public/assets', { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(out), 'utf8');
  console.log('Wrote', OUT_PATH, out);
} catch (e) {
  console.error('ERROR:', e?.stack || e);
  process.exit(1);
}