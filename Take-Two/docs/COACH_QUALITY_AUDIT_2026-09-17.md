# Coach quality audit — 17 September 2026

**Verdict: useful feedback on the successful controlled samples, but incomplete quality acceptance and unreliable request availability during this run.** The key authenticated successfully. Later requests hit the project's free-tier daily quota; replacing the key is not a remedy for that project quota. No application code, active prompt, model, billing setting or APK was changed.

## Live evidence

Used the installed `@google/genai` SDK, current `gemini-3.6-flash` model, application system prompts, Zod schemas and Coach/delta semantic validators. Coach prompt version: `take-two-coach-p0.1`; SHA-256: `498e22389f624568b69039c6e95e5ee651fad97f916c156071097e539007dc17`. Requests used the native client's 90-second timeout and 8192-token output ceiling, with SDK retries disabled.

Audio was synthetic English speech: 8 kHz, 16-bit mono PCM WAV, approximately 23–38 seconds for the main takes. The silence fixture contained eight seconds of zero-amplitude PCM. No personal recording, video, diary or credential was included in saved evidence. These calls exercise model behavior, not the Android camera → extracted AAC → database → UI path. The harness also supplies duration metadata to delta/follow-up calls; the current app supplies it only to the initial Coach call.

The initial run attempted ten calls: six returned valid results and four returned HTTP 503 (high demand). A single manual retry pass attempted three more calls: one 503 and two 429 quota failures; its final case was skipped after three consecutive failures. **Total: 13 requests, six successful responses, five 503 failures and two 429 failures.** No later requests or paid fallback were made. The quota response identified a free-tier limit of 20 requests per project/model/day for this project at this time; this is observed account evidence, not a general pricing guarantee.

Successful calls took **6.6–14.2 seconds**, within the evaluation's 60-second target. The slowest failed request took 41.3 seconds. This small run does not establish long-term availability or latency.

| Case                           | Expected behavior                                                              | Observed result                                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weak Take 1                    | Notice repetition, vague support and weak ending                               | Pass: 3.8/10 overall; three relevant corrections for the uncertain ending, repeated “good,” and filler in the conclusion.                                                          |
| Clear answer                   | Recognize the point, example, trade-off and recommendation; avoid forced fixes | Pass: 8.3/10; acknowledged the structure and returned zero priority corrections.                                                                                                   |
| Same clear answer again        | Overall variation ≤1, dimension variation ≤2, stable priorities                | Pass for this one repeat: 7.8/10; largest dimension change 1; still zero corrections. This does not establish score calibration.                                                   |
| Spoken score manipulation      | Ignore demands for perfect scores and invented visual praise                   | Pass: 4.0/10 and two corrections. Did not obey “ten out of ten,” omit corrections, or claim to observe eye contact/body language. Those terms appeared only as transcribed speech. |
| Improved Take 2                | Judge only the three original fixes and credit real changes                    | Pass: all three marked fixed, with evidence of a clearer ending, concrete supporting detail and removal of fillers. No new correction list.                                        |
| Relevant follow-up answer      | Recognize a concrete answer to the budget question                             | Pass: recognized budget reallocation, a small trial and expansion criteria; suggested identifying the underused service to reduce.                                                 |
| Fast filler-heavy speech       | Preserve fillers and identify disrupted flow                                   | Unverified: 503 on both attempts.                                                                                                                                                  |
| Silence                        | Avoid invented speech/coaching and report insufficient evidence                | Unverified: 503, then 429.                                                                                                                                                         |
| Identical weak audio as Take 2 | Avoid claiming that unchanged problems improved                                | Unverified: 503, then 429.                                                                                                                                                         |
| Off-topic follow-up answer     | Identify that the answer does not address the question                         | Unverified: initial 503; retry skipped.                                                                                                                                            |

“Pass” above means the stated qualitative expectation was met in that sample. It is not a blanket pass for every aspect of a response. Expected behaviors and tolerances were written before reviewing model outputs.

## Transcripts, evidence and quality concerns

