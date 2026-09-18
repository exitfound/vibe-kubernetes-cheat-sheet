## network-pod-localhost

### layout

```
WHAT     Containers in one Pod stand on one network stack: they reach each other over the shared
         loopback, they bind their ports in one shared space, and a call from outside lands on the
         one eth0 the Pod has.
LAYOUT   Two tenants over one stack, with the port space drawn as an instrument. Three columns of
         200 carry the whole card and are derived with `strip` across the shell interior 450..1110:
         the container row (`app`, `sidecar`) over the interface row (`eth0` left, `lo` spanning the
         container pair) over the socket table. `lo` is the wide member because both containers
         stand on it, and `eth0` is a single block off to the left because it is the door the
         OUTSIDE uses, which is also what puts the client Pod on the interface centre line rather
         than on the container one. The leftmost table slot sits under `eth0` and not under a
         container on purpose: a free port belongs to the space, and the two owned slots sit under
         their owners, which is the whole ownership device on the card. Every OUTER edge of the
         card resolves to one of two numbers: the client opens on `CONTENT_L` 60 and the shell closes
         on `CONTENT_R` 1140, and the readout strip spans exactly that band, so it reaches the
         diagram at both ends and centres on the canvas by construction rather than by a typed x.
PANEL    `OVERLAY_IDS=network-pod-localhost node --test report/overlay.test.mjs` from `scheme/test/`.
         Right edge 290.77 at 1600x1000, 377.76 at 1280x860, 396.55 at 1100x800. Bottom
         125.11..160.00, 150.17..192.67 and 180.12..229.82, deepest on the `recap` step, whose
         sentence carries the `shareProcessNamespace` qualifier the CONTENT block prices. The shell
         opens at x=420 and so clears the widest wall
         by 23.45 whatever its top does, which is what lets the card stand as high as y=168 and buy
         the 98 units the loopback taps need. The one block left of the wall is the client Pod at
         y 280..396, clearing the deepest panel by 50.18, and that margin is what a longer narration
         spends: the qualifier on `recap` spent 24.85 of it. `CLIENT_Y` is DERIVED from `SHELL_CY`,
         so the client stands level with the middle
         of the shell and moving the shell moves it: re-typing that y is what breaks the pairing.
SIZES    A block is 200 and not the category 232 (`NET.L-01` clause c): the three columns are sized
         BY the shell interior, `strip({ from: 450, to: 1110, count: 3, gap: 30 })` resolving to
         200 exactly, and 232 apiece would want 756 against the 660 the interior has. The actors
         are therefore the row rather than the row being the actors. `lo` departs the column the
         other way and spans 430, the container PAIR exactly, because a shared interface that is
         the same width as one tenant does not read as shared.
LANES    Four lanes, and every one of them carries a ball on some step, so every arrowhead is
         earned (`A-05`). The two loopback taps measure 98 units each, floor-bound at 700ms like
         `workloads-pod-resize`, and they land on lo's top face at -115 and +115 from its midpoint,
         the deliberate mirrored pair `L-12` admits.
         THE CALL FROM OUTSIDE STOPS ON THE SHELL, at the left face midpoint of the Pod, 128 units
         from the client face and with the arrowhead on the frame. That is `network-namespaces` read
         at Pod scale and for its reason: what an outside call reaches is the namespace as a whole
         rather than one interface inside it, so the whole Pod pulses and the interface it came in
         on turns up after that pulse. The delivery is then a SECOND lane, 256 units up out of eth0
         and over into app's LEFT face, because the answer comes out of the interface into the
         container holding the port and a single run would have to cross the container row to say
         it.
MOTION   THE EXTERNAL STEP DOES NOT PULSE THE POD, and the reason is a measurement rather than a
         preference. `pulsePod` writes `stroke`, `strokeWidth` and `strokeOpacity` on every
         `.scheme-box-rect` inside the shell with `fill: forwards`, and a filling animation outranks
         every author rule for the REST of the step, so with that pulse in place NEITHER `eth0` NOR
         `app` could paint its highlight. MEASURED on a real play at 1100x800, polling the two rects
         every 120ms: with the pulse, `eth0` opened bright, dropped to the resting 1.2px when the
         pulse landed at 1500 and never came back, and `app` took `.highlight` at its own arrival and
         still read 1.2px, so both arrivals landed on a picture that showed nothing. Without it,
         `eth0` reads 1.2px until the ball lands and 2.4px from that arrival, and `app` reads 2.4px
         from its own. That is the whole reason the step carries no Pod pulse, and it is also why
         `network-namespaces` keeps the same reading OPEN on `door`.
         THE ORDER IS THREE BEATS: the client pulses, the ball leaves at `BEAT.afterPulse` and stops
         ON the shell face at 1500 where `eth0` lights as the interface it came in on, and the
         delivery leaves `eth0` one `BEAT.afterHop` later and lights `app` and its slot on landing.
         `duration` is 3400 against a live span of 2860, which is 540ms of stillness and 11.6 ms per
         character, both mid catalog. `eth0` in `lit` is REJECTED: it closes the
         `report:arrival/R4` row, and it lights the interface before the call has arrived, which is
         the one thing the step is about.
         The loopback hop is a U and reads as one: the ball goes down into `lo`, `lo` lights on its
         arrival, and the second ball leaves the interface it just lit, so no ball departs a dark
         block (`M-18a`). `bind` and `conflict` carry no motion at all (`M-27`): a bind is a syscall
         and not traffic, and drawing a ball for one would be a packet the card does not narrate
         (`M-10`). What those two steps show instead is the table, which is the point of drawing it.
CONTENT  Read against `k8sVersion` 1.35 and the two `sources`.
         `Pod networking` ANSWERS THE CARD WHOLE and is why it is the first source: "Every container
         in a Pod shares the network namespace, including the IP address and network ports", "Inside
         a Pod, containers that belong to the Pod can communicate with one another on localhost",
         "Within a Pod, containers share an IP address and port space, and can find each other via
         localhost", and "When containers in a Pod communicate with entities outside the Pod, they
         must coordinate how they use the shared network resources (like ports)". Those four
         sentences carry `bind`, `localhost`, `conflict` and the port half of `recap`.
         `Cluster Networking` IS NOT A SOURCE FOR THIS CARD and is replaced. Measured on the live
         page, it carries ONE passing mention of localhost ("Highly-coupled container-to-container
         communications: this is solved by Pods and localhost communications") and zero on the
         namespace, the loopback, the port space or the single address, so it supported no statement
         the card leans on. `network-namespaces` reaches the same verdict on the same page.
         THE POD DOES NOT HAVE ONE INTERFACE, and this card draws both of them. `the one interface
         the Pod has, eth0` is rejected: `lo` stands on the same row of the same diagram and the
         `recap` names it, so the sentence is contradicted by its own picture before any source is
         opened. `external` reads `eth0, the one interface in the Pod that faces the network`, which
         is a claim about DIRECTION and leaves `lo` where the card draws it.
         A POD IS ONE ADDRESS PER ADDRESS FAMILY, not one address. `Pod networking` states "Each Pod
         is assigned a unique IP address for each address family", so `one host with one address` is
         false on any dual-stack cluster, which is the default since 1.21. `external` reads `one host
         with one address per family`, and what a second family COSTS stays with `network-dualstack`.
         `recap` closes the same gap the other way, by naming the address, the loopback and the port
         space as SHARED rather than by counting them.
         A LOOPBACK DELIVERY IS NOT A DELIVERY WITHOUT ROUTING. `There is no veth hop, no routing and
         no packet on the wire` is rejected: the local table sends 127.0.0.0/8 to `lo`, so a route
         lookup is exactly what puts the call on the loopback. `localhost` reads `no veth hop and
         nothing on the wire`, which is the true half and the half the step is about.
         `shareProcessNamespace` IS NAMED IN THE SAME BREATH (`T-19`, `T-20`). `each container keeps
         its own filesystem and process tree` is two unqualified absolutes, and the counter-case is
         one field: `Share Process Namespace between Containers in a Pod` states that with it set
         "Processes are visible to other containers in the pod" and "Container filesystems are
         visible to other containers in the pod through the /proc/$pid/root link", which falsifies
         BOTH halves. The qualifier is paid for in panel depth rather than dropped: it takes the
         deepest reading to 229.82 and the `recap` duration to 3300, which is what keeps its 317
         characters on the catalog median pace.
         THE `aria-label` DROPS ITS COUNT. `the single eth0` is rejected because a plugin can hand
         the Pod a second device, which `network-pod-ip-and-veth` already qualifies in its own
         words. It reads `the Pod eth0`, which names the interface without counting the Pod devices.
         A bind is to an (address, port) PAIR and not to a port. `man 7 ip` states that only one IP
         socket may be bound to any given local (address, port) pair, and `man 2 bind` reports
         EADDRINUSE as an ADDRESS already in use. So `conflict` says the app asking for that same
         PAIR is refused, and closes on the free slot rather than on an absolute. SO_REUSEPORT
         (`man 7 socket`, Linux 3.9) permits several sockets on an identical address and is the
         counter-case deliberately NOT named: it is a socket option that behaves the same for two
         processes in one container and on a bare host, so it says nothing about the shared
         namespace, and it cannot be stated correctly in one clause because it also requires every
         binding process to hold the same effective UID, which two containers with different
         runAsUser do not. A wording that says `cannot both listen on the same port` re-opens it.
NAMING   The container sublabels read `server` and `proxy` and name no port. The ports live in the
         socket table and nowhere else: an `app` sublabel of `listens :8080` standing over a table
         reading `:8080 free` at idle is a card contradicting itself on its own poster frame.
SCOPE    This card owns THE CALL and THE PORT SPACE: 127.0.0.1, the one table the two containers
         divide, the bind conflict that follows from it, and which of them answers on the Pod IP.
         The namespace as a private copy of a stack, drawn as its four layers, belongs to
         `network-namespaces`, so the shared stack appears here as two interfaces and a port table
         rather than as a layer column. The CNI ADD, the IPAM draw, the veth pair and its cni0
         attachment belong to `network-pod-ip-and-veth`, and eth0 appears here only as the interface
         the outside call lands on.
NOTE     The three port slots are `P.chip` and are top-level parts rather than children of the Pod.
         `pulsePod` animates `.scheme-box-rect` with `fill: forwards`, and a filling animation sits
         above every author rule for the rest of the step, so a lit BOX inside a pulsing Pod cannot
         paint (the finding `network-namespaces` carries OPEN). A chip carries no `.scheme-box-rect`,
         so the table keeps painting through the pulse the `external` step fires, which is the step
         that lights `:8080` on arrival.
WHY NOT  A 2x2 grid of `app`, `sidecar`, `eth0` and `lo` as four equal boxes. It
         draws the two interfaces as peers of the two containers, wires neither of them to
         anything, and sends the localhost call straight across from app to sidecar, so the picture
         says two hosts on a wire while the panel says a loopback delivery.
         A single shared BAR holding both interfaces, with the containers dropping taps onto it.
         It is the `network-namespaces` composition at one layer instead of four, and that card's
         SCOPE hands localhost here precisely so the two do not draw the same picture.
NOT A DEFECT
         THE READOUT CHIPS STAND ON THEIR NEW VALUE BEFORE THE BALL LANDS, on `localhost` at 700ms
         and on `external` at 1500ms, which `report/arrival.test.mjs` prints as three FORM-B rows.
         `P-06` is what puts them there: a value chip lights at step ENTRY with its text change while
         a box, a Pod or a cylinder lights on ARRIVAL, and the queue `report/chip-beat.test.mjs`
         prints carries the same reading catalog-wide, with established cards at 1600 to 1900ms.
         Turning the two over at the
         arrival instead needs a `rewind` plus an `F.set` per chip, which is the `network-namespaces`
         slab idiom and not the one this category writes: all 44 network cards state their chips
         through `chips` at entry.
         THE BALLS RIDE `P.arrow` ARRAYS AND NOT `P.lane` ARRAYS, which `report/lane-traffic.test.mjs`
         classes as OTHER-PART on three of the four lanes. Each ball rides the SAME array the drawn
         part carries, which is what `A-02` asks for. Three of the lanes are two points, and two
         points is what `P.arrow` is for, so the only way onto the SHARED tier would be to draw a
         two-point `P.lane`. `network-ipam-pod-cidr` and `workloads-container-states` sit in the same
         row for the same reason.
```
