# Admin Leads UI Improvement Plan

## Goals
- Keep the Leads area focused on website-sourced leads only.
- Reduce time-to-first-response with clearer triage signals.
- Make lead quality and completeness visible at a glance.
- Streamline daily workflow: review, prioritize, respond, update.

## Primary Users
- Admins handling inbound leads and follow-ups.
- Sales leads who need fast access to top-priority opportunities.

## Information Architecture
- **Leads Inbox (default):** website leads only.
- **Focus Queue:** quick filters (New, High Score, Needs Reply, Overdue).
- **Lead Detail Drawer:** full context + actions.
- **Quality Snapshot:** completeness and lead-score distribution.

## Key User Flows
1. **Morning triage:** Open Leads → Focus Queue → sort by score/time.
2. **Prioritize:** Filter by status/priority/source → select lead.
3. **Review:** Open detail drawer → scan project types + requirements.
4. **Act:** Update status/priority → add admin note → assign owner.

## Components & Layout
- **Header strip:** title + short description + total counts.
- **Stats row:** total leads, new today, pending, conversion rate.
- **Focus Queue chips:** one-click filters with counts.
- **Filters bar:** search, status, priority, source.
- **Leads table:** score, priority, name, company, project types, status, source, created/updated.
- **Detail drawer:** contact info, lead score breakdown, requirements, notes, actions.

## Data & Field Rules
- Show only `contact_leads` with `source = 'website'`.
- `project_types` array preferred; fallback to `project_type` if empty.
- Required columns: `lead_score`, `priority`, `status`, `created_at`, `source`.

## States
- Loading, Empty, Error.
- Empty state includes CTA to share contact form link.

## Success Metrics
- Time-to-first-response < 4 hours.
- 90% of leads have `project_types` populated.
- Lead completion rate (required fields) > 95%.
