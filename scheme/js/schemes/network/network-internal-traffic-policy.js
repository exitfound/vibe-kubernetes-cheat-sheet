import { P, F, defineCard, makeRidingLabel, shade, strip, BEAT, OPACITY } from './network-kit.js';

// Design notes for this card: ./CARDS/network-internal-traffic-policy.md


// Two peer Node frames mirrored about x=600, each holding the same row. The frame tops and the
// Service bus hang under the deepest panel, so every narration is held to eight lines at 1100x800.
const FRAME_W = 540, FRAME_GAP = 40;
const N1_X = 600 - FRAME_GAP / 2 - FRAME_W;    // 40
const N2_X = 600 + FRAME_GAP / 2;              // 620
const NODE_Y = 254, NODE_H = 254;
const NODE_BOTTOM = NODE_Y + NODE_H;           // 508

// One row per frame, sized BY the frame (NET.L-01 third clause): 14 + 140 + 38 + 156 + 38 + 140 + 14.
// kube-proxy stands above the Pods, so it is not in the row and takes 232, spanning client to agent.
const PAD = 14, POD_W = 140, HOP = 38, DP_W = 156, KP_W = 232;
const POD_H = 100, DP_H = 80, KP_H = 80, KP_Y = NODE_Y + 20;   // kube-proxy 274..354
const DP_Y = KP_Y + KP_H + 30;                 // 384, the relation gap: the Pod tops stand 20 under kube-proxy
const FLOW_Y = DP_Y + DP_H / 2;                // 424
const POD_Y = FLOW_Y - POD_H / 2;              // 374
const NOTE_Y = 494;                            // agent readiness note, between the Pod bottom and the frame bottom

// Everything in a row is an offset from its frame, so Node-2 is Node-1 moved 580 to the right.
const row = (nx) => {
  const client = nx + PAD;                     // 54 | 634
  const dp = client + POD_W + HOP;             // 232 | 812
  const agent = dp + DP_W + HOP;               // 426 | 1006
  return { client, dp, agent, dpCx: dp + DP_W / 2, agentCx: agent + POD_W / 2 };
};
const R1 = row(N1_X), R2 = row(N2_X);          // dpCx 310 | 890, agentCx 496 | 1076

// The Service sits over the gap between the frames, and its bus lands on each frame top above kube-proxy.
const SVC_W = 232, SVC_H = 80, SVC_Y = 112;
const SVC_X = 600 - SVC_W / 2;                 // 484
const BUS_Y = NODE_Y - 14;                     // 240

// Both cross legs use each frame bottom as an L-12 pair about the dataplane axis, out at -70 and in
// at +70, 8 inside the dataplane edges. Nested, 820..380 inside 240..960, so no vertical crosses a horizontal.
const TWIN = 70;
const INNER_Y = NODE_BOTTOM + 22, OUTER_Y = NODE_BOTTOM + 54;   // 530, 562
const CHIP_Y = 596, CHIP_H = 34;
const CHIPS = strip({ from: N1_X, to: N2_X + FRAME_W, count: 4, gap: 20 });   // 265 wide each

// Each static wire and the ball that rides it share the same points array.
const IN1 = [[R1.dp - HOP, FLOW_Y], [R1.dp, FLOW_Y]];
const IN2 = [[R2.dp - HOP, FLOW_Y], [R2.dp, FLOW_Y]];
const LOC1 = [[R1.dp + DP_W, FLOW_Y], [R1.agent, FLOW_Y]];
const LOC2 = [[R2.dp + DP_W, FLOW_Y], [R2.agent, FLOW_Y]];
// The DNAT happens inside the Node dataplane, so a cross leg re-emerges on the frame bottom UNDER it.
const X1 = [[R1.dpCx - TWIN, NODE_BOTTOM], [R1.dpCx - TWIN, OUTER_Y], [R2.dpCx + TWIN, OUTER_Y], [R2.dpCx + TWIN, NODE_BOTTOM]];
const X2 = [[R2.dpCx - TWIN, NODE_BOTTOM], [R2.dpCx - TWIN, INNER_Y], [R1.dpCx + TWIN, INNER_Y], [R1.dpCx + TWIN, NODE_BOTTOM]];
const BUS1 = [[600, SVC_Y + SVC_H], [600, BUS_Y], [R1.dpCx, BUS_Y], [R1.dpCx, NODE_Y]];
const BUS2 = [[600, SVC_Y + SVC_H], [600, BUS_Y], [R2.dpCx, BUS_Y], [R2.dpCx, NODE_Y]];

