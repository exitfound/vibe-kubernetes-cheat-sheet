import { P, F, defineCard, midX, BEAT } from './network-kit.js';

// Design notes for this card: ./CARDS/network-dns-pod-policy.md


// One Node frame across the canvas under the panel, the API server over it right of the panel wall.
// NODE_Y is measured: the frame and the resolvConf file box open left of the panel, so L-03 puts
// the frame top under the deepest panel reading, 219.69 at 1100x800, with 40 to spare for its label.
const NODE_Y = 260;
const NODE_X = 40, NODE_W = 1120, NODE_H = 310;
const BOX_W = 232, BOX_H = 80, POD_H = 104;          // NET.L-01

// Row A inside the frame: the resolvConf file, the Kubelet, the Pod, on one centre line.
const ROW_CY = NODE_Y + 80;                          // 340
const ROW_Y = ROW_CY - BOX_H / 2;                    // 300
const HOST_X = NODE_X + 20;                          // 60: 20 inside the frame, as the Pod is
const KUBELET_X = 484;
const KUBELET_CX = KUBELET_X + BOX_W / 2;            // 600: the watch lane drops onto this x
const POD_X = NODE_X + NODE_W - 20 - BOX_W, POD_Y = ROW_CY - POD_H / 2;   // 908, 288

// Over the frame: the API server centred on the Kubelet, the five Pod spec fields beside it.
const API_Y = 60;
const SPEC_X = 740, SPEC_W = 400, CHIP_H = 32;
const SPEC_Y = [44, 84, 124, 164, 204];               // 40 apart, the last 24 above the frame top
// 400 and not 232: `dnsConfig.nameservers | 192.0.2.1 192.0.2.2 192.0.2.3` is the widest row.

// Row B: the two files line for line. The Node file under its box, the Pod file under the Kubelet
// and the Pod, 656 wide because the merged search line on `merge` measures 551.3 at 1600x1000.
const FILE_Y = [NODE_Y + 172, NODE_Y + 212, NODE_Y + 252];   // 432 472 512
const POD_FILE_X = KUBELET_X, POD_FILE_W = POD_X + BOX_W - KUBELET_X;   // 484, 656

// Every lane is ONE array feeding the wire and the ball (A-02). The watch ball stops on the frame
// face (NET.A-02, A-21), and the two lanes inside the frame join block face midpoints.
const WATCH = [[KUBELET_CX, API_Y + BOX_H], [KUBELET_CX, NODE_Y]];
const HOST = [[HOST_X + BOX_W, ROW_CY], [KUBELET_X, ROW_CY]];
const CRI = [[KUBELET_X + BOX_W, ROW_CY], [POD_X, ROW_CY]];
const HOST_MID = midX(HOST[0][0], HOST[1][0]);       // 388
const CRI_MID = midX(CRI[0][0], CRI[1][0]);          // 812

const LINES = ['nameserver', 'search', 'options'];
const NODE_KEYS = ['nodeNS', 'nodeSearch', 'nodeOpts'];
const POD_KEYS = ['podNS', 'podSearch', 'podOpts'];
const SPEC_KEYS = ['policyChip', 'hostNetChip', 'nsChip', 'searchChip', 'optsChip'];
const SPEC_NAMES = ['dnsPolicy', 'hostNetwork', 'dnsConfig.nameservers', 'dnsConfig.searches', 'dnsConfig.options'];

// The file the Kubelet resolvConf setting names on this Node. It never changes on the card.
const NODE_FILE = { nodeNS: '10.0.0.2', nodeSearch: 'corp.internal', nodeOpts: 'timeout:2' };
const NOT_WRITTEN = 'not written';
const EMPTY_POD = { podNS: NOT_WRITTEN, podSearch: NOT_WRITTEN, podOpts: NOT_WRITTEN };

