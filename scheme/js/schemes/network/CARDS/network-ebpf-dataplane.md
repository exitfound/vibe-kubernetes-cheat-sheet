## network-ebpf-dataplane

### layout

```
WHAT     The eBPF dataplane replacing kube-proxy: a program at the socket hook reads a BPF service map
         and rewrites the connection at connect() time, so there is no per-packet iptables walk and no
         DNAT.
LAYOUT   FAN_X is DERIVED, midway between the program right edge and the Pod left edge, so widening
         the card moves the fan turn with it rather than leaving it behind. The BPF maps box sits
         directly ABOVE the program at MAP_Y 120, which is what makes the lookup link one short
         vertical rather than a reach across the card.
PANEL    Deepest at 1100x800 on `connect-time`: `OVERLAY_IDS=network-ebpf-dataplane node --test
         report/overlay.test.mjs` from `scheme/test/`. The client Pod is the only block left of the
         panel edge, x 70..270, and it opens at y=252, which leaves 47 units of clearance under the
         deepest reading. The maps box at MAP_Y 120 stands beside the panel rather than under it, at
         x >= 440.
LANES    All five wires are cyan `rgb(79, 229, 255)` dashed routes carrying the network arrowhead,
         taken from the kit role binding rather than written at the call site: `CONNECT`, the
         `LOOKUP` / `LOOKUP_BACK` pair, and `TO_PODX` / `TO_PODY`. Four of those arrays feed both a
         wire and the ball that rides it, so a route and its packet read as one hue (`NET.A-04`).
         Neither fan leg is a relation: `TO_PODY` is a
         real path to a real backend, and what says the lookup went the other way is the dimmed Pod
         at its far end, not a drained wire.
MOTION   Three of the five working steps land no ball and carry NO motion at all: `attach`, `maps` and
         `no-kube-proxy` register zero animations and hold a still picture for their whole duration.
         That is `M-27`, and it is deliberate. The beat on each is the static `.highlight` its `lit`
         already names: `attach` lights `hook`, the box that IS the attached program, `maps` lights
         `bpfmap`, the box the lookup lives in, plus `svcChip` carrying the result, and
         `no-kube-proxy` lights both `hook` and `bpfmap`, the one two-actor step here, because its
         sentence is that programs plus maps together are the whole dataplane. The thing it removes,
         kube-proxy, has no block on this card at all and exists only as `kpChip`.
         Step 0 is the static poster, and `connect-time` and `deliver` already carry balls.
         `modeChip` is the one value on this card that is NOT written at step entry: `connect-time`
         is what the returned address MAKES true, so the step winds the chip back to `per-packet
         DNAT` and turns it over under `F.set` plus `F.light` at the `answer` arrival, 3100ms in.
         Stated at entry it reads as the payoff of a lookup the picture has not drawn yet, which is
         the `P-03` FORM-B lead the report ranks. The 900ms hold at the end of the step is what the
         turnover spends.
WIRE LABELS
         `map lookup` is offset from `LOOKUP_X + LOOKUP_DX`, the RIGHT lane of the pair, and not from
         the centre line: 15 units off `LOOKUP_X` puts its first glyph at x 565 against a return lane
         at 562 and a ball of radius 4.3 riding it, so the `m` sits under the ball. Off the lane it
         starts at 577 and ends at 645.9, 14.1 clear of the box edge at 660.
CONTENT  The deliver step carries a `src` tag on a ball whose wire label reads `to .2.7`, so the
         narration has to name BOTH: the destination it goes to and the source it still carries. A
         tag stating something no sentence states reads as the wrong address on the wrong ball.
         `the client source IP arrives unchanged because nothing was NATed` is rejected as the
         reason: iptables mode preserves it too, because DNAT rewrites the destination only.
         `kubernetes.io/docs/reference/networking/virtual-ips/`: `packets are redirected to the
         backend without rewriting the client IP address`. What IS particular to this path is that
         the socket is connected to the backend before a packet exists, which the shipped wording
         states instead: `docs.cilium.io .../kubeproxy-free/`, `the kernel socket is actually
         connected to the backend address and therefore no additional lower layer NAT is required`.
         `which is the main reason large clusters adopt this mode` is rejected as a superlative no
         source states. The constant-time sentence carries the motive on its own.
         The card names `Cilium and Calico` because the mechanism is a CNI implementation and not
         upstream Kubernetes, and a dialog reader never sees the `desc` where `The CNI agent` says
         so. Both replace kube-proxy in eBPF mode: Cilium `skip the installation of the kube-proxy
         add-on`, Calico `In eBPF mode Calico replaces kube-proxy`.
         Read against `k8sVersion` 1.35. The two upstream pages carry the BASELINE this card
         contrasts against, the kube-proxy modes and the BPF map primitive, and neither carries
         connect-time load balancing or kube-proxy replacement, so the Cilium page is cited for
         the mechanism itself.
NOTE     The destination label sits UNDER the first fan segment, just as the rewritten connection
         leaves the program: the riding src tag rides ABOVE the ball at y312, so the dst label
         takes the band below, where it collides with neither the tag nor the fan riser.
DO NOT   Put `F.flash` on `attach`, `maps` or `no-kube-proxy`. It animates
         `filter: brightness(1) -> 1.55 -> 1` on the block GROUP, which `M-04` calls a pulse and
         `M-01` forbids on infrastructure, and its peak of 1.55 is above the 1.4 of the Pod pulse
         `M-01` reserves the mechanism for. It is also unreviewable: 600ms against a step span of
         600ms puts every freeze point inside the pulse, so a still frame cannot tell it from the
         static highlight it would replace.
NOT A DEFECT
         `TO_PODY` carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see the map
         lookup picked one of two, and the card says so in words. N destinations, N wires (`NET.A-03`).
OPEN     `src 10.244.1.5` on `deliver` is cut for 700ms of its 1400ms readable life, the same on all
         three viewports, by the Pod web left face and the app box left and top faces: the fan turns
         down into the Pod, so the tag arrives with the ball at a face. It clears at -61, which is 46
         from this card's resting -15 and well past the ceiling that keeps a tag reading as its own
         ball's address. Measured directly, not inferred: at -46 the cut is still 600ms, and only -61
         takes it to zero. Everything inside the ceiling buys 100ms of the 700, so the tag stays.
```
