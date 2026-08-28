// Design notes: ./CARDS/<card-id>.md, under that card id as a "### poster" subsection.
// The cluster posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  // Hub-and-spoke. The ring carries a heavier stroke (2 against 1.4) and the brighter fill: this
  // poster weights by LINE, not by accent bar.
  'cluster-architecture': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <circle cx="160" cy="90" r="22" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
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

  // The break drawn as a WALL rather than a strike: the Node frame stands right with its fields in,
  // the Pod stands left, and the one heavy upright between them is the accent and the not-ready
  // taint. Upright and not lying down, because a horizontal bar under a Pod reads as a shelf.
  // Ghost zone to solid: a dashed empty block nothing knows about, one dashed leg, and the Node
  // object written in at full weight, its newest field row carrying the accent.
  'cluster-node-registration': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="52" width="80" height="76" rx="6" fill="rgba(255,255,255,0.02)" opacity="0.6" stroke-dasharray="4 3"/>
      <line x1="104" y1="90" x2="152" y2="90" stroke-dasharray="4 3" opacity="0.55"/>
      <rect x="152" y="40" width="146" height="100" rx="8" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="166" y="58"  width="112" height="14" rx="3" opacity="0.9"/>
      <rect x="166" y="84"  width="88"  height="14" rx="3" opacity="0.3"/>
      <rect x="166" y="110" width="64"  height="14" rx="3" opacity="0.3"/>
    </g>
  `,

  // Branch: four rows gathered on one spine take the dashed leg to the Pod that never lands, and the
  // stroked Ready slot below takes the solid leg to the Pod that carries the accent. Both legs run flat.
  'cluster-node-conditions': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="100" y1="41"  x2="108" y2="41"  opacity="0.4"/>
      <line x1="100" y1="61"  x2="108" y2="61"  opacity="0.4"/>
      <line x1="100" y1="81"  x2="108" y2="81"  opacity="0.4"/>
      <line x1="100" y1="101" x2="108" y2="101" opacity="0.4"/>
      <line x1="108" y1="41"  x2="108" y2="101" opacity="0.4"/>
      <rect x="20" y="118" width="88" height="26" rx="4" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <line x1="108" y1="71"  x2="200" y2="71"  stroke-dasharray="4 3" opacity="0.55"/>
      <line x1="108" y1="131" x2="200" y2="131" opacity="0.6"/>
      <rect x="200" y="49"  width="80" height="44" rx="6" fill="rgba(255,255,255,0.02)" opacity="0.6" stroke-dasharray="4 3"/>
      <rect x="200" y="109" width="80" height="44" rx="6" fill="rgba(255,255,255,0.10)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="24"  y="36"  width="76" height="10" rx="1" opacity="0.3"/>
      <rect x="24"  y="56"  width="76" height="10" rx="1" opacity="0.3"/>
      <rect x="24"  y="76"  width="76" height="10" rx="1" opacity="0.3"/>
      <rect x="24"  y="96"  width="76" height="10" rx="1" opacity="0.3"/>
      <rect x="28"  y="126" width="72" height="10" rx="1" opacity="0.3"/>
      <rect x="212" y="67"  width="56" height="8"  rx="1" opacity="0.3"/>
      <rect x="212" y="127" width="56" height="8"  rx="1" opacity="0.9"/>
    </g>
  `,

  'cluster-node-drain': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="38" width="120" height="104" rx="8" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
      <rect x="40" y="48"  width="84" height="22" rx="4" fill="rgba(255,255,255,0.02)" opacity="0.3" stroke-dasharray="3 2"/>
      <rect x="40" y="79"  width="84" height="22" rx="4" fill="rgba(255,255,255,0.02)" opacity="0.3" stroke-dasharray="3 2"/>
      <rect x="40" y="110" width="84" height="22" rx="4" fill="rgba(255,255,255,0.16)"/>
      <rect x="178" y="38" width="120" height="104" rx="8" fill="rgba(255,255,255,0.06)"/>
      <rect x="198" y="58" width="80" height="28" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="198" y="94" width="80" height="28" rx="4" fill="rgba(255,255,255,0.10)"/>
      <line x1="142" y1="90" x2="178" y2="90" stroke-dasharray="5 3"/>
    </g>
  `,

  // Five stages head to tail into one closed ring. Reconcile is the THIRD block, so the accent
  // belongs there: nothing checks a poster against its own comment.
  'cluster-kubelet-reconcile-loop': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="20"  width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="20"  width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="220" y="20"  width="76" height="50" rx="8" fill="rgba(255,255,255,0.10)"/>
      <rect x="220" y="110" width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="20"  y="110" width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <path d="M96 45 H120"  stroke-dasharray="4 3"/>
      <path d="M196 45 H220" stroke-dasharray="4 3"/>
      <path d="M258 70 V110" stroke-dasharray="4 3"/>
      <path d="M220 135 H96"/>
      <path d="M58 110 V70"  stroke-dasharray="4 3"/>
      <rect x="32"  y="42"  width="26" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="132" y="42"  width="26" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="232" y="42"  width="52" height="6" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="232" y="132" width="26" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="32"  y="132" width="26" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    </g>
  `,

  // A row of peers on an age ramp: four equal blocks on one baseline, block fill and inner bar both
  // rising left to right with the time since last use, and the oldest carrying the house X where its
  // bar would be. The X is the accent, so no bar reaches it.
  'cluster-image-container-gc': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="40" width="61" height="100" rx="6" fill="rgba(255,255,255,0.03)"/>
      <rect x="93"  y="40" width="61" height="100" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="166" y="40" width="61" height="100" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="239" y="40" width="61" height="100" rx="6" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="32"  y="86" width="37" height="8" rx="1" opacity="0.3"/>
      <rect x="105" y="86" width="37" height="8" rx="1" opacity="0.5"/>
      <rect x="178" y="86" width="37" height="8" rx="1" opacity="0.7"/>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="2.4" stroke-linecap="round">
      <line x1="250" y1="70" x2="289" y2="110"/>
      <line x1="289" y1="70" x2="250" y2="110"/>
    </g>
  `,

  // Nested containment plus one break: the sandbox frame is the solid thing and carries the only
  // accent, the identity it keeps, while inside it one container is struck out and the next stands
  // in its place at full weight.
  'cluster-pod-sandbox-cri': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="22" width="276" height="136" rx="12" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="40" y="40" width="66" height="8" rx="1" fill="currentColor" opacity="0.9"/>
      <line x1="34" y1="64" x2="286" y2="64" opacity="0.25"/>
      <rect x="52"  y="86" width="78" height="44" rx="5" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.7"/>
      <line x1="60"  y1="94" x2="122" y2="122" opacity="0.55" stroke-linecap="round"/>
      <line x1="122" y1="94" x2="60"  y2="122" opacity="0.55" stroke-linecap="round"/>
      <rect x="190" y="86" width="78" height="44" rx="5" fill="rgba(255,255,255,0.10)"/>
      <rect x="203" y="104" width="52" height="7" rx="1" fill="currentColor" opacity="0.3"/>
    </g>
  `,

  // Ghost zone to solid: two dashed blocks nothing calls sit above the line on no leg, and under it
  // the live short route, the manifest file carrying the accent joined to the Pod it starts.
  'cluster-static-pods': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="62"  y="26" width="78" height="36" rx="6" fill="rgba(255,255,255,0.02)" opacity="0.55" stroke-dasharray="4 3"/>
      <rect x="180" y="26" width="78" height="36" rx="6" fill="rgba(255,255,255,0.02)" opacity="0.55" stroke-dasharray="4 3"/>
      <line x1="22" y1="78" x2="298" y2="78" opacity="0.3"/>
      <path d="M 40 96 H 104 L 120 112 V 148 H 40 Z" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <path d="M 104 96 V 112 H 120" stroke-width="2"/>
      <line x1="52" y1="110" x2="92" y2="110" opacity="0.3" stroke-linecap="round"/>
      <rect x="52" y="118" width="56" height="8" rx="1" fill="currentColor" opacity="0.9"/>
      <line x1="52" y1="136" x2="84" y2="136" opacity="0.3" stroke-linecap="round"/>
      <line x1="120" y1="122" x2="200" y2="122" opacity="0.55"/>
      <rect x="200" y="96" width="80" height="52" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="212" y="118" width="56" height="8" rx="1" fill="currentColor" opacity="0.3"/>
    </g>
  `,

  'cluster-node-pressure-eviction': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="80" y="30"  width="160" height="36" rx="6" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="92"  y1="36" x2="228" y2="60" opacity="0.55" stroke-linecap="round"/>
      <line x1="228" y1="36" x2="92"  y2="60" opacity="0.55" stroke-linecap="round"/>
      <rect x="80" y="76"  width="160" height="36" rx="6" fill="rgba(255,255,255,0.04)" opacity="0.7"/>
      <rect x="80" y="122" width="160" height="36" rx="6" fill="rgba(255,255,255,0.08)"/>
    </g>
    <circle cx="270" cy="48"  r="3"   fill="currentColor" opacity="0.5"/>
    <circle cx="270" cy="94"  r="3"   fill="currentColor" opacity="0.7"/>
    <circle cx="270" cy="140" r="3.5" fill="currentColor"/>
  `,

  // Three identical 100ms CFS periods, each filled from the left with its stall empty. The
  // REPETITION is the sentence: the budget runs out before the period does, every period, forever.
  'cluster-cpu-throttling': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="44" width="80" height="92" rx="9" fill="rgba(255,255,255,0.05)"/>
      <rect x="120" y="44" width="80" height="92" rx="9" fill="rgba(255,255,255,0.05)"/>
      <rect x="220" y="44" width="80" height="92" rx="9" fill="rgba(255,255,255,0.05)"/>
    </g>
    <g stroke="none">
      <rect x="22"  y="46" width="38" height="88" rx="6" fill="currentColor" opacity="0.9"/>
      <rect x="122" y="46" width="38" height="88" rx="6" fill="currentColor" opacity="0.9"/>
      <rect x="222" y="46" width="38" height="88" rx="6" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  // Container full of memory, split top-to-bottom by a jagged SIGKILL crack (OOMKilled).
  'cluster-oom-kill': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="82" y="40" width="156" height="100" rx="10" fill="rgba(255,255,255,0.03)"/>
    </g>
    <rect x="98" y="56" width="124" height="68" rx="4" fill="currentColor" opacity="0.16"/>
    <g stroke="currentColor" fill="none" stroke-linejoin="miter" stroke-linecap="round">
      <polyline points="196,40 178,70 193,86 157,106 171,124 134,140" stroke-width="2.1"/>
      <polyline points="178,70 161,76" stroke-width="1.3"/>
      <polyline points="157,106 173,100" stroke-width="1.3"/>
    </g>
  `,

  // One capacity bar carved into four, only the last carrying the accent because it is the only
  // region a Pod may enter. Proportions are widened so a 512Mi slice is a segment, not a speck.
  'cluster-node-allocatable': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="40" width="280" height="100" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="136" y="40" width="164" height="100" fill="rgba(255,255,255,0.05)" stroke="none"/>
      <line x1="64"  y1="40" x2="64"  y2="140"/>
      <line x1="100" y1="40" x2="100" y2="140"/>
      <line x1="136" y1="40" x2="136" y2="140"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="28"  y="86" width="28"  height="8" rx="1" opacity="0.14"/>
      <rect x="72"  y="86" width="20"  height="8" rx="1" opacity="0.14"/>
      <rect x="108" y="86" width="20"  height="8" rx="1" opacity="0.14"/>
      <rect x="144" y="86" width="148" height="8" rx="1" opacity="0.9"/>
    </g>
  `,

  // Nested containment: five concentric frames, one per cgroup tier, fills ramping inward so depth
  // reads as brightness. The only accent lies in the innermost frame, the container leaf, because
  // that is the one level where a value is ever written. No 0.3 losers: that is the whole sentence.
  'cluster-pod-cgroup-hierarchy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="14" width="280" height="152" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="44"  y="28" width="232" height="124" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="68"  y="42" width="184" height="96"  rx="8"  fill="rgba(255,255,255,0.06)"/>
      <rect x="92"  y="56" width="136" height="68"  rx="6"  fill="rgba(255,255,255,0.08)"/>
      <rect x="116" y="70" width="88"  height="40"  rx="5"  fill="rgba(255,255,255,0.10)" stroke-width="2"/>
    </g>
    <rect x="132" y="86" width="56" height="8" rx="1.5" fill="currentColor" opacity="0.9"/>
  `,

  // The shutdown grace timer (a clock, two hands + 12/3/6/9 hour dots) signals the Node, whose Pods
  // then terminate in order: leftmost still up, middle draining, last gone (dashed, faint).
  'cluster-graceful-node-shutdown': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <circle cx="50"  cy="90" r="26" stroke-width="1.6"/>
      <line   x1="50"  y1="90" x2="50"  y2="73" stroke-linecap="round" stroke-width="2"/>
      <line   x1="50"  y1="90" x2="64"  y2="96" stroke-linecap="round" stroke-width="2"/>
      <line   x1="82"  y1="90" x2="118" y2="90" stroke-dasharray="4 3"/>
      <rect   x="118" y="38" width="180" height="104" rx="10" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
      <rect   x="134" y="60" width="48" height="60" rx="5" fill="rgba(255,255,255,0.08)"/>
      <rect   x="188" y="60" width="48" height="60" rx="5" fill="rgba(255,255,255,0.04)" opacity="0.55"/>
      <rect   x="242" y="60" width="48" height="60" rx="5" fill="rgba(255,255,255,0.03)" opacity="0.25" stroke-dasharray="3 2"/>
    </g>
    <g fill="currentColor" stroke="none">
      <circle cx="50" cy="66"  r="2"/>
      <circle cx="74" cy="90"  r="2"/>
      <circle cx="50" cy="114" r="2"/>
      <circle cx="26" cy="90"  r="2"/>
    </g>
  `,

  // One chassis partitioned into three bays, the frame at stroke 2 because the machine is what
  // survived. The middle bay is bare down to its own floor line, and the accent sits right of it.
  'cluster-node-restart': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16" y="34" width="288" height="112" rx="8" fill="rgba(255,255,255,0.04)" stroke-width="2"/>
      <line x1="112" y1="34" x2="112" y2="146"/>
      <line x1="208" y1="34" x2="208" y2="146"/>
      <rect x="32"  y="52" width="64" height="76" rx="5" fill="rgba(255,255,255,0.10)"/>
      <rect x="224" y="52" width="64" height="76" rx="5" fill="rgba(255,255,255,0.10)"/>
      <line x1="128" y1="128" x2="192" y2="128" opacity="0.5"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="44"  y="85" width="40" height="10" rx="1.5" opacity="0.3"/>
      <rect x="236" y="85" width="40" height="10" rx="1.5" opacity="0.9"/>
    </g>
  `,

  // Node failure: two beats, then a long flat line running straight into a two-segment wait.
  // Accent on the long toleration segment, because the wait is almost all of it.
  'cluster-node-failure': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M14 90 L24 90 L30 54 L36 126 L42 90 L52 90 L58 54 L64 126 L70 90 L112 90" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity="0.8"/>
      <rect x="112" y="40" width="58"  height="100" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="170" y="40" width="132" height="100" rx="8" fill="rgba(255,255,255,0.07)"/>
    </g>
    <rect x="126" y="79" width="30"  height="22" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="184" y="79" width="104" height="22" rx="2" fill="currentColor" opacity="0.9"/>
  `,

  // Stream into a cache: the whole picture is the mass on the left, the watch is a drift of slivers
  // on the right, half-height fragments of the cache rows, fading as they go. Accent is the one row
  // a change just updated, and the leg leaves from it.
  'cluster-list-watch-informers': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="26" width="124" height="128" rx="8" fill="rgba(255,255,255,0.05)"/>
      <line x1="148" y1="90" x2="190" y2="90" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="38" y="40"  width="96" height="12" rx="2" opacity="0.3"/>
      <rect x="38" y="62"  width="96" height="12" rx="2" opacity="0.3"/>
      <rect x="38" y="84"  width="96" height="12" rx="2" opacity="0.9"/>
      <rect x="38" y="106" width="96" height="12" rx="2" opacity="0.3"/>
      <rect x="38" y="128" width="96" height="12" rx="2" opacity="0.3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="197" y="60"  width="20" height="6" rx="3" opacity="0.74"/>
      <rect x="201" y="110" width="16" height="6" rx="3" opacity="0.68"/>
      <rect x="207" y="74"  width="12" height="6" rx="3" opacity="0.6"/>
      <rect x="227" y="48"  width="14" height="6" rx="3" opacity="0.52"/>
      <rect x="231" y="94"  width="21" height="6" rx="3" opacity="0.55"/>
      <rect x="239" y="128" width="12" height="6" rx="3" opacity="0.46"/>
      <rect x="249" y="66"  width="16" height="6" rx="3" opacity="0.48"/>
      <rect x="261" y="42"  width="11" height="6" rx="3" opacity="0.36"/>
      <rect x="265" y="108" width="15" height="6" rx="3" opacity="0.34"/>
      <rect x="275" y="82"  width="18" height="6" rx="3" opacity="0.32"/>
      <rect x="283" y="130" width="12" height="6" rx="3" opacity="0.3"/>
      <rect x="289" y="56"  width="13" height="6" rx="3" opacity="0.3"/>
    </g>
  `,

  'cluster-object-create-path': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="14"  y="22"  width="76" height="44" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="14"  y="114" width="76" height="44" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="122" y="68"  width="76" height="44" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="230" y="68"  width="76" height="44" rx="7" fill="rgba(255,255,255,0.10)"/>
      <path d="M90 44 H106 V90 H122"  stroke-dasharray="3 4"/>
      <path d="M90 136 H106 V90 H122" stroke-dasharray="3 4"/>
      <line x1="198" y1="90" x2="230" y2="90" stroke-dasharray="3 4"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="21"  y="40.5"  width="62" height="7" rx="1" opacity="0.14"/>
      <rect x="21"  y="132.5" width="62" height="7" rx="1" opacity="0.14"/>
      <rect x="129" y="86.5"  width="62" height="7" rx="1" opacity="0.14"/>
      <rect x="237" y="86.5"  width="62" height="7" rx="1" opacity="0.9"/>
    </g>
  `,

  // A cascade of fading: the owner is already gone, and the three dependents fade 0.9 / 0.4 / 0.12
  // left to right, so the row reads as a wave of deletion passing along it.
  // The object stands solid inside a dashed deletion stamp, and the list beside it is what holds it:
  // two rows struck, the middle one live and carrying the accent the leg points at.
  'cluster-cascading-deletion': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30" y="30" width="120" height="120" rx="10" fill="rgba(255,255,255,0.02)" opacity="0.55" stroke-dasharray="4 3"/>
      <rect x="46" y="46" width="88"  height="88"  rx="7" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="170" y="30" width="120" height="120" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="182" y="40"  width="96" height="26" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <rect x="182" y="77"  width="96" height="26" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="182" y="114" width="96" height="26" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="190" y1="53"  x2="270" y2="53"  opacity="0.55" stroke-linecap="round"/>
      <line x1="190" y1="127" x2="270" y2="127" opacity="0.55" stroke-linecap="round"/>
      <line x1="150" y1="90" x2="170" y2="90" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="206" y="86" width="48" height="7" rx="1" opacity="0.9"/>
      <rect x="66"  y="86" width="48" height="7" rx="1" opacity="0.3"/>
    </g>
  `,

  // Two claim sets that overlap: each manager owns a set of fields, and the contested field is the
  // intersection. The crossing region carries the heavier stroke and the one 0.9 accent bar.
  'cluster-server-side-apply': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30"  y="26" width="172" height="88" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="118" y="66" width="172" height="88" rx="9" fill="rgba(255,255,255,0.04)"/>
      <path d="M 127 66 H 202 V 105 A 9 9 0 0 1 193 114 H 118 V 75 A 9 9 0 0 1 127 66 Z"
            fill="rgba(255,255,255,0.04)" stroke-width="2"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="40"  y="50"  width="68" height="8" rx="1" opacity="0.3"/>
      <rect x="212" y="122" width="68" height="8" rx="1" opacity="0.3"/>
      <rect x="126" y="86"  width="68" height="8" rx="1" opacity="0.9"/>
    </g>
  `,

  // Three etcd cylinders: leader (left, bright entry) replicates to two followers via dashed arrows.
  // Three replicas holding a log. The leader is the heavier cylinder and its newest entry is the one
  // accent, the third member is one entry short, and the bracket under the left pair is the quorum.
  'cluster-etcd-raft': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <ellipse cx="60"  cy="53"  rx="30" ry="7" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <line    x1="30"  y1="53"  x2="30"  y2="125" stroke-width="2"/>
      <line    x1="90"  y1="53"  x2="90"  y2="125" stroke-width="2"/>
      <path    d="M 30 125 A 30 7 0 0 0 90 125" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <ellipse cx="60"  cy="125" rx="30" ry="7" stroke-opacity="0.35"/>
      <ellipse cx="160" cy="53"  rx="30" ry="7" fill="rgba(255,255,255,0.04)"/>
      <line    x1="130" y1="53"  x2="130" y2="125"/>
      <line    x1="190" y1="53"  x2="190" y2="125"/>
      <path    d="M 130 125 A 30 7 0 0 0 190 125" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="160" cy="125" rx="30" ry="7" stroke-opacity="0.35"/>
      <ellipse cx="260" cy="53"  rx="30" ry="7" fill="rgba(255,255,255,0.04)"/>
      <line    x1="230" y1="53"  x2="230" y2="125"/>
      <line    x1="290" y1="53"  x2="290" y2="125"/>
      <path    d="M 230 125 A 30 7 0 0 0 290 125" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="260" cy="125" rx="30" ry="7" stroke-opacity="0.35"/>
      <line    x1="90"  y1="92"  x2="130" y2="92" stroke-dasharray="4 3"/>
      <path    d="M 60 46 Q 160 20 260 46" stroke-dasharray="4 3"/>
      <path    d="M 30 139 V 147 H 290 V 139" stroke-opacity="0.7"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="40"  y="65" width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="40"  y="81" width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="40"  y="97" width="40" height="6" rx="1" opacity="0.9"/>
      <rect x="140" y="65" width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="140" y="81" width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="140" y="97" width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="240" y="65" width="40" height="6" rx="1" opacity="0.3"/>
      <rect x="240" y="81" width="40" height="6" rx="1" opacity="0.3"/>
    </g>
  `,

  'cluster-scheduler-decision': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="26" width="64" height="34" rx="8" fill="rgba(255,255,255,0.07)"/>
      <rect x="146" y="38" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)"/>
      <rect x="162" y="38" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)"/>
      <!-- Orthogonal, like every lane in the catalog: the two passed-over candidates leave their own
           Node top face, rise clear of the Node band and turn 90 degrees into the Pod SIDE face on
           its midline, the winner runs straight down. Both vertical runs stand outside the Pod
           column, so neither horizontal crosses a block on its way in. -->
      <path d="M64 104 V43 H128" stroke-dasharray="3 4" opacity="0.4"/>
      <path d="M256 104 V43 H192" stroke-dasharray="3 4" opacity="0.4"/>
      <line x1="160" y1="60" x2="160" y2="104" stroke-dasharray="3 4"/>
      <rect x="24"  y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="216" y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="120" y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.10)"/>
      <rect x="36"  y="128" width="20" height="6" rx="1" fill="currentColor" opacity="0.14"/>
      <rect x="228" y="128" width="34" height="6" rx="1" fill="currentColor" opacity="0.14"/>
      <rect x="132" y="128" width="56" height="6" rx="1" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  // Branch: one taint, three effects, and only the third reaches a Pod already running. The wall
  // is the Node boundary and the block's position against it is the outcome. Accent on NoExecute.
  'cluster-taints-tolerations': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="52" width="76" height="76" rx="7" fill="rgba(255,255,255,0.06)"/>
      <path d="M 96 90 H 120 M 120 39 V 141 M 120 39 H 152 M 120 90 H 244 M 120 141 H 202"
            stroke-dasharray="4 3"/>
      <path d="M 234 22 V 56 M 234 73 V 107 M 234 116 V 166"/>
      <rect x="152" y="22" width="64" height="34" rx="5"
            fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="244" y="73" width="64" height="34" rx="5"
            fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="2">
      <rect x="202" y="124" width="64" height="34" rx="5" fill="rgba(255,255,255,0.10)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="32"  y="73"  width="52" height="6" rx="1" opacity="0.3"/>
      <rect x="32"  y="87"  width="34" height="6" rx="1" opacity="0.3"/>
      <rect x="32"  y="101" width="52" height="6" rx="1" opacity="0.3"/>
      <rect x="166" y="36"  width="36" height="6" rx="1" opacity="0.3"/>
      <rect x="258" y="87"  width="36" height="6" rx="1" opacity="0.3"/>
      <rect x="216" y="138" width="36" height="6" rx="1" opacity="0.9"/>
    </g>
  `,

  // Three want it, one has it: the holder's leg is solid into the one filled Lease cell, the two
  // standbys stop dashed on the boundary.
  'cluster-leader-election': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="20"  width="80"  height="46" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="20"  width="80"  height="46" rx="7" fill="rgba(255,255,255,0.10)"/>
      <rect x="220" y="20"  width="80"  height="46" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="40"  y="112" width="240" height="52" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="57"  y="126" width="34"  height="24" rx="3"/>
      <rect x="100" y="126" width="34"  height="24" rx="3"/>
      <rect x="143" y="126" width="34"  height="24" rx="3" fill="currentColor" opacity="0.9"/>
      <rect x="186" y="126" width="34"  height="24" rx="3"/>
      <rect x="229" y="126" width="34"  height="24" rx="3"/>
      <line x1="60"  y1="66" x2="60"  y2="112" stroke-dasharray="4 3" opacity="0.4"/>
      <line x1="260" y1="66" x2="260" y2="112" stroke-dasharray="4 3" opacity="0.4"/>
      <line x1="160" y1="66" x2="160" y2="112"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="30"  y="39.5" width="60" height="7" rx="1" opacity="0.14"/>
      <rect x="130" y="39.5" width="60" height="7" rx="1" opacity="0.9"/>
      <rect x="230" y="39.5" width="60" height="7" rx="1" opacity="0.14"/>
    </g>
  `,

  // Chain of stages, rhythm carried by the CONTENT of a repeated block rather than by a glyph per
  // stage: one object, three times, gaining a bar at each gate it passes. Accent is the newest bar.
  'cluster-admission-chain': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="8"   y="52" width="72" height="76" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="124" y="52" width="72" height="76" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="240" y="52" width="72" height="76" rx="7" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="91"  y="44" width="22" height="92" rx="5" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
      <rect x="207" y="44" width="22" height="92" rx="5" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="15"  y="110.5" width="58" height="7" rx="1" opacity="0.28"/>
      <rect x="131" y="110.5" width="58" height="7" rx="1" opacity="0.28"/>
      <rect x="131" y="98.5"  width="58" height="7" rx="1" opacity="0.28"/>
      <rect x="247" y="110.5" width="58" height="7" rx="1" opacity="0.28"/>
      <rect x="247" y="98.5"  width="58" height="7" rx="1" opacity="0.28"/>
      <rect x="247" y="86.5"  width="58" height="7" rx="1" opacity="0.9"/>
    </g>
  `,

  // What fits is in, and what does not fit is left outside the line. The refused request sits past
  // the hard tick as a dashed block wearing the only bright accent.
  'cluster-resource-quota': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="52" width="176" height="76" rx="8" fill="rgba(255,255,255,0.08)"/>
      <line x1="108" y1="52" x2="108" y2="128"/>
      <line x1="196" y1="36" x2="196" y2="144" stroke-width="2"/>
      <rect x="212" y="52" width="88" height="76" rx="8" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="34"  y="85" width="60" height="10" rx="1" opacity="0.3"/>
      <rect x="122" y="85" width="60" height="10" rx="1" opacity="0.3"/>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="2.4" stroke-linecap="round">
      <line x1="230" y1="68" x2="282" y2="112"/>
      <line x1="282" y1="68" x2="230" y2="112"/>
    </g>
  `,

  // Columns on one baseline, height is RANK. The pending Pod stands outside the Node and overtops
  // the frame itself, the shortest occupant is ghosted and struck, and the leg runs into its slot.
  'cluster-pod-priority-preemption': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="29" width="212" height="122" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="31"  y="51" width="52" height="92" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="100" y="71" width="52" height="72" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="169" y="91" width="52" height="52" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="177" y1="97" x2="213" y2="137" opacity="0.55" stroke-linecap="round"/>
      <line x1="213" y1="97" x2="177" y2="137" opacity="0.55" stroke-linecap="round"/>
      <rect x="252" y="29" width="52" height="122" rx="5" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <line x1="232" y1="90" x2="252" y2="90" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="262" y="41" width="32" height="7" rx="1" opacity="0.9"/>
      <rect x="41"  y="63" width="32" height="7" rx="1" opacity="0.3"/>
      <rect x="110" y="83" width="32" height="7" rx="1" opacity="0.3"/>
    </g>
  `,

  // Two zones compared: five Node rows each, one marked on the left and four on the right, over two
  // rate tracks of one length. The sick zone gets a tenth of its track, and that nub is the accent.
  'cluster-node-eviction-rate': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="26" width="116" height="96" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="182" y="26" width="116" height="96" rx="8" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <rect x="34"  y="54"  width="92" height="10" rx="2" opacity="0.22"/>
      <rect x="34"  y="70"  width="92" height="10" rx="2" opacity="0.22"/>
      <rect x="34"  y="86"  width="92" height="10" rx="2" opacity="0.22"/>
      <rect x="34"  y="102" width="92" height="10" rx="2" opacity="0.22"/>
      <rect x="194" y="102" width="92" height="10" rx="2" opacity="0.22"/>
      <rect x="22"  y="136" width="116" height="16" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="182" y="136" width="116" height="16" rx="3" fill="rgba(255,255,255,0.03)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="34"  y="38"  width="92" height="10" rx="2" opacity="0.3"/>
      <rect x="194" y="38"  width="92" height="10" rx="2" opacity="0.3"/>
      <rect x="194" y="54"  width="92" height="10" rx="2" opacity="0.3"/>
      <rect x="194" y="70"  width="92" height="10" rx="2" opacity="0.3"/>
      <rect x="194" y="86"  width="92" height="10" rx="2" opacity="0.3"/>
      <rect x="22"  y="136" width="100" height="16" rx="3" opacity="0.3"/>
      <rect x="182" y="136" width="12"  height="16" rx="3" opacity="0.9"/>
    </g>
  `,
};
