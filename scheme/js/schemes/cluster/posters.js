// Design notes: ./CARDS.md, under each card id as a "### poster" subsection.
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
  'cluster-kubelet-sync-loop': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="20"  width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="20"  width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="220" y="20"  width="76" height="50" rx="8" fill="rgba(255,255,255,0.10)"/>
      <rect x="220" y="110" width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="20"  y="110" width="76" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <path d="M96 45 H120"  stroke-dasharray="3 4"/>
      <path d="M196 45 H220" stroke-dasharray="3 4"/>
      <path d="M258 70 V110" stroke-dasharray="3 4"/>
      <path d="M220 135 H96" stroke-dasharray="3 4"/>
      <path d="M58 110 V70"  stroke-dasharray="3 4"/>
      <rect x="32"  y="42"  width="26" height="6" rx="1" fill="currentColor" opacity="0.14"/>
      <rect x="132" y="42"  width="26" height="6" rx="1" fill="currentColor" opacity="0.14"/>
      <rect x="232" y="42"  width="52" height="6" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="232" y="132" width="26" height="6" rx="1" fill="currentColor" opacity="0.14"/>
      <rect x="32"  y="132" width="26" height="6" rx="1" fill="currentColor" opacity="0.14"/>
    </g>
  `,

  // Pod sandbox: two app containers sharing one pause base (shared namespaces + Pod IP).
  'cluster-pod-sandbox-cri': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="56" y="36" width="208" height="108" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="76" y="108" width="168" height="24" rx="5" fill="currentColor" stroke="none" opacity="0.12"/>
      <rect x="78"  y="56" width="78" height="40" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="164" y="56" width="78" height="40" rx="5" fill="rgba(255,255,255,0.05)"/>
      <line x1="117" y1="96" x2="117" y2="108" stroke-dasharray="3 2"/>
      <line x1="203" y1="96" x2="203" y2="108" stroke-dasharray="3 2"/>
      <circle cx="160" cy="120" r="8"/>
    </g>
  `,

  // The file on disk is the real thing and the API object is its shadow: a solid Node band holding
  // the manifest file (accent) and its container, with one dim dashed block above on a single leg.
  'cluster-static-pods': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="106" y="14" width="108" height="44" rx="7" fill="rgba(255,255,255,0.03)" opacity="0.45" stroke-dasharray="4 3"/>
      <line x1="160" y1="58" x2="160" y2="76" stroke-dasharray="4 3"/>
      <rect x="20" y="76" width="280" height="88" rx="10" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
      <rect x="44"  y="94" width="80" height="52" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="196" y="94" width="80" height="52" rx="6" fill="rgba(255,255,255,0.10)"/>
      <line x1="124" y1="120" x2="196" y2="120" stroke-dasharray="4 3"/>
      <rect x="56"  y="116" width="56" height="7" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="208" y="116" width="56" height="7" rx="1" fill="currentColor" opacity="0.14"/>
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

  // Node failure: the Pod reschedules off a dead (dashed, dim) node onto a healthy node.
  'cluster-node-failure': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18"  y="44" width="122" height="92" rx="9" fill="rgba(255,255,255,0.02)" opacity="0.42" stroke-dasharray="5 4"/>
      <rect x="36"  y="69" width="86" height="42" rx="6" opacity="0.42" stroke-dasharray="4 3"/>
      <rect x="180" y="44" width="122" height="92" rx="9" fill="rgba(255,255,255,0.05)"/>
      <rect x="198" y="69" width="86" height="42" rx="6" fill="rgba(255,255,255,0.08)"/>
      <line x1="142" y1="90" x2="176" y2="90" stroke-dasharray="5 4"/>
    </g>
    <rect x="212" y="87" width="58" height="6" rx="1" fill="currentColor" opacity="0.7"/>
  `,

  // A list, then the watch that follows it. DO NOT rebuild it as the pipe version: that was built
  // and declined. Its two known weaknesses are open, and are to be worked FROM this shape.
  'cluster-api-structure': `
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

  // Two converge into one, and one goes on. The two left lanes SHARE their last segment into the
  // middle block rather than each taking its own row: the merge is the point. No arrowheads.
  'cluster-apply-flow': `
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
  'cluster-delete-flow': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="112" y="16"  width="96" height="42" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.12" stroke-dasharray="5 4"/>
      <rect x="20"  y="108" width="80" height="52" rx="7" fill="rgba(255,255,255,0.10)"/>
      <rect x="120" y="108" width="80" height="52" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="220" y="108" width="80" height="52" rx="7" fill="rgba(255,255,255,0.03)" opacity="0.12" stroke-dasharray="4 3"/>
      <path d="M140 58 V84 H60 V108"  stroke-dasharray="3 4" opacity="0.6"/>
      <line x1="160" y1="58" x2="160" y2="108" stroke-dasharray="3 4" opacity="0.6"/>
      <path d="M180 58 V84 H260 V108" stroke-dasharray="3 4" opacity="0.6"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="30"  y="130.5" width="60" height="7" rx="1" opacity="0.9"/>
      <rect x="130" y="130.5" width="60" height="7" rx="1" opacity="0.22"/>
      <rect x="230" y="130.5" width="60" height="7" rx="1" opacity="0.12"/>
    </g>
  `,

  // A tug of war: two managers, one contested field between them. The field takes the one bright
  // bar and both managers carry the same bar dim.
  'cluster-server-side-apply': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="10"  y="38" width="88" height="104" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="222" y="38" width="88" height="104" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="126" y="50" width="68" height="80"  rx="7" fill="rgba(255,255,255,0.10)"/>
      <line x1="98"  y1="90" x2="126" y2="90" stroke-dasharray="3 4"/>
      <line x1="194" y1="90" x2="222" y2="90" stroke-dasharray="3 4"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="19"  y="86.5" width="70" height="7" rx="1" opacity="0.14"/>
      <rect x="231" y="86.5" width="70" height="7" rx="1" opacity="0.14"/>
      <rect x="133" y="86.5" width="54" height="7" rx="1" opacity="0.9"/>
    </g>
  `,

  // Three etcd cylinders: leader (left, bright entry) replicates to two followers via dashed arrows.
  'cluster-etcd-raft': `
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
      <line    x1="90"  y1="87"  x2="130" y2="87" stroke-dasharray="4 3"/>
      <path    d="M 60 50 Q 160 20 260 50" stroke-dasharray="4 3"/>
    </g>
  `,

  'cluster-scheduler-decision': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="26" width="64" height="34" rx="8" fill="rgba(255,255,255,0.07)"/>
      <rect x="146" y="38" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)"/>
      <rect x="162" y="38" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)"/>
      <!-- Orthogonal, like every lane in the catalog: the two passed-over candidates leave the Pod
           bottom, turn 90 degrees on a bus at y=82 and drop into their own Node top face, the
           winner goes straight down. Side entries are impossible here: a lane reaching the left
           Node's right face would have to cross the middle Node to get there. -->
      <path d="M150 60 V82 H64 V104" stroke-dasharray="3 4" opacity="0.4"/>
      <path d="M170 60 V82 H256 V104" stroke-dasharray="3 4" opacity="0.4"/>
      <line x1="160" y1="60" x2="160" y2="104" stroke-dasharray="3 4"/>
      <rect x="24"  y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="216" y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="120" y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.10)"/>
      <rect x="36"  y="128" width="20" height="6" rx="1" fill="currentColor" opacity="0.14"/>
      <rect x="228" y="128" width="34" height="6" rx="1" fill="currentColor" opacity="0.14"/>
      <rect x="132" y="128" width="56" height="6" rx="1" fill="currentColor" opacity="0.9"/>
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
      <line x1="160" y1="66" x2="160" y2="126"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="30"  y="39.5" width="60" height="7" rx="1" opacity="0.14"/>
      <rect x="130" y="39.5" width="60" height="7" rx="1" opacity="0.9"/>
      <rect x="230" y="39.5" width="60" height="7" rx="1" opacity="0.14"/>
    </g>
  `,

  'cluster-admission-webhooks': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="74" width="44" height="40" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="28"  y1="86"  x2="56"  y2="86"/>
      <line x1="28"  y1="96"  x2="56"  y2="96"/>
      <line x1="28"  y1="106" x2="46"  y2="106"/>
      <rect x="100" y="64" width="56" height="60" rx="4" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 2"/>
      <path d="M 110 96 Q 120 86 128 96 T 146 96"/>
      <rect x="180" y="64" width="56" height="60" rx="4" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 2"/>
      <path d="M 190 96 L 200 108 L 226 80" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.6"/>
      <ellipse cx="280" cy="74"  rx="18" ry="5" fill="rgba(255,255,255,0.06)"/>
      <line x1="262" y1="74"  x2="262" y2="114"/>
      <line x1="298" y1="74"  x2="298" y2="114"/>
      <path d="M 262 114 A 18 5 0 0 0 298 114" fill="rgba(255,255,255,0.06)"/>
      <ellipse cx="280" cy="114" rx="18" ry="5" stroke-opacity="0.4"/>
      <line x1="64"  y1="94" x2="100" y2="94" stroke-dasharray="3 2"/>
      <line x1="156" y1="94" x2="180" y2="94" stroke-dasharray="3 2"/>
      <line x1="236" y1="94" x2="262" y2="94" stroke-dasharray="3 2"/>
    </g>
  `,

  // What fits is in, and what does not fit is left outside the line. The refused request sits past
  // the hard tick as a dashed block wearing the only bright accent.
  'cluster-resource-quota': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="52" width="280" height="76" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="20" y="52" width="160" height="76" rx="8" fill="rgba(255,255,255,0.08)" stroke="none"/>
      <line x1="100" y1="52" x2="100" y2="128"/>
      <line x1="180" y1="36" x2="180" y2="144" stroke-width="2.2"/>
      <rect x="196" y="66" width="88" height="48" rx="6" fill="rgba(255,255,255,0.04)" stroke-dasharray="5 4"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="32"  y="86" width="56" height="8" rx="1" opacity="0.14"/>
      <rect x="112" y="86" width="56" height="8" rx="1" opacity="0.14"/>
      <rect x="208" y="86" width="64" height="8" rx="1" opacity="0.9"/>
    </g>
  `,

  'cluster-pod-priority-preemption': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="120" y="20" width="80" height="36" rx="6" fill="rgba(255,255,255,0.16)" stroke-width="1.9"/>
      <line x1="160" y1="60" x2="160" y2="84" stroke-dasharray="4 3"/>
      <rect x="20" y="92" width="280" height="68" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="34"  y="106" width="80" height="44" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="46"  y1="116" x2="102" y2="140" opacity="0.55" stroke-linecap="round"/>
      <line x1="102" y1="116" x2="46"  y2="140" opacity="0.55" stroke-linecap="round"/>
      <rect x="124" y="106" width="80" height="44" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="214" y="106" width="80" height="44" rx="4" fill="rgba(255,255,255,0.13)"/>
    </g>
  `,
};
