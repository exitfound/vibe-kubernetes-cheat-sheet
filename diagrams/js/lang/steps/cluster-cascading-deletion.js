// Russian for cluster-cascading-deletion: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "A cascading delete through finalizers, in which the object is stamped rather than removed, the Garbage collector walks ownerReferences down to the Pod on a Node, and the finalizers clear back up the chain before the records leave ETCD":
    "Каскадное удаление через finalizers, при котором объект помечается, а не удаляется, Garbage collector проходит по ownerReferences вниз до Pod на Node, а finalizers снимаются обратно вверх по цепочке, прежде чем записи уйдут из ETCD",

  "You run \"kubectl delete deployment my-app --cascade=foreground\". The client sends an HTTP DELETE to /apis/apps/v1/.../deployments/my-app on the API with propagationPolicy=Foreground in the request body.":
    "Вы запускаете «kubectl delete deployment my-app --cascade=foreground». Клиент отправляет в API HTTP DELETE на /apis/apps/v1/.../deployments/my-app с propagationPolicy=Foreground в теле запроса.",

  "The API does not remove the object but sets metadata.deletionTimestamp and adds the foregroundDeletion finalizer. Then it commits this to ETCD via Raft at rv=843. The Deployment still exists in cluster state, now marked for deletion.":
    "API не удаляет объект, а ставит metadata.deletionTimestamp и добавляет finalizer foregroundDeletion. Затем API через Raft фиксирует это изменение в ETCD с rv=843. Deployment всё ещё есть в состоянии кластера, но теперь помечен на удаление.",

  "ETCD acks the committed write back to the API, and the API returns HTTP 200 OK to kubectl with the stamped object in the body. The call has returned, but kubectl waits by default until the object is gone, and most of the deletion is still ahead.":
    "ETCD сообщает API, что запись зафиксирована, и API отправляет утилите kubectl ответ HTTP 200 OK с помеченным объектом в теле. Вызов завершён, но kubectl по умолчанию ждёт, пока объект не исчезнет, а большая часть удаления ещё впереди.",

  "The API broadcasts a MODIFIED event for the Deployment to its watchers. The Deployment controller sees the deletionTimestamp and stops issuing rollouts. The Garbage collector walks the ownerReferences and DELETEs ReplicaSet my-app-7d4 in foreground, then Pod my-app-7d4-x2k9p of that ReplicaSet. Each gets a deletionTimestamp but is not removed from ETCD yet.":
    "API рассылает событие MODIFIED для Deployment всем своим подписчикам watch. Контроллер Deployment видит deletionTimestamp и перестаёт запускать rollout. Garbage collector проходит по ownerReferences и отправляет DELETE для ReplicaSet my-app-7d4 в режиме foreground, затем для Pod my-app-7d4-x2k9p этого ReplicaSet. Каждый из них получает deletionTimestamp, но из ETCD пока не удаляется.",

  "The Kubelet on Node-1 has a filtered watch for Pods bound to it. The API streams a MODIFIED event for my-app-7d4-x2k9p carrying its new deletionTimestamp down that watch to Node-1, and the Kubelet starts terminating the Pod.":
    "У Kubelet на Node-1 есть отфильтрованный watch на привязанные к ней Pod. API присылает по этому watch на Node-1 событие MODIFIED для my-app-7d4-x2k9p с новым deletionTimestamp, и Kubelet начинает завершать этот Pod.",

  "The terminationGracePeriodSeconds budget (30s by default) started when the Pod was stamped. The container gets SIGQUIT, the STOPSIGNAL the nginx image sets, or SIGTERM otherwise. SIGKILL comes only if the container outlives the timer. Once it stops, the Kubelet sets the terminal phase and sends a DELETE with grace 0. The Graceful Pod Shutdown card covers the budget.":
    "Отсчёт бюджета terminationGracePeriodSeconds (по умолчанию 30s) начался, когда Pod был помечен. Контейнер получает SIGQUIT, ведь этот STOPSIGNAL задаёт образ nginx, а иначе пришёл бы SIGTERM. Сигнал SIGKILL придёт, только если контейнер переживёт таймер. Когда контейнер остановится, Kubelet выставляет конечный статус Pod и отправляет DELETE с grace 0. Этот бюджет разобран в карточке Graceful Pod Shutdown.",

  "The grace 0 DELETE removes the Pod record from ETCD. With no Pod left under it, the Garbage collector clears the foregroundDeletion finalizer off the ReplicaSet, then off the Deployment, and as each list empties the API removes that record too. The Deployment goes last, at rv=856. That completes the step 1 delete by kubectl, so kubectl stops waiting.":
    "DELETE с grace 0 удаляет запись Pod из ETCD. Когда под ReplicaSet не осталось Pod, Garbage collector снимает finalizer foregroundDeletion с ReplicaSet, затем с Deployment, и как только у каждого из них пустеет список finalizers, API удаляет и его запись. Deployment уходит последним, на rv=856. Так завершается удаление, отправленное kubectl на шаге 1, а значит, kubectl перестаёт ждать.",
};
