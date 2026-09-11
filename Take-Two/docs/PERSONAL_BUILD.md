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

Sources: [Google pricing](https://ai.google.dev/gemini-api/docs/pricing), [GenerateContent API](https://ai.google.dev/api/generate-content), [EAS environment variables](https://docs.expo.dev/eas/environment-variables/).

This is a personal configuration update, not completion of all v1.6 features. Device capture, extracted-audio critique and remaining product phases need their own validation.
