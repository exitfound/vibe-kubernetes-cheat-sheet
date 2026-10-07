## storage-projected-volume

### layout

```
WHAT     One projected volume fills one directory from a ConfigMap, the downward API and a
         serviceAccountToken, and only the token keeps changing: Kubelet replaces the one hour
         token at 80 percent of its lifetime, while a legacy Secret token never expires.
         The floor is a time axis on the chip strip span, the one horizontal in the section that
         is time.
DEVIATES NET.L-01: the rows are 232 by 56, entries of one listing and not actors. At 80 the Pod
         bottom runs through the token 1 bar.
CONTENT  Sources: Projected Volumes, Service Accounts, Managing Service Accounts, feature gates,
         kube-apiserver flags (v1.35), kubelet token_manager.go.
         clusterTrustBundle and podCertificate are beta and off by default, which the desc says.
         Replaced at 80 percent or at 24 hours: the desc and aria-label carry both arms.
         A recipient "should reject" a token for another audience. 3600 is the default of a
         user-written source. kube-api-access asks 3607 and is extended, so it is not drawn.
```