// The list order IS the append order, which is the z-order: frame, blocks, lanes and their labels,
// tags, chips, then the packet layer.
export const SCENE = {
  'aria-label': 'Pod dnsPolicy and dnsConfig: the Kubelet builds each Pod DNS configuration from its own clusterDNS and clusterDomain settings, the resolver file its resolvConf setting names, and the Pod spec it receives from its API watch. ClusterFirst, the default when dnsPolicy is unset, uses the cluster nameserver, three cluster search domains followed by the Node ones, and only ndots:5. Default copies the Node file. A hostNetwork Pod left on ClusterFirst falls back to Default, and ClusterFirstWithHostNet restores the cluster file. None uses dnsConfig alone. dnsConfig merges on top: nameservers are appended and cut to three, duplicate search domains are removed, and an option with the same name replaces the base one',
  parts: [
    P.defs(),
    P.node({ key: 'node', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node' }),
    P.box({ key: 'api', x: KUBELET_X, y: API_Y, w: BOX_W, h: BOX_H, label: 'API', sublabel: 'Pod web spec' }),
    P.box({ key: 'hostFile', x: HOST_X, y: ROW_Y, w: BOX_W, h: BOX_H, label: 'resolvConf file', sublabel: '/etc/resolv.conf by default' }),
    P.box({ key: 'kubelet', x: KUBELET_X, y: ROW_Y, w: BOX_W, h: BOX_H, label: 'Kubelet', sublabel: 'clusterDNS 10.96.0.10' }),
    P.pod({
      key: 'pod', innerKey: 'podBox', x: POD_X, y: POD_Y, w: BOX_W, h: POD_H,
      label: 'Pod web', sublabel: 'namespace default',
      inner: { dx: 20, dy: 34, w: BOX_W - 40, h: 44, label: 'app', sublabel: 'reads /etc/resolv.conf' },
    }),
    P.arrow({ from: WATCH[0], to: WATCH[1], dashed: true, dim: true }),
    P.arrow({ from: HOST[0], to: HOST[1], dashed: true, dim: true }),
    P.arrow({ from: CRI[0], to: CRI[1], dashed: true, dim: true }),
    P.wire({ key: 'watch', x: KUBELET_CX + 12, y: midX(WATCH[0][1], WATCH[1][1]) + 4, anchor: 'start' }),
    P.wire({ key: 'host', x: HOST_MID, y: ROW_CY - 12 }),
    P.wire({ key: 'cri', x: CRI_MID, y: ROW_CY - 12 }),
    P.tag({ x: POD_FILE_X + POD_FILE_W / 2, y: FILE_Y[0] - 12, text: '/etc/resolv.conf in the Pod' }),
    ...SPEC_KEYS.map((key, i) => P.chip({ key, x: SPEC_X, y: SPEC_Y[i], w: SPEC_W, h: CHIP_H, name: SPEC_NAMES[i], value: 'unset' })),
    ...NODE_KEYS.map((key, i) => P.chip({ key, x: HOST_X, y: FILE_Y[i], w: BOX_W, h: CHIP_H, name: LINES[i], value: NODE_FILE[key] })),
    ...POD_KEYS.map((key, i) => P.chip({ key, x: POD_FILE_X, y: FILE_Y[i], w: POD_FILE_W, h: CHIP_H, name: LINES[i], value: NOT_WRITTEN })),
    P.packets(),
  ],
  reset: {
    keys: ['api', 'hostFile', 'kubelet', 'podBox', ...SPEC_KEYS, ...NODE_KEYS, ...POD_KEYS],
    pods: ['pod'],
  },
};

// One Pod through the Kubelet. The API server acts first and is the only block lit at entry (M-18a).
// The watch ball stops on the frame face (NET.A-02) and lands on no block, so the sender of the next
// hop is cued by the `lights` of that arrival instead: the file box on a reading step, the Kubelet on
// `none`. Nothing inside the frame may glow while the watch ball is still falling towards it. The
// file ball then lights the Kubelet mid-chain.
const build = ({ read = [], changed, spec, file }) => {
  const readsHost = read.length > 0;
  return [
    F.segment({
      from: WATCH[0], to: WATCH[1], delay: BEAT.lead, name: 'w',
      lights: readsHost ? ['hostFile', ...read] : ['kubelet'],
    }),
    F.set({ chips: spec, lit: changed, at: 'w' }),
    ...(readsHost ? [F.segment({ from: HOST[0], to: HOST[1], after: 'w', name: 'h', lights: ['kubelet'] })] : []),
    F.segment({ from: CRI[0], to: CRI[1], after: readsHost ? 'h' : 'w', name: 'c' }),
    F.pulse({ pod: 'pod', at: 'c' }),
    F.set({ chips: file, lit: POD_KEYS, at: 'c' }),
  ];
};

// Every step states every chip (P-01): the spec as it arrives, the Node file, the Pod file. `prev`
// is the spec of the Pod before, which is what the spec chips show until the watch ball lands.
const stepOf = ({ id, duration, narration, prev, spec, host, read = [], file }) => {
  const changed = SPEC_KEYS.filter((k) => spec[k] !== prev[k]);
  return {
    id,
    duration,
    narration,
    chips: { ...spec, ...NODE_FILE, ...file },
    wires: { watch: 'watch', host, cri: 'CRI DNSConfig' },
    lit: ['api'],
    reducedLit: ['podBox', ...POD_KEYS, ...changed],
    rewind: { chips: { ...prev, ...EMPTY_POD } },
    flow: build({ read, changed, spec, file }),
  };
};

const CLUSTER_SEARCH = 'default.svc.cluster.local svc.cluster.local cluster.local corp.internal';
const CLUSTER_FILE = { podNS: '10.96.0.10', podSearch: CLUSTER_SEARCH, podOpts: 'ndots:5' };
const NODE_COPY = { podNS: NODE_FILE.nodeNS, podSearch: NODE_FILE.nodeSearch, podOpts: NODE_FILE.nodeOpts };
// One dnsConfig search list and option list on both `none` and `merge`: svc.cluster.local repeats a
// cluster search domain, so the merge drops it, and ndots:2 shares its name with ndots:5.
const DC_SEARCH = 'svc.cluster.local lab.test', DC_OPTS = 'ndots:2 edns0';
const spec = (policy, hostNet, ns = 'unset', search = 'unset', opts = 'unset') =>
  ({ policyChip: policy, hostNetChip: hostNet, nsChip: ns, searchChip: search, optsChip: opts });
const IDLE = spec('unset', 'false');
const S_CLUSTER = spec('ClusterFirst', 'false');
const S_DEFAULT = spec('Default', 'false');
const S_HOSTNET = spec('ClusterFirst', 'true');
const S_WITHHOST = spec('ClusterFirstWithHostNet', 'true');
const S_NONE = spec('None', 'false', '192.0.2.1', DC_SEARCH, DC_OPTS);
const S_MERGE = spec('ClusterFirst', 'false', '192.0.2.1 192.0.2.2 192.0.2.3', DC_SEARCH, DC_OPTS);

// A reading step runs to 4000: three hops at the 700 floor land the CRI ball at 3100 and the Pod pulse
// ends 900 later. `none` skips the file hop, 3200. Each step then holds 1300, the catalog median.
export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ...IDLE, ...NODE_FILE, ...EMPTY_POD },
    wires: { watch: '', host: '', cri: '' },
  },
  stepOf({
    id: 'clusterfirst',
    duration: 5300,
    narration: 'The Kubelet receives Pod web from its API watch with dnsPolicy unset, which the API server defaults to ClusterFirst, not Default. The nameserver is the Kubelet clusterDNS, three cluster search domains come before the Node ones, and the Node options are dropped for ndots:5.',
    prev: IDLE,
    spec: S_CLUSTER,
    host: 'search only',
    read: ['nodeSearch'],
    file: CLUSTER_FILE,
  }),
  stepOf({
    id: 'default',
    duration: 5300,
    narration: 'With dnsPolicy Default the Kubelet copies the nameserver, search and options lines of the file its resolvConf setting names, /etc/resolv.conf by default. On systemd-resolved hosts it should name /run/systemd/resolve/resolv.conf, since the stub file can cause a forwarding loop.',
    prev: S_CLUSTER,
    spec: S_DEFAULT,
    host: 'whole file',
    read: NODE_KEYS,
    file: NODE_COPY,
  }),
  stepOf({
    id: 'hostnet',
    duration: 5300,
    narration: 'A Pod with hostNetwork true shares the network namespace of the Node. Left on ClusterFirst it quietly falls back to Default, so it gets the Node file, and cluster names resolve only if the Node resolver forwards the cluster domain to cluster DNS.',
    prev: S_DEFAULT,
    spec: S_HOSTNET,
    host: 'whole file',
    read: NODE_KEYS,
    file: NODE_COPY,
  }),
  stepOf({
    id: 'withhostnet',
    duration: 5300,
    narration: 'Setting dnsPolicy ClusterFirstWithHostNet is how a host network Pod gets the cluster file back: the cluster nameserver, the cluster search domains before the Node ones, and ndots:5, exactly as for a ClusterFirst Pod. Windows Nodes do not support this policy.',
    prev: S_HOSTNET,
    spec: S_WITHHOST,
    host: 'search only',
    read: ['nodeSearch'],
    file: CLUSTER_FILE,
  }),
  stepOf({
    id: 'none',
    duration: 4500,
    narration: 'With dnsPolicy None the Kubelet starts from an empty configuration and uses neither the Node file nor its cluster settings. Everything comes from dnsConfig, which must then list at least one nameserver, and its searches and options are written as given, minus duplicates.',
    prev: S_WITHHOST,
    spec: S_NONE,
    host: 'not used',
    file: { podNS: '192.0.2.1', podSearch: DC_SEARCH, podOpts: DC_OPTS },
  }),
  stepOf({
    id: 'merge',
    duration: 5300,
    narration: 'On the other policies dnsConfig merges on top. Its three nameservers are appended to the ClusterFirst one and then cut to the first 3, so 192.0.2.3 is dropped. Its searches are appended minus duplicates, so only lab.test is new, and ndots:2 replaces ndots:5 by name while edns0 is added.',
    prev: S_NONE,
    spec: S_MERGE,
    host: 'search only',
    read: ['nodeSearch'],
    file: { podNS: '10.96.0.10 192.0.2.1 192.0.2.2', podSearch: `${CLUSTER_SEARCH} lab.test`, podOpts: DC_OPTS },
  }),
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
