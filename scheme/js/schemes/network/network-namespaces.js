import { P, F, defineCard, BEAT } from './network-kit.js';
import { rect } from '../../lib/svg.js';
import { podShell } from '../../lib/primitives.js';

// Design notes for this card: ./CARDS/network-namespaces.md

// One derived column: slabs, band, shell and tenants are padded off each other, and HOST_Y derives
// from the shell so the host stands level with the Pod NETNS block and the cable lands on its left
// face midpoint. Re-typing the host y breaks the pairing.
const CX = 820;                            // Pod NETNS column centre: shell, band, slabs and the middle container centre here
const SLAB_W = 472;                        // a layer is a slab across the band, not an actor box
const SLAB_X = CX - SLAB_W / 2;
const SLAB_H = 44;
const SLAB_GAP = 8;
const SLAB_TOP = 312;                      // top of the ports slab, the first layer under the tenants
const slabY = (i) => SLAB_TOP + i * (SLAB_H + SLAB_GAP);

const BAND_PAD = 16;                       // band face to slab face
const SLAB_PAD = 24;                       // the extra inset the slabs take inside the band, left and right
const BAND_X = SLAB_X - SLAB_PAD;
const BAND_W = SLAB_W + 2 * SLAB_PAD;      // the stack band, and the width the tenants are sized across
const BAND_Y = SLAB_TOP - BAND_PAD;
const BAND_H = slabY(3) + SLAB_H + BAND_PAD - BAND_Y;

const IN_PAD = 40;                         // shell face to band face
const SHELL_X = BAND_X - IN_PAD;           // clear of the narration panel wall
const SHELL_W = BAND_W + 2 * IN_PAD;
const SHELL_Y = 91;
const SHELL_FOOT = 32;                     // band bottom to shell bottom: the room the shell sublabel prints in
const SHELL_H = BAND_Y + BAND_H + SHELL_FOOT - SHELL_Y;

const CROW_Y = SHELL_Y + 40;               // container row top, under the shell label and over the taps
const CROW_H = 56;
const CROW_BOT = CROW_Y + CROW_H;          // taps leave here, sized to whole `5 5` dash periods
const CTR_GAP = 20;
const CTR_W = (BAND_W - 2 * CTR_GAP) / 3;  // three tenants across the band width
const ctrX = (i) => BAND_X + i * (CTR_W + CTR_GAP);
const ctrCX = (i) => ctrX(i) + CTR_W / 2;

const HOST_W = 232;                        // NET.L-01: an actor outside the band takes the category width
const HOST_H = 80;                         // the catalog actor height, matching `network-flat-pod-network` Kubelet
const HOST_CY = SHELL_Y + SHELL_H / 2;     // the left face midpoint of the shell, and the height the cable runs at
const HOST_Y = HOST_CY - HOST_H / 2;       // the host block centres on the Pod NETNS block, not on a layer inside it
const VETH_LEN = 155;                      // whole `5 5` periods plus a closing dash, so both ends of the cable land on paint
const HOST_X = SHELL_X - VETH_LEN - HOST_W;
const HOST_EDGE = HOST_X + HOST_W;         // veth start

// Each array feeds BOTH the drawn line and its packet (A-02). The veth stops on the SHELL, because the
// namespace as a whole is what the cable joins. The taps stay interior: a container socket IS in this
// port space.
const VETH = [[HOST_EDGE, HOST_CY], [SHELL_X, HOST_CY]];         // host stack -> the namespace boundary
const TAP_APP = [[ctrCX(1), CROW_BOT], [ctrCX(1), SLAB_TOP]];    // app     -> the port layer
const TAP_SIDE = [[ctrCX(2), SLAB_TOP], [ctrCX(2), CROW_BOT]];   // the port layer -> sidecar
const TAP_PAUSE = [[ctrCX(0), CROW_BOT], [ctrCX(0), SLAB_TOP]];  // pause HOLDS the namespace: no ball rides this one

// The four layers, top to bottom as the stack really runs. Every step states all four (P-01).
const SLABS = (ports, rules, routes, iface) => ({
  slabPorts: ports, slabRules: rules, slabRoutes: routes, slabIface: iface,
});
const EMPTY = SLABS('all free', 'no rules', 'none', 'lo only');
const WIRED = SLABS('all free', 'no rules', 'default via eth0', 'lo + eth0');
const SHARED = SLABS('one shared space', 'no rules', 'default via eth0', 'lo + eth0');
const PRIVATE = SLABS('one shared space', 'own chains', 'default via eth0', 'lo + eth0');

