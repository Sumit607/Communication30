**Build spec · revised running document**

# Take Two

A personal Android coach for a 30-day communication programme. It trains you to think quickly, structure ideas, speak clearly, respond under pressure, and build visible confidence through a repeated loop: **Think → Take 1 → three fixes → Take 2 → surprise follow-up → reflect.**

Version **1.6 · revised before build**

Prepared **6 Sep 2026**

Status **core product direction settled · coaching prompt must pass P0 validation before coding the full app**

Open product decisions **0**

---

## Contents

1. [01 · What we are building](#01--what-we-are-building)
2. [02 · The daily loop](#02--the-daily-loop)
3. [03 · Feature modules](#03--feature-modules)
4. [04 · Where data lives](#04--where-data-lives)
5. [05 · Daily input and thought formation](#05--daily-input-and-thought-formation)
6. [06 · The correction pipeline](#06--the-correction-pipeline)
7. [07 · The reshoot and live-response loop](#07--the-reshoot-and-live-response-loop)
8. [08 · Writing desk, vocabulary and diary](#08--writing-desk-vocabulary-and-diary)
9. [09 · The interface](#09--the-interface)
10. [10 · Data model](#10--data-model)
11. [11 · Tech stack](#11--tech-stack)
12. [12 · What it costs](#12--what-it-costs)
13. [13 · Making it cheap without weakening the coach](#13--making-it-cheap-without-weakening-the-coach)
14. [14 · Risk register](#14--risk-register)
15. [15 · Build plan](#15--build-plan)
16. [16 · The 30-day curriculum](#16--the-30-day-curriculum)
17. [17 · Decisions now locked](#17--decisions-now-locked)
18. [18 · Change log](#18--change-log)

---

# 01 · What we are building

One Android app, used by one person, for one 30-day communication programme.

Its purpose is not to make the user sound rehearsed, interview-trained or artificially sophisticated. Its purpose is to create a repeatable mental reflex:

> **Understand the question → form a position → organise the answer → speak → handle a challenge → recover cleanly.**

The app records speaking takes, gives constrained feedback, forces a second attempt, introduces one unprepared follow-up question, tracks objective delivery signals, trains written structure, and shows progress over the month.

## Product outcome by Day 30

Given an unfamiliar but reasonable topic, the user should be able to:

- think for roughly 10–15 seconds,
- identify a position or organising frame,
- speak for 2–3 minutes with a clear beginning, middle and close,
- explain a complex idea simply,
- respond when someone disagrees,
- ask for clarification without sounding lost,
- recover after interruption,
- answer one unexpected follow-up without collapsing into fillers,
- and look composed even when they feel some internal nervousness.

## Decisions already locked

| # | Question | v1.6 decision | Status |
|---|---|---|---|
| **L-01** | Platform | Android, built with **Expo / React Native**. | locked |
| **L-02** | Storage | Local-first. No account, login, cloud database or cross-device sync. | locked |
| **L-03** | AI media | **Release path is audio-only for personal speaking analysis. Video never leaves the phone.** No temporary full-video upload stage. | locked |
| **L-04** | Writing load | Long-form ~250-word writing on roughly **4 days per 7-day block**; short 3-sentence compression on the other days. | locked |
| **L-05** | Daily load | Normal day **40–50 min**. Weekly tests/simulations **60–75 min**. | locked |
| **L-06** | Language | English throughout for speaking, writing and feedback. | locked |
| **L-07** | Coaching scope | About **70% general communication**, **15% professional communication**, **15% interview/public-pressure practice**. | locked |
| **L-08** | Confidence | AI scores **Presence**. The user separately self-rates **Confidence** before and after speaking. | locked |
| **L-09** | Video retention | Keep all takes locally for the 30-day programme, with storage warnings and export. | locked |
| **L-10** | Reminder | One local reminder at **6:00 pm**, editable in Settings. | locked |
| **L-11** | Native updates | JavaScript/assets/prompts may use OTA updates. **Any native-code change requires a compatible new app build/install.** | locked |
| **L-12** | Build gate | The coaching prompt must be tested on real sample recordings before the full product is built. | locked |

## Deliberately not building

- No social feed, sharing, followers or leaderboard.
- No public profile.
- No teleprompter.
- No live coaching overlay while the user is speaking.
- No AI-generated opinion placed into the user's own answer box.
- No separate “confidence score” guessed by AI.
- No endless retakes.
- No reward for opening the app without doing the practice.
- No temporary architecture that violates the final privacy promise.

The product should reward **better first attempts over time**, not perfect tenth attempts.

---

# 02 · The daily loop

A normal day should feel compact enough to repeat for a month.

## Normal-day loop

| Approx. time | What the user does | Screen | What the app produces |
|---:|---|---|---|
| **0–8 min** | Read **one article OR watch one video** | **Input** | One finite piece of knowledge, matched to the day's topic |
| **8–13 min** | Fill four thinking boxes **without AI help** | **Think** | User-generated understanding and opinion |
| **13–15 min** | Build a 4-line outline | **Outline** | PREP / 3-point / STAR / both-sides / problem-solving skeleton |
| **15–19 min** | Record Take 1 | **Studio** | Local video + on-device measurements |
| **19–24 min** | Review AI correction | **Coach** | Maximum three priority fixes |
| **24–28 min** | Record Take 2 | **Studio → Compare** | Delta report against the three fixes |
| **28–31 min** | Answer one hidden follow-up | **Live Q** | 10 sec think + 45–60 sec spontaneous answer |
| **31–41 min** | Long writing or 3-sentence compression | **Desk** | Written-structure practice |
| **41–45 min** | Diary + confidence reflection | **Reflect** | Mood, lesson, confidence before/after |
| **45–50 min** | Buffer | — | Upload/network delay or short overrun |

## Test-day loop

Days 7, 14, 21, 29 and 30 are allowed to run **60–75 minutes**. They deliberately include longer speaking, more pressure, or before/after comparison.

## The 15–90–15 drill

From Day 8 onward, selected impromptu tasks use:

1. **15 seconds** to think,
2. **90 seconds** to speak,
3. **15 seconds** to self-judge one question: *“Was my answer structured?”*

The AI opinion is hidden until the user has answered that self-check.

## The no-restart rule

Retake stays disabled for the first 30 seconds of a normal take.

A false start is not a reason to erase the attempt. The skill being trained is recovery.

## The anti-overcoaching rule

The app never gives more than **three must-fix items** before a reshoot.

Those three should normally represent:

1. **one thinking/structure issue,**
2. **one language/flow issue,**
3. **one delivery issue.**

If one category has no meaningful problem, the coach does not invent one merely to fill the quota.

---

# 03 · Feature modules

## M0 · Daily input

- One article **or** one video, not both by default.
- Topic/domain matched to the day's task.
- Finite experience: no feed and no scrolling rabbit hole.
- Public-source summary can be generated after the user has read/watched.
- One fact worth remembering is stored for later recall.

## M1 · Programme engine

- 30 seeded day cards.
- Days unlock by **completion, not calendar date**.
- Two counters: **days elapsed** and **days completed**.
- Two streak freezes across the programme.
- Catch-up cap: at most one additional curriculum day in one calendar day.
- Test days marked clearly.

## M2 · Think

Four boxes appear blank:

1. **What happened / what is the idea?**
2. **Why did it happen / why does it matter?**
3. **What are the consequences, trade-offs or stakeholders?**
4. **What do I think?**

Only after the user submits their own version does **Compare with Coach** unlock.

The compare screen can show:

- what the user missed,
- what they overcomplicated,
- a cleaner causal chain,
- one counterargument,
- one fact worth retaining.

The AI never fills the user's “What do I think?” field.

## M3 · Outline

- Four short fields only.
- 6–8 words per line target.
- Supports PREP, 3-point, STAR, both-sides, problem-solving, news analysis, compression and long-form.
- No paragraph-sized boxes.

## M4 · Studio

- Front camera.
- 720p default; milestone-day quality may be higher locally.
- 3-2-1 countdown.
- Target-duration ring rather than a distracting large timer.
- No topic or outline visible once recording starts.
- Retake disabled for first 30 seconds.
- Maximum three takes per speaking task.

## M5 · Coach

The AI coach returns:

- six rubric scores,
- transcript,
- words per minute,
- filler count/rate,
- pause observations,
- three priority corrections maximum,
- one sharper replacement phrase,
- one vocabulary word,
- one missed angle,
- one hidden follow-up question,
- a three-line reshoot brief.

The hidden follow-up is generated from Take 1 but is not revealed until after Take 2.

## M6 · Live Q

This module trains interaction rather than monologue.

Modes include:

- **Follow-up** — “Why?” / “What evidence supports that?”
- **Disagreement** — “I don't agree. Why should I accept your view?”
- **Clarification** — deliberately ambiguous question; user must clarify before answering.
- **Interruption** — user is interrupted and must resume their original thread.
- **Counterexample** — AI presents an example that weakens the user's claim.
- **Casual conversation** — everyday opinion questions with no professional framing.

The goal is not to win an argument. The goal is to remain structured under interaction.

## M7 · Writing desk

Two modes:

### Long form

- ~250 words.
- Roughly four days per seven-day block.
- AI feedback on thesis, structure, clarity and repeated wording.

### Compression

Three sentences only:

1. **My position**
2. **My strongest reason**
3. **My conclusion / implication**

This mode transfers directly to spoken clarity and reduces programme fatigue.

## M8 · Vocabulary

Only **one new word or phrase per day**.

To count as “landed,” it should be used naturally in three contexts:

1. understood in the source,
2. used in writing,
3. used in speaking later without being prompted.

The aim is **30 usable words**, not 90 words displayed by an AI.

## M9 · Diary and confidence

Three short prompts:

- What did I do?
- What did I learn?
- What will I try tomorrow?

Plus:

- mood 1–5,
- **confidence before speaking 1–5,**
- **confidence after speaking 1–5.**

No AI scoring, no network path.

## M10 · Progress

Tracks:

- structure,
- clarity,
- word choice,
- pace & pausing,
- flow,
- presence,
- fillers per minute,
- words per minute,
- pause/speaking pattern,
- camera-facing percentage,
- confidence before vs after,
- Take 1 → Take 2 correction rate,
- follow-up-response quality,
- vocabulary landed count.

Day 1 vs Day 30 receives a dedicated comparison screen.

## M11 · Topic bank

300+ topics tagged by:

- personal,
- society,
- technology,
- business,
- economics,
- public policy,
- sustainability,
- psychology,
- sports,
- culture,
- current affairs,
- casual conversation.

“I know almost nothing about this” mode can show a neutral thinking frame:

> **Define → Stakeholders → Benefits → Risks → Trade-off → Tentative view**

That frame is shown only on designated learning days, not on every random draw.

## M12 · Settings and data

- AI key configuration.
- Test-key action.
- Reminder time.
- Recording quality.
- Storage meter.
- Export all data as ZIP.
- Delete one day / delete videos / reset programme.
- Optional biometric lock for diary.
- Privacy explanation written in plain language.

---

# 04 · Where data lives

The product is local-first, but AI correction requires a network request. The document should describe that boundary accurately rather than making promises outside the app's control.

| Data | Stored where | Leaves phone? |
|---|---|---|
| **Video takes** | App-private local storage | **No in the release architecture.** The speaking video is never uploaded. |
| **Extracted audio** | Temporary local file created for analysis, then deleted locally | **Yes, only when the user taps Analyse.** Sent to the configured AI API. |
| **On-device visual measurements** | Local database | Selected numeric measurements may be included in the AI request. |
| **Transcript & feedback** | Local SQLite after response | Response necessarily travels from the AI provider back to the device. |
| **Think boxes / outlines** | Local SQLite | Only sent if a specific coaching request needs them. Default: local. |
| **Writing** | Local SQLite | Sent only when the user requests writing feedback. |
| **Diary** | Local SQLite | **Never.** No network dependency in the diary repository. |
| **Confidence ratings** | Local SQLite | No need to send. |
| **API credential** | Android secure storage | Used only for authentication. |
| **Export** | User-selected destination | User choice. |

## Privacy wording

Use this wording in the product:

> **Your speaking videos stay on this phone. When you ask for feedback, the app sends the extracted audio and selected measurements to the configured AI provider. Provider-side processing, logging and retention follow that provider's current API terms and your project settings. Personal-content analysis should use a paid/privacy-appropriate tier that is not used for model improvement under its applicable terms.**

Do **not** claim:

- “nothing is ever left on a server,”
- “the provider deletes everything immediately,”
- or any fixed retention period unless it is verified against the exact provider/project configuration at build time.

## Public vs personal requests

A second unbilled/free project may be used later for **public article summarisation only** if it meaningfully saves money.

It is an optimisation, not an MVP requirement.

Personal material — voice, writing, private notes — stays on the privacy-appropriate paid path.

---

# 05 · Daily input and thought formation

The input module exists to create a pool of ideas. It must not become a substitute for thinking.

## One input, not two by default

A normal day presents exactly one of:

- one article,
- or one video.

Communication-craft days can prefer a communication video. Knowledge days can prefer a domain article/video.

The second format can be optional under **Go deeper**, never mandatory for completion.

## Source system

RSS/Atom is preferred where available because it is simple, cheap and cacheable.

Source groups can include:

- strategy & management,
- marketing,
- operations & supply chain,
- finance,
- India & business,
- economics,
- geopolitics,
- sustainability,
- communication craft.

The exact source list is data, not product logic. Dead feeds can therefore be replaced without changing the app architecture.

## Blank-first thinking

After consuming the source, the user gets four empty boxes:

### 1. What happened / what is the claim?

State it in plain language.

### 2. Why?

Identify cause, mechanism or reasoning.

### 3. So what?

Who is affected? What changes? What trade-off appears?

### 4. What do I think?

Take a position, even if tentative.

A 5-minute timer can be shown, but the user is allowed to submit early.

## Compare with Coach

Only after submission, AI shows a comparison such as:

| User thinking | Coach comparison |
|---|---|
| Main event identified | Correct / incomplete / distorted |
| Cause chain | Missing one important cause |
| Consequence | Strong / generic / missed stakeholder |
| Opinion | Not rewritten; challenged with one counterargument |

The point is to train **generation first, correction second**.

## Memory hook

Every input stores one compact line:

> **One fact worth remembering**

The app can resurface old facts on Days 14, 21 and 29 so information becomes retrievable rather than merely consumed.

---

# 06 · The correction pipeline

The correction pipeline is the product's core. It must be validated before the surrounding app earns more engineering time.

## Inputs to the coach

For one take, the AI receives:

- extracted audio,
- today's topic,
- expected structure,
- target duration,
- target score,
- on-device measurements,
- optionally the user's outline,
- no diary content.

## On-device measurements

The phone should measure what it can reliably measure rather than asking AI to guess.

Candidate measurements:

```json
{
  "duration_s": 182,
  "target_s": 180,
  "camera_facing_pct": 74,
  "look_away_events": 6,
  "head_stability": "moderate",
  "pauses_over_400ms": 8,
  "longest_pause_s": 1.1,
  "longest_unbroken_speech_s": 31,
  "speaking_ratio": 0.88
}
```

### Important terminology

The visual layer should be called **camera-facing / head-orientation measurement**, not “exact eye contact.”

Face landmarks and head pose are useful proxies, but the app should not claim precise gaze tracking unless a separate validated gaze model is added later.

## The six AI-scored dimensions

| Dimension | What a strong answer looks like |
|---|---|
| **Structure** | Listener can feel the answer's shape: position → support → close. |
| **Clarity** | Sentences land on first hearing. |
| **Word choice** | Specific, concrete and committed rather than inflated. |
| **Pace & pausing** | Silence is used deliberately, not only for breath. |
| **Flow** | Sentences finish; few fillers, false starts and abandoned thoughts. |
| **Presence** | Voice and camera-facing behaviour appear steady and deliberate. |

**Confidence is not in this table.** Confidence belongs to self-report.

## Objective metrics are target-zone metrics

Do not teach the user that every metric must rise or fall.

- Fillers per minute: generally lower is better, but context matters.
- WPM: show a **healthy/personal target band**, not “faster” or “slower” as the universal goal.
- Speaking ratio: show a **target band**, not a permanently falling line.
- Pauses: distinguish deliberate pauses from excessive silence.
- Camera-facing: trend upward only if it improves natural presence rather than creating a frozen stare.

Week 1 establishes baseline ranges. Later weeks compare the user primarily against their own baseline and task type.

## What the coach teaches each day

### A. Three priority corrections maximum

Normally:

1. thinking/structure,
2. language/flow,
3. delivery.

### B. Say this instead

One phrase the user actually said, with a sharper alternative.

### C. One word for today

One useful word/phrase drawn from the topic and placed inside the user's own argument.

### D. One angle you missed

One idea that would materially strengthen or complicate the answer.

### E. One hidden follow-up

Generated from Take 1 and stored, but hidden until Take 2 is complete.

## Example response contract

```json
{
  "overall": 6.5,
  "scores": {
    "structure": 7.0,
    "clarity": 6.5,
    "word_choice": 6.0,
    "pace_pausing": 5.5,
    "flow": 6.0,
    "presence": 6.0
  },
  "transcript": "...",
  "pace_wpm": 156,
  "fillers_per_minute": 4.8,
  "structure_used": "PREP",
  "strength": "Your position was clear in the first sentence.",
  "corrections": [
    {
      "category": "structure",
      "at": "00:42",
      "issue": "Your second reason became an example before the reason was stated.",
      "fix": "State the reason first, pause, then give the example."
    },
    {
      "category": "flow",
      "at": "01:04",
      "issue": "You used 'basically' four times while searching for the next sentence.",
      "fix": "Replace the filler with one silent beat."
    },
    {
      "category": "delivery",
      "at": "01:28",
      "issue": "Your voice dropped at the end of the recommendation.",
      "fix": "Finish the final sentence at the same volume as the opening."
    }
  ],
  "say_this_instead": {
    "you_said": "a lot of issues",
    "instead": "three execution risks"
  },
  "word_for_today": {
    "word": "trade-off",
    "use_it_here": "The central trade-off is speed versus control."
  },
  "angle_you_missed": {
    "angle": "Who bears the cost if the recommendation fails?",
    "one_line": "The downside is concentrated on smaller suppliers, not evenly shared."
  },
  "hidden_follow_up": "If manufacturing is the priority, what should India stop subsidising to fund it?",
  "reshoot_brief": [
    "Name your three reasons in the first 15 seconds.",
    "Replace filler with silence.",
    "Hold your volume through the final sentence."
  ],
  "verdict": "reshoot_required"
}
```

## Coach prompt principles

The prompt should explicitly say:

- coach **general spoken communication**, not recruitment performance,
- use the same rubric anchors every day,
- respect measured numbers but do not overclaim what they mean,
- return at most three corrections,
- every fix must be actionable,
- do not rewrite the user's personality,
- do not reward sophistication for its own sake,
- challenge weak thinking as well as weak delivery,
- generate one follow-up that tests the user's actual argument.

## P0 validation question

Before building the app around this coach, test several real recordings.

The coach passes only if the answer to both questions is usually **yes**:

1. **Did it identify something the speaker did not already notice?**
2. **Do the three fixes make the speaker genuinely want to record Take 2?**

If not, improve the prompt/model choice before building the rest.

---

# 07 · The reshoot and live-response loop

## Take 2

A reshoot is required when:

- overall score is below the day's target,
- a critical dimension falls below the agreed floor,
- or the coach marks one severe problem that makes the answer hard to follow.

Before Take 2 the user sees **only the three must-fix lines**.

The full feedback remains collapsed.

## Delta report

Take 2 is evaluated mainly against the three specific fixes from Take 1.

Each becomes:

- fixed,
- partly fixed,
- not fixed,
- newly broken.

The app should avoid producing an entirely fresh ten-point critique immediately after the user just acted on three corrections.

## Maximum three takes

No Take 4.

If Take 3 is still weak:

> **Log it and move on. Tomorrow's first take matters more than a fourth polish of today's answer.**

## Surprise follow-up

After Take 2, the hidden question generated from Take 1 appears.

Default format:

- **10 seconds think**
- **45–60 seconds answer**
- no outline,
- no teleprompter,
- no restart for the first 20 seconds.

The user self-rates first:

> **Did I answer the actual question? Yes / partly / no**

Then AI returns only:

- one-line structure verdict,
- one-line clarity verdict,
- one thing to improve next time.

No full second coaching report.

## Conversation-specific training

Selected curriculum days change the follow-up behaviour:

### Clarification mode

Question is intentionally ambiguous. The correct behaviour may be to ask a clarifying question before answering.

### Disagreement mode

AI pushes back on the user's position. User must acknowledge the opposing point, then respond.

### Interruption mode

The app plays a short interruption cue mid-answer. User must return to the unfinished thread.

### Casual mode

No framework is displayed. The goal is natural conversational clarity rather than formal mini-speech structure.

### Counterexample mode

AI supplies one example that weakens the user's claim. User must update, qualify or defend the view.

These modes prevent the programme from turning into thirty camera monologues.

---

# 08 · Writing desk, vocabulary and diary

## Why writing stays

Written structure transfers into spoken structure, but writing must not become the part that makes the user dread opening the app.

## Long-form writing

Roughly four days per seven-day block:

- target around 250 words,
- thesis in first 1–2 sentences,
- one organising structure,
- limited editing time,
- AI returns three edits maximum.

Suggested feedback contract:

```json
{
  "score": 7.0,
  "structure_used": "3-point",
  "opening_verdict": "Clear position, but the scope is too broad.",
  "rewritten_opening": "...",
  "three_edits": [
    {"from": "...", "to": "...", "why": "..."}
  ],
  "one_thing_for_tomorrow": "Put the causal claim before the example."
}
```

## Compression days

Three sentences only:

1. **Position**
2. **Reason**
3. **Conclusion / implication**

Optional second pass: compress the same idea into **25 words**.

## Vocabulary

One word or phrase per day.

States:

- **offered** — coach suggested it,
- **used in writing** — deliberate first attempt,
- **used in speaking** — deliberate spoken attempt,
- **landed** — later appears naturally without being shown first.

The Progress screen celebrates **landed**, not merely offered.

## Diary

Three short prompts:

- What did I do?
- What did I learn?
- What will I try tomorrow?

Plus mood and confidence ratings.

The diary has:

- no AI,
- no score,
- no streak pressure,
- no network code path.

It is the one screen in the programme where the user is allowed to observe rather than perform.

---

# 09 · The interface

The visual direction from v1.5 remains strong: warm neutrals, one recording accent, large touch targets, one primary action per screen, and a home page where the programme itself is the navigation.

## Governing idea

The user is supposed to spend the hour **speaking and thinking**, not browsing the app.

Every screen should answer one question:

> **What do I do next?**

## Home

Order:

1. hero frame from last completed take,
2. day number and completion progress,
3. streak grid + elapsed vs completed,
4. yesterday's one-line lesson,
5. today's card,
6. today's blocks,
7. 30-day plan.

## Today's blocks

Suggested labels:

1. **Input**
2. **Think**
3. **Outline**
4. **Take 1**
5. **Coach**
6. **Take 2**
7. **Live Q**
8. **Desk**
9. **Reflect**

Not every day needs every block. Test days can swap in longer simulations.

## Colour meaning

- Crimson/red: recording, primary action, or problem requiring action.
- Green: confirmed improvement/completion.
- Amber: partly fixed / caution.
- Neutral: information.

The Studio remains dark regardless of system theme so the recording screen does not become a bright distraction or harsh face light.

## Score presentation

Avoid ranking every metric as “higher is better.”

For WPM, speaking ratio and pausing:

- show a **target band**, not just a line,
- label the task type,
- show the user's personal baseline.

For confidence:

- show **before → after**,
- do not compare the self-rating numerically to AI Presence as if they measure the same thing.

## Coach screen hierarchy

1. Overall score
2. Six score bars
3. Measured signals
4. Three fixes
5. Reshoot brief
6. “Say this instead”
7. One word
8. One missed angle

The hidden follow-up is not visible here.

## Compare screen

Show:

- Take 1 vs Take 2 score delta,
- three fixes with fixed / partly / not fixed,
- side-by-side playback if useful,
- no new wall of feedback.

## Live Q screen

Minimal:

- one question,
- 10-second countdown,
- record state,
- no previous outline.

## Progress

Lead with trends and milestones, not single-day scores.

Headline cards:

- first-take average,
- Take 1 → Take 2 correction rate,
- fillers/min trend,
- structure trend,
- confidence-before trend,
- follow-up answer trend,
- words landed,
- Day 1 vs Day 30.

---

# 10 · Data model

Suggested local SQLite tables:

| Table | Key columns |
|---|---|
| **days** | `id`, `day_no`, `brief`, `structure_expected`, `interaction_mode`, `writing_mode`, `target_overall`, `started_at`, `completed_at` |
| **inputs** | `id`, `day_id`, `kind`, `source_id`, `title`, `url`, `shown_at`, `completed_at`, `public_ai_json` |
| **thinking** | `id`, `day_id`, `what`, `why`, `so_what`, `my_view`, `coach_compare_json` |
| **outlines** | `id`, `day_id`, `structure`, `line1`, `line2`, `line3`, `line4` |
| **takes** | `id`, `day_id`, `take_no`, `file_path`, `duration_s`, `bytes`, `recorded_at`, `analysis_state` |
| **measurements** | `id`, `take_id`, `camera_facing_pct`, `look_aways`, `head_stability`, `pauses_json`, `speaking_ratio` |
| **feedback** | `id`, `take_id`, `overall`, six score columns, `pace_wpm`, `fillers_per_min`, `transcript`, `raw_json`, `verdict` |
| **corrections** | `id`, `feedback_id`, `category`, `at_timecode`, `issue`, `fix`, `resolved_in_take` |
| **followups** | `id`, `day_id`, `source_take_id`, `mode`, `question`, `response_take_id`, `self_answered`, `ai_verdict_json` |
| **writing** | `id`, `day_id`, `mode`, `topic`, `body`, `word_count`, `feedback_json` |
| **vocab** | `id`, `word`, `meaning`, `example_sentence`, `offered_day`, `writing_day`, `speaking_day`, `landed_day` |
| **diary** | `id`, `day_id`, `did`, `learned`, `tomorrow`, `mood` |
| **confidence** | `id`, `day_id`, `before_take1`, `after_take2`, `after_live_q` |
| **sources** | `id`, `kind`, `domain`, `name`, `feed_url`, `enabled` |
| **topics** | `id`, `text`, `domain`, `difficulty`, `interaction_fit`, `last_drawn_at` |
| **settings** | reminder time, recording quality, model config, privacy acknowledgement, diary lock, storage meter |

The API credential is not stored in SQLite.

---

# 11 · Tech stack

## Framework

**Expo / React Native + Expo Router**

Why:

- fast UI iteration,
- Android-first is straightforward,
- Expo Go can validate much of the interface,
- EAS development/release builds support native modules when required.

## Camera

Stage 1 UI/prototype can use `expo-camera`.

The production measurement layer can use a compatible frame-processing camera package such as `react-native-vision-camera` in a development/release build.

## Camera-facing measurement

Use an on-device face/head-pose detector.

The metric is:

- head orientation,
- camera-facing proxy,
- look-away event proxy,
- head stability.

Do **not** label it exact eye contact unless validated gaze tracking is added separately.

## Audio extraction

Use Android media APIs or another maintained native approach to extract/copy the audio track from the local MP4 without uploading video.

This feature is on the critical path to the **first AI-enabled build** because v1.6 refuses to use temporary full-video uploads.

## Database

- `expo-sqlite`
- typed query layer optional

## Secure credential storage

- `expo-secure-store` / Android Keystore-backed storage as supported by the build.

## Files

- app-private file storage,
- explicit export flow.

## Feeds

- RSS/Atom parser.

## Charts

Use a React Native chart library that works in the selected runtime/build.

## Reminders

- local notifications only,
- no push server.

## Updates

### OTA-safe

- prompts,
- topics,
- text copy,
- JavaScript/TypeScript logic compatible with the existing native runtime,
- bundled data/assets.

### Requires a new native build/install

- adding/changing native modules,
- new camera frame processors,
- new Android media modules,
- native permission/runtime changes,
- anything that changes the native runtime contract.

The build plan must never promise that native ML Kit/audio-remux functionality can appear through OTA alone.

---

# 12 · What it costs

The exact Gemini/model pricing in v1.5 should **not** be treated as permanent product logic.

Model IDs, token rates, free-tier conditions, account credits and retention terms can change.

Therefore v1.6 uses a configurable cost model.

## What creates cost

1. Take 1 audio critique
2. Take 2 delta critique
3. Live-Q short verdict
4. Writing feedback on long-form days
5. Public article summary/comparison, if AI is used

## What should remain free/on-device

- video recording,
- local storage,
- camera-facing/head-pose measurements,
- pause envelope calculations,
- streaks,
- timers,
- confidence ratings,
- diary,
- topic bank,
- charts,
- exports.

## Billing policy

Before the first paid build:

- verify the exact model's current price,
- verify paid-tier data-use terms,
- verify account/project credits separately,
- verify whether a minimum prepay applies,
- verify provider logging/retention configuration,
- do not assume a consumer AI subscription automatically pays for external API traffic.

## Spending guardrails

The app should store configurable estimates for:

- cost per minute of analysis,
- average output size,
- projected daily cost,
- projected remaining programme cost.

If possible, display:

> **Estimated programme spend remaining**

rather than pretending the app knows the provider balance unless an official balance endpoint exists and is used.

---

# 13 · Making it cheap without weakening the coach

The rule remains:

> **Take the free option when it costs nothing important. Pay where quality, privacy or same-session learning would otherwise be lost.**

## Tier A · keep

### Audio-only personal analysis

Largest privacy and bandwidth win. Video stays local.

### Short, hard-capped takes

Duration is part of the skill. A 2-minute brief should not become a 6-minute monologue.

### Fixed JSON response schema

Avoid paying for verbose generic coaching prose.

### Smaller/cheaper text model where appropriate

Public article summaries and simple writing checks do not require the same model as nuanced speech coaching, provided quality testing supports the route.

### One vocabulary word, not three

Cheaper output and better learning.

### One missed angle, not two

Enough to expand thinking without overloading the reshoot.

### Short Live-Q verdict

Live Q does not need another full critique.

### Public-content free key only as optional optimisation

If current terms make this worthwhile, public article summarisation may use a separate free/unbilled project.

Do not make this two-project setup a blocker for MVP.

## Do not cut first

- Take 1 critique,
- three-fix reshoot brief,
- same-session Take 2,
- hidden live follow-up,
- Day 1 / 7 / 14 / 21 / 30 milestone analysis.

These are the learning engine.

## First things to cut if cost becomes a problem

1. AI feedback on compression writing
2. AI summary of public content
3. full Take 2 rescore — keep only delta evaluation
4. non-milestone decorative analyses

Do **not** move the main daily reshoot to the next morning merely to obtain cheaper batch pricing. Same-session correction is central to the product.

---

# 14 · Risk register

| Risk | Why it matters | v1.6 response |
|---|---|---|
| **AI over-structures the user** | User becomes dependent on model-generated thinking | Blank-first four boxes; AI comparison only after submission |
| **Programme becomes interview coaching** | Goal is broader communication | 70/15/15 curriculum split; explicit general-speaking prompt |
| **Monologue skill does not transfer to conversation** | Real communication is interactive | Daily hidden follow-up + dedicated clarification/disagreement/interruption days |
| **Confidence is confused with appearance** | User can look calm while feeling nervous | AI Presence + separate self-rated confidence |
| **Writing causes burnout** | Daily 250-word essay makes app feel like homework | Long writing ~4/7 days; 3-sentence compression otherwise |
| **Vocabulary becomes artificial** | User starts forcing advanced words | One word/day; “landed” only when naturally reused |
| **Metric gaming** | User tries to lower speaking ratio or WPM mechanically | Target bands + task-specific/personal baselines |
| **Camera-facing proxy is sold as eye contact** | False precision damages trust | Rename and describe as proxy only |
| **Provider retention/privacy changes** | App cannot control external provider policy | Accurate wording; verify current terms at build/release |
| **Temporary full-video upload breaks privacy promise** | First usable version violates final product principle | Removed entirely from v1.6 |
| **Native features assumed OTA-updatable** | Build plan becomes technically misleading | Native change = new compatible build/install |
| **Coach gives confidently wrong feedback** | User may practise bad advice | Stable rubric; trends > single scores; P0 validation; self-judgement before AI on live drills |
| **Day 9–12 motivation collapse** | Habit programmes commonly lose momentum | Shorter normal days, freezes, completion-based unlock, visible progress |
| **Storage fills** | All video is retained | Storage meter, pre-record free-space check, export/delete controls |
| **API key exposure** | Could create cost/privacy risk | Secure storage + provider-side quota/budget controls where available |
| **Feed dies/paywalls** | Daily input can break | Multiple sources + cache + evergreen fallback |
| **Scope explosion** | App becomes a generic learning platform | No social, no cloud accounts, no multi-user, one 30-day programme first |

---

# 15 · Build plan

v1.6 rejects the “complete polished app tomorrow” promise.

A prototype can be fast. A robust camera + native media + AI + local database app needs staged validation.

## P0 · Coach validation — before full coding

**Goal:** prove the correction quality.

Test 3–5 recordings across:

- prepared topic,
- unfamiliar topic,
- fast/filler-heavy answer,
- good answer with weak content,
- good content with weak delivery.

Pass criteria:

- feedback is specific,
- no more than three fixes are useful,
- fixes are actionable,
- missed angle is genuinely valuable often enough,
- hidden follow-up tests the actual argument,
- reshooting feels worthwhile.

If P0 fails, tune prompt/model before building the product around it.

## P1 · UX prototype

**Goal:** prove the daily flow on the phone.

Build:

- Home,
- 30-day plan,
- Input,
- Think,
- Outline,
- Studio recording,
- mock Coach screen,
- mock Compare,
- Live Q,
- Desk,
- Reflect.

No paid AI dependency required to validate navigation and daily workload.

## P2 · Functional private MVP

**Goal:** first real end-to-end day with the final privacy architecture.

Build:

- local SQLite,
- local video storage,
- audio extraction native module,
- secure API credential storage,
- Take 1 audio analysis,
- structured feedback JSON,
- Take 2 delta analysis,
- hidden follow-up generation,
- long/short writing modes,
- diary/confidence storage.

**Important:** this stage requires a development/release build because native media code is involved. It is not an Expo Go-only final path.

## P3 · Measurement layer

Build:

- camera-facing/head-pose proxy,
- pause measurement,
- speaking-ratio calculation,
- progress trends,
- target bands,
- Day 1 vs Day 30 comparison.

This may require another compatible native build if the frame-processing stack changes.

## P4 · Content and resilience

Build:

- RSS input engine,
- source fallback/cache,
- topic bank,
- all 30 seeded day cards,
- offline-safe programme state,
- pending-analysis states,
- storage warnings,
- export/reset.

## P5 · Polish

Build:

- haptics,
- final colour/type system,
- dark Studio,
- accessibility checks,
- error copy,
- reminder,
- privacy copy,
- spend estimate,
- prompt/topic OTA configuration where runtime-compatible.

## Realistic planning assumption

A focused first usable MVP may be achievable in several working days; a stable, polished build should be planned as roughly **1–2 working weeks**, depending on Android device issues, native module integration, AI response reliability and iteration speed.

The number is a planning range, not a promise.

## Build-order principle

Do not spend time polishing charts before the coach has passed P0.

The order of importance is:

> **Coach quality → reshoot loop → live response → reliability → progress visualisation → polish.**

---

# 16 · The 30-day curriculum

The curriculum is designed to broaden communication, not optimise only for interviews.

Approximate mix:

- **21 days general communication / thinking**
- **4–5 days professional communication**
- **4–5 days interview/public-pressure communication**

Long writing appears roughly four times in each seven-day block. Other days use compression.

| Day | Speaking task | Structure / interaction | Writing | Primary mode |
|---:|---|---|---|---|
| **01** | Baseline: **Tell me about yourself**, 3 min, unprepared | none | **Long:** Who am I? | general/personal |
| **02** | College/MBA experience; track fillers | free | **Compression** | general/personal |
| **03** | Is social media good or bad? | PREP + follow-up | **Long:** Better informed or just louder? | general/society |
| **04** | Explain AI to a 12-year-old | simple explanation + “why?” | **Compression** | general/technology |
| **05** | What makes a good leader? Exactly three reasons | 3-point + counterexample | **Long:** The best leader I have seen up close | general/leadership |
| **06** | Tell a failure story without overexplaining | STAR + clarification | **Compression** | general/storytelling |
| **07** | **Week 1 test:** random topic, 5 min | any + surprise challenge | **Long:** What changed this week? | general/test |
| **08** | Should India focus more on manufacturing? | PREP + counterargument | **Long:** Manufacturing vs services | professional/current affairs |
| **09** | Explain sustainability, supply chain or inflation simply | 3-point + child-style follow-up | **Compression** | general/explanation |
| **10** | Work from home vs office | both-sides + disagreement | **Long:** Strongest case against my position | professional/workplace |
| **11** | Five ambiguous questions | **clarification mode** — ask before answering when needed | **Compression** | general/conversation |
| **12** | Explain one project to a non-expert | STAR/problem-solving + follow-up | **Long:** One project properly told | professional |
| **13** | Casual conversation: movies, travel, friendship, habits | no formal framework | **Compression** | general/casual |
| **14** | **Week 2 test:** Where do I see myself in 10 years? | 3-point + challenge | **Long:** Ten years out and the first step | pressure/personal |
| **15** | Ten random topics: 15–90–15 | impromptu | **Long:** Random topic | general/impromptu |
| **16** | One news story: what → why → impact → view | news frame + “what would change your mind?” | **Compression** | general/current affairs |
| **17** | Choose a company problem and recommend a response | problem-solving | **Long:** One decision that changed a company | professional/strategy |
| **18** | Convince a friend to support an idea | persuasion + objection | **Compression** | general/persuasion |
| **19** | Growth vs environment — argue both sides | both-sides + counterexample | **Long:** Steelman the side I disagree with | general/debate |
| **20** | One issue in 60 sec, 30 sec, 15 sec | compression | **Compression:** 3 sentences + 25 words | general/clarity |
| **21** | **Week 3 test:** 7-min monologue with one interruption | **interruption mode** | **Long:** Where I still lose the listener | general/test |
| **22** | Standing delivery: hands, shoulders, voice, camera-facing | presence + follow-up | **Long:** What confidence looks like from outside | general/delivery |
| **23** | Difficult personal question: “Why you?” / “biggest weakness?” | PREP + challenge | **Compression** | interview/pressure |
| **24** | Address 100 people about a problem and solution | public speaking + hostile question | **Long:** Memo to 100 people | public/leadership |
| **25** | Three things I would change in my city | 3-point + stakeholder objection | **Compression** | general/public policy |
| **26** | Speak while the other side strongly disagrees | **disagreement mode** | **Long:** Strongest case against something I believe | general/negotiation |
| **27** | Random headline; start within 5 seconds | 5-second start + follow-up | **Compression** | general/impromptu |
| **28** | 10-minute structured talk | long-form + one challenge | **Long:** One topic, four sections, one argument | general/long-form |
| **29** | **Simulation:** conversation + professional problem + interview pressure | mixed interaction | **Compression:** What broke under pressure? | mixed/test |
| **30** | **Final:** repeat Day 1 + 5-min random topic + live follow-up | none → any | **Long:** Rewrite Day 1 and compare | final |

## Daily follow-up progression

The hidden Live Q becomes harder through the month:

- Days 1–7: simple “why / example?”
- Days 8–14: counterargument / clarification
- Days 15–21: counterexample / interruption / assumption challenge
- Days 22–30: disagreement / stakeholder objection / “what would change your mind?”

## Milestone comparisons

### Day 7

Compare filler rate, structure and self-confidence against Day 1.

### Day 14

Check whether the user can create a structure before speaking without opening the framework guide.

### Day 21

Check recovery: interruption, disagreement and unfinished thought.

### Day 30

Compare:

- Day 1 vs Day 30 “Tell me about yourself,”
- first-take score,
- fillers/min,
- structure score,
- camera-facing proxy,
- confidence before/after,
- live-follow-up quality,
- words landed.

The final success metric is not “perfect English.”

It is:

> **Can I receive an unexpected question, organise a useful answer, deliver it clearly, and stay composed when challenged?**

---

# 17 · Decisions now locked

## D-01 · Name

Proceed as **Take Two** unless deliberately renamed later.

## D-02 · Core loop

**Take 1 → three fixes → Take 2 → surprise follow-up** is the non-negotiable product engine.

## D-03 · Thought formation

Four boxes begin blank. AI comparison comes second.

## D-04 · Coaching scope

General spoken communication first; professional and interview pressure are minority use cases.

## D-05 · Confidence

Self-rated before/after. AI does not infer inner confidence.

## D-06 · Writing

Long-form roughly 4/7 days; compression on the rest.

## D-07 · Vocabulary

One useful word/phrase per day.

## D-08 · Privacy

Video local only in the AI-enabled architecture. Personal audio goes to the configured privacy-appropriate paid API path. Provider retention claims are never overstated.

## D-09 · Measurements

Camera-facing/head-orientation proxy, not “exact eye contact.” WPM and speaking ratio use target bands.

## D-10 · Native updates

Native feature changes require compatible new builds; OTA is for compatible JS/assets/content only.

## D-11 · Daily duration

40–50 minutes normal, 60–75 minutes on test days.

## D-12 · Build gate

P0 coach validation happens before serious implementation.

---

# 18 · Change log

| Version | Date | Change |
|---|---|---|
| **1.6** | **6 Sep 2026** | Rebuilt the product around active thought generation and spontaneous interaction. Prep boxes are now blank-first; AI compares only after the user thinks. Normal load reduced to 40–50 minutes, test days 60–75. Long writing reduced to ~4/7 days with 3-sentence compression on others. Vocabulary reduced from three words/day to one usable word/day. Added self-rated confidence before/after while keeping AI Presence separate. Added a hidden follow-up generated from Take 1 and delivered after Take 2, plus disagreement, clarification, interruption, counterexample and casual-conversation modes. Progress metrics now use target bands rather than assuming WPM/speaking ratio should always rise/fall. “Eye contact” renamed to camera-facing/head-orientation proxy. Privacy language no longer claims immediate server deletion; release architecture forbids temporary full-video uploads. Tech plan corrected so native module changes require a new compatible build rather than OTA. Replaced the one-day-complete-app promise with P0 coach validation, UX prototype, private MVP, measurement, resilience and polish phases. Curriculum rebalanced to ~70% general communication, 15% professional, 15% interview/public-pressure practice. |
| **1.5** | 5 Sep 2026 | Previous ready-to-build specification: audio-only analysis, six-score rubric, vocabulary ledger, RSS input, local-first architecture and one-day build proposal. |

---

## Final build principle

If a feature does not help the user do at least one of these five things, it should probably not be in v1:

1. **form a thought,**
2. **structure it,**
3. **say it clearly,**
4. **respond when challenged,**
5. **see evidence of improvement.**

Everything else is secondary.
