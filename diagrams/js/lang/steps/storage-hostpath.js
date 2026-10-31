// Russian for storage-hostpath: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "hostPath across two Nodes: Pod app asks for hostPath /data/app with type Directory, mounted at /cache, and lands on Node-1. The Kubelet checks that /data/app is a directory on Node-1, then asks containerd to create the container, which starts with the directory bind-mounted at /cache. The app writes cache.db, which lands straight on the Node-1 disk, and grows it to 8Gi while the ephemeral-storage limit of 1Gi counts none of it. Deleting the Pod leaves cache.db on Node-1. The replacement Pod app-2 lands on Node-2, where /data/app does not exist, so the check fails with FailedMount and the Pod stays in ContainerCreating. The volume spec itself limits no path: /var/lib/kubelet holds the Secret volumes of the Pods on Node-1 and the containerd socket hands out root on it, so the Baseline and Restricted Pod Security Standards forbid hostPath and only the Privileged level allows it.":
    "Том hostPath на двух Node: Pod app запрашивает hostPath /data/app с type Directory, смонтированный в /cache, и попадает на Node-1. Kubelet проверяет, что /data/app на Node-1 это каталог, затем просит containerd создать контейнер, и тот стартует с этим каталогом, смонтированным через bind в /cache. Приложение пишет cache.db, который попадает прямо на диск Node-1, и растит файл до 8Gi, а лимит ephemeral-storage 1Gi ничего из этого не учитывает. После удаления Pod файл cache.db остаётся на Node-1. Замена, Pod app-2, попадает на Node-2, где /data/app нет, поэтому проверка даёт ошибку FailedMount, и Pod остаётся в ContainerCreating. Сама спецификация тома путь не ограничивает, а на Node-1 в /var/lib/kubelet лежат тома Secret её Pod, и сокет containerd даёт на ней root. Поэтому Pod Security Standards уровней Baseline и Restricted запрещают hostPath, и разрешает его только уровень Privileged.",

  "Pod app asks for hostPath /data/app, type Directory, mounted at /cache, and lands on Node-1. Before any container starts, the Kubelet checks the path on Node-1: Directory means a directory must already exist there, and one does.":
    "Pod app запрашивает hostPath /data/app, type Directory, с монтированием в /cache, и попадает на Node-1. Kubelet до старта любого контейнера проверяет путь на Node-1. Тип Directory значит, что каталог там уже должен быть, и он есть.",

  "The Kubelet asks containerd to create the app container with that mount, and the container starts with /data/app of Node-1 bind-mounted at /cache. It is one directory under two names: nothing is copied into the Pod.":
    "Kubelet просит containerd создать контейнер app с этим монтированием, и при старте контейнера каталог /data/app с Node-1 уже смонтирован через bind в /cache. Это один каталог под двумя именами, так что в Pod ничего не копируется.",

  "The app writes cache.db to /cache. No copy sits in between, so the file lands straight in /data/app on the Node-1 disk, where the Node sees it at once.":
    "Приложение пишет cache.db в /cache. Промежуточной копии нет, поэтому файл попадает прямо в /data/app на диске Node-1, где Node сразу его видит.",

  "The Pod has an ephemeral-storage limit of 1Gi, yet cache.db grows to 8Gi and the limit does not stop it: hostPath usage is not counted as ephemeral storage. Only the Node-1 disk fills, which can put the whole Node under disk pressure.":
    "У Pod лимит ephemeral-storage 1Gi, но cache.db растёт до 8Gi, и лимит его не останавливает, потому что потребление hostPath не учитывается как ephemeral storage. Заполняется только диск Node-1, и это может довести всю Node до нехватки диска.",

  "Pod app is deleted. The Kubelet has containerd stop the container, and its bind mount goes with it, but hostPath teardown deletes nothing, so /data/app and cache.db stay on Node-1 after the Pod is gone.":
    "Pod app удалён. Kubelet через containerd останавливает контейнер, и его bind-монтирование уходит вместе с ним, но снятие hostPath ничего не удаляет, поэтому /data/app и cache.db остаются на Node-1 и после удаления Pod.",

  "Its replacement, Pod app-2, lands on Node-2: hostPath ties no Pod to a Node. There is no /data/app on Node-2, so the Kubelet check fails with FailedMount and app-2 stays in ContainerCreating. DirectoryOrCreate would start it empty.":
    "Его замена, Pod app-2, попадает на Node-2, ведь hostPath не привязывает Pod к Node. На Node-2 нет /data/app, поэтому проверка Kubelet даёт ошибку FailedMount, и app-2 остаётся в ContainerCreating. При типе DirectoryOrCreate app-2 стартовал бы с пустым каталогом.",

  "The hostPath spec limits no path. On Node-1, /var/lib/kubelet holds the Secret volumes of its Pods and containerd.sock hands out root. So Baseline and Restricted Pod Security forbid hostPath, and only Privileged allows it, for Node agents such as log collectors.":
    "Спецификация hostPath не ограничивает путь. На Node-1 в /var/lib/kubelet лежат тома Secret её Pod, а containerd.sock даёт root. Поэтому Pod Security уровней Baseline и Restricted запрещает hostPath, а разрешает его только Privileged, для агентов Node вроде сборщиков журналов.",
};
