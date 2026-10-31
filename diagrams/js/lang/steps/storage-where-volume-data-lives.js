// Russian for storage-where-volume-data-lives: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Where volume data lives: one Pod mounts five volumes. A write to a path no volume covers lands in the container writable layer, which goes when that container is removed. The emptyDir and hostPath volumes sit on the storage backing the Node, its disk here, and a Memory emptyDir in Node RAM. A ConfigMap is an API object, and Kubelet copies its keys into the Pod as files. Here a PersistentVolumeClaim is bound to network storage outside the Node. Deleting the Pod removes the emptyDirs and the copied files, losing the Node removes the hostPath, and only the ConfigMap and the claim data outlive both.":
    "Где лежат данные томов: один Pod монтирует пять томов. Запись по пути, который не покрывает ни один том, попадает в записываемый слой контейнера, и слой уходит, когда удаляют этот контейнер. Тома emptyDir и hostPath лежат в хранилище Node, здесь на её диске, а emptyDir с medium Memory в RAM Node. ConfigMap это объект API, и Kubelet копирует ключи ConfigMap в Pod как файлы. Здесь PersistentVolumeClaim привязан к сетевому хранилищу вне Node. Удаление Pod убирает emptyDir и скопированные файлы, потеря Node убирает hostPath, и только ConfigMap и данные PVC переживают и то и другое.",

  "The app writes /tmp/report, a path no volume covers, so the bytes land in the writable layer of its own container. That layer sits on the Node storage, here its disk, but it belongs to that one container and to nothing else. It is the shortest lived home on this map.":
    "Приложение пишет в путь /tmp/report, который не покрывает ни один том, поэтому байты попадают в записываемый слой контейнера приложения. Этот слой лежит в хранилище Node, здесь на её диске, но принадлежит только этому контейнеру и больше ничему. Это самое недолговечное место на этой карте.",

  "Three volumes keep their bytes on the Node. The emptyDir cache and the hostPath node-logs are directories on its storage, here its disk. The emptyDir scratch sets medium Memory, a tmpfs in Node RAM, and what it holds counts against the memory limit of the container that writes it.":
    "Три тома хранят байты на Node. Тома emptyDir cache и hostPath node-logs это каталоги в её хранилище, здесь на диске. Том emptyDir scratch задаёт medium Memory, то есть tmpfs в RAM Node, и всё, что в нём лежит, засчитывается в лимит памяти контейнера, который туда пишет.",

  "The config volume is a ConfigMap, an API object the API server stores in ETCD. Kubelet fetches the ConfigMap and writes each key into the Pod as a read-only file, so the app reads a copy. A Secret volume arrives the same way, into a tmpfs in RAM.":
    "Том config это ConfigMap, объект API, хранимый API Server в ETCD. Kubelet забирает ConfigMap и записывает каждый ключ в Pod как файл только для чтения, так что приложение читает копию. Том Secret приходит так же, но в tmpfs в RAM.",

  "The data volume is a PersistentVolumeClaim. Here the claim is bound to network storage, so its bytes live outside the Node entirely, reached over the network. Neither the Pod nor the Node owns that disk, and the data lasts at least as long as the claim that points at it.":
    "Том data это PersistentVolumeClaim. Здесь PVC привязан к сетевому хранилищу, поэтому его байты лежат целиком вне Node, и доступ к ним идёт по сети. Этим диском не владеют ни Pod, ни Node, и данные живут не меньше, чем PVC, который на них указывает.",

  "The app container crashes and Kubelet restarts it. The new container gets a fresh writable layer, so /tmp/report is gone and it starts clean. All five volumes are untouched, because none of them belonged to the container.":
    "Контейнер приложения падает, и Kubelet его перезапускает. Новый контейнер начинает с чистого записываемого слоя, так что /tmp/report пропал. Все пять томов не тронуты, потому что ни один из них не принадлежал контейнеру.",

  "Now the Pod is deleted. The emptyDir volumes cache and scratch are deleted with it, and the config files Kubelet wrote are removed. The ConfigMap object stays in the API server, the claim still holds its data, and node-logs stays on the Node disk.":
    "Теперь Pod удаляют. Тома emptyDir cache и scratch удаляются вместе с ним, а файлы config, записанные Kubelet, убираются. Объект ConfigMap остаётся в API Server, PVC всё ещё держит свои данные, а node-logs остаётся на диске Node.",

  "Finally the Node itself is lost, disk and all, and everything that lived on it goes too, node-logs included: a hostPath lasts only as long as that one Node disk. The ConfigMap and the claim data survive because they never lived on the Node.":
    "Наконец теряется сама Node вместе с диском, и всё, что на ней жило, уходит тоже, включая node-logs, ведь hostPath живёт лишь столько, сколько диск этой одной Node. ConfigMap и данные PVC это переживают, потому что никогда не жили на Node.",
};
