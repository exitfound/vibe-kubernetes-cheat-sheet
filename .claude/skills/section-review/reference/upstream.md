# Where each section maps upstream

Two lists, both read by `tools/gaps.mjs`: the documentation trees each section is reconciled
against, and the ledger of topics the user has declined.

The map is data mined from the cards' `sources[]`. The number beside a path is how many of that
section's citations land in that tree. A path cited once is kept: the tool ranks by the count.

**Write a path at the depth the citations land.** `gaps.mjs` enumerates only the pages an index
lists as its own children, so a section citing `/concepts/workloads/controllers/<page>` mapped to
`/concepts/workloads` never sees its own topics. When the tally concentrates in a subtree, map the
subtree.

`/docs/...` means `https://kubernetes.io/docs/...`. Other hosts are written in full and listed
without fetching. Section sizes live in `tools/section.mjs`, not here.

**Both lists are parsed, so their shape is a contract.** The map is a `### <category>/<section>`
heading and one fenced block of lines `<count><spaces><comma separated paths>`, with indented
continuation lines belonging to the count above. The ledger is a five-column table, and every
five-column table row in this file is read as a ledger row, so add no other five-column table.
Reformat either and the tool goes quiet rather than loud.

## The map

### cluster/control-plane

```
5   /concepts/architecture
4   /concepts/overview, /concepts/scheduling-eviction, /reference/access-authn-authz
3   /reference/kubernetes-api, /reference/using-api
2   /concepts/policy, raft.github.io
1   /concepts/cluster-administration, /reference/command-line-tools-reference, /reference/generated,
    /reference/scheduling, /tasks/administer-cluster, /tasks/manage-kubernetes-objects, etcd.io/docs
```

### cluster/node-runtime

```
3   /concepts/architecture, /concepts/configuration, /concepts/workloads
2   /concepts/scheduling-eviction, /reference/node, /setup/production-environment,
    /tasks/administer-cluster, github.com/kubernetes
1   /concepts/containers, /concepts/extend-kubernetes, /concepts/overview, /reference/config-api,
    /tasks/configure-pod-container, docs.kernel.org/admin-guide, kubernetes.io/blog
```

### cluster/node-lifecycle

```
6   /concepts/scheduling-eviction
5   /reference/node
4   /concepts/workloads
3   /concepts/architecture
2   /reference/labels-annotations-taints
1   /concepts/cluster-administration, /reference/access-authn-authz,
    /reference/command-line-tools-reference, /reference/kubectl, /tasks/administer-cluster,
    /tasks/run-application, github.com/kubernetes
```

### workloads/pods-bootstrap

```
12  /concepts/workloads
3   /concepts/configuration, /concepts/scheduling-eviction, github.com/kubernetes
2   /concepts/containers, /concepts/services-networking
1   /reference/command-line-tools-reference, /reference/kubernetes-api, /tasks/debug,
    github.com/opencontainers
```

### workloads/pods-lifecycle

```
14  /concepts/workloads
4   /reference/kubernetes-api
3   /tasks/configure-pod-container
2   /tasks/debug
1   /concepts/architecture, /concepts/containers, /concepts/services-networking,
    /reference/command-line-tools-reference, /reference/networking, /tasks/run-application,
    github.com/kubernetes
```

### workloads/controllers

```
21  /concepts/workloads/controllers
1   /concepts/overview, /reference/command-line-tools-reference, /reference/kubectl,
    /reference/kubernetes-api, /tasks/job, /tasks/manage-daemon
```

### network/network-foundations

```
7   /concepts/services-networking
6   /reference/networking
4   /concepts/cluster-administration
3   github.com/kubernetes
2   /reference/command-line-tools-reference
1   /concepts/architecture, /concepts/workloads, /reference/config-api, /reference/kubernetes-api,
    /tasks/administer-cluster, /tasks/network, docs.cilium.io, ebpf.io,
    github.com/containernetworking, man7.org, netfilter.org, wiki.nftables.org
```

### network/pod-networking

```
5   cni.dev
4   /concepts/workloads
3   /concepts/services-networking, datatracker.ietf.org
2   docs.tigera.io, github.com/containernetworking
1   /concepts/extend-kubernetes, /tasks/administer-cluster, /tasks/configure-pod-container,
    /tutorials/services, github.com/flannel-io, kubernetes.io/blog
```

### network/services-endpoints

```
11  /concepts/services-networking
6   /reference/networking
2   /concepts/workloads
1   /reference/kubernetes-api, /tasks/debug
```

### network/external-traffic

```
8   /concepts/services-networking
6   gateway-api.sigs.k8s.io
3   metallb.io
2   /reference/networking, /tutorials/services
1   /reference/kubernetes-api, /tasks/access-application-cluster, developer.mozilla.org,
    haproxy.org, kubernetes.github.io, rfc-editor.org
```

### network/dns-service-discovery

```
11  /concepts/services-networking
5   /tasks/administer-cluster
4   coredns.io
1   /concepts/workloads, /reference/config-api, /reference/kubernetes-api, github.com/kubernetes,
    github.com/kubernetes-sigs
```

### storage/volume-foundations

```
19  /concepts/storage
3   /concepts/configuration, /concepts/security
2   /tasks/configure-pod-container
1   /concepts/architecture, /concepts/containers, /concepts/scheduling-eviction,
    /concepts/workloads, /reference/kubectl, /tasks/inject-data-application,
    docs.kernel.org/filesystems
```

### storage/volumes-claims

```
24  /concepts/storage
1   /concepts/overview, /reference/access-authn-authz, /reference/kubernetes-api,
    /tasks/administer-cluster, kubernetes-csi.github.io
```

### storage/csi-mount-path

```
10  kubernetes-csi.github.io
8   /concepts/storage
3   /reference/kubernetes-api
2   /tasks/configure-pod-container
1   /concepts/cluster-administration, /concepts/workloads, docs.kernel.org/filesystems,
    github.com/container-storage-interface, man7.org, secrets-store-csi-driver.sigs.k8s.io
```

### storage/stateful-data

```
9   /concepts/storage
4   /concepts/workloads
2   kubernetes-csi.github.io
1   /concepts/architecture
```


## How the map is read

`gaps.mjs` fetches each `/docs/` tree, takes the pages the index lists as its own children, and
marks each `COVERED` (a card here is named after it), `PARTIAL` (cited or mentioned inside a card
about something else) or `ABSENT`, with the feature stage off each page's banner. How to read
those verdicts, and where they mislead, is `SKILL.md` G3 and Appendix B.

## The declined ledger

It fills from below, one row per proposal the user turns down. `gaps.mjs` drops matching topics and
reports them under `DECLINED AND FILTERED OUT` with the reason. The skill never writes here: the
user pastes the rows the report prints.

| Column | What the tool does with it |
|---|---|
| `Section` | `<category>/<section>`, the bare section key, or `*` for every section |
| `Topic` | matched by words against the page title and slug: `volume snapshot` catches `Volume Snapshots` |
| `Upstream page` | the `/docs/...` path, matched exactly and beating the words. `-` when the topic is not one page |
| `Declined on` | free text for the reader, not matched |
| `Why` | one line, printed beside the filtered row |

| Section | Topic | Upstream page | Declined on | Why |
|---|---|---|---|---|
| | | | | |
