## cluster-etcd-raft

### layout

```
WHAT     One write through Raft: proposal to the Leader, replication to the Followers, quorum, apply,
         and what happens when the majority is gone.
LAYOUT   One semantic band, centred rather than inflated.
           M         40, both sides, so the bbox is 40..1160 and still centred on 600. That is the
                     only way to buy the proposal label its gap without narrowing the API off the
                     220 standard width
           SCHIP_W   API_W (220): the API and the three state chips are ONE column, and at 320 they
                     end 100 units apart, which makes the left stack read as two
         Panel bottom measured 230, and CYL_Y is 230, so the panel is one unit off the artwork:
         the longest narration on this card IS the layout constraint, ceiling 334 characters.
         A pure slide-up keeping ARC_RISE 32 leaves the band centre 28 low and the top-right a 198
         unit empty strip.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=cluster-etcd-raft node --test report/overlay.test.mjs`.
         Deepest on step 0 at 1100x800, shallowest on step 4 at 1600x1000, a swing of 69.82 units.
         The API box at y 255 clears the deepest bottom by 25.18, which is the tightest clearance on
         this card and what pins the box.
         CYL_Y 215 is the mathematical minimum and is not taken: the API's top edge then lands
         exactly on the panel bottom with zero clearance, one narration line from an OCCLUDED
         finding at 1100x800.
LANES    THE TWO ARCS ARE CONCENTRIC, NOT MIRRORED, and that asymmetry is the fix rather than a slip.
         Built by mirroring (outbound on CX - LANE_DY at both ends, ack on CX + LANE_DY at both) the
         pair crosses one dash above ETCD-3: the ack horizontal runs y=162 from 1072 to 552 and the
         outbound vertical comes down into E3 at x=1048 through y=162, which is inside that span.
         The fix gives E3 the SAME hand as E1 rather than the mirrored one: both cylinders SEND from
         their left stub and RECEIVE on their right, outer 528 -> 150 -> 1072 -> down, inner
         1048 -> 162 -> 552 -> down, nested on all three sides. Mirroring is what makes E3 the
         opposite of E1, and that is the pair that crosses.
         Each cylinder top still carries a mirrored pair straddling its own midpoint, which is all
         OFFEDGE judges.
         The API does not move into the free bottom-left with an L-lane up into ETCD-1: every
         cylinder's bottom face is already taken by its role-chip binding, and the straight
         API-to-Leader lane IS the "single point that orders all changes".
         The three cylinder-to-role-chip ties go through relationPath, one forEach rather than three
         near-identical statements. ROLE_Y is CYL_BOTTOM + 30, not +16: at 16 units a `5 5` dash
         renders a tick and a half, which reads as a rendering slip rather than as a relationship.
