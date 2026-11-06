# Optional LinkedIn Instructions
Pack: 1.0.0. These four source-derived skills are optional and separate from the sixteen core email skills. Save each by its exact name, then inspect it in Private Skills. Choose an activity window and role rules with CCS first; L1 uses 30 days and the pack uses 60. Manual LinkedIn action only.

## 1. Linkedin-signal-prospecting

~~~text
---
name: linkedin-signal-prospecting
description: Use when finding people to message on LinkedIn. Finds companies with a real, dated, sourced signal that they already spend money to win business, finds the one person who owns sales or growth there, checks they are active and still at the company, and drops anyone who does not qualify.
---

## Review Edition Boundary
Do not log in to LinkedIn, click, send, connect, schedule a job, buy data or change a shared Sheet. Produce local research, CSV files and draft messages only. Preserve source links. Missing activity/role settings require the owner's choice. Folder names are not access controls.

# LinkedIn Signal Prospecting

## When To Use
- Every evening before a LinkedIn send day, to build the next day's list (the linkedin-prospect-sheet skill uses the output).
- When the owner wants more LinkedIn prospects for an offer.

## The Signal Rule
Every prospect needs at least one real, dated, sourced signal that their company already spends money to win business, or has a fresh reason to buy what the owner sells. No signal, no prospect. Skip founder-run companies with no sales hires, no trade shows and no growth spend, even if they fit.

Signals, best first:
1. Hiring sales or business development reps now (SDR, BDR, account executive, outside or field sales).
2. A sales leader with no sales team under them.
3. Exhibiting at a named recent or upcoming industry trade show (public exhibitor lists).
4. A sales leader new in the role in the last 90 days.
5. A new plant, line, warehouse or product line.
6. An acquisition, buyout or sizable raise with a growth plan.
7. Visibly paying for outbound or ads.

## Steps
1. Read the owner's fit rules (who can afford the offer, company types to skip).
2. Find companies with signals, cheapest sources first:
   - Job posts: search the web for sales job titles plus an industry word plus the month. Open the posting to confirm the date and that it is still open.
   - Press releases: search news wires for "appointed" or "names" plus "Vice President of Sales" or "Chief Revenue Officer" plus the industry and month.
   - Trade show exhibitor lists: pull the full public exhibitor list for a relevant show and work through it.
   For each company save: company, domain, signal, signal date, source link.
3. Remove companies that fail the fit rules or that are already on the master prospect sheet or any earlier list.
4. Find one person per company whose role clearly owns sales, growth or new business: the owner, president or CEO of a small to mid-size company; a chief revenue, commercial or sales officer; a VP or SVP of sales, business development, growth or commercial; a director of sales or business development at a mid-size company. Check the headline as well as the title.
5. Drop: operations, general managers, HR, finance, engineering, junior, regional or divisional roles, and anyone who has left the company. When in doubt, drop.
6. Check each person's public profile:
   - Posted or active in the last 60 days (check activity first, it filters out the most people).
   - Still at the company.
   - Open profile (can receive an InMail without a connection) or not. Open profiles go to the InMail list; the rest go to the connection list.
   If the best person fails, try the next-best person with a strict sales role at the same company.
7. Set a spending cap per night for any paid lookup tool. Stop at the cap and report the count.
8. Save the qualified people with: name, title, company, domain, profile link, signal, signal date, source link, last activity date, open profile yes or no, why they fit in one line.

## Rules
- Never log in to LinkedIn, never automate LinkedIn, never use fake or extra LinkedIn accounts. Public pages and lookup tools only.
- Every fact you save has a source link.
- Never repeat a person or company already contacted.
- Never print a key.

## What Good Output Looks Like
- Every person has a dated signal with a link and a strict sales-owning role.
- Every person was active in the last 60 days and is still at the company.
- Spend stayed under the cap and was reported.
~~~

## 2. Linkedin-prospect-sheet

~~~text
---
name: linkedin-prospect-sheet
description: Use every evening before a LinkedIn send day. Turns the qualified prospects from linkedin-signal-prospecting into a daily hand-picked sheet with the profile link, why they fit, the signal and its source, and a ready-to-paste InMail or connection note for each person. The owner sends every message by hand.
---

## Review Edition Boundary
Do not log in to LinkedIn, click, send, connect, schedule a job, buy data or change a shared Sheet. Produce local research, CSV files and draft messages only. Preserve source links. Missing activity/role settings require the owner's choice. Folder names are not access controls.

# LinkedIn Prospect Sheet

## When To Use
- Every evening before a send day (for example Sunday to Thursday at about 10 PM).
- When the owner asks for tomorrow's LinkedIn list.

## Setup (Once)
Ask the owner for: the master Google Sheet to use, how many people per day (for example 30), the send days, and the time the sheet must be ready.

## Steps
1. Run linkedin-signal-prospecting for the day's target number.
2. Pick the best people: strongest signal first, one person per company, mix of signals and industries.
3. Write a message for each with linkedin-message-writer: an InMail for open profiles, a connection note for the rest.
4. Add a highlighted date row for the send day (for example "Wednesday, Nov 4, 2026"), then one row per person.
5. Columns, in order:
   - A: profile link (clickable)
   - B: the full message, ready to paste
   - C: status ("Not sent")
   - Tracking: sent date, accepted, replied, meeting booked (left blank for the owner)
   - Name, title, company, what the company does
   - Why fit (one line)
   - Signal, signal date, source link
   - Last activity date
   - Domain, HQ, employees, message type (InMail or connection)
