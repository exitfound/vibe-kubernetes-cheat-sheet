## cluster-admission-chain

### layout

```
WHAT     A write running the admission gauntlet: authn/authz, mutating, schema, validating, then the
         persist to ETCD. Five stages hanging off the API as one pipeline.
LAYOUT   The L read correctly. The panel owns the top-left, so API_X is 420 (first multiple of 20
         clear of the measured right edge 397) and kubectl sits in the freed BOTTOM-left. Both of
         its risers stand on KCTL_CX +/- LANE_DY, x=205 and x=235, INSIDE the panel's own column,
         and each turns once into the API's left face. A 397..420 corridor route is rejected: it
         reads as a zigzag.
         NO KUBECTL POSITION WITH ITS CENTRE CLEAR OF x=397 EXISTS. Moved right it collides with the
         ladder column at 420..820, or below the ladder with the chip strip at y=520, and widening
         it breaks the left-edge alignment the inset band exists to give. There is no third option,
         which is why this is written down rather than left to be rediscovered.
         ETCD is pulled 4 units inside BAND_R while the chips sit flush on it. That is an OPTICAL
         correction: flush, the two right edges differ by one antialiased pixel, yet the cylinder
         reads as overhanging because its right wall is straight while the chip is a rounded rect
         whose rx=4 pulls its own edge in. The inset IS that rx.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=cluster-admission-chain
         node --test report/overlay.test.mjs`. The nearest thing under the panel corner is kubectl
         at KCTL_Y 300, so 70 units of clearance.
SIZES    Chips are TWO across at 490 and not four across at 258. The longest value is `{cpu=100m,
         sa=default, runAsNonRoot=true}` on the `Pod object` chip, 251.5 units rendered at 1100x800,
         and `valChip` anchors a value 12 from the right, so at 258 the value starts left of the
         chip. Two across at 490 is the floor here: there the value starts at 326.5 against a name
         ending at 173.3.
MOTION   The mutating, schema and validating steps carry NO flow at all. Everything they change is a
         static highlight: the Api, the ladder row and the chips. Measured with the card-review
         frame tool at 1600x1000, comparing each step frozen at 0 against the same step at half its
         span, those three steps differ by 0 pixels and the two ball-carrying steps by 2150 and
         1763. Nothing on them moves, by construction.
         NO `F.flash({ targets: ['api'] })` on those three steps. `flashChips` is implemented as
         `filter: brightness(1) -> 1.55 -> 1` over 600ms on the box GROUP, so it brightens and dims
         the frame, the `API` label and the `admission pipeline` sublabel together: that is a block
         PULSE, which `M-01` forbids on infrastructure, and its peak of 1.55 is brighter than the
         1.4 of the Pod pulse that `M-01` reserves as the only pulse on a card. `M-27` reads as
         permission for it, and the two rows disagree, on this card `M-01` wins and the beat is the
         `.highlight` that the same `M-27` names first. A flash also cannot be seen in a still: it
         runs 600ms against a step span of 600ms, so a frame at half span sits at peak brightness
         and a frame at 95 percent is still lit, and both read as an ordinary static highlight. Only
         a frame at 0 compared against one mid-span shows it, which is why the frame tool takes 0 as
         well.
         Every `duration` here is sized off READING LOAD, which is the one thing on a card that has
         no machine at all. Measured with the card-review timing probe, the five steps here sit at
         9.66, 10.06, 9.83, 9.47 and 14.47, which straddles the catalogue median
         (`report/baselines.test.mjs` prints it, and `timing.mjs` ranks one step against it). Sizing
         the three flash steps off the flash instead puts two of them at 5.99 and 6.20, among the
         most hurried steps in the catalogue, which is what a reader pays for a duration chosen by
         the motion.
         DO NOT read `span <= duration` (`M-19`) as the constraint that fixes these numbers. It is a
         floor and only persist comes near it, at span 2982 against 3300. That margin of 318 is also
         what a geometry change spends first, because `routeDur` is length-based (`A-11`).
