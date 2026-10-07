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
CONTENT  Sources: Volumes, Mount propagation (v1.35), kubernetes-csi deploying, mount_namespaces(7),
         csi-driver-host-path manifest, containerd spec_linux_opts.go, kubelet pkg/volume/csi.
         `rprivate by default`: the CRI runtime may choose rslave. The runtime binds the plugin
         directories, its volumeMounts only set Bidirectional. `by default` a container mount call
         changes only its own list. `usually adds a bind mount`. `shared on a systemd host`.
         The peer chip reads `plugin not in it`, never `host root only` or `none`.
OPEN     OCCLUDED: two csi-node rows and the Pod shell sit behind the panel on the smaller
         viewports. The card centres on 600 however deep the panel reads, and step 2 names both.
```
