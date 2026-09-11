# Take Two development instructions

The product specification is `docs/TAKE_TWO_SPEC_v1.6.md`. Read the architecture, review and phase plan for context. Current user instructions take precedence over earlier planning proposals.

## Dependency installation

- Use `npx expo install <packages>` for Expo packages and their React Native compatibility dependencies. Do not manually choose or edit package version numbers. Keep the generated npm lockfile.
- Use `npx expo install` for the requested application libraries too; Expo's compatibility mapping applies to recognized packages, while ordinary npm resolution applies to other libraries.
- Keep `drizzle-kit` in `devDependencies` with `npx expo install --dev drizzle-kit`.
- Use `@google/genai`; do not add `@google/generative-ai`.
- Zustand is for transient/session UI state. SQLite through Drizzle remains the durable local source of truth.
- Do not add VisionCamera, face-detector wrappers, custom Android media modules, or `expo-dev-client` during initial setup. Add the native stack only in the later authorized Studio/Coach phase, with a compatible new Android development build.

## Scope and product constraints

On 11 September 2026 the user explicitly requested embedding their Gemini key in a personal APK. For this profile only, inject the key from a secret EAS build variable on the remote Android builder; never place its value in tracked source, app config, logs, or a publicly distributed artifact. See `docs/PERSONAL_BUILD.md`. The public source retains a null credential stub and other build profiles remain user-entry-only. This is an explicit user-authorized exception to the earlier credential policy below.

On 8 September 2026 the user explicitly authorized building the mobile app with Gemini's free tier. This supersedes the prototype-only pause and the earlier paid-project requirement. Preserve the original specification unchanged; record deviations in docs. Build a standalone Android APK using the approved blue prototype as visual reference. Free-tier data-use disclosure must precede explicit audio/text requests; never enable billing or automatically fall back to a paid model. Credentials remain user-entered in SecureStore. P0 quality and physical-device checks remain unpassed until actual evidence exists. Preview simulations must never create actual programme progress.

Preserve blank-first thinking, Take 1 → at most three corrections → Take 2, a hidden follow-up, no teleprompter, a maximum of three takes per task, and general communication first. Video and diary stay local except explicit user export; speaking analysis sends extracted audio only, with the spec's allowed text/measurements. Do not add a temporary full-video upload path.

Keep credentials out of source, `.env` files intended for bundling, `EXPO_PUBLIC_*`, logs and exports. The future user-entered Gemini key belongs in SecureStore. Do not include personal evaluation media in this OneDrive-backed repository or external build/MCP artifacts.

## Setup verification

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm test`
- `npx expo install --check`
- `npx expo-doctor`
- Android Metro export smoke check when the scaffold or dependency graph changes; this is not an APK or a physical-device test.

## Design before major UI work

- Before implementing or substantially redesigning a major screen, use the available Product Design/Figma capabilities to examine the journey, layout, hierarchy and reusable components. Follow `docs/DESIGN_WORKFLOW.md`; a written plan alone is not visual validation.
- The v1.6 specification is the behavioral/product source of truth. An existing screen-specific Figma design is the visual source of truth. Record its file/frame/version and inspect it before coding; flag conflicts with product invariants instead of silently changing either source.
- Aim for premium, simple mobile UX: purposeful typography, spacing and restrained visual hierarchy. Avoid generic AI dashboard layouts, decorative metric grids and gratuitous cards. Keep one clear primary action per screen and design for one-handed Android use.
- Review the relevant screen states and visual target before substantial frontend implementation. Validate the result against the source at matching dimensions and states, including keyboard, system insets, accessibility and reachability. Do not claim an unrun phone check passed.
- Reuse shared components and design tokens. Explain a concrete need before installing a new UI library or framework; do not substitute a web prototype stack for this Expo Android app.
- At each stable phase, run its checks, review the diff and create a descriptive Git checkpoint, then push it to the configured GitHub repository on a `codex/` branch. Record the commit and verification evidence. Do not force-push, rewrite history, stage unrelated work or include secrets/personal media. If no remote is configured, obtain the destination before publishing; do not invent a repository or claim a local commit is a GitHub checkpoint.

## Source code boundaries

- `src/app/` contains Expo Router routes and layouts only. Route screens should normally re-export or render a feature screen, with only route configuration and parameter mapping where necessary.
- Screens must stay thin. Do not combine camera control, timers, file operations, SQL writes and Gemini requests in a route file.
- Keep all Gemini SDK usage, prompt builders, provider schemas and provider-specific types under `src/services/gemini/`. Screens and shared UI must not construct prompts or call the SDK. Feature use cases call an injected AI service interface.
- Use `client.ts` for transport, `coachPrompt.ts`, `followupPrompt.ts`, `essayPrompt.ts` and `articlePrompt.ts` for versioned prompt builders, `coachSchema.ts` for Coach validation, and `types.ts` for provider-facing contracts. Keep prompt builders independent of React, navigation, database and device APIs.
- Coach wording improvements that preserve the contract should require changes only to `coachPrompt.ts`, plus relevant evaluation fixtures/results. Contract changes must explicitly update schema/types and consumers where needed. Run the planned coaching regression evaluation before activating prompt changes; do not silently change active-task prompt versions.
- Put Studio state/orchestration under `src/features/studio/`, capture adapters under `src/services/recording/`, and file operations under `src/services/storage/`. Apply the same feature/service split elsewhere.
- Shared presentation belongs under `src/components/`; durable state/schema/repositories under `src/db/`; transient/session state under `src/store/`. A shared component must not depend on a feature's business logic.
- Use `@/` for imports from `src/`. Keep non-route helpers, fixtures and documentation outside `src/app/`.
- `app.config.ts` and `drizzle.config.ts` stay at the root. Define schemas in `src/db/schema.ts`; generate migrations into root `drizzle/`. Keep root `assets/` and `tests/` outside route discovery.
- The route screens remain structural placeholders until their phases are implemented. Root layout may compose the database provider. Schema/client imports must not open SQLite; the provider owns the connection and awaits migrations before rendering children. Do not seed fictional progress or mark curriculum days complete.
- Follow `docs/DATABASE_DESIGN.md` for core table names and evidence relationships. Preserve all three confidence checkpoints as local self-reports. Link follow-up attempts to response takes and their hidden-question parent; do not invent a numeric Live Q rubric or another retry allowance.
- All AI responses must pass the relevant Zod schema and semantic checks before entering application state or SQLite. A typed JSON column alone does not validate AI output. Diary content never enters AI requests.
- Prefer small independently testable modules. Do not add Redux, a UI framework, backend, accounts, cloud database, analytics or crash reporting to this local-first foundation. Do not install Android Studio; use a physical Android phone and EAS for later native builds.
- Any native dependency/configuration change requires a new compatible development build before validating that behavior; OTA cannot add native functionality.

Do not initialize a second Git repository inside this existing repository.
