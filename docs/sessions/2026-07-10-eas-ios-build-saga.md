# Session: EAS-iOS-Build — vom Login-Chaos zum laufenden Build

**Datum:** 2026-07-10 (Fortsetzung der Phase-6-Deploy-Session)
**Ziel:** Die App endlich auf einem echten iPhone testen.

## Ausgangslage

Aus der vorherigen Session (`2026-07-10-phase-6-deploy.md`): EAS-Setup stand
(`eas.json`, `expo-dev-client`), aber Geräte-Testing war blockiert — mein
Bash-Tool-Zugriff läuft isoliert vom Login der Nutzerin in ihrem eigenen
Terminal, Google-SSO erschwerte `eas login`, und ohne Apple Developer Account
ging beim iPhone nichts.

## Verlauf

1. **Nutzerin hat einen Apple Developer Account angelegt** — als
   **Individual/Sole Proprietor** (passend zu einer Freelance-Steuernummer
   ohne eingetragene Firma/D-U-N-S-Nummer; "Company/Organization" hätte einen
   D-U-N-S-Antrag gebraucht).
2. **EAS-Login-Verwirrung aufgeklärt:** Der Fehler "Your username, email, or
   password was incorrect" beim `eas build`/`eas credentials`-Lauf war NICHT
   die Apple-ID (wie zunächst angenommen), sondern der **EAS/Expo-Account-
   Login selbst** — die Nutzerin ist dort über Google-SSO angemeldet und hat
   kein separates Passwort. Gelöst über einen Personal-Access-Token:
   ```powershell
   $env:EXPO_TOKEN="<token von expo.dev/settings/access-tokens>"
   npx eas-cli whoami   # bestätigt Login, BEVOR weitere Befehle laufen
   ```
   **Lehre:** Bei SSO-Accounts immer zuerst `whoami` im selben Fenster
   verifizieren, bevor man Build-/Credentials-Befehle versucht — sonst sieht
   jeder Folgefehler wie ein Apple-Problem aus, obwohl es der EAS-Login ist.
3. **Apple-ID-Login im Build-Flow** hat danach auf Anhieb funktioniert (2FA
   inklusive) — kein App-spezifisches Passwort nötig, entgegen meiner
   ersten Vermutung.
4. **`eas build --profile development --platform ios`** durchlief:
   Bundle-ID registriert, Apple Distribution Certificate erstellt,
   Geräte-Registrierung über den "Website"-Weg (Link auf dem iPhone öffnen).
5. **Installations-Hürden auf iOS:**
   - Ein **zweites, nicht registriertes** Gerät konnte die App nicht
     installieren ("Integrität kann nicht verifiziert werden") — erwartetes
     Verhalten bei Ad-hoc-Verteilung, kein Bug.
   - Das **registrierte** Gerät brauchte den iOS-**Entwicklermodus**
     (Einstellungen → Datenschutz & Sicherheit → Entwicklermodus), um einen
     selbst signierten Build überhaupt zu starten.
   - Nutzerin wollte den Entwicklermodus bewusst **nicht** auf ihrem
     Haupt-iPhone aktivieren (nachvollziehbare Sicherheitsentscheidung) →
     stattdessen auf einem **zweiten Gerät** aktiviert, das aber erst neu
     registriert und neu gebaut werden muss.
   - Apple/iOS verzögerte den Profil-Download um ca. eine Stunde (Cooldown
     außerhalb unserer Kontrolle).
6. **Parallel TestFlight eingerichtet** als entwicklermodus-freie
   Alternative: `eas.json`s `production`-Profil war bereits korrekt für
   Store-Distribution konfiguriert (kein `distribution`-Feld = Standard
   `store`). Workflow:
   ```powershell
   npx eas-cli build --profile production --platform ios
   npx eas-cli submit --platform ios --latest
   ```
   TestFlight-Apps brauchen keinen Entwicklermodus und keine
   Geräte-Registrierung, da sie über Apples eigene Verteilung laufen.

## Auto-generierte app.json-Änderungen (durch eas build)

- `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` — aus der
  Verschlüsselungs-Compliance-Frage beim Build (App nutzt keine eigene/
  nicht-standardmäßige Verschlüsselung).
- `ios.buildNumber: "2"` — Auto-Increment durch EAS.

## Stand am Ende der Session

- Development-Build für das erste (registrierte) Gerät steht, wartet auf
  dessen Entwicklermodus-Freischaltung.
- Zweites Gerät: Entwicklermodus wird dort aktiviert, Neu-Registrierung +
  neuer Dev-Build stehen noch aus (Apple-Cooldown von ~1h beim
  Profil-Download).
- TestFlight-Weg (Production-Build + Submit) wurde angestoßen, Ergebnis bei
  Session-Ende noch offen.

## Offene Punkte für später

- [ ] Ergebnis des Production-Builds/TestFlight-Submits prüfen, sobald
      abgeschlossen.
- [ ] Falls TestFlight klappt: das als bevorzugten Testweg für die Zukunft
      festhalten (kein Entwicklermodus, keine Geräte-Registrierung nötig) —
      ggf. `development`-Profil-Testing ganz fallen lassen.
- [ ] Zweites Gerät ggf. noch registrieren, falls der Dev-Build-Weg dort
      weiterverfolgt werden soll.
- [ ] E2E-Durchlauf des Kernloops (aus Phase 6) auf dem ersten laufenden
      Build durchführen, sobald installiert.

## Nächster Schritt

Sobald ein Build tatsächlich auf einem Gerät läuft: den kompletten
Nutzer-Kernloop durchklicken (Übung anlegen → Plan erstellen → Workout
starten inkl. Superset/Drop-Set → PR-Feedback prüfen → Wochenanalyse
ansehen → Daten-Export testen) und Ergebnisse hier oder im Chat festhalten.
