// Russian for cluster-oom-kill: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Container OOMKill: cgroup memory.max, kernel cgroup OOM killer, Kubelet observation via PLEG, restart":
    "OOMKill контейнера: cgroup memory.max, OOM killer ядра в пределах cgroup, Kubelet замечает это через PLEG, перезапуск",

  "The workload grows, and memory.current keeps rising toward memory.max as the container allocates anonymous pages, page cache, and slab. The cgroup memory controller charges that usage against the limit.":
    "Рабочая нагрузка растёт, и memory.current продолжает подниматься к memory.max, пока контейнер выделяет анонимные страницы, page cache и slab. Контроллер памяти cgroup засчитывает это потребление в limit.",

  "Usage in memory.current reaches memory.max. The cgroup memory controller cannot reclaim enough (swap is disabled on most Kubernetes Nodes), so the kernel raises an out-of-memory event scoped to this one cgroup.":
    "Потребление в memory.current доходит до memory.max. Контроллер памяти cgroup не может освободить достаточно памяти (на большинстве Node Kubernetes swap выключен), поэтому ядро создаёт событие out-of-memory в пределах одной этой cgroup.",

  "Reclaim has failed at memory.max, so the kernel invokes the cgroup-scoped OOM killer. Under cgroup v2 the runtime set memory.oom.group on that cgroup at container start by default, so the kernel SIGKILLs every process in the container as one unit rather than the single worst offender. With the whole cgroup going, the oom_score_adj applied from the QoS class decides nothing here. It ranks containers when a wider scope runs out, the Pod cgroup or the whole Node.":
    "Освободить память на memory.max не удалось, поэтому ядро вызывает OOM killer в пределах cgroup. В cgroup v2 среда выполнения по умолчанию выставляет для этой cgroup memory.oom.group при старте контейнера, так что ядро шлёт SIGKILL всем процессам контейнера разом, а не одному худшему нарушителю. Раз уходит вся cgroup, значение oom_score_adj, выставленное по классу QoS, здесь ничего не решает. Оно ранжирует контейнеры, когда память кончается на уровне выше, то есть в cgroup Pod или на всей Node.",

  "PLEG (Pod Lifecycle Event Generator) spots the dead container on its next relist of the container runtime. Kubelet PATCHes the container status to terminated with reason OOMKilled and exitCode 137 (128 + 9 for SIGKILL). Where that record goes once the container restarts is covered in the Container Restarts and lastState card.":
    "PLEG (Pod Lifecycle Event Generator) замечает мёртвый контейнер при следующем relist среды выполнения. Kubelet шлёт PATCH, переводя статус контейнера в terminated с reason OOMKilled и exitCode 137 (128 + 9, где 9 это SIGKILL). Куда попадает эта запись после перезапуска контейнера, разбирает карточка Container Restarts and lastState.",

  "The restartPolicy is Always (the default), so Kubelet starts a fresh container in the same Pod sandbox. The Pod IP and the sandbox namespaces are kept and restartCount increments. Repeated OOMKills trip CrashLoopBackOff, and the backoff behind it is covered in the CrashLoopBackOff and Restart Backoff card.":
    "Поле restartPolicy равно Always (по умолчанию), поэтому Kubelet запускает новый контейнер в том же sandbox Pod. IP Pod и пространства имён sandbox сохраняются, а restartCount растёт. Повторные OOMKill приводят к CrashLoopBackOff, а backoff за ним разбирает карточка CrashLoopBackOff and Restart Backoff.",
};
