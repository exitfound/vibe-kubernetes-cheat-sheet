## network-client-ip-preservation

### layout

```
WHAT     Where the client address goes when a proxy ends the connection and starts its own, and the
         two places the original can still be carried, an HTTP header or a PROXY protocol preamble.
LAYOUT   TWO PACKETS COMPARED ACROSS THE PROXY, which is the one composition that says this subject:
         the address sits in a DIFFERENT PLACE in the packet per mode, and a flat chip strip cannot
         draw an inside. Each connection gets a frame of three rows carrying the SAME names, `src`,
         `X-Forwarded-For` and `PROXY preamble`, so a difference between the two sides reads as a
         difference and not as two unrelated readouts. The edge is the APEX over both of them, and
         each actor centres on its own frame, so each side is one column. Each side block leaves its
         OWN TOP face, rises 42 to the leg row, and turns 90 degrees into a SIDE face of the edge:
         the two connections are drawn as two, which is what the `terminate` step says in words.
         Every other card that draws an address puts `src` in the bottom strip
         (`network-netfilter-path`, `network-packet-classification`,
         `network-pod-to-pod-same-node`). `kin.mjs --id` cannot see this lever, because it counts
         part kinds and a chip inside a frame is still a chip, so the lever is argued here the way
         `network-external-traffic-policy` argues its per-Pod share.
         The left frame reads `none` on most rows. That emptiness is the CONTROL the right side is
         read against rather than a dead row: on `forge` it carries the forged claim, and on
         `passthrough` its blank preamble row is what says the EDGE added one.
PANEL    Deepest at 1100x800 on `xff`, 219.69: `OVERLAY_IDS=network-client-ip-preservation node
         --test report/overlay.test.mjs` from `scheme/test/`. It reads 142.56 flat at 1600x1000,
         171.42 flat at 1280x860 and 194.85..219.69 at 1100x800, right edge 290.77 / 377.76 / 396.55.
         The narrowest viewport sits 14.72 deeper than three `sources` links would leave it, because
         a fourth wraps the footer there. The citation is worth the room: `forge` rests on MDN alone.
         The content left of x 420 is the Client, whose top at 286 clears the deepest reading by
         66.31, and the left packet frame at 444. The leg row at 244 is the lowest thing the panel
         constrains: the row clears the floor by 24.31 and its ENTRY tag, riding 14 under the row
         and inking from 248, by 28.31.
         Every narration runs 255 to 270 characters and the swing across the viewport set is 77.13
         units.
SIZES    The Client, the proxy and Pod web are NET.L-01 232 wide, the two Pods 124 tall.
         A packet row is 290 wide, floored by the widest pair it ever writes, `X-Forwarded-For`
         against the appended list `192.0.2.1, 198.51.100.9`. At 1600x1000, where the mono face inks
         widest, the name inks 103.4 and `198.51.100.9` 82.7 with 79.9 between them. The list value
         is written only by real play, so `render/chipfit.test.mjs` is what holds its fit.
         FRAME_W 318 is that row plus 14 of padding a side, and the two frames close on the content
         edges 60 and 1140, so the 106 gap to the edge is derived and never chosen: the frames reach
         378 and 822, the edge stands 484..716.
LANES    Ridden: `ENTRY` on `arrive` and `forge`, `DELIVER` on `terminate`, `xff`, `forge` and
         `passthrough`. One points array feeds each wire and its ball, and both arrowheads carry a
         ball on some step, so nothing is carried on `A-05`.
         Both legs are an L of 307 units, a 42 rise off a side block TOP face and a 265 run into a
         SIDE face of the edge, mirrored about the centre. The leg row IS the midpoint of both side
         faces, which L-11 requires of a lone endpoint, so EDGE_Y derives from LANE_Y and is not
         chosen. The length is unique in the catalog. EVERY leg rides TAG_DUR 1200 rather than the
         700ms PKT_DUR_MIN its length clamps to, so all six balls run 0.256 u/ms, just under the
         catalog median `pace.mjs` prints: inside 700 a tag cannot fade in clear of the block it
         leaves, stand long enough to be read, and retire before the arrival ripple. No leg is an
         exception, which is what keeps the two balls of `forge` from crossing the same 307 units at
         different speeds.
         No lane is dimmed on any step and no step carries an `opacity` field: every block on the
         card exists on every step.
MOTION   `arrive` and `forge` send UP into the edge, where the client sends and the proxy pulses on
         arrival. `terminate`, `xff` and `passthrough` send DOWN out of it, where the proxy is the
         sender, so it pulses first and the ball leaves at BEAT.afterPulse (`M-18a`).
         Every readout stating what the BACKEND receives obeys `P-03`: `chips` keeps the end state
         the static path shows, `rewind` winds it back to what the previous step left, and one
         `F.set` turns it over on the arrival. `terminate` moves `src`, `app reads` and `client IP`
         on ONE beat, because they are one reading of one packet (`P-04`), and `passthrough` moves
         the preamble row, `app reads` and `client IP` on its own single beat for the same reason.
         `arrive` binds `client IP` alone to its arrival, because that chip states what the EDGE has
         observed. `src` on the left packet stays at entry beside it: the address the client put on
         its own packet is true before the packet moves, and winding it back would draw a request
         leaving with no source.
         `forge` is the only two-hop step, on beats 0 / 1200 / 2000 / 3200: the forged claim lands at
         1200 and writes the left row, the proxy pulses, and the appended list leaves at
         BEAT.afterPulse past that arrival and lands at 3200. Span 4100 against duration 4400.
         Paces run 10.94 to 16.48 ms per character, and no step sits in the hurried end of the
         ranking `timing.mjs` prints. Still time runs 300 to 700ms, the low end of the catalog,
         which is the price of six legs each riding 1200.
WIRE LABELS
         One riding tag per ridden leg, and each is visible for the WHOLE flight: the fade-in opens
         150 before its ball leaves and hold -180 closes the fade-out on the arrival, so no string
         appears mid-leg. Full opacity runs 870ms on ENTRY and 1020ms on DELIVER, which is what the
         1200 leg buys: the string is readable for the whole crossing rather than a glimpse of it.
         Each rides on the side AWAY FROM THE EDGE, because a tag centred on a face prints over the
         app box inside it. ENTRY trails dx -95 at dy 14, which clears EDGE_X 484 by 20 on arrival
         and also keeps the tag off the rise, where a centred one lets the vertical segment at x 219
         run through the string for 250ms.
         DELIVER leads dx 110 at dy -14: its widest inks 738.6..913.4, clearing EDGE_R 716 by 22.6
         at departure and standing 53 above Pod web at the drop.
         The `forge` DELIVER leg carries the list and no header name, `192.0.2.1, 198.51.100.9`. It
         inks 138.7 and stands 40.7 clear of EDGE_R 716 at departure, 57.3 above the `Pod web` label
         and 186.2 above the right caption. The header name belongs to the row it lands in and not
         to this tag (DO NOT), and the full spelling measures about 235, which overruns the canvas
         at the far end of the leg. It is the one step carrying a list, so a silent ball there reads
         as a leg that delivers nothing.
CONTENT  Read against the MDN X-Forwarded-For reference, RFC 7239, the PROXY protocol specification
         and the Using Source IP tutorial, all four cited in `sources`. MDN earns its citation
         because `forge` rests on it alone: RFC 7239 governs `Forwarded` and not `X-Forwarded-For`,
         and its list runs the other way, the first element added by the FIRST proxy with the last
         proxy absent from the `for=` parameters altogether.
         `An edge that keeps what arrived appends what it saw` is conditioned deliberately. MDN
         gives the list semantics, `the rightmost IP address is the IP address of the most recent
         proxy and the leftmost IP address is the address of the originating client`, and RFC 7239
         allows a proxy to `append it to the last existing Forwarded header field after a comma
         separator`, but neither makes appending universal: an edge at a trust boundary is commonly
         configured to REPLACE the header instead, which is why the sentence names the edge that
         keeps what arrived and not every proxy. Saying flatly that the edge OVERWRITES is rejected
         the other way, because a header every hop overwrote could never become the list the same
         sentence goes on to describe.
         `the RFC 7239 Forwarded header carries the same address as for=198.51.100.9` takes the
         unquoted form the RFC allows, `value = token / quoted-string`, and the RFC example
         `Forwarded: for=192.0.2.43, for=198.51.100.17` is the same comma-separated list the forge
         step draws. Quoting is required only where a colon appears, an IPv6 address or a node port.
         `the forged value first, your own edge last` and `Trust that list from its last entry
         inwards` are MDN, `The X-Forwarded-For IP list is searched from the rightmost by that count
         minus one`. They say FIRST and LAST rather than left and right because the two frame
         captions already spend left and right on the two connections.
         MDN carries one condition the card does not print: `If the server can be directly connected
         to from the internet, even if it is also behind a trusted reverse proxy, no part of the
         X-Forwarded-For IP list can be considered trustworthy`. The card draws the backend reachable
         only through the edge, so the picture meets the condition and printing it would restate
         what the diagram already says.
         The forged value is `192.0.2.1`, RFC 5737 TEST-NET-1, which no other card uses. Addresses
         in 1.2.3.0/24 are really allocated, so a forged example taken from there names a live host.
         `prepends a short preamble to the first bytes of the stream` and `the backend must be
         configured to expect it` are the PROXY protocol, `prepended before any data flowing from
         the sender to the receiver` and `The receiver MUST be configured to only receive the
         protocol described in this specification and MUST not try to guess whether the protocol
         header is present or not`. `TCP4 198.51.100.9` is the head of the version 1 line
         `PROXY TCP4 198.51.100.9 203.0.113.7 56324 443`, cut to the field this card is about. The
         narration says the original source ADDRESS rather than source and destination, because the
         row shows only the source and the full line does not fit the 290 the row is floored at.
         `they arrive unchanged only because nothing on the way rewrote them` rests on the tutorial
         statement that packets to a Service of Type=NodePort are source NATed by default. It is
         stated as the condition rather than drawn, and the SCOPE block hands the drawing of it to
         the sibling that owns the policy.
SCOPE    The layer 4 answer is `network-external-traffic-policy`: externalTrafficPolicy Local keeps
         the source on the packet itself, with no header and no preamble, and this card does not
         name it. The SNAT on the way in belongs there and to `network-nodeport-loadbalancer`, and
         `network-pod-egress-snat` owns the egress direction. What an Ingress or a Gateway proxy
         routes ON is `network-ingress-routing` and `network-gateway-api`.
NOTE     The card assumes the edge SEES the client address, and `arrive` says so in words rather
         than drawing it: where the path to the edge SNATs, X-Forwarded-For carries the wrong value
         and everything below it is wrong. Drawing that premise needs a Node row and a policy field,
         which is the sibling card.
DO NOT   Give the left frame fewer rows than the right. The two frames are a comparison, and a
         difference in SHAPE reads as importance rather than as difference.
         Put a header name in a riding tag as well as in the row it lands in. That takes the `forge`
         tag to 229 units wide and drives it into the caption.
NOT A DEFECT
         The ENTRY tag lies over the Client top strip as it opens, 69 units of the string inside the
         block at 1600x1000 while it is still fading in: it inks 75.8..172.2 against a Client of
         103..335. The ball leaves that top face, so nothing attached to it can start clear, and the
         tag sits 8.1 above the `Client` label rather than on it. Buying the clearance costs either
         a dx that reads as a caption running beside the ball or a tag that appears mid-leg, and the
         second is the defect this timing exists to remove.
         A seek frame past a tag fade-out still draws the tag, because a seek does not apply the
         fill of an animation it has already run through. `motion.mjs` on a real play has every tag
         gone by its arrival. Read a tag from a fraction INSIDE its window, 0.29 on `arrive`.
         A frozen frame shows no `F.set` write, so every `-0`, `-50` and `-95` frame reads the
         rewound rows (`M-35`). Real play writes each on its arrival: `tools/settled-dump.mjs` reads
         `192.0.2.1` and `192.0.2.1, 198.51.100.9` on `forge`, and `TCP4 198.51.100.9` on
         `passthrough`.
         `X-Forwarded-For` returns to `none` on both sides on `passthrough` and takes no highlight.
         A raw stream HAS no HTTP header, so the row empties because the mode has none, which is a
         property of the mode rather than an event of the step.
         `edge mode` states `TCP passthrough` at entry while its two neighbours wait for a beat:
         carried on FORM-E in `test/fixtures/carried.mjs`, because the mode is the configuration the
         step opens with and the reason there is a preamble to send at all. `src` on the left packet
         does the same on `arrive` beside `client IP`, and is carried for the same shape of reason.
         The two packet frames carry a `key` no step addresses. `statics.mjs` reports both as
         UNREAD-KEY and that reading is a heuristic: `unit/spec-scene.test.mjs` requires a
         text-bearing part to declare text or carry a key, so deleting them turns the gate red.
```
