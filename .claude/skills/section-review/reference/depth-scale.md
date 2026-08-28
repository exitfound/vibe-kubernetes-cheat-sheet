# The two axes

**This file holds no rules.** `scheme/CANON.md` is the rulebook and it says nothing at all about
level, depth or audience: `D-01` fixes the `SCHEMES` entry at eight keys and none of them is a
level. What follows is a rubric, calibrated against the cards that ship, so that two runs a
month apart put the same card in the same place. Where a rating and this file disagree, say which
one is wrong in the report.

The axes are **depth**, where in the stack the card's subject sits, and **level**, how much a
reader must already know to follow it. They come apart in both directions and a rubric with one
axis is wrong twice, which is the whole argument for carrying two. The worked pair:

- `network-netfilter-path` is **L5** and reads at **middle**. Its subject is PREROUTING and the nat
  table, which is as deep as this catalog goes, and its question is "why must DNAT run before
  routing", which anyone who has read an iptables rule can follow.
- `cluster-server-side-apply` is **L2** and demands **pre-senior**. Its subject is a field on an
  object, which is shallow, and it assumes you have already lost a fight between two controllers
  writing one Deployment.

---

## Depth, L1 to L5

| Band | The layer | Anchors that ship |
|---|---|---|
| L1 | the operator surface: what you type and what comes back | `cluster-architecture`, `network-model`, `storage-ephemeral-vs-persistent` |
| L2 | the object contract: fields, kinds, what the API promises | `storage-access-modes`, `workloads-pod-qos-classes`, `network-service-types` |
| L3 | the control loop: who watches what and reacts in which order | `cluster-scheduler-decision`, `workloads-replicaset`, `network-endpointslice-reconcile` |
| L4 | the Node-side mechanism the loop finally drives | `cluster-pod-sandbox-cri`, `storage-mount-path-chain`, `network-cni-invocation` |
| L5 | the kernel and protocol floor under that mechanism | `network-netfilter-path`, `network-conntrack-nat`, `cluster-cpu-throttling` |

### L1, the operator surface

**Sits at:** what a person does and what the cluster shows back. No component is opened. A
component may be NAMED and drawn as a box, which is what makes an L1 card a map rather than an
absence.

**Reads like:** "what are the moving parts, and how do they talk", "what does Kubernetes actually
promise", "these two volumes look the same and only one survives".

**Anchors:** `cluster-architecture` draws six components and opens none of them.
`storage-ephemeral-vs-persistent` puts two volumes side by side and asks which one you get to keep.

**The trap:** L1 is not "easy". It is the band with the widest picture, and a bad L1 card is the
one that draws twelve boxes and says nothing about why they are arranged that way.

### L2, the object contract

**Sits at:** a field, a kind, a mode, a class. The subject is what the API guarantees, and the
answer can be read out of a manifest and a reference page.

**Reads like:** "ReadWriteOnce sounds like one Pod, so why can two Pods share the volume", "which
Pods does Kubernetes sacrifice first", "four Service types, so how do they relate".

**Anchors:** `storage-access-modes` turns on the mode being per Node rather than per Pod.
`workloads-pod-qos-classes` is three classes derived from one block of a spec.

**The trap:** an L2 card that never leaves the field reads as documentation. The good ones all
carry one consequence a step further, which is usually why they earn a diagram at all.

### L3, the control loop

**Sits at:** who watches, who reacts, in which order, and what happens between the write and the
result. This is the CENTRE OF MASS this catalog is written for and most sections should sit here.

**Reads like:** "a new Pod has no Node yet, so how does Kubernetes decide", "how does it keep
exactly the right number alive", "how does a Service learn which Pods back it now".

**Anchors:** `cluster-scheduler-decision`, `workloads-replicaset`, `network-endpointslice-reconcile`.
All three are a loop drawn as a loop.

**The trap:** almost everything can be told as a control loop if you squint, so L3 is where a lazy
rating lands. Before writing L3, check that the card's subject really is the REACTION and not the
object it reacts to (L2) or the thing it drives (L4).

### L4, the Node-side mechanism

