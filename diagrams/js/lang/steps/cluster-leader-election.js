// Russian for cluster-leader-election: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Leader election via Lease with acquire, renew, expire and failover":
    "Выбор лидера через Lease с захватом, продлением, истечением и переключением",

  "All three replicas race for the Lease. The first write creates it, and the replica that sent it becomes holder. Every write after that is a compare-and-swap on resourceVersion.":
    "Все три реплики борются за Lease. Первая запись создаёт его, и реплика, отправившая её, становится holder. Каждая следующая запись идёт как compare-and-swap по resourceVersion.",

  "Only the leader runs control loops. It PUTs a fresh renewTime well inside leaseDurationSeconds (15s), and the standbys only check the Lease with a GET.":
    "Циклы управления выполняет только лидер. Он шлёт PUT со свежим renewTime задолго до истечения leaseDurationSeconds (15s), а резервные лишь проверяют Lease запросом GET.",

  "Controller-mgr-1 crashes or is partitioned. A partitioned leader stands down at its renew deadline (10s), and a standby may acquire the Lease after leaseDurationSeconds.":
    "Controller-mgr-1 падает или теряет связь. Отрезанный лидер уходит сам, когда истекает его renew deadline (10s), а резервная реплика может захватить Lease после leaseDurationSeconds.",

  "With the Lease expired, both survivors race for it again. Controller-mgr-2 wins the CAS and becomes holder, so the control loops resume there after about a lease duration.":
    "Lease истёк, и обе уцелевшие реплики снова борются за него. Controller-mgr-2 выигрывает CAS и становится holder, так что циклы управления возобновляются там примерно через срок Lease.",
};
