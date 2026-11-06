import test from 'node:test';
import assert from 'node:assert/strict';
import * as w from '../lib/workflow.mjs';

const lead = { first_name: 'Alex', email: 'alex@maintenance.example', domain: 'maintenance.example', title: 'Managing Director', mail_route: 'microsoft' };
test('requires missing/unknown inputs and separates acquisition from client delivery', () => {
  assert.throws(() => w.requireFields({ buyer: 'UNKNOWN' }, ['buyer']), /supply buyer/);
  assert.throws(() => w.assertContext({ context: 'client-delivery', service: 'cold email', buyer: 'plant manager', owner: 'student' }, 'agency-acquisition'), /do not match/);
});
test('cleaner reconciles rejected, held and eligible rows without guessed domains', () => {
  const out = w.cleanLeads([lead, { ...lead }, { ...lead, email: '' }, { ...lead, email: 'personal@gmail.com' }, { ...lead, email: 'b@b.example', domain: '' }, { ...lead, email: 'c@c.example', mail_route: 'seg' }, { ...lead, email: 'd@d.example', mail_route: 'unknown' }, { ...lead, email: 'e@e.example' }], ['e@e.example']);
  assert.equal(out.eligible.length, 1); assert.equal(out.held.length, 3); assert.equal(out.rejected.length, 4);
  assert.equal(out.input, out.eligible.length + out.held.length + out.rejected.length);
  assert.equal(out.held.find(x => x.email === 'b@b.example').domain, '');
});
test('50-company synthetic calibration reconciles exact hand labels', () => {
  const rows = Array.from({ length: 50 }, (_, i) => ({ website_text: i < 30 ? 'Industrial maintenance services for manufacturers' : i < 40 ? 'Staffing and recruiting services' : '', scrape_status: i < 40 ? 'ok' : 'failed', human: i < 30 ? 'GOOD' : i < 40 ? 'BAD' : 'MAYBE' }));
  const results = rows.map(r => w.assessCompany(r, { required: ['industrial', 'maintenance'], excluded: ['staffing'] }));
  assert.equal(results.filter((r, i) => r.label === rows[i].human).length, 50);
  assert.equal(results.filter(r => r.label === 'MAYBE').length, 10);
  // This validates the deterministic fixture classifier, not an LLM or real research accuracy.
});
test('approved copy loads PAUSED; missing variables, changed copy and tracking are blocked', () => {
  const copy = 'Hi {{first_name}}, is finding more maintenance contracts a priority this quarter?';
  const args = { leads: [lead], copy, approvedCopyHash: w.hash(copy), settings: { context: 'agency-acquisition', campaign_name: 'fixture', sender_group: 'A', time_zone: 'Europe/London', stop_on_reply: true, open_tracking: false, link_tracking: false } };
  assert.equal(w.pausedLoad(args).status, 'paused');
  assert.throws(() => w.pausedLoad({ ...args, copy: copy + '!' }), /differs/);
  assert.throws(() => w.renderEmail(copy, { first_name: '' }), /missing/);
  assert.throws(() => w.pausedLoad({ ...args, settings: { ...args.settings, open_tracking: true } }), /unsafe/);
});
test('reply fit, opt-outs, exact approvals, thread changes and calendar conflicts stop writes', () => {
  const event = { id: 'evt-1', thread_version: 1, recipient: lead.email, text: 'Interested, can we talk?' }, state = { events: [], booked: false, optedOut: false };
  assert.equal(w.prepareReply(event, state, 'MAYBE').status, 'hold');
  assert.equal(w.prepareReply({ ...event, opt_out: true }, state, 'GOOD').status, 'stopped');
  const draft = w.prepareReply(event, state, 'GOOD');
  const args = { draft, approval: { hash: w.hash(draft), recipient: draft.recipient, channel: 'email' }, currentVersion: 1, selectedSlot: '2026-11-10T14:00:00+00:00', availableSlots: ['2026-11-10T14:00:00+00:00'], state, eventId: event.id };
  assert.throws(() => w.approveBooking({ ...args, approval: null }), /need approval/);
  assert.throws(() => w.approveBooking({ ...args, currentVersion: 2 }), /thread changed/);
  assert.throws(() => w.approveBooking({ ...args, availableSlots: [] }), /unavailable/);
  const first = w.approveBooking(args);
  assert.equal(first.state.stopSequence, true);
  assert.equal(w.approveBooking({ ...args, state: JSON.parse(JSON.stringify(first.state)) }).status, 'duplicate-ignored');
  assert.equal(w.prepareReply(event, first.state, 'GOOD').status, 'duplicate-ignored');
});
test('expired connections, cost caps and low runway produce useful next steps', () => {
  assert.throws(() => w.costGuard({ cap: 10, forecast: 5, connected: false }), /expired/);
  assert.throws(() => w.costGuard({ cap: 10, forecast: 11, connected: true }), /spending cap/);
  assert.equal(w.runway(100, 50).days, 2); assert.match(w.runway(100, 50).action, /refill/);
  assert.equal(w.runway(100, 0).days, null);
});
test('economics distinguishes future customer revenue from profit and timing', () => {
  const out = w.buyerEconomics({ opportunities: 10, closeRate: .2, customerRevenue: 60000, fee: 6000 });
  assert.equal(out.expectedCustomers, 2); assert.equal(out.lifetimeRevenue, 120000); assert.equal(out.feeMultiple, 20);
  assert.match(out.qualification, /Not monthly cash/);
});
test('time zones require offsets and distinguish repeated DST hours', () => {
  assert.throws(() => w.slotTimestamp('2026-11-10T14:00:00'), /explicit UTC offset/);
  assert.equal(w.slotTimestamp('2026-11-10T14:00:00+00:00'),w.slotTimestamp('2026-11-10T09:00:00-05:00'));
  assert.notEqual(w.formatSlot('2026-11-01T05:30:00Z','America/New_York'),w.formatSlot('2026-11-01T06:30:00Z','America/New_York'));
  assert.throws(()=>w.formatSlot('2026-11-10T14:00:00Z','Not/A_Zone'), /invalid time/);
});
test('refill excludes earlier contacts and retains only fresh eligible rows', () => {
  const fresh={...lead,email:'fresh@new.example',domain:'new.example'};
  const result=w.cleanLeads([lead,fresh], [lead.email]);
  assert.deepEqual(result.eligible.map(r=>r.email),['fresh@new.example']);
  assert.equal(result.rejected[0].reason,'suppressed');
});
