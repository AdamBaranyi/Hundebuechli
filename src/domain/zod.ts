import { z } from 'zod';

/**
 * Zod nur über dieses Modul. Zod baut schnelle Parser mit `new Function` und
 * probiert das schon beim Anlegen eines Schemas aus. Die CSP der Web-Vorschau
 * verbietet eval; der Versuch würde blockiert und als Verstoss gemeldet. Die
 * Einstellung muss darum vor jedem Schema stehen – das stellt dieser Import
 * sicher, und ESLint verbietet den direkten Import von 'zod'.
 */
z.config({ jitless: true });

export { z };
