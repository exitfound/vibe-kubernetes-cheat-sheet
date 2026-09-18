## network-hostnetwork-hostport

### layout

```
WHAT     The two FIELDS that take a Pod out of having its own namespace, IP and veth. One Node seen
         from the LAN side.
LAYOUT   A strict three-column grid, so nothing sits at a random x, and each block sits under or
         beside the block it belongs to: the portmap rule above the Pod it maps to, the cni0 bridge
         under the NIC that routes into it, and the hostNetwork Pod alone in a column because it
         hangs off nothing. The client is the only block above the Node frame and is dead centred on
         the NIC, so the entry hop is one clean vertical.
PANEL    Deepest at 1100x800 on `tradeoff`: `OVERLAY_IDS=network-hostnetwork-hostport node --test
         report/overlay.test.mjs` from `scheme/test/`. NODE_Y 305 clears it by 25.5 units. Two blocks
         inside the frame reach left of the panel edge, the portmap rule at x 110..370 and Pod app at
         x 135..345, and the portmap rule is the higher of them, opening at R1_Y 330, 50.5 units
         under the deepest bottom. The client at x 484..716 stands beside the panel, not under it.
LANES    The entry stops on the Node frame top face midpoint at NODE_Y and not on the NIC 25 units
         inside it, so no ball crosses a Node border (NET.A-02) and the NIC lights on that arrival.
         The NIC is the hub and exits three ways, one per direction: LEFT into the portmap rule,
         RIGHT into the hostNetwork Pod, DOWN into the bridge. The down leg lands on BR_IN_ORD rather
         than dead on COL2_CX, because the portmap route comes down onto the same bridge face: the
         two land as a mirrored pair either side of the bridge midpoint, which is what a face shared
         by two lanes should look like.
MOTION   The two reflective steps carry no motion at all: they compare, they do not move traffic.
         On the hostPort step the rewrite happens INSIDE the portmap box, so the ball re-emerges at
         its bottom edge already carrying the Pod address and only then joins the ordinary path,
         bridge then veth. The two hold their whole duration for reading instead, 3300 and 4300 for
         319 and 412 characters, which is 10.34 and 10.44 ms per character against a catalog median
         of 10.40 and a 7.69 to 10.57 decile band over the 75 motionless narrated steps.
         `hostnetwork` takes 3800 on the same arithmetic, at a span of 2407.
CONTENT  Every claim here is read against the 1.35 the catalog entry names. `SetDefaults_Pod` calls
         `defaultHostNetworkPorts` on a hostNetwork Pod, which copies each containerPort into the
         empty hostPort, so the NodePorts scheduler plugin that `Checks if a node has free ports for
         the requested Pod ports` accounts for both fields alike. Only a hostNetwork Pod declaring no
         port at all escapes it, gets scheduled and then fails to bind, which is why the cost step
         says a second Pod wanting that port cannot RUN here rather than that it cannot be
         scheduled, and why the scheduler sentence belongs to the tradeoff step.
         The portmap plugin adds more than one rule: a `CNI-HOSTPORT-DNAT` chain plus, at `snat`
         default true, `CNI-HOSTPORT-MASQ` rules for connections from localhost and for hairpin
         traffic back to the container. `only adds one DNAT rule` is rejected for that and `only
         adds a port mapping` ships, with DNAT kept as the verb on the rewrite itself.
         Those masquerade rules do not match traffic from the LAN, so the Pod does see the client
         address: `still never learns that it was` is rejected and `its socket still only ever sees
         its own address and port` ships, which is the claim the `dst 10.244.1.5:80` tag draws.
         A NodePort Service reaches a Pod on the Node address too, and the tradeoff step sends
         everything else behind a Service, so `the two sanctioned ways` is rejected in the desc and
         it asks for the two FIELDS, which a Service is not.
         `status.podIP` on a hostNetwork Pod carries the Node address rather than being empty, which
         the ipChip qualifies as `192.168.1.20 (Node)`, so the aria-label says no Pod IP OF ITS OWN
         while the step-1 narration keeps the flat `no Pod IP` that its `in the path` governs.
NOTE     Four chips span the Node 1:1 with even 20 unit gaps. They are the four things these two fields
         actually change, and each is a property of the SETUP rather than of a request, so they carry
         the ordinary-Pod truth from the start and the steps flip them.
DO NOT   Lengthen the Node frame label much further. It sits at the Node top-left (x+12, y+18), above
         and left of the portmap box at x=110, and runs under it if extended. The Node address stays
         on the eth0 block, which is where it belongs anyway.
NOT A DEFECT
         The `hostport` tag `dst 10.244.1.5:80` is reported grazing the `Portmap rule` and `Node eth0`
         bottom edges for 400ms (four samples, t 1900 to 2200) on all three viewports. That is the EM
         band and not the glyphs: the em box overlaps the edge by 0.7 to 1.5 units depending on
         viewport, while the ink box sits at y 395..404 against an edge at 394.3, so the ink is
         entirely below the line and the probe reports ZERO ink cuts on all three. Confirmed by eye on
         a 250 percent crop of the 1600x1000 frame at t=2200: there is dark ground between the border
         stroke and the tallest glyph. Moving the tag to close a graze the reader cannot see would
         spend the only clear band this hop has.
```
