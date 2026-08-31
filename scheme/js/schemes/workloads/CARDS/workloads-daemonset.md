## workloads-daemonset

### layout

```
WHAT     One Pod per matching Node, across four Node frames, with a Node joining and a Node
         leaving.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 4 x 34 + 3 x 8 = 160 tall
           ladder 660..1140, 5 rows = 200
           nodes  four frames on the canvas floor, 484..624
         Layout A fits on paper and is not used: the five-row ladder is 200 against a 214 band,
         which leaves about 14 units between the ladder's bottom and the Node row for the bus. The
         mirror leaves 74.
LANES    Trunk from TOP1's bottom midpoint, stepping to WL.SPINE_X at y=140, into a bus at
         NODE_Y-24 with ONE TAP PER POD. Each step routes its ball down the tap of the Pod that
         actually reacts, and the create step fires three, one per matching Node. `LANES` is built
         ONCE, one array per Pod, and the `P.lane` and every `F.route` index it, so the drawn wire
         and the ball are the same array (A-02 SHARED). All 6 routes read it and none is carried.
         Do not rebuild it as a `LANE(i)` factory: a fresh array per call leaves the lane and the
         ball two equal copies, which come apart on the first geometry edit.
         A lane into a Node not in the cluster is pinned to 0: lane 3 until Node-4 joins, lane 1
         once Node-2 leaves.
         ONE lane for the whole card lands on Node-1's top edge on EVERY step, including the step
         that adds a Pod to Node-4 and the step that deletes the Pod on Node-2, which is what the
         tap per Pod is for. A straight trunk at x=530 cuts through the chip column 60..540.
```

### poster

```
One Pod per node across the cluster: three nodes each hold a single Pod, the dashed node
on the right is joining (the + marker) with its Pod still forming. The uniform 1:1
pod-to-node mapping is the DaemonSet signature.
```

### before `const create = (i, rank) => [`

```
Both counters climb PER ARRIVAL, not at step entry. The narration is `creates one Pod on each` and
the card draws three separate creates, so the count climbing alongside the three Pods appearing IS
the step. The `chips:` block states `0`, which is the entry state the last paragraph demands, and the
`3` is written by the `F.set` inside each create. `flow` runs on the ANIMATED path only, so a
reduced replay of this step ends with both counters still reading 0. Chip text is not one of the
four axes `render/reduced.test.mjs` compares (only WIRE-TEXT is), so nothing in the suite sees it.

The visible sequence is 0, 2, 3 and NOT 0, 1, 2, 3. Two of the three taps sit 138 units off the
spine against the third's 414, so those two land in the same millisecond and the `1` is overwritten
in the instant it is written. In full: 594 units of lane arrive at 1320ms twice over, 870 units at
1933ms once. That was equally true of the accumulator this replaced, which hid it.
The rank each landing writes is a literal, and NOTHING in the suite can see it: swapping two ranks
leaves every check green. Opening the mid-count frame is the only guard there is.

Neither counter is read from step entry. The step says the controller sees three matching Nodes
and ZERO Pods, and the Pods do not fade in until their creates land about 2s later, so a counter
reading `3` at entry contradicts the narration it accompanies. `numberReady` is the worse half.
```
