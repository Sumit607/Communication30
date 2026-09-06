# Local database design

Status: the subsequent engineering-foundation request authorized the initial typed schema, generated migration and database initialization. The fourteen core tables plus `programmes`, `task_instances`, `thinking`, `outlines`, `measurements` and `followups` now exist in `src/db/schema/` and `drizzle/0000_foundation.sql`. No application records or fictional progress are seeded. The original specification remains unchanged.

This document also describes later feature behavior. The foundation enforces foreign keys, same-day/task links where represented, integer confidence ranges, three unique take slots and correction priorities, nullable observations and response provenance. Workflow guards, coaching-role assignment, hidden-question reveal policy, essay revision immutability, deletion/slot journals, complete analysis jobs, vocabulary evidence and progress queries remain later work. SQL constraints alone do not implement those features or validate an AI response.

## Core tables

| Table | Responsibility |
|---|---|
| `days` | Curriculum day within a programme instance; policy and completion state. |
| `takes` | Attempts belonging to a day/task, consumed slot and local media reference. |
| `feedback` | Versioned speaking analysis, transcript, validated scores and provenance. |
| `corrections` | Stable Take 1 fixes referenced by subsequent correction results. |
| `essays` | User writing revisions, including long essays and compression modes. |
| `essay_feedback` | Separate versioned feedback linked to the exact essay revision. |
| `diary` | Private local reflection and mood. |
| `sources` | Source metadata, provenance and feed configuration. |
| `inputs` | Actual input shown for a day/task, source snapshot and completion. |
| `vocab` | Offered vocabulary and learning state with traceable evidence. |
| `topics` | Topic pool, domain, suitability and draw history. |
| `settings` | Nonsecret configuration; API credentials remain in SecureStore. |
| `confidence_ratings` | Local self-reports before Take 1, after Take 2 and after Live Q. |
| `followup_attempts` | Response attempts, question snapshots, transcripts, timing and verdicts. |

These are core tables, not an exclusive list. Retain supporting programmes, task instances, thinking, outlines, measurements, media/attempt journals, analysis jobs, correction results and completion/freeze ledgers from the architecture. They preserve blank-first drafts, multiple tasks per day, recovery and the three-take limit.

Naming alignment: earlier `writing` becomes `essays` plus `essay_feedback`; `confidence` becomes `confidence_ratings`. Keep `followups` as the hidden-question parent and `followup_attempts` as its responses: they represent different lifecycle stages.

## Confidence ratings

One row per core speaking task, unique on `task_id`. Pair before/after with the Take 1 → Take 2 loop and preserve the separate post-Live-Q checkpoint from specification §10.

| Field | Meaning / constraint |
|---|---|
| `id` | Stable primary key. |
| `day_id`, `task_id` | Required references. |
| `take_id` | Nullable Take 1 reference; the before rating saves before recording exists. |
| `after_take_id` | Nullable reference to the associated Take 2. |
| `followup_attempt_id` | Nullable reference to the associated Live Q response. |
| `before_confidence` | Nullable self-rated integer 1–5 before Take 1. |
| `after_confidence` | Nullable self-rated integer 1–5 after Take 2. |
| `after_live_q_confidence` | Nullable self-rated integer 1–5 after Live Q. |
| `before_rated_at`, `after_rated_at`, `after_live_q_rated_at` | Nullable UTC observation times for the respective ratings. |
| `created_at`, `updated_at` | UTC record timestamps. |

Null means not recorded, never zero. Validate each rating with its observation timestamp and stage. Later take linkage must match the same day/task and correct slot; the follow-up must originate from that core task. One ambiguous take reference cannot identify both the before and after recordings. Ratings remain independent of diary save/skip and do not block completion when missing. Confidence is self-report, separate from AI Presence and excluded from Gemini payloads.

## Follow-up questions and attempts

`followups` owns generation and reveal: ID, day, source Take 1, mode, question, generation provenance and reveal time. It links to a response task. Persisting the hidden question requires no response attempt. Reveal only after the source task's Take 2 is durably saved; the Coach screen's result object excludes the question.

