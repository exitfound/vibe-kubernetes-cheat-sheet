// bands.mjs: what section.mjs and overlap.mjs both read: the five-band layer vocabulary, the string walk and the source-path reader.
// The bands are a heuristic: a marker is a word a card of that depth tends to use, and a human rating wins over the signature.
// Some markers are phrases (`network namespace`, not `namespace`) because the bare word names a different layer.

// A marker matches case-insensitively on a word boundary, and a band counts DISTINCT markers,
// so a card repeating `Kubelet` eleven times scores that band 1.
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

// A trailing `.` marker (`spec.`) takes no word boundary after it, everything else takes both
// so `attach` does not fire inside `attachment`.
const rxOf = (t) => (t.endsWith('.')
  ? new RegExp(`(?<![\\w-])${esc(t)}`, 'gi')
  : new RegExp(`(?<![\\w-])${esc(t)}(?![\\w-])`, 'gi'));

const RX = Object.fromEntries(BAND_KEYS.map(k => [k, BANDS[k].markers.map(m => [m, rxOf(m)])]));

// Every string anywhere in a value, deduplicated by identity of the walk rather than of the text.
// Depth 8 matches fixtures/spec.mjs collectFns.
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

// The weighted centre of a signature, 1.0 to 5.0, or null when nothing fired.
// A summary, not a rating: report it beside the counts, never instead of them.
export function centre(sig) {
  const total = BAND_KEYS.reduce((n, k) => n + sig[k], 0);
  if (!total) return null;
  return BAND_KEYS.reduce((n, k, i) => n + sig[k] * (i + 1), 0) / total;
}

// A fixed-width bar for a band count, so a section profile reads as a shape rather than a column
// of digits. Caps at 12 so one busy card cannot flatten the rest of the histogram.
export const bar = (n, unit = '#') => unit.repeat(Math.min(n, 12));

// ---------------------------------------------------------------------------------------------
// A `sources[].href` as the shortest thing that still identifies the page: kubernetes.io comes off,
// any other host stays, so `https://etcd.io` never strips to the empty string.
export function sourcePath(href) {
  const s = String(href).replace(/\/$/, '');
  const m = s.match(/^https?:\/\/([^/]+)(\/.*)?$/);
  if (!m) return s;
  const [, host, path = ''] = m;
  if (host === 'kubernetes.io' || host === 'www.kubernetes.io') return path || '/';
  return host + path;
}

// ---------------------------------------------------------------------------------------------
// Dictionary terms that are scenery rather than a subject: diagram element names, umbrella words
// every card uses, and ambient protocols a card rides rather than teaches.
export const NOT_A_TOPIC = new Set([
  'Node-1', 'Node-2', 'Node-3', 'Node-a', 'Node-b',
  'Kubernetes', 'Linux', 'Node', 'Pod', 'API', 'Container', 'Volume', 'Controller', 'Service',
  'HTTP', 'HTTPS', 'TCP', 'UDP', 'IP', 'kubectl',
]);

