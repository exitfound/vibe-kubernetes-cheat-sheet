#!/usr/bin/env node
// check-figures.mjs: B7 content, the arithmetic a reader does across one diagram. Both defect
// classes it hunts were found by accident while someone read narration, never by a check:
// two different Pods drawn with the same IP, and a Pod labelled "req 2Gi" beside a chip reading
// "limit 1Gi", which the API server would reject outright.
// Strings are anchored to the nearest preceding block label, so a finding names the two blocks.
// node check-figures.mjs [<id> ...]
import { readFile } from 'node:fs/promises';
import { cards, census } from './catalog.mjs';

const args = process.argv.slice(2);
const only = new Set(args.filter(a => !a.startsWith('--')));

// An address that belongs to a block: written where a block is being built, not in a wire label
// or a chip value (a chip legitimately quotes another block's address).
const ANCHORED = /\b(?:label|sublabel|ip|sub):\s*'([^']*)'/g;
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
// Cluster IPs and gateways are shared by construction, so only Pod-range addresses are compared.
const POD_RANGE = /^10\.244\./;
// The defect is two POD blocks sharing an address. A Pod and the eth0 box drawn inside it share
// theirs by definition, and the first run reported exactly that twice, so only blocks that name
// a Pod are compared: "Client Pod", "Pod web-a", "pod-b", never "eth0" or "lo".
const IS_POD = s => /\bPod\b/.test(s) || /^pod-/.test(s);

const UNITS = { '': 1, k: 1e3, m: 1e-3, M: 1e6, G: 1e9, T: 1e12, Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3, Ti: 1024 ** 4 };
const qty = t => {
  const m = /^(\d+(?:\.\d+)?)(Ki|Mi|Gi|Ti|k|M|G|T|m)?$/.exec(t);
  return m ? Number(m[1]) * UNITS[m[2] || ''] : null;
};

const ALL = await cards();
const files = ALL.filter(c => !only.size || only.has(c.id));
census('figures check', files.length, ALL.length, { subset: only.size > 0 });

let findings = 0, scanned = 0;
for (const { id: card, path } of files) {
  const src = await readFile(path, 'utf8');
  const out = [];

  // Every anchored string with the block label that owns it.
  const blocks = [];
  let m, label = '(no label)';
  const LABEL = /\blabel:\s*'([^']*)'/g;
  const labels = [];
  while ((m = LABEL.exec(src))) labels.push({ at: m.index, text: m[1] });
  // Identity is the label's POSITION, not its text: one card draws two distinct Pods both
  // labelled "Pod web", and keying on the text would merge them and hide a shared address.
  const ownerOf = at => {
    let owner = { text: '(no label)', at: -1 };
    for (const l of labels) { if (l.at > at) break; if (l.text) owner = l; }
    return owner;
  };
  while ((m = ANCHORED.exec(src))) {
    scanned++;
    const o = ownerOf(m.index);
    blocks.push({ at: m.index, text: m[1], owner: o.text, ownerId: `${o.text}@${o.at}` });
  }

  // 1. One Pod address on two different blocks.
  const ipOwners = new Map();
  for (const b of blocks) {
    for (const ip of b.text.match(IPV4) || []) {
      if (!POD_RANGE.test(ip) || !IS_POD(b.owner)) continue;
      if (!ipOwners.has(ip)) ipOwners.set(ip, new Map());
      ipOwners.get(ip).set(b.ownerId, b.owner);
    }
  }
  for (const [ip, owners] of ipOwners) {
    if (owners.size > 1) out.push(`DUP-IP    ${ip} labels two blocks: ${[...owners.values()].join(' / ')}`);
  }

  // 2. A request above its own limit, on one block.
  const byOwner = new Map();
  for (const b of blocks) {
    const req = /\b(?:req|requests?)\s+(\d+(?:\.\d+)?(?:Ki|Mi|Gi|Ti|k|M|G|T|m)?)/i.exec(b.text);
    const lim = /\blimits?\s+(\d+(?:\.\d+)?(?:Ki|Mi|Gi|Ti|k|M|G|T|m)?)/i.exec(b.text);
    if (!req && !lim) continue;
    const e = byOwner.get(b.ownerId) || { label: b.owner };
    if (req) e.req = req[1];
    if (lim) e.lim = lim[1];
    byOwner.set(b.ownerId, e);
  }
  for (const e of byOwner.values()) {
    if (!e.req || !e.lim) continue;
    const r = qty(e.req), l = qty(e.lim);
    if (r !== null && l !== null && r > l) out.push(`REQ>LIMIT ${e.label}: req ${e.req} above limit ${e.lim}, the API server rejects that Pod`);
  }

  if (out.length) { findings += out.length; console.log(`\n${card}`); for (const o of out) console.log(`  ${o}`); }
}

console.log(`\nfigures check: ${files.length} cards, ${scanned} anchored strings, ${findings} finding(s)`);
process.exit(findings ? 1 : 0);
