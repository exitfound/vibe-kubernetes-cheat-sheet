## network-mtu-overhead

### layout

```
WHAT     What encapsulation costs in bytes, and why a cluster where ping works can still hang on a
         large response.
LAYOUT   An INSTRUMENT over a short path, which no other card in this section carries: three measure
         rows whose LENGTHS encode byte counts at one declared scale, and a four block path under
         them. The subject is a budget, and a budget drawn as chips alone is a table. `U` 0.72 is
         the whole scale and every width in the three rows is `bw()` of the number its narration
         states, so the drawing and the arithmetic cannot disagree. 0.72 is chosen because 1500
         bytes then span the content width exactly, 60..1140, which is also the chip strip span, so
         the strip centres on x=600 within the 6 units `L-13` allows.
         Row 1 is the local link, 1500 B. Row 2 is what a wrapped frame is made of, a 36 unit outer
         header then the 1450 B inner frame, and it ends exactly where row 1 does because the wrap
         is paid OUT of the link rather than added to it. Row 3 is what the step actually puts on
         the wire, one hidden bar per step, all three starting at CONTENT_L so they are read against
         each other and against the two ceilings above them.
         `pathGap` is a ceiling and not a quantity, which is why it is laid over all three rows
         rather than given a row of its own: whatever ends right of x=1068 is what the hop refuses,
         on whichever row it was drawn.
         THE THREE ROWS CARRY THE CANON `box` RADIUS 6 AND THE TWO PIECES LAID OVER THEM DO NOT.
         `pathGap` is rx 0 because a ceiling is a cut across the rows and a rounded cut reads as a
         fourth box, and the sent bars are rx 3 because 6 on an 18 unit bar is a pill. Row 2 is one
         band carved in two, so both halves take 6 and the seam is the two inner edges meeting.
PANEL    Deepest at 1100x800 on `clamp`: `OVERLAY_IDS=network-mtu-overhead node --test
         report/overlay.test.mjs` from `scheme/test/`. It reads 244.54 there, against 201.43 at
         1280x860 and 160.00 at 1600x1000, and the right edge is 396.55. LINK_Y 288 is a measured
         literal against that reading and not a derivation: all three rows open at x=60, left of the
         x=420 `L-03` guards, so the panel bottom is what pins the first band, and it clears the
         deepest reading by 43.46. Nothing else on the card reaches left of 420 above y=432.
SIZES    The four path blocks are 200 and not the 232 of `NET.L-01`, under its third overrule, the
         row the blocks are SIZED BY, and the row is the Node frame. The frame holds Pod A and the
         NIC on EQUAL margins, 18 a side, and the arithmetic is 18 + 200 + 42 + 200 + 18 = 478.
         Two 232 blocks in that frame want 464 before any gap at all, and a frame wide enough for
         18 + 232 + 42 + 232 + 18 is 542, which leaves 598 for the underlay hop, Pod B and the two
         lanes between them: the legs fall to 49 units each, against the 101 they have now, and a
         49 unit hop is a ball that has arrived before it has read as moving. The blocks OUTSIDE the
         frame take 200 as well rather than 232, because four blocks in one row at two widths read
         as two unrelated pairs.
LANES    Four lanes, a forward and a return leg each side of the underlay hop, as one `laneY` pair
         about FLOW_Y 515, and one relation that carries nothing. The two forward legs and `BACK_A`
         carry a ball. `BACK_B`, the return leg from Pod B, carries one on `small` alone, which is
         the only step where anything comes back from the far end. `HOP_X` is derived from the Node
         border and Pod B rather than typed, so the two legs cannot drift apart: 101 units each.
         EVERY LANE ENDS ON THE NODE BORDER AT x=538, not on the NIC face at 520, which is `NET.A-02`
         read straight: traffic is delivered TO A NODE and the box inside lights to say what served
         it. The NIC therefore keeps the same 18 the Pod has and the border is the handover point
         rather than a line a wire has to cross. The sibling `network-pod-to-pod-cross-node` crosses
         one deliberately and argues it in its own record. This card does not have to: its subject is
         a budget rather than which component wraps the frame.
         POD A AND THE NIC ARE JOINED BY A `P.relation` AT 0.45 AND NOTHING EVER RIDES IT. The two
         are one Node and the frame Pod A builds leaves through that interface, but the veth hop
         between them belongs to `network-pod-ip-and-veth`, so under `NET.A-04` this is recession
         and not a route: no arrowhead, no ball, no step.
MOTION   Every leg is 101 units, so every one floors to 700ms under `M-13` and the beats are the
         canon ones. `small` is the expensive step at four hops, 4800ms of motion in a 4900 floor,
         and it is the only round trip on the card. It and `blackhole` are the two steps whose Pod A
         pulse opens at 0 rather than at `BEAT.lead`, and on both the lead does not fit: `small` has
         100ms of slack and `blackhole` runs 2860ms live in a 3400 floor, so 800 more breaks `M-19`.
         ON `path` POD A DOES NOT PULSE WHEN THE ICMP LANDS. The reply is addressed to the source of
         the datagram the hop refused, and that datagram is the WRAPPED one, whose source is the
         Node. So the ball ends on the Node border and the NIC lights, and the Pod is not told. That
         is the whole reason the next step can be a blackhole: the thing that has to learn is the
         Node, and the ICMP that teaches it crosses a firewall.
         THE CEILING IS LIT ON EVERY STEP IT IS VISIBLE ON, `path`, `blackhole` and `clamp`, because
         all three read the sent bar AGAINST it: 100 over on two of them and landing exactly on it on
         the third. Lighting it on the step that introduces it alone draws the same comparison at two
         weights in three consecutive frames, which no check in the suite can see.
         `blackhole` sends two identical balls up the forward lane and nothing down the return one.
         The second is the retransmission, and the empty return lane is the half that makes it a
         blackhole rather than a refusal.
WIRE LABELS
         Three, and each names a different kind of thing. `hdr` is start-anchored at CONTENT_L on
         y=386, a BASELINE and not the ink: measured with `extents.mjs` the string inks 375.0..389.7
         at 1100x800, 374.8..389.4 at 1600x1000 and 375.2..389.3 at 1280x860, so it clears row 2's
         floor at 372 by 2.8 at worst and stands 8.3 above row 3, reading as row 2 own label and not
         as a heading for the row below it. `gap` is end-anchored at CONTENT_R above
         row 1 and names the ceiling. `lane` sits over the underlay hop and is written per step,
         because what rides those lanes is exactly what changes between the steps.
         TWO OF THE THREE ARE HELD BLANK BY `rewind` ON THE STEP THAT REVEALS WHAT THEY NAME, and
         an `F.set` at REVEAL_MS writes them once the band is there. A wire label is written in the
         static block, so on `budget` and on `path` the caption would otherwise stand over an empty
         band for the whole 500ms of the reveal, naming a row that is not drawn yet. The static
         value stays in `wires` so the reduced path and a rewind still show it.
         ROW 3 CARRIES NO CAPTION. A caption start-anchored inside the bar runs the bar border
         through the middle of its own text: on `small` the bar is 96.48 units wide against a label
         that inks 150. The `on the wire` chip states that number for every step already, so the
         row is read against the two ceilings above it and the chip is its caption.
CONTENT  EVERY NUMBER ON THE THREE ROWS IS AN IP DATAGRAM SIZE, which is the only reading that makes
         1500, 1450, 1400, 1350 and 134 comparable to each other. RFC 1191 sets that unit for the
         card: the Next-Hop MTU is "the size in octets of the largest datagram that could be
         forwarded, along the path of the original datagram, without being fragmented at this
         router", and "the size includes the IP header and IP data, and does not include any
         lower-level headers". The 14 byte inner Ethernet header a VXLAN wrap carries is therefore
         inside the 50 and never a row of its own.
         The 50 and the 20 come from the Calico MTU page and from nowhere else: "IP in IP uses a
         20-byte header, IPv4 VXLAN uses a 50-byte header", with its table giving 1500 to 1450 and
         1500 to 1480. RFC 7348 is NOT the source for the 50, because it states only that the VXLAN
         header itself is an 8-byte field.
         THE ECHO IS 134 ON THE WIRE, AND 114 IS THE ARITHMETIC THAT HAS TO STAY REJECTED. ping(8)
         gives the default payload as "56, which translates into 64 ICMP data bytes when combined
         with the 8 bytes of ICMP header data", so 64 is what ping PRINTS and the datagram around it
         is 64 plus the 20 byte IPv4 header, 84. Wrapped, 84 plus 50 is 134. 114 is 64 plus 50,
         which adds the wrap to the printed ICMP size instead of to the datagram and draws a bar 20
         bytes short of what the step sends. `small` names 56, 84 and 134 in that order so a reader
         can see which size the row measures, and the `on the wire` chip reads 134 B.
         The ICMP value and its addressee are RFC 1191 section 4: the message goes "to the source of
         the datagram". The hop refuses the 1500 byte outer datagram, so it reports 1400, its own
         link, to the Node, and not 1450 to the Pod. Those are two different messages from two
         different devices and the card draws the one a firewall can swallow.
         THE DO NOT FRAGMENT BIT IS A TUNNEL SETTING AND NOT A DEFAULT, which is why `path` says
         "where the tunnel sets the do not fragment bit" and does not state it flat. ip-link(8) on
         the VXLAN `df` option: "The values unset and set cause the bit to be always unset or always
         set, respectively. By default, the bit is not set." RFC 7348 requires no DF at all and
         expects the other outcome: "VTEPs MUST NOT fragment VXLAN packets. Intermediate routers may
         fragment encapsulated VXLAN packets due to the larger frame size. The destination VTEP MAY
         silently discard such VXLAN fragments." RFC 4459 section 3.2 makes it a choice the tunnel
         makes: "copy the DF bit from the inner packets to the encapsulating header, or always set
         the DF bit of the outer header. The latter is better". Without DF the same path still
         blackholes, by the far VTEP discarding fragments, but nothing generates the ICMP that
         `path` draws, so the card draws the branch that has a reply in it and says so in the clause.
         The RFC 1191 sentence quoted above carries the same condition on the router side: the ICMP
         is owed only when the datagram "exceeds the MTU of the next-hop network and its Don't
         Fragment bit is set".
         THE CNI PLUGIN WRITES THE MTU, IT DOES NOT CHOOSE IT, so `interface` says "from its own
         config". The number is a plugin config key: `mtu` on the CNI bridge plugin ("explicitly set
         MTU to the specified value"), and for Calico either `calicoNetwork.mtu` on the Installation
         resource or `veth_mtu` in the `calico-config` ConfigMap. The same page carries the reason
         the sentence says "when it creates the interface": "The updated MTU used by Calico only
         applies to new workloads."
         MSS 1310 IS FOUR SUBTRACTIONS AND THE CARD STATES ONLY THE LAST, so the chain belongs
         here: the hop carries 1400 on the wire, less the 50 byte outer header is 1350 of inner
         frame, less 20 for the IPv4 header and 20 for the TCP header is an MSS of 1310. The ORDER
         is RFC 6691 section 4, "the MSS value to be sent in an MSS option should be equal to the
         effective MTU minus the fixed IP and TCP headers": the outer header comes off first to give
         the effective MTU, and the fixed IPv4 and TCP headers come off that. The clamp step also
         says it does nothing for UDP, which is RFC 4459 section 3.2: the reduction works through
         the MSS option, and "this does not work for UDP or other protocols that have no MSS".
         Without that clause "the standard fix" is a `T-19` absolute.
         TWO HEDGES ARE THE SOURCE HEDGES AND ARE NOT AVAILABLE TO BE TIGHTENED. `blackhole` is
         RFC 2923 section 2.1 in its own words, "pings and some interactive TCP connections to the
         destination host work. Bulk transfers fail with the first large packet and the connection
         eventually times out", so the step keeps "some": a bulk-carrying interactive connection is
         the counter-case the RFC is hedging against. `small` closes on "still answers its health
         checks" and not on every health check, because a probe whose response is larger than the
         hop carries fails exactly like any other bulk transfer.
         `interface` CARRIES NO ABSOLUTE ABOUT THE NODE. It ends on "the NIC number an operator
         reads does not show it" rather than on nothing looking wrong, because the Calico page
         points an operator at the tunnel device, where the lowered number IS visible: "To view the
         current tunnel size, use the following command: ip link show".
SCOPE    The COST IN BYTES and the failure mode. The CHOICE between an overlay plugin and a routed
         one, the VXLAN wrap itself and the remote decapsulation belong to
         `network-pod-to-pod-cross-node`, which names the MTU overhead as a price and does not
         explain it: the wrap is named here in one word and no dataplane box is drawn, which is also
         why the ball leaves the NIC rather than an encapsulation device. The flat address promise
         belongs to `network-model`. What a veth pair is and where the address lives belong to
         `network-pod-ip-and-veth`, and eth0 appears here only as the interface that carries the MTU
         value. Who runs the plugins belongs to `network-cni-invocation`, named in one line on the
         `interface` step and never drawn as a chain. The hook order and the conntrack entry belong
         to `network-netfilter-path` and `network-conntrack-nat`, and neither is opened.
NOTE     1400 IS A SCENARIO PARAMETER AND NOT A DEFAULT. Unlike 1500, 1450, 1480, 50 and 20 it is
         not a constant anything publishes: it is the property of the one drawn hop in this story, a
         VPN leg, and every string that names it attaches it to that hop, the `clamp` narration
         included ("the 1400 on that hop"). It is not invented either, which is why it is the number
         chosen: the Calico page the card already cites carries a real underlay of exactly this
         size, "When using AKS, the underlying network has an MTU of 1400, even though the network
         interface will have an MTU of 1500." It is also what makes the gap legible, 1500 less 1400
         is 100 bytes, which at U 0.72 is 72 units of overhang: wide enough to read as a deliberate
         overrun at all three viewports and narrow enough that the sent bar still reads as nearly
         filling the link.
         THE IPIP ALTERNATIVE IS STATED AND NOT DRAWN. 20 bytes is 14.4 units at this scale, too
         narrow to carry a caption and too narrow to read as a quantity beside a 36 unit header,
         and a second header segment would say the card draws two encapsulations when it draws
         one. The closing clause of `budget` is its whole home, and the Calico table the CONTENT
         block cites is where 1480 comes from.
         THE CEILING READS TWO NUMBERS BECAUSE THE ROWS HAVE TWO ORIGINS. Rows 1 and 3 are measured
         from CONTENT_L on the wire, so x=1068 is 1400 bytes on them. Row 2 starts its inner frame
         at HDR_R 96, so the same vertical reads 1350 there, which is 1400 less the 50 byte header
         and exactly the inner allowance the clamp step computes from. The line is one line and it
         is correct on every row it crosses.
DO NOT   TIDY THE ECHO BAR TO 96. Two marks come straight out of `bw()` and both are exact products
         rather than roundings: the 134 byte echo is 96.48 units and the 1400 byte ceiling sits at
         x=1068.0, which happens to be integral. The echo bar is the only fractional width on the
         card, 96.48 and not 96, because `bw()` is applied rather than a typed number. The scale is
         what makes the row readable against the two above it, and a typed width is the one way it
         can drift.
NOT A DEFECT
         `report/chip-beat.test.mjs` lists six rows for this card, one FORM-E on `path` and five
         FORM-B on `small`, `blackhole` and `clamp`. Every one of them is a SIZE or an absence, and
         a size is settled where the frame is built rather than where it arrives: the arrivals on
         this card earn the underlay hop lighting, the two Pod pulses and, on `path` alone, the ICMP
         reply and the Node estimate it moves. `blackhole` draws no arrival at all, which is the
         whole point of it, so two of its values have nothing they could wait for, and `not
         needed` on `clamp` is what the clamp MEANS rather than something arriving makes true.
         All six are
         filed in `test/fixtures/carried.mjs` with the measurement behind each, and that file is the
         ruling: this block is only the pointer to it.
```
