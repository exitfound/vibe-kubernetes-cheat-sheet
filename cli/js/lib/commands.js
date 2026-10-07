// How a command is shown: the highlighter (raw string in, HTML-escaped highlighted HTML out) and the
// display order inside a group. Its own module so the static pages tools/pages/build.mjs writes show
// exactly what the live page does. Pure: no DOM, no browser globals.

export function hl(raw, { slashBreaks = true } = {}) {
  const e = s => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokens = raw.split(' ').filter(Boolean);

  // Flags and short tokens go in an unbreakable .tok box, and a long URL or path wraps inline at a <wbr>
  // after each "/" (in text, never in a tag). applyMark() matches inside one text node, so a search
  // for a string containing "/" renders that command without the <wbr>s.
  return tokens.map((tok, i) => {
    const html = hlTok(tok, i);
    if (tok.startsWith('-') || tok.length <= 30) return `<span class="tok">${html}</span>`;
    if (!slashBreaks) return html;
    return html.split(/(<[^>]*>)/).map(part => part.startsWith('<') ? part : part.replace(/\//g, '/<wbr>')).join('');
  }).join(' ');

  function hlTok(tok, i) {
    // Main binary
    if (i === 0) return `<span class="hl-cmd">${e(tok)}</span>`;

    // Sub-command (not a flag or placeholder)
    if (i === 1 && !/^[-<\[]/.test(tok)) return `<span class="hl-sub">${e(tok)}</span>`;

    // Separators: --, |, >, >>
    if (tok === '--' || tok === '|' || tok === '>' || tok === '>>') {
      return `<span class="hl-sep">${e(tok)}</span>`;
    }

    // Flags (with optional =value)
    if (/^--?[a-zA-Z]/.test(tok)) {
      const eq = tok.indexOf('=');
      if (eq > 0) {
        return `<span class="hl-flag">${e(tok.slice(0, eq))}</span>=<span class="hl-val">${e(tok.slice(eq + 1))}</span>`;
      }
      return `<span class="hl-flag">${e(tok)}</span>`;
    }

    // Placeholders <name> or [flags]
    if (/^[<\[]/.test(tok)) return `<span class="hl-ph">${e(tok)}</span>`;

    // Resource type (third token in kubectl get/describe/delete …)
    if (i === 2 && /^[a-z]/.test(tok) && !tok.startsWith("'") && !tok.startsWith('"') && !tok.startsWith('{')) {
      return `<span class="hl-res">${e(tok)}</span>`;
    }

    // Quoted strings / JSON / jsonpath
    if (/^['"{]/.test(tok)) return `<span class="hl-str">${e(tok)}</span>`;

    return `<span class="hl-val">${e(tok)}</span>`;
  }
}

// Display order inside a group: by subcommand, then by flag count, then by the whole string.
export function sortCmds(cmds) {
  const subCmd   = cmd => cmd.split(' ')[1] || '';
  const flagCount = cmd => cmd.split(' ').filter(t => /^--?[a-zA-Z]/.test(t)).length;
  return [...cmds].sort((a, b) => {
    const subDiff  = subCmd(a.cmd).localeCompare(subCmd(b.cmd));
    if (subDiff !== 0) return subDiff;
    const flagDiff = flagCount(a.cmd) - flagCount(b.cmd);
    return flagDiff !== 0 ? flagDiff : a.cmd.localeCompare(b.cmd);
  });
}
