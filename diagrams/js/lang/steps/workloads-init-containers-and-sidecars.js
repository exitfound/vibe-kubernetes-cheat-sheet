// Russian for workloads-init-containers-and-sidecars: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Init containers and native sidecars: strictly sequential bootstrap, sidecar gates main, then parallel run":
    "Init-контейнеры и native sidecar стартуют строго по очереди, main ждёт sidecar, а потом оба работают параллельно",

  "Kubelet asks the runtime to Create and Start wait-for-db via CRI. Init containers run strictly sequentially: a regular one must exit 0 before the next can start. A non-zero exit shows Init:Error and is retried with backoff (Init:CrashLoopBackOff), or fails the Pod if the container restartPolicy, own or inherited, is Never.":
    "Kubelet через CRI просит среду выполнения сделать Create и Start для wait-for-db. Init-контейнеры идут строго по очереди, то есть обычный должен завершиться с кодом 0 до старта следующего. Ненулевой код даёт Init:Error и повтор с задержкой (Init:CrashLoopBackOff), а если restartPolicy контейнера, свой или унаследованный, равен Never, переводит Pod в Failed.",

  "The wait-for-db container exits 0. Kubelet observes the exit via PLEG (Pod Lifecycle Event Generator) and then creates migrate-schema. It follows the same rule and must exit 0 before any later container can start. Each init container image is pulled lazily, just before that container is created, per its imagePullPolicy.":
    "Контейнер wait-for-db завершается с кодом 0. Kubelet замечает это через PLEG (Pod Lifecycle Event Generator) и затем создаёт migrate-schema. Контейнер migrate-schema подчиняется тому же правилу и должен завершиться с кодом 0 до старта любого последующего. Образ каждого init-контейнера скачивается лениво, прямо перед созданием этого контейнера, по его imagePullPolicy.",

  "Both regular init containers exited 0. The sidecar (declared as an initContainer with restartPolicy=Always, beta in 1.29 and GA in 1.33) is started next, allowed to run for the full lifetime of the Pod. Once it reports Started (its startupProbe succeeded, or a running process where no probe is set), Kubelet moves on, and with no init container left, the main container starts next.":
    "Оба обычных init-контейнера завершились с кодом 0. Следующим стартует sidecar (объявлен как initContainer с restartPolicy=Always, beta в 1.29 и GA в 1.33), и ему разрешено работать всю жизнь Pod. Как только sidecar сообщает Started (startupProbe пройден или, если пробы нет, процесс запущен), Kubelet идёт дальше. Init-контейнеров больше нет, поэтому следующим стартует основной контейнер.",

  "As soon as the sidecar Started flag flips true, Kubelet creates and starts the main container. From here both run in parallel. Pod phase flips from Pending to Running once the main container is running, even before its own startupProbe passes.":
    "Как только флаг Started у sidecar становится true, Kubelet создаёт и запускает основной контейнер. Дальше оба работают параллельно. Статус Pod меняется с Pending на Running, как только основной контейнер запущен, даже до того, как пройдёт его собственный startupProbe.",

  "Pod is Running. The sidecar handles cross-cutting concerns (proxy, log shipping, credential rotation) alongside main. Kubelet restarts the sidecar independently if it crashes (because restartPolicy=Always on the init slot). On Pod termination the start order runs backwards.":
    "Pod в статусе Running. Sidecar рядом с main берёт на себя сквозные задачи (прокси, отправку журнальных сообщений, ротацию учётных данных). Если sidecar падает, Kubelet перезапускает его независимо, потому что в слоте init стоит restartPolicy=Always. При завершении Pod контейнеры останавливаются в порядке, обратном запуску.",
};
