## cluster-admission-chain

### layout

```
WHAT     A write running the admission path: authn/authz, mutating, schema, validating, then the
         persist to ETCD, five stages hanging off the API as one pipeline.
DEVIATES L-03: kubectl stands bottom-left at KCTL_Y 300, its risers at x 204 and 228 inside the
         panel column. No position clear of x 397 exists: right is the ladder, below are the chips.
         M-27: the mutating, schema and validating steps carry no flow and no `F.flash` on the API.
         A flash brightens the whole box, which M-01 forbids, so `.highlight` is the beat.
         P-07: the chips are two across at 490, not four at 258. The `Pod object` value runs 251.5.
         ETCD sits 4 inside BAND_R while the chips are flush: the inset is the chips' rx 4.
         No caption over the ladder: rows 1 and 5 are outside admission, which the `aria-label`,
         the numbering and step 1 already say. cluster-resource-quota draws the same ladder.
CONTENT  Sources: Admission Controllers, Dynamic Admission Control, Mutating Admission Policy and
         feature gates (v1.36), Authentication, Authorization, `plugins.go` at release-1.36.
         LimitRanger is named on mutating and validating. Row 3 is `required fields and values
         checked`, never types or OpenAPI. Rows 2 and 4 read `plugins, policies and webhooks`, false
         below 1.36. Webhooks use HTTPS. Persist reaches "every watch that MATCHES". Step 1 has no
         built-in label, and every caller has an identity.
```
