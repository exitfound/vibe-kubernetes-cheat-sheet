# CLAUDE.md `scheme/tools/`

Dev harness for the `scheme/` sub-app. Node, its own `package.json`, never shipped. **`./README.md`
is the reference and you want it open**: what each check catches, the BLIND-TO column that is the
whole point of that table, the readers, the oracle triple, and how to write a new check. The chain
itself is defined in `package.json`, where it executes, and its length is stated nowhere else.

Three things that cost a session each, before you run anything:

- **The container serves a SNAPSHOT.** `Dockerfile` is a blanket `COPY . .` with no mounts, so after
  editing anything under `scheme/` the container on `:8080` still serves the OLD files and the whole
  gate silently checks stale content and passes. Run
  `python3 -m http.server 8888` from the repo root and use `BASE=http://localhost:8888`, or rebuild
  the image first.
- **The acceptance criterion is a NUMBER, not "0 findings".** Coverage can collapse to a third at
  zero findings and exit 0. Record what a tool counted before a refactor and assert it after:
  `check-inline`'s indirect floor (321), `check-canon`'s skeleton census, `check-notes`'s anchor
  count (169).
- **A green gate is not a looked-at card.** The blind-spot column exists because most of what goes
  wrong here is invisible to every rule in the chain.

The rules the checks enforce, and which check enforces each one, are `../CANON.md`. When you add a
rule to a check, add or update its row there: the `Check` column is what tells a reader whether a
rule has a machine behind it.

Comments in this folder: a standalone script's header is how you learn to run it, so headers stay
here rather than moving to a design record. Two to three lines, the long version goes in
`./README.md`.
