import { attachments, dogs, owner, reminders, settings } from '../schema';
import type { Db } from '../types';

/**
 * «Alle Daten löschen»: jeder Hund mit allem, was an ihm hängt (die
 * Fremdschlüssel löschen mit), dazu Halterangaben, eigene Erinnerungen und
 * Einstellungen. Zurück kommen die Pfade aller Fotos, damit auch die Dateien
 * verschwinden. Die geplanten Benachrichtigungen räumt der nächste Abgleich
 * weg: Ohne Daten plant er nichts mehr.
 */
export function deleteEverything(db: Db): { attachmentPaths: string[] } {
  return db.transaction((tx) => {
    const attachmentPaths = tx
      .select({ path: attachments.path })
      .from(attachments)
      .all()
      .map((row) => row.path);
    tx.delete(attachments).run();
    tx.delete(reminders).run();
    tx.delete(dogs).run();
    tx.delete(owner).run();
    tx.delete(settings).run();
    return { attachmentPaths };
  });
}
