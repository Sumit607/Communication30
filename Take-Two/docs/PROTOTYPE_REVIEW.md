# UI prototype review

The latest user instruction is to review the design in a browser and Expo Go before continuing full app implementation. The entry point is `preview.ts`; it loads the isolated screens under `src/features/preview/`. The production router and services are preserved but inactive.

Start from the Take-Two folder:

```sh
npx expo start --go --lan --port 8090
```

Connect the phone and computer to the same Wi-Fi. Open the printed web address in a mobile browser or scan Expo CLI's QR in Expo Go. Use Expo Go compatible with this project's SDK 57. Keep the computer awake and server running. Campus/guest Wi-Fi may prevent connections between devices; a personal hotspot or another shared network may be needed.

Current session: web `http://10.12.5.218:8090/`, Expo Go `exp://10.12.5.218:8090`. The address may change on another network. An ignored session QR image is in `.expo/preview-qr.png`.

Official guide: https://docs.expo.dev/get-started/start-developing/

## What to review

- Home: blue speaker image, week strip, programme cards and tabs.
- Day 1: unprepared baseline and the Studio action.
- Studio: choose confidence, simulate Take 1, inspect labelled sample coaching, simulate Take 2, reveal the sample follow-up.
- You → Day 3: Input, four blank thinking fields, four short outline cues.
- Writing, optional reflection, empty Progress and the reminder switch layout.

All 30 days are explorable for visual review. Multi-task curriculum days reuse an illustrative flow; this is not their final implementation. Preview interactions never complete a day. Sample coaching is not based on your voice. Camera, microphone, AI, playback, notifications and storage are inactive. Text resets when leaving its screen. No API key is used.

The three fitness screenshots guide the blue image-led design. Generated speaker art: `assets/images/speaking-hero.png`. Home visual target: `docs/design/home-reference.png`. No credential screenshot is included.

Full app implementation resumes only after the user approves. P0 audio evaluation and physical Android checks remain separate requirements.
