import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { sealData } from 'iron-session';

test('production build packages student assets and enforces the actual session gate', {skip:process.env.CCS_PRODUCTION_HTTP_TEST!=='1'}, async()=>{
  const base='http://127.0.0.1:4330';
  const password='ccs-local-production-release-test-only-2026';
  const token=await sealData({email:'student@preview.invalid',hasAccess:true,status:'lifetime',lastVerified:Date.now(),welcomeSeen:true},{password});
  const headers={Cookie:'ccg-resources-session='+token};
  const guest=await fetch(base+'/api/resources/download?file=ccs-ai-pack.zip');
  assert.equal(guest.status,401);
  const auth=await fetch(base+'/api/auth',{headers});
  assert.equal((await auth.json()).authenticated,true);
  const index=JSON.parse(fs.readFileSync('content/page-index.json','utf8'));
  const assets=new Set(['ccs-ai-pack.zip']);
  for(const folder of ['ai-pack/skills','ai-pack/templates','example']) {
    for(const name of fs.readdirSync('content/rebuild/'+folder))assets.add(folder+'/'+name);
  }
  for(const name of ['README.md','AGENTS.md','manifest.json'])assets.add('ai-pack/'+name);
  for(const {slug,chunk}of index){
    const page=JSON.parse(fs.readFileSync('content/pages-'+chunk+'.json','utf8'))[slug];
    for(const match of page.content.matchAll(/\/api\/resources\/download\?file=([^\s)]+)/g))assets.add(decodeURIComponent(match[1]));
  }
  const traceFile=path.resolve('.next/server/app/api/resources/download/route.js.nft.json');
  const traced=new Set(JSON.parse(fs.readFileSync(traceFile,'utf8')).files.map(file=>path.resolve(path.dirname(traceFile),file)));
  for(const file of assets){
    const canonical=path.resolve('content/rebuild',file);
    assert(traced.has(canonical),'Missing Vercel function asset: '+file);
    const res=await fetch(base+'/api/resources/download?file='+encodeURIComponent(file),{headers});
    assert.equal(res.status,200,file);
    assert.deepEqual(Buffer.from(await res.arrayBuffer()),fs.readFileSync(canonical),file);
  }
  assert.equal((await fetch(base+'/api/resources/download?file=..%2F.env.local',{headers})).status,404);
  const staleToken=await sealData({email:'student@preview.invalid',hasAccess:true,status:'lifetime',lastVerified:1,welcomeSeen:true},{password});
  assert.equal((await fetch(base+'/api/resources/download?file=ccs-ai-pack.zip',{headers:{Cookie:'ccg-resources-session='+staleToken}})).status,401);
  console.log(`Actual production handler: ${assets.size} byte-matched assets; anonymous and stale sessions denied.`);
});
