/**
 * Prüft die Berechtigungen einer fertigen APK gegen die Liste in
 * scripts/android-permissions.txt. Erst in der APK sind die Manifeste aller
 * Bibliotheken zusammengeführt – vorher sieht man nicht, was eine Bibliothek
 * still mitbringt. Aufruf: node scripts/apk-permissions.mjs <app.apk>
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Liest «uses-permission: name='…'» aus der Ausgabe von aapt2 dump permissions. */
export function parsePermissions(output) {
  return [...output.matchAll(/uses-permission(?:-sdk-23)?: name='([^']+)'/g)]
    .map((match) => match[1])
    .filter((name, index, all) => all.indexOf(name) === index)
    .sort();
}

/** Die erlaubte Liste: eine Berechtigung je Zeile, # leitet Kommentare ein. */
export function parseAllowed(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean);
}

/** Was zu viel ist; `*` am Ende erlaubt einen Präfix wie die eigene Paket-ID. */
export function unexpected(found, allowed) {
  return found.filter(
    (name) =>
      !allowed.some((rule) =>
        rule.endsWith('*') ? name.startsWith(rule.slice(0, -1)) : name === rule,
      ),
  );
}

function aapt2() {
  const home = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
  if (!home) throw new Error('ANDROID_HOME fehlt');
  const versions = readdirSync(join(home, 'build-tools')).sort();
  const latest = versions.at(-1);
  if (!latest) throw new Error('Keine build-tools gefunden');
  return join(home, 'build-tools', latest, 'aapt2');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const apk = process.argv[2];
  if (!apk) throw new Error('Aufruf: node scripts/apk-permissions.mjs <app.apk>');
  const output = execFileSync(aapt2(), ['dump', 'permissions', apk], { encoding: 'utf8' });
  const found = parsePermissions(output);
  const allowedFile = join(fileURLToPath(new URL('.', import.meta.url)), 'android-permissions.txt');
  const extra = unexpected(found, parseAllowed(readFileSync(allowedFile, 'utf8')));
  // Alles auf die Standardausgabe: Gemischt mit der Fehlerausgabe wäre die
  // Reihenfolge im Protokoll des Workflows nicht mehr lesbar.
  const list = (names) => names.map((name) => `  ${name}`).join('\n');
  console.log(`Berechtigungen in der APK:\n${list(found)}`);
  if (extra.length > 0) {
    console.log(`\nNicht auf der Liste:\n${list(extra)}`);
    process.exitCode = 1;
  } else {
    console.log('\nAlle auf der Liste.');
  }
}
