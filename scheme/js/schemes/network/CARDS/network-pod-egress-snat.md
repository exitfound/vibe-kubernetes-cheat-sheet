## network-pod-egress-snat

### layout

```
WHAT     A Pod reaching the Internet: the POSTROUTING rules the Node walks on the way out, the
         MASQUERADE rewrite that follows, and the conntrack entry that makes the reply findable.
LAYOUT   Three bands, not one line. The middle band is the masqueraded path and owns `EGRESS_Y` 390:
         Client Pod, the POSTROUTING box and the Internet box all centre on it, so the out and back
         lanes meet each of them symmetrically. The top band (215..325) holds the EXEMPT destination,
         reached from the rule box TOP face so the two exits never share a face and never cross. The
         bottom band (470..530) holds the conntrack store, under the rule box on the same `RULE_CX`.
         The rule box sits 20 INSIDE the Node right edge rather than mid-frame, which is the whole
         argument of the composition: the packet crossing x=700 is the packet leaving the host, and
         the last thing on the host is the rule that rewrites it. Content spans x 80..1120 and
         centres on x=600 exactly, and the chip strip takes the same two extremes.
PANEL    Flat at 180.12 on 1100x800, 150.17 on 1280x860 and 125.11 on 1600x1000: the SAME number on
         every step of the card, which is rare and is bought by holding every narration to six lines
         at the narrowest viewport. `OVERLAY_IDS=network-pod-egress-snat node --test
         report/overlay.test.mjs` from `scheme/test/`. `NODE_Y` 215 clears the deepest by 34.88 and
         the frame runs from x=80, so `L-03` binds it.
SIZES    Everything in an actor row is 232, the `NET.L-01` default: both destinations in the right
         column and the rule box. The widest string the rule box draws, `nat table · masquerade
         rules`, inks 168.8 at 1600x1000, so 232 leaves 31.6 a side and none of the three `NET.L-01`
         escapes applies. The separator is one space each side, which is what the other 57 sublabels
         carrying a middot use, and a second space is what `statics.mjs` flags. The four chips are
         240/220/270/250 with 20 gaps, which is 980 plus 60 over the 1040 the picture spans: each is
         floored by its own widest value, `no nat rule walked` and `translation reversed` being the
         two long ones.
LANES    Four pairs, every one of them +-`LANE_DY` about a face midpoint, which is the `L-12` shape:
         Pod to rule box, rule box to Internet, and the store write and read under the rule box. The
         exempt leg is the one unpaired lane, because nothing ever comes back along it. The two
         masqueraded lanes cross the Node frame at x=700 on purpose and that crossing is the subject.
         The Pod lanes measure 148, which `pace.mjs` puts at 0.211 units a ms and which two other
         cards in the catalog also run, so it is the house reading of a floor-bound hop rather than
         this card on its own. The two store stubs are 49 and run 0.070, rank 51 and 52 of 902: the
         49 units would finish under `PKT_DUR_MIN` whatever they measured, so `routeDur` clamps and
         `M-13` is the answer. Lengthening them is bounded by the Node bottom and buys 0.099 at best,
         which is still bottom-decile, so the stubs stay short.
MOTION   `reply` obeys `P-03`. Conntrack reverses the translation where the reply MEETS the rule box,
         so the two chips it moves cannot already read their end state while the ball is crossing:
         `chips` keeps the end state, `rewind` carries what the reply actually arrives with (`dst`
         still the Node IP, the entry merely `matched`), and one `F.set` writes both on the return
         arrival, which is also where `lights: ['ruleBox']` cues the box. On `masquerade` the store
         is written FIRST and the packet leaves `after` that arrival, which is the order the
         narration states rather than a timing preference. On `rule` the ball arrives INTO a Pod, so
         the receiver blinks as a whole Pod (`M-03`) and not by a highlight on its inner box: lighting
         `peerApp` alone leaves the shell dark and reads as a packet reaching a box that happens to
         sit inside a Pod. The pulse is what makes that step move at all: without it the step stands
         still for 66 percent of its length, with it 35, against a catalog median of 42.
WIRE LABELS
         The branch caption stands over the part of the exempt run that is OUTSIDE the Node, centred
         on 794, not over the whole run. Centred on the run midpoint (719) its longer form inks
         across the Node right edge at 700 and the comma of its shorter form sits on the dashed frame
         line. At 6.94 units a glyph, measured off the rendered frame, 794 leaves 17 units a side on
         the wider of the two strings.
CONTENT  Claims read against k8s 1.35.
         `A Pod IP is routable only inside the cluster` is rejected. A routed dataplane advertises
         each Node podCIDR and makes Pod IPs real on the underlay, which `network-pod-to-pod-cross-node`
         states in its own desc, and a plugin can turn the SNAT off outright. `No route on the internet
         leads back to a Pod IP` is true whatever the plugin does and is the claim the card needs,
         because the reply finding its way home is the whole mechanism.
         `the last thing the Node does before the packet leaves` is rejected: POSTROUTING is the last
         NETFILTER hook, and the queueing discipline and the driver come after it. The card says `the
         last netfilter hook on the way out`.
         `the reply walks no rule at all` is rejected as an unqualified absolute (`T-19`), false of the
         filter table: what the reply skips is the nat table. The narration says `no masquerade rule at
         all` and the chip reads `no nat rule walked` rather than `none, conntrack only`. Both siblings
         already carry the qualified form, `network-conntrack-nat` with `no rule read` inside a NAT
         sentence and `network-netfilter-path` with `walking no Service rule`.
         The rule list is walked once per flow, which `Only the first packet of a flow walks these
         rules` states, because `network-conntrack-nat` owns `Every later packet is translated straight
         off that entry, no rule read`.
         The exemption and the fall-through are the ip-masq-agent chain as the task page prints it:
         `RETURN` for 169.254.0.0/16, 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16, then `MASQUERADE
         all -- anywhere anywhere`. That default set is WIDER than one cluster pod CIDR, so the card
         says `anything inside the cluster` and names 10.244.0.0/16 as this cluster range rather than
         as the rule.
         MASQUERADE takes the address of the interface the packet leaves by, which is the distinction
         from plain SNAT and what the narration states.
         `Pod to Pod traffic keeps its own source` rests on the network model: `Pods can communicate
         with each other directly, without the use of proxies or address translation (NAT)`. The
         source-ip tutorial adds `Packets sent to ClusterIP from within the cluster are never source
         NATed if you are running kube-proxy in iptables mode (the default)`, and the card draws no
         proxy mode so it does not inherit that qualifier.
         Cluster Networking and Virtual IPs and Service Proxies are NOT sources for this card: both
         are fetched and neither mentions masquerade, SNAT, Pod IP routability or the nat table at
         all. The three pages cited above are the ones that do, each taking the label the catalog
         already binds to that href.
         1.1.1.1 stays as the internet destination: `network-packet-classification` uses the same
         address for the same role, so it is the house reading rather than this card on its own.
BUDGET   Six lines of narration at 1100x800, about 240 characters. Spending it is what moves the
         panel bottom off 180.12, and the card has 34.88 units of clearance to spend before `L-03`
         binds: two steps at seven lines measure 204.97.
SCOPE    The conntrack ENTRY itself, its original and reply tuples and the ESTABLISHED transition,
         belong to `network-conntrack-nat`. The hook chain the packet walks to reach POSTROUTING
         belongs to `network-netfilter-path`. This card draws conntrack as a store it writes and
         reads, and draws one rule list rather than the chain that leads to it.
NOT A DEFECT
         Six entries in the arrival-cue queue read `chip already reads X and is lit at entry`. That
         is the declarative `chips:` block writing the static state at step entry, which is the house
         form: the queue holds dozens of cards and the largest single card in it carries five. The
         two on `reply` are also FORM-E, so they are ruled where the gate can read the ruling, in
         `test/fixtures/carried.mjs`: the reply carries the SERVER as its source from the moment it
         leaves the Internet box, and `no nat rule walked` is the premise of a step whose narration
         is that the reply walks no rule. `dst` and `conntrack` are what the arrival earns, and that
         split is the sentence.
         The `report/arrival.test.mjs` R2-ENTRY row on `step 5 chip conntrack` is ruled where the file
         that prints it can read the ruling, `test/fixtures/carried.mjs`, so it comes back marked
         CARRIED rather than sitting on the open queue: the value is carried from the end of `reply`,
         where it is the news and is lit, and it looks like a change only because `rewind` shows
         `entry matched` at that step entry. Cueing it again on `deliver` would say the reversal
         happens twice. With that row carried the card names nothing on any open report queue.
```
