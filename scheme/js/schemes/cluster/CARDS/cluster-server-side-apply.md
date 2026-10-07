## cluster-server-side-apply

### layout

```
WHAT     managedFields drawn as a table: two field managers, one object, and who owns which field.
DEVIATES L-03: the top row is 3 x 232 + 2 x 60 right-aligned on 1140, so kubectl and the table's
         corner start at 324, behind the panel on the two smaller viewports. The API centre 732 is
         then the table centre, and the tie down is one vertical between face midpoints.
         A removed field row dims to OPACITY.terminated and reads Removed, it never leaves a hole.
CONTENT  Sources: Server-Side Apply, API Concepts, Declarative Object Management, the apiserver
         patch handler.
         The second applier is `scale-controller`, never the HPA, which writes a plain Update and
         never takes the 409. Row 4 is a scalar: fieldsV1 keys list entries by name. The force step
         keeps the doc hedge. The ledger is `one entry per manager and operation`. The removal keeps
         `unless another manager owns it too` (T-20).
```
