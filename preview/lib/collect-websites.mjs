// Run from the extracted tools folder: node collect-websites.mjs input.csv output.csv
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseCsv, csv } from './csv.mjs';
import { collectCompanies } from './scraper.mjs';

export async function collectFile(input, output, collector = collectCompanies) {
  if (!input || !output || input === output) throw new Error('Supply different input.csv and output.csv paths. Keep the raw file.');
  const rows = parseCsv(readFileSync(input, 'utf8'));
  if (!rows.length || !Object.hasOwn(rows[0], 'domain')) throw new Error('Input needs a domain column and at least one row.');
  if (rows.length > 50) throw new Error('This sample collector accepts at most 50 rows. Review the sample before planning a larger run.');
  const results = await collector(rows);
  if (results.length !== rows.length) throw new Error('Row count changed. No output written.');
  writeFileSync(output, csv(results), { flag: 'wx' });
  return { input: rows.length, output: results.length, statuses: results.reduce((a,r) => { a[r.website_status] = (a[r.website_status] || 0) + 1; return a; }, {}) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(await collectFile(process.argv[2], process.argv[3]), null, 2)); }
  catch (error) { console.error('STOP: ' + error.message); process.exitCode = 1; }
}
