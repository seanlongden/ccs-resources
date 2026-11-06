import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectFile } from '../lib/collect-websites.mjs';
import { csv, parseCsv } from '../lib/csv.mjs';

test('sample collector preserves rows, refuses overwrite and rejects malformed or oversized input',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ccs-collector-test-'));
 try{
  const input=path.join(dir,'input.csv'),output=path.join(dir,'output.csv');
  fs.writeFileSync(input,csv([{domain:'one.example',name:'Quoted, name'},{domain:'',name:'Unknown'}]));
  const collector=async rows=>rows.map(r=>({...r,website_status:r.domain?'OK':'NO_SITE',website_content:'Fixture only'}));
  assert.equal((await collectFile(input,output,collector)).output,2);
  assert.equal(parseCsv(fs.readFileSync(output,'utf8'))[0].name,'Quoted, name');
  await assert.rejects(collectFile(input,output,collector),/exist/);
  await assert.rejects(collectFile(input,input,collector),/different/);
  fs.writeFileSync(input,csv(Array.from({length:51},()=>({domain:'x.example'}))));
  await assert.rejects(collectFile(input,output,collector),/at most 50/);
  fs.writeFileSync(input,'wrong\nvalue\n');await assert.rejects(collectFile(input,output,collector),/domain column/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
