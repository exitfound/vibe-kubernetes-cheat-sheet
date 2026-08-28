#!/usr/bin/env bash
# PostToolUse hook: after an Edit/Write to a scheme/ JS module, parse it AS AN ES MODULE
# so a stray apostrophe in a single-quoted narration string (which breaks module load in
# the browser, not at review) is caught the instant it lands.
# Reads the tool payload as JSON on stdin; only acts on scheme/js/**/*.js files.
#
# IT MUST BE `--input-type=module` READING STDIN, NOT `node --check <file>`. A card file
# starts with `import`, and on that path plain `node --check` returns 0 over a genuine
# syntax error: it accepted both `narration: 'The container's ...'` and a RESERVED WORD as
# a destructured binding (`function f(s, { cond, new, grace })`), each of which the browser
# rejects outright and no card renders. Measured 2026-08-07 against 32 healthy modules
# (21 cluster cards + lib): zero false positives, both classes caught.
#
# Still NOT caught here, because it is valid JavaScript: a semicolon inside a narration
# string. That is a text rule, and only the prose test sees it.
f=$(jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)
[ -z "$f" ] && exit 0
case "$f" in
  *scheme/js/*.js)
    if ! err=$(node --input-type=module --check < "$f" 2>&1); then
      echo "ES module parse failed for $f" >&2
      echo "$err" >&2
      echo "Likely an apostrophe inside a single-quoted narration/wire string, or a reserved word used as a binding. Fix before continuing." >&2
      exit 2
    fi
    ;;
esac
exit 0
