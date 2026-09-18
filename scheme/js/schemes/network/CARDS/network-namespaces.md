## network-namespaces

### layout

```
WHAT     A Pod gets its own copy of the network stack, drawn as four labelled layers inside the
         namespace, and every container in the Pod joins that one copy instead of getting one each.
LAYOUT   Three tenants over one stack, and one cable out of it. The namespace is a `podShell` right
         of the panel wall holding a container row (pause, app, sidecar) over a stack band of four
         slabs, ordered as the stack really runs: `ports` at the top where the containers sit,
         `iptables`, `routes`, and `interfaces` at the bottom where the wire lands. The three
         tenants drop onto the port layer and the host block stands level with the MIDDLE of the
         namespace, its cable stopping on the shell face, so the picture says many-into-one and
         one-way-out without the panel. Every horizontal extent is derived from the slab: the band
         is `SLAB_PAD` 24 wider a side, the shell `IN_PAD` 40 wider
         than the band, and the three tenants are `(BAND_W - 2 * CTR_GAP) / 3` = 160 across the band
         (`NET.L-01` clause c). The host block stands OUTSIDE that band and takes the category 232.
         `HOST_Y` is derived from the SHELL and the host height, so the cable stays on the shell's
         left face midpoint when either moves. Re-typing the host y is what breaks the pairing.
PANEL    `OVERLAY_IDS=network-namespaces node --test report/overlay.test.mjs` from `scheme/test/`.
         Right edge 290.77 at 1600x1000, 377.76 at 1280x860, 396.55 at 1100x800. Bottom
         142.56..160.00, 171.42..192.67, and 180.12..229.82 with the deepest reading on step 0. The
         only content left of the wall is the host block at x 133..365, y 275.5..375.5, which clears
         the deepest panel by 45.68 units, and that clearance is what a longer narration spends.
         The whole stack stands right of x=520 and no slab moves whatever the narration does, so the
         host block is the ONE thing the panel can reach and 45.68 is the room it has. Centring the
         host on the interfaces slab at y 440..540 buys 210.18 instead, and costs the arrival the
         `LANES` block prices.
SIZES    Host sublabel `ports · iptables · routes · NICs` inks 196.3 in the 232 box at 1100x800, the
         narrowest viewport and so the widest reading, leaving 17.85 a side. It names the same four
         layers the slabs carry, in the same order, which is what makes the Pod stack read as a COPY
         of the host stack with no second rack drawn. A slab is 472 wide and its longest value inks
         98.2, so the slab row is floored by the band and not by a string.
LANES    Three lines carry a ball and one never does, and stroke-opacity is what separates them. The
         veth cable and the app and sidecar taps are `P.arrow` at full strength (`A-06`), the pause
         tap is a `P.relation` at 0.45 because pause HOLDS the namespace and sends nothing on any
         step. All four are the same dashed cyan `5 5` at stroke-width 1.4, and none of them drops
         its role (`NET.A-04`): a role-less line here would say it is unimportant, which no line on
         this card is.
         THE VETH STOPS ON THE SHELL, at the left face midpoint of the namespace, and the two taps
         stay INSIDE it. The cable joins two namespaces, so the thing it reaches is the namespace as
         a whole rather than one layer of it, and that is what the arrival answers: the Pod pulses,
         and the layer the cable brought turns over after the pulse. The taps are the opposite case,
         a container socket IS in this port space, and `crosses()` in `render/geometry.test.mjs`
         counts an endpoint INSIDE a block as an arrival rather than a crossing, so the two of them
         cross the shell face on the way in with no `THROUGH` finding. On the port slab the three
         taps land at -180, 0 and +180 from its top-face midpoint: the middle one is exact and the
         outer two are the mirrored pair `L-12` admits.
         THE VETH CARRIES AN ARROWHEAD, and it points into the Pod NETNS block. It is a plain
         `P.arrow` with no `tune`: the head is the pointer at the block that answers the ball, which
         is what makes the outer-block-first reading legible before any layer moves. That is also
         why `HOST_Y` hangs off the shell rather than off a slab: on the interfaces midline the same
         head would land 163 units off the shell's face midpoint on a 469 face, an `OFFEDGE` finding
         on a red gate, and centring the host is what removes it rather than forgives it.
         MEASURED IN THE DOM, identical at all three viewports: the cable is `M 365 325.5 L 520
         325.5`, `getTotalLength()` 155, computed dash `5px, 5px`, so the run is 15 whole periods
         plus a closing 5-unit dash and BOTH ends stop on paint, with `marker-end` resolving to
         `#arrowhead-net`. The three taps measure 125 on the same array, 12 periods plus a dash,
         flush at both ends too. A length that is a multiple of 10 would end on a gap, which is why
         both numbers end in 5.
