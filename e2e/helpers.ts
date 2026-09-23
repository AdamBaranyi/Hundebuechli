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
/**
 * Öffnet die Vorschau leer: Ohne `leer` startet sie mit den Beispielhunden,
 * die Tests beginnen aber beim Erststart.
 */
export async function openScreen(page: Page, path: string, { demo = false } = {}) {
  await page.goto(demo ? path : `${path}${path.includes('?') ? '&' : '?'}leer`);
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
 * sichtbaren Fokus. Gibt zurück, was nicht erreichbar ist oder keinen
 * sichtbaren Fokus hat.
 */
export async function keyboardProblems(page: Page): Promise<string[]> {
  const total = await page.evaluate(() => {
    const selector = 'a[href], button, input, textarea, select, [tabindex]';
    const visible = (el: HTMLElement) =>
      el.tabIndex >= 0 &&
      el.offsetParent !== null &&
      el.getBoundingClientRect().width > 0 &&
      !el.closest('[aria-hidden="true"]') &&
      getComputedStyle(el).visibility !== 'hidden';
    const elements = [...document.querySelectorAll<HTMLElement>(selector)].filter(visible);
    elements.forEach((el, index) => el.setAttribute('data-tastatur', String(index)));
    return elements.length;
  });
  const reached = new Set<string>();
  const problems: string[] = [];
  for (let press = 0; press < total + 5 && reached.size < total; press += 1) {
    await page.keyboard.press('Tab');
    const state = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      const mark = el?.getAttribute('data-tastatur') ?? null;
      if (!el || mark === null) return { mark, name: '', visible: true };
      const style = getComputedStyle(el);
      const visible = style.outlineStyle !== 'none' || style.boxShadow !== 'none';
      return {
        mark,
        name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName,
        visible,
      };
    });
    if (state.mark === null || reached.has(state.mark)) continue;
    reached.add(state.mark);
    if (!state.visible) problems.push(`kein sichtbarer Fokus: ${state.name}`);
  }
  if (reached.size < total) {
    const missing = await page.evaluate(
      (seen) =>
        [...document.querySelectorAll<HTMLElement>('[data-tastatur]')]
          .filter((el) => !seen.includes(el.getAttribute('data-tastatur') ?? ''))
          .map((el) => el.getAttribute('aria-label') ?? el.textContent?.trim() ?? el.tagName),
      [...reached],
    );
    problems.push(...missing.map((name) => `per Tab nicht erreichbar: ${name}`));
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
