// Russian for workloads-probes: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Container probes: startupProbe holds livenessProbe and readinessProbe shut until it passes, a liveness failure restarts the container per restartPolicy, a readiness failure only flips the endpoint to ready=false":
    "Пробы контейнера: startupProbe не пускает в работу livenessProbe и readinessProbe, пока сама не пройдёт, провал liveness перезапускает контейнер согласно restartPolicy, а провал readiness только переводит эндпоинт в ready=false",

  "Kubelet runs startupProbe against the container every periodSeconds, with an httpGet, tcpSocket, grpc or exec handler. While it runs, livenessProbe and readinessProbe are held shut and never execute, so a slow boot never reads as a liveness failure. If it exhausts failureThreshold, Kubelet kills the container and restartPolicy decides what follows.":
    "Kubelet запускает пробу startupProbe для контейнера каждые periodSeconds, с обработчиком httpGet, tcpSocket, grpc или exec. Пока она работает, livenessProbe и readinessProbe заблокированы и не выполняются, так что медленная загрузка никогда не сойдёт за провал liveness. Если же проба исчерпает failureThreshold, Kubelet убивает контейнер, а что будет дальше, решает restartPolicy.",

  "The startupProbe succeeds once. Kubelet retires it for the lifetime of this container instance and never runs it again, and the two probes it was holding are released. From here livenessProbe and readinessProbe run independently, each on its own periodSeconds, and neither waits for the other.":
    "Проба startupProbe один раз проходит успешно. Kubelet снимает её на всё время жизни этого экземпляра контейнера и больше никогда не запускает, а две пробы, которые она держала, освобождаются. Дальше livenessProbe и readinessProbe работают независимо, каждая со своим periodSeconds, и ни одна не ждёт другую.",

  "The readinessProbe passes successThreshold times in a row and may run ahead of its period until the container is Ready. Kubelet flips the Pod Ready condition to True and the Pod endpoint in the EndpointSlice flips to ready=true, so new connections start reaching the Pod. All spec.readinessGates conditions must be True first.":
    "Проба readinessProbe проходит successThreshold раз подряд и, пока контейнер не Ready, может запускаться раньше своего периода. Kubelet переводит условие Ready у Pod в True, и эндпоинт Pod в EndpointSlice переходит в ready=true, так что к Pod начинают приходить новые соединения. Но сначала каждое условие из spec.readinessGates должно быть True.",

  "The readinessProbe alone fails failureThreshold consecutive times. The Pod endpoint in the EndpointSlice is marked ready=false rather than removed, so new connections stop reaching it. Nothing is restarted and restartCount stays 0, because a readiness failure only moves traffic away.":
    "Одна лишь readinessProbe проваливается failureThreshold раз подряд. Эндпоинт Pod в EndpointSlice помечается ready=false, а не удаляется, поэтому новые соединения перестают к нему приходить. Ничего не перезапускается, и restartCount остаётся равен 0, потому что провал readiness только уводит трафик.",

  "The livenessProbe fails failureThreshold consecutive times on its own period. Kubelet kills the container and starts a fresh instance per restartPolicy, so restartCount becomes 1 and the endpoint stays ready=false. The Pod object is not replaced and keeps its IP, because a probe restarts a container and never a Pod.":
    "Проба livenessProbe, которая работает со своим периодом, проваливается failureThreshold раз подряд. Kubelet убивает контейнер и, как велит restartPolicy, запускает новый экземпляр, так что restartCount становится равен 1, а эндпоинт остаётся в ready=false. Объект Pod не заменяется и сохраняет свой IP, потому что проба перезапускает контейнер, но никогда не Pod.",

  "The replacement container starts from the beginning. Kubelet runs startupProbe again and holds the other two probes shut until it passes. Then readinessProbe succeeds, and the endpoint flips back to ready=true. The restartCount carries over and climbs with every restart, which is how a restart loop is told apart from a healthy run.":
    "Новый контейнер запускается с самого начала. Kubelet снова запускает startupProbe и не пускает две другие пробы, пока она не пройдёт. Затем проходит readinessProbe, и эндпоинт снова переходит в ready=true. Счётчик restartCount при этом сохраняется и растёт с каждым перезапуском, так цикл перезапусков и отличают от нормальной работы.",
};
