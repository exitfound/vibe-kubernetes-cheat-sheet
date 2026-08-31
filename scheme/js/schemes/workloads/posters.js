// Design notes: ./CARDS/<card-id>.md, under that card id as a "### poster" subsection.
// The workloads posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  'workloads-rolling-update': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32" y="36"  width="80" height="32" rx="5" fill="rgba(255,255,255,0.08)"/>
      <rect x="32" y="74"  width="80" height="32" rx="5" fill="rgba(255,255,255,0.04)" opacity="0.55"/>
      <rect x="32" y="112" width="80" height="32" rx="5" fill="rgba(255,255,255,0.02)" opacity="0.3"/>
      <rect x="208" y="36"  width="80" height="32" rx="5" fill="rgba(255,255,255,0.02)" opacity="0.3"/>
      <rect x="208" y="74"  width="80" height="32" rx="5" fill="rgba(255,255,255,0.04)" opacity="0.55"/>
      <rect x="208" y="112" width="80" height="32" rx="5" fill="rgba(255,255,255,0.08)"/>
      <line x1="120" y1="90" x2="200" y2="90" stroke-dasharray="5 4"/>
      <polyline points="195 86, 200 90, 195 94" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <rect x="44"  y="46"  width="48" height="6" rx="1" fill="currentColor"/>
    <rect x="44"  y="84"  width="48" height="6" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="44"  y="122" width="48" height="6" rx="1" fill="currentColor" opacity="0.4"/>
    <rect x="220" y="46"  width="48" height="6" rx="1" fill="currentColor" opacity="0.4"/>
    <rect x="220" y="84"  width="48" height="6" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="220" y="122" width="48" height="6" rx="1" fill="currentColor"/>
  `,

  'workloads-pod-lifecycle-phases': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="10"  y="18" width="90" height="22" rx="11" fill="rgba(255,255,255,0.04)"/>
      <rect x="115" y="18" width="90" height="22" rx="11" fill="rgba(255,255,255,0.20)"/>
      <rect x="220" y="4"  width="90" height="22" rx="11" fill="rgba(255,255,255,0.08)"/>
      <rect x="220" y="34" width="90" height="22" rx="11" fill="rgba(255,255,255,0.03)" stroke-dasharray="3 2" opacity="0.55"/>
      <line x1="100" y1="29" x2="115" y2="29" stroke-dasharray="3 2"/>
      <line x1="205" y1="24" x2="220" y2="15" stroke-dasharray="3 2"/>
      <line x1="205" y1="32" x2="220" y2="45" stroke-dasharray="3 2" opacity="0.55"/>
      <rect x="106" y="86" width="108" height="72" rx="12" fill="rgba(255,255,255,0.05)"/>
      <rect x="124" y="110" width="72" height="34" rx="4" fill="rgba(255,255,255,0.11)"/>
      <line x1="160" y1="40" x2="160" y2="86" stroke-dasharray="3 2"/>
    </g>
    <path d="M 258 16 l 4 5 l 10 -11" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.55">
      <line x1="259" y1="39" x2="271" y2="51"/>
      <line x1="271" y1="39" x2="259" y2="51"/>
    </g>
    <g fill="currentColor" opacity="0.85">
      <circle cx="150" cy="127" r="2.5"/>
      <circle cx="160" cy="127" r="2.5"/>
      <circle cx="170" cy="127" r="2.5"/>
    </g>
  `,

  // Ghost zone to solid zone. Left of the dashed rule the OLD way, two staggered Pod outlines with
  // a gap of nothing between them: the delete and the recreate. Right of it ONE tall solid Pod, and
  // its single 0.9 bar is the number the resize moved, wider than the faint bars it replaces.
  'workloads-pod-resize': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="26"  width="96" height="48" rx="6" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <rect x="42" y="106" width="96" height="48" rx="6" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="160" y1="18" x2="160" y2="162" opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="182" y="26" width="114" height="128" rx="8" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="34"  y="44"  width="60" height="10" rx="1" opacity="0.16"/>
      <rect x="54"  y="124" width="60" height="10" rx="1" opacity="0.16"/>
      <rect x="198" y="83"  width="82" height="14" rx="2" opacity="0.9"/>
    </g>
  `,

  'workloads-probes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="124" y="52" width="92" height="76" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="148" y="78" width="44" height="24" rx="3"/>
      <line x1="64" y1="68"  x2="124" y2="68"  stroke-dasharray="4 3"/>
      <line x1="64" y1="90"  x2="124" y2="90"  stroke-dasharray="4 3"/>
      <line x1="64" y1="112" x2="124" y2="112" stroke-dasharray="4 3"/>
      <circle cx="52" cy="68" r="7"/>
      <circle cx="52" cy="90" r="7" fill="currentColor" fill-opacity="0.5"/>
    </g>
    <circle cx="52" cy="112" r="7" fill="currentColor"/>
  `,

  'workloads-graceful-shutdown': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="56" width="74" height="68" rx="10" fill="rgba(255,255,255,0.05)"/>
      <rect x="40" y="78" width="38" height="24" rx="3"/>
      <line x1="98" y1="90" x2="120" y2="90"/>
      <path d="M 120 90 L 116 87 M 120 90 L 116 93"/>
      <rect x="122" y="56" width="74" height="68" rx="10" fill="rgba(255,255,255,0.04)" opacity="0.72"/>
      <rect x="140" y="78" width="38" height="24" rx="3" opacity="0.5"/>
      <line x1="198" y1="90" x2="220" y2="90" stroke-dasharray="3 2"/>
      <path d="M 220 90 L 216 87 M 220 90 L 216 93"/>
      <rect x="222" y="56" width="74" height="68" rx="10" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.42"/>
    </g>
  `,

  'workloads-restart-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <rect x="20"  y="50" width="80" height="80" rx="10" fill="rgba(255,255,255,0.06)"/>
      <rect x="120" y="50" width="80" height="80" rx="10" fill="rgba(255,255,255,0.05)"/>
      <rect x="220" y="50" width="80" height="80" rx="10" fill="rgba(255,255,255,0.04)"/>
      <path d="M 80 76 A 24 24 0 1 1 58 66" stroke-width="1.8"/>
      <path d="M 180 76 A 24 24 0 1 1 158 66" stroke-width="1.8" stroke-dasharray="5 4"/>
      <line x1="238" y1="90" x2="282" y2="90" stroke-width="3"/>
    </g>
    <path d="M 58 66 L 48 61 L 53 74 Z" fill="currentColor"/>
    <path d="M 158 66 L 148 61 L 153 74 Z" fill="currentColor"/>
  `,

  'workloads-force-deletion': `
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <rect x="40"  y="64" width="104" height="84" rx="11" fill="rgba(255,255,255,0.035)" stroke-dasharray="6 4" opacity="0.6"/>
      <rect x="176" y="64" width="104" height="84" rx="11" fill="rgba(255,255,255,0.06)"/>
      <rect x="66"  y="92" width="52" height="34" rx="5" opacity="0.5"/>
      <rect x="202" y="92" width="52" height="34" rx="5"/>
    </g>
    <path d="M 152 66 L 164 88 L 154 100 L 166 130" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="92"  cy="109" r="3" fill="currentColor" opacity="0.5"/>
    <circle cx="228" cy="109" r="3" fill="currentColor"/>
  `,

  'workloads-container-states': `
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <rect x="68" y="24"  width="184" height="58" rx="9" fill="rgba(255,255,255,0.09)"/>
      <line x1="86" y1="44" x2="150" y2="44"/>
      <line x1="86" y1="62" x2="206" y2="62" opacity="0.45"/>
      <line x1="160" y1="82" x2="160" y2="100" stroke-dasharray="4 3"/>
      <rect x="68" y="100" width="184" height="58" rx="9" fill="rgba(255,255,255,0.035)" opacity="0.75" stroke-dasharray="5 3"/>
      <line x1="86" y1="120" x2="158" y2="120" opacity="0.7"/>
      <line x1="86" y1="138" x2="196" y2="138" opacity="0.4"/>
    </g>
    <circle cx="224" cy="53" r="5.5" fill="currentColor"/>
    <g stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.6">
      <line x1="216" y1="121" x2="232" y2="137"/>
      <line x1="232" y1="121" x2="216" y2="137"/>
    </g>
  `,

  // A crashed container (X glyph) caught in a restart loop arrow.
  'workloads-crashloopbackoff': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 196 37 A 62 62 0 1 1 124 37"/>
      <rect x="116" y="54" width="88" height="68" rx="12" fill="rgba(255,255,255,0.04)"/>
    </g>
    <path d="M 124 37 L 112 38 L 118 48 Z" fill="currentColor"/>
    <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="146" y1="74" x2="174" y2="102"/>
      <line x1="174" y1="74" x2="146" y2="102"/>
    </g>
  `,

  // One container with a hook marker on each side, postStart and preStop.
  'workloads-hooks': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="96" y="52" width="128" height="76" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="128" y="78" width="64" height="24" rx="3"/>
      <line x1="52"  y1="90" x2="96"  y2="90" stroke-dasharray="4 3"/>
      <line x1="224" y1="90" x2="268" y2="90" stroke-dasharray="4 3"/>
      <circle cx="44"  cy="90" r="8"/>
      <circle cx="276" cy="90" r="8"/>
    </g>
    <circle cx="44"  cy="90" r="3" fill="currentColor"/>
    <circle cx="276" cy="90" r="3" fill="currentColor"/>
  `,

  // The break: one run cut into four written slots, a gap, then the fifth dashed and empty.
  // Accent on the bar in the fourth slot, the front of the climb, with the other three at 0.3.
  'workloads-pod-startup-conditions': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="35" y="52" width="250" height="76" rx="6" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <line x1="85"  y1="52" x2="85"  y2="128" opacity="0.5"/>
      <line x1="135" y1="52" x2="135" y2="128" opacity="0.5"/>
      <line x1="185" y1="52" x2="185" y2="128" opacity="0.5"/>
      <line x1="235" y1="52" x2="235" y2="128" opacity="0.5"/>
    </g>
    <rect x="92"  y="84" width="36" height="12" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="142" y="84" width="36" height="12" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="192" y="84" width="36" height="12" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="242" y="84" width="36" height="12" rx="2" fill="currentColor" opacity="0.9"/>
    <line x1="35" y1="146" x2="275" y2="146" stroke="currentColor" stroke-width="1.6" opacity="0.75"/>
    <polygon points="274,140 285,146 274,152" fill="currentColor" opacity="0.9"/>
  `,
  'workloads-pod-qos-classes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="36" width="84" height="80" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="3 2" opacity="0.55"/>
      <rect x="118" y="36" width="84" height="80" rx="6" fill="rgba(255,255,255,0.06)" opacity="0.85"/>
      <rect x="216" y="36" width="84" height="80" rx="6" fill="rgba(255,255,255,0.10)"/>
      <line x1="20"  y1="136" x2="104" y2="136" stroke-dasharray="3 2" opacity="0.45"/>
      <line x1="118" y1="136" x2="202" y2="136" opacity="0.7"/>
      <line x1="216" y1="136" x2="300" y2="136" stroke-width="2" opacity="1"/>
    </g>
    <rect x="128" y="66" width="64" height="10" rx="2" fill="currentColor" opacity="0.55"/>
    <rect x="226" y="56" width="64" height="10" rx="2" fill="currentColor" opacity="0.75"/>
    <rect x="226" y="84" width="64" height="10" rx="2" fill="currentColor" opacity="0.75"/>
  `,

  // Fan, three kinds of place converging on one assembled set. The sources differ by their INSIDES
  // (a key list, a nested object, one value) and the dashed third is the one nobody asked for.
  // Legs are orthogonal: the middle drops onto the top face, the outer two elbow into the sides.
  'workloads-env-before-pid-1': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30"  y="22" width="76" height="42" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="122" y="22" width="76" height="42" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="214" y="22" width="76" height="42" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="134" y="30" width="52" height="26" rx="4" fill="rgba(255,255,255,0.08)"/>
      <polyline points="68,64 68,137 100,137"   stroke-dasharray="4 3" opacity="0.55"/>
      <line x1="160" y1="64" x2="160" y2="114"    stroke-dasharray="4 3" opacity="0.55"/>
      <polyline points="252,64 252,137 220,137" stroke-dasharray="4 3" opacity="0.55"/>
      <rect x="100" y="114" width="120" height="46" rx="6" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
    </g>
    <rect x="42"  y="32"  width="52" height="8"  rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="42"  y="46"  width="52" height="8"  rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="145" y="39"  width="30" height="8"  rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="235" y="39"  width="34" height="8"  rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="114" y="129" width="92" height="16" rx="2" fill="currentColor" opacity="0.9"/>
  `,
  // The empty destination. A wide dashed frame holding a Pod-shaped slot that is EMPTY, and the
  // real Pod standing outside it below, solid at stroke 2. The gap is the sentence, so there is no
  // leg and no arrow. Accent: the live Pod's own top bar, the only 0.9 on the canvas.
  'workloads-pod-pending-init-states': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28" y="12" width="264" height="96" rx="8" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <g opacity="0.45">
        <rect x="120" y="40" width="80" height="40" rx="5" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      </g>
      <rect x="120" y="128" width="80" height="40" rx="5" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
    </g>
    <g opacity="0.45">
      <rect x="132" y="50"  width="56" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="132" y="63"  width="36" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    </g>
    <rect x="132" y="138" width="56" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="132" y="151" width="36" height="8" rx="2" fill="currentColor" opacity="0.3"/>
  `,
  // A chain of stages: ONE gate list in three moments, the live entries ramping 2 / 1 / 0 while the
  // slots they left stay behind as dashed ghosts, because a removal is one-way. Accent: the Pod,
  // which stands past the empty list and is the only thing on the canvas that is not the list.
  'workloads-pod-scheduling-gates': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16"  y="36" width="58" height="108" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="92"  y="36" width="58" height="108" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="168" y="36" width="58" height="108" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="25"  y="54"  width="40" height="24" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="25"  y="102" width="40" height="24" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="101" y="54"  width="40" height="24" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="101" y="102" width="40" height="24" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="177" y="54"  width="40" height="24" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="177" y="102" width="40" height="24" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.45" stroke-dasharray="4 3"/>
      <line x1="74"  y1="90" x2="92"  y2="90" stroke-dasharray="4 3"/>
      <line x1="150" y1="90" x2="168" y2="90" stroke-dasharray="4 3"/>
      <line x1="226" y1="90" x2="248" y2="90" stroke-dasharray="4 3"/>
      <rect x="248" y="54" width="56" height="72" rx="9" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="259" y="85"  width="34" height="10" rx="2" opacity="0.9"/>
      <rect x="33"  y="62"  width="24" height="7"  rx="1" opacity="0.3"/>
      <rect x="33"  y="110" width="24" height="7"  rx="1" opacity="0.3"/>
      <rect x="109" y="62"  width="24" height="7"  rx="1" opacity="0.3"/>
    </g>
  `,
  'workloads-image-pull-registry-auth': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 75 55 Q 65 30, 95 30 Q 105 15, 130 18 Q 145 5, 175 12 Q 200 5, 225 18 Q 250 22, 250 50 Q 260 65, 235 65 Q 215 78, 185 68 Q 165 78, 140 68 Q 115 78, 90 65 Q 65 65, 75 55 Z"
            fill="rgba(255,255,255,0.04)" stroke-linejoin="round"/>
      <rect x="258" y="42" width="14" height="11" rx="1.5" fill="rgba(255,255,255,0.06)"/>
      <path d="M 261 42 L 261 38 Q 261 33, 265 33 Q 269 33, 269 38 L 269 42" stroke-linejoin="round"/>
      <rect x="70" y="92"  width="180" height="14" rx="3" fill="rgba(255,255,255,0.10)" opacity="1"/>
      <rect x="70" y="110" width="180" height="14" rx="3" fill="rgba(255,255,255,0.10)" opacity="0.8"/>
      <rect x="70" y="128" width="180" height="14" rx="3" fill="rgba(255,255,255,0.10)" opacity="0.6"/>
      <rect x="70" y="146" width="180" height="14" rx="3" fill="rgba(255,255,255,0.10)" opacity="0.4"/>
      <line x1="155" y1="78" x2="155" y2="135" stroke-dasharray="4 3"/>
      <line x1="190" y1="78" x2="190" y2="153" stroke-dasharray="4 3" opacity="0.7"/>
    </g>
    <circle cx="155" cy="135" r="3"   fill="currentColor"/>
    <circle cx="190" cy="153" r="2.5" fill="currentColor" opacity="0.7"/>
  `,

  // A symmetric fan, two into one: both readings of the same spec feed the one block the Node sets
  // aside, and the leg of the reading that WON is solid where the loser's is dashed. Left frame,
  // init bodies side by side, so the group is a maximum. Right frame, app on sidecar, so it is a
  // sum. Accent: the bar inside the top block. Body heights are 0.075 units per milli, exactly.
  'workloads-effective-pod-requests': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="108" y="18" width="104" height="44" rx="8" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <path d="M 132 62 V 75 H 84 V 88" stroke-linejoin="round"/>
      <path d="M 188 62 V 75 H 236 V 88" stroke-linejoin="round" stroke-dasharray="4 3" opacity="0.55"/>
      <rect x="20"  y="88" width="128" height="82" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="172" y="88" width="128" height="82" rx="9" fill="rgba(255,255,255,0.04)"/>
      <line x1="32"  y1="158" x2="136" y2="158" opacity="0.3"/>
      <line x1="184" y1="158" x2="288" y2="158" opacity="0.3"/>
      <rect x="38"  y="98"  width="42" height="60" rx="3" fill="rgba(255,255,255,0.09)"/>
      <rect x="88"  y="136" width="42" height="22" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="215" y="109" width="42" height="34" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="215" y="143" width="42" height="15" rx="3" fill="rgba(255,255,255,0.05)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="132" y="35"  width="56" height="10" rx="2" opacity="0.9"/>
      <rect x="46"  y="124" width="26" height="8" rx="1" opacity="0.3"/>
      <rect x="96"  y="144" width="26" height="6" rx="1" opacity="0.3"/>
      <rect x="223" y="123" width="26" height="6" rx="1" opacity="0.3"/>
      <rect x="223" y="147" width="26" height="5" rx="1" opacity="0.3"/>
    </g>
  `,
  // The wall. Left is the init list, three slots on ONE vocabulary ramping in even steps from
  // spent at the top to live at the bottom. Accent: the upright Started bar standing in the gap.
  'workloads-init-containers-and-sidecars': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="26" y="30" width="132" height="120" rx="8" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="204" y="52" width="96" height="76" rx="8" fill="rgba(255,255,255,0.04)"/>
      <g opacity="0.36">
        <rect x="40" y="41" width="104" height="26" rx="4" fill="rgba(255,255,255,0.02)"/>
        <rect x="52" y="49" width="80" height="10" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      </g>
      <g opacity="0.68">
        <rect x="40" y="77" width="104" height="26" rx="4" fill="rgba(255,255,255,0.055)"/>
        <rect x="52" y="85" width="80" height="10" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      </g>
      <g>
        <rect x="40" y="113" width="104" height="26" rx="4" fill="rgba(255,255,255,0.09)"/>
        <rect x="52" y="121" width="80" height="10" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      </g>
    </g>
    <rect x="218" y="85"  width="68" height="10"  rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="175" y="16"  width="12" height="148" rx="3" fill="currentColor" opacity="0.9"/>
  `,

  'workloads-statefulset-ordered-rollout': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g transform="translate(320,0) scale(-1,1)">
      <rect x="20"  y="32" width="84" height="60" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="118" y="32" width="84" height="60" rx="6" fill="rgba(255,255,255,0.06)" opacity="0.7"/>
      <rect x="216" y="32" width="84" height="60" rx="6" fill="rgba(255,255,255,0.03)" opacity="0.4" stroke-dasharray="3 2"/>
      <rect x="48"  y="52" width="28" height="20" rx="2" fill="currentColor" opacity="0.4"/>
      <rect x="146" y="52" width="28" height="20" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="244" y="52" width="28" height="20" rx="2" fill="currentColor" opacity="0.18"/>
      <ellipse cx="62"  cy="112" rx="34" ry="5" fill="rgba(255,255,255,0.06)"/>
      <line x1="28"  y1="112" x2="28"  y2="142"/>
      <line x1="96"  y1="112" x2="96"  y2="142"/>
      <path d="M 28 142 A 34 5 0 0 0 96 142"/>
      <ellipse cx="160" cy="112" rx="34" ry="5" fill="rgba(255,255,255,0.04)" opacity="0.7"/>
      <line x1="126" y1="112" x2="126" y2="142" opacity="0.7"/>
      <line x1="194" y1="112" x2="194" y2="142" opacity="0.7"/>
      <path d="M 126 142 A 34 5 0 0 0 194 142" opacity="0.7"/>
      <ellipse cx="258" cy="112" rx="34" ry="5" fill="rgba(255,255,255,0.02)" opacity="0.4" stroke-dasharray="3 2"/>
      <line x1="224" y1="112" x2="224" y2="142" opacity="0.4" stroke-dasharray="3 2"/>
      <line x1="292" y1="112" x2="292" y2="142" opacity="0.4" stroke-dasharray="3 2"/>
      <path d="M 224 142 A 34 5 0 0 0 292 142" opacity="0.4" stroke-dasharray="3 2"/>
      </g>
      <line x1="104" y1="62" x2="118" y2="62" stroke-dasharray="3 2"/>
      <polyline points="115 59, 118 62, 115 65" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="202" y1="62" x2="216" y2="62" stroke-dasharray="3 2"/>
      <polyline points="213 59, 216 62, 213 65" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `,

  // 3 columns = parallel workers, 6 cells = completions. Top row done (checks), bottom row running.
  'workloads-job-parallelism': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="31"  y="33" width="74" height="48" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="123" y="33" width="74" height="48" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="215" y="33" width="74" height="48" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="31"  y="99" width="74" height="48" rx="7" fill="rgba(255,255,255,0.10)"/>
      <rect x="123" y="99" width="74" height="48" rx="7" fill="rgba(255,255,255,0.10)"/>
      <rect x="215" y="99" width="74" height="48" rx="7" fill="rgba(255,255,255,0.10)"/>
    </g>
    <g stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="57 58, 64 65, 79 49"/>
      <polyline points="149 58, 156 65, 171 49"/>
      <polyline points="241 58, 248 65, 263 49"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="46"  y="116" width="44" height="14" rx="3" opacity="0.5"/>
      <rect x="138" y="116" width="44" height="14" rx="3" opacity="0.5"/>
      <rect x="230" y="116" width="44" height="14" rx="3" opacity="0.5"/>
    </g>
  `,

  // Whole poster scaled down ~15% around the viewBox centre (160,90); drawing unchanged.
  'workloads-pvc-stickiness': `
    <g transform="translate(24, 13.5) scale(0.85)">
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="0" y="36" width="120" height="108" rx="8" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.5"/>
      <rect x="16" y="62" width="88" height="60" rx="6" fill="rgba(255,255,255,0.02)" opacity="0.25" stroke-dasharray="3 2"/>
      <line x1="30" y1="76"  x2="90" y2="106" opacity="0.3" stroke-linecap="round"/>
      <line x1="90" y1="76" x2="30"  y2="106" opacity="0.3" stroke-linecap="round"/>
      <rect x="200" y="36" width="120" height="108" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="216" y="62" width="88" height="60" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="236" y="82" width="48" height="22" rx="2" fill="currentColor" opacity="0.45"/>
      <ellipse cx="160" cy="74" rx="22" ry="5" fill="rgba(255,255,255,0.06)"/>
      <line x1="138" y1="74"  x2="138" y2="118"/>
      <line x1="182" y1="74"  x2="182" y2="118"/>
      <path d="M 138 118 A 22 5 0 0 0 182 118"/>
      <ellipse cx="160" cy="118" rx="22" ry="5" stroke-opacity="0.4"/>
      <line x1="120" y1="92" x2="138" y2="92" stroke-dasharray="4 3" opacity="0.4"/>
      <line x1="182" y1="92" x2="200" y2="92" stroke-dasharray="4 3"/>
      <polyline points="197 89, 200 92, 197 95" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </g>
  `,

  'workloads-daemonset': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="23"  y="50" width="58" height="84" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="95"  y="50" width="58" height="84" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="167" y="50" width="58" height="84" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="239" y="50" width="58" height="84" rx="8" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.55"/>
      <rect x="33"  y="70" width="38" height="46" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="105" y="70" width="38" height="46" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="177" y="70" width="38" height="46" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="249" y="70" width="38" height="46" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="3 2" opacity="0.6"/>
      <line x1="262" y1="32" x2="274" y2="32"/>
      <line x1="268" y1="26" x2="268" y2="38"/>
    </g>
    <rect x="42"  y="82" width="20" height="9" rx="2" fill="currentColor"/>
    <rect x="114" y="82" width="20" height="9" rx="2" fill="currentColor"/>
    <rect x="186" y="82" width="20" height="9" rx="2" fill="currentColor"/>
    <rect x="258" y="82" width="20" height="9" rx="2" fill="currentColor" opacity="0.4"/>
  `,

  'workloads-deployment-rollback': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 252 108 C 252 46, 68 46, 68 103" stroke-width="1.7"/>
      <rect x="36"  y="108" width="64" height="42" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="128" y="108" width="64" height="42" rx="6" fill="rgba(255,255,255,0.03)" opacity="0.55"/>
      <rect x="220" y="108" width="64" height="42" rx="6" fill="rgba(255,255,255,0.10)"/>
      <line x1="150" y1="121" x2="170" y2="137" stroke-linecap="round" opacity="0.7"/>
      <line x1="170" y1="121" x2="150" y2="137" stroke-linecap="round" opacity="0.7"/>
    </g>
    <polyline points="61 95, 68 104, 75 96" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="48"  y="125" width="40" height="7" rx="2" fill="currentColor"/>
    <rect x="232" y="125" width="40" height="7" rx="2" fill="currentColor"/>
  `,

  // A clock on the left drives a Job box (outer) holding its Pod (inner) on the right: the
  // schedule fires, one Job is created per tick, and the Job runs a Pod. CronJob to Job to Pod.
  'workloads-cronjob': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <circle cx="74" cy="90" r="42" fill="rgba(255,255,255,0.05)"/>
      <line x1="74" y1="90" x2="74" y2="62" stroke-width="2" stroke-linecap="round"/>
      <line x1="74" y1="90" x2="96" y2="100" stroke-width="2" stroke-linecap="round"/>
      <line x1="118" y1="90" x2="196" y2="90" stroke-dasharray="5 4"/>
      <polyline points="191 86, 196 90, 191 94" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="200" y="50" width="92" height="80" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="216" y="74" width="60" height="34" rx="6" fill="rgba(255,255,255,0.10)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <circle cx="74" cy="50" r="2"/>
      <circle cx="114" cy="90" r="2"/>
      <circle cx="74" cy="130" r="2"/>
      <circle cx="34" cy="90" r="2"/>
      <rect x="228" y="86" width="36" height="10" rx="2" opacity="0.6"/>
    </g>
  `,

  'workloads-replicaset': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="116" y="28"  width="88" height="38" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="40"  y="112" width="64" height="44" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="128" y="112" width="64" height="44" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="216" y="112" width="64" height="44" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.6"/>
      <line x1="150" y1="66" x2="72"  y2="112" stroke-dasharray="4 3"/>
      <line x1="160" y1="66" x2="160" y2="112" stroke-dasharray="4 3"/>
      <line x1="170" y1="66" x2="248" y2="112" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="52"  y="130" width="40" height="9" rx="2"/>
      <rect x="140" y="130" width="40" height="9" rx="2"/>
      <rect x="228" y="130" width="40" height="9" rx="2" opacity="0.4"/>
    </g>
  `,
};
