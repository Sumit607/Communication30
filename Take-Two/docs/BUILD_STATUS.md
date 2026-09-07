# Current build status

**Active scope: UI prototype for browser and Expo Go review. Full app implementation is paused until design approval.** This supersedes the earlier request to proceed immediately with the full app.

The `preview.ts` entry loads only preview screens, shared presentation and curriculum text. Existing production routes and unfinished services are preserved but not loaded. See `PROTOTYPE_REVIEW.md` for launch and review steps.

Available preview: photographic Home, 30 programme topics, day overview, Input/Think/Outline, simulated Take 1 and Take 2, illustrative Coach, hidden sample follow-up, writing/reflection, empty Progress and settings. No account, API key or database is required. Recording, AI, notifications and durable storage are inactive.

The underlying Android app remains incomplete. P0 is **not run / not passed**. No physical Android test, native audio extraction validation or paid Gemini coaching evaluation has passed.

TypeScript and scoped preview ESLint passed. Browser preview loads without captured console warnings/errors. Interaction and visual results are recorded in root `design-qa.md`. Full-worktree ESLint still reports seven ref-analysis errors in the paused production Studio screen, which the preview does not load.

Android prototype export passed: `npx expo export --platform android --output-dir dist/preview-android` compiled `preview.ts` (670 modules) and emitted the Hermes bundle and assets. An initial automatic-review usage-limit rejection was resolved; the same command was later approved and completed. This is a bundle check, not a physical Expo Go test.
