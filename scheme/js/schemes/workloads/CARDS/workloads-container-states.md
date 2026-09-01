## workloads-container-states

### layout

```
WHAT     Kubelet writes containerStatuses[], and the card reads state, lastState, restartCount
         and the termination message off one container to show which field holds the cause of
         death.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 4 x 34 + 3 x 8 = 160 tall
           ladder 660..1140, 6 rows
           node   full width, NODE_H 140 on the canvas floor 624
         Layout A does not fit: the six-row ladder is 6*32 + 5*10 = 242 against a left band under
         the panel of 250..464 = 214, twenty-eight short.
         SEVEN steps on SIX rungs. `message` shares rung 1 with `crash`, which is the shape
         `workloads-probes`, `cluster-node-restart`, `storage-csi-attach-mount` and
         `workloads-rolling-update` already carry. A seventh rung would run the ladder to
         160..444 and would be the first seven-row chain in the catalog, where the note the
         exit leaves behind is part of the exit and not a step of its own.
PANEL    x<=396.55 by y<=229.82, both at 1100x800, on `message` and on `exitcodes`
         (1280x860 192.67, 1600x1000 160.00). PANEL_B 230 is that reading rounded up and
         CHIPS_TOP is 20 under it, so the whole card carries 20 units of clearance and a step
         that grows past about 316 characters drops a line onto the first chip. That is the
         budget the CONTENT block below is written against.
LANES    One spine at WL.SPINE_X into the Pod's TOP MIDPOINT. The Pod is centred in the frame,
         so the spine reaches it rather than stopping on the frame edge above it.
CONTENT  The termination message is the fourth post-mortem source and it is a MEMBER of the
         Terminated record, not a peer of state / lastState / restartCount. That is why the
         `describe` step still reads `these three fields`: `message` lives at
         `lastState.terminated.message` and is inside Last State, so naming it does not make a
         fourth field of it, and kubectl describe prints it under each record it belongs to.
         Read against the Container schema of Pod v1 and against Determine the Reason for Pod
         Failure, both cited: `terminationMessagePath` defaults to `/dev/termination-log` and
         cannot be set after launch, `terminationMessagePolicy` defaults to `File`, and
         `FallbackToLogsOnError` uses the last chunk of container log output only when the
         message file is EMPTY AND the container exited with an ERROR. Both conditions are
         spelled out: `when the file is empty` alone is the same true sentence standing as a
         false absolute that T-20 is about.
         The limits the pages carry (4096 bytes per container, 12KiB across the Pod, 2048 bytes
         or 80 lines for the log fallback) are deliberately NOT drawn. The card is about which
         field holds the cause of death, and a byte ceiling is a writer-side detail that would
         cost the step its remaining panel line.
         A CARD of its own was considered and rejected: the subject is one clause of an existing
         record and has no second actor, no traffic and no state machine to draw.
```

### before `id: 'read',`

```
read, exitcodes and describe are the three mute steps that CLOSE this card, 6700ms in which the
picture does not move and nothing animates, which is what M-27 asks of a packet-less pod-less step.
The actor of all three is a value chip (state, lastState, restartCount), and a value chip is lit
rather than flashed (M-26). No block on the card is the subject of any of the three sentences.

`message` is a fourth mute step on the same reasoning and it is placed to keep this run at three:
between crash and restart, so the two hop steps still stand either side of it and the still stretch
at the end of the card does not grow to four.

None of the three lists the Kubelet box in lit. It wrote the record on crash and on restart and
does nothing on these three, and flashing it three times running would say it acts, on the only
steps where it does not. podGroup is out of describe for the neighbouring reason: a brightness
flash on the Pod reuses this card's own sign for the container changing state (crash and restart
both pulse it) on a step where nothing changed.

So the three stay separated by the outlined chips and the lit chain row alone. One and the same
block flashing three times running would not have changed that.
```

### poster

```
Two container records stacked, the live one solid at 0.09 with a filled dot, the one below dashed
and dimmed with an X. The sentence is that the SECOND record still exists: the dead instance is
drawn, not erased, because the whole card is about lastState surviving the restart.
The text lines inside each are drawn as bare rules at different lengths and opacities, so the two
read as records rather than as two Pods.
```
