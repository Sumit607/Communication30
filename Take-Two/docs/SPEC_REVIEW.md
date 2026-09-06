# Specification review

Reviewed: 6 September 2026. Source: [TAKE_TWO_SPEC_v1.6.md](TAKE_TWO_SPEC_v1.6.md), all 18 sections, including the response examples, curriculum, locked decisions and change log.

Source SHA-256: `448F2B6323E238D6A4571DEA3C9AF30CA015B370D86B463762295163A97E8F5E`. The copied file matches the supplied original byte for byte.

## Assessment

The product is feasible as an Android Expo/React Native app with custom native media processing. Expo Go alone cannot deliver the first real AI-enabled day. The central uncertainty is whether audio coaching produces useful, repeatable corrections, followed by whether local media processing works reliably on the target phone.

The document settles the product direction but does not yet settle every implementable rule. Its “Open product decisions 0” statement is inconsistent with missing targets, multiple-task semantics and workload conflicts. None of the findings requires abandoning the core principles. The proposals below preserve them and explicitly identify curriculum changes that cannot be silently adopted.

The Day 30 outcomes are learning goals, not outcomes software can guarantee. Acceptance tests verify the practice experience and evidence collection; five Phase 0 examples cannot establish educational efficacy.

## Complete section coverage

| Spec section | Analysis and architectural consequence |
|---|---|
| 01 Product | Single-user Android, English, no app account/backend/sync; preserve all L-01–L-12 constraints. |
| 02 Daily loop | A durable state machine must enforce generation before comparison, reshoot, self-check gates and restart limits. Time budgets need curriculum-specific calculation. |
| 03 M0–M12 | Every module is mapped to an implementation phase below; vocabulary, settings and programme rules are first-class requirements. |
| 04 Data boundary | Separate request types; audio track inspection; no diary/confidence serializer; OS backup exclusions; explicit export exception. |
| 05 Input/thought | Finite cached source, four blank fields, immutable submitted revision, coach comparison only afterwards, memory fact with provenance. |
| 06 Correction | Versioned rubric and validated response contracts; measurable signals separate from AI estimates; no invented visual observations. |
| 07 Reshoot/interaction | Mandatory second take, optional third, correction-ID deltas, hidden question, bounded clarification/interruption protocol. |
| 08 Desk/vocabulary/diary | Long/compression schedules, maximum three writing edits, evidence-based vocabulary states, diary independent of AI and streaks. |
| 09 Interface | Programme as navigation, dark Studio, no prompt during recording, accessible status labels and personal target bands. |
| 10 Data model | Add programmes, task instances, attempt reservations, analysis jobs, interaction turns, usage, versioning and vocabulary evidence. |
| 11 Stack | Expo Router, SQLite, SecureStore, local files and a Kotlin Expo module; avoid assuming recording implies audio extraction or frame processing. |
| 12 Cost | Provider/project/model/price verification is a gate; usage-based estimate, bounded requests and no fictitious account balance. |
| 13 Economy | Preserve same-session Take 1 critique, Take 2 delta and Live Q. Public AI and compression feedback remain optional. |
| 14 Risks | Retain the original register; extend it with recovery, backup, hidden-question leakage, export size and measurement validity. |
| 15 Build | Keep P0–P5 intent; split into small testable increments and move basic privacy/recovery earlier than polish. |
| 16 Curriculum | Task instances and timing overrides are essential; preserve baseline conditions, four long-writing days per complete week, milestones and interaction progression. |
| 17 Locked decisions | Preserved as invariants; conditional-reshoot text is interpreted against the user's explicitly required core loop. |
| 18 Change log | v1.6 governs; v1.5's one-day promise and any full-video intermediate path are not reinstated. |

## Contradictions, omissions and proposed resolutions

“Proposed” means a planning recommendation, not an edit to the source. Product-changing curriculum resolutions must be settled in Phase 0 before dependent implementation. Engineering details can be adopted within the architecture without another permission ceremony.

