// Next 13's outputFileTracingIncludes only updates Pages Router traces.
// Add the exact student files to the App Router traces before Vercel packages them.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const filesIn = relative => fs.readdirSync(path.join(root,relative),{withFileTypes:true}).map(entry=>{
  if(!entry.isFile())throw new Error('Unexpected directory or symlink in resource assets: '+relative+'/'+entry.name);
  return relative+'/'+entry.name;
});
const assets = [
  'content/rebuild/ccs-ai-pack.zip',
  ...['README.md','AGENTS.md','manifest.json'].map(name=>'content/rebuild/ai-pack/'+name),
  ...filesIn('content/rebuild/ai-pack/skills'),
  ...filesIn('content/rebuild/ai-pack/templates'),
  ...filesIn('content/rebuild/example'),
];
const content = ['navigation.json','page-index.json','pages-103.json','pages-104.json','search-index.json'].map(name=>'content/'+name);
for(const [route,required] of [
  ['api/resources/download',assets],
  ['api/content/page',content],
  ['api/content/navigation',['content/navigation.json']],
]) {
  const trace = path.join(root,'.next/server/app',route,'route.js.nft.json');
  const data = JSON.parse(fs.readFileSync(trace,'utf8'));
  const existing = new Set(data.files);
  for(const file of required) {
    const target=path.join(root,file);
    if(!fs.statSync(target).isFile())throw new Error('Missing production resource: '+file);
    existing.add(path.relative(path.dirname(trace),target).split(path.sep).join('/'));
  }
  data.files=[...existing].sort();
  fs.writeFileSync(trace,JSON.stringify(data));
}
console.log(`Production traces include ${assets.length} student assets and the current content/search files.`);
