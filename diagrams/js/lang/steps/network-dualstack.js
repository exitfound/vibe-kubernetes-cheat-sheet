// Russian for network-dualstack: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Dual-stack IPv4 and IPv6 as two family rails running through one client, one Service and one Pod, where the Pod holds one address per family on a single eth0 and the Service one ClusterIP per family in ipFamilies order, so whichever family a client dials, it reaches the same Pod":
    "Dual-stack IPv4 и IPv6, две линии семейств через одного клиента, один Service и один Pod, где у Pod на одном eth0 по адресу каждого семейства, а у Service по ClusterIP на семейство в порядке ipFamilies, так что по какому бы семейству клиент ни подключался, он доходит до того же Pod",

  "Dual-stack is enabled cluster-wide. The API server and controller-manager take an IPv4 and an IPv6 service CIDR, the controller-manager and kube-proxy take both pod CIDRs, and the Kubelet takes a Node IP of each family unless a cloud provider picks them. The CNI has to support both. The Service and Pod still have one address each.":
    "Dual-stack включён на весь кластер. API Server и controller-manager получают service CIDR для IPv4 и для IPv6, controller-manager и kube-proxy получают оба pod CIDR, а Kubelet получает IP Node для каждого семейства, если эти адреса не выбирает облачный провайдер. Плагин CNI должен поддерживать оба семейства. У Service и Pod всё ещё по одному адресу.",

  "When a Pod is created the CNI allocates one address from each family, an IPv4 out of the v4 pod CIDR and an IPv6 out of the v6 pod CIDR. Both live on one eth0, so client and web both speak either protocol without a second interface.":
    "При создании Pod плагин CNI выделяет по адресу из каждого семейства, IPv4 из v4 pod CIDR и IPv6 из v6 pod CIDR. Оба адреса живут на одном eth0, так что оба Pod, client и web, работают по любому из протоколов без второго интерфейса.",

  "A Service with ipFamilyPolicy PreferDualStack is given one ClusterIP per family, in the order its ipFamilies list names, here IPv4 then IPv6. Where only one family exists, PreferDualStack falls back to a single ClusterIP and RequireDualStack fails the Service outright.":
    "Service с ipFamilyPolicy PreferDualStack получает по ClusterIP на семейство в порядке списка ipFamilies, здесь сначала IPv4, потом IPv6. Где есть только одно семейство, PreferDualStack обходится одним ClusterIP, а с RequireDualStack создание Service и вовсе завершается ошибкой.",

  "A client resolving the Service gets an A record and an AAAA record, and which one it dials is its own choice. Both work: the v4 ClusterIP over IPv4 and the v6 ClusterIP over IPv6, each rewritten to the Pod address of that family, and both land on the same Pod.":
    "Клиент, разрешая имя Service, получает запись A и запись AAAA, и по какой подключаться, решает сам. Работают оба адреса, v4 ClusterIP по IPv4 и v6 ClusterIP по IPv6. Каждый переписывается на адрес Pod своего семейства, и оба ведут в один и тот же Pod.",
};
