# SOP template with a completed example
Pack: 0.1.0-preview

## Blank template
Job and useful output / owner / trigger and time zone / input files and versions / required access / steps / approval boundaries / checks / failure and escalation / evidence / next handoff / last reviewed date.

## Completed example: weekly lead runway review
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
