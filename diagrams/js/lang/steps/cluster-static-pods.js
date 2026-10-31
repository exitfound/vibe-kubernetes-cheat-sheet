// Russian for cluster-static-pods: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "The Kubelet runs a static Pod from a manifest file on the Node with no Scheduler and no owner, mirrors it into the API as a mirror Pod, a read-only record, puts that record back when kubectl deletes it, replaces the Pod and its mirror when the file changes, and carries the static Pod through a drain":
    "Kubelet запускает static Pod из файла манифеста на Node без Scheduler и без владельца, отражает этот Pod в API как mirror Pod, запись только для чтения, возвращает эту запись после удаления через kubectl, заменяет Pod и его mirror при изменении файла и проводит static Pod через drain",

  "A Pod manifest appears in the directory the Kubelet watches on Node-1, named by staticPodPath in the KubeletConfiguration and conventionally /etc/kubernetes/manifests. The Kubelet rescans it and reads every file whose name does not start with a dot.":
    "Манифест Pod появляется в каталоге, за которым Kubelet следит на Node-1. Каталог задан полем staticPodPath в KubeletConfiguration, обычно это /etc/kubernetes/manifests. Kubelet заново сканирует каталог и читает каждый файл, имя которого не начинается с точки.",

  "The Kubelet starts the container itself. No Scheduler placed this Pod and no controller owns it, so the Kubelet supervises it directly and restarts it when it fails. That is how a kubeadm control plane comes up: the API server, the controller-manager and the Scheduler run as static Pods, and so does ETCD in the default stacked topology.":
    "Kubelet сам запускает контейнер. Scheduler этот Pod не размещал, и ни один контроллер им не владеет, поэтому Kubelet присматривает за ним напрямую и перезапускает при сбое. Так поднимается Control Plane в kubeadm, где API Server, controller-manager и Scheduler работают как static Pod, а в топологии по умолчанию, stacked, ещё и ETCD.",

  "The Kubelet also creates a mirror Pod in the API for it, so kubectl get pods lists it like any other Pod. The name takes the Node name as a suffix, the kubernetes.io/config.mirror annotation marks it, and the labels on the file are copied across so selectors match it.":
    "Kubelet также создаёт в API mirror Pod для static Pod, так что kubectl get pods показывает его как любой другой Pod. Имя mirror Pod получает суффикс с именем Node, аннотация kubernetes.io/config.mirror помечает этот Pod, а метки из файла копируются, чтобы mirror Pod находили селекторы.",

  "Deleting the mirror Pod with kubectl removes only the API object, and nothing done to the object reaches the container. The container on Node-1 keeps running because the Kubelet reads the file on disk. On its next sync loop pass the Kubelet puts the mirror back.":
    "Удаление mirror Pod через kubectl убирает только объект API, и ничто, сделанное с объектом, до контейнера не доходит. Контейнер на Node-1 продолжает работать, потому что Kubelet читает файл на диске. А при следующем проходе цикла синхронизации Kubelet вернёт mirror на место.",

  "To change a static Pod you change its file. When the Kubelet picks up the edit it stops the old Pod, then replaces the mirror Pod to match and starts a new Pod from the new spec. Moving the file out of the directory removes the Pod. The spec cannot refer to other API objects such as a ConfigMap, a Secret or a ServiceAccount, so what those objects would hold comes off the file or the Node filesystem.":
    "Чтобы изменить static Pod, меняют его файл. Когда Kubelet замечает правку, он останавливает старый Pod, затем заменяет mirror Pod под новую версию и запускает новый Pod с новой spec. Если убрать файл из каталога, Pod удаляется. В spec такого Pod нельзя сослаться на другие объекты API, например на ConfigMap, Secret или ServiceAccount, поэтому то, что хранилось бы в этих объектах, берётся из файла или с файловой системы Node.",

  "A drain evicts or deletes the Pods on Node-1 and skips every mirror Pod, because removing one through the API would stop nothing. DaemonSet Pods are left alone too, and the Node Drain card covers the rest of that loop. So a static Pod rides out a drain and a kubeadm control plane keeps serving while its Node is cordoned.":
    "Drain вытесняет или удаляет Pod на Node-1 и пропускает каждый mirror Pod, потому что его удаление через API ничего бы не остановило. Pod DaemonSet тоже не трогаются, а остальную часть этого цикла разбирает карточка Node Drain. Поэтому static Pod переживает drain, и Control Plane в kubeadm продолжает отвечать, пока его Node переведена в cordon.",
};
