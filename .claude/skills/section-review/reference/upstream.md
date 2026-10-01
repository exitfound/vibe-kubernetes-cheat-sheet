# Where each section maps upstream

**This file holds no rules.** It holds two lists, and `tools/gaps.mjs` reads both of them: the
documentation trees a section is reconciled against, so the gap run fetches a known set instead of
re-deriving one every run, and the ledger of topics that have been considered and turned down.

The first list is DATA, mined from the `sources[]` the cards already carry, not a judgement
about where a section ought to look. The count beside a path is how many of that section's
citations land in that tree. A path cited once is kept, because a lone citation is often the most
interesting one in a section, and the tool ranks by that count rather than dropping the tail.

**A path is written at the depth the citations actually land**, which is not always two segments.
`gaps.mjs` enumerates only the pages an index lists as ITS OWN children, so a section whose cards
all cite `/concepts/workloads/controllers/<page>` and is mapped to `/concepts/workloads` gets the
children of the parent (`pods`, `controllers`, `autoscaling`) and never sees the eight sibling
topics it is actually made of. That was the state of `workloads/controllers` until 2026-09-04, and
it hid two absences a hand fetch found in a minute. When the tally below concentrates in one
subtree, map the subtree.

Everything under `/docs/` is `https://kubernetes.io/docs/`. Other hosts are written in full.
`gaps.mjs` fetches the `/docs/` paths and lists the rest without fetching them: a tree index is
parsed by the shape kubernetes.io renders, and no other host shares it.

**No heading here states how many cards a section holds.** That number moves every time a card
lands, and a count restated in a file no check reads is a count that drifts in silence.
`tools/section.mjs` prints it off the manifest, which is the executing home for it (`S-49`).

**Both lists are parsed, so their SHAPE is a contract.** The map is a `### <category>/<section>`
heading followed by one fenced block whose lines are a citation count, whitespace, then a
comma-separated list of paths, with indented continuation lines belonging to the count above them.
The ledger is a five-column table and every column is read. Reformat either one and the tool goes
quiet rather than loud, which is the worst way for a reader to find out.

---


## The map

### cluster/control-plane

```
5   /concepts/architecture
4   /concepts/overview, /concepts/scheduling-eviction, /reference/access-authn-authz
3   /reference/kubernetes-api, /reference/using-api
2   /concepts/policy, raft.github.io
1   /concepts/cluster-administration, /reference/command-line-tools-reference,
    /reference/generated, /reference/scheduling, /tasks/administer-cluster,
    /tasks/manage-kubernetes-objects, etcd.io/docs
```

### cluster/node-runtime

```
3   /concepts/architecture, /concepts/configuration, /concepts/workloads
2   /concepts/scheduling-eviction, /reference/node, /setup/production-environment,
    /tasks/administer-cluster, github.com/kubernetes
1   /concepts/containers, /concepts/extend-kubernetes, /concepts/overview,
    /reference/config-api, /tasks/configure-pod-container, docs.kernel.org/admin-guide,
    kubernetes.io/blog
```

### cluster/node-lifecycle

```
5   /concepts/scheduling-eviction
4   /concepts/workloads, /reference/node
3   /concepts/architecture
2   /reference/labels-annotations-taints, /tasks/run-application
1   /concepts/cluster-administration, /reference/access-authn-authz,
    /reference/command-line-tools-reference, /reference/kubectl, /reference/kubernetes-api,
    /tasks/administer-cluster, github.com/kubernetes
```

### workloads/pods-bootstrap

```
2   /concepts/workloads, /concepts/configuration
1   /concepts/containers, /concepts/scheduling-eviction, github.com/opencontainers
```

### workloads/pods-lifecycle

```
7   /concepts/workloads
2   /tasks/configure-pod-container
1   /concepts/containers, /reference/kubernetes-api, /tasks/run-application,
    github.com/kubernetes
```

### workloads/controllers

```
13  /concepts/workloads/controllers
1   /concepts/overview, /reference/command-line-tools-reference, /tasks/job
```

### network/network-foundations

```
5   /concepts/cluster-administration
4   /concepts/services-networking, /reference/networking
1   /reference/command-line-tools-reference, /tasks/network,
    github.com/containernetworking, wiki.nftables.org, ebpf.io
```

### network/pod-networking

```
5   /concepts/cluster-administration
2   /concepts/workloads, github.com/containernetworking
1   /concepts/extend-kubernetes, /reference/networking, kubernetes.io/blog, cni.dev/plugins
```

### network/services-endpoints

```
12  /concepts/services-networking
4   /reference/networking
1   /concepts/workloads
```

### network/external-traffic

```
7   /concepts/services-networking
3   /reference/networking
2   gateway-api.sigs.k8s.io
1   /tutorials/services, metallb.io, rfc-editor.org
```

### network/dns-service-discovery

```
7   /concepts/services-networking
1   /tasks/administer-cluster
```

### storage/volume-foundations

