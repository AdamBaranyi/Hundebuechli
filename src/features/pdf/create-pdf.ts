import { useMutation } from '@tanstack/react-query';

import { dogsText } from '@/content/dogs';
import { formatLocal } from '@/content/format';
import { pdfText } from '@/content/pdf';
import { useDb } from '@/db/DatabaseProvider';
import { dogPhoto } from '@/db/repositories/attachments';
import { getDog } from '@/db/repositories/dogs';
import type { Db } from '@/db/types';
import { formatChipNumber } from '@/domain/chip';
import type { LocalDate } from '@/domain/local-date';
import { photoStore } from '@/files/photo-store';
import { collectSitter, collectVet, diaryStart, type ReadPhoto } from '@/pdf/collect';
import type { PdfFonts } from '@/pdf/document';
import { pdfFileName } from '@/pdf/filename';
import { loadPdfFonts, sharePdf } from '@/pdf/share';
import { posterPdf, sitterPdf, vetPdf } from '@/pdf/templates';

export type PdfKind = 'vet' | 'sitter' | 'poster';

export type PosterDetails = { place: string; date: LocalDate; minute: number; phone: string };

export type PdfRequest =
  | { kind: 'vet'; dogId: string; today: LocalDate; diaryDays: number }
  | { kind: 'sitter'; dogId: string; today: LocalDate }
  | { kind: 'poster'; dogId: string; today: LocalDate; details: PosterDetails };

const readPhoto: ReadPhoto = async (path) => {
  try {
    return await photoStore.readBase64(path);
  } catch {
    // Ein fehlendes Foto soll das ganze PDF nicht verhindern.
    return null;
  }
};

/** Baut das HTML einer Vorlage; getrennt vom Teilen, damit es sich prüfen lässt. */
export async function buildPdfHtml(
  db: Db,
  request: PdfRequest,
  fonts: PdfFonts,
  read: ReadPhoto = readPhoto,
): Promise<string | null> {
  const common = { footer: pdfText.footer(formatLocal.long(request.today)), fonts };
  if (request.kind === 'vet') {
    const from = diaryStart(request.today, request.diaryDays);
    const data = await collectVet(db, request.dogId, request.today, from, read);
    return data ? vetPdf(data, common) : null;
  }
  if (request.kind === 'sitter') {
    const data = await collectSitter(db, request.dogId, request.today, read);
    return data ? sitterPdf(data, common) : null;
  }
  const dog = getDog(db, request.dogId);
  if (!dog) return null;
  const photo = dogPhoto(db, dog.id);
  const { place, date, minute, phone } = request.details;
  return posterPdf(
    {
      name: dog.name,
      photo: photo ? await read(photo.path) : null,
      description: [
        [dog.breed, dog.sex ? dogsText.sex[dog.sex] : null].filter(Boolean).join(', '),
        dog.colorMarkings ?? '',
      ].filter(Boolean),
      chip: dog.chipNumber ? formatChipNumber(dog.chipNumber) : null,
      lastSeen: pdfText.poster.lastSeenText(
        place,
        formatLocal.long(date),
        formatLocal.time(minute),
      ),
      phone,
    },
    common,
  );
}

/** Erstellt das PDF und öffnet das Teilen-Blatt. */
export function useCreatePdf() {
  const db = useDb();
  return useMutation({
    mutationFn: async (request: PdfRequest) => {
      const html = await buildPdfHtml(db, request, await loadPdfFonts());
      if (!html) throw new Error('Hund nicht gefunden');
      const dog = getDog(db, request.dogId);
      await sharePdf(
        html,
        pdfFileName(dog?.name ?? '', pdfText.fileKinds[request.kind], request.today),
      );
    },
  });
}
