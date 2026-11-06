# Repeatable Lead Recipe
Pack: 0.2.0-preview

Context / approved offer / buyer / source / search URL or saved query / filters / geography / titles / company exclusions / evidence fields / volume cap / date / refresh rule / owner.

Before export: show sample, expected count, price per result and total cap. Obtain approval for the named export. Keep untouched raw.csv.

After export: clean.csv, rejected.csv and held.csv; counts must sum to the original. Dedupe by email and against other campaigns in the same approved scope. Never guess a domain. Keep SEG and uncertain recipient routes held.

Qualification: 50 labelled companies, website evidence and source status, GOOD/MAYBE/BAD, title decision, scoring version and cost. Only owner-approved passing rows continue.

Refill: rerun the saved recipe, exclude already used/suppressed contacts, sample again if audience or source changed, load paused. Never broaden filters to fill a count without review.
