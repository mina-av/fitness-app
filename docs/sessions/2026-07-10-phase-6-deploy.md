# Session: Phase 6 (Teil 2) — Release-Vorbereitung (Deploy) + Testversuch

**Datum:** 2026-07-10
**Umfang:** UMSETZUNGSPLAN.md Phase 6, Deploy-Teil (App-Icon/Splash-Check,
EAS-Build-Profile) + erneuter Versuch, die App live zu testen.

## App-Namensänderung

Projekt hieß bislang `sport-app` (Default-Name aus `create-expo-app`).
Umbenannt auf **"Fitness Progress"**:

- `app.json`: `expo.name` → "Fitness Progress", `expo.slug` →
  "fitness-progress", `expo.scheme` → "fitnessprogress".
- `app.json`: `ios.bundleIdentifier` und `android.package` neu gesetzt auf
  `com.minaav.fitnessprogress` (vorher gar nicht konfiguriert — nötig für
  jeden EAS-Build). Kann vor einer echten Store-Einreichung noch geändert
  werden, für Dev-/Preview-Builds unkritisch.
- `package.json`: `name` → "fitness-progress".
- App-Icon/Splash bewusst NICHT verändert (Nutzer-Entscheidung: Branding
  später, Namen jetzt schon anpassen).

## EAS-Setup

- `eas.json` neu angelegt: `development` (Dev-Client, internal, Android APK),
  `preview` (internal, Android APK), `production` (autoIncrement) Profile.
- `expo-dev-client` installiert (Voraussetzung für `development`-Profil-Builds).
- `eas-cli` NICHT als Projekt-Dependency behalten — `expo-doctor` markiert das
  explizit als Anti-Pattern ("EAS CLI should not be installed in your
  project"). Nutzung stattdessen über `npx eas-cli`.

## expo-doctor-Fund: fehlende Peer-Dependencies (echter Bug aus Phase 0)

`npx expo-doctor` deckte auf, dass `expo-constants` und `expo-linking` fehlen
— beides Peer-Dependencies von `expo-router`, in Phase 0 versehentlich als
"ungenutzte Template-Deps" entfernt. Ohne sie kann die App außerhalb von Expo
Go abstürzen. Nachinstalliert. **Lehre:** `npx expo-doctor` gehört ab jetzt
regelmäßiger in die Check-Routine, nicht nur vor dem ersten Build.

Verbleibende Abweichung (bewusst akzeptiert): `jest`/`@types/jest` sind neuer
als von der installierten Expo-SDK-Version empfohlen. Betrifft nur
Test-Tooling (kein `jest-expo`-Preset im Einsatz, kein Einfluss auf den
EAS-Build), daher über `expo.install.exclude` in `package.json` bewusst von
der Prüfung ausgenommen statt downgegradet (hätte die 106 bestehenden Tests
riskiert). `npx expo-doctor` steht danach bei 20/20.

## Testversuch: EAS-Login-Odyssee

Ziel: einen Android-Dev-Build anstoßen, um endlich auf einem echten Gerät zu
testen (siehe frühere Sessions: Web blockiert durch zwei expo-sqlite-Bugs,
Expo Go durch SDK-Mismatch).

1. **Mein Bash-Tool-Zugriff läuft in einer isolierten Umgebung**, die den
   Login der Nutzerin in ihrem eigenen Terminal nicht sieht (`~/.expo/state.json`
   bleibt unverändert, obwohl sie sich erfolgreich eingeloggt hat — bestätigt
   durch Account-Link `expo.dev/accounts/mina-avs-team`). `eas build` muss
   daher **von der Nutzerin selbst** in ihrem Terminal ausgeführt werden, ich
   kann es nicht stellvertretend anstoßen (und sollte auch kein Zugangstoken
   von ihr entgegennehmen, um es selbst zu verwenden).
2. Nutzerin ist über **Google SSO** bei Expo angemeldet → `eas login` mit
   Passwort-Prompt funktioniert für SSO-Accounts nicht. Alternative:
   Personal-Access-Token von expo.dev/settings/access-tokens +
   `$env:EXPO_TOKEN` in PowerShell. Bei ihr weiterhin Login-Prompt
   aufgetaucht (evtl. `set` statt `$env:` verwendet, oder Token nicht im
   selben Fenster gesetzt — nicht abschließend geklärt).
3. Nutzerin wollte eigentlich lieber aufs **iPhone** — dafür bräuchte ein
   EAS-iOS-Dev-Build zwingend ein bezahltes **Apple Developer Program**
   (99 $/Jahr), das sie nicht hat.
4. Nochmaliger Versuch über **Expo Go** (kostenlos): Expos Versions-API
   (`exp.host/--/api/v2/versions`) zeigt inzwischen eine SDK-57-taugliche
   Expo-Go-Version (`57.0.2`, verteilt über GitHub Releases), aber die
   **im App Store veröffentlichte** Expo-Go-App bot laut Nutzerin weiterhin
   kein Update an — die Store-Version hinkt also weiterhin hinterher.

**Ergebnis:** Live-Testen auf einem echten Gerät bleibt vorerst offen.
Nutzerin hat sich entschieden, das Testen zurückzustellen statt einen Apple
Developer Account zu holen oder den EAS-Login-Fehler weiter zu debuggen.

## Offene Punkte für später

- [ ] EAS-Login-Problem der Nutzerin (Passwort-Prompt trotz `$env:EXPO_TOKEN`)
      nicht abschließend gelöst — beim nächsten Versuch genau prüfen, ob die
      Variable im selben PowerShell-Fenster gesetzt UND `npx eas-cli whoami`
      danach im selben Fenster ein Login bestätigt, bevor `eas build` läuft.
- [ ] Android-Dev-Build noch nicht tatsächlich durchgelaufen (nur `eas.json`
      + Vorbereitung stehen; der eigentliche `eas build`-Lauf muss die
      Nutzerin selbst anstoßen).
- [ ] iOS-Test weiterhin blockiert (Expo Go App Store-Version veraltet, kein
      Apple Developer Account vorhanden).
- [ ] App-Icon/Splash sind weiterhin Expo-Standard-Assets — eigenes Branding
      bewusst zurückgestellt.
- [ ] E2E-Durchlauf des Kernloops (Maestro o.ä., laut Plan Teil von Phase 6)
      noch nicht gemacht — hängt am Geräte-Testing.

## Nächster Schritt

Sobald Geräte-Testing gewünscht wird: entweder (a) Android-Dev-Build von der
Nutzerin selbst über `npx eas-cli build --profile development --platform android`
anstoßen (nach erfolgreichem `eas login`/`EXPO_TOKEN`), oder (b) auf ein
Expo-Go-App-Store-Update für SDK 57 warten, oder (c) Apple Developer Account
für iOS. Ansonsten: E2E-Skript (Maestro) vorbereiten, das auch ohne
Geräte-Zugriff als Testfall-Dokumentation dienen kann.
