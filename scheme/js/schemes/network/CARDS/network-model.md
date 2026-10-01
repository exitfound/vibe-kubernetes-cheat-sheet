## network-model

### layout

```
WHAT     The flat Pod network as one wide band: a single L3 address space, four Pods on different
         Nodes hanging off it, packets riding up, along a rail INSIDE the band, and down. One flat
         space, no NAT. Each Node is a dashed frame around its own Pods, so which Pods share a Node
         is geometry rather than a suffix on four labels.
LAYOUT   The CNI badge is tucked under the RIGHT END of the band, its right edge on SCHEME_R 1080,
         and its connector is a straight drop from the badge bottom-centre onto the bus spine INSIDE
         the band, which is the shortest line onto the spine it feeds rather than a dogleg into the
         face.
         The Kubelet takes the top-centre actor block of `workloads-replicaset` whole: WL.CX 600,
         WL.TOP_Y 40, 232 x WL.BOX_H 80, which is the width 14 cluster cards share and as high as a
         block goes in this catalog. The height that frees is spent below, on NODE_DROP.
         Three `P.node` frames stand in a row under the band, Node-1 holding two Pods and the other
         two holding one each. `node()` is dashed 6 4 in the CSS, so a Node reads as an outline and
         not as a second solid block, and the frame carries its name at its own top-left corner in
         the uppercased `.scheme-node-label`. The Pod wires cross the frame edge at NODE_Y and land
         on the POD, which does not contradict `A-21`: that rule governs a lane coming DOWN from the
         ACTOR ROW into a Node band, and this wire is a Pod attaching itself to the address space
         rather than an actor reaching into a Node. `report:frame-face` names this card nowhere.
PANEL    Deepest at 1100x800 on `same-node`, and the right edge here TIES the catalog worst case
         that `L-02` records: `OVERLAY_IDS=network-model node --test report/overlay.test.mjs` from
         `scheme/test/`. The band top is BAND_Y 238 and the deepest reading leaves 33 units of
         clearance under it, so the whole composition hangs below the panel and nothing on this card
         is placed against it.
SIZES    NODE_PAD 28 is the side and inner padding `network-pod-to-pod-cross-node` uses, and
         NODE_HEAD 40 and NODE_FOOT 30 are this card's own, sized down from it to pay for NODE_DROP.
         The whole row closes on the band exactly: N1_W 436 plus two 236 frames plus two NODE_GAP 26
         is BAND_W 960, so Node-1 opens on SCHEME_L and Node-3 closes on SCHEME_R with nothing typed
         twice. POD_SPLIT 20 inside Node-1 is deliberately tighter than the 26 between frames, which
         makes the same-Node pair read as a pair before the frames are even noticed: Pod centres go
         238, 438, 700, 962, so the pair sits 200 apart and every cross-Node neighbour 262.
         Vertically NODE_DROP 40 is the stated gap between the band floor and the frame tops: the
         flat space is one thing and the Nodes are another, and the Pod wires are what crosses
         between them. NODE_Y 358, POD_TOP 398, NODE_BOTTOM 548, CHIP_Y 568, and 38 clear of the 640
         viewBox floor, which is what `network-ipam-pod-cidr` leaves under its own frames. The 40
         units NODE_DROP takes are found BELOW the band, in NODE_HEAD 40, NODE_FOOT 30, a chip gap
         of 20 and a floor margin of 38, and never out of the band itself: BAND_Y stays 238 because
         the deepest panel reading is 204.97 and 33 units is the whole clearance this card has.
LANES    A flat dashed bus INSIDE the band: a horizontal spine with a short tooth turning down toward
         each Pod, so it abuts every Pod drop-wire at the band edge. No arrowheads on the bus: the
         heads on
         this card are the four bidirectional Pod wires, `marker-start` and `marker-end` on each,
         and the single kubelet drop. The band and the Node ruler are the two places on this card
         where a line sits BELOW blocks rather than above. The CNI connector carries no head at all,
         because nothing discrete travels it, and it is a `P.raw` `<path>` rather than a
         `P.relation`: every lane kind attaches a head and `P.relation` sinks the line to 0.45.
         Nothing else about it is faint: it comes out of the
         same `railPath` factory as the rail, and a plugin reaching the fabric that reads thinner
         than the fabric says the connection is the weaker thing. The RAIL is built the same way and
         is not a `relationPath` at all, because balls ride it: that helper classes every line
         `scheme-arrow-relation`, which is stroke-opacity 0.45 and sinks a route behind the wires
         that feed it, the exact inversion of what the CSS note asks for. The rail is appended LAST,
         over everything the band draws, and nothing on this card carries the relation class.
         EVERY line on this card carries the category ROLE and none passes `role: ''` (`NET.A-04`).
         Leaving one role-less splits the card into two materials: the wires that meet the rail
         would render in a different colour from the rail they meet.
MOTION   A src-IP tag rides WITH the packet across the band and arrives UNCHANGED, which is the
         no-NAT point made visible. It rides 46 above its ball, a window four units wide that the
         comment on `ridingLabel` states: the tag has to clear the band TOP on the crossing and the
         band FLOOR at rest, and with POD_TOP at 398 the resting ink 341.7..354.6 sits 23.7 below
         that floor, so only the crossing bound is live. It is 19.1 units clear of the nearest frame
         label, ink 657.8..742.2 against `NODE-2` at 594..638.7, and 10.2 above it on the other
         axis. `no-nat` holds 3400 because the longer drop makes its route 698 units and its span
         3251. On step one all EIGHT address lines share one 320ms fade at delay 0: the four Pods
         are addressed out of one space, and a stagger reads as a running order they do not have.
         `node-agent` holds 2800 and not the 2400 its 1600ms of motion
         needs: it carries the LONGEST narration on the card at 271 characters, and 2400 puts it at
         8.86 ms per character against 10.33 to 13.75 for its four siblings.
CONTENT  Read against `k8sVersion` 1.35 and the two pages the card cites.
         The same address is written TWICE per Pod, on the interface inside it and on the state line
         outside it, and rule one is that those two strings are EQUAL. The design record behind the
         model is explicit: `By making IP addresses and ports the same both inside and outside the
         pods, we create a NAT-less, flat address space`, and `when any container calls
         ioctl(SIOCGIFADDR) it sees the same IP that any peer container would see them coming from`.
         So both halves are drawn and neither is a placeholder. `Services, Load Balancing, and
         Networking` carries the other half of rule one, that the old workaround is gone: `it was
         often necessary to explicitly create links between containers, or to map container ports to
         host ports ... This is not needed in Kubernetes`, which is what `no port mapping and no
         rewriting to reason about` states.
         Rule two takes the qualifier the doc itself takes. `Services, Load Balancing, and
         Networking` scopes the no-NAT promise with `barring intentional network segmentation`, so
         `barring an intentional NetworkPolicy` is rejected: a NetworkPolicy is ONE form of that
         segmentation and naming it alone reads as the only one. `barring intentional segmentation
         such as a NetworkPolicy` keeps the scope and keeps the concrete example.
         The plugin does not implement the model. `Cluster Networking` reads `The network model is
         implemented by the container runtime on each node. The most common container runtimes use
         Container Network Interface (CNI) plugins`, so `a CNI plugin is what attaches every Pod to
         the flat space` is rejected on two counts: it credits the wrong component and it un-hedges
         a hedge. The step and the `aria-label` both name the runtime and reach the plugin through
         `almost always`. `network-cni-invocation` draws that handoff.
         The BAND SUBLABEL is held to that same ruling, because it is the one string on the card
         that names an implementer: `implemented by your CNI plugin` is rejected by the quote above,
         and `built by the container runtime` ships. It is 30 characters because the rail tooth at
         CX 700 cuts straight through a 36 character sublabel and stands 10 units clear of a 30
         character one, which is the width `one cluster-wide address space` already proves.
         The two cited pages no longer say this the same way, and the card takes the one it cites
         for the claim. `Services, Load Balancing, and Networking` reads `The pod network itself is
         managed by a pod network implementation` and `On Linux, most container runtimes use the
         Container Networking Interface (CNI) to interact with the pod network implementation`,
         against the single sentence `Cluster Networking` gives. That divergence is the reason the
         hedge is `almost always` and not a bare `through`, and it is not a reason to move the
         credit off the runtime.
         The core is not empty. `Services, Load Balancing, and Networking` reads `Only a few parts
         of this model are implemented by Kubernetes itself. For the other parts, Kubernetes defines
         the APIs, but the corresponding functionality is provided by external components`, so
         `None of this is hard-wired into the core` in the step and `None of this lives in the core`
         in the `desc` are both rejected: the doc grants the core a few parts and the card may not
         take them away. `Only a few parts of this live in the core` ships in both. The `desc` pays
         the extra characters by dropping `actually` from its opening question, never by dropping
         the qualifier.
         The closing CNI step returns `reachability` to `any to any`. That step says the plugin
         upholds ALL of these rules and the `aria-label` says any Pod reaches any other Pod, so the
         chip may not be left holding `agent to local Pod`, which belongs to rule three alone and is
         the narrowest of the three. The step also brings every Pod back to full opacity, so the
         picture is already back on the whole model when the chip reads it.
         Rule three says `only` and stays: the doc grants the agent its own Node and grants nothing
         about any other, so the sentence is about the GUARANTEE and says so in its own first clause.
         `Pod Lifecycle` backs what the agent is drawn doing on that step: `The kubelet also manages
         executing probes`, and `Readiness probes determine when a container is ready to accept
         traffic`. The probe runs against a container and the readiness result is what rolls up to
         the Pod, which is why the sentence names the Pod that the ball lands on.
         The `aria-label` is the whole card read aloud, so every qualifier a step carries is in it.
         `any Pod reaches any other Pod on any Node with no NAT` alone is rejected, it drops the
         scope rule two states, and `the Node agent reaches its local Pods` is rejected because rule
         three is about the guarantee and not the reach, which is the first clause of that step. The
         label also opens on `four Pods across three Nodes`: the Node a Pod sits on is geometry on
         this card and a reader who cannot see it gets it nowhere else.
         The Pod IPs are one /24 per Node out of 10.244.0.0/16, which is the slice
         `network-ipam-pod-cidr` carves to the same three Node names, so 10.244.1.5 and 10.244.1.6
         share the Node-1 frame, 10.244.2.7 sits in Node-2 and 10.244.3.4 in Node-3. The Kubelet
         sublabel `Node agent on Node-2` agrees with that: its drop lands at x 600, inside the
         Node-2 frame, and the Pod it reaches is the 10.244.2.7 one.
         `The traffic never leaves the Node` on `same-node` stands over a picture that lifts the
         ball into the band, and the rest of that same sentence is what reconciles them: `but to the
         Pods it is the very same model`. The band is the address space and not a wire, so a
         same-Node hop drawn across it is the point of the step rather than a contradiction. The
         claim itself is not in the upstream docs, which legislate the model and not the datapath,
         and it rests on the sibling that owns that datapath: `network-pod-to-pod-same-node` reads
         `This is plain layer 2 forwarding inside the Node, so the packet never touches the physical
         NIC`. The two cards agree and the mechanism is drawn there, so it is not carried here.
SCOPE    The model as a PROMISE. Who carves the per-Node range is `network-ipam-pod-cidr`, the
         kubelet to runtime to plugin handoff that honours it is `network-cni-invocation`, and the
         underlay a cross-Node packet actually crosses is `network-pod-to-pod-cross-node`. The
         container runtime is named on the closing step and deliberately not drawn: this card has
         one implementer badge and the sibling owns the chain behind it.
         The Windows carve-out is left out. `On Windows, this rule does not apply to host-network
         pods` is a platform exception to rule two, and a card about what the model promises has no
         host-network Pod on it to hang it on.
NOTE     The src tag belongs to the Pod-to-Pod steps only. The agent path is not a Pod source, so the
         chip is cleared rather than left holding a stale 10.244.1.5. Both value chips are wound back
         by `rewind` and cued at the ARRIVAL rather than at entry, which is what keeps this card out
         of the FORM-B queue. On `same-node` only `reachChip` is wound back, because `natChip`
         carries the same value in from the step before and a value that did not change earns no cue
         (`P-05`). All four Pods are labelled `Pod`: the Node they sit on is geometry here, not four
         pieces of text, and `render/inline.test.mjs` KNOWN_DRIFT carries the pair at 27. On
         `node-agent` each Pod wire dims with the Node it serves: a bright wire landing in a Pod the
         step has faded out credits a reach the sentence is denying.
WHY NOT  The badge parked outside the band: the content bbox can then never centre, because the
         badge always adds CNI_W/4 to the centre no matter how the band is sized.
         `emerge` for the riding tag, the mechanism `storage-topology-aware-provisioning` uses. It
         hides the tag until the ball has left the block it emerged from, and this collision is
         MID-FLIGHT: the label spans x 563..637 on a route that starts at 258, so the tag would stay
         invisible for the first 1000ms of a 1440ms ride. `same-node` never reaches the label at all,
         it turns down at BX 486, so the two steps the card draws with one mechanism would end up
         with two different tag treatments.
         dy -30, which keeps the tag INSIDE the band, above the label, with 6 units of ink
         clearance. Opened as a frame it reads as a second line of the band heading, sits 4 under the
         band top border and puts three rows of ink inside an 80 unit band. dy -15, the default,
         puts the tag baseline ON the band label with a gap of 0.00 for 300ms, 74.2 x 9.0 units of
         ink over `Flat Pod Network`.
         A Node RULE under each stretch instead of a frame, and before that a vertical boundary tick
         18 units long. Both are lighter and both under-say it: an 18 unit dashed tick is under two
         dashes and reads as dust, and a rule states where a Node begins and ends without ever
         saying that the Pod above it is INSIDE that Node. The frame says containment, which is the
         relation the sentence needs.
         A tick continued INSIDE the band so the ball crosses it in flight: the Node-1 to Node-2
         boundary is at 600 and so is the kubelet drop, so that mark reads as the kubelet wire
         coming out the far side of the band. The crossing is shown at the DESTINATION instead: on
         `no-nat` the ball lands inside the `NODE-2` frame, on `same-node` inside `NODE-1`.
NOT A DEFECT
         CNI_CONNECTOR IS animated, with the repeating `MARCH` dash offset rather than a ball: this
         card's vocabulary for "this is what implements the model". No packet rides it because
         nothing DISCRETE travels, the plugin is not sending a message, it is the thing that makes
         the flat space exist. That is also why it carries no arrowhead and `A-05` has nothing to say
         about it.
         `cni` reads 1390ms and 53% still on `deadair.mjs`. Every MARCH track on that step is
         `iterations: Infinity` and the span reader counts ONE iteration, so that number is a floor
         on a step whose dashes are moving for the whole 2600ms. There is no frozen tail to fix.
OPEN     The tag crosses the band FLOOR twice a step rather than once, 200ms against the 100ms a dy
         of -15 costs, and on the descent it still sweeps the band sublabel, 24.5 x 3.6 units of ink
         for 100ms. Both are structural: a tag that clears the label on the rail has to be outside
         the band, and any dy at all crosses the sublabel row somewhere on a 96 unit descent.
         The kubelet box spans 490..710 and the Node-2 frame runs 582..818, so the Node-2 agent
         overhangs its own frame to the left and reaches into Node-1. Its DROP at x 600 does land
         inside Node-2, which is what the step needs, and moving the box to sit over the frame is
         measured to put it off-centre over a symmetric band on the four steps it is not acting on.
         On `node-agent` the lighting answers it: Node-1 and Node-3 go to OPACITY.notready with
         their Pods and their wires, and Node-2 is the only lit frame. `L-16` is why this stays
         open.
         The poster is a literal miniature of the diagram, three Pods on a bar, and `poster-lint`
         reads it FLAT under `R-03`. It belongs to `card-poster` and not to this record.
```
