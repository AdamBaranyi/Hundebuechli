import { sql } from 'drizzle-orm';

import { clearOwner, getOwner, saveOwner } from '../repositories/owner';
import { getSettings, updateSettings } from '../repositories/settings';
import { createTestDb } from '../testing';
import type { Db } from '../types';

describe('Repository Einstellungen', () => {
  let db: Db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('liefert die Vorgaben, solange nichts eingestellt ist', () => {
    expect(getSettings(db)).toEqual({ reminderMinute: 480, defaultLeadDays: 7, demoLoaded: false });
  });

  it('speichert Änderungen und behält den Rest', () => {
    updateSettings(db, { reminderMinute: 450 });
    updateSettings(db, { defaultLeadDays: 3 });
    expect(getSettings(db)).toEqual({ reminderMinute: 450, defaultLeadDays: 3, demoLoaded: false });
  });

  it('weist Uhrzeiten ausserhalb des Tages ab', () => {
    expect(() => updateSettings(db, { reminderMinute: 1440 })).toThrow();
    expect(getSettings(db).reminderMinute).toBe(480);
  });

  it('hat genau eine Zeile; eine zweite lässt die Datenbank nicht zu', () => {
    updateSettings(db, { demoLoaded: true });
    expect(() =>
      db.run(
        sql`INSERT INTO settings (id, reminder_minute, default_lead_days, created_at, updated_at) VALUES ('11111111-1111-4111-8111-111111111111', 480, 7, 'x', 'x')`,
      ),
    ).toThrow();
    expect(db.all(sql`SELECT id FROM settings`)).toHaveLength(1);
  });
});

describe('Repository Halterangaben', () => {
  let db: Db;

  beforeEach(async () => {
    db = await createTestDb();
  });

  it('ist leer, bis jemand etwas einträgt', () => {
    expect(getOwner(db)).toBeNull();
  });

  it('speichert, ändert und löscht die Angaben', () => {
    saveOwner(db, { name: 'Muster', phone: '000 000 00 00', email: '' });
    const changed = saveOwner(db, { name: 'Muster', phone: '000 000 00 01' });
    expect(changed).toMatchObject({ name: 'Muster', phone: '000 000 00 01', email: null });
    expect(db.all(sql`SELECT id FROM owner`)).toHaveLength(1);
    clearOwner(db);
    expect(getOwner(db)).toBeNull();
  });

  it('weist eine ungültige E-Mail-Adresse ab', () => {
    expect(() => saveOwner(db, { name: 'Muster', email: 'keine-adresse' })).toThrow(
      'email_invalid',
    );
  });
});
