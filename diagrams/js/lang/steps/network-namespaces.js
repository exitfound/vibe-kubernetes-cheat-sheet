// Russian for network-namespaces: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Network namespaces, where the container runtime creates one network namespace and the pause container holds it for the life of the Pod, the namespace is drawn as a stack of four layers with its own ports, packet rules, routing table and interfaces, every container in the Pod joins that same stack instead of getting one of its own, and on the usual plugins a single veth pair is the one link between it and the host namespace":
    "Сетевые пространства имён, где среда выполнения контейнеров создаёт одно сетевое пространство имён, а контейнер pause удерживает его всё время жизни Pod, само пространство нарисовано стопкой из четырёх слоёв со своими портами, правилами для пакетов, таблицей маршрутизации и интерфейсами, каждый контейнер Pod входит в этот же стек, а не получает свой, и на обычных плагинах единственной связью между этим стеком и пространством имён хоста служит одна пара veth",

  "When the Pod sandbox starts, the runtime creates a brand new network namespace and the pause container holds it for the life of the Pod. Only a Pod that sets hostNetwork goes without one. The stack inside is empty: one loopback device, no routes, no rules and every port still free. Nothing reaches in or out yet.":
    "Когда стартует sandbox Pod, среда выполнения создаёт новое сетевое пространство имён, и контейнер pause удерживает его всё время жизни Pod. Без своего пространства имён обходится только Pod с hostNetwork. Стек внутри пуст. В нём лишь одно устройство loopback, нет ни маршрутов, ни правил, а все порты ещё свободны. Внутрь и наружу пока ничего не проходит.",

  "The CNI plugin then joins the namespace to the outside with a veth pair, and the in-Pod end of that pair appears in this stack as eth0. A default route is written through eth0, so that one cable becomes the path between the Pod and everything outside. Plugins that hand the Pod other devices are the exception.":
    "Затем CNI-плагин соединяет пространство имён с внешним миром парой veth, и конец пары внутри Pod появляется в этом стеке как eth0. Через eth0 прописывается маршрут по умолчанию, так что этот единственный канал становится путём между Pod и всем, что снаружи. Исключение составляют плагины, которые дают Pod другие устройства.",

  "A second container does not get a stack of its own, it enters this one. Both of them sit on the same four layers, which is why a second eth0 and a second set of ports never appear, and why each of them reaches the other over the loopback without leaving the Pod.":
    "Второй контейнер не получает своего стека, он входит в этот. Оба контейнера стоят на тех же четырёх слоях, поэтому второй eth0 и второй набор портов так и не появляются, и по той же причине контейнеры достают друг до друга через loopback, не выходя из Pod.",

  "Because the stack is separate, the routing table and packet rules inside it belong to this Pod alone, and a port bound here does not collide with the Node. When the Pod is deleted, the runtime calls CNI DEL to release the address and remove the veth, and the namespace goes with the Pod.":
    "Поскольку стек отдельный, таблица маршрутизации и правила для пакетов внутри него принадлежат только этому Pod, а порт, открытый здесь, не конфликтует с Node. При удалении Pod среда выполнения вызывает CNI DEL, чтобы освободить адрес и убрать veth, а вместе с Pod уходит и пространство имён.",
};
