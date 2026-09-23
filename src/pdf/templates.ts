import { pdfText } from '@/content/pdf';

import { type PdfFonts, pdfDocument } from './document';
import { esc, escLines, imageSource } from './escape';
import type {
  PdfDog,
  PdfFact,
  PdfMedication,
  PosterPdfData,
  SitterPdfData,
  VetPdfData,
} from './types';

/*
 * Die drei Vorlagen. Jede Zeichenkette aus den Daten geht durch `esc`; Fotos
 * nur über `imageSource`, das nichts anderes als eingebettetes JPEG zulässt.
 */

type Common = { footer: string; fonts: PdfFonts };

function facts(list: readonly PdfFact[]): string {
  if (list.length === 0) return '';
  const rows = list.map((fact) => `<dt>${esc(fact.label)}</dt><dd>${escLines(fact.value)}</dd>`);
  return `<dl>${rows.join('')}</dl>`;
}

function photo(base64: string | null, alt: string, className: string): string {
  const source = imageSource(base64);
  return source ? `<img class="${className}" src="${source}" alt="${esc(alt)}">` : '';
}

function header(dog: PdfDog, title: string): string {
  return `<div class="keep head">
  ${photo(dog.photo, dog.name, 'portrait')}
  <div><h1>${esc(dog.name)}</h1><p class="meta">${esc(title)}</p>
  <p>${esc(dog.subtitle)}</p></div>
</div>`;
}

function medicationList(list: readonly PdfMedication[], empty: string): string {
  if (list.length === 0) return `<p class="meta">${esc(empty)}</p>`;
  const rows = list.map(
    (m) => `<tr><td><strong>${esc(m.name)}</strong></td><td>${esc(m.detail)}</td></tr>`,
  );
  return `<table><tbody>${rows.join('')}</tbody></table>`;
}

function table(columns: readonly string[], rows: readonly string[][], numeric: number[] = []) {
  const cell = (tag: 'th' | 'td', value: string, index: number) =>
    `<${tag}${numeric.includes(index) ? ' class="number"' : ''}>${esc(value)}</${tag}>`;
  return `<table><thead><tr>${columns.map((c, i) => cell('th', c, i)).join('')}</tr></thead>
<tbody>${rows.map((row) => `<tr>${row.map((v, i) => cell('td', v, i)).join('')}</tr>`).join('')}</tbody></table>`;
}

export function vetPdf(data: VetPdfData, common: Common): string {
  const t = pdfText.vet;
  const health =
    data.health.length === 0
      ? `<p class="meta">${esc(t.noHealth)}</p>`
      : table(
          [t.columns.kind, t.columns.date, t.columns.product, t.columns.next],
          data.health.map((row) => [row.kind, row.date, row.product, row.next]),
        );
  const weights =
    data.weights.length === 0
      ? `<p class="meta">${esc(t.noWeight)}</p>`
      : `${data.weightCurve ?? ''}${table(
          [t.weightColumns.date, t.weightColumns.weight, t.weightColumns.difference],
          data.weights.map((row) => [row.date, row.weight, row.difference]),
          [1, 2],
        )}`;
  const diary =
    data.diary.length === 0
      ? `<p class="meta">${esc(t.noDiary)}</p>`
      : data.diary
          .map(
            (entry) => `<div class="keep entry">
  <p><strong>${esc(entry.category)}</strong> <span class="meta">${esc(entry.when)}</span></p>
  <p>${escLines(entry.text)}</p>
  ${entry.photos.map((p) => photo(p, entry.category, 'entry-photo')).join('')}
</div>`,
          )
          .join('');
  const body = `${header(data.dog, t.title(data.dog.name))}
<h2>${esc(t.profile)}</h2>${facts(data.dog.facts)}
<h2>${esc(t.medications)}</h2>${medicationList(data.medications, t.noMedications)}
<h2>${esc(t.health)}</h2>${health}
<h2>${esc(t.weight)}</h2>${weights}
<h2>${esc(t.diary)}</h2><p class="meta">${esc(data.diaryPeriod)}</p>${diary}`;
  return pdfDocument({ title: t.title(data.dog.name), body, ...common });
}

function block(title: string, content: string | null, empty: string): string {
  const inner = content ? `<p>${escLines(content)}</p>` : `<p class="meta">${esc(empty)}</p>`;
  return `<div class="keep"><h2>${esc(title)}</h2>${inner}</div>`;
}

export function sitterPdf(data: SitterPdfData, common: Common): string {
  const t = pdfText.sitter;
  // Grosse Schrift: Das Blatt liegt auf der Küchenablage, nicht vor dem Bildschirm.
  const body = `<div class="sitter">
${header(data.dog, t.title(data.dog.name))}
${block(t.food, data.food, t.nothing)}
<div class="keep"><h2>${esc(t.medications)}</h2>${medicationList(data.medications, t.nothing)}</div>
${block(t.care, data.care, t.nothing)}
${block(t.allergies, data.allergies, t.nothing)}
<div class="keep"><h2>${esc(t.vet)}</h2>${data.vet.length > 0 ? facts(data.vet) : `<p class="meta">${esc(t.nothing)}</p>`}</div>
${data.owner.length > 0 ? `<div class="keep"><h2>${esc(t.owner)}</h2>${facts(data.owner)}</div>` : ''}
</div>`;
  return pdfDocument({ title: t.title(data.dog.name), body, ...common });
}

export function posterPdf(data: PosterPdfData, common: Common): string {
  const t = pdfText.poster;
  const strips = Array.from(
    { length: 8 },
    () =>
      `<div class="strip"><strong>${esc(data.phone)}</strong><br>${esc(t.strip(data.name))}</div>`,
  ).join('');
  const body = `<div class="poster">
  <p class="shout"><strong>${esc(t.heading)}</strong></p>
  ${photo(data.photo, data.name, 'poster-photo')}
  <h1>${esc(data.name)}</h1>
  ${data.description.map((line) => `<p class="poster-line">${esc(line)}</p>`).join('')}
  ${data.chip ? `<p class="poster-chip">${esc(t.chip)}: <strong>${esc(data.chip)}</strong></p>` : ''}
  <p class="poster-seen">${esc(t.lastSeen)}: <strong>${esc(data.lastSeen)}</strong></p>
  <p class="poster-call">${esc(t.call)} <strong>${esc(data.phone)}</strong></p>
</div>
<div class="keep strips">${strips}</div>`;
  return pdfDocument({ title: `${t.heading}: ${data.name}`, body, ...common });
}
