## workloads-termination-order

### layout

```
WHAT     Shutting a Pod down runs its start order backwards: the app container is stopped first,
         and the native sidecars follow in the reverse of the order they are declared in, so each
         one is still there for whatever depended on it.
LAYOUT   No A / B / C preset. PANEL_B 230.
           chips   a 2 x 3 GRID over BOTH columns, 60..540 and 660..1140, 3 x 34 + 2 x 8 = 118,
                   so 250..368. Left column one live chip per container in spec order, right
                   column the two orders read against each other and the budget they share
           node    full width, NODE_H 218 on the canvas floor 624, so 406..624
           pod     196..1004 x 422..608, centred on CX, holding a three-row container STACK
         The stack is the composition and the reason for it: read DOWN it and that is the order
         the Pod declares, read UP it and that is the order the Kubelet stops it in. A row of
         three peers says the two orders are the same picture read twice, which is what the card
         exists to deny.
         The actor row is reversed against workloads-init-containers-and-sidecars: the Runtime
         sits on CX and the Kubelet to its right, because the Kubelet asks and the RUNTIME is
         what sends the signal, so the spine leaves the box that acts (A-09).
         There is no P.chain, against 9 of the 10 other cards in this section. Six chips fill
         both columns, and a ladder here would restate the six narrations.
PANEL    Measured over the three viewports, deepest step in brackets:
           1600x1000  x<=290.77  y 142.56..160.00
           1280x860   x<=377.76  y 171.42..192.67
           1100x800   x<=396.55  y 204.97..229.82  (step 4, the deepest wrap)
         It pins BAND_Y and therefore the whole content band: the chip grid starts 20 below it,
         at 250, and the left column at x=60 is legal only because it sits under that bottom
         (L-03). The panel swings 69.82 units across the viewport set, so a narration longer
         than step 4 spends the 20 unit gap first (L-08).
SIZES    Chips 480 wide. The widest pair is `grace budget` at 73.6 against
         `terminationGracePeriodSeconds 30` at 196.3, measured at 1100x800, which leaves 210 of
         air in the middle of the row.
         Container boxes 748 x 40 inside a 808 wide Pod, a 30 pad a side. 40 is the shortest
         box height in this category and it is what three rows plus the Pod label cost: 30 of
         head room, 40 + 8 + 40 + 16 + 40 of stack, 12 of foot, so POD_H 186.
         The widest container sublabel measures 294.5 at 1100x800 inside 748.
LANES    Three, and the top two are a WL.A-01 pair. REQ carries StopContainer from the Kubelet
         to the Runtime, RESP carries the exit report back, and 2 of the 6 narrated steps ride
         the answer. SPINE runs from the Runtime bottom face midpoint to the Node FRAME face
         midpoint at 406 (WL.A-03), never to the Pod top at 422, and it is drawn downward only.
         No lane reaches a container: the ball lands on the frame and the container it is
         addressed to lights on that arrival, which is what every peer-container card here does.
MOTION   Eight balls over three steps. The top hop is 56 units, under the PKT_DUR_MIN floor, so
         routeDur clamps it to 700ms and it runs at 0.080 u/ms: five other cards run that exact
         length and it is the house reading of M-13. The spine is 286 units, also under the
         floor, at 0.409 u/ms.
         Steps 4 and 5 are three chained hops, report then call then signal, and span 2860
         against 3400 and 3500.
         Each container EXITS as a fade over FADE.out rather than as a dim shade pinned at step
         entry: web on step 4, log-agent on step 5, and mesh-proxy alongside the shell on step 6.
         All three run at delay 0, which is the shade workloads-graceful-shutdown fades its Pod
         on, and it puts the exit in the same instant as the report that carries the news of it.
         The shade is pinned in the static block as well, so the reduced path lands on the same
         picture (S-13, S-15).
CONTENT  Every claim is read off a page this card cites.
           The Kubelet delays the TERM signal to sidecar containers until the last main
             container has fully terminated: Pod shutdown and sidecar containers.
           Sidecars are terminated in the REVERSE order they are defined in the Pod spec: the
             same section, and the Sidecar Containers concept page in the same words.
           A sidecar is an init container with restartPolicy Always: both pages. The card names
             the slot in each container sublabel and teaches the declaration nowhere.
           The default terminationGracePeriodSeconds is 30 and one budget covers the Pod: the
             Pod Termination Flow section of the same page.
           If the grace period expires while containers are still terminating, the Pod may enter
             forced termination and all remaining containers are stopped simultaneously with a
             short grace period: Pod shutdown and sidecar containers.
           A sidecar killed at the end of the budget exits non-zero, and that is normal on
             termination rather than a failure: the Sidecar Containers page, under differences
             from application containers.
         The plural rule, that regular containers are signalled at different times and in an
         arbitrary order, is in the desc and the aria-label and in NO narration, because this
         card draws ONE app container and a step naming a plural would name an actor that is
         not on the canvas (T-21).
         No feature-stage or version number appears in any narration: the sidecar GA version is
         a fact about the declaration, which belongs to the sibling that owns it, and a number
         spoken here would be drawn nowhere.
BUDGET   The longest narration is 331 characters and the deepest panel is 229.82. The chip grid
         starts at 250, so 20 units of clearance is the whole budget a longer narration has.
SCOPE    workloads-graceful-shutdown owns the grace budget itself, the endpoint deregistration
         and the SIGKILL at zero. This card SPENDS that budget and never runs it: the grace
         chip states the field and its default on every step and never ticks, and no step of
         this card narrates SIGKILL.
         workloads-hooks owns the preStop slot and how the Kubelet executes a handler. preStop
         is one clause of one narration here and carries no chip, no box and no drawn state.
         workloads-init-containers-and-sidecars owns the START order and the sidecar
         declaration. This card owns the reverse, and it points at the declaration through the
         container sublabels rather than explaining it.
         cluster-graceful-node-shutdown owns shutdown ordering by priority when the NODE goes
         down. That is a different sequencer over different objects and nothing of it is drawn.
NOTE     The three container states in the left column and the growing list in `stop order` are
         written from one step literal each, so the row and the list cannot disagree. The list
         is the only place on the canvas where the sequence exists AS a sequence.
WHY NOT  The dependency graph is not drawn. The reverse order exists to keep each container
         alive for the ones that needed it, which is three relationship lines: web out through
         mesh-proxy, log-agent out through mesh-proxy, and web into the log file log-agent
         tails. Every route for them crosses the Pod shell or a container box between the two
         ends (L-10), so the dependencies are carried by the container sublabels and by the
         narration instead.
WHY NOT  The Pod carries no sublabel. pod() prints one at h - 8, which lands on the bottom edge
         of the web container box, and both neighbours in this section pass an empty string for
         the same reason.
DO NOT   Give the three container boxes different roles. They are peers of one Pod, and a violet
         box beside two blue ones reads as a category difference the palette does not mean.
DO NOT   Even the gaps in the stack out to 8, 8. The 8 between the two sidecars against 16
         between them and the app container is what makes the row read as a pair plus one. Three
         equal gaps draw a symmetric picture of an asymmetric mechanism, and the mechanism is
         that one of the three is categorically different from the other two.
NOT A DEFECT
         NODE_H 218 against the 134 / 140 the rest of this category draws. There is no
         catalog-wide frame family (L-23) and the number is the Pod it holds: 186 of Pod plus 16
         of frame air a side. The alternative is a container row rather than a stack, and the
         stack is the card.
NOT A DEFECT
         Step 3 stands completely still for its whole 2900 and is near the still end of the
         catalog. It is packet-less and Pod-less by construction (M-27, which rules F.flash out
         as a second option), and it sits in the faster half on reading pace, so the hold is
         buying reading time rather than standing empty. Both rankings are printed on demand by
         card-review/tools/deadair.mjs and are deliberately not copied here, because a catalog
         rank goes stale the moment a card lands in any category. Two steps of
         workloads-ephemeral-containers carry the same shape.
NOT A DEFECT
         `report/arrival.test.mjs` prints this card nine times on R2-ENTRY and three times on
         R2-STEP, and all twelve are ruled and carried in `test/fixtures/carried.mjs`. Six are
         values written statically and cued by `lights:` on the ball that carries the signal,
         which a frozen t=0 sample cannot see. The other six report a container that has already
         EXITED, where the cue is the box fading to OPACITY.terminated: a lit chip beside a
         ghosted box would say the two disagree, and a highlight on this card means the container
         the step is acting on.
NOT A DEFECT
         The `declared order` chip never changes value over the seven steps. It is the reference
         the `stop order` chip below it is read against, and a spec order that moved would be a
         different Pod.
```

