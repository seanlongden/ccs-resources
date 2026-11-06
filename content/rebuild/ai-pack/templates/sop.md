# SOP Template With A Completed Example
Pack: 1.0.0

## Blank Template
Job and useful output / owner / trigger and time zone / input files and versions / required access / steps / approval boundaries / checks / failure and escalation / evidence / next handoff / last reviewed date.

## Completed Example: Weekly Lead Runway Review
Output: a dated refill recommendation.
Owner: Campaign Monitor prepares; agency owner approves paid export or campaign load.
Trigger: weekly review, in the agreed business time zone.
Inputs: current campaign, remaining eligible uncontacted leads, average daily NEW contacts used and saved lead recipe.
Steps: fetch current read-only data; check metric definitions and date; divide eligible remaining NEW contacts by daily NEW contacts; compare with the agreed refill threshold; prepare the same recipe and dedupe scope.
Approval: no export, purchase, upload, sending or campaign change is authorised by the review.
Check: 200 contacts / 50 new contacts per day = 4 days, regardless of total follow-up sends.
Failure: if either metric is missing or daily new contacts is zero, return UNKNOWN and the missing field, not a numeric runway.
Handoff: owner reviews proposed refill sample/cost; List Builder prepares the approved next job.
Evidence: source/time, counts, formula, recommendation and owner.
