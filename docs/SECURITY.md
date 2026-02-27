# Security

## Current Security Model

Application-level controls:
- authenticated-only call start
- protected routes for sensitive call/scheduler/profile pages
- authenticated-only contribution actions in community
- constrained guest request flow for public participation

Data-level controls:
- Supabase Row Level Security policies defined in schema files
- table-level policies for reads/inserts/updates according to feature behavior

Transport and browser controls:
- HTTPS required in production
- browser permission model governs camera/microphone/screen capture

## Sensitive Areas to Review Before Production
- permissive community read/write prototype policies
- moderation actions and auditability
- RSVP notification pipeline (currently app-session alerts)

## Operational Hardening Checklist
1. Review and tighten RLS policies by actor and table.
2. Enforce least privilege for all write operations.
3. Enable strict domain/origin policies in Supabase auth settings.
4. Validate storage bucket policies and file type/size constraints.
5. Add server-side logging for moderation-sensitive events.

## Reporting
Report vulnerabilities privately to maintainers with:
- issue summary
- impact
- reproduction steps
- suggested mitigation

