# Engineering foundation report

Date: 6 September 2026. Scope: the user's attached **project setup and architecture only** request. The complete 1,461-line source specification was read before changes. No thirty-day product flow, Gemini prompt/workflow or native measurement feature was implemented. P0 remains unrun.

## Environment and dependency decisions

- Node **v24.18.0 LTS (Krypton)**, npm **11.16.0**, Git **2.54.0.windows.1** were already usable and reused. npm remains the only package manager and `package-lock.json` is preserved.
- Expo **57.0.20 / SDK 57**, React **19.2.3**, React Native **0.86.3** were retained. Official npm metadata for the current stable blank TypeScript template matched this installed set; SDK 58 was a canary, not selected. No package versions were manually specified. [Expo project setup](https://docs.expo.dev/get-started/create-a-project/)
- Foundation runtime libraries already installed: `expo-router`, `expo-camera`, `expo-sqlite`, `expo-secure-store`, `expo-file-system`, `expo-keep-awake`, `expo-haptics`, `expo-notifications`, `expo-local-authentication`, `expo-sharing`, `zustand`, `zod`, `fast-xml-parser`, `@google/genai`, `drizzle-orm`.
- Existing Router companions retained: `expo-constants`, `expo-linking`, `expo-status-bar`, `react-dom`, `react-native-safe-area-context`, `react-native-screens`, `react-native-reanimated`, `react-native-worklets`.
- Added runtime **`expo-asset`**, required by the installed SQLite provider. Its config plugin was added explicitly because the installer cannot rewrite dynamic `app.config.ts` automatically.
- Added development tooling: `eslint`, `eslint-config-expo`, `prettier`, `eslint-config-prettier`, `jest`, `jest-expo`, `@types/jest`, `@testing-library/react-native`, `babel-plugin-inline-import`, `babel-preset-expo`, `@types/node`. Existing TypeScript, React types and `drizzle-kit` remain development dependencies. Expo's testing and lint guidance informed configuration. [Expo testing](https://docs.expo.dev/develop/unit-testing/), [Expo lint/format](https://docs.expo.dev/guides/using-eslint/)
- `@google/genai` remains the sole Gemini SDK; no legacy SDK or API calls were introduced. [Google SDK guidance](https://ai.google.dev/gemini-api/docs/libraries)

The installed stable Drizzle/Expo migration approach imports generated SQL into JavaScript, so the conditional inline-import plugin is needed. Babel handles `.sql` strings, Metro recognizes the extension, and Drizzle's Expo migrator applies the generated bundle at startup. The current Drizzle page also advertises RC/next install commands; those prerelease packages were not adopted for this stable-SDK foundation. [Drizzle Expo migration guidance](https://orm.drizzle.team/docs/sqlite/connect-expo-sqlite)

Installation commands used in this foundation update:

```sh
npx expo install --dev eslint eslint-config-expo prettier eslint-config-prettier jest jest-expo @types/jest @testing-library/react-native babel-plugin-inline-import --npm
npx expo install --dev babel-preset-expo @types/node --npm
npx expo install expo-asset --npm
```

## Resulting structure

```text
Take-Two/
├── docs/                         # Immutable spec, architecture, review, phase plans, reports
├── src/
│   ├── app/                      # 13 thin placeholder routes and root composition
│   ├── components/{ui,cards,scores,recording}/
│   ├── features/{programme,prep,studio,coach,followup,writing,diary,vocabulary,progress,settings}/
│   ├── db/
│   │   ├── client.ts
│   │   ├── initialize.ts
│   │   ├── database-provider.tsx
│   │   ├── schema.ts
│   │   ├── schema/{columns,programme,content,speaking,writing,reflection}.ts
│   │   ├── seed.ts               # Inactive; no fictional progress
│   │   └── repositories/         # Reserved for feature phases
│   ├── services/{gemini,rss,recording,audio,storage,notifications,export}/
│   └── {store,hooks,constants,types,utils}/
├── drizzle/{0000_foundation.sql,migrations.js,meta/}
├── assets/{fonts,icons,images}/
├── tests/{unit,integration,fixtures}/
├── AGENTS.md
├── app.config.ts
├── drizzle.config.ts
├── babel.config.js
├── metro.config.js
├── eslint.config.js
├── jest.config.js
├── .prettierrc.json
├── .prettierignore
├── .gitattributes
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
├── package-lock.json
└── README.md
```

The seven Gemini modules remain inactive shells. Lint rules reject SDK/provider-module imports from screens and shared components. Future AI results require Zod plus semantic validation before state or SQLite; a typed JSON column is not validation. No credential input screen or runtime key retrieval is implemented yet; its design remains user input → SecureStore → runtime retrieval.

Android identity is the explicit placeholder `com.example.taketwo`, to replace before EAS/release registration. `allowBackup: false` is configured, but final native backup/transfer exclusion behavior still requires own-build verification. No EAS project, APK, Android Studio, backend, cloud database, authentication, Redux, UI framework or native optimisation stack was added.

## Database created

The initial migration creates these **14 requested tables**:

`days`, `takes`, `feedback`, `corrections`, `essays`, `essay_feedback`, `diary`, `sources`, `inputs`, `vocab`, `topics`, `settings`, `confidence_ratings`, `followup_attempts`.

It also creates **six supporting tables**: `programmes`, `task_instances`, `thinking`, `outlines`, `measurements`, `followups`. They distinguish programme resets, multiple exercises in one day, blank-first drafts and a hidden question that exists before a response. Every day-owned record has `day_id`; foreign keys and indexes support day queries. Global source/topic/settings records do not need a day.

`confidence_ratings` retains before Take 1, after Take 2 and after Live Q as separate nullable integer self-reports. `followup_attempts` refers to response takes and the hidden-question parent. Its score is nullable until a rubric is defined. Take slots and correction priorities are integers 1–3 with per-task/per-feedback uniqueness. Same-day/task composite foreign keys reject mismatched links.

SQLite initializes through the provider, enables WAL and foreign keys, awaits migrations, checks integrity, then renders the shell. Imports alone do not open a database. Errors block the shell and never auto-reset data. All application tables initially have **zero rows**. Static curriculum seeding was optional and remains deferred because special-day workload decisions are not settled. No day is marked complete.

This is a foundation schema, not the complete P2 persistence engine: workflow/reveal guards, coaching-role assignment after aborts, revision immutability, deletion journals, pending-analysis jobs, full vocabulary evidence and progress queries remain future modules. See [DATABASE_DESIGN.md](DATABASE_DESIGN.md).

## Verification evidence

| Command / inspection | Result |
|---|---|
| `npm run db:generate -- --name foundation` | Generated initial SQL and Expo migration imports for 20 application tables. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with zero warnings. |
| `npm run format:check` | Passed; source specification excluded from formatting. |
| `npm test -- --no-watchman` | **12 tests passed**, two suites. |
| `npx expo install --check` | Dependencies up to date. |
| `npx expo-doctor` | **21/21 passed**. |
| `npx expo start --localhost --port 8081` with `CI=1` | Metro started; HTTP 200 Android manifest reported SDK 57 and the Router bundle URL. Server stopped after checks. |
| `npx expo export --platform android --output-dir .expo/foundation-smoke --source-maps --clear` | Passed; **1,416 modules**, Android Hermes bundle. |
| Bundle/source-map inspection | All 14 route/layout files plus database provider, initializer and migration import included; SQL table/constraint strings present in the actual Hermes artifact. |
| Source SHA-256 | Unchanged: `448F2B6323E238D6A4571DEA3C9AF30CA015B370D86B463762295163A97E8F5E`. |
| Git inspection | Existing parent repository retained. Project files are untracked, so ordinary `git diff` is empty; source files and generated migration were inspected directly, including new-file diff/whitespace review. No staging, commit or history rewrite. |
| Credential/environment inspection | No recognized credential patterns or unexpected environment files found among Git-visible project files. `.env.example` contains guidance only; personal media and databases are ignored. |
| Physical Android | **Not run**: no accessible device/ADB connection; no Android Studio installed. |

Tests run the actual Drizzle Expo migrator and application initializer against real Node SQLite using a narrow test connection adapter. They cover empty initialization, migration idempotence and rollback, file persistence after reopening, invalid day links, three-slot/correction limits, blank thinking, confidence checks and follow-up provenance. Component tests render the minimal shell and storage-error view with native/navigation components mocked. These checks do **not** prove Android's native bridge, permissions, device storage or on-phone rendering.

The initial development-manifest check succeeded; a subsequent cross-command bundle fetch encountered connection refusal. The independent production Android export completed successfully. Do not count that failed fetch as a device or development-bundle execution test.

## Warnings and scope decisions

- npm reports **18 moderate affected-package findings**, no high/critical findings from the installation audit. The existing Expo/Router/Drizzle dependency chains remain an upstream follow-up; no forced audit downgrade was applied.
- Expo-compatible tooling currently brings deprecated ESLint 9 and transitive older Jest utilities. Keep the SDK-selected set until a supported update is available rather than overriding package versions manually.
- npm reports several unapproved lifecycle scripts. No blanket script approval was granted; the required tools and tests run successfully.
- Windows/OneDrive previously caused discovery issues for moved files; the final source map explicitly verifies every route/layout. Git attributes preserve the original spec bytes across checkout; generated source uses LF.
- Six supporting tables and domain schema files are the only database expansion beyond the requested core list. More elaborate recovery/progress entities from earlier architecture are deferred to avoid implementing the full product during setup.

The specification review retains 22 contradictions/omissions. The main unresolved ones are conditional versus mandatory Take 2; exactly three fixes versus not inventing issues; Day 15's ten drills and Day 28's long talk versus time budgets; and strict attempt caps after interrupted recordings. Live Q has a textual verdict but no defined numeric trend rubric. The schema supports these cases without pretending their feature policies are finished. [Full review](SPEC_REVIEW.md)

## Recommended next phase

Perform the minimal-shell check on the intended Android phone, then execute **Phase 0 coach validation** with verified audio-only samples and provider configuration. Settle the recorded curriculum/rubric issues before the P1 daily-flow prototype. This setup task stops here; no Phase 1 feature implementation has begun. [Phase 0 plan](PHASE_0_PLAN.md)