```
19  /concepts/storage
3   /concepts/configuration, /concepts/security
2   /tasks/configure-pod-container
1   /concepts/architecture, /concepts/containers, /concepts/scheduling-eviction,
    /reference/kubectl, docs.kernel.org/filesystems
```

### storage/volumes-claims

```
19  /concepts/storage
1   /concepts/overview
```

### storage/csi-mount-path

```
11  /concepts/storage
2   github.com/container-storage-interface, /reference/kubernetes-api,
    /tasks/configure-pod-container, kubernetes-csi.github.io
1   /concepts/workloads, /concepts/cluster-administration,
    secrets-store-csi-driver.sigs.k8s.io
```

### storage/stateful-data

```
6   /concepts/storage
3   /concepts/workloads
2   kubernetes-csi.github.io
```


---

## How the map is read

`node .claude/skills/section-review/tools/gaps.mjs <category>/<section>` does it. It fetches each
`/docs/` tree above, takes the pages that index lists as its own children, and marks every one of
them against the cards of this section. Three verdicts and no others:

`COVERED` a card here is NAMED after that page, in its id or its title
`PARTIAL` the topic is cited or mentioned inside a card whose subject is something else
`ABSENT` nothing here names, cites or mentions it

**A citation is not coverage** and that is the failure this whole exercise exists to catch: nineteen
of `volumes-claims`'s citations land in `/concepts/storage`, which says the section reads the tree,
not that it covers it. The tool enforces the distinction by construction, so a page a card merely
cites can reach `PARTIAL` and can never reach `COVERED`. Where it marks `PARTIAL` and prints
`first source of <id>`, it is naming its own likeliest promotion for a human to rule on.

**Check the stage before proposing.** Alpha, beta, deprecated and removed all have to be read off
the page rather than recalled, and a proposal carries the stage it found. A card built on a feature
that left upstream costs a full card to discover. The tool opens each non-covered page and prints
what its banner says, or `not stated` where the page states nothing, which is what a long-stable
core page does. `not stated` is never to be reported as stable.

**Not every ABSENT is a gap.** A page can be absent because another section owns it, because a
per-card `SCOPE` block cedes it on purpose, or because it is genuinely not worth a diagram. The
tool already attaches the first two: a topic a card elsewhere owns by name is annotated
`owned elsewhere`, and one a `SCOPE` block of this section's own cards names is annotated `ceded`.
Both drop out of the `ABSENT WITH NO DISPOSITION` shortlist. The third disposition, not worth a
diagram, is the reader's, and it is written in one line for every absence not promoted.

**Where the tool is wrong, and the one place it is wrong the OTHER way.** `COVERED` is decided from
card names, so a large upstream page taught by six cards under six other names reads `PARTIAL`, and
a topic taught here under a different word reads `ABSENT`. Both of those over-report absence, which
is the harmless direction, and the evidence column settles them.

The exception is the match itself, which is a SUBSET test: the topic's words have to appear in a
card's name and nothing requires them to be all of it, so `Deployments` reads `COVERED` off
`Deployment Rolling Update`. That over-reports COVERAGE, which is worse, because the row leaves the
report rather than joining it. The scenery-word half was closed in `gaps.mjs` on 2026-09-04 (a
topic whose tokens are all scenery, like the `controllers` index, can no longer decide `COVERED`).
The general case is open. Read the evidence column on `COVERED` rows as well as before promoting an
absence.

---

## The declined ledger

**This starts empty, and that is deliberate.** No document anywhere in this repository has ever
recorded a coverage decision, so there is no history to seed it from and inventing one would be
worse than an empty table. It fills from below, one row at a time, as the user turns a proposal
down.

Without it, a rejected proposal comes back on the next run of the same section, and a report whose
top finding was already refused stops being read.

**This is the half of the loop the tool closes.** `gaps.mjs` reads this table on every run and
drops the rows that match from its output, reporting them under `DECLINED AND FILTERED OUT` with
the reason, so a refused topic is visible as refused and never re-proposed. The skill still does
not WRITE here, for the same reason it never writes to `cards.js`: what belongs in the catalog is
the user's call, and a ledger the analyst can edit is a ledger that argues with itself.

**How a row is matched.** Five columns, all read:

| Column | What the tool does with it |
|---|---|
| `Section` | `<category>/<section>`, or the bare section key, or `*` for every section |
| `Topic` | matched by WORDS against the upstream page title and slug, so `volume snapshot` catches `Volume Snapshots` |
| `Upstream page` | the `/docs/...` path, matched exactly and beating the words. `-` when the declined topic is not one upstream page |
| `Declined on` | a date, for the reader only |
| `Why` | one line, printed beside the filtered row so a refusal stays visible as a refusal |

| Section | Topic | Upstream page | Declined on | Why |
|---|---|---|---|---|
| | | | | |

**How a row gets here.** The report prints the proposals the user rejected, formatted as rows. The
user pastes them in. The next run of that section reads them back.