| ID | Evidence | Problem | Proposed resolution / gate |
|---|---|---|---|
| C01 | §§01, 02, 07, 17 D-02 | Take 2 is fundamental, but §07 only requires it below thresholds. A high-scoring Take 1 would strand the hidden question. | Always require Take 2 for a core task. Thresholds affect emphasis and the optional Take 3, never permission to skip Take 2. This follows the user's explicit instruction. |
| C02 | §§02, 06–07 | “Three” fixes and three brief lines conflict with not inventing issues. | Allow 0–3 corrections and the same number of brief lines; Take 2 can consolidate a strength when no valid correction exists. No fabricated quota. |
| C03 | §§02, 16 Day 15 | Ten 15–90–15 drills take 20 minutes once; two rounds approach 40 minutes before inputs, ten critiques, writing or Live Q. | Workload blocker. Recommendation: one selected drill receives the full reshoot loop; nine are first-attempt/self-check practice. This is a curriculum exception requiring a recorded decision. Alternative: split/reclassify the day and revise time expectations. Do not claim all ten full loops fit 50 minutes. |
| C04 | §§02, 16 Days 11, 20, 28–30 | Five ambiguous questions, three compression durations, a ten-minute talk and multi-part finals cannot use one generic day timer. Day 28 is not marked as extended. | Explicit task manifests and per-block time budgets. Recommend treating Day 28 as extended or reducing its supporting blocks. Define which simulation subtasks get a full loop; retain at least one daily core loop and the final baseline comparison. Timing sign-off precedes seeding. |
| C05 | §§02, 05, 09, 16 Days 1, 13, 27, 30 | Universal input/outline conflicts with an unprepared baseline, casual conversation and a five-second start. | Task-level preparation policy. Day 1 baseline and Day 30 repeat occur before topic coaching; no outline for casual mode; Day 27 uses a five-second preparation window. Use §09's explicit permission to omit blocks. |
| C06 | §§03 M4, 07, 10, 16 | `day_id + take_no` cannot identify several tasks or distinguish Live Q from a fourth main take. | Introduce `task_id`, task kind and parent task. Cap attempt slots at three per task, independently of other tasks. Live Q has its own bounded task; default one answer, not an extra reshoot loop. |
| C07 | §§02, 07, 13, 16 Day 20 | Thirty-second restart lock exceeds a 15-second compression take. Abort, crash, short take and optional Take 3 are undefined. | Task-specific hard duration; restart lock is min(default lock, hard duration), with no restart after a short task auto-stops. Physical cancel remains possible but does not erase a started attempt. Native failure before a usable start may release a reservation; recorded attempts never regain slots through deletion. Take 3 is optional after Live Q so surprise is revealed immediately after Take 2. |
| C08 | §§06–07, 10 | Score range, dimension anchors, target schedule, floors and “severe” lack operational definitions. | Phase 0 supplies proposed 1–10 anchors, calibrates targets and verifies severe issues against evidence. Targets cannot gate day unlock. Overall is the app's mean of six valid scores, rather than an inconsistent seventh model score. |
| C09 | §§07, 09, 13 | Compare demands a numeric score delta, but cost policy permits Take 2 delta-only evaluation. | Default compares correction statuses. Numeric deltas appear only when a comparable full rescore exists; otherwise label “not rescored.” Never invent a Take 2 overall score. |
| C10 | §§06, 10, 11, 15 P2/P3 | First AI use precedes the full measurement layer; Presence includes visual behavior. | Early private MVP reports audio-only Presence with visual data unavailable. Full release adds the validated proxy. Missing measurements are null with reasons, not zero. No visual assertion is permitted from audio alone. |
| C11 | §§03 M5/M10, 06 | WPM/fillers look objective in the example but depend on a faithful transcript; envelope pauses do not prove hesitation. | Compute rates locally from a verbatim transcript and measured duration; mark transcript-derived uncertainty. Validate filled pauses, accents and timestamps in P0. Silence is a signal, not a psychological diagnosis. |
| C12 | §§03 M6, 07, 16 | Clarification needs the other side to answer; interruption needs cue timing. Neither protocol is specified. | Bounded scripted interaction tree generated with the hidden question: one spoken clarification turn, one selected prepared clarification, then an answer. No new surprise question generated from Take 2. Interruption uses a bundled local cue with recorded time boundaries and no live AI stream. |
| C13 | §§04, 03 M12 | “Video never leaves” and “diary never” conflict literally with export-all; private files may also enter system backups. | No automatic/app analysis upload of video or diary. Explicit user export is a separate disclosed exception. Exclude all personal data from OS cloud/device-transfer backups; verify the release build. Never automatically export to Photos/MediaStore. |
| C14 | §§03 M1/M9, 08 | Completion, two freezes and catch-up rules are underspecified; mandatory diary would create streak pressure. | At most two distinct curriculum completions per programme-local date. A freeze preserves the streak but completes/unlocks no day. Reflection offers save or skip; diary content is never required. Offline practice stays pending for the required coach loop and can resume without losing work. |
| C15 | §§03 M8, 06, 08, 16 | A coach-generated word may not occur in the source; later natural use cannot be known from string matching; Day 30's new word cannot land on a later programme day. | One daily offer shared across all tasks. Store source understanding, writing evidence and later unprompted speech separately; human confirmation for natural use. Thirty landed words is aspirational, not a completion requirement. Source/context mismatch must be resolved in P0 wording. |
| C16 | §§03 M0, 05 | A summary after reading but before thinking can undermine blank-first generation. RSS may supply only snippets; video captions may be unavailable. | Defer AI summary as well as comparison until Think submission. Use publisher-provided content/captions where permitted; a URL alone is not evidence that a model read a source. Bundle usable evergreen alternatives. |
| C17 | §§03 M12, 04, 08 | Optional biometric lock does not itself encrypt diary rows or prevent Home showing yesterday's lesson. | Treat it as access control; gate diary-derived Home text, previews and exports, and relock on background. Do not claim encrypted SQLite from a biometric UI alone. |
| C18 | §§01 L-10, 11 | Exactly 18:00 cannot be guaranteed if permissions are denied or Android delays notifications. | One local reminder scheduled for 18:00, best-effort delivery, editable. Avoid demanding exact-alarm privileges for a practice reminder. |
| C19 | §§01 L-07, 16 | Primary-mode labels do not specify how mixed/final/test days count toward 70/15/15. | Retain roughly 21/4–5/4–5 programme allocation and audit task-time weighting so ten impromptu drills do not distort scope. Tag mixed tasks explicitly before claiming compliance. |
| C20 | §§01 L-09, 03 M12, 10 | “30 days” could mean elapsed or completed days; deleting a completed day could accidentally relock later work. | Retain until explicit deletion, including breaks and after Day 30. Keep completion ledger independent of deletable media/content; full reset deliberately starts a new programme. |
| C21 | §§03 M10, 07, 09 | Live Q gives three text lines but Progress expects a quality trend; “newly broken” lacks a previous correction reference. | Map structure/clarity verdicts to stable categories, not another six-score report. Delta statuses reference stable Take 1 correction IDs; regression requires actual prior evidence. |
| C22 | §§02, 03 M4, 07 | Aborted/interrupted attempts can exhaust three slots before two usable takes exist. Mandatory reshoot and a strict attempt cap then cannot both be satisfied. | Separate physical attempt slot from coaching role. Preserve the cap and an explicit exhausted/incomplete state; never fabricate Take 2, reset slots or call it a fully coached completion. Phase 0 must settle whether a separately labeled failed-day exception may advance the programme. This is a product decision before implementing unlock logic. |

