import test from 'node:test';
import { execFileSync } from 'node:child_process';
test('SQLite company cache passes five deduplication, handoff, recovery, invalidation and evidence checks',()=>{
  execFileSync('python3',['-B','preview/tests/company-cache_test.py'],{stdio:'pipe'});
});
