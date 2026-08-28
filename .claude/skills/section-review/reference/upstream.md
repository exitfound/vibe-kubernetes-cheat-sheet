# Where each section maps upstream

**This file holds no rules.** It holds two lists: the documentation trees a section is reconciled
against, so phase 5 fetches a known set instead of re-deriving one every run, and the ledger of
topics that have been considered and turned down.

The first list is DATA, mined from the `sources[]` the cards already carry, not a judgement
about where a section ought to look. The count beside a path is how many of that section's
citations land in that tree. A path cited once is kept, because a lone citation is often the most
interesting one in a section.

Everything under `/docs/` is `https://kubernetes.io/docs/`. Other hosts are written in full.

---

## The map

### cluster/control-plane, 12 cards

```
5   /concepts/architecture
4   /concepts/overview, /concepts/scheduling-eviction, /reference/access-authn-authz
3   /reference/kubernetes-api, /reference/using-api
2   /concepts/policy, raft.github.io
1   /concepts/cluster-administration, /reference/command-line-tools-reference,
    /reference/generated, /reference/scheduling, /tasks/administer-cluster,
    /tasks/manage-kubernetes-objects, etcd.io/docs
```

### cluster/node-runtime, 8 cards

```
3   /concepts/architecture, /concepts/configuration, /concepts/workloads
2   /concepts/scheduling-eviction, /reference/node, /setup/production-environment,
    /tasks/administer-cluster, github.com/kubernetes
1   /concepts/containers, /concepts/extend-kubernetes, /concepts/overview,
    /reference/config-api, /tasks/configure-pod-container, docs.kernel.org/admin-guide,
    kubernetes.io/blog
```

### cluster/node-lifecycle, 8 cards

```
5   /concepts/scheduling-eviction
4   /concepts/workloads, /reference/node
3   /concepts/architecture
2   /reference/labels-annotations-taints, /tasks/run-application
1   /concepts/cluster-administration, /reference/access-authn-authz,
    /reference/command-line-tools-reference, /reference/kubectl, /reference/kubernetes-api,
    /tasks/administer-cluster, github.com/kubernetes
```

### workloads/pods-bootstrap, 3 cards

```
2   /concepts/workloads, /concepts/configuration
1   /concepts/containers, /concepts/scheduling-eviction, github.com/opencontainers
```

### workloads/pods-lifecycle, 9 cards

```
7   /concepts/workloads
2   /tasks/configure-pod-container
1   /concepts/containers, /reference/kubernetes-api, /tasks/run-application,
    github.com/kubernetes
```

### workloads/controllers, 8 cards

```
8   /concepts/workloads
1   /concepts/overview, /tutorials/stateful-application, /tasks/job
```

### network/network-foundations, 8 cards

```
4   /concepts/cluster-administration, /concepts/services-networking, /reference/networking
1   /tasks/network, github.com/containernetworking, wiki.nftables.org, ebpf.io
```

### network/pod-networking, 8 cards

```
6   /concepts/cluster-administration
2   /concepts/workloads, github.com/containernetworking
1   /concepts/extend-kubernetes, /reference/command-line-tools-reference,
    /reference/networking, kubernetes.io/blog, cni.dev/plugins
```

### network/services-endpoints, 8 cards

```
12  /concepts/services-networking
4   /reference/networking
1   /concepts/workloads
```

### network/external-traffic, 8 cards

```
7   /concepts/services-networking
3   /reference/networking
2   gateway-api.sigs.k8s.io
1   /tutorials/services, metallb.io, rfc-editor.org
```

### network/dns-service-discovery, 5 cards

```
7   /concepts/services-networking
1   /tasks/administer-cluster
```

### storage/volume-foundations, 8 cards

```
9   /concepts/storage
3   /concepts/configuration
2   /concepts/security
1   /concepts/containers, /concepts/scheduling-eviction
```

### storage/volumes-claims, 8 cards

```
15  /concepts/storage
1   /concepts/overview
```

### storage/csi-mount-path, 8 cards

```
10  /concepts/storage
2   github.com/container-storage-interface, /reference/kubernetes-api,
    /tasks/configure-pod-container
1   /concepts/workloads, /concepts/cluster-administration, kubernetes-csi.github.io
```

### storage/stateful-data, 7 cards

```
10  /concepts/storage
3   /concepts/workloads
2   kubernetes-csi.github.io
```

---

## How to read the map in phase 5

The tree is the input, not the answer. Fetch the tree's own index page, take the pages it lists as
first-class topics, and mark each against this section's cards. Three verdicts and no others:

`COVERED` a card here has that page as its subject, not merely as a citation
`PARTIAL` the topic is touched inside a card whose subject is something else
`ABSENT` nothing in this section teaches it

**A citation is not coverage** and that is the failure this phase exists to catch: fifteen of
`volumes-claims`'s citations land in `/concepts/storage`, which says the section reads the tree,
not that it covers it.

**Check the stage before proposing.** Alpha, beta, deprecated and removed all have to be read off
the page rather than recalled, and a proposal carries the stage it found. A card built on a feature
that left upstream costs a full card to discover.

**Not every ABSENT is a gap.** A page can be absent because another section owns it, because a
per-card `SCOPE` block cedes it on purpose, or because it is genuinely not worth a diagram. Say
which, in one line, for every absence you do NOT promote.

---

## The declined ledger

**This starts empty, and that is deliberate.** No document anywhere in this repository has ever
recorded a coverage decision, so there is no history to seed it from and inventing one would be
worse than an empty table. It fills from below, one row at a time, as the user turns a proposal
down.

Without it, a rejected proposal comes back on the next run of the same section, and a report whose
top finding was already refused stops being read.

| Section | Topic | Declined on | Why |
|---|---|---|---|
| | | | |

**How a row gets here.** Phase 8 prints the proposals the user rejected, formatted as rows. The
user adds them. This skill never writes to this file itself, for the same reason it never writes to
`cards.js`: what belongs in the catalog is the user's call, and a ledger the analyst can edit is a
ledger that argues with itself.
