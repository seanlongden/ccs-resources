import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';

const enabled = process.env.CCS_APP_HTTP_TEST === '1';
const request = (pathname, method = 'GET', host = '127.0.0.1:4327') => new Promise((resolve, reject) => {
  const req = http.request({ hostname: '127.0.0.1', port: 4327, path: pathname, method, headers: { Host: host } }, res => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => { const bytes=Buffer.concat(chunks); resolve({ status: res.statusCode, headers: res.headers, bytes, body: bytes.toString() }); });
  });
  req.on('error', reject);
  req.setTimeout(30000, () => req.destroy(new Error('Local app timed out')));
  req.end();
});

test('real app serves the approved content, fixture identity and updated search', { skip: !enabled }, async () => {
  const auth = await request('/api/auth');
  assert.equal(JSON.parse(auth.body).email, 'student@preview.invalid');
  assert.equal(auth.headers['x-ccs-preview'], 'local-next-app-read-only');
  const source = JSON.parse(await readFile(new URL('../../content/pages-103.json', import.meta.url), 'utf8'));
  const page = await request('/api/content/page?slug=ccs-install/welcome');
  assert.equal(page.status, 200);
  assert.equal(JSON.parse(page.body).content, source['ccs-install/welcome'].content);
  assert.equal(JSON.parse(page.body).hideSiblingNavigation, false);
  const search = await request('/api/content/page?search=Grok');
  assert.ok(JSON.parse(search.body).some(hit => hit.pageSlug === 'ccs-install/welcome'));
  assert.equal((await request('/resources/ccs-install/welcome')).status, 200);
  assert.equal((await request('/api/content/page?slug=ccs-install/get-instantly')).status, 200);
});

test('running preview rejects writes, service routes and a production Host', { skip: !enabled }, async () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    assert.equal((await request('/api/auth', method)).status, 405);
  }
  for (const pathname of ['/api/admin', '/api/stripe', '/api/recordings']) {
    assert.equal((await request(pathname)).status, 403);
  }
  assert.equal((await request('/api/auth', 'GET', 'resources.closingclientsystem.com')).status, 403);
  const legacy = await request('/resources/install/start');
  assert.equal(legacy.status, 307);
  assert.equal(legacy.headers.location, '/resources/ccs-install/welcome');
});

test('all actual curriculum pages, aliases, assets and searches resolve in the real Next app', {skip:!enabled,timeout:240000},async()=>{
 const root=new URL('../../',import.meta.url);
 const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
 const pages=read('content/pages-104.json');pages['ccs-install/welcome']=read('content/pages-103.json')['ccs-install/welcome'];
 const nav=read('content/navigation.json'),sections=[];
 const walk=items=>{for(const n of items){if(n.children?.length){sections.push(n.fullSlug||n.slug);walk(n.children);}}};walk(nav);
 for(const [slug,p]of Object.entries(pages)){
  const r=await request('/api/content/page?slug='+encodeURIComponent(slug));assert.equal(r.status,200,slug);assert.equal(JSON.parse(r.body).content,p.content);
  assert.equal((await request('/resources/'+slug)).status,200,slug);
 }
 for(const [old,dest]of Object.entries(read('content/rebuild/actual-aliases.json'))){const r=await request('/api/content/page?slug='+encodeURIComponent(old));assert.equal(r.status,200,old);assert.equal(JSON.parse(r.body).fullSlug,dest,old);}
 for(const slug of sections)assert.equal((await request('/resources/'+slug)).status,200,slug);
 for(const slug of ['made-up/welcome','wrong/path/proposal','not-a-page'])assert.equal((await request('/api/content/page?slug='+slug)).status,404,slug);
 const assets=[...new Set(Object.values(pages).flatMap(p=>[...(p.assets||[]),...Array.from(p.content.matchAll(/\/api\/resources\/download\?file=([^\s)]+)/g),m=>m[1])]))];
 for(const file of assets){const r=await request('/api/resources/download?file='+encodeURIComponent(file));assert.equal(r.status,200,file);assert(r.headers['content-disposition'].includes('attachment'));assert.deepEqual(r.bytes,fs.readFileSync(new URL('content/rebuild/'+file,root)),file+' transport bytes');}
 for(const query of ['Grok','Runway','Proposal','Client Selection']){const r=await request('/api/content/page?search='+encodeURIComponent(query));assert(JSON.parse(r.body).length>0,query);}
 assert.equal((await request('/resources')).status,200);
 assert.equal((await request('/resources/call-recordings/weekly-coaching')).status,200);
 assert.equal((await request('/resources/call-recordings/sales-training')).status,200);
 assert.equal((await request('/api/resources/download?file=..%2F.env.local')).status,404);
 console.log(`Actual Next App: ${Object.keys(pages).length} lessons, ${sections.length} sections, ${Object.keys(read('content/rebuild/actual-aliases.json')).length} aliases, ${assets.length} assets, four searches.`);
});
