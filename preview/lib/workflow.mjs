// Local contract test harness. No AI, network, paid export, email or calendar calls.
import { createHash } from 'node:crypto';
export const version = '0.2.0-preview';
export const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function requireFields(value, fields) {
  const missing = fields.filter(k => value[k] === undefined || value[k] === null || value[k] === '' || value[k] === 'UNKNOWN');
  if (missing.length) throw new Error(`STOP: supply ${missing.join(', ')}. No action taken.`);
}
export function assertContext(profile, scope) {
  requireFields(profile, ['context', 'service', 'buyer', 'owner']);
  if (profile.context !== scope) throw new Error('STOP: agency acquisition and client delivery contexts do not match.');
}
export function cleanLeads(rows, suppressed = []) {
  const seen = new Set(), suppressedSet = new Set(suppressed.map(x => x.toLowerCase()));
  const eligible = [], held = [], rejected = [];
  for (const raw of rows) {
    const row = { ...raw, email: String(raw.email || '').trim().toLowerCase(), domain: String(raw.domain || '').trim().toLowerCase() };
    let reason;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) reason = 'invalid-or-missing-email';
    else if (seen.has(row.email)) reason = 'duplicate-email';
    else if (suppressedSet.has(row.email) || suppressedSet.has(row.domain)) reason = 'suppressed';
    else if (['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'].includes(row.email.split('@')[1])) reason = 'free-email';
    if (reason) { rejected.push({ ...row, reason }); continue; }
    seen.add(row.email);
    // Domain is supplied evidence, never derived or guessed from a person's name.
    if (!row.domain || !row.title || !row.first_name) held.push({ ...row, reason: 'missing-source-fields' });
    else if (!['google', 'microsoft'].includes(row.mail_route)) held.push({ ...row, reason: row.mail_route === 'seg' ? 'secure-gateway' : 'unknown-mail-route' });
    else eligible.push(row);
  }
  return { eligible, held, rejected, input: rows.length, output: eligible.length, uniqueDomains: new Set(eligible.map(r => r.domain)).size };
}
export function assessCompany(company, rules) {
  if (!company.website_text || company.scrape_status !== 'ok') return { label: 'MAYBE', reason: 'Website missing or thin. Human review required.' };
  if (rules.excluded.some(term => company.website_text.toLowerCase().includes(term))) return { label: 'BAD', reason: 'Explicit exclusion in fixture evidence.' };
  if (rules.required.every(term => company.website_text.toLowerCase().includes(term))) return { label: 'GOOD', reason: 'Required company evidence present in fixture.' };
  return { label: 'MAYBE', reason: 'Insufficient evidence. No guess.' };
}
export function renderEmail(copy, row) {
  return copy.replace(/\{\{([a-zA-Z_]+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(row, key) || String(row[key]).trim() === '') throw new Error(`STOP: missing email field ${key}.`);
    return String(row[key]);
  });
}
export function pausedLoad({ leads, copy, approvedCopyHash, settings }) {
  requireFields(settings, ['context', 'campaign_name', 'sender_group', 'time_zone']);
  if (hash(copy) !== approvedCopyHash) throw new Error('STOP: copy differs from the approved version.');
  if (!settings.stop_on_reply || settings.open_tracking || settings.link_tracking) throw new Error('STOP: unsafe preview settings.');
  if (!leads.length) throw new Error('STOP: no eligible leads.');
  const previews = leads.slice(0, 5).map(row => renderEmail(copy, row));
  return { id: 'SIMULATED-CAMPAIGN-001', status: 'paused', lead_count: leads.length, previews, settings, proof: 'simulated, no sequencer API used' };
}
export function prepareReply(event, state, fit) {
  requireFields(event, ['id', 'thread_version', 'recipient', 'text']);
  if (state.events.includes(event.id)) return { status: 'duplicate-ignored' };
  if (state.optedOut || state.booked || event.opt_out) return { status: 'stopped', reason: 'opt-out or already booked; no further email' };
  if (fit !== 'GOOD') return { status: 'hold', reason: 'Fit is not approved GOOD.' };
  return { status: 'draft', event_id: event.id, thread_version: event.thread_version, recipient: event.recipient, draft: 'Thanks. I can do Tuesday at 14:00 or Thursday at 10:00, Europe/London. Which works?', proof: 'fixture calendar only' };
}
export function approveBooking({ draft, approval, currentVersion, selectedSlot, availableSlots, state, eventId }) {
  if (state.events.includes(eventId)) return { status: 'duplicate-ignored', state };
  if (state.optedOut || state.booked) return { status: 'stopped', state };
  if (!approval || approval.hash !== hash(draft) || approval.recipient !== draft.recipient || approval.channel !== 'email') throw new Error('STOP: exact draft, recipient and channel need approval.');
  if (draft.thread_version !== currentVersion) throw new Error('STOP: reply thread changed. Refresh and obtain approval again.');
  if (!selectedSlot || !availableSlots.some(slot => slotTimestamp(slot) === slotTimestamp(selectedSlot))) throw new Error('STOP: selected time unavailable. Ask for another agreed time.');
  // Return a fixture record only. Never performs an external booking or send.
  return { status: 'simulated-booking', state: { ...state, events: [...state.events, eventId], booked: true, stopSequence: true }, recipient: draft.recipient, slot: selectedSlot };
}
export function slotTimestamp(slot) {
  if (typeof slot !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(slot)) throw new Error('STOP: a time needs an explicit UTC offset.');
  const t = Date.parse(slot);
  if (!Number.isFinite(t)) throw new Error('STOP: invalid calendar time.');
  return t;
}
export function formatSlot(slot, timeZone) {
  try { return new Intl.DateTimeFormat('en-GB', { timeZone, dateStyle: 'full', timeStyle: 'long' }).format(slotTimestamp(slot)); }
  catch { throw new Error('STOP: invalid time or time zone. Confirm it with the owner.'); }
}
export function costGuard({ cap, forecast, connected }) {
  if (!connected) throw new Error('STOP: connector unavailable or expired. Reconnect with the owner; do not retry a write.');
  if (!Number.isFinite(cap) || !Number.isFinite(forecast) || cap < 0 || forecast < 0 || forecast > cap) throw new Error('STOP: sample estimate exceeds the agreed spending cap.');
  return 'within-cap';
}
export function runway(remainingNewContacts, newContactsPerDay) {
  if (remainingNewContacts < 0 || newContactsPerDay <= 0) return { days: null, action: 'Supply valid remaining NEW contacts and daily NEW contacts, not total sends.' };
  const days = remainingNewContacts / newContactsPerDay;
  return { days, action: days < 5 ? 'Prepare a refill for approval.' : 'No refill needed yet.' };
}
export function buyerEconomics({ opportunities, closeRate, customerRevenue, fee }) {
  if ([opportunities, closeRate, customerRevenue, fee].some(x => !Number.isFinite(x) || x < 0) || closeRate > 1 || fee === 0) throw new Error('Supply valid economics inputs.');
  const expectedCustomers = opportunities * closeRate, lifetimeRevenue = expectedCustomers * customerRevenue;
  return { expectedCustomers, lifetimeRevenue, feeMultiple: lifetimeRevenue / fee, qualification: 'Conditional lifetime or stated-period revenue. Not monthly cash or buyer profit. Sales timing not assumed.' };
}
