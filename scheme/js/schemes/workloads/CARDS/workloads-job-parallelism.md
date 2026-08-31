## workloads-job-parallelism

### layout

```
WHAT     Three workers running in parallel, one failing and being replaced, until completions
         is reached.
LAYOUT   C (bottom strip). panel bottom 280.
           ladder 660..1140 at y=140
           chips  full-width strip, THREE per row at 350.67, two rows 548..624, short row centred
           node   three worker Pods, row starting at x=84
         A chip column does not fit: 202 tall against a left band of 164. The widest value needs
         258, so three per row at 350.67 clears it.
         POD_TOP_PAD is 24. At a smaller pad the frame's own NODE-1 label is drawn inside
         worker-1's shell.
LANES    Trunk TOP1 midpoint -> WL.SPINE_X at y=140 -> bus at NODE_Y-12, tapping all three Pods.
         Each step fires one ball per lane through the card-local `fan`. The middle Pod centres
         exactly on WL.SPINE_X, so its lane skips the bus point rather than drawing a zero-length
         segment. `LANES` is built ONCE, one array per worker, and the `P.lane` and the `F.route`
         inside `fan` both index it, so the wire and the ball are the same array (A-02 SHARED). All
         6 routes read it and none is carried. Do not rebuild it as a `LANE(i)` factory: a fresh
         array per call leaves two equal copies free to drift on the first geometry edit.
         Measured: taps 0 and 2 sit 366 units off the spine, so their lanes run 726 units and land
         at 1613ms, tying for last; tap 1 runs the bare 360 units and lands at 800ms. That tie is
         why the counting chip hangs off `create0` rather than off whichever ball arrives last.
MOTION   3500 / 2600 / 3500 / 2200, sized to the routes. The two steps that fire the three creates
         run 3500, the longest ball taking 1613ms on its own lane after the top hop and its beat.
         The two that carry no down-balls at all are shorter:
         `partial` at 2600 over a span of 2060 (see its own note), `complete` at 2200 over a span
         of 900, which is the three exit pulses and nothing else.
```

### before `'1. spec     ·  parallelism=3, completions=5'`

```
CONTENT  `completions` is 5, not 6, and the number is forced by the wave count the card DRAWS.
         Six completions with parallelism 3 and one failure needs SEVEN Pod runs and therefore
         three waves: wave 1 yields 2 successes (unit-3 fails), wave 2 is the unit-3 retry plus
         units 4 and 5 and takes the count to 5, and unit 6 then runs alone. This card draws two
         waves, so it is a five-completion Job and the chip said 6.
CONTENT  What the mismatch cost: `succChip` walked 2 to 6 on `complete`, a delta of FOUR, against
         THREE sublabels reading `done · exit 0`, and `unit-4` was written once on `retry` and
         never resolved because `pod1Box` then read `unit-6 done`. At 5 the delta is 3, one per
         sublabel, and each slot finishes the unit it started: 4, 5 and the unit-3 retry.
         Keeping 6 and stepping the count through `complete` (2 -> 5 on the exit pulses, then a
         create for unit 6, then its exit) is honest but turns the shortest step on the card into
         a three-beat sequence: 2200 -> about 4500, against the span of 900 the MOTION block
         prices `complete` at.
NOTE     The poster's six cells are not a count of completions. It draws done-over-running, which
         is the sentence, and R-02 keeps a poster from being a small diagram.
```

### poster

```
Six identical cells in two rows: the top three carry a tick, the bottom three a progress bar at 0.5.
Completed over running, and the counting is the whole sentence.
Every cell is the same size and fill on purpose. A Job's workers are interchangeable, so making any
one of them distinct would contradict the card.
```
