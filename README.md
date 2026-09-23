# Hundebüechli

Hundebüechli (Swiss German for the little booklet every dog in Switzerland has) is an offline-first
dog care app: health records, reminders, weight, documents and shareable PDFs for the vet, the dog
sitter and a lost-dog poster.

**Status:** in development, day 4 of 5, tested on an iPhone. Dogs with profile and photo (re-encoded,
location data stripped and checked), health entries with due dates, the "Up next" overview where one
tap stamps an entry as done, local notifications derived from the data, medication with a daily
schedule and "given", weight with a curve and a table, a diary and documents with photos, three
PDFs (for the vet, the dog sitter and a lost-dog poster) shared from the device, owner details, demo
data and "delete all data". Nothing here is presented as working before it is tested.

## Run it on your iPhone in under ten minutes

You need [Bun](https://bun.sh) 1.3.14, Node.js 24, a free Expo account and
[Expo Go](https://apps.apple.com/app/expo-go/id982107779) from the App Store (SDK 57). No Xcode, no
Apple developer account.

```sh
bun install
bunx expo login      # the same account you use in Expo Go
bun run start        # scan the QR code with the iPhone camera
```

Mac and iPhone must be on the same Wi-Fi.

## Web preview

A static export for visitors. It always starts fresh and stores nothing in the browser; the real app
runs on the phone, offline, with local notifications.

```sh
bun run export:web   # dist/ with Content Security Policy and .htaccess
bun run serve:web    # http://127.0.0.1:8095
```

## Checks

| Command | What it checks |
|---|---|
| `bun run verify` | format, file length (max. 400 lines), lint incl. the network ban, types, Jest, Expo SDK versions |
| `bun run test` | domain logic, repositories against sql.js, components with React Native Testing Library |
| `bun run test:e2e` | Playwright against the web export at 320, 768 and 1440 px: axe, font size ≥ 16 px, no horizontal scroll, keyboard, reduced motion, no third-party requests, CSP with a counter-test |

CI runs all of it on every push, plus a daily secret scan and dependency audit.

## Architecture in one paragraph

Expo SDK 57 (React Native 0.86) with Expo Router, TypeScript strict and Bun. Repository functions
take a Drizzle database as a parameter: `expo-sqlite` on the device, `sql.js` (SQLite as
WebAssembly, in memory) in the web preview and in tests, with the same schema and the same
migrations. TanStack Query sits on top, Zod validates at every boundary. The app contains no
network code; a lint rule and a browser test enforce that.

## Documentation

German, in `docs/`: [design](docs/DESIGN.md), [decisions](docs/ENTSCHEIDE.md),
[security](docs/SECURITY.md), [device test log](docs/GERAETETEST.md), [release](docs/RELEASE.md).

## Deliberately not built

| Not built | Why | Instead |
|---|---|---|
| Sync, server, accounts | does not fit five days; backend work is shown in other projects | fully offline; UUIDs as groundwork; household sync planned as milestone 2 |
| Backup and export | needs a server or a file format with its own privacy questions | the key facts as PDFs |
| Server push | no server; not available on Android in Expo Go anyway | local notifications derived from the data |
| Veterinary advice, symptom checker, chat assistant, food calculator | responsibility an app must not take; a cloud assistant costs money, needs a server and sends health data off the device | reminders for dates you enter yourself; a diary PDF for the vet |
| GPS walks | location data reveals the home address | photos are stored without location |
| QR tag for the collar | needs a public page with personal data | lost-dog poster as a PDF in one minute |
| Database encryption | SQLCipher does not run in Expo Go | device encryption and the device lock |
| Face ID app lock | protects hypothetical users only | the device lock |
| Home screen widgets | need native extensions, not available in Expo Go | "Up next" as the first screen |
| App Store, TestFlight, Play Store | Apple costs CHF 109 a year; Google needs 25 USD and a closed test with twelve people | web preview, APK, Expo Go |
| Native end-to-end tests in CI | emulator runs are slow and flaky; no iOS simulator without Xcode | unit and component tests, Playwright against the web export, a device test log |
| Crash reporting and analytics | third parties; no data should leave the device | error boundaries per route |
| French and Italian | scope | all UI texts in one place (`src/content`) |
| Offline web preview | it is a shop window; the product is the app | a notice in the preview |

## Licence

All rights reserved; see [LICENSE](LICENSE). The font Atkinson Hyperlegible Next is licensed under
the SIL Open Font License 1.1.
