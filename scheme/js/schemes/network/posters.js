// Design notes: ./CARDS/<card-id>.md, and the note for one poster is the comment above it here.
// The network posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  // A bus band over two dashed Node frames. The band carries ONE bright full-width range bar, which
  // is the accent and the subject: the flat address space itself. Each Pod carries the same bar at
  // 0.3, identical across all three, because the promise is that no Pod is special. The Node frames
  // say the second half of the sentence: two different Nodes, one space, and the legs cross the
  // frame edge the way a Pod attaches itself to the space rather than to its Node.
  'network-model': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="32" width="272" height="36" rx="7" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="34" y="46" width="252" height="8" rx="4" fill="currentColor" opacity="0.9" stroke="none"/>
      <g stroke-dasharray="4 3">
        <rect x="51"  y="102" width="128" height="60" rx="8" fill="rgba(255,255,255,0.03)"/>
        <rect x="197" y="102" width="72"  height="60" rx="8" fill="rgba(255,255,255,0.03)"/>
      </g>
      <rect x="63"  y="112" width="48" height="40" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="119" y="112" width="48" height="40" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="209" y="112" width="48" height="40" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="75"  y="128" width="24" height="7" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="131" y="128" width="24" height="7" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="221" y="128" width="24" height="7" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
      <g stroke-dasharray="4 3">
        <line x1="87"  y1="68" x2="87"  y2="112"/>
        <line x1="143" y1="68" x2="143" y2="112"/>
        <line x1="233" y1="68" x2="233" y2="112"/>
      </g>
    </g>
  `,

  // Nested containment: three tenants standing directly over the one stack they share, four bars deep
  // inside its frame. Each leg drops STRAIGHT down under its own block rather than converging, so the
  // picture says three-into-one by position instead of by a fan, and nothing runs down the column
  // because the card holds the layers to be a layering and not a packet path. The stack is the subject
  // and takes the heaviest stroke, the largest mass and the brightest fill. The accent is one bright
  // bar in the top layer with the same bar dim inside each tenant: one port space, not three.
  'network-namespaces': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="68"  y="70"  width="184" height="96" rx="10" stroke-width="2" fill="rgba(255,255,255,0.03)"/>
      <rect x="78"  y="80"  width="164" height="16" rx="4"  fill="rgba(255,255,255,0.10)"/>
      <rect x="78"  y="100" width="164" height="16" rx="4"  fill="rgba(255,255,255,0.06)"/>
      <rect x="78"  y="120" width="164" height="16" rx="4"  fill="rgba(255,255,255,0.06)"/>
      <rect x="78"  y="140" width="164" height="16" rx="4"  fill="rgba(255,255,255,0.06)"/>
      <rect x="72"  y="14"  width="56"  height="28" rx="6"  fill="rgba(255,255,255,0.04)"/>
      <rect x="132" y="14"  width="56"  height="28" rx="6"  fill="rgba(255,255,255,0.04)"/>
      <rect x="192" y="14"  width="56"  height="28" rx="6"  fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="100" y1="42" x2="100" y2="70"/>
        <line x1="160" y1="42" x2="160" y2="70"/>
        <line x1="220" y1="42" x2="220" y2="70"/>
      </g>
      <rect x="86"  y="24" width="28" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="146" y="24" width="28" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="206" y="24" width="28" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="146" y="84" width="28" height="8" rx="2" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  // The scheme in miniature, vertically centred: client Pod to netfilter (holding a 2x2 conntrack
  // table mapping the original tuple to the translated one) to server Pod. Two lanes carry the flow
  // with explicit chevrons, the request left to right on the top lane and the reply right to left on
  // the bottom. Neither lane carries a packet: a filled dot resting on a lane in a still frame reads
  // as a paused animation. Accent is the TRANSLATED tuple, the pair the entry remembers.
  'network-conntrack-nat': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="14" y="57" width="64" height="66" rx="11" fill="rgba(255,255,255,0.03)"/>
      <rect x="24" y="77" width="44" height="26" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="242" y="57" width="64" height="66" rx="11" fill="rgba(255,255,255,0.03)"/>
      <rect x="252" y="77" width="44" height="26" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="116" y="45" width="88" height="90" rx="11" fill="rgba(255,255,255,0.04)"/>
      <rect x="128" y="65" width="64" height="54" rx="4" fill="currentColor" fill-opacity="0.06" stroke="none"/>
      <line x1="160" y1="65" x2="160" y2="119"/>
      <line x1="128" y1="92" x2="192" y2="92"/>
      <line x1="136" y1="79" x2="150" y2="79"/><line x1="170" y1="79" x2="184" y2="79"/>
      <rect x="136" y="102" width="12" height="7" rx="2" fill="currentColor" stroke="none"/><rect x="172" y="102" width="12" height="7" rx="2" fill="currentColor" stroke="none"/>
      <g stroke-dasharray="4 3">
        <line x1="78" y1="71" x2="116" y2="71"/><line x1="204" y1="71" x2="242" y2="71"/>
        <line x1="78" y1="109" x2="116" y2="109"/><line x1="204" y1="109" x2="242" y2="109"/>
      </g>
      <path d="M 95 67 L 100 71 L 95 75"/><path d="M 221 67 L 226 71 L 221 75"/>
      <path d="M 225 105 L 220 109 L 225 113"/><path d="M 99 105 L 94 109 L 99 113"/>
    </g>
  `,

  // TWO ZONES COMPARED, split along Y. Two transfers on one link: each frame carries a faint link
  // track, a datagram carved into a dim outer header and a payload whose LENGTH is the whole
  // difference, and an outcome cell, filled where the echo came home and a dashed hollow where
  // nothing did. Accent is the overrun, the tail of the lower datagram the hop does not carry.
  // The proportions are drawn for legibility at 200px and are not the card's declared 0.72 scale.
  'network-mtu-overhead': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="26" width="280" height="54" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="32" y="45" width="218" height="16" rx="3" fill="rgba(255,255,255,0.03)" opacity="0.3"/>
      <rect x="50" y="45.7" width="23.3" height="14.6" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="32.7" y="45.7" width="17.3" height="14.6" fill="rgba(255,255,255,0.16)" stroke="none"/>
      <rect x="32" y="45" width="42" height="16" rx="3" opacity="0.7"/>
      <line x1="50" y1="45" x2="50" y2="61" opacity="0.7"/>
      <rect x="266" y="41" width="24" height="24" rx="5" fill="currentColor" opacity="0.3"/>
      <rect x="20" y="100" width="280" height="54" rx="10" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="50" y="119.7" width="164" height="14.6" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="32.7" y="119.7" width="17.3" height="14.6" fill="rgba(255,255,255,0.16)" stroke="none"/>
      <rect x="32" y="119" width="218" height="16" rx="3" opacity="0.7"/>
      <line x1="50" y1="119" x2="50" y2="135" opacity="0.7"/>
      <rect x="266" y="115" width="24" height="24" rx="5" stroke-dasharray="4 3" opacity="0.7"/>
    </g>
    <rect x="214" y="119.7" width="35.3" height="14.6" fill="currentColor" opacity="0.9"/>
  `,

  // BRANCH. One rule sorts the traffic, and only the half that leaves the cluster goes out wearing a
  // different source. Three two-row address readouts, src over dst, every bar the same size in all
  // three: the input on the left, the outcome that stays inside reached by a solid leg, and the
  // outcome that leaves reached by a dashed one. The accent is the whole readout of that lower
  // block, both rows at 0.9 against 0.3 everywhere else, which is the Branch idiom of lighting the
  // taken outcome and leaving the untaken one at the sibling fill.
  'network-pod-egress-snat': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="56" width="80" height="68" rx="9" fill="rgba(255,255,255,0.03)"/>
      <rect x="34"  y="74" width="56" height="9"  rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="34"  y="96" width="40" height="9"  rx="2" fill="currentColor" opacity="0.3"/>
      <path d="M 102 90 H 140 V 51 H 206"/>
      <path d="M 140 90 V 129 H 206" stroke-dasharray="4 3"/>
      <rect x="206" y="20" width="80" height="62" rx="9" fill="rgba(255,255,255,0.03)"/>
      <rect x="218" y="36" width="56" height="9"  rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="218" y="58" width="40" height="9"  rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="206" y="98" width="80" height="62" rx="9" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="218" y="136" width="40" height="9" rx="2" fill="currentColor" opacity="0.9"/>
    </g>
    <rect x="218" y="114" width="56" height="9" rx="2" fill="currentColor" opacity="0.9"/>
  `,
  // Two containers side by side, both wired into one shared loopback node (lo, 127.0.0.1) in the
  // middle: they share localhost and one network stack. Sub-blocks centred inside the Pod.
  'network-pod-localhost': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="46" y="36" width="228" height="108" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="56"  y="68" width="58" height="44" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="206" y="68" width="58" height="44" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="114" y1="90" x2="140" y2="90" stroke-dasharray="4 3"/>
      <line x1="180" y1="90" x2="206" y2="90" stroke-dasharray="4 3"/>
    </g>
    <circle cx="160" cy="90" r="20" fill="rgba(255,255,255,0.05)" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="160" cy="90" r="8"  fill="currentColor" stroke="none"/>
  `,

  // Chain of stages into an empty target: three match stages, the last one mismatched, its leg reaching
  // a target that holds only a dashed hollow. Every bar is dim, and the target frame carries the weight.
  'network-service-debugging': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="12"  y="42" width="52" height="96" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="82"  y="42" width="52" height="96" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="152" y="42" width="52" height="96" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="236" y="42" width="72" height="96" rx="8" fill="rgba(255,255,255,0.05)" stroke-width="2"/>
      <rect x="254" y="61" width="36" height="58" rx="5" stroke-dasharray="4 3" opacity="0.7"/>
      <line x1="64"  y1="90" x2="82"  y2="90"/>
      <line x1="134" y1="90" x2="152" y2="90"/>
      <line x1="204" y1="90" x2="236" y2="90"/>
    </g>
    <rect x="24"  y="75" width="28" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="24"  y="95" width="28" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="94"  y="75" width="28" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="94"  y="95" width="28" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="164" y="75" width="28" height="10" rx="2" fill="currentColor"/>
    <rect x="164" y="95" width="28" height="10" rx="2" fill="currentColor" opacity="0.3"/>
  `,

  // Two zones compared, stacked: one Service points outside by a NAME (one unbroken bar, the
  // accent), the other by an ADDRESS (a quad) through a hand-written slice.
  'network-externalname': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="104" y1="53" x2="216" y2="53"/>
      <path d="M 104 127 H 136 M 184 127 H 216"/>
      <rect x="24"  y="28"  width="80" height="50" rx="9" fill="rgba(255,255,255,0.05)"/>
      <rect x="36"  y="49"  width="56" height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="216" y="28"  width="80" height="50" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="228" y="49"  width="56" height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="24"  y="102" width="80" height="50" rx="9" fill="rgba(255,255,255,0.05)"/>
      <rect x="36"  y="123" width="11" height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="51"  y="123" width="11" height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="66"  y="123" width="11" height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="81"  y="123" width="11" height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="136" y="115" width="48" height="24" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="216" y="102" width="80" height="50" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="228" y="123" width="56" height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
    </g>
  `,

  // Held object: a dashed Pod marked to go beside its three endpoint switches, ready off, serving
  // and terminating on, accent on the serving knob that keeps it answering while it drains.
  'network-service-terminating-endpoints': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32"  y="50"  width="80" height="80" rx="10" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="44"  y="62"  width="30" height="5"  rx="1" fill="rgba(255,255,255,0.10)"/>
      <rect x="44"  y="100" width="56" height="10" rx="2" fill="rgba(255,255,255,0.08)"/>
      <rect x="134" y="55"  width="58" height="6"  rx="1" fill="rgba(255,255,255,0.10)"/>
      <rect x="134" y="87"  width="70" height="6"  rx="1" fill="rgba(255,255,255,0.10)"/>
      <rect x="134" y="119" width="82" height="6"  rx="1" fill="rgba(255,255,255,0.10)"/>
      <rect x="238" y="48"  width="50" height="20" rx="10" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <rect x="238" y="80"  width="50" height="20" rx="10" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="238" y="112" width="50" height="20" rx="10" fill="rgba(255,255,255,0.06)"/>
      <rect x="242" y="51"  width="14" height="14" rx="7" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="270" y="83"  width="14" height="14" rx="7" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="270" y="115" width="14" height="14" rx="7" fill="currentColor" stroke="none" opacity="0.3"/>
    </g>
  `,

  // Segmented budget bar under a replica ruler on ONE 40..280 grid: Pods grouped 3 and 1, a dashed
  // tick where the replica count would cut (75), a solid divider where the weights do (250). Accent
  // is the 90 share, the opposite way round from the card, where the web-v1 share is the opaque
  // rect over a bright web-v2 track. It carries no version labels, so it claims nothing about which
  // share is which, and inverting it would leave a bar that reads as an empty track.
  'network-gateway-traffic-splitting': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40"  y="41" width="48" height="44" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="98"  y="41" width="48" height="44" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="156" y="41" width="48" height="44" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="232" y="41" width="48" height="44" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="50"  y="55" width="28" height="16" rx="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="108" y="55" width="28" height="16" rx="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="166" y="55" width="28" height="16" rx="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="242" y="55" width="28" height="16" rx="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="40"  y="104" width="240" height="32" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="46"  y="112" width="202" height="16" rx="2" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="252" y="112" width="22"  height="16" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <line x1="250" y1="98" x2="250" y2="142" stroke-width="2"/>
      <path d="M 218 34 V 92" stroke-dasharray="4 3"/>
    </g>
  `,

  // Branch from a roster row: the balancer holds its target list, two Node port rows dashed and unused
  // and one solid Pod IP row, and only that row runs a heavy leg out to the Node holding the Pod.
  // Accent: the Pod IP row, the Pod bar at 0.3.
  'network-loadbalancer-direct-to-pods': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28"  y="42"  width="100" height="96" rx="10" fill="rgba(255,255,255,0.05)"/>
      <rect x="42"  y="59"  width="72"  height="14" rx="3" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <rect x="42"  y="83"  width="72"  height="14" rx="3" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="42"  y="107" width="72"  height="14" rx="3" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <rect x="192" y="58"  width="100" height="64" rx="10" fill="rgba(255,255,255,0.05)"/>
      <rect x="208" y="72"  width="68"  height="36" rx="5" fill="rgba(255,255,255,0.08)"/>
      <rect x="220" y="86"  width="44"  height="8"  rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <line x1="128" y1="90" x2="192" y2="90" stroke-width="2"/>
    </g>
  `,

  // The staircase of guesses. A short name is not asked once: the resolver walks the search list and
  // each attempt drops one suffix, so the candidate names get SHORTER row by row until only the bare
  // name is left. The rows are a descending staircase, the dashed rail on the left is the walk down
  // it, and the dot trailing each row is the query that attempt costs. The staircase IS the cost,
  // which is the whole point of ndots, so the poster spends everything on that shape and draws no
  // topology.
  'network-dns-ndots': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="54"  y="20"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="102" y="20"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="150" y="20"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="198" y="20"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="54"  y="58"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="102" y="58"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="150" y="58"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="54"  y="96"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="102" y="96"  width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="54"  y="134" width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="44"  y1="34"  x2="44"  y2="148"/>
        <line x1="242" y1="34"  x2="266" y2="34"/>
        <line x1="194" y1="72"  x2="218" y2="72"/>
        <line x1="146" y1="110" x2="170" y2="110"/>
        <line x1="98"  y1="148" x2="122" y2="148"/>
      </g>
    </g>
    <circle cx="274" cy="34"  r="2.6" fill="currentColor"/>
    <circle cx="226" cy="72"  r="2.6" fill="currentColor"/>
    <circle cx="178" cy="110" r="2.6" fill="currentColor"/>
    <circle cx="130" cy="148" r="2.6" fill="currentColor"/>
  `,

  // THE WALL, run ASYMMETRICALLY: one Pod between two neighbours, a bar standing in the left gap and
  // the right gap left open, which is the whole sentence. The two sides are furnished differently on
  // purpose, a roster of records against one value slab. Accent: the upright bar, the only solid ink.
  'network-dns-egress-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="14"  y="40" width="78" height="100" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="122" y="24" width="96" height="132" rx="10" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="136" y="56" width="68" height="68" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="244" y="40" width="62" height="100" rx="8" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="92"  y1="78"  x2="122" y2="78"/>
        <line x1="92"  y1="102" x2="122" y2="102"/>
        <line x1="218" y1="90"  x2="244" y2="90"/>
      </g>
    </g>
    <g fill="currentColor">
      <rect x="26"  y="60" width="54" height="6" rx="2" opacity="0.3"/>
      <rect x="26"  y="78" width="54" height="6" rx="2" opacity="0.3"/>
      <rect x="26"  y="96" width="54" height="6" rx="2" opacity="0.3"/>
      <rect x="148" y="72" width="44" height="7" rx="2" opacity="0.3"/>
      <rect x="148" y="96" width="44" height="7" rx="2" opacity="0.3"/>
      <rect x="256" y="86" width="42" height="8" rx="2" opacity="0.3"/>
      <rect x="103" y="32" width="8" height="116" rx="2" opacity="0.9"/>
    </g>
  `,

  // NESTED CONTAINMENT around a cache mass: three Pods inside the Node feed short solid legs into one
  // dense cache block, and one dashed leg joins the Node frame itself to CoreDNS outside it, so nothing
  // crosses the boundary. Accent: the cached row the middle Pod reads.
  'network-nodelocal-dnscache': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="14" y="14" width="222" height="152" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="30"  y="34"  width="52" height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="30"  y="76"  width="52" height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="30"  y="118" width="52" height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="116" y="30"  width="96" height="120" rx="8" fill="rgba(255,255,255,0.08)" stroke-width="2"/>
      <rect x="258" y="73"  width="50" height="34" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <line x1="82" y1="48"  x2="116" y2="48"/>
      <line x1="82" y1="90"  x2="116" y2="90" stroke-width="2"/>
      <line x1="82" y1="132" x2="116" y2="132"/>
      <line x1="236" y1="90" x2="258" y2="90" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor">
      <rect x="40" y="46"  width="32" height="4" rx="2" opacity="0.3"/>
      <rect x="40" y="88"  width="32" height="4" rx="2" opacity="0.3"/>
      <rect x="40" y="130" width="32" height="4" rx="2" opacity="0.3"/>
      <rect x="130" y="48"  width="68" height="8" rx="2" opacity="0.3"/>
      <rect x="130" y="67"  width="68" height="8" rx="2" opacity="0.3"/>
      <rect x="130" y="86"  width="68" height="8" rx="2" opacity="0.9"/>
      <rect x="130" y="105" width="68" height="8" rx="2" opacity="0.3"/>
      <rect x="130" y="124" width="68" height="8" rx="2" opacity="0.3"/>
      <rect x="266" y="84" width="34" height="4" rx="2" opacity="0.3"/>
      <rect x="266" y="93" width="24" height="4" rx="2" opacity="0.3"/>
    </g>
  `,

  // TWO ZONES: the LoadBalancer / NodePort / ClusterIP stack against ExternalName and headless standing
  // apart, each with a hollow slot where the virtual IP would be. Accent on the VIP bar of the base.
  'network-service-types': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="30" width="160" height="36" rx="6" fill="rgba(255,255,255,0.03)"/>
      <rect x="56" y="44" width="96" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="24" y="72" width="160" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="52"  y="86" width="24" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="92"  y="86" width="24" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="132" y="86" width="24" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="24" y="114" width="160" height="36" rx="6" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="48" y="127" width="112" height="10" rx="2" fill="currentColor" opacity="0.9"/>
      <line x1="204" y1="36" x2="204" y2="144" opacity="0.4"/>
      <rect x="220" y="30" width="76" height="55" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="45" width="52" height="10" rx="2" stroke-dasharray="4 3"/>
      <rect x="232" y="63" width="22" height="6" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="262" y="63" width="22" height="6" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="220" y="95" width="76" height="55" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="110" width="52" height="10" rx="2" stroke-dasharray="4 3"/>
      <rect x="232" y="128" width="22" height="6" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="262" y="128" width="22" height="6" rx="2" fill="currentColor" opacity="0.3"/>
    </g>
  `,

  // Signed off by the author 2026-09-18 as final and acceptable, closeness to the diagram included.
  // Two axis meters of unequal reading over the replica row they decide.
  'network-dns-autoscaling': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="34" width="120" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="176" y="34" width="120" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="34"  y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="58"  y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="82"  y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="106" y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="186" y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="210" y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="234" y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="258" y="43" width="20" height="8" rx="2" fill="currentColor" opacity="0.3" stroke="none"/>
      <path d="M 84 60 V 82 H 236 V 60" stroke-dasharray="4 3"/>
      <path d="M 160 82 V 104" stroke-dasharray="4 3"/>
      <rect x="64" y="104" width="192" height="46" rx="8" stroke-width="2" fill="rgba(255,255,255,0.05)"/>
      <rect x="76"  y="120" width="26" height="14" rx="3" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="108" y="120" width="26" height="14" rx="3" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="140" y="120" width="26" height="14" rx="3" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="172" y="120" width="26" height="14" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="204" y="120" width="26" height="14" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
    </g>
  `,

  // Where a normal Service keeps a VIP, headless keeps an ANSWER. The middle of the path is not a box
  // that rewrites the destination, since clusterIP None means kube-proxy programs nothing, but the
  // DNS reply itself, a sheet of three A records. One leg leaves the sheet onto a shared vertical
  // bus, which then branches once per Pod, so the record count and the Pod count are visibly the same
  // number, which IS headless.
  'network-headless-service': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20"  y="74"  width="60" height="32" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="108" y="62"  width="76" height="56" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="236" y="22"  width="64" height="32" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="236" y="74"  width="64" height="32" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="236" y="126" width="64" height="32" rx="6" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="80"  y1="90"  x2="108" y2="90"/>
        <line x1="184" y1="90"  x2="208" y2="90"/>
        <line x1="208" y1="38"  x2="208" y2="142"/>
        <line x1="208" y1="38"  x2="236" y2="38"/>
        <line x1="208" y1="90"  x2="236" y2="90"/>
        <line x1="208" y1="142" x2="236" y2="142"/>
      </g>
    </g>
    <g fill="currentColor" fill-opacity="0.6">
      <rect x="118" y="72"  width="42" height="6" rx="3"/>
      <rect x="118" y="87"  width="42" height="6" rx="3"/>
      <rect x="118" y="102" width="42" height="6" rx="3"/>
      <circle cx="170" cy="75"  r="2.6"/>
      <circle cx="170" cy="90"  r="2.6"/>
      <circle cx="170" cy="105" r="2.6"/>
    </g>
  `,

  // Ghost to solid, ONE object twice, and the bars are ADDRESSES rather than blocks: four groups
  // against eight is why the v6 one is longer, which is the whole sentence in one rhythm. The ghost
  // carries the v4 groups and an empty dashed slot, the family it has no address for yet, aligned
  // with where the solid one fills it. The eight bright groups are the only accent. Entry stubs on
  // the right face were drawn and cut: `either family reaches it` is a second sentence (`R-02`).
  'network-dualstack': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="40" width="110" height="100" rx="8" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
      <rect x="40" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="50" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="60" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="70" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="40" y="98" width="78" height="10" rx="2" opacity="0.3" stroke-dasharray="3 2"/>
      <line x1="134" y1="90" x2="186" y2="90" stroke-dasharray="5 3"/>
      <rect x="186" y="40" width="110" height="100" rx="8" stroke-width="2" fill="rgba(255,255,255,0.07)"/>
      <rect x="202" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="212" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="222" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="232" y="72" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="202" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="212" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="222" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="232" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="242" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="252" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="262" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="272" y="98" width="8" height="10" rx="1.5" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  // TWO ZONES COMPARED, and the comparison is a SLOT FILLED against the SAME SLOT EMPTY. The
  // sentence is that of the two ends of one veth pair, only the end inside the Pod carries an
  // address. Two furnished frames of equal size stand either side of one dashed boundary at x=160,
  // and the two ends face each other across it on one row, y=52, both 80 wide so a reader reads
  // them as the same kind of thing. The accent is the 64x10 bar at 0.9 inside `eth0`, the only full
  // brightness on the canvas, and the peer carries that bar's box redrawn as an EMPTY dashed
  // outline: the asymmetry is a shape a reader can compare rather than a label they have to read.
  // NOTHING IS DRAWN BETWEEN THE TWO ENDS, and that is the author's call after three renders that
  // had something there. A `stroke-width` 2 lane with one tick 20 inboard of each end went first:
  // at the ends the ticks landed 2 units off the zone frame walls and vanished into them at true
  // size, and moved clear into the gutter they read as a gate cutting the link. A 100x14 capsule at
  // rx 7 replaced it and said `one body, two ends` with its own rounded ends, and it was turned
  // down in turn for reading as a THIRD block floating between the two big ones, which at 200px is
  // what a horizontal rounded rect between two frames looks like. The cost is named rather than
  // hidden: the poster no longer draws the pair as one object, and what it draws is the second half
  // of the card's question, WHERE the address lives. The two ends still face each other on one row
  // at one size, which is what says they are a pair.
  // THE OLD POSTER IS NOT RE-RUN. Its note has `two boxes sharing a bar` measured and turned down
  // twice, a capsule SPANNING the whole width over a stroked ground whose two halves were empty.
  // Both halves here are furnished (3 blocks left, 2 plus a three port band right, 8 marks of
  // furniture inside them) and there is no bar for them to hang off at all. What that poster got
  // right and this one keeps is the dashed boundary and the address on the left against nothing on
  // the right, which is the sentence.
  // THE CONTAINERS SIT UNDER THE INTERFACE, not beside it. `pause` and `app` are two 18 tall rows at
  // 0.3 below the one `eth0` block, which is the last clause of the card's own desc drawn rather
  // than written: one pair and one address per POD, and the containers are what share it. Rowed
  // beside eth0 they would read as three peers, which is what the card's record rejects on the
  // diagram for the same reason.
  // cni0 IS A BAND WITH THREE PORTS, not a bridge glyph: the claim is that the host end plugs into
  // something that switches, and a port row says that where a drawn bridge says only its noun. The
  // leg from the peer lands on the MIDDLE port at x=250 and is solid, because enslavement is real
  // and the house dash means `not real yet, leaving, optional`.
  'network-pod-ip-and-veth': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="160" y1="16" x2="160" y2="150" stroke-dasharray="4 3" opacity="0.7"/>

      <rect x="12" y="26" width="116" height="104" rx="10" fill="rgba(255,255,255,0.05)"/>
      <rect x="30" y="38" width="80" height="28" rx="4" stroke-width="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="30" y="78"  width="80" height="18" rx="3" fill="rgba(255,255,255,0.07)"/>
      <rect x="30" y="102" width="80" height="18" rx="3" fill="rgba(255,255,255,0.07)"/>

      <rect x="192" y="26" width="116" height="104" rx="10" fill="rgba(255,255,255,0.05)"/>
      <rect x="210" y="38" width="80" height="28" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="218" y="47" width="64" height="10" rx="2" stroke-dasharray="3 2" opacity="0.5"/>
      <path d="M 250 66 V 92"/>
      <rect x="210" y="92" width="80" height="28" rx="4" fill="rgba(255,255,255,0.07)"/>
    </g>
    <rect x="38"  y="47"  width="64" height="10" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="37"  y="84"  width="34" height="6"  rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="37"  y="108" width="34" height="6"  rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="218" y="101" width="20" height="10" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="240" y="101" width="20" height="10" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="262" y="101" width="20" height="10" rx="1" fill="currentColor" opacity="0.3"/>
  `,

  // CHAIN OF STAGES over a SEGMENTED RESULT BAND. The sentence is that the runtime runs the plugin
  // list in order and ONE result accumulates as it goes. Three equal programs stand in a row, each
  // carrying its own name bar at 0.3, joined by short dashed legs, and under them one band cut into
  // three parts, one part per plugin, each part standing under the program that wrote it. The band
  // takes the heavy stroke because the RESULT is the subject, and the third part alone carries the
  // accent at 0.9 with the first two at 0.3: the last plugin prints the one finished result, and
  // that ramp is what says direction with no arrowhead (`R-08`).
  // host-local hangs UNDER the middle program on a dashed stub, dashed and off the row, which is the
  // claim the card makes: it is named inside the bridge config, not listed beside the others.
  // The three programs are EQUAL on purpose. A rising staircase of unequal blocks was described
  // first and says the plugins grow, which is false: they are peers and only their output grows.
  // Rejected before that: the old stack of two entries with the nested member drawn INSIDE entry
  // one, which read as a stack of layers and put the accent on the delegate rather than on the
  // result the card is about. Interior rungs under each name bar were drawn and cut: they pushed the
  // drawing to 23 primitives and gave the fills a third opacity tier, which is a ramp, not an accent.
  'network-cni-invocation': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="30" width="80" height="44" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="120" y="30" width="80" height="44" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="216" y="30" width="80" height="44" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="104" y1="52" x2="120" y2="52" stroke-dasharray="4 3"/>
      <line x1="200" y1="52" x2="216" y2="52" stroke-dasharray="4 3"/>
      <line x1="160" y1="74" x2="160" y2="90" stroke-dasharray="4 3"/>
      <rect x="132" y="90" width="56" height="24" rx="4" stroke-dasharray="4 3" fill="rgba(255,255,255,0.03)"/>
      <rect x="24" y="126" width="272" height="30" rx="5" stroke-width="2" fill="rgba(255,255,255,0.05)"/>
      <line x1="112" y1="126" x2="112" y2="156"/>
      <line x1="208" y1="126" x2="208" y2="156"/>
    </g>
    <rect x="40"  y="47" width="48" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="136" y="47" width="48" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="232" y="47" width="48" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="144" y="98" width="32" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="34"  y="135" width="68" height="12" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="126" y="135" width="68" height="12" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="218" y="135" width="68" height="12" rx="2" fill="currentColor" opacity="0.9"/>
  `,

  // The hero is ENCAPSULATION itself: Pod A on Node-1 to Pod B on Node-2, and mid-gap the packet is a
  // packet-in-packet, a bright inner Pod frame wrapped inside an outer Node header. Source Pod
  // bright, destination dim, the wrapped packet crossing the inter-Node gap on a dashed flow. The
  // nesting reads as the Pod frame carried between Nodes inside an outer envelope.
  'network-pod-to-pod-cross-node': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="14"  y="54" width="84" height="72" rx="9" fill="rgba(255,255,255,0.03)"/>
      <rect x="222" y="54" width="84" height="72" rx="9" fill="rgba(255,255,255,0.03)"/>
      <rect x="30"  y="74" width="52" height="32" rx="5" fill="rgba(255,255,255,0.11)"/>
      <rect x="238" y="74" width="52" height="32" rx="5" fill="rgba(255,255,255,0.06)" opacity="0.7"/>
      <line x1="98"  y1="90" x2="126" y2="90" stroke-dasharray="4 3"/>
      <line x1="194" y1="90" x2="222" y2="90" stroke-dasharray="4 3"/>
      <rect x="126" y="76" width="68" height="28" rx="8" fill="rgba(255,255,255,0.10)"/>
    </g>
    <rect x="140" y="84" width="40" height="12" rx="4" fill="currentColor" opacity="0.85"/>
  `,

  // THE BREAK. Two Services reach for one address and only one gets it, because the address IS an
  // object and two objects cannot share a name. The accent is the name, inside the object neither
  // claimant holds: both Services carry the same bar at 0.3, so the cut leg is what separates them.
  'network-service-cidr': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <polyline points="62,66 62,133 120,133"/>
      <polyline points="258,66 258,133 200,133" stroke-dasharray="4 3"/>
      <rect x="22"  y="28"  width="80" height="38" rx="7" fill="rgba(255,255,255,0.03)"/>
      <rect x="218" y="28"  width="80" height="38" rx="7" fill="rgba(255,255,255,0.03)"/>
      <rect x="120" y="110" width="80" height="46" rx="9" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <path d="M 220 141 L 231 125" stroke-linecap="round"/>
      <path d="M 230 141 L 241 125" stroke-linecap="round"/>
      <rect x="33"  y="41"  width="44" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="229" y="41"  width="44" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="136" y="126" width="48" height="14" rx="2" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  // A bracket down the left, cut into three, with a block beside each piece: one range divided into
  // parts that cannot overlap, and an address taken from inside one of them. Every block begins and
  // ends exactly where its own bracket segment does, and that alignment is what says no two parts
  // share any of the range. The bright bar sits INSIDE the middle block with the others at 0.3 on
  // the same bar: an address comes out of one part, never out of the range at large. No leg and no
  // block on top, because nothing here is handing anything down.
  'network-ipam-pod-cidr': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="30" y1="26"  x2="48" y2="26"/>
      <line x1="30" y1="154" x2="48" y2="154"/>
      <line x1="39" y1="26"  x2="39" y2="64"/>
      <line x1="39" y1="71"  x2="39" y2="109"/>
      <line x1="39" y1="116" x2="39" y2="154"/>
      <rect x="62" y="26"  width="222" height="38" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="62" y="71"  width="222" height="38" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="62" y="116" width="222" height="38" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="78" y="41"  width="30" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="78" y="86"  width="30" height="8" rx="1" fill="currentColor" opacity="0.9"/>
      <rect x="78" y="131" width="30" height="8" rx="1" fill="currentColor" opacity="0.3"/>
    </g>
  `,

  // The scheme abstracted: live Pods on the left as the source, the notReady one dimmed, reconciled
  // into the EndpointSlice on the right as the derived list, one endpoint row per Pod with the
  // notReady row dimmed. Straight horizontal wires carry the one-row-per-Pod mapping.
  'network-endpointslice-reconcile': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28"  y="35"  width="86"  height="34" rx="6"  fill="rgba(255,255,255,0.05)"/>
      <rect x="28"  y="79"  width="86"  height="34" rx="6"  fill="rgba(255,255,255,0.05)"/>
      <rect x="28"  y="123" width="86"  height="34" rx="6"  fill="rgba(255,255,255,0.04)" opacity="0.4"/>
      <rect x="196" y="26"  width="108" height="140" rx="10" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="208" y="38"  width="84"  height="28" rx="4"  fill="rgba(255,255,255,0.05)"/>
      <rect x="220" y="47"  width="60"  height="10" rx="2"  fill="currentColor" stroke="none"/>
      <rect x="208" y="82"  width="84"  height="28" rx="4"  fill="rgba(255,255,255,0.05)"/>
      <rect x="208" y="126" width="84"  height="28" rx="4"  fill="rgba(255,255,255,0.04)" opacity="0.4"/>
      <g stroke-dasharray="4 3">
        <line x1="114" y1="52"  x2="196" y2="52"/>
        <line x1="114" y1="96"  x2="196" y2="96"/>
        <line x1="114" y1="140" x2="196" y2="140"/>
      </g>
    </g>
  `,

  // FAN: a dashed virtual address nobody owns feeds a rule block whose three rows fan out to three
  // Pods, one leg solid for the backend picked. Accent on the rule row that picked it.
  'network-service-clusterip': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16" y="68" width="76" height="44" rx="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="30" y="86" width="48" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <line x1="92" y1="90" x2="116" y2="90"/>
      <rect x="116" y="40" width="80" height="100" rx="8" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="128" y="60" width="56" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="128" y="85" width="56" height="10" rx="2" fill="currentColor" opacity="0.9"/>
      <rect x="128" y="112" width="56" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <path d="M 196 64 H 211 V 34 H 226" stroke-dasharray="4 3" opacity="0.6"/>
      <line x1="196" y1="90" x2="226" y2="90" stroke-width="2"/>
      <path d="M 196 116 H 211 V 146 H 226" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="226" y="14" width="76" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="240" y="26" width="48" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="226" y="70" width="76" height="40" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="240" y="82" width="48" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
      <rect x="226" y="126" width="76" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="240" y="138" width="48" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
    </g>
  `,

  // Two zones compared, stacked on one x and fed from a SHARED SOURCE on the left (patterns.md): one
  // packet, the same skeleton twice, so the only thing that moves is what happens inside the frame.
  // The top five slots are CHAINED to each other, first to last, and that chain floats free of the
  // entry leg: the walk is a property of the frame, not something the packet drags in. The bottom
  // frame holds one bright slot alone, on the SAME x as the top's third, with nothing linking it to
  // anything, which is the hash lookup owing nothing to a predecessor. Ink against no ink inside two
  // identical frames. No backend block, since where the packet lands is the same either way.
  'network-kube-proxy-modes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="76" width="36" height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="33" y="86" width="14" height="8" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <path d="M 58 90 H 76 M 76 56 V 128 M 76 56 H 86 M 76 128 H 86"/>

      <rect x="86" y="36" width="210" height="40" rx="6" fill="rgba(255,255,255,0.03)"/>
      <path d="M 120 56 H 140 M 160 56 H 180 M 200 56 H 220 M 240 56 H 260"/>
      <rect x="100" y="51" width="20" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="140" y="51" width="20" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="180" y="51" width="20" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="220" y="51" width="20" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="260" y="51" width="20" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.3"/>

      <rect x="86" y="108" width="210" height="40" rx="6" stroke-width="2" fill="rgba(255,255,255,0.05)"/>
      <rect x="180" y="123" width="20" height="10" rx="2" fill="currentColor" stroke="none" opacity="0.9"/>
    </g>
  `,

  // The wall (patterns.md): minSyncPeriod is a FLOOR and the card says so in words, so the poster
  // draws it as the one upright bar in the gap. Left, SMALLER and lighter because it is the side
  // held off, a queue of change
  // ticks, uniform because they are a COUNT of identical waits and not a chart of magnitudes.
  // Right, heavier, the three rule slabs already written. The bar is the whole accent.
  'network-proxy-rule-resync': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30" y="50" width="100" height="84" rx="6" fill="rgba(255,255,255,0.03)"/>
      <g opacity="0.5">
        <line x1="44" y1="120" x2="44" y2="66"/>
        <line x1="52" y1="120" x2="52" y2="66"/>
        <line x1="60" y1="120" x2="60" y2="66"/>
        <line x1="68" y1="120" x2="68" y2="66"/>
        <line x1="76" y1="120" x2="76" y2="66"/>
        <line x1="84" y1="120" x2="84" y2="66"/>
        <line x1="92" y1="120" x2="92" y2="66"/>
        <line x1="100" y1="120" x2="100" y2="66"/>
        <line x1="108" y1="120" x2="108" y2="66"/>
        <line x1="116" y1="120" x2="116" y2="66"/>
      </g>

      <rect x="184" y="42" width="112" height="96" rx="6" stroke-width="2" fill="rgba(255,255,255,0.07)"/>
      <rect x="198" y="60"  width="84" height="14" rx="3" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="198" y="82"  width="84" height="14" rx="3" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="198" y="104" width="84" height="14" rx="3" fill="currentColor" stroke="none" opacity="0.3"/>
    </g>
    <rect x="152" y="26" width="10" height="128" rx="2" fill="currentColor" opacity="0.9"/>
  `,

  // One row LEAVES the map and becomes the connection. Five candidate entries sit at 0.3 inside the
  // BPF map frame, which carries the heavier stroke as the source of the answer, and the middle one
  // is lit inside it at 0.9, on the same width as its neighbours, the address the connect() rewrite
  // installed. The second bright bar to its right is that same address on the path, and three empty
  // frames stand across it, the per-packet stops this dataplane does not have, which it passes over
  // uncut. No socket, no backend and no topology
  // at all: the picture is the chosen entry and the distance it covers without being touched again.
  'network-ebpf-dataplane': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16"  y="36" width="80" height="100" rx="8" stroke-width="2" fill="rgba(255,255,255,0.05)"/>
      <rect x="26"  y="44" width="60" height="12" rx="3" fill="currentColor" opacity="0.3"/>
      <rect x="26"  y="64" width="60" height="12" rx="3" fill="currentColor" opacity="0.3"/>
      <rect x="26"  y="104" width="60" height="12" rx="3" fill="currentColor" opacity="0.3"/>
      <rect x="26"  y="124" width="60" height="12" rx="3" fill="currentColor" opacity="0.3"/>
      <rect x="126" y="57" width="28" height="66" rx="5" fill="rgba(255,255,255,0.03)"/>
      <rect x="186" y="57" width="28" height="66" rx="5" fill="rgba(255,255,255,0.03)"/>
      <rect x="246" y="57" width="28" height="66" rx="5" fill="rgba(255,255,255,0.03)"/>
      <rect x="26"  y="84" width="60" height="12" rx="3" fill="currentColor" opacity="0.9"/>
      <rect x="116" y="84" width="186" height="12" rx="3" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  // ONE input sorted into one of three identical slots. The three slots are the SAME size on purpose:
  // a slot drawn larger because a range is bigger would be a quantity with no value behind it
  // anywhere on the card. What differs is which one is lit. The single square on the left is the
  // packet, its trunk runs into a fork bus, and three legs leave it for three slots of equal weight,
  // the middle one at 0.9 because that is where both of the card's cluster journeys end. No Node, no
  // station and no address: the picture is a sort, not a path.
  //
  // OUTLINED 2026-09-10. Every slot used to BE its accent: a 142 x 24 rect filled with currentColor
  // at 0.3 or 0.9, so its inherited stroke fell on its own fill and the right two thirds of the
  // canvas read as three flat lozenges. That is the shape R-07 names outright, a bright fill on a
  // whole shape rather than a bar inside the block it belongs to. Each slot is now a stroked block
  // over a washed fill with a 118 x 10 bar centred in it, so the losers keep the same bar at 0.3 and
  // the winner is the only solid thing on the canvas. The middle block also takes stroke-width 2,
  // matching the packet square it is the answer to, which is weight rather than a second accent.
  'network-packet-classification': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18" y="77" width="26" height="26" rx="5" stroke-width="2" fill="rgba(255,255,255,0.05)"/>
      <path d="M44 90 H104"/>
      <path d="M104 39 V141"/>
      <path d="M104 39 H160"/>
      <path d="M104 90 H160"/>
      <path d="M104 141 H160"/>
      <rect x="160" y="22" width="142" height="34" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="160" y="73" width="142" height="34" rx="6" stroke-width="2" fill="rgba(255,255,255,0.07)"/>
      <rect x="160" y="124" width="142" height="34" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="172" y="34"  width="118" height="10" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="172" y="85"  width="118" height="10" rx="3" fill="currentColor" opacity="0.9" stroke="none"/>
      <rect x="172" y="136" width="118" height="10" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
    </g>
  `,

  // The conjunction, and nothing else: one connection between two Pods, and a bright bar standing ON
  // THE ROAD at each end of it. The bars are the only accent and they are identical, because neither
  // verdict outranks the other and either one alone ends the connection. The two dim plates above are
  // where the bars come from, one over each.
  //
  // REDRAWN 2026-09-10 WITH THE CARD, AND THE PREVIOUS RULING HERE IS INVERTED. That version stood
  // both bars INSIDE the two faces and argued at length that a bar in the gap would say two
  // checkpoints on a wire, which was then the one sentence this thumbnail must not say. The card now
  // says exactly that on purpose: opened at true size, a verdict drawn as a sliver on a face was not
  // visible at all, and the redesign puts a 44 x 100 bar on the road with 100 units of run-up so a
  // refused packet has a journey to die at the end of. The thumbnail follows the card, so the bars
  // moved out onto the wire and the third plate went with the additivity subject the card dropped.
  //
  // Clearances measured off the grid at true size, where the poster paints 369px wide for 320 units,
  // 1.15px per unit: each 9 unit bar is 10.3px, bar one clears the sender face at 104 by 14 units and
  // bar two clears the receiver face at 206 by 13, and 57 units of road stay lit between them. Nothing
  // merges and neither bar touches a block.
  //
  // ONE PLATE DROPS ONTO ONE BAR, and the two drops are the same length. A plate reaching across to
  // the other bar, or one line longer than the other, draws an order between two boundaries that
  // know nothing about each other, which is the sentence of the card.
  //
  // OUTLINED 2026-09-11, the same pass the sibling took. Both plates used to be a whole shape filled
  // with currentColor at 0.28 and no stroke, which is what R-07 forbids and what made them read as
  // smears rather than as the two objects they are: each is now a stroked block over a washed fill.
  // The two Pods gained the inner app box every Pod in this catalog carries, because an empty 84 x 48
  // rectangle twice over is what left the canvas hollow. Neither change touches the accent: the two
  // bars on the road are still the only solid ink, and they are still identical.
  'network-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="99"  y="21" width="46" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="165" y="21" width="46" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3" opacity="0.55">
        <line x1="122" y1="41" x2="122" y2="82"/>
        <line x1="188" y1="41" x2="188" y2="82"/>
      </g>
      <rect x="20"  y="76" width="84" height="48" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="206" y="76" width="84" height="48" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="32"  y="88" width="60" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="218" y="88" width="60" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="104" y1="100" x2="206" y2="100" stroke-dasharray="4 3"/>
      <rect x="118" y="82" width="9" height="36" rx="3" fill="currentColor" opacity="0.95" stroke="none"/>
      <rect x="184" y="82" width="9" height="36" rx="3" fill="currentColor" opacity="0.95" stroke="none"/>
    </g>
  `,

  // Row of peers, one accented: four Pods split into two zones by a wider gap, the pinned zone-a
  // Pod heavier with the accent on its bar, zone-b Pods ghosted.
  'network-traffic-distribution': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="13"  y="45"  width="64" height="72" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="85"  y="45"  width="64" height="72" rx="8" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <rect x="25"  y="57"  width="22" height="4" rx="1" fill="rgba(255,255,255,0.10)"/>
      <rect x="97"  y="57"  width="22" height="4" rx="1" fill="rgba(255,255,255,0.10)"/>
      <rect x="25"  y="79"  width="40" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="97"  y="79"  width="40" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="13"  y="129" width="136" height="6" rx="2" fill="rgba(255,255,255,0.10)"/>
      <g stroke-dasharray="4 3" opacity="0.55">
        <rect x="171" y="45"  width="64" height="72" rx="8" fill="rgba(255,255,255,0.02)"/>
        <rect x="243" y="45"  width="64" height="72" rx="8" fill="rgba(255,255,255,0.02)"/>
        <rect x="183" y="79"  width="40" height="8" rx="1"/>
        <rect x="255" y="79"  width="40" height="8" rx="1"/>
        <rect x="171" y="129" width="136" height="6" rx="2"/>
      </g>
    </g>
  `,

  // Chain of stages read top to bottom, where the fallthrough is said by the BREAK in the first
  // stage rather than by a line: the cache band is split open in the middle, its left slot empty and
  // its right one holding a dim copy the answer left behind, and the whole question lands on the one
  // bright bar of the stage below. Both halves drop a dashed leg into that stage, so the BREAK says
  // the fallthrough and the legs say what the chain is fed by. Accent: that answer bar at 0.9, the
  // six losers on the same bar at 0.3. forward is a dashed empty rung on a dashed leg at half the
  // weight of those legs and twice their stroke, drawn and never taken. The three stages stand 23
  // apart, the same distance the top and bottom margins take.
  'network-dns-coredns': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="18" width="110" height="32" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="186" y="18" width="110" height="32" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="24"  y="73" width="272" height="50" rx="9" fill="rgba(255,255,255,0.07)"/>
      <g stroke-dasharray="4 3">
        <line x1="79"  y1="50" x2="79"  y2="73"/>
        <line x1="241" y1="50" x2="241" y2="73"/>
      </g>
      <g stroke-dasharray="4 3" opacity="0.4" stroke-width="2">
        <line x1="160" y1="123" x2="160" y2="146"/>
        <rect x="70" y="146" width="180" height="16" rx="7"/>
      </g>
    </g>
    <g fill="currentColor" stroke="none">
      <rect x="210" y="30" width="62" height="8"  rx="1" opacity="0.3"/>
      <rect x="38"  y="91" width="28" height="14" rx="2" opacity="0.3"/>
      <rect x="74"  y="91" width="28" height="14" rx="2" opacity="0.3"/>
      <rect x="110" y="91" width="28" height="14" rx="2" opacity="0.3"/>
      <rect x="146" y="91" width="28" height="14" rx="2" opacity="0.9"/>
      <rect x="182" y="91" width="28" height="14" rx="2" opacity="0.3"/>
      <rect x="218" y="91" width="28" height="14" rx="2" opacity="0.3"/>
      <rect x="254" y="91" width="28" height="14" rx="2" opacity="0.3"/>
    </g>
  `,

  // One name, several shapes of answer. The FQDN is a band of four identical segments joined by the
  // dots of the name itself, and it forks into three identical record chips. The ONLY difference the
  // poster draws is the answer count: the middle chip carries three dots (headless, one record per
  // Pod), the others carry one. No resolver box and no record ladder, since the card already draws
  // those and the poster only has to say what the card is ABOUT.
  'network-dns-records': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="31"  y="40"  width="60" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="97"  y="40"  width="60" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="163" y="40"  width="60" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="229" y="40"  width="60" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="34"  y="124" width="60" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="130" y="124" width="60" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="226" y="124" width="60" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="68"  x2="160" y2="98"/>
        <line x1="64"  y1="98"  x2="256" y2="98"/>
        <line x1="64"  y1="98"  x2="64"  y2="124"/>
        <line x1="160" y1="98"  x2="160" y2="124"/>
        <line x1="256" y1="98"  x2="256" y2="124"/>
      </g>
    </g>
    <circle cx="94"  cy="54"  r="1.3" fill="currentColor"/>
    <circle cx="160" cy="54"  r="1.3" fill="currentColor"/>
    <circle cx="226" cy="54"  r="1.3" fill="currentColor"/>
    <circle cx="64"  cy="139" r="2.4" fill="currentColor"/>
    <circle cx="146" cy="139" r="2.4" fill="currentColor"/>
    <circle cx="160" cy="139" r="2.4" fill="currentColor"/>
    <circle cx="174" cy="139" r="2.4" fill="currentColor"/>
    <circle cx="256" cy="139" r="2.4" fill="currentColor"/>
  `,
  // Branch, two sources into one Pod file: the cluster settings and the Node file, each a roster of
  // three lines. The pair stacks into the exact extent of the file block, so both legs run straight
  // and land on a line of it. Accent: the middle line of the file, at 0.9 against the same bar at 0.3.
  'network-dns-pod-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30"  y="42"  width="80" height="42" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="30"  y="96"  width="80" height="42" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="196" y="42"  width="96" height="96" rx="8" fill="rgba(255,255,255,0.06)" stroke-width="2"/>
      <path d="M 110 63 H 196" stroke-width="2"/>
      <path d="M 110 117 H 196" stroke-width="2" stroke-dasharray="4 3"/>
    </g>
    <rect x="42"  y="50"  width="56" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="42"  y="61"  width="56" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="42"  y="72"  width="56" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="42"  y="104" width="56" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="42"  y="115" width="56" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="42"  y="126" width="56" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="210" y="59"  width="68" height="8" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="210" y="86"  width="68" height="8" rx="1" fill="currentColor" opacity="0.9"/>
    <rect x="210" y="113" width="68" height="8" rx="1" fill="currentColor" opacity="0.3"/>
  `,

  // Row of peers: three Nodes carry the same port slot, and the middle one holds no Pod yet answers
  // and forwards sideways. Accent: the middle Node slot at 0.9 against the same bar at 0.3.
  'network-nodeport-loadbalancer': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28"  y="40" width="76" height="100" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="122" y="40" width="76" height="100" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="216" y="40" width="76" height="100" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="42"  y="52" width="48" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="136" y="52" width="48" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="230" y="52" width="48" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <rect x="40"  y="90" width="52" height="22" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="134" y="90" width="52" height="22" rx="4" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <rect x="228" y="90" width="52" height="22" rx="4" fill="rgba(255,255,255,0.10)"/>
      <path d="M 104 101 H 122 M 198 101 H 216" opacity="0.45"/>
    </g>
  `,

  // Three shapes on the way in, one band on the way back, nothing else. The two NAT hooks are the
  // boxes and each carries the same rewrite glyph, one address chip becoming another: the destination
  // on the way in, the source on the way out. Between them the routing decision is a DIAMOND, the one
  // shape that is not a box because it is the one that CHOOSES, and it sits AFTER the first rewrite,
  // which is why the order matters: routing only ever sees the already rewritten address. The reply
  // walks none of it, the conntrack band under the rail IS the way back. FORWARD, the filter hook and
  // the Node frame are left out: the poster only has to say why the ORDER is the point.
  'network-netfilter-path': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="34"  y="44" width="72" height="42" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="44"  y="57" width="18" height="16" rx="3" fill="rgba(255,255,255,0.10)"/>
      <rect x="78"  y="57" width="18" height="16" rx="3" fill="rgba(255,255,255,0.10)"/>
      <line x1="64" y1="65" x2="74" y2="65"/>
      <path d="M71 61 L76 65 L71 69"/>

      <path d="M160 45 L180 65 L160 85 L140 65 Z" fill="currentColor" stroke="none"/>

      <rect x="214" y="44" width="72" height="42" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="224" y="57" width="18" height="16" rx="3" fill="rgba(255,255,255,0.10)"/>
      <rect x="258" y="57" width="18" height="16" rx="3" fill="rgba(255,255,255,0.10)"/>
      <line x1="244" y1="65" x2="254" y2="65"/>
      <path d="M251 61 L256 65 L251 69"/>

      <rect x="34"  y="106" width="252" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>

      <g stroke-dasharray="4 3">
        <line x1="106" y1="65" x2="140" y2="65"/>
        <line x1="180" y1="65" x2="214" y2="65"/>
        <line x1="278" y1="121" x2="42"  y2="121"/>
      </g>
      <path d="M166 116 L160 121 L166 126"/>
    </g>
  `,

  // Nested containment, and the shell is the whole subject. The band along the bottom is the Node
  // address and both Pods carry the same core. Left is hostPort: the core sits inside the Pod own
  // network shell, and the link to the band stops on that shell outer edge. Right is hostNetwork:
  // the same shell in the same place but dashed away, a boundary that is not really there, and the
  // link meets it at the same edge. Accent is the address bar in the left core, its own, against the
  // same bar at 0.3 in the right core, which is the Node one.
  'network-hostnetwork-hostport': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="136" width="280" height="28" rx="6" fill="rgba(255,255,255,0.08)"/>

      <rect x="30" y="24" width="116" height="96" rx="10" stroke-width="2" fill="rgba(255,255,255,0.04)"/>
      <rect x="48" y="44" width="80" height="56" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="58" y="66" width="60" height="12" rx="3" fill="currentColor" opacity="0.9" stroke="none"/>
      <line x1="88" y1="120" x2="88" y2="136"/>

      <rect x="174" y="24" width="116" height="96" rx="10" stroke-dasharray="4 3" opacity="0.55" fill="rgba(255,255,255,0.04)"/>
      <rect x="192" y="44" width="80" height="56" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="202" y="66" width="60" height="12" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
      <line x1="232" y1="120" x2="232" y2="136"/>

      <rect x="72" y="143" width="32" height="14" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
      <rect x="216" y="143" width="32" height="14" rx="3" fill="currentColor" opacity="0.3" stroke="none"/>
    </g>
  `,

  // A diptych: the same little scene twice, and the ONLY thing the policy changes is the Node border.
  // Left is Cluster, so the border is a faint dashed hint and the call reaches the backend inside the
  // Node and also climbs out over that border to the one outside. Right is Local, so the same border
  // is drawn solid as a wall: the leg that would leave the Node is cut short and crossed out at it,
  // and the outside backend with its would-be path fade to a ghost, leaving only the short leg that
  // stays home. Same caller, same two backends, one boundary that either lets traffic through or does
  // not.
  'network-internal-traffic-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="160" y1="24" x2="160" y2="156" stroke-dasharray="4 3"/>

      <rect x="16"  y="64"  width="128" height="88" rx="10" fill="rgba(255,255,255,0.03)" stroke-dasharray="5 4" opacity="0.45"/>
      <rect x="28"  y="96"  width="44"  height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="88"  y="96"  width="44"  height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="88"  y="20"  width="44"  height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="72" y1="110" x2="88" y2="110"/>
        <path d="M50 96 L50 34 L88 34"/>
      </g>

      <rect x="176" y="64"  width="128" height="88" rx="10" fill="rgba(255,255,255,0.05)" stroke-width="1.9"/>
      <rect x="188" y="96"  width="44"  height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="248" y="96"  width="44"  height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="258" y="106" width="24"  height="8"  rx="2" fill="currentColor" stroke="none"/>
      <g opacity="0.25">
        <rect x="248" y="20" width="44" height="28" rx="5" fill="rgba(255,255,255,0.04)"/>
        <path d="M210 64 L210 34 L248 34" stroke-dasharray="4 3"/>
      </g>
      <g stroke-dasharray="4 3">
        <line x1="232" y1="110" x2="248" y2="110"/>
        <line x1="210" y1="96"  x2="210" y2="80"/>
      </g>
      <path d="M204 68 L216 80 M216 68 L204 80"/>
    </g>
  `,

  // Mirrors the diagram: clients above an upstream router, which fans down to three Nodes that each
  // hold a backend Pod. All three Pods carry the same tint and no ball rides the fan, so the poster
  // states the composition and which Node owns the address is what the steps answer. Client and
  // router centred on x=160, the three Nodes mirrored about it, each Pod centred inside its Node,
  // every fan leg leaving the router bottom edge and landing on a Node top edge without crossing one.
  'network-loadbalancer-bare-metal': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="130" y="18"  width="60" height="20" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="112" y="50"  width="96" height="26" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="132" y="58"  width="56" height="10" rx="2" fill="currentColor" stroke="none"/>
      <rect x="16"  y="104" width="92" height="56" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="114" y="104" width="92" height="56" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="212" y="104" width="92" height="56" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="34"  y="118" width="56" height="26" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="132" y="118" width="56" height="26" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="230" y="118" width="56" height="26" rx="5" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="38" x2="160" y2="50"/>
        <path d="M160 76 L160 88 L62 88 L62 104"/>
        <line x1="160" y1="88" x2="160" y2="104"/>
        <path d="M160 76 L160 88 L258 88 L258 104"/>
      </g>
    </g>
  `,

  // A routing junction, not another box-and-line row: one request enters a square decision node, which
  // splits it into two CURVED paths sweeping out to a pair of rounded backend pills. The Ingress rule
  // table, two bars with the shorter one the more specific rule, docks above the junction and feeds
  // it. Curves and pills keep this poster from reading like the rectangle rows of its siblings. The
  // junction sits on the flow line y=100, the two pills mirror it at -/+34, the entry dash meets the
  // square left edge at 96, both curves leave its right edge at 128 and the rule table drops onto its
  // top edge at 84.
  'network-ingress-routing': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="84" y="28" width="56" height="30" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="93" y="34" width="38" height="8" rx="2" fill="currentColor" stroke="none"/>
      <line x1="93" y1="48" x2="121" y2="48"/>
      <line x1="112" y1="58" x2="112" y2="84" stroke-dasharray="4 3"/>
      <line x1="32" y1="100" x2="96" y2="100" stroke-dasharray="4 3"/>
      <rect x="96" y="84" width="32" height="32" rx="6" fill="rgba(255,255,255,0.06)"/>
      <path d="M128 100 C 158 100, 166 66, 198 66"/>
      <path d="M128 100 C 158 100, 166 134, 198 134"/>
      <rect x="198" y="52"  width="90" height="28" rx="14" fill="rgba(255,255,255,0.04)"/>
      <rect x="198" y="120" width="90" height="28" rx="14" fill="rgba(255,255,255,0.04)"/>
      <circle cx="216" cy="66"  r="4"/>
      <circle cx="216" cy="134" r="4"/>
    </g>
  `,

  // Two zones compared, side by side on one skeleton: traffic enters a Node with no Pod, above a Node
  // with one. Cluster (left) hands it down to that Pod, Local (right) has no hop and drops it where
  // it landed. Accent on the Cluster Pod, the one the traffic reaches. One dashed feed drops from the
  // top edge, an unseen external source, and forks onto both entry Nodes with a chevron on each.
  'network-external-traffic-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32"  y="46" width="104" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="184" y="46" width="104" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="48"  y="56" width="72" height="24" rx="4" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <rect x="200" y="56" width="72" height="24" rx="4" fill="rgba(255,255,255,0.02)" stroke-dasharray="4 3"/>
      <path d="M228 60 L244 76 M244 60 L228 76" stroke-width="2"/>
      <rect x="32"  y="114" width="104" height="44" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="184" y="114" width="104" height="44" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="48"  y="124" width="72" height="24" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="200" y="124" width="72" height="24" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="58"  y="132" width="52" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="210" y="132" width="52" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3"/>
      <line x1="84" y1="90" x2="84" y2="114"/>
      <path d="M160 4 V24 M84 39 V24 H236 V39" stroke-dasharray="4 3"/>
      <polyline points="79,40 84,46 89,40"/>
      <polyline points="231,40 236,46 241,40"/>
    </g>
  `,

  // Twin three-row stacks flanking a wall: the same packet drawn on both sides of the proxy, so the
  // reader compares row by row. The accent is the row CARRYING the client address, and it MOVES,
  // top row on the left (the socket still holds it) and middle row on the right (only the header
  // does). Symmetric about cx 160, the wall solid at 0.3 so the barrier is not the subject.
  'network-client-ip-preservation': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28"  y="44" width="112" height="96" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="180" y="44" width="112" height="96" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="36"  y="53" width="96" height="22" rx="4" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="36"  y="81" width="96" height="22" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="36" y="109" width="96" height="22" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="188"  y="53" width="96" height="22" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="188"  y="81" width="96" height="22" rx="4" fill="currentColor" stroke="none" opacity="0.9"/>
      <rect x="188" y="109" width="96" height="22" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="152" y="36" width="16" height="112" rx="3" fill="currentColor" stroke="none" opacity="0.3"/>
    </g>
  `,

  // Stack of layers with a gate on every join, all three open with their halves apart at 0.3. The spine
  // drops into the block on the rail where the stack and the rail meet, and its bar at 0.9 is the accent.
  'network-gateway-api': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="100" y="12"  width="120" height="22" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="100" y="46"  width="120" height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="100" y="80"  width="120" height="22" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="100" y="114" width="120" height="22" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="16"  y="148" width="76"  height="24" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="122" y="148" width="76"  height="24" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="228" y="148" width="76"  height="24" rx="4" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <line x1="160" y1="34"  x2="160" y2="46"/>
      <line x1="160" y1="68"  x2="160" y2="80"/>
      <line x1="160" y1="102" x2="160" y2="114"/>
      <line x1="160" y1="136" x2="160" y2="148"/>
      <line x1="92"  y1="160" x2="122" y2="160"/>
      <line x1="198" y1="160" x2="228" y2="160" stroke-dasharray="4 3"/>
    </g>
    <g fill="currentColor">
      <rect x="142" y="38"  width="12" height="4" rx="1" opacity="0.3"/>
      <rect x="166" y="38"  width="12" height="4" rx="1" opacity="0.3"/>
      <rect x="142" y="72"  width="12" height="4" rx="1" opacity="0.3"/>
      <rect x="166" y="72"  width="12" height="4" rx="1" opacity="0.3"/>
      <rect x="142" y="106" width="12" height="4" rx="1" opacity="0.3"/>
      <rect x="166" y="106" width="12" height="4" rx="1" opacity="0.3"/>
      <rect x="138" y="157" width="44" height="6" rx="1" opacity="0.9"/>
    </g>
  `,

  // The same shape as the cross-node card but wholly inside ONE big Node block, both Pods sharing it:
  // Pod A bright as the source and Pod B dim as the destination flank the cni0 bridge, joined by
  // clean dashed veths with no packet dots. The hero is the bright frame sitting BARE inside the
  // bridge, no outer wrapper, which is the same-node point.
  // One Node, one bridge, and the table under it that learns which port the answer came from. The
  // table is what separates this silhouette from `network-pod-to-pod-cross-node`, which is the same
  // peer pair with no table and TWO frames: a reader scrolling the section must not meet one shape
  // twice (R-05). Every block carries interior furniture rather than standing as a bare outline.
  'network-pod-to-pod-same-node': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="12"  y="30" width="296" height="120" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="28"  y="48" width="66"  height="46"  rx="7"  fill="rgba(255,255,255,0.09)"/>
      <rect x="226" y="48" width="66"  height="46"  rx="7"  fill="rgba(255,255,255,0.05)" opacity="0.75"/>
      <rect x="128" y="52" width="64"  height="38"  rx="6"  fill="rgba(255,255,255,0.10)"/>
      <rect x="118" y="106" width="84" height="24"  rx="5"  fill="rgba(255,255,255,0.06)"/>
      <g stroke-dasharray="4 3">
        <line x1="94"  y1="71" x2="128" y2="71"/>
        <line x1="192" y1="71" x2="226" y2="71"/>
      </g>
    </g>
    <rect x="38"  y="62" width="46" height="15" rx="3" fill="currentColor" opacity="0.22"/>
    <rect x="236" y="62" width="46" height="15" rx="3" fill="currentColor" opacity="0.22"/>
    <rect x="138" y="64" width="44" height="13" rx="4" fill="currentColor" opacity="0.90"/>
    <rect x="126" y="110" width="68" height="7" rx="2" fill="currentColor" opacity="0.22"/>
    <rect x="126" y="120" width="68" height="7" rx="2" fill="currentColor" opacity="0.22"/>
  `,
};
