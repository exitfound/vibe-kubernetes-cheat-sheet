// bands.mjs: everything the two tools of this skill BOTH read. The five-band layer vocabulary, the
// string walk that feeds it, and the source-path reader. One copy of each, because two readers with
// two vocabularies would disagree about which card is deep and the disagreement would look like a
// finding, and because a path stripped two ways makes one page look like two.
//
// THE BANDS ARE A HEURISTIC AND THE HEADER OF EACH TOOL SAYS SO AGAIN. A marker is a word a card
// of that depth tends to use, not proof that the card sits there: `storage-ephemeral-vs-persistent`
// names the Kubelet without being a Kubelet card, and a card can teach the mount path without ever
// writing `mount`. The signature is EVIDENCE a human rates against, and where the two disagree the
// rating wins and says why.
//
// WHY THE MARKERS ARE PHRASES RATHER THAN WORDS in three places. `namespace` alone is the single
// worst marker available here: a Kubernetes Namespace is an L2 API object and a network namespace
// is an L5 kernel construct, and the catalog uses both heavily. So L5 asks for `network namespace`
// or `netns` and never the bare word. `mount` and `runtime` carry the same risk at lower cost.

// A marker is a literal matched case-insensitively on a word boundary. Order inside a band does
// not matter: what a band reports is how many DISTINCT markers of that band the card used, not how
// often it used any one of them, so a card repeating `Kubelet` eleven times scores that band 1.
export const BANDS = Object.freeze({
  L1: {
    label: 'operator surface',
    gloss: 'what you type and what comes back',
    markers: ['kubectl', 'kubectl apply', 'manifest', 'YAML', 'annotation', 'label selector',
      'helm', 'dashboard', 'you write', 'you run', 'kubectl describe', 'kubectl get'],
  },
  L2: {
    label: 'object contract',
    gloss: 'fields, kinds, and what the API promises',
    markers: ['spec.', 'status.', 'metadata.', 'field', 'defaults to', 'the default', 'API object',
      'resource', 'schema', 'validation', 'immutable', 'optional', 'required', 'apiVersion'],
  },
  L3: {
    label: 'control loop',
    gloss: 'who watches what, and reacts in which order',
    markers: ['controller', 'control loop', 'reconcile', 'watch', 'informer', 'Scheduler',
      'controller-manager', 'Lease', 'webhook', 'admission', 'ETCD', 'API server', 'desired state',
      'observed state', 'requeue', 'owner reference', 'finalizer'],
  },
  L4: {
    label: 'node mechanism',
    gloss: 'what the loop finally drives on a Node',
    markers: ['Kubelet', 'CRI', 'CNI', 'CSI', 'container runtime', 'containerd', 'sandbox',
      'kube-proxy', 'node agent', 'device plugin', 'mount', 'unmount', 'attach', 'detach',
      'cgroup', 'PLEG', 'image pull', 'NodeStageVolume', 'NodePublishVolume', 'subPath',
      'staging', 'kubelet directory'],
  },
  L5: {
    label: 'kernel and protocol floor',
    gloss: 'the machinery under the mechanism',
    markers: ['netfilter', 'conntrack', 'iptables', 'IPVS', 'eBPF', 'nftables', 'raft',
      'CFS', 'cfs_quota', 'veth', 'network namespace', 'netns', 'inode', 'bind mount', 'syscall',
      'kernel', 'page cache', 'SNAT', 'DNAT', 'checksum', 'MTU', 'quorum', 'tmpfs', 'overlayfs',
      'overlay filesystem', 'ext4', 'block device', 'chown', 'GID', 'UID', 'RSS', 'OOM killer'],
  },
});

export const BAND_KEYS = Object.freeze(Object.keys(BANDS));

