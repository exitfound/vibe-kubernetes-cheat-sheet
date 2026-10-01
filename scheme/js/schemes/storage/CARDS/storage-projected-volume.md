## storage-projected-volume

### layout

```
WHAT     One projected volume fills one directory from three sources, and only the token file keeps
         changing: Kubelet asks for an audience-bound token with a one hour lifetime and rewrites it
         at 80 percent of that lifetime, long before it expires, while a legacy Secret token never
         expired at all. Pod api-0 mounts volume creds at /var/run/secrets/app: configMap vault-ca
         as ca.crt, downwardAPI metadata.namespace as namespace, serviceAccountToken (audience vault,
         expirationSeconds 3600) as token.
LAYOUT   Three file rows in ls order (ca.crt, namespace, token) at 484..716 under a mount-path
         caption, each sublabel naming its source. No gutter, no ..data rows and no enclosure: the
         listing is a plain directory, and the swap belongs to storage-configmap-secret-mount. The API
         server over Kubelet in a column at 868..1100, 116 apart so the TokenRequest and token tags
         have a gap of their own. The Pod at 100..332. The three columns are EVENLY SPACED and the
         spacing is the composition: 100 of margin, 152 of gap, 232 of block, mirrored, so the row
         stack centres on 600, the canvas centre and the chip strip centre, and the two outer
         margins are equal. One CENTRELINE at y 274 carries the middle row, the Pod and the Kubelet,
         so each fan is 68 up, straight, 68 down and the read fan mirrors the write fan. The Pod is
         centred on the row stack rather than levelled with the token row for exactly that reason,
         and it is what pins the vertical: the rows at 178 and the floor at 400 are both set by the
         Pod top clearing the panel.
         Across the floor a TIME AXIS, 7 units a minute, spanning 134..1066, which is the CHIP STRIP
         span exactly: the axis used to run 180..1080 and the two read as two rules that had slipped
         apart. Token 1 is a bar from minute 0 to
         60, token 2 one from 48 to 108 on the same scale and height, so the 48..60 overlap is exact
         against the tick tags 0 / 48, 80% / 60 / 108, and the legacy bar runs the whole axis to
         1066, CLOSED at both ends on the same 6 unit corners as the other two. It used to stop dead
         at the axis end to draw an expiry that never comes, and beside two closed bars that read as
         a clipped box rather than as an open interval, so the caption inside it carries that
         meaning on its own now. Its per-step caption is `if instead a legacy Secret token`
         (T-35). The ticks are text only, and the axis is one P.relation. The section lever no sibling
         carries is that axis: the only horizontal in volume-foundations that is time, because the
         subject is a lifetime, a refresh at 80 percent and an expiry that never comes.
PANEL    Read it with `OVERLAY_IDS=storage-projected-volume node --test report/overlay.test.mjs`
         from `scheme/test/`, never off a number copied out of here. The deepest step is `legacy` at
         1100x800, and at the two wider viewports `inject`, which the poster previews.
         The ONLY thing left of x 420 is the Pod, and its top clears the deepest reading by 17. That
         is the whole vertical budget of this card and it is spent: the Pod is centred on the row
         stack, the stack sits as high as that clearance allows, and the floor was moved down 8 to
         pay for it. A longer narration has nowhere to go, so a prose edit here is re-measured.
         Everything else, the rows from x 484 and the mount caption from 531, clears the panel on
         WIDTH (x<=397) rather than on depth, so it is free of the panel at every viewport.
SIZES    The API server and Kubelet are 232 by 80 and the Pod 232 by 104 with a 192 by 44 app box
         (NET.L-01). The rows are 232 by 56, a measured departure: they are entries of one listing,
         as in storage-configmap-secret-mount, and three slots at 80 with the 12 gap put the token
         row mid at 402 and the Pod bottom at 454, through the token 1 bar at 400. The widest row
         string is the sublabel `serviceAccountToken, aud vault` at 180.9 of 232. The bars are 30
         tall and as long as the lifetime they draw (420 for an hour). Chips are 300 wide, the widest
         pair `dir holds` plus `ca.crt, namespace, token` at 227.4.
LANES    Eight one-way lanes and one relation. The TokenRequest climbs at x 972 and the token (and on
         inject the ConfigMap) comes down at x 996, a pair 24 apart around the column centre. The
         three writes leave the Kubelet left face at the centreline and enter the right face of their
         row: the namespace write is one straight line and the other two turn on a bus at x 780. The
         reads mirror that exactly: the namespace read runs straight from its row to the Pod right
         face, and the ca.crt and token reads join it over a shared drop at x 420 (A-10). The drop
         and the bus are the SAME distance from 600, 180 each way, which is what makes the two fans
         read as one shape. The drop cannot go further left: x 420 is the L-03 wall, and the ca.crt
         read runs at y 206, above the panel floor. Each write and read lane is pinned at 0 until its
         row exists and at 1 from then on (STO.S-02).
MOTION   ONE BEAT FOR EVERY BALL and no explicit `dur` anywhere, the storage-emptydir grammar: all
         thirteen ride routeDur, and the three lane lengths (116, 152 and 220) are all under the 315
         routeDur needs, so every one of them lands on the 700ms PKT_DUR_MIN floor (M-13). That is
         why the card is NOT in the `render/motion.test.mjs` PACING registry, where it stood at
         speed 9 while its legs rode a LEG_DUR of 1500. Step durations follow from that: 4800 on the
         three three-hop steps and 6400 on `refresh`, which draws a fourth.
         ONLY THE VERTICAL PAIR IS TAGGED, and the rule is what is written on the ends: a
         TokenRequest and a token are named by neither the API server nor the Kubelet, while a read
         leaving the row labelled `ca.crt` and a write landing on it need no second copy of the
         word. Each tag lives exactly as long as its ball (M-30a), fading in before departure and
         out as the ball dissolves, and rides BESIDE its lane at the ball's own height, 66 out: the
         gap between the two boxes is 116 and the leg is the same 116, so any vertical offset puts
         the tag inside a box at one end or the other, which is what the old emerge offsets were
         working around. Read tags were tried on this geometry and DROPPED:
         the corridor from a row face to the Pod is 152 units, so a tag clear of the rows at
         departure and clear of the Pod at arrival could only emerge at 950 of 1500 and lived 550ms,
         150 of them at full opacity, measured in `motion.mjs` as `scheme-box-sublabel "ca.crt"` in
         at d1750 and out at d2300. The alternative was a negative hold, which M-30a forbids.
         Every ball leaves a lit sender: the API server on inject, Kubelet on request and at
         minute 48 on refresh, the three rows on read. `token file` turns over when the write into
         the token row lands, `app uses` when the read lands on the Pod, both through `chips` plus an
         arrival F.set and F.light. The Pod pulses on every read arrival, three on read and one on
         refresh (M-16), while `app uses` turns over on the token read alone.
         The mount-path caption is pinned in the stage field like a row and comes up with the first
         of them: standing from step 0 it captioned an empty band on the poster frame, and the Pod
         sublabel names the path there anyway. The legacy step moves
         no ball: the bar fades in from step entry, the moment its caption is written, because a
         caption standing alone inks 15 under the Token 2 bar and reads as its label. Both revert
         on prev and reset through the stage and the wire field.
CONTENT  Read against kubernetes/website projected-volumes.md, service-accounts.md,
         service-accounts-admin.md, configure-service-account.md, the feature-gate pages, the
         kube-apiserver flag and kubelet config references, and kubelet token_manager.go where the
         docs are silent, for k8sVersion 1.35.
         sources: `A projected volume maps several existing volume sources into the same directory`,
         listing secret, downwardAPI, configMap, serviceAccountToken, clusterTrustBundle and
         podCertificate. The last two are beta and off by default in 1.35 (feature gates
         ClusterTrustBundleProjection, beta from 1.33, and PodCertificateRequest, beta from 1.35,
         both defaultValue false through 1.36), which the desc says.
         configmap: the drawn API server to Kubelet ball is narrated as `gets`, which holds under
         every configMapAndSecretChangeDetectionStrategy, whose default is `Watch`.
         refresh: `The kubelet proactively requests rotation for the token if it is older than 80% of
         its total time-to-live (TTL), or if the token is older than 24 hours`, and `The application
         is responsible for reloading the token when it rotates`, hence `The app gets token 2 only
         when it re-reads` and the separate re-read ball. token_manager.go `requiresRefresh` takes up
         to 10s of jitter off both thresholds, so `at 80 percent` and minute 48 stand. The desc and
         the aria-label carry the 24 hour arm too: `replaces it at 80 percent of its lifetime` alone
         is rejected, because a token asked for longer than 30 hours is replaced at 24 hours first.
         audience: `A recipient of the token must identify itself with an identifier specified in the
         audience of the token, and otherwise should reject the token`, so the narration says
         `should reject`, never `rejects`.
         lifetime: expirationSeconds `defaults to 1 hour and must be at least 10 minutes (600
         seconds)`, capped by `--service-account-max-token-expiration`, so the drawn 3600 is the
         default a user-written source gets. The drawn volume is not the admission-injected
         kube-api-access one. That one asks for 3607, and `--service-account-extend-token-expiration`
         (default true) means `admission injected tokens would be extended up to 1 year`: the
         apiserver (serviceaccount/storage/token.go) extends only a Pod-bound request of exactly 3607
         seconds for the API server audiences, so the vault token at 3600 is never extended and a one
         hour expiry drawn on kube-api-access would be false.
         legacy: `These tokens don't expire and don't rotate`, and for a legacy token the API server
         `checks the token against the Secret`, hence `valid until that Secret or its ServiceAccount
         is deleted`. `never expires` is present tense in the desc and the aria-label, because a
         manually created token Secret is still available (`if you need a token that never
         expires`), so `never expired` is rejected as reading like a retired mechanism.
         projected end: `The token will also become invalid against the API when either the Pod or the
         ServiceAccount is deleted`, and the cutoff is `60 seconds (or more) after the
         .metadata.deletionTimestamp`, while an offline OIDC validator keeps it `valid until the
         token reaches its expiration timestamp`. Hence `the API server rejects it once Pod api-0 or
         its ServiceAccount is deleted`, and `or as soon as Pod api-0 is deleted` is rejected as missing
         the ServiceAccount and claiming an instant cutoff for every recipient.
NAMING   `vault` is the audience string and nothing on the canvas acts for it, so Vault is never drawn
         and never named as an actor. `Token 1` and `Token 2` are bar headings and take a capital,
         while the file names stay lowercase because they are the literal names.
SCOPE    The ..data swap a projected file goes through is storage-configmap-secret-mount, cited in one
         clause (`swaps it into the same file atomically`). Why a subPath mount misses the new token
         is storage-subpath. TokenRequest issuance beyond what the volume shows, TokenReview, the
         admission-injected kube-api-access volume and bound-token invalidation have no card in the
         catalog: cluster-admission-chain names the ServiceAccount admission plugin only, and
         workloads-image-pull-registry-auth covers imagePullSecrets.
NOTE     Each chip reports what is drawn for the projected token. On the legacy step the chips stay on
         token 2: the legacy token is a counterfactual, and it has its own bar and caption, not a chip.
```
