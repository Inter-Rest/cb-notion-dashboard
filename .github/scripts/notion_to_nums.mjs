// .github/scripts/notion_to_nums.mjs
// Pull KPIs from Notion + Sheets → write assets/nums.json (and root nums.json for sanity)
// Requires env: NOTION_TOKEN, NOTION_DB_ID, GOOGLE_CREDENTIALS,
// SHEET_ID_HEALTH, SHEET_ID_EXPORT, RANGE_CLICKS_7D, RANGE_CLICKS_30D

import fs from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { google } from 'googleapis';

// ---------- helpers ----------
const cwd = process.cwd();
const pAssets = resolve(cwd, 'assets/nums.json');
const pRoot   = resolve(cwd, 'nums.json');

const notionToken = process.env.NOTION_TOKEN;
const dbId        = process.env.NOTION_DB_ID;

function num(n){ return Number.isFinite(n) ? n : 0; }
function i(n){ return Math.round(num(n)); }

async function writeJSON(path, data){
  const json = JSON.stringify(data) + '\n';
  await fs.mkdir(resolve(path, '..'), { recursive: true });
  await fs.writeFile(path, json, 'utf8');
}

function credsFromEnv() {
  const raw = process.env.GOOGLE_CREDENTIALS;
  if (!raw) throw new Error('GOOGLE_CREDENTIALS env missing');
  return JSON.parse(raw);
}

async function getCellValue({sheetId, range}) {
  const auth = new google.auth.JWT({
    email: credsFromEnv().client_email,
    key:   credsFromEnv().private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  const sheets = google.sheets({version: 'v4', auth});
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range
  });
  const v = r.data.values?.[0]?.[0];
  return i(parseFloat(String(v).replace(/,/g,'')));
}

async function fetchLatestNotionRow(){
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`,{
    method:'POST',
    headers:{
      'Authorization': `Bearer ${notionToken}`,
      'Notion-Version':'2022-06-28',
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      sorts:[{ timestamp:'created_time', direction:'descending' }],
      page_size: 1
    })
  });
  if(!res.ok) throw new Error(await res.text());
  const j = await res.json();
  const p = j.results?.[0]?.properties || {};
  const n = k => num(p[k]?.number);

  // raw values
  const eventsThisMonth       = i(n('Events this Month'));
  const revenueThisMonthCur   = n('This Month’s Revenue');       // may be float
  const eventsBookedThisMonth = i(n('Events Booked This Month'));
  const ytdRevenue            = i(n('YTD Revenue'));

  return {
    eventsThisMonth,
    revenueThisMonth: i(revenueThisMonthCur),
    eventsBookedThisMonth,
    ytdRevenue
  };
}

async function main(){
  console.log('CWD:', cwd);
  console.log('Writing to:', pAssets, 'and', pRoot);

  // 1) Notion KPIs
  const notion = await fetchLatestNotionRow();
  console.log('NOTION values:', notion);

  // 2) Sheets clicks
  const clicks7d  = await getCellValue({ sheetId: process.env.SHEET_ID_HEALTH, range: process.env.RANGE_CLICKS_7D });
  const clicks30d = await getCellValue({ sheetId: process.env.SHEET_ID_EXPORT, range: process.env.RANGE_CLICKS_30D });
  console.log('SHEETS values:', {clicks7d, clicks30d});

  const out = {
    eventsThisMonth:       i(notion.eventsThisMonth),
    revenueThisMonth:      i(notion.revenueThisMonth),
    eventsBookedThisMonth: i(notion.eventsBookedThisMonth),
    ytdRevenue:            i(notion.ytdRevenue),
    clicks7d:              i(clicks7d),
    clicks30d:             i(clicks30d)
  };

  // optional timestamp helps visibility (ignored by frontend)
  const outWithStamp = { ...out, _updatedAt: new Date().toISOString() };

  await writeJSON(pAssets, outWithStamp);
  await writeJSON(pRoot,   outWithStamp);

  const after = JSON.parse(await fs.readFile(pAssets, 'utf8'));
  console.log('WROTE assets/nums.json →', after);

  return out; // for log
}

await main();