// Stamps every local module, script and stylesheet URL in a staged site with `?v=<version>`, so a
// fresh page loads a fresh module graph instead of whatever each file's cache holds. Run by
// deploy.yml on _site. A computed import cannot be rewritten: diagrams/js/app.js stamps its own.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const [dir, version] = process.argv.slice(2);
if (!dir || !version || !/^[\w.-]+$/.test(version)) {
  console.error('usage: node tools/deploy/version.mjs <site dir> <version>');
  process.exit(1);
}
const V = `?v=${version}`;
// A module specifier is local when it is a path (`./`, `../`, `/`). An HTML or CSS URL is local when
// it names no scheme and no host, so `css/styles.css` counts. Anything already queried is left alone.
const remote = (u) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(u) || u.includes('?');
const stampModule = (u) => (!remote(u) && /^(\.{1,2}\/|\/)/.test(u) ? u + V : u);
const stampUrl = (u) => (!remote(u) ? u + V : u);

// Module specifiers: `from '...'`, a bare `import '...'` and `import('...')`, quoted with ' or ".
const JS_RE = /(\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"\n]+\.m?js)\2/g;
const HTML_RE = /(\b(?:src|href)=)(["'])([^"']+\.(?:m?js|css))\2/g;
const CSS_RE = /(@import\s+url\(\s*)(['"]?)([^'")]+\.css)\2(\s*\))/g;

const counts = { files: 0, urls: 0 };
const rewrite = (text, ext) => {
  let n = 0;
  const one = (re, fn) => { text = text.replace(re, (...m) => { const out = fn(...m); if (out !== m[0]) n++; return out; }); };
  if (ext === '.js' || ext === '.mjs' || ext === '.html') one(JS_RE, (m, pre, q, u) => `${pre}${q}${stampModule(u)}${q}`);
  if (ext === '.html') one(HTML_RE, (m, pre, q, u) => `${pre}${q}${stampUrl(u)}${q}`);
  if (ext === '.css') one(CSS_RE, (m, pre, q, u, post) => `${pre}${q}${stampUrl(u)}${q}${post}`);
  counts.urls += n;
  return text;
};

function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const ext = extname(p);
    if (!['.js', '.mjs', '.html', '.css'].includes(ext)) continue;
    const before = readFileSync(p, 'utf8');
    const after = rewrite(before, ext);
    if (after !== before) { writeFileSync(p, after); counts.files++; }
  }
}
walk(dir);
console.log(`version.mjs: stamped ${counts.urls} URL(s) in ${counts.files} file(s) with ${V}`);

// A local reference the patterns missed would load unstamped beside its stamped twin: fail the deploy.
const missed = [];
(function scan(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) { scan(p); continue; }
    if (!['.js', '.mjs', '.html', '.css'].includes(extname(p))) continue;
    const t = readFileSync(p, 'utf8');
    // Broader than the rewrite patterns on purpose: any quoted local path to a .js or .css file.
    for (const m of t.matchAll(/["'`(]((?:\.{1,2}\/|\/)[^"'`()\s?]+\.(?:m?js|css))(?=["'`)])/g)) missed.push(`${p}: ${m[1]}`);
  }
})(dir);
if (missed.length) { console.error(`version.mjs: ${missed.length} local URL(s) left unstamped:\n  ${missed.join('\n  ')}`); process.exit(1); }
