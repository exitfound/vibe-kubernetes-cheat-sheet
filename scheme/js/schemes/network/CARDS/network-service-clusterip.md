## network-service-clusterip

### layout

```
WHAT     The category exemplar (`NET.S-03`). A ClusterIP round trip with the programmer drawn apart
         from the path: kube-proxy watches the API server and writes Service rules into the Node
         dataplane, the client dials a virtual IP, the dataplane DNATs it to one of two backends, and
         conntrack unwinds the NAT on the way home. kube-proxy is never on the packet path.
LAYOUT   Its extents are the ones other networking cards copy: CX 600, SCHEME_L 60, SCHEME_R 1140,
         the same L/R/CX the Workloads canon uses.
         A control COLUMN on CX stands over a horizontal PATH. API server (y 40), kube-proxy (y 176)
         and the Node dataplane (y 300..380, centred on FLOW_Y 340) share one size, 232 x 80. The
         client sits left of the dataplane and the two backend Pods sit SYMMETRIC above and below
         FLOW_Y on the right, podY the exact vertical mirror of podX. The column meets the path at
         ONE box, the one every traffic lane ends on, and that T is the lesson: the two boxes above
         the path light on `virtual` and `program` only and stay dark on every step a packet moves.
PANEL    Deepest y 180.1 at 1100x800 on steps 2 to 7, 171.4 at 1280x860 and 142.6 at 1600x1000:
         `OVERLAY_IDS=network-service-clusterip node --test report/overlay.test.mjs` from
         `scheme/test/`. The client Pod, x 60..250, is the one block left of the panel edge and
         opens at y=280, 99.9 below the deepest reading. The column starts at x 484, right of the
         wall.
SIZES    All three column boxes are 232 x 80, the kubelet block of `network-model` (NET.L-01 for the
         width), and the dataplane carries both mirrored fan attach pairs (18 and 6 off FLOW_Y) inside
         its 80. The widest column string is `Service web · EndpointSlice`, 165.6 at 1100x800, which
         leaves 33 clear a side in 232. The chip strip stands at y 576, 29 under podY.
LANES    Each backend is wired by a forward fan and a return fan of identical shape, so the arrows
         travel the same on top and bottom and always meet a Pod at its left edge, and podY's pair
         is the vertical mirror of podX's.
         The watch lane runs API server to kube-proxy, 56 units, and carries the one ball of
         `program`. The kube-proxy to dataplane link is a relation with no arrowhead and nothing
         ever rides it: kube-proxy WRITES the rules that box runs, and a ball on that link says it
         forwards traffic, which is the misconception the card exists to correct.
MOTION   The traffic balls glide 10 percent slower than routeDur, through an explicit dur the
         `PACING` map of `render/motion.test.mjs` registers as a ceiling of 8. Only the BALL TRAVEL
         is slowed, and riding labels take the same slowDur so they stay locked to the ball. The
         watch ball rides plain routeDur, 700ms on the floor, so it stays off that ceiling.
         `program` has no pulse: the API server is lit in the static block and its ball leaves at
         BEAT.lead 800, kube-proxy lights on the 1500 arrival, and at 1600 the dataplane and the
         DNAT chip light together with the `F.set` that writes `-> .2.7 / .3.9` (`rewind` holds
         `none` until then). Span 2060 against a duration of 2700.
         `dnat` opens on the lit dataplane and its ball leaves at BEAT.lead 800 (`M-18`): the rewrite
         is the dataplane acting with no hop before it inside the step, so the lit box stands alone
         for one beat, and the ball lands on podX at 1676 against a duration of 3300.
         The rewrite happens INSIDE the dataplane in both directions, which is what the ball has to
         show: the DNAT-ed packet EMERGES from the box carrying the Pod IP, and on the reply the
         ball hides at its right edge and re-emerges at the left carrying the restored ClusterIP
         source.
         `balance` obeys `P-03`, and the step comment says it in as many words: the dataplane lights
         on the client packet arriving and ONLY THEN picks the second backend. `chips` keeps the end
         state, `rewind` carries what `reply` left (the first flow, still on 10.244.2.7), and one
         `F.set` writes all three on the `send` arrival at 1570ms, where one `F.light` lights them
         with the dataplane. 1570 and not the 2560 of the delivery: the pick, the second conntrack
         entry and the backend named by it are one decision, taken in the dataplane the moment the
         packet reaches it, and the second leg rides out carrying the address that decision
         produced. Hanging the backend chip on the delivery splits one decision across two beats for
         no gain. Lit at entry instead, the three chips glow over the FIRST flow's values for
         1570ms.
         `reply` and `balance-reply` turn the conntrack chip over the same way: `rewind` holds
         `flow pinned` or `two flows`, and `reverse NAT` is written and lit at 1646, when the reply
         reaches the dataplane that reverses it, never at entry while it is still inside the Pod.
WIRE LABELS
         Every address tag fades in with its ball (`emergeMode` with no `emerge` offset, hold 0,
         170ms out) and stands where no block is when the ball leaves, so no box or Pod face and no
         string crosses one at 1100x800 or 1600x1000. `TAG_OUT` rides dy -54 and `TAG_BACK` dy 62,
         parking the ink 4 above the client Pod top and 4 below its bottom, outside the lane pair.
         The fan tags ride right of both buses: `TAG_FAN` (dx 92, dy -51) lands 4 above the podX
         top and `TAG_FAN_Y` (dx 92, dy 59) is its mirror under podY. The return pair `TAG_FAN_BACK`
         (dx 48) leaves 4 under podX (dy 59) or 4 over podY (dy -51) and ends 3 clear of the
         dataplane face. `dst 10.244.2.7:8080` inks 116.6 at 1100x800, the widest tag.
         The watch tag `Service + slices` rides dy -4 with its left end 8 right of the column face
         at 716 (dx 174), and ends 4 above the podX fan leg at its arrival. `Service +
         EndpointSlice` inks about 141 and is not used, to keep the tag short beside the lane.
CONTENT  Read against the v1.35 docs, Virtual IPs and Service Proxies unless a source is named.
         kube-proxy writes rules and forwards nothing: every mode the page lists (iptables, ipvs,
         nftables, Windows kernelspace) is one where "kube-proxy configures packet forwarding
         rules", and the userspace mode is removed in v1.26 (CHANGELOG-1.26, "no longer supported
         on either Linux or Windows").
         `virtual` scopes the interface claim to the default iptables mode, because IPVS mode binds
         every Service address to the `kube-ipvs0` dummy interface (`defaultDummyDevice` in
         `pkg/proxy/ipvs/proxier.go`). An unscoped "No network interface holds 10.96.0.20" is
         rejected for that reason. "no single host answers for it" is the page's own "Service IPs
         are not actually answered by a single host", and the desc opens on it for the same reason.
         `dnat` and `balance` name the kernel as the picker, "as the Service rules direct":
         iptables and nftables rules "select a backend Pod at random" by default, while IPVS hands
         the pick to a scheduler (rr, lc and others). "The rules pick one backend" is rejected as
         untrue of IPVS.
         `balance` keeps "with no session affinity": `.spec.sessionAffinity: ClientIP` sends one
         client to the same Pod each time, and the default is None. The aria-label says a second
         connection "may land on the other Pod", the narration's own "may": an unqualified "is
         pinned to the other Pod" is rejected because the rules "select a backend Pod at random".
         The clusterIP chip reads `10.96.0.20`, the `.spec.clusterIP` value, and the port rides the
         `dst` tag: `10.96.0.20:80` under that field name is rejected because the field holds an
         address only. "the default iptables mode" is true at the card's 1.35, where iptables is
         already kube-proxy's default mode. The page's own sentence, "In Kubernetes 1.37, this is
         iptables", names a later release and is not the source the card stands on for it.
         `send` says the rules match "the moment the packet crosses from the client Pod into the
         Node": kube-proxy jumps to KUBE-SERVICES from nat PREROUTING, the hook a Pod packet meets
         on arriving in the host namespace, as `network-netfilter-path` narrates it. "catch it as it
         leaves the client Pod, because no real host owns that address" is rejected: the rules
         match the destination, and no missing owner causes the match.
         `reverse NAT` on the conntrack chip is netfilter NAT, which on "a reply packet ... will do
         the reverse mangling" (netfilter NAT HOWTO, section 2).
         The backend sublabels carry `:8080` as the endpoint the DNAT lands on, the spelling
         `network-kube-proxy-modes` and `network-ebpf-dataplane` share. Both backends read `Pod web`
         by the catalog convention for a Pod of app web, not as two Pods with one name.
SCOPE    The CLIENT view of one round trip, plus the one fact that makes it work: WHO writes the
         rules and from WHAT. The rules are a standing result from `program` onward, and this card
         says nothing about when they are written. The write path, the floor between resyncs and the
         window in which the rules still name a backend the API server has dropped belong to
         `network-proxy-rule-resync`. Who derives the slice from the Pods belongs to
         `network-endpointslice-reconcile`, and the chain the rules are made of to
         `network-kube-proxy-modes`.
NOTE     The chip strip spans SCHEME_L..SCHEME_R with even gaps but UNEQUAL widths (270 / 310 / 225
         / 215), each sized for its own longest value: DNAT carries `-> 10.244.2.7:8080` and needs
         the widest cell. Four cells in one row cannot all reach the 350 floor a bottom strip
         normally wants. `render/chipfit.test.mjs` measures it clean, which is the test that
         matters.
         On the dnat step the backend Pods are NOT highlighted: nothing has been DNAT-ed to them at
         that stage and they light only when a flow lands on them. Only the dataplane is the actor,
         and the endpoint IPs its rules point at are named in the DNAT chip.
         api, kproxy, dp, clientBox, podXBox and podYBox are listed by KEY in `SCENE.reset` so their
         highlight is cleared every step (`NET.S-02`), and both Pod opacities are stated on EVERY
         step so a dim set by an earlier flow cannot persist.
         The FORM-B queue lists the DNAT, conntrack and backend chips on `dnat` as lit 1676ms before
         the ball lands. They are the decision the dataplane takes before the rewritten packet leaves
         it, so they stand with the lit dataplane, and the ball carries the address they name. The
         R2-ENTRY queue lists the chip changes on `send`, `balance` and `balance-reply` as uncued:
         each is the value a `rewind` held back on the step before and an `F.light` cued on the
         arrival that made it true, which two samples frozen at t=0 cannot see.
OPEN     Dashed buses cross the fan tags where the fans leave and re-enter the dataplane: both
         buses and the four attach legs (y 322 / 334 / 346 / 358, 12 apart) share one corridor
         between the column face at 716 and the buses at 756 and 786. The forward fan tags cross it
         for about 167ms on the first leg out of the box and the return fan tags for 242 to 282ms on
         the last leg in, at 1100x800 and 1600x1000, sampled at 21 points per hop wherever the tag
         is at opacity 0.3 or more. No box face or string crosses any tag, and the other five tags
         cross no lane. Holding a fan tag back until it clears the corridor makes it appear
         mid-flight, and no dx or dy clears a 10-unit text in a 12-unit gap.
```
