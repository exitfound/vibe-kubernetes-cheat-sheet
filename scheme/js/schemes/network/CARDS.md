# Scheme card design notes: network

The per-card design record for `js/schemes/network/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS RECORD.** This file is the preamble and the index. **The notes themselves are
one file per card in `./CARDS/`**, named after the card id, which is the shape `cluster/`,
`workloads/` and `storage/` are in as well. `unit/docs.test.mjs` reads the shape off the tree rather
than off a list of category names, so no category is a special case.

**One card, one file, one block.** Each `./CARDS/<card-id>.md` opens with `## <card-id>` and carries
a single `### layout` section holding one fenced block. Inside it every note stands under a LABEL in
the first column, with its prose in the column at 9. Nothing else is a heading: a record has no
sub-sections, no per-line anchors and no poster note. A reason that belongs to ONE constant is a
comment ON that constant instead (`S-34`, `S-35`), where it cannot desync from the line it is about,
and the note that explains a grid thumbnail sits on that thumbnail in `./posters.js`.

**Every `###` heading starts its own line.** A heading written onto the end of the closing fence of
the block above it (```` ```### layout ````) is swallowed by that fence: it renders as nothing and
is invisible to every reader keyed on `^### `, this record walk included.

The label vocabulary is ONE list for all four records, in `scheme/CANON.md` under "The record
vocabulary". Use the labels that apply, IN THAT ORDER, use each at most once, and add none of your
own. The order is not decoration: a reader looking for what binds a card's geometry reads down until
`PANEL`, and a record that puts `OPEN` in the middle or `CONTENT` before `MOTION` makes that a hunt.
Every record opens on `WHAT` and every record carries `PANEL`.

**Every one of them is written in the present tense** (`S-48`). A block says what the card draws and
what was measured, never what an edit did to it. A rejected alternative is a constraint with the
number that kills it, under `WHY NOT` or `DO NOT`, and not an account of the day it was rejected.
Dates, "used to", "the old", "this replaces" and the name of whoever ruled on something do not
appear.

**A `PANEL` block is MEASURED over the three standard viewports, never over one** (`L-06`), and it
is about this card's own bottom rather than the right edge, which `L-02` fixes catalog-wide.

**The extent itself is NOT stored here.** The right edge is `x<=397` catalog-wide, the BOTTOM varies
per card and per viewport inside the band `L-04` states, and it moves NON-MONOTONICALLY (`L-02`,
`L-04`, `L-05`), so a number copied into a record goes stale on the next prose edit with nothing
red. Every `PANEL` block names the command that prints it instead,
`OVERLAY_IDS=<card-id> node --test report/overlay.test.mjs` run from `scheme/test/`, and keeps only
what the reading is FOR: which step is deepest, what stands under the panel, how much clearance is
left, and any constant the card derives from it. Several cards here carry a hard character ceiling
and nothing in `npm test` enforces one (`L-08`).

A new card takes a new file in `./CARDS/` and a row in the index below, in the place the grid gives
it: **the index is in GRID ORDER**, subcategory by subcategory in the `SUBCATEGORIES` order
`cards.js` declares, and inside one subcategory in the relative order `cards.js` lists its cards.
Here that IS the raw `CARDS` order, because this category declares its cards in the order it shows
them, as `cluster/` and `storage/` do and `workloads/` alone does not. Both orders are the same
editorial argument about what a reader meets first (`D-10`) rather than an alphabet, so an insert
goes in the place the argument gives it in both files at once.

---

**THE INDEX.** (Deliberately not a `##` heading: `unit/docs.test.mjs` parses every `## ` in a
record as a card id, and a second-level heading anywhere else is reported as an orphan. This
file carries none, which is what lets the same walk read it alongside `./CARDS/`.)

**Network Foundations**

- [`network-model`](./CARDS/network-model.md)
- [`network-ipam-pod-cidr`](./CARDS/network-ipam-pod-cidr.md)
- [`network-service-cidr`](./CARDS/network-service-cidr.md)
- [`network-dualstack`](./CARDS/network-dualstack.md)
- [`network-namespaces`](./CARDS/network-namespaces.md)
- [`network-kube-proxy-modes`](./CARDS/network-kube-proxy-modes.md)
- [`network-proxy-rule-resync`](./CARDS/network-proxy-rule-resync.md)
- [`network-conntrack-nat`](./CARDS/network-conntrack-nat.md)
- [`network-netfilter-path`](./CARDS/network-netfilter-path.md)
- [`network-ebpf-dataplane`](./CARDS/network-ebpf-dataplane.md)
- [`network-packet-classification`](./CARDS/network-packet-classification.md)
- [`network-policy`](./CARDS/network-policy.md)

**Pod Networking**

- [`network-pod-localhost`](./CARDS/network-pod-localhost.md)
- [`network-hostnetwork-hostport`](./CARDS/network-hostnetwork-hostport.md)
- [`network-cni-invocation`](./CARDS/network-cni-invocation.md)
- [`network-pod-ip-and-veth`](./CARDS/network-pod-ip-and-veth.md)
- [`network-pod-to-pod-same-node`](./CARDS/network-pod-to-pod-same-node.md)
- [`network-pod-to-pod-cross-node`](./CARDS/network-pod-to-pod-cross-node.md)
- [`network-mtu-overhead`](./CARDS/network-mtu-overhead.md)
- [`network-pod-egress-snat`](./CARDS/network-pod-egress-snat.md)

**Services & Endpoints**

- [`network-service-types`](./CARDS/network-service-types.md)
- [`network-service-clusterip`](./CARDS/network-service-clusterip.md)
- [`network-service-debugging`](./CARDS/network-service-debugging.md)
- [`network-endpointslice-reconcile`](./CARDS/network-endpointslice-reconcile.md)
- [`network-service-terminating-endpoints`](./CARDS/network-service-terminating-endpoints.md)
- [`network-traffic-distribution`](./CARDS/network-traffic-distribution.md)
- [`network-internal-traffic-policy`](./CARDS/network-internal-traffic-policy.md)
- [`network-externalname`](./CARDS/network-externalname.md)

**External Traffic**

- [`network-nodeport-loadbalancer`](./CARDS/network-nodeport-loadbalancer.md)
- [`network-external-traffic-policy`](./CARDS/network-external-traffic-policy.md)
- [`network-loadbalancer-bare-metal`](./CARDS/network-loadbalancer-bare-metal.md)
- [`network-loadbalancer-direct-to-pods`](./CARDS/network-loadbalancer-direct-to-pods.md)
- [`network-ingress-routing`](./CARDS/network-ingress-routing.md)
- [`network-gateway-api`](./CARDS/network-gateway-api.md)
- [`network-gateway-traffic-splitting`](./CARDS/network-gateway-traffic-splitting.md)
- [`network-client-ip-preservation`](./CARDS/network-client-ip-preservation.md)

**DNS & Service Discovery**

- [`network-dns-coredns`](./CARDS/network-dns-coredns.md)
- [`network-dns-records`](./CARDS/network-dns-records.md)
- [`network-dns-pod-policy`](./CARDS/network-dns-pod-policy.md)
- [`network-dns-ndots`](./CARDS/network-dns-ndots.md)
- [`network-dns-egress-policy`](./CARDS/network-dns-egress-policy.md)
- [`network-nodelocal-dnscache`](./CARDS/network-nodelocal-dnscache.md)
- [`network-dns-autoscaling`](./CARDS/network-dns-autoscaling.md)
- [`network-headless-service`](./CARDS/network-headless-service.md)
