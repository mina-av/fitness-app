---
name: deploy
description: Build and distribute the Expo app with EAS (dev builds, internal testing, and app store submission). Replaces web/Vercel deployment.
argument-hint: "feature-spec-path or 'build for testing'"
user-invocable: true
---

# Release / Build Engineer (Expo · EAS)

## Role

You handle building and distributing this Expo app. This is a mobile app, NOT a
website — there is no Vercel, no browser URL, no server to deploy. Distribution
happens through EAS (Expo Application Services): you turn the code into an
installable app for testing, and later submit it to the Apple App Store and
Google Play.

## Distribution stages (know which one the user wants)

1. **Dev build / Expo Go** — for day-to-day development on the user's own phone.
   Fastest, no store involved.
2. **Internal testing build** — a shareable build for a handful of testers
   (e.g. the user + a trainer trying it out). No public store listing.
3. **Store submission** — the app goes to Apple App Store / Google Play for the
   public. This needs paid developer accounts and review — a bigger step, only
   when the app is genuinely ready.

Always confirm which stage the user means before doing anything. For the MVP,
stages 1–2 are almost always what's wanted.

## Before Starting

1. Read `features/INDEX.md` to know what is being built
2. Check QA status in the feature spec — no Critical/High bugs open
3. If QA has not been done: tell the user "Run `/qa` first before building."
4. Read `UMSETZUNGSPLAN.md` for the app's release-related notes

## Pre-Build Checks

- [ ] `npm run check` (typecheck + lint) passes
- [ ] `npm test` passes
- [ ] `npx expo-doctor` reports no issues
- [ ] App runs correctly in the simulator / Expo Go
- [ ] Database migrations run cleanly on a fresh install (no leftover data)
- [ ] `app.json` has correct app name, slug, version, and bundle identifiers
      (`ios.bundleIdentifier`, `android.package`)
- [ ] App icon and splash screen are set
- [ ] No secrets committed to git (this MVP has none server-side)
- [ ] All code committed

## Workflow

### 1. One-time EAS setup (first build only)

> **Manual prerequisite (browser):** the user creates a free Expo account at
> [expo.dev](https://expo.dev) — account creation/login is a browser step that
> can't be automated here.

- [ ] Install the CLI: `npm install -g eas-cli`
- [ ] Log in: `eas login`
- [ ] Configure the project: `eas build:configure` (creates `eas.json` with
      build profiles)

### 2. Build for testing (stage 1–2)

- Development build (for the user's own device):
  `eas build --profile development --platform android` (or `ios`)
- Internal testing build to share with testers:
  `eas build --profile preview --platform android` (or `ios`)
- EAS runs the build in the cloud and returns a link. Android produces an
  installable `.apk`/`.aab`; iOS requires the tester's device to be registered
  (or use TestFlight via a store build).
- Share the resulting link/build with testers.

### 3. Store submission (stage 3 — only when truly ready)

> This step needs PAID accounts and is a real commitment — do not rush it.
> **Manual prerequisites (browser, cannot be automated):**
> - Apple Developer Program membership (paid, annual) for the App Store
> - Google Play Developer account (paid, one-time) for Play
> - Store listings: screenshots, description, privacy policy

- Production build: `eas build --profile production --platform all`
- Submit: `eas submit --platform ios` / `eas submit --platform android`
- Then complete the store listing in App Store Connect / Google Play Console and
  send for review.

### 4. Post-Build Verification

- [ ] The build installs and opens on a real device
- [ ] The built feature works as expected on-device (not just in the simulator)
- [ ] Data persists across app restarts
- [ ] No crash on a completely fresh install (empty database, first-run state)

### 5. Post-Build Bookkeeping

- Update the feature spec with the build/release info and date
- Update `features/INDEX.md`: set status to **Deployed** (or "Released" for a
  store submission)
- Tag the release: `git tag -a v1.X.0-PROJ-X -m "Release PROJ-X: [Feature]"`
  then `git push origin v1.X.0-PROJ-X`

## Common Issues

### Build fails on EAS but works locally
- Check the EAS build logs (the CLI prints a link) for the specific error
- Ensure all runtime dependencies are in `dependencies`, not `devDependencies`
- Run `npx expo-doctor` and `npx expo install --check` to catch version
  mismatches with the Expo SDK

### iOS build/install issues
- iOS needs either a registered test device (for dev/preview builds) or
  TestFlight (via a store build). Confirm which path the user is on.
- Bundle identifier in `app.json` must match the one in the Apple account

### App works in Expo Go but not in a build
- Some native modules aren't included in Expo Go; a development build is needed.
  Rebuild with `eas build --profile development`.

## Rollback

Mobile apps can't be "rolled back" like a website — a released version stays on
users' phones until they update. So:
1. For testing builds: just share the previous working build link again.
2. For store releases: fix the bug, bump the version, and submit an update.
   (For JS-only fixes, an EAS Update / OTA update can push a fix without a full
   store resubmission — consider setting that up later.)

## Full Build Checklist

- [ ] Pre-build checks all pass (`check`, `test`, `expo-doctor`)
- [ ] Correct stage chosen (dev / internal test / store)
- [ ] `app.json` version + identifiers correct
- [ ] EAS build succeeds
- [ ] App installs and works on a real device
- [ ] Data persists; fresh install doesn't crash
- [ ] Feature spec updated with release info
- [ ] `features/INDEX.md` updated
- [ ] Git tag created and pushed
- [ ] User has verified the build on a device

## Git Commit

```
release(PROJ-X): Build [feature name] for [stage]

- Stage: development / internal testing / store
- Date: YYYY-MM-DD
```
