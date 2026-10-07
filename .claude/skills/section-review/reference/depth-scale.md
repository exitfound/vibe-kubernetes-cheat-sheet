# The two axes

A rubric, not a rule: `scheme/CANON.md` says nothing about level or depth (`D-01` carries no such
key). It is calibrated against shipped cards so two runs put the same card in the same place. Where
a rating and this file disagree, say which is wrong.

**Depth** is where in the stack the subject sits. **Level** is how much the reader must already
know. They come apart in both directions:

- `network-netfilter-path` is **L5** at **middle**: PREROUTING and the nat table, asked as "why must
  DNAT run before routing", which anyone who has read an iptables rule can follow.
- `cluster-server-side-apply` is **L2** at **pre-senior**: a field on an object, assuming you have
  lost a fight between two controllers writing one Deployment.

## Depth, L1 to L5

| Band | The layer | Anchors |
|---|---|---|
| L1 | the operator surface: what you type and what comes back | `cluster-architecture`, `network-flat-pod-network`, `storage-where-volume-data-lives` |
| L2 | the object contract: fields, kinds, what the API promises | `storage-access-modes`, `workloads-pod-qos-classes`, `network-service-types` |
| L3 | the control loop: who watches what and reacts in which order | `cluster-scheduler-decision`, `workloads-replicaset`, `network-service-and-endpointslice` |
| L4 | the Node-side mechanism the loop finally drives | `cluster-pod-sandbox-cri`, `storage-attach-mount-chain`, `network-wiring-pod-via-cni` |
| L5 | the kernel and protocol floor under that mechanism | `network-netfilter-path`, `network-conntrack-nat`, `cluster-cpu-throttling` |

### L1, the operator surface

What a person does and what the cluster shows back. Components may be named and drawn, none is
opened: an L1 card is a map. `cluster-architecture` draws the components and opens none.
`storage-where-volume-data-lives` asks which volumes outlive the container, the Pod and the Node.

**Trap:** L1 is not "easy". A bad L1 card draws twelve boxes and says nothing about why they sit
where they do.

### L2, the object contract

A field, a kind, a mode, a class: what the API guarantees, readable from a manifest and a reference
page. `storage-access-modes` turns on the mode being per Node rather than per Pod.

**Trap:** an L2 card that never leaves the field reads as documentation. The good ones carry one
consequence a step further.

### L3, the control loop

Who watches, who reacts, in which order, and what happens between the write and the result. The
centre of mass this catalog is written for. The anchors are each a loop drawn as a loop.

**Trap:** almost anything can be told as a loop. Check the subject is the reaction, not the object
it reacts to (L2) or the thing it drives (L4).

### L4, the Node-side mechanism

The Kubelet, the runtime, the CSI driver, the CNI plugin, kube-proxy. The card follows the call
rather than the object.

**Trap:** naming the Kubelet is not L4. The test is whether the Kubelet is the subject or a box the
subject passes through.

### L5, the kernel and protocol floor

netfilter, conntrack, cgroups and CFS quota, raft and quorum, veth pairs and namespaces, tmpfs and
overlay: the layer Kubernetes is built on.

**Trap:** the band that most easily becomes unreadable. Every anchor opens on a question a middle
reader has already asked, then goes down to answer it. An L5 card that opens at the bottom has no
reader.

## Level, junior to pre-senior

Level is about the reader: what they must have met before the first sentence lands.

| Level | The reader | What it costs a section |
|---|---|---|
| junior | has run `kubectl apply`, knows a Pod from a Deployment, has not debugged one | the on-ramp. One or two per section, zero is a wall |
| middle | operates a cluster, reads events and logs, has hit CrashLoopBackOff | the bulk of the catalog |
| middle+ | has debugged something that was not in the error message | the target centre of mass |
| pre-senior | designs the cluster, reads upstream issues | the edges. A section whose median is here has lost its audience |

**Junior or middle:** is the opening question one the reader already had, or one you must convince
them to care about? "Two volumes, why does only one survive" is a junior question. "Two field
managers write one Deployment, who wins" is a pre-senior one.

## The section profile

A healthy section:

- **A way in.** At least one L1 or L2 card at junior or middle, near the front.
- **A centre.** The median at L3, or at L2 or L4 where the subject lives (`csi-mount-path` is an L4
  section by construction).
- **A floor, not a basement.** One or two cards a band below the centre. More and it has become a
  different section.
- **No hole.** Skipped bands (L2 straight to L5) mean the step a reader climbs on is missing: the
  strongest gap signal this rubric produces.

Two bad shapes, named in the report:

- **Top-heavy.** Every card L4 to L5. Correct, and no reader can start it.
- **Flat.** Every card L2. A reference page with animations.

## Rating one card

1. Read the `desc`. Its first sentence is the question the card answers and decides the band more
   often than anything else.
2. Read the middle steps, not the first: every first step sets a scene and looks shallow.
3. Look at `section.mjs`'s signature, a word count over a fixed vocabulary, right about two cards
   in three.
4. Where they disagree, the reading wins and the report says so in one line.
5. Rate level second and independently.
