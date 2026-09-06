# Independently testable implementation phases

Foundation update: the user's later setup-only request explicitly authorized typed schema/migrations, empty-database startup and lint/format/test tooling. Those are now foundation work; they do not mark P0 or P1 complete and do not implement the P2b feature repositories/recovery acceptance gates. Current evidence: [FOUNDATION_REPORT.md](FOUNDATION_REPORT.md).

Status: **phase plan with a subsequently authorized setup exception**. The user requested the Expo/TypeScript scaffold and initial package installation now. That setup is separate from completing P1's application flow; P0 has not run and no feature increment has passed. The specification's P0–P5 sequence is retained and divided into bounded increments. Every increment ends with a demonstrable artifact and acceptance evidence.

Architecture: [ARCHITECTURE.md](ARCHITECTURE.md). Conflicts: [SPEC_REVIEW.md](SPEC_REVIEW.md). P0 protocol: [PHASE_0_PLAN.md](PHASE_0_PLAN.md).

The original request ended after architecture/planning. The subsequent user request authorizes environment/bootstrap installation before the real P0 quality gate; it does not mark that gate passed or authorize all application features. “Independently testable” means an increment's behavior can be verified with fixtures/adapters without waiting for the entire app; it does not mean all increments have no dependencies.

## Phase 0 — validate the learning engine

**Depends on:** real samples, verified provider/project and evaluation ceiling. **Artifact:** evidence-backed pass/tune/stop report, frozen candidate prompt/rubric/contracts and resolved workload policies. **Runtime:** existing phone recorder and verified audio-only evaluation path; no app code.

**Acceptance:** all gates in the P0 plan have actual results; at least five Take 1 samples, repeated runs, three real reshoot pairs and three hidden follow-up experiences; no privacy breach; useful corrections and timing/cost evidence. C03/C04 are resolved before day-manifest implementation. Failure returns to prompt/model evaluation, not UI construction.

## P1a — domain policies and static daily-flow prototype

Before major screen implementation, follow [DESIGN_WORKFLOW.md](DESIGN_WORKFLOW.md): inspect/create the visual target with Product Design/Figma, review hierarchy and states, and plan component reuse. Existing Figma designs govern visuals; the specification governs behavior. Apply this gate to later phases with major UI changes too, and create GitHub checkpoints after stable phases.

**Depends on:** P0 pass and a later instruction to begin implementation. **Artifact:** pinned Expo/React Native/TypeScript project, navigation flow and pure task transition policies. **Runtime:** Expo Go permitted; synthetic/mock responses only.

**Acceptance criteria:**

- Phone walkthrough covers Home, plan, Input, Think, Outline, Studio placeholder, Coach, Compare, Live Q, Desk and Reflect; one clear next action per stage.
- Four thinking fields start empty. No AI comparison/summary is reachable before submission, and comparison never overwrites the user's opinion.
- Outline uses four short fields, 6–8-word guidance and no paragraph-sized editor. Task policy hides outlines for baseline/casual/five-second-start tasks.
- Domain tests with a fake clock enforce completion unlocks, maximum two completed days/date, exactly two freezes and separate elapsed/completed counters. Merely opening the app earns nothing.
- Guard tests reject out-of-order deep links, early follow-up reveal, premature self-check feedback and a fourth attempt. C01/C02 policies are explicit.
- Exhausted attempts follow the recorded C22 decision, preserve the three-slot cap and never masquerade as a completed coaching loop.
- Dark Studio, no teleprompter or live coaching, and general-communication copy are visible in the prototype. Dependency matrix and lockfile are recorded.

## P1b — device recording and local replay

**Depends on:** P1a. **Artifact:** one phone-recorded take with local playback and a mock coach loop. **Runtime:** Expo Go for recorder feasibility; own build validation repeats in P2a.

**Acceptance criteria:**

- Front camera, microphone permission, 720p target, 3–2–1 countdown and target-duration ring work on the target phone; unsupported quality is disclosed.
- Topic/question/outline disappear when recording begins. Retake is unavailable for the first 30 sec on a normal take and first 20 sec on Live Q; short hard caps override locks as documented.
- Test 15 sec, 30 sec, 90 sec, 3 min and 10 min hard caps. Stop/cancel does not immediately offer a fresh uncounted attempt.
- Local replay has audible, synchronized speech; screen lock, call interruption and permission refusal yield understandable recovery states.
- Mock Take 1 → brief → Take 2 → hidden follow-up → self-check works without network or paid AI. No take is copied to the gallery.

## P2a — own Android build and audio-only media boundary

**Depends on:** P1b. **Artifact:** custom Expo development build with the Kotlin audio extractor and release-like privacy configuration. **Runtime:** custom native build mandatory.

