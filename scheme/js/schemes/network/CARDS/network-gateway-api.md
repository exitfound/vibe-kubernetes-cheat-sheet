## network-gateway-api

### layout

```
WHAT     A shared Gateway serves a route only when every owner along the chain agrees: the
         implementation takes the GatewayClass, the listener admits the route namespace through
         allowedRoutes, and a backendRef into a third namespace needs a ReferenceGrant there. A route
         that is Accepted without that grant is live, and the requests matching it get HTTP 500.
LAYOUT   Ladder and chip column, over a data rail, on one grid. The ladder stands on the right edge,
         LAD_X 928..1160, in reference order: GatewayClass, Gateway, HTTPRoute, Service, rungs 80 tall
         at a 24 gap from `ladder()`. Every seam carries the name of the field that joins it on the
         right of the spine. Every condition chip stands on the row of the object that reports it, so
         the column left of the ladder reads as one table of state: GatewayClass Accepted on the class
         row, allowedRoutes on the Gateway row, and the two HTTPRoute conditions stacked inside the
         route row. The ReferenceGrant stands on the Service row, centred under the chip column at
         546..778, so it reads as the answer to the ResolvedRefs chip above it. Configuration is the
         upper band and carries no ball. The rail runs 48 under the Service row, Client, proxy Pod and
         Pod web at two equal 212 gaps, the proxy centred on 600, and Pod web hangs straight under the
         Service it backs. The namespaces are sublabels rather than
         `node()` frames: three dashed frames on top of the dashed relations and lanes read as one
         texture, and a lane crossing an empty middle frame says nothing.
PANEL    Deepest 329.20 at 1100x800, on `platform`. Per viewport the bottom reads 180.12..329.20 at
         1100x800, 171.42..256.42 at 1280x860 and 142.56..212.33 at 1600x1000, and the right edge
         396.55, 377.76 and 290.77: `OVERLAY_IDS=network-gateway-api node --test
         report/overlay.test.mjs` from `scheme/test/`. CHIP_X 424 is the `L-03` line with 27 to spare
         against the widest reading, so moving the chip column left moves it into the panel column.
         The Client is the one block left of x=420
         and opens at y=492, 162 clear.
         The four sources hold the dialog footer on one row at 1100x800. Six wrap it to two rows,
         which shrinks the diagram and takes the deepest panel reading to 343.93.
SIZES    Every box is 232 by 80 (`NET.L-01`), the two Pods 232 by 104 with a 192 by 44 app box. The
         chip column is CHIP_W 476, from the `L-03` line to 28 short of the ladder: at 1100x800 the
         tightest name to value gap is 128 on `HTTPRoute Accepted` against
         `False · NotAllowedByListeners` (`render/chipfit.test.mjs`).
LANES    REQ, ANSWER and TO_POD are the lanes, and each is ridden. REQ and ANSWER are the laneY(532, 12)
         pair on the Client right face and the proxy left face, 212 long: ANSWER is ridden on `refused`
         alone, carrying HTTP 500. TO_POD, also 212 long, is ridden on `request`. CLASS_REF, PARENT_REF,
         BACKEND_REF, GRANT_REF and SELECTS are relations: a reference is resolved by a controller, not
         carried. No line joins the Gateway to its proxy Pod, because the implementation runs and
         programs the proxy and a Gateway to Pod relation would draw the object doing it. Every line
         stands at full opacity on every step: an object not yet created is pending, and the grant says
         `not created yet` in its sublabel rather than through a shaded line.
MOTION   Both tagged legs ride LEG_DUR 1500 (PACING in `render/motion.test.mjs`): at the 700 floor a
         tag that has to clear the face it leaves and retire before the face it heads for is readable
         for under half a second. `HTTP 500` emerges 230 after departure and retires with hold -400,
         `to 10.244.1.5` emerges 360 in and retires with hold -530, neither inking over a block on the
         1100x800 and 1600x1000 frames. The Service lights LOOKUP_MS 400 into the proxy pulse, as the
         lookup that picks the endpoint. No ball carries a status. Every condition chip turns over
         STATUS_MS 800 after the change that causes it, through rewind plus an F.set, so the cause
         reads first. `platform` chains the class turnover at 800 and the Gateway reveal at 1200,
         `admitted` the allowedRoutes edit at 100, Accepted at 900 and ResolvedRefs at 1700.
WIRE LABELS
         The request label stands over the Client rather than on REQ, which carries a lane pair, and is
         written on `refused` and `request` and blank on every other step.
CONTENT  The claims are read against `k8sVersion` 1.35 of the Kubernetes Gateway API page and the
         `apis/v1` types of the Gateway API project.
         The add-on sentence rests on the page: `Gateway API is an add-on` and `Gateway API
         specifications are defined as custom resources`. `arrives as CRDs, usually installed with an
         implementation` is rejected: the page carries no install sentence, and `usually` is a claim
         about prevalence no source makes.
         `controllerName`: `The value of this field MUST be a domain prefixed path`, and
         `example.com/gateway-controller` is the page's own example: `a controller that has implemented
         Gateway API is configured to manage GatewayClasses with the controller name`. So the class
         names the controller, and `names it` with the implementation as antecedent is rejected as
         ambiguous.
         `allowedRoutes keeps the default, from Same`: `+kubebuilder:default={from: Same}`, and Same
         means `Only Routes in the same namespace may be used by this Gateway`.
         A listener in mode Terminate needs certificateRefs: `This field is required to have at least
         one element when the mode is set to "Terminate" (default)`.
         The status reasons are the API constants. `NotAllowedByListeners` is used `when the route has
         not been accepted by a Gateway because the Gateway has no Listener whose allowedRoutes
         criteria permit the route`. `RefNotPermitted`: a cross-namespace reference not allowed by a
         ReferenceGrant sets ResolvedRefs False with that reason and the controller must `not configure
         this backend in the underlying implementation`. GatewayClass is `scope=Cluster` and its
         condition is `Accepted`.
         `refused` rests on `httproute_types.go`: a BackendRef is invalid when `It refers a resource in
         another namespace when the reference has not been explicitly allowed by a ReferenceGrant`, and
         `If all entries in BackendRefs are invalid, and there are also no filters specified in this
         route rule, all traffic which matches this rule MUST receive a 500 status code`. The narration
         keeps both conditions, the only backendRef and no filters, and the desc keeps them too.
         `admitted` says `the implementation configures no backend for the rule`. `the rule is now live
         on the proxy` is rejected as a claim about programming no source makes, and so is a `grant`
         sentence saying the proxy is programmed with the rule once the grant exists: the route is
         Accepted a step earlier and its requests already get 500.
         `rejected` leaves ResolvedRefs at none rather than stating it: the constants say when the
         reason applies, not whether an implementation reports it on a route no listener accepted.
         `here the implementation runs a proxy for the Gateway` keeps `here`: where the data plane
         runs is implementation-specific.
         The request step follows the page request flow: the reverse proxy `uses the Host: header to
         match a configuration that was derived from the Gateway and attached HTTPRoute` and
         `forwards the request to one or more backends`. The backend sentence takes the page's own
         hedge: `For a Service backend, an implementation may represent the backend network endpoint
         as a Service IP or the backing EndpointSlices of the Service`, and the picture draws the
         endpoint case under `here`. `commonly forwards straight to a Ready Pod IP` is rejected as
         a prevalence claim the page does not make, and `network-gateway-traffic-splitting` says the
         same thing as `by the Service IP or an endpoint, as its implementation chooses`.
         `grant` ends `Service web, which selects Pod web`, the drawn relation. `whose EndpointSlice
         lists Pod web` is rejected because no EndpointSlice is drawn on the card.
         ReferenceGrant: a BackendRef into another namespace needs `a ReferenceGrant object ... in
         the referent namespace to allow that namespace's owner to accept the reference`, which is
         why the grant stands in namespace web. The Accepted and ResolvedRefs chips are the route
         status `with respect to each parent`: this route has one parent, so one chip each.
         The desc says `until a listener allowedRoutes admits its namespace`. `until the listener
         allowedRoutes selects it` is rejected: `from: All` admits it too, and a selector matches
         namespaces rather than routes.
         The steps name no persona: an object is created or edited, because a cluster operator or an
         app team named in a narration is an actor with no block (`T-21`).
SCOPE    Host and path matching and longest-path precedence are `network-ingress-routing`. Weights and
         header matches, and an invalid backend among several, are `network-gateway-traffic-splitting`.
         How the proxy itself is exposed outside the cluster is `network-nodeport-loadbalancer`.
NOTE     Every step states all four chips. A value the story has not reached reads none, so a
         condition is never shown before the object that reports it exists.
OPEN     CENTRE: the chip column reads 424..900 against 600 and is carried in
         `fixtures/carried.mjs`. Its two edges are the grid the proxy and the grant stand on, and
         centring it on x=600 would push its left edge to 362, behind the panel wall on every
         viewport (`L-16`).
```
