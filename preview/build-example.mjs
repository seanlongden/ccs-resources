import { writeFileSync, mkdirSync } from 'node:fs';
import { runExample } from './lib/example.mjs';
import { csv } from './lib/csv.mjs';
const dir = new URL('../content/rebuild/example/', import.meta.url); mkdirSync(dir, { recursive: true });
const e = runExample();
for (const [name, rows] of Object.entries({ 'leads-raw.csv': e.raw, 'leads-clean.csv': e.cleaned.eligible, 'leads-held.csv': e.cleaned.held, 'leads-rejected.csv': e.cleaned.rejected, 'labels-50.csv': e.scored, 'leads-qualified.csv': e.qualified })) writeFileSync(new URL(name, dir), csv(rows));
writeFileSync(new URL('simulation.json', dir), JSON.stringify(e, null, 2) + '\n');
console.log('Built simulated example: 58 raw / 50 clean / 30 qualified; no external calls.');
