## workloads-pvc-stickiness

### layout

```
WHAT     A StatefulSet Pod rescheduled to another Node, keeping its identity and its PVC, with
         the same disk detached and reattached.
LAYOUT   C (bottom strip), and the card with the worst chip damage in the catalog (11 collisions
         before the relayout). panel bottom 330.
           ladder 660..1140
           chips  two across at 548 and 590
           nodes  TWO frames narrowed to 440 each, 60..500 and 700..1140
           PV     in the GAP BETWEEN THE FRAMES, centred on CX at 530..670 x 412..512
         The PV is not in the top row, where it overlaps the Api box outright (850..990 against
         700..920). Between the frames it is also what the card is about, one disk moving between
         Nodes.
LANES    Control: one trunk from TOP2_CX with a jog into the corridor at y=140, a bus SPLIT into a
         left and a right half so each can be hidden with its own tap, and one tap per Node
         landing on that Node's Pod.
         Storage: PV_LANE from the PV's right face to web-0 on Node-2, and PV_MOUNT_A mirroring it
         on the left as the mount web-0 already holds on Node-1. No ball rides PV_MOUNT_A, so it
         carries no arrowhead.
         The trunk leaves TOP2_CX and not TOP1_CX: both the eviction and the binding are API writes
         taking effect on a Node, and the StatefulSet only ever POSTs to the API on the top row.
         The storage lane is its own array and not NODE2_LANE reversed, which would be a control
         route wearing the storage colour.
         No ball carries a literal points array: one such pair ran out to x=1198, off the content
         band entirely, matching no wire on the card.
         The `lanes` helper pins each lane to 0 while the Pod it addresses is not on that Node,
         per the project rule that an absent block dims but its lanes disappear. Without it the
         CSI lane claims the volume is attached to Node-2 on the idle step, contradicting the
         narration.
MOTION   `evict` 2700, `bind` 3200, sized for the trunk leaving TOP2.
```

### before `const lanes = (toA, toB, alive = false) => ({`

```
LANES    `nodeA` is pinned here, not per step, because it CHANGES: Node-1 is at 1 on the idle frame
         and at OPACITY.notready from `evict` on. It has to appear in all five opacity maps: absent
         from them it never leaves full strength, while `pvChip` reads `on lost Node-1` on three
         steps and `reattach` calls that Node unreachable. The card's own POSTER draws the left Node
         at 0.5, dashed, with an X across its Pod, so a Node at full strength contradicts it.
         `alive` defaults to FALSE, which is the reading that keeps this file honest: the Node is
         lost on four of the five steps, so the exception is the idle frame and only it passes the
         flag. It is also what keeps `evict`s opacity line byte-identical to the anchor below it.
         The shade is notready and not OPACITY.terminating. The Node object is not deleted on any
         step of this card, and `reattach` says the volume is force-detached BECAUSE the Node is
         unreachable, which is notready: alive but not serving and not observed (C-07).
```

### before `chain: 0,`

```
Row 0 (`1. running`) is the steady state the idle frame draws, so the poster lights it and the four
narrated steps take rows 1 to 4. The card opens on `chain: 0`. DO NOT open it on `chain: -1` and
then jump to row 1: that leaves row 0 lit by no step at all, five rows against four steps that walk
them.

Both conventions exist in this category and neither is wrong on its own. Eight cards open on
`chain: 0` (their step 0 IS the first state) and nine open on `chain: -1` (their step 1 takes row
0). What is not allowed is mixing them. S-09 is untouched either way:
its machine half asserts step 0 carries no narration, no flow, no motion and no rewind.
```

### poster

```
Two Node frames with the disk drawn BETWEEN them rather than inside either, the left Node crossed
out and dimmed, the right one solid with a filled Pod. The disk sitting outside both frames is the
whole sentence: it belongs to the Pod identity, not to a machine.
The lane to the dead Node is dimmed to 0.4 and the lane to the live one carries the chevron. That
asymmetry is the only direction on the poster, and it is what says the volume FOLLOWED.
```
