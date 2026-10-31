// Russian for cluster-object-create-path: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "The object create path, where a manifest travels from the client through the control plane to the Kubelet on a Node, and the Kubelet calls the Runtime to start the container":
    "Путь создания объекта, где манифест идёт от клиента через Control Plane к Kubelet на Node, а тот вызывает Runtime, чтобы запустить контейнер",

  "You run kubectl apply -f deploy.yaml. The client serializes the manifest as JSON and POSTs it to /apis/apps/v1/namespaces/default/deployments on the API. If the object already exists, the client sends a three-way merge PATCH instead, and Server-side Apply is the same PATCH under its own content type.":
    "Вы запускаете kubectl apply -f deploy.yaml. Клиент сериализует манифест в JSON и отправляет POST на /apis/apps/v1/namespaces/default/deployments в API. Если же объект уже существует, клиент вместо этого шлёт PATCH с трёхсторонним слиянием, а Server-side Apply это тот же PATCH со своим content type.",

  "The API authenticates you from your kubeconfig, checks RBAC, runs admission and schema validation, then writes the new Deployment my-app to ETCD. ETCD commits the write via Raft quorum at rv=842.":
    "API аутентифицирует вас по kubeconfig, проверяет RBAC, выполняет admission и проверку по схеме, а затем записывает новый Deployment my-app в ETCD. ETCD фиксирует эту запись через кворум Raft на rv=842.",

  "ETCD tells the API that the write is committed at rv=842, and the API returns HTTP 201 Created to the kubectl client. The Deployment now exists in cluster state, but no Pods have been created yet.":
    "ETCD сообщает API, что запись зафиксирована на rv=842, и API возвращает клиенту kubectl HTTP 201 Created. Теперь Deployment есть в состоянии кластера, однако ни одного Pod ещё не создано.",

  "The Deployment controller, inside the controller-manager, sees my-app via its watch on the API and creates a ReplicaSet (my-app-7d4). The ReplicaSet controller sees my-app-7d4 on its own watch and creates a Pod (my-app-7d4-x2k9p) with no nodeName yet. No controller calls another.":
    "Контроллер Deployment внутри controller-manager видит my-app через свой watch на API и создаёт ReplicaSet (my-app-7d4). Контроллер ReplicaSet замечает my-app-7d4 через собственный watch и создаёт Pod (my-app-7d4-x2k9p) пока без поля nodeName. При этом ни один контроллер не вызывает другой.",

  "The Scheduler picks up my-app-7d4-x2k9p, filters candidate Nodes (taints, resources, affinity), scores the survivors on free resources and topology spread, then posts a Binding that pins the Pod to Node-1. That write goes through the API into ETCD like the first one.":
    "Scheduler подхватывает my-app-7d4-x2k9p, фильтрует Node-кандидаты (taints, ресурсы, affinity), оценивает оставшиеся по свободным ресурсам и topology spread, а затем отправляет Binding, закрепляющий Pod за Node-1. Эта запись идёт через API в ETCD так же, как и первая.",

  "The Kubelet on Node-1 has a filtered watch on /api/v1/pods?fieldSelector=spec.nodeName=Node-1. The API streams my-app-7d4-x2k9p down that watch to Node-1, and there the Kubelet picks the Pod up.":
    "У Kubelet на Node-1 открыт watch с фильтром /api/v1/pods?fieldSelector=spec.nodeName=Node-1. По этому потоку API шлёт my-app-7d4-x2k9p на Node-1, и там Kubelet подхватывает этот Pod.",

  "The Kubelet drives the Runtime over CRI, one call at a time. It asks first for a Pod sandbox, which gives the Pod its network namespace and IP, then for the nginx:1.30 image, then for the container to start in that sandbox. The Pod my-app-7d4-x2k9p is now Running on Node-1.":
    "Kubelet управляет Runtime через CRI, вызов за вызовом. Сначала Kubelet просит sandbox, дающий Pod сетевое пространство имён и IP, затем образ nginx:1.30, а потом запуск контейнера в этом sandbox. Теперь Pod my-app-7d4-x2k9p в статусе Running на Node-1.",
};
