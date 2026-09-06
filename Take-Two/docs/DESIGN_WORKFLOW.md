# Design and phase checkpoints

These are the user's standing rules for future Take Two UI work. They do not start Phase 1 or authorize new product screens now.

## Sources of truth

- [TAKE_TWO_SPEC_v1.6.md](TAKE_TWO_SPEC_v1.6.md) governs behavior, progression, privacy and product scope.
- When a Figma design exists for a screen, its identified frame/version governs visual layout, typography, spacing, components and states. Inspect the actual design; do not invent a Figma reference or replace it with an unrelated visual direction.
- Explicit user corrections take precedence. If the visual target conflicts with a product invariant, document the conflict and resolve it before dependent implementation.

No Take Two Figma file/frame has been supplied in this task, and no screen design has been marked validated. Record actual references here as they become available.

## Before implementing a major screen

1. Identify the user's immediate task, entry point, next step and one primary action. Read the relevant specification section and existing components/design references.
2. Use Product Design/Figma to examine the flow and create or inspect a visual target. Follow the relevant capability's workflow and required skill prerequisites. Explore alternatives when there is no selected visual direction; retain existing Figma fidelity when one exists.
3. Cover the states relevant to this screen: blank/first use, filled, loading, offline/pending, permission refusal, failure/recovery and completion. A recording screen must hide topic/outline text during capture; Coach must not expose the hidden question.
4. Inventory reusable components and tokens before adding new ones. Assign shared presentation to `src/components/`, orchestration to feature modules and infrastructure to services. Keep routes thin.
5. Review the visual target and flow before substantial frontend code. Record what was checked, any user selection and unresolved issues. A mockup alone is not proof that the interaction works.

## Design criteria

- Premium and simple: clear typography, restrained color, consistent spacing and an obvious reading order. Use the specification's warm neutrals and recording accent unless the identified visual source refines them compatibly.
- One clear primary action per screen; secondary actions have visibly lower emphasis. Home is programme-led navigation, not a generic grid of dashboards and charts.
- One-handed Android use: place frequent actions within comfortable thumb reach; respect gesture/navigation areas and keyboard insets. Validate practical touch targets and spacing on the target device rather than relying on appearance alone.
- Preserve dark Studio, blank-first thinking, no teleprompter, no live coaching overlay, the required Take 1 → up to three fixes → Take 2 → surprise loop, and the three-take cap.
- Reuse components across repeated patterns. Do not add a UI framework, Tailwind or an icon/chart library merely to imitate a mockup; establish its concrete need and compatibility first.
- Check text scaling, readable contrast, focus/reading order, accessible labels, keyboard visibility and long content. Status must not rely on color alone.

## Validate the implementation

Compare the implemented screen with the selected visual source at matching viewport dimensions and states. Capture actual rendered evidence, fix visible mismatches and check the intended navigation/action sequence. Native Android reachability, gestures, keyboard behavior and accessibility need phone evidence; a browser preview or mocked component test cannot substitute for those checks.

Keep a short record per screen: route, specification references, visual-source link/frame/version, component inventory, states reviewed, validation evidence and remaining issues. Do not store personal recordings, diary content or credentials in Figma, design tools or GitHub. Use synthetic fixtures for design work.

## Stable-phase GitHub checkpoint

At each stable phase:

1. Complete the phase's acceptance checks and relevant design validation. State any remaining physical-device or external-service limits explicitly.
2. Inspect the diff, generated files and dependency changes. Include source/configuration/docs/migrations and suitable synthetic tests; exclude private media, runtime databases, secrets and build caches.
3. Make a descriptive commit on a `codex/` branch in the existing repository. Preserve unrelated user changes and existing history.
4. Push the checkpoint to the configured GitHub destination. Record the commit SHA, branch, phase and check results. A checkpoint does not require a merge, release or deployment.
5. If no destination is configured, request the repository URL and leave publication pending. Never report a GitHub checkpoint until the remote push succeeds.

The user requested a new GitHub repository for phase checkpoints. Use a private `Take-Two` repository under the authenticated user's account. Keep the existing parent repository and its `Take-Two/` subdirectory; do not initialize nested Git history. Repository creation/publication is pending GitHub sign-in; do not claim a remote checkpoint until the push is verified.
