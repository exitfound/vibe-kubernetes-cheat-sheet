// Russian for storage-emptydir: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "emptyDir lifetime across two Nodes: Pod web-a is assigned to Node-1 and the Kubelet creates its emptyDir there, empty, before any container starts. The app and the sidecar mount it at /cache, so the sidecar reads the part-1 file the app writes, and after the app container crashes and restarts it reads part-1 back. Node-1 is cordoned and web-a is evicted, the emptyDir is deleted with it, and the replacement Pod web-b lands on Node-2 with a new, empty emptyDir. With medium Memory the emptyDir would be a tmpfs whose bytes count against the memory limit of the container that writes them, capped at a sizeLimit of 256Mi, or at the Pod memory limit if that is lower.":
    "Время жизни emptyDir на двух Node: Pod web-a назначен на Node-1, и Kubelet создаёт там его emptyDir, пустым, до старта любого контейнера. Приложение и sidecar монтируют этот том в /cache, поэтому sidecar читает файл part-1, записанный приложением, а после падения и перезапуска контейнера app оно снова читает part-1. Когда Node-1 переведена в cordon, а Pod web-a вытеснен, emptyDir удаляется вместе с этим Pod, и замена, Pod web-b, попадает на Node-2 с новым пустым emptyDir. С medium Memory этот emptyDir был бы tmpfs, чьи байты засчитываются в лимит памяти контейнера, который их пишет, а сам tmpfs был бы ограничен sizeLimit 256Mi или лимитом памяти Pod, если этот лимит меньше.",

  "Pod web-a is assigned to Node-1, and before any container starts, the Kubelet there creates its emptyDir: a new, empty directory on Node-1 storage. The spec says only emptyDir: {}, so there is no source and nothing to copy in.":
    "Pod web-a назначен на Node-1, и Kubelet на этой Node до старта любого контейнера создаёт emptyDir этого Pod, новый пустой каталог в хранилище Node-1. В спецификации стоит только emptyDir: {}, так что источника нет и копировать нечего.",

  "Both containers mount the same emptyDir at /cache. The app writes part-1 into it and the sidecar reads part-1 straight back, because every container that mounts it sees the same files.":
    "Оба контейнера монтируют один и тот же emptyDir в /cache. Приложение пишет туда part-1, а sidecar сразу читает part-1, потому что каждый контейнер, монтирующий этот том, видит одни и те же файлы.",

  "The app container crashes and the Kubelet restarts it. A container crash does not remove the Pod from Node-1, so the emptyDir stays, and the restarted app reads part-1 back from /cache.":
    "Контейнер app падает, и Kubelet его перезапускает. Падение контейнера не убирает Pod с Node-1, поэтому emptyDir остаётся, и перезапущенное приложение снова читает part-1 из /cache.",

  "Node-1 is drained with --delete-emptydir-data. It is cordoned, marked unschedulable, then Pod web-a is evicted, and its ReplicaSet creates a replacement under a new name. A Pod removed from its Node for any reason loses its emptyDir, so part-1 is gone.":
    "Для Node-1 запускают drain с флагом --delete-emptydir-data. Node-1 переводится в cordon, то есть помечается как unschedulable, затем Pod web-a вытесняется, и его ReplicaSet создаёт замену под новым именем. Pod, убранный со своей Node по любой причине, теряет свой emptyDir, так что part-1 пропал.",

  "The replacement, Pod web-b, lands on Node-2, since Node-1 is cordoned. Its emptyDir: {} brings nothing back, so the Node-2 Kubelet makes a new, empty directory and ls /cache finds no files. A PVC named in the template would still hold part-1.":
    "Замена, Pod web-b, попадает на Node-2, ведь Node-1 переведена в cordon. Запись emptyDir: {} у web-b ничего не возвращает, поэтому Kubelet на Node-2 создаёт новый пустой каталог, и ls /cache не находит файлов. PVC, указанный в шаблоне, по-прежнему хранил бы part-1.",

  "With medium: Memory, this emptyDir would be a tmpfs in Node-2 RAM, shared as before. Its bytes count against the memory limit of the container that writes them, and the tmpfs is capped at the 256Mi sizeLimit, or at the Pod memory limit if lower.":
    "С medium: Memory этот emptyDir был бы tmpfs в RAM Node-2, общим, как и раньше. Его байты засчитываются в лимит памяти контейнера, который их пишет, а tmpfs ограничен sizeLimit 256Mi или лимитом памяти Pod, если этот лимит меньше.",
};
