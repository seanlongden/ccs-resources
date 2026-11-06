import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import { createServer } from '../server.mjs';
const basePath=new URL('../../content/rebuild/',import.meta.url);
const pages=JSON.parse(fs.readFileSync(new URL('pages.json',basePath),'utf8'));
test('all rendered routes, aliases, downloads, search and local read-only boundaries work over HTTP',async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const routes=['/resources','/resources/install','/resources/resources','/resources/training','/resources/recordings','/resources/review-status',...pages.map(p=>'/resources/'+p.slug),...['go-to-market-strategy','funnel','client-acquisition','inbox-pipeline-management','sales','scaling-hiring'].map(g=>'/resources/category/'+g)];
 const downloads=[...new Set(pages.flatMap(p=>p.assets))];
 try{
  for(const route of routes){const r=await fetch(origin+route);assert.equal(r.status,200,route);const html=await r.text();assert(html.includes('<h1>'),route);assert(r.headers.get('content-security-policy').includes("connect-src 'self'"));}
  for(const [old,dest]of Object.entries(JSON.parse(fs.readFileSync(new URL('aliases.json',basePath),'utf8')))){const r=await fetch(origin+'/resources/'+old,{redirect:'manual'});assert.equal(r.status,302,old);assert.equal(r.headers.get('location'),'/resources/'+dest);}
  for(const d of downloads){const r=await fetch(origin+'/downloads/'+d);assert.equal(r.status,200,d);assert(r.headers.get('content-disposition').includes('attachment'));assert((await r.arrayBuffer()).byteLength>0);}
  const search=await fetch(origin+'/api/preview-search').then(r=>r.json());assert.equal(search.length,pages.length);assert(search.some(p=>p.title.includes('Grok')));
  for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS'])assert.equal((await fetch(origin+'/api/auth',{method})).status,405);
  assert.equal((await fetch(origin+'/api/auth')).status,404);
  assert.equal((await fetch(origin+'/downloads/ai-pack/../../.env.local')).status,404);
  assert.equal((await fetch(origin+'/not-a-page')).status,404);
  assert.equal((await fetch(origin+'/resources/install/ai-agents',{method:'HEAD'})).status,200);
  const hostileHostStatus=await new Promise((resolve,reject)=>{const r=http.get(origin+'/',{headers:{host:'evil.example'}},response=>{response.resume();resolve(response.statusCode);});r.on('error',reject);});
  assert.equal(hostileHostStatus,403);
  console.log(`HTTP audit: ${routes.length} page routes, 75 legacy aliases, ${downloads.length} unique downloads; 5 write methods denied.`);
 }finally{await new Promise(r=>server.close(r));}
});
test('standalone server imports no production auth, database, deployment or sending code and loads no env files',()=>{
 const s=fs.readFileSync(new URL('../server.mjs',import.meta.url),'utf8');
 assert(!/from ['"].*(?:src\/|auth|db|stripe|dotenv)/.test(s));
 assert(!/process\.env\.(?!CCS_PREVIEW_PORT)/.test(s));
 assert(s.includes("listen(port,'127.0.0.1'"));
});
