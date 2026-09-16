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

Sources: [Google pricing](https://ai.google.dev/gemini-api/docs/pricing), [GenerateContent API](https://ai.google.dev/api/generate-content), [EAS environment variables](https://docs.expo.dev/eas/environment-variables/).

This is a personal configuration update, not completion of all v1.6 features. Device capture, extracted-audio critique and remaining product phases need their own validation.

## Build verification and replacement

The first personal APK (1.0.1) finished successfully on 11 September. Its post-install log confirmed credential injection, and Gradle completed successfully. Review on 13 September found Expo Doctor warnings for missing direct `expo-font` and SDK patch mismatches. The replacement 1.0.2 adds `expo-font` and its config plugin and uses `npx expo install --fix` to align SDK packages. Native dependencies require a new APK.

The repository-root `.easignore` excludes Git history, local tooling, docs, tests, private data, and generated build artifacts. This reduced the source upload from 26.3 MB to 2.2 MB and resolved the stalled transfer. App source, native modules, migrations, and runtime assets remain included. Neither the API key nor a personal APK download URL belongs in these public docs.