**Acceptance criteria:**

- Build/install on the intended Android phone; capture module and new architecture compatibility recorded. Repeat the recorder smoke tests in this binary.
- Remux captured MP4 to an inspected artifact with one audio track and zero video tracks; duration differs by at most 250 ms or a documented codec-frame tolerance. Verify supported container/MIME with the selected endpoint using nonpersonal fixtures first.
- Silent/no-audio, corrupt, interrupted and unsupported-codec files fail safely. The original video is never accepted by the upload boundary, including deliberate MIME/filename spoof tests.
- Scratch audio is removed after success, failure, cancellation and process-death recovery; recorded video remains local and intact.
- Inspect final backup/permission configuration and test exclusions on supported device/OS. No personal files enter backup, gallery, logs, developer build inputs or OTA assets.
- Native fixture tests validate extraction independently of the app UI. Only after this increment can application AI integration use real speaking media.

## P2b — durable local repositories and recovery

**Depends on:** P2a (P1a domain contracts are fixtures). **Artifact:** SQLite persistence, private media manifest, safe local programme state and credential settings. **Runtime:** own build.

**Acceptance criteria:**

- Draft/submitted thinking, outline, takes, confidence and diary survive restart; credentials are in SecureStore only.
- Core table names, confidence checkpoint/linkage checks and follow-up attempt constraints follow [DATABASE_DESIGN.md](DATABASE_DESIGN.md), including missing ratings, multiple tasks and programme resets.
- Multiple tasks in one day and Live Q retain distinct IDs and at most three slots each. Deleting a video, back-navigation and process restart cannot reset consumed slots.
- Kill the process around reservation, record-start, file-finalize, DB commit and deletion; reconciliation produces either a valid saved take or an explicit recoverable failure, never a hidden fourth attempt or dangling success.
- Disk-space check runs before recording; full disk preserves existing work. Missing files show unavailable playback without deleting feedback.
- Migration and foreign-key tests preserve realistic seeded local records. Diary works in airplane mode and its dependency graph has no network/AI import.
- Key-test sends no personal context. Denied/missing/invalid key leaves all local features usable.

## P2c — Take 1 critique and bounded requests

**Depends on:** P2b and P0 frozen candidate. **Artifact:** first real audio-only coaching screen. **Runtime:** own build plus user-triggered configured AI.

**Acceptance criteria:**

- Nothing uploads when recording stops. Analyse creates a consent/configuration-snapshotted job, extracts verified audio and sends only the allowed fields.
- Request inspection proves no video/frame/thumbnail/diary/confidence/key-in-body leakage. Optional outline inclusion is explicit; Think/Writing have separate request contracts.
- Valid results show six scores, transcript, supported measured/estimated signals, at most three useful corrections, replacement phrase, one word, missed angle and matching brief. Visual metrics are visibly unavailable until P3.
- Hidden question is absent from Coach UI, accessibility tree, route parameters, notifications and logs.
- Invalid/truncated response, 401, 429, 5xx, offline, timeout, cancellation and duplicate taps use persistent states. Unknown provider outcomes do not trigger silent repeated billing; local result commit is idempotent.
- Model/prompt/rubric/schema versions and cost estimates persist. Existing P0 fixtures pass through the app adapter without changing their coaching contract.

## P2d — reshoot, surprise response and complete private day

**Depends on:** P2c. **Artifact:** functional end-to-end private MVP. **Runtime:** own build; local interaction cues and explicit AI calls.

**Acceptance criteria:**

- Every core task requires Take 2 even after a high Take 1 score; brief shows only original 0–3 fixes. No fabricated correction is needed to proceed.
- Delta references original correction IDs and supports fixed/partly/not-fixed/regression. No unrelated critique wall; score delta absent when not fully rescored; zero-correction rate is unavailable.
- Take 1's original question reveals only after Take 2 is durably saved and survives restart. Optional Take 3 occurs after Live Q; Take 4 remains impossible.
- Follow-up provides 10 sec thought and 45–60 sec response, no outline while speaking, self-check before the three-line verdict. Clarification, disagreement, interruption, counterexample and casual fixtures exercise their distinct policies.
- Long writing (~250 words) and three-sentence compression save locally. Feedback is explicitly requested; at most three edits; suggestions do not overwrite drafts automatically.
- Mood and before/after confidence remain self-reports. Reflect save/skip works without diary streak pressure. One core day completes in airplane-mode-tolerant fashion with pending AI preserved, then resumes successfully when the user requests it.
- A physical-device full-day walkthrough fits the accepted timing budget, including AI waits. Failure is a visible gate, not omitted from the reported duration.

## P3a — validated audio and camera-facing measurements

