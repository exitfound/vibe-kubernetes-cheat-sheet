## storage-pvc-protection

### layout

```
WHAT     A deleted claim stays while a Pod object still uses it: the pvc-protection finalizer holds
         it, kubectl shows Terminating over phase Bound, and the delete completes once it goes.
DEVIATES STO.L-03: the chips are 312, 232, 244 and 220 with a 24 gap. deletionTimestamp beside
         `gone with object` needs the 312, and the other three give it back.
         P-03: the consumer count turns over when the Pod fade completes, not on the delete
         arrival: the Pod is still standing, mounted, for the 1300ms between them.
CONTENT  Sources (v1.36): Storage Object in Use Protection, Unused PVC tracking, Finalizers, and at
         v1.36.5 pvcprotection, the admission plugin, volume_binding.go, store.go, printers.go.
         Finalizer added at creation, not on first use. Terminating shows deletionTimestamp, phase
         stays Bound. Emptying the list completes the delete, not the GC. A new Pod stays Pending.
         A scheduled Pod object holds it, finished or not: `names it`, never `still mounting it`.
         DOC-VS-CODE: docs count any Pod object, code only scheduled ones. Alpha Unused: left out.
```
