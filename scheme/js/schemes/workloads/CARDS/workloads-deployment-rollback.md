## workloads-deployment-rollback

### layout

```
WHAT     A bad rollout stalls past progressDeadlineSeconds and is undone, with RS-v1 never
         scaled down.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 160 tall
           ladder 660..1140, 6 rows = 242
           row    FOUR slots, 4 x 234 at centres 201 / 467 / 733 / 999, Pods web-a1..d4
         Layout A is out: the 242 ladder does not fit the 250..464 band; the 160 chip column
         does.
         FOUR slots and not three. Every step pins RS-v1 at 3 / 3 and the wedged step says RS-v1
         keeps ALL THREE v1.0 Pods serving, so the three v1 Pods must be drawn at once. With three
         slots the broken v2 stands in one of their places and the row shows two survivors against
         a chip saying three. The fourth slot carries the whole v2 story alone: it appears on the
         rollout, crash-loops, wedges, and is DELETED by the undo rather than converted back into
         a v1, which is what the undo step narrates.
LANES    ONE lane, because only the surging Pod ever receives a ball: trunk from TOP1's bottom
         midpoint, step to WL.SPINE_X at y=140 to clear the chip column, bus at NODE_Y-24, tap
         into web-d4 at centre 999.
MOTION   Steps 1, 2 and 4 run 3700 / 2900 / 3700, sized to the four-slot route.
```

### poster

```
Revision history with a rollback: rev 1 (good) and rev 3 (restored copy of rev 1) carry the
same version bar, rev 2 (bad) is dimmed and struck out, and a solid counter-clockwise undo
arc sweeps from the current revision back over the bad one to the good revision.
```

### before `const slots = (...vs) => ({`

```
LANES    The one lane ends on web-d4 and on nothing else, so its shade is that slot's shade (A-13)
         and it leaves when the slot empties (A-14). `slots()` pins both from one argument, which is
         why no step can state them apart. Measured with `effectiveOpacity`, after against before:
         `stable` 0 against 1, `rollout` 1 against 1, `bad` 0.40 against 1, `stuck` 0.40 against 1,
         `undo` 0 against 1, `restored` 0 against 1. The Deployment box, the source end, is 1 on all
         six steps, so min(source, sink) IS web-d4. `bad` was the loudest of the six: nothing travels
         on that step at all, so the lane was the only full-strength thing left pointing at a Pod at
         OPACITY.notready.
         The lane is not held at 1 on `stable` and `restored` to keep the two halves of the picture
         joined. On both steps the fourth slot is EMPTY, so the lane would end in blank canvas
         inside the Node frame, which is the case A-14 calls a rendering fault rather than a dim
         relationship. The frames at 1600x1000 and 1100x800 read better without it: three v1 Pods
         and no dangling arrowhead, and the trunk arriving with the surge is a beat the card did
         not have.
         It IS at 1 for the 2700ms of `rollout` before web-d4 appears, pointing at an empty slot.
         It is carrying the create ball over that whole window, and A-15 outranks A-14 while a ball
         is in flight. `workloads-replicaset` step `converge` is the same trade, taken the same way:
         its rewind brings the bus tail and tap3 back for the flight that deletes the Pod.
MOTION   `bad` and `undo` fade the lane on the SAME beat as the Pod, same duration and easing (800
         and 2700, FADE.out), and both rewind it so it is on screen for the whole flight (A-15). Both
         spans stay 1500 and 3600 against durations 2900 and 3700, so no duration moved.
```

### before `rewind: { opacity: { pod4: 0 } },`

```
The surge Pod winds back to absent and rises over FADE.in on the arrival of the create ball, with
the pulse on the same beat. DO NOT draw it in the static block at t=0: the ball lands 2700ms later,
so the arrival announces something already on screen.

The chips did NOT have to move with it, and that is worth writing down because the sibling card
`workloads-rolling-update` needed exactly that on the same repair. Nothing here counts live Pods:
`rs2Chip` reads `0 / 1`, which is Ready 0 of desired 1 and is TRUE of a Pod that has not appeared
yet, and `rs1Chip` reads `3 / 3` over the three v1 Pods, which never leave. On rolling-update the
same step states `4 Pods alive`, which is false until the fourth is drawn.
```

### before `F.pulse({ pod: 'pod4' }),`

```
`bad` carries NO packet, and that is the content: the sentence is that the readinessProbe NEVER
passes, so no Ready report ever leaves the Pod. It crash-loops in place, pulses, and settles to
OPACITY.notready a beat later. A-06 decides this: a lane earns a ball when a step names something
travelling, and this step names a report that does not happen.

It fires NO route and `apiserver` is out of `lit`: nothing arrives there, and `stuck` next door
lights no actor at all. DO NOT give it a route named `status` whose points array is SPINE,
byte-identical to the `surge` CREATE route of the step before it: that draws a probe failure the
step reports UPWARD as the controller sending something DOWN into the Pod (A-03).

There is no return lane. Mirroring SPINE at the card's lane delta means moving the shared endpoint
on web-d4's top face to make the pair L-12 allows, which retimes the `rollout` and `undo` routes as
well (A-11), and it would draw traffic the step says never leaves.
```
