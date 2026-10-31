// Russian for network-pod-egress-snat: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Pod egress to the internet: no route on the internet leads back to a Pod IP, so the last netfilter hook on the way out walks the POSTROUTING rules. There RETURN exempts a destination in a non-masquerade range (one of them covers the cluster pod CIDR) with its source unchanged, while everything else is source-NATed to the Node IP by MASQUERADE. The conntrack table stores the translated flow, and the reply that comes back to the Node IP is reversed off that stored entry as it enters the Node, without walking a masquerade rule at all":
    "Выход Pod в интернет: ни один маршрут в интернете не ведёт обратно к IP Pod, поэтому последний хук netfilter на выходе проходит правила POSTROUTING. Там правило RETURN оставляет источник без изменений для адреса назначения из диапазона без маскарадинга (один из таких диапазонов покрывает и pod CIDR кластера), а для всего остального правило MASQUERADE делает source NAT на IP Node. Таблица conntrack хранит транслированный поток, и ответ, пришедший на IP Node, при входе в Node получает обратную трансляцию по этой записи, не проходя ни одного правила маскарадинга",

  "The app opens a connection to 1.1.1.1 and the packet leaves eth0 carrying src 10.244.1.5. No route on the internet leads back to that address, so the last netfilter hook on the way out is where the Node walks its POSTROUTING rules.":
    "Приложение открывает соединение с 1.1.1.1, и пакет выходит из eth0 с src 10.244.1.5. Ни один маршрут в интернете не ведёт обратно к этому адресу, поэтому Node проходит свои правила POSTROUTING на последнем хуке netfilter на выходе.",

  "Only the first packet of a flow walks these rules, in order. RETURN rules for the non-masquerade ranges come first (one covers the pod CIDR 10.244.0.0/16), so Pod to Pod traffic keeps its source. 1.1.1.1 is in none of them, so the packet falls past RETURN to masquerade.":
    "Эти правила по порядку проходит только первый пакет потока. Сначала идут правила RETURN для диапазонов без маскарадинга (один из них покрывает pod CIDR 10.244.0.0/16), так что трафик от Pod к Pod сохраняет источник. Адрес 1.1.1.1 не входит ни в один из них, поэтому пакет к нему минует RETURN и доходит до маскарадинга.",

  "MASQUERADE rewrites the source to the address of the interface the packet leaves by, 192.168.1.20. The flow it just translated goes into conntrack, and the packet leaves looking like it came from the Node, an address the reply can be routed to.":
    "Правило MASQUERADE переписывает источник на адрес интерфейса, через который выходит пакет, то есть на 192.168.1.20. Только что транслированный поток попадает в conntrack, и пакет уходит так, будто его отправила Node, с адреса, на который можно вернуть ответ.",

  "The server never saw the Pod IP, and its reply returns to 192.168.1.20. It walks no masquerade rule at all. As it enters the Node, a conntrack lookup finds the stored entry and reverses the translation off it alone, which costs a lookup rather than a rule scan.":
    "Сервер так и не увидел IP Pod, и ответ возвращается на 192.168.1.20, не проходя ни одного правила маскарадинга. При входе в Node поиск в conntrack находит сохранённую запись и отменяет трансляцию только по ней. Это стоит одного поиска, а не прохода по правилам.",

  "With the destination restored to 10.244.1.5 the reply goes down the veth into the Pod. The Pod used its own source address the whole way. The rewrite and its reversal both happened on the Node, invisible to either end of the connection.":
    "Когда адрес назначения снова становится 10.244.1.5, ответ уходит по veth в Pod. Всё это время Pod использовал свой адрес источника. И перезапись, и её отмена произошли на Node, незаметно для обоих концов соединения.",
};
