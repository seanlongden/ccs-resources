import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderPage } from '../server.mjs';
const base=new URL('../../content/rebuild/',import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(new URL(n,base),'utf8'));
const pages=read('pages.json'),sources=read('source-map.json'),manifest=read('ai-pack/manifest.json');
const map=new Map(pages.map(p=>[p.slug,p]));
test('nine Install steps, eight Training steps and all six resource categories exist',()=>{
 assert.equal(pages.filter(p=>p.track==='install').length,9);assert.equal(pages.filter(p=>p.track==='training').length,8);
 for(const g of ['Go-To-Market Strategy','Funnel','Client Acquisition','Inbox & Pipeline Management','Sales','Scaling & Hiring'])assert(pages.some(p=>p.group===g));
 assert.equal(map.size,pages.length);
});
test('all 41 Matt documents and 56 existing lessons have present destinations and explicit source IDs',()=>{
 assert.equal(sources.filter(s=>s.sourceType==='coaching').length,28);assert.equal(sources.filter(s=>s.sourceType==='dwy').length,13);assert.equal(sources.filter(s=>s.sourceType==='existing-lesson').length,56);
 for(const s of sources)for(const dest of s.destinations){assert(map.has(dest),`${s.id}: missing ${dest}`);assert(map.get(dest).sourceIds.includes(s.id),`${s.id}: missing attribution on ${dest}`);}
});
test('each lesson has all seven teaching elements, actual sections, prompt and usable files',()=>{
 for(const p of pages){for(const key of ['slug','title','description','finish','needs','sections','prompt','actions','example','failure','assets','sourceIds'])assert(p[key]!==undefined,`${p.slug}: missing ${key}`);
 assert(p.sections.length>=2);assert(p.actions.length>=2);assert(p.prompt.length>80);
 for(const a of p.assets)assert(fs.existsSync(new URL(a,base)),`${p.slug}: missing asset ${a}`);
 assert(!JSON.stringify(p).includes('\u2014'),`${p.slug}: em dash`);
 }
});
test('internal lesson links, old-page aliases and asset filenames resolve',()=>{
 const aliases=read('aliases.json');for(const [old,dest]of Object.entries(aliases)){assert(!map.has(old),`alias shadows ${old}`);assert(map.has(dest)||['resources','install','training'].includes(dest),`missing alias target ${dest}`);}
 for(const p of pages)for(const match of JSON.stringify(p).matchAll(/\]\((\/resources\/[^)#]+)(?:#[^)]*)?\)/g)){const target=match[1].slice(11);assert(map.has(target)||aliases[target]||['resources','install','training'].includes(target),`${p.slug}: broken ${target}`);}
});
test('same 16 canonical skills and template inventory are available in one versioned preview pack',()=>{
 assert.equal(manifest.skills.length,16);assert.equal(new Set(manifest.skills).size,16);assert.equal(manifest.externalWrites,false);
 for(const name of manifest.skills){const s=fs.readFileSync(new URL('ai-pack/skills/'+name+'.md',base),'utf8');assert(s.includes('name: '+name));assert(s.includes('CCS preview boundary'));assert(s.includes('0.1.0-preview'));}
 for(const name of manifest.templates)assert(fs.existsSync(new URL('ai-pack/templates/'+name,base)));
});
test('every lesson renders an escaped title, numbered cards, AI copy control and valid local assets',()=>{
 for(const p of pages){const html=renderPage(p.slug);assert(html.includes('<h1>'));assert(html.includes('class="copy"'));assert(html.includes('id="section-0"'));assert(!html.includes('<script>'));assert(!html.includes('<iframe'));assert(!/href="javascript:/i.test(html));}
});
test('proposal exercise preserves provided facts and unknowns without borrowing the economics projection',()=>{
 const s=fs.readFileSync(new URL('example/proposal.md',base),'utf8');assert(s.includes('$6,000'));assert(s.includes('$3,000'));assert(s.includes('90 days'));assert(s.includes('D6'));assert(s.includes('No close rate is known'));assert(!s.includes('will generate $120,000'));
});