WIRE LABELS
         Four labels, one per drawn exchange, and every one of them names traffic that rides THAT
         lane (`T-22`). `req` sits above the Api because the request is what the Api received.
         `write` and `commit` stack in the 136-unit gutter between the Api right edge at 820 and the
         cylinder left edge at 956, `write` above the out lane at y=85 and `commit` below the back
         lane at y=115, measured 73.6 and 61.3 units wide at 1100x800 against that gutter. `resp`
         sits under kubectl. Three balls fly on the persist step and all three are named. THE LADDER
         CARRIES NO CAPTION OR HEADING saying the five rungs are the write path rather than five
         admission stages, and the ROOM is not the reason: the ladder runs y 220..428, the chip
         strip starts at 520, and the panel is 230 deep at worst with its right edge at x<=397
         against a ladder column at 420..820, so a caption at y=450 or at y=180 fits at every
         viewport. Three other things keep one off. The catalogue draws 37 chain ladders and NOT ONE
         carries a caption. There is no text class for one: all 187 `P.wire` labels in the catalogue
         are blank at build and filled per step out of `wires` (T-29), which is what makes a
         `scheme-label` the name of traffic on its own lane (T-22), and the four standing text nodes
         outside that class are each a block label inside a drawn frame. And the pattern is not this
         card's: cluster-resource-quota hangs five rungs under the byte-identical `API` / `admission
         pipeline` box and its rung 5 is `persist  ·  the Pod object is written to ETCD`, as far
         outside admission as row 5 is here, so captioning one and leaving the other is the drift,
         and captioning both is a two-card change to close a scope statement the cards already make.
         The scope IS stated, in three places: the `aria-label` above, the numbering plus `chain:
         [i]` which makes the ladder a STEP INDEX rather than a taxonomy of admission, and step 1
         opening `Already done, and not admission at all`. A second heading 40 units under a
         sublabel that says something else reads as a contradiction rather than as a clarification.
CONTENT  LimitRanger is named in BOTH the mutating and the validating steps, which is what the
         reference types it ("Mutating and Validating") and what cluster-resource-quota spells out.
         The validating step opens `LimitRanger is back to check min and max` so the repeat reads as
         deliberate rather than as a duplication bug.
         Row 3, the schema row, is `required fields and values checked`. It names neither TYPES nor
         `validate against OpenAPI schema`, and both omissions are deliberate: for a built-in kind
         the API server runs its own Go validation, an OpenAPI structural schema is what a CUSTOM
         resource is checked against, and a type error never reaches this stage at all because
         decoding the request body rejected it earlier. The narration is the same claim in prose, `a
         missing required field or a value outside its allowed range fails here`.
         ValidatingAdmissionPolicy is in the default-enabled list, so the validating stage has THREE
         paths and row 4 says "policies".
         The mutating step is the ONLY place failurePolicy is explained, and it has to be explained
         somewhere: the chip is standing, it lights on mutating and on validating, and the card
         `desc` that would otherwise carry the point is grid text a reader inside the dialog never
         sees. The clause is `Their failurePolicy decides whether a timeout blocks the write`, on
         the step where the first webhook appears.
         The Pod object goes `{cpu=100m}` to `{cpu=100m, sa=default, runAsNonRoot=true}`, one field
         per HALF of the mutating step: `sa=default` is ServiceAccount, one of the three always-on
         plugins the narration names, and `runAsNonRoot=true` is the policy webhook. With only the
         webhook field drawn, three named built-in plugins rewrite the Pod and leave no trace. The
         persist step says `every watch that MATCHES the new Pod`, never `every open watch`: a watch
         is scoped by resource, namespace and selector, so a watch on Services gets nothing. The
         qualifier is the whole fix (T-20) and the sentence must not lose it again.
         The `aria-label` describes the WRITE PATH, not "the admission chain". Only rows 2 to 4 are
         admission: row 1 is authn/authz, which step 1 itself puts BEFORE admission ("Admission runs
         after authentication, so every caller has an identity"), and row 5 is the persist. The box
         sublabel `admission pipeline` stays, and is not the same defect: it names what the API is
         doing in THIS card, cluster-resource-quota carries the identical sublabel on the identical
         box, and a heading over a block is not a claim about all five rows.
         Validating webhooks `call out over HTTPS`, not "over HTTP". The reference calls webhooks
         "HTTP callbacks" in prose, which is what the earlier wording leaned on, but the same page
         is absolute about the transport, in its own words `The scheme must be "https"` and `the URL
         must begin with "https://"`. The clause carries the OUT-OF-PROCESS half of a contrast drawn
         against `ValidatingAdmissionPolicy runs in process` in the same sentence, and HTTPS makes
         that point at one character more.
         https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/
         The validating step lights `objChip`, for the reason the schema step does: both stages
         check the object, so the object under check is lit beside the stage checking it. Lighting
         it on schema and leaving it dark on validating was the picture disagreeing with a narration
         that has LimitRanger checking min and max and ResourceQuota counting, both against that
         object. `failurePolicy` stays lit beside it because this stage is where webhooks are
         called. MutatingAdmissionPolicy is deliberately ABSENT from the mutating step and from row
         2 at the `k8sVersion` this card declares. The gate is off by default there, and only there:
           MutatingAdmissionPolicy  false  Alpha  1.30  1.33
           MutatingAdmissionPolicy  false  Beta   1.34  1.35
           MutatingAdmissionPolicy  true   GA     1.36  -
         At 1.36 it is GA and on, "a declarative, in-process alternative to mutating admission
         webhooks", the exact mirror of what row 4 already says with "policies". So a bump of
         `k8sVersion` to 1.36 is not a metadata edit for this card: row 2 becomes `plugins, policies
         and webhooks` and the mutating narration gains a MutatingAdmissionPolicy clause, which
         fits, because that narration measures 8 lines against the 10-line ceiling the BUDGET note
         sets. Do not add it while the card says 1.35, and do not read its absence as an oversight.
         https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/
         https://kubernetes.io/docs/reference/access-authn-authz/mutating-admission-policy/ The
         watches and informers of the persist step are NARRATED and not drawn, deliberately: the
         sentence is about who learns of the write, and the card has no watcher block because the
         write path is what it draws. Adding one would put a sixth actor on a card whose subject is
         the five rungs. Authorizers run in configured order and the first to allow or to deny ends
         it, with 403 when none allows ("If any authorizer approves or denies a request, that
         decision is immediately returned and no other authorizer is consulted",
         https://kubernetes.io/docs/reference/access-authn-authz/authorization/, now cited in
         `sources` because step 1 leaned on a page the card did not name). ServiceAccount,
         LimitRanger and DefaultTolerationSeconds are all in the default-enabled list and all
         mutating. Mutation precedes validation ("Mutating admission webhooks are invoked first...
         After all object modifications are complete, and after the incoming object is validated by
         the API server, validating admission webhooks are invoked"), which is what carries both
         `all before validation` on the mutating step and `before any validating webhook runs` on
         the schema step. failurePolicy governs timeouts. ADDED is the watch event for a create, and
         201 Created is the create response, spelled the same way on cluster-object-create-path,
         cluster-server-side-apply and cluster-leader-election. Type lines and gate tables are
         parsed off the HTML on this card, never off a summary: a summarising fetch of the
         admission-controllers page returns LimitRanger as "Type: Validating" and the feature gate
         as beta-default-true at 1.35, and both are wrong.
         Admission sees anonymous callers routinely, so the card does not say the request arrives
         authenticated and admission never sees an anonymous caller. An anonymous request PASSES
         authentication, as system:anonymous in group system:unauthenticated, and anonymous access
         is ON BY DEFAULT whenever the authorization mode is anything other than AlwaysAllow. What
         step 1 states is the weaker and true claim: admission runs after authentication, so every
         caller has an identity, even system:anonymous. The reference sentence that settles it: "A
         request providing no bearer token would be treated as an anonymous request." and "Anonymous
         access is enabled by default if an authorization mode other than AlwaysAllow is used".
         https://kubernetes.io/docs/reference/access-authn-authz/authentication/
         DefaultTolerationSeconds is the always-on mutating example the card names, and
         DefaultStorageClass is not: it acts on PersistentVolumeClaims, and this card follows a Pod.
BUDGET   The panel bottom is a LINE count, not a character count, and the card proves it against
         itself: at 1100x800 the authn-authz, mutating and validating steps carry 290, 338 and 284
         characters and all three measure the SAME 229.8, because all three wrap to 8 lines. So a
         character figure cannot be a budget here and none is stated anywhere on this card.
         The line pitch is 24.85 units and the panel chrome is 53.9, measured off the schema step at
         4 lines / 130.4 against validating at 8 lines / 229.8. kubectl sits at y=300, so the panel
         reaches it at 11 lines and 10 LINES IS THE CEILING. Measure, never count, from
         `scheme/test` with `OVERLAY_IDS=cluster-admission-chain node --test
         report/overlay.test.mjs`
         and read the 1100x800 row it prints.
NAMING   Every step opens by sorting its stage into `Built-in.` or `Pluggable plus built-in.`, and
         step 1 carries NEITHER. It opens `Already done, and not admission at all`, because the
         sorting is a statement about the admission pipeline and row 1 is not in it. Reading it as a
         gap and filling in `Built-in.` states something false as well: authentication takes webhook
         token authentication, JWT/OIDC, an authenticating reverse proxy and client-go credential
         plugins, and authorization takes a Webhook mode, so authn/authz is the MOST pluggable stage
         on the card. The absent label is what says row 1 is outside the taxonomy.
         https://kubernetes.io/docs/reference/access-authn-authz/authentication/ The id carries the
         TITLE, `D-02` keeps the category prefix.
```
