// Russian for cluster-node-pressure-eviction: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Node-pressure eviction: detect, condition, rank, evict, relieve":
    "Вытеснение при нехватке ресурсов на Node: обнаружение, условие, ранжирование, вытеснение и возврат в норму",

  "Kubelet derives memory.available from cAdvisor stats as capacity minus the working set, and it has dropped to 500Mi. The eviction manager polls these stats every 10s, compares them against the --eviction-hard thresholds and finds one breached.":
    "Kubelet вычисляет memory.available по статистике cAdvisor как capacity минус working set, и это значение упало до 500Mi. Eviction manager опрашивает эту статистику каждые 10s, сравнивает её с порогами --eviction-hard и находит, что один из них нарушен.",

  "Kubelet PATCHes Node.status.conditions: MemoryPressure flips from False to True. The control plane turns this into a NoSchedule taint (node.kubernetes.io/memory-pressure), so Pods that do not tolerate it can no longer be scheduled here. Being Burstable or Guaranteed does not exempt a Pod: by default no QoS class gets a memory-pressure toleration.":
    "Kubelet шлёт PATCH в Node.status.conditions, и условие MemoryPressure меняется с False на True. Control Plane превращает это изменение в taint NoSchedule (node.kubernetes.io/memory-pressure), поэтому Pod без toleration к этому taint здесь больше не разместить. Класс Burstable или Guaranteed не спасает Pod, ведь по умолчанию ни один класс QoS не получает toleration для memory-pressure.",

  "Eviction manager ranks running Pods by three things in order: whether each is using more of the starved resource than it requested, then Pod Priority, then how far over the request it sits. QoS class does not decide that order and only estimates it, because the class comes from declared requests and limits while the ranking reads live usage. See the Pod QoS Classes card.":
    "Eviction manager ранжирует работающие Pod по трём признакам в таком порядке. Сначала важно, расходует ли Pod дефицитный ресурс сверх запрошенного, затем Pod Priority, а затем то, насколько Pod превышает свой request. Класс QoS этот порядок не задаёт, а лишь примерно его предсказывает, потому что класс берётся из заявленных requests и limits, а ранжирование смотрит на текущее потребление. Подробнее в карточке Pod QoS Classes.",

  "Kubelet evicts the BestEffort Pod itself, not through the Eviction API, so no PodDisruptionBudget is consulted. Under a hard threshold the spec terminationGracePeriodSeconds is ignored and each container gets only a 2s stop window before SIGKILL, not the 30s default. The Pod is set to phase Failed, reason Evicted, with a DisruptionTarget condition, and reported to the API.":
    "Kubelet вытесняет Pod класса BestEffort сам, а не через Eviction API, поэтому PodDisruptionBudget никто не проверяет. При жёстком пороге terminationGracePeriodSeconds из spec игнорируется, и каждый контейнер получает лишь 2s на остановку до SIGKILL, а не 30s по умолчанию. Pod получает статус Failed с reason Evicted и условие DisruptionTarget, а Kubelet сообщает об этом в API.",

  "Memory frees up and memory.available climbs back above the threshold. After --eviction-pressure-transition-period (default 5m) of staying clear, Kubelet flips MemoryPressure back to False. Scheduling resumes for new Pods.":
    "Память освобождается, и memory.available снова поднимается выше порога. Когда порог не нарушается весь период --eviction-pressure-transition-period (по умолчанию 5m), Kubelet возвращает MemoryPressure в False, и планирование новых Pod возобновляется.",
};