const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A trailing `.` marker (`spec.`) must not demand a word boundary after it, or `spec.replicas`
// never matches. Everything else takes boundaries on both sides so `attach` does not fire inside
// `attachment` and `mount` does not fire inside `paramount`.
const rxOf = (t) => (t.endsWith('.')
  ? new RegExp(`(?<![\\w-])${esc(t)}`, 'gi')
  : new RegExp(`(?<![\\w-])${esc(t)}(?![\\w-])`, 'gi'));

const RX = Object.fromEntries(BAND_KEYS.map(k => [k, BANDS[k].markers.map(m => [m, rxOf(m)])]));

// Every string anywhere in a value, deduplicated by identity of the walk rather than of the text:
// a chip reading the same word on five steps is five occurrences and the caller may want that.
// Depth 8 matches fixtures/spec.mjs collectFns, which is the tree's own ceiling.
export function walkStrings(value, out = [], depth = 0) {
  if (depth > 8 || value === null || value === undefined) return out;
  if (typeof value === 'string') { out.push(value); return out; }
  if (typeof value !== 'object') return out;
  for (const v of Object.values(value)) walkStrings(v, out, depth + 1);
  return out;
}

// { L1: n, ... } where n is the count of DISTINCT markers of that band present in the text, plus
// `hits`, the markers themselves, so a finding can quote what fired rather than a bare number.
export function signature(text) {
  const out = { hits: {} };
  for (const k of BAND_KEYS) {
    const fired = RX[k].filter(([, rx]) => { rx.lastIndex = 0; return rx.test(text); }).map(([m]) => m);
    out[k] = fired.length;
    out.hits[k] = fired;
  }
  return out;
}

// The weighted centre of a signature, 1.0 to 5.0, or null when nothing fired. It is a summary of
// the evidence and not a rating: a card with one L1 marker and one L5 marker centres at 3.0 and
// belongs at neither end. Report it beside the counts, never instead of them.
export function centre(sig) {
  const total = BAND_KEYS.reduce((n, k) => n + sig[k], 0);
  if (!total) return null;
  return BAND_KEYS.reduce((n, k, i) => n + sig[k] * (i + 1), 0) / total;
}

// A fixed-width bar for a band count, so a section profile reads as a shape rather than a column
// of digits. Caps at 12 so one busy card cannot flatten the rest of the histogram.
export const bar = (n, unit = '#') => unit.repeat(Math.min(n, 12));

// ---------------------------------------------------------------------------------------------
// A `sources[].href` as the shortest thing that still identifies the page. kubernetes.io is the
// host on almost every source here, so its name carries no information and comes off; any OTHER
// host is the interesting half of the citation and stays. A naive strip of every scheme and host
// turns `https://etcd.io` into the empty string, and two of those read as one shared page.
export function sourcePath(href) {
  const s = String(href).replace(/\/$/, '');
  const m = s.match(/^https?:\/\/([^/]+)(\/.*)?$/);
  if (!m) return s;
  const [, host, path = ''] = m;
  if (host === 'kubernetes.io' || host === 'www.kubernetes.io') return path || '/';
  return host + path;
}

// ---------------------------------------------------------------------------------------------
// Terms from the project dictionary that are SCENERY rather than a subject a card could be about,
// so an implicit-topic sweep does not report the same four every run. Three kinds, and each is
// here for a stated reason rather than because it was noisy:
//   the element names the diagrams use for their own boxes (`Node-1`), which name nothing upstream
//   the umbrella words every card of every section uses (`Kubernetes`, `Pod`, `API`)
//   the ambient protocols a card rides rather than teaches (`HTTP`, `TCP`, `IP`)
// A term dropped here can still be a real gap: if a section genuinely needs a card about the API
// object model, this list is why the tool will not say so, and a human still can.
export const NOT_A_TOPIC = new Set([
  'Node-1', 'Node-2', 'Node-3', 'Node-a', 'Node-b',
  'Kubernetes', 'Linux', 'Node', 'Pod', 'API', 'Container', 'Volume', 'Controller', 'Service',
  'HTTP', 'HTTPS', 'TCP', 'UDP', 'IP', 'kubectl',
]);

