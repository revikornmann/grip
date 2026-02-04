# Current Sprint

**Sprint:** _[Sprint number]_
**Dates:** _[Start date]_ — _[End date]_
**Goal:** _[One-sentence sprint goal]_

---

## Sprint Backlog

### In Progress

| Story | Title | Assignee | Status |
|-------|-------|----------|--------|
| _US-XX-XXX_ | _Story title_ | _Name_ | _In progress_ |

### To Do

| Story | Title | Priority | Estimate |
|-------|-------|----------|----------|
| _US-XX-XXX_ | _Story title_ | _P0/P1/P2_ | _X days_ |

### Done

| Story | Title | Completed |
|-------|-------|-----------|
| _US-XX-XXX_ | _Story title_ | _Date_ |

---

## Sprint Notes

### Blockers
- _None currently_

### Decisions Made
- _Document key decisions during the sprint_

### Carry-over
- _Stories that didn't complete and why_

---

## Definition of Done (Sprint Level)

- [ ] All committed stories completed
- [ ] Code reviewed and merged
- [ ] Tests passing
- [ ] No critical bugs introduced
- [ ] Demo-able to stakeholders

---

## Suggested First Sprint

For the first sprint, consider starting with these foundational stories:

**Goal:** Establish app foundation and complete license plate lookup

| Story | Title | Epic | Estimate |
|-------|-------|------|----------|
| US-00-001 | App shell with responsive layout | Foundation | 1 day |
| US-00-002 | Navigation between main sections | Foundation | 0.5 day |
| US-00-003 | Home page with value proposition | Foundation | 0.5 day |
| US-00-004 | Local storage abstraction layer | Foundation | 0.5 day |
| US-01-001 | Enter license plate and fetch vehicle data | Lookup | 1 day |
| US-01-002 | Validate license plate format | Lookup | 0.5 day |
| US-01-003 | Display comprehensive vehicle details | Lookup | 0.5 day |
| US-01-004 | Handle vehicle not found | Lookup | 0.5 day |

**Total estimate:** ~5 days

This gives you a working app that can look up vehicles, which is the foundation for all other features.

---

## How to Use This File

1. **Before sprint:** Copy stories from epic files into "To Do" section
2. **During sprint:** Move stories through In Progress → Done
3. **After sprint:** Archive this file and create fresh one for next sprint

Archive naming: `SPRINT-001.md`, `SPRINT-002.md`, etc.
