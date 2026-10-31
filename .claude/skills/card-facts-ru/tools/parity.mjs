#!/usr/bin/env node
// parity.mjs: the mechanical half of "the Russian says what the English says". No --chunk: every card desc. --chunk=[{ id, en, ru }].
// usage: node .claude/skills/card-facts-ru/tools/parity.mjs [--chunk=FILE.json] [--before=FILE.json] [--only=id,id] [--json]
// ERROR: a lost token or number, a banned char, a lowercase sentence start. check: a reader decides (--before adds check_facts.py).
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '../../../..');
const CHECK_FACTS = join(REPO, '.claude/skills/humanizer-ru/scripts/check_facts.py');
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const only = flags.only ? new Set(flags.only.split(',')) : null;

let rows;
if (flags.chunk) rows = JSON.parse(readFileSync(flags.chunk, 'utf8'));
else {
  const { DIAGRAMS } = await import(pathToFileURL(join(REPO, 'diagrams/js/data.js')).href);
  const { RU } = await import(pathToFileURL(join(REPO, 'diagrams/js/lang/ru.js')).href);
  rows = DIAGRAMS.map(d => ({ id: d.id, en: d.desc, ru: RU[d.desc] || '', desc: true }));
}
const before = flags.before ? JSON.parse(readFileSync(flags.before, 'utf8')) : null;

// Built from code points so this file does not contain the characters it bans.
const BANNED = new RegExp(`[${String.fromCharCode(0x2014)}${String.fromCharCode(0x2013)};'${String.fromCharCode(0x2019)}]`);

// A token the Russian must carry verbatim: camelCase or multi-hump, dotted or slashed paths, flags,
// acronyms, anything with a digit, and the single-hump kinds and components below.
const SINGLE = new Set(('Pod Node Service Job Secret Namespace Ingress Gateway Lease Kubelet Scheduler ' +
  'Deployment Endpoints Event Role Eviction Kustomize Helm Docker Ready Pending Running Succeeded ' +
  'Failed Unknown Terminating Bound Available Released Retain Delete Recycle Always Never OnFailure ' +
  'Cluster Local Prefer Guaranteed Burstable BestEffort Immediate WaitForFirstConsumer').split(' '));
const TOKEN = /(?<![\w.\/-])(--?[a-z][\w-]*|[A-Za-z0-9][\w.\/:-]*[A-Za-z0-9]|[A-Za-z0-9])(?![\w\/-])/g;
function tokens(en) {
  const out = new Set();
  for (const m of en.matchAll(TOKEN)) {
    const t = m[1].replace(/[.:]+$/, '');
    if (/^--?[a-z]/.test(t) || /[a-z][A-Z]/.test(t) || /[A-Z]{2,}/.test(t) || /\d/.test(t) ||
        /\w[.\/]\w/.test(t) || SINGLE.has(t)) out.add(t);
  }
  return [...out];
}
// A plural kind in the English ("Pods") is singular in the Russian (STYLE.md, kinds).
// A compound ("100-Pod", "DNAT-ed") is carried when its parts are.
const CYRILLIC = { OS: 'ОС', CPU: 'ЦП' };
const carried = (ru, t) => ru.includes(t) || (CYRILLIC[t] && ru.includes(CYRILLIC[t])) || (/s$/.test(t) && ru.includes(t.slice(0, -1))) ||
  (/es$/.test(t) && ru.includes(t.slice(0, -2))) ||
  (t.includes('-') && !t.startsWith('-') && t.replace(/-ed$/, '').split('-').every(p => ru.includes(p) || ru.includes(p.replace(/ed$/, ''))));

const EMPHASIS = new Set('NEW NOT ONLY SAME ONE ALL NO NONE EVERY'.split(' '));
// True when every occurrence opens a sentence and is followed by a lowercase word or a plural kind.
const gerundOnly = (en, t) => {
  const all = [...en.matchAll(new RegExp(`\\b${t}\\b`, 'g'))];
  const ger = [...en.matchAll(new RegExp(`(?:^|[.?!]\\s+)${t}\\s+(?:[a-z]|[A-Z][a-z]+s\\b)`, 'g'))];
  return all.length > 0 && all.length === ger.length;
};
const NUMBERS = { two: 'дв|втор', three: 'три|тр[её](х|м|мя)|трет', four: 'четыр|четв[её]рт', five: 'пят', six: 'шест', seven: 'сем|седьм', eight: 'восьм|восем',
  nine: 'девят', ten: 'десят', twice: 'дважды|два раза|дв', half: 'половин|пол' };
