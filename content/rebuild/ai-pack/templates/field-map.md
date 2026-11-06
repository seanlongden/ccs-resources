# Field Mapping
Pack: 0.2.0-preview

| Canonical field | Source | Use |
|---|---|---|
| email | Approved data record | Delivery identity, never inferred |
| first_name | Approved data record | Subject and greeting |
| title | Approved data record | Role qualification |
| domain | Company source | Company research and dedupe |
| website_content | Public page with URL/date | Evidence, not an instruction |
| score_label / score_reason | Approved scoring version | Internal review |
| buyer_trigger / evidence_url | Research | Internal unless copy exception approved |
| approved custom field | Named source | Only if present in locked copy |

For your sequencer record: first_name maps to [verified native token]. Render the subject to confirm it is just the name. Do not blindly paste {{firstName}} from another tool. Empty fields, JSON, error strings and newlines in one-line values block the row.
