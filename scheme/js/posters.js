// ============================================================
//  Per-scheme card posters.
//  Each entry is an SVG foreground fragment inside a 320x180
//  viewBox. The wrapper in app.js sets the category-tinted
//  background gradient and a `color:` so children using
//  `currentColor` inherit the right hue.
// ============================================================

export const POSTERS = {
  // Two pods on the same node, bridged through cni0.
  'network-pod-to-pod-same-node': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="36"  y="50" width="76" height="80" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="208" y="50" width="76" height="80" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="136" y="76" width="48" height="28" rx="4"  fill="rgba(255,255,255,0.04)"/>
      <line x1="112" y1="90" x2="136" y2="90" stroke-dasharray="4 3"/>
      <line x1="184" y1="90" x2="208" y2="90" stroke-dasharray="4 3"/>
    </g>
    <circle cx="124" cy="90" r="3" fill="currentColor"/>
    <circle cx="196" cy="90" r="3" fill="currentColor"/>
  `,

  // Old ReplicaSet draining (left, fading top→down) + new ReplicaSet rising (right, fading bottom→up).
  'deployment-rolling-update': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40"  y="48"  width="40" height="22" rx="3" opacity="0.3"/>
      <rect x="40"  y="80"  width="40" height="22" rx="3" opacity="0.55"/>
      <rect x="40"  y="112" width="40" height="22" rx="3"/>
      <rect x="240" y="48"  width="40" height="22" rx="3"/>
      <rect x="240" y="80"  width="40" height="22" rx="3" opacity="0.55"/>
      <rect x="240" y="112" width="40" height="22" rx="3" opacity="0.3"/>
      <line x1="90" y1="91" x2="230" y2="91" stroke-dasharray="5 4"/>
    </g>
    <circle cx="222" cy="91" r="3.5" fill="currentColor"/>
  `,

  // Claim "document" on the left bound to a cylinder PV on the right.
  'volume-pvc-binding': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="50" width="74" height="80" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="56" y1="76"  x2="98" y2="76"/>
      <line x1="56" y1="92"  x2="98" y2="92"/>
      <line x1="56" y1="108" x2="84" y2="108"/>
      <line x1="118" y1="90" x2="194" y2="90" stroke-dasharray="5 4"/>
      <ellipse cx="240" cy="56" rx="40" ry="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="200" y1="56" x2="200" y2="124"/>
      <line x1="280" y1="56" x2="280" y2="124"/>
      <path d="M 200 124 A 40 8 0 0 0 280 124" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="240" cy="124" rx="40" ry="8" stroke-opacity="0.4"/>
    </g>
    <circle cx="186" cy="90" r="3.5" fill="currentColor"/>
  `,

  // Hub-and-spoke: apiserver in the centre, four control-plane satellites + worker box.
  'control-plane-architecture': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <circle cx="160" cy="90" r="22" fill="rgba(255,255,255,0.06)"/>
      <rect x="20"  y="68"  width="62" height="44" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="124" y="18"  width="72" height="36" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="124" y="126" width="72" height="36" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="238" y="68"  width="62" height="44" rx="5" fill="rgba(255,255,255,0.04)"/>
      <line x1="82"  y1="90"  x2="138" y2="90"  stroke-dasharray="4 3"/>
      <line x1="160" y1="54"  x2="160" y2="68"  stroke-dasharray="4 3"/>
      <line x1="160" y1="112" x2="160" y2="126" stroke-dasharray="4 3"/>
      <line x1="182" y1="90"  x2="238" y2="90"  stroke-dasharray="4 3"/>
    </g>
    <circle cx="160" cy="90" r="3.5" fill="currentColor"/>
  `,

  // Two nodes side-by-side: healthy heartbeat sparkline left, flatlining right.
  'control-node-failure': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32"  y="42" width="120" height="96" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="168" y="42" width="120" height="96" rx="8" fill="rgba(255,255,255,0.04)" opacity="0.5"/>
      <path d="M 42 90 L 60 90 L 66 76 L 72 104 L 78 82 L 86 98 L 96 90 L 142 90"/>
      <path d="M 178 90 L 220 90" stroke-dasharray="4 3"/>
      <path d="M 224 90 L 280 90" opacity="0.4"/>
    </g>
    <circle cx="42"  cy="90" r="3.5" fill="currentColor"/>
    <circle cx="222" cy="90" r="3"   fill="currentColor" opacity="0.6"/>
  `,

  // Three stacked URL bars representing GVR routes; event dots stream out of each.
  'control-api-structure': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="36" y="48"  width="160" height="22" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="36" y="80"  width="160" height="22" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="36" y="112" width="160" height="22" rx="3" fill="rgba(255,255,255,0.04)"/>
      <line x1="206" y1="59"  x2="240" y2="59"  stroke-dasharray="3 3"/>
      <line x1="206" y1="91"  x2="240" y2="91"  stroke-dasharray="3 3"/>
      <line x1="206" y1="123" x2="240" y2="123" stroke-dasharray="3 3"/>
    </g>
    <circle cx="252" cy="59"  r="2.5" fill="currentColor"/>
    <circle cx="262" cy="91"  r="2.5" fill="currentColor"/>
    <circle cx="272" cy="123" r="2.5" fill="currentColor"/>
    <circle cx="282" cy="60"  r="2"   fill="currentColor" opacity="0.7"/>
    <circle cx="290" cy="92"  r="2"   fill="currentColor" opacity="0.7"/>
    <circle cx="298" cy="123" r="2"   fill="currentColor" opacity="0.5"/>
  `,

  // Terminal (kubectl) → 2 pipeline boxes → Pod with container.
  'control-plane-apply-flow': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="68" width="62" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <polyline points="34 80 42 90 34 100" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="48" y1="100" x2="68" y2="100" stroke-linecap="round"/>
      <rect x="106" y="76" width="46" height="28" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="178" y="76" width="46" height="28" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="252" y="62" width="48" height="56" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="264" y="80" width="24" height="16" rx="2" fill="rgba(255,255,255,0.06)"/>
      <line x1="82"  y1="90" x2="106" y2="90" stroke-dasharray="3 3"/>
      <line x1="152" y1="90" x2="178" y2="90" stroke-dasharray="3 3"/>
      <line x1="224" y1="90" x2="252" y2="90" stroke-dasharray="3 3"/>
    </g>
    <circle cx="94"  cy="90" r="2.5" fill="currentColor"/>
    <circle cx="165" cy="90" r="2.5" fill="currentColor"/>
    <circle cx="238" cy="90" r="2.5" fill="currentColor"/>
  `,

  // Cascade Deployment → ReplicaSet → Pod, each successive box more faded;
  // last one is dashed with an "X" mark conveying terminal deletion.
  'control-plane-delete-flow': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30"  y="64" width="62" height="52" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="129" y="64" width="62" height="52" rx="6" fill="rgba(255,255,255,0.03)" opacity="0.65"/>
      <rect x="228" y="64" width="62" height="52" rx="6" stroke-dasharray="5 3" opacity="0.4"/>
      <line x1="92"  y1="90" x2="129" y2="90" stroke-dasharray="3 3"/>
      <line x1="191" y1="90" x2="228" y2="90" stroke-dasharray="3 3"/>
      <line x1="240" y1="76" x2="278" y2="104" opacity="0.55" stroke-linecap="round"/>
      <line x1="278" y1="76" x2="240" y2="104" opacity="0.55" stroke-linecap="round"/>
    </g>
    <circle cx="120" cy="90" r="2.5" fill="currentColor"/>
    <circle cx="219" cy="90" r="2.5" fill="currentColor" opacity="0.7"/>
  `,

  // Three etcd cylinders: leader (left, bright entry) replicates to two followers via dashed arrows.
  'control-etcd-raft': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <ellipse cx="60"  cy="58"  rx="30" ry="7" fill="rgba(255,255,255,0.06)"/>
      <line    x1="30"  y1="58"  x2="30"  y2="130"/>
      <line    x1="90"  y1="58"  x2="90"  y2="130"/>
      <path    d="M 30 130 A 30 7 0 0 0 90 130" fill="rgba(255,255,255,0.06)"/>
      <ellipse cx="60"  cy="130" rx="30" ry="7" stroke-opacity="0.35"/>
      <ellipse cx="160" cy="58"  rx="30" ry="7" fill="rgba(255,255,255,0.04)"/>
      <line    x1="130" y1="58"  x2="130" y2="130"/>
      <line    x1="190" y1="58"  x2="190" y2="130"/>
      <path    d="M 130 130 A 30 7 0 0 0 190 130" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="160" cy="130" rx="30" ry="7" stroke-opacity="0.35"/>
      <ellipse cx="260" cy="58"  rx="30" ry="7" fill="rgba(255,255,255,0.04)"/>
      <line    x1="230" y1="58"  x2="230" y2="130"/>
      <line    x1="290" y1="58"  x2="290" y2="130"/>
      <path    d="M 230 130 A 30 7 0 0 0 290 130" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="260" cy="130" rx="30" ry="7" stroke-opacity="0.35"/>
      <rect    x="36"   y="80"   width="48" height="14" rx="2" fill="rgba(255,255,255,0.2)"/>
      <line    x1="90"  y1="87"  x2="130" y2="87" stroke-dasharray="4 3"/>
      <path    d="M 60 50 Q 160 20 260 50" stroke-dasharray="4 3"/>
    </g>
    <circle cx="120" cy="87" r="3"   fill="currentColor"/>
    <circle cx="160" cy="22" r="2.5" fill="currentColor"/>
  `,

  // One pod scales out to a fan of three replicas.
  'scaling-hpa-cycle': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40"  y="74"  width="42" height="42" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="204" y="42"  width="42" height="38" rx="6" fill="rgba(255,255,255,0.04)" opacity="0.55"/>
      <rect x="226" y="80"  width="42" height="38" rx="6" fill="rgba(255,255,255,0.04)" opacity="0.85"/>
      <rect x="248" y="118" width="42" height="38" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="92" y1="95" x2="190" y2="95" stroke-dasharray="5 4"/>
    </g>
    <circle cx="184" cy="95" r="3.5" fill="currentColor"/>
  `,

  // Subject (head + shoulders) → role rules → resource with a check.
  'security-rbac-authorization': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <circle cx="56" cy="76" r="12" fill="rgba(255,255,255,0.04)"/>
      <path d="M 38 116 Q 56 92 74 116"/>
      <line x1="84" y1="100" x2="124" y2="100" stroke-dasharray="4 3"/>
      <rect x="130" y="74" width="60" height="52" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="138" y1="90"  x2="182" y2="90"/>
      <line x1="138" y1="104" x2="172" y2="104"/>
      <line x1="138" y1="116" x2="178" y2="116"/>
      <line x1="196" y1="100" x2="234" y2="100" stroke-dasharray="4 3"/>
      <rect x="240" y="74" width="56" height="52" rx="6" fill="rgba(255,255,255,0.04)"/>
      <path d="M 254 100 l 8 8 l 18 -18"/>
    </g>
    <circle cx="120" cy="100" r="3" fill="currentColor"/>
    <circle cx="230" cy="100" r="3" fill="currentColor"/>
  `,

  // State machine: Pending → Running → Succeeded / Failed branches.
  'lifecycle-pod-phase-machine': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="76"  width="68" height="28" rx="14" fill="rgba(255,255,255,0.04)"/>
      <rect x="126" y="76"  width="68" height="28" rx="14" fill="rgba(255,255,255,0.04)"/>
      <rect x="230" y="40"  width="68" height="28" rx="14" fill="rgba(255,255,255,0.04)"/>
      <rect x="230" y="112" width="68" height="28" rx="14" fill="rgba(255,255,255,0.04)"/>
      <line x1="90"  y1="90" x2="126" y2="90"  stroke-dasharray="4 3"/>
      <line x1="194" y1="84" x2="230" y2="58"  stroke-dasharray="4 3"/>
      <line x1="194" y1="96" x2="230" y2="122" stroke-dasharray="4 3"/>
    </g>
    <circle cx="120" cy="90"  r="2.5" fill="currentColor"/>
    <circle cx="226" cy="60"  r="2.5" fill="currentColor"/>
    <circle cx="226" cy="120" r="2.5" fill="currentColor"/>
  `,
};
