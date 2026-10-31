// Russian for workloads-termination-order: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Container termination order in a five container Pod: every container in spec.containers is signalled first and in no guaranteed order among them, and only once the last of them has terminated does the Kubelet signal the three native sidecars, in the reverse of the order they are declared, with every stop spent from one terminationGracePeriodSeconds":
    "Порядок завершения контейнеров в Pod из пяти контейнеров: все контейнеры из spec.containers получают сигнал первыми, без гарантированного порядка между ними, и только когда последний из них завершился, Kubelet подаёт сигнал трём native sidecar в порядке, обратном объявлению, и каждая остановка тратит время из одного общего terminationGracePeriodSeconds",

  "The Pod is marked for deletion and the Kubelet begins the local shutdown on this Node. Nothing has been signalled yet. Five containers are running here, three declared in spec.initContainers with restartPolicy Always and two in spec.containers, and one terminationGracePeriodSeconds covers all of them.":
    "Pod помечен на удаление, и Kubelet начинает локальное завершение на этой Node. Сигналов ещё не было. Здесь работают пять контейнеров, из них три объявлены в spec.initContainers с restartPolicy Always, а два в spec.containers, и на всех действует один terminationGracePeriodSeconds.",

  "Every container in spec.containers goes first. The Kubelet runs any preStop hook they declare and has the runtime send the stop signal to web and to redis, at different times and in an arbitrary order that nothing should rely on. No sidecar above has been signalled yet.":
    "Первыми идут все контейнеры из spec.containers. Kubelet запускает их хуки preStop, если они объявлены, и просит среду выполнения отправить web и redis сигнал остановки, в разное время и в произвольном порядке, на который полагаться не следует. Ни один sidecar выше ещё не получил сигнал.",

  "While web and redis are still winding down, the gate holds so that mesh-proxy keeps carrying their outbound calls, log-agent keeps tailing the file they write and otel-agent keeps shipping what they emit. A sidecar stopped alongside the app would cut a path the app still needs.":
    "Пока web и redis ещё сворачиваются, барьер держится, чтобы mesh-proxy продолжал пропускать их исходящие вызовы, log-agent следил за файлом, который они пишут, а otel-agent отправлял то, что они выдают. Sidecar, остановленный вместе с приложением, оборвал бы путь, который приложению ещё нужен.",

  "The last container in spec.containers has fully terminated, so the gate opens and the sidecars follow, in the reverse of the order they are declared in. The Kubelet walks the row from its end, and initContainers[2] is otel-agent, so otel-agent is the first sidecar to be signalled.":
    "Последний контейнер из spec.containers полностью завершился, так что барьер открывается и очередь доходит до sidecar, причём в порядке, обратном их объявлению. Kubelet обходит ряд с конца, а в initContainers[2] стоит otel-agent, поэтому otel-agent первым из sidecar получает сигнал.",

  "Next is initContainers[1], which is log-agent, while mesh-proxy at initContainers[0] is still running. The Kubelet walks the row backwards so that log-agent can flush its last lines out through mesh-proxy on the way down.":
    "Следующим идёт initContainers[1], то есть log-agent, а mesh-proxy в initContainers[0] всё ещё работает. Kubelet обходит ряд с конца для того, чтобы log-agent на выходе мог отправить свои последние строки через mesh-proxy.",

  "The mesh-proxy container is declared first, so it is stopped last, which is what kept a route open for the four that went before it. All five stops came out of the one budget the Pod carries, so if it runs out first, every sidecar not yet signalled is stopped at once with a short grace period.":
    "Контейнер mesh-proxy объявлен первым, поэтому останавливается последним, и за счёт этого маршрут оставался открытым для четырёх, ушедших раньше. Все пять остановок тратили время из одного бюджета Pod, так что если бюджет кончится раньше, каждый sidecar, ещё не получивший сигнал, сразу останавливается с коротким grace period.",
};
