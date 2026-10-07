# Before you change a card that already exists

Read this when the target card has a record, whichever skill is running: `card-new` redrawing a
composition, `card-review` moving a coordinate, `card-facts` rewording a narration. A card being
born skips it.

Three steps, in order, all before the first edit.

## 1. Scope it in writing

Name the parts the change touches by ref key, the steps by id, and whether it moves geometry,
prose, state or timing. Two lines. A request you cannot scope in two lines needs one question
first.

Then read only what the scope names: the card source, its record, and the canon block it lands in.

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
node tools/canon.mjs                    # rows per block, by check kind
node tools/canon.mjs --block=L,A        # geometry     (--block=M motion, T prose, P chips)
```

Rows marked `test:` are what the gate already enforces.

## 2. Read the ruling that may already exist

Look in the record for the thing you are about to change. A `DEVIATES` line is a deliberate rule
break with its reason. An `OPEN` line is a defect that stays open because the fix makes the picture
worse (`L-16`). A `CONTENT` line is a wording a fact forced.

A ruling can also sit in a test: a baseline constant carries its reason in the comment above it,
and a green assertion prints nothing. Grep before the first edit, and read what the hits say:

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test && grep -rn '<card-id>' . --include=*.mjs
```

A request that lands on a ruling is answered with the ruling, not an edit: quote it, say what
overruling costs, let the user decide. Where nothing rules, say so and say the grep was run. A
ruling can be wrong: where it states a number or a shade, re-measure before you obey or overrule.

## 3. State the blast radius, then edit

Name the rows you hit before the first edit, and re-check each afterwards.

| You change | What else moves |
|---|---|
| a lane, an endpoint, any coordinate | the span of every step, because `routeDur` is length based (`A-11`, `M-20`). Re-run the duration check and `pace.mjs` |
| a narration or any drawn string | the panel rectangle per viewport (`L-08`). Re-measure with `OVERLAY_IDS`, then read the result (`T-31`) |
| a chip value | whether the change is cued (`P-05`, `P-09a`), and whether name plus value fit (`P-07`) |
| a block's size or position | the content centre (`L-13`), what sits under the panel (`L-15`), the frame family (`L-23`, `L-24`) |
| an opacity or a lit state | the reduced path (`S-16`), and the lane shade, the min of its ends (`A-13`) |
| adding a hop | about 800ms, so `duration` usually rises (`M-34`) |
| adding or removing a step | the poster preview (`D-14`) and every chip on the new step (`P-01`) |
| a ref key | every `settled-dump` diff, which reddens with the picture unmoved |
| the composition, the cast or the step spine | a design change: it belongs in `card-new` |

Take the BEFORE reading of whatever those rows name while the card is untouched:

```bash
cd "$(git rev-parse --show-toplevel)"/scheme/test
npm run report > /tmp/edit-before-report.txt 2>&1; grep -n '<card-id>' /tmp/edit-before-report.txt   # only if a row names a report
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs                    # only if prose or a block moved
node ../../.claude/skills/card-review/tools/pace.mjs <card-id>               # only if geometry moved
```

## Editing rules

- One finding at a time, smallest diff that closes it. Do not recolor, re-trim or restructure what
  nobody mentioned. The scope is the two lines from step 1.
- Prefer a card-local mechanism over changing a shared primitive. `tune(el, refs)` is the escape
  for nudging one attribute.
- Self-inflicted regressions land here: a comment past six lines (`S-34`), a wire written only by
  the animation (`T-30`), a `duration` shorter than the motion (`M-19`).
- After any bulk edit over prose, read the result (`T-31`).

Then go to `_shared/card-verify.md`.
