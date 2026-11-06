import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readResourceAsset } from '../../src/lib/resource-assets.ts';
const root=path.resolve(new URL('../..',import.meta.url).pathname);
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const pages=read('content/pages-104.json');
pages['ccs-install/welcome']=read('content/pages-103.json')['ccs-install/welcome'];
const sources=read('content/rebuild/source-map.json'),manifest=read('content/rebuild/ai-pack/manifest.json');
const nav=read('content/navigation.json'), aliases=read('content/rebuild/actual-aliases.json');
const sections=new Set();const navPages=[];
function walk(items){for(const item of items){const slug=item.fullSlug||item.slug;if(item.children?.length){sections.add(slug);walk(item.children);}else navPages.push(slug);}}
walk(nav);
test('actual app has eleven ordered Install steps, eight Training lessons and six resource groups',()=>{
 assert.equal(Object.values(pages).filter(p=>p.track==='install').length+1,11);
 assert.equal(Object.values(pages).filter(p=>p.track==='training').length,8);
 assert.equal(nav[0].children[0].fullSlug,'ccs-install/welcome');
 assert.equal(nav[0].children[1].fullSlug,'ccs-install/add-instructions');
 assert.equal(nav[0].children[2].fullSlug,'ccs-install/agency-profile');
 assert.equal(nav[1].children.filter(x=>x.children?.length).length,6);
 for(const slug of Object.keys(pages))assert(navPages.includes(slug),'Missing navigation: '+slug);
 assert.equal(read('content/page-index.json').length,Object.keys(pages).length);
});
test('all 41 Matt documents and 56 old lessons retain source maps and current attributions',()=>{
 assert.equal(sources.filter(s=>s.sourceType==='coaching').length,28);
 assert.equal(sources.filter(s=>s.sourceType==='dwy').length,13);
 assert.equal(sources.filter(s=>s.sourceType==='existing-lesson').length,56);
 for(const s of sources){assert(s.originalPlannedDestinations.length);for(const dest of s.destinations){
  assert(pages[dest]||sections.has(dest),s.id+' missing '+dest);
  if(pages[dest])assert(pages[dest].sourceIds.includes(s.id),s.id+' missing attribution '+dest);
 }}
});
test('all actual lesson links, downloads and explicit old aliases have a destination',()=>{
 for(const [slug,p]of Object.entries(pages)){
  assert(!p.content.includes('\u2014'),slug+' em dash');
  assert(p.content.length>500,slug+' empty content');
  for(const match of p.content.matchAll(/\]\((\/[^)]+)\)/g)){
   const href=match[1];if(href.startsWith('/resources/')){const dest=href.slice(11).split('#')[0];assert(pages[dest]||sections.has(dest),slug+' broken '+href);}
   if(href.startsWith('/api/resources/download?file='))assert(readResourceAsset(root,decodeURIComponent(href.split('file=')[1])),slug+' missing '+href);
  }
  for(const a of p.assets||[])assert(readResourceAsset(root,a),slug+' missing asset '+a);
 }
 for(const [old,dest]of Object.entries(aliases)){assert(!pages[old],'Alias shadows '+old);assert(pages[dest]||sections.has(dest),'Missing alias target '+dest);}
});
test('headlines capitalise every ordinary word and copied prompts preserve no-write scope',()=>{
 for(const [slug,p]of Object.entries(pages)){
  for(const h of [p.title,...Array.from(p.content.matchAll(/^#{1,6} (.+)$/gm),m=>m[1])]){
   for(const word of h.match(/[A-Za-z][A-Za-z’'-]*/g)||[])assert.equal(word[0],word[0].toUpperCase(),slug+' heading '+h);
  }
  if(p.track==='install'&&p.slug!=='ccs-install/add-instructions')assert(/next step|next task|handover/i.test(p.content),slug+' next action missing');
 }
 const intake=pages['ccs-install/agency-profile'].content;
 assert(intake.includes('three files'));assert(intake.includes('clients/my-agency/'));
 const reply=pages['ccs-install/reply-test'].content;for(const f of ['voice-samples.md','voice-rules.md','reply-templates.md'])assert(reply.includes(f));
});
test('canonical skill names, stage prerequisites and version agree with the download',()=>{
 assert.equal(manifest.version,'0.2.0-preview');assert.equal(manifest.externalWrites,false);assert.equal(manifest.skills.length,16);
 for(const name of manifest.skills){const text=fs.readFileSync(path.join(root,'content/rebuild/ai-pack/skills/'+name+'.md'),'utf8');
  assert(text.includes('name: '+name));assert(text.includes(manifest.version));assert(text.includes('review edition'));assert(text.includes('Agency intake may create'));assert(text.includes('Do not send, book'));
 }
 const disk=fs.readdirSync(path.join(root,'content/rebuild/ai-pack/templates')).sort();assert.deepEqual(manifest.templates,disk);
});
test('filled example keeps target, payment milestones, minimum and unknown sales consistent',()=>{
 const readText=f=>fs.readFileSync(path.join(root,'content/rebuild/example',f),'utf8');
 for(const f of ['offer.md','proposal.md','discovery-notes.md']){const s=readText(f);for(const term of ['$6,000','$3,000','45','90'])assert(s.includes(term),f+' '+term);}
 const sim=read('content/rebuild/example/simulation.json');assert.equal(sim.mode,'SIMULATED');assert.equal(sim.campaign.status,'paused');assert.equal(sim.qualified.length,30);assert.equal(sim.report.sales,'UNKNOWN');assert.equal(sim.report.runway.days,2);
 assert(readText('handover-pack.md').includes('NOT READY FOR REAL STUDENT HANDOVER'));
 assert(readText('research-brief.md').includes('not interviews proving demand'));
});
test('asset reads cannot expose private files, traverse paths or accept unexpected file types',()=>{
 for(const f of [null,'../.env.local','ai-pack/templates/../../../.env.local','example/../../package.json','example/missing.md','example/simulation.json/extra','ai-pack\\templates\\profile.md','preview/server.mjs'])assert.equal(readResourceAsset(root,f),null);
 assert.equal(readResourceAsset(root,'ccs-ai-pack.zip').type,'application/zip');
 assert(readResourceAsset(root,'ai-pack/templates/profile.md').bytes.length>100);
});