// The tag rides a cross-node ball from departure, below it and TWIN behind it, between the two verticals
// of each frame bottom. It is gone at the rise corner, since rising it would cross its own lane.
const innerLabel = makeRidingLabel({ role: 'network', inMs: 150, outMs: 170, hold: -332 });   // corner at 914 of 1076
const outerLabel = makeRidingLabel({ role: 'network', inMs: 150, outMs: 170, hold: -500 });   // corner at 1510 of 1840
const TAG_INNER = { fn: innerLabel, dx: TWIN };    // rides left, trails right
const TAG_OUTER = { fn: outerLabel, dx: -TWIN };   // rides right, trails left
const tag = (p) => F.tag({ dy: 18, ...p });

const CLIENT_INNER = { dx: 18, dy: 26, w: POD_W - 36, h: 44, label: 'app', sublabel: 'eth0' };
const AGENT_INNER = { dx: 18, dy: 26, w: POD_W - 36, h: 44, label: 'node-agent', sublabel: 'DaemonSet' };

const nodeRow = (n, r, ips) => [
  P.pod({
    key: `client${n}`, innerKey: `client${n}Box`, x: r.client, y: POD_Y, w: POD_W, h: POD_H,
    label: 'Client Pod', sublabel: ips[0], inner: CLIENT_INNER,
  }),
  P.box({ key: `kp${n}`, x: r.dpCx - KP_W / 2, y: KP_Y, w: KP_W, h: KP_H, label: 'kube-proxy', sublabel: 'writes rules' }),
  P.box({ key: `dp${n}`, x: r.dp, y: DP_Y, w: DP_W, h: DP_H, label: 'Node dataplane', sublabel: 'Service rules' }),
  P.pod({
    key: `agent${n}`, innerKey: `agent${n}Box`, x: r.agent, y: POD_Y, w: POD_W, h: POD_H,
    label: `agent-${n}`, sublabel: ips[1], inner: AGENT_INNER,
  }),
];

