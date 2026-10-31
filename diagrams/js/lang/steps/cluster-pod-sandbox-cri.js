// Russian for cluster-pod-sandbox-cri: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Pod sandbox via CRI: RunPodSandbox creates the network namespace, CNI wires it, and only then the pause container starts, then PullImage, CreateContainer and StartContainer launch the workload inside the sandbox":
    "Pod sandbox через CRI: RunPodSandbox создаёт сетевое пространство имён, CNI подключает его к сети, и только потом стартует контейнер pause, а затем PullImage, CreateContainer и StartContainer запускают рабочую нагрузку внутри sandbox",

  "Kubelet calls RunPodSandbox with the Pod metadata, labels, and resource hints. The runtime first creates the Pod network namespace, still with no IP. Every workload container will share it, with IPC and UTS, by default. The PID namespace is shared only when spec.shareProcessNamespace or spec.hostPID is set.":
    "Kubelet вызывает RunPodSandbox с метаданными Pod, метками и подсказками по ресурсам. Сначала среда выполнения создаёт сетевое пространство имён Pod, ещё без IP. По умолчанию все контейнеры рабочей нагрузки будут делить его, а также IPC и UTS. Пространство имён PID общее, только если задано поле spec.shareProcessNamespace или spec.hostPID.",

  "Inside the same RunPodSandbox call the runtime invokes the configured CNI plugin with the netns path. The plugin creates a veth pair, allocates an IP via IPAM, configures routes, and returns the result. Only then does the runtime start the pause container, which holds the network, IPC, and UTS namespaces.":
    "В том же вызове RunPodSandbox среда выполнения обращается к настроенному CNI plugin и передаёт ему путь к netns. Плагин создаёт пару veth, выделяет IP через IPAM, настраивает маршруты и возвращает результат. Только после этого среда выполнения запускает контейнер pause, который держит сетевое пространство имён, а также IPC и UTS.",

  "Kubelet calls PullImage for the app image, respecting imagePullPolicy and imagePullSecrets. The runtime fetches it from the registry into the Node image store. Under IfNotPresent Kubelet skips the call if the image is there, unless it pulled that private image with other credentials. No workload container exists yet.":
    "Kubelet вызывает PullImage для образа приложения с учётом imagePullPolicy и imagePullSecrets. Среда выполнения скачивает образ из реестра в хранилище образов на Node. Kubelet при IfNotPresent пропускает этот вызов, когда образ уже есть, если только он не скачал этот приватный образ с другими учётными данными. Контейнеров рабочей нагрузки ещё нет.",

  "Kubelet calls CreateContainer with the sandbox id, container config (command, env, mounts), and resource limits. The runtime prepares the rootfs and the mounts and writes those limits into the OCI spec, then returns a container id. The container now exists but is not yet running, and its cgroup is created when it starts.":
    "Kubelet вызывает CreateContainer с id sandbox, конфигурацией контейнера (command, env, mounts) и limits ресурсов. Среда выполнения готовит rootfs и точки монтирования, записывает эти limits в OCI spec, а затем возвращает id контейнера. Контейнер уже существует, но ещё не запущен, а его cgroup создаётся при старте.",

  "Kubelet calls StartContainer with the container id. The runtime forks the container ENTRYPOINT process inside the shared namespaces of the sandbox. The Pod workload is now running and the Pod reports Ready once every container is ready, after its readiness probe passes if it has one, and any readinessGates are True.":
    "Kubelet вызывает StartContainer с id контейнера. Среда выполнения запускает процесс ENTRYPOINT контейнера внутри общих пространств имён sandbox. Теперь рабочая нагрузка Pod запущена. Pod станет Ready, когда будут готовы все контейнеры (если есть readiness probe, то после её успеха) и все условия из readinessGates равны True.",
};
