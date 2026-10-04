// Design notes: ./CARDS.md, under each card id as a "### poster" subsection.
// The storage posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  // Ghost zone to solid zone: the shelf is empty, so the volume is built to order for one claim. Left,
  // a dashed shelf of three ghosted empty slots; right, the new volume, solid at stroke 2, its two spec
  // rows (size, class) at 0.3 and its claimRef row at 0.9, the accent: it arrives already stamped.
  // Rejected: a claim, gear and dashed cylinder in a row, which topped out at 0.05 and drew nouns, and
  // any cylinder at all, since the PVC to PV Binding poster beside it is built on three.
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

  // Ring of states round a hub: four equal container stations on a broken ellipse (seed dashed and
  // exited, app with a small crash X, app restarted, log-shipper with a roster) orbit the volume, the
  // heaviest block, whose 0.9 file row is the accent: the file stays while containers come and go.
  // Ink 30..290 x 18..162 is centred on 160,90. Rejected: the card's one-row Pod (a miniature), the
  // old Pod-over-cylinder stack. R-12 open: the note lives here.
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

  // Rank ladder on its side: the farther data lives from the process, the longer it lives. Four
  // lifetime bars (container, Pod, Node, API object) leave the Pod in an even 52 step inside one
  // wide window, 24..296 centred on 160, and the longest stops 14 short of its wall. Accent is its
  // inner bar. Rejected: the card's tier map, a cylinder, an axis, a bar crossing the window edge.
  'storage-volume-data-homes': `
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

  // Stack of layers as an offset cascade: three equal sheets stepped 24 right and 18 up, each hiding
  // two thirds of the one behind, so what shows of a lower layer is only what the upper leaves bare.
  // The two image sheets keep uniform 0.3 file bars in their exposed strips. The front upperdir sheet
  // (stroke 2) holds new file, copy-up and a hollow whiteout bar on one left edge. Accent: the 0.9
  // new-file bar.
  // Rejected: a row/column grid (a copy of the card) and dashed outlines for the short-lived layer.
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

  // Nested containment: one wide Pod frame centred on the canvas holding BOTH images, the light app
  // image on the left and the dense weights image on the right, with the read-only mount as the one
  // line between them. Accent: the 0.9 head bar of the weights image. Rejected: the notched socket
  // with the weights docking from outside (the insertion read cost the mount, which is the subject),
  // two zones stacked (the storage-subpath silhouette). R-12 open: the note lives here.
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

  // Two zones compared, mirrored about the centre: the same Pod on two identical Node frames joined
  // by a dashed link (the replacement), two containers mounting one shared tank. On Node 1 the tank
  // still holds its three files, the 0.9 accent. On Node 2 the replacement Pod finds the same tank
  // empty, three dashed slots. Rejected: three gauge columns on a split floor (two bridged, one
  // lone), lopsided with a bare right half.
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

  // Stack of layers, pierced: one Node frame, because the bytes never leave this Node. A ghost Pod
  // on top (dashed, 0.5) drops one narrow solid shaft into the Node filesystem band, four system
  // path cells around the wide /data/app cell under the shaft. The shaft is 12 wide and clears the
  // Pod floor and the cell top by 6 either end, so it reads as a link rather than as a third block. The 0.9 accent is the top bar in that
  // cell: the Pod is faint and the data it wrote is the brightest thing left. The old strata ordered
  // by exposure are rejected: they said what the last step says, not what the card is about.
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

  // Branch, drawn as a switch: two complete versions are its contacts, each a block of three file
  // bars, and ..data is the node between them with one solid blade onto v2 and a ghost blade left
  // on v1. The 0.9 accent is the top bar inside v2, the file the reader gets after the throw, and
  // the live blade carries its weight in stroke rather than in brightness, which a 200px wide
  // diagonal cannot hold. Each blade runs corner to corner, a top corner of the node to the near
  // bottom corner of its version block, so the two sit at 45 degrees and mirror each other. The
  // reader below is furnished with a name bar and its slot: an empty box said nothing about what
  // the switch is for.
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

  // Two zones compared, stacked as three lanes on one x, accent on the file lane's post-relabel slab.
  // One label, three copies: the Pod object, the labels file and the env var, each lane opening on
  // the same key cell. The value is a two-level waveform of uniform slabs, a LEVEL change and never
  // a size change: the object steps, the file steps a little after it, the env stays one flat slab.
  // Rejected: the card's two listings across Kubelet (a miniature, R-10, and a rhyme of image-volume).
  // The steps read from alignment alone, with no join, guide or dash. Ink 68..252 x 20..160, centred.
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

  // Held object, accent on the live middle row: the v1 file stands solid inside the dashed stamp of
  // its deleted directory, and the reference list beside it is what keeps it. The ..data pointer and
  // the web read are struck and lead right to the solid v2 block, the subPath bind alone still points
  // left at v1. Rejected: two value-over-time traces (shared the pair silhouette with the CSI
  // neighbour), the card's volume-in-Pod layout (a miniature). Ink 20..300 x 36..144, centred.
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

  // Fan, many into one: three unlike sources fill one mount, and only the token one keeps being
  // rewritten. Everything sits on ONE GRID and nothing is placed by eye. Three columns on centres
  // 68 / 160 / 252, each carrying a 76 wide source block, a leg and a 56 wide file slab in the
  // plank, so every source stands over the file it fills. Inside every block the same two slots,
  // x+14 and y 36 / 51, and what tells the sources apart is WHICH slots are filled rather than
  // where they sit: both for the ConfigMap, the top one alone for downwardAPI, and for the
  // serviceAccountToken both again, furnished exactly as the ConfigMap block is, with the top one
  // BRIGHT. The hero is that top slot at 0.9, with every loser on one 0.3 tier
  // (R-07), and the token leg is the one solid heavy leg against two dashed ones. Ink 30..290 x
  // 22..158 is centred on 160,90 exactly. Rejected: drawing the version it replaced as a dashed
  // outline in the lower slot, and before that stepping it down and right
  // out of its slot, which read as scatter beside three otherwise ruled columns; one directory
  // frame holding a three row listing, which the author turned down; a chain of equal links run
  // through the frame edges, which smudged into one grey strip at true size; the card's listing over
  // a time axis, which is a miniature (R-10); and two token lifetimes overlapping on one clock,
  // which says the rotation and loses the sources.
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

  // Chain of stages, ghosted and bypassed: the claim road (StorageClass, PVC, PV, attach) is four
  // unmade stations on a dashed arch nobody walks, and one heavy chord runs under it face to face on
  // the mid line, Pod spec to the volume the plugin makes. Both blocks hold the same centred rows,
  // graded by width, the accent the inline-volume row of the spec. Ink 42..278 x 19..161.
  // Rejected: the ghost row over a Node frame (a miniature), a cylinder (reads as the PV it denies).
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

  // Nested containment: the readOnly seal lies on the top mount and the mount nested under it stays
  // writable. Accent: the 0.9 write bar inside the inner tmpfs frame. The seal is the outer frame's
  // own square top edge at 3.5, over three sealed 0.3 entries, and the inner frame has no seal of its
  // own. Rejected: a frameless mount tree with end caps on its leaves (bare lines beside the reference
  // set), a lid overhanging the frame and a dashed lid over the inner frame (both read as guides).
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

  // Segmented budget bar under its two actors: the Pod (its app box inside) and the Kubelet (a
  // readout of three counts), each tied to one gauge holding the Pod sum, writable, log and emptyDir.
  // The limit is a change of ground, a jade wash of seven stacked layers that thickens toward the
  // limit and tapers off at it, never a line (R-04 admits no gradient).
  // Accent: the emptyDir share past it. Rejected: a cracked barrier line and a torn slot.
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

  // Abstract, not the literal diagram, built around the one thing the card is about: the access
  // mode is a GATE, and the gate answers per NODE rather than per Pod. Three tiers, the same descent
  // the diagram uses: two node enclosures on top, one full-width gate band across the middle, one
  // disk below.
  // Three Pods ask, each lane leaving the NODE frame under its Pod, since the node is what the gate
  // answers. Two lanes reach the band and one leaves it for the disk; the third stops dead ON the
  // band under an X and never re-emerges. The surprise is carried by the
  // left node: BOTH of its Pods pass, because the gate grants a node, not a Pod.
  // Below the band ONE lane leaves, straight down the disk column, and it does not trace back to
  // either Pod. Two requests go in and a single attachment comes out, which is exactly what "the
  // mode grants a node, not a Pod" means. Two lanes out would say each Pod got its own.
  // The accent is INSIDE the gate: a 0.9 segment spanning Node-1, level with the X under Node-2, so
  // the band itself reads open for one node and shut for the other.
  // DO NOT dim the X. The refused lane is dashed and its node is dim, but the X is drawn at full
  // strength: a dim refusal reads as an unfinished drawing rather than as a denial.
  // All three lanes END on the band top edge rather than crossing it: every attach is a request made
  // TO the gate, and a line drawn straight through would say the gate is scenery the traffic ignores.
  // No arrowheads (R-08): where each line stops says the direction.
  // Node widths stay close on purpose, so the difference reads as "which node holds it", never as
  // size.
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

  // Two zones compared, accent on the ext4 layer: the same disk reaches one container through
  // two layers and the other bare. The left column stacks a format slab (bright bar, the filesystem
  // only it gets) and a mount slab (0.3) between a container holding a directory tree and a disk
  // holding file lines. The right column runs one straight line from an empty disk to a container
  // holding one raw device slab, and the missing layers are the gap beside that line.
  // WHY NOT arrowheads on the two runs (R-08), ghost slots on the right (the empty height already
  // says it), or a fork out of one disk: these are two claims, and a fork is reclaim-policy below.
  // Column centres 88 and 232 keep more air outside the pair than inside it, so it reads as a pair.
  'storage-volume-mode': `
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

  // Row of peers, one accented: Retain keeps the disk and hands it to nobody. Three disks on one
  // baseline, drawn as slabs of data rows rather than cylinders. Left, Delete: a dashed ghost, its
  // claim gone with it. Right, the new claim of the same class: bound by a solid link to a slab of
  // EMPTY dashed rows. Centre, the hero: the retained disk still full, its accent data bar at 0.9,
  // its link to the deleted claim snapped short of the ghost tab (the stale claimRef). Rejected: the
  // claim, band and two cylinders it replaced, a miniature of the redrawn card (R-10) at 0.10 ink.
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

  // Abstract, not the literal diagram: the machine drawn as a RING that does not close by itself.
  // Available, Bound and Released sit on the cycle. The two forward edges are solid because the
  // control plane walks them unasked, and the closing edge back up to Available is dashed because
  // that is the one hop nothing performs on its own. The point is that the eye completes the ring
  // and the drawing does not, so the dashed quarter reads as a gap in a circle rather than as one
  // more arrow.
  // WHY NOT the diagram in miniature, four cells in a row with a back-arc: it says state machine but
  // not what is interesting about this one.
  // Failed is deliberately NOT here, though it is a real phase and the card teaches it. It only fits
  // as a faint satellite hung outside the ring, and that costs more than it pays: a dim shape on one
  // side pads the bounding box without carrying visual weight, which pushes the composition
  // off-centre. Without it the ring is symmetric about x=160 by construction.
  // TWO dots, and the difference between them is the whole idea. The FILLED one rides the first
  // solid edge, a hop the control plane is making right now. The HOLLOW one sits on the dashed edge,
  // a hop that is possible and is not happening, because nothing takes it without a person. The
  // dashed edge is drawn as TWO arc segments with a gap where that hollow dot sits: run as one path
  // it passes straight through the dot and renders it as a struck-out circle.
  // The nodes are concentric cells rather than plain circles: at poster scale three empty outlines
  // go thin and washed out, and a core gives each weight without adding a shape the reader has to
  // decode. Available carries the heavier stroke and brighter fill because it is where the volume
  // is at rest.
  // Ring centred on (160, 99), R=62, r=18 nodes, node angles at -90, 30 and 150. The 99 is not a
  // typo for 90: the top node sticks a full node radius above the ring while the bottom is bare arc,
  // so the circle has to sit low for the drawn bounding box to land on the canvas centre.
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

  // The wall, accent on the upright bar: the reservation pairs the volume with one named claim and
  // holds every other claim off. The rival is the smallest, lightest block, solid because it is a
  // real claim, and empty because it gets nothing. The PV carries its retained data as two bars of
  // unequal length and is tied to the claim by two lines, claimRef and volumeName. Rejected: the card
  // in miniature, a padlock glyph, a dashed rival (which reads as not created yet) and any cylinder.
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

  // Held object: the claim is marked for deletion and stays, because one Pod still uses it. Left, the
  // claim stands solid inside a dashed stamp of the same footprint as the consumer list on the right,
  // two rows cleared and struck, the middle one still holding and carrying the only accent. Rejected:
  // the padlock on a dashed claim over a cylinder, which drew the finalizer and never the Pod that is
  // the whole reason it holds, and an X across the claim, which reads as deleted.
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

  // Gauge columns: the request and the real device both stand at 20Gi while the filesystem on it is
  // still 5Gi, the settled frame between the two phases, which is the question the card answers.
  // Accent: the one lit cell at the foot of the filesystem column, whose frame carries the 2 stroke.
  // The cylinder with a raised ceiling it replaces said a disk got bigger, which is not the subject.
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

  // Row of peers, one accented, seated in the seam between two stacked slabs. The sentence: on the
  // controller side, the sidecars are the only thing joining plain objects to a vendor driver that
  // core never learned. Control-plane slab on top, vendor-driver slab below, three sidecar pillars
  // sharing an edge with both and open air between them. The glyphs change once per tier: hollow
  // records (objects), a solid bar per pillar (translation), one continuous bar (the one driver).
  // Hero: the centre pillar bar at 0.9, the sidecar the card follows, the other two at 0.3.
  // Deliberate: a pillar has no top, bottom or corner radius of its own. Only its two sides are
  // stroked, run slab to slab, so the slab edges close it and it reads as joining them. Boxed
  // pillars with rounded corners read as three boxes parked in a gap.
  // The node-plugin half is left out on purpose: that side has no sidecar in the path, since Kubelet
  // calls the node driver directly, so drawing it would falsify the sentence. Three pillars, not the
  // card's four, because the count is "as needed" and three centres the accent.
  // Rejected: the old literal miniature (four sidecars, bus, driver, Node frame, cylinder), R-10.
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

  // Fan, one to many, accent on the attachRequired knob: one CSIDriver object, named after its
  // driver, sets the same switches on every volume that driver serves. The object is a name bar
  // over three switch rows (attachRequired on, podInfoOnMount off, fsGroupPolicy on), and four equal
  // volume slabs repeat that pattern as filled / hollow / filled cells, the switch rows read top to
  // bottom as the cells read left to right. Hero: the attachRequired knob at 0.9, the other on
  // knob and every filled cell on one 0.3 tier. fsGroupPolicy is not a boolean (File / None / the
  // RWO default): its knob stands for "applies here", and nothing else on the poster claims more.
  // The four dashed legs leave one point on the object face and land mid face on each slab. The
  // group is 32..288 x 23..157, so the margins are 32 left and right and 23 top and bottom. The
  // cells are two paths (filled, hollow) because their repetition is the sentence, the way the
  // fsgroup-ownership slivers are one path.
  // Rejected: two driver objects compared (the card diagram itself, R-10, and a pair beside the
  // volumeattachment wall), and a ghost object defaulting to attach (the second clause, two posters).
  // The other two storage fans, projected-volume and default-storageclass, run top down, so this
  // one runs left to right.
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

  // Chain of stages, run DOWN one centre line as four rungs that shorten by 36: up to four calls,
  // each bringing the volume one scope closer to the Pod (provider, Node, the Node staging path,
  // the Pod directory). Hero: the 0.9 bar in the bottom rung, NodePublishVolume, the one call every
  // mount needs, the other three carrying the same bar at 0.3. The two middle rungs are dashed for
  // the two DRIVER-capability conditions: ControllerPublish only where attach is required, NodeStage
  // only with STAGE_UNSTAGE_VOLUME. Rung 1 stays solid because its condition is the claim, not the
  // driver: CreateVolume runs for a dynamically provisioned claim.
  // Rejected: four equal bars bracketed into a dashed leg to a cylinder (the neighbour
  // storage-volumeattachment then ran a dashed leg into a cylinder, and nothing in it was bright),
  // and the card ladder of four equal numbered rungs beside its topology, a literal copy (R-10).
  'storage-csi-attach-mount': `
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

  // The wall: the device is already on the Node and one field still stands between it and the Pod.
  // Hero: the upright status.attached bar at 0.9, overhanging both blocks so it belongs to neither.
  // Left, the Node frame holding the attached device as a solid slab (stroke 2) with its name at 0.3
  // and two node rows. Right, the smaller Pod, dashed, around a dashed mount slot it cannot fill yet.
  // Rejected: the hub of actors around the record (a component map, one verb short of the claim) and
  // a ring of object states (says the lifecycle and loses the disk-present, mount-blocked contrast).
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

  // Stack of layers as an offset cascade, one mount list per sheet: the plugin in front, the host
  // behind it, Pod A at the back, each a findmnt tree with its own root. One entry runs through the
  // plugin and host sheets on a single line, a peer group, and stops at the private back sheet as a
  // dashed hollow. Accent: the 0.9 echo of the entry in the host strip, on the stroke 2 sheet.
  // Rejected: two zones stacked (four equal tables, flat) and overlapping sets (no private third).
  'storage-mount-path-chain': `
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

  // A request that branches looking for somewhere to go, and a rack of sockets with nothing free
  // at the end of every branch. The shape is a scheduling DECISION, which is what makes this card
  // different from its six siblings: they all start with a Pod that already has a node.
  //
  // The sockets are drawn DARK (0.03) rather than as bright cells. They are holes, not contents,
  // and a rack of dark recesses in a barely-lit frame reads as hardware at a glance, where a 0.20
  // fill reads as eight grey tiles and flattens the lower half into a keypad. Dark sockets also
  // free the brightest fill for the block the sentence is about: the request at the top, the one
  // thing that wants something and cannot have it.
  //
  // The branch is doing real work: one request forks into two candidates and both wires run the
  // full way down to the rack, meeting its top edge at x=112 and x=208, so the decision layer
  // above is fully wired to the hardware below. Everything above the rack is the decision,
  // everything below it is the machines, and the four dashed wires connect them at one weight.
  //
  // Content sits 13..167 in a 180 tall box and is symmetric about x=160: rack side margins agree
  // at 15, socket rows and columns are both gapped at 6, and the sockets clear the rack by 9 above
  // and below.
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

  // The disk locked inside a closed circuit of waiting. The card's subject is not that a node
  // died, it is that nothing is broken at all: the controller will not delete the attachment while
  // the old Pod runs, and the rollout will not delete that Pod until the new one is ready, which it
  // cannot be without the disk. That is a CYCLE, and a cycle is a shape, so the poster draws it
  // literally: a continuous dashed track with the volume sitting inside it, unable to leave.
  //
  // WHY NOT one solid claim against one dashed one: the same picture as half the catalog, saying
  // only "one is denied", putting the emphasis on a rejection when the interesting part is that
  // both claimants are legitimate and alive. The two blocks on the ring are IDENTICAL, at equal
  // weight, because neither of them is the problem.
  // WHY NOT a break in the track: an opening promises a way out, and there is not one until
  // something outside the loop (Recreate) cuts it.
  //
  // The loop is two ARCS BETWEEN the blocks, not one continuous track with the blocks laid over it.
  // That fails in a way only a render shows: a rounded rect passing behind a translucent box still
  // shows its dashes straight through the fill, so the line reads as crossing the block rather than
  // arriving at it. Arcs that START and END on the block edges make the two blocks stations ON the
  // cycle.
  //
  // Both arcs run to the CENTRE of each block and the track is MASKED by the two block rectangles,
  // which cannot be done with z-order: the blocks are filled translucent white, so a dashed line
  // underneath still shows through. One ellipse, rx 100, ry 59, centred on (160, 90), so the
  // apexes land on 31 and 149. The two chevrons sit there, top pointing right and bottom pointing
  // left, which resolves to clockwise and gives the eye a direction to travel and never finish.
  //
  // The disk carries 0.04, the fill the rest of the storage posters give a cylinder body. At 0.14
  // it reads as a different material from every sibling in the grid.
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

  // Row of peers, one accented, stood up as a listing: one check on the top directory stands in for a
  // walk of the millions of entries below it. The accent is the owner cell of the root row, at 0.9.
  // The heavy scan stroke stands level with that row and stops, and its dashed continuation below is
  // the walk OnRootMismatch skips, past a field of slivers at 0.3 that is the population, not rows.
  // Rejected: a box over a three-row listing with a 0.20 / 0.13 / 0.07 ramp, a miniature of the card
  // that read as absent (brightest 0.20) and shared a pair silhouette with csi-ephemeral-volume.
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

  // A technical diagram curated to one sentence: a live VolumeAttachment still binds the volume to
  // a DEAD node, and the move to the live node is gated by a timeout. Two machine frames stand left
  // and right: the left one dim with a dark status LED (failed, kubelet silent), the right one lit
  // with its Pod still dashed (pending, waiting on the disk). The volume sits between them with the
  // faint 0.04 body fill the rest of the poster cylinders use, so it reads by its jade rim, not as
  // a grey slab. Both wires LEAVE THE CYLINDER HORIZONTALLY and are identically dashed, then turn
  // up into the node above: only the badge versus the clock, and the dim versus the lit node, tell
  // the two sides apart. A small badge carrying an attached:true check rides the left wire to the
  // dead node, the attachment that has not been deleted, and a CLOCK sits on the right wire to the
  // live node, the roughly six minute force-detach wait. The clock is the signature: the whole card
  // is that a healthy-looking cluster still waits out a timer. Both wires break cleanly around the
  // badge and the clock. Content spans y=28..158.
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

  // Abstract, not the literal diagram. The whole point of binding is that it is TWO-WAY and it is
  // EXCLUSIVE, so both are drawn: the claim document and the one disk that fits are joined by a pair
  // of opposed lanes (volumeName going down, claimRef coming back up), and a dashed capsule closes
  // around just those two, sealing them off as a pair. The two disks that lost sit outside the
  // capsule, dim, each tied to the capsule by a dashed right-angle lane: checked and turned down.
  // The two rejected disks are deliberately IDENTICAL in size: making them differ reads as an
  // accidental mismatch rather than as meaningful, and the eye should be spending its attention on
  // the pair inside the capsule. All three disks share one baseline (y=146) and near-identical tops,
  // so the centre one stands out by width and fill, not by height.
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

  // Fan, accent on the default row of the class roster. A claim that leaves the class out gets the
  // default written in, a claim that says empty gets none. The roster hub holds three uniform bars,
  // one per class. The two claims it reaches carry a stamped bar of the default row's exact length
  // and inset, so they read as copies of it, and the right claim stands unconnected with its slot
  // left empty. Rejected: two ticks for the "" inside that slot, which read as a pause icon at true
  // size, the unreached claim in the middle, which echoes the card's own admission buses, and any
  // cylinder, which both neighbours already draw.
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

  // Row of peers, one accented: each ordinal keeps its own claim, even when its Pod is gone.
  // Hero: the name-plate bar inside the MIDDLE claim (data-web-1) at 0.9, the other two plates at
  // 0.3. Each column is Pod frame over claim block over a thin bound-PV slab, and the claim is the
  // largest block because the card is angled at the PVC object. The web-1 Pod above the accent is a
  // dashed ghost on a dashed leg (the card's rebind beat): the Pod went, the claim did not.
  // Pod and claim carry the same count of ordinal ticks (1, 2, 3), so identity reads down a column.
  // Rejected: the earlier template box fanning down to three Pod-over-cylinder columns. It drew no
  // claim at all, topped out at 0.10 ink, and shared the box-fanning-to-cylinders silhouette with
  // the retention card. No cylinder and no template box here on purpose.
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

  // Two zones compared, used as a matrix: "Delete gives up the claims that Retain keeps". Two
  // equal column frames, Retain left and Delete right, each split into two equal cells
  // (whenScaled over whenDeleted), each cell one roster of three claim bars. The Retain rosters stay full,
  // the Delete one loses its last bar on a scale-down and all three on a delete, the lost bars
  // drawn as dashed hollows. Hero: the header bar of the Delete column at 0.9, Retain's at 0.3.
  // Rejected: the 2x2 card matrix shrunk (12 claims, 12 disks, owners between cells) and the old
  // policy box forking to two disks. The PV and disk clause is left to the card.
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

  // The Pod's zone (bright, centred) among faint sibling zones: the scheduler placed the Pod first,
  // so its volume is provisioned into that same zone, the jade disk directly beneath it. The empty
  // flanking zones are the topologies the volume did NOT land in.
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

  // Ghost zone to solid, as two segmented strips: the live volume above, its snapshot below. Accent:
  // the bar inside the one snapshot cell that holds its own data, the old block C kept when C was
  // overwritten. Every other snapshot cell is a dashed ghost, and a pointer tick joins the two strip
  // outlines above it, one per shared block, and live C carries a shorter bar, its newer version.
  // No cylinder on purpose: the claim is block sharing, which a disk cannot show, and
  // storage-pvc-clone beside it is two disks.
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

  // Two zones compared: the clone is its source spec rewritten row for row, the size free to grow
  // and the class free to differ. Two equal sheets, each a title bar over a roster of five field bars
  // whose lengths repeat exactly, so the repeated pattern reads as a copy at 200px. The accent is
  // the grown storage row of the clone, the one change the thumbnail draws. The gap between the sheets is the no-lineage claim, so no line crosses it.
  // Rejected: two sheets overlapping, which reads as the storage-container-filesystem cascade, and
  // a gate column between the sheets, which is a miniature of the card diagram (R-10).
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

  // Two zones compared, accent on the name plate of the claim INSIDE the right Pod: an ordinary claim
  // stands outside its Pod and outlives it, a generic ephemeral one lives inside the Pod lifetime.
  // Left: a dashed, leaving Pod over a solid claim and disk on a dashed leg. Right: one heavy Pod
  // frame holding app, claim and disk, so the boundary is the sentence. Asymmetric on purpose, so
  // it does not sign like the two equal frames of the retention neighbour. Rejected: the owned
  // column of Pod, claim and cylinder on one spine, whose brightest mark was 0.08.
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

  // Branch, accent on the long bar in the lower Node: one claim enters and the filter sends it past
  // the Node that cannot hold it straight to the one that can, before anything is picked. The claim
  // is a short roster on the left, the stem forks, the upper leg is dashed and stopped by a bar in
  // front of a ghosted Node with a short 0.3 bar, the lower leg reaches a solid Node with the long bar.
  // Rejected: gauge columns (one bright slab read as a battery), and pools publishing into a shared
  // record, since the card draws the controller as the writer.
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
