## cluster-server-side-apply

### layout

```
WHAT     managedFields as a table nobody has ever seen, drawn: two managers, one object, and who owns
         which field.
LAYOUT   The row is BOX_W 200 with TOP_GAP 60 rather than the
         family 232, because three actors have to fit in the 720 units right of the panel:
         3 x 200 + 2 x 60 is exactly 720.
PANEL    x<=291 y<=195, x<=378 y<=236, x<=397 y<=280, worst on the ledger step.
BUDGET   500 characters per narration. The top row and the table start at 420 and are panel-proof at
         any length. What has to clear is the client-side column, whose top block opens at 380 with
         its glyph top measured at 392.1 at 1100x800 (392.8 at 1280x860, 392.3 at 1600x1000). The
         longest narration on the card is the ledger step at 393 characters, which lands the panel
         bottom at 279.51 at 1100x800, so 100.5 units are spare to the block and 112.6 to the glyph,
         and 500 characters would land the panel at roughly 346, still 34 clear of the block.
         Calibration was measured, not guessed: padding a narration from 410 to 610 measured 404 at
         1100x800, so 200 characters cost 124 units, about 0.62 per character.
WHY NOT  Two boxes and an arrow with the ownership stated only in prose. That is what this family
         reaches for by reflex, and the whole reason the card exists is that managedFields is a table
         nobody has seen.
WHY NOT  A six-row pipeline ladder in the band between the top row and the table: a ladder there sits
         between the API and the object, so the tie from one to the other crosses it, which is a
         THROUGH finding by construction.
LAYOUT   THE LEDGER AND THE CLIENT-SIDE COLUMN END ON ONE LINE, and both are DERIVED from a single
         `BAND_BOTTOM` 520 rather than from two literals that happen to agree. The table is
         212..520, the three client-side rows 380..420 / 430..470 / 480..520, and the chips open at
         548, so 28 units of air separate the whole band from them. A literal `OBJ_Y` would let a
         later change to `ROWS`, `ROW_H` or `LEG_H` break the baseline with nothing to see it.
NOTE     Dropping the table 32 units also bought back the clearance under the ack wire register:
         the ack labels sit at y=146 with a glyph bottom of 149.7, and the object caption glyph top
         moved 159 to 191, so the gap went from 9.3 units to 41.3.
NOTE     The API sits in the MIDDLE of the row, solved rather than chosen: the object table spans
         420..1140 so its centre is 780, and 780 is also the API centre because the row is
         420 + 200 + 60 + 100. The tie down to the object is then one straight vertical with both
         endpoints on a face midpoint. On either end it needs a jog through the band where both
         answer labels live, and a jog left runs under the panel.
LANES    The 409 on the conflict step is drawn
         coming home, because a return the narration promises and the motion never delivers is a
         named defect family here.
MOTION   Every duration is sized off the READING LOAD, not off the span, because the span is 2060 on
         four steps and 0 on the ledger. At 9.83 to 9.94 ms per character all six narrated steps sit
         inside one 0.11 band, just above the cluster median (`report/baselines.test.mjs` prints the
         per category median, `timing.mjs` ranks a step). Nothing in the suite measures this:
         `render/duration.test.mjs` only asks that a step outlast its own motion, which 2400 does.
WHY NOT  Leaving the durations at 2400 to 3000. That put five of the six steps inside the most
         hurried fifth of the catalogue, `force` at 7.43 ms per character, well under the category
         median, and a reader cannot finish 350 characters in 2600ms. The cost of the fix is 4.1 seconds of card.
NAMING   The client-side column carries NO caption. Its three blocks name themselves
         (`last-applied-configuration`, `The file on your disk`, `The live object`) and the last step
         names the mechanism in the panel: `then runs a three-way merge across the annotation, the
         file and the live object`. A standing caption over them repeated on all seven slots what one
         step says once, and the column is the only thing on the card that is not the subject.
DO NOT   Restore `client-side apply · the three-way merge` as a `P.tag`. Its only reader was the
         caption, so `LEG_CAP_Y` went with it: putting the string back means putting the constant
         back too, and the card is asymmetric on purpose. The ledger column keeps its caption because
         it names an OBJECT and its field, `Deployment web · metadata.managedFields`, which nothing
         else on the canvas states, while the client-side blocks are self-describing.
NOTE     The three inputs of the client-side three-way merge sit in the bottom-left corner the panel
         frees once its text ends, holding OPACITY.notready for five of six steps. Without them the
         card is a top row and a table both starting at x=420 with the entire left third empty.
DO NOT   Remove a field row when it leaves the object. A removed row leaves a row-sized hole in a
         table on screen for the whole card, which reads as a rendering fault. It dims to
         OPACITY.terminated, keeps its field path, and its value cell says Removed.
DO NOT   Light `kctl` on the client-side step. It is the only step whose subject is plain apply, and
         the block's sublabel reads `apply --server-side`, so lighting it points the reader at the
         flag the step is the contrast TO. The three client-side blocks carry that beat alone,
         through the staged reveal, and no other step on the card leaves the top row dark.
WHY NOT  Restating the sublabel as a bare `kubectl` so the block can be lit on every step. The flag
         is what separates this card's kubectl from the one every other cluster card draws, and it
         is the first thing the opening narration names.
CONTENT  Checked against source and standing unchanged, so a later pass need not re-fetch them: the
         required `fieldManager` on Apply and its `kubectl` default, the `--force-conflicts` and
         `force=true` spelling, shared ownership on equal values and the conflict on the next change,
         the removal rule and its condition, `a conflict never provokes failure` for a plain update,
         and every string of the client-side step, whose own doc example removes the same
         `minReadySeconds` this card removes. The `201` and `200` chips are the apiserver patch
         handler: `status := StatusOK; if wasCreated { status = StatusCreated }`. All three cited
         sources were opened and each still carries the sentence it is cited for.
CONTENT  The second applier is `scale-controller`, a name no built-in component carries, and it is
         NOT the HorizontalPodAutoscaler. `pkg/controller/podautoscaler/horizontal.go` writes
         replicas with `Scales(ns).Update(ctx, targetGR, scale, metav1.UpdateOptions{})`, a plain
         update on the scale subresource carrying no fieldManager, so the built-in HPA lands in the
         ledger as `operation Update` under a name inferred from the User-Agent and can never take
         the 409 this card draws. Naming it here would also contradict the ledger step, which
         teaches that exact Update path four steps earlier. Arbitrary manager names are what the
         API reference sanctions: `a workflow can be the users name, a controllers name, or the name
         of a specific apply path like ci-cd`.
WHY NOT  Keeping the HPA and reversing the conflict so kubectl takes the 409, which IS the upstream
         scenario. It costs the force step its lesson: there the doc tells the USER to wait for the
         conflict and then drop the field, not to force, so the card would lose the one rule it
         quotes, that controllers force on objects they own.
CONTENT  The fourth row is `spec.progressDeadlineSeconds`, a SCALAR path. `fieldsV1` addresses a
         list entry by key, `f:containers/k:{"name":"nginx"}/f:image`, so a row reading
         `spec.template.spec.containers[0].image` states an index notation that never appears in the
         ledger the caption says this table IS. The row is inert on every step, so the swap costs
         the worked example nothing and the path is 50 units narrower.
CONTENT  The force step reads `they may not be able to resolve one`, matching the doc hedge
         `they might not be able to resolve or act on these conflicts`. `cannot resolve a conflict
         alone` states as impossible what the doc states as likely.
CONTENT  The ledger step says `one entry per manager and operation`, never `one entry per manager`.
         An entry is keyed by manager, operation, apiVersion and subresource, so one manager holding
         both an Apply and an Update carries two, and the same sentence names both operations, which
         is what makes the shorter wording contradict itself. The worked example is unaffected: both
         managers only ever Apply, so two managers are two entries.
CONTENT  The same step spends the characters on `json or yaml`. `--show-managed-fields` shows the
         ledger only when the output format is one of those two, so `hidden unless you pass
         --show-managed-fields` states a flag that does nothing against the default table output.
CONTENT  The `aria-label` names all THREE regions of the drawing, because it is the only text a
         screen reader gets for the picture (`T-28`): the top row with its ledger, the force that
         resolves the conflict, and the client-side column, which is on screen for all seven steps
         and owns the last one. Stopping at the refusal describes two thirds of what is drawn.
CONTENT  The `desc` opens on `Two field managers`, not `Two controllers`. The card draws kubectl and
         scale-controller, and only one of the two is a controller: the first step says `You run
         kubectl apply --server-side` and the conflict step says `kubectl owns that field`. Field
         manager is also the term the rest of the desc and the whole card already use.
         It closes on `and that record replaces the client-side three-way merge`, with a noun rather
         than a bare `which`: a relative pronoun there attaches to the conflict or to the force
         beside it, and what replaces the merge is the ownership ledger.
         The removal clause carries its condition, `unless another manager owns it too`, because the
         doc conditions it: `If the field is not owned by any other field managers, it is either
         deleted from the live object or reset to its default value`. Paying for it cost `even` out
         of the opening question and two `is what` paddings, never the condition (`T-20`). 457
         characters, inside the 410 to 460 target band.
CONTENT  The ledger chip states its UNIT on every step, `1 entry · kubectl owns 4 fields` and
         `2 entries · kubectl 2 fields · scale-controller 1`. Dropping the noun on the two-manager
         string alone was the one place the chip contradicted itself: `kubectl 2` beside `2 entries`
         reads as two entries for kubectl. The noun costs 49 units of the 68 the chip had spare:
         `render/chipfit.test.mjs` measures the name-to-value gap at 19 against `MIN_GAP` 4, which
         ties the fifth-tightest chip in the catalogue and leaves four cards running tighter. The
         binding viewport is the WIDEST, 1600x1000, where the value is 337.7 units against 300.6 at
         1100x800: the glyphs are a fixed pixel size, so a wider dialog spends MORE viewBox on them.
NOTE     The two right-hand cells are spelled with the primitive's own key names (`label:` and
         `sublabel:`) so `render/inline.test.mjs` reads them where they are written. A `val:` key hides nine
         drawn strings from the lint; a `value:` key makes the lint demand lowercase for a string
         that reaches the canvas as a block LABEL.
NOT A DEFECT
         `report/arrival.test.mjs` reports five R2s here, all its documented blind spot: it samples chips at t=0
         and compares against t=0 of the PREVIOUS step, so a chip rolled back below the guard and
         turned over through at() looks like an uncued change on the NEXT step. Every one IS cued, on
         the step where it happens. DO NOT fix them by lighting a chip on a step where nothing
         happens.
```

