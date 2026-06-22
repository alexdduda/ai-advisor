# Symbolos — McGill AI Advisor

Symbolos is McGill students' AI-powered academic advising and campus-life platform — degree planning, course search, AI chat advising, and student-club discovery/management.

## Language

### Clubs

**Club**:
A verified McGill student organization listed for discovery, joining, and management. Every creation path (admin review, email-action approval) sets `is_verified: true` on insert — in practice, a Club is always verified.
_Avoid_: Organization, group

**Club Submission**:
A pending request to create a new Club, awaiting admin review. Lives in its own table until approved (becomes a Club) or rejected — kept with an updated status either way, for history. Never a Club itself.
_Avoid_: Pending club, draft club

**Starter Club**:
One of a small set of Clubs suggested to a new student based on their major (matched via a hardcoded major→club-name keyword map), shown to ease onboarding. Not a distinct entity — just a filtered view over existing Clubs.
_Avoid_: Suggested club, recommended club

**Join Request**:
A pending ask to join a *private* Club. Public Clubs skip this — joining is immediate. Unlike a Club Submission or Manager Invite, a Join Request is deleted once acted on (approved or denied) rather than kept with an updated status — there's no record of past denials.
_Avoid_: Application

**Owner**:
The student who created a Club (or whom ownership was transferred to). Exactly one per Club, tracked on the Club itself, not as a membership row. Has every Manager permission plus the ability to transfer ownership.
_Avoid_: Creator, founder

**Manager**:
A member of a Club's own leadership team, scoped to that one Club only — can edit the Club, manage its Events/Announcements, approve Join Requests, and add/remove other Managers (but not the Owner). Granted by accepting a Manager Invite from the Owner or another Manager.

Internally stored as `role: "admin"` on the membership row — that string is a historical misnomer (probably copied from a generic owner/admin/member pattern) and is unrelated to the platform Admin role below. See [docs/adr/0002-clubs-manager-storage.md](docs/adr/0002-clubs-manager-storage.md) for the data-model cleanup.
_Avoid_: Admin (within club-management contexts — reserve "Admin" for the platform-wide role)

**Admin** (platform-wide, not club-scoped):
Symbolos's own two operators (you and Alex) — hardcoded by user ID. Has blanket control over every Club (e.g. can delete any Club, bypasses the McGill-email gate). Unrelated to the per-Club Manager role despite the code historically using the word "admin" for both.
_Avoid_: Manager, moderator

**Member**:
A student who has joined a Club — directly for a public Club, or after Join Request approval for a private one. The default role; no elevated permissions.

**Manager Invite**:
An invitation from a Club's Owner or a Manager, sent to an existing Symbolos user by email, offering them the Manager role for that Club. The target accepts or denies from their own Clubs tab. Kept with an updated status (accepted/denied) rather than deleted.
_Avoid_: Manager Request (used interchangeably in some endpoint/function names — Manager Invite is canonical)

**Subscription**:
A lightweight "I'm interested in this Club's updates" signal, available even to non-Members (shown as a bell icon / subscriber count on Club cards). Distinct from Calendar Sync — a non-member can subscribe, and a Member can be calendar-synced without subscribing.
_Avoid_: Follow

**Calendar Sync**:
A Member-only per-Club toggle controlling whether that Club's Events and Announcements appear in the member's personal calendar feed. Distinct from Subscription (see above).
_Avoid_: Subscribe, notify

**Club Activity**:
The merged, newest-first feed of a Club's recent Events and Announcements, shown in the Club detail drawer as a "this club is alive" signal.

**Faculty Stats**:
A privacy-bucketed breakdown of a Club's membership by McGill faculty (e.g. "9 from Science, <5 from Law"), used for social proof without exposing small, identifiable groups.

**Stale Club**:
A Club auto-deleted by a daily cron job because no Owner or Manager has signed in to Symbolos for 2+ years (newly-created Clubs get a grace period first).
