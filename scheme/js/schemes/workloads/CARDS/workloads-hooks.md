## workloads-hooks

### layout

```
WHAT     postStart and preStop running through the CRI, with Kubelet asking and the runtime
         doing the work.
LAYOUT   C (bottom strip), the tightest card in the category. panel bottom 379, deepest in Workloads
         after the pod-* cards.
           ladder 660..1140 at y=140
           chips  full-width strip, THREE per row at 350.67, two rows
           node   394..528, Pod 20 below its top edge
         Nothing fits beside the panel: the left band is 399..464 = 65.
         Chips two per row is three rows, leaving the Node frame 64 units where the Pod alone is
         106. Three per row is 350.67 and the widest value needs 269.
LANES    Spine from TOP2's bottom midpoint to WL.SPINE_X at y=140, ending on the Pod's top
         midpoint rather than on the frame edge.
         The ExecSync ack runs TOP2_X -> TOP1_X + TOP1_W at RESP_Y, which is the drawn return
         arrow.
         The spine leaves TOP2 and not TOP1, Kubelet. Kubelet is a CRI CLIENT and never touches a
         container: the runtime execs the hook and delivers the signal, which all three riding
         steps say in their own wire label (`CRI ExecSync · postStart · Exit 0`, `CRI ExecSync ·
         preStop · Sync`, `CRI StopContainer · SIGTERM · ACK`). Cost 311ms per ball, all three
         have the headroom.
         The ack does not ride `segmentPacket from [580,95] to [540,95]`: both x values sit INSIDE
         the Kubelet box (420..640), so the ball slides across the box instead of down the arrow.
MOTION   Ask, deliver, return, in that order, on all three CRI steps.
CONTENT  Two absolutes the card's own words cancel, both restored rather than deleted.
         On `created` the postStart chip reads `fires with ENTRYPOINT`, not `declared`: the hook
         fires the moment the container is created, concurrently and with no ordering guarantee,
         which the `declared` and `poststart` narrations and rung 3 all say, so leaving the hook
         `declared` while the ENTRYPOINT is `starting (PID 1)` put an order on the race.
         Rung 6 and the grace chip both carry `if alive`, because the escalation is conditional in
         the narration ("If the process is still alive when it reaches 0").
```

### before `const ack = (after) => F.segment({ from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], after });`

```
The ack rides at the spine ball's arrival plus a beat, never before it. Span 3280 against
durations of 3800, 3800 and 4000, measured off `getAnimations()`. Ordering it this way makes the steps
SHORTER, not longer, because the Pod pulse moves earlier.

The ack never goes second. There it reports `ExecSync` complete before the hook has been exec-ed
and `StopContainer` complete before SIGTERM has reached the process: the answer arrives before the
thing it is answering.

The top row never animates alone on `poststart` either. That draws Kubelet asking and the runtime
answering while nothing reaches the container the handler runs inside. It rides the spine like the
other two.
```

### poster

```
A container with a circled dot on each side, joined by dashed legs: two slots, one before and one
after, and the container between them. The symmetry IS the sentence, so both circles are identical
and neither is brightened.
The circles are drawn twice, an outline and a filled core, so they read as sockets rather than as
packets frozen on a wire.
```
