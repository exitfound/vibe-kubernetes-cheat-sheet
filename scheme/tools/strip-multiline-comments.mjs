// Remove multi-line `//` comment blocks (2+ consecutive own-line line-comments).
// Uses acorn so strings/templates/regex are never misread as comments.
// Usage: node strip-multiline-comments.mjs <dry|apply> <file...>
import { Parser } from 'acorn';
import fs from 'node:fs';

const mode = process.argv[2];
const files = process.argv.slice(3);
if (!['dry', 'apply'].includes(mode) || files.length === 0) {
  console.error('usage: node strip-multiline-comments.mjs <dry|apply> <file...>');
  process.exit(2);
}

let grandLines = 0, grandBlocks = 0, grandFiles = 0;
const perFile = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const comments = [];
  try {
    Parser.parse(src, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      onComment: (isBlock, text, s, e, startLoc, endLoc) => {
        if (!isBlock) comments.push({ line: startLoc.line, col: startLoc.column });
      },
    });
  } catch (err) {
    console.error(`PARSE-FAIL ${file}: ${err.message}`);
    continue;
  }

  // Keep only "own-line" line comments: only whitespace precedes the `//`.
  const ownLine = comments.filter(c => {
    const text = lines[c.line - 1] ?? '';
    return text.slice(0, c.col).trim() === '';
  }).map(c => c.line).sort((a, b) => a - b);

  // Group strictly-adjacent line numbers into runs.
  const toDelete = new Set();
  let blocks = 0, blockLines = 0;
  let i = 0;
  while (i < ownLine.length) {
    let j = i;
    while (j + 1 < ownLine.length && ownLine[j + 1] === ownLine[j] + 1) j++;
    const runLen = j - i + 1;
    if (runLen >= 2) {
      blocks++;
      for (let k = i; k <= j; k++) { toDelete.add(ownLine[k]); blockLines++; }
    }
    i = j + 1;
  }

  if (blocks > 0) {
    grandFiles++; grandBlocks += blocks; grandLines += blockLines;
    perFile.push({ file, blocks, blockLines });
  }

  if (mode === 'apply' && toDelete.size > 0) {
    const kept = lines.filter((_, idx) => !toDelete.has(idx + 1));
    fs.writeFileSync(file, kept.join('\n'));
  }
}

perFile.sort((a, b) => b.blockLines - a.blockLines);
for (const p of perFile) {
  console.log(`${String(p.blockLines).padStart(4)} lines / ${String(p.blocks).padStart(3)} blocks  ${p.file}`);
}
console.log('---');
console.log(`${mode.toUpperCase()}: ${grandLines} lines in ${grandBlocks} blocks across ${grandFiles} files`);
