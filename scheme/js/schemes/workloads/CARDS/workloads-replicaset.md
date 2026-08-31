## workloads-replicaset

### layout

```
WHAT     A ReplicaSet self-healing a lost Pod, adopting an orphan, and losing one to an
         ownerReference change.
LAYOUT   B (chips left, ladder right), the columns SWAPPED because the panel reaches 305.
           chips  left  60..540 from y 325, 4 values
           ladder right 660..1140 from y 150, 6 rows
           node   full width, 500..624, FOUR slots
         Pods are 78 high rather than the family 106. The six-row ladder and the chip column both
         have to clear the panel, and 78 is what is left.
LANES    Trunk from the ReplicaSet box's bottom midpoint (420..780, centred on CX) down between
         the columns, a bus at NODE_Y + 12, and one tap per slot. Four slots means four different
         addressees across the story: self-heal targets web-b2, adopt / converge / orphan all
         target web-d4, and the ownership step addresses all three live Pods with one ball each.
```

### before `F.fade({ target: 'pod4', from: 0, to: OPACITY.notready, dur: FADE.in, delay: 0, fill: 'both', easing: 'ease-out' }),`

```
ADOPTION IS A CHANGE OF OWNER, NOT A BIRTH, and the step is two beats because of it. The orphan
appears on its own at OPACITY.notready with the sublabel `owner: none`, which is the shade for
alive but outside this path and the text the idle frame already carries. Only then does the RS see
a selector match, PATCH the ownerReference, and the ball land: the Pod rises to 1 and its sublabel
turns over to `adopted · owner: rs` on the same beat.

The rewind winds pod4 back to 0 and its sublabel back to `owner: none`, and the fade runs
0 -> OPACITY.notready at delay 0. DO NOT rewind pod4 to 0 and fade it 0 -> 1 at 2622: that is byte
for byte the grammar `self-heal` uses for a genuine CREATE, over a narration whose third sentence
reads `The Pod was already running, adoption only restamps its owner`.

The PATCH waits FADE.in + BEAT.afterHop, the same idiom `self-heal` uses to put a node-band
event before the control-plane reaction it causes. The RS cannot match a selector against a Pod
that is not on screen yet. That two-beat shape is what puts the duration at 4400 rather than 3700:
the orphan appears at 600, the PATCH lands at 1400, the ball at 3322 and its pulse closes at 4222.

The bus tail and tap3 do not wind back with the Pod. LANE(3) runs along both, so the ball would
fly its last two legs over blank canvas.
```

### poster

```
A ReplicaSet on top owns three Pods below through ownerReference links (dashed). The
third Pod is dashed and faint: it just died and is being recreated, the controller
self-healing the count back to three.
```
