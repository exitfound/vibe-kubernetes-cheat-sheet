// Russian for network-containers-share-localhost: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Containers in one Pod share a network stack, which means the app and the sidecar stand on the same loopback and bind their ports in one shared space. So a call to 127.0.0.1 is delivered inside the Pod, and a bind of a pair another container already holds comes back as address already in use. A call from outside arrives on the Pod eth0 at the Pod address, and the container holding the target port answers":
    "Контейнеры одного Pod делят сетевой стек, то есть приложение и sidecar стоят на одном loopback и занимают порты в одном общем пространстве. Поэтому вызов на 127.0.0.1 доставляется внутри Pod, а bind на пару, которую уже держит другой контейнер, возвращает address already in use. Вызов снаружи приходит на eth0 Pod по адресу Pod, и отвечает тот контейнер, который держит нужный порт",

  "Every container in this Pod joins one network namespace, so all of them share a single port space. The app binds :8080 in that space and the sidecar binds :15001, and each port is claimed for the whole Pod rather than for one container.":
    "Все контейнеры этого Pod входят в одно сетевое пространство имён, поэтому и пространство портов у них одно на всех. Приложение занимает в нём :8080, а sidecar занимает :15001, и каждый порт занят для всего Pod, а не для одного контейнера.",

  "The app now calls 127.0.0.1:15001. Both containers stand on the same loopback, so the call goes down into lo and straight back up into the sidecar, with no veth hop and nothing on the wire.":
    "Теперь приложение вызывает 127.0.0.1:15001. Оба контейнера стоят на одном loopback, поэтому вызов спускается в lo и сразу поднимается обратно в sidecar, без перехода через veth, и в сеть ничего не уходит.",

  "A bind claims an address and a port together, so the shared space is where the two containers can collide. The sidecar already holds 127.0.0.1:15001, and an app that asked for that same pair would be refused with address already in use. Any port the sidecar has not claimed (here :9090) is still open to the app.":
    "Вызов bind занимает адрес и порт вместе, поэтому именно в общем пространстве два контейнера и могут столкнуться. Sidecar уже держит 127.0.0.1:15001, и приложение, запросившее ту же пару, получило бы отказ address already in use. Любой порт, который sidecar не занял (здесь это :9090), для приложения по-прежнему свободен.",

  "A call from outside arrives on eth0, the one interface in the Pod that faces the network, at 10.244.1.5. It carries a port, and the container holding that port answers (here the app on :8080). From the outside the Pod is one host with one address per address family, however many containers run inside.":
    "Вызов снаружи приходит на eth0, единственный обращённый к сети интерфейс Pod, по адресу 10.244.1.5. В вызове указан порт, и отвечает тот контейнер, который держит этот порт (здесь это приложение на :8080). Снаружи Pod выглядит одним хостом с одним адресом на каждое семейство адресов, сколько бы контейнеров ни работало внутри.",

  "So the network belongs to the Pod rather than to a container. The address, the loopback and the port space are shared, while each container keeps its own root filesystem, and its own process tree unless the Pod sets shareProcessNamespace. That is what lets a sidecar proxy take the app traffic on localhost without leaving the Pod.":
    "Так что сеть принадлежит Pod, а не контейнеру. Адрес, loopback и пространство портов общие, а у каждого контейнера своя корневая файловая система и, если Pod не задаёт shareProcessNamespace, своё дерево процессов. Поэтому sidecar-прокси и может принимать трафик приложения на localhost, и трафик при этом не покидает Pod.",
};
