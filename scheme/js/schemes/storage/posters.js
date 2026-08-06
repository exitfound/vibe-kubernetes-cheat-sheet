// Design notes: scheme/INTERNALS.md#schemejspostersjs (the pair), and ./CARDS.md
// under each card id as a "### poster" subsection.
// The storage posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  'storage-dynamic-provisioning': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="62" width="66" height="56" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="34" y1="82" x2="72" y2="82"/>
      <line x1="34" y1="96" x2="58" y2="96"/>
      <line x1="86" y1="90" x2="126" y2="90" stroke-dasharray="4 3"/>
      <circle cx="152" cy="90" r="24" fill="rgba(255,255,255,0.05)"/>
      <circle cx="152" cy="90" r="9"/>
      <line x1="152" y1="58" x2="152" y2="66"/>
      <line x1="152" y1="114" x2="152" y2="122"/>
      <line x1="120" y1="90" x2="128" y2="90"/>
      <line x1="176" y1="90" x2="184" y2="90"/>
      <line x1="178" y1="90" x2="228" y2="90" stroke-dasharray="4 3"/>
      <g stroke-dasharray="5 4">
        <ellipse cx="264" cy="62" rx="36" ry="8" fill="rgba(255,255,255,0.04)"/>
        <line x1="228" y1="62" x2="228" y2="118"/>
        <line x1="300" y1="62" x2="300" y2="118"/>
        <path d="M 228 118 A 36 8 0 0 0 300 118" fill="rgba(255,255,255,0.04)"/>
      </g>
    </g>
  `,

  // One volume owned by the Pod, mounted into two containers by straight vertical lanes.
  'storage-volume-model': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="60" y="18" width="200" height="60" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="76" y="32" width="76" height="34" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="168" y="32" width="76" height="34" rx="4" fill="rgba(255,255,255,0.07)"/>
      <ellipse cx="160" cy="118" rx="60" ry="9" fill="rgba(255,255,255,0.06)"/>
      <line x1="100" y1="118" x2="100" y2="150"/>
      <line x1="220" y1="118" x2="220" y2="150"/>
      <path d="M 100 150 A 60 9 0 0 0 220 150" fill="rgba(255,255,255,0.06)"/>
      <line x1="114" y1="112" x2="114" y2="78" stroke-dasharray="4 3"/>
      <line x1="206" y1="112" x2="206" y2="78" stroke-dasharray="4 3"/>
      <line x1="160" y1="78" x2="160" y2="109" stroke-dasharray="4 3" opacity="0.5"/>
    </g>
  `,

  // Container on top, one writable layer over dim RO image layers, the volume centered below,
  // and the bypass wire zigzagging around the stack from the container side down to the disk.
  'storage-container-filesystem': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="100" y="16" width="120" height="36" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="110" y="64" width="100" height="14" rx="3" fill="rgba(255,255,255,0.09)"/>
      <g opacity="0.45">
        <rect x="110" y="84" width="100" height="14" rx="3" fill="rgba(255,255,255,0.04)"/>
        <rect x="110" y="104" width="100" height="14" rx="3" fill="rgba(255,255,255,0.04)"/>
        <rect x="110" y="124" width="100" height="14" rx="3" fill="rgba(255,255,255,0.04)"/>
      </g>
      <ellipse cx="160" cy="152" rx="32" ry="6" fill="rgba(255,255,255,0.06)"/>
      <line x1="128" y1="152" x2="128" y2="166"/>
      <line x1="192" y1="152" x2="192" y2="166"/>
      <path d="M 128 166 A 32 6 0 0 0 192 166" fill="rgba(255,255,255,0.06)"/>
      <path d="M 220 34 L 250 34 L 250 159 L 196 159" stroke-dasharray="4 3"/>
    </g>
  `,

  'storage-emptydir': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32" y="12" width="256" height="156" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="64" y="28" width="192" height="54" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="78" y="40" width="56" height="30" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="186" y="40" width="56" height="30" rx="4" fill="rgba(255,255,255,0.07)"/>
      <g stroke-dasharray="5 4">
        <ellipse cx="160" cy="124" rx="28" ry="6" fill="rgba(255,255,255,0.04)"/>
        <line x1="132" y1="124" x2="132" y2="146"/>
        <line x1="188" y1="124" x2="188" y2="146"/>
        <path d="M 132 146 A 28 6 0 0 0 188 146" fill="rgba(255,255,255,0.04)"/>
      </g>
      <g stroke-dasharray="4 3">
        <polyline points="106,82 106,135 122,135"/>
        <polyline points="198,135 214,135 214,92"/>
      </g>
      <path d="M 122 130.5 L 127 135 L 122 139.5"/>
      <path d="M 209.5 92 L 214 87 L 218.5 92"/>
    </g>
  `,

  'storage-hostpath': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32" y="12" width="256" height="156" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="64" y="28" width="192" height="54" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="78" y="40" width="56" height="30" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="186" y="40" width="56" height="30" rx="4" fill="rgba(255,255,255,0.07)"/>
      <ellipse cx="160" cy="124" rx="28" ry="6" fill="rgba(255,255,255,0.08)"/>
      <line x1="132" y1="124" x2="132" y2="146"/>
      <line x1="188" y1="124" x2="188" y2="146"/>
      <path d="M 132 146 A 28 6 0 0 0 188 146" fill="rgba(255,255,255,0.08)"/>
      <g stroke-dasharray="4 3">
        <polyline points="106,82 106,135 122,135"/>
        <polyline points="198,135 214,135 214,92"/>
      </g>
      <path d="M 122 130.5 L 127 135 L 122 139.5"/>
      <path d="M 209.5 92 L 214 87 L 218.5 92"/>
    </g>
  `,

  'storage-ephemeral-vs-persistent': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="64" y="24" width="192" height="36" rx="8" fill="rgba(255,255,255,0.05)"/>
      <line x1="160" y1="66" x2="160" y2="158" stroke-dasharray="4 6" opacity="0.4"/>
      <g opacity="0.5" stroke-dasharray="4 3">
        <line x1="92" y1="60" x2="92" y2="94"/>
        <ellipse cx="92" cy="100" rx="34" ry="7"/>
        <line x1="58" y1="100" x2="58" y2="150"/>
        <line x1="126" y1="100" x2="126" y2="150"/>
        <path d="M 58 150 A 34 7 0 0 0 126 150"/>
      </g>
      <line x1="228" y1="60" x2="228" y2="94"/>
      <path d="M 194 100 A 34 7 0 0 0 262 100 L 262 150 A 34 7 0 0 1 194 150 Z" fill="rgba(255,255,255,0.08)" stroke="none"/>
      <ellipse cx="228" cy="100" rx="34" ry="7"/>
      <line x1="194" y1="100" x2="194" y2="150"/>
      <line x1="262" y1="100" x2="262" y2="150"/>
      <path d="M 194 150 A 34 7 0 0 0 262 150"/>
      <line x1="204" y1="118" x2="252" y2="118"/>
      <line x1="204" y1="130" x2="242" y2="130"/>
      <line x1="204" y1="142" x2="248" y2="142"/>
    </g>
  `,

  'storage-configmap-secret-mount': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="104" y="12" width="112" height="30" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="134" y="19" width="52" height="16" rx="3" fill="rgba(255,255,255,0.07)"/>
      <line x1="160" y1="42" x2="160" y2="72" stroke-dasharray="4 3"/>
      <rect x="130" y="72" width="60" height="26" rx="4" fill="rgba(255,255,255,0.09)"/>
      <g opacity="0.45">
        <polyline points="130,85 92,85 92,118" stroke-dasharray="4 3"/>
        <rect x="50" y="118" width="84" height="42" rx="5" fill="rgba(255,255,255,0.03)"/>
        <line x1="62" y1="132" x2="104" y2="132"/>
        <line x1="62" y1="144" x2="90" y2="144"/>
      </g>
      <polyline points="190,85 228,85 228,118" stroke-dasharray="4 3"/>
      <rect x="186" y="118" width="84" height="42" rx="5" fill="rgba(255,255,255,0.07)"/>
      <line x1="198" y1="132" x2="240" y2="132"/>
      <line x1="198" y1="144" x2="226" y2="144"/>
    </g>
  `,

  'storage-projected-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="196" y="50" width="88" height="80" rx="8" fill="rgba(255,255,255,0.04)"/>
      <g opacity="0.45">
        <rect x="56" y="28" width="26" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="42" y="68" width="26" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="42" y="108" width="26" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
        <line x1="82" y1="37" x2="196" y2="90" stroke-dasharray="4 3"/>
        <line x1="68" y1="77" x2="196" y2="90" stroke-dasharray="4 3"/>
        <line x1="68" y1="117" x2="196" y2="90" stroke-dasharray="4 3"/>
        <line x1="212" y1="68" x2="266" y2="68"/>
        <line x1="212" y1="84" x2="266" y2="84"/>
        <line x1="212" y1="100" x2="266" y2="100"/>
      </g>
      <rect x="56" y="148" width="26" height="18" rx="4" fill="rgba(255,255,255,0.08)"/>
      <line x1="82" y1="157" x2="196" y2="90" stroke-dasharray="4 3"/>
      <line x1="212" y1="116" x2="266" y2="116"/>
    </g>
    <circle cx="196" cy="90" r="3.5" fill="currentColor"/>
  `,

  'storage-ephemeral-storage-eviction': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="34" y="26" width="252" height="128" rx="12" fill="rgba(255,255,255,0.02)"/>
      <rect x="62"  y="38" width="24" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="92"  y="38" width="24" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="122" y="38" width="24" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
      <line x1="74"  y1="52" x2="74"  y2="62"/>
      <line x1="104" y1="52" x2="104" y2="62"/>
      <line x1="134" y1="52" x2="134" y2="62"/>
      <ellipse cx="104" cy="68" rx="50" ry="8"/>
      <line x1="54"  y1="68" x2="54"  y2="126"/>
      <line x1="154" y1="68" x2="154" y2="126"/>
      <path d="M 54 126 A 50 8 0 0 0 154 126"/>
      <line x1="154" y1="99" x2="196" y2="99" stroke-dasharray="4 3"/>
      <rect x="196" y="76" width="66" height="46" rx="8" fill="rgba(255,255,255,0.05)"/>
    </g>
  `,

  'storage-access-modes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16" y="14" width="140" height="52" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="28" y="26" width="54" height="26" rx="5" fill="rgba(255,255,255,0.08)"/>
      <rect x="90" y="26" width="54" height="26" rx="5" fill="rgba(255,255,255,0.08)"/>
      <g opacity="0.45">
        <rect x="176" y="14" width="128" height="52" rx="10" fill="rgba(255,255,255,0.03)"/>
        <rect x="214" y="26" width="54" height="26" rx="5" fill="rgba(255,255,255,0.03)"/>
      </g>
      <rect x="16" y="84" width="288" height="20" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="55" y1="52" x2="55" y2="84"/>
      <path d="M 51 78 L 55 84 L 59 78"/>
      <line x1="117" y1="52" x2="117" y2="84"/>
      <path d="M 113 78 L 117 84 L 121 78"/>
      <g opacity="0.6">
        <line x1="241" y1="52" x2="241" y2="84" stroke-dasharray="4 3"/>
        <path d="M 237 78 L 241 84 L 245 78"/>
      </g>
      <line x1="236" y1="89" x2="246" y2="99"/>
      <line x1="246" y1="89" x2="236" y2="99"/>
      <line x1="160" y1="104" x2="160" y2="119"/>
      <path d="M 156 113 L 160 119 L 164 113"/>
      <ellipse cx="160" cy="128" rx="44" ry="9" fill="rgba(255,255,255,0.10)"/>
      <line x1="116" y1="128" x2="116" y2="160"/>
      <line x1="204" y1="128" x2="204" y2="160"/>
      <path d="M 116 160 A 44 9 0 0 0 204 160" fill="rgba(255,255,255,0.10)"/>
    </g>
  `,

  'storage-volume-mode': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="46"  y="12" width="84" height="32" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="190" y="12" width="84" height="32" rx="7" fill="rgba(255,255,255,0.04)"/>
      <line x1="88" y1="44" x2="88" y2="62"/>
      <rect x="62" y="62" width="52" height="22" rx="4" fill="rgba(255,255,255,0.07)"/>
      <line x1="88" y1="84" x2="88" y2="110"/>
      <path d="M 84 104 L 88 110 L 92 104"/>
      <line x1="232" y1="44" x2="232" y2="110" stroke-dasharray="4 3"/>
      <path d="M 228 104 L 232 110 L 236 104"/>
      <ellipse cx="88" cy="118" rx="42" ry="8" fill="rgba(255,255,255,0.10)"/>
      <line x1="46" y1="118" x2="46" y2="160"/>
      <line x1="130" y1="118" x2="130" y2="160"/>
      <path d="M 46 160 A 42 8 0 0 0 130 160" fill="rgba(255,255,255,0.10)"/>
      <g opacity="0.55">
        <line x1="60" y1="132" x2="116" y2="132"/>
        <line x1="60" y1="142" x2="104" y2="142"/>
        <line x1="60" y1="152" x2="110" y2="152"/>
      </g>
      <ellipse cx="232" cy="118" rx="42" ry="8" fill="rgba(255,255,255,0.10)"/>
      <line x1="190" y1="118" x2="190" y2="160"/>
      <line x1="274" y1="118" x2="274" y2="160"/>
      <path d="M 190 160 A 42 8 0 0 0 274 160" fill="rgba(255,255,255,0.10)"/>
    </g>
  `,

  'storage-reclaim-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="14" width="64" height="26" rx="5" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.55"/>
      <line x1="160" y1="40" x2="160" y2="60" stroke-dasharray="4 3"/>
      <path d="M 156 54 L 160 60 L 164 54"/>
      <rect x="44" y="60" width="232" height="26" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="100" y1="86" x2="100" y2="106" stroke-dasharray="4 3"/>
      <path d="M 96 100 L 100 106 L 104 100"/>
      <line x1="220" y1="86" x2="220" y2="106" stroke-dasharray="4 3"/>
      <path d="M 216 100 L 220 106 L 224 100"/>
      <g opacity="0.4" stroke-dasharray="3 3">
        <ellipse cx="100" cy="114" rx="40" ry="8" fill="rgba(255,255,255,0.02)"/>
        <line x1="60" y1="114" x2="60" y2="152"/>
        <line x1="140" y1="114" x2="140" y2="152"/>
        <path d="M 60 152 A 40 8 0 0 0 140 152"/>
      </g>
      <ellipse cx="220" cy="114" rx="40" ry="8" fill="rgba(255,255,255,0.10)"/>
      <line x1="180" y1="114" x2="180" y2="152"/>
      <line x1="260" y1="114" x2="260" y2="152"/>
      <path d="M 180 152 A 40 8 0 0 0 260 152" fill="rgba(255,255,255,0.10)"/>
      <rect x="213" y="137" width="14" height="11" rx="2"/>
      <path d="M 216 137 A 4 4 0 0 1 224 137"/>
    </g>
  `,

  'storage-pv-lifecycle-phases': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 183 42 A 62 62 0 0 1 221 108"/>
      <path d="M 198 148 A 62 62 0 0 1 122 148"/>
      <path d="M 99 108 A 62 62 0 0 1 101 81" stroke-dasharray="4 3" opacity="0.6"/>
      <path d="M 115 57 A 62 62 0 0 1 137 42" stroke-dasharray="4 3" opacity="0.6"/>
      <circle cx="160" cy="37" r="18" fill="rgba(255,255,255,0.15)" stroke-width="2"/>
      <circle cx="160" cy="37" r="8"/>
      <circle cx="214" cy="130" r="18" fill="rgba(255,255,255,0.07)"/>
      <circle cx="214" cy="130" r="8" opacity="0.55"/>
      <circle cx="106" cy="130" r="18" fill="rgba(255,255,255,0.07)"/>
      <circle cx="106" cy="130" r="8" opacity="0.55"/>
      <circle cx="106" cy="68" r="4.5" opacity="0.55"/>
    </g>
    <circle cx="214" cy="68" r="4.5" fill="currentColor"/>
  `,

  'storage-pvc-protection': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="15" width="64" height="24" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="160" y1="39" x2="160" y2="57" stroke-dasharray="4 3"/>
      <path d="M 155 45 L 160 39 L 165 45"/>
      <rect x="60" y="57" width="200" height="56" rx="9" fill="rgba(255,255,255,0.07)" stroke-dasharray="5 4"/>
      <g opacity="0.4">
        <line x1="76" y1="76" x2="142" y2="76"/>
        <line x1="76" y1="94" x2="122" y2="94"/>
        <line x1="178" y1="76" x2="244" y2="76"/>
        <line x1="178" y1="94" x2="228" y2="94"/>
      </g>
      <line x1="160" y1="113" x2="160" y2="131" stroke-dasharray="4 3" opacity="0.5"/>
      <g opacity="0.5">
        <ellipse cx="160" cy="137" rx="30" ry="6" fill="rgba(255,255,255,0.05)"/>
        <line x1="130" y1="137" x2="130" y2="158"/>
        <line x1="190" y1="137" x2="190" y2="158"/>
        <path d="M 130 158 A 30 6 0 0 0 190 158" fill="rgba(255,255,255,0.05)"/>
      </g>
    </g>
    <g stroke="currentColor" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 153.5 83 L 153.5 79 A 6.5 6.5 0 0 1 166.5 79 L 166.5 83"/>
      <rect x="149" y="83" width="22" height="14" rx="3" fill="rgba(94,202,148,0.18)"/>
    </g>
    <circle cx="160" cy="90" r="1.7" fill="currentColor"/>
  `,

  'storage-volume-expansion': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <ellipse cx="160" cy="35" rx="54" ry="12"/>
      <line x1="106" y1="35" x2="106" y2="145"/>
      <line x1="214" y1="35" x2="214" y2="145"/>
      <path d="M 106 145 A 54 12 0 0 0 214 145"/>
      <g opacity="0.5">
        <line x1="160" y1="83" x2="160" y2="57" stroke-dasharray="4 3"/>
        <path d="M 155 63 L 160 57 L 165 63"/>
      </g>
    </g>
    <path d="M 106 95 L 106 145 A 54 12 0 0 0 214 145 L 214 95" fill="rgba(94,202,148,0.16)" stroke="none"/>
    <ellipse cx="160" cy="95" rx="54" ry="12" fill="rgba(94,202,148,0.20)" stroke="currentColor" stroke-width="2.4"/>
  `,

  'storage-csi-architecture': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="64"  y="10"  width="192" height="74" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="76"  y="20"  width="36"  height="20" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="120" y="20"  width="36"  height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="164" y="20"  width="36"  height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="208" y="20"  width="36"  height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="120" y="56"  width="80"  height="20" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="14"  y="96"  width="52"  height="24" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="254" y="96"  width="52"  height="24" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="84"  y="132" width="152" height="40" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="94"  y="140" width="66"  height="24" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="168" y="140" width="58"  height="24" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="14"  y="140" width="52"  height="24" rx="5" fill="rgba(255,255,255,0.05)"/>
      <path d="M 254 138 A 26 6 0 0 1 306 138 L 306 166 A 26 6 0 0 1 254 166 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="280" cy="138" rx="26" ry="6"/>
      <line x1="94"  y1="48" x2="226" y2="48"/>
      <line x1="94"  y1="40" x2="94"  y2="48"/>
      <line x1="138" y1="40" x2="138" y2="48"/>
      <line x1="182" y1="40" x2="182" y2="48"/>
      <line x1="226" y1="40" x2="226" y2="48"/>
      <line x1="160" y1="48" x2="160" y2="56"/>
      <g stroke-dasharray="4 3">
        <path d="M 66 108 L 86 108 L 86 40"/>
        <path d="M 160 76 L 160 108 L 254 108"/>
        <line x1="94"  y1="152" x2="66"  y2="152"/>
        <line x1="226" y1="152" x2="254" y2="152"/>
      </g>
    </g>
  `,

  'storage-csi-attach-mount': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="31"  width="150" height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="20" y="63"  width="150" height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="20" y="95"  width="150" height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="20" y="127" width="150" height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <path d="M 240 61 A 30 9 0 0 1 300 61 L 300 119 A 30 9 0 0 1 240 119 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="270" cy="61" rx="30" ry="9"/>
      <line x1="170" y1="42"  x2="190" y2="42"/>
      <line x1="170" y1="74"  x2="190" y2="74"/>
      <line x1="170" y1="106" x2="190" y2="106"/>
      <line x1="170" y1="138" x2="190" y2="138"/>
      <line x1="190" y1="42"  x2="190" y2="138"/>
      <g stroke-dasharray="4 3">
        <line x1="190" y1="90" x2="240" y2="90"/>
      </g>
    </g>
  `,

  'storage-volumeattachment': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18"  y="58" width="74" height="64" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="30"  y="78" width="50" height="24" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="120" y="52" width="96" height="76" rx="9" fill="rgba(255,255,255,0.08)"/>
      <rect x="132" y="68" width="72" height="10" rx="2" fill="rgba(255,255,255,0.05)"/>
      <rect x="132" y="92" width="33" height="18" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="171" y="92" width="33" height="18" rx="3" fill="rgba(255,255,255,0.05)"/>
      <path d="M 244 62 A 31 6 0 0 1 306 62 L 306 118 A 31 6 0 0 1 244 118 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="275" cy="62" rx="31" ry="6"/>
      <g stroke-dasharray="4 3">
        <line x1="92"  y1="90" x2="120" y2="90"/>
        <line x1="216" y1="90" x2="244" y2="90"/>
      </g>
    </g>
  `,

  'storage-mount-path-chain': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 130 135 A 30 8 0 0 1 190 135 L 190 157 A 30 8 0 0 1 130 157 Z" fill="rgba(255,255,255,0.03)"/>
      <ellipse cx="160" cy="135" rx="30" ry="8"/>
      <rect x="60" y="71" width="200" height="30" rx="5" fill="rgba(255,255,255,0.07)"/>
      <rect x="60" y="15" width="70" height="30" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="190" y="15" width="70" height="30" rx="6" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="127" x2="160" y2="101"/>
        <line x1="95"  y1="71"  x2="95"  y2="45"/>
        <line x1="225" y1="71"  x2="225" y2="45"/>
      </g>
    </g>
  `,

  'storage-volume-attach-limits': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="134" y="13" width="52" height="24" rx="5" fill="rgba(255,255,255,0.09)"/>
      <g stroke-dasharray="4 3">
        <path d="M 160 37 L 160 51 M 112 51 L 208 51 M 112 51 L 112 65 M 208 51 L 208 65"/>
      </g>
      <rect x="86"  y="65" width="52" height="24" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="182" y="65" width="52" height="24" rx="5" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <path d="M 112 89 L 112 113 M 208 89 L 208 113"/>
      </g>
      <rect x="80" y="113" width="160" height="54" rx="7" fill="rgba(255,255,255,0.02)"/>
      <rect x="95"  y="122" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="129" y="122" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="163" y="122" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="197" y="122" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="95"  y="143" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="129" y="143" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="163" y="143" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="197" y="143" width="28" height="15" rx="3" fill="rgba(255,255,255,0.03)"/>
    </g>
  `,

  'storage-multi-attach-error': `
    <defs>
      <mask id="mae-track" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="180">
        <rect x="0" y="0" width="320" height="180" fill="#fff"/>
        <rect x="24" y="73" width="72" height="34" rx="7" fill="#000"/>
        <rect x="224" y="73" width="72" height="34" rx="7" fill="#000"/>
      </mask>
    </defs>
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g stroke-dasharray="5 4" mask="url(#mae-track)">
        <path d="M 60 90 A 100 59 0 0 1 260 90"/>
        <path d="M 260 90 A 100 59 0 0 1 60 90"/>
      </g>
      <path d="M 154 25 L 160 31 L 154 37"/>
      <path d="M 166 143 L 160 149 L 166 155"/>
      <path d="M 130 72 A 30 8 0 0 1 190 72 L 190 104 A 30 8 0 0 1 130 104 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="160" cy="72" rx="30" ry="8"/>
      <rect x="24" y="73" width="72" height="34" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="224" y="73" width="72" height="34" rx="7" fill="rgba(255,255,255,0.06)"/>
    </g>
  `,

  'storage-fsgroup-ownership': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="110" y="17" width="100" height="30" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="60" y="73" width="200" height="90" rx="7" fill="rgba(255,255,255,0.03)"/>
      <rect x="74" y="85" width="172" height="20" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="74" y="111" width="172" height="20" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="74" y="137" width="172" height="20" rx="3" fill="rgba(255,255,255,0.05)"/>
      <rect x="196" y="90" width="40" height="10" rx="2" fill="rgba(255,255,255,0.20)"/>
      <rect x="196" y="116" width="40" height="10" rx="2" fill="rgba(255,255,255,0.13)"/>
      <rect x="196" y="142" width="40" height="10" rx="2" fill="rgba(255,255,255,0.07)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="47" x2="160" y2="73"/>
      </g>
    </g>
  `,

  'storage-volume-detach-on-node-loss': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g opacity="0.45">
        <rect x="22" y="28" width="82" height="64" rx="8" fill="rgba(255,255,255,0.03)"/>
        <line x1="22" y1="43" x2="104" y2="43"/>
        <circle cx="95" cy="35.5" r="2.6"/>
        <rect x="40" y="55" width="46" height="28" rx="5" fill="rgba(255,255,255,0.03)"/>
        <rect x="48" y="61" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
        <rect x="59" y="61" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
        <rect x="70" y="61" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      </g>
      <rect x="216" y="28" width="82" height="64" rx="8" fill="rgba(255,255,255,0.05)"/>
      <line x1="216" y1="43" x2="298" y2="43"/>
      <circle cx="289" cy="35.5" r="2.6" fill="currentColor"/>
      <rect x="234" y="55" width="46" height="28" rx="5" stroke-dasharray="4 3"/>
      <path d="M 130 108 A 30 8 0 0 1 190 108 L 190 158 A 30 8 0 0 1 130 158 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="160" cy="108" rx="30" ry="8"/>
      <path d="M 130 120 L 110 120" stroke-dasharray="4 3" opacity="0.6"/>
      <path d="M 82 120 L 63 120 L 63 92" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="82" y="112.5" width="28" height="15" rx="3" fill="rgba(255,255,255,0.08)"/>
      <path d="M 89 120 l 3 3 l 7 -8" stroke-width="1.5"/>
      <path d="M 190 120 L 213 120" stroke-dasharray="4 3" opacity="0.6"/>
      <path d="M 233 120 L 257 120 L 257 92" stroke-dasharray="4 3" opacity="0.6"/>
      <circle cx="223" cy="120" r="10"/>
      <line x1="223" y1="120" x2="223" y2="112.5" stroke-width="1.3"/>
      <line x1="223" y1="120" x2="228" y2="122" stroke-width="1.3"/>
    </g>
  `,

  'storage-pvc-binding': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="104" y="14" width="112" height="150" rx="14" fill="rgba(255,255,255,0.02)" stroke-dasharray="5 4" opacity="0.5"/>
      <rect x="118" y="26" width="84" height="32" rx="6" fill="rgba(255,255,255,0.07)"/>
      <line x1="132" y1="40" x2="188" y2="40"/>
      <line x1="132" y1="49" x2="172" y2="49"/>
      <g stroke-dasharray="4 3">
        <line x1="150" y1="58" x2="150" y2="94"/>
        <line x1="170" y1="94" x2="170" y2="58"/>
      </g>
      <path d="M 145 87 L 150 93 L 155 87"/>
      <path d="M 165 65 L 170 59 L 175 65"/>
      <ellipse cx="160" cy="100" rx="42" ry="9" fill="rgba(255,255,255,0.10)"/>
      <line x1="118" y1="100" x2="118" y2="146"/>
      <line x1="202" y1="100" x2="202" y2="146"/>
      <path d="M 118 146 A 42 9 0 0 0 202 146" fill="rgba(255,255,255,0.10)"/>
      <g opacity="0.4">
        <ellipse cx="48" cy="104" rx="26" ry="6" fill="rgba(255,255,255,0.03)"/>
        <line x1="22" y1="104" x2="22" y2="146"/>
        <line x1="74" y1="104" x2="74" y2="146"/>
        <path d="M 22 146 A 26 6 0 0 0 74 146" fill="rgba(255,255,255,0.03)"/>
        <ellipse cx="272" cy="104" rx="26" ry="6" fill="rgba(255,255,255,0.03)"/>
        <line x1="246" y1="104" x2="246" y2="146"/>
        <line x1="298" y1="104" x2="298" y2="146"/>
        <path d="M 246 146 A 26 6 0 0 0 298 146" fill="rgba(255,255,255,0.03)"/>
      </g>
    </g>
  `,

  'storage-volumeclaimtemplates': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="112" y="18" width="96" height="30" rx="6" fill="rgba(255,255,255,0.07)"/>
      <rect x="146" y="26" width="28" height="14" rx="3" fill="rgba(255,255,255,0.03)" stroke-dasharray="3 2"/>
      <g stroke-dasharray="4 3" opacity="0.7">
        <path d="M 160 48 L 160 74 M 60 60 L 260 60 M 60 60 L 60 74 M 260 60 L 260 74"/>
      </g>
      <rect x="37" y="74" width="46" height="22" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="46" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="56.5" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="67" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="137" y="74" width="46" height="22" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="146" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="156.5" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="167" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="237" y="74" width="46" height="22" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="246" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="256.5" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <rect x="267" y="81" width="7" height="6" rx="1.5" fill="rgba(255,255,255,0.10)"/>
      <path d="M 60 96 L 60 110 M 160 96 L 160 110 M 260 96 L 260 110" stroke-width="1.5"/>
      <path d="M 38 110 A 22 6 0 0 1 82 110 L 82 158 A 22 6 0 0 1 38 158 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="60" cy="110" rx="22" ry="6"/>
      <path d="M 138 110 A 22 6 0 0 1 182 110 L 182 158 A 22 6 0 0 1 138 158 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="160" cy="110" rx="22" ry="6"/>
      <path d="M 238 110 A 22 6 0 0 1 282 110 L 282 158 A 22 6 0 0 1 238 158 Z" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="260" cy="110" rx="22" ry="6"/>
    </g>
  `,

  'storage-pvc-retention-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="104" y="14" width="112" height="34" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="114" y="24" width="42" height="14" rx="3" fill="rgba(255,255,255,0.11)"/>
      <rect x="164" y="24" width="42" height="14" rx="3" fill="rgba(255,255,255,0.03)" stroke-dasharray="3 2"/>
      <g stroke-dasharray="4 3" opacity="0.7">
        <path d="M 160 48 L 160 62 M 90 62 L 230 62 M 90 62 L 90 90 M 230 62 L 230 90"/>
      </g>
      <path d="M 66 96 A 24 6 0 0 1 114 96 L 114 150 A 24 6 0 0 1 66 150 Z" fill="rgba(255,255,255,0.08)"/>
      <ellipse cx="90" cy="96" rx="24" ry="6"/>
      <g opacity="0.4">
        <path d="M 206 96 A 24 6 0 0 1 254 96 L 254 150 A 24 6 0 0 1 206 150 Z" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
        <ellipse cx="230" cy="96" rx="24" ry="6" stroke-dasharray="4 3"/>
      </g>
    </g>
  `,

  'storage-topology-aware-provisioning': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="30" width="72" height="120" rx="9" fill="rgba(255,255,255,0.02)" opacity="0.38" stroke-dasharray="5 4"/>
      <rect x="228" y="30" width="72" height="120" rx="9" fill="rgba(255,255,255,0.02)" opacity="0.38" stroke-dasharray="5 4"/>
      <rect x="124" y="24" width="72" height="132" rx="9" fill="rgba(255,255,255,0.055)"/>
      <rect x="134" y="42" width="52" height="30" rx="6" fill="rgba(255,255,255,0.10)"/>
      <path d="M 160 72 L 160 98"/>
      <path d="M 155 92 L 160 98 L 165 92"/>
      <ellipse cx="160" cy="104" rx="24" ry="5.5" fill="rgba(255,255,255,0.12)"/>
      <line x1="136" y1="104" x2="136" y2="140"/><line x1="184" y1="104" x2="184" y2="140"/>
      <path d="M 136 140 A 24 5.5 0 0 0 184 140" fill="rgba(255,255,255,0.12)"/>
    </g>
  `,

  'storage-volume-snapshot': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 94 40 A 66 7 0 0 1 226 40 L 226 56 A 66 7 0 0 1 94 56 Z" fill="rgba(255,255,255,0.13)"/>
      <ellipse cx="160" cy="40" rx="66" ry="7" fill="rgba(255,255,255,0.17)"/>
      <line x1="160" y1="63" x2="160" y2="89" stroke-dasharray="4 3" opacity="0.7"/>
      <path d="M 94 96 A 66 7 0 0 1 226 96 L 226 144 A 66 7 0 0 1 94 144 Z" fill="rgba(255,255,255,0.05)"/>
      <ellipse cx="160" cy="96" rx="66" ry="7" fill="rgba(255,255,255,0.07)"/>
    </g>
  `,

  'storage-pvc-clone': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="20" width="64" height="26" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="216" y="20" width="64" height="26" rx="4" fill="rgba(255,255,255,0.05)"/>
      <line x1="72" y1="46" x2="72" y2="86" stroke-dasharray="4 3" opacity="0.7"/>
      <line x1="248" y1="46" x2="248" y2="86" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="24" y="72" width="272" height="88" rx="10" stroke-dasharray="5 4" opacity="0.45"/>
      <path d="M 42 92 A 30 6 0 0 1 102 92 L 102 140 A 30 6 0 0 1 42 140 Z" fill="rgba(255,255,255,0.05)"/>
      <ellipse cx="72" cy="92" rx="30" ry="6" fill="rgba(255,255,255,0.07)"/>
      <line x1="102" y1="116" x2="218" y2="116" stroke-dasharray="4 3"/>
      <path d="M 218 92 A 30 6 0 0 1 278 92 L 278 140 A 30 6 0 0 1 218 140 Z" fill="rgba(255,255,255,0.13)"/>
      <ellipse cx="248" cy="92" rx="30" ry="6" fill="rgba(255,255,255,0.17)"/>
    </g>
  `,

  'storage-generic-ephemeral-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="100" y="14" width="120" height="44" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="122" y="30" width="76" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
      <line x1="160" y1="58" x2="160" y2="78" stroke-dasharray="4 3" opacity="0.7"/>
      <g opacity="0.6">
        <rect x="110" y="78" width="100" height="28" rx="5" fill="rgba(255,255,255,0.12)"/>
      </g>
      <line x1="160" y1="106" x2="160" y2="125" stroke-dasharray="4 3" opacity="0.7"/>
      <g opacity="0.6">
        <path d="M 122 132 A 38 7 0 0 1 198 132 L 198 158 A 38 7 0 0 1 122 158 Z" fill="rgba(255,255,255,0.05)"/>
        <ellipse cx="160" cy="132" rx="38" ry="7" fill="rgba(255,255,255,0.07)"/>
      </g>
    </g>
  `,

  'storage-csi-capacity-tracking': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="108" y="12" width="104" height="26" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="94" y="58" width="132" height="46" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="129" y="68" width="62" height="9" rx="2" fill="rgba(255,255,255,0.04)"/>
      <rect x="106" y="83" width="50" height="12" rx="3" fill="rgba(255,255,255,0.10)"/>
      <rect x="164" y="83" width="50" height="12" rx="3" fill="rgba(255,255,255,0.10)"/>
      <g stroke-dasharray="4 3" opacity="0.7">
        <path d="M 160 58 L 160 38"/>
        <path d="M 82 142 L 131 142 L 131 104"/>
        <path d="M 238 142 L 189 142 L 189 104"/>
      </g>
      <path d="M 22 126 A 30 6 0 0 1 82 126 L 82 158 A 30 6 0 0 1 22 158 Z" fill="rgba(255,255,255,0.05)"/>
      <ellipse cx="52" cy="126" rx="30" ry="6"/>
      <path d="M 238 126 A 30 6 0 0 1 298 126 L 298 158 A 30 6 0 0 1 238 158 Z" fill="rgba(255,255,255,0.05)"/>
      <ellipse cx="268" cy="126" rx="30" ry="6"/>
    </g>
  `,
};
