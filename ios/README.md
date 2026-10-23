# YourLogos Native Beta — iPhone + Today Widget

**Source complete, device signing pending.** The approved YourLogos live web experience is
hosted inside a native SwiftUI WKWebView. The separate WidgetKit extension is a real
iOS small/medium Home Screen widget with an offline bundled daily quote catalogue.

## What works in this native beta
- Native app icon (temporary standard icon until final icon assets), full-screen
  YourLogos interface, existing glass tabs / serif design and Supabase login UI
- Native iPhone haptic feedback for actions via `yourlogosHaptics` WKScriptMessageHandler
- Small or medium daily-quote widget in muted-gold / ink-black premium style
- **Keep** link opens the native app and saves that quote into the native
  WebView's existing guest `yourlogos_web_v1.saved` collection
- Widget's bundled 91 quotes and seeded order match the current app's base
  featured quote sequence (subject to previously saved per-day overrides)
- Native web app data is separate from Safari's existing browser storage.
  No automatic cloud migration, and no personal data sent when clicking Keep.

## Generate and test on a Mac

1. Install a version of Xcode compatible with your **actual macOS version**.
   A 2018 MacBook Pro normally supports macOS Sequoia and Xcode 16.4;
   the newest Xcode versions may require a newer Mac. Apple's support
   matrix: https://developer.apple.com/xcode/system-requirements/
2. Install Xcode Command Line Tools if necessary, then install XcodeGen:
   `brew install xcodegen`
3. Clone `OWEF/Yourlogos`, then in Terminal:
   ```sh
   cd Yourlogos/ios
   xcodegen generate
   open YourLogosNative.xcodeproj
   ```
4. In Xcode, choose scheme **YourLogos**, then an iPhone simulator.
   Press **Run**. In the simulator, open Home Screen editing → Add Widget
   → **YourLogos Daily Quote** → choose Small or Medium.
5. For a physical device, under both targets' **Signing & Capabilities**,
   select your Apple team with automatic signing and a unique Bundle Identifier
   if necessary. Pair your iPhone and run the app once to install its widget
   extension. A free Personal Team may have 7-day provisioning expiry;
   TestFlight/App Store distribution requires paid membership.

## Widget behavior
The widget doesn't execute JavaScript or render web pages. It renders its
own SwiftUI design and gets a local snapshot of 91 editorial quote candidates.
It schedules a new timeline after the next *local* midnight; iOS decides the
actual refresh time, so updates are not guaranteed to occur at precisely 00:00.

**Keep** is intentionally a native deep link, not an in-widget mutation:
tapping the control opens YourLogos and saves the chosen thought in the
native WebView. Therefore it works without App Groups / paid entitlements
for the initial signed-device beta. A later version can implement inline
AppIntent check-in and App Group state, once device signing is verified.

The current web app is the source of truth for account and library data.
Email-link sign-in initiated from a native WebView can still return to
Safari; a production release will need explicit native URL callback handling
and tested authenticated sync. Do not advertise native account login as
fully verified or auto-migrate browser storage.

## Native development vs. website
- Updating the Railway website changes the content shown in the native host
  without requiring a new native binary.
- Updating the widget's bundled quotes, widget styling, native haptics or
  URL handling requires a **new signed app build**.
- Apple signing is not a once-for-all approval for beta builds: iOS checks
  signatures on installation and each new build. Widget timeline refreshes
  do **not** require a new signature.
- This repo's macOS GitHub Actions workflow builds the simulator unsigned,
  validating source without access to your private Apple signing certificates.

## Visual/design constraints
- Keep Cormorant Garamond / Libre Caslon / DM Sans throughout the hosted app.
- Widget uses the iOS system serif for the first compiled alpha; exact
  Cormorant font embedding requires a licensed native font asset in its target.
- Maintain muted gold, deep slate, light ivory; no streak numbers or
  Duolingo-style daily gamification.
- Do not disturb Encounter / Library / My World / Supabase data.

## Status
- XcodeGen + Swift native app + WidgetKit files: committed
- macOS CI simulator compilation: check GitHub Actions results
- Physical iPhone installation and click-through: requires one-time Apple
  device signing, then confirmation of successful app + widget installation
- TestFlight/App Store deployment: **not configured**
