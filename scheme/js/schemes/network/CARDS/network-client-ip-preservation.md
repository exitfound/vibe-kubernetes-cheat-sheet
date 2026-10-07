## network-client-ip-preservation

### layout

```
WHAT     Where the client address goes when a proxy ends the connection and starts its own, and the
         two places the original can still ride, an HTTP header or a PROXY protocol preamble, drawn
         as two packets compared across the proxy.
DEVIATES NET.L-01: the two Pods are 232 by 124, the card's own height.
         M-12: every leg rides `LEG_DUR` 1200, registered in `PACING`. At the 700 floor a tag cannot
         clear the block it leaves and still be read.
         P-03: `edge mode` and the left `src` stand at entry: the mode is configuration, and the
         client's own address is true before its packet moves.
         P-05: `X-Forwarded-For` empties on `passthrough` unlit, because a raw stream has no header.
CONTENT  Sources: Preserving the client source IP, X-Forwarded-For (MDN), RFC 7239, PROXY protocol.
         `forge` rests on MDN alone: RFC 7239 governs `Forwarded`, whose list runs the other way.
         `An edge that keeps what arrived appends what it saw`: a boundary edge may replace instead.
         `Trust that list from its last entry inwards`. The forged value is TEST-NET-1 192.0.2.1.
         The backend must expect the preamble, and `TCP4 198.51.100.9` heads the version 1 line.
         The addresses survive `only because nothing on the way rewrote them`.
```
