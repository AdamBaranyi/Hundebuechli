/**
 * Eigene Linien-Symbole aus dem Entwurf (js/icons.js): 24er-Raster, Strich 2,
 * runde Enden. Keine Pfoten, keine Knochen. Nur Daten, gezeichnet von Icon.tsx.
 */

export type IconShape =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | {
      kind: 'rect';
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      transform?: string;
    };

const path = (d: string): IconShape => ({ kind: 'path', d });
const circle = (cx: number, cy: number, r: number): IconShape => ({ kind: 'circle', cx, cy, r });

export const ICON_SHAPES = {
  stamp: [
    circle(12, 5, 2.5),
    path('M10.6 7.2 9.5 11h5l-1.1-3.8'),
    { kind: 'rect', x: 5, y: 11, width: 14, height: 4, rx: 1 },
    path('M5 19h14'),
  ],
  tag: [circle(12, 14, 6.5), circle(12, 4.5, 1.8), path('M12 6.3v1.2')],
  sliders: [
    path('M4 7h9M17 7h3'),
    circle(15, 7, 2),
    path('M4 12h3M11 12h9'),
    circle(9, 12, 2),
    path('M4 17h11M19 17h1'),
    circle(17, 17, 2),
  ],
  syringe: [
    path('m14.5 5.5 4 4-9 9h-4v-4z'),
    path('M5.5 18.5 2.5 21.5M16.5 3.5l4 4M18.5 5.5l2-2M11 9l2 2M8.5 11.5l2 2'),
  ],
  // Tablette schräg von oben, mit Kante und Bruchkerbe. Ein Kreis mit Strich
  // liest sich als Verbotszeichen, auch wenn der Strich kurz ist.
  pill: [
    path('M4 10.5a8 4 0 1 0 16 0a8 4 0 1 0 -16 0'),
    path('M4 10.5v3c0 2.2 3.6 4 8 4s8-1.8 8-4v-3'),
    path('M9.5 10.5h5'),
  ],
  shield: [
    path('M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6z'),
    path('M12 8.5c1.6 2 2.5 3.4 2.5 4.6a2.5 2.5 0 0 1-5 0c0-1.2.9-2.6 2.5-4.6z'),
  ],
  stethoscope: [
    path('M6 3v5a4 4 0 0 0 8 0V3M5 3h2M13 3h2'),
    path('M10 12v2a5 5 0 0 0 10 0v-1'),
    circle(20, 11, 2),
  ],
  capsule: [
    { kind: 'rect', x: 3.5, y: 8.5, width: 17, height: 7, rx: 3.5, transform: 'rotate(-45 12 12)' },
    path('m9.5 9.5 5 5'),
  ],
  scale: [
    { kind: 'rect', x: 4, y: 4, width: 16, height: 16, rx: 4 },
    path('M8.5 9.5a5 5 0 0 1 7 0M12 10l1.4-1.8'),
  ],
  notebook: [
    path('M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z'),
    path('M9 3v18M12.5 8h3.5M12.5 12h3.5'),
  ],
  document: [
    path('M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'),
    path('M14 3v5h5M8.5 13h7M8.5 16.5h5'),
  ],
  share: [
    path('M12 3v12M8 7l4-4 4 4'),
    path('M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1'),
  ],
  bell: [path('M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z'), path('M10 20.5a2 2 0 0 0 4 0')],
  phone: [
    path(
      'M6.6 3.5h2.6l1.5 4-2 1.3a11 11 0 0 0 6.5 6.5l1.3-2 4 1.5v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z',
    ),
  ],
  copy: [
    { kind: 'rect', x: 8, y: 8, width: 12, height: 12, rx: 2.5 },
    path('M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2'),
  ],
  chevronRight: [path('m9 5 7 7-7 7')],
  chevronLeft: [path('m15 5-7 7 7 7')],
  plus: [path('M12 5v14M5 12h14')],
  trash: [
    path('M5 7h14M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7'),
    path('M6.5 7l.8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7'),
  ],
  check: [path('m5 12.5 4.5 4.5L19 7.5')],
  alert: [circle(12, 12, 9), path('M12 7.5V13M12 16.6v.1')],
  info: [circle(12, 12, 9), path('M12 11v6M12 7.5v.1')],
  allDogs: [
    circle(8.5, 9, 2.5),
    circle(15.5, 9, 2.5),
    path(
      'M4 18c.6-2.3 2.3-3.5 4.5-3.5s3.9 1.2 4.5 3.5M11 18c.6-2.3 2.3-3.5 4.5-3.5s3.9 1.2 4.5 3.5',
    ),
  ],
  camera: [
    path('M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z'),
    circle(12, 13.5, 3.5),
  ],
  calendar: [
    { kind: 'rect', x: 4, y: 5, width: 16, height: 15, rx: 2.5 },
    path('M4 10h16M9 3v4M15 3v4'),
  ],
} satisfies Record<string, IconShape[]>;

export type IconName = keyof typeof ICON_SHAPES;
