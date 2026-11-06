# Connection And Access Check
Pack: 1.0.0. Do not record secret values.

| Tool | Owner/Workspace | Method | Required Read | Future Write | Secure Reference | Safe Test | Result |
|---|---|---|---|---|---|---|---|
| Grok Bot | UNKNOWN | Account | Files/skills | None in review | Name only | Read one saved skill | NOT TESTED |
| Sequencer | UNKNOWN | Supported connector/API | Named campaign/thread | Paused import/reply only after approval | Name only | List scoped campaigns | NOT TESTED |
| Data Provider | UNKNOWN | UI/connector/API | Search/count | Paid export after approval | Name only | View search/count | NOT TESTED |
| Scheduler | UNKNOWN | Connector/API | Actual event/slots | Booking after approval | Name only | Read available slots | NOT TESTED |
| Calendar | UNKNOWN | Connector | Busy times | Event changes after approval | Name only | Check known busy slot | NOT TESTED |

Trigger route / actual receiver / supported payload:
Backstop / last successful run:
Missing capability and manual fallback:
Error / owner action:
Do not claim access merely because an app appears in the connection list.
