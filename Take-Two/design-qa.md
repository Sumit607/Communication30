# Prototype design QA

final result: passed

Scope: visual prototype Home and shared screen flow, not production app acceptance or physical Android validation.

## Evidence

- Source visual truth: `docs/design/home-reference.png`, generated from the user's three fitness-app references and the generated speaker asset.
- Final implementation: `docs/design/home-browser.jpg`; day detail capture: `docs/design/day-browser.jpg`.
- Combined comparison: `docs/design/home-comparison.png`, reference left, implementation right. Both were opened together and inspected.
- Source: 853 × 1844 pixels. Capture: 390 × 843 pixels, browser CSS viewport 390 × 844, device density approximately 1. Both were scaled to 390 × 844 for the 796 × 844 comparison image; the 1-pixel screenshot rounding difference is normalization, not a layout defect.
- State: first-day Home, zero completed days, light theme, no user data. Additional Day 1 overview and Studio states inspected in the browser. Browser captures are JPEG; the combined comparison is PNG.
- Full-view comparison covers the required typography, image placement, week strip, programme cards, privacy line and navigation. At normalized width these details are readable, so a separate enlarged region was unnecessary.

## Comparison history and fixes

1. Initial Home review found a P2 horizontal seam where the speaker image ended above the action. Extended the asset to the entire hero and adjusted the crop so the face stays clear of the headline.
2. Normalized comparison found P2 excess vertical spacing hiding almost all of Day 2 above the tab bar. Reduced week-card padding and section/card spacing. Final capture shows Day 1 and part of Day 2 while preserving the primary action.
3. Progress inspection exposed literal backslash-n text in two JSX headings. Replaced those with actual newline string expressions in Progress and Coach; the corrected text was checked after reload.

## Required surfaces

- Fonts/typography: native system sans-serif, bold headings and quiet supporting text. Font rendering and optical weights vary from the generated reference; accepted for a native Android prototype. No headline obscures the speaker's face.
- Spacing/layout: rounded panels, full-width thumb-reachable primary actions, safe-area-aware bottom controls and scrollable content. Original reference proportions are retained with a slightly larger programme heading.
- Colors/tokens: cobalt blue for practice/navigation, neutral grey panels, crimson only for recording simulation, green for positive feedback. White hero text remains legible.
- Images/icons: generated speaker asset is bundled locally; native Ionicons are used consistently. No credential image, screenshot-as-screen, emoji substitute or custom icon drawing is included.
- Copy/content: communication practice replaces fitness content; no ads or workout metrics. UI PREVIEW, illustrative-feedback and no-recording disclosures distinguish temporary states from real activity. All days can be explored for design review; no programme completion is created.

## Interaction evidence

- Browser: Home → Day 1 → Studio opens; confidence controls and disabled initial primary action are present; Progress opens in a genuine empty state. No captured browser warnings/errors.
- Two preview interaction tests passed: baseline flow reveals its sample question only after two simulated takes; prepared-day thinking starts with four empty fields and requires all four before Outline.
- TypeScript, scoped preview ESLint and preview formatting checks passed.

## Remaining boundaries

- Physical Expo Go, Android keyboard/insets, TalkBack and large-font checks remain for phone review. Multi-task days currently reuse illustrative layouts. No claim of functional Android completion is made.
- Android prototype export passed after automatic approval review recovered from an initial usage-limit rejection; the same export command was approved and completed. Physical Expo Go testing remains pending.
- The paused production Studio has seven full-worktree ESLint ref-analysis errors. Those files are not loaded by the prototype; they remain outside this UI checkpoint.
- P3 polish: match exact font optical weights and fine-tune card spacing after the user reviews the design on their own phone.

## Next step

User reviews the browser/Expo Go prototype and approves or requests design changes. Resume full app implementation only after that approval.
