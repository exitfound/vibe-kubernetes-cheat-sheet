## network-pod-ip-and-veth

### layout

```
WHAT     A veth pair is one virtual link with two ends standing in two different network namespaces,
         and the address hangs on the Pod end because a namespace is what holds an address.
LAYOUT   TWO PEER NAMESPACES ON ONE MACHINE, AND ONE OBJECT WITH AN END IN EACH. The `Node-1` frame
         is the machine and carries no namespace in its label, because both namespaces are on it and
         neither is inside the other. What divides them is the POD SHELL RIGHT WALL at x=760,
         continued above and below the shell by two dashed segments off the same x, so the line a
         reader sees cutting the Node is the Pod own edge extended rather than a second boundary
         drawn beside it. Two `P.tag` captions name the territories either side of it at y=186.
         The inner geometry is DERIVED and not typed. `POD_H` 298 is the sum of its parts,
         `LABEL_BAND` 36 plus three `ROW_H` 56 at one `ROW_GAP` 20 and one `SPLIT_GAP` 36 plus
         `FOOT` 38, so a row added or a gap changed moves the shell rather than leaving it at a
         stale literal. `NODE_H` 454 is then derived off the shell in turn, twice the 78 the Pod
         leaves above it plus `POD_H`, so the frame's bottom margin equals its top by construction.
         `BOX_X` 489 is
         what `BOX_W` 232 leaves centred inside `POD_W` 310, and `PEER_X` 878 is `IN_R` less the same
         232, so the two ends of the pair sit on ONE row, `ETH_Y` 412, by construction. Re-typing an
         x here is what puts a row off the shell centre, which is the defect the derivation exists
         to prevent.
         TWO CONTAINERS AND ONE INTERFACE, NOT THREE PEERS. `pause` and `app` stand at `ROW_GAP` 20
         and `eth0` drops clear of them by `SPLIT_GAP` 36, so the stack reads 2 + 1. Held at one
         pitch, three identical 232x56 boxes say eth0 is a third container, and that is the opposite
         of what step `unit` claims in words. The gap is half the separation and the cable is the
         other half: it reaches eth0 and neither container.
         THE CHIP READOUT IS A COLUMN, four rows at x=60 in the gutter the panel leaves below itself,
         and this is the one lever no sibling in the section carries (`kin.mjs`, 21 cards catalog-wide
         and the only one of the 8 here). A wide strip, which 6 of the other 7 take, would run
         straight through the namespace boundary the whole card is built on and would read as four
         independent readouts, where these four are facts about ONE object. The column then narrows
         the Pod zone, which is what stacks the three containers vertically: every other card in
         this section rows them.
PANEL    Deepest at 1100x800, 204.97 down and 396.55 wide: `OVERLAY_IDS=network-pod-ip-and-veth node
         --test report/overlay.test.mjs` from `scheme/test/`. NOTHING on this card is measured against
         that rectangle, because nothing shares its band: the Node frame opens at x=420, which is
         23.45 clear of the wall and the `L-03` line exactly, and the chip column opens at y=246,
         41.03 clear of the floor. The frame is therefore free to run 130..584 and use the full
         height right of the panel, which is what the deep left gutter buys.
SIZES    Four actor blocks at `NET.L-01`'s 232 and no departure: `pause`, `app` and `eth0` inside the
         shell, and `peer` and `cni0` in the bridge column, which is the same 232 read off `IN_R`.
         The chip column is 300 wide against the four longest values it carries, `two ends, one link`
         at 18 characters being the widest, and `render/chipfit.test.mjs` is what re-measures it.
LANES    Two lanes and one boundary, both lanes ridden, so neither carries an arrowhead nothing uses
         (`A-05`) and the card has no unridden leg to argue for.
         THE VETH LANE RUNS FACE TO FACE BETWEEN THE TWO ENDS, `ETH_R` 721 to `PEER_X` 878, 157 units
         crossing the boundary at 760. Starting it on the shell wall instead is measured and rejected
         under `WHY NOT`: it makes the Pod EDGE the end of the pair, which is the claim this card
         exists to correct. `PORT` is 112 units, the peer top face midpoint up to the cni0 bottom face
         midpoint, both on `PEER_CX` 994.
         THE VETH LANE CARRIES TWO END TICKS. A bare `P.arrow` on `VETH` renders one right-pointing
         head and nothing else, the same mark `PORT` carries, so that lane alone reads `traffic runs
         rightward between two separate interfaces` while every sentence on the card says `one link
         with two ends` and `a point to point link and nothing more`. The lane is an ordinary dashed
         dim `P.arrow`, and a `P.raw`, `vethEnds`, stands a tick on it `CAP_IN` 20 inboard of each
         face, `CAP_H` 18 tall, carrying the lane's own stroke minus the dash. The ticks are what
         say `one object, two ends`. The head is what says which way the ball goes on `through`.
         BOTH NUMBERS ARE MEASURED AND NEITHER IS CHOSEN. A tick drawn ON the face lands on the box's
         own vertical edge stroke and vanishes into it, which renders as a plain line with no ends
         at all. At `CAP_IN` 12 the right tick sits immediately behind the arrowhead and reads as
         clutter crowding it. 20 leaves one dash between the two.
         `vethEnds` destructures `VETH` for its endpoints, so the ticks cannot drift off the ends
         they mark even though a `raw` is invisible to the check that would assert it (`A-02`).
         The `veth pair` caption centres on `midX(ETH_R, PEER_X)` 799.5, the whole cable, rather than
         on `midX(NS_X, PEER_X)` 819, which is the midpoint of the half right of the boundary. 799.5
         is also the midpoint of the two end ticks at 741 and 858, so the caption stands 27.5 clear
         of each at its widest, 62 units at 1600x1000, and reads as the name of the object they
         bracket. It does NOT straddle the boundary and cannot: the cable runs 39 units left of
         x=760 and 118 right of it, and a string centred on 760 at this y prints on the Pod shell
         wall.
         The boundary is a `P.relation`, which `NET.A-04` defines as the RECESSION treatment rather
         than as a relationship claim, and it is one element with two subpaths because it is one line.
         Each segment stops `RULE_GAP` 8 clear of the shell: an endpoint landing on the shell corner
         is read by `L-11` as a lane terminating 155.0 off a 310 face midpoint, which is a finding
         against the boundary rather than against any lane.
         The two segments run to `RULE_INSET` 14 inside the frame wall, and with `NODE_H` derived
         they measure 56 and 56. Held to the interior padding `IN_PAD` 30 instead they measure 40
         and 40, and at that length the pair reads on the rendered frame as two ticks flanking a box
         rather than as one line the shell interrupts. That reading is the whole composition, so the
         segments are sized for it.
MOTION   Five narrated steps, two of them with a packet and three static, which is the house reading
         for a card about what a thing IS rather than what happens to it: `network-pod-localhost`,
         the other anatomy card in this section, narrates five as well and carries `flow` on two.
         `deadair.mjs` reads `pair` and `unit` at 100 percent still, rank 634 of 683, on pace ranks
         312 and 261 against a catalog median of 10.36 ms per character, and reads the kin at 647,
         653 and 665 on pace ranks 272, 280 and 350.
         `address` carries a pulse and no packet. The `Pod IP` chip, the `eth0` sublabel and the Pod
         sublabel are ONE result (`P-03`, `P-04`), so `rewind` holds the pre-reveal form of all three
         and one `F.set` writes them together at `BEAT.afterPulse` 800, the beat the Pod blinks out
         of. THE CHIP READS `allocated` BEFORE IT READS THE ADDRESS AND NEVER `none`. The poster
         frame and `pair` both draw the finished pair, and one frame asserting both that a CNI ADD
         completed and that the Pod has no address contradicts itself. What `address` reveals is
         WHICH address it is and WHERE it sits, not that one exists. The `SCENE` declaration is held
         to that reading by hand: step 0 overwrites every chip, so a value declared there never
         renders and no check reads it.
         The Pod is what pulses because the Pod is what gets the address, which is the claim the step
         makes in words. `peer` turns its sublabel over to `no address` at ENTRY and takes no
         highlight, and that one-sided cue is the claim rather than a missed one: the step says only
         the Pod end is configured, so lighting both ends draws the contrast and then cancels it.
         MEASURED on the settled frame after real-time play: `eth0` reads
         `10.244.1.5/24`, the Pod sublabel reads `10.244.1.5/24` and the peer reads `no address`. A
         deterministic WAAPI seek shows none of the three, because an `F.set` is a callback and not an
         animation, so the `-0`, `-50` and `-95` seek frames all hold the `rewind` form.
         `through` and `port` are up-arrow and down-arrow respectively. On `through` the Pod blinks,
         the ball leaves the `eth0` face a `BEAT.afterPulse` later and the peer lights on its arrival.
         `app` is in `lit` because the narration names it as the sender and a ball must not leave a
         dark block (`M-18a`). On `port` the peer is the sender, so it is lit at entry and `cni0` is
         cued through `lights` on the arrival instead.
         Both hops sit on the `routeDur` floor of 700ms, since `PKT_DUR_MIN` clamps anything under
         about 315 units and these are 157 and 112. Travel therefore does not size these steps and
         reading does.
         A LABEL THAT DESCRIBES A LANE STAYS, A LABEL THAT IS A RESULT TRAVELS. The `veth pair`
         caption is the first kind: the pair exists from the poster frame onward, so it is a `P.tag`
         standing on every step rather than a `P.wire` any step writes. This card carries no `P.wire`
         at all, and the two end blocks plus that caption are what name the object on the canvas.
CONTENT  ALL THREE PLACES AN ADDRESS CAN SIT ARE DRAWN, which for a card about where an address
         lives is the whole point. `eth0` takes `10.244.1.5/24`, `peer` takes `no address`, and
         `cni0` turns its sublabel over from `host bridge` to `GW_IP` 10.244.1.1 on `port` and holds
         it on `unit`. The turnover is at step ENTRY and not on the ball's arrival, because
         10.244.1.1 is a standing fact the step REVEALS rather than a result the arriving frame
         produces. Both values on that side are read against the plugins rather than recalled.
         `cni0` is the bridge plugin's own default, `Defaults to "cni0"`
         (cni.dev/plugins/current/main/bridge). 10.244.1.1 is what host-local hands the bridge for
         a 10.244.1.0/24 Pod subnet: `"gateway" (string, optional): IP inside of "subnet" to
         designate as the gateway. Defaults to ".1" IP inside of the "subnet" block`
         (cni.dev/plugins/current/ipam/host-local), and the bridge plugin `can also be assigned an
         IP address, turning it into a gateway for the containers`. The two are therefore one
         arithmetic and not two invented numbers, and moving the Pod IP moves the gateway with it.
         `AND NOWHERE ELSE` IS REJECTED ON THE `address` STEP, which opens `Of the two ends only
         the Pod end is configured with an address`. The absolute is unqualified (`T-19`) and this
         card's own step `port` is its counter-case: it draws 10.244.1.1 on `cni0` two steps later,
         so `nowhere else` is false on the card's own canvas. Bounding it to the two ends of the
         PAIR is what the step is actually claiming and it costs nothing.
         `host end` READS `port, no address` ON `port` AND `unit`, NOT `bridge port`. Those are the
         two steps that put a second address on the canvas, and the host end having none is one of
         the card's three claims: dropped from the readout there, the closing frame shows two
         addresses and never states the absence that is the point. `bridge port` alone is rejected
         for that, and the port half is not lost, because `master cni0` on the peer and
         `veth to cni0` on `datapath` both say it. 16 characters against the 18 of
         `two ends, one link`, so the 300 column is unmoved (`render/chipfit.test.mjs`).
         `vethb3f8a2c7@if2` is defensible as drawn: the `@ifN` suffix names the peer index in the OTHER
         namespace, carried by the kernel as `IFLA_LINK` and rendered `@ifN` by iproute2 when that
         peer sits in another namespace, and `eth0` in a fresh Pod netns is index 2 because `lo` is
         1. No index is asserted
         for the host end, and none can be: the root namespace index depends on how many interfaces
         the Node already carries, so the `veth pair` chip states the RELATIONSHIP, `two ends, one
         link`, rather than a second number nothing can stand behind. The host end carries EIGHT hex
         digits because upstream `RandomVethName` is `fmt.Sprintf("veth%x", entropy)` over four
         bytes, and `network-pod-to-pod-same-node` spells its own the same length, so one object has
         one spelling across the section. The label inks 108.5 in the 232 box, 61.8 clear a side.
         `netns owner` on the `pause` box is the string `network-cni-invocation` and
         `network-namespaces` both carry, so three cards agree on it (`T-13`).
         `ON THE USUAL PLUGINS` IS WHAT BOUNDS THE REASON CLAUSE OF `through`, which reads `because
         on the usual plugins that is the one interface in this namespace facing outward`. Flat, it
         is an unqualified absolute (`T-19`) against a counter-case upstream states twice: the CNI
         ADD result carries `interfaces`, "an array of all interfaces created by the attachment"
         (SPEC.md section 5), and `Cluster Networking` has it that "a server or a pod can have
         multiple IP addresses assigned to its interfaces, but only the IP addresses in
         node.status.addresses or pod.status.ips are considered when implementing the Kubernetes
         network model" (kubernetes.io/docs/concepts/cluster-administration/networking).
         `network-namespaces` is held to the same bound for the same reason and its record names
         the case in full, "a
         macvlan, ipvlan or SR-IOV plugin puts a device in here that is not a veth, and a second
         interface is a plugin away". The qualifier is that card's own wording, "on the usual
         plugins a single veth pair is the one link", so the two read one way. Dropping `one`
         instead is rejected, since it gives up the claim the step is making, and moving the reason
         onto the DEFAULT ROUTE is rejected twice over: no route is drawn here, and SCOPE hands the
         routing table to `network-namespaces`. `network-pod-localhost` carries the same absolute
         unbounded, `eth0, the one interface in the Pod that faces the network`, and it is open on
         that card.
         THE `desc` DOES NOT DEFINE A veth PAIR AS A CROSS-NAMESPACE OBJECT. It reads `one virtual
         link with two ends, and in a Pod they stand in two different network namespaces`. As a
         definition the shorter `two ends standing in two different network namespaces` is false:
         `veth(4)` has the devices "act as tunnels between network namespaces" but "can also be used
         as standalone network devices", so two namespaces is what Kubernetes does with a pair
         rather than what a pair is. The clause costs 16 characters and the `desc` lands at 451 of
         the 470 `D-04` allows, so it is paid for rather than cut (`T-20`).
         `Cluster Networking` IS NOT A SOURCE FOR THIS CARD, which is the ruling `network-namespaces`
         already carries: the page holds zero occurrences of veth, eth0, bridge, namespace or pause,
         so it supports no statement the card leans on and is cited above only for the counter-case.
         `Pod networking` is the source in its place and is exact for `unit` and for the last
         sentence of the `desc`: "Each Pod is assigned a unique IP address for each address family.
         Every container in a Pod shares the network namespace, including the IP address and network
         ports."
         `CNI bridge plugin` is the third, because the whole root-namespace side of the card is read
         off it and a reader has no way to reach it otherwise: "An IP address is only assigned to
         one end of the veth pair", the one "residing in the container", plus `bridge (string,
         optional): name of the bridge to use/create. Defaults to "cni0"`. That first line is what
         `address` says in words, so the step ships beside its own source.
         CHECKED AND HELD, read against `k8sVersion` 1.35. `A port does not answer for anything, so
         it needs no address of its own, and the frame lands on the bridge rather than in the Node
         routing table` is scoped to the FIRST hop off the port and is true there, an enslaved port
         handing its frame to the bridge, and the Node routing table is reached afterwards through
         the gateway the next sentence names. `enslaved` in the `desc` and the `aria-label` is the
         same tool's word as the drawn `master cni0`, `ip-link(8)` defining `master DEVICE` as "set
         master device of the device (enslave device)". `never per container` is upstream exact by
         the `Pod networking` quote above. `One CNI ADD made this and exited` is the spec shape,
         "Interface plugins, which create a network interface inside the container and ensure it has
         connectivity" and "A plugin must exit with a return code of 0 on success". The `aria-label`
         writing the address bare, `carrying 10.244.1.5`, against the drawn `10.244.1.5/24` is held:
         it is the same address and the bare form is what the siblings write. `10.244.1.5/24` and
         `10.244.1.1` are one arithmetic across the category, `network-ipam-pod-cidr` carving
         Node-1 as 10.244.1.0/24 and `network-hostnetwork-hostport` drawing cni0 at 10.244.1.1.
SCOPE    This card owns the ARTIFACT: what a veth pair physically is, which end stands in which
         namespace, where the address lives and does not, what the host end attaches to, and that the
         unit of allocation is the Pod. The CALL appears once, as a named cause in the first clause of
         step 1, and never as a chain. Who calls whom, the Kubelet and CRI and CNI boundary, the
         ordered plugin list, the IPAM delegation, the result structure and DEL belong to
         `network-cni-invocation`. The namespace as a private copy of the stack, its four layers and
         its lifetime belong to `network-namespaces`. The call over 127.0.0.1, the shared port space
         and the bind conflict belong to `network-pod-localhost`, and no loopback is drawn here. The
         CRI lifecycle around the call, RunPodSandbox through StartContainer, belongs to
         `cluster-pod-sandbox-cri`.
WHY NOT  A SOLID undashed headless body on the veth lane at full `scheme-arrow` weight: the pair is
         the subject, so it takes the strongest mark on the canvas and gives up the arrowhead
         entirely, direction being the ball's job on `through`. It is the ONE mark on this card
         outside the lane idiom, every other line here and on its six siblings being dashed and dim,
         and a category reads as one set of cards before it reads as any one of them. It also costs
         a `network|scheme-arrow|network|rest` palette combination, the first undimmed lane in the
         category. The two end ticks carry the same claim and cost neither.
         Starting the veth lane on the Pod SHELL WALL at x=760 rather than on the `eth0` face at 721.
         It is the house grammar, `network-pod-to-pod-same-node` leaving from `PODA_R` and
         `network-namespaces` stopping its cable on `SHELL_X`, and it is rejected here on the card's
         own subject: a lane from the shell wall makes the Pod EDGE the visible end of the pair, and
         the thing this card exists to draw is that the end is `eth0`. The 39 units between the two
         are the shell margin `BOX_X` derives, so the lane crosses it and then the boundary, which is
         what a veth end does.
         A `P.pod` whose containers stand in a ROW, which every other card in this section draws. The
         chip column takes x 60..360, so the Node frame opens at 420 and the Pod zone measures 310.
         Two 232 boxes side by side want 484 before any gap, and three want 736: the row does not fit
         the zone the column leaves, and widening the zone is spending the gutter the column is in.
NOT A DEFECT
         A SIGNATURE SHARED WITH `network-pod-egress-snat` IS NOT A REASON TO MOVE EITHER CAST. What
         a signature shares is the cast CENSUS alone, a count of parts that says nothing about where
         any of them stands. Everything the eye uses to tell the two apart differs:
           levers   this card `frame raw tag relation column deep`, egress-snat `cylinder frame fan
           strip deep`
           bands    this card `130,208,220,412`, egress-snat `215,330,359,470`
         The separation that carries it is COLUMN AGAINST STRIP. This card puts its four chips down
         the left gutter as a column and fills the frame with a vertical namespace boundary, a Pod of
         three stacked boxes left of it and the bridge column right of it. egress-snat puts its four
         chips in a strip along the bottom and draws three bands: a Pod and a POSTROUTING box on one
         line, a conntrack cylinder under it, and two destinations in a column outside the frame.
         Rendered side by side at 1100x800 with both narration panels
         covered, the two are not confusable at any point.
         Breaking a tie like that by moving the cast is the failure this project names twice over, a
         rule satisfied and the picture ruined, run forwards: the cast here is what the subject wants
         and the signature is a census that cannot see the boundary, the captions or the column.
         `report/arrival.test.mjs` R2-ENTRY lists `Pod IP` on `address` as changing with no
         highlight at entry. It is held on purpose: the chip is in `lit` at entry and its VALUE
         lands at 800 with the eth0 and Pod sublabels, because the three are one result of one beat
         (`P-03`, `P-04`). Cueing the value at entry is giving that up.
         `report/chip-beat.test.mjs` FORM-B lists three chips lit at entry ahead of a ball,
         `pathChip` at 1500ms on `through` and `pathChip` and `hostChip` at 700ms on `port`. All
         three are step-scoped labels saying what this step is about rather than the result of a
         hop, which is the `network-cni-invocation` `CNI op` reading. 700ms is the `PKT_DUR_MIN`
         floor exactly, so those two stand for one hop and no longer.
         `report:palette` lists this card in the `network|scheme-box|network|highlight|stroke`
         conflict at played step 2, alongside `network-dualstack` and `network-namespaces`. The
         class predates this card: a highlighted box inside a pulsing Pod resolves to
         `NETWORK_TINT.base` because the non-persist pulse fills forwards to `base`, which the kit
         states on the constant.
OPEN     `M-19a` on `pair` and `unit`, which stand 100 percent still for their whole 2700ms at rank
         634 of 683. The fix that row allows is the motion or the narration and both cost more than
         the hold: a ball on either beat would be traffic neither one narrates (`M-10`), and the
         narration already sits at the catalog median pace. The nearest kin holds three steps
         stiller again, at 647, 653 and 665. Left open because closing it makes the card worse.
```
