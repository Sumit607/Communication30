# Personal Android build — 11 September 2026

The user explicitly requested an APK containing their Gemini key, overriding the earlier user-entry-only requirement for this personal artifact. The key is never committed to this repository. Embedding makes it extractable from the APK, even though the app copies it into SecureStore for normal use. Do not publish this APK, its JavaScript bundle, or source maps to public GitHub releases or web hosting.

## Build mechanism

The `personal` EAS profile uses internal Android APK distribution and the `preview` EAS environment. `TAKE_TWO_PERSONAL_GEMINI_KEY` has secret visibility and project scope. The post-install hook injects it into a credential module only on the EAS Android builder with the personal profile. The repository module remains a null stub; ordinary preview/production builds do not inject any key. Missing personal credentials fail the build.

Existing saved keys take precedence. An explicit disable writes a durable opt-out before deleting the SecureStore key, preventing silent reinstallation. Disabling cannot remove the original bytes from an embedded APK. Reinstalling or clearing app data resets this local preference. Free-tier data acknowledgment remains required before audio/text critique. No billing or paid fallback is enabled.

## Live verification

On 11 September, the supplied key successfully listed Gemini models (HTTP 200). Actual generation with the previous default `gemini-2.5-flash` failed with HTTP 404: Google said it was no longer available to new users and recommended `gemini-3.6-flash`.

A subsequent generation request to `gemini-3.6-flash` returned HTTP 200 and exactly `OK` (5 input tokens, 1 output token, 81 thinking tokens). No personal recording, diary, or other personal content was sent. This proves the key can generate content with that model at test time; it does not prove unlimited quota, account billing status, audio critique quality, or physical-device capture.

The app resolves new/missing model settings and the former 2.5 Flash default to the tested 3.6 Flash model. Explicit other model selections remain unchanged. The Settings connection test now performs a small real generation request rather than only querying model metadata.

A second test used the installed `@google/genai` SDK and a one-second synthetic WAV tone. Gemini accepted audio input and returned JSON that passed a strict Zod schema (`ok: true`), using 25 audio input tokens. This checks audio access and structured output without personal content; the phone's AAC extraction and complete Coach rubric remain unvalidated on hardware.

On 13 September, a fresh text-generation request using the supplied key and `gemini-3.6-flash` again returned HTTP 200 and exactly `OK`.

On 16 September, REST and installed-SDK text requests again returned `OK`. The manual `scripts/verify-coach.cjs` check passed against the actual Coach and delta prompts/schemas with synthetic PCM speech: 14-second Take 1 returned six scores, two evidence-backed corrections and a hidden question; 20-second Take 2 matched both original corrections and returned `not fixed`/`fixed`. Quote membership, timestamp bounds, reshoot consistency and hidden-question separation passed the app validators. This is a limited live API smoke test, not a full human rubric evaluation or phone capture test. Longer attempts timed out or received a Google 503 overload response; the app now gives a specific retry message for that condition. No paid fallback is configured.

To repeat the manual check, supply `TAKE_TWO_TEST_KEY` only in the local process environment and run `node scripts/verify-coach.cjs <synthetic-take1.wav> <synthetic-take2.wav>`. It requires valid 16-bit PCM WAV files, uses the app's current model and request settings, validates both responses, and prints credential-redacted diagnostics. Keep speech fixtures outside this OneDrive repository; this check is never run automatically during builds or unit tests.

A later realistic-length retry passed Take 1 at 41.04 seconds, returning all six scores, three validated corrections and a hidden follow-up. Its 48.38-second Take 2 request timed out at the configured request limit. Thus the short complete flow passed live, but longer free-tier requests showed intermittent availability/latency problems. Do not represent this smoke test as a guarantee that every analysis completes, or as the full P0 evaluation.

Sources: [Google pricing](https://ai.google.dev/gemini-api/docs/pricing), [GenerateContent API](https://ai.google.dev/api/generate-content), [EAS environment variables](https://docs.expo.dev/eas/environment-variables/).

This is a personal configuration update, not completion of all v1.6 features. Device capture, extracted-audio critique and remaining product phases need their own validation.

## Build verification and replacement

The first personal APK (1.0.1) finished successfully on 11 September. Its post-install log confirmed credential injection, and Gradle completed successfully. Review on 13 September found Expo Doctor warnings for missing direct `expo-font` and SDK patch mismatches. The replacement 1.0.2 adds `expo-font` and its config plugin and uses `npx expo install --fix` to align SDK packages. Native dependencies require a new APK.

The replacement 1.0.2 / code 3 build is finished. On 17 September, its remote logs confirmed 21/21 Expo checks, successful private credential injection and `BUILD SUCCESSFUL in 13m 51s`. A buffered HTTP-range inspection of the actual APK extracted its JavaScript bundle in memory and confirmed that the embedded key exactly matches the supplied credential, the tested model is present and font assets are packaged. Verification printed booleans and byte counts only. The APK is 138,364,960 bytes and bundles JavaScript for standalone use; this does not substitute for the phone checklist below.

The repository-root `.easignore` excludes Git history, local tooling, docs, tests, private data, and generated build artifacts. This reduced the source upload from 26.3 MB to 2.2 MB and resolved the stalled transfer. App source, native modules, migrations, and runtime assets remain included. Neither the API key nor a personal APK download URL belongs in these public docs.

## First phone verification (pending)

Install the signed replacement APK over the existing Take Two installation to retain its local data. Do not uninstall or clear app data just to update. This internal release bundles JavaScript and assets and runs without Expo Go, Metro or the laptop. Internet is needed for provider analysis, not local playback or writing.

1. Open Settings. Confirm `Gemini key is configured. No need to paste it again.` Acknowledge the free-tier data policy and tap `Test Gemini connection`; expect the `Gemini replied OK` message. Existing saved credentials take precedence, and a previous explicit disable remains disabled.
2. Start the current programme day, complete its prerequisites, choose a confidence rating, allow camera/microphone and record Take 1. Use a non-sensitive general topic. Finish normally after at least 30 seconds.
3. On `Coach · Take 1`, verify local playback has sound. Tap `Analyse Take 1 audio`. Expect one strength, at most three corrections and expandable scores/transcript; the surprise question must remain hidden.
4. Tap `Try these in Take 2`, record again and open the comparison. Each verdict must refer to the original correction, with no replacement correction list. Check both recordings remain playable.
5. Close and reopen the app. Confirm saved recordings and feedback persist. If a provider request fails, retry analysis on that same recording rather than using another take. A 503 busy response or 429 quota response is not proof of an invalid key.

These steps are a device acceptance checklist, not claims of completed testing. Audio extraction, permissions, playback and interruption recovery require evidence from the actual phone. An APK build or synthetic WAV request cannot establish those results.
