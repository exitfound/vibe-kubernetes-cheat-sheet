## network-dns-pod-policy

### layout

```
WHAT     How the Kubelet builds the resolv.conf of a Pod: dnsPolicy picks between its own cluster
         settings, the resolver file its resolvConf setting names, and nothing at all, and dnsConfig
         merges on top of whichever base the policy produced.
LAYOUT   Two files compared inside ONE Node frame. The API server stands over the frame right of the
         panel wall, centred on the Kubelet, with the three spec fields of the arriving Pod in a
         column beside it. Inside the frame one row carries the resolvConf file, the Kubelet and
         the Pod on centre line 340, and under that row the two files are drawn line for line:
         nameserver, search, options under the file box, and the same three lines, wide, under the
         Kubelet and the Pod. The frame is the argument: Default and the hostNetwork fallback mean
         take the file of THIS Node, ClusterFirst means take the cluster settings, and a step that
         copies the Node file makes the right column read the same as the left one.
PANEL    `OVERLAY_IDS=network-dns-pod-policy node --test report/overlay.test.mjs` from
         `scheme/test/`: bottom 142.56 at 1600x1000 and 171.42 at 1280x860 on every step,
         194.85..219.69 at 1100x800, deepest on `clusterfirst`. The
         panel height is quantized by its line count, which is why the reading equals the one on
         `network-dns-coredns`, whose deepest step wraps to the same number of lines. The frame
         top at 260 is what that reading pins: the `Node` label inks from y 267 at 1100x800, 47.3
         clear of 219.69, and the file box and its chips are the only blocks left of x 420.
SIZES    Actors 232 by 80, the Pod 232 by 104 with a 192 by 44 app box (NET.L-01). The file box and
         the Pod both stand 20 inside the frame, at x 60 and to x 1140, so the chip strip spans
         60..1140 and centres on 600 (L-13). The Node file chips take the file box width, 232. The
         Pod file chips are 656, the Kubelet left edge to the Pod right edge, because the
         ClusterFirst search line `default.svc.cluster.local svc.cluster.local cluster.local
         corp.internal` inks 489.3 at 1600x1000 and leaves 101.4 to the `search` name. The spec
         chips are 400: `dnsConfig.nameservers` against `192.0.2.1 192.0.2.2 192.0.2.3` leaves 24.6
         at 1600x1000, the tightest chip on the card.
LANES    Three two-point lanes, every one ridden, the two inside the frame 192 long. `watch` drops
         from the API server bottom face to the frame top face on x 600 and stops there (NET.A-02).
         `HOST` joins the file box right face to the Kubelet left face and carries a ball only on
         the steps whose policy reads the file: ClusterFirst and ClusterFirstWithHostNet for its
         search line, Default and the hostNetwork fallback for the whole file. On `none` it carries
         no ball and its label reads `not used`. `CRI` joins the Kubelet right face to the Pod left
         face.
MOTION   The API server is the only block lit at entry, and the first ball leaves at BEAT.lead.
         NOTHING INSIDE THE FRAME LIGHTS WHILE THE WATCH BALL IS STILL FALLING: the watch arrival at
         1500 turns over the spec chips that changed, cues the file lines the policy takes, and
         lights the sender of the next hop, the file box on a reading step and the Kubelet on
         `none`. The file ball then lights the Kubelet as it lands, which is the mid-chain shape: a
         Kubelet lit at entry as well is `report:arrival/R3`. The watch ball stops on the frame
         face, so it lands on no block and `report:arrival/R4` cannot see that cue: six rows, one
         per step, are carried in `test/fixtures/carried.mjs` with the reason. The shape R4 wants,
         `hostFile` or `kubelet` in `lit`, is rejected: it lights a block inside the Node 1500
         before the ball addressed to it arrives. The file ball leaves 100 after that arrival, the
         CRI ball 100 after the next, and the Pod pulses and its three file lines turn over when the
         CRI ball lands (P-03). All three lanes are under the 700 floor: the CRI ball lands at 3100
         on a reading step and at 2300 on `none`, and the Pod pulse ends 900 later. Durations are
         that span plus a 1300 hold on every step: 5300, and 4500 on `none`.
         `card-review/tools/deadair.mjs` is where the hold is ranked against the catalog.
CONTENT  Read against Kubernetes 1.35: `pkg/kubelet/network/dns/dns.go` and `dns_other.go`,
         `pkg/apis/core/validation` and `pkg/apis/core/v1/defaults.go` at v1.35.0, the DNS for
         Services and Pods page, the Kubelet Configuration reference and Debugging DNS Resolution.
         An unset dnsPolicy is defaulted to ClusterFirst by the API server (`defaults.go`), and the
         page says `"Default" is not the default DNS policy`. ClusterFirst replaces the nameservers
         with clusterDNS, puts `<ns>.svc.<domain> svc.<domain> <domain>` before the search domains
         of the resolver file, and sets options to ndots:5 alone, so the file options are dropped:
         the host file is read for its search line only, which is the `search only` lane label.
         With no clusterDNS configured the Kubelet falls back to Default and emits a
         MissingClusterDNS event, which the card does not draw. A hostNetwork Pod on ClusterFirst
         falls through to Default with no event, which is why `quietly` stands.
         ClusterFirstWithHostNet maps to the cluster branch on any Pod. Default takes the file the
         Kubelet `resolvConf` names, `/etc/resolv.conf` by default. `unchanged` is rejected for that
         copy because the nameserver cap and duplicate removal still apply to it.
         `it has to point at /run/systemd/resolve/resolv.conf` is rejected: the debugging page says
         the stub file `can cause a fatal forwarding loop` and that the fix is `--resolv-conf`
         pointing at that path, so the card says `should` and names the loop.
         `Service names resolve only if the Node resolver happens to know the cluster domain` is
         rejected as vague: a hostNetwork Pod on the Node file has no cluster search domains, so
         cluster names resolve only where the Node resolver forwards the cluster domain.
         None starts from an empty config, and validation requires dnsConfig with at least one
         nameserver. dnsConfig appends nameservers and searches through `omitDuplicates` and merges
         options by name with the dnsConfig value winning, and only after that merge are
         nameservers cut to the first 3 (a DNSConfigForming warning event) and searches to 32.
         dnsConfig itself is rejected above 3 nameservers, so the merge step reaches the cut with a
         spec that validates. CRI carries the result as `DNSConfig` (servers, searches, options) in
         the sandbox config, which is the `CRI DNSConfig` lane label.
         Values: 10.96.0.10 is the kube-dns address its siblings use, 10.0.0.2 the Node resolver
         `network-nodelocal-dnscache` draws, `.internal` is reserved by ICANN for private use,
         `timeout:n` and `edns0` are resolv.conf options (resolv.conf(5)), and 192.0.2.0/24 is
         TEST-NET-1. `ns1.svc.cluster.local my.dns.search.suffix` and `ndots:2 edns0` are the page
         example with its cluster domain written as cluster.local. Options come out of a Go map
         in no fixed order, so `ndots:2 edns0` is the page rendering and not a guaranteed order.
SCOPE    How the file this card builds is USED is `network-dns-ndots`: the search walk and its query
         count. Who answers the nameserver is `network-dns-coredns`, and a Node-local cache on the
         clusterDNS address is `network-nodelocal-dnscache`. The search list limits past three
         domains are not drawn.
DO NOT   Write the spec chips in `chips` alone. The watch ball is the Kubelet receiving the Pod, so
         a changed spec field that reads at entry is a turnover 1500 before its beat, which
         `unit/chip-beat-e.test.mjs` names as FORM-E. Each step winds them back to the previous Pod
         under `rewind` and turns them over at the watch arrival.
NOT A DEFECT
         `report:arrival` R2-ENTRY lists the spec chips as changed with no highlight at entry, some
         of them as NO CUE IN STEP. Both samples are frozen at t=0, and a freeze never fires the
         `F.set` at the watch arrival that cues them: `tools/settled-dump.mjs` shows every changed
         spec chip lit on its step, `hostNetwork` on `hostnet` and on `none` included.
```
