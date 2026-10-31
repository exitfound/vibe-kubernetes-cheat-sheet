// Russian for cluster-node-registration: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Node registration, where a Kubelet self-registers its machine as a Node object and publishes its status, the not-ready taint keeps ordinary Pods off while Ready is False, the first Pod is placed once Ready turns True, and a Lease carries the heartbeat":
    "Регистрация Node, где Kubelet сам регистрирует узел как объект Node и публикует статус, taint not-ready, пока Ready равно False, не пускает обычные Pod, первый Pod размещается, когда Ready становится True, а heartbeat идёт через Lease",

  "A machine joins a cluster by running a Kubelet on it. With --register-node left at its default of true, the Kubelet registers itself with the API rather than waiting for an operator to create the object, which is how most distributions bring a Node in. Nothing in the cluster knows this machine yet.":
    "Узел присоединяется к кластеру, когда на нём запускают Kubelet. Если параметр --register-node оставлен в значении по умолчанию, он же true, Kubelet сам регистрируется в API, а не ждёт, пока оператор создаст объект. Так Node добавляют в большинстве дистрибутивов. Пока никто в кластере об этом узле ничего не знает.",

  "The Kubelet creates the Node object through the API, named after the machine, and the POST already carries its status: addresses, capacity, nodeInfo and Ready False. The TaintNodesByCondition admission plugin, on by default, adds the not-ready taint as the object is created. The name identifies the Node, so two Nodes cannot carry the same name at the same time.":
    "Kubelet создаёт через API объект Node с именем узла, и в POST уже лежит статус этой Node: addresses, capacity, nodeInfo и Ready False. Admission-плагин TaintNodesByCondition, включённый по умолчанию, добавляет taint not-ready прямо при создании объекта. Имя и есть идентификатор Node, поэтому две Node не могут одновременно носить одно имя.",

  "From then on the Kubelet PATCHes that status whenever it changes, and every 5 minutes by default when nothing does. Its own labels sit on the object, not the status, and the NodeRestriction admission plugin holds the kubernetes.io ones to a fixed list. So a Kubelet can label itself with a hostname or a zone but never with a node-role.":
    "Дальше Kubelet шлёт PATCH этого статуса при каждом изменении, а если ничего не меняется, по умолчанию раз в 5 минут. Labels самого Kubelet лежат на объекте, а не в статусе, и admission-плагин NodeRestriction ограничивает labels kubernetes.io фиксированным списком. Поэтому Kubelet может задать себе label с hostname или зоной, но никогда с node-role.",

  "The object exists and takes no ordinary Pod yet. Each status report still says Ready False while the machine is not healthy, and healthy means everything a Pod needs on it is up, the runtime included. Ready False keeps node.kubernetes.io/not-ready on the Node, and scheduling reads taints, not conditions. So only a Pod that tolerates it lands here.":
    "Объект уже есть, но обычных Pod пока не принимает. Каждый отчёт о статусе всё ещё говорит Ready False, пока узел не в порядке, а в порядке он тогда, когда на нём работает всё нужное Pod, включая среду выполнения. Ready False держит на Node taint node.kubernetes.io/not-ready, а при планировании смотрят на taints, не на условия. Поэтому сюда попадает только Pod с toleration к этому taint.",

  "The container runtime comes up, the Kubelet flips Ready to True, and the not-ready taint is taken back off the Node. Node-1 can be chosen now: the first binding names it in spec.nodeName, and the Kubelet that registered the machine starts the containers on it.":
    "Среда выполнения контейнеров поднимается, Kubelet меняет Ready на True, и taint not-ready снимается с Node. Теперь Node-1 можно выбрать, и первый binding указывает её в поле spec.nodeName, а Kubelet, зарегистрировавший узел, запускает на нём контейнеры.",

  "Alive is a separate question from Ready, and the Kubelet answers it on two clocks. It renews a Lease in the kube-node-lease namespace every 10 seconds, and PATCHes its status when it changes or else every 5 minutes, both of them defaults. The fast one is the signal, and the Node Failure and Pod Recovery card is about losing it.":
    "Вопрос о том, жива ли Node, отделён от Ready, и Kubelet отвечает на него в двух ритмах. Каждые 10 секунд Kubelet продлевает Lease в namespace kube-node-lease, а PATCH статуса шлёт при изменении, если же изменений нет, раз в 5 минут, и оба интервала здесь по умолчанию. Сигналом жизни служит именно частый Lease, и его потере посвящена карточка Node Failure and Pod Recovery.",
};
