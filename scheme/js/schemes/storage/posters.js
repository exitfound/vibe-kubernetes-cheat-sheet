// Design notes: the comment directly above each poster below (R-12). A record in ./CARDS/ carries no poster note.
// The storage posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  // Ghost zone to solid zone: a dashed shelf of three empty slots, then the new volume built to order,
  // its spec rows at 0.3 and its claimRef row at 0.9, the accent: it arrives already stamped.
  'storage-dynamic-provisioning': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28" y="40" width="96" height="100" rx="8" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.7"/>
      <g stroke-dasharray="4 3" opacity="0.3">
        <rect x="42" y="52" width="68" height="18" rx="3"/>
        <rect x="42" y="81" width="68" height="18" rx="3"/>
        <rect x="42" y="110" width="68" height="18" rx="3"/>
      </g>
      <line x1="124" y1="90" x2="176" y2="90" stroke-dasharray="4 3"/>
      <rect x="176" y="34" width="116" height="112" rx="10" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="194" y="56" width="80" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="194" y="74" width="54" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <line x1="194" y1="96" x2="274" y2="96" stroke-dasharray="4 3" opacity="0.4"/>
      <rect x="194" y="110" width="80" height="12" rx="2" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  // Ring of states round a hub: four container stations on a broken ellipse orbit the volume, whose
  // 0.9 file row is the accent: the file stays while containers come and go.
  'storage-volume-model': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g opacity="0.5">
        <path d="M 63.8 68 A 104 58 0 0 1 126 35.2"/>
        <path d="M 194 35.2 A 104 58 0 0 1 256.2 68"/>
        <path d="M 256.2 112 A 104 58 0 0 1 194 144.8"/>
        <path d="M 126 144.8 A 104 58 0 0 1 63.8 112"/>
      </g>
      <rect x="30" y="76" width="52" height="28" rx="5" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="40" y="87.5" width="32" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="134" y="18" width="52" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <g opacity="0.5">
        <line x1="154" y1="26" x2="166" y2="38"/>
        <line x1="166" y1="26" x2="154" y2="38"/>
      </g>
      <rect x="238" y="76" width="52" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="248" y="87.5" width="32" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="134" y="134" width="52" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <g opacity="0.5">
        <line x1="144" y1="143" x2="176" y2="143"/>
        <line x1="144" y1="153" x2="168" y2="153"/>
      </g>
      <rect x="121" y="65" width="78" height="50" rx="6" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="131" y="75.5" width="58" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="131" y="87.5" width="58" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="131" y="99.5" width="58" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
    </g>
  `,

  // Rank ladder on its side: four lifetime bars (container, Pod, Node, API object) leave the Pod in
  // even steps, the farther the data lives the longer it lives. Accent: the longest inner bar.
  'storage-where-volume-data-lives': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="24" width="272" height="132" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="38" y="38" width="36" height="104" rx="6" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="74" y="46" width="52" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="74" y="70" width="104" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="74" y="94" width="156" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="74" y="118" width="208" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="79" y="51" width="42" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="79" y="75" width="94" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="79" y="99" width="146" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="79" y="123" width="198" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
    </g>
  `,

  // Stack of layers as an offset cascade: two image sheets of 0.3 file bars under the front upperdir
  // sheet holding new file, copy-up and a hollow whiteout. Accent: the 0.9 new-file bar.
  'storage-container-filesystem': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 104 48 V 36 Q 104 30 110 30 H 258 Q 264 30 264 36 V 108 Q 264 114 258 114 H 240 V 54 Q 240 48 234 48 H 104 Z" fill="rgba(255,255,255,0.04)"/>
      <rect x="116" y="36" width="36" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="160" y="36" width="36" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="204" y="36" width="36" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <path d="M 80 66 V 54 Q 80 48 86 48 H 234 Q 240 48 240 54 V 126 Q 240 132 234 132 H 216 V 72 Q 216 66 210 66 H 80 Z" fill="rgba(255,255,255,0.06)"/>
      <rect x="92" y="54" width="36" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="136" y="54" width="36" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="180" y="54" width="36" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="56" y="66" width="160" height="84" rx="6" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="72" y="84" width="96" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="72" y="104" width="72" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="72" y="124" width="56" height="8" rx="1" opacity="0.5"/>
    </g>
  `,

  // Nested containment: one Pod frame holding the light app image and the dense weights image, the
  // read-only mount the one line between them. Accent: the 0.9 head bar of the weights image.
  'storage-image-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="26" y="22" width="268" height="136" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="48" y="58" width="88" height="64" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="58" y="68" width="36" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <g opacity="0.5">
        <line x1="58" y1="86" x2="126" y2="86"/>
        <line x1="58" y1="98" x2="114" y2="98"/>
        <line x1="58" y1="110" x2="120" y2="110"/>
      </g>
      <line x1="136" y1="90" x2="188" y2="90" opacity="0.7"/>
      <rect x="188" y="40" width="84" height="100" rx="6" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="198" y="50" width="64" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <g fill="currentColor" stroke="none" opacity="0.3">
        <rect x="198" y="68" width="64" height="3" rx="1"/>
        <rect x="198" y="78" width="64" height="3" rx="1"/>
        <rect x="198" y="88" width="64" height="3" rx="1"/>
        <rect x="198" y="98" width="64" height="3" rx="1"/>
        <rect x="198" y="108" width="64" height="3" rx="1"/>
        <rect x="198" y="118" width="64" height="3" rx="1"/>
        <rect x="198" y="128" width="64" height="3" rx="1"/>
      </g>
    </g>
  `,

  // Two zones compared, mirrored: a Pod and its replacement on two Node frames, each mounting one tank.
  // Node 1 still holds three files (the 0.9 accent), Node 2 finds a new empty tank of dashed slots.
  'storage-emptydir': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="34" y="24" width="116" height="132" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="46" y="34" width="92" height="112" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="54" y="44" width="34" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
      <rect x="96" y="44" width="34" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
      <path d="M 71 60 V 74 M 113 60 V 74"/>
      <rect x="54" y="74" width="76" height="60" rx="5" fill="rgba(255,255,255,0.04)" stroke-width="2"/>
      <g stroke="none" fill="currentColor" opacity="0.9">
        <rect x="60" y="102" width="64" height="7" rx="1"/>
        <rect x="60" y="112" width="64" height="7" rx="1"/>
        <rect x="60" y="122" width="64" height="7" rx="1"/>
      </g>
      <path d="M 150 90 H 170" stroke-dasharray="4 3"/>
      <rect x="170" y="24" width="116" height="132" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="182" y="34" width="92" height="112" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="190" y="44" width="34" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
      <rect x="232" y="44" width="34" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
      <path d="M 207 60 V 74 M 249 60 V 74"/>
      <rect x="190" y="74" width="76" height="60" rx="5" fill="rgba(255,255,255,0.04)" stroke-width="2"/>
      <g stroke-dasharray="3 2" opacity="0.35">
        <rect x="196" y="100" width="64" height="6" rx="1"/>
        <rect x="196" y="111" width="64" height="6" rx="1"/>
        <rect x="196" y="122" width="64" height="6" rx="1"/>
      </g>
    </g>
  `,

  // Stack of layers, pierced: a ghost Pod drops one narrow shaft into the Node filesystem band, onto
  // the /data/app cell among system path cells. Accent: the 0.9 bar in that cell, outliving the Pod.
  'storage-hostpath': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="14" width="280" height="152" rx="10" fill="rgba(255,255,255,0.03)"/>
      <g opacity="0.5">
        <rect x="108" y="26" width="104" height="46" rx="8" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
        <rect x="122" y="40" width="76" height="20" rx="4" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
        <rect x="134" y="47" width="52" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      </g>
      <rect x="154" y="78" width="12" height="24" fill="rgba(255,255,255,0.10)" stroke="none"/>
      <path d="M 154 78 V 102 M 166 78 V 102" stroke-width="2"/>
      <rect x="32"  y="108" width="32" height="44" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="72"  y="108" width="32" height="44" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="216" y="108" width="32" height="44" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="256" y="108" width="32" height="44" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="112" y="108" width="96" height="44" rx="6" fill="rgba(255,255,255,0.07)"/>
      <g stroke="none" fill="currentColor">
        <rect x="38"  y="127" width="20" height="6" rx="1" opacity="0.3"/>
        <rect x="78"  y="127" width="20" height="6" rx="1" opacity="0.3"/>
        <rect x="222" y="127" width="20" height="6" rx="1" opacity="0.3"/>
        <rect x="262" y="127" width="20" height="6" rx="1" opacity="0.3"/>
        <rect x="124" y="114" width="72" height="8" rx="1" opacity="0.9"/>
        <rect x="124" y="126" width="72" height="8" rx="1" opacity="0.3"/>
        <rect x="124" y="138" width="72" height="8" rx="1" opacity="0.3"/>
      </g>
    </g>
  `,

  // Branch drawn as a switch: ..data is the node with a solid blade onto v2 and a ghost blade on v1,
  // each version a block of three file bars, a reader below. Accent: the top bar inside v2.
  'storage-configmap-secret-mount': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g opacity="0.35">
        <rect x="26" y="16" width="96" height="62" rx="7" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
        <g fill="currentColor" stroke="none" opacity="0.3">
          <rect x="40" y="28" width="68" height="7" rx="1"/>
          <rect x="40" y="43" width="68" height="7" rx="1"/>
          <rect x="40" y="58" width="68" height="7" rx="1"/>
        </g>
      </g>
      <rect x="198" y="16" width="96" height="62" rx="7" fill="rgba(255,255,255,0.08)"/>
      <g fill="currentColor" stroke="none">
        <rect x="212" y="28" width="68" height="7" rx="1" opacity="0.9"/>
        <rect x="212" y="43" width="68" height="7" rx="1" opacity="0.3"/>
        <rect x="212" y="58" width="68" height="7" rx="1" opacity="0.3"/>
      </g>
      <path d="M 148 102 L 122 78" opacity="0.25" stroke-dasharray="4 3"/>
      <path d="M 172 102 L 198 78" stroke-width="2"/>
      <rect x="148" y="102" width="24" height="24" rx="4" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="154" y="111" width="12" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <path d="M 160 126 V 140"/>
      <rect x="112" y="140" width="96" height="30" rx="6" fill="rgba(255,255,255,0.06)"/>
      <g fill="currentColor" stroke="none" opacity="0.3">
        <rect x="126" y="147" width="46" height="6" rx="1"/>
        <rect x="126" y="158" width="68" height="5" rx="1"/>
      </g>
    </g>
  `,

  // Two zones compared, three lanes (Pod object, labels file, env var) on one key cell, each a level
  // waveform: the file steps after the object, the env stays flat. Accent: the post-relabel file slab.
  'storage-downward-api-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="68" y="20" width="184" height="40" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="68" y="70" width="184" height="40" rx="7" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <rect x="68" y="120" width="184" height="40" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="78" y="30" width="22" height="20" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="78" y="80" width="22" height="20" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="78" y="130" width="22" height="20" rx="4" fill="rgba(255,255,255,0.10)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="84" y="38" width="10" height="4" rx="1" opacity="0.3"/>
      <rect x="84" y="88" width="10" height="4" rx="1" opacity="0.3"/>
      <rect x="84" y="138" width="10" height="4" rx="1" opacity="0.3"/>
      <rect x="112" y="44" width="46" height="8" rx="1" opacity="0.3"/>
      <rect x="166" y="28" width="74" height="8" rx="1" opacity="0.3"/>
      <rect x="112" y="94" width="66" height="8" rx="1" opacity="0.3"/>
      <rect x="186" y="78" width="54" height="8" rx="1" opacity="0.9"/>
      <rect x="112" y="144" width="128" height="8" rx="1" opacity="0.3"/>
    </g>
  `,

  // Held object: the v1 file stands solid inside the dashed stamp of its deleted directory, the struck
  // ..data pointer leads to v2 while the subPath bind still points at v1. Accent: the live middle row.
  'storage-subpath': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="36" width="90" height="108" rx="10" fill="rgba(255,255,255,0.02)" opacity="0.55" stroke-dasharray="4 3"/>
      <rect x="34" y="52" width="62" height="76" rx="6" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="130" y="36" width="100" height="108" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="140" y="46"  width="80" height="24" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <rect x="140" y="78"  width="80" height="24" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="140" y="110" width="80" height="24" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="147" y1="58"  x2="213" y2="58"  opacity="0.55" stroke-linecap="round"/>
      <line x1="147" y1="122" x2="213" y2="122" opacity="0.55" stroke-linecap="round"/>
      <line x1="110" y1="90" x2="130" y2="90" stroke-dasharray="4 3"/>
      <path d="M 230 58 H 250 M 230 122 H 250" opacity="0.5"/>
      <rect x="250" y="36" width="50" height="108" rx="8" fill="rgba(255,255,255,0.06)"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="152" y="86.5" width="56" height="7" rx="1" opacity="0.9"/>
      <rect x="46" y="76"  width="38" height="6" rx="1" opacity="0.3"/>
      <rect x="46" y="88"  width="28" height="6" rx="1" opacity="0.3"/>
      <rect x="46" y="100" width="34" height="6" rx="1" opacity="0.3"/>
      <rect x="260" y="80" width="30" height="6" rx="1" opacity="0.3"/>
      <rect x="260" y="94" width="22" height="6" rx="1" opacity="0.3"/>
    </g>
  `,

  // Fan, many into one: three source blocks on one grid each fill their own file slab in one mount,
  // told apart by which slots are filled. Accent: the token block top slot, its leg the one solid leg.
  'storage-projected-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30" y="22" width="76" height="52" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="44" y="36" width="48" height="9" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="44" y="51" width="48" height="9" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="122" y="22" width="76" height="52" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="136" y="36" width="48" height="9" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="214" y="22" width="76" height="52" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="228" y="51" width="48" height="9" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="228" y="36" width="48" height="9" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
      <line x1="68" y1="74" x2="68" y2="118" stroke-dasharray="4 3" opacity="0.5"/>
      <line x1="160" y1="74" x2="160" y2="118" stroke-dasharray="4 3" opacity="0.5"/>
      <line x1="252" y1="74" x2="252" y2="118" stroke-width="2"/>
      <rect x="30" y="118" width="260" height="40" rx="8" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="40" y="133" width="56" height="9" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="132" y="133" width="56" height="9" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="224" y="133" width="56" height="9" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
    </g>
  `,

  // Chain of stages, ghosted and bypassed: the claim road is four unmade stations on a dashed arch, and
  // one heavy chord runs Pod spec to the plugin volume. Accent: the inline-volume row of the spec.
  'storage-csi-ephemeral-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 62 107 C 62 -2, 258 -2, 258 107" stroke-dasharray="4 3" opacity="0.5"/>
      <g opacity="0.35">
        <rect x="67" y="46" width="30" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="117" y="19" width="30" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="173" y="19" width="30" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="223" y="46" width="30" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      </g>
      <rect x="42" y="107" width="76" height="54" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="64" y="119" width="32" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="58" y="131" width="44" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="52" y="143" width="56" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="202" y="107" width="76" height="54" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="224" y="119" width="32" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="218" y="131" width="44" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="212" y="143" width="56" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <line x1="118" y1="134" x2="202" y2="134" stroke-width="2"/>
    </g>
  `,

  // Nested containment: the readOnly seal is the outer frame's heavy top edge over sealed entries, and
  // the nested tmpfs frame has no seal. Accent: the 0.9 write bar inside the inner frame.
  'storage-recursive-readonly': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 34 26 H 286 V 146 Q 286 156 276 156 H 44 Q 34 156 34 146 Z" fill="rgba(255,255,255,0.04)"/>
      <line x1="34" y1="26" x2="286" y2="26" stroke-width="3.5"/>
      <g fill="currentColor" stroke="none" opacity="0.3">
        <rect x="56" y="58" width="86" height="10" rx="1"/>
        <rect x="56" y="84" width="86" height="10" rx="1"/>
        <rect x="56" y="110" width="86" height="10" rx="1"/>
      </g>
      <rect x="164" y="52" width="102" height="78" rx="7" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="180" y="72" width="70" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="180" y="96" width="70" height="14" rx="2" fill="currentColor" stroke="none" opacity="0.9"/>
    </g>
  `,

  // Segmented budget bar under its two actors, the Pod and the Kubelet readout. The limit is a change
  // of ground, a stacked jade wash, never a line (R-04). Accent: the emptyDir share past it.
  'storage-ephemeral-storage-eviction': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="96" y1="60" x2="96" y2="86"/>
      <line x1="224" y1="60" x2="224" y2="86"/>
      <rect x="56" y="16" width="80" height="44" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="68" y="29" width="56" height="18" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="184" y="16" width="80" height="44" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="200" y="29" width="48" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="200" y="36" width="48" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="200" y="43" width="48" height="4" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <g fill="rgba(94, 202, 148, 0.022)" stroke="none">
        <path d="M 50 86 H 216 V 146 H 50 Q 40 146 40 136 V 96 Q 40 86 50 86 Z"/>
        <rect x="64" y="86" width="152" height="60"/>
        <rect x="88" y="86" width="128" height="60"/>
        <rect x="112" y="86" width="104" height="60"/>
        <rect x="136" y="86" width="76" height="60"/>
        <rect x="160" y="86" width="48" height="60"/>
        <rect x="184" y="86" width="20" height="60"/>
      </g>
      <rect x="40" y="86" width="240" height="60" rx="10" stroke-width="2"/>
      <rect x="64"  y="106" width="60" height="20" rx="3" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="130" y="106" width="60" height="20" rx="3" fill="currentColor" stroke="none" opacity="0.3"/>
      <path d="M 199 106 H 214 V 126 H 199 Q 196 126 196 123 V 109 Q 196 106 199 106 Z" fill="currentColor" stroke="none" opacity="0.3"/>
      <path d="M 214 106 H 253 Q 256 106 256 109 V 123 Q 256 126 253 126 H 214 Z" fill="currentColor" stroke="none" opacity="0.9"/>
    </g>
  `,

  // Gate across three tiers: two Node frames over one gate band over a disk. Both Pods of Node-1 pass
  // and Node-2's lane stops on the band under an X. Accent: the 0.9 band segment spanning Node-1.
  // Do not dim the X, and keep every lane ending on the band top: the gate grants a node, not a Pod.
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
      <rect x="28" y="90" width="116" height="8" rx="2" fill="currentColor" opacity="0.9"/>
      <line x1="55" y1="66" x2="55" y2="84"/>
      <line x1="117" y1="66" x2="117" y2="84"/>
      <line x1="241" y1="66" x2="241" y2="84" stroke-dasharray="4 3" opacity="0.6"/>
      <line x1="236" y1="89" x2="246" y2="99"/>
      <line x1="246" y1="89" x2="236" y2="99"/>
      <line x1="160" y1="104" x2="160" y2="119"/>
      <ellipse cx="160" cy="128" rx="44" ry="9" fill="rgba(255,255,255,0.10)"/>
      <line x1="116" y1="128" x2="116" y2="160"/>
      <line x1="204" y1="128" x2="204" y2="160"/>
      <path d="M 116 160 A 44 9 0 0 0 204 160" fill="rgba(255,255,255,0.10)"/>
    </g>
  `,

  // Two zones compared: one disk reaches a container through format and mount slabs, the other runs
  // straight to a raw device slab, the missing layers the gap beside it. Accent: the ext4 layer bar.
  'storage-filesystem-vs-block': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="46"  y="12" width="84" height="34" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="56" y="21" width="34" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="66" y="31" width="44" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <line x1="88" y1="46" x2="88" y2="54"/>
      <rect x="56" y="54" width="64" height="16" rx="3" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <rect x="63" y="60" width="50" height="4" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
      <line x1="88" y1="70" x2="88" y2="76"/>
      <rect x="56" y="76" width="64" height="16" rx="3" fill="rgba(255,255,255,0.07)"/>
      <rect x="63" y="82" width="50" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <line x1="88" y1="92" x2="88" y2="110"/>
      <ellipse cx="88" cy="118" rx="42" ry="8" fill="rgba(255,255,255,0.10)"/>
      <path d="M 46 118 V 160 A 42 8 0 0 0 130 160 V 118" fill="rgba(255,255,255,0.10)"/>
      <path d="M 60 136 H 116 M 60 148 H 104" opacity="0.55"/>
      <rect x="190" y="12" width="84" height="34" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="202" y="23" width="60" height="12" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      <line x1="232" y1="46" x2="232" y2="110"/>
      <ellipse cx="232" cy="118" rx="42" ry="8" fill="rgba(255,255,255,0.10)"/>
      <path d="M 190 118 V 160 A 42 8 0 0 0 274 160 V 118" fill="rgba(255,255,255,0.10)"/>
    </g>
  `,

  // Row of peers, one accented: three disk slabs on one baseline, Delete a dashed ghost, the new claim
  // bound to empty rows, and the retained disk still full, its link snapped short. Accent: its data bar.
  'storage-reclaim-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g opacity="0.4" stroke-dasharray="4 3">
        <rect x="36" y="26" width="56" height="24" rx="5" fill="rgba(255,255,255,0.02)"/>
        <rect x="26" y="82" width="76" height="68" rx="7" fill="rgba(255,255,255,0.02)"/>
        <rect x="38" y="95" width="52" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
        <rect x="38" y="113" width="52" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
        <rect x="38" y="131" width="52" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      </g>
      <rect x="132" y="26" width="56" height="24" rx="5" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.45"/>
      <line x1="160" y1="82" x2="160" y2="64"/>
      <path d="M 155 64 H 165" opacity="0.6"/>
      <rect x="122" y="82" width="76" height="68" rx="7" fill="rgba(255,255,255,0.07)" stroke-width="2"/>
      <rect x="134" y="95" width="52" height="6" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="134" y="113" width="52" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="134" y="131" width="52" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="228" y="26" width="56" height="24" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="238" y="35" width="36" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <line x1="256" y1="50" x2="256" y2="82"/>
      <rect x="218" y="82" width="76" height="68" rx="7" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3" opacity="0.5">
        <rect x="230" y="95" width="52" height="6" rx="1"/>
        <rect x="230" y="113" width="52" height="6" rx="1"/>
        <rect x="230" y="131" width="52" height="6" rx="1"/>
      </g>
    </g>
  `,

  // Ring that does not close by itself: Available, Bound, Released as concentric cells, two solid
  // forward edges and a dashed closing edge with a hollow dot, a filled dot on the first edge.
  // The ring centre sits low on purpose so the drawn bounding box lands on the canvas centre.
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

  // The wall: the PV, tied to its named claim by claimRef and volumeName, holds off a small empty rival
  // claim. Accent: the upright bar between them.
  'storage-pv-reservation': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="64" width="56" height="52" rx="6" fill="rgba(255,255,255,0.03)" stroke-opacity="0.6"/>
      <rect x="112" y="50" width="80" height="80" rx="8" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="128" y="78" width="48" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="128" y="94" width="30" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="228" y="58" width="72" height="64" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="244" y="86" width="40" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <line x1="192" y1="83" x2="228" y2="83"/>
      <line x1="192" y1="97" x2="228" y2="97"/>
    </g>
    <rect x="90" y="40" width="8" height="100" rx="2" fill="currentColor" opacity="0.9"/>
  `,

  // Held object: the claim stands solid inside a dashed stamp beside its consumer list, two rows struck
  // and the middle one still holding, the only accent.
  'storage-pvc-protection': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="36" width="100" height="108" rx="10" fill="rgba(255,255,255,0.02)" opacity="0.6" stroke-dasharray="4 3"/>
      <rect x="54" y="52" width="72" height="76" rx="6" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="180" y="36" width="100" height="108" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="190" y="46"  width="80" height="24" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <rect x="190" y="78"  width="80" height="24" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="190" y="110" width="80" height="24" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="197" y1="58"  x2="263" y2="58"  opacity="0.55" stroke-linecap="round"/>
      <line x1="197" y1="122" x2="263" y2="122" opacity="0.55" stroke-linecap="round"/>
      <line x1="140" y1="90" x2="180" y2="90" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="202" y="86.5" width="56" height="7" rx="1" opacity="0.9"/>
      <rect x="66" y="76"  width="48" height="6" rx="1" opacity="0.3"/>
      <rect x="66" y="88"  width="34" height="6" rx="1" opacity="0.3"/>
      <rect x="66" y="100" width="42" height="6" rx="1" opacity="0.3"/>
    </g>
  `,

  // Gauge columns: the request and the device stand at 20Gi while the filesystem is still 5Gi.
  // Accent: the one lit cell at the foot of the filesystem column.
  'storage-volume-expansion': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="56" y="28" width="48" height="124" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="136" y="28" width="48" height="124" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="216" y="28" width="48" height="124" rx="6" fill="rgba(255,255,255,0.04)" stroke-width="2"/>
    </g>
    <rect x="62" y="34" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="62" y="63.5" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="62" y="93" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="62" y="122.5" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="142" y="34" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="142" y="63.5" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="142" y="93" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="142" y="122.5" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="222" y="34" width="36" height="23.5" rx="2" fill="rgba(255,255,255,0.05)"/>
    <rect x="222" y="63.5" width="36" height="23.5" rx="2" fill="rgba(255,255,255,0.05)"/>
    <rect x="222" y="93" width="36" height="23.5" rx="2" fill="rgba(255,255,255,0.05)"/>
    <rect x="222" y="122.5" width="36" height="23.5" rx="2" fill="currentColor" opacity="0.9"/>
  `,

  // Row of peers seated in a seam: three sidecar pillars, stroked on their two sides only, join a
  // control-plane slab of records to a vendor-driver slab. Accent: the centre pillar bar at 0.9.
  // The node-plugin half is left out on purpose: Kubelet calls the node driver with no sidecar.
  'storage-csi-architecture': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="18"  width="272" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="24" y="118" width="272" height="44" rx="8" fill="rgba(255,255,255,0.06)"/>
      <rect x="40"  y="62" width="64" height="56" fill="rgba(255,255,255,0.08)" stroke="none"/>
      <rect x="128" y="62" width="64" height="56" fill="rgba(255,255,255,0.08)" stroke="none"/>
      <rect x="216" y="62" width="64" height="56" fill="rgba(255,255,255,0.08)" stroke="none"/>
      <path d="M 40 62 V 118 M 104 62 V 118" stroke-width="2"/>
      <path d="M 128 62 V 118 M 192 62 V 118" stroke-width="2"/>
      <path d="M 216 62 V 118 M 280 62 V 118" stroke-width="2"/>
      <rect x="54"  y="36" width="36" height="8" rx="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="142" y="36" width="36" height="8" rx="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="230" y="36" width="36" height="8" rx="2" fill="rgba(255,255,255,0.10)"/>
    </g>
    <rect x="54"  y="86" width="36" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="142" y="86" width="36" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="230" y="86" width="36" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="54" y="136" width="212" height="8" rx="2" fill="currentColor" opacity="0.3"/>
  `,

  // Fan, one to many: one CSIDriver object (name bar over three switch rows) repeats its pattern as
  // filled and hollow cells on four volume slabs. Accent: the attachRequired knob at 0.9.
  'storage-csidriver': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g stroke-dasharray="4 3" opacity="0.6">
        <path d="M 136 90 L 196 36 M 136 90 L 196 72 M 136 90 L 196 108 M 136 90 L 196 144"/>
      </g>
      <rect x="32" y="23" width="104" height="134" rx="8" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="46" y="35" width="52" height="8" rx="1" fill="rgba(255,255,255,0.14)" stroke="none"/>
      <line x1="32" y1="52" x2="136" y2="52" opacity="0.5"/>
      <rect x="46" y="75"  width="30" height="6" rx="1" fill="rgba(255,255,255,0.14)" stroke="none"/>
      <rect x="46" y="101" width="30" height="6" rx="1" fill="rgba(255,255,255,0.14)" stroke="none"/>
      <rect x="46" y="127" width="30" height="6" rx="1" fill="rgba(255,255,255,0.14)" stroke="none"/>
      <rect x="84" y="70"  width="40" height="16" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="84" y="96"  width="40" height="16" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="84" y="122" width="40" height="16" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="104" y="74"  width="16" height="8" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="88"  y="100" width="16" height="8" rx="1"/>
      <rect x="104" y="126" width="16" height="8" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="196" y="23"  width="92" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="196" y="59"  width="92" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="196" y="95"  width="92" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="196" y="131" width="92" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <path fill="currentColor" opacity="0.3" stroke="none" d="M208 32h16v8h-16z M260 32h16v8h-16z M208 68h16v8h-16z M260 68h16v8h-16z
        M208 104h16v8h-16z M260 104h16v8h-16z M208 140h16v8h-16z M260 140h16v8h-16z"/>
      <path d="M234 32h16v8h-16z M234 68h16v8h-16z M234 104h16v8h-16z M234 140h16v8h-16z"/>
    </g>
  `,

  // Chain of stages down one centre line: four rungs shortening toward the Pod, the two middle ones
  // dashed for driver-conditional calls. Accent: the 0.9 bar in the bottom rung, NodePublishVolume.
  'storage-attach-mount-chain': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="68"  y="19"  width="184" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="86"  y="57"  width="148" height="28" rx="5" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="104" y="95"  width="112" height="28" rx="5" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="122" y="133" width="76"  height="28" rx="5" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="84"  y="29"  width="152" height="8" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="102" y="67"  width="116" height="8" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="120" y="105" width="80"  height="8" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="138" y="143" width="44"  height="8" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
    </g>
  `,

  // The wall: the Node frame holds the attached device, the dashed Pod waits round an empty mount slot.
  // Accent: the upright status.attached bar at 0.9, overhanging both blocks.
  'storage-volumeattachment': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="34" width="150" height="112" rx="9" fill="rgba(255,255,255,0.06)"/>
      <rect x="38"  y="52" width="118" height="34"  rx="5" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="224" y="56" width="78"  height="68"  rx="7" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="238" y="84" width="50"  height="24"  rx="3" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="52"  y="65"  width="64" height="8" rx="1" opacity="0.3"/>
      <rect x="38"  y="104" width="72" height="8" rx="1" opacity="0.3"/>
      <rect x="38"  y="120" width="48" height="8" rx="1" opacity="0.3"/>
      <rect x="238" y="68"  width="32" height="6" rx="1" opacity="0.3"/>
      <rect x="193" y="22"  width="10" height="136" rx="2" opacity="0.9"/>
    </g>
  `,

  // Stack of layers as an offset cascade of mount lists (plugin, host, Pod A): one entry runs through
  // plugin and host and stops as a dashed hollow on the private back sheet. Accent: its host echo.
  'storage-mount-propagation': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 136 36 V 26 Q 136 20 142 20 H 280 Q 286 20 286 26 V 124 Q 286 130 280 130 H 234 V 42 Q 234 36 228 36 H 136 Z" fill="rgba(255,255,255,0.03)"/>
      <path d="M 84 52 V 42 Q 84 36 90 36 H 228 Q 234 36 234 42 V 140 Q 234 146 228 146 H 182 V 58 Q 182 52 176 52 H 84 Z" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="32" y="52" width="150" height="110" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="242" y="116" width="36" height="8" rx="1" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <g opacity="0.5">
        <line x1="50" y1="72" x2="50" y2="120"/>
        <line x1="50" y1="86"  x2="58" y2="86"/>
        <line x1="50" y1="103" x2="58" y2="103"/>
        <line x1="50" y1="120" x2="58" y2="120"/>
      </g>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="148" y="25"  width="24"  height="6" rx="1" opacity="0.3"/>
      <rect x="242" y="50"  width="30"  height="8" rx="1" opacity="0.3"/>
      <rect x="242" y="70"  width="24"  height="8" rx="1" opacity="0.3"/>
      <rect x="96"  y="41"  width="24"  height="6" rx="1" opacity="0.3"/>
      <rect x="190" y="70"  width="30"  height="8" rx="1" opacity="0.3"/>
      <rect x="190" y="90"  width="24"  height="8" rx="1" opacity="0.3"/>
      <rect x="190" y="116" width="36"  height="8" rx="1" opacity="0.9"/>
      <rect x="44"  y="62"  width="28"  height="6" rx="1" opacity="0.3"/>
      <rect x="60"  y="82"  width="56"  height="8" rx="1" opacity="0.3"/>
      <rect x="60"  y="99"  width="48"  height="8" rx="1" opacity="0.3"/>
      <rect x="60"  y="116" width="110" height="8" rx="1" opacity="0.3"/>
    </g>
  `,

  // Branch into a rack: one bright request forks into two candidate wires that both land on a rack of
  // dark sockets with nothing free. Sockets stay dark (0.03): they are holes, not contents.
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

  // Closed circuit: two identical claimant blocks are stations on a dashed elliptical track with
  // clockwise chevrons and the volume locked inside. The arcs end on the blocks and are masked by
  // them, since a translucent fill shows a line beneath it.
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

  // Row of peers as a listing: one check on the top directory stands in for the walk below. The scan
  // stroke stops level with the root row, its dashed rest skipping a field of 0.3 slivers.
  // Accent: the owner cell of the root row.
  'storage-fsgroup-ownership': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="64" y="14" width="192" height="152" rx="10" fill="rgba(255,255,255,0.05)"/>
      <rect x="94" y="26" width="148" height="24" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="104" y="34" width="44" height="8" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="186" y="34" width="46" height="8" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="94" y="60" width="148" height="96" rx="5" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
      <path fill="currentColor" stroke="none" opacity="0.3" d="M104 67h58v4h-58z M206 67h26v4h-26z M104 75.6h40v4h-40z M206 75.6h26v4h-26z M104 84.2h66v4h-66z M206 84.2h26v4h-26z M104 92.8h48v4h-48z M206 92.8h26v4h-26z M104 101.4h34v4h-34z M206 101.4h26v4h-26z
        M104 110h62v4h-62z M206 110h26v4h-26z M104 118.6h44v4h-44z M206 118.6h26v4h-26z M104 127.2h54v4h-54z M206 127.2h26v4h-26z M104 135.8h38v4h-38z M206 135.8h26v4h-26z M104 144.4h60v4h-60z M206 144.4h26v4h-26z"/>
      <line x1="80" y1="26" x2="80" y2="50" stroke-width="2"/>
      <line x1="80" y1="58" x2="80" y2="156" stroke-dasharray="4 3" opacity="0.5"/>
    </g>
  `,

  // Two machine frames, a dead dim one and a live one with a dashed Pod, the volume between them.
  // An attached:true badge rides the wire to the dead node, and a clock (the signature, the
  // force-detach wait) rides the wire to the live one.
  'storage-detach-on-node-failure': `
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

  // Exclusive pair: the claim and the one disk that fits, joined by opposed volumeName and claimRef
  // lanes inside a dashed capsule. Two identical dim rejected disks sit outside on dashed lanes.
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
        <g stroke-dasharray="4 3">
          <path d="M 48 98 V 42 H 104"/>
          <path d="M 272 98 V 42 H 216"/>
        </g>
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

  // Fan from a class roster: two claims carry stamped copies of the default row, the third stands
  // unconnected with its slot empty. Accent: the default row of the roster.
  'storage-default-storageclass': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="122" y="14" width="76" height="60" rx="8" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="130" y="26" width="52" height="8" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="130" y="40" width="60" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="130" y="54" width="40" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <g stroke-dasharray="4 3">
        <path d="M 160 74 V 106"/>
        <path d="M 122 44 H 62 V 106"/>
      </g>
      <rect x="24" y="106" width="76" height="60" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="32" y1="120" x2="60" y2="120" opacity="0.5"/>
      <rect x="28" y="136" width="68" height="20" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="32" y="142" width="52" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="122" y="106" width="76" height="60" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="130" y1="120" x2="158" y2="120" opacity="0.5"/>
      <rect x="126" y="136" width="68" height="20" rx="3" fill="rgba(255,255,255,0.03)"/>
      <rect x="130" y="142" width="52" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="220" y="106" width="76" height="60" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="228" y1="120" x2="256" y2="120" opacity="0.5"/>
      <rect x="224" y="136" width="68" height="20" rx="3" fill="rgba(255,255,255,0.03)"/>
    </g>
  `,

  // Row of peers, one accented: three columns of Pod over claim over bound PV slab, the middle Pod a
  // dashed ghost while its claim stays. Accent: the data-web-1 name plate. No cylinder on purpose.
  'storage-volumeclaimtemplates': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32" y="34" width="56" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="232" y="34" width="56" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="132" y="34" width="56" height="28" rx="5" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
      <path d="M 60 62 V 84 M 260 62 V 84"/>
      <path d="M 160 62 V 84" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="21" y="84" width="78" height="44" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="121" y="84" width="78" height="44" rx="6" fill="rgba(255,255,255,0.10)" stroke-width="2"/>
      <rect x="221" y="84" width="78" height="44" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="31" y="94" width="58" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="131" y="94" width="58" height="8" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="231" y="94" width="58" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <path d="M 60 43 V 53 M 60 108 V 118 M 254 43 V 53 M 260 43 V 53 M 266 43 V 53 M 254 108 V 118 M 260 108 V 118 M 266 108 V 118 M 157 108 V 118 M 163 108 V 118" stroke-width="2"/>
      <path d="M 157 43 V 53 M 163 43 V 53" stroke-width="2" opacity="0.7"/>
      <rect x="21" y="134" width="78" height="10" rx="3" fill="rgba(255,255,255,0.07)"/>
      <rect x="121" y="134" width="78" height="10" rx="3" fill="rgba(255,255,255,0.07)"/>
      <rect x="221" y="134" width="78" height="10" rx="3" fill="rgba(255,255,255,0.07)"/>
    </g>
  `,

  // Two zones compared as a matrix: Retain and Delete columns, each split whenScaled over whenDeleted
  // into rosters of claim bars, Delete losing bars as dashed hollows. Accent: the Delete header bar.
  'storage-pvc-retention-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="44" y="16" width="108" height="148" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="168" y="16" width="108" height="148" rx="10" fill="rgba(255,255,255,0.04)" stroke-width="2"/>
      <rect x="68" y="27" width="60" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="192" y="27" width="60" height="8" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="54" y="46" width="88" height="50" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="54" y="106" width="88" height="50" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="178" y="46" width="88" height="50" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="178" y="106" width="88" height="50" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="68" y="53" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <rect x="68" y="67" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <rect x="68" y="81" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <rect x="68" y="113" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <rect x="68" y="127" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <rect x="68" y="141" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <rect x="192" y="53" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <rect x="192" y="67" width="60" height="8" rx="2" fill="rgba(255,255,255,0.18)"/>
      <g stroke-dasharray="3 2" opacity="0.5">
        <rect x="192" y="81" width="60" height="8" rx="2"/>
        <rect x="192" y="113" width="60" height="8" rx="2"/>
        <rect x="192" y="127" width="60" height="8" rx="2"/>
        <rect x="192" y="141" width="60" height="8" rx="2"/>
      </g>
    </g>
  `,

  // The Pod's zone, bright and centred, among faint sibling zones, its volume provisioned into the same
  // zone directly beneath it.
  'storage-volume-binding-mode': `
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

  // Ghost zone to solid as two segmented strips, live volume over snapshot, pointer ticks for shared
  // blocks. Accent: the one snapshot cell holding its own data, the old block C.
  'storage-volume-snapshot': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28" y="22" width="264" height="52" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="28" y="106" width="264" height="52" rx="8" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="38" y="30" width="52" height="36" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="49" y="45" width="30" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="102" y="30" width="52" height="36" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="113" y="45" width="30" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="166" y="30" width="52" height="36" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="177" y="45" width="18" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="230" y="30" width="52" height="36" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="241" y="45" width="30" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <line x1="64" y1="74" x2="64" y2="106" stroke-dasharray="2 3" opacity="0.6"/>
      <line x1="128" y1="74" x2="128" y2="106" stroke-dasharray="2 3" opacity="0.6"/>
      <line x1="256" y1="74" x2="256" y2="106" stroke-dasharray="2 3" opacity="0.6"/>
      <rect x="38" y="114" width="52" height="36" rx="4" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="102" y="114" width="52" height="36" rx="4" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="166" y="114" width="52" height="36" rx="4" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="177" y="129" width="30" height="6" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="230" y="114" width="52" height="36" rx="4" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.6"/>
    </g>
  `,

  // Two zones compared: two equal sheets of field bars repeating row for row, no line across the gap
  // (no lineage). Accent: the grown storage row of the clone.
  'storage-pvc-clone': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="20" width="104" height="140" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="54" y="32" width="44" height="8" rx="1" fill="rgba(255,255,255,0.10)" stroke="none"/>
      <line x1="40" y1="50" x2="144" y2="50" opacity="0.5"/>
      <rect x="54" y="64" width="52" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="54" y="82" width="30" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="54" y="100" width="64" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="54" y="118" width="40" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="54" y="136" width="46" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="176" y="20" width="104" height="140" rx="8" fill="rgba(255,255,255,0.07)"/>
      <rect x="190" y="32" width="44" height="8" rx="1" fill="rgba(255,255,255,0.10)" stroke="none"/>
      <line x1="176" y1="50" x2="280" y2="50" opacity="0.5"/>
      <rect x="190" y="64" width="52" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="190" y="82" width="30" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="190" y="100" width="64" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="190" y="118" width="72" height="7" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="190" y="136" width="46" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
    </g>
  `,

  // Two zones compared, asymmetric on purpose: an ordinary claim outside its leaving Pod, against one
  // heavy Pod frame holding app, claim and disk. Accent: the name plate of the claim inside the Pod.
  'storage-generic-ephemeral-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="24" width="76" height="40" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="52" y="38" width="52" height="12" rx="2" fill="rgba(255,255,255,0.05)" stroke-dasharray="4 3" opacity="0.7"/>
      <path d="M 78 64 V 90" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="38" y="90" width="80" height="48" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="48" y="100" width="60" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="48" y="116" width="40" height="5" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="48" y="126" width="50" height="5" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="38" y="146" width="80" height="12" rx="3" fill="rgba(255,255,255,0.07)"/>
      <rect x="154" y="20" width="128" height="140" rx="10" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="170" y="34" width="96" height="22" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="180" y="42" width="40" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="170" y="68" width="96" height="52" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="180" y="78" width="76" height="8" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="180" y="94" width="48" height="5" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="180" y="104" width="60" height="5" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="170" y="132" width="96" height="14" rx="3" fill="rgba(255,255,255,0.07)"/>
    </g>
  `,

  // Branch: the claim roster forks, a dashed leg stopped before a ghosted Node with a short bar, a
  // solid leg to the Node with the long bar. Accent: that long bar.
  'storage-csi-capacity-tracking': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="62" width="80" height="56" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="36" y="78" width="52" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="36" y="94" width="32" height="7" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <path d="M 104 90 H 132 M 132 44 V 136 M 132 136 H 196"/>
      <path d="M 132 44 H 196" stroke-dasharray="4 3" opacity="0.7"/>
      <path d="M 168 32 V 56" stroke-width="2.4"/>
      <rect x="196" y="20" width="96" height="48" rx="7" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3" opacity="0.7"/>
      <rect x="208" y="40" width="16" height="8" rx="1" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="196" y="112" width="96" height="48" rx="7" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="208" y="132" width="72" height="8" rx="1" fill="currentColor" opacity="0.9" stroke="none"/>
    </g>
  `,
};
