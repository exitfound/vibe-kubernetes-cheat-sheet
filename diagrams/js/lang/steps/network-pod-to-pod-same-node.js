// Russian for network-pod-to-pod-same-node: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Pod-to-Pod traffic on the same Node: both Pods draw from one podCIDR, so the destination is on-link. ARP resolves the destination MAC through the cni0 bridge, which records the port the answer came in on. The data frame is then switched out that one port at layer 2, and no NAT and no encapsulation touch it":
    "Трафик между Pod на одной Node: оба Pod получают адреса из одного podCIDR, поэтому адрес назначения доступен напрямую. ARP находит MAC получателя через мост cni0, который запоминает порт, с которого пришёл ответ. Затем кадр с данными коммутируется на уровне 2 ровно в этот порт, и кадра не касаются ни NAT, ни инкапсуляция",

  "With the bridge plugin, both Pods draw from the Node subnet 10.244.1.0/24, so B is on-link. The route to B carries no gateway: the frame goes straight onto the wire, with no router in between. What A still lacks is the MAC behind 10.244.1.6.":
    "С плагином bridge оба Pod получают адреса из подсети Node 10.244.1.0/24, поэтому B доступен напрямую. Маршрут до B идёт без шлюза, так что кадр уходит прямо в канал, без маршрутизатора на пути. Чего A ещё не знает, так это MAC для 10.244.1.6.",

  "A broadcasts an ARP request out eth0 asking who holds 10.244.1.6. The veth peer hands it to cni0 (the Node Linux bridge). The bridge learns the port A sits on and floods the request out every port but that one. B answers with a unicast reply carrying its MAC, and as that reply crosses cni0 the bridge learns the port B sits on too.":
    "A шлёт через eth0 широковещательный ARP-запрос, спрашивая, у кого 10.244.1.6. Парный конец veth передаёт запрос в cni0 (Linux-мост Node). Мост запоминает порт, за которым стоит A, и рассылает запрос во все порты, кроме этого. B отвечает unicast-ответом со своим MAC, и пока ответ проходит через cni0, мост запоминает и порт B.",

  "The MAC for B is known and the port of B is in the forwarding table, so A sends the data frame as a unicast. It crosses the veth onto cni0, which now switches it out that one port instead of flooding. This is plain layer 2 forwarding inside the Node, so the packet never touches the physical NIC.":
    "MAC для B известен, а порт B есть в таблице пересылки, поэтому A отправляет кадр с данными как unicast. Кадр проходит по veth на cni0, который теперь коммутирует его ровно в этот порт, а не рассылает во все. Это обычная пересылка на уровне 2 внутри Node, поэтому пакет так и не касается физического NIC.",

  "B receives the packet with the source IP of A intact. Traffic to a Pod IP on this Node is never rewritten: no SNAT, no DNAT, no overlay encapsulation, just one bridge hop between two veth ports. Every Pod IP is routable cluster-wide, which is the flat-network promise.":
    "B получает пакет, где IP источника по-прежнему адрес A. Трафик к IP Pod на этой Node никогда не переписывается, то есть нет ни SNAT, ни DNAT, ни инкапсуляции overlay, лишь один переход через мост между двумя портами veth. Каждый IP Pod маршрутизируется по всему кластеру, это и есть обещание плоской сети.",
};
