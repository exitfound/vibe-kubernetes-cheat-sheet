## network-ingress-routing

### layout

```
WHAT     An Ingress controller is an L7 proxy: it reads Ingress shop (a TLS entry and two Prefix
         rules), picks a rule by Host and then by the longest path, looks the Pod IP up in the chosen
         Service EndpointSlice and connects to that Pod directly. A host no rule names is answered by
         the controller itself.
LAYOUT   Four columns: the controller Service, the controller Pod under its Ingress document, the
         bus, the backend Pods. Each Service hangs OFF its Pod, above web and below api, joined by a
         relation and never by a lane, because here the Service is where the controller LOOKS and not
         a box the traffic crosses: a ball through it would read as a rewrite inside it (`NET.A-01`).
         The Ingress document is centred on the controller: RULE_CX 580 is the document centre and
         CTRL_X 464 is that centre less half of CTRL_W, so the two share one axis and the OWNS
         relation rises from the controller top into the document on it. The branches mirror about
         FLOW_Y 356 at ROW_DY 78.
PANEL    Deepest 204.97 at 1100x800, and every step reads the same bottom on each viewport: 204.97
         at 1100x800, 171.42 at 1280x860 and 142.56 at 1600x1000, because all five narrations wrap to
         the same line count: `OVERLAY_IDS=network-ingress-routing node --test
         report/overlay.test.mjs` from
         `scheme/test/`. The controller Service is the one block left of x=420 and opens at y=318,
         113 clear. The Ingress document starts at RULE_X 420.
SIZES    RULE_W 320: the longest rule row, `shop.io /api Prefix` and `-> Service api:80`, inks
         432..548.6 and 623.7..728 at 1100x800, 75 apart. Every actor block is 232 (`NET.L-01`).
LANES    The request pair REQ and BACK sits LANE_DY 12 about FLOW_Y. BACK is ridden only by the 404
         on `no-match`, and a proxied answer is not drawn. TO_WEB and TO_API share the stem from the
         controller to FAN_X 812 and both are drawn on every step (`NET.A-03`). OWNS, WEB_SEL and
         API_SEL are relations nothing rides.
MOTION   On a match step the controller pulses as the sender, the Service lights LOOKUP_MS 400 into
         that pulse, and the ball leaves at BEAT.afterPulse straight for the Pod. On `match-api` and
         `no-match` the chips the new request changes (path, then Host and TLS) turn over when the
         request lands, through rewind plus an F.set, because servedChip on the same step waits for
         its own beat (FORM-E). Each branch is 310 units, which the 700ms floor runs at 0.44 u/ms,
         so the tagged ball rides BRANCH_DUR 1500 (PACING in `render/motion.test.mjs`). The Pod IP
         tag shows from departure, TAG_DX 54 right of the ball so it clears the controller frame,
         and TAG_HOLD -750 retires it before its text reaches the Pod frame on the last run. It
         rides on the side away from the lane it turns into, below on web and above on api: placed
         above the ball on the web branch, the fading text lies along the web lane at 1600x1000.
CONTENT  The claims are read against the three cited pages, the two Kubernetes ones on the 1.35
         branch.
         The desc closes on the API status, `The Ingress API stays GA but is frozen, and the
         Kubernetes project recommends Gateway instead`, the note both cited pages open with. The
         ingress-nginx retirement is a fact about one controller project, not about the API, and the
         card does not state it.
         Proxying straight to the Pod IP is stated for THIS controller, the `nginx` class, and not for
         every controller. Ingress-NGINX: `By default the Ingress-Nginx Controller uses a list of all
         endpoints (Pod IP/port)`, with `service-upstream` as the ClusterIP opt-in, cited in
         `sources`. F5 NGINX: `nginx.org/use-cluster-ip` is `instead of the default behavior of using
         the IP and port of the pods`. So the match step denies the ClusterIP hop unhedged. `Ready`
         rests on the Ingress-NGINX source, which skips an endpoint whose `Conditions.Ready` is false
         (internal/ingress/controller/endpointslices.go). `most controllers` is rejected: no reference
         counts controllers, and the desc keeps `commonly`.
         `usually a LoadBalancer or NodePort` rests on the controller install guides: Ingress-NGINX
         reads its address off a Service of type LoadBalancer and names NodePort for bare metal, and
         F5 NGINX offers exactly those two options. The Ingress page sentence naming NodePort and
         LoadBalancer is about non-HTTP traffic and is not the source.
         `pathType` is required in networking.k8s.io/v1, which is why both rule rows print it: the tie
         on `match-api` exists only because `/` is Prefix. Longest matching path first, then Exact
         over Prefix, is an Ingress API rule, hence `the Ingress spec gives precedence`.
         `no-match` rests on the page: `If defaultBackend is not set, the handling of requests that do
         not match any of the rules will be up to the ingress controller`, and `The defaultBackend is
         conventionally a configuration option of the Ingress controller`. Hence `hands it to its own
         default backend, which answers 404`: the Ingress-NGINX default backend serves `all the
         requests that are not mapped with an Ingress` and `/ that returns 404`. `replies with a 404
         of its own` is rejected because it drops the default backend the page names. The line reads
         `No Ingress of this class names that host` and not `No rule names that host`: the page
         routes to the default backend only when `none of the hosts or paths match the HTTP request
         in the Ingress objects`, so a second Ingress naming other.io would serve it. The request is
         plain HTTP, so no certificate is chosen for a host the TLS entry does not name.
         The TLS entry names Secret shop-tls for host shop.io: `hosts in the tls section need to
         explicitly match the host in the rules section`, and hosts are `multiplexed on the same port
         according to the hostname specified through the SNI TLS extension`. TLS terminates `at the
         ingress point (traffic to the Service and its Pods is in plaintext)`.
         The rules step watches Ingresses `whose ingressClassName names its IngressClass`: the field
         references an IngressClass, and the IngressClass names the controller.
         True as written: Prefix `/` matches every path. The host rule matches the Host header.
SCOPE    How Gateway API admits a route across namespaces, parentRefs against allowedRoutes and a
         ReferenceGrant for a backendRef, is `network-gateway-api`.
         Weighted and header routing are `network-gateway-traffic-splitting`. A LoadBalancer
         targeting Pods without Node ports is `network-loadbalancer-direct-to-pods`.
NOTE     The three Ingress rows are the object drawn as a document and every step states them. A
         match step lights only the rule the controller APPLIES: on `match-api` both rules match,
         the narration says so, and only ruleB lights.
         Host, path, TLS and served by describe the request being served, so they read none until
         one arrives.
WHY NOT  The Service in the ball path, controller to Service to Pod. That draws a ClusterIP hop the
         `nginx` class controllers do not make by default, and the desc and the match narration then
         deny the motion under them.
DO NOT   Put a Pod address in a wire label (`NET.T-01`). The IP rides the ball and servedChip keeps it.
```
