// Design notes: ./CARDS/<card-id>.md, under that card id as a "### poster" subsection.
// The workloads posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  // A wheel, the fleet as a ring around one hub that never unplugs: the new-version half of the
  // rim and its three slots are solid, the old half is dashed and leaving, and the slot at the top
  // of the roll, the one that just came up, carries the accent. Rolling is the picture.
  'workloads-rolling-update': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g opacity="0.35" stroke-dasharray="2 3">
      <line x1="160.0" y1="71.0" x2="160.0" y2="47.0"/>
      <line x1="176.5" y1="80.5" x2="197.2" y2="68.5"/>
      <line x1="176.5" y1="99.5" x2="197.2" y2="111.5"/>
      <line x1="160.0" y1="109.0" x2="160.0" y2="133.0"/>
      <line x1="143.5" y1="99.5" x2="122.8" y2="111.5"/>
      <line x1="143.5" y1="80.5" x2="122.8" y2="68.5"/>
      </g>
      <path d="M 178.1 30.7 A 62 62 0 0 1 202.3 44.7 M 220.4 76.1 A 62 62 0 0 1 220.4 103.9 M 202.3 135.3 A 62 62 0 0 1 178.1 149.3" stroke-dasharray="4 3" opacity="0.6"/>
      <path d="M 141.9 149.3 A 62 62 0 0 1 117.7 135.3 M 99.6 103.9 A 62 62 0 0 1 99.6 76.1 M 117.7 44.7 A 62 62 0 0 1 141.9 30.7" stroke-width="2"/>
      <circle cx="160" cy="90" r="15" fill="rgba(255,255,255,0.06)"/>
      <rect x="198.7" y="44.0" width="30" height="30" rx="7" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="198.7" y="106.0" width="30" height="30" rx="7" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="145.0" y="137.0" width="30" height="30" rx="7" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="91.3" y="106.0" width="30" height="30" rx="7" fill="rgba(255,255,255,0.08)"/>
      <rect x="91.3" y="44.0" width="30" height="30" rx="7" fill="rgba(255,255,255,0.08)"/>
      <rect x="145.0" y="13.0" width="30" height="30" rx="7" fill="rgba(255,255,255,0.15)" stroke-width="2"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="98.3" y="118.0" width="16" height="6" rx="2" opacity="0.3"/>
      <rect x="98.3" y="56.0" width="16" height="6" rx="2" opacity="0.3"/>
      <rect x="152.0" y="25.0" width="16" height="6" rx="2" opacity="0.9"/>
    </g>
  `,

  // Nested containment: one solid frame that does not move, the phase, its top band a readout of
  // three values with the only accent on the held one, and inside it a dashed block with a jagged
  // trace that ends in a flat wait, the container crash-looping and backing off.
  'workloads-pod-lifecycle-phases': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="22" width="276" height="136" rx="12" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="44"  y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="128" y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="212" y="35" width="64" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <line x1="40" y1="56" x2="280" y2="56" opacity="0.3"/>
      <rect x="82" y="70" width="156" height="70" rx="7" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
      <path d="M 94 108 H 112 L 120 98 L 128 118 L 136 92 L 144 124 L 152 86 L 160 130 L 168 108 H 226" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `,

  // Segmented budget bar: one Node capacity cut into what other Pods hold, the slice this resize
  // took, and a dashed remainder. Accent on the middle segment, the only thing the resize moved.
  'workloads-pod-resize': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="44" width="240" height="92" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="226" y="56" width="42" height="68" rx="3" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="52"  y="56" width="78" height="68" rx="3" opacity="0.3"/>
      <rect x="136" y="56" width="84" height="68" rx="3" opacity="0.9"/>
    </g>
  `,

  // Chain of stages that forks: startupProbe is the first stage and the only live one, and the
  // dashed fork carries the other two, which begin only after it passes. Accent on stage one.
  'workloads-probes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="26" y="64" width="80" height="52" rx="8" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="214" y="30"  width="80" height="44" rx="7" fill="rgba(255,255,255,0.03)"/>
      <rect x="214" y="106" width="80" height="44" rx="7" fill="rgba(255,255,255,0.03)"/>
      <path d="M 106 90 H 160 M 160 52 V 128 M 160 52 H 214 M 160 128 H 214" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="40"  y="84"  width="52" height="12" rx="2" opacity="0.9"/>
      <rect x="228" y="47"  width="52" height="10" rx="1" opacity="0.3"/>
      <rect x="228" y="123" width="52" height="10" rx="1" opacity="0.3"/>
    </g>
  `,

  // Branch: one stamped object on top forks into two tracks at once. Left the endpoint, dashed and
  // struck because it is pulled, right the Pod on the Node, where the accent sits: the window.
  'workloads-graceful-shutdown': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="14" width="64" height="26" rx="5" fill="rgba(255,255,255,0.05)"/>
      <line x1="160" y1="40" x2="160" y2="66" stroke-dasharray="4 3"/>
      <line x1="90" y1="66" x2="230" y2="66" stroke-dasharray="4 3"/>
      <line x1="90" y1="66" x2="90" y2="86" stroke-dasharray="4 3"/>
      <line x1="230" y1="66" x2="230" y2="86" stroke-dasharray="4 3"/>
      <rect x="48" y="86" width="84" height="64" rx="8" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="188" y="86" width="84" height="64" rx="10" fill="rgba(255,255,255,0.06)"/>
      <rect x="204" y="102" width="52" height="32" rx="4"/>
      <line x1="58" y1="128" x2="122" y2="108" opacity="0.6"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="150" y="23" width="20" height="8" rx="1" opacity="0.3"/>
      <rect x="64" y="114" width="52" height="8" rx="1" opacity="0.3"/>
      <rect x="214" y="114" width="32" height="8" rx="1" opacity="0.9"/>
    </g>
  `,

  // One Pod of three stacked slabs, read upward: the fill ramp brightens toward the bottom slab,
  // the accent bar names it as the one that goes first, and a dashed comb ties all three in the
  // order the shutdown takes them.
  // Nested containment with a WALL: one Pod split by the gate, three slabs above it and two below,
  // the accent on BOTH lower slabs because they go together, and the upper ramp brightening right
  // to left so the order after the wall reads backwards with no arrowhead.
  // Mirror: the declared order over the stop order, the two rows rotationally symmetric about
  // the canvas centre. Order reads off bar WIDTH, one accent drawn at BOTH ends of the staple:
  // the slab declared first and the slab stopped last are the same container.
  'workloads-termination-order': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="11"  y="30" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="73"  y="30" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="135"  y="30" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="197"  y="30" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="259"  y="30" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="11"  y="106" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="73"  y="106" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="135"  y="106" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="197"  y="106" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <rect x="259"  y="106" width="50" height="44" rx="6" fill="rgba(255,255,255,0.055)"/>
      <path d="M 36 74 L 36 90 L 284 90 L 284 106" stroke-width="2" stroke-dasharray="4 3"/>
    </g>
    <rect x="15" y="50"  width="42" height="5" rx="1" fill="currentColor" opacity="0.9"/>
    <rect x="80" y="50"  width="36" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="145" y="50"  width="30" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="210" y="50"  width="24" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="275" y="50"  width="18" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="27" y="126" width="18" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="86" y="126" width="24" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="145" y="126" width="30" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="204" y="126" width="36" height="5" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="263" y="126" width="42" height="5" rx="1" fill="currentColor" opacity="0.9"/>
  `,

  'workloads-pod-restart-policy': `
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
      <rect x="40"  y="48" width="104" height="84" rx="11" fill="rgba(255,255,255,0.035)" stroke-dasharray="6 4" opacity="0.6"/>
      <rect x="176" y="48" width="104" height="84" rx="11" fill="rgba(255,255,255,0.06)"/>
      <rect x="66"  y="76" width="52" height="34" rx="5" opacity="0.5"/>
      <rect x="202" y="76" width="52" height="34" rx="5"/>
    </g>
    <path d="M 152 50 L 164 72 L 154 84 L 166 114" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="92"  cy="93" r="3" fill="currentColor" opacity="0.5"/>
    <circle cx="228" cy="93" r="3" fill="currentColor"/>
  `,

  // Chain of stages as a shift register: live record, kept record, and the slot that holds
  // nothing. Accent on the middle block, the one that answers what killed the container.
  'workloads-container-states': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16"  y="52" width="80" height="76" rx="9" fill="rgba(255,255,255,0.06)"/>
      <rect x="30"  y="64" width="30" height="6" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <line x1="30" y1="88"  x2="78" y2="88"/>
      <line x1="30" y1="100" x2="66" y2="100" opacity="0.5"/>
      <line x1="30" y1="112" x2="74" y2="112" opacity="0.5"/>
      <line x1="96"  y1="90" x2="120" y2="90" stroke-dasharray="4 3"/>
      <rect x="120" y="52" width="80" height="76" rx="9" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="134" y="64" width="30" height="6" rx="2" fill="currentColor" stroke="none" opacity="0.9"/>
      <line x1="134" y1="88"  x2="182" y2="88"/>
      <line x1="134" y1="100" x2="170" y2="100"/>
      <line x1="134" y1="112" x2="178" y2="112"/>
      <line x1="200" y1="90" x2="224" y2="90" stroke-dasharray="4 3"/>
      <g opacity="0.55">
        <rect x="224" y="52" width="80" height="76" rx="9" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
        <rect x="238" y="64" width="30" height="6" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
        <line x1="238" y1="88"  x2="286" y2="88"  opacity="0.4"/>
        <line x1="238" y1="100" x2="274" y2="100" opacity="0.4"/>
        <line x1="238" y1="112" x2="282" y2="112" opacity="0.4"/>
      </g>
      <line x1="234" y1="120" x2="294" y2="60" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    </g>
  `,

  // Stack of layers, append only: the declared container list held in one frame with a padlock on its
  // top edge, and one more entry hanging below the frame, outside the lock, on a solid leg. Same slot
  // shape inside and out, so the third reads as the same kind of thing in a place the lock does not
  // reach. Accent: the appended entry's bar.
  'workloads-ephemeral-containers': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="74" y="32" width="172" height="88" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="88" y="42" width="144" height="30" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="88" y="80" width="144" height="30" rx="4" fill="rgba(255,255,255,0.06)"/>
      <line x1="160" y1="120" x2="160" y2="134"/>
      <rect x="88" y="134" width="144" height="30" rx="4" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="152" y="26" width="16" height="12" rx="2" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <path d="M 156 26 V 20 Q 156 14, 160 14 Q 164 14, 164 20 V 26" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="102" y="54"  width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="102" y="92"  width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="102" y="146" width="40" height="6" rx="1" opacity="0.9"/>
    </g>
  `,

  // Rank ladder against a ceiling: five columns doubling 20 / 40 / 80 and then clamped at 110
  // under a dashed cap rule. Accent in the first capped column, a break glyph in the smallest.
  'workloads-crashloopbackoff': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="24" y1="40" x2="296" y2="40" stroke-dasharray="4 3" opacity="0.7"/>
      <line x1="24" y1="150" x2="296" y2="150" opacity="0.5"/>
      <rect x="36" y="130" width="40" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="88" y="110" width="40" height="40" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="140" y="70" width="40" height="80" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="192" y="40" width="40" height="110" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="244" y="40" width="40" height="110" rx="4" fill="rgba(255,255,255,0.05)"/>
    </g>
    <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="51" y1="135" x2="61" y2="145"/>
      <line x1="61" y1="135" x2="51" y2="145"/>
    </g>
    <rect x="96" y="118" width="24" height="5" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="148" y="78" width="24" height="5" rx="1.5" fill="currentColor" opacity="0.3"/>
    <rect x="200" y="48" width="24" height="5" rx="1.5" fill="currentColor" opacity="0.9"/>
    <rect x="252" y="48" width="24" height="5" rx="1.5" fill="currentColor" opacity="0.3"/>
  `,

  // Held object: the container is already stamped to go (solid block inside a dashed stamp) and the
  // grace window beside it holds what stands between the delete and its death, top to bottom in the
  // order the card narrates. Accent on the live middle row, preStop, the one thing anything waits for.
  'workloads-poststart-prestop-hooks': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30"  y="30"  width="120" height="120" rx="10" fill="rgba(255,255,255,0.02)" opacity="0.55" stroke-dasharray="4 3"/>
      <rect x="46"  y="46"  width="88"  height="88"  rx="7"  fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="170" y="30"  width="120" height="120" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="182" y="40"  width="96"  height="26"  rx="4"  fill="rgba(255,255,255,0.03)" opacity="0.5"/>
      <rect x="182" y="77"  width="96"  height="26"  rx="4"  fill="rgba(255,255,255,0.07)"/>
      <rect x="182" y="114" width="96"  height="26"  rx="4"  fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="190" y1="53" x2="270" y2="53" opacity="0.55" stroke-linecap="round"/>
      <line x1="150" y1="90" x2="170" y2="90" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="206" y="86" width="48" height="7" rx="1" opacity="0.9"/>
      <rect x="66"  y="78" width="48" height="7" rx="1" opacity="0.3"/>
      <rect x="66"  y="95" width="48" height="7" rx="1" opacity="0.3"/>
    </g>
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
  // Nested containment: a thin Node frame, one solid Pod at stroke 2 inside it, and inside the Pod
  // three container rows top to bottom on ONE descending fill ramp 0.10 / 0.06 / 0.03: the first
  // init done, the second init running (the only accent, carried by its inner bar), the app
  // container dashed because it does not exist yet. No legs.
  'workloads-pod-pending-init-states': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="16" width="272" height="148" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="90" y="36" width="140" height="112" rx="9" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="102" y="46"  width="116" height="26" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="102" y="80"  width="116" height="26" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="102" y="114" width="116" height="26" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.55" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="112" y="55" width="40" height="8" rx="2" opacity="0.3"/>
      <rect x="112" y="89" width="40" height="8" rx="2" opacity="0.9"/>
    </g>
  `,
  // A chain of stages read as a time-lapse: ONE gate list in three moments, the live entries ramping
  // 2 / 1 / 0 while the slots they left stay behind as dashed ghosts, because a removal is one-way.
  // Solid legs join the frames and the Pod into one continuous spine, so the strip reads as one
  // line the Pod stands at the end of. Accent: the Pod, past the empty list.
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
      <line x1="74"  y1="90" x2="92"  y2="90"/>
      <line x1="150" y1="90" x2="168" y2="90"/>
      <line x1="226" y1="90" x2="248" y2="90"/>
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
      <path d="M 108 40 H 84 V 88" stroke-linejoin="round"/>
      <path d="M 212 40 H 236 V 88" stroke-linejoin="round" stroke-dasharray="4 3" opacity="0.55"/>
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
      <rect x="46"  y="125"   width="26" height="6" rx="1" opacity="0.3"/>
      <rect x="96"  y="144"   width="26" height="6" rx="1" opacity="0.3"/>
      <rect x="223" y="123"   width="26" height="6" rx="1" opacity="0.3"/>
      <rect x="223" y="147.5" width="26" height="6" rx="1" opacity="0.3"/>
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

  // The closed gate: three ordinals on the centre line, the lower two joined by a solid link, the
  // link above running up into a bar it does not pass, and the third block ghosted beyond it.
  // Accent: the bar in the middle block, the ordinal the one above is waiting on.
  'workloads-statefulset-ordered-rollout': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="85" y="10" width="150" height="34" rx="6" fill="rgba(255,255,255,0.03)" stroke-opacity="0.5"/>
      <line x1="160" y1="84" x2="160" y2="64"/>
      <line x1="126" y1="64" x2="194" y2="64" stroke-width="2.5"/>
      <rect x="85" y="84"  width="150" height="34" rx="6" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <line x1="160" y1="118" x2="160" y2="134"/>
      <rect x="85" y="134" width="150" height="34" rx="6" fill="rgba(255,255,255,0.05)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="110" y="94"  width="100" height="14" rx="3" opacity="0.9"/>
      <rect x="110" y="144" width="100" height="14" rx="3" opacity="0.3"/>
    </g>
  `,

  // A strict five by two grid under one strike. The upper row is a dashed cell per column, where
  // the lost Pod stood; the lower row is a solid cell, where a replacement stands. A bar in the
  // upper cell means the same one came back, a bar in the lower one means a different one did,
  // and no bar at all means nothing did. Accent: the bar in its own ghost, at 0.9.
  'workloads-pod-replacement-guarantees': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="34" y1="30" x2="286" y2="30" stroke-width="3"/>
      <line x1="44" y1="30" x2="44" y2="52"/>
      <line x1="102" y1="30" x2="102" y2="52"/>
      <line x1="160" y1="30" x2="160" y2="52"/>
      <line x1="218" y1="30" x2="218" y2="52"/>
      <line x1="276" y1="30" x2="276" y2="52"/>
      <rect x="18" y="52" width="52" height="42" rx="5" fill="rgba(255,255,255,0.03)" stroke-opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="76" y="52" width="52" height="42" rx="5" fill="rgba(255,255,255,0.03)" stroke-opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="134" y="52" width="52" height="42" rx="5" fill="rgba(255,255,255,0.03)" stroke-opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="192" y="52" width="52" height="42" rx="5" fill="rgba(255,255,255,0.03)" stroke-opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="250" y="52" width="52" height="42" rx="5" fill="rgba(255,255,255,0.03)" stroke-opacity="0.45" stroke-dasharray="4 3"/>
      <rect x="18" y="106" width="52" height="42" rx="5" fill="rgba(255,255,255,0.06)" stroke-opacity="0.55"/>
      <rect x="76" y="106" width="52" height="42" rx="5" fill="rgba(255,255,255,0.06)" stroke-opacity="0.55"/>
      <rect x="134" y="106" width="52" height="42" rx="5" fill="rgba(255,255,255,0.06)" stroke-opacity="0.55"/>
      <rect x="192" y="106" width="52" height="42" rx="5" fill="rgba(255,255,255,0.06)" stroke-opacity="0.55"/>
      <rect x="250" y="106" width="52" height="42" rx="5" fill="rgba(255,255,255,0.06)" stroke-opacity="0.55"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="28" y="120" width="32" height="14" rx="2" opacity="0.55"/>
      <rect x="86" y="66" width="32" height="14" rx="2" opacity="0.9"/>
      <rect x="202" y="120" width="32" height="14" rx="2" opacity="0.55"/>
    </g>
  `,

  // A descending cascade cut by one rule: four ordinals each stepping 34 further right as they fall,
  // so POSITION carries the order the walk takes and the diagonal is the direction (R-08). The two
  // above the rule are solid and carry the revision, the two below are dashed and untouched, and the
  // rule overhangs the whole stack because it stops the movement rather than crossing a list.
  // Accent: the top block at 0.9, the largest ordinal, where the walk opens.
  'workloads-statefulset-update-strategy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="34"  y="16"  width="150" height="26" rx="5" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="68"  y="52"  width="150" height="26" rx="5" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <line x1="46" y1="90" x2="274" y2="90" stroke-width="3"/>
      <rect x="102" y="102" width="150" height="26" rx="5" fill="rgba(255,255,255,0.03)" stroke-opacity="0.5" stroke-dasharray="4 3"/>
      <rect x="136" y="138" width="150" height="26" rx="5" fill="rgba(255,255,255,0.03)" stroke-opacity="0.5" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="50" y="24" width="70" height="10" rx="2" opacity="0.9"/>
      <rect x="84" y="60" width="70" height="10" rx="2" opacity="0.55"/>
    </g>
  `,

  // Segmented budget bar in a frame: a stadium body holding five equal completion units on a
  // brightness ramp, the whole of it inscribed in the squared outer frame that is the fixed batch
  // it may not exceed. The ramp is the direction (R-08). Accent: the fifth unit, at 0.9, the run
  // that closes the batch.
  'workloads-job-parallelism': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16" y="32" width="268" height="116" rx="8" fill="rgba(255,255,255,0.03)" stroke-width="2"/>
      <rect x="30" y="46" width="240" height="88" rx="44" fill="rgba(255,255,255,0.05)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="45"  y="66" width="30" height="48" rx="4" opacity="0.25"/>
      <rect x="90"  y="66" width="30" height="48" rx="4" opacity="0.4"/>
      <rect x="135" y="66" width="30" height="48" rx="4" opacity="0.55"/>
      <rect x="180" y="66" width="30" height="48" rx="4" opacity="0.7"/>
      <rect x="225" y="66" width="30" height="48" rx="4" opacity="0.9"/>
    </g>
  `,

  // The dashed group: one dashed frame holds the Job over its two Pods, so the whole group is
  // marked to go and one boundary takes all three. Accent: the Job bar, Pods at 0.3.
  'workloads-finished-job-cleanup': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="36" y="18" width="248" height="144" rx="12" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="58" y="38" width="204" height="48" rx="6" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="58" y="98" width="98" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="164" y="98" width="98" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="76" y="54" width="168" height="16" rx="3" opacity="0.9"/>
      <rect x="76" y="113" width="62" height="14" rx="3" opacity="0.3"/>
      <rect x="182" y="113" width="62" height="14" rx="3" opacity="0.3"/>
    </g>
  `,

  // Form and cast: the cluster above with four notches on an even pitch, the fleet below with the
  // four tongues that seat in them, margins 10 and 18 mirrored about x=160. Accent: the bar in the
  // fleet, 44 to 276, running the whole seat field, because the promise is one Pod per Node.
  'workloads-daemonset': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path fill="rgba(255,255,255,0.03)"
            d="M 34,24 H 286 A 8,8 0 0 1 294,32 V 86 H 284 V 62 H 234 V 86 H 218 V 62 H 168 V 86 H 152 V 62 H 102 V 86 H 86 V 62 H 36 V 86 H 26 V 32 A 8,8 0 0 1 34,24 Z"/>
      <path fill="rgba(255,255,255,0.08)" stroke-width="2"
            d="M 26,94 H 44 V 70 H 78 V 94 H 110 V 70 H 144 V 94 H 176 V 70 H 210 V 94 H 242 V 70 H 276 V 94 H 294 V 146 A 8,8 0 0 1 286,154 H 34 A 8,8 0 0 1 26,146 Z"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="39"  y="38"  width="44"  height="12" rx="3" opacity="0.3"/>
      <rect x="105" y="38"  width="44"  height="12" rx="3" opacity="0.3"/>
      <rect x="171" y="38"  width="44"  height="12" rx="3" opacity="0.3"/>
      <rect x="237" y="38"  width="44"  height="12" rx="3" opacity="0.3"/>
      <rect x="44"  y="118" width="232" height="14" rx="3" opacity="0.9"/>
    </g>
  `,

  // The crossed pair: two rows of the printed history above, two ReplicaSets below, and the two
  // strands swap, so the newest row lands on the object that was already there. Accent: BOTH ends of
  // the live strand, so the pairing reads as one fact rather than as half a fact.
  'workloads-deployment-rollback': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="62"  y="24"  width="84" height="26" rx="4" fill="rgba(255,255,255,0.03)"/>
      <rect x="174" y="24"  width="84" height="26" rx="4" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="200" y="112" width="92" height="56" rx="6" fill="rgba(255,255,255,0.04)"/>
      <path d="M 104 50 C 104 76, 246 86, 246 112" stroke-dasharray="4 3" opacity="0.55"/>
      <rect x="28"  y="112" width="92" height="56" rx="6" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <path d="M 216 50 C 216 76, 74 86, 74 112" stroke-width="2"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="85"  y="33"  width="38" height="9"  rx="2" opacity="0.3"/>
      <rect x="197" y="33"  width="38" height="9"  rx="2" opacity="0.9"/>
      <rect x="224" y="133" width="44" height="14" rx="3" opacity="0.3"/>
      <rect x="52"  y="133" width="44" height="14" rx="3" opacity="0.9"/>
    </g>
  `,

  // One field, two roads from the old version to the new: a lens of two arcs between two Pods.
  // The upper road runs unbroken, RollingUpdate. The lower road is cut in the middle and a dashed
  // hollow stands in the cut, Recreate and the window where nobody serves. Accent on the new Pod.
  // Two zones compared, stacked: one ribbon per strategy, the same three cells on both, and the
  // whole difference is the middle one. Accent: the two bars in the RollingUpdate window.
  'workloads-deployment-strategy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="34"  width="276" height="48" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="114" y="34" width="92"  height="48" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="22" y="102" width="276" height="48" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="114" y="102" width="92" height="48" fill="none" stroke-width="2"/>
      <rect x="136" y="113" width="48" height="26" rx="4" stroke-dasharray="4 3" opacity="0.55"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="44"  y="53"  width="48" height="10" rx="2" opacity="0.3"/>
      <rect x="228" y="53"  width="48" height="10" rx="2" opacity="0.3"/>
      <rect x="136" y="45"  width="48" height="10" rx="2" opacity="0.9"/>
      <rect x="136" y="61"  width="48" height="10" rx="2" opacity="0.9"/>
      <rect x="44"  y="121" width="48" height="10" rx="2" opacity="0.3"/>
      <rect x="228" y="121" width="48" height="10" rx="2" opacity="0.3"/>
    </g>
  `,

  // The branch: one CronJob over two Jobs on one baseline, orthogonal dashed legs. The CronJob holds
  // a ruler of five ticks, the schedule. The left Job is solid, carries the accent and a Pod inside
  // it, the run that started. The right one is dashed and empty: the tick Forbid answered with nothing.
  'workloads-cronjob': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="100" y="14" width="120" height="52" rx="6" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <g opacity="0.55">
        <line x1="118" y1="48" x2="202" y2="48"/>
        <line x1="118" y1="34" x2="118" y2="48"/>
        <line x1="139" y1="34" x2="139" y2="48"/>
        <line x1="160" y1="34" x2="160" y2="48"/>
        <line x1="181" y1="34" x2="181" y2="48"/>
        <line x1="202" y1="34" x2="202" y2="48"/>
      </g>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="66" x2="160" y2="84"/>
        <line x1="88" y1="84" x2="232" y2="84"/>
        <line x1="88" y1="84" x2="88" y2="100"/>
        <line x1="232" y1="84" x2="232" y2="100"/>
      </g>
      <rect x="48" y="100" width="80" height="62" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="62" y="132" width="52" height="20" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="192" y="100" width="80" height="62" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.6"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="64" y="112" width="48" height="12" rx="3" opacity="0.9"/>
      <rect x="208" y="112" width="48" height="12" rx="3" opacity="0.3"/>
    </g>
  `,

  // Hub and spokes: four kinds of controller around the one thing every one of them ends at. The
  // Pod is the hub, smaller and rounder than its spokes, and it carries the only accent.
  'workloads-controller-kinds': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="70"  width="62" height="40" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="129" y="16"  width="62" height="40" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="129" y="124" width="62" height="40" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="238" y="70"  width="62" height="40" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="132" y="72"  width="56" height="36" rx="12" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <line x1="82"  y1="90"  x2="132" y2="90"  stroke-dasharray="4 3"/>
      <line x1="188" y1="90"  x2="238" y2="90"  stroke-dasharray="4 3"/>
      <line x1="160" y1="56"  x2="160" y2="72"  stroke-dasharray="4 3"/>
      <line x1="160" y1="108" x2="160" y2="124" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="37"  y="86"  width="28" height="8" rx="2" opacity="0.3"/>
      <rect x="146" y="32"  width="28" height="8" rx="2" opacity="0.3"/>
      <rect x="146" y="140" width="28" height="8" rx="2" opacity="0.3"/>
      <rect x="255" y="86"  width="28" height="8" rx="2" opacity="0.3"/>
      <rect x="145" y="85"  width="30" height="10" rx="2" opacity="0.9"/>
    </g>
  `,

  // Row of peers cut by a threshold: three replicas inside the desired count, the mark at
  // spec.replicas standing after the third, and the surplus fourth ghosted past it on its way out.
  'workloads-replicaset': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16"  y="52" width="62" height="78" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="86"  y="52" width="62" height="78" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="156" y="52" width="62" height="78" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="242" y="52" width="62" height="78" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.55"/>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="2">
      <line x1="230" y1="38" x2="230" y2="144"/>
      <line x1="222" y1="38" x2="238" y2="38"/>
      <line x1="222" y1="144" x2="238" y2="144"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="27"  y="86" width="40" height="9" rx="2"/>
      <rect x="97"  y="86" width="40" height="9" rx="2"/>
      <rect x="167" y="86" width="40" height="9" rx="2"/>
      <rect x="253" y="86" width="40" height="9" rx="2" opacity="0.3"/>
    </g>
  `,

  // A field of Pod objects the API is still holding: most are simply records, three are already
  // cleared to hollows, and the accent is on the one being taken now. The cleared cells are
  // scattered because the four rules that clear them are unrelated, not a sweep from one end.
  // Empty shells: three Pod records left to right, the container slot inside each one already a
  // dashed hollow, and the accent on the record PodGC takes next. The object outlives its contents.
  'workloads-pod-garbage-collection': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="44" width="84" height="92" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="118" y="44" width="84" height="92" rx="8" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <rect x="212" y="44" width="84" height="92" rx="8" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.45"/>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="1.4" stroke-dasharray="4 3" opacity="0.5">
      <rect x="37"  y="77" width="58" height="42" rx="4"/>
      <rect x="131" y="77" width="58" height="42" rx="4"/>
    </g>
    <rect x="37"  y="59" width="58" height="7" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="131" y="59" width="58" height="7" rx="1" fill="currentColor" opacity="0.9"/>
  `,
};
