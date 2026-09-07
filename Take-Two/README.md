# Take Two

Android communication practice: **Think → Take 1 → up to three corrections → Take 2 → surprise follow-up → reflect.**

Status: **Interactive UI prototype for browser and Expo Go review. Full Android app implementation is paused until the user approves the design.** The engineering foundation is preserved; coaching validation has not run.

The original v1.6 specification has been copied without changes to [docs/TAKE_TWO_SPEC_v1.6.md](docs/TAKE_TWO_SPEC_v1.6.md). All 18 sections were reviewed. The specification is the product source of truth; the review documents identify proposed resolutions rather than silently changing it. The user's subsequent request authorized the initial project and package setup. It did not mark P0 passed or authorize personal recording uploads or paid AI requests.

## Review the prototype

From this directory:

```sh
npx expo start --go --lan --port 8090
```

Open the printed web address in a browser or scan the QR in compatible Expo Go on Android, using the same Wi-Fi as this computer. The `preview.ts` entry loads an isolated visual prototype with temporary interactions. It does not open SQLite, request camera/microphone access, use an API key or send AI requests. See [phone access and review steps](docs/PROTOTYPE_REVIEW.md) and [current build status](docs/BUILD_STATUS.md). The production routes and unfinished services remain separate and inactive.

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npx expo install --check
npx expo-doctor
```

Use `npx expo install <packages>` without manually specifying package versions. Keep `package-lock.json`; use `npm ci` to reproduce the resolved installation. The official template and Expo installer select the SDK-compatible versions. Ordinary npm resolution applies to libraries outside Expo's compatibility map. See [AGENTS.md](AGENTS.md) for the saved setup rules.

See the [current foundation report](docs/FOUNDATION_REPORT.md) for environment, installed tools, verification, limitations and next steps. [SETUP.md](docs/SETUP.md) retains the earlier scaffold history.

## Planning documents

Read these documents in order:

1. [Specification review, contradictions and risks](docs/SPEC_REVIEW.md)
2. [Proposed final architecture and native requirements](docs/ARCHITECTURE.md)
3. [Phase 0 validation plan and scorecard](docs/PHASE_0_PLAN.md)
4. [Implementation phases and acceptance criteria](docs/IMPLEMENTATION_PHASES.md)
5. [Database tables and Day 1 → Day 30 evidence](docs/DATABASE_DESIGN.md)
6. [Design review workflow and GitHub checkpoints](docs/DESIGN_WORKFLOW.md)

```text
Take-Two/
├── docs/
│   ├── TAKE_TWO_SPEC_v1.6.md
│   ├── SPEC_REVIEW.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── PHASE_0_PLAN.md
│   ├── IMPLEMENTATION_PHASES.md
│   ├── FOUNDATION_REPORT.md
│   └── SETUP.md
├── src/
│   ├── app/                         # Routes/layouts only
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── day/[dayId]/
│   │   │   ├── index.tsx
│   │   │   ├── prep.tsx
│   │   │   ├── outline.tsx
│   │   │   ├── studio.tsx
│   │   │   ├── coach.tsx
│   │   │   ├── compare.tsx
│   │   │   ├── follow-up.tsx
│   │   │   ├── desk.tsx
│   │   │   └── diary.tsx
│   │   ├── progress.tsx
│   │   ├── words.tsx
│   │   └── settings.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── cards/
│   │   ├── scores/
│   │   └── recording/
│   ├── features/
│   │   ├── programme/
│   │   ├── prep/
│   │   ├── studio/
│   │   ├── coach/
│   │   ├── followup/
│   │   ├── writing/
│   │   ├── diary/
│   │   ├── vocabulary/
│   │   ├── progress/
│   │   └── settings/
│   ├── db/
│   │   ├── client.ts
│   │   ├── schema.ts
│   │   ├── schema/                 # Small domain schema modules
│   │   ├── initialize.ts
│   │   ├── database-provider.tsx
│   │   ├── seed.ts
│   │   └── repositories/
│   ├── services/
│   │   ├── gemini/
│   │   │   ├── client.ts
│   │   │   ├── coachPrompt.ts
│   │   │   ├── coachSchema.ts
│   │   │   ├── followupPrompt.ts
│   │   │   ├── essayPrompt.ts
│   │   │   ├── articlePrompt.ts
│   │   │   └── types.ts
│   │   ├── rss/
│   │   ├── recording/
│   │   ├── audio/
│   │   ├── storage/
│   │   ├── notifications/
│   │   └── export/
│   ├── store/
│   ├── hooks/
│   ├── constants/
│   ├── types/
│   └── utils/
├── drizzle/                         # Generated SQL, bundle imports and metadata
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── AGENTS.md
├── app.config.ts
├── drizzle.config.ts
├── babel.config.js
├── metro.config.js
├── eslint.config.js
├── jest.config.js
├── .prettierrc.json
├── .prettierignore
├── .env.example
├── .gitattributes
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

**Screens stay thin.** Every screen route under `src/app/` delegates to a feature screen through the `@/` alias, which resolves to `src/`. Studio's future camera/file operations belong in `src/services/recording/` and `src/services/storage/`. Root layout only composes the database provider and Router; database startup lives under `src/db/`.

**AI stays isolated.** `src/services/gemini/` owns Gemini transport, prompt builders, validation and provider-facing types. Its seven files are inactive module shells. Future feature use cases call an injected AI interface; screens never contain prompts or SDK calls. Coach wording can evolve in `coachPrompt.ts` without changing screens when the input/output contract stays stable. Prompt changes still require evaluation and version tracking; response-contract changes also require schema/type updates.

Feature screens and Gemini modules remain placeholders. `src/db/schema.ts` exports twenty tables from smaller domain files; the client and initializer handle Drizzle and migrations. The provider opens SQLite at app startup, enables WAL/foreign keys and blocks rendering if migration fails. It never resets data to recover. `seed.ts` remains inactive: no programme instance, completed day or fictional user record is created. Empty directories retain `.gitkeep` files. `features/settings/` keeps the Settings route thin.

`app.config.ts` is the single Expo config; Android identity `com.example.taketwo` is a placeholder to replace before EAS/release registration. `drizzle.config.ts` selects SQLite/Expo and root `drizzle/` output. Run `npm run db:generate -- --name descriptive_change` after schema edits and review generated SQL. Babel/Metro bundle SQL migrations. `.env.example` contains guidance only: Gemini credentials belong in runtime SecureStore, never bundled variables. The source specification is excluded from formatting. A future root `modules/` remains reserved for native Studio/Coach work.

Initial libraries: Expo Router, SQLite, SecureStore, FileSystem, Camera, KeepAwake, Haptics, Notifications, LocalAuthentication, Sharing, Zustand, Zod, fast-xml-parser, `@google/genai` and Drizzle ORM; Drizzle Kit belongs in development dependencies. Router's companion dependencies are also resolved through Expo. Installing a library does not mean its feature is implemented or tested on Android.

Deferred: VisionCamera, ML Kit face-detector wrappers, custom Android media extraction and `expo-dev-client`. The later native phase requires an Android development build; native dependency changes require a new compatible binary.

Principles: blank-first thinking; required Take 1 and Take 2; at most three corrections and three takes per speaking task; a hidden follow-up; video stays on the device except an explicit user export; only extracted audio is sent as personal speaking media; local-first storage; no teleprompter; general communication first. Writing and submitted thinking have separate, explicit text-feedback requests as described in the specification.

Next product milestone: execute Phase 0 using real samples and a verified provider project. A finished scaffold is not a passed coach-quality gate.
