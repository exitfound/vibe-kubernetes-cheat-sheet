## storage-hostpath

### layout

```
WHAT     A hostPath hands a Pod a directory of the Node it lands on: the Kubelet only checks the
         type, the runtime bind-mounts the path, the bytes land on that Node disk outside the Pod
         ephemeral-storage accounting and outlive the Pod, and the same path on another Node is a
         different directory or none.
LAYOUT   Two Nodes of unequal width. Node-1 (40..744) carries the whole mount path as a cast:
         containerd and Pod app on the top row, the Kubelet under containerd, and under both a row of
         Node path cells, so the filesystem the Pod reaches reads as a layer of the Node rather than
         as a volume the Pod owns, which is why no cylinder is drawn. /data/app sits under the Pod,
         the three system paths (/var/log, /var/lib/kubelet, containerd.sock) beside it. Node-2
         (784..1160) is a narrow column holding only what the replacement meets: Pod app-2, its
         Kubelet and a /data/app that is not there. The chips stand ABOVE the frames in two rows
         centred on the whole scheme (600): the premise `type` alone on top, right of the panel, and
         the three outcomes it decides (`Node-1`, `counted`, `Node-2`) under it, so the accent is
         the spec field and the row reads as its consequences. The outcome row spans 332..868 and
         reaches left of the panel edge, so it sits below the deepest panel, and the frames are
         compressed to fit under it: rows 32 apart, frames 242..614.
         What separates it from storage-emptydir, the other two-Node card here: that card moves a
         replacement onto a new empty directory, this one shows the type check refusing it
         (FailedMount), and the path cells carry the security step without a counterfactual lane.
         The section has no lever it has never used (kin.mjs), so the difference is the cast chain
         Kubelet > runtime > Pod inside one frame and the filesystem as its own layer.
PANEL    `OVERLAY_IDS=storage-hostpath node --test report/overlay.test.mjs` from `scheme/test/`.
         Deepest on step 0 at 1100x800, 180.12 (the poster previews the step 1 text), with the
         steps ranging 130.43..180.12 there, right edge 396.55. The `type` chip (146..180, x
         484..716) is right of the panel edge, the outcome row (192..226, x from 332) is 11.88 below
         its floor, the frames (from 242) further. The frame bottom 614 is also the floor at
         1600x1000: at 634 the letterboxed canvas cut the frame bottoms off.
SIZES    Catalog sizes on every actor: containerd, both Kubelets and both /data/app cells 232 by 80,
         both Pods 232 by 104 around a 192 by 44 app box (NET.L-01). The three system path cells are
         120 by 80: what is left of Node-1 left of the Pod column on one 16 gap,
         (480 - 72 - 3 * 16) / 3. Their longest strings are `/var/lib/kubelet` and `root on Node`.
         The `type` chip is 232 (STO.L-03), the three outcome chips 168 on a 16 gap, narrower so the
         row stays 536 wide. The tightest name to value gap is `Node-1` |
         `cache.db kept`, 13.
LANES    Five one-way lanes, each ending on a face midpoint (L-11). CRI (Kubelet top up into
         containerd floor, 32), BIND (containerd right face into the Pod left face, both on y 296),
         CHECK_1 (Kubelet right face along y 438, one right angle, down into the /data/app top at
         572), MOUNT (Pod floor at 620 down into the /data/app top, 132) and CHECK_2 (Kubelet-2
         floor into the Node-2 /data/app top, 32). CHECK_1 and MOUNT are an L-12 pair on the
         /data/app top, 24 either side of its midpoint 596, and MOUNT leaves the Pod floor 24 off
         its midpoint, inside the 18 percent L-11 allows. BIND and MOUNT live only while Pod app does,
         CHECK_2 only with Pod app-2 (STO.S-02). The missing Node-2 directory stands at
         OPACITY.notready throughout.
MOTION   The two writes ride LEG_DUR 1200 instead of routeDur (registered in the motion PACING list
         at 2): the 132 unit leg sits on the 700ms floor otherwise and its tag retires unread. Every
         other ball keeps routeDur, the three 32 unit legs (CreateContainer, StopContainer and the
         Node-2 check) on the 700ms floor. The CRI tags ride 176 right of their ball, clear of the
         block edges the 32 unit gap would put them on. Every tag lives as
         long as its ball (M-30a). The Kubelet is lit from entry on `check`, `bind` and `delete` as
         the sender, the whole Pod app (shell and app box) on `write` and `uncounted`, Kubelet-2 on
         `elsewhere`. The same pair lights as the bind lands on `bind`, and Pod app-2 as the failed
         check lands on `elsewhere`: a Pod that acts or receives reads as one unit, never as a lit
         app box inside a dark shell.
         A lit Pod does NOT also pulse. The pulse ramps from the unlit base, so on a lit Pod it
         reads as highlight, gone, highlight: sampled every 50ms in the browser, the shell stroke
         fell from the lit 2.4 to 1.2 and climbed back. Pod app blinks only where it is not lit,
         once on `check` and once on `delete` before it fades.
         `delete` sends StopContainer before anything fades, so the actor the narration names acts
         on the canvas: the Pod blinks, the request lands on containerd, and the Pod, BIND and MOUNT
         fade from that arrival.
         `Node-1`, `counted` and `Node-2` are written through `chips`, wound back in `rewind` and
         turned over by an F.set on the landing that earns them, carried in fixtures/carried.mjs
         under R2-ENTRY. `counted` keeps `0 of 1Gi` on `uncounted` and lights with it unchanged:
         the value not moving IS the step.
         `reach` sends no ball: the three system cells light together at 300, and the two relabels
         (`Pod Secrets`, `root on Node`) are static on the step.
CONTENT  Read against the release in k8sVersion. volumes.md, hostPath warning: "hostPath volume usage
         is not treated as ephemeral storage usage ... excessive hostPath disk usage will lead to
         disk pressure on the node", "Pods with identical configuration ... may behave differently
         on different nodes due to different files on the nodes", and access to the host filesystem
         "can expose privileged system credentials (such as for the kubelet) or privileged APIs
         (such as the container runtime socket)". Types: `Directory` "A directory must exist at the
         given path", `DirectoryOrCreate` makes "an empty directory".
         pkg/volume/hostpath: SetUp runs checkType and returns "hostPath type check failed: <path>
         is not a directory", TearDown "does nothing". The mount error surfaces as the Kubelet
         event `FailedMount` and the Pod waits in ContainerCreating. The runtime does the bind
         (CRI CreateContainer carries the mounts, the OCI runtime mounts them as the container
         starts), so `bind` says the container "starts with /data/app bind-mounted" and credits
         the mount neither to the Kubelet nor to CreateContainer itself. "containerd bind-mounts
         /data/app" is rejected: at CreateContainer nothing is mounted yet.
         `delete`: kuberuntime killContainer calls `runtimeService.StopContainer`, and
         `RemoveContainer` comes later from container garbage collection, so the tag reads
         `StopContainer` and the narration "has containerd stop the container, and its bind mount
         goes with it". "remove the container" is rejected as the wrong call at that moment.
         `reach` and the aria-label say "The hostPath spec limits no path". "Nothing limits the
         path" is rejected (T-19): volumes.md names admission-time validation that restricts host
         directories, and PSS forbidding hostPath is itself such a limit.
         `desc`: "The Kubelet checks the path against its type (Directory must exist,
         DirectoryOrCreate makes it)". "The Kubelet only checks the type" is rejected because
         DirectoryOrCreate has the Kubelet create the directory.
         `counted` is the part of cache.db the Pod ephemeral-storage limit sees, 0 of the 1Gi. It
         is not the whole Pod usage: the writable layer and the logs still count. The narration of
         `uncounted` defines it, and the chip name cannot say more inside 168 units.
         PSS Baseline: "HostPath volumes must be forbidden", Restricted includes Baseline.
         `/var/lib/kubelet` holds the Secret volumes of the Pods on THAT Node, not of the cluster.
BUDGET   Six lines at 1100x800 is about 235 characters with this card's path tokens. The longest,
         `reach` at 244 and `elsewhere` at 231, read six lines: the panel range at 1100x800 stays
         130.43..180.12. The `desc` sits at 457 of the 470 ceiling.
SCOPE    Where bytes live and how long each home lasts is storage-volume-data-homes. A new empty
         directory for a replacement Pod is storage-emptydir. readOnly and recursive read-only are
         storage-recursive-readonly, and mountPropagation is storage-mount-path-chain. A local
         PersistentVolume, the node-local answer that DOES pin the Pod to its Node, is
         volumes-claims.
NOT A DEFECT
         The Node-2 check carries no tag: in a 32 unit gap between Kubelet-2 and its /data/app any
         riding tag lies on one of the two borders, and the Kubelet-2 sublabel already reads
         `hostPath type check` right above the ball.
         CHECK_1 stays drawn after Pod app is deleted: the Kubelet and /data/app both still exist,
         and the lane has been ridden. It is not a lane into nothing.
         Pod app-2 appears only on `elsewhere`, with no scheduler drawn: the narration says it
         lands, it does not name the actor that placed it.
```
