/// <reference types="node" />
import type { Page } from '@playwright/test';

/**
 * Prüfhilfen für jeden Bildschirm der Web-Vorschau. Übernommen aus den Tests
 * des Gestaltungsentwurfs und ergänzt um Netz, CSP und Speicher.
 */

export type Observations = {
  errors: string[];
  foreignRequests: string[];
};

/**
 * Beobachtet die Seite von Anfang an: Fehler in der Konsole, Anfragen an
 * fremde Adressen und CSP-Verstösse (gesammelt im Fenster, siehe
 * cspViolations).
 */
export async function observe(page: Page, origin: string): Promise<Observations> {
  const seen: Observations = { errors: [], foreignRequests: [] };
  page.on('pageerror', (error) => seen.errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') seen.errors.push(message.text());
  });
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:')) {
      seen.foreignRequests.push(url);
    }
  });
  await page.addInitScript(() => {
    const store: string[] = [];
    Object.defineProperty(window, '__cspViolations', { value: store });
    document.addEventListener('securitypolicyviolation', (event) => {
      store.push(`${event.violatedDirective}: ${event.blockedURI || 'inline'}`);
    });
  });
  return seen;
}

export function cspViolations(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);
}

/** Öffnet einen Bildschirm und wartet, bis App, Datenbank und Schrift bereit sind. */
export async function openScreen(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole('heading', { level: 1 }).first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}

/** Sichtbare Texte kleiner als 16 px. */
export function smallText(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const found: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      const hasText = [...el.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0,
      );
      if (!hasText || el.closest('script, style, title, noscript')) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const size = parseFloat(style.fontSize);
      if (size < 16)
        found.push(
          `${el.tagName.toLowerCase()} «${el.textContent?.trim().slice(0, 30)}» ${size}px`,
        );
    }
    return found;
  });
}

/** Bedienelemente mit weniger als 48 × 48 Pixeln Tippfläche. */
export function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const found: string[] = [];
    const selector = 'a[href], button, input, textarea, select, [role="button"], [tabindex="0"]';
    for (const el of document.querySelectorAll(selector)) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.width < 48 || rect.height < 48) {
        const name = el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30);
        found.push(
          `${el.tagName.toLowerCase()} «${name}» ${Math.round(rect.width)}×${Math.round(rect.height)}`,
        );
      }
    }
    return found;
  });
}

/** Wie weit die Seite breiter ist als das Fenster; mehr als 0 heisst Querscrollen. */
export function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

/**
 * Tab erreicht jedes sichtbare Bedienelement, und jedes zeigt einen
 * sichtbaren Fokus. Gibt die Elemente zurück, bei denen das nicht so ist.
 */
export async function keyboardProblems(page: Page): Promise<string[]> {
  const focusable = await page.evaluate(
    () =>
      [
        ...document.querySelectorAll<HTMLElement>(
          'a[href], button, input, textarea, select, [tabindex]',
        ),
      ].filter((el) => el.tabIndex >= 0 && el.getBoundingClientRect().width > 0).length,
  );
  const problems: string[] = [];
  for (let i = 0; i < focusable; i += 1) {
    await page.keyboard.press('Tab');
    const state = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return { name: 'nichts', visible: false };
      const style = getComputedStyle(el);
      const visible = style.outlineStyle !== 'none' || style.boxShadow !== 'none';
      return {
        name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName,
        visible,
      };
    });
    if (!state.visible) problems.push(`kein sichtbarer Fokus: ${state.name}`);
  }
  return problems;
}

/** Was die Seite im Browser hinterlässt: Die Vorschau speichert nichts. */
export function storedData(page: Page) {
  return page.evaluate(async () => ({
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookies: document.cookie,
    indexedDb: (await indexedDB.databases()).map((db) => db.name),
  }));
}