6. Save a local copy of the day's rows.
7. Send the owner one message: how many people were added under which date, the sheet link, the cost, and any shortfall in one line.

## Rules
- Manual sending only. The owner copies each message and sends it from their own LinkedIn. Grok Bot never sends, logs in or automates anything on LinkedIn.
- Never repeat a person or company already in the sheet.
- Edit the sheet in place. Never share, trash or recreate it.

## What Good Output Looks Like
- The sheet is ready before the owner's send time.
- Every row has a working profile link, a reason to reach out with its source, and a message that needs no editing.
- The owner can work down the sheet in order.
~~~

## 3. Linkedin-message-writer

~~~text
---
name: linkedin-message-writer
description: Use when writing a LinkedIn InMail, connection note or after-accept message. Writes one short message per person built on one specific, real, sourced signal, tied to the result they already pay for, with a plain offer and ask. 50 to 75 words for InMails. Manual sending only.
---

## Review Edition Boundary
Do not log in to LinkedIn, click, send, connect, schedule a job, buy data or change a shared Sheet. Produce local research, CSV files and draft messages only. Preserve source links. Missing activity/role settings require the owner's choice. Folder names are not access controls.

# LinkedIn Message Writer

## When To Use
- For every row on the daily prospect sheet.
- When the owner asks for a message to one person.

## InMail Shape (50 To 75 Words, Subject = Their First Name)
1. A direct question about how they win new business, tied to their market. Example: "How are you guys getting in early with manufacturers setting up new sites in the Southeast?"
2. One specific, real signal, said plainly, and why it matters for their sales: we pick up events like this early, before competitors show up or before a partner is chosen.
3. The offer and the ask in one sentence: what we could do for them, then "would it be worth grabbing some time?" or "would it be worth a brief intro?"
For variety, the offer can come first and the signal second.

## Connection Note (Under 300 Characters)
First name, then one plain line on the signal, then a short question. No pitch.

## After They Accept
Thank them for connecting, then the observation and one question. Stop there. The goal is a reply.

## Tie The Signal To What They Already Pay For
- Hiring reps: meetings for the reps they are hiring.
- Trade show: accounts from the show beyond the booth.
- New sales leader: pipeline for the leader's first quarter.
- New site or raise: buyers who are choosing partners right now.
Never a bare "saw you're hiring".

## Examples (Made Up)
    Dana,

    How are you guys getting in early with food plants adding new packaging lines?

    A snack maker in Georgia just announced a second packaging line. We pick up announcements like that when they're made, well before the equipment is bought. If we could put your team in front of those plant managers, would it be worth grabbing some time?

    Chris,

    A surgical device startup in Ohio just closed a new funding round.

    We track filings like that as they happen, which gives partners like you a window before the build partner is chosen. If we could get you in front of funded medical device companies right as they pick a manufacturing partner, would it be worth a brief intro?

## Rules
- One specific named event per message. Never a vague roll-up.
- Every fact is real, with its source saved on the sheet.
- No compliments, no exclamation points, no baity lines, no reciting their profile, no claims we cannot know.
- Never use "quick", "conversation" or "deal flow". Never write contrast lines of the "not this but that" kind.
- No em dashes. The company name at most once.
- Vary wording across the batch so no two messages share a sentence.
- Manual sending only. Grok Bot writes; the owner sends.

## What Good Output Looks Like
- Every line has a purpose.
- A stranger understands why you wrote to them and what you offer.
- The message reads like a peer wrote it by hand.
~~~

## 4. Linkedin-results-tracker

~~~text
---
name: linkedin-results-tracker
description: Use every weekday and every Monday. Reads the owner's LinkedIn prospect sheet (sent, accepted, replied, meeting booked), reports daily counts and weekly rates by signal type and message shape, and recommends what to do more of. Read-only toward LinkedIn.
---

## Review Edition Boundary
Do not log in to LinkedIn, click, send, connect, schedule a job, buy data or change a shared Sheet. Produce local research, CSV files and draft messages only. Preserve source links. Missing activity/role settings require the owner's choice. Folder names are not access controls.

# LinkedIn Results Tracker

## When To Use
- Every weekday morning, for the daily scoreboard.
- Every Monday, for the weekly review.

## Steps
1. Read the master prospect sheet. Count, for yesterday: messages sent (InMails and connection requests), accepts, replies, positive replies, meetings booked.
2. Ask the owner to mark any replies or accepts they have not logged. Grok Bot never reads the LinkedIn inbox itself.
3. Weekly: group results by signal type (hiring, trade show, new leader, new site, raise) and by message shape (question first, offer first). Report accept rate, reply rate, positive replies and meetings for each.
4. Name what is working in plain words, and recommend one change for next week (for example "more trade show prospects, fewer funding ones").
5. Feed the daily numbers to the daily-scoreboard skill if it is installed.

## Rules
- Read-only. Never log in to LinkedIn and never send or automate anything there.
- Never invent a number. Blank means "not logged yet".

## What Good Output Looks Like
- The owner sees in ten seconds what was sent and what came back.
- Each week ends with one clear change to test.
~~~
