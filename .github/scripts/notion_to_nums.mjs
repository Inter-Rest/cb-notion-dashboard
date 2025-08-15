// Notion → assets/nums.json
// Secrets required: NOTION_TOKEN, NOTION_DB_ID
import fs from 'node:fs/promises';

const notionToken = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DB_ID;
const filePath = 'assets/nums.json';

async function fetchLatestRow(){
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`,{
    method:'POST',
    headers:{
      'Authorization':`Bearer ${notionToken}`,
      'Notion-Version':'2022-06-28',
      'Content-Type':'application/json'
    },
    // Sort by built-in timestamp so no custom "Date" prop is required
    body: JSON.stringify({
      sorts:[{ timestamp:'created_time', direction:'descending' }],
      page_size: 1
    })
  });
  if(!res.ok) throw new Error(await res.text());

  const j = await res.json();
  const p = j.results?.[0]?.properties || {};
  const num = k => p[k]?.number ?? 0;

  return {
    eventsThisMonth:       num('Events this Month'),
    revenueThisMonth:      num('This Month’s Revenue'),
    eventsBookedThisMonth: num('Events Booked This Month'),
    ytdRevenue:            num('YTD Revenue'),
    clicks7d:              num('Website Clicks – This Week'),
    clicks30d:             num('Website Clicks – Last 30 Days')
  };
}

const out = await fetchLatestRow();
await fs.mkdir('assets', { recursive: true });
await fs.writeFile(filePath, JSON.stringify(out), 'utf8');
console.log('Wrote', filePath, out);