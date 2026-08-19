// Design notes: ./CARDS.md, under each card id as a "### poster" subsection.
// The network posters, keyed by card id: the still frame each card shows on the grid.

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

  'network-nodeport-loadbalancer': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="128" y="16"  width="64" height="24" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="112" y="60"  width="96" height="30" rx="6" fill="rgba(255,255,255,0.06)"/>
      <rect x="232" y="62"  width="64" height="26" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="20"  y="128" width="72" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="124" y="128" width="72" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="228" y="128" width="72" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="32"  y="138" width="48" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="240" y="138" width="48" height="20" rx="4" fill="rgba(255,255,255,0.05)"/>
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
};
