// Russian for network-pod-ip-and-veth: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "A veth pair drawn as one link with two ends. The eth0 end stands inside the Pod network namespace carrying 10.244.1.5, while its peer stands in the Node root namespace carrying no address of its own and enslaved to the cni0 bridge, which holds 10.244.1.1 instead. A packet entering one end leaves the other with no lookup in between, and every container in the Pod shares that one interface and that one address":
    "Пара veth нарисована как один канал с двумя концами. Конец eth0 стоит в сетевом пространстве имён Pod с адресом 10.244.1.5, а парный конец стоит в корневом пространстве имён Node без своего адреса и подчинён мосту cni0, который вместо него держит 10.244.1.1. Пакет, вошедший в один конец, выходит из другого без всякого поиска между ними, и все контейнеры Pod делят этот один интерфейс и этот один адрес",

  "One CNI ADD made this and exited, leaving a single virtual link with two ends: eth0 stands inside the Pod network namespace and vethb3f8a2c7 stands in the Node root namespace. The @if2 after the host side name is the index of the other end.":
    "Всё это создал один вызов CNI ADD и завершился, оставив один виртуальный канал с двумя концами. Интерфейс eth0 стоит в сетевом пространстве имён Pod, а интерфейс vethb3f8a2c7 в корневом пространстве имён Node. Суффикс @if2 после имени на стороне хоста это индекс другого конца.",

  "Of the two ends only the Pod end is configured with an address: inside the namespace eth0 carries 10.244.1.5/24, and the host end carries none. An address belongs to a network namespace rather than to a cable or to a container, so the thing that has an address here is the Pod.":
    "Из двух концов адрес настроен только на конце в Pod. Внутри пространства имён у интерфейса eth0 адрес 10.244.1.5/24, а у конца на хосте адреса нет. Адрес принадлежит сетевому пространству имён, а не паре veth и не контейнеру, поэтому адрес здесь есть именно у Pod.",

  "The app sends, and the packet goes out eth0 because on the usual plugins that is the one interface in this namespace facing outward. It enters one end of the pair and leaves the other with no lookup and no decision in between, since a veth pair is a point to point link.":
    "Приложение отправляет пакет, и он выходит через eth0, потому что на обычных плагинах это единственный смотрящий наружу интерфейс в этом пространстве имён. Пакет входит в один конец пары и выходит из другого без поиска и без решений между ними, ведь пара veth это канал точка-точка.",

  "The host end is put under cni0 as a bridge port, which is what master cni0 means. A port does not answer for anything, so it needs no address of its own, and the frame lands on the bridge rather than in the Node routing table. The address on this side belongs to cni0 instead, at 10.244.1.1.":
    "Конец на хосте включён в cni0 как порт моста, о чём и говорит master cni0. Порт ни на что не отвечает, поэтому своего адреса ему не нужно, и кадр попадает на мост, а не в таблицу маршрутизации Node. Адрес же на этой стороне принадлежит cni0, это 10.244.1.1.",

  "The runtime created this namespace, pause holds it and app joined it, so both of them stand on that one eth0 and answer on that one address. A second container does not bring a second pair and a second address with it. The unit the pair and the address are allocated to is the Pod.":
    "Это пространство имён создала среда выполнения, pause его удерживает, а app к нему присоединился, поэтому оба контейнера стоят на одном eth0 и отвечают на одном адресе. Второй контейнер не приносит с собой вторую пару и второй адрес. Пара и адрес выделяются именно на Pod.",
};