// The list order IS the append order, which is the z-order: the frames in back, the two rows, the
// Service, then wires, relations and notes, then chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'internalTrafficPolicy Cluster versus Local on a DaemonSet Service: two Nodes each run a client Pod and one node-agent Pod, and kube-proxy on each Node writes the Service rules its dataplane runs. With Cluster both agents are in both rule sets, so a call can be DNAT-ed to the agent on the other Node. With Local each Node keeps only its own agent and calls stay on their Node. When agent-2 is ready=false the Node-2 rules drop its call, although agent-1 on Node-1 is ready.',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: N1_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: N2_X, y: NODE_Y, w: FRAME_W, h: NODE_H, label: 'Node-2' }),
    ...nodeRow(1, R1, ['10.244.1.5', '10.244.1.9']),
    ...nodeRow(2, R2, ['10.244.2.5', '10.244.2.9']),
    P.box({ key: 'svc', x: SVC_X, y: SVC_Y, w: SVC_W, h: SVC_H, label: 'Service node-agent', sublabel: 'ClusterIP 10.96.0.30:80' }),
    P.arrow({ from: IN1[0], to: IN1[1], dashed: true, dim: true }),
    P.arrow({ from: IN2[0], to: IN2[1], dashed: true, dim: true }),
    P.arrow({ key: 'loc1', from: LOC1[0], to: LOC1[1], dashed: true, dim: true }),
    P.arrow({ key: 'loc2', from: LOC2[0], to: LOC2[1], dashed: true, dim: true }),
    P.lane({ key: 'x1', points: X1, dashed: true, dim: true }),
    P.lane({ key: 'x2', points: X2, dashed: true, dim: true }),
    // kube-proxy WRITES the rules its dataplane runs and never forwards a packet: no head, no ball.
    P.relation({ points: [[R1.dpCx, KP_Y + KP_H], [R1.dpCx, DP_Y]], dash: '5 5' }),
    P.relation({ points: [[R2.dpCx, KP_Y + KP_H], [R2.dpCx, DP_Y]], dash: '5 5' }),
    // Every kube-proxy reads the Service: the bus lands on each frame top above it.
    P.relation({ points: BUS1, dash: '5 5' }),
    P.relation({ points: BUS2, dash: '5 5' }),
    P.wire({ key: 'a1', x: R1.agentCx, y: NOTE_Y }),
    P.wire({ key: 'a2', x: R2.agentCx, y: NOTE_Y }),
    P.chip({ key: 'policyChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'internalTrafficPolicy', value: 'Cluster' }),
    P.chip({ key: 'rules1Chip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'Node-1 rules', value: 'agent-1 · agent-2' }),
    P.chip({ key: 'rules2Chip', x: CHIPS.x(2), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'Node-2 rules', value: 'agent-1 · agent-2' }),
    P.chip({ key: 'resultChip', x: CHIPS.x(3), y: CHIP_Y, w: CHIPS.w, h: CHIP_H, name: 'result', value: 'none' }),
    P.packets(),
  ],
  reset: {
    keys: ['svc', 'kp1', 'kp2', 'dp1', 'dp2', 'policyChip', 'rules1Chip', 'rules2Chip', 'resultChip',
      'client1Box', 'client2Box', 'agent1Box', 'agent2Box'],
    pods: ['client1', 'client2', 'agent1', 'agent2'],
  },
};

// What the rules on each Node hold, as ONE opacity field (A-16): an endpoint out of the rules dims
// from step entry, while every headed leg stays at full on every step.
const ALL_UP = { agent1: 1, agent2: 1, loc1: 1, loc2: 1, x1: 1, x2: 1 };
const stage = (out = []) => ({ opacity: { ...ALL_UP, ...shade(out, OPACITY.notready) } });
const BOTH = 'agent-1 · agent-2';

// One call from a client into its own Node dataplane, lighting it on arrival: the rules run there.
const call = (n, name, start = 0) => [
  F.pulse({ pod: `client${n}`, delay: start }),
  F.segment({ from: (n === 1 ? IN1 : IN2)[0], to: (n === 1 ? IN1 : IN2)[1], delay: start + BEAT.afterPulse, name, lights: [`dp${n}`] }),
];

// kube-proxy rewrites a rule set on this beat and the calls start only after it, so the rules
// visibly change before any ball leaves a client.
const RULES_MS = 300, CALL_MS = 600;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { policyChip: 'Cluster', rules1Chip: BOTH, rules2Chip: BOTH, resultChip: 'none' },
    wires: { a1: 'ready=true', a2: 'ready=true' },
    ...stage(),
  },
  {
    id: 'cluster',
    // Motion: both clients pulse, both balls reach their dataplane at 1500, the inner leg lands at
    // 2676 and the outer one at 3440, whose agent pulse ends at 4340.
    duration: 4800,
    narration: 'A DaemonSet runs one agent Pod per Node behind Service node-agent. With the default Cluster, kube-proxy on each Node writes both agents into its Service rules, so a call can be DNAT-ed to either one. Here both calls land on the agent of the other Node and cross the cluster network.',
    chips: { policyChip: 'Cluster', rules1Chip: BOTH, rules2Chip: BOTH, resultChip: 'crossed Nodes' },
    wires: { a1: 'ready=true', a2: 'ready=true' },
    ...stage(),
    lit: ['kp1', 'kp2', 'rules1Chip', 'rules2Chip'],
    // The animated path says both agents were served by PULSING them, which no lights list names.
    reducedLit: ['agent1Box', 'agent2Box'],
    rewind: { chips: { resultChip: 'none' } },
    flow: [
      ...call(1, 'in1'),
      ...call(2, 'in2'),
      F.route({ points: X2, after: 'in2', name: 'out2' }),
      tag({ text: 'dst 10.244.1.9:8080', points: X2, after: 'in2', ...TAG_INNER }),
      F.route({ points: X1, after: 'in1', name: 'out1' }),
      tag({ text: 'dst 10.244.2.9:8080', points: X1, after: 'in1', ...TAG_OUTER }),
      F.pulse({ pod: 'agent1', at: 'out2' }),
      F.pulse({ pod: 'agent2', at: 'out1' }),
      F.set({ at: 'out1', chips: { resultChip: 'crossed Nodes' } }),
      F.light({ targets: ['resultChip'], at: 'out1' }),
    ],
  },
  {
    id: 'local',
    // Motion: kube-proxy writes at 300, both balls reach their dataplane at 2100, the local legs land
    // at 2900 and the agent pulses end at 3800.
    duration: 4200,
    narration: 'Set internalTrafficPolicy to Local. On the next sync, kube-proxy on each Node rewrites its rules: Node-1 keeps only agent-1 and Node-2 only agent-2. The same call to the same ClusterIP now stays on its own Node. This lets a Pod reach the node-local agent of a DaemonSet, such as a log shipper or a metrics agent.',
    chips: { policyChip: 'Local', rules1Chip: 'agent-1', rules2Chip: 'agent-2', resultChip: 'stayed on its Node' },
    wires: { a1: 'ready=true', a2: 'ready=true' },
    ...stage(),
    lit: ['policyChip'],
    // The animated path says both agents were served by PULSING them, which no lights list names.
    reducedLit: ['agent1Box', 'agent2Box'],
    // The policy is the premise and stands from entry. Each rule set flips when its kube-proxy writes
    // it at RULES_MS, and the result reads none until the local legs land.
    rewind: { chips: { rules1Chip: BOTH, rules2Chip: BOTH, resultChip: 'none' } },
    flow: [
      F.light({ targets: ['kp1', 'kp2', 'rules1Chip', 'rules2Chip'], delay: RULES_MS }),
      F.set({ delay: RULES_MS, chips: { rules1Chip: 'agent-1', rules2Chip: 'agent-2' } }),
      ...call(1, 'in1', CALL_MS),
      ...call(2, 'in2', CALL_MS),
      F.segment({ from: LOC1[0], to: LOC1[1], after: 'in1', name: 'give1' }),
      F.segment({ from: LOC2[0], to: LOC2[1], after: 'in2', name: 'give2' }),
      F.pulse({ pod: 'agent1', at: 'give1' }),
      F.pulse({ pod: 'agent2', at: 'give2' }),
      F.set({ at: 'give1', chips: { resultChip: 'stayed on its Node' } }),
      F.light({ targets: ['resultChip'], at: 'give1' }),
    ],
  },
  {
    id: 'no-local-backend',
    // Motion: kube-proxy on Node-2 writes the DROP rule at 300, the Node-2 ball dies on its dataplane
    // at 2100. Nothing leaves it: the absent second hop is the whole point of the step.
    duration: 3300,
    narration: 'Local never falls back to another Node. Once agent-2 turns ready=false, kube-proxy on Node-2 writes a DROP rule for the ClusterIP, in the default iptables mode, so this call hangs until it times out though agent-1 is ready. Local suits a DaemonSet only while every Node with callers runs a ready agent.',
    chips: { policyChip: 'Local', rules1Chip: 'agent-1', rules2Chip: 'drop', resultChip: 'dropped on Node-2' },
    wires: { a1: 'ready=true', a2: 'ready=false' },
    // agent-2 is out of every rule set and dims from entry.
    ...stage(['agent2']),
    lit: ['policyChip'],
    rewind: { chips: { rules2Chip: 'agent-2', resultChip: 'none' } },
    flow: [
      F.light({ targets: ['kp2', 'rules2Chip'], delay: RULES_MS }),
      F.set({ delay: RULES_MS, chips: { rules2Chip: 'drop' } }),
      ...call(2, 'in2', CALL_MS),
      F.set({ at: 'in2', chips: { resultChip: 'dropped on Node-2' } }),
      F.light({ targets: ['resultChip'], at: 'in2' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