// English scope words and the Russian markers that carry them. A missing marker is a check, never an error.
const SCOPE = [
  [/\bonly\b/i, /только|лишь|единственн|исключительно|никто,? кроме|никто другой/i, 'only'],
  [/\bby default\b/i, /по умолчанию/i, 'by default'],
  [/\b(never|nothing|nobody|none|no one|not|no|cannot|can.t|without|neither|nor|n.t)\b/i, /(^|[^а-яё])(не|ни|нет|без|никто|ничего|никогда|нельзя|нечего)([^а-яё]|$)/i, 'negation'],
  [/\bat most\b/i, /не больше|не более|максимум|самое большее|не выше|до \d/i, 'at most'],
  [/\bat least\b/i, /не меньше|не менее|минимум|хотя бы|как минимум/i, 'at least'],
  [/\buntil\b/i, /пока|до тех пор|до /i, 'until'],
  [/\bstill\b/i, /вс[её] ещ[её]|вс[её] равно|при этом|по-прежнему|ещ[её]|пока|остаётся|остается|продолжа/i, 'still'],
  [/\balready\b/i, /уже/i, 'already'],
  [/\b(may|might|can)\b/i, /мож|мог|способ|вправе|допуска|бывает|иногда/i, 'may / can'],
  [/\b(usually|typically|commonly|often|normally|mostly)\b/i, /обычно|как правило|чаще|часто|в основном|обыкновенно/i, 'usually'],
  [/\b(always|every|each|all)\b/i, /всегда|кажд|все|всех|всё|любо|люб[ыа]/i, 'every / all'],
  [/\b(first|before)\b/i, /сначала|сперва|первы|перв|до |прежде|раньше/i, 'first / before'],
];
const negCount = (s, re) => (s.match(new RegExp(re.source, 'gi')) || []).length;

const findings = [];
let tmp;
for (const r of rows) {
  if (only && !only.has(r.id)) continue;
  const items = [];
  const { en, ru } = r;
  if (!ru) { findings.push({ id: r.id, items: ['ERROR no Russian'] }); continue; }
  if (BANNED.test(ru)) items.push('ERROR banned character (dash, semicolon or apostrophe)');
  for (const m of ru.matchAll(/(?:^|[.?!]\s+)([a-zа-яё][\w.\/-]*)/g)) items.push(`ERROR sentence starts lowercase: ${m[1]}`);
  for (const t of tokens(en)) {
    if (carried(ru, t)) continue;
    // Capitals as emphasis ("a NEW Pod") and a status word read as a gerund or adjective at a
    // sentence start ("Running kubectl ...", "Terminating Pods ...") need no verbatim carry.
    if (EMPHASIS.has(t)) { items.push(`check emphasis ${t} not carried verbatim`); continue; }
    if (SINGLE.has(t) && /ing$/.test(t) && gerundOnly(en, t)) { items.push(`check ${t} reads as a gerund here`); continue; }
    // «узел» is the machine in prose (STYLE.md 2): the reader decides whether this Node was one.
    if (t === 'Node' && /узл|узел/i.test(ru)) items.push('check Node written as «узел»');
    else items.push(`ERROR token lost: ${t}`);
  }
  // Scope words are read off the English prose only: `Never` the restartPolicy value is not a negation.
  const prose = en.replace(TOKEN, m => (tokens(m).length ? ' ' : m)).replace(/\b(how often|the two)\b/gi, ' ');
  for (const [w, re] of Object.entries(NUMBERS)) {
    if (new RegExp(`\\b${w}\\b(?!-)`, 'i').test(prose) && !new RegExp(re, 'i').test(ru)) items.push(`ERROR number lost: ${w}`);
  }
  for (const [enRe, ruRe, name] of SCOPE) {
    if (!enRe.test(prose)) continue;
    if (!ruRe.test(ru)) { items.push(`check no Russian marker for "${name}"`); continue; }
    if (name === 'negation') {
      const e = negCount(prose, enRe), g = negCount(ru, ruRe);
      if (g < e) items.push(`check negations EN ${e}, RU ${g}`);
    }
  }
  const colons = (ru.match(/:/g) || []).length;
  if (colons) items.push(`check ${colons} colon(s)`);
  if (r.desc || flags.desc) items.push(`len ${ru.length} (EN ${en.length})`);
  const prev = before?.find(b => b.id === r.id && b.en === en);
  if (prev && prev.ru !== ru) {
    tmp ??= mkdtempSync(join(tmpdir(), 'parity-'));
    writeFileSync(join(tmp, 'b.txt'), prev.ru); writeFileSync(join(tmp, 'a.txt'), ru);
    let out;
    try { out = JSON.parse(execFileSync('python3', ['-I', CHECK_FACTS, join(tmp, 'b.txt'), join(tmp, 'a.txt'), '--json'], { encoding: 'utf8' })); }
    catch (x) { out = JSON.parse(x.stdout); }
    for (const e of out.errors) items.push(`check vs before ${e.kind} ${e.what}: ${e.detail}`);
    for (const c of out.checks) items.push(`check vs before ${c.what}: ${c.detail}`);
  }
  if (items.some(i => !i.startsWith('len '))) findings.push({ id: r.id, items });
}
if (tmp) rmSync(tmp, { recursive: true });

if (flags.json) { console.log(JSON.stringify(findings, null, 2)); process.exit(0); }
const errors = findings.filter(f => f.items.some(i => i.startsWith('ERROR')));
for (const f of findings) console.log(`${f.id}\n  ${f.items.join('\n  ')}`);
console.log(`\n${rows.length} string(s), ${findings.length} with findings, ${errors.length} with errors`);
process.exitCode = errors.length ? 1 : 0;
