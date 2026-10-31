// Russian for workloads-daemonset: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "DaemonSet controller: counts the Nodes whose labels match the Pod template nodeSelector, creates one Pod on each of them pinned to that Node, adds a Pod when a Node starts matching, rolls a new image out one Node at a time under updateStrategy, and does not reschedule the Pod of a deleted Node but leaves it to garbage collection":
    "Контроллер DaemonSet: считает Node, чьи метки подходят под nodeSelector шаблона Pod, создаёт на каждой из них по одному Pod, привязанному к этой Node, добавляет Pod, когда Node начинает подходить, по updateStrategy выкатывает новый образ по одной Node за раз, а Pod удалённой Node не размещает заново и оставляет сборщику мусора",

  "The controller reads no replica count, because a DaemonSet has no replicas field. It lists Nodes through the API and matches each one against the nodeSelector in the DaemonSet Pod template. All three Nodes carry logging=enabled, so desiredNumberScheduled counts three. Nothing is running yet.":
    "Контроллер не читает число реплик, потому что у DaemonSet нет поля replicas. Список Node контроллер получает через API и сверяет каждую с nodeSelector из шаблона Pod этого DaemonSet. На всех трёх Node есть метка logging=enabled, поэтому desiredNumberScheduled равен трём. Ничего пока не запущено.",

  "The controller creates one Pod per matching Node through the API, each one pinned to its own Node by nodeAffinity. A DaemonSet keeps exactly one Pod per Node, and only a non-zero maxSurge during a rollout ever puts a second there, so the fleet follows the Node set instead of a replica number. A Node counts in numberReady once its Pod reports Ready.":
    "Контроллер через API создаёт по одному Pod на каждую подходящую Node, и каждый привязан к своей Node через nodeAffinity. DaemonSet держит ровно один Pod на Node, и только ненулевой maxSurge во время rollout может поставить туда второй, так что набор Pod следует за набором Node, а не за числом реплик. Node попадает в numberReady, когда её Pod сообщает Ready.",

  "Node-4 joins the cluster without a logging=enabled label, so the nodeSelector in the Pod template does not select it, and joining alone earns it no Pod. The controller sees the new Node object and leaves desiredNumberScheduled at three.":
    "Node-4 входит в кластер без метки logging=enabled, поэтому nodeSelector в шаблоне Pod её не выбирает, и сам по себе вход в кластер не даёт ей Pod. Контроллер видит новый объект Node и оставляет desiredNumberScheduled равным трём.",

  "An operator labels Node-4 with logging=enabled. The controller watches Node objects, sees the update, recomputes desiredNumberScheduled to four and creates one Pod there. The three Pods already running are untouched, because the controller reconciles the difference and nothing about their Nodes changed.":
    "Оператор ставит на Node-4 метку logging=enabled. Контроллер следит за объектами Node, видит изменение, пересчитывает desiredNumberScheduled до четырёх и создаёт там один Pod. Три уже работающих Pod остаются как есть, потому что контроллер устраняет расхождение, а с их Node ничего не изменилось.",

  "The image is bumped from fluentd v1 to v2. RollingUpdate with maxUnavailable=1 replaces the Pods one Node at a time: numberReady drops to three while the Pod on Node-1 is recreated, and is back at four once the v2 Pod is Ready. Log collection keeps running on the other Nodes. OnDelete would instead wait until you delete each Pod by hand.":
    "Образ меняют с fluentd v1 на v2. Стратегия RollingUpdate с maxUnavailable=1 заменяет Pod по одной Node за раз, и numberReady падает до трёх, пока пересоздаётся Pod на Node-1, а когда Pod v2 становится Ready, счётчик снова равен четырём. На остальных Node сбор журнальных сообщений продолжается. Стратегия OnDelete вместо этого ждала бы, пока вы вручную удалите каждый Pod.",

  "Node-2 leaves the cluster and its Node object is deleted, so desiredNumberScheduled drops back to three and the Pod on Node-2 is garbage collected, not recreated elsewhere as a Deployment replica would be. A drain would not have removed this Pod, because a drain never evicts running DaemonSet Pods.":
    "Node-2 покидает кластер, и её объект Node удаляется, поэтому desiredNumberScheduled снова падает до трёх, а Pod на Node-2 достаётся сборщику мусора и не пересоздаётся в другом месте, в отличие от реплики Deployment. Команда drain этот Pod не убрала бы, ведь drain никогда не вытесняет работающие Pod DaemonSet.",
};
