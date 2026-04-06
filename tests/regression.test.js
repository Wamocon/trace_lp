/**
 * TRACE Landing Page v2 (WAMOCON) — Regression Tests
 *
 * Zweck: Sicherstellen, dass kritische Inhalte, Strukturen und Links
 * nach jeder Änderung korrekt erhalten bleiben.
 *
 * v2 Sektionen: hero, funktionen, workflow, rollen, mehr, preise, faq, team, footer
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const read = (file) => {
  const docsPath = path.join(DOCS, file);
  if (fs.existsSync(docsPath)) return fs.readFileSync(docsPath, 'utf8');
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
};

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
    const isDoc = !file.startsWith('.');
    const fullPath = isDoc ? path.join(DOCS, file) : path.join(ROOT, file);
    expect(fs.existsSync(fullPath)).toBe(true);
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

// ── 3. index.html: Pflicht-Sektionen vorhanden (v2) ─────────────────────────
describe('index.html: Pflicht-Sektionen vorhanden', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test.each([
    'hero', 'funktionen', 'workflow',
    'rollen', 'mehr', 'preise',
    'faq', 'team', 'footer',
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

// ── 9. index.html: v2 UI-Elemente ──────────────────────────────────────────
describe('index.html: v2 UI-Elemente', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('iPhone-Mockup (iphone-frame) vorhanden', () => {
    expect(html).toContain('iphone-frame');
  });

  test('Preiskarten vorhanden (price-lite, price-pro)', () => {
    expect(html).toContain('price-lite');
    expect(html).toContain('price-pro');
  });

  test('Billing-Toggle (billToggle) vorhanden', () => {
    expect(html).toContain('id="billToggle"');
  });

  test('Lite-Preis (litePrice) vorhanden', () => {
    expect(html).toContain('id="litePrice"');
  });

  test('Pro-Preis (proPrice) vorhanden', () => {
    expect(html).toContain('id="proPrice"');
  });

  test('FAQ-Liste (faqList) vorhanden', () => {
    expect(html).toContain('id="faqList"');
  });

  test('Cookie-Banner vorhanden', () => {
    expect(html).toContain('id="cookieBanner"');
  });

  test('Back-to-Top-Button vorhanden', () => {
    expect(html).toContain('id="btt"');
  });

  test('Mobile-Menu vorhanden', () => {
    expect(html).toContain('id="mobileMenu"');
  });
});

// ── 10. index.html: Preismodell-Inhalte ──────────────────────────────────
describe('index.html: Preismodell', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('Lite-Plan erwähnt', () => {
    expect(html).toMatch(/Lite/);
  });

  test('Pro-Plan erwähnt', () => {
    expect(html).toMatch(/Pro/);
  });

  test('30 Tage Trial erwähnt', () => {
    expect(html).toMatch(/30.*[Tt]age/);
  });

  test('Preisangabe vorhanden (€)', () => {
    expect(html).toContain('€');
  });

  test('Quellenangabe Preise vorhanden (toggl|clockify)', () => {
    expect(html.toLowerCase()).toMatch(/toggl|clockify|timeneye/);
  });
});

// ── 11. index.html: Hauptfunktionen ──────────────────────────────────────
describe('index.html: Hauptfunktionen (v2)', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test('Einreichung als Feature vorhanden', () => {
    expect(html).toMatch(/Einreich/);
  });

  test('E-Mail-Versand als Feature vorhanden', () => {
    expect(html).toMatch(/E-Mail/i);
  });

  test('Export-Vorlagen als Feature vorhanden', () => {
    expect(html).toMatch(/Vorlag/);
  });

  test('Kalenderintegration als Feature vorhanden', () => {
    expect(html).toMatch(/Kalend/);
  });

  test('Outlook-Anbindung genannt', () => {
    expect(html).toMatch(/Outlook/);
  });

  test('Google-Kalender-Anbindung genannt', () => {
    expect(html).toMatch(/Google/);
  });
});

// ── 12. index.html: Keine veralteten Sektionen ───────────────────────────
describe('index.html: Keine v1-Sektionen', () => {
  let html;
  beforeAll(() => { html = read('index.html'); });

  test.each(['problem', 'roadmap', 'wizard', 'architektur', 'demo'])(
    'id="%s" nicht vorhanden (v1 entfernt)',
    (id) => {
      expect(html).not.toContain(`id="${id}"`);
    }
  );
});

// ── 13. script.js: v2-Funktionen vorhanden ───────────────────────────────
describe('script.js: v2-Funktionen vorhanden', () => {
  let js;
  beforeAll(() => { js = read('script.js'); });

  test.each([
    'initReveal',
    'initNavbar',
    'initSmoothScroll',
    'initFAQ',
    'initPriceToggle',
    'initBackToTop',
    'initCookieBanner',
    'initMobileMenu',
  ])('Funktion %s() vorhanden', (fn) => {
    expect(js).toContain(`function ${fn}`);
  });

  test('v1 initRoadmap nicht vorhanden', () => {
    expect(js).not.toContain('function initRoadmap() {');
  });

  test('v1 initParticles nicht vorhanden', () => {
    expect(js).not.toContain('function initParticles');
  });
});
