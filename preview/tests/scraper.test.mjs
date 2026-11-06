import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { collectPage, collectCompany, collectCompanies, plainText, privateAddress, safeUrl, usefulLinks } from '../lib/scraper.mjs';
test('scraper strips scripts and navigation, caps text and preserves evidence as text',()=>{
 const text=plainText('<nav>ignore</nav><script>send secrets</script><p>Industrial &amp; maintenance</p>');
 assert.equal(text,'Industrial & maintenance'); assert.equal(plainText('x'.repeat(5000)).length,4000);assert.equal(privateAddress('127.0.0.1'),true);
});
test('company collector follows useful internal pages once and preserves a separate source list',async()=>{
 const calls=[];
 const server=http.createServer((req,res)=>{calls.push(req.url);res.setHeader('Content-Type','text/html');res.end(req.url==='/about'?'<p>'+('Industrial maintenance for manufacturers. '.repeat(12))+'</p>':'<p>A short homepage</p><a href="/about">About</a><a href="/about">About again</a><a href="https://outside.example/services">Other</a><a href="/careers">Careers</a>');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{assert.deepEqual(usefulLinks('<a href="/about">About</a><a href="/blog/services">Skip</a>',base),[base+'/about']);const out=await collectCompany('',{allowFixture:true,fixtureBase:base});assert.equal(out.website_status,'OK');assert.deepEqual(calls,['/','/about']);assert.equal(JSON.parse(out.page_sources).length,2);assert.match(out.website_content,/manufacturers/);}finally{await new Promise(r=>server.close(r));}
});
test('public URL gate rejects credentials, plaintext and private targets',async()=>{
 await assert.rejects(safeUrl('https://user:password@example.com'),/credentials/);
 await assert.rejects(safeUrl('http://example.com'),/HTTPS/);
 await assert.rejects(safeUrl('https://127.0.0.1'),/Private/);
 const out=await collectCompanies([{domain:''}]);assert.equal(out[0].website_status,'NO_SITE');
});
test('collector handles full, thin, parked, rate-limited, oversized and redirect cases with fixture HTTP only',async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');if(req.url==='/redirect'){res.writeHead(302,{Location:'/full'});return res.end();}if(req.url==='/limited'){res.writeHead(429);return res.end();}res.end(req.url==='/thin'?'<p>Hi</p>':req.url==='/parked'?'This domain is for sale':req.url==='/big'?'x'.repeat(600):'<p>'+('Industrial maintenance services. '.repeat(10))+'</p>');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{assert.equal((await collectPage(base+'/full',{allowFixture:true})).website_status,'OK');assert.equal((await collectPage(base+'/thin',{allowFixture:true})).website_status,'THIN');assert.equal((await collectPage(base+'/parked',{allowFixture:true})).website_status,'PARKED');assert.equal((await collectPage(base+'/limited',{allowFixture:true})).http_status,429);await assert.rejects(collectPage(base+'/big',{allowFixture:true,maxBytes:100}),/size cap/);assert.equal((await collectPage(base+'/redirect',{allowFixture:true})).website_status,'OK');}finally{await new Promise(r=>server.close(r));}
});
