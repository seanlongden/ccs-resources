export function csv(rows) {
  if (!rows.length) return '';
  const keys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const q = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
  return [keys.map(q).join(','), ...rows.map(r => keys.map(k => q(r[k])).join(','))].join('\n') + '\n';
}
export function parseCsv(text) {
  const rows = []; let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { value += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if (c === '\n' && !quoted) { row.push(value.replace(/\r$/, '')); if (row.some(Boolean)) rows.push(row); row = []; value = ''; }
    else value += c;
  }
  if (quoted) throw new Error('Unclosed CSV quote.');
  if (value || row.length) { row.push(value); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift();
  if (new Set(headers).size !== headers.length) throw new Error('Duplicate CSV headers.');
  return rows.map((r, i) => { if (r.length !== headers.length) throw new Error(`CSV row ${i + 2} has wrong field count.`); return Object.fromEntries(headers.map((h, n) => [h, r[n]])); });
}
