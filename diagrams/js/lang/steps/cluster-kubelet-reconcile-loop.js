// Russian for cluster-kubelet-reconcile-loop: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Kubelet sync loop: watch, PLEG, SyncPod, CRI, status":
    "Цикл синхронизации Kubelet: watch, PLEG, SyncPod, CRI, status",

  "The API streams an ADDED event for Pod my-app-7d4-x2k9p bound to Node-1. The Kubelet merges its spec sources into one update channel, and the sync loop records the Pod in podManager as desired state.":
    "API присылает событие ADDED для Pod my-app-7d4-x2k9p, привязанного к Node-1. Kubelet сводит свои источники spec в один канал обновлений, и цикл синхронизации записывает Pod в podManager как желаемое состояние.",

  "PLEG (Pod Lifecycle Event Generator) wakes on its 1s timer, calls ListPodSandbox and ListContainers, and finds no sandbox or container for the new Pod. PLEG records the empty observed state for SyncPod. With EventedPLEG on (alpha feature gate, off by default), the runtime pushes lifecycle events over CRI, so Kubelet relists far less often.":
    "PLEG (Pod Lifecycle Event Generator) просыпается по таймеру 1s, вызывает ListPodSandbox и ListContainers и не находит ни sandbox, ни контейнера нового Pod. PLEG записывает это пустое фактическое состояние для SyncPod. Если же включить EventedPLEG (alpha feature gate, по умолчанию выключен), среда выполнения сама присылает события жизненного цикла через CRI, поэтому Kubelet делает relist гораздо реже.",

  "The sync loop queued the Pod for its Pod worker goroutine, which now calls SyncPod. SyncPod compares desired state (1 container in spec) against observed state (no sandbox, 0 containers). The diff is two actions: create the Pod sandbox, then create and start the missing container.":
    "Цикл синхронизации поставил Pod в очередь его горутины Pod worker, и теперь она вызывает SyncPod. SyncPod сравнивает желаемое состояние (1 контейнер в spec) с фактическим (нет sandbox, 0 контейнеров). Разница сводится к двум действиям: создать sandbox Pod, затем создать и запустить недостающий контейнер.",

  "Kubelet issues CRI gRPC calls in sequence. RunPodSandbox creates the pause container with shared namespaces, then PullImage fetches the image, a call imagePullPolicy can skip when the image is already on the Node. CreateContainer and StartContainer then launch each container in the spec. The Pod Sandbox via CRI card details the sandbox setup.":
    "Kubelet по очереди делает вызовы CRI gRPC. Вызов RunPodSandbox создаёт pause-контейнер с общими пространствами имён, затем PullImage скачивает образ, и imagePullPolicy может пропустить этот вызов, если образ уже есть на Node. Потом CreateContainer и StartContainer запускают каждый контейнер из spec. Настройку sandbox подробно разбирает карточка Pod Sandbox via CRI.",

  "Right after that sync the Kubelet asks PLEG to relist the Pod (beta PLEGOnDemandRelist gate, on by default), so it sees the running container without waiting for the 1s timer. Observed state catches up to desired state. SyncPod finds nothing left to create or start, and Kubelet PATCHes Pod status again, this time with the running container in containerStatuses.":
    "Сразу после этой синхронизации Kubelet просит PLEG сделать relist Pod (beta feature gate PLEGOnDemandRelist, включён по умолчанию), поэтому видит запущенный контейнер, не дожидаясь таймера 1s. Фактическое состояние догоняет желаемое. SyncPod уже не находит, что ещё создать или запустить, и Kubelet снова отправляет PATCH статуса Pod, на этот раз с запущенным контейнером в containerStatuses.",
};
