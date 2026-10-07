// The only counts a document states: the README headline numbers, each computed off the live catalog.
// `docs:sync` rewrites them and `unit/docs-census.test.mjs` fails when one drifts.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, cards } from '../fixtures/catalog.mjs';

const CLI_DATA = join(ROOT, '..', 'cli', 'js', 'data.js');
assert.ok(existsSync(CLI_DATA), `MISSING ${CLI_DATA}`);
const { SECTIONS } = await import(pathToFileURL(CLI_DATA).href);
const CLI = {
  commands: SECTIONS.reduce((n, s) => n + (s.groups || []).reduce((m, g) => m + (g.cmds || []).length, 0), 0),
  subs: new Set(SECTIONS.map(s => s.sub)).size,
};
assert.ok(CLI.commands > 0, 'the cli walk counted zero commands');
const SCHEMES = (await cards()).length;

const NUMWORD = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20,
};
const asNumber = (tok) => (/^\d+$/.test(tok) ? Number(tok) : NUMWORD[tok.toLowerCase()]);

const CLAIMS = [
  { doc: '../README.md', label: 'README: the cli command count, summary table',
    re: /cheat sheet, (\d+) commands, copy \+ star/, want: () => [CLI.commands] },
  { doc: '../README.md', label: 'README: the cli command count and its category split',
    re: /(\d+) commands across ([a-z]+|\d+) categories/, want: () => [CLI.commands, CLI.subs] },
  { doc: '../README.md', label: 'README: the diagram count, summary table',
    re: /Grid of (\d+) animated SVG diagrams/, want: () => [SCHEMES] },
  { doc: '../README.md', label: 'README: the diagram count, Schemes section',
    re: /(\d+) animated diagrams of how Kubernetes/, want: () => [SCHEMES] },
];

const readDoc = (rel) => {
  const p = join(ROOT, rel);
  assert.ok(existsSync(p), `MISSING DOCUMENT ${rel}`);
  return readFileSync(p, 'utf8');
};
const DOCS = new Map(CLAIMS.map(c => [c.doc, readDoc(c.doc)]));
const flat = (s) => s.replace(/\s+/g, ' ');

export { CLAIMS, DOCS, NUMWORD, asNumber, flat };
