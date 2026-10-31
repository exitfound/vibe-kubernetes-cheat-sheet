// Russian for network-service-clusterip: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "ClusterIP via kube-proxy: kube-proxy watches the Service and its EndpointSlices on the API server and writes rules into the Node dataplane but never forwards a packet, the client sends to a virtual ClusterIP that no Pod or single host owns, the dataplane DNATs the packet to one of two symmetric backing Pods, conntrack rewrites the reply so the client never sees the Pod address, and a second connection may land on the other Pod and is pinned there":
    "ClusterIP через kube-proxy, который следит за Service и его EndpointSlice в API Server и пишет правила в плоскость данных Node, но сам никогда не пересылает пакеты. Клиент шлёт пакет на виртуальный ClusterIP, которым не владеет ни один Pod и ни один отдельный хост, плоскость данных делает DNAT этого пакета на один из двух симметричных Pod за Service, а conntrack переписывает ответ, поэтому клиент никогда не видит адрес Pod. Второе соединение может попасть на другой Pod и закрепляется там",

  "The ClusterIP is a field of the Service web, stored in the API server. No Pod holds 10.96.0.20 and no single host answers for it, and in the default iptables mode no interface carries it at all.":
    "ClusterIP это поле Service web, и хранится оно в API Server. Адрес 10.96.0.20 не держит ни один Pod, за него не отвечает ни один отдельный хост, а в iptables, режиме по умолчанию, этого адреса нет вообще ни на одном интерфейсе.",

  "The kube-proxy on the Node watches the Service and its EndpointSlices, then writes Service rules into the Node dataplane: a packet to 10.96.0.20:80 is DNAT-ed to one of the two Pod IPs. It writes rules and never forwards a packet itself.":
    "Компонент kube-proxy на Node следит за Service и его EndpointSlice, а затем пишет правила Service в плоскость данных Node. По этим правилам пакет на 10.96.0.20:80 получает DNAT на один из двух IP Pod. То есть kube-proxy пишет правила, но сам никогда не пересылает пакеты.",

  "The client opens a connection to 10.96.0.20:80. The packet never passes through kube-proxy: the Service rules in the Node dataplane match that address the moment the packet crosses from the client Pod into the Node.":
    "Клиент открывает соединение с 10.96.0.20:80. Пакет никогда не проходит через kube-proxy, потому что правила Service в плоскости данных Node срабатывают на этот адрес в тот момент, когда пакет переходит из клиентского Pod в Node.",

  "The kernel picks one backend as the Service rules direct and rewrites the destination to it, here 10.244.2.7:8080. Connection tracking records the mapping so every later packet of the flow takes the same backend, and the packet reaches the chosen Pod.":
    "Ядро выбирает один бэкенд, как велят правила Service, и переписывает на него адрес назначения, здесь 10.244.2.7:8080. Механизм отслеживания соединений запоминает это соответствие, поэтому каждый последующий пакет того же потока идёт на тот же бэкенд. Сам же пакет доходит до выбранного Pod.",

  "The Pod replies from its own IP, and conntrack in the same Node dataplane reverses the translation, so the source reads 10.96.0.20 again. The client sees only the ClusterIP it dialed and never the Pod address that served it.":
    "Pod отвечает со своего IP, и conntrack в той же плоскости данных Node отменяет трансляцию, так что источником снова оказывается 10.96.0.20. Клиент видит только ClusterIP, на который обращался, и никогда не видит адрес Pod, который его обслужил.",

  "A second connection to the ClusterIP is a new flow, and with no session affinity the kernel may pick the other backend. It DNATs this one to 10.244.3.9 and conntrack pins it there, while the first flow stays on 10.244.2.7.":
    "Второе соединение с ClusterIP это уже новый поток, и без session affinity ядро может выбрать другой бэкенд. Ядро делает DNAT этого соединения на 10.244.3.9, и conntrack закрепляет его там, а первый поток остаётся на 10.244.2.7.",

  "The second Pod replies from 10.244.3.9, and conntrack reverses this flow the same way, rewriting the source back to 10.96.0.20 before the reply reaches the client. Two Pods served two connections, and the client only ever saw one ClusterIP.":
    "Второй Pod отвечает с 10.244.3.9, и conntrack так же отменяет трансляцию этого потока, переписывая источник обратно на 10.96.0.20, прежде чем ответ дойдёт до клиента. Два Pod обслужили два соединения, а клиент всё время видел только один ClusterIP.",
};
