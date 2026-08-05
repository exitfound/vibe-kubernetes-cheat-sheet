// The workloads posters: the still frame each workloads card shows on the grid, keyed by card id.
// A poster is one sentence, not a small diagram. Design notes for each one:
// scheme/docs/CARDS.md, the "### poster" subsection under that card id.

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

  'workloads-pod-phase-machine': `
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
    <circle cx="62"  cy="156" r="3"   fill="currentColor" opacity="0.45"/>
    <circle cx="160" cy="156" r="3.2" fill="currentColor" opacity="0.7"/>
    <circle cx="258" cy="156" r="3.5" fill="currentColor"/>
  `,

  'workloads-pod-image-pull': `
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

  'workloads-init-containers-and-sidecars': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="40" width="280" height="100" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="36"  y="62" width="50" height="56" rx="4" fill="rgba(255,255,255,0.08)" opacity="0.4"/>
      <line x1="86"  y1="90" x2="100" y2="90" opacity="0.5"/>
      <rect x="100" y="62" width="50" height="56" rx="4" fill="rgba(255,255,255,0.08)" opacity="0.6"/>
      <line x1="150" y1="90" x2="166" y2="90" opacity="0.7"/>
      <rect x="166" y="62" width="50" height="56" rx="4" fill="rgba(255,255,255,0.08)" opacity="0.8"/>
      <line x1="216" y1="90" x2="230" y2="90" opacity="0.9"/>
      <rect x="230" y="62" width="56" height="56" rx="4" fill="rgba(255,255,255,0.08)" opacity="1"/>
    </g>
  `,

  'workloads-statefulset-ordered-startup': `
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