## Technical dependencies and risk register

| Risk / dependency | Severity | Mitigation and evidence required |
|---|---|---|
| Coach cannot distinguish weak ideas from fluent delivery | Critical | P0 samples explicitly separate these dimensions; human annotations, repeat runs and actual Take 2 pairs. Stop feature work if the quality gate fails. |
| Audio track/container incompatible with provider | Critical | On-device extraction, inspect every track, verify container/MIME and audio-only request; device fixtures of 15 sec through 10 min. Never fall back to sending MP4 video. |
| Android backup violates local-only promise | Critical | Explicit cloud and transfer exclusion rules, merged-manifest inspection and target-device backup exercise. Android documents manufacturer differences in `allowBackup` behavior. [Android Auto Backup](https://developer.android.com/identity/data/autobackup) |
| Exposed BYO API key or uncontrolled requests | High | SecureStore, no bundled key or key logs, minimal endpoint allowlist, sequential calls, per-request ceiling, usage ledger and provider quotas. A key accessible at runtime cannot be made unrecoverable on a compromised client. |
| Malformed, truncated or misleading AI response | High | Validate schema and meaning before commit; correction cap, time bounds and evidence checks; keep raw response locally and expose retry state rather than invented success. |
| Duplicate request after crash/timeout | High | Persistent job identity and result uniqueness; ambiguous provider outcome is visible and is not silently retried. Local idempotency cannot guarantee provider billing idempotency. |
| Low light, glasses, off-center framing or device rotation | High | Calibrate head pose; record valid observation coverage and confidence; show unavailable when unreliable. Never infer exact gaze or judge skin tone/appearance. |
| Post-record measurement takes too long / phone overheats | High | Sample and decode on native workers with bounded memory, benchmark 10-minute talk and standing capture. Camera adapter allows later replacement only if benchmarks justify it. |
| Calls, permission revocation, screen lock, process death, disk full | High | Native capture lifecycle, reserved attempt slots, partial-file recovery and journaled DB/file operations. Stop safely; never silently discard a take or reset its counter. |
| Multi-gigabyte programme and ZIP export | High | Estimate from measured bitrate and task duration; stream archive to a chosen destination; ZIP64/large-file tests, cancellation and verification before offering deletion. |
| Provider/model/terms drift | High | Pin tested model/prompt/schema and record evidence per project; refresh provider terms before personal testing and release. Pricing is configuration. [Gemini API terms](https://ai.google.dev/gemini-api/terms), [pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| Native dependency/runtime mismatch | High | Pin Expo-supported React Native combination; one native module boundary; rebuild for native changes, runtime fingerprint and rollback tests. |
| Hidden question leaks before Take 2 | High | Separate DB query/DTO; omit from Coach render, accessibility tree, notifications, URLs and logs. Revealed state survives restarts. |
| Programme timing and fatigue | High | Timed walkthroughs of normal, multi-drill and extended days before content lock. Keep same-session corrections; do not hide overrun by excluding network time. |
| Sources fail/paywall or article text contains instructions | Medium | Cache finite content, evergreen fallback, provenance, size limits and untrusted-content delimiters; source text never controls tools or system prompts. |
| Metric drift/gaming or false vocabulary success | Medium | Version measurements and rubric; comparable-task first-take trends, target bands, explicit missing data, confirmed usage evidence. |
| Diary leakage through convenience features | High | No AI dependency in diary repository; exclude diary/confidence from payload builders, logs and Home when locked; export requires explicit scope. |

## Planning conclusion

Proceed to the documented P0 evaluation, not to application implementation. C03/C04 workload choices and C08 scoring calibration are the most consequential remaining product decisions. A named model and device compatibility matrix must be pinned using evidence, not inferred from a generic package list. The architecture is fully specified as a proposal in [ARCHITECTURE.md](ARCHITECTURE.md); its hardware and coaching claims remain test gates.