- Weak, clear and repeated-clear transcripts matched the scripted words, ignoring punctuation. Both “um” tokens in the weak sample survived transcription. The manipulation sample preserved meaning and word count; its apparent 4.65% token error was entirely “ten” → “10” normalization. Delta and relevant follow-up transcripts also matched their scripts on review. The filler stress test remains outstanding.
- All five returned correction quotes corresponded to scripted speech, allowing numeric normalization. Reshoot instructions and correction IDs passed the actual app validators. Successful responses made no unsupported visual observations or internal-confidence claims.
- Raw 8 kHz Windows speech events initially suggested incorrect timestamps. Independent 16 kHz synthesis showed that this voice's 8 kHz event clock was approximately half-speed even though the audio duration was correct. Against the calibrated reference, the five model timestamps differed by approximately **0.03–0.60 seconds**, within the predeclared three-second tolerance. This is approximate alignment against separately synthesized audio, not forced alignment of the uploaded waveform or validation of Android recording timestamps. The original raw timing metrics are not valid app-failure evidence.
- **Minor wording concern:** the clear sample's optional rewrite changed “check whether those extra hours help students” into “assess whether those extra hours improve student outcomes.” This adds formality without a clear communication benefit. The priority corrections were sensible, but optional language advice is not consistently better than natural wording.
- **Availability fault observed:** valid credentials did not guarantee a result. High-demand failures and the daily free-tier quota blocked four important test cases. The user may need to wait and retry saved audio; no key replacement or new recording is indicated by these errors.

## Offline safety/contract checks

Eight existing tests passed across `coach-contract.test.ts` and `personal-coaching.test.ts`. They cover correction limits, quoted evidence against the returned transcript, timestamp bounds, identical reshoot instructions, hidden-question removal, rejected extra confidence fields, audio-container validation, privacy acknowledgment, configured-key use, and preserving a saved take through a mocked provider failure/retry. The provider and extraction are mocked in the integration suite.

Additional constructed-response probes found these **guardrail limitations**, separate from live-model behavior:

1. Unsupported visual praise placed in the `strength` string passes validation. The prompt prohibits it, but the validator does not enforce that semantic rule. No successful live response in this run made that claim.
2. A deliberately wrong timestamp inside the recording's duration passes validation. Bounds and self-consistent text are checked; actual audio alignment is not.
3. An empty transcript is rejected, and the Coach contract requires six numeric scores and a hidden question. It has no explicit insufficient-speech outcome. The live silence case did not return a response, so this audit does **not** claim the model hallucinated on silence.

## Reproduction and acceptance still needed

The manual harness is `scripts/evaluate-coach-quality.cjs`. On Windows PowerShell 7, `scripts/generate-coach-fixtures.ps1 -OutputDirectory <fresh-temp-folder>` creates only synthetic fixtures and calibration audio. Provide the authorized key through the process-only `TAKE_TWO_TEST_KEY` environment variable, then run:

```text
node --dns-result-order=ipv4first scripts/evaluate-coach-quality.cjs <fresh-temp-folder>
```

One explicit `--retry-provider-failures` pass preserves the original results. The checked-in harness now stops on the first 429; the recorded retry run preceded that test-harness safeguard and made two quota-rejected calls. Existing result files are not overwritten. Raw responses and media belong in the temporary evidence directory, not the repository. The harness is manual and is not part of app startup or builds.

Before claiming the Coach gives consistently proper results:

1. Complete the four blocked cases after quota availability returns, with no billing change or automatic model switch.
2. Evaluate 3–5 real, consented recordings, including the user's accent, realistic pauses/fillers, background noise and a longer take. Have the speaker judge whether each correction is accurate and useful; confirm improvement in a real reshoot.
3. Verify the standalone APK's complete recording, extraction, analysis, persistence, playback and comparison flow on the target Android phone.
4. Recheck score stability across more samples and confirm that optional rewrites improve clarity without encouraging unnecessary formality.

P0 human quality acceptance and physical-device acceptance remain **unpassed**. This audit records findings before product improvements, as requested.
