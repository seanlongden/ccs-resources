import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write = (p,v) => fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2)+'\n');
const pages = read('content/pages-104.json');
const welcome = read('content/pages-103.json')['ccs-install/welcome'];
const tracks = [['install','CCS Install','ccs-install','Build your cold email system in order. Start with the first lesson.'],['resources','CCS Resources','ccs-resources','Open the detailed lesson or template you need, then return to your Install step.'],['training','CCS Training','ccs-training','Use these lessons after CCS has demonstrated your installed system and completed your handover.']];
const groupSlugs = {'Go-To-Market Strategy':'go-to-market','Funnel':'funnel','Client Acquisition':'client-acquisition','Inbox And Pipeline Management':'inbox-pipeline','Sales':'sales','Scaling And Hiring':'scaling-hiring'};
const node = p => ({title:p.title,slug:p.slug.split('/').at(-1),fullSlug:p.slug,type:'page',childCount:0,description:p.description});
const nav = tracks.map(([track,title,slug,description],i) => {
  const list=Object.values(pages).filter(p=>p.track===track).sort((a,b)=>a.order-b.order);
  let children=[];
  if(track==='install') children=[node({...welcome,slug:'ccs-install/welcome',description:'What You Will Build, What The AI Does And How To Get Grok Bot Ready.'}),...list.map(node)];
  else if(track==='resources') {
    for(const [group,segment] of Object.entries(groupSlugs)) {
      const items=list.filter(p=>p.group===group); if(items.length) children.push({title:group,slug:segment,fullSlug:slug+'/'+segment,description:'Lessons, examples and files for this part of your system.',children:items.map(node)});
    }
    children.push(...list.filter(p=>!groupSlugs[p.group]).map(node));
  } else children=list.map(node);
  return {title,slug,description,order:i+1,children};
});
const existing=read('content/navigation.json');
nav.push(...existing.filter(n=>!tracks.some(t=>t[2]===n.slug)));
nav[1].children.push(node(pages['ccs-resources/review-status']));
write('content/navigation.json',nav);
// Preserve frozen source chunks. The index exposes only current lessons and recordings.
const current=[{slug:'ccs-install/welcome',title:welcome.title,isSection:false,chunk:103},...Object.values(pages).map(p=>({slug:p.slug,title:p.title,isSection:false,chunk:104}))];
write('content/page-index.json',current);
const originalAliases=read('content/rebuild/aliases.json');
const canonical = target => target==='install/start'?'ccs-install/welcome':target==='install/ai-agents'?'ccs-install/add-instructions':target==='example'?'ccs-resources/worked-example':target.startsWith('resources/')?'ccs-resources/'+target.slice(10):target.startsWith('training/')?'ccs-training/'+target.slice(9):target.startsWith('install/')?'ccs-install/'+target.slice(8):target;
const aliases=Object.fromEntries(Object.entries(originalAliases).map(([from,to])=>[from,canonical(to)]));
Object.assign(aliases,{'ccs-install/get-instantly':'ccs-install/connect-tools','ccs-install/get-ai-ark':'ccs-install/connect-tools','ccs-install/claude-skills':'ccs-install/add-instructions','install/start':'ccs-install/welcome','install/ai-agents':'ccs-install/add-instructions'});
for(const p of Object.values(pages)) { const old=p.slug.replace(/^ccs-install\//,'install/').replace(/^ccs-resources\//,'resources/').replace(/^ccs-training\//,'training/'); aliases[old]=p.slug; }
for(const [from,to] of Object.entries(aliases)) if(from===to) delete aliases[from];
write('content/rebuild/actual-aliases.json',aliases);
const sources=read('content/rebuild/source-map.json');
for(const s of sources){
  s.originalPlannedDestinations ??= s.destinations;
  const direct=Object.values(pages).filter(p=>p.sourceIds?.includes(s.id)).map(p=>p.slug);
  s.destinations=[...new Set([...s.originalPlannedDestinations.map(canonical),...direct])];
  s.verification=s.id==='C06'
    ? 'Local three-page collector, context-scoped SQLite cache, proposed analysis handoff and row joins fixture-tested. Real Grok, automatic browser fallback and paid-model client not tested; automatic external adapters not bundled.'
    : 'Actual-app destination and content checks are recorded in QA.md. Source-based instruction is distinct from local simulation and unverified real-account operation.';
}
write('content/rebuild/source-map.json',sources);
console.log(`Built Actual-App Navigation: ${current.length} Lessons, ${Object.keys(aliases).length} Explicit Aliases.`);
