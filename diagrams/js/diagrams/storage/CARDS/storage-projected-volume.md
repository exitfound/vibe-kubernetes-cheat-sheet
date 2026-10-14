## storage-projected-volume

### layout

```
WHAT     One projected volume fills one directory from a ConfigMap, the downward API and a
         serviceAccountToken, and only the token keeps changing: Kubelet replaces the one hour
         token at 80 percent of its lifetime, while a legacy Secret token never expires.
CONTENT  Sources (v1.36): Projected Volumes, Service Accounts, Managing Service Accounts, and
         kube_features.go, token_manager.go, projected.go, claims.go, token.go at v1.36.5.
         clusterTrustBundle and podCertificate stay beta and off by default, which the desc says.
         Past 80 percent or 24 hours old, the token is renewed on the next volume sync (up to 10s
         jitter early, a resync later): "at minute 48" is ruled out, "about minute 48" stays.
         A recipient "should reject" another audience. 3600 is user-written, 3607 is not drawn.
```
