// Russian for network-client-ip-preservation: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Preserving the client IP: an edge proxy ends the connection the client opened and starts one of its own to the backend, so the two packets carry different source addresses and the backend socket no longer names the client. The edge writes the original address into X-Forwarded-For, which a client can also send, so the row becomes a list a reader must trust from its last entry inwards, and for raw TCP or TLS passthrough the PROXY protocol prepends a preamble instead":
    "Сохранение IP клиента: пограничный прокси завершает соединение, которое открыл клиент, и открывает своё к бэкенду, поэтому у двух пакетов разные адреса источника, и клиента по сокету бэкенда уже не видно. Прокси записывает исходный адрес в X-Forwarded-For, который клиент может прислать и сам, поэтому строка становится списком, которому надо доверять от последней записи к началу, а для чистого TCP или сквозного TLS протокол PROXY вместо этого добавляет в начало преамбулу",

  "The client opens the connection to the edge, an Ingress or Gateway proxy Pod. Its packets carry the real source address, 198.51.100.9, and they arrive unchanged only because nothing on the way rewrote them.":
    "Клиент открывает соединение с пограничным прокси, то есть с Pod прокси Ingress или Gateway. В пакетах клиента настоящий адрес источника, 198.51.100.9, и они доходят без изменений только потому, что по пути их никто не переписал.",

  "The edge does not forward those packets. It ends that connection and opens a new one of its own to the backend, so what the app receives is sourced from the proxy Pod, 10.244.0.9. The two src rows show it: read from the socket, the client address is gone.":
    "Прокси не пересылает эти пакеты. Он завершает это соединение и открывает своё к бэкенду, поэтому приложение получает трафик с адреса Pod прокси, 10.244.0.9. Две строки src показывают, что по сокету адрес клиента уже не узнать.",

  "So the edge writes the address into the request instead. Before proxying it adds X-Forwarded-For carrying the client address. The standardized form, the RFC 7239 Forwarded header, writes it as for=198.51.100.9. The socket still reads 10.244.0.9, and the app reads the header.":
    "Поэтому прокси вместо этого записывает адрес в запрос. Перед проксированием он добавляет заголовок X-Forwarded-For с адресом клиента. В стандартной форме, заголовке Forwarded из RFC 7239, адрес записан как for=198.51.100.9. Сокет по-прежнему показывает 10.244.0.9, а приложение читает заголовок.",

  "A header is only data, and the client can send an X-Forwarded-For of its own claiming any address. An edge that keeps what arrived appends what it saw, so the row becomes a list with the forged value first and the address your own edge saw last. Trust that list from its last entry inwards.":
    "Заголовок это лишь данные, и клиент может прислать свой X-Forwarded-For с любым адресом. Прокси, сохраняющий пришедшее значение, дописывает то, что увидел сам, так что строка становится списком, где первым идёт поддельное значение, а последним адрес, который увидел ваш прокси. Доверять списку надо от последней записи к началу.",

  "Raw TCP and passed-through TLS have no header to write into. The PROXY protocol prepends a short preamble to the first bytes of the stream, carrying the original source address, and the backend must be configured to expect it or it reads the preamble as request bytes.":
    "У чистого TCP и сквозного TLS нет заголовка, куда писать. Протокол PROXY добавляет перед первыми байтами потока короткую преамбулу с исходным адресом источника, и бэкенд должен быть настроен так, чтобы её ждать, иначе он примет преамбулу за байты запроса.",
};
