## cluster-admission-chain

### layout

```
WHAT     A write running the admission path: authn/authz, mutating, schema, validating, then the
         persist to ETCD, five stages hanging off the API as one pipeline.
DEVIATES L-03: kubectl stands bottom-left at KCTL_Y 300, its risers at x 204 and 228 inside the
         panel column. No position clear of x 361 exists: right is the ladder, below are the chips.
         M-27: the mutating, schema and validating steps carry no flow and no `F.flash` on the API.
         A flash brightens the whole box, which M-01 forbids, so `.highlight` is the beat.
CONTENT  Sources: Admission Controllers, Dynamic Admission Control, Mutating Admission Policy and
         feature gates (v1.36), Authentication, Authorization, `plugins.go` at release-1.36.
         LimitRanger is named on mutating and validating. Row 3 is `required fields and values
         checked`, never types or OpenAPI. Rows 2 and 4 read `plugins, policies and webhooks`, false
         below 1.36. Webhooks use HTTPS. Persist reaches "every watch that MATCHES". Step 1 has no
         built-in label, and every caller has an identity.
```
