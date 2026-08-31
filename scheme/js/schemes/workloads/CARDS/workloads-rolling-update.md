## workloads-rolling-update

### layout

```
WHAT     A Deployment rolling v1 to v2 under maxSurge=1 and maxUnavailable, one surge and one
         drain per cycle.
LAYOUT   A. PANEL_B 205, the shallowest in the category, so both columns fit under it.
           ladder left  60..540 from BAND_Y 226
           chips  right 660..1140 from the same line
           node   full width, 490..624, FOUR slots at 4 x 234, centres 201 / 467 / 733 / 999
           actor  Deployment 420..780, centred on CX
         FOUR slots and not three. maxSurge=1 means the rollout is transiently one Pod ABOVE
         .spec.replicas, which the surge step says in words and counts in its chip as "4 Pods
         alive", so three slots make the drawing contradict the card's own subject.
         The fourth slot is where the surge lands; each drain then frees a slot the next v2 takes,
         and the row ends with its LEFTMOST slot empty because the surge capacity is given back.
LANES    Trunk leaving the API at 990 and stepping into the corridor. No slot centre lands on CX,
         so EVERY tap is a jog and none collapses to a straight drop.
MOTION   A cycle is TWO events, a surge and a drain, which is what takes second-cycle to 6200 and
         third-cycle to 6800.
WIRE LABELS
         The wire label sits above the actor row. At TOP_BOTTOM + 26, below it, it overlaps the
         first ladder row.
NAMING   Pods are named web-a1..web-d4 rather than by ordinal. An ordinal implies an age order the
         drawing never establishes, while the narration says the controller picks the oldest.
```


### before `F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),`

```
MOTION   `surge` drew the fourth Pod in the static block at t=0 and landed its create ball on it at
         3400: measured with the spec timeline, patch arrives 700, the route leaves at 800 and lands
         at 3400, so the create stood 3400ms ahead of its own motion. The Pod now winds back to 0 and
         rises over FADE.in on the arrival, pulse on the same beat. Span stays 4300 of 4500, so no
         duration moved (A-11, M-19).
         Two chips move with it, and only for the reason the sibling card records as NOT needed:
         `progressChip` reads `surged +1 · 4 Pods alive`, which is false while three Pods are
         drawn, and `v2Chip` goes `0 / 0` to `0 / 1`. They take DIFFERENT beats, because they are
         different facts: RS-v2 wants one replica when the scale PATCH lands (700, which is what the
         wire label of this step says), and four Pods are alive when the fourth is on screen (3400).
         Both are bound, never one of them: both are named in `lit`, so binding one promotes its
         neighbour into FORM-E of the chip-beat rule (P-04) and `unit/chip-beat-e.test.mjs` goes
         red. That is the same trap the three counters of `probe-and-drain` are bound against.
         The `slots()` sublabel needs no beat. `pod4Box` reads `v2.0 · starting` from t=0, but it is
         INSIDE the Pod group, so it is invisible for exactly as long as the Pod is.
```

### before `chain: [2, 3],`

```
The ladder ran ONE OFF the steps that walk it. Six rows against six narrated steps looks like a
1:1 map and is not: `probe-and-drain` does rows 2 AND 3 (`The new Pod becomes Ready` then `maxUnavailable
=1 allows scaling RS-v1 from 3 down to 2`), and both remaining cycles are row 4, `repeat`. It used
to set 2 for the pair, 3 for the second cycle and 4 for the third, so the draining step lit `probe`,
the step opening `Same dance again` lit `drain`, and row 4 was never reached at all.

The map now is: spec 0, surge 1, probe-and-drain [2, 3], second-cycle 4, third-cycle 4, converged 5.
Every row is lit by at least one step and no step lights a row it does not narrate. A list is what
`chain` takes for exactly this: a step that is genuinely two rungs.
```

### before `chips: { v1Chip: '3 / 3', v2Chip: '0 / 1', progressChip: 'surged +1 · 4 Pods alive' },`

```
THE COUNT HAS TO MATCH THE ROW. `probe-and-drain` stated `3 Pods alive` at t=0 while its own rewind
held FOUR Pods at opacity 1.0 for 2860ms, and `v1Chip` read `2 / 2` over three live v1 Pods. The
same shape ran on the second cycle (2160ms) and the third (2700ms), where the surge really does put
four Pods on screen mid-step: that is maxSurge=1, the card's own subject, and the chip denied it.

All three counters now wind back to what the previous step settled and step through the cycle on
the beats that earn them:
  probe-and-drain  v2Chip 0/1 -> 1/1 at BEAT.afterPulse (the probe passing is what unlocks the
                   scale-down), then v1Chip 3/3 -> 2/2 and the rollout chip on the drain arrival.
  second, third    v2Chip and the rollout chip take `4 Pods alive` on the CREATE arrival and settle
                   back to three on the DRAIN arrival, so the surge is on screen exactly while it
                   is true.

All three are bound and never a subset of them. `v2Chip` is named in `lit` on all three steps, so
binding its neighbours alone promotes it into FORM-E of the chip-beat rule (P-04), which
`unit/chip-beat-e.test.mjs` fails on. With all three bound the gate is green.
```

### poster

```
Two columns of three, the accent bars ramping 1.0 / 0.7 / 0.4 on the left and the exact mirror on
the right, with one dashed leg and a chevron between them. The mirrored ramp IS the rollout: the
same three slots, the weight moved from top to bottom.
Nothing is added and nothing is removed between the two columns, which is what says a rolling update
replaces in place rather than building a second set beside the first.
```
