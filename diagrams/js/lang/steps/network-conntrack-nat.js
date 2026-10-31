// Russian for network-conntrack-nat: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Connection tracking and NAT. The first packet of a new flow matches no conntrack entry, so it walks the NAT rules once, where a backend is picked. Then conntrack records the flow as one entry holding the original tuple and the reply tuple expected back. That entry lets the reply be reverse-translated with no rule read at all, and every later packet is translated straight off the stored entry":
    "Отслеживание соединений и NAT. Первый пакет нового потока не находит записи conntrack, поэтому один раз идёт по правилам NAT, где выбирается бэкенд. Затем conntrack заносит поток в одну запись, где хранятся исходный кортеж и ответный, ожидаемый обратно. По этой записи ответ получает обратную трансляцию вовсе без чтения правил, а каждый следующий пакет транслируется прямо по сохранённой записи",

  "The client dials a Service address that no host owns, and the first packet of the flow reaches netfilter. There is no conntrack entry matching this packet, so nothing about this connection has been decided yet.":
    "Клиент обращается к адресу Service, которым не владеет ни один хост, и первый пакет потока попадает в netfilter. Записи conntrack для этого пакета нет, так что по этому соединению ещё ничего не решено.",

  "With no entry to match, the NAT rules have to be walked. The chain is read top to bottom until a rule claims the destination and a backend is chosen for this connection. The first packet of every new flow pays this walk, and no later packet of that flow pays again while the entry lives.":
    "Записи нет, значит надо пройти правила NAT. Цепочка читается сверху вниз, пока какое-то правило не заберёт адрес назначения и для этого соединения не будет выбран бэкенд. За этот обход платит первый пакет каждого нового потока, а последующие пакеты того же потока, пока жива запись, больше не платят.",

  "The flow is now recorded by conntrack as one entry with two tuples: the original direction the client sent, and the reply direction the client expects back. The destination is rewritten to the chosen backend and the packet delivered, with the mapping stored as long as the entry lives.":
    "Теперь conntrack заносит поток в одну запись с двумя кортежами: исходным направлением, в котором отправил клиент, и ответным, которого клиент ждёт обратно. Адрес назначения переписывается на выбранный бэкенд, и пакет доставляется, а соответствие хранится, пока жива запись.",

  "The backend answers from its own address, and the packet matches the reply tuple of the stored entry. That match alone undoes the translation, so the client sees an answer from the Service address it dialed, and the reply is what flips the entry to ESTABLISHED. Not one NAT rule is read on the way back.":
    "Бэкенд отвечает со своего адреса, и пакет совпадает с ответным кортежем сохранённой записи. Одно лишь это совпадение отменяет трансляцию, поэтому клиент видит ответ с того адреса Service, к которому обращался, а в ESTABLISHED запись переходит именно по ответу. На обратном пути не читается ни одно правило NAT.",

  "Every later packet of this flow matches the original tuple and is translated straight off the entry, leaving the rule ladder untouched. That is why a flow stays on one backend while its entry lives. For the same reason a Node opening huge numbers of short connections can fill its conntrack table and start dropping new ones.":
    "Каждый следующий пакет этого потока совпадает с исходным кортежем и транслируется прямо по записи, а лестница правил остаётся нетронутой. Поэтому поток держится одного бэкенда, пока жива его запись. По той же причине Node, которая открывает огромное число коротких соединений, может заполнить свою таблицу conntrack и начать отбрасывать новые.",
};