**Depends on:** P2d. **Artifact:** native measurement results with quality metadata. **Runtime:** new compatible native build with bundled detector/PCM processing.

**Acceptance criteria:**

- Compare a manually annotated fixture set including low light, glasses, rotated phone, off-center face, no face, noise, silence and a standing talk. Use the intended speaker as well as consented/synthetic fixtures; never upload frames.
- Proposed pilot targets: valid clean-clip camera-facing percentage within 10 percentage points of manual time labels; annotated silence boundaries within 200 ms; speech ratio within 10 percentage points. Report failures and set unavailable thresholds before enabling progress claims.
- No-face/dropout clips yield unavailable or low-coverage results rather than 0% camera-facing. Rotation/mirroring tests produce consistent orientation. Look-away event hysteresis avoids counting detector flicker.
- Metric definitions, versions, valid coverage and noise/cue exclusions are stored. No exact-gaze, body-language or inner-confidence claim appears.
- On the target phone, proposed processing budget is ≤30 sec for a 3-minute clip and ≤90 sec for a 10-minute clip, with cancellable UI and bounded memory. If it fails, revisit the measurement adapter and rerun capture/privacy gates before shipping.
- Face model works on first launch offline. PCM/frame buffers are not retained or sent. Model/library change triggers a new build.

## P3b — progress and milestone evidence

**Depends on:** P3a; seeded histories make it testable without waiting 30 real days. **Artifact:** trend views and local Day 1/Day 30 comparison.

**Acceptance criteria:**

- Week 1 baseline, task-specific WPM/speaking-ratio bands, fillers, six rubric trends, before/after confidence, correction rate and categorical Live-Q quality are represented accurately.
- Only comparable first takes contribute to first-take trends. Take 3 cannot replace baseline evidence. Different rubric/model/measurement versions are labeled or separated.
- Null values, zero-duration/zero-correction cases and absent videos show gaps/unavailable, not zero or fake improvement.
- Day 1 and Day 30 “Tell me about yourself” recordings use matched task/quality/analysis conditions where possible, with limitations labeled. Sequential A/B playback is sufficient; simultaneous audio is not required.
- Day 7, 14 and 21 views reflect filler/structure/confidence, independent structuring and interruption recovery respectively. Accessible summaries convey every chart without relying on color.

## P4a — complete curriculum, topic bank and finite input

**Depends on:** P2d and recorded C03/C04 decisions; can be verified with mocked content independently of P3 charts. **Artifact:** 30 versioned manifests, 300+ topics and resilient source repository.

**Acceptance criteria:**

- All 30 specified day purposes, structures, interactions and writing assignments exist. Complete seven-day blocks each contain four long-writing days; days 29–30 retain their stated modes.
- Task counts/durations for Days 11, 15, 20, 28–30 match the accepted workload resolution. Every day has the core practice loop or an explicit documented exception; no accidental task multiplication or universal three-minute cap.
- Curriculum domain/time audit supports approximately 70/15/15 general/professional/pressure emphasis. General communication remains the default prompt and topic framing.
- At least 300 distinct tagged topics, repeat-aware draw history and designated-day-only neutral thinking frame. Baseline/casual/random tests cannot reveal a framework accidentally.
- Exactly one default article OR video; optional Go deeper never blocks completion. RSS/Atom, malformed/oversized feed, missing captions, stale cache, paywall/dead source and offline evergreen fixtures all have finite outcomes.
- Source summaries and Think comparison are gated by user submission; source provenance is visible; no unsupported claim that a URL was read. One memory fact is stored and recall is available on Days 14, 21 and 29.

## P4b — vocabulary evidence and programme edge cases

**Depends on:** P4a, P2b–P2d. **Artifact:** vocabulary ledger and complete programme behavior.

**Acceptance criteria:**

- At most one offered word per day across all takes/tasks/AI retries. Understanding, writing, deliberate speech and later unprompted use have separate evidence.
- Landed requires prior understanding and writing plus a later natural spoken occurrence and confirmation; exact string occurrence or Take 2 immediately after a prompt does not suffice. Day 30's new word does not block programme completion.
- Two freezes, missed dates, two-day catch-up, midnight crossing, timezone change and backward clock fixtures preserve completion-based unlocks and no third completion/date.
- Diary skipping does not consume a freeze or break a completed-day streak. Delete-video and delete-day operations follow the documented independent completion ledger.
- Programme continues beyond 30 elapsed days without automatic media deletion; completion and elapsed counters remain distinct.

## P4c — storage management, export and full deletion controls

**Depends on:** P2b and realistic P4 data fixtures. **Artifact:** recoverable local data-management flow. **Runtime:** new native build if streaming exporter is first added here.

**Acceptance criteria:**

