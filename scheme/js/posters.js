// Design notes: scheme/docs/CARDS.md, one "### poster" subsection per card id.
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

  // Hub-and-spoke: apiserver in the centre, four control-plane satellites + worker box.
  'cluster-architecture': `
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

  'cluster-node-drain': `
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

  'cluster-kubelet-sync-loop': `
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
      <polyline points="170 85, 176 90, 170 95" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <rect x="212" y="87" width="58" height="6" rx="1" fill="currentColor" opacity="0.7"/>
  `,

  // Three stacked URL bars representing GVR routes; event dots stream out of each.
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

  'cluster-apply-flow': `
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

  'cluster-delete-flow': `
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

  'cluster-leader-election': `
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
