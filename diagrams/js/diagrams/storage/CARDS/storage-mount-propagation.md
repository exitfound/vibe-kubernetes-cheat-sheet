## storage-mount-propagation

### layout

```
WHAT     A mount is an entry in one mount namespace's table: the CSI node plugin's mounts reach the
         host only through Bidirectional binds of a shared host mount, and the app sees the volume
         only as a private bind the runtime copies into its own table.
DEVIATES NET.L-01: the Pods are 220 by 408, each sized by the four mount rows it holds, three
         tables and two 44 corridors in a 740 frame. The 180 by 64 rows are mount entries.
         STO.L-03: the chips stand two by two at a 12 gap, since four in a row under the 740 frame
         leave 176 each, under the 183.5 floor of `peer group` / `plugin not in it`.
         The two peer links are markerless relations and only the repeats are lanes: plugin and
         host are peers, host to app is a one-way copy.
         The step 5 ball rides the first 20 units of the staging lane and stops at the Pod wall.
         Pod A has rows 0 and 3 and nothing between: its table never holds the staging mount.
CONTENT  1.36: Volumes, Mount propagation, core/v1 VolumeMount, v1.36.5 validation.go, kubelet_pods.go,
         hostutil DoMakeRShared, containerd v2.2 ensureShared, csi-driver-host-path, mount_namespaces(7).
         `rprivate by default`: the runtime may choose rslave. The runtime binds the plugin directories,
         its volumeMounts only set Bidirectional, which needs a shared source: `shared on a systemd
         host`, else Kubelet makes /var/lib/kubelet rshared at start. `by default` a mount call changes
         only its own list. `usually adds a bind mount`. Peer chip `plugin not in it`, never `none`.
OPEN     OCCLUDED: two csi-node rows and the Pod shell sit behind the panel on the smaller
         viewports. The card centres on 600 however deep the panel reads, and step 2 names both.
```
