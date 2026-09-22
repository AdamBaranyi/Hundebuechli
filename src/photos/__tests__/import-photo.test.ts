/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { importPhoto, type PhotoDeps, resizeTarget, UnsafePhotoError } from '../import-photo';

const fixtureBase64 = (name: string) =>
  readFileSync(join(__dirname, '..', '..', 'domain', '__fixtures__', name)).toString('base64');

function fakeDeps(base64: string) {
  const saved: Uint8Array[] = [];
  const reencode = jest.fn<ReturnType<PhotoDeps['reencode']>, Parameters<PhotoDeps['reencode']>>(
    async () => ({ base64, width: 64, height: 48 }),
  );
  const deps: PhotoDeps = {
    reencode,
    sha256: async () => 'prüfsumme',
    store: {
      save: async (bytes) => {
        saved.push(bytes);
        return 'photos/00000000-0000-4000-8000-000000000002.jpg';
      },
    },
  };
  return { deps, saved, reencode };
}

const PICKED = { uri: 'file:///tmp/bild.heic', width: 4032, height: 3024 };

describe('Foto importieren', () => {
  it('speichert ein neu kodiertes Foto ohne Metadaten', async () => {
    const { deps, saved } = fakeDeps(fixtureBase64('ohne-exif.jpg'));
    const stored = await importPhoto(PICKED, deps);
    expect(stored).toEqual({
      path: 'photos/00000000-0000-4000-8000-000000000002.jpg',
      sha256: 'prüfsumme',
      width: 64,
      height: 48,
    });
    expect(saved).toHaveLength(1);
  });

  it.each(['mit-gps.jpg', 'mit-xmp.jpg'])(
    'verwirft %s nach dem Neukodieren und speichert nichts',
    async (name) => {
      const { deps, saved } = fakeDeps(fixtureBase64(name));
      await expect(importPhoto(PICKED, deps)).rejects.toBeInstanceOf(UnsafePhotoError);
      expect(saved).toEqual([]);
    },
  );

  it('verkleinert auf höchstens 1200 Pixel an der längsten Seite', async () => {
    const { deps, reencode } = fakeDeps(fixtureBase64('ohne-exif.jpg'));
    await importPhoto(PICKED, deps);
    expect(reencode).toHaveBeenCalledWith(PICKED.uri, { width: 1200, height: null });
  });
});

describe('Zielgrösse', () => {
  it('richtet sich nach der längsten Seite und vergrössert nie', () => {
    expect(resizeTarget({ uri: '', width: 4032, height: 3024 }, 1200)).toEqual({
      width: 1200,
      height: null,
    });
    expect(resizeTarget({ uri: '', width: 3024, height: 4032 }, 1200)).toEqual({
      width: null,
      height: 1200,
    });
    expect(resizeTarget({ uri: '', width: 800, height: 600 }, 1200)).toBeNull();
    expect(resizeTarget({ uri: '', width: 0, height: 0 }, 1200)).toBeNull();
  });
});
