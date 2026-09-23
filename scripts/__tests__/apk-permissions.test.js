/**
 * @jest-environment node
 */
const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { pathToFileURL } = require('node:url');

const MODULE = pathToFileURL(join(__dirname, '..', 'apk-permissions.mjs')).href;

/** Ruft eine Funktion des ESM-Skripts in einem eigenen Node-Prozess auf; Jest lädt kein ESM. */
function call(name, ...args) {
  const code = `import * as m from '${MODULE}'; const args = JSON.parse(process.argv[1]);
process.stdout.write(JSON.stringify(m.${name}(...args)));`;
  const result = spawnSync('node', ['--input-type=module', '-e', code, JSON.stringify(args)], {
    encoding: 'utf8',
  });
  if (result.status !== 0) throw new Error(result.stderr);
  return JSON.parse(result.stdout);
}

const OUTPUT = `package: xyz.adambaranyi.hundebuechli
uses-permission: name='android.permission.CAMERA'
uses-permission: name='android.permission.POST_NOTIFICATIONS'
uses-permission: name='android.permission.INTERNET'
uses-permission-sdk-23: name='android.permission.VIBRATE'
uses-permission: name='xyz.adambaranyi.hundebuechli.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
permission: xyz.adambaranyi.hundebuechli.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
`;

describe('Berechtigungen der APK', () => {
  it('liest die verlangten Berechtigungen aus der Ausgabe von aapt2', () => {
    expect(call('parsePermissions', OUTPUT)).toEqual([
      'android.permission.CAMERA',
      'android.permission.INTERNET',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'xyz.adambaranyi.hundebuechli.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION',
    ]);
  });

  it('meldet, was nicht auf der Liste steht – etwa INTERNET', () => {
    const allowed = call(
      'parseAllowed',
      `# Kommentar
android.permission.CAMERA   # Foto
android.permission.POST_NOTIFICATIONS
android.permission.VIBRATE
xyz.adambaranyi.hundebuechli.*`,
    );
    expect(call('unexpected', call('parsePermissions', OUTPUT), allowed)).toEqual([
      'android.permission.INTERNET',
    ]);
  });

  it('lässt auf der echten Liste weder INTERNET noch das Mikrofon zu', () => {
    const text = readFileSync(join(__dirname, '..', 'android-permissions.txt'), 'utf8');
    const allowed = call('parseAllowed', text);
    expect(allowed).not.toContain('android.permission.INTERNET');
    expect(allowed).not.toContain('android.permission.RECORD_AUDIO');
    expect(allowed).toContain('android.permission.POST_NOTIFICATIONS');
  });
});
