## cluster-server-side-apply

### layout

```
WHAT     managedFields drawn as a table: two field managers, one object, and who owns which field.
DEVIATES L-03: the top row is 3 x 232 + 2 x 60 right-aligned on 1140, so kubectl and the table's
         corner start at 324, behind the panel at 1100x800 by 36 units. The API centre 732 is
         then the table centre, and the tie down is one vertical between face midpoints.
CONTENT  Sources (v1.36): Server-Side Apply, API Concepts, Declarative Object Management,
         ObjectMeta, kubectl `apply.go` and the apiserver patch handler at release-1.36
         (`--server-side` still defaults to false). The second applier is `scale-controller`, never
         the HPA, which writes a plain Update and never takes the 409. The desc says `applying`,
         never `setting`: an update never conflicts. Row 4 is a scalar. The force step keeps the doc
         hedge. The ledger is `one entry per manager and operation`. The removal keeps `unless
         another manager owns it too`.
```
