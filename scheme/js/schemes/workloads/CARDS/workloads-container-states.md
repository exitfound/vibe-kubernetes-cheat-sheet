## workloads-container-states

### layout

```
WHAT     Kubelet writes containerStatuses[]; the card reads state, lastState and restartCount
         off one container to show which field holds the cause of death.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 4 x 34 + 3 x 8 = 160 tall
           ladder 660..1140, 6 rows
           node   full width, NODE_H 140 on the canvas floor 624
         Layout A does not fit: the six-row ladder is 6*32 + 5*10 = 242 against a left band under
         the panel of 250..464 = 214, twenty-eight short.
LANES    One spine at WL.SPINE_X into the Pod's TOP MIDPOINT. The Pod is centred in the frame,
         so the spine reaches it rather than stopping on the frame edge above it.
```

### before `id: 'read',`

```
read, exitcodes and describe are the three mute steps of this card, 6700ms in which the picture
does not move and nothing animates, which is what M-27 asks of a packet-less pod-less step. The
actor of all three is a value chip (state, lastState, restartCount), and a value chip is lit rather
than flashed (M-26). No block on the card is the subject of any of the three sentences.

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
