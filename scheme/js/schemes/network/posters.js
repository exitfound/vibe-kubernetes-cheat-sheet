// Design notes: ./CARDS/<card-id>.md, and the note for one poster is the comment above it here.
// The network posters, keyed by card id: the still frame each card shows on the grid.

export const POSTERS = {
  // A bus band over two dashed Node frames: one bright full-width range bar is the flat address space,
  // each Pod carries the same bar at 0.3, and the legs cross the Node frames to attach to the space.
  'network-flat-pod-network': `
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

  // Nested containment: three tenants over the one stack they share, each leg dropping straight down.
  // The stack carries the weight, and one bright bar in its top layer echoes dim in each tenant.
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

  // Client Pod to netfilter (a 2x2 conntrack table) to server Pod, request and reply on two chevroned
  // lanes with no packet resting on them. Accent: the translated tuple the entry remembers.
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

  // Two zones compared: two datagrams on one link, header plus a payload whose length is the difference,
  // and an outcome cell filled or dashed hollow. Accent: the overrun the hop does not carry.
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

  // Branch: three src-over-dst readouts, the input, the outcome that stays inside on a solid leg, and
  // the outcome that leaves on a dashed one. Accent: the whole leaving readout at 0.9.
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
  'network-containers-share-localhost': `
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

  // Segmented budget bar under a replica ruler on one grid: Pods grouped 3 and 1, a dashed tick where
  // the replica count would cut, a solid divider where the weights do. Accent: the 90 share.
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
  'network-loadbalancer-straight-to-pods': `
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

  // The staircase of guesses: each search-list attempt drops one suffix, so the rows descend down a
  // dashed rail with one query dot each. The staircase is the cost, no topology.
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

  // Where a normal Service keeps a VIP, headless keeps an answer: a sheet of three A records feeds one
  // bus that branches once per Pod, so the record count and the Pod count match.
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

  // Ghost to solid, one object twice, the bars are address groups: v4 groups plus an empty dashed slot,
  // then the eight bright v6 groups that fill it, the only accent.
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

  // Two zones compared, a slot filled against the same slot empty: the two veth ends face each other
  // across a dashed boundary, eth0 holding the bright address bar and the peer an empty dashed box.
  // pause and app sit under eth0, and the peer's solid leg lands on the middle port of the cni0 band.
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

  // Chain of stages over a segmented result band: three equal programs on dashed legs, one band part
  // under each, the third part the accent (R-08). host-local hangs dashed under the middle program.
  'network-wiring-pod-via-cni': `
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

  // Encapsulation as the hero: Pod A on Node-1 to Pod B on Node-2, mid-gap a bright inner Pod frame
  // wrapped in an outer Node header on a dashed flow. Source bright, destination dim.
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

  // A bracket down the left cut into three, a block beside each piece aligned to its segment, so no
  // two parts overlap. Accent: the bar inside the middle block, an address out of one part.
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
  'network-service-and-endpointslice': `
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

  // Two zones compared on one x, fed from a shared source: the top frame chains five slots, the bottom
  // holds one bright slot alone on the top third slot's x, the hash lookup. No backend block.
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

  // The wall: minSyncPeriod is a floor, drawn as the one upright bar in the gap. Left, smaller, a queue
  // of identical change ticks, right, heavier, the three rule slabs already written.
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

  // One row leaves the map and becomes the connection: five entries in the BPF map frame, the middle lit,
  // and the same bright bar on the path passing three empty per-packet stops uncut.
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

  // One input sorted into one of three equal slots (equal on purpose, size would be a fake quantity):
  // packet, trunk, fork bus, three stroked slots with a bar each, the middle one lit (R-07).
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

  // The conjunction: one connection between two Pods with an identical bright bar on the road at each
  // end, neither verdict outranking the other. One dim plate above drops onto each bar, equal length,
  // since the two boundaries know nothing of each other.
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

  // Chain of stages read top to bottom: the cache band breaks open, left slot empty, right a dim copy,
  // and both halves drop dashed legs onto the bright answer bar below. forward is a dashed untaken rung.
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

  // One name, several shapes of answer: the FQDN band forks into three identical record chips, the middle
  // carrying three dots (headless, one record per Pod), the others one.
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

  // Two NAT hooks with the same rewrite glyph, the routing diamond between them after the first rewrite,
  // and the conntrack band under the rail as the way back. Says why the order is the point.
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

  // Nested containment over the Node address band: left hostPort, the core inside the Pod own shell,
  // right hostNetwork, the shell dashed away. Accent: the left core own address bar.
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

  // A diptych where only the Node border changes: Cluster, a faint dashed border the call climbs out over,
  // Local, a solid wall that cuts the outside leg and ghosts the outside backend.
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

  // Clients over an upstream router fanning to three Nodes, each holding a backend Pod in one tint with
  // no ball on the fan, so which Node owns the address is left to the steps.
  'network-loadbalancer-without-cloud': `
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

  // A routing junction: one request enters a square decision node and splits into two curved paths to
  // rounded backend pills, the rule table docked above. Curves keep it off the siblings rectangle rows.
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

  // Two zones compared on one skeleton, one dashed feed forking onto a Node with no Pod over a Node with
  // one: Cluster hands it down, Local drops it. Accent: the Cluster Pod the traffic reaches.
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

  // Twin three-row stacks flanking a wall, the same packet each side of the proxy. The accent is the row
  // carrying the client address, and it moves: the socket row left, the header row right.
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

  // One Node, one cni0 bridge, Pod A bright and Pod B dim on dashed veths, and the table under the bridge
  // that learns the answer port, which sets it apart from network-pod-to-pod-cross-node (R-05).
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
