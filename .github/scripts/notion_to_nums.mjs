// Notion + Google Sheets → assets/nums.json
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { google } = require('googleapis');

const NOTION_TOKEN   = process.env.NOTION_TOKEN;
const NOTION_DB_ID   = process.env.NOTION_DB_ID;
const CREDS_JSON     = process.env.GOOGLE_CREDENTIALS;
const SHEET_ID_7D    = process.env.SHEET_ID_HEALTH;
const SHEET_ID_30D   = process.env.SHEET_ID_EXPORT;
const RANGE_7D       = process.env.RANGE_CLICKS_7D;
const RANGE_30D      = process.env.RANGE_CLICKS_30D;
const OUT_PATH       = 'assets/nums.json';

const toNum    = v => { const n = Number(String(v ?? '').replace(/[, ]+/g,'')); return Number.isFinite(n) ? n : 0; };
const roundInt = v => Math.round(toNum(v));

/* ---- Google auth ---- */
const creds = JSON.parse(CREDS_JSON);
console.log('DEBUG svc acct:', { project_id: creds.project_id, client_email: creds.client_email });

const jwt = new google.auth.JWT(
  creds.client_email,
  null,
  creds.private_key,
  [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
);

// Force token retrieval; fail fast with clear error
await jwt.authorize().catch(e => {
  throw new Error(`JWT authorize failed for ${creds.client_email} in project ${creds.project_id}: ${e.message}`);
});

// Set as default auth for all googleapis calls
google.options({ auth: jwt });

const sheets = google.sheets('v4');

async function getCellValue(sheetId, range){
  try{
    const r = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    const v = r.data.values?.[0]?.[0] ?? 0;
    return toNum(v);
  }catch(e){
    throw new Error(`Sheets read failed: spreadsheetId=${sheetId} range=${range} :: ${e.message}`);
  }
}

/* ---- Notion ---- */
async function fetchNotionKPIs(){
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`,{
    method:'POST',
    headers:{
      'Authorization':`Bearer ${NOTION_TOKEN}`,
      'Notion-Version':'2022-06-28',
      'Content-Type':'application/json'
    },
    body: JSON.stringify({ sorts:[{ timestamp:'created_time', direction:'descending' }], page_size: 1 })
  });
  if(!res.ok){ throw new Error(`Notion query failed: ${await res.text()}`); }
  const j = await res.json();
  const props = j.results?.[0]?.properties || {};
  const num = k => toNum(props[k]?.number ?? 0);
  return {
    eventsThisMonth:       num('Events this Month'),
    revenueThisMonth:      num('This Month’s Revenue'),
    eventsBookedThisMonth: num('Events Booked This Month'),
    ytdRevenue:            num('YTD Revenue')
  };
}

/* ---- Run ---- */
try{
  const [kpis, clicks7dRaw, clicks30dRaw] = await Promise.all([
    fetchNotionKPIs(),
    getCellValue(SHEET_ID_7D,  RANGE_7D),
    getCellValue(SHEET_ID_30D, RANGE_30D)
  ]);

  console.log('DEBUG 7D:',  { sheet: SHEET_ID_7D,  range: RANGE_7D,  value: clicks7dRaw });
  console.log('DEBUG 30D:', { sheet: SHEET_ID_30D, range: RANGE_30D, value: clicks30dRaw });

  const out = {
    eventsThisMonth:       roundInt(kpis.eventsThisMonth),
    revenueThisMonth:      roundInt(kpis.revenueThisMonth),
    eventsBookedThisMonth: roundInt(kpis.eventsBookedThisMonth),
    ytdRevenue:            roundInt(kpis.ytdRevenue),
    clicks7d:              roundInt(clicks7dRaw),
    clicks30d:             roundInt(clicks30dRaw)
  };

  await fs.mkdir('assets', { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(out), 'utf8');
  console.log('Wrote', OUT_PATH, out);
}catch(err){
  console.error('ERROR:', err?.stack || err);
  process.exit(1);
}