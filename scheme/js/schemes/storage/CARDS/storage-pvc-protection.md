## storage-pvc-protection

### layout

```
WHAT     A deleted claim stays while a Pod object still uses it: the pvc-protection finalizer holds
         it, kubectl shows Terminating over phase Bound, and the delete completes once it goes.
DEVIATES STO.L-03: the chips are 312, 232, 244 and 220 with a 24 gap. deletionTimestamp beside
         `gone with object` needs the 312, and the other three give it back.
         P-03: the consumer count turns over when the Pod fade completes, not on the delete
         arrival: the Pod is still standing, mounted, for the 1300ms between them.
CONTENT  Sources: Storage Object in Use Protection, Finalizers (v1.35), the protection controller
         and admission plugin, volume_binding.go, store.go, printers.go.
         The admission plugin adds the finalizer at creation, never when a Pod starts using it.
         status.phase never reads Terminating: it is a display of deletionTimestamp.
         The API server completes the delete inside the update that empties the list, not the GC.
         `while a Pod using the claim still exists`, never `still mounts`. A new Pod stays Pending.
```
