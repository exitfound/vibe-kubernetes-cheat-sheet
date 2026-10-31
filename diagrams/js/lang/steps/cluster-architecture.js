// Russian for cluster-architecture: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Kubernetes cluster architecture, where the API, ETCD, the controller-manager, the cloud-controller-manager and the Scheduler run in the control plane, and the Kubelet and kube-proxy run on Node-1, each watching the API for itself, with the Kubelet driving the Runtime over CRI":
    "Архитектура кластера Kubernetes, в которой API, ETCD, controller-manager, cloud-controller-manager и Scheduler работают в Control Plane, а Kubelet и kube-proxy работают на Node-1 и каждый сам следит за API. Kubelet при этом управляет Runtime через CRI",

  "The API is the only way in for clients and controllers. Every read and every write goes through it, and a write clears authentication, authorization and admission before it is stored. Replicas are stateless and scale horizontally. One of the few paths that skip it is a static Pod, which the Kubelet reads from a local file or a URL.":
    "API служит единственной точкой входа как для клиентов, так и для контроллеров. Через него идёт каждое чтение и каждая запись, причём запись перед сохранением проходит аутентификацию, авторизацию и admission. Реплики API не хранят состояния и масштабируются горизонтально. Один из немногих путей в обход API это static Pod, и Kubelet читает такой Pod из локального файла или по URL.",

  "ETCD holds the cluster state the API serves, and in a standard cluster it has no client but the API. Every change is replicated through Raft, and a write is committed and the revision moves forward only once a quorum of replicas agrees.":
    "ETCD хранит то состояние кластера, которое API отдаёт, и в обычном кластере у ETCD нет других клиентов, кроме API. Каждое изменение реплицируется через Raft, и запись фиксируется, а revision сдвигается вперёд только после того, как с ней согласится кворум реплик.",

  "On the way back ETCD serves reads to the API, and that is a separate exchange, not the answer to that write. A watch keeps the stream open, and later changes arrive through it without another round trip. Clients watch the API and never ETCD, and the API answers them from its own cache.":
    "На обратном пути ETCD отвечает на чтения API, и это отдельный обмен, а не ответ на ту запись. Механизм watch держит поток открытым, и по нему без нового запроса приходят следующие изменения. Клиенты следят за API и никогда за ETCD, а API отвечает им из своего кеша.",

  "The controller-manager runs the built-in control loops, roughly one per resource kind (Deployment, ReplicaSet, Job and so on), plus loops shared by all kinds, like the garbage collector. Each loop watches the API, never ETCD, and writes back to reconcile observed state with desired state.":
    "Компонент controller-manager выполняет встроенные циклы управления, примерно по одному на тип ресурса (Deployment, ReplicaSet, Job и т.д.), а также общие для всех типов циклы вроде сборщика мусора. Каждый цикл следит за API, но никогда за ETCD, и пишет обратно, приводя фактическое состояние к желаемому.",

  "The cloud-controller-manager runs loops that talk to a cloud provider and handle Node lifecycle, cloud routes and Service load balancers. It is optional and a cluster on your own hardware has none. It writes what it learns to the API and is split out so provider code lives outside the core.":
    "Компонент cloud-controller-manager выполняет те циклы работы, которые общаются с облачным провайдером и отвечают за жизненный цикл Node, облачные маршруты и балансировщики для Service. Он необязателен, и в кластере на своём железе его нет. Всё, что компонент узнаёт, он пишет в API, а вынесен он отдельно, чтобы код провайдера жил вне ядра.",

  "The Scheduler watches Pods that have no Node assignment yet, filters and scores the candidates, then posts a Binding back to the API. On the ordinary path it writes nothing else to the Pod. The exception is preemption, where it also deletes lower-priority Pods to make room. The Kubelet on the chosen Node takes it from there.":
    "Scheduler следит за Pod, которым ещё не назначена Node, отсеивает и оценивает кандидатов, а затем отправляет Binding обратно в API. В обычном случае больше ничего в Pod он не пишет. Исключение составляет preemption, когда Scheduler ещё и удаляет Pod с более низким приоритетом, чтобы освободить место. Дальше дело за Kubelet на выбранной Node.",

  "The Kubelet watches the API for Pods assigned to its Node, then calls the Runtime over CRI to start their containers, and PATCHes Pod status back so the loops above have observed state to compare. Beside it kube-proxy watches the API on its own, for Services and EndpointSlices, and programs the local rules. It is optional too, and an eBPF dataplane can replace it.":
    "Kubelet следит в API за Pod, назначенными его Node, затем через CRI вызывает Runtime для запуска их контейнеров и через PATCH возвращает статус Pod, чтобы у циклов выше было фактическое состояние для сравнения. Рядом с Kubelet компонент kube-proxy сам следит за API, за Service и EndpointSlice, и настраивает локальные правила. Этот компонент тоже необязателен, и его может заменить eBPF dataplane.",
};