MOTION   THE CABLE STANDS AT FULL STRENGTH ON EVERY STEP AND NO STEP WRITES ITS OPACITY. Dropping it
         to `OPACITY.notready` on `open` to say the veth is not built yet is wrong in time rather
         than in logic: the poster holds the cable bright for a second, so the first narrated step
         takes it BACKWARDS and reads as a rendering fault. What says not-yet-wired instead is the
         pair of empty layers and the unwritten `veth pair` label. All five steps therefore stand at
         the same 1, and `.scheme-arrow` carries no base opacity of its own, so an `opacity` field
         here is a copy of the CSS default and no step writes one.
         THREE STEPS CARRY MOTION AND `door` CARRIES BOTH KINDS, in that order. `open` carries
         NEITHER: nothing arrives and nothing travels there, so a pod pulse would cue nothing while
         erasing the two blocks the step is actually about. What the step carries instead is `pause`
         and `slabIface` lit and standing still, which is `M-27` and is the whole beat, and its
         `duration` is 3100 because with no motion the hold IS the reading time, and 3100 is what
         puts its 303 characters on the catalog median pace that
         `.claude/skills/card-review/tools/timing.mjs` prints beside every step. `door`
         runs one ball host to the shell face, pulses the whole namespace at its arrival and turns
         the two layers the cable brought over `BEAT.afterPulse` later, `join` drops a ball down the
         app tap into the port layer and sends a second up the sidecar tap after it, and `private`
         pulses the whole namespace as the unit that lives and dies as one.
         MEASURED on a real play at 1100x800, sampling the shell rect every 90ms: the ball travels
         800..1500, `stroke-width` leaves 1.2 at 1543 and peaks 2.39 at 1910, is back at 1.2 by
         2454, and `lo only` reads `lo + eth0` on that same 2454 sample. `door` holds 3400, so about
         a second of stillness stands after the last change.
         The `join` pair is the `NET.A-01` shape read at layer scale: the hop enters the stack at
         one tap and leaves at the other, and the layer it passed through is what lights between
         them.
         A VALUE WAITS FOR THE BEAT THAT PRODUCES IT, by hand, on every layer that turns. `door`
         states its end values above the guard, winds `slabRoutes` and `slabIface` back to `none`
         and `lo only` in `rewind`, and turns them over in
         `F.set({ at: 'hop', plus: BEAT.afterPulse })`, the `plus` being there because that arrival
         is answered by the pulse first. `join` does the same for `slabPorts` at `at: 'down'`.
         `private` carries no ball, so `slabRules` winds
         back to `no rules` and turns over at `F.set({ delay: BEAT.afterPulse })`, which is the
         shape four other catalog cards write a pulse-produced value in over six sites. MEASURED
         entry against settled, per layer: `door` enters on `none` and `lo only` and settles on
         `default via eth0` and `lo + eth0`, `join` enters on `all free` and settles on `one shared
         space`, `private` enters on `no rules` and settles on `own chains`. `open` is the one step
         that states all four statically and it stays that way: the stack it draws is what a fresh
         namespace HOLDS rather than something a beat produces, and winding the four back would
         show the reader the finished stack for the first beat of the card's first narrated step.
         THE POSTER STEP STATES THOSE SAME EMPTY VALUES. The poster previews the TEXT of `open`
         (`D-14`), and that sentence reads `no routes, no rules and every port still free`, so
         `PRIVATE` at idle is rejected: it puts four end-of-card values under that sentence for the
         second the poster holds and then flips all four at once with no beat to carry them.
         `network-netfilter-path` (`no flow yet`, `none`), `network-dns-ndots` (`0`, `none`) and
         `network-conntrack-nat` (`none`) all state their pre-story values at idle for the same
         reason, so a `PRIVATE` idle here is out of step with the catalog rather than a reading of
         its own.
         That is `P-03` in the shape 14 catalog cards already write it in, and no machine sees it here:
         `report/chip-beat.test.mjs`, `unit/chip-beat-e.test.mjs` and `report/arrival.test.mjs` read
         `chips` and `chipsCued` only, so a value in a `sublabels` field is invisible to all three.
         The settled dump is what proves it, and it is the check to re-run after any change to a
         slab value.
