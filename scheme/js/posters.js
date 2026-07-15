export const POSTERS = {
  // One flat network band with three Pods hanging off it, a packet riding the band.
  'network-model': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="40"  width="272" height="26" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="46"  y="100" width="48"  height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="136" y="100" width="48"  height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="226" y="100" width="48"  height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="36"  y1="53" x2="284" y2="53"  stroke-dasharray="4 3"/>
      <line x1="70"  y1="66" x2="70"  y2="100" stroke-dasharray="4 3"/>
      <line x1="160" y1="66" x2="160" y2="100" stroke-dasharray="4 3"/>
      <line x1="250" y1="66" x2="250" y2="100" stroke-dasharray="4 3"/>
    </g>
  `,

  // Host netns on the left, one centered dashed veth crossing into the Pod netns box. Inside, app +
  // sidecar on top and eth0 + lo below are all joined by one H-shaped shared-stack rail. Symmetric
  // about the Pod centre.
  'network-namespaces': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16"  y="66"  width="60"  height="48"  rx="8"  fill="rgba(255,255,255,0.04)"/>
      <rect x="150" y="28"  width="154" height="124" rx="11" fill="rgba(255,255,255,0.03)"/>
      <rect x="166" y="46"  width="52"  height="26"  rx="5"  fill="rgba(255,255,255,0.05)"/>
      <rect x="236" y="46"  width="52"  height="26"  rx="5"  fill="rgba(255,255,255,0.05)"/>
      <rect x="166" y="106" width="52"  height="26"  rx="5"  fill="rgba(255,255,255,0.05)"/>
      <rect x="236" y="106" width="52"  height="26"  rx="5"  fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="76"  y1="90" x2="150" y2="90"/>
        <line x1="192" y1="72" x2="192" y2="106"/>
        <line x1="262" y1="72" x2="262" y2="106"/>
        <line x1="192" y1="90" x2="262" y2="90"/>
      </g>
    </g>
  `,

  // The scheme in miniature, vertically centred: client Pod -> netfilter (holding a 2x2 conntrack
  // table mapping the original tuple to the translated one) -> server Pod. Two lanes carry the flow
  // with explicit chevrons: the request runs left to right on the top lane, the reply runs right to
  // left on the bottom lane, each with its own packet.
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
      <line x1="136" y1="106" x2="148" y2="106"/><line x1="172" y1="106" x2="184" y2="106"/>
      <g stroke-dasharray="4 3">
        <line x1="78" y1="71" x2="116" y2="71"/><line x1="204" y1="71" x2="242" y2="71"/>
        <line x1="78" y1="109" x2="116" y2="109"/><line x1="204" y1="109" x2="242" y2="109"/>
      </g>
      <path d="M 95 67 L 100 71 L 95 75"/><path d="M 221 67 L 226 71 L 221 75"/>
      <path d="M 225 105 L 220 109 L 225 113"/><path d="M 99 105 L 94 109 L 99 113"/>
    </g>
    <circle cx="97" cy="71" r="3.2" fill="currentColor"/><circle cx="223" cy="109" r="3.2" fill="currentColor"/>
  `,

  // A Node wrapping a client Pod (outer shell + inner app) and a MASQUERADE box, with the Internet as
  // a small globe off to the right. Two dashed lanes cross the SNAT boundary as a round trip: the
  // request runs left to right on the top lane, the reply runs right to left on the bottom lane,
  // chevrons mark the direction. Pod, masq and internet share one centre row.
  'network-pod-egress-snat': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="12"  y="40"  width="188" height="100" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="26"  y="62"  width="58"  height="56"  rx="9"  fill="rgba(255,255,255,0.04)"/>
      <rect x="36"  y="80"  width="38"  height="20"  rx="4"  fill="rgba(255,255,255,0.05)"/>
      <rect x="116" y="68"  width="72"  height="44"  rx="6"  fill="rgba(255,255,255,0.04)"/>
      <rect x="248" y="68"  width="58"  height="44"  rx="8"  fill="rgba(255,255,255,0.04)"/>
      <circle cx="277" cy="90" r="11"/>
      <line x1="266" y1="90" x2="288" y2="90"/>
      <ellipse cx="277" cy="90" rx="4.5" ry="11"/>
      <g stroke-dasharray="4 3">
        <line x1="84"  y1="80"  x2="116" y2="80"/>
        <line x1="188" y1="80"  x2="248" y2="80"/>
        <line x1="84"  y1="100" x2="116" y2="100"/>
        <line x1="188" y1="100" x2="248" y2="100"/>
      </g>
      <path d="M 105 76 L 110 80 L 105 84"/>
      <path d="M 237 76 L 242 80 L 237 84"/>
      <path d="M 199 96 L 194 100 L 199 104"/>
      <path d="M 95 96 L 90 100 L 95 104"/>
    </g>
  `,

  // One Pod box with two containers linked over a short localhost lane.
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
    <circle cx="160" cy="90" r="8"  fill="none" stroke="currentColor" stroke-width="1.2"/>
  `,

  // Abstract, not the literal diagram: the client-facing port lives on one level and the container
  // targetPort on another. Traffic enters the Service high on the front-door plane and leaves low on
  // the container plane, and the vertical step through the box is the port -> targetPort remap. A ring
  // centred on each dashed hop marks the port on that plane: the front-door port and the container port.
  'network-service-ports': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="56" width="46" height="32" rx="7" fill="rgba(255,255,255,0.04)"/>
      <rect x="137" y="52" width="46" height="76" rx="9" fill="rgba(255,255,255,0.05)"/>
      <rect x="252" y="92" width="46" height="32" rx="7" fill="rgba(255,255,255,0.04)"/>
      <line x1="68"  y1="72"  x2="137" y2="72"  stroke-dasharray="4 3"/>
      <line x1="183" y1="108" x2="252" y2="108" stroke-dasharray="4 3"/>
      <line x1="150" y1="72"  x2="170" y2="108"/>
    </g>
    <circle cx="102.5" cy="72"  r="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
    <circle cx="217.5" cy="108" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  `,

  // Abstract, not the literal diagram: two balanced lanes share one client column (left) and one
  // external-target column (right), crossing one dashed cluster edge. The whole contrast is hollow
  // vs solid. Top lane (type ExternalName) is a pure DNS alias: hollow client ring to a hollow
  // resolver ring to a hollow external host, no ClusterIP and no proxy anywhere on the path. Bottom
  // lane (no-selector ClusterIP) is machinery: a lit cyan VIP straight into a kube-proxy box, on to a
  // hand-attached EndpointSlice (dashed chip), then a DNAT hop across the edge to a lit cyan endpoint.
  'network-externalname': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="78"  y1="56" x2="132" y2="56" stroke-dasharray="4 3"/>
      <line x1="196" y1="56" x2="248" y2="56" stroke-dasharray="4 3"/>
      <rect x="20"  y="35" width="58" height="42" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="32"  y="48" width="34" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="132" y="35" width="64" height="42" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="144" y="51" width="40" height="9"  rx="2" fill="rgba(255,255,255,0.10)"/>
      <rect x="248" y="35" width="56" height="42" rx="9" fill="rgba(255,255,255,0.04)"/>
      <line x1="78"  y1="124" x2="132" y2="124" stroke-dasharray="4 3"/>
      <line x1="196" y1="124" x2="248" y2="124" stroke-dasharray="4 3"/>
      <rect x="20"  y="103" width="58" height="42" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="32"  y="116" width="34" height="16" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="132" y="103" width="64" height="42" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="248" y="103" width="56" height="42" rx="9" fill="rgba(255,255,255,0.04)"/>
    </g>
    <rect x="144" y="119" width="40" height="9"  rx="2" fill="rgba(79,229,255,0.30)"/>
  `,

  // Client to kube-proxy, which fans at right angles to two symmetric backends: web-a (Ready, top,
  // solid, neutral endpoint bar) takes new connections, while web-c (Terminating, bottom, dashed) is
  // still serving one in-flight flow, shown by the cyan drain lane and its cyan serving bar. The solid
  // vs dashed pair is the whole idea: one healthy backend and one that is draining before it leaves.
  'network-service-terminating-endpoints': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <line x1="66" y1="90" x2="104" y2="90" stroke-dasharray="4 3"/>
      <polyline points="170,78 200,78 200,52 232,52" stroke-dasharray="4 3"/>
      <rect x="14"  y="72"  width="52" height="36" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="24"  y="83"  width="32" height="14" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="104" y="66"  width="66" height="48" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="32"  width="74" height="40" rx="9" fill="rgba(255,255,255,0.04)"/>
      <rect x="244" y="47"  width="50" height="10" rx="3" fill="rgba(255,255,255,0.06)"/>
      <rect x="232" y="108" width="74" height="40" rx="9" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
    </g>
    <polyline points="170,102 200,102 200,128 232,128" fill="none" stroke="rgba(79,229,255,0.7)" stroke-width="1.4" stroke-dasharray="4 3"/>
    <rect x="244" y="123" width="50" height="10" rx="3" fill="rgba(79,229,255,0.30)"/>
  `,

  // Client -> Ingress (the termination point, fed by a TLS Secret) -> backend Pod. Abstraction: a
  // CLOSED padlock rides the inbound leg (encrypted https) and an OPEN padlock rides the outbound leg
  // (decrypted plain http), so the poster reads the encrypted-to-plaintext handoff at a glance.
  'network-tls-termination': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="78" width="54" height="42" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="130" y="69" width="72" height="60" rx="9" fill="rgba(255,255,255,0.06)"/>
      <rect x="142" y="30" width="48" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="256" y="78" width="54" height="42" rx="8" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="166" y1="56" x2="166" y2="69"/>
        <line x1="76"  y1="99" x2="130" y2="99"/>
        <line x1="202" y1="99" x2="256" y2="99"/>
      </g>
      <g transform="translate(96,89)">
        <rect x="0" y="5" width="14" height="11" rx="2" fill="#1a1538"/>
        <path d="M3 5 V2.5 a4 4 0 0 1 8 0 V5"/>
      </g>
      <g transform="translate(222,89)">
        <rect x="0" y="5" width="14" height="11" rx="2" fill="#1a1538"/>
        <path d="M3 5 V2.5 a4 4 0 0 1 8 0"/>
      </g>
    </g>
  `,

  // Client and cloud LB outside a full-height cluster edge, kube-proxy + conntrack + Pod inside the
  // Node. Two lanes (request above, reply below) make the round trip read as a loop, not a retrace.
  // North-south = crossing the cluster boundary and coming straight back. Two faint framed regions
  // (outside | Node) separated by a gap that IS the boundary: a request packet crosses it left to right
  // on the top lane, the reply crosses right to left on the bottom lane. Inside the outside region a
  // client square feeds a LB pill, inside the Node a kube-proxy pill hands off to the backend Pod while
  // a 2x2 conntrack/NAT table sits under it. Abstracted from the dialog so it reads as a boundary
  // crossing and a round trip, not a row of boxes.
  'network-north-south-path': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="10"  y="44"  width="118" height="92" rx="11" fill="rgba(255,255,255,0.025)"/>
      <rect x="150" y="44"  width="160" height="92" rx="11" fill="rgba(255,255,255,0.025)"/>
      <rect x="22"  y="76"  width="30"  height="28" rx="5"  fill="rgba(255,255,255,0.05)"/>
      <rect x="68"  y="74"  width="44"  height="32" rx="7"  fill="rgba(255,255,255,0.05)"/>
      <rect x="166" y="70"  width="48"  height="30" rx="6"  fill="rgba(255,255,255,0.05)"/>
      <rect x="252" y="64"  width="46"  height="42" rx="8"  fill="rgba(255,255,255,0.05)"/>
      <rect x="260" y="76"  width="30"  height="20" rx="4"  fill="rgba(255,255,255,0.07)"/>
      <rect x="166" y="110" width="84"  height="22" rx="3"  fill="rgba(255,255,255,0.05)"/>
      <line x1="208" y1="110" x2="208" y2="132"/>
      <line x1="166" y1="121" x2="250" y2="121"/>
      <line x1="173" y1="116" x2="187" y2="116"/><line x1="215" y1="116" x2="229" y2="116"/>
      <line x1="173" y1="127" x2="185" y2="127"/><line x1="215" y1="127" x2="227" y2="127"/>
      <g stroke-dasharray="4 3">
        <line x1="52"  y1="90"  x2="68"  y2="90"/>
        <line x1="214" y1="85"  x2="252" y2="85"/>
        <line x1="190" y1="100" x2="190" y2="110"/>
        <line x1="112" y1="82"  x2="166" y2="82"/>
        <line x1="166" y1="96"  x2="112" y2="96"/>
      </g>
      <path d="M 136 78 L 141 82 L 136 86"/>
      <path d="M 142 100 L 137 96 L 142 92"/>
      <path d="M 232 81 L 237 85 L 232 89"/>
    </g>
    <circle cx="139" cy="82" r="3.2" fill="currentColor"/>
    <circle cx="139" cy="96" r="3.2" fill="currentColor"/>
  `,

  // The staircase of guesses. A short name is not asked once: the resolver walks the search list, and
  // each attempt drops one suffix, so the candidate names get SHORTER row by row until only the bare
  // name is left. The rows are a descending staircase, the dashed rail on the left is the walk down it,
  // and the dot trailing each row is the query that attempt costs. The staircase IS the cost, which is
  // the whole point of ndots, so the poster spends everything on that one shape and draws no topology.
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

  // Near traffic and far traffic. Everything the Pods ask stays on one short rail inside the Node,
  // where the local agent answers it, and a single thin thread climbs OUT of the Node to the cluster
  // resolver: that is the miss, and it is the only lookup that pays for the trip. The meaning is in the
  // distances, not the topology, so the poster keeps the Node boundary (the line the thread has to
  // cross) and drops everything else the card already draws, packet dots included.
  'network-nodelocal-dnscache': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="196" y="14"  width="76"  height="32" rx="6"  fill="rgba(255,255,255,0.04)"/>
      <rect x="28"  y="70"  width="264" height="94" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="48"  y="100" width="68"  height="34" rx="6"  fill="rgba(255,255,255,0.05)"/>
      <rect x="152" y="100" width="52"  height="34" rx="6"  fill="rgba(255,255,255,0.04)"/>
      <rect x="224" y="100" width="52"  height="34" rx="6"  fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="116" y1="117" x2="152" y2="117"/>
        <line x1="204" y1="117" x2="224" y2="117"/>
        <line x1="82"  y1="100" x2="82"  y2="30"/>
        <line x1="82"  y1="30"  x2="196" y2="30"/>
      </g>
    </g>
  `,

  // A stack of Service-type rows fanning into one shared backend block.
  // The scheme in miniature, centred: five service-type rows on the left point STRAIGHT ACROSS to
  // their targets. The three proxy types (top) share one dashed backend node holding two Pods, while
  // ExternalName and Headless each get their own box.
  'network-service-types': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18" y="26"  width="96" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="18" y="54"  width="96" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="18" y="82"  width="96" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="18" y="110" width="96" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="18" y="138" width="96" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="206" y="22" width="96" height="82" rx="9" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="218" y="30" width="72" height="30" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="218" y="66" width="72" height="30" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="206" y="110" width="96" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="206" y="138" width="96" height="18" rx="4" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="114" y1="35"  x2="206" y2="35"/>
        <line x1="114" y1="63"  x2="206" y2="63"/>
        <line x1="114" y1="91"  x2="206" y2="91"/>
        <line x1="114" y1="119" x2="206" y2="119"/>
        <line x1="114" y1="147" x2="206" y2="147"/>
      </g>
    </g>
  `,

  // Where a normal Service keeps a VIP, headless keeps an ANSWER. The middle of the path is not a box
  // that rewrites the destination (there is none to rewrite: clusterIP None, so kube-proxy programs
  // nothing) but the DNS reply itself, a sheet of three A records. Each record leaves on its own leg to
  // its own Pod, so the record count and the Pod count are visibly the same number, which IS headless:
  // one record per ready Pod, and the client dials the Pod IP straight.
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

  // Client to a Service holding two ClusterIPs (v4 + v6) to a dual-addressed Pod.
  'network-dualstack': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="32"  y="64" width="60" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="128" y="52" width="64" height="76" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="228" y="64" width="60" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="138" y1="74"  x2="182" y2="74"/>
      <line x1="138" y1="106" x2="182" y2="106"/>
      <line x1="92"  y1="90" x2="128" y2="90" stroke-dasharray="4 3"/>
      <line x1="192" y1="90" x2="228" y2="90" stroke-dasharray="4 3"/>
    </g>
  `,

  // The scheme in miniature, workloads/cluster style (brightness hierarchy + one bright accent):
  // the Pod netns holds pause (bright, the netns owner) and app (dim), a single bright IP bar spans
  // both (one address, shared), and the hero is the veth pair: two lit end-nodes (eth0 in the Pod
  // and its host-side peer) joined by a dashed link out to the cni0 host bridge.
  'network-pod-ip-and-veth': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="46" width="148" height="90" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="40"  y="68" width="52"  height="40" rx="5"  fill="rgba(255,255,255,0.12)"/>
      <rect x="100" y="68" width="52"  height="40" rx="5"  fill="rgba(255,255,255,0.05)" opacity="0.65"/>
      <line x1="176" y1="90" x2="232" y2="90" stroke-dasharray="4 3"/>
      <circle cx="170" cy="90" r="6" fill="rgba(255,255,255,0.16)"/>
      <circle cx="232" cy="90" r="5" fill="rgba(255,255,255,0.12)"/>
      <rect x="232" y="66" width="62" height="48" rx="8" fill="rgba(255,255,255,0.05)"/>
    </g>
    <rect x="52" y="116" width="88" height="10" rx="3" fill="currentColor" opacity="0.85"/>
  `,

  // kubelet to the CRI runtime, the runtime invokes the CNI plugin chain (a spined
  // bridge/IPAM/result ladder), the bottom result tap drops the IP into the sandbox eth0.
  'network-cni-invocation': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="14"  y="54"  width="56" height="32" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="96"  y="54"  width="64" height="32" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="82"  y="116" width="92" height="50" rx="9" fill="rgba(255,255,255,0.03)"/>
      <rect x="94"  y="130" width="68" height="24" rx="4" fill="rgba(79,229,255,0.06)" stroke-opacity="0.6"/>
      <rect x="222" y="58"  width="82" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="222" y="94"  width="82" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="222" y="130" width="82" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="206" y1="70"  x2="206" y2="142"/>
        <line x1="206" y1="70"  x2="222" y2="70"/>
        <line x1="206" y1="106" x2="222" y2="106"/>
        <line x1="206" y1="142" x2="222" y2="142"/>
        <line x1="70"  y1="70"  x2="96"  y2="70"/>
        <line x1="160" y1="70"  x2="206" y2="70"/>
        <line x1="128" y1="86"  x2="128" y2="116"/>
        <line x1="206" y1="142" x2="174" y2="142"/>
      </g>
    </g>
  `,

  // Two nodes joined by an underlay carrying an encapsulated packet.
  // The hero is encapsulation itself: Pod A on Node-1 to Pod B on Node-2, and mid-gap the packet is
  // a packet-in-packet, a bright inner Pod frame wrapped inside an outer Node header. Source Pod is
  // bright, dest dim, the wrapped packet crosses the inter-Node gap on a dashed flow. Nesting reads
  // as the Pod frame carried between Nodes inside an outer envelope (VXLAN, or bare when routed).
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

  // Abstract: one range bar (the Service CIDR), a divider cutting off a small solid static band,
  // and along the open dynamic range a single lit cell, the one allocated ClusterIP.
  'network-service-cidr': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="44" y="40" width="232" height="100" rx="16" fill="rgba(255,255,255,0.035)"/>
      <rect x="49" y="46" width="54"  height="88"  rx="8"  fill="rgba(79,229,255,0.12)" stroke="none"/>
      <line x1="108" y1="40" x2="108" y2="140"/>
      <line x1="124" y1="90" x2="173" y2="90" stroke-dasharray="3 4" stroke-opacity="0.4"/>
      <line x1="211" y1="90" x2="260" y2="90" stroke-dasharray="3 4" stroke-opacity="0.4"/>
      <rect x="173" y="71" width="38" height="38" rx="6" fill="rgba(79,229,255,0.24)"/>
    </g>
  `,

  'network-ipam-pod-cidr': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="116" y="27"  width="88" height="34" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="36"  y="109" width="70" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="125" y="109" width="70" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="214" y="109" width="70" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="160" y1="61" x2="160" y2="109" stroke-dasharray="4 3"/>
      <line x1="71"  y1="85" x2="249" y2="85"  stroke-dasharray="4 3"/>
      <line x1="71"  y1="85" x2="71"  y2="109" stroke-dasharray="4 3"/>
      <line x1="249" y1="85" x2="249" y2="109" stroke-dasharray="4 3"/>
    </g>
  `,

  // The scheme abstracted to its essence: live Pods on the left (the source, the notReady one
  // dimmed) are reconciled into the EndpointSlice on the right (the derived list, one endpoint row
  // per Pod, notReady dimmed). Straight horizontal wires carry the one-row-per-Pod mapping.
  'network-endpointslice-reconcile': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28"  y="35"  width="86"  height="34" rx="6"  fill="rgba(255,255,255,0.05)"/>
      <rect x="28"  y="79"  width="86"  height="34" rx="6"  fill="rgba(255,255,255,0.05)"/>
      <rect x="28"  y="123" width="86"  height="34" rx="6"  fill="rgba(255,255,255,0.04)" opacity="0.4"/>
      <rect x="196" y="26"  width="108" height="140" rx="10" fill="rgba(255,255,255,0.03)" stroke-dasharray="4 3"/>
      <rect x="208" y="38"  width="84"  height="28" rx="4"  fill="rgba(255,255,255,0.05)"/>
      <rect x="208" y="82"  width="84"  height="28" rx="4"  fill="rgba(255,255,255,0.05)"/>
      <rect x="208" y="126" width="84"  height="28" rx="4"  fill="rgba(255,255,255,0.04)" opacity="0.4"/>
      <g stroke-dasharray="4 3">
        <line x1="114" y1="52"  x2="196" y2="52"/>
        <line x1="114" y1="96"  x2="196" y2="96"/>
        <line x1="114" y1="140" x2="196" y2="140"/>
      </g>
    </g>
  `,

  // Abstract, not the literal diagram: a client feeds a dashed virtual ClusterIP ring (it owns no
  // interface), which kube-proxy intercepts at a solid pivot and fans to two symmetric backends, one
  // chosen (lit) and one alternative (dim). The one-of-many DNAT, distilled to a hub and a fan.
  'network-service-clusterip': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="72" width="42" height="36" rx="8" fill="rgba(255,255,255,0.04)"/>
      <circle cx="122" cy="90" r="24" stroke-dasharray="5 4" fill="rgba(255,255,255,0.03)"/>
      <rect x="176" y="74" width="34" height="32" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="256" y="44"  width="48" height="34" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="256" y="102" width="48" height="34" rx="8" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <line x1="146" y1="90" x2="176" y2="90"/>
      <g stroke-dasharray="4 3">
        <line x1="64" y1="90" x2="98" y2="90"/>
        <line x1="210" y1="84" x2="233" y2="84"/><line x1="233" y1="84" x2="233" y2="61"/><line x1="233" y1="61" x2="256" y2="61"/>
      </g>
      <g stroke-dasharray="4 3" opacity="0.45">
        <line x1="210" y1="96" x2="233" y2="96"/><line x1="233" y1="96" x2="233" y2="119"/><line x1="233" y1="119" x2="256" y2="119"/>
      </g>
    </g>
    <circle cx="122" cy="90" r="3.5" fill="currentColor" opacity="0.55"/>
  `,

  // The concept, not the full diagram: a long iptables chain (top) versus one compact IPVS hash
  // (bottom), both resolving to a single backend on the right.
  'network-kube-proxy-modes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40"  y="46"  width="50" height="26" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="98"  y="46"  width="50" height="26" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="156" y="46"  width="50" height="26" rx="4" fill="rgba(255,255,255,0.05)"/>
      <line x1="90"  y1="59"  x2="98"  y2="59"/>
      <line x1="148" y1="59"  x2="156" y2="59"/>
      <rect x="40"  y="112" width="166" height="30" rx="5" fill="rgba(255,255,255,0.04)"/>
      <line x1="73"  y1="112" x2="73"  y2="142"/>
      <line x1="106" y1="112" x2="106" y2="142"/>
      <line x1="140" y1="112" x2="140" y2="142"/>
      <line x1="173" y1="112" x2="173" y2="142"/>
      <rect x="252" y="76"  width="48" height="36" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="206" y1="59"  x2="230" y2="59"  stroke-dasharray="4 3"/>
      <line x1="230" y1="59"  x2="230" y2="94"  stroke-dasharray="4 3"/>
      <line x1="230" y1="94"  x2="252" y2="94"  stroke-dasharray="4 3"/>
      <line x1="206" y1="127" x2="230" y2="127" stroke-dasharray="4 3"/>
      <line x1="230" y1="127" x2="230" y2="94"  stroke-dasharray="4 3"/>
    </g>
  `,

  // A socket whose connect() is caught by an eBPF program that reads a BPF map (drawn as a small
  // hash table) and rewrites to a backend over a centred right-angle fan, the alternate backend dim.
  'network-ebpf-dataplane': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18"  y="68"  width="54" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="27"  y="80"  width="36" height="20" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="118" y="68"  width="66" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="122" y="20"  width="58" height="32" rx="4" fill="rgba(255,255,255,0.05)"/>
      <line x1="141" y1="20" x2="141" y2="52"/>
      <line x1="160" y1="20" x2="160" y2="52"/>
      <line x1="122" y1="36" x2="180" y2="36"/>
      <rect x="238" y="33"  width="60" height="34" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="238" y="113" width="60" height="34" rx="8" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <line x1="72"  y1="90"  x2="118" y2="90"  stroke-dasharray="4 3"/>
      <line x1="151" y1="68"  x2="151" y2="52"  stroke-dasharray="4 3"/>
      <line x1="184" y1="90"  x2="211" y2="90"  stroke-dasharray="4 3"/>
      <line x1="211" y1="90"  x2="211" y2="50"  stroke-dasharray="4 3"/>
      <line x1="211" y1="50"  x2="238" y2="50"  stroke-dasharray="4 3"/>
      <line x1="211" y1="90"  x2="211" y2="130" stroke-dasharray="4 3"/>
      <line x1="211" y1="130" x2="238" y2="130" stroke-dasharray="4 3"/>
    </g>
  `,

  // Client through kube-proxy to a same-zone backend, the other zone dimmed.
  'network-traffic-distribution': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="70"  width="50"  height="40" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="104" y="72"  width="52"  height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="198" y="30"  width="100" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="198" y="98"  width="100" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="214" y="42"  width="68"  height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="214" y="110" width="68"  height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <line x1="72"  y1="90" x2="104" y2="90"  stroke-dasharray="4 3"/>
      <line x1="156" y1="90" x2="176" y2="90"  stroke-dasharray="4 3"/>
      <line x1="176" y1="90" x2="176" y2="56"  stroke-dasharray="4 3"/>
      <line x1="176" y1="56" x2="214" y2="56"  stroke-dasharray="4 3"/>
      <line x1="176" y1="90" x2="176" y2="124" stroke-dasharray="4 3"/>
      <line x1="176" y1="124" x2="214" y2="124" stroke-dasharray="4 3"/>
    </g>
  `,

  // A name goes in, an address comes out: the whole poster is one left-to-right transform on the flow
  // line y=90. A NAME is one unbroken bar (a single string), an ADDRESS is four short segments split by
  // dots (a quad), so the two ends read as different kinds of thing at a glance. Between them the
  // CoreDNS chain: three plugin bars, cache and forward dimmed to 0.45 and kubernetes brightened,
  // because that is the one that answers. Deliberately no Pod boxes: the siblings already open with a box-and-dashed-line row,
  // and the subject here is the transform, not the topology. The lanes carry no packet dots, so the
  // only circles left are the three tiny ones separating the address segments.
  'network-dns-coredns': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16"  y="80"  width="76" height="20" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="118" y="34"  width="84" height="112" rx="8" fill="rgba(255,255,255,0.03)"/>
      <rect x="128" y="44"  width="64" height="20" rx="4" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <rect x="128" y="80"  width="64" height="20" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="128" y="116" width="64" height="20" rx="4" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <rect x="228" y="80"  width="18" height="20" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="250" y="80"  width="18" height="20" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="272" y="80"  width="18" height="20" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="294" y="80"  width="18" height="20" rx="3" fill="rgba(255,255,255,0.04)"/>
      <g stroke-dasharray="4 3">
        <line x1="92"  y1="90" x2="118" y2="90"/>
        <line x1="202" y1="90" x2="228" y2="90"/>
      </g>
    </g>
    <circle cx="248" cy="90" r="1.3" fill="currentColor"/>
    <circle cx="270" cy="90" r="1.3" fill="currentColor"/>
    <circle cx="292" cy="90" r="1.3" fill="currentColor"/>
  `,

  // One name, several shapes of answer. The FQDN is a band of four identical segments joined by the
  // dots of the name itself, and it forks into three identical record chips. The ONLY difference the
  // poster draws is the answer count: the middle chip carries three dots (headless: one record per
  // Pod), the others carry one. No resolver box and no record ladder: the card already draws those,
  // and the poster only has to say what the card is ABOUT.
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

  // Client to LB, fanning out to node ports across three nodes.
  // External client on top -> cloud LoadBalancer (ccm provisioning it from the right) -> a right-angle
  // fan down to three Nodes, backend Pods only under two of them (the third Node runs no Pod).
  'network-nodeport-loadbalancer': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="16"  width="64" height="24" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="112" y="60"  width="96" height="30" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="232" y="62"  width="64" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="20"  y="128" width="72" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="124" y="128" width="72" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="228" y="128" width="72" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="32"  y="138" width="48" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="136" y="138" width="48" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="40"  x2="160" y2="60"/>
        <line x1="232" y1="75"  x2="208" y2="75"/>
        <line x1="160" y1="90"  x2="160" y2="110"/>
        <line x1="56"  y1="110" x2="264" y2="110"/>
        <line x1="56"  y1="110" x2="56"  y2="128"/>
        <line x1="160" y1="110" x2="160" y2="128"/>
        <line x1="264" y1="110" x2="264" y2="128"/>
      </g>
    </g>
  `,

  // Mirrors the diagram: a Pod above the Node, and inside it the netfilter chain as one left-to-right row
  // of hooks ending at the wire, with the conntrack table docked under the hooks it belongs to. The row IS
  // the card (the order of the hooks is the lesson), so the poster is that chain and nothing else. No ball
  // rides it: where the packet gets rewritten is what the steps answer.
  // Geometry, same rules as the diagram: every dash starts and ends on a shape edge, and the entry only
  // turns left once it is inside the Node.
  // Three shapes on the way in, one band on the way back, nothing else. The two NAT hooks are the boxes,
  // and each carries the same rewrite glyph, one address chip becoming another: the destination on the way
  // in, the source on the way out. Between them the routing decision is a diamond, the only shape that is
  // not a box because it is the only one that CHOOSES, and it sits AFTER the first rewrite, which is the
  // whole reason the order matters: routing only ever sees the already rewritten address. The reply walks
  // none of it: the conntrack band under the rail IS the way back, unattached to any hook because it skips
  // them all, the reply riding it right to left. Walk the chain one way, ride the memory back.
  // FORWARD, the filter hook and the Node frame are left out on purpose: the card draws the full chain, the
  // poster only has to say why its ORDER is the point.
  // Geometry: the rail on y=65 symmetric about the diamond at x=160, the band under it, every dash starting
  // and ending on a shape edge.
  'network-netfilter-path': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="34"  y="44" width="72" height="42" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="44"  y="57" width="18" height="16" rx="3" fill="rgba(255,255,255,0.10)"/>
      <rect x="78"  y="57" width="18" height="16" rx="3" fill="rgba(255,255,255,0.10)"/>
      <line x1="64" y1="65" x2="74" y2="65"/>
      <path d="M71 61 L76 65 L71 69"/>

      <path d="M160 45 L180 65 L160 85 L140 65 Z" fill="rgba(255,255,255,0.05)"/>

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

  // One Node seen from the LAN, in the same composition language as its siblings: a client bar on top, the
  // Node frame under it, the NIC as the hub inside, and the blocks hanging off the NIC in a three column
  // grid. Left column is the hostPort path, and it is the FULL ordinary wiring: the portmap rule that maps
  // the Node port onto the Pod, plus the cni0 bridge and the veth that actually deliver into it, so the Pod
  // there is a shell with its own container box, its own namespace, its own IP. Right column is the
  // hostNetwork Pod, wired to the NIC by ONE straight line and nothing else: no rule, no bridge, no veth,
  // because it has no namespace to be wired into. That missing wiring, next to the wiring drawn in full, is
  // the whole card.
  // Geometry: columns at cx 60 / 160 / 262, the NIC is the only block the client lands on, and every dash
  // starts and ends on a shape edge.
  'network-hostnetwork-hostport': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="130" y="8"   width="60"  height="18" rx="4"  fill="rgba(255,255,255,0.04)"/>
      <rect x="8"   y="42"  width="304" height="126" rx="11" fill="rgba(255,255,255,0.03)"/>
      <rect x="120" y="50"  width="80"  height="22" rx="4"  fill="rgba(255,255,255,0.06)"/>
      <rect x="26"  y="50"  width="68"  height="22" rx="4"  fill="rgba(255,255,255,0.05)"/>
      <rect x="128" y="102" width="64"  height="22" rx="4"  fill="rgba(255,255,255,0.05)"/>
      <rect x="22"  y="126" width="76"  height="36" rx="7"  fill="rgba(255,255,255,0.03)"/>
      <rect x="30"  y="134" width="60"  height="20" rx="3"  fill="rgba(255,255,255,0.06)"/>
      <rect x="224" y="126" width="76"  height="36" rx="7"  fill="rgba(255,255,255,0.03)"/>
      <rect x="232" y="134" width="60"  height="20" rx="3"  fill="rgba(255,255,255,0.06)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="26" x2="160" y2="50"/>
        <line x1="120" y1="61" x2="94"  y2="61"/>
        <line x1="60"  y1="72" x2="60"  y2="126"/>
        <line x1="160" y1="72" x2="160" y2="102"/>
        <path d="M128 113 L112 113 L112 144 L98 144"/>
        <path d="M200 61 L262 61 L262 126"/>
      </g>
    </g>
  `,

  // A diptych: the same little scene twice, and the ONLY thing the policy changes is the Node border.
  // Left is Cluster, so the border is a faint dashed hint: the call reaches the backend inside the Node,
  // and it also climbs out over that border to the one outside. Right is Local, so the same border is
  // drawn solid, as a wall: the leg that would leave the Node is cut short and crossed out at the wall,
  // and the outside backend with its would-be path fade to a ghost, leaving only the short leg that stays
  // home. Same caller, same two backends, one boundary that either lets traffic through or does not. No
  // kube-proxy box, no endpoint list and no packets: the card draws those, the poster only has to say
  // what the switch DOES.
  // Geometry: two 128-wide Node frames mirrored about the centre divider (16..144 and 176..304), caller
  // and local backend on one row inside each, the remote backend directly above the local one and outside
  // the frame, and every leg starting and ending on a shape edge.
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
  // hold a backend Pod. All three Pods carry the same tint and no ball rides the fan: the poster states
  // the composition, and which Node actually owns the address is what the steps go on to answer.
  // Geometry, same rules as the diagram: client and router centred on x=160, the three Nodes mirrored
  // about it, each Pod centred inside its Node, and every fan leg leaving the router bottom edge and
  // landing on a Node top edge without ever crossing one.
  'network-loadbalancer-bare-metal': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="130" y="18"  width="60" height="20" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="112" y="50"  width="96" height="26" rx="5" fill="rgba(255,255,255,0.06)"/>
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
  // table (two bars, the shorter one the more specific rule) docks above the junction and feeds it.
  // Curves + pills keep this poster from reading like the rectangle rows of its siblings.
  // Geometry: the junction sits on the flow line y=100, the two pills mirror it at -/+34 (66 and 134),
  // and every path starts and ends exactly on a shape edge, as everywhere else in this project: the
  // entry dash meets the square left edge (96), both curves leave its right edge (128), and the rule
  // table drops onto its top edge (84).
  'network-ingress-routing': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="84" y="28" width="56" height="30" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="93" y1="38" x2="131" y2="38"/>
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

  // Mirrors the diagram: client above an LB that fans down to two Nodes, only Node-1 holding a backend,
  // plus the underlay lane that carries the Cluster-mode second hop from Node-2 back to Node-1. That
  // lane is the whole point of the card, so the poster shows it.
  // Geometry, same rules as the diagram: client and LB centred on x=160, the two Nodes mirrored about it,
  // the Pod centred BOTH ways inside Node-1 (cx 81, cy 124), the fan leaving the LB bottom edge and
  // landing on each Node top, and the underlay running Node edge to Node edge without ever crossing one.
  'network-externaltrafficpolicy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="130" y="12" width="60"  height="22" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="112" y="46" width="96"  height="26" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="26"  y="96" width="110" height="56" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="184" y="96" width="110" height="56" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="49"  y="109" width="64" height="30" rx="5" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="34" x2="160" y2="46"/>
        <path d="M160 72 L160 84 L81 84 L81 96"/>
        <path d="M160 72 L160 84 L239 84 L239 96"/>
        <path d="M239 152 L239 166 L81 166 L81 152"/>
      </g>
    </g>
  `,

  // Mirrors the diagram: client, edge proxy Pod, backend Pod on one line, with the two header bars the
  // edge writes docked above the proxy. No ball rides the legs: the poster states the composition, and
  // what each leg actually carries is what the steps go on to answer.
  // Geometry: everything is centred on the flow line y=118, the panel is centred on the proxy (cx 160)
  // and its link drops onto the proxy top edge, and every dash starts and ends on a shape edge.
  'network-client-ip-preservation': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="116" y="30"  width="88" height="16" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="116" y="52"  width="88" height="16" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="16"  y="100" width="64" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="116" y="88"  width="88" height="60" rx="8" fill="rgba(255,255,255,0.06)"/>
      <rect x="128" y="104" width="64" height="28" rx="5" fill="rgba(255,255,255,0.05)"/>
      <rect x="244" y="88"  width="60" height="60" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="254" y="104" width="40" height="28" rx="5" fill="rgba(255,255,255,0.09)"/>
      <line x1="160" y1="68" x2="160" y2="88" stroke-dasharray="4 3"/>
      <g stroke-dasharray="4 3">
        <line x1="80"  y1="118" x2="116" y2="118"/>
        <line x1="204" y1="118" x2="244" y2="118"/>
      </g>
    </g>
  `,

  // Three stacked role layers, a client entering the middle one (the Gateway listener), and the
  // backend hanging off the bottom one to the right. Same composition as the live diagram.
  'network-gateway-api': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="96"  y="26"  width="122" height="26" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="96"  y="70"  width="122" height="26" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="96"  y="114" width="122" height="26" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="30"  y="70"  width="42"  height="26" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="238" y="116" width="32"  height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="286" y="111" width="26"  height="32" rx="5" fill="rgba(255,255,255,0.09)"/>
      <line x1="157" y1="52"  x2="157" y2="70"/>
      <line x1="157" y1="96"  x2="157" y2="114"/>
      <g stroke-dasharray="4 3">
        <line x1="72"  y1="83"  x2="96"  y2="83"/>
        <line x1="218" y1="127" x2="238" y2="127"/>
        <line x1="270" y1="127" x2="286" y2="127"/>
      </g>
    </g>
    <circle cx="157" cy="83" r="3.4" fill="currentColor"/>
  `,

  // Two pods on the same node, bridged through cni0.
  // Same shape as the cross-node card but wholly inside ONE big Node block (both Pods share it): Pod
  // A (bright source) and Pod B (dim dest) flank the cni0 bridge, joined by clean dashed veths (no
  // packet dots). The hero is the bright frame sitting BARE inside the bridge, no outer wrapper,
  // which is the same-node point: switched at layer 2 with no NAT and no encapsulation.
  'network-pod-to-pod-same-node': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="16"  y="42" width="288" height="96" rx="12" fill="rgba(255,255,255,0.03)"/>
      <rect x="34"  y="64" width="62"  height="52" rx="7" fill="rgba(255,255,255,0.11)"/>
      <rect x="224" y="64" width="62"  height="52" rx="7" fill="rgba(255,255,255,0.06)" opacity="0.7"/>
      <rect x="134" y="72" width="52"  height="36" rx="6" fill="rgba(255,255,255,0.10)"/>
      <g stroke-dasharray="4 3">
        <line x1="96"  y1="90" x2="134" y2="90"/>
        <line x1="186" y1="90" x2="224" y2="90"/>
      </g>
    </g>
    <rect x="144" y="84" width="32" height="12" rx="4" fill="currentColor" opacity="0.85"/>
  `,

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

  // Abstract, not the literal diagram: a claim on the left, a class "gear" in the middle, and a disk
  // being drawn into existence on the right (dashed outline, not yet solid). Made to order, not picked
  // off a shelf, so the shelf is absent entirely.
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
      <line x1="178" y1="90" x2="216" y2="90" stroke-dasharray="4 3"/>
      <g stroke-dasharray="5 4">
        <ellipse cx="264" cy="62" rx="36" ry="8" fill="rgba(255,255,255,0.04)"/>
        <line x1="228" y1="62" x2="228" y2="118"/>
        <line x1="300" y1="62" x2="300" y2="118"/>
        <path d="M 228 118 A 36 8 0 0 0 300 118" fill="rgba(255,255,255,0.04)"/>
      </g>
    </g>
    <circle cx="216" cy="90" r="3.5" fill="currentColor"/>
  `,

  // One volume owned by the Pod, mounted into two containers at once.
  'storage-volume-model': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="70" y="20" width="180" height="60" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="86" y="34" width="70" height="34" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="164" y="34" width="70" height="34" rx="4" fill="rgba(255,255,255,0.07)"/>
      <ellipse cx="160" cy="118" rx="44" ry="8" fill="rgba(255,255,255,0.06)"/>
      <line x1="116" y1="118" x2="116" y2="150"/>
      <line x1="204" y1="118" x2="204" y2="150"/>
      <path d="M 116 150 A 44 8 0 0 0 204 150" fill="rgba(255,255,255,0.06)"/>
      <line x1="121" y1="110" x2="121" y2="68" stroke-dasharray="4 3"/>
      <line x1="199" y1="110" x2="199" y2="68" stroke-dasharray="4 3"/>
      <line x1="160" y1="80" x2="160" y2="110" stroke-dasharray="4 3"/>
    </g>
    <circle cx="121" cy="92" r="3.5" fill="currentColor"/>
  `,

  // Read-only image layers plus one writable layer, and a volume that bypasses it.
  'storage-container-filesystem': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="60" y="30" width="150" height="24" rx="4" fill="rgba(255,255,255,0.09)"/>
      <g opacity="0.45">
        <rect x="60" y="62" width="150" height="22" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="60" y="90" width="150" height="22" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="60" y="118" width="150" height="22" rx="4" fill="rgba(255,255,255,0.04)"/>
      </g>
      <ellipse cx="268" cy="96" rx="30" ry="6" fill="rgba(255,255,255,0.06)"/>
      <line x1="238" y1="96" x2="238" y2="140"/>
      <line x1="298" y1="96" x2="298" y2="140"/>
      <path d="M 238 140 A 30 6 0 0 0 298 140" fill="rgba(255,255,255,0.06)"/>
      <line x1="210" y1="42" x2="238" y2="90" stroke-dasharray="4 3"/>
    </g>
    <circle cx="224" cy="66" r="3.5" fill="currentColor"/>
  `,

  // A scratch directory on the node disk, shared, wiped when the Pod leaves.
  'storage-emptydir': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="20" width="240" height="140" rx="10" fill="rgba(255,255,255,0.03)"/>
      <rect x="70" y="42" width="180" height="46" rx="8" fill="rgba(255,255,255,0.06)"/>
      <ellipse cx="160" cy="118" rx="40" ry="7" fill="rgba(255,255,255,0.05)"/>
      <line x1="120" y1="118" x2="120" y2="146"/>
      <line x1="200" y1="118" x2="200" y2="146"/>
      <path d="M 120 146 A 40 7 0 0 0 200 146" fill="rgba(255,255,255,0.05)"/>
      <line x1="160" y1="88" x2="160" y2="111" stroke-dasharray="4 3"/>
    </g>
    <circle cx="160" cy="100" r="3.5" fill="currentColor"/>
  `,

  // Same Pod on a new node: the emptyDir resets, the PVC keeps its disk.
  'storage-ephemeral-vs-persistent': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="60" y="18" width="200" height="40" rx="8" fill="rgba(255,255,255,0.05)"/>
      <line x1="160" y1="70" x2="160" y2="164" stroke-dasharray="4 6" opacity="0.45"/>
      <g opacity="0.45">
        <ellipse cx="100" cy="108" rx="30" ry="6" fill="rgba(255,255,255,0.03)"/>
        <line x1="70" y1="108" x2="70" y2="150"/>
        <line x1="130" y1="108" x2="130" y2="150"/>
        <path d="M 70 150 A 30 6 0 0 0 130 150" fill="rgba(255,255,255,0.03)"/>
        <line x1="100" y1="58" x2="100" y2="102" stroke-dasharray="4 3"/>
      </g>
      <ellipse cx="220" cy="108" rx="30" ry="6" fill="rgba(255,255,255,0.08)"/>
      <line x1="190" y1="108" x2="190" y2="150"/>
      <line x1="250" y1="108" x2="250" y2="150"/>
      <path d="M 190 150 A 30 6 0 0 0 250 150" fill="rgba(255,255,255,0.08)"/>
      <line x1="220" y1="58" x2="220" y2="102" stroke-dasharray="4 3"/>
    </g>
    <circle cx="220" cy="80" r="3.5" fill="currentColor"/>
  `,

  // kubelet flips one ..data symlink between timestamped dirs, atomically.
  'storage-configmap-secret-mount': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="122" y="24" width="76" height="34" rx="5" fill="rgba(255,255,255,0.08)"/>
      <g opacity="0.45">
        <rect x="60" y="120" width="90" height="40" rx="5" fill="rgba(255,255,255,0.03)"/>
        <line x1="150" y1="58" x2="95" y2="120" stroke-dasharray="4 3"/>
      </g>
      <rect x="188" y="120" width="90" height="40" rx="5" fill="rgba(255,255,255,0.06)"/>
      <line x1="176" y1="58" x2="228" y2="120" stroke-dasharray="4 3"/>
    </g>
    <circle cx="202" cy="89" r="3.5" fill="currentColor"/>
  `,

  // Several sources projected into one directory, the token rotated in place.
  'storage-projected-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <g opacity="0.45">
        <rect x="30" y="26" width="70" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="30" y="62" width="70" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
        <rect x="30" y="98" width="70" height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      </g>
      <rect x="30" y="134" width="70" height="24" rx="4" fill="rgba(255,255,255,0.08)"/>
      <rect x="180" y="34" width="110" height="116" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="100" y1="38" x2="180" y2="60" stroke-dasharray="4 3" opacity="0.45"/>
      <line x1="100" y1="74" x2="180" y2="86" stroke-dasharray="4 3" opacity="0.45"/>
      <line x1="100" y1="110" x2="180" y2="112" stroke-dasharray="4 3" opacity="0.45"/>
      <line x1="100" y1="146" x2="180" y2="138" stroke-dasharray="4 3"/>
    </g>
    <circle cx="140" cy="142" r="3.5" fill="currentColor"/>
  `,

  // Usage fills the node disk past its threshold, and Pods get evicted by QoS.
  'storage-ephemeral-storage-eviction': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <ellipse cx="120" cy="52" rx="52" ry="9" fill="rgba(255,255,255,0.05)"/>
      <line x1="68" y1="52" x2="68" y2="140"/>
      <line x1="172" y1="52" x2="172" y2="140"/>
      <path d="M 68 140 A 52 9 0 0 0 172 140" fill="rgba(255,255,255,0.05)"/>
      <rect x="68" y="98" width="104" height="42" fill="rgba(255,255,255,0.08)" stroke="none"/>
      <line x1="60" y1="90" x2="182" y2="90" stroke-dasharray="4 3"/>
      <g opacity="0.45">
        <rect x="214" y="36" width="82" height="30" rx="5" fill="rgba(255,255,255,0.03)"/>
        <rect x="214" y="82" width="82" height="30" rx="5" fill="rgba(255,255,255,0.03)"/>
      </g>
      <line x1="214" y1="98" x2="182" y2="96" stroke-dasharray="4 3"/>
    </g>
    <circle cx="120" cy="112" r="3.5" fill="currentColor"/>
  `,

  // Abstract, not the literal diagram: three would-be mounters over one disk, two joined by solid
  // lines (allowed) and one by a dim dashed line (refused). The one-volume many-claimants gate.
  'storage-access-modes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="36" y="28" width="58" height="34" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="104" y="28" width="58" height="34" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="226" y="28" width="58" height="34" rx="5" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <line x1="65" y1="62" x2="150" y2="110"/>
      <line x1="133" y1="62" x2="160" y2="110"/>
      <line x1="255" y1="62" x2="180" y2="110" stroke-dasharray="4 3" opacity="0.45"/>
      <ellipse cx="160" cy="112" rx="46" ry="9" fill="rgba(255,255,255,0.06)"/>
      <line x1="114" y1="112" x2="114" y2="150"/>
      <line x1="206" y1="112" x2="206" y2="150"/>
      <path d="M 114 150 A 46 9 0 0 0 206 150" fill="rgba(255,255,255,0.06)"/>
    </g>
    <circle cx="142" cy="79" r="3.5" fill="currentColor"/>
  `,

  // Abstract, not the literal diagram: one claim being deleted (dashed) forks into two fates, a disk
  // that dissolves away (Delete) and a disk kept solid but locked by a stale ref (Retain).
  'storage-reclaim-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="20" width="64" height="30" rx="5" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3" opacity="0.55"/>
      <line x1="160" y1="50" x2="90" y2="78" stroke-dasharray="4 3"/>
      <line x1="160" y1="50" x2="230" y2="78" stroke-dasharray="4 3"/>
      <g opacity="0.45" stroke-dasharray="4 3">
        <ellipse cx="90" cy="96" rx="36" ry="7" fill="rgba(255,255,255,0.03)"/>
        <line x1="54" y1="96" x2="54" y2="140"/>
        <line x1="126" y1="96" x2="126" y2="140"/>
        <path d="M 54 140 A 36 7 0 0 0 126 140" fill="none"/>
      </g>
      <ellipse cx="230" cy="96" rx="36" ry="7" fill="rgba(255,255,255,0.08)"/>
      <line x1="194" y1="96" x2="194" y2="140"/>
      <line x1="266" y1="96" x2="266" y2="140"/>
      <path d="M 194 140 A 36 7 0 0 0 266 140" fill="rgba(255,255,255,0.08)"/>
      <circle cx="230" cy="116" r="9"/>
    </g>
    <circle cx="200" cy="66" r="3.5" fill="currentColor"/>
  `,

  // Abstract, not the literal diagram: four phase cells in a row with one lit, an event dot arriving
  // at it, and a dashed back-arc for the manual return. A state machine distilled to a lit node.
  'storage-pv-lifecycle-phases': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="74" width="56" height="32" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="98" y="74" width="56" height="32" rx="6" fill="rgba(255,255,255,0.10)"/>
      <rect x="176" y="74" width="56" height="32" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="254" y="74" width="56" height="32" rx="6" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <line x1="76" y1="90" x2="98" y2="90"/>
      <line x1="154" y1="90" x2="176" y2="90"/>
      <line x1="232" y1="90" x2="254" y2="90" stroke-dasharray="4 3" opacity="0.45"/>
      <path d="M 204 106 Q 140 150 76 106" stroke-dasharray="4 3" opacity="0.45"/>
    </g>
    <circle cx="87" cy="90" r="3.5" fill="currentColor"/>
  `,

  // Abstract, not the literal diagram: an object marked for deletion (dashed X) but pinned open from
  // below by a finalizer, while a consumer still links in from above. The delete that cannot complete.
  'storage-pvc-protection': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="134" y="18" width="52" height="26" rx="5" fill="rgba(255,255,255,0.05)"/>
      <line x1="160" y1="44" x2="160" y2="66"/>
      <rect x="116" y="66" width="88" height="46" rx="6" fill="rgba(255,255,255,0.06)"/>
      <g opacity="0.5" stroke-dasharray="4 3">
        <line x1="126" y1="74" x2="194" y2="104"/>
        <line x1="194" y1="74" x2="126" y2="104"/>
      </g>
      <line x1="160" y1="112" x2="160" y2="132"/>
      <circle cx="160" cy="140" r="7" fill="rgba(255,255,255,0.06)"/>
    </g>
    <circle cx="160" cy="55" r="3.5" fill="currentColor"/>
  `,

  // Abstract, not the literal diagram: a target capacity (dashed outer bar), the disk grown to fill it
  // (light), and the filesystem catching up from the left (bright) with a dot at the growth frontier.
  'storage-volume-expansion': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="70" width="240" height="40" rx="6" stroke-dasharray="4 3" opacity="0.6"/>
      <rect x="40" y="70" width="240" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="40" y="70" width="150" height="40" rx="6" fill="rgba(255,255,255,0.10)"/>
      <line x1="190" y1="70" x2="190" y2="110"/>
      <line x1="70" y1="52" x2="118" y2="52" opacity="0.45"/>
      <line x1="150" y1="52" x2="198" y2="52" stroke-dasharray="4 3" opacity="0.45"/>
    </g>
    <circle cx="190" cy="90" r="3.5" fill="currentColor"/>
  `,

  // Two halves bridged by sidecars: a vendor-agnostic core (left) whose objects are translated by a
  // row of sidecars into one driver call reaching the cloud. The bridge, distilled.
  'storage-csi-architecture': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18" y="78" width="40" height="30" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="96" y="30" width="150" height="52" rx="7" fill="rgba(255,255,255,0.03)"/>
      <rect x="104" y="42" width="28" height="28" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="138" y="42" width="28" height="28" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="172" y="42" width="28" height="28" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="206" y="42" width="28" height="28" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="128" y="100" width="86" height="30" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="96" y="108" width="150" height="52" rx="7" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="262" y="96" width="42" height="34" rx="6" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="58" y1="93" x2="96" y2="70"/>
        <line x1="171" y1="82" x2="171" y2="100"/>
        <line x1="214" y1="115" x2="262" y2="113"/>
      </g>
    </g>
    <circle cx="171" cy="91" r="3.5" fill="currentColor"/>
  `,

  // The four-call descent: a ladder of gRPC rungs, one lit, resolving down to a single disk.
  'storage-csi-attach-mount': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="26" width="150" height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="40" y="60" width="150" height="22" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="40" y="94" width="150" height="22" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="40" y="128" width="150" height="22" rx="4" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <path d="M 240 40 A 26 8 0 0 1 292 40 L 292 92 A 26 8 0 0 1 240 92 Z" fill="rgba(255,255,255,0.03)"/>
      <ellipse cx="266" cy="40" rx="26" ry="8"/>
      <g stroke-dasharray="4 3">
        <line x1="190" y1="105" x2="240" y2="70"/>
      </g>
    </g>
    <circle cx="115" cy="105" r="3.5" fill="currentColor"/>
  `,

  // One object is the record: a controller writes it, an attacher reads it, and a kubelet mount waits
  // on its one status field.
  'storage-volumeattachment': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="120" y="70" width="80" height="40" rx="6" fill="rgba(255,255,255,0.08)"/>
      <rect x="132" y="18" width="56" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="132" y="132" width="56" height="30" rx="6" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <rect x="238" y="74" width="60" height="32" rx="6" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="48" x2="160" y2="70"/>
        <line x1="200" y1="90" x2="238" y2="90"/>
        <line x1="160" y1="110" x2="160" y2="132"/>
      </g>
    </g>
    <circle cx="219" cy="90" r="3.5" fill="currentColor"/>
  `,

  // One staged device, two doorways: a single disk mounts once, then bind-mounts fan to two Pods.
  'storage-mount-path-chain': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 130 128 A 30 8 0 0 1 190 128 L 190 160 A 30 8 0 0 1 130 160 Z" fill="rgba(255,255,255,0.03)"/>
      <ellipse cx="160" cy="128" rx="30" ry="8"/>
      <rect x="118" y="86" width="84" height="26" rx="5" fill="rgba(255,255,255,0.07)"/>
      <rect x="54" y="30" width="70" height="30" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="196" y="30" width="70" height="30" rx="6" fill="rgba(255,255,255,0.05)"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="128" x2="160" y2="112"/>
        <line x1="140" y1="86" x2="89" y2="60"/>
        <line x1="180" y1="86" x2="231" y2="60"/>
      </g>
    </g>
    <circle cx="114" cy="73" r="3.5" fill="currentColor"/>
  `,

  // One RWO disk, one lock: attached to a live node (solid) while a second node is refused (dim, dashed).
  'storage-multi-attach-error': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <path d="M 132 96 A 28 8 0 0 1 188 96 L 188 132 A 28 8 0 0 1 132 132 Z" fill="rgba(255,255,255,0.03)"/>
      <ellipse cx="160" cy="96" rx="28" ry="8"/>
      <rect x="30" y="34" width="76" height="44" rx="7" fill="rgba(255,255,255,0.06)"/>
      <rect x="214" y="34" width="76" height="44" rx="7" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <line x1="140" y1="96" x2="98" y2="78"/>
      <g stroke-dasharray="4 3" opacity="0.45">
        <line x1="180" y1="96" x2="222" y2="78"/>
      </g>
    </g>
    <circle cx="205" cy="87" r="3.5" fill="currentColor" opacity="0.55"/>
  `,

  // Ownership of a tree: a non-root Pod cannot touch a row of root-owned files until a sweep re-owns
  // them, entry by entry.
  'storage-fsgroup-ownership': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="22" width="64" height="34" rx="7" fill="rgba(255,255,255,0.05)"/>
      <rect x="44" y="118" width="30" height="34" rx="4" fill="rgba(255,255,255,0.09)"/>
      <rect x="90" y="118" width="30" height="34" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="136" y="118" width="30" height="34" rx="4" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <rect x="182" y="118" width="30" height="34" rx="4" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <rect x="228" y="118" width="30" height="34" rx="4" fill="rgba(255,255,255,0.04)" opacity="0.45"/>
      <g stroke-dasharray="4 3">
        <line x1="160" y1="56" x2="160" y2="112"/>
        <line x1="59" y1="135" x2="258" y2="135"/>
      </g>
    </g>
    <circle cx="140" cy="135" r="3.5" fill="currentColor"/>
  `,

  // The safety wait: a disk stays locked to a failed node (dim) across a long dashed timeout before
  // it can reach the new node.
  'storage-volume-detach-on-node-loss': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="40" width="72" height="44" rx="7" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="224" y="40" width="72" height="44" rx="7" fill="rgba(255,255,255,0.05)"/>
      <path d="M 134 104 A 26 8 0 0 1 186 104 L 186 140 A 26 8 0 0 1 134 140 Z" fill="rgba(255,255,255,0.03)"/>
      <ellipse cx="160" cy="104" rx="26" ry="8"/>
      <g stroke-dasharray="4 3" opacity="0.45">
        <line x1="96" y1="66" x2="140" y2="104"/>
      </g>
      <g stroke-dasharray="4 3">
        <line x1="180" y1="104" x2="224" y2="70"/>
      </g>
    </g>
    <circle cx="200" cy="88" r="3.5" fill="currentColor" opacity="0.6"/>
  `,

  // Abstract, not the literal diagram: one claim "document" on top, a shelf of three disks below,
  // and a single solid line dropping into the one that fits. The two that do not fit sit dim and
  // unconnected. The one-of-many match, distilled to a spine and a shelf.
  'storage-pvc-binding': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="122" y="18" width="76" height="46" rx="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="136" y1="36" x2="184" y2="36"/>
      <line x1="136" y1="48" x2="168" y2="48"/>
      <line x1="160" y1="64" x2="160" y2="99"/>
      <ellipse cx="160" cy="106" rx="36" ry="7" fill="rgba(255,255,255,0.06)"/>
      <line x1="124" y1="106" x2="124" y2="150"/>
      <line x1="196" y1="106" x2="196" y2="150"/>
      <path d="M 124 150 A 36 7 0 0 0 196 150" fill="rgba(255,255,255,0.06)"/>
      <g opacity="0.45">
        <ellipse cx="50" cy="118" rx="26" ry="6" fill="rgba(255,255,255,0.03)"/>
        <line x1="24" y1="118" x2="24" y2="150"/>
        <line x1="76" y1="118" x2="76" y2="150"/>
        <path d="M 24 150 A 26 6 0 0 0 76 150" fill="rgba(255,255,255,0.03)"/>
        <ellipse cx="270" cy="118" rx="26" ry="6" fill="rgba(255,255,255,0.03)"/>
        <line x1="244" y1="118" x2="244" y2="150"/>
        <line x1="296" y1="118" x2="296" y2="150"/>
        <path d="M 244 150 A 26 6 0 0 0 296 150" fill="rgba(255,255,255,0.03)"/>
      </g>
    </g>
    <circle cx="160" cy="84" r="3.5" fill="currentColor"/>
  `,

  // One template stamping out one deterministically named claim per ordinal, each with its own
  // disk, versus a Deployment's single shared one: a spine per ordinal, never a shelf they fight over.
  'storage-volumeclaimtemplates': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="116" y="14" width="88" height="30" rx="5" fill="rgba(255,255,255,0.06)"/>
      <g opacity="0.45">
        <line x1="160" y1="44" x2="60" y2="72" stroke-dasharray="4 3"/>
        <line x1="160" y1="44" x2="260" y2="72" stroke-dasharray="4 3"/>
      </g>
      <line x1="160" y1="44" x2="160" y2="72" stroke-dasharray="4 3"/>
      <rect x="38" y="72" width="44" height="20" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="138" y="72" width="44" height="20" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="238" y="72" width="44" height="20" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="60" y1="92" x2="60" y2="120"/>
      <line x1="160" y1="92" x2="160" y2="120"/>
      <line x1="260" y1="92" x2="260" y2="120"/>
      <ellipse cx="60" cy="124" rx="24" ry="5" fill="rgba(255,255,255,0.05)"/>
      <line x1="36" y1="124" x2="36" y2="156"/><line x1="84" y1="124" x2="84" y2="156"/>
      <path d="M 36 156 A 24 5 0 0 0 84 156" fill="rgba(255,255,255,0.05)"/>
      <ellipse cx="160" cy="124" rx="24" ry="5" fill="rgba(255,255,255,0.05)"/>
      <line x1="136" y1="124" x2="136" y2="156"/><line x1="184" y1="124" x2="184" y2="156"/>
      <path d="M 136 156 A 24 5 0 0 0 184 156" fill="rgba(255,255,255,0.05)"/>
      <ellipse cx="260" cy="124" rx="24" ry="5" fill="rgba(255,255,255,0.05)"/>
      <line x1="236" y1="124" x2="236" y2="156"/><line x1="284" y1="124" x2="284" y2="156"/>
      <path d="M 236 156 A 24 5 0 0 0 284 156" fill="rgba(255,255,255,0.05)"/>
    </g>
    <circle cx="160" cy="58" r="3.5" fill="currentColor"/>
  `,

  // Two knobs deciding a disk's fate on scale-down: one disk kept solid, one reclaimed and fading.
  // Retain leaves storage standing, Delete takes it with the workload.
  'storage-pvc-retention-policy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="112" y="16" width="96" height="34" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="124" y="26" width="30" height="14" rx="3" fill="rgba(255,255,255,0.10)"/>
      <rect x="166" y="26" width="30" height="14" rx="3" fill="rgba(255,255,255,0.03)"/>
      <line x1="94" y1="50" x2="94" y2="112" stroke-dasharray="4 3"/>
      <line x1="226" y1="50" x2="226" y2="112" stroke-dasharray="4 3"/>
      <ellipse cx="94" cy="118" rx="28" ry="6" fill="rgba(255,255,255,0.06)"/>
      <line x1="66" y1="118" x2="66" y2="156"/><line x1="122" y1="118" x2="122" y2="156"/>
      <path d="M 66 156 A 28 6 0 0 0 122 156" fill="rgba(255,255,255,0.06)"/>
      <g opacity="0.45">
        <ellipse cx="226" cy="118" rx="28" ry="6" fill="rgba(255,255,255,0.02)" stroke-dasharray="3 3"/>
        <line x1="198" y1="118" x2="198" y2="156" stroke-dasharray="3 3"/>
        <line x1="254" y1="118" x2="254" y2="156" stroke-dasharray="3 3"/>
        <path d="M 198 156 A 28 6 0 0 0 254 156" stroke-dasharray="3 3"/>
      </g>
    </g>
    <circle cx="94" cy="84" r="3.5" fill="currentColor"/>
  `,

  // Two zones: on the left the Pod and its disk land in different zones and the mount cannot cross
  // (dashed break), on the right the scheduler picked the node first so both share one zone (solid).
  'storage-topology-aware-provisioning': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18" y="20" width="128" height="140" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="174" y="20" width="128" height="140" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="34" y="36" width="52" height="30" rx="5" fill="rgba(255,255,255,0.06)"/>
      <path d="M 60 66 L 60 92 L 118 92 L 118 110" stroke-dasharray="4 3" opacity="0.45"/>
      <ellipse cx="118" cy="116" rx="18" ry="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="100" y1="116" x2="100" y2="144"/><line x1="136" y1="116" x2="136" y2="144"/>
      <path d="M 100 144 A 18 4 0 0 0 136 144" fill="rgba(255,255,255,0.04)"/>
      <rect x="212" y="36" width="52" height="30" rx="5" fill="rgba(255,255,255,0.08)"/>
      <line x1="238" y1="66" x2="238" y2="110"/>
      <ellipse cx="238" cy="116" rx="18" ry="4" fill="rgba(255,255,255,0.06)"/>
      <line x1="220" y1="116" x2="220" y2="144"/><line x1="256" y1="116" x2="256" y2="144"/>
      <path d="M 220 144 A 18 4 0 0 0 256 144" fill="rgba(255,255,255,0.06)"/>
    </g>
    <circle cx="238" cy="88" r="3.5" fill="currentColor"/>
  `,

  // A request document over a source disk with its point-in-time copy offset behind it, both sitting
  // in the one backend: the snapshot mirrors the volume API but shares the volume's fate.
  'storage-volume-snapshot': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="120" y="14" width="80" height="34" rx="5" fill="rgba(255,255,255,0.06)"/>
      <line x1="134" y1="26" x2="186" y2="26"/><line x1="134" y1="36" x2="170" y2="36"/>
      <line x1="160" y1="48" x2="160" y2="96" stroke-dasharray="4 3"/>
      <g opacity="0.45">
        <ellipse cx="188" cy="104" rx="30" ry="6" fill="rgba(255,255,255,0.03)"/>
        <line x1="158" y1="104" x2="158" y2="150"/><line x1="218" y1="104" x2="218" y2="150"/>
        <path d="M 158 150 A 30 6 0 0 0 218 150" fill="rgba(255,255,255,0.03)"/>
      </g>
      <ellipse cx="132" cy="100" rx="30" ry="6" fill="rgba(255,255,255,0.07)"/>
      <line x1="102" y1="100" x2="102" y2="146"/><line x1="162" y1="100" x2="162" y2="146"/>
      <path d="M 102 146 A 30 6 0 0 0 162 146" fill="rgba(255,255,255,0.07)"/>
    </g>
    <circle cx="160" cy="74" r="3.5" fill="currentColor"/>
  `,

  // Two claims over two disks with a direct dashed copy running straight from source to clone: PVC to
  // PVC, server-side, no snapshot object in between.
  'storage-pvc-clone': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="18" width="64" height="26" rx="4" fill="rgba(255,255,255,0.06)"/>
      <rect x="216" y="18" width="64" height="26" rx="4" fill="rgba(255,255,255,0.06)"/>
      <line x1="72" y1="44" x2="72" y2="104"/>
      <line x1="248" y1="44" x2="248" y2="104"/>
      <line x1="104" y1="130" x2="216" y2="130" stroke-dasharray="4 3"/>
      <ellipse cx="72" cy="110" rx="28" ry="6" fill="rgba(255,255,255,0.07)"/>
      <line x1="44" y1="110" x2="44" y2="150"/><line x1="100" y1="110" x2="100" y2="150"/>
      <path d="M 44 150 A 28 6 0 0 0 100 150" fill="rgba(255,255,255,0.07)"/>
      <ellipse cx="248" cy="110" rx="28" ry="6" fill="rgba(255,255,255,0.05)"/>
      <line x1="220" y1="110" x2="220" y2="150"/><line x1="276" y1="110" x2="276" y2="150"/>
      <path d="M 220 150 A 28 6 0 0 0 276 150" fill="rgba(255,255,255,0.05)"/>
    </g>
    <circle cx="160" cy="130" r="3.5" fill="currentColor"/>
  `,

  // A Pod owning a real, dynamically provisioned disk through an ownerReference spine, the disk drawn
  // dim to say it dies with the Pod: real storage machinery on an ephemeral lifetime.
  'storage-generic-ephemeral-volume': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="112" y="16" width="96" height="44" rx="8" fill="rgba(255,255,255,0.05)"/>
      <rect x="130" y="34" width="60" height="16" rx="3" fill="rgba(255,255,255,0.08)"/>
      <line x1="160" y1="60" x2="160" y2="108" stroke-dasharray="4 3"/>
      <g opacity="0.45">
        <ellipse cx="160" cy="114" rx="30" ry="6" fill="rgba(255,255,255,0.03)" stroke-dasharray="3 3"/>
        <line x1="130" y1="114" x2="130" y2="156" stroke-dasharray="3 3"/>
        <line x1="190" y1="114" x2="190" y2="156" stroke-dasharray="3 3"/>
        <path d="M 130 156 A 30 6 0 0 0 190 156" stroke-dasharray="3 3"/>
      </g>
    </g>
    <circle cx="160" cy="84" r="3.5" fill="currentColor"/>
  `,

  // A scheduler reading two capacity gauges: the near-full pool dimmed out, the roomy one chosen. It
  // filters on free capacity before it commits, instead of binding blind.
  'storage-csi-capacity-tracking': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="112" y="14" width="96" height="30" rx="5" fill="rgba(255,255,255,0.06)"/>
      <line x1="226" y1="44" x2="226" y2="106" stroke-dasharray="4 3"/>
      <g opacity="0.45">
        <line x1="94" y1="44" x2="94" y2="120" stroke-dasharray="3 3"/>
        <ellipse cx="94" cy="126" rx="26" ry="6" fill="rgba(255,255,255,0.03)"/>
        <line x1="68" y1="126" x2="68" y2="150"/><line x1="120" y1="126" x2="120" y2="150"/>
        <path d="M 68 150 A 26 6 0 0 0 120 150" fill="rgba(255,255,255,0.03)"/>
      </g>
      <ellipse cx="226" cy="112" rx="26" ry="6" fill="rgba(255,255,255,0.07)"/>
      <line x1="200" y1="112" x2="200" y2="156"/><line x1="252" y1="112" x2="252" y2="156"/>
      <path d="M 200 156 A 26 6 0 0 0 252 156" fill="rgba(255,255,255,0.07)"/>
    </g>
    <circle cx="226" cy="80" r="3.5" fill="currentColor"/>
  `,

  // Hub-and-spoke: apiserver in the centre, four control-plane satellites + worker box.
  'control-plane-architecture': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <circle cx="160" cy="90" r="22" fill="rgba(255,255,255,0.06)"/>
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

  'control-node-drain': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="38" width="120" height="104" rx="8" fill="rgba(255,255,255,0.04)" stroke-dasharray="4 3"/>
      <rect x="40" y="48"  width="84" height="22" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="40" y="79"  width="84" height="22" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="40" y="110" width="84" height="22" rx="4" fill="rgba(255,255,255,0.02)" opacity="0.3" stroke-dasharray="3 2"/>
      <rect x="178" y="38" width="120" height="104" rx="8" fill="rgba(255,255,255,0.06)"/>
      <rect x="198" y="58" width="80" height="28" rx="4" fill="rgba(255,255,255,0.10)"/>
      <rect x="198" y="94" width="80" height="28" rx="4" fill="rgba(255,255,255,0.10)"/>
      <line x1="142" y1="90" x2="178" y2="90" stroke-dasharray="5 3"/>
    </g>
  `,

  'control-kubelet-sync-loop': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="36" width="80" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="218" y="36" width="80" height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="100" width="80" height="44" rx="6" fill="rgba(255,255,255,0.08)"/>
      <line x1="102" y1="58"  x2="120" y2="98"  stroke-dasharray="4 3"/>
      <line x1="218" y1="58"  x2="200" y2="98"  stroke-dasharray="4 3"/>
      <path d="M 200 122 Q 240 122 260 102 T 240 60 Q 230 50 218 50" stroke-dasharray="3 3" opacity="0.5"/>
    </g>
  `,

  // Pod sandbox: two app containers sharing one pause base (shared namespaces + Pod IP).
  'control-pod-sandbox-cri': `
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

  'control-node-pressure-eviction': `
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

  // Container full of memory, split top-to-bottom by a jagged SIGKILL crack (OOMKilled).
  'control-oom-kill': `
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

  // The shutdown grace timer (a clock, two hands + 12/3/6/9 hour dots) signals the Node, whose Pods
  // then terminate in order: leftmost still up, middle draining, last gone (dashed, faint).
  'control-graceful-node-shutdown': `
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
  'control-node-failure': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18"  y="44" width="122" height="92" rx="9" fill="rgba(255,255,255,0.02)" opacity="0.42" stroke-dasharray="5 4"/>
      <rect x="36"  y="69" width="86" height="42" rx="6" opacity="0.42" stroke-dasharray="4 3"/>
      <rect x="180" y="44" width="122" height="92" rx="9" fill="rgba(255,255,255,0.05)"/>
      <rect x="198" y="69" width="86" height="42" rx="6" fill="rgba(255,255,255,0.08)"/>
      <line x1="142" y1="90" x2="176" y2="90" stroke-dasharray="5 4"/>
      <polyline points="170 85, 176 90, 170 95" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <rect x="212" y="87" width="58" height="6" rx="1" fill="currentColor" opacity="0.7"/>
  `,

  // Three stacked URL bars representing GVR routes; event dots stream out of each.
  'control-api-structure': `
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

  // Apply = creation flow: a manifest (deploy.yaml) travels through the control plane and
  // materialises as a running Pod. Mirror of the Delete Flow poster: the fills rise left to
  // right (doc 0.04 -> box 0.05 -> Pod 0.06 / container 0.10) as the object comes alive.
  'control-plane-apply-flow': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="50" width="58" height="80" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="36" y1="68"  x2="70" y2="68"/>
      <line x1="36" y1="82"  x2="70" y2="82"/>
      <line x1="36" y1="96"  x2="58" y2="96"/>
      <line x1="36" y1="110" x2="64" y2="110"/>
      <rect x="131" y="62" width="58" height="56" rx="6" fill="rgba(255,255,255,0.05)"/>
      <rect x="236" y="58" width="60" height="64" rx="14" fill="rgba(255,255,255,0.06)"/>
      <rect x="250" y="80" width="32" height="20" rx="3"  fill="rgba(255,255,255,0.10)"/>
      <line x1="82"  y1="90" x2="131" y2="90" stroke-dasharray="3 3"/>
      <line x1="189" y1="90" x2="236" y2="90" stroke-dasharray="3 3"/>
    </g>
  `,

  // Delete = teardown flow, the mirror of the Apply Flow poster: the SAME running Pod that apply
  // builds (solid shell + container) starts on the left, is walked through the control plane, and
  // is erased, so the matching Pod shell on the right is dashed, empty and struck through (the
  // record leaving ETCD). Fills fall left to right (Pod 0.06 / 0.10 -> box 0.05 -> gone), the
  // exact inverse of Apply.
  'control-plane-delete-flow': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="58" width="60" height="64" rx="14" fill="rgba(255,255,255,0.06)"/>
      <rect x="38"  y="80" width="32" height="20" rx="3"  fill="rgba(255,255,255,0.10)"/>
      <rect x="131" y="62" width="58" height="56" rx="6"  fill="rgba(255,255,255,0.05)"/>
      <rect x="236" y="58" width="60" height="64" rx="14" stroke-dasharray="5 4" opacity="0.4"/>
      <line x1="84"  y1="90" x2="131" y2="90" stroke-dasharray="3 3"/>
      <line x1="189" y1="90" x2="236" y2="90" stroke-dasharray="3 3"/>
      <line x1="250" y1="72" x2="282" y2="108" opacity="0.55" stroke-linecap="round"/>
      <line x1="282" y1="72" x2="250" y2="108" opacity="0.55" stroke-linecap="round"/>
    </g>
  `,

  // Three etcd cylinders: leader (left, bright entry) replicates to two followers via dashed arrows.
  'control-etcd-raft': `
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

  // The scheduler decision: the Pod is scored against three candidate nodes, then BOUND to the
  // highest-scoring winner (a bright dashed link) while the passed-over nodes get the same dashed
  // links but dim, with shorter score bars. The winner reads through its bright box + score bar.
  'control-scheduler-decision': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="26" width="64" height="34" rx="8" fill="rgba(255,255,255,0.07)"/>
      <rect x="146" y="38" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)"/>
      <rect x="162" y="38" width="12" height="12" rx="2" fill="rgba(255,255,255,0.06)"/>
      <line x1="150" y1="60" x2="64"  y2="102" stroke-dasharray="3 4" opacity="0.4"/>
      <line x1="170" y1="60" x2="256" y2="102" stroke-dasharray="3 4" opacity="0.4"/>
      <line x1="160" y1="60" x2="160" y2="100" stroke-dasharray="3 4"/>
      <rect x="24"  y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="216" y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="120" y="104" width="80" height="54" rx="8" fill="rgba(255,255,255,0.10)"/>
      <rect x="36"  y="138" width="20" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="228" y="138" width="34" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="132" y="138" width="56" height="6" rx="1" fill="currentColor" opacity="0.9"/>
    </g>
  `,

  'control-leader-election': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <!-- three replicas: the middle one is the elected leader (bright), the others standby -->
      <rect x="26"  y="28" width="68" height="44" rx="7" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <rect x="124" y="28" width="68" height="44" rx="7" fill="rgba(255,255,255,0.10)"/>
      <rect x="222" y="28" width="68" height="44" rx="7" fill="rgba(255,255,255,0.03)" opacity="0.45"/>
      <!-- contention for the Lease: leader holds it (solid), losers rejected (dashed/dim) -->
      <line x1="60"  y1="72" x2="138" y2="106" stroke-dasharray="3 4" opacity="0.4"/>
      <line x1="158" y1="72" x2="158" y2="106" stroke-dasharray="3 4"/>
      <line x1="256" y1="72" x2="178" y2="106" stroke-dasharray="3 4" opacity="0.4"/>
      <!-- the Lease object with holderIdentity -->
      <rect x="98"  y="106" width="120" height="46" rx="7" fill="rgba(255,255,255,0.06)"/>
      <line x1="112" y1="126" x2="204" y2="126"/>
      <line x1="112" y1="138" x2="176" y2="138" opacity="0.5"/>
    </g>
    <circle cx="158" cy="50" r="3.6" fill="currentColor"/>
  `,

  'control-admission-webhooks': `
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

  // One pod scales out to a fan of three replicas.
  'scaling-hpa-cycle': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40"  y="74"  width="42" height="42" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="204" y="42"  width="42" height="38" rx="6" fill="rgba(255,255,255,0.04)" opacity="0.55"/>
      <rect x="226" y="80"  width="42" height="38" rx="6" fill="rgba(255,255,255,0.04)" opacity="0.85"/>
      <rect x="248" y="118" width="42" height="38" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="92" y1="95" x2="190" y2="95" stroke-dasharray="5 4"/>
    </g>
    <circle cx="184" cy="95" r="3.5" fill="currentColor"/>
  `,

  // Subject (head + shoulders) → role rules → resource with a check.
  'security-rbac-authorization': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <circle cx="56" cy="76" r="12" fill="rgba(255,255,255,0.04)"/>
      <path d="M 38 116 Q 56 92 74 116"/>
      <line x1="84" y1="100" x2="124" y2="100" stroke-dasharray="4 3"/>
      <rect x="130" y="74" width="60" height="52" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="138" y1="90"  x2="182" y2="90"/>
      <line x1="138" y1="104" x2="172" y2="104"/>
      <line x1="138" y1="116" x2="178" y2="116"/>
      <line x1="196" y1="100" x2="234" y2="100" stroke-dasharray="4 3"/>
      <rect x="240" y="74" width="56" height="52" rx="6" fill="rgba(255,255,255,0.04)"/>
      <path d="M 254 100 l 8 8 l 18 -18"/>
    </g>
    <circle cx="120" cy="100" r="3" fill="currentColor"/>
    <circle cx="230" cy="100" r="3" fill="currentColor"/>
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

  'workloads-pod-priority-preemption': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="120" y="20" width="80" height="36" rx="6" fill="rgba(255,255,255,0.16)" stroke-width="1.9"/>
      <line x1="160" y1="60" x2="160" y2="84" stroke-dasharray="4 3"/>
      <polyline points="155 78, 160 84, 165 78" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="20" y="92" width="280" height="68" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="34"  y="106" width="80" height="44" rx="4" fill="rgba(255,255,255,0.03)" opacity="0.5" stroke-dasharray="4 3"/>
      <line x1="46"  y1="116" x2="102" y2="140" opacity="0.55" stroke-linecap="round"/>
      <line x1="102" y1="116" x2="46"  y2="140" opacity="0.55" stroke-linecap="round"/>
      <rect x="124" y="106" width="80" height="44" rx="4" fill="rgba(255,255,255,0.07)"/>
      <rect x="214" y="106" width="80" height="44" rx="4" fill="rgba(255,255,255,0.13)"/>
    </g>
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

  // One Pod per node across the cluster: three nodes each hold a single Pod, the dashed node
  // on the right is joining (the + marker) with its Pod still forming. The uniform 1:1
  // pod-to-node mapping is the DaemonSet signature.
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

  // Revision history with a rollback: rev 1 (good) and rev 3 (restored copy of rev 1) carry the
  // same version bar, rev 2 (bad) is dimmed and struck out, and a solid counter-clockwise undo
  // arc sweeps from the current revision back over the bad one to the good revision.
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

  // A ReplicaSet on top owns three Pods below through ownerReference links (dashed). The
  // third Pod is dashed and faint: it just died and is being recreated, the controller
  // self-healing the count back to three.
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
