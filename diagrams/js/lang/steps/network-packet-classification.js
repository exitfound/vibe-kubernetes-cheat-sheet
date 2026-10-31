// Russian for network-packet-classification: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Packet classification on a Node in the default iptables proxy mode. A Pod sends to one destination, and that destination alone decides which machinery takes the packet. That is because two stations stand between the Pod and the wire in a fixed order. The first is a nat table that owns the Service range 10.96.0.0/16 and rewrites a Service address to a backend Pod address. The second is a route lookup that sees only what the nat table handed on. It puts the address either in the Pod range 10.244.0.0/16, where the packet goes to the Node owning that slice with no further rewrite, or in no cluster range at all, where the default route takes it with the source rewritten to the Node IP":
    "Классификация пакетов на Node в режиме прокси iptables, режиме по умолчанию. Pod шлёт пакет на один адрес, и только этот адрес решает, какой механизм заберёт пакет. Дело в том, что между Pod и проводом в фиксированном порядке стоят две станции. Первая это таблица nat, которая владеет диапазоном Service 10.96.0.0/16 и переписывает адрес Service на адрес бэкенд-Pod. Вторая это поиск маршрута, который видит только то, что ему передала таблица nat. Поиск маршрута относит адрес либо к диапазону Pod 10.244.0.0/16, и тогда пакет без дальнейших перезаписей идёт к Node, которой принадлежит этот кусок, либо ни к одному диапазону кластера, и тогда маршрут по умолчанию забирает пакет, а источник переписывается на IP Node",

  "A packet leaves the Pod carrying one destination and naming no machinery. In the default iptables proxy mode two stations stand between the packet and the wire, in a fixed order, and only the second is a routing decision. The nat table comes first.":
    "Пакет выходит из Pod с одним адресом назначения и не называет никакого механизма. В режиме прокси iptables, включённом по умолчанию, между пакетом и проводом стоят две станции в фиксированном порядке, и только вторая из них решает маршрут. Сначала пакет попадает в таблицу nat.",

  "The destination 10.96.0.20:80 is a Service address from the Service range, and the nat table holds a rule for this address. The rule rewrites it to a backend Pod address, 10.244.2.7:8080 on Node-2.":
    "Адрес назначения 10.96.0.20:80 это адрес Service из диапазона Service, и в таблице nat есть правило для этого адреса. Правило переписывает его на адрес бэкенд-Pod, 10.244.2.7:8080 на Node-2.",

  "The route lookup reads the rewritten address, which now sits inside the Pod range, and here that range is cut into a slice per Node. So the packet goes to the Node owning 10.244.2.0/24, with no further rewrite.":
    "Поиск маршрута читает переписанный адрес, который теперь лежит в диапазоне Pod, а этот диапазон здесь нарезан по куску на каждую Node. Поэтому пакет идёт к Node, которой принадлежит 10.244.2.0/24, без дальнейших перезаписей.",

  "A packet sent straight to another Pod walks the same two stations in the same order. The nat table holds no rule for this address and passes the packet straight through, and the route lookup returns the same verdict.":
    "Пакет, отправленный прямо другому Pod, проходит те же две станции в том же порядке. В таблице nat правила для этого адреса нет, и она пропускает пакет как есть, а поиск маршрута выносит ровно тот же вердикт.",

  "1.1.1.1 falls in no cluster range, so the last resort takes it, the default route off the Node. The masquerade rules of the CNI plugin or ip-masq-agent keep the source for destinations in the non-masquerade ranges, the Pod range among them. 1.1.1.1 is in none of them, so the source becomes the Node IP.":
    "Адрес 1.1.1.1 вне всех диапазонов кластера, так что его забирает последний вариант, маршрут по умолчанию из Node. Правила маскарадинга CNI-плагина или ip-masq-agent сохраняют источник для адресов назначения из диапазонов без маскарадинга, среди них и диапазон Pod. Но 1.1.1.1 не входит ни в один, поэтому источником становится IP Node.",
};
