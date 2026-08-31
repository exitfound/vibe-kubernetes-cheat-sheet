## workloads-crashloopbackoff

### layout

```
WHAT     Kubelet holding a restart off between attempts, the backoff doubling to its cap.
LAYOUT   B (chips left, ladder right). panel bottom 205 measured, 225 reserved, deliberately
         conservative.
LANES    Spine from the top row to POD_Y. It does not end on the Node frame's top edge, which
         sits 22 units above the Pod and reads as a lane pointing at a frame rather than at a
         container.
WIRE LABELS
         The lower label is anchored start at SPINE_X + 14 and hangs off the side. Centred on
         WL.SPINE_X the lane strikes it through on every step that sets it.
CONTENT  The FIRST restart is immediate and only the ones after it wait, which the `first-crash`
         narration says ("Kubelet restarts it immediately the first time"), so the `aria-label` says
         it too rather than promising a delay before EACH restart.
         restartCount reads 8 on `reset`, not 7. `cap` leaves it at 7 with the container Waiting, and
         `reset` narrates a NEW container running stably, so the counter has to have moved with it,
         and the step lights it for the same reason the other three chips it changes are lit.
CONTENT  The 300s ceiling is a per-node DEFAULT, not a constant, and `cap` says so in five words
         ("a per-node default since 1.35"). KubeletCrashLoopBackOffMax is beta and enabled by
         default at this card's declared 1.35: "With the feature gate KubeletCrashLoopBackOffMax
         enabled, you can reconfigure the maximum delay between container start retries from the
         default of 300s (5 minutes). This configuration is set per node using kubelet
         configuration." The step read "clamped at the 300s ceiling and stays there", which is a
         version-scoped default stated as a property of Kubernetes.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  The `desc` says "a 5 minute ceiling" flat and rung 5 says "delay clamped at the 300s
         ceiling", and both stand as written. Neither is FALSE: 300s is the default and the only
         value a default cluster ever uses. The desc sits at 433 of a hard 400..470 band with three
         sentences already carrying more load than a version-scoped qualifier is worth, and a rung
         is bounded by its column. The nuance belongs on the one step whose whole subject is the
         ceiling, and `cap` carries it.
         The 10s base, the doubling, the 300s value, the 10 minute reset and the immediate first
         restart in the `aria-label` are the raw doc verbatim. Do not "correct" any of them.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### before `const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];`

```
The DOWN lane carries no ball on `backoff-named`, `doubling` and `cap`, and that absence IS the
content: those are the steps where Kubelet is HOLDING THE RESTART OFF, which each narration says
in words, and the restart it is holding is exactly what would travel down. The crash goes UP and
is animated on `first-crash` and `reset`.

A down-ball on any of the three would assert the restart happened on the step whose subject is
that it has not. The other lane in the catalog whose emptiness is the lesson is `W_RET_WIPE` on
storage-reclaim-policy.
```

### poster

```
A near-closed circle with a filled arrowhead where it would close, wrapped around a container
carrying an X. The gap in the circle is the point: the loop does not complete, it waits. That gap
is why the arrowhead is here at all, since a closed ring would have said direction by itself.
No timings, no ladder, no chips: the poster says LOOP and BROKEN and nothing else.
```