### poster

```
Sentence: two managers own sets of fields, and the contested field is where the sets overlap.

Two claim sets drawn as 172 x 88 frames offset diagonally, A at 30,26 and B at 118,66, so they cross
in an 84 x 48 region at the centre of the canvas. Each frame carries its own field as a 0.3 bar in
its exclusive part, and the crossing region carries the one 0.9 accent bar, dead centre. Shared
ownership in server-side apply IS set intersection, so the composition states the model rather than
illustrating it.

DEVIATION, deliberate, twice. The accent block is not a drawn rect but the region enclosed by the
two frames, so it is redrawn as a path tracing their outlines, sharp at the two crossing corners and
rounded at the two that are a frame corner. And it takes the heavier stroke (2 against 1.4) on top
of the accent bar, which is the hub-and-spokes weight-by-LINE mechanism used outside that family:
the intersection has no fill of its own to brighten, since its fill is a third 0.04 layer over two
and already composites to about 0.115.

The two 0.3 bars are placed mirror-symmetric about the canvas centre and PULLED OFF the crossing
edges. Centred in their frames they landed on y 66 and y 114, which are exactly B's top edge and A's
bottom edge, and each bar then read as sitting on the other frame's line.

DO NOT go back to a framed four-row ledger. It was accurate and it was a small diagram rather than
one sentence, and at grid size it read as a sibling of cards it has nothing to do with.

DO NOT go back to the three-in-a-row tug of war this replaces: two manager blocks with the field
block between them on short dashed legs. Three blocks on one baseline with legs between them is
read left to right as a chain of stages, which is the opposite of the sentence; it rhymed with
cluster-resource-quota one card to its left; and the contested field was drawn SMALLER than the two
managers, so the subject was the lightest thing on the canvas.
```