### before `const LCOL = WL.COL_L, RCOL = WL.COL_R;                  // 60..540 and 660..1140`

```
The columns are read straight off WL rather than through LAYOUT.A / .B / .C. The preset picks
which column holds the ladder and which the chips, and this card has no ladder: the chip grid
takes both columns, so there is nothing for WL.L-06 to choose between. It is the seventh card in
this category to read no preset, and the reason is the same one the other six give.
```

### before `const NODE_H = 218, CANVAS_B = 624;`

```
The frame is sized to a Pod holding a three-row stack, and 218 is 186 of Pod plus 16 of air on
each side. It is the tallest node() frame in this category against a 134 to 158 spread, and the
band is affordable because the chip grid is 118 tall over both columns rather than a 200 tall
ladder down one of them.

The frame label prints at x + 12, y + 18, so it inks from 72 at y 413..427.7 and the Pod starts
at x 196: the label has the whole left flank of the frame to itself.
```

### before `        for (const k of ['containerProxy', 'containerLogship', 'containerWeb']) el.appendChild(refs[k]);`

```
buildPod carries exactly ONE inner box and this card needs three peers. They are appended INSIDE
the Pod group rather than beside it, because pulsePod reaches only what the Pod contains and the
step that marks the Pod terminating blinks all three with it.

box() defaults its role to the empty string, so the kit binding is not inherited here and
`role: 'workloads'` is written out three times. It equals the binding and is not a
cross-category override.
```

### before `const stage = (o = {}) => ({`

```
One factory for the shell and the three containers together, in the shape A-16 asks for. Each
container drops to OPACITY.terminated on the step AFTER the one that signals it, which is what
makes the reverse order legible in a single still frame rather than only in the chips. The drop
is ANIMATED over FADE.out at delay 0 and pinned here as well, so a reader sees the container go
and the reduced path still lands on the same shade.

The last step fades the SHELL and not the group. The containers are already at 0.12 and a group
fade multiplies, which would take the stack to 0.014 and cut it out of the picture entirely
(C-14). Fading the shell and mesh-proxy separately lands the whole block on one shade.
```

### before `    id: 'route-still-open',`

```
The step that answers why the order is what it is, and the only one with no ball and no Pod
acting. Its beat is the two sidecars and their chips standing lit under a draining app
container, which M-27 asks to be carried by the static highlight alone.
```

### poster

```
One Pod of three stacked slabs read from the bottom up. The fill ramp brightens down the stack,
the single 0.9 accent bar sits in the bottom slab because the app container is the one that goes
first, and the two above it carry the same bar at 0.3. A dashed comb in the right gutter takes
an arm off all three slabs, so the sequence ties every one of them rather than jumping from the
bottom to the top. No arrowhead: the direction is the ramp and the accent, which is R-08.
```
