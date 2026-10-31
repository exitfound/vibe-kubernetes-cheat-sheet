// Russian for cluster-node-failure: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Node failure and eviction: Lease heartbeat lost, Ready flips to Unknown, then a NoExecute taint, a taint-eviction delete, a reschedule":
    "Отказ Node и вытеснение: heartbeat через Lease пропал, Ready становится Unknown, затем taint NoExecute, удаление через taint-eviction и новое планирование",

  "Kubelet on Node-1 proves liveness with two heartbeats. It renews its Lease in kube-node-lease every 10s and PATCHes Node.status when it changes or else every 5 min. The node-lifecycle-controller counts either as a sign of life, but the Lease renewal is the one that lands well inside its 50s grace period.":
    "Kubelet на Node-1 подтверждает, что жив, двумя heartbeat. Он продлевает свой Lease в kube-node-lease каждые 10s и шлёт PATCH Node.status, когда статус меняется, а иначе раз в 5 min. Контроллер node-lifecycle-controller считает признаком жизни любой из них, но с большим запасом в его grace period 50s укладывается именно продление Lease.",

  "The Kubelet on Node-1 stops renewing (kernel panic, network partition, or Kubelet crash). The Lease grows stale, but the Pods on the Node still show Running for now.":
    "Kubelet на Node-1 перестаёт продлевать Lease (kernel panic, разрыв сети или падение Kubelet). Lease устаревает, но Pod на Node пока по-прежнему числятся в Running.",

  "After --node-monitor-grace-period (default 50s), the node-lifecycle-controller flips Ready from True to Unknown: it cannot tell whether Node-1 died or is just unreachable. Pods are still on the Node, and eviction has not started.":
    "Когда истекает срок --node-monitor-grace-period (по умолчанию 50s), контроллер node-lifecycle-controller меняет Ready с True на Unknown, потому что не может понять, умерла ли Node-1 или просто недоступна. Pod всё ещё на Node, и вытеснение пока не началось.",

  "The node-lifecycle-controller adds the taint node.kubernetes.io/unreachable:NoExecute. Kubernetes had already given this Pod a 300s toleration for it, which it does for any Pod that does not set one itself. DaemonSet Pods set theirs with no tolerationSeconds, so this never evicts them. The 300s now ticks down.":
    "Контроллер node-lifecycle-controller добавляет taint node.kubernetes.io/unreachable:NoExecute. Kubernetes заранее дал этому Pod toleration к такому taint на 300s, как и любому Pod, который не задал её сам. Pod DaemonSet задают собственную toleration без tolerationSeconds, поэтому этот taint их никогда не вытесняет. Теперь пошёл отсчёт 300s.",

  "The toleration expires. The taint-eviction-controller marks the Pod with a DisruptionTarget condition, then deletes the Pod with a plain DELETE that bypasses PodDisruptionBudgets (unlike kubectl drain, which uses the PDB-aware Eviction API). The Pod gets a deletionTimestamp and sits in Terminating: the unreachable Node-1 may still run the container, and the entry clears only when the Kubelet answers, the Node object is deleted, or someone forces it.":
    "Срок toleration истекает. Контроллер taint-eviction-controller ставит этому Pod условие DisruptionTarget, а затем удаляет сам Pod простым DELETE в обход PodDisruptionBudget (в отличие от kubectl drain, который использует Eviction API с учётом PDB). Pod получает deletionTimestamp и остаётся в Terminating, ведь на недоступной Node-1 контейнер может всё ещё работать. Запись о Pod исчезнет, только когда Kubelet ответит, объект Node удалят или кто-то удалит Pod принудительно.",

  "The owning ReplicaSet (of a Deployment) sees the missing replica and creates a replacement Pod. Scheduler picks the healthy Node-2 and Kubelet there starts it. End-to-end recovery takes about 50s plus 300s by default, the grace period plus the toleration.":
    "ReplicaSet этого Pod, созданный Deployment, видит, что реплики не хватает, и создаёт Pod на замену. Scheduler выбирает исправную Node-2, и Kubelet на ней запускает этот Pod. Всё восстановление по умолчанию занимает около 50s плюс 300s, то есть grace period плюс toleration.",
};
