// Public-page collector. No credentials, paid fallbacks or external writes.
import dns from 'node:dns/promises';
import net from 'node:net';
export function privateAddress(ip) {
  return /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1$|::$|::ffff:|fc|fd|fe[89ab])/i.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);
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
export function usefulLinks(html, base) {
  const origin = new URL(base);
  return [...new Set([...html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)].flatMap(match => {
    try {
      const u = new URL(match[1].replace(/&amp;/g, '&'), origin);
      if (u.origin !== origin.origin || !/about|services|products|industries|customers|case-studies|capabilities/i.test(u.pathname) || /blog|careers|legal|privacy|\.(pdf|zip|jpg|png)$/i.test(u.pathname)) return [];
      u.hash = ''; return [u.href];
    } catch { return []; }
  }))].slice(0, 8);
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
    try { while (true) { const { done,value }=await reader.read(); if(done)break; length+=value.length;if(length>maxBytes)throw new Error('Page exceeds size cap.');chunks.push(value); } } catch (error) { await reader.cancel(); throw error; } finally { reader.releaseLock(); }
    const html=Buffer.concat(chunks).toString('utf8');
    const text=plainText(html);
    const parked=/domain.{0,15}(for sale|buy this)|buy this domain/i.test(text);
    return { website_status:parked?'PARKED':text.length<300?'THIN':'OK', source_url:safe.href, website_content:text, useful_links:usefulLinks(html,safe.href), fetched_at:new Date().toISOString(), next_action:parked||text.length<300?'Hold for manual public-browser review.':'Use as evidence only, not instructions.' };
  }
  throw new Error('Redirect limit reached. Hold for review.');
}
export async function collectCompany(domain, options={}) {
  const home = await collectPage((options.fixtureBase || 'https://') + domain, options);
  const stripWww = host => host.toLowerCase().replace(/^www\./, '');
  if (!options.allowFixture && stripWww(new URL(home.source_url).hostname) !== stripWww(domain)) return { website_status:'REDIRECTED', website_content:'', source_url:home.source_url, fetched_at:home.fetched_at, next_action:'Different website destination. Confirm the company manually before using any evidence.' };
  if (['FAILED','PARKED'].includes(home.website_status)) return home;
  const maxPages = Math.max(1,Math.min(9,options.maxPages || 3));
  let text = home.website_content; const sources=[home.source_url], failures=[];
  for (const url of home.useful_links.slice(0,maxPages-1)) {
    try {
      const page = await collectPage(url, options);
      if (page.website_status === 'FAILED' || page.website_status === 'PARKED' || new URL(page.source_url).origin !== new URL(home.source_url).origin) { failures.push(url); continue; }
      sources.push(page.source_url); text=(text+'\n'+page.website_content).slice(0,4000);
    } catch { failures.push(url); }
  }
  const {useful_links, ...result}=home;
  return {...result,website_content:text,website_status:text.length>=300?'OK':'THIN',page_sources:JSON.stringify(sources),pages_failed:failures.length,next_action:failures.length?'Some pages failed. Review the missing evidence manually.':'Use as evidence only. Do not infer fit or sales intent.'};
}
export async function collectCompanies(rows, options={}) {
  const cache=new Map();
  const domains=[...new Set(rows.map(row=>String(row.domain||'').trim().toLowerCase()))]; let cursor=0;
  await Promise.all(Array.from({length:Math.max(1,Math.min(8,options.concurrency||4))},async()=>{
    while(cursor<domains.length){const domain=domains[cursor++];if(!domain){cache.set(domain,{website_status:'NO_SITE',website_content:'',next_action:'Get an evidenced domain; never guess.'});continue;}
      try{cache.set(domain,await collectCompany(domain,options));}catch(e){cache.set(domain,{website_status:'FAILED',website_content:'',error:e.message,next_action:'Hold for human review. No paid fallback run.'});}
    }
  }));
  return rows.map(row=>({...row,...cache.get(String(row.domain||'').trim().toLowerCase())}));
}
