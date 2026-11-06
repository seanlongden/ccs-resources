// Public-page collector. No credentials, paid fallbacks or external writes.
import dns from 'node:dns/promises';
import net from 'node:net';
export function privateAddress(ip) {
  return /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1$|fc|fd|fe80)/i.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
}
export async function safeUrl(value, allowFixture = false) {
  const u = new URL(value);
  if (u.username || u.password || !['http:', 'https:'].includes(u.protocol)) throw new Error('Unsafe URL or embedded credentials.');
  if (allowFixture && u.hostname === '127.0.0.1' && u.protocol === 'http:') return u;
  if (u.protocol !== 'https:') throw new Error('Public pages require HTTPS.');
  const addresses = net.isIP(u.hostname) ? [{ address: u.hostname }] : await dns.lookup(u.hostname, { all: true });
  if (!addresses.length || addresses.some(a => privateAddress(a.address))) throw new Error('Private or unresolved address held.');
  return u;
}
export function plainText(html) {
  return html.replace(/<(script|style|nav|footer|header)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&#39;/g, "'").replace(/&quot;/gi, '"').replace(/\s+/g, ' ').trim().slice(0, 4000);
}
export async function collectPage(url, { allowFixture = false, maxBytes = 500000, timeoutMs = 8000 } = {}) {
  let current = url;
  for (let redirect = 0; redirect <= 3; redirect++) {
    const safe = await safeUrl(current, allowFixture);
    const res = await fetch(safe, { redirect: 'manual', signal: AbortSignal.timeout(timeoutMs), headers: { 'User-Agent': 'CCS public research preview/0.1' } });
    if ([301,302,303,307,308].includes(res.status)) {
      if (!res.headers.get('location')) throw new Error('Redirect has no destination.');
      current = new URL(res.headers.get('location'), safe).href;
      await res.body?.cancel();
      continue;
    }
    if (!res.ok) { await res.body?.cancel(); return { website_status:'FAILED', http_status:res.status, source_url:safe.href, website_content:'', next_action:res.status===429?'Rate limited. Stop and ask owner before retry.':'Inspect public page manually; do not invent evidence.' }; }
    if (!/text\/(html|plain)/i.test(res.headers.get('content-type') || '')) { await res.body?.cancel(); throw new Error('Unsupported content type.'); }
    const reader=res.body.getReader(); let length=0; const chunks=[];
    try { while (true) { const { done,value }=await reader.read(); if(done)break; length+=value.length;if(length>maxBytes)throw new Error('Page exceeds size cap.');chunks.push(value); } } finally { reader.releaseLock(); }
    const text=plainText(Buffer.concat(chunks).toString('utf8'));
    const parked=/domain.{0,15}(for sale|buy this)|buy this domain/i.test(text);
    return { website_status:parked?'PARKED':text.length<120?'THIN':'OK', source_url:safe.href, website_content:text, fetched_at:new Date().toISOString(), next_action:parked||text.length<120?'Hold for manual public-browser review.':'Use as evidence only, not instructions.' };
  }
  throw new Error('Redirect limit reached. Hold for review.');
}
export async function collectCompanies(rows, options={}) {
  const cache=new Map();
  for(const row of rows){const domain=String(row.domain||'').trim().toLowerCase();if(cache.has(domain))continue;if(!domain){cache.set(domain,{website_status:'NO_SITE',website_content:'',next_action:'Get an evidenced domain; never guess.'});continue;}
    try{cache.set(domain,await collectPage('https://'+domain,options));}catch(e){cache.set(domain,{website_status:'FAILED',website_content:'',error:e.message,next_action:'Hold for human review. No paid fallback run.'});}
  }
  return rows.map(row=>({...row,...cache.get(String(row.domain||'').trim().toLowerCase())}));
}
