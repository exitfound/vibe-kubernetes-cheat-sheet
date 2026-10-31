## cluster-server-side-apply

### layout

```
WHAT     managedFields drawn as a table: two field managers, one object, and who owns which field.
DEVIATES L-03: the top row is 3 x 232 + 2 x 60 right-aligned on 1140, so kubectl and the table's
         corner start at 324, behind the panel at 1100x800 by 36 units. The API centre 732 is
         then the table centre, and the tie down is one vertical between face midpoints.
CONTENT  Sources (v1.36): Server-Side Apply, API Concepts, Declarative Object Management, ObjectMeta,
         Deployment v1, kubectl `apply.go` (`--server-side` defaults to false), `patch.go`, `errors.go`.
         `scale-controller`, never the HPA: a plain Update never takes the 409. Say `applying`.
         Force is `force=true` in the query, `--force-conflicts` only as kubectl spells it, doc hedge kept.
         The four rows are `drawn`: a Deployment also needs selector and template. Row 4 is a scalar.
         The ledger is `one entry per manager and operation`. Removal keeps the other-owner exception.
```
