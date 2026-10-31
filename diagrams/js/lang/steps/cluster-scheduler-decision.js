// Russian for cluster-scheduler-decision: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Scheduler decision cycle in which a Pod is taken off the queue, four candidate Nodes are filtered and then scored, the winning choice is written through the API into ETCD, and the Kubelet on Node-4 picks the Pod up and runs it":
    "Цикл решения Scheduler, в котором Pod снят с очереди, четыре Node-кандидата отфильтрованы и затем оценены, выбор через API записан в ETCD, а Kubelet на Node-4 подхватывает Pod и запускает его",

  "A new Pod my-app-7d4-x2k9p reaches the Scheduler on its watch with spec.nodeName empty. Until that field is set, no Kubelet will start this Pod. The Scheduler pops it off the active queue and runs one scheduling cycle for it.":
    "Новый Pod my-app-7d4-x2k9p приходит к Scheduler через watch с пустым полем spec.nodeName. Пока это поле не задано, ни один Kubelet этот Pod не запустит. Scheduler снимает Pod с активной очереди и проводит для него один цикл планирования.",

  "Filter plugins test each Node against the Pod requirements, and in a large cluster they stop once enough Nodes fit. Node-1 carries a NoSchedule taint the Pod does not tolerate, and Node-2 lacks the requested memory. Both are dropped before scoring.":
    "Плагины Filter сверяют каждую Node с требованиями Pod, а в большом кластере останавливаются, как только подходящих Node набирается достаточно. На Node-1 стоит taint NoSchedule без подходящей toleration у Pod, а на Node-2 не хватает запрошенной памяти. Обе Node отсеиваются ещё до оценки.",

  "Score plugins like NodeResourcesFit, NodeAffinity and PodTopologySpread rate the surviving Nodes. Each scores a Node 0 to 100, and their weighted sum ranks the Nodes. Node-3 sums to 78, Node-4 to 92. See the Pod Priority and Preemption card.":
    "Плагины Score, например NodeResourcesFit, NodeAffinity и PodTopologySpread, оценивают оставшиеся Node. Каждый плагин оценивает Node от 0 до 100, а порядок Node задаёт взвешенная сумма этих оценок. У Node-3 эта сумма равна 78, а у Node-4 92. Подробнее в карточке Pod Priority and Preemption.",

  "Highest score wins, a tie is broken at random. The Scheduler assumes the Pod on Node-4 and counts its requests for the next Pod. Then it POSTs a Binding to the binding subresource, not a Pod patch. The API sets the Pod spec.nodeName in ETCD, and ETCD acks the Raft commit.":
    "Побеждает наибольшая сумма, ничья решается случайно. Scheduler заранее считает Pod размещённым на Node-4 и учитывает его requests для следующего Pod. Затем Scheduler шлёт POST с Binding в подресурс binding, а не patch Pod. API записывает в ETCD поле spec.nodeName у Pod, и ETCD подтверждает коммит Raft.",

  "The Kubelet on Node-4 watches /api/v1/pods?fieldSelector=spec.nodeName=Node-4, so this write reaches it as an ADDED event. Then the Kubelet pulls the image and starts the containers, and the Pod goes from Pending to Running.":
    "Kubelet на Node-4 следит за /api/v1/pods?fieldSelector=spec.nodeName=Node-4, поэтому эта запись приходит к нему событием ADDED. Затем Kubelet скачивает образ и запускает контейнеры, а Pod переходит из Pending в Running.",
};
