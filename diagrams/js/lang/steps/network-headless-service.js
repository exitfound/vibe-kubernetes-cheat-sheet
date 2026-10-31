// Russian for network-headless-service: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Headless Service: Service nginx has clusterIP None, so kube-proxy writes no rules for it. A client Pod asks CoreDNS, through the kube-dns Service, for nginx.default.svc.cluster.local and gets one A record per ready Pod of StatefulSet web, then connects to one Pod IP it picked itself. When web-2 is not ready its record is left out. Each Pod also has its own name, web-0.nginx.default.svc.cluster.local, which resolves to web-0 again once it is recreated with a new IP and is ready.":
    "Headless Service: у Service nginx clusterIP None, поэтому kube-proxy не пишет для него правил. Клиентский Pod запрашивает у CoreDNS через Service kube-dns адрес nginx.default.svc.cluster.local и получает по записи A на каждый готовый Pod StatefulSet web, а затем сам выбирает IP одного Pod и подключается к нему. Когда web-2 не готов, его запись в ответ не попадает. У каждого Pod есть и своё имя, web-0.nginx.default.svc.cluster.local, которое снова указывает на web-0, как только тот пересоздан с новым IP и готов.",

  "StatefulSet web runs three Pods behind Service nginx, whose clusterIP is None. There is no virtual IP, so kube-proxy writes no rules for it. Under the default ClusterFirst DNS policy the lookup of nginx.default.svc.cluster.local still goes to CoreDNS through the kube-dns Service.":
    "У StatefulSet web три Pod за Service nginx, у которого clusterIP None. Виртуального IP нет, поэтому kube-proxy не пишет правил для Service. При DNS-политике по умолчанию, ClusterFirst, поиск nginx.default.svc.cluster.local всё равно идёт в CoreDNS через Service kube-dns.",

  "For a headless Service with a selector the control plane still keeps an EndpointSlice, and CoreDNS answers from it: one A record for every ready Pod, three addresses instead of one virtual IP. The platform does no load balancing, and the whole set comes back for the client to choose from.":
    "Для headless Service с селектором Control Plane всё равно ведёт EndpointSlice, и CoreDNS отвечает по нему, отдавая по записи A на каждый готовый Pod, то есть три адреса вместо одного виртуального IP. Платформа нагрузку не балансирует, и в ответ приходит весь набор, а выбирает из него клиент.",

  "The client connects straight to one address from that set, here web-1 at 10.244.3.4. No ClusterIP is in the path and no Service rule rewrites the destination, so the client chooses from the set itself and kube-proxy has no say.":
    "Клиент подключается прямо к одному адресу из набора, здесь web-1 на 10.244.3.4. Адреса ClusterIP на пути нет, и ни одно правило Service не переписывает адрес назначения, так что клиент выбирает из набора сам, а kube-proxy в этом не участвует.",

  "Pod web-2 fails its readiness probe. Its endpoint turns ready=false in the EndpointSlice and CoreDNS stops publishing that endpoint, so the same lookup now returns two addresses. A Service with publishNotReadyAddresses set would keep web-2 in the answer.":
    "Pod web-2 не проходит readiness probe. Его эндпоинт становится ready=false в EndpointSlice, и CoreDNS перестаёт публиковать этот эндпоинт, так что тот же поиск теперь возвращает два адреса. Service с заданным полем publishNotReadyAddresses оставил бы web-2 в ответе.",

  "Each Pod also gets a name of its own, the Pod name under the governing Service that the StatefulSet serviceName points at. For web-0 that is web-0.nginx.default.svc.cluster.local. That lookup returns web-0 alone, which lets a client reach one specific replica, such as a primary.":
    "Каждый Pod получает и своё имя, то есть имя Pod под управляющим Service, на который указывает поле serviceName у StatefulSet. Для web-0 это web-0.nginx.default.svc.cluster.local. Этот поиск возвращает только web-0, так что клиент может достучаться до заданной реплики, например до primary.",

  "When web-0 is deleted, the StatefulSet recreates it under the same name, here with a new IP. Once it is ready the same lookup returns that new address, 10.244.3.8. A client that cached the answer can hold the old one until the record TTL expires, 30 seconds under kubeadm.":
    "Когда web-0 удаляют, StatefulSet пересоздаёт его под тем же именем, здесь с новым IP. Как только web-0 готов, тот же поиск возвращает этот новый адрес, 10.244.3.8. Клиент, закешировавший ответ, может держать старый адрес до истечения TTL записи, а в kubeadm это 30 секунд.",
};
