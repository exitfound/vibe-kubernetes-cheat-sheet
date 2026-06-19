export const POSTERS = {
  // One flat network band with three Pods hanging off it, a packet riding the band.
  'network-model': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="40"  width="272" height="26" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="46"  y="100" width="48"  height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="136" y="100" width="48"  height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="226" y="100" width="48"  height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
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

  // Client to a netfilter box holding a two-row conntrack table, on to a server.
  'network-conntrack-nat': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24" y="74" width="58" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="131" y="70" width="58" height="52" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="238" y="74" width="58" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="138" y1="88" x2="182" y2="88"/>
      <line x1="138" y1="102" x2="182" y2="102"/>
      <line x1="82" y1="96" x2="131" y2="96" stroke-dasharray="4 3"/>
      <line x1="189" y1="96" x2="238" y2="96" stroke-dasharray="4 3"/>
    </g>
    <circle cx="107" cy="96" r="3.2" fill="currentColor"/>
  `,

  // A Node holding a Pod and a masquerade box, with an arrow out to the internet.
  'network-pod-egress-snat': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="52" width="180" height="92" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="38" y="80" width="58" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="84" width="66" height="36" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="244" y="84" width="56" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="96" y1="102" x2="120" y2="102" stroke-dasharray="4 3"/>
      <line x1="186" y1="102" x2="244" y2="102" stroke-dasharray="4 3"/>
    </g>
    <circle cx="215" cy="102" r="3.2" fill="currentColor"/>
  `,

  // One Pod box with two containers linked over a short localhost lane.
  'network-pod-localhost': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="90" y="40" width="140" height="108" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="106" y="58" width="48" height="32" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="166" y="58" width="48" height="32" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="106" y="104" width="48" height="28" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="166" y="104" width="48" height="28" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="154" y1="74" x2="166" y2="74" stroke-dasharray="4 3"/>
    </g>
    <circle cx="160" cy="74" r="3.2" fill="currentColor"/>
  `,

  // Client to a Service box to a backend, the port mapping bridge.
  'network-service-ports': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="74" width="60" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="130" y="70" width="64" height="52" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="240" y="74" width="58" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="82" y1="96" x2="130" y2="96" stroke-dasharray="4 3"/>
      <line x1="194" y1="96" x2="240" y2="96" stroke-dasharray="4 3"/>
    </g>
    <circle cx="106" cy="96" r="3.2" fill="currentColor"/>
  `,

  // Two rows: a DNS alias on top and a proxied no-selector path on the bottom.
  'network-externalname': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="42" width="48" height="34" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="42" width="60" height="34" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="226" y="42" width="72" height="34" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="22" y="106" width="48" height="34" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="106" width="60" height="34" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="226" y="106" width="72" height="34" rx="5" fill="rgba(255,255,255,0.04)"/>
      <line x1="70" y1="59" x2="120" y2="59" stroke-dasharray="4 3"/>
      <line x1="180" y1="59" x2="226" y2="59" stroke-dasharray="4 3"/>
      <line x1="70" y1="123" x2="120" y2="123" stroke-dasharray="4 3"/>
      <line x1="180" y1="123" x2="226" y2="123" stroke-dasharray="4 3"/>
    </g>
  `,

  // Client to an Ingress with a Secret above it, on to a backend Pod.
  'network-tls-termination': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="78" width="56" height="40" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="128" y="74" width="64" height="48" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="140" y="34" width="40" height="26" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="244" y="78" width="56" height="40" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="160" y1="60" x2="160" y2="74" stroke-dasharray="4 3"/>
      <line x1="78" y1="98" x2="128" y2="98" stroke-dasharray="4 3"/>
      <line x1="192" y1="98" x2="244" y2="98" stroke-dasharray="4 3"/>
    </g>
    <circle cx="103" cy="98" r="3.2" fill="currentColor"/>
  `,

  // Client to load balancer to a Node holding kube-proxy and a Pod, one long chain.
  'network-north-south-path': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="18" y="80" width="46" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="92" y="80" width="46" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="166" y="60" width="134" height="76" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="180" y="80" width="46" height="36" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="244" y="80" width="44" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="64" y1="98" x2="92" y2="98" stroke-dasharray="4 3"/>
      <line x1="138" y1="98" x2="180" y2="98" stroke-dasharray="4 3"/>
      <line x1="226" y1="98" x2="244" y2="98" stroke-dasharray="4 3"/>
    </g>
    <circle cx="160" cy="98" r="3.2" fill="currentColor"/>
  `,

  // A Pod querying CoreDNS, with a stacked search-list ladder of candidate names.
  'network-dns-ndots': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22" y="80" width="56" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="244" y="80" width="56" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="36" width="92" height="18" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="60" width="92" height="18" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="84" width="92" height="18" rx="3" fill="rgba(255,255,255,0.04)" opacity="0.55"/>
      <line x1="78" y1="102" x2="244" y2="102" stroke-dasharray="4 3"/>
    </g>
    <circle cx="150" cy="102" r="3.2" fill="currentColor"/>
  `,

  // A Node holding a Pod and a local DNS agent, forwarding upstream to CoreDNS.
  'network-nodelocal-dnscache': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="20" y="54" width="180" height="92" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="36" y="80" width="56" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="118" y="84" width="66" height="36" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="244" y="84" width="56" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="92" y1="102" x2="118" y2="102" stroke-dasharray="4 3"/>
      <line x1="184" y1="102" x2="244" y2="102" stroke-dasharray="4 3"/>
    </g>
    <circle cx="78" cy="102" r="3.2" fill="currentColor"/>
  `,

  // A stack of Service-type rows fanning into one shared backend block.
  'network-service-types': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30"  y="40"  width="110" height="22" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="30"  y="70"  width="110" height="22" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="30"  y="100" width="110" height="22" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="30"  y="134" width="110" height="22" rx="4" fill="rgba(255,255,255,0.04)" opacity="0.5"/>
      <rect x="210" y="60"  width="78"  height="64" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="140" y1="51"  x2="210" y2="80"  stroke-dasharray="4 3"/>
      <line x1="140" y1="81"  x2="210" y2="92"  stroke-dasharray="4 3"/>
      <line x1="140" y1="111" x2="210" y2="104" stroke-dasharray="4 3"/>
    </g>
  `,

  // Client to a DNS box that returns three Pod-IP records, one per backend (no VIP).
  'network-headless-service': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="26"  y="78"  width="60" height="48" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="40"  width="70" height="34" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="34"  width="58" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="84"  width="58" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="134" width="58" height="30" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="86"  y1="100" x2="120" y2="60" stroke-dasharray="4 3"/>
      <line x1="190" y1="57"  x2="232" y2="49"  stroke-dasharray="4 3"/>
      <line x1="190" y1="57"  x2="232" y2="99"  stroke-dasharray="4 3"/>
      <line x1="190" y1="57"  x2="232" y2="149" stroke-dasharray="4 3"/>
    </g>
    <circle cx="216" cy="49"  r="2.6" fill="currentColor"/>
    <circle cx="216" cy="99"  r="2.6" fill="currentColor"/>
    <circle cx="216" cy="149" r="2.6" fill="currentColor"/>
  `,

  // Client to a Service holding two ClusterIPs (v4 + v6) to a dual-addressed Pod.
  'network-dualstack': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="30"  y="74" width="56" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="62" width="64" height="76" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="224" y="74" width="66" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="130" y1="84"  x2="174" y2="84"/>
      <line x1="130" y1="116" x2="174" y2="116"/>
      <line x1="86"  y1="100" x2="120" y2="100" stroke-dasharray="4 3"/>
      <line x1="184" y1="100" x2="224" y2="100" stroke-dasharray="4 3"/>
    </g>
    <circle cx="104" cy="100" r="2.8" fill="currentColor"/>
  `,

  // Pod with two containers sharing one netns, veth out to the host bridge.
  'network-pod-ip-and-veth': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="50" width="120" height="80" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="56"  y="74" width="40" height="34" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="104" y="74" width="40" height="34" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="74" width="56" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="160" y1="92" x2="232" y2="92" stroke-dasharray="4 3"/>
    </g>
    <circle cx="196" cy="92" r="3.5" fill="currentColor"/>
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
  'network-pod-to-pod-cross-node': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28"  y="44" width="110" height="92" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="182" y="44" width="110" height="92" rx="10" fill="rgba(255,255,255,0.04)"/>
      <rect x="44"  y="64" width="50" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="226" y="64" width="50" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="94" y1="120" x2="226" y2="120" stroke-dasharray="5 4"/>
    </g>
    <circle cx="160" cy="120" r="4" fill="currentColor"/>
  `,

  // Cluster CIDR carved into per-node slices, fanned out over a right-angle bus.
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

  // Service feeding an EndpointSlice list, last endpoint dimmed.
  'network-endpointslice-reconcile': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40"  y="70"  width="80"  height="44" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="180" y="48"  width="104" height="20" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="180" y="76"  width="104" height="20" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="180" y="104" width="104" height="20" rx="3" fill="rgba(255,255,255,0.04)" opacity="0.4"/>
      <line x1="120" y1="92" x2="180" y2="86" stroke-dasharray="4 3"/>
    </g>
    <circle cx="200" cy="58" r="2.6" fill="currentColor"/>
    <circle cx="200" cy="86" r="2.6" fill="currentColor"/>
  `,

  // Client to a dashed virtual ClusterIP, DNAT to one of two backends.
  'network-service-clusterip': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="34"  y="66"  width="66" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="130" y="72"  width="70" height="40" rx="6" stroke-dasharray="5 4" fill="rgba(255,255,255,0.03)"/>
      <rect x="232" y="50"  width="56" height="38" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="100" width="56" height="38" rx="8" fill="rgba(255,255,255,0.04)" opacity="0.5"/>
      <line x1="100" y1="92" x2="130" y2="92"/>
      <line x1="200" y1="88" x2="232" y2="70" stroke-dasharray="4 3"/>
    </g>
    <circle cx="116" cy="92" r="3.4" fill="currentColor"/>
  `,

  // iptables chain ladder beside an IPVS hash table.
  'network-kube-proxy-modes': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="36" y="40"  width="120" height="30" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="36" y="80"  width="120" height="30" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="36" y="120" width="120" height="30" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="96" y1="70" x2="96" y2="80"/>
      <line x1="96" y1="110" x2="96" y2="120"/>
      <rect x="196" y="50" width="92" height="92" rx="8" fill="rgba(255,255,255,0.03)"/>
      <line x1="214" y1="76"  x2="270" y2="76"/>
      <line x1="214" y1="98"  x2="270" y2="98"/>
      <line x1="214" y1="120" x2="270" y2="120"/>
    </g>
  `,

  // Client socket hitting an eBPF hook that reads a map and rewrites to a backend.
  'network-ebpf-dataplane': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="24"  y="78"  width="58" height="50" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="118" y="84"  width="64" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="118" y="36"  width="64" height="34" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="62"  width="58" height="36" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="232" y="118" width="58" height="36" rx="8" fill="rgba(255,255,255,0.04)" opacity="0.5"/>
      <line x1="82"  y1="103" x2="118" y2="103" stroke-dasharray="4 3"/>
      <line x1="150" y1="84"  x2="150" y2="70"  stroke-dasharray="4 3"/>
      <line x1="182" y1="100" x2="232" y2="80"  stroke-dasharray="4 3"/>
    </g>
    <circle cx="100" cy="103" r="2.8" fill="currentColor"/>
  `,

  // Client through kube-proxy to a same-zone backend, the other zone dimmed.
  'network-traffic-distribution': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="80"  width="54" height="44" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="104" y="84"  width="52" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="196" y="34"  width="96" height="56" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="196" y="112" width="96" height="56" rx="8" fill="rgba(255,255,255,0.04)" opacity="0.5"/>
      <rect x="210" y="46"  width="30" height="32" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="248" y="46"  width="30" height="32" rx="5" fill="rgba(255,255,255,0.04)"/>
      <line x1="76"  y1="102" x2="104" y2="102" stroke-dasharray="4 3"/>
      <line x1="156" y1="98"  x2="210" y2="62"  stroke-dasharray="4 3"/>
    </g>
    <circle cx="90" cy="102" r="2.8" fill="currentColor"/>
  `,

  // Query to a CoreDNS box with a plugin chain, answer dot returns.
  'network-dns-coredns': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="34"  y="64" width="64" height="52" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="150" y="44" width="92" height="92" rx="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="162" y1="66"  x2="230" y2="66"/>
      <line x1="162" y1="90"  x2="230" y2="90"/>
      <line x1="162" y1="114" x2="230" y2="114"/>
      <line x1="98" y1="90" x2="150" y2="90" stroke-dasharray="4 3"/>
    </g>
    <circle cx="124" cy="90" r="3.2" fill="currentColor"/>
    <circle cx="266" cy="90" r="3.6" fill="currentColor"/>
  `,

  // An FQDN split into four segments above a short list of record rows.
  'network-dns-records': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="28"  y="40"  width="54"  height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="86"  y="40"  width="54"  height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="144" y="40"  width="40"  height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="188" y="40"  width="84"  height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="40"  y="96"  width="120" height="22" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="40"  y="124" width="120" height="22" rx="3" fill="rgba(255,255,255,0.04)"/>
      <rect x="40"  y="152" width="120" height="22" rx="3" fill="rgba(255,255,255,0.04)" opacity="0.5"/>
      <line x1="200" y1="107" x2="160" y2="107" stroke-dasharray="4 3"/>
    </g>
    <circle cx="186" cy="107" r="2.8" fill="currentColor"/>
  `,

  // Client to LB, fanning out to node ports across three nodes.
  'network-nodeport-loadbalancer': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="22"  y="40" width="44" height="28" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="118" y="34" width="84" height="34" rx="6" fill="rgba(255,255,255,0.06)"/>
      <line x1="66" y1="54" x2="118" y2="52"/>
      <rect x="40"  y="116" width="64" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="128" y="116" width="64" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="216" y="116" width="64" height="40" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="150" y1="68" x2="72"  y2="116" stroke-dasharray="4 3"/>
      <line x1="160" y1="68" x2="160" y2="116" stroke-dasharray="4 3"/>
      <line x1="170" y1="68" x2="248" y2="116" stroke-dasharray="4 3"/>
    </g>
  `,

  // External LB to a controller, branching to two backend rules.
  'network-ingress-routing': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="26"  y="74"  width="48" height="36" rx="6" fill="rgba(255,255,255,0.04)"/>
      <rect x="108" y="62"  width="72" height="60" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="214" y="48"  width="74" height="30" rx="5" fill="rgba(255,255,255,0.04)"/>
      <rect x="214" y="106" width="74" height="30" rx="5" fill="rgba(255,255,255,0.04)" opacity="0.5"/>
      <line x1="74" y1="92" x2="108" y2="92"/>
      <line x1="180" y1="84"  x2="214" y2="64" stroke-dasharray="4 3"/>
      <line x1="180" y1="100" x2="214" y2="120" stroke-dasharray="4 3"/>
    </g>
    <circle cx="92" cy="92" r="3" fill="currentColor"/>
  `,

  // LB hitting two nodes, only one with a local backend; client IP marker.
  'network-externaltrafficpolicy': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="124" y="28" width="72" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
      <rect x="30"  y="92" width="108" height="64" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="182" y="92" width="108" height="64" rx="8" fill="rgba(255,255,255,0.04)"/>
      <rect x="46"  y="110" width="50" height="34" rx="5" fill="rgba(255,255,255,0.04)"/>
      <line x1="150" y1="56" x2="84"  y2="92" stroke-dasharray="4 3"/>
      <line x1="170" y1="56" x2="236" y2="92" stroke-dasharray="4 3"/>
    </g>
    <circle cx="71" cy="127" r="3" fill="currentColor"/>
  `,

  // Three stacked role layers down to a Service.
  'network-gateway-api': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="96"  y="22"  width="128" height="26" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="96"  y="58"  width="128" height="26" rx="4" fill="rgba(255,255,255,0.05)"/>
      <rect x="96"  y="94"  width="128" height="26" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="120" y="130" width="80"  height="24" rx="4" fill="rgba(255,255,255,0.04)"/>
      <line x1="160" y1="48"  x2="160" y2="58"/>
      <line x1="160" y1="84"  x2="160" y2="94"/>
      <line x1="160" y1="120" x2="160" y2="130"/>
      <line x1="60" y1="71" x2="96" y2="71"/>
    </g>
    <circle cx="74" cy="71" r="3" fill="currentColor"/>
  `,

  // Two pods on the same node, bridged through cni0.
  'network-pod-to-pod-same-node': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="36"  y="50" width="76" height="80" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="208" y="50" width="76" height="80" rx="12" fill="rgba(255,255,255,0.04)"/>
      <rect x="136" y="76" width="48" height="28" rx="4"  fill="rgba(255,255,255,0.04)"/>
      <line x1="112" y1="90" x2="136" y2="90" stroke-dasharray="4 3"/>
      <line x1="184" y1="90" x2="208" y2="90" stroke-dasharray="4 3"/>
    </g>
    <circle cx="124" cy="90" r="3" fill="currentColor"/>
    <circle cx="196" cy="90" r="3" fill="currentColor"/>
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

  // Claim "document" on the left bound to a cylinder PV on the right.
  'volume-pvc-binding': `
    <g stroke="currentColor" fill="none" stroke-width="1.4">
      <rect x="40" y="50" width="74" height="80" rx="6" fill="rgba(255,255,255,0.04)"/>
      <line x1="56" y1="76"  x2="98" y2="76"/>
      <line x1="56" y1="92"  x2="98" y2="92"/>
      <line x1="56" y1="108" x2="84" y2="108"/>
      <line x1="118" y1="90" x2="194" y2="90" stroke-dasharray="5 4"/>
      <ellipse cx="240" cy="56" rx="40" ry="8" fill="rgba(255,255,255,0.04)"/>
      <line x1="200" y1="56" x2="200" y2="124"/>
      <line x1="280" y1="56" x2="280" y2="124"/>
      <path d="M 200 124 A 40 8 0 0 0 280 124" fill="rgba(255,255,255,0.04)"/>
      <ellipse cx="240" cy="124" rx="40" ry="8" stroke-opacity="0.4"/>
    </g>
    <circle cx="186" cy="90" r="3.5" fill="currentColor"/>
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