| `followup_attempts` field | Meaning / constraint |
|---|---|
| `id` | Stable primary key. |
| `day_id`, `followup_id`, `task_id` | Required day, question-parent and response-task references. |
| `take_id` | Unique reference to the response take, not the source Take 1. |
| `question` | Immutable snapshot of the question actually presented. |
| `answer_transcript` | Nullable transcript; pending/failed analysis does not fabricate one. |
| `thinking_time_s` | Nullable finite nonnegative measured interval from question presentation to response start, excluding recording countdown. |
| `self_answered` | Nullable `yes` / `partly` / `no` self-check, before feedback display. |
| `structure_verdict`, `clarity_verdict`, `next_improvement` | Nullable validated three-part Live Q feedback. |
| `score` | Nullable numeric value reserved for a defined follow-up rubric. |
| `score_rubric_version` | Required when score exists; scale, direction and derivation must be defined first. |
| `analysis_state`, `feedback_id` | Processing state and optional versioned Live Q feedback reference. |
| `created_at`, `answered_at` | UTC creation and nullable answer-completion timestamps. |

The user suggested a score column, but v1.6 defines only structure, clarity and one improvement for Live Q. Preserve `score` without inventing a scale: leave it null until a rubric is defined and evaluated. Do not turn Live Q into a second full coaching report. Any result snapshot on an attempt must match its referenced feedback version; retain prior analyses through versioned feedback.

Keep preparation allowance in task policy, separately from measured thinking time. Interrupted/unreliable timing is unavailable rather than fabricated. Clarification mode preserves the presented question and selected clarification in interaction history.

Attempts reference the existing slot ledger; they do not add another retry allowance. Response takes and source Take 1 have different task roles. Video deletion changes media availability while preserving take identity, feedback and consumed slots. Explicit personal-data deletion removes associated records according to the deletion policy.

## Day 1 → Day 30 evidence

- Uniquely scope day numbers to `(programme_id, day_no)` so restarted programmes have independent baselines.
- Enforce foreign keys plus same-day/task and role consistency through composite constraints where practical and transactional repository validation. Index queried day/task/parent references and preserve unique task/slot and response-take constraints.
- Retain topic, task mode, policy version, duration and model/prompt/schema/rubric provenance to identify comparable observations.
- Pair the repeated Day 1 exercise with its Day 30 repeat within one programme. Show the final random-topic exercise separately.
- Compare before, after-Take-2 and after-Live-Q confidence separately; calculate paired change only when both ratings exist. Show missing values and sample counts.
- Follow-up trends retain mode, observed thinking time and short verdicts. Numeric comparisons require a shared defined rubric; unavailable scores are never zero.
- Video deletion preserves progress evidence. Explicit personal-data deletion can create gaps; never reconstruct deleted observations.
- Export filtering omits unrevealed questions, including any attempt snapshots in inconsistent states. Credentials are excluded; diary/confidence follow the explicit export scope.

## Acceptance criteria for later implementation

**P2b — persistence:** Reviewed migrations include the fourteen core tables and supporting entities. Fresh creation and migration preserve records and relationships. Before confidence saves without a take; all three checkpoints survive restart independently. Reject out-of-range ratings, wrong-day links and wrong take roles. Multiple tasks and programme resets do not mix evidence. Questions persist before responses; duplicate attempt writes are idempotent and cannot create a fourth slot. Video deletion preserves evidence; explicit day deletion removes personal records. No API credential is in SQLite.

**P2d — Live Q:** Restart/deep-link fixtures preserve delayed reveal and self-check-before-feedback. Failed/pending analysis leaves transcript, verdict and score unavailable. A valid three-line verdict does not require a numeric score. Timing distinguishes observed preparation from its allowance and handles interruptions.

**P3b — progress:** Day 1/30 fixtures cover repeated-baseline matching, separate confidence checkpoints, missing data, different interaction modes/rubrics, programme resets and deleted videos. Queries never replace missing data with zero or compare incompatible numeric rubrics.

The foundation tests cover startup, migration idempotence/rollback, empty initial data, real SQLite persistence, basic constraints and shell rendering. The full feature acceptance checks above remain pending. See [foundation report](FOUNDATION_REPORT.md), [architecture](ARCHITECTURE.md) and [implementation phases](IMPLEMENTATION_PHASES.md).
