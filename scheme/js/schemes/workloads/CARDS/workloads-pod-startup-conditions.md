## workloads-pod-startup-conditions

### layout

```
WHAT     The five lifecycle conditions a Pod climbs before it is Ready, who writes each one, and
         what status.phase does while they climb.
LAYOUT   Instrument panel, and NOT the A / B / C column preset this category defaults to. The
         subject is one readout that climbs, so the canvas is four stacked bands read top to bottom
         rather than two columns read left to right:
           actors     40..120, Kubelet 484..716 centred on CX, API 908..1140
           readings   160..236, two chips in the RIGHT column 660..1140 only
           Node       300..900 by 270..428, Pod 370..830 at 302..410
           staircase  440..572, five treads of 216 x 44 stepping 216 right and 22 up
           phase rail 592..626 full width, split once at 708
         THE BAND ORDER IS FORCED and not chosen. The corridor from the Kubelet has to reach the Pod
         down the 540..660 column (WL.L-07) and the staircase spans the full width, so a staircase
         above the Pod would be crossed by that lane (L-10). The Node band is therefore the first
         thing under the panel and the instrument is on the floor, which is the reverse of the other
         six cards in this section.
         TWO chips and not four. status.phase is the rail and the next condition still False is the
         position on the staircase, so both left the chip column: a value drawn as an instrument and
         restated in a chip is two elements saying one thing. What is left is the two readings no
         instrument carries, and they sit under the API box that owns them.
         Their band is the only use L-03 allows for the height above the panel bottom: the full
         height is free right of x=420, the corridor owns 540..660, so a block there is either the
         right column or nothing. 160..236 centres the pair in the 120..270 gap.
         The Node frame is 600 wide and NOT the WL.L-02 full width. It holds one Pod and no second
         object, so the full width leaves 310 units of empty band either side of it. 70 either side
         of the Pod is the padding the frame actually needs. The cost is a CENTRE reading of 720
         against the 600 +-40 band, taken with the staircase and the rail dropped as chips (L-17).
         Its top midpoint is 600, which is what lets the corridor land on the frame face (L-11). The
         treads TOUCH at their vertical edges and rise half their own height, so the profile is a
         stair. Gaps would make it a row of five boxes at five different heights.
         The rail splits at 708, which is TREAD_X(3) and not a number of its own, so the boundary
         between Pending and Running stands under the tread whose container start moves it.
         The A / B / C preset is out. As five conditions in a P.chain in the left column, four chips
         in the right and the Node on the floor it measures green on every rule and shares its
         composition SIGNATURE with four of the seven cards in this section (box2 pod1 node1 chip4
         chain1 raw0, bands 40/496/518), so a reader with the narration covered cannot tell it from
         workloads-env-before-pid-1. Two things it cannot say either: setChainActive lights ONE row,
         so the climb never accumulates on screen, and status.phase is one chip among four rather
         than the second track the whole card is about.
         A `spec.readinessGates` block feeding the last tread as a visible second input has nowhere
         to stand. Every place it fits is inside the Node frame or under the rail, and a lane to it
         from the API crosses the whole Node band. The conjunction is that tread's second line.
PANEL    The deepest reading is step 0 at 1100x800, x<=396.55 by y<=254.66. The Node frame starts at
         270, so 15.34 units stand clear of it, and 396.55 ties the catalog-wide L-02 worst and
         stands 0.45 off the 397 ceiling. So any prose edit on this card is re-measured rather than
         reasoned about, and what prints the extent per viewport is
         `OVERLAY_IDS=workloads-pod-startup-conditions node --test report/overlay.test.mjs`.
SIZES    A tread is 216 x 44, and 216 is WL.W / 5, so the staircase spans L..R exactly and the
         content bbox centres on CX by construction.
         Measured at 1100x800: the longest first line is 153.4 (PodReadyToStartContainers) and the
         longest second line 190.2 (kubelet · every container ready), so the tightest cell keeps
         12.9 units either side. That is the wall a tread sublabel is written against.
         The two baselines are box()'s own optical centres, h/2 - 3.22 and h/2 + 12.78: a two-line
         cell has the problem box() already measured over every height from 38.75 to 81.38.
         The chips are the category column 660..1140 at WL.CHIP_H, 34 with an 8 gap, so the pair
         stands 40 clear of the actor row and 34 clear of the Node frame.
         The Pod is 108 tall because pod() fixes BOTH its text baselines: the label at 16 and the
         sublabel at h - 8, so the only way to buy air around the inner box is the shell height.
         Measured at 1100x800 with the inner box 300 x 48 at 332..380: the label ink is 305.7..321.7
         and the sublabel ink 392.2..404.5, so the box stands 10.3 under the label and 12.2 over the
         sublabel. At POD_H 96 those two gaps were 10.3 and 4.2.
         The 3.7 over the label ink and the 5.5 under the sublabel ink are pod() itself and are the
         same on every card in the catalog.
LANES    Down the corridor at WL.SPINE_X from the Kubelet bottom midpoint to the NODE frame top
         midpoint at 270. SPINE_UP is its reverse, so the Kubelet action and the Pod report cannot
         drift apart. Length 150, which is UNDER the PKT_DUR_MIN floor, so a route costs 700ms
         rather than the 333 its length alone would buy.
         A lane between the actor row and the Node band ends on the FRAME face, in both directions,
         never on the Pod inside it: the endpoint on POD_Y that 14 workloads cards still carry is
         the retired form. It is also why the frame is centred on WL.SPINE_X, since a face midpoint
         is what L-11 asks for.
         Both actor boxes are 232, which is CLU.BOX_W and what cluster-node-restart draws its
         Kubelet and Container runtime at, and the arrangement is that card's too: left box centred
         on CX for the spine, right box right-aligned on WL.R where the chip column also ends. That
         leaves 192 between the faces rather than 60, a length six cards already run, and 42.4 and
         63.9 of margin around the two strings. Both top hops take their OWN route time through
         routeDur rather than topPacket's fixed HOP_MS, which is the default AND routeDur's floor:
         at 192 the two agree at 700ms, and past about 315 units they would not. A fixed duration on
         a lane whose length can move is how a ball comes to fly at 0.503 against the catalog 0.450
         (M-12), which deriving it here forecloses.
         Top row: REQ_Y carries the status PATCH out to the API, RESP_Y carries the watch event back
         to the Kubelet (WL.A-01). Both ride, so both are arrows and neither is a relation. Nothing
         rides into the staircase or the rail. They are a readout of what the top row wrote, and a
         lane into either would claim the Kubelet talks to its own instrument.
         The last step carries the corridor in its resting DOWN direction and no ball rides it,
         because the only traffic that step names is the top-row PATCH. Pointing it up would aim an
         arrowhead at the Kubelet on the one step nothing travels to the Kubelet.
MOTION   Step 1 is the only self-initiated send from the API and waits BEAT.lead.
         Step 2 is a down-arrow: the ball lands, THEN the Pod blinks and lifts (M-16).
         Steps 3 and 4 are up-arrows: the Pod blinks first and the report leaves at BEAT.afterPulse
         (M-15), and step 4 hangs its fade one beat behind the blink (M-08).
         Two opacity lifts and both are events: notready to pending when the sandbox exists, pending
         to full when every container is ready.
         The staircase fills as a PREFIX and never as one lit rung: climb(n) holds every tread
         already taken at full weight and the rest at OPACITY.notready, so a reader landing on step
         3 can see two rungs behind it and two ahead. Only the tread this step flips is lit. The
         rail is lit on step 4 ALONE, the one step of the climb that moves status.phase. A segment
         lit on every step would say the opposite of the card.
         `dim: true` is declared on step 3 ALONE, which is the one pulse with no F.fade beside it. A
         fade carrying `fill: both` composites over the whole delay window and is created after the
         pulse, so on steps 2 and 4 the opacity half of pulsePodDim never renders: the brightness
         half still fires, so the blink survives, and the exemplar reserves `dim` the same way
         (workloads-probes: dim on its two fade-free steps, plain pulse on its four). Spans measure
         2060 / 2060 / 2860 / 2860 / 2400 against durations 2400 / 2600 / 3100 / 3200 / 3000. The
         corridor is 150 units and every route on it sits on the PKT_DUR_MIN floor, so moving it
         again changes no span until it passes 315 units.
         The Pod pulse on the last step hangs off the PATCH arrival, which lands on the API at the
         top of the canvas while the Pod sits on the floor. The beat is the Pod's own state change
         and not an arrival at the Pod, so the only ring on screen is the API's.
CONTENT  THE DESC OPENS ON A SET, NOT ON A POSITION. `Which rung is a Pod stuck on when it is not
         Ready yet?` is rejected twice over. It borrows the STAIRCASE this card draws into the one
         string a reader meets before opening anything, on the grid and in search, where no ladder
         has been shown and nothing upstream is called a rung. And `stuck ON` asserts a single place
         where the API offers a set: the Pod Conditions page defines `an array of PodConditions`,
         each element carrying its own `status` of `True`, `False` or `Unknown`, so a Pod that is
         not Ready normally holds several True conditions and more than one False at the same
         instant. The shipped opening is `When a Pod is not Ready, which of its conditions are still
         False?`, plural on purpose so it cannot re-assert one position.
         The card contradicts the ladder itself, which is the second reason: the page states that
         `For a Pod without init containers, the kubelet sets the Initialized condition to True
         before sandbox creation and network configuration starts`, and step 3 draws exactly that
         Pod, so the third condition flips ahead of the second on the case the card chose.
         The other four desc claims are read against 1.35 and stand verbatim. `roughly this order`
         is the page phrase `the kubelet sets the following conditions roughly in this order` and
         the five names are its list in its order. `The Kubelet begins pulling images only after the
         second condition flips` is `The kubelet can start pulling container images and create
         containers after PodReadyToStartContainers condition has been set to True`. `Ready can lag
         ContainersReady whenever a readinessGate has not agreed` is `The Ready condition depends on
         more than just ContainersReady. If the Pod specifies readinessGates, all of those custom
         conditions must also be True for the Pod to be Ready`.
         PodReadyToStartContainersCondition is Alpha 1.28, Beta and on by default 1.29 through 1.36,
         Stable 1.37, read off the feature-gates reference. The card is pinned at 1.35, so the
         narration says beta and on by default and names 1.37 as the lock, never stable now. The
         order PodScheduled, PodReadyToStartContainers, Initialized, ContainersReady, Ready is the
         page order, and the page states two facts the card turns on: the Kubelet starts pulling
         images only after PodReadyToStartContainers is True, and Initialized is True BEFORE sandbox
         creation on a Pod that declares no init container.
         That second fact is why the order is drawn as ROUGH and never as fixed. The page says the
         kubelet sets them `roughly in this order`, and a card whose own step 3 flips Initialized
         before the sandbox exists cannot un-hedge it. `a fixed order` in the desc, `flip in that
         order` in the aria-label and `an order rather than a clock` in step 3 are all rejected, the
         last one because it draws the opposite conclusion from the counter-case beside it. DECIDES
         and not SETS on the Kubelet box. `sets four of the five` is rejected: the page opens its
         list with `the kubelet sets the following conditions` and names all five, and upstream
         kubetypes.PodConditionsByKubelet carries PodScheduled, which the Kubelet re-asserts True in
         every status it generates. What is four of five is the DECIDING.
         PodScheduled=True is written by the API server when the Binding lands, before any Kubelet
         has the Pod, which is why step 1 says the Scheduler posts a Binding and the API writes
         spec.nodeName rather than crediting the write to the Scheduler.
         cluster-scheduler-decision states it as `a Binding to the binding subresource, not a Pod
         patch`, and the two cards agree.
         The PodScheduled tread keeps `kube-scheduler · nodeName set`, naming the decider and not
         the writer. A `kube-apiserver` reading would credit the write to the box already drawn as
         the API and leave the Scheduler unnamed anywhere on the canvas.
         ContainersReady reads `every container ready`, and `every probe passes` is rejected. The
         page says all containers are ready and that a container's readiness is determined by its
         readiness probe `if configured`, so a Pod with no readinessProbe flips the condition with
         no probe passing at all, which is the common case that reading denies.
         Initialized keeps `init exited 0`. It is the page's `all init containers have completed
         successfully` in the width a tread has, and the two Pods it does not cover are carried
         elsewhere: no init container at all is step 3 itself, and a restartable init container that
         never exits is workloads-init-containers-and-sidecars.
         The endpoint stands in the slice BEFORE Ready flips. `the Pod IP joins the EndpointSlice of
         every matching Service` is rejected, because a slice `includes references to all the Pods
         that match the Service selector` and the ready condition is a shortcut for serving and not
         terminating, so the entry exists at ready=false from the moment the Pod has an IP. The
         Service endpoints chip therefore reads empty only while the Pod has no IP, `10.244.1.5
         ready=false` from the sandbox step on, and `10.244.1.5 ready=true` on the last step, where
         Ready flipping turns that one endpoint ready. network-endpointslice-reconcile owns the
         mechanism and already says the same, that a notReady Pod is recorded and kept out of the
         serving set. That sibling spells it `10.244.2.7:8080 · notReady` and this card keeps
         `ready=`, which is the EndpointSlice condition field and its boolean, because the flip of
         that one value is what the chip is drawn for and because workloads-probes already writes
         `ready=false` for the same endpoint. EndpointSlices is the fourth source because none of
         the other three carries that sentence, and Pod Conditions carries only the shorthand that a
         Pod which is not Ready is removed from Service endpoints.
         status.phase moving ONCE holds: Running is bound plus every container created plus at least
         one running, which the app container start satisfies, and nothing later in the climb moves
         it again.
NAMING   A tread's second line is a READING and not a field: it names who writes that condition and
         what makes it flip, so P-02 holds without it claiming to be API. The writer is the
         identifier form (`kubelet`, `kube-scheduler`) because System A calls a sublabel body text
         (T-09). The last tread states a rule rather than an event, because Ready is a conjunction.
SCOPE    The container runtime and the CNI plugin are named by the sandbox step and drawn by neither
         it nor any other, which breaks T-21 on purpose. The CRI stack is cluster-pod-sandbox-cri
         and the plumbing is network-cni-invocation, and both draw it in full. The room argument is
         NOT the binding one and is not made here: the actor row has no third slot under WL.L-02 and
         WL.L-07, and since the frame narrowed to 600 the bands either side of the Pod are 70 wide,
         which fits nothing. The cession is what decides it and the room argument no longer even
         contradicts it.
         The Scheduler is named by the first step and drawn as the sender of the watch event rather
         than as an actor of its own, which nine other workloads cards also do.
         status.phase is one rail and one line here, never a derivation:
         workloads-pod-lifecycle-phases owns the phase machine and already states that phase is
         deliberately coarse. This card is the detail that sentence promises.
         The EndpointSlice mechanism is network-endpointslice-reconcile. The endpoint is one chip
         value that carries the IP from the sandbox step on, and no controller is drawn: what the
         last step changes is the readiness of an entry that already exists.
         Probe semantics are workloads-probes. readinessProbe is named once, as the thing that makes
         a container ready, and no probe period or threshold appears.
```
