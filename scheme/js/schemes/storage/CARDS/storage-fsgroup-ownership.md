## storage-fsgroup-ownership

### layout

```
WHAT     fsGroup and volume ownership. A volume mounts owned by root, so a container running as a
         non-root user cannot write to it. securityContext.fsGroup tells kubelet to chown and setgid
         the whole volume tree to that GID before the container starts. fsGroupChangePolicy then
         decides whether kubelet walks the entire tree on every start (Always, the default) or checks
         only the top-level directory and skips the walk when it already matches (OnRootMismatch),
         which is what keeps a volume of millions of files from adding minutes to every Pod start.
LAYOUT   ONE spine, nothing beside it, in storage stack grammar: Pod app-0 over kubelet over the
         volume tree over the disk the tree lives on.
         securityContext is an inner ROW of the Pod rather than a box under it, which is both truer
         (a field OF the Pod, not a peer of it) and what buys back the room the listing needs.
         Tier heights and gaps are declared once, summed, and the leftover split evenly, so the card
         centres by moving one number.
PANEL    The deepest step on every viewport is `chown`:
         `OVERLAY_IDS=storage-fsgroup-ownership node --test report/overlay.test.mjs` from
         `scheme/test/` prints the reading.
         At the 900x650 hand row, which that command does not sample, the same step reaches right
         386.1, bottom 560.6 (`extents.mjs --step=3 --viewport=900x650`): the reserved rectangle is
         x<=397 AND y<=561. The narrowest block on the spine is the Pod at 232 wide (left edge 484)
         and the widest the tree at 340 (left edge 430), so the x condition alone keeps every block
         out of the panel at any height and the stack is free to be centred vertically. The ONE
         thing that reaches left of the panel edge is the chip strip, whose first chip starts at
         x=134, and it sits at y=589: the 560.6 at 900x650 clears it by 28 units, which is the whole
         remaining budget on this card, about one more line of that narration.
         The chown narration is the deepest by a wide margin because it carries three scope limits
         (CONTENT 2 and 4 below) and the group write bit (CONTENT 5).
SIZES    Kubelet is 232 by 80 and the Pod 232 wide with two 192 by 44 inner boxes (NET.L-01). The Pod
         is 130 tall rather than 104, a departure its content forces: it holds two peer boxes, the app
         at 26 under the Pod label and securityContext 8 under that, with 8 clear of the floor, and
         26 + 44 + 8 + 44 + 8 is 130. The widest string in a block is the Kubelet sublabel `applies
         fsGroup before start`, 171.8 at 1100x800, 30 either side. The tree is a listing sized by its
         rows and the disk a cylinder, so neither is an actor block. The stack is centred, 19 above
         and below.
LANES    The two lanes reaching the tree arrive on DIFFERENT EDGES on purpose, so neither shares an
         edge nor lands off centre. The chown comes down the spine into the TOP edge, kubelet acting
         on the volume, and the write comes in from the RIGHT on its own BYPASS, the container writing
         directly and never through kubelet. That bypass is the one structural fact this diagram can
         state that the narration cannot, which is why it survives as the only thing off the spine.
         The chown does not stop at the listing: it lands on the VOLUME, which is the whole reason it
         survives a restart and therefore the whole reason OnRootMismatch is allowed to trust it.
MOTION   The walk deliberately LEAVES the PKT_SPEED canon, because a walk is WORK and not transit.
         Both sweeps run at the SAME speed and differ only in how far they travel, which is the
         honest shape: OnRootMismatch is not a faster walk, it is a walk that STOPS after one entry.
         At WALK_SPEED the full listing takes about 1470ms and the single-directory check about
         470ms, a ratio the eye can compare directly. WALK_MIN_MS floors the short one so it stays
         longer than its own fade and reads as a check rather than as a glitch. The ball is LINEAR,
         so a row's moment is a pure ratio of distance, which is why the walk is `F.segment` not
         `F.route`.
         A row KEEPS its highlight for the rest of the step, so the listing fills in behind the scan
         and the finished frame shows how far kubelet got, which is what makes the last two steps
         comparable at a glance. Rows are readouts, not actors, so it is a static highlight, never a
         blink.
         The `owner` chip SUMMARISES that walk, so it waits for it (`P-03`). It holds the root:root
         the fsgroup step left and turns over when the ball reaches the last entry (`walk`, 2271ms),
         behind the three rows flipping at 1094, 1594 and 2094. Stated at t=0 it would announce the
         outcome of a walk the reader then watches happen, against a listing the walk has just reset
         to root:root. `rewind` carries the roll-back, `chipsCued` keeps the end value.
WIRE LABELS
         `WRITE_TAG_DX` 26: both write tags ride the W_WRITE elbow, whose ends sit on the Pod and the
         tree side faces, so a centred tag is cut for 600ms. The clear band starts at 20 for `EACCES`
         and at 26 for `write ok` over the four viewports, and ONE number is taken for both, since two
         tags on one lane with different offsets read as a slip.
         The fsgroup step carries NO riding tag, and that is deliberate, not an omission. A tag
         `fsGroup: 2000` on that ball prints the securityContext sublabel a second time over itself,
         81.8 x 7.8 of ink for 300ms at a baseline gap of 2.22, and it is not a geometry question:
         the two strings share the centre line, the corridor between the Pod floor (149) and Kubelet
         (189) is 40 units against a ball that travels all 40 and a tag ink box 10 tall, and no dy
         exists that clears both ends.
CONTENT  Two things this card asserts only qualified, because they are not true unqualified, both
         settled at https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ .
         1. OnRootMismatch WEIGHS TWO THINGS, not one. "OnRootMismatch: Only change permissions and
            ownership if the permission and the ownership of root directory does not match with
            expected permissions of the volume". The API type agrees, at v1.FSGroupChangeOnRootMismatch
            ("only when permission and ownership of root directory does not match"). A tree whose root
            carries the right GID and the wrong MODE still gets the whole walk. The aria-label, which
            says only "the top-level directory", is right as it stands, and the last narration names
            the owner AND the permission bits.
         2. KUBELET IS NOT ALWAYS THE ACTOR. FEATURE STATE Kubernetes v1.26 stable: "If you deploy a
            Container Storage Interface (CSI) driver which supports the VOLUME_MOUNT_GROUP
            NodeServiceCapability, the process of setting file ownership and permissions based on the
            fsGroup specified in the securityContext will be performed by the CSI driver instead of
            Kubernetes. In this case, since Kubernetes doesn't perform any ownership and permission
            change, fsGroupChangePolicy does not take effect". That retires the whole second half of
            the card wherever it applies, so it is a SCOPE limit rather than a wrong word, and it is
            paid for in the three strings that would otherwise state the mechanism as universal and
            nowhere else: the chown narration, which is where the actor claim is made and which
            precedes both policy steps, the desc, which is read on the grid with no narration under
            it, and the aria-label, which is the standalone summary of the drawn scene.
            DO NOT also qualify the Kubelet box sublabel ("applies fsGroup before start") or the
            fsgroup step ("Kubelet reads this before it ever starts the container"). Both survive the
            exception: kubelet applies fsGroup either way, by chowning or by handing the GID to the
            driver, which pkg/volume/csi/csi_client.go does as
            mountVolume.VolumeMountGroup = strconv.FormatInt(*fsGroup, 10) on the mount access type.
         3. ONCE IS PER MOUNT, NOT ONCE EVER. The chown step must NOT say the work is "done once at
            mount time" while the Always step says the default "walks and re-checks the entire tree on
            every single Pod start" and the desc says "The default walks the whole tree every start".
            Both cannot be the reader's takeaway, and the chown step would be the outlier: it is where
            the mechanism is taught, three steps before the policy. It reads "done once per mount",
            which keeps the contrast the clause is written for (paid at mount, not per write), drops
            the false absolute, and is 4 characters SHORTER than "done once at mount time", which is
            the direction the PANEL budget wants. The `writes` step is scoped correctly, at "paid for
            once at startup".
         4. NOT EVERY VOLUME IS CHOWNED AT ALL. The same page, Discussion: "Volumes that support
            ownership management are modified to be owned and writable by the GID specified in
            fsGroup". For a CSI volume the CSIDriver fsGroupPolicy decides, and its default,
            ReadWriteOnceWithFSType, reads at https://kubernetes-csi.github.io/docs/support-fsgroup.html
            "Changes will only occur if the fsType is defined and the persistent volume's accessModes
            contains ReadWriteOnce", with None meaning no change ever. So an RWX NFS-style CSI volume
            is not walked by default, in a section about CSI. Paid for in the same three strings as 2:
            the chown narration carries "By default a CSI volume gets this only if it is
            ReadWriteOnce with an fsType", the desc "on a volume that supports it", the aria-label
            "on a volume type and CSI driver that support it". The narration does not name
            fsGroupPolicy: the panel budget above is 28 units, and the record names it instead.
         5. CHOWN ALONE DOES NOT GRANT THE WRITE. Kubelet also adds group read and write, which the
            quote in 4 says ("owned and writable"), and which is what the `onmismatch` step checks
            as the permission bits. The chown narration says "chowns every entry to group 2000 and
            makes it group writable". Without that clause the `writes` step reads as if group
            ownership were the whole fix.
         6. "adds minutes" in the desc is rejected as an absolute against the `always` narration and
            the page ("can take a lot of time, slowing Pod startup"): the desc reads "can add
            minutes", as the narration does.
         Checked TRUE against the same page and left as they are: every container joins the
         supplementary group fsGroup names, fsGroupChangePolicy defaults to Always once fsGroup is
         set, Always changes ownership "when volume is mounted" (so per Pod start), the setgid bit
         makes new files inherit the group, and the owner stays root while the group changes, as the
         page's own listing shows (`drwxrwsrwx 2 root 2000 ... demo`).
BUDGET   The gap between the name column and the owner column is where the walk lane runs, so it is
         sized off the longest string on each side:
           name  `... 4.2M more`  13 ch = 89, from local 12  -> ends local 101
           owner `root:2000 g+s`  13 ch = 89, to local 296   -> starts local 207
         The lane sits at local 154, with 53 units of clear space either side.
         CHIP_W 300 is the family EXCEPTION: fsGroupChangePolicy 131 + `Always (default)` 110 = 265,
         against owner 131 and write 107, so 300 clears the worst by 35.
NOTE     The container and securityContext share the Pod's inset, so their edges line up and read as
         two fields of one object. pod() puts its own label baseline at y+16, so the first row starts
         at 26 to clear it. The Pod carries NO sublabel of its own: runAsUser belongs to the
         container row, which is the thing actually running as that user.
         THE VOLUME TREE IS THE LOAD-BEARING ELEMENT. Row 0 is the TOP-LEVEL DIRECTORY, and that is
         not cosmetic: OnRootMismatch is defined in terms of exactly that directory, so a labelled
         row is what lets the last step SHOW the rule instead of asserting it. Row 2 stands in for
         the rest of the tree, which is what makes the "minutes per start" claim on the Always step
         something the reader can see. A row is a `P.chip`, the same part kind as the strip along
         the bottom, because a row is also a name with a value against it: that brings the chip
         weight and colour, and it brings .highlight, which is how a row shows it has been visited.
         Every step writes EVERY row, so no row can be left displaying an ownership the current step
         has moved past. The state is whole-tree, because the tree is only ever entirely before the
         chown or entirely after it.
         The volume is lit FROM ENTRY on the two policy steps, because there it is the SOURCE: every
         entry the scan re-checks is an inode read off this disk, which is where the narrated cost
         comes from, and on the OnRootMismatch step the ownership it trusts is the ownership sitting
         on that disk from the last start. Without it the rule looks like kubelet guessing.
         The tree is lit from entry on those two steps as well: the walk ball starts inside it with
         no arrival before it, so the tree is its sender (`M-18a`), and the rows fill in under it.
         Kubelet is lit from entry on both too, because it is the one walking and the `onmismatch`
         narration names it as the one checking: dark there, the picture credits the tree.
         The `denied` step animates the write attempt as literal traffic: the process really does
         issue it and it really does reach the tree. What differs from `writes` is everything around
         it, so the same lane and tag read as a refusal here and success there. The disk stays dark,
         and that is the point: a refused write never reaches the volume.
         The last step draws the full-length lane underneath on purpose while the ball stops beside
         the top row, with the two rows below resting: seeing the scan NOT travel the listing is the
         whole point, and it is directly comparable with the step before. No block flash, it should
         come to rest.
WHY NOT  Put the disk and the tree SIDE BY SIDE on a shelf: that one choice causes most of what
         would be wrong with the card. A shelf pushes the tree centre 95 units right of the spine, so
         the chown lane cannot land on the middle of the thing it is chowning, the write lane has to
         come down as a third off-centre line, and the disk is joined to the tree by a horizontal
         stub carrying no traffic. Stacking puts every arrow back on the block it points at.
         Five blank rectangles with a ball swept across them for the tree: the one thing that
         actually happens during a chown, the ownership CHANGING, is then nowhere on screen and the
         sweep reads as decoration.
         Rewording the fsgroup-step tag. Every candidate restates something already drawn: the field
         itself is the secBox sublabel it launches from, and what Kubelet does with it is the Kubelet
         sublabel it is flying at (`applies fsGroup before start`). With no honest string the tag is
         not information, and the ball on a lit `securityContext` box reads the step on its own, the
         way the untagged watch route does on `storage-volumeattachment`.
DO NOT   Make W_PERSIST a bare markerless line on the reasoning that the disk backing the tree is a
         relationship: that makes the disk read as scenery. A chown rewrites inodes ON it.
         Hand-roll rows out of a scheme-box-rect at 3% inside a group at 0.75: that reads as grey
         furniture sitting BEHIND the tree rather than as content on it.
         Let `walkMarks` alone carry the rows. It rides `F.run`, which is the ANIMATED path only, so
         every walking step also states its finished listing through `enter: showRows(...)`, which
         runs on BOTH paths; `walkMarks` then winds that state back and re-marks row by row as the
         ball crosses. Drop the `enter` and the static path shows an unvisited listing on the one
         card whose subject is the walk.
         Fire a ball with no pulse, or the one block the packet came out of is the only inert thing
         on the step.
NOT A DEFECT
         report/arrival.test.mjs prints four R2-ENTRY rows on step 4 (`writes`): the three listing
         rows and the `owner` chip turn from root:root to the fsGroup owner with no highlight at
         entry. They are turned over on `chown`, each row by walkMarks as the scan crosses it and
         the chip by the cued F.set on the `walk` arrival, and a frame frozen at t=0 of `chown`
         reads the root:root the walk winds back to. R2-STEP reads 0. Carried in
         test/fixtures/carried.mjs.
```