### before `const rowState = (spec) => ({`

```
THE WORKED EXAMPLE, and it has to add up because `render/inline.test.mjs` reads the numbers and a reader follows
the values. One Deployment called web, four fields, two managers:

  step 1 first-apply   replicas 3, minReadySeconds 10, labels.app web, progressDeadlineSeconds 600
                       all four owned by kubectl          chip: 1 entry, kubectl owns 4 fields
  step 3 drop-a-field  minReadySeconds Removed            chip: 1 entry, kubectl owns 3 fields
  step 4 conflict      nothing changes                    chip: 1 entry, kubectl owns 3 fields
  step 5 force         replicas 5, owner scale-controller chip: 2 entries, kubectl 2 fields, scale-controller 1

The last line is the one to check: after the force kubectl owns labels.app and the deadline, which is
2, scale-controller owns replicas, which is 1, and 2 + 1 is the 3 live rows on screen. The word
fields is load-bearing: without it `kubectl 2` reads as two ENTRIES for kubectl, against the
`2 entries` that opens the same string.

WHERE EACH CHIP TURNS OVER. `metadata.managedFields` holds what the API STORES, so it moves when the
request lands there. `last apply` holds what the CLIENT LEARNS, so it waits for the answer to come
home, a full 800ms later. `last conflict` moves with the API decision, on the request landing.
`apply request` never moves at all: PATCH with application/apply-patch+yaml is a standing fact about
the verb, not a per-step state, the same shape failurePolicy has on the webhook card.
```
