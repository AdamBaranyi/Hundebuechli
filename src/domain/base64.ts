/**
 * Base64 in Bytes und zurück, ohne atob und btoa: Beides gibt es nicht in
 * jeder Umgebung gleich, und die Fotoprüfung soll überall dieselbe sein.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Map([...ALPHABET].map((char, index) => [char, index]));

export function base64ToBytes(input: string): Uint8Array {
  const clean = input.replace(/[\s=]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let index = 0;
  for (const char of clean) {
    const value = LOOKUP.get(char);
    if (value === undefined) throw new Error('Kein gültiges Base64');
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[index] = (buffer >> bits) & 0xff;
      index += 1;
    }
  }
  return bytes.subarray(0, index);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a = 0, b = 0, c = 0] = [bytes[i], bytes[i + 1], bytes[i + 2]];
    const triple = (a << 16) | (b << 8) | c;
    output += ALPHABET[(triple >> 18) & 63];
    output += ALPHABET[(triple >> 12) & 63];
    output += i + 1 < bytes.length ? ALPHABET[(triple >> 6) & 63] : '=';
    output += i + 2 < bytes.length ? ALPHABET[triple & 63] : '=';
  }
  return output;
}
