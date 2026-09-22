/// <reference types="node" />
import { AxeBuilder } from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

import {
  cspViolations,
  horizontalOverflow,
  type Observations,
  smallTargets,
  smallText,
} from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Was auf jedem Bildschirm gilt: kein Querscrollen, keine Schrift unter 16 px,
 * Tippflächen ab 48, axe ohne Befund, keine Anfragen an Dritte, keine
 * CSP-Verstösse, keine Fehler in der Konsole.
 */
export async function expectScreenQuality(page: Page, seen: Observations, screen: string) {
  expect(await horizontalOverflow(page), `${screen}: kein Querscrollen`).toBeLessThanOrEqual(0);
  expect(await smallText(page), `${screen}: keine Schrift unter 16 px`).toEqual([]);
  expect(await smallTargets(page), `${screen}: Tippflächen ab 48 × 48`).toEqual([]);
  const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(
    axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    `${screen}: axe ohne Befund`,
  ).toEqual([]);
  expect(seen.foreignRequests, `${screen}: keine Anfragen an Dritte`).toEqual([]);
  expect(await cspViolations(page), `${screen}: keine CSP-Verstösse`).toEqual([]);
  expect(seen.errors, `${screen}: keine Fehler in der Konsole`).toEqual([]);
}
