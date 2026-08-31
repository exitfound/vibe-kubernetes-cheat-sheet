# Before you change a card that already exists

Read this the moment the target card HAS a record, whichever skill is running: `card-new` redrawing
a composition, `card-review` moving a coordinate, `card-facts` rewording a narration. It is not read
for a card being born, which has no record to consult and nothing yet to break.

Three things, in order, all of them before the first edit. They are cheap, and each one has been
paid for by a session that skipped it.

---

## 1. Scope it in writing

Name the PARTS the change touches by ref key, the STEPS it touches by id, and whether it moves
geometry, prose, state or timing. Two lines. A request whose scope you cannot write down in two
lines is not scoped yet, and asking one question now is cheaper than the wrong edit.

Then read only what the scope names: the card source in full, the card's `## <card-id>` record
section, and the canon block the change lands in. Not the whole rulebook:

```bash
cd scheme/test
node tools/canon.mjs                    # 19 lines: rows per block, by check kind
node tools/canon.mjs --block=L,A        # geometry     (--block=M motion, T prose, P chips)
```

The rows marked `test:` are what the gate already enforces. Reading them again buys nothing.

---

## 2. Read the ruling that may already exist. This step is never skipped

Open the record section and look for the thing you are about to change. **A settled question
re-opened for free is how a measurement someone took with a browser gets thrown away**, and the
record exists to stop exactly that.

**The records come in two shapes and you have to handle both.**

- **`cluster` and `workloads`**: the factual blocks carry it. A measurement in `LAYOUT`, `PANEL`,
  `SIZES`, `LANES`, `MOTION`, `WIRE LABELS`, `BUDGET` or `NAMING` states what the card does AND the
  number that forced it, in the present tense. A sentence saying a value is bounded, forced, spent
  or the minimum is a ruling: it says the room you are about to use is not there.
- **`network` and `storage`**: those plus the older labels. A `DO NOT` carries the defect it
  prevents, a `WHY NOT` carries the alternative that was measured and the number that killed it, and
  an `OPEN` carries the measurement saying the rule can only be satisfied by making the picture
  worse (`L-16`).

**The record is not the only place a ruling lives, and the second place is a test.** A baseline
constant carries its reason in the comment above it, and that comment is a ruling nothing indexes:
`EXPECTED_COMBINATIONS` in `render/palette.test.mjs` held the argument for one card's two lanes, and
a review that read the record, the card and the whole canon reported "the record says nothing about
this" and was wrong. Grep before the first edit, and read what the hits SAY, not just that they
exist:

```bash
cd scheme/test && grep -rn '<card-id>' . --include=*.mjs
```

**A green assertion prints nothing, so a ruling inside one is invisible until you break it.** That
is the whole failure mode: the gate cannot warn you off a change it will only object to afterwards.
If the grep returns a card-specific baseline or carried finding, treat it exactly as a record entry.

**A request that lands on one of those is answered with the ruling, not with an edit.** Quote it,
say what it costs to overrule, and let the user decide. Where the record says nothing about it, say
so in one line AND say the grep was run: that is also an answer, and it tells the next reader the
ground was checked. **A ruling can also be WRONG.** The palette one asserted a colour its author had
not measured. Where a ruling states a number or a shade, re-measure it before you either obey or
overrule it, and report the reading either way.

---

## 3. State the blast radius, then edit

Almost nothing in a card changes alone. Name the rows you hit BEFORE the first edit, and re-check
every one of them afterwards.

| You change | What else moves, and what says so |
|---|---|
| a lane, an endpoint, any coordinate | the SPAN of every step, because `routeDur` is length-based (`A-11`, `M-20`). Re-run the duration check and `pace.mjs`, not only the step you moved |
| a narration or any drawn string | the panel rectangle, per viewport (`L-08`). Re-measure with `OVERLAY_IDS`, worst on the SMALLEST viewport, then READ the result (`T-31`) |
| a chip value | whether the change is cued and whether it should be (`P-05`, `P-09a`), and whether name plus value still fit the chip (`P-07`) |
| a block's size or position | the content centre (`L-13`), what now sits under the panel (`L-15`), and the category frame family if it is a `node()` (`L-23`, `L-24`) |
| an opacity or a lit state | all four axes of the reduced path (`S-16`), and the lane shade, which is the MIN of its two ends (`A-13`) |
| adding a hop | about 800ms, so `duration` usually has to rise (`M-34`) |
| adding or removing a step | the poster preview (`D-14`), every chip on the new step (`P-01`), and any step count the record states |
| a ref key | the record anchors quoting that line (`S-38`), and every `settled-dump` diff, which reddens with the picture unmoved |
| the composition, the cast or the step spine | this is a DESIGN change: it belongs in `card-new`, which starts from a composition census and a one-line sign-off, and comes back here as the edit |

**Take the BEFORE reading of whatever those rows name, while the card is still untouched.** A report
queue, a panel extent or a pace ranking read only AFTER the edit cannot tell your own damage from
what was already there:

```bash
cd scheme/test
npm run report > /tmp/before.txt 2>&1; grep -n '<card-id>' /tmp/before.txt   # only if a row names a report
OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs                    # only if prose or a block moved
node ../../.claude/skills/card-review/tools/pace.mjs <card-id>               # only if geometry moved
```

Take the report BEFORE only when a blast-radius row actually named a report axis. A pure duration
change touches none of them, and a minute spent proving that is a minute wasted.

---

## The editing rules themselves

- One finding at a time, smallest diff that closes it. Do not recolor, re-trim or restructure
  anything nobody mentioned. **A directed request is not a licence to tidy what is beside it**: the
  scope is the two lines from step 1.
- Prefer a card-local mechanism over changing a primitive every card shares. `tune(el, refs)` on a
  part is the sanctioned escape for nudging one attribute.
- Expect self-inflicted regressions in exactly these places: a comment run past two lines (`S-34`),
  an anchored line reworded (`S-38`), a wire written by the animation alone so prev and reset show it
  blank (`T-30`), a `duration` now shorter than the motion (`M-19`).
- After ANY bulk edit over prose, READ the result (`T-31`). A regex sweep leaves the linters green
  and the meaning broken: a duplicated prefix, a reworded opening that breaks the grammar of the
  rest, a dropped word, a qualifier trimmed to fit a band and leaving a true sentence as a false
  absolute.

Then go to `_shared/card-verify.md`, which is what the edit costs on the way out.
