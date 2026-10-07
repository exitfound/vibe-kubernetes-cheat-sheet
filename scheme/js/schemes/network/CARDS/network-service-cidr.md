## network-service-cidr

### layout

```
WHAT     The Service range as a ledger: a ServiceCIDR declares it, the allocator in the API server
         takes a free address from the high band, and the IPAddress object of that name makes the
         allocation unique.
DEVIATES NET.L-01: the two ServiceCIDR boxes are 212, sized by the 440 range column they stand in
         ((440 - 16) / 2). At 232 the pair wants 480 and breaks the column edge.
CONTENT  Sources: Service ClusterIP allocation, Extend Service IP Ranges, Service v1 API (v1.35),
         and the Multiple ServiceCIDRs KEP, named rather than numbered.
         The prose joins the drawn names: `the high dynamic band`, `the low static band`.
         The band order is a preference, never a reservation: kube-dns is unlikely to be taken.
         The fallback is scoped to automatic allocation: `The low band is for addresses picked by
         hand` stays. The static band runs 10.96.0.1 to 10.96.1.0, so it is not written as a prefix.
OPEN     CENTRE: the chip column at 700..1140 is a column by design, and no strip fits under the
         allocation flow (L-16).
         CENTRE-LOW: the rule sees only ETCD, API and Service web on 130..536, and the ladder and
         chips that balance them are invisible to it (L-17).
```
