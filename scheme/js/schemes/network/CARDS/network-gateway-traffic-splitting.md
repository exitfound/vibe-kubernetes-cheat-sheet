## network-gateway-traffic-splitting

### layout

```
WHAT     A weighted HTTPRoute rule gives each backend its weight divided by the sum of the weights,
         whatever its Pod count, a header rule can take test traffic first, and an unresolved
         backend keeps its share as HTTP 500 rather than handing it to the other one.
LAYOUT   Instrument inside a branch. One wide Gateway block, 314..1030 by
         296..436, holds the two rules as rows: the header rule as one full web-v2 track, the
         default rule as a proportion bar whose web-v1 share is ONE rect laid over a web-v2 track.
         The request enters the top face on the spine SPINE_X 672 and leaves by the LEFT end face
         for web-v1 or the RIGHT end face for web-v2, so the split is decided inside the box
         (NET.A-01). The two Service frames hang below the end faces, 40..484 with three Pods and
         1004..1160 with one, both 464..616. Each is a dashed `P.node` frame with its label top
         left, and its Pods are seated the way `network-external-traffic-policy` seats them in
         Node-1: 34 under the frame top, 14 of padding, a 16 gap. The chip column stands in the
         gap between the frames. Every section sibling draws a fan down to Nodes, a fork onto
         stacked frames, a stacked object tier or a flow row: `kin.mjs --id` prints podrow, raw
         and group as levers no sibling carries.
         The bar is the subject rather than decoration: the ratio is a moving boundary, which a
         chip can only state as a number. The unequal frames are the other half of the argument:
         a tenth to one Pod against three.
PANEL    Deepest at 1100x800 on `weights`, the longest narration on the card:
         `OVERLAY_IDS=network-gateway-traffic-splitting node --test report/overlay.test.mjs` from
         `scheme/test/`. The bottom reads 180.12..279.51 at 1100x800, 150.17..235.17 at 1280x860
         and 125.11..194.89 at 1600x1000, and the right edge 396.55, 377.76 and 290.77. The Gateway
         and the web-v1 frame are the blocks left of x=420. The Gateway opens at y 296, 16.49 below
         the deepest reading, so a clause added to `one-backend` has almost no room left. The Client
         stands at 556..788, beside the panel.
SIZES    Pods are 128 by 104, the `network-external-traffic-policy` Pod, so three fit a frame at a 16
         gap and 14 padding: 3 x 128 + 2 x 16 + 2 x 14 = 444. `Pod web-v1-a` inks 79.2 at 1600x1000,
         24.4 clear inside each side. The frame label `Service web-v1` inks 52..156.2 on y
         470.8..485.4 at 1600x1000, 12.6 above the Pod tops at 498. The bar is 470 wide, 540..1010,
         right of a 226 caption column: `header rule · traffic: test` inks 334..499.6 at 1100x800,
         40.4 short of the bar, and 334..520.1 at 1600x1000, 19.9 short. A 210 column is rejected:
         it leaves the widest reading 3.9 short, which reads as the caption touching the bar. The
         chip column is 360 wide for `GET shop.io/ · traffic: test`, 564..924 inside the 520 gap
         between the frames.
         The Client is 232 by 80, the NET.L-01 width with no departure: `https · shop.io` is its
         widest string and inks 90.4 at 1600x1000 and 92 at 1100x800, so 70 stands clear each side,
         and the label pair centres on y 80 inside the 40..120 box.
LANES    Four lanes, every one ridden on some step. The Client bottom face and the Gateway top face
         carry a mirrored pair at laneY(672, 12) (L-12): 660 down for requests, ridden on all five
         steps, and 684 up for the answer, ridden on `invalid` alone. TO_V1 leaves the Gateway left
         face at GW_CY 366, turns down at V1_CX 262 and ends on the web-v1 frame top face. TO_V2
         mirrors it at V2_CX 1082. A leg ends on the Service FRAME and a Pod inside pulses, the
         NET.A-02 grammar with a Service frame in place of a Node frame: the backendRef names the
         Service and the Gateway forwards to a Pod behind it, so no ball ever passes through a
         Service box. The frame takes no arrival cue (`scheme/CLAUDE.md`, "A `node()` frame takes no
         cue"), so the Pod pulse is the arrival, as on the Node frames of the section. Every lane
         stands at full opacity on every step, and only the Service group is shaded out of the one
         `stage()` factory (A-16): web-v2 at 0.4 while no rule names it
         (`idle`, `one-backend`) and while it does not resolve (`invalid`), web-v1 at 0.4 on
         `cutover`, where its weight is 0 and its Pods still run. A leg shaded to its dim Service
         reads as a missing path rather than as a state, so the group and the bar labels say it.
MOTION   Three things move the bar: `enter` pins the web-v1 rect width on BOTH paths on every step,
         because no step field writes an inline width, and the `weights` and `cutover` flows slide
         it with WAAPI width keyframes over 900ms, fill both, the `cluster-cpu-throttling`
         precedent. Measured with a probe driving `__schemeCtl.gotoStep` forward, backward and
         shuffled, plus reset and a real play of each step: every reading is 470, 470, 470, 423,
         423, 0 by step, and 450 into each slide 446.5 on `weights` and 211.5 on `cutover`. On
         `weights` the slide starts at 600 so it ends at 1500, the arrival of the first request, and
         the three chips and both bar labels turn over on that same arrival (rewind plus F.set).
         On `cutover` web-v2 fades back in over 600 first, then the bar slides from 700 while
         web-v1 dims over the same 900, the weights chip and both bar labels turn over and the chip
         lights as the bar stops at 1600, and the request leaves at 1700: the return from the
         `invalid` counterfactual is seen before the weight change. On `header-canary` the header
         row and the web-v2 Service fade in together over 600. The two TAGGED balls, the request on
         `header-canary` and the answer on `invalid`, ride LEG_DUR 1125 over their 176 units
         (PACING in `render/motion.test.mjs`): at the 700 floor the tag clears the face it leaves
         and is gone before it can be read. The untagged balls on the same lanes keep routeDur.
         Each tag is readable from the moment its ball leaves, and stands on the side of the ball
         AWAY from the face it heads for: `traffic: test` 62 left of and 14 UNDER its ball, so it
         clears the Client bottom at departure, `HTTP 500` 50 right of and 14 OVER its ball, so it
         clears the Gateway top. Hold -400 retires each one 400 before arrival, 62.6 units short of
         the face it is heading for, so neither string is ever drawn over a block or struck by its
         own lane.
WIRE LABELS
         `r1Label`, `w1Label` and `w2Label` sit 6 above their bars and carry the weights per step,
         `web-v1 · 1` and `web-v2 · not listed` before web-v2 is named. `r1Label` reads
         `not created yet` on `idle` and `one-backend` (C-14), inking 918..1010 at 1100x800 and
         906.6..1010 at 1600x1000, clear of the 520.1 its row caption reaches. On `invalid`
         `web-v2 · 10 · HTTP 500` inks 875..1010 against `web-v1 · 90` at 540..607.5. `ifLabel` is
         the T-35 caption, written on `invalid` only. It stands in the 28 unit gap over the web-v2
         frame it is about, right-anchored 12 short of V2_CX so the leg dropping on 1082 never
         strikes it: it inks 867.5..1070 at 1100x800 and 842.6..1070 at 1600x1000, on y 442.8..457.7,
         6.8 under the Gateway bottom and 6.3 over the frame top. The top band over the Gateway is
         rejected: at 203 to 227 units wide the caption only fits where nothing else stands, and
         there it reads as a note about the whole card rather than about the web-v2 branch.
CONTENT  Read against Gateway API v1.6.2, the release tag, in the gateway-api repository raw:
         `apis/v1/shared_types.go` for weight (weight/(sum of all weights in this BackendRefs list),
         an epsilon from that proportion allowed by implementation precision, not a percentage, the
         sum need not be 100, default 1, 0 forwards nothing, a lone backend above 0 takes 100%), and
         `apis/v1/httproute_types.go` for the rest (Support for weight: Core, match precedence, the
         invalid-backend rules). The guide `guides/user-guides/traffic-splitting.md` and
         `examples/standard/traffic-splitting/*.yaml` are the canary, the 90 and 10 split, and the
         0 and 1 cutover the card draws. The `HTTPBackendRef` source is the 1.6 spec page, because
         neither the guide nor the HTTPRoute page carries the 500 rule or the epsilon.
         `one-backend` says a lone backend takes every request only with a weight above 0. The
         guide wording, 100% no matter what weight is specified, is rejected because the type
         comment says a weight of 0 forwards no traffic for that entry.
         `one-backend` says the Gateway sends each request to a Pod behind the Service, by the
         Service IP or an endpoint, as its implementation chooses. `forwards each one to a Pod` is
         rejected because it reads as the Gateway picking the Pod itself, and kubernetes.io
         gateway.md (release-1.35) says an implementation may represent a Service backend as a
         Service IP or the backing EndpointSlices of the Service. The ball ends on the Service
         frame and a Pod pulses for the same reason.
         `header-canary` says the header rule wins because both rules match the default path prefix
         / and neither names a method: the precedence list is exact path, longest prefix, method,
         then the largest number of header matches, so headers decide only after those tie. A
         match with no path defaults to PathPrefix /, which is why the header rule ties on path.
         `weights` says `about a tenth of the requests this rule matches`. `gets a tenth` is
         rejected because the type comment allows an epsilon from the exact proportion, and
         because tagged requests still reach web-v2 through the header rule. The sentence also
         says one request is drawn down each leg but the split is far from even, because the flow
         draws one ball per backend against a 90 and 10 weighting.
         `invalid` keeps two rules apart. The share of an invalid backendRef MUST receive HTTP 500
         and is not redistributed, and a rule whose only backendRef is invalid, with no filters,
         sends all its traffic to 500, which covers the header rule. The narration keeps both
         conditions for the header rule, `lists web-v2 alone and has no filters`: `as must every
         request of the header rule` is rejected as an absolute, because the 500 rule applies only
         `If *all* entries in BackendRefs are invalid, and there are also no filters specified in
         this route rule`. Requests to a Service with no
         ready endpoints SHOULD get 503. The narration states only the 500 rules, the `aria-label`
         states both as separate sentences, with the 503 one about the requests and not the
         Service. On `invalid` the web-v2 share of both bars stays bright while the web-v2 group is
         dim: the bars draw what the route still configures, and the labels carry HTTP 500 as
         what that share gets.
         `cutover` dims web-v1 while its narration says the Pods still run: the dim is a weight of
         0, serving nothing, and the guide says the weights can shift traffic back to foo-v1.
         `cutover` opens `Back in the real rollout, where web-v2 resolves`. `web-v2 resolves again`
         is rejected because `invalid` is a counterfactual, so in the rollout web-v2 never stopped
         resolving. It names both weights, `0 for web-v1 and 1 for web-v2`, the guide example:
         `Setting the web-v1 weight to 0` is rejected because the drawn web-v2 weight also moves,
         10 to 1, and a single named edit leaves that change unexplained.
         The `:8080` on both app boxes is the example port: `examples/standard/traffic-splitting`
         gives every backendRef `port: 8080`, and the card draws no Service port of its own.
         The request chip names the METHOD, `GET shop.io/`, where `network-ingress-routing` and
         `network-gateway-api` write `HTTPS shop.io/` on their wires. It is not drift to harmonise:
         `header-canary` turns on `neither names a method`, so the method has to be on screen. The
         Client sublabel `https · shop.io` carries the transport the other two cards name.
         `traffic: test` is the guide header `traffic=test` in HTTP syntax, the form a request
         carries it in.
         `k8sVersion` 1.35 dates the kubernetes.io page. Gateway API is an add-on of CRDs there,
         and no string on the card says it ships in core.
SCOPE    GatewayClass, the Gateway listener, parentRefs, allowedRoutes and ReferenceGrant are
         `network-gateway-api`, drawn here only as the one block the route programs. Host and path
         matching and longest-path are `network-ingress-routing`. What the backend sees as the
         client address is `network-client-ip-preservation`.
NOTE     `one-backend` lights the weights chip although its value does not move from `idle`: the
         step is where the narration introduces the weight, `An unset weight defaults to 1`, and
         the chip is what that sentence points at. No other step cues a chip it did not change.
         90 and 10 against three Pods and one is deliberate: weights equal to the Pod ratio would
         draw a split a plain Service selector gives too, which argues the opposite of the sentence.
         The header rule row is at 0.55 on `idle` and `one-backend`, where it does not exist yet, and
         its label says so (C-14). At that shade its web-v2 track paints rgb(38, 110, 125), 34 from
         the web-v1 fill and 96 from the live web-v2 rgb(59, 173, 195) at 1100x800, so on those two
         steps the label and not the colour tells the row apart from a web-v1 share.
DO NOT   Give the web-v1 bar fill an alpha. It lies over the bright web-v2 track, and at 0.28 the
         track glows through until the whole bar reads as web-v2 on every step: rgb(31, 88, 100) is
         that 0.28 cyan mixed onto the canvas.
         Draw a Service frame as a `P.box`. The box fill rgba(14, 38, 46, 0.72) under the Pods
         paints each Pod interior rgb(18, 39, 46) at 1600x1000, lighter and greener than the
         rgb(14, 26, 32) a Pod paints on every other card.
NOT A DEFECT
         A seek frame of `weights` or `cutover` past its turnover shows the rewound chips and bar
         labels, because an F.set rides an onfinish and a paused animation never fires one (M-35).
         `tools/settled-dump.mjs` reads the F.set values on a real play.
         `cutover` is the slowest read on the card, 17.65 ms per character (`timing.mjs` ranks it
         against the catalog): its motion is three beats, the return of web-v2,
         the slide and the request, against the shortest narration on the card, and it stands still
         for 400ms after a 4100 span.
OPEN     CENTRE: the chip column spans 564..924 on centre 744, carried in
         `test/fixtures/carried.mjs`. It stands in the gap between two frames of unequal width while
         the drawn extent 40..1160 is centred on 600. Moving it to 600 puts it over the web-v1 frame,
         and equal frames would remove the 3 against 1 the split is argued against.
```
