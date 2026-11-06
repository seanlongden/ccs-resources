import * as w from './workflow.mjs';
export function runExample() {
  const profile = { context: 'agency-acquisition', service: 'cold email', buyer: 'industrial maintenance company owner', owner: 'Illustrative agency owner' };
  w.assertContext(profile, 'agency-acquisition');
  const rules = { required: ['industrial', 'maintenance', 'ohio'], excluded: ['staffing', 'public procurement'] };
  const base = Array.from({ length: 50 }, (_, i) => ({
    first_name: `Owner${i + 1}`, email: `owner${i + 1}@company${i + 1}.example`, domain: `company${i + 1}.example`, title: 'Managing Director', mail_route: i % 2 ? 'google' : 'microsoft',
    location: 'Ohio', customer_revenue_year_one: 60000, sales_cycle_days: 45, spare_accounts: 2,
    website_text: i < 30 ? 'Industrial maintenance services for manufacturers in Ohio' : i < 40 ? 'Staffing and recruiting services' : '', scrape_status: i < 40 ? 'ok' : 'failed', human_label: i < 30 ? 'GOOD' : i < 40 ? 'BAD' : 'MAYBE', evidence_source: 'Synthetic fixture, not a real company website'
  }));
  const raw = [...base, base[0], { ...base[0], email: '' }, { ...base[0], email: 'owner@gmail.com' }, { ...base[0], email: 'suppressed@suppressed.example' }, { ...base[0], email: 'missing@missing.example', domain: '' }, { ...base[0], email: 'seg@seg.example', mail_route: 'seg' }, { ...base[0], email: 'unknown@unknown.example', mail_route: 'unknown' }, { ...base[0], email: 'name@name.example', first_name: '' }];
  const cleaned = w.cleanLeads(raw, ['suppressed@suppressed.example']);
  const scored = cleaned.eligible.map(r => ({ ...r, ...w.assessCompany(r, rules) }));
  const qualified = scored.filter(r => r.label === 'GOOD');
  const copy = 'Hi {{first_name}}, we build and run a cold-email campaign to introduce maintenance firms to manufacturing buyers. I can show you the target list and how we define a qualified opportunity. Would you be open to a brief intro?';
  const campaign = w.pausedLoad({ leads: qualified, copy, approvedCopyHash: w.hash(copy), settings: { context: profile.context, campaign_name: 'Maintenance acquisition / SIMULATED', sender_group: 'Fixture A', time_zone: 'Europe/London', stop_on_reply: true, open_tracking: false, link_tracking: false } });
  const initialState = { events: [], booked: false, optedOut: false };
  const event = { id: 'fixture-event-1', thread_version: 1, recipient: qualified[0].email, text: 'Yes, Tuesday at 14:00 works.' };
  const draft = w.prepareReply(event, initialState, 'GOOD');
  const booking = w.approveBooking({ draft, approval: { hash: w.hash(draft), recipient: event.recipient, channel: 'email' }, currentVersion: 1, selectedSlot: '2026-11-10T14:00:00+00:00', availableSlots: ['2026-11-10T14:00:00+00:00'], state: initialState, eventId: event.id });
  const report = { mode: 'SIMULATED', emails_sent: 20, new_contacts_contacted: 10, interested: 1, booked_meetings: 1, sales: 'UNKNOWN', cash_collected: 'UNKNOWN', remaining_new_contacts: 20, daily_new_contacts: 10, runway: w.runway(20, 10), next_action: 'Prepare approved refill; do not automatically upload or send.' };
  return { version: w.version, mode: 'SIMULATED', profile, raw, cleaned, scored, qualified, campaign, draft, booking, report, economics: w.buyerEconomics({ opportunities: 10, closeRate: .2, customerRevenue: 60000, fee: 6000 }), handover: { status: 'NOT READY FOR REAL HANDOVER', reason: 'File-contract simulation passed; no real AI, sequencer, mailbox or calendar tested.', routines: 'NONE ACTIVE', next_action: 'CCS reviews example, then account-specific safe tests with separate approval.' } };
}