// The netns shell and the stack band sit as plain siblings inside podGroup, and no part kind emits
// a lone podShell or a bare rect, so both are P.raw and hand their role to the primitive.
const netnsShell = () => podShell({ x: SHELL_X, y: SHELL_Y, w: SHELL_W, h: SHELL_H, label: 'Pod NETNS', sublabel: 'one private stack · 10.244.1.5', containers: 0, role: 'network' });
// `width`/`height`, not `w`/`h`: svg.js sets whatever key it is handed as an ATTRIBUTE, and an SVG
// rect with no width renders nothing, so a band given `w`/`h` is in the DOM and invisible.
const stackBand = () => rect({ class: 'netns-stack-band', x: BAND_X, y: BAND_Y, width: BAND_W, height: BAND_H, rx: 10,
  style: 'fill:rgba(79,229,255,0.035);stroke:rgba(79,229,255,0.28);stroke-width:1' });

// Z-order: host stack, then the pod group (shell, band, taps, then the boxes over them), then the
// veth cable and the wire labels, then the packet layer on top.
export const SCENE = {
  'aria-label': 'Network namespaces: the pause container opens one network namespace and holds it for the life of the Pod, the namespace is drawn as a stack of four layers with its own ports, packet rules, routing table and interfaces, every container in the Pod joins that same stack instead of getting one of its own, and on the usual plugins a single veth pair is the one link between it and the host namespace',
  parts: [
    P.defs(),
    P.box({ key: 'host', x: HOST_X, y: HOST_Y, w: HOST_W, h: HOST_H, label: 'Host NETNS', sublabel: 'ports · iptables · routes · NICs' }),
    P.group({
      key: 'podGroup',
      parts: [
        P.raw({ make: netnsShell }),
        P.raw({ make: stackBand }),
        // pause holds the namespace open and nothing travels this line, so it is a relation (A-06).
        P.relation({ key: 'tapPause', points: TAP_PAUSE }),
        P.arrow({ key: 'tapApp', from: TAP_APP[0], to: TAP_APP[1], dashed: true, dim: true }),
        P.arrow({ key: 'tapSide', from: TAP_SIDE[0], to: TAP_SIDE[1], dashed: true, dim: true }),
        // The value of each layer is its sublabel. `iptables` keeps its lowercase because it IS the
        // program name (T-09).
        P.box({ key: 'slabPorts', x: SLAB_X, y: slabY(0), w: SLAB_W, h: SLAB_H, label: 'Ports', sublabel: 'one shared space' }),
        P.box({ key: 'slabRules', x: SLAB_X, y: slabY(1), w: SLAB_W, h: SLAB_H, label: 'iptables', sublabel: 'own chains' }),
        P.box({ key: 'slabRoutes', x: SLAB_X, y: slabY(2), w: SLAB_W, h: SLAB_H, label: 'Routes', sublabel: 'default via eth0' }),
        P.box({ key: 'slabIface', x: SLAB_X, y: slabY(3), w: SLAB_W, h: SLAB_H, label: 'Interfaces', sublabel: 'lo + eth0' }),
        // The tenants drawn inside the Pod go INSIDE its group, so the pulse reaches them: a Pod
        // blinks as one thing and everything drawn inside it blinks with it (M-03).
        P.box({ key: 'pause', x: ctrX(0), y: CROW_Y, w: CTR_W, h: CROW_H, label: 'pause', sublabel: 'netns owner' }),
        P.box({ key: 'app', x: ctrX(1), y: CROW_Y, w: CTR_W, h: CROW_H, label: 'app', sublabel: 'container' }),
        P.box({ key: 'side', x: ctrX(2), y: CROW_Y, w: CTR_W, h: CROW_H, label: 'sidecar', sublabel: 'container' }),
      ],
    }),
    // A ball rides this cable, so A-06 makes it an arrow, its head pointing into the Pod NETNS block.
    P.arrow({ key: 'vethWire', from: VETH[0], to: VETH[1], dashed: true, dim: true }),
    P.wire({ key: 'veth', x: (HOST_EDGE + SHELL_X) / 2, y: HOST_CY - 12 }),
    P.wire({ key: 'local', x: (ctrCX(1) + ctrCX(2)) / 2, y: BAND_Y - 12 }),
    P.packets(),
  ],
  reset: {
    keys: ['host', 'pause', 'app', 'side', 'slabPorts', 'slabRules', 'slabRoutes', 'slabIface'],
    pods: ['podGroup'],
  },
};

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    // The poster states the values the card STARTS on, because it previews the text of `open` (D-14).
    sublabels: EMPTY,
  },
  {
    id: 'open',
    duration: 3100,
    narration: 'When the Pod sandbox starts, the pause container opens a brand new network namespace and holds it for the life of the Pod, and only a Pod that sets hostNetwork goes without one. The stack inside is empty: one loopback device, no routes, no rules and every port still free. Nothing reaches in or out yet.',
    sublabels: EMPTY,
    // The one beat is the pair that lights: pause holding the namespace open and the loopback. No pod
    // pulse, because nothing arrives and nothing travels (M-27).
    lit: ['pause', 'slabIface'],
  },
  {
    id: 'door',
    duration: 3400,
    narration: 'The CNI plugin then joins the namespace to the outside with a veth pair, and the in-Pod end of that pair appears in this stack as eth0. A default route is written through it, so that one cable becomes the path between the Pod and everything outside it. Plugins that hand the Pod a second device are the exception.',
    // S-13: the static block states the END. Neither value exists until the ball lands, so both are
    // wound back to what `open` left before the flow runs.
    sublabels: WIRED,
    rewind: { sublabels: { slabRoutes: 'none', slabIface: 'lo only' } },
    wires: { veth: 'veth pair' },
    // The host lights before the ball leaves (M-18a). It lands on the shell, so the whole namespace
    // pulses, then the two layers the cable brought turn over and light.
    lit: ['host'],
    flow: [
      F.segment({ from: VETH[0], to: VETH[1], name: 'hop', delay: BEAT.lead, pulse: 'podGroup' }),
      F.set({ at: 'hop', plus: BEAT.afterPulse, lights: ['slabIface', 'slabRoutes'], sublabels: { slabRoutes: 'default via eth0', slabIface: 'lo + eth0' } }),
    ],
  },
  {
    id: 'join',
    duration: 3000,
    narration: 'A second container does not get a stack of its own, it enters this one. Both of them sit on the same four layers, which is why a second eth0 and a second set of ports never appear, and why each of them reaches the other over the loopback without leaving the Pod.',
    sublabels: SHARED,
    rewind: { sublabels: { slabPorts: 'all free' } },
    wires: { local: 'localhost' },
    lit: ['app'],
    // The hop enters the stack at the app tap and leaves it at the sidecar tap: the ball fades at
    // the band face and re-emerges at the far tap (NET.A-01), and the port layer it passed through
    // lights and turns over between the two.
    flow: [
      F.segment({ from: TAP_APP[0], to: TAP_APP[1], name: 'down', delay: BEAT.lead, lights: ['slabPorts'] }),
      F.set({ at: 'down', sublabels: { slabPorts: 'one shared space' } }),
      F.segment({ from: TAP_SIDE[0], to: TAP_SIDE[1], after: 'down', lights: ['side'] }),
    ],
  },
  {
    id: 'private',
    duration: 3000,
    narration: 'Because the stack is a copy rather than a window, the routing table and the packet rules inside it belong to this Pod alone, and a port bound in here does not collide with the Node. Delete the Pod and the runtime calls CNI DEL to release the address and remove the veth, and the namespace goes with it.',
    sublabels: PRIVATE,
    // S-13 again: the static block states the END. `own chains` is the fourth layer's turn and it
    // is the only one no ball produces, so it waits on the pulse instead of standing at t=0.
    rewind: { sublabels: { slabRules: 'no rules' } },
    wires: { veth: 'veth pair' },
    // The cable still joins the two stacks here, so the host stays lit and the cable bright: this
    // is the contrast the step is about, pod-private against the Node it sits on.
    lit: ['host', 'slabRules', 'slabRoutes', 'slabPorts'],
    // No new traffic. The whole namespace pulses as the unit that lives and dies as one.
    flow: [
      F.pulse({ pod: 'podGroup' }),
      F.set({ delay: BEAT.afterPulse, sublabels: { slabRules: 'own chains' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