WIRE LABELS
         `veth pair` prints at 414.89..470.11 on 1100x800 (411.49..473.51 and 414.17..470.83 on the
         two wider ones), between the panel wall at 396.55 and the shell face at 520, clearing the
         wall by 18.34 and the shell by 49.89, 8.3 above the cable. It sits at y 302..317, which is
         below the deepest panel bottom of 229.82, so the wall is not the binding constraint on it.
         `localhost` prints at 882.4..937.6, 8.3 above the band top and 62 clear of both taps it
         names.
CONTENT  Read against `k8sVersion` 1.35 and the four `sources`.
         THE FOUR LAYERS ARE A SELECTION, NEVER A CLOSED SET, and `network_namespaces(7)` is where
         the model is sourced from because it is a Linux fact before it is a Kubernetes one: "Network
         namespaces provide isolation of the system resources associated with networking: network
         devices, IPv4 and IPv6 protocol stacks, IP routing tables, firewall rules, the /proc/net
         directory ..., various files under /proc/sys/net, port numbers (sockets), and so on." All
         four slabs are members of that list, so no member of the enumeration is wrong. Nothing on
         the card says only or exactly and nothing may: conntrack, the sysctls and the abstract UNIX
         socket namespace are per namespace too and are not drawn.
         THE COLUMN IS A LAYERING AND NOT A PACKET PATH. Sockets sit at the top beside the containers
         that own them, devices at the bottom beside the wire. No lane runs down the slab column and
         no ball crosses one slab to reach another, so the picture asserts no hook order. The real
         order, where the routing decision stands BETWEEN two netfilter hooks rather than under one,
         is `network-netfilter-path`, and no step here may state one.
         `iptables` IS A HOUSE LABEL THAT EARNS ITS PLACE. The per-namespace kernel object is
         netfilter, and `Netfilter` is rejected twice over: `terms.json` carries `netfilter` as
         hardLower "kernel subsystem, catalog unanimous at 4", so a capital fails `T-06` and a
         lowercase heading fails `T-09`, and only `iptables` is in the `apiWords` exemption behind
         `render/inline.test.mjs`. It is also still the upstream default: `Virtual IPs and Service
         Proxies` has kube-proxy "use the recommended default version", names iptables as that
         version and says "a future version of Kubernetes will change the default to nftables". The
         value reads `own chains` and not `own rules` because chains are what a fresh namespace has
         a private copy of, and the word is frontend neutral. The `aria-label` says `packet rules`
         for the same layer, which is the description rather than the name.
         `default via eth0` IS ENGLISH AND NOT `ip route` OUTPUT. The real line is `default via
         10.244.1.1 dev eth0`, and the card names neither the gateway nor the device because the
         LAYER is the subject. `default through eth0` is rejected: all eight values are plain
         English, `via` reads as by way of beside `all free` and `lo only`, and the SIZES ink of 98.2
         is measured on this string.
         THE HOSTNETWORK EXCEPTION IS NAMED IN THE SAME BREATH (`T-19`, `T-20`). `open` carries "and
         only a Pod that sets hostNetwork goes without one", paid for by trimming its third sentence
         to `Nothing reaches in or out yet`, which also drops an echo of the last sentence of `door`.
         `CRI Spec` is the source: "Network namespace for this container/sandbox. Note: There is
         currently no way to set CONTAINER scoped network in the Kubernetes API. Namespaces currently
         set by the kubelet: POD, NODE." NODE is that exception and POD is why `join` may say never.
         The `desc` carries the shorter `unless hostNetwork is set` at 466 of the 470 `D-04` allows,
         so the clause is fitted rather than cut. What hostNetwork COSTS stays with
         `network-hostnetwork-hostport`.
         THE TEARDOWN CREDITS THE RUNTIME, NOT THE NAMESPACE. `releasing the veth and the address in
         one move` is rejected: it makes the namespace teardown the agent of an IPAM release it does
         not perform, and the CNI spec has the plugin "release an IP allocation and return success
         even if the container network namespace no longer exists". `private` reads "the runtime
         calls CNI DEL to release the address and remove the veth, and the namespace goes with it",
         which is the sibling sentence on `network-cni-invocation` ("the runtime calls CNI DEL to
         release the address and remove the veth") and the `CRI Spec` line "StopPodSandbox stops any
         running process that is part of the sandbox and reclaims network resources (e.g., IP
         addresses) allocated to the sandbox". `network_namespaces(7)` covers the third half: "When a
         namespace is freed, the veth(4) devices that it contains are destroyed."
         `Cluster Networking` IS NOT A SOURCE FOR THIS CARD. The page carries zero occurrences of
         namespace, pause, veth, iptables, routing table or loopback, so it supports no statement the
         card leans on. `Pod networking` is what replaces it and it is exact: "Each container in a
         Pod shares the network namespace, including the IP address and network ports. Inside a Pod
         (and only then), the containers that belong to the Pod can communicate with one another
         using localhost." That one quote answers `join` whole, and its "(and only then)" is what
         lets `join` say never.
         `join` LIGHTS THE PORT LAYER WHILE THE SENTENCE NAMES THE LOOPBACK, deliberately. What the
         step turns over is the port space, so `slabPorts` is what lights and what changes value, and
         the loopback is carried by the `localhost` wire label instead. Adding `slabIface` to the
         lights would blur which layer the beat produced.
         THE HOST SUBLABEL NAMES `NICs` WHERE THE SLAB SAYS `Interfaces`, because SIZES measures the
         string at 196.3 in a 232 box and `interfaces` does not fit. It is true as far as it goes and
         it is a selection, not an equivalence: a host stack also holds cni0, the veth peers and lo.
         `CNI plugin` on `door` and `CNI DEL` on `private` are NARRATED ACTORS WITH NO BLOCK, which
         this catalog admits. The plugin is drawn on `network-cni-invocation`, and drawing it here
         would put the wiring story inside a card whose SCOPE hands it away.
         THE VETH IS NOT CALLED THE ONLY LINK, in any of the three places that state it. "Nothing
         else reaches in or out" on `door`, "a single veth pair is the only link between it and the
         host namespace" in the `aria-label` and "one veth pair is the only door out of it" in the
         `desc` are all rejected: three unqualified absolutes (`T-19`) against a counter-case the
         catalog itself
         holds: a macvlan, ipvlan or SR-IOV plugin puts a device in here that is not a veth, and a
         second interface is a plugin away. `network-pod-ip-and-veth`, which OWNS the veth, is
         already careful about exactly this and says "What it left is a single virtual link with two
         ends" without ever calling it the only one, so an absolute here puts the pair in
         disagreement. The three read "Plugins that hand the Pod a second device are the exception",
         "on the usual plugins a single veth pair is the one link" and "one veth pair is normally the
         only door out of it". `T-20` is why the `desc` clause is PAID FOR rather than dropped:
         `invisible to the host and to every other Pod` gives back the characters and is itself
         loose, since the root namespace can enter this one and sees the veth peer, so the `desc`
         lands at 459 of the 470 `D-04` allows.
         `door` NAMES NO DIRECTION THE PICTURE CONTRADICTS. It reads "so that one cable becomes the
         path between the Pod and everything outside it", which asserts no direction: the head is a
         pointer at the block that answers the ball (LANES), not a claim about which way traffic
         runs. "so one cable now carries every packet the Pod sends to the Node or beyond" is
         rejected: it takes one direction of a two-ended link, and the direction OPPOSITE to the
         arrowhead the lane carries into the Pod.
         `one loopback device` IS THE ONE CLAIM NO CITED SOURCE CARRIES. It is true, and it is what
         a fresh namespace holds, but `network_namespaces(7)` states only what a namespace ISOLATES
         and never what a new one contains, and the other three sources are Kubernetes surfaces.
         `ip-netns(8)` is where it would come from, through its `ip netns exec vpn ip link set lo up`
         example ("Bring up the loopback interface"), and it is not added to `sources` because one
         uncontested Linux fact does not earn a fifth citation on a card that already carries four.
SCOPE    This card draws the NAMESPACE. How the veth pair is built and where the Pod IP comes from
         belong to `network-pod-ip-and-veth`, so the cable appears here only as the one door the
         stack has. The call between two containers over 127.0.0.1, the bind conflict and which
         container answers belong to `network-pod-localhost`, so the hop on `join` is drawn as
         evidence that the two containers sit on one stack, not as a lesson about localhost.
NOTE     THE FOUR VALUES LIVE IN THE SLABS AND THE CARD CARRIES NO CHIP. A namespace is a copy of a
         stack, so each reading sits beside the layer it describes rather than in a strip under the
         picture, and a strip would be the same four values written twice. Every step states all
         four through `SLABS(...)`, which is `P-01` applied to the field the values live in, and the
         cue is the slab taking `.highlight` on the step its value changes (`P-05a`). The device is
         the catalog's, not this card's: 49 cards write a `sublabels` field over 354 sites, 21 turn
         one over on a beat with `F.set({ at: ... })`, and `network-netfilter-path` and
         `cluster-node-eviction-rate` are the nearest readings of it.
         `pause` takes the sublabel `netns owner`, the string `network-pod-ip-and-veth` already uses
         for the same box, rather than a second wording for one object (`T-13`).
         THE SLAB COLUMN READS `Ports`, `iptables`, `Routes`, `Interfaces`, and the odd one is
         correct. A block label is a heading and takes a capital (`T-09`), while `iptables` is a
         program name whose lowercase IS the literal, which is why the `apiWords` dictionary behind
         `render/inline.test.mjs` exempts it and the other three fail without the capital. The host
         sublabel names the same four in body case, since a sublabel is not a heading.
WHY NOT  Drawing the veth as a lane PAIR, one arrow each way. It states two-way honestly and keeps
         full brightness, and it draws TWO cables where the object is one link with two ends, and
         the return leg would be a lane no ball ever rides on any step: a
         `report/lane-traffic.test.mjs` finding created by a repair, on a card that has none.
         Leaving the cable a `P.relation` and recording the shade. Zero cost, and it leaves the card
         subject reading as structure while a ball rides it, which `A-06` and the relation CSS both
         call wrong.
         `P.raw` with a bare `line()`, the `storage-reclaim-policy` identity-spine idiom. The same
         one escape, and it hides the geometry from `report/lane-traffic.test.mjs`, which reads
         parts as DATA and not as DOM: the veth segment drops out of its COPIED tier into UNDRAWN,
         the sharpest finding that file has, on a card with none. A hand-spelled class list is also
         what `A-07` warns about, and the idiom sets no `data-role`, so unless one is hand-written
         the cable drops out of the painted set `render/palette.test.mjs` holds to its baseline.
         Raising `stroke-opacity` only on the steps a ball crosses. The truest picture of the four,
         and it costs an `enter` on all five steps plus a
         `reset.extra` to write a property no field writes, six escapes for one line, and it breaks
         the constant-opacity rule this LANES block holds all four dashed lines to.
         Keeping the cable on the interfaces slab with the host centred on the shell. It says which
         layer the veth becomes, and it makes the one lane on the card a diagonal on a composition
         built entirely of straight runs, so the cable stops reading as a cable.
         Centring the host on the shell and leaving the cable ARROWHEADLESS. The two-ended reading
         is honest about a veth pair, and it leaves the arrival with nothing pointing at it, which
         is the whole thing the outer-block-first order is for.
NOT A DEFECT
         THE VETH ENDS ON THE SHELL, with no gutter. Measured in the DOM the cable path closes at
         x 520.00 and the shell rect opens at x 520.00, both at y 325.5, which is that shell's own
         left-face midline over 91..560. What reads as a gap at a glance is the last `5 5` period,
         an unpainted 510..515 before a closing dash that lands on the face under the head.
         `veth pair` prints on `door` and on `private` and not on `join`, while the cable stays
         bright on all five steps. A wire label names the exchange the step's sentence names, and the
         `join` sentence is about the hop between two containers, not about the cable.
         THE PAUSE TAP CARRIES NO ARROWHEAD and the app and sidecar taps do. `NET.A-04` is what
         splits them: a ball rides those two on `join` and nothing rides the pause line on any step,
         so pause is a relation and a relation draws no marker. Traffic against ownership.
         The band left of the shell and BELOW the host block is empty, roughly x 0..520 by y
         375..560 at 1100x800. Content spans 133..1120 and centres at 626.5 against the 600
         `L-13` wants, inside the 40 it admits, and `report/geometry-soft.test.mjs` files no
         `CENTRE`, `CENTRE-LOW` or `OCCLUDED` row for this card over the 135 it walks. Filling it
         means moving the host off the shell midline, which is the pairing `HOST_Y` exists to hold.
OPEN     A `lit` BLOCK INSIDE THE POD DOES NOT PAINT ON A STEP THAT PULSES. `open` is not one of
         them, because it carries no pulse, which is what lets `pause` and `slabIface` paint. It
         bites twice: `private` shows only `host`,
         which stands outside `podGroup`, and `door` cannot cue the two layers it turns over, so it
         declares them in `reducedLit` and on the animated path the turnover of the value is the
         only cue those two layers get.
         `pulsePodWithTint` animates `stroke`, `strokeWidth` and `strokeOpacity` on every
         `.scheme-box-rect` inside the pod with `fill: forwards`, and a filling animation sits above
         every author rule for the rest of the step, so `.scheme-box.highlight .scheme-box-rect`
         cannot paint. MEASURED at 1100x800 on a real play at t=1500 of a 3000ms step, 600ms after
         the pulse ends: `host` reads `rgb(158, 234, 247)` at 2.4px and stroke-opacity 1, while
         `slabPorts`, `slabRules` and `slabRoutes` all carry `.highlight` and read
         `rgb(79, 229, 255)` at 1.2px and 0.65, the resting shade. `report/palette.test.mjs` prints
         it as a CONFLICT row on `network|scheme-box|network|highlight|stroke`. The reduced path is
         unaffected, since no flow runs there and the class paints, so the `lit` lists are the
         static readout and stay. It is open rather than fixed because the fix is in
         `js/lib/scheme-kit.js` and reaches every card that pulses a pod holding a lit box, which
         the same report names in storage and workloads over five conflicting tuples.
```
