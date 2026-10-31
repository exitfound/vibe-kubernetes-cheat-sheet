// Russian for network-pod-to-pod-cross-node: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Pod-to-Pod traffic across Nodes: the source Node routes the off-subnet packet to its CNI dataplane, which in overlay mode wraps it in VXLAN over UDP and ships it across the physical underlay to the remote Node, whose kernel decapsulates it and delivers it into the local Pod. A routed BGP mode is shown as the no-encapsulation alternative":
    "Трафик между Pod на разных Node: исходная Node направляет пакет для другой подсети в свою плоскость данных CNI, которая в режиме overlay заворачивает его в VXLAN поверх UDP и отправляет через физическую underlay-сеть на удалённую Node. Ядро удалённой Node распаковывает пакет и доставляет в локальный Pod. Маршрутизируемый режим BGP показан как вариант без инкапсуляции",

  "Pod A sends to 10.244.2.7 out its eth0. The frame rides the veth into the Node-1 network stack, which consults its routing table. The destination is not in the local Pod subnet, so the route hands the frame to the CNI dataplane that carries off-Node traffic.":
    "Pod A отправляет пакет на 10.244.2.7 через свой eth0. Кадр по veth попадает в сетевой стек Node-1, который смотрит в свою таблицу маршрутизации. Адрес назначения не в локальной подсети Pod, поэтому маршрут передаёт кадр в плоскость данных CNI, которая несёт трафик за пределы Node.",

  "In overlay mode the CNI dataplane wraps the original frame inside a VXLAN header carried over UDP to the Node-2 address. The outer IP header carries Node IPs the physical network already knows how to route. For flannel the UDP dport defaults to 8472, and the inner Pod IPs ride untouched. The wrapped packet crosses the underlay to Node-2.":
    "В режиме overlay плоскость данных CNI заворачивает исходный кадр в заголовок VXLAN, который идёт поверх UDP на адрес Node-2. Во внешнем IP-заголовке стоят IP Node, которые физическая сеть уже умеет маршрутизировать. У flannel UDP dport по умолчанию равен 8472, а внутренние IP Pod остаются нетронутыми. Обёрнутый пакет идёт через underlay до Node-2.",

  "Node-2 receives the UDP packet on the VXLAN port and its kernel strips the outer headers. The bare inner frame, still addressed to 10.244.2.7, is routed out of the local dataplane and over the veth into Pod B, the same last hop a same-node frame takes.":
    "Node-2 принимает UDP-пакет на порту VXLAN, и её ядро снимает внешние заголовки. Голый внутренний кадр, по-прежнему адресованный 10.244.2.7, маршрутизируется из локальной плоскости данных по veth в Pod B. Последний шаг тот же, что у кадра внутри одной Node.",

  "Not every CNI encapsulates. A routed plugin such as Calico with BGP advertises the Pod subnet of each Node to its BGP peers, so the packet crosses the underlay carrying its real Pod IPs with no outer headers at all. It travels Pod A to Pod B in one routed path. This drops the encapsulation cost and the MTU overhead, at the price of an underlay that has to be aware of Pod IPs.":
    "Инкапсулирует не каждый CNI. Маршрутизируемый плагин вроде Calico с BGP анонсирует своим BGP-пирам подсеть Pod каждой Node, поэтому пакет идёт через underlay с настоящими IP Pod и вовсе без внешних заголовков. От Pod A до Pod B пакет проходит одним маршрутизируемым путём. Так уходят затраты на инкапсуляцию и накладные расходы MTU, но взамен underlay должна знать IP Pod.",
};
