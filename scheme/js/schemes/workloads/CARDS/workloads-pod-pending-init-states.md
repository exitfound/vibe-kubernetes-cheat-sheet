## workloads-pod-pending-init-states

### layout

```
WHAT     The five values the STATUS column takes before Running, which component is still holding
         the Pod at each of them, and the columns beside it that turn a value into a diagnosis.
DEVIATES WL.L-02: the Node frame is 820, not full width, centred on WL.CX (WL.A-03). Under 816 the
         right-aligned Kubelet crowds the Scheduler past the 60 gap and the content box leaves CX.
         WL.L-06: reads no LAYOUT preset in code. The row is a three-across strip at 340 a cell,
         not 350.7: chipfit leaves 13 of name-to-pill gap at 340 and collides at 330.
         WL.A-01: the top row is a relation, not the lane pair. The Scheduler and the Kubelet never
         talk here and nothing rides it (A-05).
         P-03: on step 2 NODE turns at entry, because it states the bind, which no ball draws.
CONTENT  Sources: Debug Init Containers, Init Containers, Pod Lifecycle (v1.35), printers.go.
         Every STATUS value is the debug page table's. Values no page owns stay off the card.
         The row is a subsequence of the -o wide columns (IP is skipped), so the aria-label says
         `five columns`. AGE is the Pod's age: `likely a stall`, never `is a stall`, never `5m02s`.
         RESTARTS resets at PodInitializing for regular init containers only, hence `regular`.
         Pending alone does not mean unbound, so the Scheduler `holds it until bound`.
OPEN     The band 120..316 carries one corridor and nothing else, sparser than its siblings.
         Raising the frame spends the panel head room and widening the Pod is the L-16 move.
```
