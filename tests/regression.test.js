/**
 * TRACE - Zeit- & Kommunikations-Engine (WAMOCON) — Regression Tests
 *
 * Zweck: Sicherstellen, dass kritische Inhalte, Strukturen und Links
 * nach jeder Änderung korrekt erhalten bleiben.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

// ── 1. Pflichtdateien vorhanden ─────────────────────────────────────────────
describe('Pflichtdateien', () => {
  test.each([
    'index.html',
    'style.css',
    'script.js',
    'favicon.png',
    'agb.html',
    'datenschutz.html',
    'impressum.html',
    '.gitignore',
  ])('%s ist vorhanden', (file) => {
    expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
  });
});

// ── 2. Keine Legacy-Inhalte (Regression gegen alten Content) ──────────────
describe('Keine Legacy-Inhalte (LFA / IHK / legacy)', () => {
  const files = ['index.html', 'style.css', 'script.js'];
  const banned = [
    { pattern: /\bLFA\b/,      label: 'LFA'         },
    { pattern: /\bIHK\b/,      label: 'IHK'         },
    { pattern: /\bFIAE\b/,     label: 'FIAE'         },
    { pattern: /plan-IT/i,     label: 'legacy branding' },
  ];

  files.forEach((file) => {
    banned.forEach(({ pattern, label }) => {
      test(`${file}: enthält kein "${label}"`, () => {
        expect(read(file)).not.toMatch(pattern);
      });
    });
  });
});

// ── 3. index.html: Pflicht-Sektionen vorhanden ──────────────────────────────
describe('index.html: Pflicht-Sektionen vorhanden', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test.each([
    'hero', 'problem', 'roadmap',
    'rollen', 'funktionen', 'wizard',
    'demo', 'architektur', 'team', 'footer',
  ])('id="%s" vorhanden', (id) => {
    expect(html).toContain(`id="${id}"`);
  });
});

// ── 4. index.html: Navigation & Branding ────────────────────────────────────
describe('index.html: Navigation & Branding', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('favicon.png im <head> verlinkt', () => {
    expect(html).toMatch(/href="favicon\.png"/);
  });

  test('Markenname "TRACE" vorhanden', () => {
    expect(html).toContain('TRACE');
  });

  test('Entwickelt in Deutschland Badge vorhanden', () => {
    expect(html).toContain('Entwickelt in Deutschland');
  });
});

// ── 5. index.html: Meta-Tags ─────────────────────────────────────────────────
describe('index.html: Meta-Tags', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('charset deklariert', () => {
    expect(html.toLowerCase()).toMatch(/charset/);
  });

  test('viewport Meta-Tag vorhanden', () => {
    expect(html).toContain('name="viewport"');
  });

  test('description Meta-Tag vorhanden', () => {
    expect(html).toContain('name="description"');
  });
});

// ── 6. index.html: SVG-Sprite Symbole ────────────────────────────────────────
describe('index.html: SVG-Sprite Symbole', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('alle verwendeten <use href="#i-..."> Symbole sind definiert', () => {
    const used     = [...html.matchAll(/href="#(i-[^"]+)"/g)].map((m) => m[1]);
    const defined  = new Set([...html.matchAll(/id="(i-[^"]+)"/g)].map((m) => m[1]));
    const missing  = [...new Set(used)].filter((s) => !defined.has(s));
    expect(missing).toEqual([]);
  });
});

// ── 7. index.html: Interne Anker-Links ──────────────────────────────────────
describe('index.html: Interne Anker-Links', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('alle href="#..." Links verweisen auf existierende IDs', () => {
    const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    const ids     = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    
    // Filter out pseudo-hashtags that don't need an ID match
    const missing = [...new Set(anchors)].filter((a) => a !== '' && !ids.has(a));
    expect(missing).toEqual([]);
  });
});

// ── 8. Rechtliche Seiten ───────────────────────────────────────────────────
describe('Rechtliche Seiten: Grundstruktur', () => {
  test.each(['agb.html', 'datenschutz.html', 'impressum.html', 'cookies.html'])(
    '%s hat gültige HTML-Struktur und enthält TRACE',
    (page) => {
      const content = read(page);
      expect(content.toLowerCase()).toContain('<!doctype html');
      expect(content.toLowerCase()).toContain('<html');
      expect(content.toLowerCase()).toContain('</html>');
      expect(content).toContain('TRACE');
      expect(content).not.toMatch(/plan-IT/i);
    }
  );
});
