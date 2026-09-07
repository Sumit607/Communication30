# Android implementation decisions — 8 September 2026

The user authorized the mobile app and chose Gemini free tier after reviewing its privacy/usage differences. This overrides the paid-project requirement in the original spec and planning documents, which remain historical sources. No billing or paid test requests are authorized. The app cannot independently verify a key's billing tier: settings must state this explicitly. No automatic model fallback or request retry.

Use the existing selected blue Home/day and Coach prototype as the visual source. Coach hierarchy: one strength, up to three evidence-backed corrections, optional expanded details, one bottom action. Compare repeats those exact corrections with individual verdicts; it does not create a fresh correction list. Follow-up remains hidden until the second usable core take is saved.

Delivery is an Android internal-distribution release APK with its JavaScript/assets bundled, installed as Take Two without Expo Go or a running laptop. EAS authentication/signing and a physical V2511 phone test are separate gates. Android OS version has not been confirmed from the kernel screenshot.

Acceptance: private persistent recording; native PCM audio extraction; validated Take 1 feedback; review gate before Take 2; validated correction delta; hidden follow-up and self-check; durable writing/diary/confidence; max three physical attempts per task; no video/diary/key in network payloads or exports; errors preserve existing work. Physical capture, interruption recovery, audio quality and P0 coaching quality require device evidence, not just a successful JS bundle.

The original quality evaluation is still unrun. This development work must not be described as validated coaching or a completed v1.6 release until remaining curriculum, measurements, resilience and phone checks pass.