**Sits at:** the Kubelet, the runtime, the CSI driver, the CNI plugin, kube-proxy. Something on a
Node is being made to happen, and the card follows the call rather than the object.

**Reads like:** "what does the runtime actually DO when the Kubelet asks", "a container writes to
/data, but where do the bytes go", "who actually plumbs a Pod onto the network".

**Anchors:** `cluster-pod-sandbox-cri`, `storage-mount-path-chain`, `network-cni-invocation`.

**The trap:** naming the Kubelet is not being an L4 card. Half the catalog names the Kubelet. The
test is whether the Kubelet is the SUBJECT or a box the subject passes through.

### L5, the kernel and protocol floor

**Sits at:** netfilter, conntrack, cgroups and the CFS quota, raft and quorum, veth pairs and
network namespaces, tmpfs and overlay. The layer Kubernetes is BUILT ON rather than the layer it
is.

**Reads like:** "why must the DNAT run before routing", "a connection is more than one packet, so
how does NAT remember", "over its memory limit it dies, so why is it alive over its CPU limit".

**Anchors:** `network-netfilter-path`, `network-conntrack-nat`, `cluster-cpu-throttling`.

**The trap:** L5 is the band that most easily becomes unreadable, and the three anchors show the
only construction that works here. Every one of them opens on a question a middle reader has
already ASKED THEMSELVES, then goes down to answer it. An L5 card that opens at the bottom and
climbs has no reader.

---

## Level, junior to pre-senior

Level is a statement about the READER, not about the subject. Rate it by asking what a person has
to have already met before the first sentence lands.

| Level | The reader | What it costs a section |
|---|---|---|
| junior | has run `kubectl apply`, knows a Pod from a Deployment, has not debugged one | the on-ramp. One or two per section is right and zero is a wall |
| middle | operates a cluster, reads events and logs, has hit CrashLoopBackOff | the bulk of the catalog |
| middle+ | has debugged something that was not in the error message | the target centre of mass |
| pre-senior | designs the cluster rather than uses it, reads upstream issues | the edges. A section whose MEDIAN is here has lost its audience |

**The target this whole skill is calibrated to:** middle to middle-plus at the centre of mass, one
or two junior on-ramps per section, pre-senior at the edges only, and never a section whose median
demands pre-senior.

**How to tell junior from middle:** whether the card's opening question is one the reader has
already had, or one you have to convince them to care about. "Two volumes, why does only one
survive" is a question a junior has had. "Two field managers write the same Deployment, so who
wins" is one a pre-senior has had and nobody else.

---

## The section profile

A healthy section, read off the shape rather than any single card:

- **A way in.** At least one card at L1 or L2 sitting at junior or middle, and it should be near
  the front of the manifest order.
- **A centre.** The median at L3, or at L2 or L4 where the section's own subject genuinely lives:
  `csi-mount-path` is an L4 section by construction and that is not a defect.
- **A floor, not a basement.** One or two cards a band below the centre, so the section can answer
  "but why". Three or more and the section has become a different section.
- **No hole.** Bands that skip, L2 straight to L5, means the step a reader climbs on is missing.
  That is the strongest gap signal this rubric produces.

Two ways a profile goes bad, both worth naming in the report by name:

**Top-heavy.** Every card L4 to L5. The section is correct and has no reader, because the only
people who can start it are the people who did not need it.

**Flat.** Every card L2. The section is a reference page with animations. Nothing under any
abstraction is ever opened, so a reader finishes it able to recite fields and unable to debug.

---

## Rating one card

1. Read the `desc`, which is the reader's whole first contact and is 400 to 470 characters of the
   author's own summary. The FIRST SENTENCE is the question the card answers and it decides the
   band more often than anything else does.
2. Read the narration of the middle steps, not the first. The first step sets a scene and every
   card's first step looks shallow.
3. Look at `section.mjs`'s signature. It is a word count over a fixed vocabulary and it is right
   about two cards in three.
4. Where the two disagree, the reading wins and the report says so in one line. That disagreement
   is usually the most interesting row in the table, because it is either a card whose prose hides
   its depth or one whose prose promises a depth it does not deliver.
5. Rate the level SECOND and independently. A rating that always moves with the depth is a rating
   that only measured one thing.
