import { base64ToBytes, bytesToBase64 } from '../base64';

describe('Base64', () => {
  it.each(['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar', 'Bäri 756'])(
    'hin und zurück für «%s» wie Node',
    (text) => {
      const bytes = new Uint8Array(Buffer.from(text, 'utf8'));
      const encoded = bytesToBase64(bytes);
      expect(encoded).toBe(Buffer.from(bytes).toString('base64'));
      expect([...base64ToBytes(encoded)]).toEqual([...bytes]);
    },
  );

  it('verträgt Zeilenumbrüche und weist fremde Zeichen ab', () => {
    expect([...base64ToBytes('Zm9v\nYmFy')]).toEqual([...Buffer.from('foobar')]);
    expect(() => base64ToBytes('Zm9v*')).toThrow('Kein gültiges Base64');
  });
});
