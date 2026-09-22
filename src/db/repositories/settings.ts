import { eq } from 'drizzle-orm';

import { DEFAULT_SETTINGS, type SettingsPatch, settingsPatchSchema } from '@/domain/settings';

import { settings } from '../schema';
import { SINGLETON_ID } from '../singleton';
import { nowUtc } from '../time';
import type { Db } from '../types';

export type Settings = {
  reminderMinute: number;
  defaultLeadDays: number;
  demoLoaded: boolean;
};

/** Die Einstellungen; fehlt die Zeile noch, gelten die Vorgaben. */
export function getSettings(db: Db): Settings {
  const row = db.select().from(settings).where(eq(settings.id, SINGLETON_ID)).get();
  if (!row) return { ...DEFAULT_SETTINGS };
  return {
    reminderMinute: row.reminderMinute,
    defaultLeadDays: row.defaultLeadDays,
    demoLoaded: row.demoLoaded,
  };
}

export function updateSettings(db: Db, patch: SettingsPatch): Settings {
  const next = { ...getSettings(db), ...settingsPatchSchema.parse(patch) };
  const stamp = nowUtc();
  db.insert(settings)
    .values({ id: SINGLETON_ID, ...next, createdAt: stamp, updatedAt: stamp })
    .onConflictDoUpdate({ target: settings.id, set: { ...next, updatedAt: stamp } })
    .run();
  return next;
}
