// Russian for network-ingress-routing: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Ingress controller routing: a controller Pod behind a LoadBalancer or NodePort Service of its own watches Ingress shop, whose TLS entry names Secret shop-tls and whose two Prefix rules send shop.io/ to Service web and shop.io/api to Service api. It terminates TLS, matches the Host header and the longest path, reads the Ready endpoints of the chosen Service from its EndpointSlice and proxies straight to that Pod IP, and a request for a host no Ingress of its class names gets a 404 from the default backend of the controller itself":
    "Маршрутизация в Ingress Controller: Pod контроллера за собственным Service типа LoadBalancer или NodePort следит за Ingress shop, у которого запись TLS называет Secret shop-tls, а два правила Prefix отправляют shop.io/ в Service web и shop.io/api в Service api. Контроллер завершает TLS, сопоставляет заголовок Host и самый длинный путь, читает из EndpointSlice выбранного Service эндпоинты с условием Ready и проксирует прямо на IP Pod, а запрос на хост, которого не называет ни один Ingress того же класса, получает 404 от default backend самого контроллера",

  "The controller watches Ingress objects whose ingressClassName names its IngressClass. Ingress shop has a TLS entry for shop.io and two rules, both with pathType Prefix. Rule / goes to Service web and /api to Service api. The controller compiles them into its proxy config.":
    "Контроллер следит за объектами Ingress, у которых поле ingressClassName называет его IngressClass. В Ingress shop есть запись TLS для shop.io и два правила, оба с pathType Prefix. Правило / идёт в Service web, а /api в Service api. Контроллер компилирует их в конфигурацию своего прокси.",

  "External traffic reaches the controller through a Service of its own, usually a LoadBalancer or NodePort. An HTTPS request for shop.io/ lands on the controller Pod, which serves the certificate from Secret shop-tls, the one the Ingress TLS entry names for that host, and terminates TLS.":
    "Внешний трафик доходит до контроллера через его собственный Service, обычно LoadBalancer или NodePort. HTTPS-запрос на shop.io/ попадает в Pod контроллера. Тот отдаёт сертификат из Secret shop-tls, названного для этого хоста в записи TLS Ingress, и завершает TLS.",

  "Now the controller reads the Host header, shop.io, and the path, /. Only the / rule matches. The controller does not hand the request to the Service ClusterIP. Instead it reads the Ready endpoints of Service web from its EndpointSlice and proxies straight to Pod IP 10.244.1.5.":
    "Теперь контроллер читает заголовок Host, shop.io, и путь, /. Совпадает только правило /. Контроллер не отдаёт запрос на ClusterIP Service web, а читает из EndpointSlice его эндпоинты с условием Ready и проксирует прямо на IP Pod 10.244.1.5.",

  "A second HTTPS request asks for shop.io/api. Both rules match it, because Prefix / matches every path, and the Ingress spec gives precedence to the longest matching path, so /api wins. The controller reads the endpoints of Service api and proxies straight to Pod IP 10.244.2.7.":
    "Второй HTTPS-запрос идёт на shop.io/api. С ним совпадают оба правила, потому что Prefix / совпадает с любым путём, а спецификация Ingress отдаёт приоритет самому длинному совпавшему пути, так что побеждает /api. Контроллер читает эндпоинты Service api и проксирует прямо на IP Pod 10.244.2.7.",

  "A plain HTTP request for other.io/ arrives. No Ingress of this class names that host and Ingress shop sets no defaultBackend, so the Ingress API leaves the answer to the controller. This one hands the request to its own default backend, which answers 404, and no Service endpoints are read.":
    "Приходит обычный HTTP-запрос на other.io/. Ни один Ingress этого класса не называет этот хост, а Ingress shop не задаёт defaultBackend, поэтому API Ingress оставляет ответ контроллеру. Этот контроллер отдаёт запрос своему default backend, который отвечает 404, и эндпоинты ни одного Service при этом не читаются.",
};
