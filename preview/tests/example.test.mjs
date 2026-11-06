import test from 'node:test';
import assert from 'node:assert/strict';
import { runExample } from '../lib/example.mjs';
import { csv, parseCsv } from '../lib/csv.mjs';
test('whole simulated path: scoped profile, 58 raw, 50 clean, 30 qualified, paused load, booking, report, blocked real handover', () => {
  const e = runExample();
  assert.equal(e.raw.length, 58); assert.equal(e.cleaned.eligible.length, 50); assert.equal(e.cleaned.held.length, 4); assert.equal(e.cleaned.rejected.length, 4);
  assert.equal(e.scored.filter(r => r.label === r.human_label).length, 50);
  assert.equal(e.qualified.length, 30); assert.equal(e.campaign.lead_count, 30); assert.equal(e.campaign.status, 'paused');
  assert.equal(e.booking.status, 'simulated-booking'); assert.equal(e.booking.state.stopSequence, true); assert.equal(e.report.runway.days, 2);
  assert.equal(e.handover.routines, 'NONE ACTIVE'); assert.match(e.handover.status, /NOT READY/);
  assert.equal(runExample().campaign.lead_count, 30);
});
test('student CSV files round trip escaped quotes, commas, Unicode and embedded lines without row corruption', () => {
  const rows = [{ email: 'a@example.com', note: 'A, B "quote"', name: 'Zoë', detail: 'two\nlines' }];
  assert.deepEqual(parseCsv(csv(rows)), rows);
  assert.throws(() => parseCsv('a,b\n"unfinished'), /Unclosed/);
  assert.throws(() => parseCsv('a,a\nx,y\n'), /Duplicate/);
});