- Meter measures real media bytes and projects remaining storage from task manifests/observed bitrate. Record and export operations check headroom and fail without losing existing takes.
- Export-all produces a portable manifest, data and selected videos; no API credential, audio scratch file or debug log. User chooses destination and sees inclusion of diary/confidence/video before export.
- In-progress export omits unrevealed generated questions with a manifest note; it cannot bypass the surprise gate.
- Multi-gigabyte and >4 GB archives open in an independent reader and pass every manifest hash check. Export streams with bounded memory; denied/revoked destination, disk full and cancel leave recoverable state and clean partial outputs.
- Delete videos, delete one day and reset show concrete scopes, require deliberate destructive confirmation, cancel relevant jobs and complete journaled cleanup after process death. No deletion runs merely because Day 30 passed.
- Export never implies automatic cloud sync or automatic source deletion. Uninstall/data-loss implications and absence of v1 import are stated plainly.

## P5a — accessibility, reminder, diary lock and spend UI

**Depends on:** core private MVP and P4 controls. **Artifact:** final user-facing interaction system.

**Acceptance criteria:**

- Warm neutrals, recording accent, dark Studio, one primary action, large targets (at least 48 dp), readable enlarged text, screen-reader labels and non-color status distinctions verified on phone.
- One local reminder defaults to 18:00, edits replace the previous schedule, no duplicates after restart; permission denial and OS delays do not block practice. Test time change/reboot and explain best-effort delivery.
- Optional diary lock relocks on background and protects Home lesson previews and export. Biometric cancellation, unavailable sensor and lockout have usable recovery; no assertion of encrypted SQL from the UI gate.
- Privacy copy matches actual request paths and provider terms. No fixed retention promise or inferred confidence score. Spend UI shows estimates, configuration date and unknown-charge cases, with no invented balance.
- Key-test, quality choice, haptics, error copy and accessibility remain usable during low connectivity and interrupted sessions.

## P5b — release build, updates and final regression

**Depends on:** all applicable increments. **Artifact:** installable private Android release and evidence bundle; distribution itself is separate from this planning task.

**Acceptance criteria:**

- Production binary passes a complete normal day, an extended/multi-task day and Day 1/30 seeded comparison on the target phone; test at least one additional materially different Android environment before claiming broader device support.
- Release payload inspection and backup tests reconfirm video/diary exclusion, no embedded key/personal fixtures, no accidental analytics upload and correct export exception.
- Compatible JS/prompt/topic update succeeds; incompatible native-runtime update is rejected; prior working update can be restored. Migration/rollback test preserves programme data. Native changes install through a new binary.
- Prompt update reruns the accepted P0 regression cases; active tasks retain old prompt/policy snapshots. New measurement/model versions do not silently rewrite historical trends.
- Crash/retry, no-fourth-take, blank-first, hidden-question, diary isolation, full-disk, archive integrity and permission tests pass once against the final binary. No need to rerun unrelated suites without a relevant change or unresolved failure.
- Provider project/model/terms/rates are rechecked and recorded at release. Known device/timing/measurement limitations are included; no calendar delivery guarantee is invented.

## Feature traceability

| Spec module | First useful increment | Completion / release checks |
|---|---|---|
| M0 Daily input | P1a | P4a finite source/cache/fact/summary gates |
| M1 Programme engine | P1a, P2b | P4a/P4b curriculum, freezes, catch-up and time policies |
| M2 Think | P1a | P2b/P2c and P4a submitted comparison isolation |
| M3 Outline | P1a | P1b/P4a recording and task-policy exceptions |
| M4 Studio | P1b | P2a/P2b native privacy, attempt and recovery gates |
| M5 Coach | P0, P2c | P2d/P3a validated critique and measurement inputs |
| M6 Live Q | P1a mock, P2d real | P4a progression, P5b no-leak regression |
| M7 Writing desk | P2d | P4a writing schedule; explicit feedback and edit cap |
| M8 Vocabulary | P2c offer | P4b evidence and landed validation |
| M9 Diary/confidence | P2b/P2d | P5a lock, isolation and optional reflection |
| M10 Progress | P3b | P4b landed count, P5b comparable milestones |
| M11 Topic bank | P4a | 300+ tags, draw history and learning-frame restrictions |
| M12 Settings/data | P2b baseline | P4c export/delete/storage, P5a reminder/lock/cost, P5b updates |

Basic durability, storage prechecks and accurate privacy messaging are pulled forward from the original P4/P5 so the first usable MVP does not violate the final architecture. Charts and cosmetic refinement remain after the coach/reshoot/live-response engine. Plan by demonstrated gates; the spec's 1–2 working-week range is an unvalidated estimate, not a commitment for this expanded acceptance scope.