MOTION   The hold on the two packet-light steps is sized by READING LOAD, not by motion: `proposal`
         holds 2700 for 331 characters and `append-log` 2400 for 312, which is 8.16 and 7.69 ms per
         character. `append-log` registers no animation at all, so its duration IS the reading time.
         Where a pace sits against the catalog is `card-review/tools/timing.mjs`, the only thing that
         divides the two.
         No ball is sent into a member that is not answering. It says the opposite of the step, and
         nothing comes back either, so there is no return to draw. The step carries its beat with
         the fade and with .highlight on the four chips that move.
         The silent pair holds OPACITY.notready (alive but not serving, not observed), not
         terminated, which would also put the card one .highlight away from a `render/opacity.test.mjs` LIT.
         THIS CARD IS THE WORKED EXAMPLE THAT `chips` IS NOT WHAT STANDS ON SCREEN. `quorum-lost`
         declares `r1: Follower` and `l1: 10 / 9` in its static block, which is where the step ENDS,
         and the `rewind` puts `Leader`, `9 / 9` and a met quorum back on the animated path so the
         step can start from the healthy cluster it narrates. Two `F.set` then walk it forward again,
         the counters at FADE.out and the role at FADE.out + BEAT.lead. So reading a card for what a
         chip shows at any INSTANT means playing `chips`, then `enter`, then `rewind`, then every
         `F.set` in flow order: the static block alone is the reduced path and the end of the step,
         never the beginning of it. The step comment writes that last beat as 1501ms, 700 + 800.
         `replicate` and `apply` run ONE construction over the same two lanes, because both deliver
         something the Follower log chip reports: the chip holds the value the step before left, the
         `rewind` puts it back on the animated path, and an `F.set` turns it over when THAT
         Follower's own packet lands, at 700ms on l2 and 1564ms on l3. Both chips therefore carry
         .highlight from step entry while still reading the old value for that long, because a
         highlight is static and the turnover is not. That lead is the price of the beat and not a
         value standing ahead of its ball: `report/chip-beat.test.mjs` FORM-A excludes a key that an
         `F.set` with a positive delay turns over in the step, so neither step reaches its FORM-B
         queue. What the construction does cost is four rows on `report/arrival.test.mjs` R2-ENTRY,
         which reads both of its samples frozen at t=0 and so first sees each turnover on the step
         AFTER it, where the chip is not lit: `quorum` carries the pair `replicate` earns and
         `quorum-lost` the pair `apply` earns. Dropping either `rewind` trades that frozen-sample
         artefact for a real defect, a Follower reading a commit index the ball still in flight is
         carrying. R2-STEP, settled against settled, holds this card on neither list. Cueing one
         chip of a pair and not the other costs more than the lead does.
WIRE LABELS
         Five strings in four slots, one per narrated exchange. `proposal` sits 14 ABOVE the
         outbound row lane and `report` 21 BELOW the answer lane: a text box reaches about 11 units
         above its baseline, so 21 is what buys the same 10 unit optical gap that 14 buys on the
         other side. `replicate` sits 10 above the outer arc and takes a second string on `apply`,
         `ack` sits 18 below the inner arc, so each arc label hugs its own line from the outside.
         Measured at 1600x1000 the two arc labels clear their line by 6.6 and 6.8 units, and `report`
         runs x 288..412 against the API ending at 260 and ETCD-1 starting at 440.
CONTENT  The acks chip COUNTS and does not judge: `0 of 2`, `1 (then 2)`, `2 of 2`. The verdict lives
         on the quorum chip, `2 of 3 ✓ at ack 1`. A tick on the SECOND ack teaches that the commit
         waits for both Followers, and it does not: in a group of three the Leader plus one Follower
         is already the majority, which is why a three-node cluster survives losing a Node.
         The chip is named `acks from Followers` rather than `acks (entry 9)`, so it states its own
         population: `2 of 2` above `quorum: 2 of 3` counts two Followers against three replicas, and
         together they read as a contradiction.
         The sixth step is quorum loss, and every fact in it is from raw sources rather than a
         summary. etcd's raft Config.CheckQuorum makes the Leader step down when quorum is not active
         for an electionTimeout, and server/etcdserver/bootstrap.go sets it true unconditionally, so
         ETCD-1 goes Leader -> Follower and the card ends with no Leader. Writes fail with
         `etcdserver: request timed out`, which is ErrGRPCTimeout in api/v3rpc/rpctypes/error.go
         verbatim. READS SPLIT, and that split is the value of the step: linearizable reads must go
         through consensus, a serializable range request is served locally. So `reads keep working`
         is wrong and `nothing works` is wrong.
         What a read costs is a MODE, not the health of the quorum. The apply step reads `a
         linearizable read returns it from any member`, and both halves are load-bearing: a Follower
         serves a linearizable read by asking the Leader for a safe read index rather than forwarding
         the client (etcd-io/raft README), and `while quorum holds every read returns it
         consistently` is REJECTED because a serializable read `may access stale data with respect to
         quorum` at any time (etcd API guarantees), quorum health or not. The qualifier that names
         quorum reads as though quorum were the only thing between a client and a stale value.
         The API is the only ETCD client BY POLICY rather than by construction. The proposal step
         reads `it should be the only component reaching ETCD at all`, taking the hedge the cited
         page takes: `ideally only the API server should have access to it`, on a page whose own
         troubleshooting section covers `clients besides the Kubernetes API server`. `the only path
         by which Kubernetes state ever reaches ETCD` is REJECTED: it states a guard that etcdctl and
         any credentialed client walk straight past.
         The same step keeps `A write that lands on a Follower is not served there but forwarded to
         the Leader`, which holds by default: raft Config.DisableProposalForwarding exists to turn
         that forwarding OFF, so on it is the shipped behaviour. It says `write` and not `request`
         because the sixth step serves a read locally.
         The append step reads `until a majority holds it, and the Leader counts as one`. `a majority
         of replicas ALSO hold it` is REJECTED as off by one: `also` reads as a majority ON TOP of
         the replica that already has the entry, which is 3 of 3, and the commit needs 2.
         `apply` names a state machine and the clients that read it, and neither is a drawn
         block. The state machine sits INSIDE the Follower that IS drawn, and the beat the picture
         owes that step is the commit index arriving, which the log/commit chip carries.
