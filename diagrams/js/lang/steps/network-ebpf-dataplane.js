// Russian for network-ebpf-dataplane: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "An eBPF dataplane can replace kube-proxy. An eBPF program at the socket hook reads a BPF Service map and rewrites the connection to a backend Pod at connect time, with no per-packet iptables rule walk and no DNAT":
    "Плоскость данных на eBPF может заменить kube-proxy. Программа eBPF на хуке сокета читает BPF map с Service и в момент connect переписывает соединение на бэкенд-Pod, без обхода правил iptables для каждого пакета и без DNAT",

  "Rather than relying on iptables Service rules, the CNI agent attaches small eBPF programs directly to kernel hooks, at the socket layer and on the network interfaces. A connection that takes this path traverses no Service rule chain.":
    "Вместо правил Service в iptables агент CNI подключает небольшие eBPF-программы прямо к хукам ядра, на уровне сокетов и на сетевых интерфейсах. Соединение на этом пути не проходит ни одной цепочки правил Service.",

  "Service and endpoint state lives in BPF maps, kept in sync from the API by the agent. A lookup of 10.96.0.20 returns the backend set, here 10.244.2.7 and 10.244.3.9, as a constant-time hash lookup no matter how many Services exist.":
    "Состояние Service и эндпоинтов хранится в BPF maps, и агент синхронизирует его из API. Поиск адреса 10.96.0.20 по хешу за постоянное время возвращает набор бэкендов, здесь 10.244.2.7 и 10.244.3.9, сколько бы ни было Service.",

  "When the client calls connect to the ClusterIP, the socket-level eBPF program looks the address up in the map and rewrites the destination to a chosen Pod right there, before the packet is even built. This is connect-time load balancing, not per-packet DNAT.":
    "Когда клиент вызывает connect к ClusterIP, eBPF-программа на уровне сокета ищет адрес в map и тут же переписывает адрес назначения на выбранный Pod, ещё до того как собран пакет. Это балансировка в момент connect, а не DNAT каждого пакета.",

  "The connection then goes straight to the Pod address, 10.244.2.7, carrying the client source IP unchanged. Because the socket was already connected to that backend, the packet needs no DNAT on the way out and no connection-tracking reversal on the way back.":
    "Дальше соединение идёт прямо на адрес Pod, 10.244.2.7, с неизменным IP клиента в источнике. Сокет уже подключён к этому бэкенду, поэтому пакету не нужны ни DNAT на выходе, ни обратная трансляция conntrack на пути назад.",

  "Because the agent implements Services with eBPF programs and maps, kube-proxy and its iptables chains can be removed entirely, which Cilium offers, as does Calico in its eBPF mode. Lookups stay constant-time as the cluster grows to thousands of Services.":
    "Агент реализует Service на eBPF-программах и maps, поэтому kube-proxy и его цепочки iptables можно убрать полностью. Такую возможность даёт Cilium, а также Calico в режиме eBPF. Время поиска остаётся постоянным, по мере того как кластер растёт до тысяч Service.",
};
