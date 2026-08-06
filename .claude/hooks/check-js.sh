#!/usr/bin/env bash
# PostToolUse hook: after an Edit/Write to a scheme/ JS module, run `node --check`
# so a stray apostrophe or semicolon in a single-quoted narration string (which
# breaks module load at runtime, not at review) is caught the instant it lands.
# Reads the tool payload as JSON on stdin; only acts on scheme/js/**/*.js files.
#
# IT IS NOT A PARSER THE BROWSER AGREES WITH. On a file whose first statement is an
# `import`, Node takes the ESM path and accepts a RESERVED WORD as a destructured
# binding (`function f(s, { cond, new, grace })`), which the browser rejects outright
# with "Unexpected token 'new'" and no card renders. The same file passes here.
# `smoke-all.mjs` is the only thing that catches that class. Measured 2026-08-06.
f=$(jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)
[ -z "$f" ] && exit 0
case "$f" in
  *scheme/js/*.js)
    if ! err=$(node --check "$f" 2>&1); then
      echo "node --check failed for $f" >&2
      echo "$err" >&2
      echo "Likely an apostrophe or semicolon inside a single-quoted narration/wire string, or a syntax error. Fix before continuing." >&2
      exit 2
    fi
    ;;
esac
exit 0