```

### poster

```
Sentence: one replica leads, and the write counts once the majority has it.

Three cylinders on one row, each holding a stack of 40 x 6 log entries. The LEADER is the leftmost
and is said three ways at once: stroke 2 against 1.4, fill 0.07 against 0.04, and the single accent
bar at 0.9 on its NEWEST entry, the one being replicated. Every other bar in the frame is 0.3. The
third cylinder holds two entries against three, so it is one behind, and the ENTRY COUNTS 3 / 3 / 2
are what say the majority: two of the three have the newest entry and the write commits.
A bracket at stroke-opacity 0.7 runs under all three cylinders and groups them as ONE cluster, which
is the composition floor rather than a count. It spans x 30 to 290, the full width of the row.

Connections: a dashed leg from the leader to the near follower and a dashed arc from the leader over
that follower to the far one. BOTH ORIGINATE AT THE LEADER, which is the topology Raft has, and the
arc only passes above the middle cylinder rather than touching it. Calling that arc one that `spans
all three` is wrong and is what makes a reader call the pair asymmetric: a span reads as a bus
joining every member, where this is two leader-to-follower links and one of them has to hop.
No arrowhead: the links are relationships and the direction is in the accent.
Bottom ellipses at stroke-opacity 0.35 so the cylinders read as open volumes rather than capsules.

WHY NOT saying the leader by FILL alone, 0.06 against 0.04: a two percent difference on a dark
canvas does not exist at the 200px the grid renders, so all three cylinders read identical. Strip
the log entries, the bracket and the accent with it and the frame says `a replicated store` rather
than `consensus`, with quorum, the card's whole punchline, absent from it.

TWO OF THREE BARS BRIGHT WOULD BE TWO ACCENTS. The majority is drawn by the COUNT of entries rather
than by lighting both members, which is why `R-07` holds with a single 0.9 in the frame. Do not
light follower A's third entry to `show` it acked: it already HAS three bars where the far follower
has two, and a second bright bar costs the leader its accent.

DEVIATION, deliberate: 26 primitives, the HIGHEST count in the catalog, and
`poster-lint` reports it as `R-02` beside the median it is over. Fifteen of the 26 are the three
cylinder glyphs themselves, five
each (top ellipse, two sides, the filled front arc, the faint back ellipse), a cost no rect-based
poster pays and the reason the median is not comparable here. The remaining eleven are eight log
entries, two links and the bracket, so the CONTENT sits at eleven, below the median. No free cut
exists: dropping the back ellipses turns the cylinders into capsules, and cutting the stacks to
2/2/1 loses the reading of a LOG in favour of a pair of marks.
```
