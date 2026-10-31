// Russian for network-mtu-overhead: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "MTU overhead and path MTU blackholes: a VXLAN outer header spends 50 of the 1500 bytes a link carries, so the CNI sets the Pod interface to 1450. When one tunnel hop further along the path carries only 1400, a full size frame is refused for being 100 bytes too big and the ICMP that reports it is filtered. So small packets keep crossing while large ones disappear":
    "Накладные расходы MTU и чёрные дыры path MTU: внешний заголовок VXLAN съедает 50 из 1500 байт, которые несёт канал, поэтому CNI ставит интерфейсу Pod 1450. Когда один туннельный переход дальше по пути пропускает только 1400, полный кадр отклоняется как слишком большой на 100 байт, а ICMP, который об этом сообщает, фильтруется. Так что мелкие пакеты по-прежнему проходят, а крупные пропадают",

  "A link carries 1500 bytes in a frame and the overlay wrap is paid out of that number rather than added to it. A VXLAN header over IPv4 spends 50 of them, so 1450 are left for the frame a Pod puts inside. An IPIP wrap costs 20 and leaves 1480.":
    "Канал несёт 1500 байт в кадре, и обёртка overlay оплачивается из этого числа, а не добавляется к нему. Заголовок VXLAN поверх IPv4 съедает 50 из них, так что на внутренний кадр от Pod остаётся 1450. Обёртка IPIP стоит 20 и оставляет 1480.",

  "That 1450 goes onto the interface that builds the frame. The CNI plugin sets the Pod eth0 MTU when it creates the interface, from its config or detected from the Node NIC, while the NIC keeps the full 1500. The cost lands one layer in, on the Pod, and the NIC number an operator reads does not show it.":
    "Значение 1450 получает интерфейс, который собирает кадр. CNI-плагин задаёт MTU для eth0 в Pod при создании интерфейса, беря значение из своего конфига или определяя по Node NIC, а NIC остаётся на полных 1500. Цена ложится на слой глубже, то есть на Pod, и число у NIC, которое видит оператор, её не показывает.",

  "A ping is a tiny frame. The default 56 byte payload with its ICMP and IPv4 headers is an 84 byte datagram, and 134 on the wire once wrapped, nowhere near the limit. It crosses the underlay to Pod B and the echo comes home, which is why a cluster with an MTU problem still answers its health checks.":
    "Ping умещается в крошечный кадр. Полезная нагрузка по умолчанию 56 байт с заголовками ICMP и IPv4 даёт датаграмму в 84 байта, а с обёрткой 134 байта на проводе, так что до предела далеко. Ping проходит underlay до Pod B, и эхо возвращается. Поэтому кластер с проблемой MTU всё ещё отвечает на проверки состояния.",

  "The route to Node-2 crosses a VPN leg that carries only 1400 bytes, and nothing on the Node knows it. A full size frame is 1500 on the wire, 100 more than that hop can take, so where the tunnel sets the do not fragment bit the hop drops it and returns ICMP type 3 code 4 to the Node naming 1400.":
    "Маршрут до Node-2 идёт через участок VPN, который пропускает только 1400 байт, и на Node об этом ничего не известно. Полный кадр занимает на проводе 1500, на 100 больше, чем берёт этот переход. Поэтому там, где туннель ставит бит do not fragment, переход отбрасывает кадр и возвращает на Node ICMP type 3 code 4 с числом 1400.",

  "Where a firewall or a cloud security group filters ICMP, that reply never arrives and the Node never lowers anything. It keeps putting 1500 on a path that will not carry it. Pings and some interactive connections still work, while a bulk transfer fails on its first large packet and the connection times out.":
    "Где файрвол или облачная security group фильтрует ICMP, этот ответ так и не приходит, и Node ничего не уменьшает. Она продолжает слать 1500 по пути, который их не пропустит. Ping и часть интерактивных соединений по-прежнему работают, а передача большого объёма данных срывается на первом крупном пакете, и соединение обрывается по таймауту.",

  "The fix that does not need ICMP is to clamp the TCP MSS. A rule on the path rewrites the value both ends announce in the handshake down to 1310, which is the 1400 on that hop less the outer header and the IPv4 and TCP headers, so no TCP segment is built too big. It does nothing for UDP or anything else with no MSS.":
    "Исправить это без ICMP можно, если ограничить TCP MSS. Правило на пути переписывает значение, которое обе стороны объявляют в рукопожатии, снижая его до 1310. Это 1400 на том переходе минус внешний заголовок и заголовки IPv4 и TCP, так что ни один TCP-сегмент не выходит слишком большим. Для UDP и всего остального без MSS это ничего не даёт.",
};
