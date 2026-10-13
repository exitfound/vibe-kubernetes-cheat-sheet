## network-mtu-overhead

### layout

```
WHAT     What encapsulation costs in bytes, drawn as measure rows at one scale over a short path,
         and why a cluster where ping works can still hang on a large response.
DEVIATES NET.L-01: the four path blocks are 200, sized by the Node frame, 18 + 200 + 42 + 200 + 18.
         Both Pods are 110 tall so the address clears the app box and the shell floor.
         M-18: Pod A pulses at 0 on `small` and `blackhole` without the lead, which breaks M-19.
         P-03: the chip sizes turn at entry: a size is settled where the frame is built.
CONTENT  Sources: Calico MTU configuration (Calico 3.32, current with 1.36), RFC 1191, 2923, 4459.
         Rows are IP datagram sizes: the inner Ethernet header is in the 50. Echo 134, not 114.
         DF is a tunnel setting: `path` says `where the tunnel sets the do not fragment bit`.
         MSS 1310 is 1400 less 50, 20 and 20 (RFC 6691), and the clamp does nothing for UDP.
         `some` connections and `still answers its health checks` are the RFC 2923 hedges. 1400 is
         the AKS underlay MTU Calico cites. Calico auto-detects the MTU by default: `or detected`.
```
