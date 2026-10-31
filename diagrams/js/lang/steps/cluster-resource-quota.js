// Russian for cluster-resource-quota: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "ResourceQuota and LimitRange on four admission rows and a write, where LimitRanger injects the cpu request the Pod template never named and ResourceQuota then checks the running sum against spec.hard, so the third Pod goes past the ceiling of a budget bar and is refused, and the 403 lands on the ReplicaSet that asked for that Pod":
    "ResourceQuota и LimitRange на четырёх строках admission и на строке записи, где LimitRanger подставляет cpu request, которого не было в шаблоне Pod, а ResourceQuota затем сверяет текущую сумму со spec.hard, поэтому третий Pod выходит за потолок шкалы бюджета и получает отказ, а 403 достаётся ReplicaSet, запросившему этот Pod",

  "The Pod template names no cpu, so LimitRanger rewrites the Pod here, in the one phase where the object can still be changed, and applies defaultRequest.cpu 500m. The quota relies on that injection: once a quota constrains requests.cpu, it cannot count a Pod that names neither requests nor limits.":
    "В шаблоне Pod не указан cpu, поэтому LimitRanger переписывает Pod здесь, на единственном этапе, где объект ещё можно менять, и применяет defaultRequest.cpu 500m. На этой подстановке квота и держится. Как только квота ограничивает requests.cpu, она не может посчитать Pod, где не указаны ни requests, ни limits.",

  "LimitRanger is back in the validating phase, and this time it may only refuse. It checks the request it just injected against min, max and maxLimitRequestRatio, so one plugin sits at two positions in the chain and does a different job at each.":
    "LimitRanger снова появляется на этапе validating, и на этот раз может только отказать. Плагин сверяет request, который сам только что подставил, с min, max и maxLimitRequestRatio, так что один плагин занимает в цепочке два места и на каждом делает своё.",

  "Validating webhooks and ValidatingAdmissionPolicy get their say next, calling out over HTTPS or running in process. None of them may mutate the object any more, and a single deny ends the request before the quota is ever consulted. The Admission Chain card owns this stage.":
    "Дальше слово за validating webhook и ValidatingAdmissionPolicy, которые вызываются по HTTPS или работают внутри процесса. Менять объект уже не может никто из них, и один отказ завершает запрос ещё до проверки квоты. Этот этап подробно разобран в карточке Admission Chain.",

  "ResourceQuota runs after all of them. The field spec.hard is the ceiling and status.used is the running sum, so web-1 fits because 0 plus 500m is inside requests.cpu 1, and admission itself adds that 500m to used. Pod web-2 lands the sum exactly on the ceiling. Pod web-3 would take it to 1.5, so admission answers 403 with exceeded quota.":
    "ResourceQuota выполняется после них всех. Поле spec.hard задаёт потолок, а status.used хранит текущую сумму. Pod web-1 проходит, потому что 0 плюс 500m укладывается в requests.cpu 1, и admission сам добавляет эти 500m в used. Pod web-2 доводит сумму ровно до потолка. Pod web-3 поднял бы её до 1.5, поэтому admission отвечает 403 с ошибкой exceeded quota.",

  "Only what admission passed is written. Two Pod objects reach ETCD and kubectl get pods -n team-a lists them, and there is no third object to list or to describe. The ReplicaSet asked for it, so the ReplicaSet is what hears the refusal, as a FailedCreate event and a ReplicaFailure condition.":
    "Записывается только то, что пропустил admission. В ETCD попадают два объекта Pod, и команда kubectl get pods -n team-a их показывает, а третьего объекта нет ни в списке, ни в describe. Его запрашивал ReplicaSet, поэтому именно ReplicaSet и узнаёт об отказе, через событие FailedCreate и условие ReplicaFailure.",
};
