// Russian for network-service-types: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Kubernetes Service types as a stack: ClusterIP puts a virtual IP and Service rules in front of the backend Pods, NodePort adds a port on every Node that feeds those same rules, and LoadBalancer adds a cloud load balancer that typically feeds the Node port, while ExternalName and a headless Service skip the stack: CoreDNS answers with a CNAME or with the Pod IPs, and the client connects by itself":
    "Типы Service в Kubernetes в виде стопки, где ClusterIP ставит виртуальный IP и правила Service перед бэкенд-Pod, NodePort добавляет на каждой Node порт, ведущий в те же правила, а LoadBalancer добавляет облачный балансировщик, который обычно ведёт на этот порт Node. При этом ExternalName и headless Service обходят стопку. Для них CoreDNS возвращает CNAME или IP Pod, и клиент подключается сам",

  "ClusterIP is the base layer. The Service gets a virtual IP that works only inside the cluster, and the Service rules on every Node send traffic for it to a backend Pod. Every other proxy type is built on top of this one.":
    "ClusterIP это базовый слой. Service получает виртуальный IP, который работает только внутри кластера, а правила Service на каждой Node отправляют трафик, идущий на этот IP, в бэкенд-Pod. Все остальные типы с прокси строятся поверх ClusterIP.",

  "NodePort adds a layer on top. The Service keeps its ClusterIP and also opens port 31000 on every Node, so a client outside the cluster can reach any Node on that port. The Node port feeds the same Service rules, which pick a backend Pod.":
    "NodePort добавляет слой сверху. Service сохраняет свой ClusterIP и ещё открывает порт 31000 на каждой Node, так что клиент вне кластера может достучаться до любой Node на этом порту. Порт Node ведёт в те же правила Service, которые выбирают бэкенд-Pod.",

  "LoadBalancer adds one more layer. A cloud balancer gets the public address 203.0.113.7 for Internet clients and typically forwards to Node port 31000, into the same Service rules. Only a balancer sending straight to Pods should turn that port off.":
    "LoadBalancer добавляет ещё один слой. Облачный балансировщик получает публичный адрес 203.0.113.7 для клиентов из интернета и обычно пересылает трафик на порт 31000 на Node, то есть в те же правила Service. Отключать этот порт стоит, только если балансировщик шлёт трафик прямо в Pod.",

  "ExternalName skips the whole stack. It uses no selector and gets no ClusterIP and no proxy. The client looks up the Service name, CoreDNS answers with a CNAME to api.example.com, and the client then connects to that external host by itself.":
    "ExternalName обходит всю стопку. Такой Service не использует селектор и не получает ни ClusterIP, ни прокси. Клиент запрашивает имя Service, CoreDNS возвращает CNAME на api.example.com, и затем клиент сам подключается к этому внешнему хосту.",

  "Headless also skips the stack. With clusterIP set to None there is no virtual IP and no Service rules for it. CoreDNS answers with the Pod IPs themselves, and the client connects straight to one of the same backend Pods.":
    "Headless Service тоже обходит стопку. Когда поле clusterIP равно None, у такого Service нет ни виртуального IP, ни правил Service. CoreDNS возвращает сами IP Pod, и клиент подключается напрямую к одному из тех же бэкенд-Pod.",
};
