## network-dualstack

### layout

```
WHAT     One cast and two address families: the Pod holds one address per family on a single eth0,
         the Service one ClusterIP per family in ipFamilies order, and a client reaches the same Pod
         over whichever family it dials.
LAYOUT   Two family RAILS through one row. The cast is single and only the wires between it are
         doubled, which is the sentence: a reader sees the pair before reading a word. The row is
         three actors at 232 and one height, 232 x 3 over the 1080 content band leaving 384, and GAP
         takes half each, so both gaps are 192 and the row is symmetric about x=600. Each gap carries
         a mirrored pair about the row's face midpoint 375, RAIL_DY 35 putting IPv4 at 340 and IPv6
         at 410, each 18 inside the row's own faces. The config band spans the two blocks it feeds,
         484 to 1140, and TAP_DX 212 is the distance from its bottom face centre 812 to BOTH targets,
         so each drop is half of one mirrored pair AND lands on its target's top face midpoint with
         nothing left over. The readout is a family TABLE rather than a strip, two columns for the
         families over two rows for the Pod address and the Service ClusterIP, so the right column
         filling as the card plays is the whole story in four cells.
         Five steps, because the last one folds both families into one beat. Dialling them in two
         steps says the same thing twice and gives up the mirror, which is the one frame this card
         exists for.
PANEL    `OVERLAY_IDS=network-dualstack node --test report/overlay.test.mjs` from `scheme/test/`.
         Deepest at 1100x800 on the POSTER frame and on `enable`, which the poster previews
         (`D-14`), at 229.8. Then `service-two-clusterips` at 205.0 and the other two at 180.1. The
         deepest is 192.7 at 1280x860 and 160.0 at 1600x1000, `idle` and `enable` at both, with
         `service-two-clusterips` and `either-family` behind them at 171.4 and 142.6. Quote 229.8,
         192.7 and 160.0 when laying anything out, never the 171.4 / 142.6 pair, which is one
         step's reading and not the wall.
         The 332 character `enable` narration is what makes 1100x800 the outlier: the same sentence
         wraps one line further ONLY at the narrowest width, which is why the deepest reading moved
         24.8 there and not at all at the other two. A qualifier is priced at that width alone.
         It pins the TAG LINE rather than the row: the v4 tag rides at y=308 and INKS from 298.2, so
         it clears the deepest reading by 68.4 and clears `either-family`, the only step a tag flies
         on, by 118.1. The ride line itself clears the deepest reading by 110.2, which is the number
         to quote only beside the ink. The row at ROW_Y 322 clears the deepest reading by 92.2.
         Narration is what spends that margin, so a prose edit is re-measured and the sentence gives
         way, never the tag.
SIZES    ACTOR_H is 106 and the inner box 52 at dy 28, which is the catalog POD height rather than
         this card's own: `CLU.NODE.POD_H` is 106 over a 106 Pod row and the workloads mode is the
         same 106 with `{ dy: 28, h: 52 }`, so a Pod here is the size of a Pod anywhere else in the
         catalog. At 150 with a 58 unit inner the three blocks read as oversized empty frames beside
         their own neighbours. `CLU.NODE.POD_DY` 34 is NOT taken with it: that number
         assumes a frame 300 wide or more, and at ACTOR_W 232 the workloads pair that reads at this
         width is dx 30 leaving w 172, dy 28, h 52.
         POD height and BOX height are two numbers and this card uses the first for all three
         blocks. `network-service-cidr` calls 80 `the catalog block height` at its own ACTOR_H, and
         that is the same catalog and the other number: `CLU.BOX_H` 80 is what a plain box stands
         at. The Service here is a plain box and takes 106 with the rest, because the rails run
         mirrored THROUGH all three: at 80 the middle block is 313 to 393 and each arrowhead lands
         5 units inside its own face, and a rail pair 44 apart cannot carry a tag above and below
         without the upper one grazing the row. One height wins over the box default, which is what
         `NET.L-01` already says of the width. DO NOT close this by taking the Service to 80.
         The row is pinned by its CENTRE, so the height is the only thing a change of block size
         moves: ROW_CY is 375, the 44 units a 106 block gives back against a 150 one are split
         between the drop band above (164 to 186) and the floor below, and CHIP_Y1 is derived as
         ROW_BOTTOM + 62 rather than written as a literal, so the chip table keeps its gap whatever
         the height.
         Every string fits 232 with room, measured at 1100x800 on `either-family`. The floor is
         `ipFamilyPolicy PreferDualStack` at 184.0, leaving 24 a side, then `one eth0, both families`
         at 141.1 and `A and AAAA resolved` at 116.6 inside the 172 inner box, 27.7 a side. Nothing
         here reaches the string clause of `NET.L-01`, so all three actors stand at the category
         width, and 116.6 is what says the narrower inner box of the catalog height still holds.
LANES    Six wires in three mirrored pairs and all six carry a ball, so none of them recedes: the Pod
         drop on `pod-two-addresses`, the Service drop on `service-two-clusterips`, and all four
         rails together on `either-family`. Each static wire and the ball on it come from one points
         array. Every wire is dashed and dim, and dim is a weight rather than a colour (`NET.A-04`),
         so each renders in the category cyan with the network arrowhead.
MOTION   Enabling the feature is a config change with no per-object traffic, so the band lights and
         nothing rides. The step therefore has no motion for its duration to cover and the duration
         IS its reading time: 3300 over 332 characters is 9.94 ms per character, mid-catalog, and
         `timing.mjs` is what prints that ranking. A narration edit here re-prices the duration,
         which is free because `deadair` already reads the step 100 percent still by construction.
         ipFamilyPolicy is a per-Service field and stays SingleStack until a Service opts in, so the
         Service sublabel does not move on the enable step. The band is the source of both second
         values, so it stays lit on the Pod step and the Service step alike.
         Each second value lands ON its drop and not at step entry (`P-03`). The step pins the dual
         reading above the guard, the played path winds the v6 cell back to `none`, and an F.set at
         the arrival turns it over with that cell lit from 0ms, so the value appears under its own
         cue. BOTH Pod sublabels ride the same beat, because `one eth0, both families` is only true
         once the second address is there, and it is as untrue of the client before that drop as it
         is of `Pod web`. A static `dual-stack` on the client from the poster frame is rejected: the
         `enable` step contradicts it in words, `The Service and Pod still have one address each`.
         Both Pods read `one eth0, one family` until the allocation lands and `one eth0, both
         families` after it, because the drop is the CNI rule and not this Pod's luck. The client
         takes no ball of its own and no cue: the sentence of the step is about how a Pod is created,
         so the ball follows the Pod the card follows.
         On `either-family` the two families leave TOGETHER and arrive together, which is what makes
         the step a mirror rather than a second connect: the client pulses, both first-hop balls
         leave at BEAT.afterPulse, the Service lights on the v4 arrival and forwards a beat later,
         and the Pod pulses on the v4 second-hop arrival.
         `service-two-clusterips` stands still for 1440ms of its 2700 on the live reading, and that
         is the price a 269 character narration charges a single 700ms drop rather than a slack
         duration. At 2700 it reads at 10.04 ms per character, which `timing.mjs` ranks mid-catalog,
         and cutting the duration to close the stillness makes the sentence unreadable instead.
WIRE LABELS
         The four addresses ride their balls and none can meet a block face, because the clearance
         here is a y separation and not a width budget: the v4 tag rides ABOVE its rail at dy -32 and
         inks 298.2 to 310.5, the v6 tag BELOW its rail at dy +36 and inks 436.2 to 448.5, the block
         band is 322 to 428 and the chip table opens at 490, which the v6 tag clears by 41.5.
         Measured at 1100x800, the widest reading. A tag of any width is therefore clear on every
         viewport, which is why no offset here is a budget to spend.
CONTENT  Read against `k8s 1.35`. `IPv4/IPv6 Dual-Stack` still carries the enable list, both
         ipFamilyPolicy values, the ipFamilies ordering and the one address per family per Pod. Two
         claims it does not carry are given sources of their own, at the foot of this block.
         THE CONNECT STEP NAMES THE SERVICE AS THE FORWARDER, NOT KUBE-PROXY. kube-proxy is what does
         it upstream and it has no block here: the four blocks are config, svc, client and pod, and
         the step lights and forwards through `Service web`. A sentence naming an actor the card does
         not draw sends the reader hunting for a box that is not there. `each rewritten to the Pod
         address of that family` is passive for that reason and leaves the ruling standing. The
         single-family fallback is narrated on `service-two-clusterips` rather than drawn, because a
         branch nothing takes would want two more blocks for a case this card is not about.
         THE ENABLE LIST IS A PAIRING AND ONE COMPONENT MOVED FALSIFIES ALL OF IT. `IPv4/IPv6
         Dual-Stack` gives a flag per binary: kube-apiserver
         `--service-cluster-ip-range=<IPv4 CIDR>,<IPv6 CIDR>`, kube-controller-manager that same flag
         AND `--cluster-cidr=<IPv4 CIDR>,<IPv6 CIDR>`, kube-proxy
         `--cluster-cidr=<IPv4 CIDR>,<IPv6 CIDR>`, kubelet `--node-ip=<IPv4 IP>,<IPv6 IP>`, over the
         prerequisite `A network plugin that supports dual-stack networking`. The controller-manager
         stands in BOTH halves, so the sentence names it twice on purpose and reading the second
         mention as a repetition and cutting it is rejected.
         THE KUBELET FLAG IS THE ONE ITEM OF THAT LIST THAT IS NOT UNCONDITIONAL, AND THE CLAUSE
         SAYING SO IS LOAD BEARING. `IPv4/IPv6 Dual-Stack` qualifies `--node-ip` and nothing else in
         the list: `This option is required for bare metal dual-stack nodes (nodes that do not
         define a cloud provider with the --cloud-provider flag). If you are using a cloud provider
         and choose to override the node IPs chosen by the cloud provider, set the --node-ip
         option.` So on a cloud provider the Kubelet does NOT take a Node IP of each family, the
         provider picks them, and `--node-ip` is an override rather than a requirement. `the Kubelet
         takes a Node IP of each family` alone, standing in a list whose other three entries are
         unconditional, reads the optional one as required, which is `T-19` on a list rather than on
         a word. `unless a cloud provider picks them` is the whole repair and it is rejected to cut
         it back for the 35 characters: the panel priced them at 24.8 units of depth at 1100x800 and
         nowhere else, against 92.2 of clearance to the row.
         `HERE IPV4 THEN IPV6` IS A HEDGE AND NOT FILLER. `.spec.ipFamilies` is what orders the
         addresses, `The first family you list is used for the legacy .spec.clusterIP field`, and the
         page calls the field optional with the unset order coming from the CIDRs, `The address
         family of a Service defaults to the address family of the first service cluster IP range`.
         Dropping `here` leaves IPv4 first stated as the mechanism when it is this Service history,
         which the page makes explicit: `you can add or remove a secondary IP address family, but you
         cannot change the primary IP address family of an existing Service`.
         `FAILS THE SERVICE OUTRIGHT` IS THE CREATION FAILING. The page reads `RequireDualStack:
         Allocates Service .spec.clusterIPs from both IPv4 and IPv6 address ranges when dual-stack is
         enabled. If dual-stack is not enabled or supported, the Service API object creation fails`,
         against `PreferDualStack: ... If dual-stack is not enabled or supported, it falls back to
         single-stack behavior`. So `outright` carries the whole failure, and a rewrite to a Service
         that exists and then stops working is rejected.
         `SINGLESTACK` IS DRAWN AND NEVER NARRATED, DELIBERATELY. The sublabel holding across
         `enable` is the documented behaviour, `When dual-stack is enabled on a cluster, existing
         Services (whether IPv4 or IPv6) are configured by the control plane to set
         .spec.ipFamilyPolicy to SingleStack`, and the closing clause of that step, `The Service and
         Pod still have one address each`, is the English of it. Spelling the enum out spends
         characters on the deepest panel reading the card has, which is that same step.
         TWO CLAIMS HAVE NO HOME IN THE DUAL-STACK PAGE AND CARRY A SOURCE OF THEIR OWN. `an A record
         and an AAAA record` is `DNS for Services and Pods`, `"Normal" (not headless) Services are
         assigned DNS A and/or AAAA records, depending on the IP family or families of the Service`.
         `each rewritten to the Pod address of that family` is `EndpointSlices`, `Each EndpointSlice
         object represents a specific IP address type. If you have a Service that is available via
         IPv4 and IPv6, there will be at least two EndpointSlice objects (one for IPv4, and one for
         IPv6)`, over `EndpointSlices act as the source of truth for kube-proxy when it comes to how
         to route internal traffic`.
         THE FOUR ADDRESSES ARE THE HOUSE PAIR MIRRORED INTO ULA. `10.244.1.5` is the catalog Pod IP
         and sits inside the `10.244.1.0/24` pod block `IPv4/IPv6 Dual-Stack` prints, `10.96.0.20` is
         the catalog ClusterIP, and both are reused here on purpose: the same Pod and the same
         Service the rest of the category draws. `fd00::1:5` and `fd00:96::a` echo their v4 digits so
         each table row reads as one address in two families, and they sit in prefixes as distinct as
         the v4 pair. Documentation IPv6 out of `2001:db8::/32` is rejected because it breaks that
         echo and the card draws no v6 CIDR for it to agree with.
         `ONE ETH0` IS THE CARD DRAWING AND NOT A QUOTE. `IPv4/IPv6 Dual-Stack` states the count,
         `Dual-stack Pod networking (a single IPv4 and IPv6 address assignment per Pod)`, and the
         interface it lives on belongs to `network-pod-ip-and-veth`. The claim stands because one
         cast under doubled wires is what this card exists to say.
SCOPE    The pod CIDR this card allocates out of belongs to `network-ipam-pod-cidr` and the service
         CIDR to `network-service-cidr`. Here both are one line of the config band's sublabel and
         neither is opened. The A and AAAA records the client resolves belong to
         `network-dns-records`, and this card takes the answer as given.
NOT A DEFECT
         The arrival ripple on `pod-two-addresses` expands over the `Pod web` label. `P.pod` prints
         its label 16 below the shell top and `L-11` pins the drop to the top face midpoint, so every
         vertical drop into a Pod meets its title. The ring runs r 3.15 to 27 over 560ms at 0.95
         falling to 0 while the label inks 999.5 to 1048.5 by 303.7 to 319.7 at 1100x800, so a 2.5
         unit stroke sweeps ACROSS the title and never covers it. Nothing here is a choice: `L-11` is
         machine held (`test:geometry/OFFEDGE`), the ripple carries no opt-in in the kit, and the 16
         unit label drop is `buildPod`'s and reaches every Pod in the catalogue.
         On `either-family` the two ClusterIP cells are lit and the two Pod IP cells are not. The
         step is about which ADDRESS the client dials, the Pod addresses are what the rewrite
         produces and the riding tags print them, and each PAIR is treated like its own neighbour,
         which is what `P-04` asks.
         `report/palette-steps` lists this card in the played half of the
         `network|scheme-box|network|highlight|stroke` conflict beside `network-namespaces`. That
         file says of all five such rows that they owe their second colour to a played sample with a
         pulse frozen at its first keyframe, and none of them moves the conflicting total.
```
