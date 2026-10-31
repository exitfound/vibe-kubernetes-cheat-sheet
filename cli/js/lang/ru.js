// Russian for the /cli/ descriptions (the group paragraphs and the line under each command), keyed by
// the English text in ../data.js and loaded only while Russian is on. Commands, Kubernetes kinds,
// tool names and flags stay Latin. unit/cli-i18n.test.mjs checks the keys against data.js.
export const RU = {
  // Kubeadm (Installation)
  "Install kubeadm, kubelet, and kubectl on each Node. These steps are required before initializing or joining a cluster.":
    "Установка kubeadm, kubelet и kubectl на каждую Node. Эти шаги нужны до инициализации кластера или подключения к нему.",
  "Install prerequisites on Debian/Ubuntu":
    "Установить необходимые пакеты в Debian/Ubuntu",
  "Add the Kubernetes apt repository signing key":
    "Добавить ключ подписи apt-репозитория Kubernetes",
  "Add the Kubernetes apt repository":
    "Добавить apt-репозиторий Kubernetes",
  "Install kubelet, kubeadm, and kubectl":
    "Установить kubelet, kubeadm и kubectl",
  "Prevent automatic upgrades of Kubernetes packages":
    "Запретить автоматическое обновление пакетов Kubernetes",
  "Enable and start the kubelet service":
    "Включить и запустить службу kubelet",
  "Initialize the Control Plane, join worker Nodes, tear down clusters, and manage the upgrade lifecycle.":
    "Инициализация Control Plane, подключение рабочих Node, удаление кластеров и управление циклом обновлений.",
  "Initialize the Control Plane with a Pod network CIDR":
    "Инициализировать Control Plane с CIDR сети Pod",
  "Initialize with a shared load-balancer endpoint (HA)":
    "Инициализировать с общим адресом балансировщика нагрузки (HA)",
  "Initialize with a specific Kubernetes version":
    "Инициализировать с заданной версией Kubernetes",
  "Initialize with a specific CRI socket":
    "Инициализировать с заданным CRI-сокетом",
  "Generate a new join command for worker Nodes":
    "Сгенерировать новую команду join для рабочих Node",
  "Join a worker Node to the cluster":
    "Подключить рабочую Node к кластеру",
  "Join a secondary Control Plane Node (HA)":
    "Подключить дополнительную Node Control Plane (HA)",
  "Revert changes made by init or join on this Node":
    "Откатить изменения init или join на этой Node",
  "Force reset without confirmation prompts":
    "Сбросить без запроса подтверждения",
  "Check which versions are available to upgrade to":
    "Проверить, до каких версий можно обновиться",
  "Upgrade the Control Plane to a new version":
    "Обновить Control Plane до новой версии",
  "Upgrade a worker or secondary Control Plane Node":
    "Обновить рабочую или дополнительную Node Control Plane",
  "Upload configs, manage certificates, and generate kubeconfig files for cluster access.":
    "Загрузка конфигурации, управление сертификатами и генерация файлов kubeconfig для доступа к кластеру.",
  "Copy the admin kubeconfig to the current user after init":
    "Скопировать admin kubeconfig для текущего пользователя после init",
  "Upload the kubeadm configuration to the cluster ConfigMap":
    "Загрузить конфигурацию kubeadm в ConfigMap кластера",
  "Print default init configuration YAML":
    "Вывести конфигурацию init по умолчанию в YAML",
  "Print default join configuration YAML":
    "Вывести конфигурацию join по умолчанию в YAML",
  "Generate a certificate key for HA Control Plane join":
    "Сгенерировать ключ сертификатов для подключения к HA Control Plane",
  "Renew all Control Plane certificates":
    "Продлить все сертификаты Control Plane",
  "Check certificate expiration dates":
    "Проверить сроки действия сертификатов",
  "Upload Control Plane certificates to the cluster for HA join":
    "Загрузить сертификаты Control Plane в кластер для подключения в режиме HA",
  "View tokens, Node statuses, and cluster configuration details.":
    "Просмотр токенов, статусов Node и параметров конфигурации кластера.",
  "List all bootstrap tokens":
    "Список всех bootstrap-токенов",
  "View the kubeadm configuration stored in the cluster":
    "Посмотреть конфигурацию kubeadm, хранящуюся в кластере",
  // k3s (Installation)
  "Install k3s as a single binary. The server (Control Plane) and agent (worker) modes are selected via subcommands.":
    "Установка k3s в виде одного бинарного файла. При этом режимы server (Control Plane) и agent (рабочая Node) выбираются подкомандами.",
  "Install k3s server (Control Plane + worker)":
    "Установить k3s server (Control Plane + рабочая Node)",
  "Install a specific k3s version":
    "Установить заданную версию k3s",
  "Install k3s agent and join an existing server":
    "Установить k3s agent и подключить его к существующему server",
  "Install server in HA mode with embedded etcd":
    "Установить server в режиме HA со встроенным etcd",
  "Install binary without starting the service":
    "Установить бинарный файл без запуска службы",
  "Start, stop, and remove k3s services. Access the embedded kubectl and manage server/agent lifecycle.":
    "Запуск, остановка и удаление служб k3s, а также доступ к встроенному kubectl и управление жизненным циклом server/agent.",
  "Start the k3s server service":
    "Запустить службу k3s server",
  "Stop the k3s server service":
    "Остановить службу k3s server",
  "Restart the k3s server service":
    "Перезапустить службу k3s server",
  "Enable k3s to start on boot":
    "Включить автозапуск k3s при загрузке",
  "Disable k3s from starting on boot":
    "Отключить автозапуск k3s при загрузке",
  "Use the kubectl built into k3s":
    "Использовать kubectl, встроенный в k3s",
  "Start server with specific components disabled":
    "Запустить server, отключив заданные компоненты",
  "Run a Control Plane with no kubelet (experimental, Node is not registered)":
    "Запустить Control Plane без kubelet (экспериментально, Node не регистрируется)",
  "Uninstall k3s server and all data":
    "Удалить k3s server и все данные",
  "Uninstall k3s agent":
    "Удалить k3s agent",
  "Access kubeconfig, retrieve the Node token, and configure k3s via environment variables and config files.":
    "Доступ к kubeconfig, получение токена Node и настройка k3s через переменные окружения и файлы конфигурации.",
  "Print the kubeconfig file":
    "Вывести файл kubeconfig",
  "Copy kubeconfig for kubectl access":
    "Скопировать kubeconfig для доступа через kubectl",
  "Print the Node token (needed for agent join)":
    "Вывести токен Node (нужен для подключения agent)",
  "View the k3s config file":
    "Посмотреть файл конфигурации k3s",
  "Install with world-readable kubeconfig":
    "Установить с kubeconfig, доступным для чтения всем",
  "Check k3s version, service status, and running processes.":
    "Проверка версии k3s, статуса службы и запущенных процессов.",
  "Print k3s version":
    "Вывести версию k3s",
  "Check k3s server service status":
    "Проверить статус службы k3s server",
  "Follow k3s server logs":
    "Следить за журнальными сообщениями k3s server",
  "Follow k3s agent logs":
    "Следить за журнальными сообщениями k3s agent",
  // k3d (Installation)
  "Install k3d, a lightweight wrapper that runs k3s clusters in Docker containers.":
    "Установка k3d, лёгкой обёртки для запуска кластеров k3s в контейнерах Docker.",
  "Install k3d via Homebrew":
    "Установить k3d через Homebrew",
  "Install k3d via official script":
    "Установить k3d официальным скриптом",
  "Print k3d version":
    "Вывести версию k3d",
  "Create, start, stop, and delete lightweight Kubernetes clusters using k3d.":
    "Создание, запуск, остановка и удаление лёгких кластеров Kubernetes с помощью k3d.",
  "Create a k3d cluster":
    "Создать кластер k3d",
  "Create a multi-agent cluster":
    "Создать кластер с несколькими agent",
  "Create a multi-server (HA) cluster":
    "Создать кластер с несколькими server (HA)",
  "Create cluster with port mapping":
    "Создать кластер с пробросом портов",
  "Create cluster with a local registry":
    "Создать кластер с локальным реестром",
  "Create cluster with custom k3s args":
    "Создать кластер со своими аргументами k3s",
  "Create with a specific k3s image":
    "Создать с заданным образом k3s",
  "Delete a k3d cluster":
    "Удалить кластер k3d",
  "Delete all k3d clusters":
    "Удалить все кластеры k3d",
  "Start a stopped k3d cluster":
    "Запустить остановленный кластер k3d",
  "Stop a running k3d cluster":
    "Остановить работающий кластер k3d",
  "Manage individual k3d Nodes and container registries for local image distribution.":
    "Управление отдельными Node k3d и реестрами контейнеров для локальной раздачи образов.",
  "Add a Node to an existing cluster":
    "Добавить Node в существующий кластер",
  "Delete a k3d Node":
    "Удалить Node k3d",
  "List all k3d Nodes":
    "Список всех Node k3d",
  "Create a local container registry":
    "Создать локальный реестр контейнеров",
  "Delete a k3d registry":
    "Удалить реестр k3d",
  "List all k3d registries":
    "Список всех реестров k3d",
  "Import local container images into k3d clusters for testing without a registry.":
    "Импорт локальных образов контейнеров в кластеры k3d для тестирования без реестра.",
  "Import an image into a cluster":
    "Импортировать образ в кластер",
  "Import multiple images":
    "Импортировать несколько образов",
  "Import from a tar archive":
    "Импортировать из tar-архива",
  "List clusters, Nodes, registries, and retrieve kubeconfig for cluster access.":
    "Список кластеров, Node, реестров и получение kubeconfig для доступа к кластеру.",
  "List all k3d clusters":
    "Список всех кластеров k3d",
  "Get kubeconfig for a cluster":
    "Получить kubeconfig кластера",
  "Merge kubeconfig and switch context":
    "Объединить kubeconfig и переключить контекст",
  // KinD (Installation)
  "Install kind (Kubernetes IN Docker), a tool for running local Kubernetes clusters using Docker containers as Nodes.":
    "Установка kind (Kubernetes IN Docker), инструмента для запуска локальных кластеров Kubernetes, где Node работают в контейнерах Docker.",
  "Install kind via Homebrew":
    "Установить kind через Homebrew",
  "Install kind binary on Linux amd64":
    "Установить бинарный файл kind на Linux amd64",
  "Print kind version":
    "Вывести версию kind",
  "Create and delete kind clusters, configure multi-node topologies, and manage cluster lifecycle.":
    "Создание и удаление кластеров kind, настройка топологий с несколькими Node и управление жизненным циклом кластера.",
  "Create a named kind cluster":
    "Создать кластер kind с заданным именем",
  "Create cluster from config file (multi-node, HA)":
    "Создать кластер из файла конфигурации (несколько Node, HA)",
  "Create cluster with a specific Node image":
    "Создать кластер с заданным образом Node",
  "Create cluster and retain Nodes on failure for debugging":
    "Создать кластер и при сбое сохранить Node для отладки",
  "Delete a named kind cluster":
    "Удалить кластер kind по имени",
  "Delete multiple clusters":
    "Удалить несколько кластеров",
  "Load container images into kind Nodes and export cluster logs for debugging.":
    "Загрузка образов контейнеров в Node kind и экспорт журнальных сообщений кластера для отладки.",
  "Load a Docker image into a cluster":
    "Загрузить образ Docker в кластер",
  "Load image into specific Nodes":
    "Загрузить образ в заданные Node",
  "Load an image from a tar archive":
    "Загрузить образ из tar-архива",
  "Build a custom Node image":
    "Собрать свой образ Node",
  "Export cluster logs to a local directory":
    "Экспортировать журнальные сообщения кластера в локальный каталог",
  "Export logs to a specific directory":
    "Экспортировать журнальные сообщения в заданный каталог",
  "List clusters and retrieve kubeconfig for cluster access.":
    "Список кластеров и получение kubeconfig для доступа к кластеру.",
  "List all kind clusters":
    "Список всех кластеров kind",
  "List Nodes in a kind cluster":
    "Список Node в кластере kind",
  "Get kubeconfig for a specific cluster":
    "Получить kubeconfig заданного кластера",
  "Export kubeconfig and set current context":
    "Экспортировать kubeconfig и задать текущий контекст",
  // Minikube (Installation)
  "Install minikube, a tool that runs a single-node Kubernetes cluster locally using a VM or container runtime.":
    "Установка minikube, инструмента для локального запуска кластера Kubernetes из одной Node в VM или в среде выполнения контейнеров.",
  "Install minikube via Homebrew":
    "Установить minikube через Homebrew",
  "Install minikube binary on Linux amd64":
    "Установить бинарный файл minikube на Linux amd64",
  "Print minikube version":
    "Вывести версию minikube",
  "Start, stop, delete, and manage minikube clusters with support for multiple profiles and drivers.":
    "Запуск, остановка и удаление кластеров minikube, работа с несколькими профилями и драйверами.",
  "Start a cluster with the Docker driver":
    "Запустить кластер с драйвером Docker",
  "Start a cluster with the Podman driver":
    "Запустить кластер с драйвером Podman",
  "Start a cluster with the VirtualBox driver":
    "Запустить кластер с драйвером VirtualBox",
  "Start a cluster with the QEMU driver (Linux, macOS)":
    "Запустить кластер с драйвером QEMU (Linux, macOS)",
  "Start a cluster with the vfkit driver (macOS)":
    "Запустить кластер с драйвером vfkit (macOS)",
  "Start with a specific Kubernetes version":
    "Запустить с заданной версией Kubernetes",
  "Start a named profile (multi-cluster)":
    "Запустить профиль с заданным именем (несколько кластеров)",
  "Start a multi-node cluster":
    "Запустить кластер с несколькими Node",
  "Start with custom CPU and memory":
    "Запустить со своими значениями CPU и памяти",
  "Start with the CRI-O runtime (the default is picked automatically)":
    "Запустить со средой выполнения CRI-O (по умолчанию она выбирается автоматически)",
  "Stop the current minikube cluster":
    "Остановить текущий кластер minikube",
  "Stop a specific profile":
    "Остановить заданный профиль",
  "Delete the current minikube cluster":
    "Удалить текущий кластер minikube",
  "Delete a specific profile":
    "Удалить заданный профиль",
  "Delete all profiles":
    "Удалить все профили",
  "Enable addons (ingress, dashboard, metrics-server), expose Services, and open the Dashboard.":
    "Включение аддонов (ingress, dashboard, metrics-server), публикация Service и открытие Dashboard.",
  "List all addons and their status":
    "Список всех аддонов и их статус",
  "Enable the NGINX Ingress Controller":
    "Включить NGINX Ingress Controller",
  "Enable metrics-server for kubectl top":
    "Включить metrics-server для kubectl top",
  "Enable the local Docker registry addon":
    "Включить аддон локального реестра Docker",
  "Enable the Kubernetes Dashboard":
    "Включить Kubernetes Dashboard",
  "Enable an addon":
    "Включить аддон",
  "Disable an addon":
    "Отключить аддон",
  "Open the Kubernetes Dashboard in browser":
    "Открыть Kubernetes Dashboard в браузере",
  "Print Dashboard URL without opening":
    "Вывести URL Dashboard, не открывая браузер",
  "Open a Service endpoint in browser":
    "Открыть адрес Service в браузере",
  "Print Service URL without opening":
    "Вывести URL Service, не открывая браузер",
  "Create a network tunnel for LoadBalancer Services":
    "Создать сетевой туннель для Service типа LoadBalancer",
  "Load local images into minikube, SSH into the Node, copy files, and build images inside the cluster.":
    "Загрузка локальных образов в minikube, подключение по SSH к Node, копирование файлов и сборка образов внутри кластера.",
  "Load a local image into minikube":
    "Загрузить локальный образ в minikube",
  "Load image, overwriting if it exists (the default)":
    "Загрузить образ с перезаписью, если он уже есть (по умолчанию)",
  "List images in the minikube container runtime":
    "Список образов в среде выполнения контейнеров minikube",
  "Build an image inside minikube":
    "Собрать образ внутри minikube",
  "SSH into the minikube Node":
    "Подключиться по SSH к Node minikube",
  "Run a command on the minikube Node":
    "Выполнить команду на Node minikube",
  "Copy files to/from minikube Node":
    "Скопировать файлы на Node minikube или с неё",
  "Check cluster status, list profiles, view Services, and manage persistent configuration.":
    "Проверка статуса кластера, просмотр профилей и Service, управление постоянной конфигурацией.",
  "Show cluster status and health":
    "Показать статус и состояние кластера",
  "List all minikube profiles":
    "Список всех профилей minikube",
  "Switch to a specific profile":
    "Переключиться на заданный профиль",
  "List Services and their URLs":
    "Список Service и их URL",
  "View all config values":
    "Посмотреть все значения конфигурации",
  "Set the default driver":
    "Задать драйвер по умолчанию",
  "Set default memory in MB":
    "Задать объём памяти по умолчанию в MB",
  "Set default CPU count":
    "Задать число CPU по умолчанию",
  // Cluster Health (Cluster)
  "Explore supported API resource types, versions, and field-level documentation.":
    "Изучение поддерживаемых типов ресурсов API, их версий и документации по отдельным полям.",
  "List all available resource types":
    "Список всех доступных типов ресурсов",
  "Cluster-scoped resources only":
    "Только ресурсы уровня кластера",
  "Namespaced resources only":
    "Только ресурсы уровня Namespace",
  "All API groups and versions supported":
    "Все поддерживаемые группы и версии API",
  "API documentation for a resource type":
    "Документация API по типу ресурса",
  "Docs for a specific field path":
    "Документация по заданному пути к полю",
  "Inspect ResourceQuotas, LimitRanges, PodDisruptionBudgets, and PriorityClasses across the cluster.":
    "Просмотр ResourceQuota, LimitRange, PodDisruptionBudget и PriorityClass во всём кластере.",
  "LimitRange details and defaults":
    "Подробности LimitRange и значения по умолчанию",
  "PDB details and disruption allowance":
    "Подробности PDB и число допустимых прерываний",
  "ResourceQuota details and current usage":
    "Подробности ResourceQuota и текущее потребление",
  "Container and Pod LimitRanges in all Namespaces":
    "LimitRange для контейнеров и Pod во всех Namespace",
  "PodDisruptionBudgets cluster-wide":
    "PodDisruptionBudget во всём кластере",
  "Pod PriorityClasses":
    "PriorityClass для Pod",
  "ResourceQuotas across all Namespaces":
    "ResourceQuota во всех Namespace",
  "List and inspect validating and mutating Admission Webhook configurations.":
    "Список и просмотр конфигураций валидирующих и мутирующих Admission Webhook.",
  "Mutation rules, Namespaces, and endpoint":
    "Правила мутации, Namespace и адрес",
  "Validation rules, Namespaces, and endpoint":
    "Правила валидации, Namespace и адрес",
  "Mutating Admission Webhooks":
    "Мутирующие Admission Webhook",
  "Validating Admission Webhooks":
    "Валидирующие Admission Webhook",
  "Manage certificate signing requests (CSRs). Nodes and users submit CSRs to obtain signed certificates. A cluster admin approves or denies them.":
    "Управление запросами на подпись сертификатов (CSR). Node и пользователи отправляют CSR, чтобы получить подписанные сертификаты, а одобряет или отклоняет CSR администратор кластера.",
  "Approve a certificate signing request":
    "Одобрить запрос на подпись сертификата",
  "Deny a certificate signing request":
    "Отклонить запрос на подпись сертификата",
  "Delete a processed CSR":
    "Удалить обработанный CSR",
  "Inspect CSR details and requestor":
    "Посмотреть подробности CSR и его отправителя",
  "List all certificate signing requests":
    "Список всех запросов на подпись сертификатов",
  // Nodes (Cluster)
  "Monitor real-time CPU and memory consumption across Nodes and Pods.":
    "Мониторинг потребления CPU и памяти по Node и Pod в реальном времени.",
  "CPU and memory usage for a specific Node":
    "Потребление CPU и памяти заданной Node",
  "CPU and memory usage per Node":
    "Потребление CPU и памяти по каждой Node",
  "Nodes sorted by CPU usage":
    "Node, отсортированные по потреблению CPU",
  "Nodes sorted by memory usage":
    "Node, отсортированные по потреблению памяти",
  "CPU and memory usage for all Pods":
    "Потребление CPU и памяти всех Pod",
  "Pods sorted by CPU usage":
    "Pod, отсортированные по потреблению CPU",
  "Pods sorted by memory usage":
    "Pod, отсортированные по потреблению памяти",
  "Control which Nodes accept new workloads using cordon, uncordon, and drain.":
    "Управление тем, какие Node принимают новые рабочие нагрузки, с помощью cordon, uncordon и drain.",
  "Mark Node as unschedulable":
    "Пометить Node как недоступную для планирования",
  "Simulate drain without evicting any Pods":
    "Сымитировать drain без вытеснения Pod",
  "Force drain (removes unmanaged Pods)":
    "Принудительно выполнить drain (удаляет неуправляемые Pod)",
  "Drain even Pods with emptyDir (their data is deleted)":
    "Выполнить drain, включая Pod с emptyDir (их данные удаляются)",
  "Cordon a Node and evict its Pods (DaemonSet Pods stay)":
    "Закрыть Node для планирования и вытеснить её Pod (Pod DaemonSet остаются)",
  "Mark Node as schedulable again":
    "Снова сделать Node доступной для планирования",
  "Wait until Node becomes Ready":
    "Дождаться, пока Node перейдёт в Ready",
  "Repel Pods using taints, organize Nodes with labels and store metadata in annotations.":
    "Taint, чтобы не пускать Pod на Node, метки для группировки Node и аннотации для метаданных.",
  "Remove an annotation from a Node":
    "Удалить аннотацию с Node",
  "Add or update a Node annotation":
    "Добавить или обновить аннотацию Node",
  "Filter Nodes by label":
    "Отфильтровать Node по метке",
  "Remove a label from a Node":
    "Удалить метку с Node",
  "Add a label to a Node":
    "Добавить метку на Node",
  "Remove a taint from Node":
    "Удалить taint с Node",
  "Add NoExecute taint to Node":
    "Добавить на Node taint NoExecute",
  "Add NoSchedule taint to Node":
    "Добавить на Node taint NoSchedule",
  "View Node details, status, internal IP, OS, and container runtime version.":
    "Просмотр подробностей Node, их статуса, внутренних IP, ОС и версии среды выполнения контейнеров.",
  "Node details, conditions, capacity":
    "Подробности Node, её conditions и capacity",
  "Get Node manifest as YAML":
    "Получить манифест Node в YAML",
  "Custom columns: name, version, and OS":
    "Свои колонки: имя, версия и ОС",
  "Nodes with all their labels":
    "Node со всеми метками",
  "Nodes with IPs, OS image, kernel version, container runtime":
    "Node с IP, образом ОС, версией ядра и средой выполнения контейнеров",
  "List all Nodes in the cluster":
    "Список всех Node в кластере",
  // Custom Resources (Cluster)
  "Install, update, and remove CustomResourceDefinitions that extend the Kubernetes API with new resource types.":
    "Установка, обновление и удаление CustomResourceDefinition, расширяющих API Kubernetes новыми типами ресурсов.",
  "Install or update a CRD":
    "Установить или обновить CRD",
  "Remove a CRD and all its Custom Resources":
    "Удалить CRD и все его Custom Resource",
  "Edit CRD in $EDITOR":
    "Редактировать CRD в $EDITOR",
  "List installed CRDs and inspect their versions, schema, and acceptance status.":
    "Список установленных CRD и просмотр их версий, схемы и статуса принятия.",
  "Full CRD details, versions, schema, and conditions":
    "Полное описание CRD: версии, схема и conditions",
  "List all CustomResourceDefinitions":
    "Список всех CustomResourceDefinition",
  "List all API versions defined by a CRD":
    "Список всех версий API, заданных в CRD",
  "Get full CRD manifest as YAML":
    "Получить полный манифест CRD в YAML",
  "List all instances of a Custom Resource":
    "Список всех экземпляров Custom Resource",
  "Get a Custom Resource instance as YAML":
    "Получить экземпляр Custom Resource в YAML",
  "Explore all available API resources and versions, and inspect resource field schemas directly from the API Server.":
    "Обзор всех доступных ресурсов и версий API, просмотр схем их полей прямо с API Server.",
  "List all available API resources":
    "Список всех доступных ресурсов API",
  "Resources in a specific API group":
    "Ресурсы в заданной группе API",
  "Namespace-scoped resources only":
    "Только ресурсы уровня Namespace",
  "List all API versions in the cluster":
    "Список всех версий API в кластере",
  "Describe a resource and its top-level fields":
    "Описать ресурс и его поля верхнего уровня",
  "Show full nested field tree":
    "Показать полное дерево вложенных полей",
  "Explain a specific nested field":
    "Описать заданное вложенное поле",
  // Contexts (Cluster)
  "Create, update, rename, switch, and delete contexts in kubeconfig.":
    "Создание, обновление, переименование, переключение и удаление контекстов в kubeconfig.",
  "Delete a context":
    "Удалить контекст",
  "Rename a context":
    "Переименовать контекст",
  "Change cluster for current context":
    "Сменить кластер текущего контекста",
  "Set default Namespace for current context":
    "Задать Namespace по умолчанию для текущего контекста",
  "Create or update a context":
    "Создать или обновить контекст",
  "Remove a context entry from kubeconfig":
    "Удалить запись контекста из kubeconfig",
  "Switch to a different context":
    "Переключиться на другой контекст",
  "Add, update, and remove cluster endpoints and user credentials in kubeconfig.":
    "Добавление, обновление и удаление адресов кластеров и учётных данных пользователей в kubeconfig.",
  "Remove a cluster from kubeconfig":
    "Удалить кластер из kubeconfig",
  "Remove a user from kubeconfig":
    "Удалить пользователя из kubeconfig",
  "Add or update a cluster endpoint":
    "Добавить или обновить адрес кластера",
  "Disable TLS verification for cluster":
    "Отключить проверку TLS для кластера",
  "Add or update certificate-based user credentials":
    "Добавить или обновить учётные данные пользователя по сертификату",
  "Add or update token-based user credentials":
    "Добавить или обновить учётные данные пользователя по токену",
  "Inspect kubeconfig, list available contexts, clusters, and users.":
    "Просмотр kubeconfig и списка доступных контекстов, кластеров и пользователей.",
  "Show active context":
    "Показать активный контекст",
  "List all clusters in kubeconfig":
    "Список всех кластеров в kubeconfig",
  "List all kubeconfig contexts":
    "Список всех контекстов kubeconfig",
  "List all users in kubeconfig":
    "Список всех пользователей в kubeconfig",
  "Self-contained kubeconfig with certs and tokens inlined (contains secrets)":
    "Самодостаточный kubeconfig со встроенными сертификатами и токенами (содержит секреты)",
  "View current context config only":
    "Посмотреть только конфигурацию текущего контекста",
  "Full kubeconfig including credentials (for backup/migration)":
    "Полный kubeconfig вместе с учётными данными (для резервной копии или переноса)",
  "View merged kubeconfig (credentials redacted)":
    "Посмотреть объединённый kubeconfig (учётные данные скрыты)",
  // Pods (Workloads)
  "Apply manifests, run standalone Pods imperatively, and remove them by name, file, or label.":
    "Применение манифестов, императивный запуск отдельных Pod и их удаление по имени, файлу или метке.",
  "Create or update Pod from manifest":
    "Создать или обновить Pod из манифеста",
  "Delete Pod defined in manifest":
    "Удалить Pod, описанный в манифесте",
  "Delete a Pod gracefully":
    "Корректно удалить Pod",
  "Force-delete a stuck Pod":
    "Принудительно удалить зависший Pod",
  "Delete Pods by label selector":
    "Удалить Pod по селектору меток",
  "Preview changes before applying Pod manifest":
    "Посмотреть изменения перед применением манифеста Pod",
  "Create a standalone Pod":
    "Создать отдельный Pod",
  "Ephemeral debug Pod (auto-deletes)":
    "Временный отладочный Pod (удаляется сам)",
  "Get inside a running Pod to execute commands, transfer files, or forward ports locally.":
    "Выполнение команд внутри запущенного Pod, передача файлов или локальный проброс портов.",
  "Copy file from local to Pod":
    "Скопировать файл с локальной машины в Pod",
  "Copy file from Pod to local":
    "Скопировать файл из Pod на локальную машину",
  "Open interactive shell in Pod":
    "Открыть интерактивную оболочку в Pod",
  "Shell into a specific container":
    "Открыть оболочку в заданном контейнере",
  "Run a one-off command in Pod":
    "Выполнить разовую команду в Pod",
  "Forward localhost:8080 → pod:80":
    "Пробросить localhost:8080 → pod:80",
  "Forward local port to Pod":
    "Пробросить локальный порт на Pod",
  "Attach to the main process of a Pod container":
    "Подключиться к основному процессу контейнера Pod",
  "Attach to a specific container":
    "Подключиться к заданному контейнеру",
  "Forward localhost:8080 → service:80":
    "Пробросить localhost:8080 → service:80",
  "Stream, filter, and retrieve logs from Pod containers.":
    "Получение журнальных сообщений контейнеров Pod, их фильтрация и вывод в реальном времени.",
  "Last 10 lines from every container of each Pod matching the label (add --tail=-1 for all)":
    "Последние 10 строк из каждого контейнера во всех Pod с этой меткой (для всех строк добавьте --tail=-1)",
  "Logs from the last hour":
    "Журнальные сообщения за последний час",
  "Print last 100 lines":
    "Вывести последние 100 строк",
  "Logs from a specific container":
    "Журнальные сообщения заданного контейнера",
  "Follow / stream Pod logs":
    "Следить за журнальными сообщениями Pod",
  "Print Pod logs (stdout and stderr)":
    "Вывести журнальные сообщения Pod (stdout и stderr)",
  "List Pods across Namespaces, filter them by label or field selector, and pick the output format.":
    "Список Pod во всех Namespace, фильтрация по метке или селектору полей и выбор формата вывода.",
  "List Pods in current Namespace":
    "Список Pod в текущем Namespace",
  "List all Pods across all Namespaces":
    "Список всех Pod во всех Namespace",
  "Find all non-Running Pods across the cluster":
    "Найти все Pod не в статусе Running во всём кластере",
  "Filter Pods by field selector":
    "Отфильтровать Pod по селектору полей",
  "Filter Pods by label selector":
    "Отфильтровать Pod по селектору меток",
  "Pods in a specific Namespace":
    "Pod в заданном Namespace",
  "Show IP, Node and Nominated Node":
    "Показать IP, Node и Nominated Node",
  "Watch Pod status changes in real time":
    "Следить за изменениями статуса Pod",
  "Examine a specific Pod, including its manifest, container layout, Node placement, and resource usage.":
    "Разбор заданного Pod с манифестом, контейнерами, местом на Node и потреблением ресурсов.",
  "Full Pod details, events and status":
    "Полное описание Pod, события и статус",
  "List all container names in a Pod":
    "Список имён всех контейнеров в Pod",
  "Which Node the Pod is running on":
    "На какой Node запущен Pod",
  "Get Pod IP as a one-liner":
    "Получить IP Pod одной строкой",
  "Get Pod manifest as YAML":
    "Получить манифест Pod в YAML",
  "CPU and memory usage for Pods":
    "Потребление CPU и памяти Pod",
  "Sort Pods by CPU usage":
    "Отсортировать Pod по потреблению CPU",
  "Wait until Pod is Ready":
    "Дождаться, пока Pod станет Ready",
  "Wait for all matching Pods to be Ready":
    "Дождаться, пока все подходящие Pod станут Ready",
  // Deployments (Workloads)
  "Apply manifests, create and modify Deployments imperatively, and remove them from the cluster.":
    "Применение манифестов, императивное создание и изменение Deployment и их удаление из кластера.",
  "Apply all manifests in a directory":
    "Применить все манифесты в каталоге",
  "Apply a manifest from file":
    "Применить манифест из файла",
  "Create a Deployment imperatively":
    "Императивно создать Deployment",
  "Create Deployment with replica count":
    "Создать Deployment с заданным числом реплик",
  "Delete resources defined in file":
    "Удалить ресурсы, описанные в файле",
  "Delete all Deployments in Namespace":
    "Удалить все Deployment в Namespace",
  "Delete a Deployment":
    "Удалить Deployment",
  "Preview changes before applying Deployment":
    "Посмотреть изменения перед применением Deployment",
  "Edit Deployment in $EDITOR":
    "Редактировать Deployment в $EDITOR",
  "Patch Deployment with JSON":
    "Изменить Deployment патчем в формате JSON",
  "Set or update environment variable":
    "Задать или обновить переменную окружения",
  "Update container image":
    "Обновить образ контейнера",
  "Set resource limits on containers":
    "Задать limits ресурсов для контейнеров",
  "Adjust replica count manually or automatically with a HorizontalPodAutoscaler.":
    "Изменение числа реплик вручную или автоматически с помощью HorizontalPodAutoscaler.",
  "Create a HorizontalPodAutoscaler":
    "Создать HorizontalPodAutoscaler",
  "Delete a HorizontalPodAutoscaler":
    "Удалить HorizontalPodAutoscaler",
  "List HorizontalPodAutoscalers":
    "Список HorizontalPodAutoscaler",
  "Scale Deployment to N replicas":
    "Масштабировать Deployment до N реплик",
  "Track, pause, resume, and roll back Deployment updates across revisions.":
    "Отслеживание, приостановка, возобновление и откат обновлений Deployment по ревизиям.",
  "Show revision history":
    "Показать историю ревизий",
  "Pause an in-progress rollout":
    "Приостановить текущий rollout",
  "Trigger a rolling restart":
    "Запустить поэтапный перезапуск",
  "Resume a paused rollout":
    "Возобновить приостановленный rollout",
  "Watch rollout progress":
    "Следить за ходом rollout",
  "Wait for rollout with bounded timeout (CI-friendly)":
    "Дождаться завершения rollout с ограничением по времени (удобно для CI)",
  "Roll back to a specific revision":
    "Откатить к заданной ревизии",
  "Set change cause shown in rollout history":
    "Задать причину изменения для истории rollout",
  "Roll back to the previous revision":
    "Откатить к предыдущей ревизии",
  "Wait until Deployment is Available":
    "Дождаться, пока Deployment станет Available",
  "View Deployments and their current state, replica count, and age.":
    "Просмотр Deployment с текущим состоянием, числом реплик и возрастом.",
  "Full Deployment details and events":
    "Полное описание Deployment и события",
  "All Deployments across Namespaces":
    "Все Deployment во всех Namespace",
  "Deployments in a specific Namespace":
    "Deployment в заданном Namespace",
  "Get Deployment manifest as YAML":
    "Получить манифест Deployment в YAML",
  "List Deployments in current Namespace":
    "Список Deployment в текущем Namespace",
  // StatefulSets (Workloads)
  "Create, update, scale, and delete StatefulSets and their associated Pods.":
    "Создание, обновление, масштабирование и удаление StatefulSet и связанных с ними Pod.",
  "Apply StatefulSet from manifest":
    "Применить StatefulSet из манифеста",
  "Delete a StatefulSet":
    "Удалить StatefulSet",
  "Delete StatefulSet, keep its Pods":
    "Удалить StatefulSet, сохранив его Pod",
  "Edit StatefulSet in $EDITOR":
    "Редактировать StatefulSet в $EDITOR",
  "Scale to N replicas":
    "Масштабировать до N реплик",
  "Track, restart, and roll back StatefulSet updates.":
    "Отслеживание, перезапуск и откат обновлений StatefulSet.",
  "View StatefulSets and their replica count, age, and current state.":
    "Просмотр StatefulSet с числом реплик, возрастом и текущим состоянием.",
  "Full StatefulSet details and events":
    "Полное описание StatefulSet и события",
  "Get StatefulSet manifest as YAML":
    "Получить манифест StatefulSet в YAML",
  "List StatefulSets in current Namespace":
    "Список StatefulSet в текущем Namespace",
  "All StatefulSets across Namespaces":
    "Все StatefulSet во всех Namespace",
  "StatefulSets in a specific Namespace":
    "StatefulSet в заданном Namespace",
  "Short alias for get statefulsets":
    "Короткий алиас для get statefulsets",
  // DaemonSets (Workloads)
  "Create, update, and delete DaemonSets. Control which Nodes they run on using nodeSelector.":
    "Создание, обновление и удаление DaemonSet. С помощью nodeSelector можно выбрать, на каких Node они запускаются.",
  "Apply DaemonSet from manifest":
    "Применить DaemonSet из манифеста",
  "Delete a DaemonSet and all its Pods":
    "Удалить DaemonSet и все его Pod",
  "Edit DaemonSet in $EDITOR":
    "Редактировать DaemonSet в $EDITOR",
  "Track, restart, and roll back DaemonSet updates across all Nodes.":
    "Отслеживание, перезапуск и откат обновлений DaemonSet на всех Node.",
  "Trigger a rolling restart on all Nodes":
    "Запустить поэтапный перезапуск на всех Node",
  "Watch rollout progress across Nodes":
    "Следить за ходом rollout по всем Node",
  "View DaemonSets and how many Pods are scheduled, ready, and available across Nodes.":
    "Просмотр DaemonSet и числа размещённых, готовых и доступных Pod на всех Node.",
  "Full DaemonSet details and events":
    "Полное описание DaemonSet и события",
  "Get DaemonSet manifest as YAML":
    "Получить манифест DaemonSet в YAML",
  "List DaemonSets in current Namespace":
    "Список DaemonSet в текущем Namespace",
  "All DaemonSets across Namespaces":
    "Все DaemonSet во всех Namespace",
  "DaemonSets in a specific Namespace":
    "DaemonSet в заданном Namespace",
  "Short alias for get daemonsets":
    "Короткий алиас для get daemonsets",
  // Services (Workloads)
  "Create Services imperatively or from manifests, edit, and remove them from the cluster.":
    "Создание Service императивно или из манифестов, их редактирование и удаление из кластера.",
  "Apply Service from manifest":
    "Применить Service из манифеста",
  "Create a ClusterIP Service imperatively":
    "Императивно создать Service типа ClusterIP",
  "Create a LoadBalancer Service imperatively":
    "Императивно создать Service типа LoadBalancer",
  "Create a NodePort Service imperatively":
    "Императивно создать Service типа NodePort",
  "Delete Service defined in manifest":
    "Удалить Service, описанный в манифесте",
  "Delete all Services in Namespace":
    "Удалить все Service в Namespace",
  "Delete a Service":
    "Удалить Service",
  "Edit Service in $EDITOR":
    "Редактировать Service в $EDITOR",
  "Expose Deployments as Services or forward a local port for direct access without external exposure.":
    "Публикация Deployment через Service или проброс локального порта для прямого доступа без открытия наружу.",
  "Create ClusterIP Service":
    "Создать Service типа ClusterIP",
  "Create LoadBalancer Service":
    "Создать Service типа LoadBalancer",
  "Create NodePort Service":
    "Создать Service типа NodePort",
  "Forward local port to Deployment":
    "Пробросить локальный порт на Deployment",
  "Forward local port to Service":
    "Пробросить локальный порт на Service",
  "View Services, their type, cluster IP, ports, and resolved endpoints.":
    "Просмотр Service с типом, cluster IP, портами и эндпоинтами.",
  "Service details, selectors, endpoints":
    "Подробности Service, селекторы и эндпоинты",
  "View EndpointSlices backing a Service":
    "Показать EndpointSlice, связанные с Service",
  "List EndpointSlices (successor to the deprecated Endpoints API)":
    "Список EndpointSlice (замена устаревшего API Endpoints)",
  "Short alias for get endpoints (API deprecated since v1.33)":
    "Короткий алиас для get endpoints (API устарел с v1.33)",
  "List Services in current Namespace":
    "Список Service в текущем Namespace",
  "All Services across Namespaces":
    "Все Service во всех Namespace",
  "Services in a specific Namespace":
    "Service в заданном Namespace",
  "Services with the Selector column":
    "Service с колонкой Selector",
  "Get Service manifest as YAML":
    "Получить манифест Service в YAML",
  // ConfigMaps & Secrets (Workloads)
  "Create ConfigMaps and Secrets from literals, files, or manifests, edit them in-place, and remove them.":
    "Создание ConfigMap и Secret из литералов, файлов или манифестов, их редактирование на месте и удаление.",
  "Apply ConfigMap from manifest":
    "Применить ConfigMap из манифеста",
  "Create from .env file":
    "Создать из файла .env",
  "Create from file (filename = key)":
    "Создать из файла (имя файла станет ключом)",
  "Create from key=value literal":
    "Создать из литерала key=value",
  "Delete a ConfigMap":
    "Удалить ConfigMap",
  "Edit ConfigMap in-place":
    "Редактировать ConfigMap на месте",
  "Apply Secret from manifest":
    "Применить Secret из манифеста",
  "Create image pull Secret":
    "Создать Secret для загрузки образов",
  "Create pull Secret from existing docker config":
    "Создать Secret для загрузки образов из готового docker config",
  "Create generic Secret from file":
    "Создать generic Secret из файла",
  "Create generic Secret from literal":
    "Создать generic Secret из литерала",
  "Create TLS Secret from cert/key files":
    "Создать TLS Secret из файлов сертификата и ключа",
  "Delete a Secret":
    "Удалить Secret",
  "Edit Secret in-place (base64 values)":
    "Редактировать Secret на месте (значения в base64)",
  "List ConfigMaps and read their keys and values across Namespaces.":
    "Список ConfigMap и чтение их ключей и значений во всех Namespace.",
  "ConfigMap details with data keys and values":
    "Подробности ConfigMap с ключами и значениями из data",
  "Short alias for get configmaps":
    "Короткий алиас для get configmaps",
  "ConfigMaps in a Namespace":
    "ConfigMap в Namespace",
  "Read a specific value from ConfigMap":
    "Прочитать значение заданного ключа из ConfigMap",
  "Get full ConfigMap as YAML":
    "Получить ConfigMap целиком в YAML",
  "List ConfigMaps in current Namespace":
    "Список ConfigMap в текущем Namespace",
  "All ConfigMaps across Namespaces":
    "Все ConfigMap во всех Namespace",
  "List Secrets and extract or decode their base64-encoded values.":
    "Список Secret, извлечение и декодирование их значений из base64.",
  "Secret metadata (values are hidden)":
    "Метаданные Secret (значения скрыты)",
  "Decode a Secret value directly":
    "Сразу декодировать значение Secret",
  "Extract a base64-encoded value":
    "Извлечь значение в кодировке base64",
  "Get full Secret as YAML":
    "Получить Secret целиком в YAML",
  "List Secrets in current Namespace":
    "Список Secret в текущем Namespace",
  "All Secrets across Namespaces":
    "Все Secret во всех Namespace",
  "Secrets in a specific Namespace":
    "Secret в заданном Namespace",
  // Jobs & CronJobs (Workloads)
  "Create Jobs imperatively, trigger CronJobs manually, and clean up completed runs.":
    "Императивное создание Job, ручной запуск CronJob и очистка завершённых запусков.",
  "Apply Job from manifest":
    "Применить Job из манифеста",
  "Trigger a CronJob manually as a one-off Job":
    "Вручную запустить CronJob как разовую Job",
  "Create a simple Job imperatively":
    "Императивно создать простую Job",
  "Delete Job and its Pods":
    "Удалить Job и её Pod",
  "Delete all Jobs in a Namespace":
    "Удалить все Job в Namespace",
  "Create, edit, suspend, resume, and delete CronJobs.":
    "Создание, редактирование, приостановка, возобновление и удаление CronJob.",
  "Apply CronJob from manifest":
    "Применить CronJob из манифеста",
  "Create a CronJob imperatively":
    "Императивно создать CronJob",
  "Delete CronJob and the Jobs and Pods it created":
    "Удалить CronJob вместе с созданными ею Job и Pod",
  "Delete all CronJobs in a Namespace":
    "Удалить все CronJob в Namespace",
  "Edit CronJob in $EDITOR":
    "Редактировать CronJob в $EDITOR",
  "Resume a suspended CronJob":
    "Возобновить приостановленную CronJob",
  "Suspend a CronJob (stops new runs)":
    "Приостановить CronJob (новые запуски не создаются)",
  "List Jobs, inspect their status, and find the Pods they created.":
    "Список Job, проверка их статуса и поиск созданных ими Pod.",
  "Full Job details, Pod statuses, and events":
    "Полное описание Job, статусы Pod и события",
  "Get Job manifest as YAML":
    "Получить манифест Job в YAML",
  "List Jobs in current Namespace":
    "Список Job в текущем Namespace",
  "List all Jobs across all Namespaces":
    "Список всех Job во всех Namespace",
  "Jobs in a specific Namespace":
    "Job в заданном Namespace",
  "Find all Pods created by a Job":
    "Найти все Pod, созданные Job",
  "Last 10 lines from each Pod of a Job (add --tail=-1 for all)":
    "Последние 10 строк из каждого Pod этой Job (для всех строк добавьте --tail=-1)",
  "Wait until Job completes successfully":
    "Дождаться успешного завершения Job",
  "Wait until Job fails (useful in CI to catch errors)":
    "Дождаться сбоя Job (полезно в CI для отлова ошибок)",
  "List CronJobs, check their schedule and last execution, and view the full spec.":
    "Список CronJob, проверка их расписания и последнего запуска, а также просмотр полной спецификации.",
  "Schedule, last run time, and events":
    "Расписание, время последнего запуска и события",
  "Short alias for get cronjobs":
    "Короткий алиас для get cronjobs",
  "Get CronJob manifest as YAML":
    "Получить манифест CronJob в YAML",
  "List CronJobs in current Namespace":
    "Список CronJob в текущем Namespace",
  "List all CronJobs across all Namespaces":
    "Список всех CronJob во всех Namespace",
  "CronJobs in a specific Namespace":
    "CronJob в заданном Namespace",
  // Volumes (Workloads)
  "Cluster-wide storage resources, provisioned by admins or dynamically through a StorageClass. Manual ones come from manifests only, as there is no imperative create command.":
    "Тома уровня кластера, выделенные администратором или динамически через StorageClass. Вручную их создают только из манифестов, потому что императивной команды create нет.",
  "Create or update a PersistentVolume":
    "Создать или обновить PersistentVolume",
  "Delete a PersistentVolume":
    "Удалить PersistentVolume",
  "PV details, capacity, claim, and status":
    "Подробности PV: объём, привязанный PVC и статус",
  "Edit PV in-place":
    "Редактировать PV на месте",
  "PVs with the VolumeMode column":
    "PV с колонкой VolumeMode",
  "Get PV manifest as YAML":
    "Получить манифест PV в YAML",
  "List all PersistentVolumes":
    "Список всех PersistentVolume",
  "Change reclaim policy to Retain":
    "Сменить reclaim policy на Retain",
  "Request and bind storage for workloads. Includes fix for PVCs stuck in Terminating state.":
    "Запрос и привязка хранилища для рабочих нагрузок, а также разблокировка PVC, зависших в состоянии Terminating.",
  "Create or update a PVC from manifest":
    "Создать или обновить PVC из манифеста",
  "Delete a PVC":
    "Удалить PVC",
  "Delete PVC without waiting (non-blocking)":
    "Удалить PVC, не дожидаясь завершения",
  "PVC details, bound PV and events":
    "Подробности PVC, привязанный PV и события",
  "Edit PVC in-place":
    "Редактировать PVC на месте",
  "All PVCs across Namespaces":
    "Все PVC во всех Namespace",
  "PVCs in a specific Namespace":
    "PVC в заданном Namespace",
  "Get PVC manifest as YAML":
    "Получить манифест PVC в YAML",
  "List PVCs in current Namespace":
    "Список PVC в текущем Namespace",
  "Remove finalizers to unblock stuck Terminating PVC":
    "Убрать finalizers, чтобы разблокировать PVC, зависший в Terminating",
  "Expand PVC to a larger size (needs allowVolumeExpansion)":
    "Увеличить размер PVC (нужен allowVolumeExpansion)",
  "Define StorageClasses for dynamic provisioning. Set or change the default StorageClass for the cluster.":
    "Настройка StorageClass для динамического выделения томов, а также назначение или смена StorageClass по умолчанию для кластера.",
  "Mark StorageClass as default":
    "Назначить StorageClass по умолчанию",
  "Create or update a StorageClass":
    "Создать или обновить StorageClass",
  "Delete a StorageClass (short alias)":
    "Удалить StorageClass (короткий алиас)",
  "Delete a StorageClass":
    "Удалить StorageClass",
  "StorageClass details and provisioner":
    "Подробности StorageClass и его провизионер",
  "Edit StorageClass in $EDITOR":
    "Редактировать StorageClass в $EDITOR",
  "Get StorageClass manifest as YAML":
    "Получить манифест StorageClass в YAML",
  "Short alias for get storageclass":
    "Короткий алиас для get storageclass",
  "List all StorageClasses":
    "Список всех StorageClass",
  // Networking (Workloads)
  "Manage GatewayClass resources that define which controller implements a Gateway.":
    "Управление ресурсами GatewayClass, которые определяют, какой контроллер реализует Gateway.",
  "Delete a GatewayClass":
    "Удалить GatewayClass",
  "GatewayClass details and controller":
    "Подробности GatewayClass и его контроллер",
  "List all GatewayClasses (cluster-wide)":
    "Список всех GatewayClass (во всём кластере)",
  "Adds the Description column":
    "GatewayClass с колонкой Description",
  "Get GatewayClass manifest as YAML":
    "Получить манифест GatewayClass в YAML",
  "Show acceptance conditions":
    "Показать условия принятия (conditions)",
  "Add or update an annotation":
    "Добавить или обновить аннотацию",
  "Manage Gateways that define the entry points for cluster traffic in the Gateway API model.":
    "Управление Gateway, которые задают точки входа трафика в кластер в модели Gateway API.",
  "Apply Gateway from manifest":
    "Применить Gateway из манифеста",
  "Delete a Gateway":
    "Удалить Gateway",
  "Gateway listeners, status, and attached routes":
    "Listeners, статус и привязанные маршруты Gateway",
  "Edit Gateway in $EDITOR":
    "Редактировать Gateway в $EDITOR",
  "All Gateways across Namespaces":
    "Все Gateway во всех Namespace",
  "Gateways in a Namespace":
    "Gateway в Namespace",
  "List Gateways with class, address and programmed status":
    "Список Gateway с классом, адресом и статусом programmed",
  "Get Gateway manifest as YAML":
    "Получить манифест Gateway в YAML",
  "Show assigned addresses":
    "Показать назначенные адреса",
  "Manage HTTPRoutes and ReferenceGrants for routing traffic to Services across Namespaces.":
    "Управление HTTPRoute и ReferenceGrant для маршрутизации трафика к Service в разных Namespace.",
  "Apply HTTPRoute from manifest":
    "Применить HTTPRoute из манифеста",
  "Apply ReferenceGrant from manifest":
    "Применить ReferenceGrant из манифеста",
  "Delete an HTTPRoute":
    "Удалить HTTPRoute",
  "Delete a ReferenceGrant":
    "Удалить ReferenceGrant",
  "HTTPRoute rules, parent refs, and status":
    "Правила HTTPRoute, parent refs и статус",
  "ReferenceGrant allowed cross-namespace refs":
    "Ссылки между Namespace, разрешённые ReferenceGrant",
  "Edit HTTPRoute in $EDITOR":
    "Редактировать HTTPRoute в $EDITOR",
  "All HTTPRoutes across Namespaces":
    "Все HTTPRoute во всех Namespace",
  "HTTPRoutes in a Namespace":
    "HTTPRoute в Namespace",
  "List HTTPRoutes with hostnames":
    "Список HTTPRoute с именами хостов",
  "Get HTTPRoute manifest as YAML":
    "Получить манифест HTTPRoute в YAML",
  "Show routing rules as JSON":
    "Показать правила маршрутизации в JSON",
  "ReferenceGrants for cross-namespace routing":
    "ReferenceGrant для маршрутизации между Namespace",
  "Manage HTTP/HTTPS routing rules to expose Services externally via an Ingress Controller.":
    "Управление правилами маршрутизации HTTP/HTTPS для публикации Service наружу через Ingress Controller.",
  "Apply Ingress from manifest":
    "Применить Ingress из манифеста",
  "Delete an Ingress":
    "Удалить Ingress",
  "Ingress rules and backend details":
    "Правила Ingress и подробности бэкендов",
  "Ingress details in a specific Namespace":
    "Подробности Ingress в заданном Namespace",
  "Edit Ingress in $EDITOR":
    "Редактировать Ingress в $EDITOR",
  "Remove an annotation":
    "Удалить аннотацию",
  "All Ingresses across Namespaces":
    "Все Ingress во всех Namespace",
  "List Ingresses in current Namespace":
    "Список Ingress в текущем Namespace",
  "Ingresses in a specific Namespace":
    "Ingress в заданном Namespace",
  "Get Ingress manifest as YAML":
    "Получить манифест Ingress в YAML",
  "Set IngressClass on an existing Ingress":
    "Задать IngressClass для существующего Ingress",
  "Manage IngressClass resources that define which controller handles a given Ingress.":
    "Управление ресурсами IngressClass, которые определяют, какой контроллер обслуживает Ingress.",
  "Delete an IngressClass":
    "Удалить IngressClass",
  "IngressClass details and controller":
    "Подробности IngressClass и его контроллер",
  "List all IngressClasses":
    "Список всех IngressClass",
  "Get IngressClass manifest as YAML":
    "Получить манифест IngressClass в YAML",
  "Mark IngressClass as cluster default":
    "Назначить IngressClass по умолчанию для кластера",
  "Remove default-class annotation":
    "Удалить аннотацию default-class",
  "Define rules to control ingress and egress traffic between Pods and Namespaces.":
    "Правила контроля входящего (ingress) и исходящего (egress) трафика между Pod и Namespace.",
  "Apply NetworkPolicy from manifest":
    "Применить NetworkPolicy из манифеста",
  "Delete a NetworkPolicy":
    "Удалить NetworkPolicy",
  "Policy details, Pod/Namespace selectors":
    "Подробности политики, селекторы Pod и Namespace",
  "Edit NetworkPolicy in $EDITOR":
    "Редактировать NetworkPolicy в $EDITOR",
  "All NetworkPolicies across Namespaces":
    "Все NetworkPolicy во всех Namespace",
  "NetworkPolicies in a Namespace":
    "NetworkPolicy в Namespace",
  "List NetworkPolicies":
    "Список NetworkPolicy",
  "Get NetworkPolicy manifest as YAML":
    "Получить манифест NetworkPolicy в YAML",
  // RBAC (Workloads)
  "Create and delete namespaced and cluster-wide roles, then bind them to users, groups, or ServiceAccounts.":
    "Создание и удаление ролей уровня Namespace и кластера, затем их привязка к пользователям, группам или ServiceAccount.",
  "Create a ClusterRole":
    "Создать ClusterRole",
  "Bind ClusterRole to ServiceAccount":
    "Привязать ClusterRole к ServiceAccount",
  "Bind ClusterRole to a user":
    "Привязать ClusterRole к пользователю",
  "Create a namespaced Role":
    "Создать Role в пределах Namespace",
  "Bind ClusterRole in Namespace scope":
    "Привязать ClusterRole в пределах Namespace",
  "Bind Role to a ServiceAccount":
    "Привязать Role к ServiceAccount",
  "Bind Role to a user":
    "Привязать Role к пользователю",
  "Delete a ClusterRole":
    "Удалить ClusterRole",
  "Delete a ClusterRoleBinding":
    "Удалить ClusterRoleBinding",
  "Delete a namespaced Role":
    "Удалить Role в пределах Namespace",
  "Delete a RoleBinding":
    "Удалить RoleBinding",
  "Manage Pod identities used for authenticating to the Kubernetes API.":
    "Управление учётными записями Pod для аутентификации в Kubernetes API.",
  "Create a ServiceAccount":
    "Создать ServiceAccount",
  "Create a ServiceAccount in a Namespace":
    "Создать ServiceAccount в Namespace",
  "Delete a ServiceAccount":
    "Удалить ServiceAccount",
  "ServiceAccount details, image pull secrets, tokens":
    "Подробности ServiceAccount, Secret для загрузки образов и токены",
  "Edit ServiceAccount in $EDITOR":
    "Редактировать ServiceAccount в $EDITOR",
  "All ServiceAccounts across Namespaces":
    "Все ServiceAccount во всех Namespace",
  "ServiceAccounts in a Namespace":
    "ServiceAccount в Namespace",
  "Get ServiceAccount manifest as YAML":
    "Получить манифест ServiceAccount в YAML",
  "Create a short-lived API token for a ServiceAccount":
    "Создать короткоживущий API-токен для ServiceAccount",
  "Create a token with custom expiry":
    "Создать токен с заданным сроком действия",
  "Token bound to the lifetime of a specific Pod":
    "Токен, привязанный к времени жизни заданного Pod",
  "List ServiceAccounts in current Namespace":
    "Список ServiceAccount в текущем Namespace",
  "Identify yourself and verify what actions a user, group, or ServiceAccount is allowed to perform.":
    "Определение текущего пользователя и проверка, что разрешено делать пользователю, группе или ServiceAccount.",
  "List all permissions as another user":
    "Список всех прав от имени другого пользователя",
  "List your permissions in a Namespace":
    "Список ваших прав в Namespace",
  "List all your current permissions":
    "Список всех ваших текущих прав",
  "Check permission as another user":
    "Проверить право от имени другого пользователя",
  "Check permission in a specific Namespace":
    "Проверить право в заданном Namespace",
  "Check your own permission":
    "Проверить своё право на действие",
  "Check subresource permission":
    "Проверить право на подресурс",
  "Check ServiceAccount permission":
    "Проверить право ServiceAccount",
  "Show current user identity (k8s 1.28+)":
    "Показать текущего пользователя (k8s 1.28+)",
  "Inspect existing roles, bindings, and the permissions they grant.":
    "Просмотр существующих ролей, привязок и прав, которые они дают.",
  "ClusterRole details and rules":
    "Подробности ClusterRole и её правила",
  "ClusterRoleBinding subjects and role ref":
    "Субъекты ClusterRoleBinding и ссылка на роль",
  "Role details and allowed verbs/resources":
    "Подробности Role, разрешённые действия (verbs) и ресурсы",
  "RoleBinding subjects and role ref":
    "Субъекты RoleBinding и ссылка на роль",
  "Get ClusterRole manifest as YAML":
    "Получить манифест ClusterRole в YAML",
  "List ClusterRoleBindings":
    "Список ClusterRoleBinding",
  "ClusterRoleBindings with subjects":
    "ClusterRoleBinding с субъектами",
  "List ClusterRoles (cluster-wide)":
    "Список ClusterRole (во всём кластере)",
  "Get Role manifest as YAML":
    "Получить манифест Role в YAML",
  "All RoleBindings across Namespaces":
    "Все RoleBinding во всех Namespace",
  "RoleBindings in a Namespace":
    "RoleBinding в Namespace",
  "Roles in a Namespace":
    "Role в Namespace",
  // Namespaces (Workloads)
  "Create and remove Namespaces from the cluster.":
    "Создание и удаление Namespace в кластере.",
  "Apply Namespace from manifest":
    "Применить Namespace из манифеста",
  "Create a new Namespace":
    "Создать новый Namespace",
  "Delete a Namespace and all its resources":
    "Удалить Namespace со всеми его ресурсами",
  "Add or update a label on a Namespace":
    "Добавить или обновить метку Namespace",
  "Remove a label from a Namespace":
    "Удалить метку у Namespace",
  "List Namespaces and inspect their resources, quotas, and limits.":
    "Список Namespace и просмотр их ресурсов, квот и лимитов.",
  "Namespace details and ResourceQuotas":
    "Подробности Namespace и ResourceQuota",
  "Current quota usage vs limits":
    "Текущее потребление квоты относительно лимитов",
  "Common resources across all Namespaces: Pods, Services, workloads (not ConfigMaps, Secrets, PVCs)":
    "Основные ресурсы во всех Namespace: Pod, Service, рабочие нагрузки (без ConfigMap, Secret, PVC)",
  "Common resources in a Namespace: Pods, Services, workloads (not ConfigMaps, Secrets, PVCs)":
    "Основные ресурсы в Namespace: Pod, Service, рабочие нагрузки (без ConfigMap, Secret, PVC)",
  "List LimitRanges (describe shows the default CPU/memory limits)":
    "Список LimitRange (лимиты CPU и памяти по умолчанию видны в describe)",
  "Get Namespace manifest as YAML":
    "Получить манифест Namespace в YAML",
  "List all Namespaces":
    "Список всех Namespace",
  "Short alias for get namespaces":
    "Короткий алиас для get namespaces",
  "ResourceQuotas for a Namespace":
    "ResourceQuota для Namespace",
  // Releases (Helm)
  "Helm is the Kubernetes package manager. Install the CLI via Homebrew or the official script, then verify with helm version.":
    "Установка Helm, менеджера пакетов Kubernetes, через Homebrew или официальный скрипт, затем проверка командой helm version.",
  "Install via Homebrew (macOS / Linux with brew)":
    "Установить через Homebrew (macOS / Linux с brew)",
  "Install via official script (Linux / macOS)":
    "Установить официальным скриптом (Linux / macOS)",
  "Verify installation and show build info":
    "Проверить установку и вывести сведения о сборке",
  "Deploy and remove Helm releases using install and uninstall commands with common flags.":
    "Установка и удаление релизов Helm командами install и uninstall с основными флагами.",
  "Install and create Namespace if missing":
    "Установить и создать Namespace, если его нет",
  "Simulate install without applying resources":
    "Сымитировать установку без применения ресурсов",
  "Install with inline value override":
    "Установить, переопределив значение в командной строке",
  "Install a specific chart version":
    "Установить заданную версию чарта",
  "Install with custom values file":
    "Установить со своим файлом значений",
  "Install into a specific Namespace":
    "Установить в заданный Namespace",
  "Install with automatic rollback on failure (was --atomic)":
    "Установить с автооткатом при сбое (раньше --atomic)",
  "Install with multiple values files (last wins)":
    "Установить с несколькими файлами значений (приоритет у последнего)",
  "Install a chart":
    "Установить чарт",
  "Uninstall but keep release history":
    "Удалить, но сохранить историю релиза",
  "Delete a release and the resources it created":
    "Удалить релиз и созданные им ресурсы",
  "Update a running release to a new chart version and revert on failure.":
    "Обновление работающего релиза до новой версии чарта и откат при сбое.",
  "Roll back the release to a specific revision":
    "Откатить релиз к заданной ревизии",
  "Upgrade or install if not present":
    "Обновить или установить, если релиза нет",
  "Upgrade with automatic rollback on failure (was --atomic)":
    "Обновить с автооткатом при сбое (раньше --atomic)",
  "Delete new resources if upgrade fails":
    "Удалить новые ресурсы, если обновление не удалось",
  "Reset values to chart defaults":
    "Вернуть значения чарта по умолчанию",
  "Reuse values from the last revision, merge new ones":
    "Взять значения последней ревизии и объединить с новыми",
  "Upgrade to a specific chart version":
    "Обновить до заданной версии чарта",
  "Wait for all resources to be ready":
    "Дождаться готовности всех ресурсов",
  "Upgrade with custom values":
    "Обновить со своими значениями",
  "Upgrade a release to a new chart version":
    "Обновить релиз до новой версии чарта",
  "List deployed releases and inspect their rendered manifests and values.":
    "Список развёрнутых релизов и просмотр их отрендеренных манифестов и значений.",
  "Get rendered Kubernetes manifests":
    "Получить отрендеренные манифесты Kubernetes",
  "Show all computed values (merged)":
    "Показать все вычисленные значения (после объединения)",
  "Show user-supplied values for release":
    "Показать значения, заданные пользователем для релиза",
  "List all releases across Namespaces":
    "Список всех релизов во всех Namespace",
  "List releases in a Namespace":
    "Список релизов в Namespace",
  "List releases in current Namespace":
    "Список релизов в текущем Namespace",
  // Charts (Helm)
  "Add, update, search, and remove Helm chart repositories.":
    "Добавление, обновление, поиск и удаление репозиториев чартов Helm.",
  "Add a chart repository":
    "Добавить репозиторий чартов",
  "List configured repositories":
    "Список подключённых репозиториев",
  "Remove a repository":
    "Удалить репозиторий",
  "Update all configured repos":
    "Обновить все подключённые репозитории",
  "Search charts on Artifact Hub":
    "Искать чарты в Artifact Hub",
  "Search charts in configured repos":
    "Искать чарты в подключённых репозиториях",
  "List all available versions of a chart":
    "Список всех доступных версий чарта",
  "Scaffold, validate, render, and package charts locally before publishing.":
    "Создание каркаса, проверка, рендер и упаковка чартов локально перед публикацией.",
  "Scaffold a new chart directory":
    "Создать каркас нового чарта",
  "Rebuild dependencies from Chart.lock (deterministic)":
    "Пересобрать зависимости строго по Chart.lock",
  "List chart dependencies and their status":
    "Список зависимостей чарта и их статус",
  "Update / download chart dependencies":
    "Обновить / скачать зависимости чарта",
  "Package chart as a .tgz archive":
    "Упаковать чарт в архив .tgz",
  "Render templates with custom values":
    "Отрендерить шаблоны со своими значениями",
  "Render templates to stdout locally":
    "Локально отрендерить шаблоны в stdout",
  "Inspect chart metadata, default values, and README before installing.":
    "Изучение метаданных чарта, значений по умолчанию и README перед установкой.",
  "Show Helm environment variables":
    "Показать переменные окружения Helm",
  "Download and extract chart directory":
    "Скачать чарт и распаковать в каталог",
  "Download a specific chart version":
    "Скачать заданную версию чарта",
  "Download chart archive to current dir":
    "Скачать архив чарта в текущий каталог",
  "Display chart metadata (Chart.yaml)":
    "Показать метаданные чарта (Chart.yaml)",
  "Display chart README":
    "Показать README чарта",
  "Display chart default values":
    "Показать значения чарта по умолчанию",
  "Push charts to OCI registries and manage Helm plugins that extend CLI functionality.":
    "Публикация чартов в OCI-реестры и управление плагинами, расширяющими возможности CLI Helm.",
  "Install an unsigned plugin from a Git URL (Helm 4 verifies signatures by default)":
    "Установить неподписанный плагин по Git URL (Helm 4 по умолчанию проверяет подписи)",
  "List installed plugins":
    "Список установленных плагинов",
  "Remove an installed plugin":
    "Удалить установленный плагин",
  "Update an installed plugin":
    "Обновить установленный плагин",
  "Push a packaged chart to OCI registry":
    "Отправить упакованный чарт в OCI-реестр",
  "Log in to an OCI registry":
    "Войти в OCI-реестр",
  "Log out from an OCI registry":
    "Выйти из OCI-реестра",
  "Show metadata for an OCI chart":
    "Показать метаданные OCI-чарта",
  // Manage (Kustomize)
  "Kustomize customizes raw Kubernetes YAML without templates. It is built into kubectl (apply -k) and available as a standalone CLI.":
    "Kustomize изменяет обычные YAML-манифесты Kubernetes без шаблонов. Он встроен в kubectl (apply -k) и доступен как отдельная утилита.",
  "Install via official script into the current directory (Linux / macOS)":
    "Установить официальным скриптом в текущий каталог (Linux / macOS)",
  "Render a kustomization overlay and apply it to the cluster. The kubectl -k flag uses the built-in kustomize, while piping kustomize build gives full control.":
    "Рендер оверлея kustomization и его применение к кластеру. Флаг -k у kubectl использует встроенный kustomize, а kustomize build через конвейер даёт полный контроль.",
  "Render overlay to stdout":
    "Отрендерить оверлей в stdout",
  "Render and apply to cluster":
    "Отрендерить и применить к кластеру",
  "Render and apply with server-side apply (avoids annotation size limits)":
    "Отрендерить и применить через server-side apply (обходит лимит размера аннотаций)",
  "Render and delete from cluster":
    "Отрендерить и удалить из кластера",
  "Render overlay, inflating the Helm charts listed under helmCharts":
    "Отрендерить оверлей вместе с чартами Helm из поля helmCharts",
  "Write rendered manifests to a file":
    "Записать отрендеренные манифесты в файл",
  "Apply overlay using kubectl built-in kustomize":
    "Применить оверлей через встроенный в kubectl kustomize",
  "Delete resources defined by overlay":
    "Удалить ресурсы, описанные в оверлее",
  "Render with kubectl built-in, then apply":
    "Отрендерить встроенным в kubectl kustomize, затем применить",
  "Render an overlay locally to inspect the output without applying it.":
    "Локальный рендер оверлея для проверки результата без применения.",
  "Render overlay with kubectl built-in (no apply)":
    "Отрендерить оверлей встроенным в kubectl kustomize (без применения)",
  // Edit (Kustomize)
  "Add or remove resource files and patches directly in kustomization.yaml.":
    "Добавление и удаление файлов ресурсов и патчей прямо в kustomization.yaml.",
  "Add a resource file to kustomization":
    "Добавить файл ресурса в kustomization",
  "Remove a resource from kustomization":
    "Удалить ресурс из kustomization",
  "Add a patch file (strategic merge or JSON 6902) to the patches field":
    "Добавить файл патча (strategic merge или JSON 6902) в поле patches",
  "Add a patch scoped to a specific resource kind":
    "Добавить патч только для ресурсов заданного kind",
  "Remove a patch (pass the same target flags used to add it)":
    "Удалить патч (с теми же флагами цели, что и при добавлении)",
  "Override images, set Namespace, add name prefix or suffix, and attach common labels and annotations.":
    "Переопределение образов, задание Namespace, добавление префикса или суффикса к именам, а также общих меток и аннотаций.",
  "Auto-migrate kustomization.yaml to current syntax":
    "Автоматически перевести kustomization.yaml на текущий синтаксис",
  "Override image name and tag":
    "Переопределить имя и тег образа",
  "Override only the tag of an image":
    "Переопределить только тег образа",
  "Set Namespace for all resources":
    "Задать Namespace для всех ресурсов",
  "Add prefix to all resource names":
    "Добавить префикс к именам всех ресурсов",
  "Add suffix to all resource names":
    "Добавить суффикс к именам всех ресурсов",
  "Override replica count for a resource":
    "Переопределить число реплик ресурса",
  "Add a label to all resources (labels field, selectors untouched)":
    "Добавить метку всем ресурсам (поле labels, селекторы не меняются)",
  "Add a common annotation to all resources":
    "Добавить общую аннотацию всем ресурсам",
  "Register ConfigMap and Secret generators that produce resources from literals, files, or env files.":
    "Добавление генераторов ConfigMap и Secret, создающих ресурсы из литералов, файлов или env-файлов.",
  "Add a ConfigMap generator from a literal value":
    "Добавить генератор ConfigMap из литерала",
  "Add a ConfigMap generator from a file":
    "Добавить генератор ConfigMap из файла",
  "Add a ConfigMap generator from an env file":
    "Добавить генератор ConfigMap из env-файла",
  "Add a Secret generator from a literal value":
    "Добавить генератор Secret из литерала",
  "Add a Secret generator from a file":
    "Добавить генератор Secret из файла",
  "Remove a ConfigMap generator":
    "Удалить генератор ConfigMap",
  "Remove a Secret generator":
    "Удалить генератор Secret",
  // CLI & Launch (K9s)
  "K9s is a terminal UI that lets you explore resources, view logs, exec into containers, and port-forward directly from the terminal.":
    "Утилита K9s даёт терминальный интерфейс для просмотра ресурсов и журнальных сообщений, входа в контейнеры через exec и проброса портов.",
  "Install via the webi script (Linux / macOS)":
    "Установить скриптом webi (Linux / macOS)",
  "Install from GitHub release tarball (Linux amd64)":
    "Установить из tar-архива релиза на GitHub (Linux amd64)",
  "Start K9s targeting a specific context, Namespace, or resource. All flags can be combined.":
    "Запуск K9s сразу с заданным контекстом, Namespace или ресурсом. Все флаги можно сочетать.",
  "Launch K9s with the current context":
    "Запустить K9s в текущем контексте",
  "Launch with all Namespaces visible":
    "Запустить сразу во всех Namespace",
  "Open directly on a specific resource type":
    "Открыть сразу заданный тип ресурса",
  "Use a specific cluster from kubeconfig":
    "Использовать заданный кластер из kubeconfig",
  "Launch using a specific kubeconfig context":
    "Запустить с заданным контекстом kubeconfig",
  "Skip TLS certificate validation for the server":
    "Пропустить проверку TLS-сертификата сервера",
  "Use a specific kubeconfig file":
    "Использовать заданный файл kubeconfig",
  "Launch scoped to a specific Namespace":
    "Запустить в пределах заданного Namespace",
  "Launch in read-only mode (no mutations allowed)":
    "Запустить в режиме только для чтения (изменения запрещены)",
  "Use a specific user from kubeconfig":
    "Использовать заданного пользователя из kubeconfig",
  // UI Shortcuts (K9s)
  "Shortcuts available in any view. Use these to navigate, search, save, and toggle K9s panels.":
    "Сочетания клавиш для любого представления, чтобы перемещаться, искать, сохранять и переключать панели K9s.",
  "Enter command mode, type a resource name, and press Enter":
    "Войти в режим команд, ввести имя ресурса и нажать Enter",
  "Enter filter mode and type to narrow visible rows":
    "Войти в режим фильтра и ввести текст для отбора строк",
  "Show help and full key binding reference":
    "Показать справку и полный список клавиш",
  "Show aliases view with all available resource shortcuts":
    "Открыть представление алиасов со всеми сокращениями ресурсов",
  "Toggle the top header bar":
    "Показать или скрыть верхнюю панель",
  "Toggle breadcrumb trail (crumbs)":
    "Показать или скрыть цепочку навигации (crumbs)",
  "Refresh / reload the current view":
    "Обновить текущее представление",
  "Save current view output to a file":
    "Сохранить вывод текущего представления в файл",
  "Clear the command input field":
    "Очистить поле ввода команды",
  "Toggle faults highlighting (shows errored resources)":
    "Включить или выключить подсветку сбоев (ресурсы с ошибками)",
  "Go back or clear the active filter":
    "Вернуться назад или сбросить активный фильтр",
  "Quit K9s":
    "Выйти из K9s",
  "Vim-style movement and selection within any resource table.":
    "Перемещение и выбор в стиле Vim в любой таблице ресурсов.",
  "Move cursor down one row":
    "Переместить курсор на строку вниз",
  "Move cursor up one row":
    "Переместить курсор на строку вверх",
  "Scroll table left":
    "Прокрутить таблицу влево",
  "Scroll table right (opens logs instead in Pod views)":
    "Прокрутить таблицу вправо (в представлении Pod открывает журнальные сообщения)",
  "Jump to the top of the list":
    "Перейти в начало списка",
  "Jump to the bottom of the list":
    "Перейти в конец списка",
  "Page down":
    "Прокрутить на страницу вниз",
  "Page up":
    "Прокрутить на страницу вверх",
  "Accept the command-mode suggestion, or move to the next dialog button":
    "Принять подсказку режима команд или перейти к следующей кнопке диалога",
  "Move to the previous dialog button":
    "Перейти к предыдущей кнопке диалога",
  "Mark the selected resource":
    "Отметить выбранный ресурс",
  "Mark a range of resources":
    "Отметить диапазон ресурсов",
  "Clear all marks":
    "Снять все отметки",
  "Jump to any resource by typing its name or short alias in command mode (press : first, then Enter).":
    "Переход к любому ресурсу по его имени или короткому алиасу в режиме команд (сначала нажмите :, затем Enter).",
  "ConfigMaps view":
    "Представление ConfigMap",
  "Contexts view, switch active context":
    "Представление контекстов, смена активного контекста",
  "CronJobs view":
    "Представление CronJob",
  "DaemonSets view":
    "Представление DaemonSet",
  "Deployments view":
    "Представление Deployment",
  "Cluster events view":
    "Представление событий кластера",
  "Ingresses view":
    "Представление Ingress",
  "Jobs view":
    "Представление Job",
  "Namespaces view, switch active Namespace":
    "Представление Namespace, смена активного Namespace",
  "Nodes view":
    "Представление Node",
  "Pods view":
    "Представление Pod",
  "PersistentVolumeClaims view":
    "Представление PersistentVolumeClaim",
  "Secrets view":
    "Представление Secret",
  "Services view":
    "Представление Service",
  "General actions available on any selected resource row.":
    "Общие действия для любой выбранной строки ресурса.",
  "Copy resource name to clipboard":
    "Скопировать имя ресурса в буфер обмена",
  "Describe the selected resource":
    "Показать полное описание выбранного ресурса",
  "Edit resource YAML in your editor (K9S_EDITOR, KUBE_EDITOR or EDITOR)":
    "Редактировать YAML ресурса в своём редакторе (K9S_EDITOR, KUBE_EDITOR или EDITOR)",
  "Drill into / open the selected resource":
    "Открыть выбранный ресурс и перейти внутрь",
  "View the full resource YAML":
    "Показать полный YAML ресурса",
  "Sort table by age":
    "Сортировать таблицу по возрасту",
  "Sort table by name":
    "Сортировать таблицу по имени",
  "Sort table by status":
    "Сортировать таблицу по статусу",
  "Extra keys available when a Pod row is selected in the Pods view.":
    "Дополнительные клавиши для выбранной строки в представлении Pod.",
  "Attach to a running container":
    "Подключиться (attach) к запущенному контейнеру",
  "Port-forward to the selected Pod":
    "Пробросить порт на выбранный Pod",
  "Kill the selected Pod immediately, no confirmation (like kubectl delete --now)":
    "Немедленно удалить выбранный Pod без подтверждения (как kubectl delete --now)",
  "Open log viewer for the selected Pod":
    "Открыть журнальные сообщения выбранного Pod",
  "Shell into a container (exec -it)":
    "Открыть оболочку в контейнере (exec -it)",
  "Show active port-forward sessions":
    "Показать активные сессии port-forward",
  "Delete the selected resource (confirmation dialog)":
    "Удалить выбранный ресурс (с подтверждением)",
  "Open previous (terminated) container logs":
    "Открыть журнальные сообщения предыдущего (завершённого) контейнера",
  "Shortcuts inside the log viewer. Open with l on a Pod.":
    "Сочетания клавиш в окне журнальных сообщений, которое открывается клавишей l на Pod.",
  "Toggle logs from all containers":
    "Включить или выключить журнальные сообщения всех контейнеров",
  "Set the log time window (0 tail, 1 head, 2 1m, 3 5m, 4 15m, 5 30m, 6 1h)":
    "Задать временное окно журнальных сообщений (0 tail, 1 head, 2 1m, 3 5m, 4 15m, 5 30m, 6 1h)",
  "Toggle full-screen log view":
    "Включить или выключить полноэкранный режим",
  "Toggle auto-scroll (follow new lines)":
    "Включить или выключить автопрокрутку (следить за новыми строками)",
  "Save current logs to a file":
    "Сохранить текущие журнальные сообщения в файл",
  "Toggle word wrap":
    "Включить или выключить перенос строк",
  // Installation (Debug K8s)
  "Diagnose Control Plane and kubelet issues in kubeadm clusters by checking service health, certificate state, CRI container status, and Control Plane logs.":
    "Диагностика проблем Control Plane и kubelet в кластерах kubeadm по состоянию служб, сертификатов и контейнеров CRI, а также по журнальным сообщениям Control Plane.",
  "Check kubelet service state":
    "Проверить состояние службы kubelet",
  "Stream kubelet logs (primary source for join and startup failures)":
    "Следить за журнальными сообщениями kubelet (главный источник при сбоях join и запуска)",
  "Recent kubelet errors":
    "Последние ошибки kubelet",
  "Node conditions, taints, and event history":
    "Conditions, taints и история событий Node",
  "Recent Control Plane events sorted by time":
    "Последние события Control Plane, отсортированные по времени",
  "Logs from a Control Plane component":
    "Журнальные сообщения компонента Control Plane",
  "Logs from a crashed Control Plane container":
    "Журнальные сообщения упавшего контейнера Control Plane",
  "All containers via CRI (works when the API Server is unreachable)":
    "Все контейнеры через CRI (работает и при недоступном API Server)",
  "Container logs via CRI without kubectl":
    "Журнальные сообщения контейнера через CRI без kubectl",
  "Check API Server certificate validity dates":
    "Проверить сроки действия сертификата API Server",
  "Debug k3s server and agent failures by checking service health, validating configuration, and inspecting system events.":
    "Отладка сбоев k3s server и agent по состоянию служб, проверке конфигурации и системным событиям.",
  "k3s agent service state":
    "Состояние службы k3s agent",
  "Recent k3s server errors":
    "Последние ошибки k3s server",
  "Recent k3s agent errors":
    "Последние ошибки k3s agent",
  "Validate host kernel modules and cgroups required by k3s":
    "Проверить модули ядра и cgroups хоста, нужные для k3s",
  "System Pod status via embedded kubectl":
    "Статус системных Pod через встроенный kubectl",
  "Recent system events sorted by time":
    "Последние системные события, отсортированные по времени",
  "Inspect k3d cluster state and Docker container logs for k3s clusters running inside Docker.":
    "Изучение состояния кластеров k3d (k3s внутри Docker) и журнальных сообщений их Docker-контейнеров.",
  "Check k3d Docker container states":
    "Проверить состояние Docker-контейнеров k3d",
  "Logs from the k3s server container":
    "Журнальные сообщения контейнера k3s server",
  "Logs from a k3s agent container":
    "Журнальные сообщения контейнера k3s agent",
  "Full container inspect: network, mounts, and env":
    "Полные сведения о контейнере: сеть, монтирования и переменные окружения",
  "Node status after setting kubeconfig":
    "Статус Node после настройки kubeconfig",
  "Recent system events":
    "Последние системные события",
  "Debug KinD clusters by inspecting Docker Node containers and diagnosing startup failures.":
    "Отладка кластеров KinD через изучение Docker-контейнеров Node и поиск причин сбоев запуска.",
  "Check kind Docker container states":
    "Проверить состояние Docker-контейнеров kind",
  "Logs from a kind Node container":
    "Журнальные сообщения Docker-контейнера Node в kind",
  "Full container inspect: mounts and networking":
    "Полные сведения о контейнере: монтирования и сеть",
  "API Server endpoint for the cluster":
    "Адрес API Server кластера",
  "Node status":
    "Статус Node",
  "Node conditions and event history":
    "Conditions Node и история событий",
  "System Pod status":
    "Статус системных Pod",
  "Events in the current Namespace sorted by time":
    "События текущего Namespace, отсортированные по времени",
  "Diagnose minikube failures by reading cluster logs, inspecting the Node, and checking system Pod health.":
    "Диагностика сбоев minikube по журнальным сообщениям кластера, состоянию Node и системных Pod.",
  "Print recent minikube logs":
    "Вывести последние журнальные сообщения minikube",
  "Filter error lines from minikube logs":
    "Отфильтровать строки с ошибками из журнальных сообщений minikube",
  "Stream kubelet logs from inside the minikube Node":
    "Следить за журнальными сообщениями kubelet внутри Node minikube",
  "All container states inside the minikube Node":
    "Состояния всех контейнеров внутри Node minikube",
  "Disk usage inside the minikube Node":
    "Место на диске внутри Node minikube",
  "System Pod status using bundled kubectl":
    "Статус системных Pod через встроенный kubectl",
  "Events in the current Namespace using bundled kubectl":
    "События текущего Namespace через встроенный kubectl",
  // Cluster (Debug K8s)
  "Inspect cluster events such as warnings, restarts, and scheduling failures to understand what happened to resources.":
    "Изучение событий кластера (предупреждения, перезапуски, сбои планирования), чтобы понять, что случилось с ресурсами.",
  "Stream warning events live":
    "Следить за событиями Warning",
  "Modern events CLI: filter by Warning type":
    "Современная команда events с фильтром по типу Warning",
  "Events for a specific object":
    "События заданного объекта",
  "Only Warning events":
    "Только события Warning",
  "All events sorted by time":
    "Все события, отсортированные по времени",
  "Stream events in real time":
    "Следить за событиями",
  "Events in a Namespace":
    "События в Namespace",
  "Spawn ephemeral containers, debug copies of Pods, or get a privileged shell on a Node without restarting the original workload.":
    "Запуск эфемерных контейнеров, отладочных копий Pod или привилегированной оболочки на Node без перезапуска исходной рабочей нагрузки.",
  "Debug copy with shared PID namespace between debug and target containers":
    "Отладочная копия с общим PID namespace у отладочного и целевого контейнеров",
  "Debug copy of a Pod, the original keeps running untouched":
    "Отладочная копия Pod, исходный Pod продолжает работать без изменений",
  "Profile compatible with the baseline Pod Security Standard":
    "Профиль, совместимый с Pod Security Standard baseline",
  "Debug with NET_ADMIN and NET_RAW capabilities":
    "Отладка с capabilities NET_ADMIN и NET_RAW",
  "Restricted PSS profile (non-root, all caps dropped), needs an image that runs as non-root":
    "Профиль PSS restricted (не root, все capabilities сброшены), нужен образ, работающий не от root",
  "Privileged debug container (sysadmin profile)":
    "Привилегированный отладочный контейнер (профиль sysadmin)",
  "Ephemeral container sharing the target container PID namespace, ideal for distroless images":
    "Эфемерный контейнер в PID namespace целевого контейнера, лучше всего подходит для distroless-образов",
  "Privileged shell on a Node in host namespaces, host root mounted at /host":
    "Привилегированная оболочка на Node в namespace хоста, корневая ФС хоста смонтирована в /host",
  "Check API Server reachability, Control Plane component statuses, and version compatibility.":
    "Проверка доступности API Server, статусов компонентов Control Plane и совместимости версий.",
  "Cluster state dump (kube-system and current Namespace) to stdout":
    "Дамп состояния кластера (kube-system и текущий Namespace) в stdout",
  "Show API Server and DNS endpoints":
    "Показать адреса API Server и DNS",
  "APIService resources and their availability state":
    "Ресурсы APIService и состояние их доступности",
  "API Server liveness probe with per-check breakdown":
    "Проверка liveness API Server с разбивкой по пунктам",
  "API Server readiness probe with per-check breakdown":
    "Проверка readiness API Server с разбивкой по пунктам",
  "Show all non-Running Pods cluster-wide":
    "Показать все Pod кластера не в статусе Running",
  "All Pods sorted by creation time":
    "Все Pod, отсортированные по времени создания",
  "Status of all kube-system Pods (Control Plane, DNS, CNI)":
    "Статус всех Pod в kube-system (Control Plane, DNS, CNI)",
  "Logs of a Control Plane component (apiserver, scheduler…)":
    "Журнальные сообщения компонента Control Plane (apiserver, scheduler…)",
  "Client and server versions":
    "Версии клиента и сервера",
  "Discover what resources the cluster exposes and inspect their schemas. Mirrored from Cluster Health for in-flow debugging.":
    "Обзор ресурсов, доступных в кластере, и изучение их схем. Команды продублированы из Cluster Health, чтобы не прерывать отладку.",
  // Network (Debug K8s)
  "Verify cluster DNS is working from inside a Pod, find the right name for a Service, and inspect CoreDNS state.":
    "Проверка работы DNS кластера изнутри Pod, поиск правильного имени Service и изучение состояния CoreDNS.",
  "Inspect DNS config inside Pod (search domains, nameservers)":
    "Посмотреть настройки DNS внутри Pod (search-домены, nameserver)",
  "Compact DNS lookup using dig":
    "Краткий DNS-запрос через dig",
  "Resolve a Service FQDN":
    "Получить адрес по FQDN Service",
  "Test in-cluster DNS resolution":
    "Проверить разрешение DNS внутри кластера",
  "Inspect CoreDNS Corefile config":
    "Посмотреть Corefile CoreDNS",
  "List CoreDNS Pods serving cluster DNS":
    "Список Pod CoreDNS, обслуживающих DNS кластера",
  "Recent CoreDNS logs (resolution errors, NXDOMAIN)":
    "Последние журнальные сообщения CoreDNS (ошибки разрешения, NXDOMAIN)",
  "Probe Services from inside a Pod and verify the Service has actual ready backends.":
    "Запросы к Service изнутри Pod и проверка, есть ли у Service на деле готовые бэкенды.",
  "HTTP HEAD to check status code and headers only":
    "HTTP HEAD для проверки только кода ответа и заголовков",
  "Verbose HTTP to see full request and response headers":
    "Подробный HTTP-запрос со всеми заголовками запроса и ответа",
  "Test HTTP connectivity to Service":
    "Проверить HTTP-доступность Service",
  "Test TCP port reachability":
    "Проверить доступность TCP-порта",
  "HTTP request with wget from Pod (alpine images)":
    "HTTP-запрос через wget из Pod (образы alpine)",
  "Modern EndpointSlices, replace the Endpoints API":
    "EndpointSlice, современная замена API Endpoints",
  "Service selector (must match Pod labels for endpoints to populate)":
    "Селектор Service (должен совпадать с метками Pod, иначе эндпоинтов не будет)",
  "Recent ingress-nginx controller logs (project retired March 2026)":
    "Последние журнальные сообщения контроллера ingress-nginx (проект закрыт в марте 2026)",
  "Spawn a debug Pod or attach an ephemeral container that shares the target Pod network namespace, then capture or inspect traffic.":
    "Запуск отладочного Pod или эфемерного контейнера в сетевом namespace целевого Pod для перехвата и изучения трафика.",
  "Ephemeral container in the Pod network namespace, lets netshoot tcpdump/ss/curl see traffic as the Pod sees it":
    "Эфемерный контейнер в сетевом namespace Pod, tcpdump/ss/curl из netshoot видят трафик так же, как Pod",
  "Listening TCP ports inside the container":
    "Слушающие TCP-порты внутри контейнера",
  "Socket stats as a modern alternative to netstat":
    "Статистика сокетов, современная альтернатива netstat",
  "Standalone debug Pod with full network toolset (curl, dig, nc, ss, tcpdump…)":
    "Отдельный отладочный Pod с полным набором сетевых инструментов (curl, dig, nc, ss, tcpdump…)",
  "Live packet capture from a debug Pod":
    "Перехват пакетов в реальном времени из отладочного Pod",
  // Storage (Debug K8s)
  "Find PVCs stuck Pending/Lost and trace how PVs map to claims and StorageClasses.":
    "Поиск PVC, зависших в Pending или Lost, и проверка, как PV связаны с PVC и StorageClass.",
  "Find non-Bound PVCs across the cluster":
    "Найти PVC не в статусе Bound по всему кластеру",
  "Tab-separated mapping PV → phase → claim":
    "Соответствие PV → статус → claim, через табуляцию",
  "Map every Pod in the current Namespace to the PVCs it mounts":
    "Сопоставить каждый Pod текущего Namespace с PVC, которые он монтирует",
  "Find the default StorageClass name":
    "Найти имя StorageClass по умолчанию",
  "Verify a volume is actually mounted inside the container with the right size, contents and write permission.":
    "Проверка того, что том действительно смонтирован в контейнере с нужным размером, содержимым и правом записи.",
  "Full mount table inside the container":
    "Полная таблица монтирований внутри контейнера",
  "Disk space on all mounts to spot full volumes":
    "Место на диске по всем точкам монтирования для поиска заполненных томов",
  "List mount path contents and permissions":
    "Список файлов в точке монтирования с правами доступа",
  "Verify a specific volume is mounted":
    "Проверить, что заданный том смонтирован",
  "Inode and ownership details for a path":
    "Сведения об inode и владельце пути",
  "Verify write permission to a mounted volume":
    "Проверить право записи в смонтированный том",
  "Look at CSI driver Pods and provisioning events when PVCs do not get bound.":
    "Изучение Pod CSI-драйвера и событий выделения томов, когда PVC не привязываются.",
  "Provisioning failure events across all Namespaces":
    "События сбоев выделения томов во всех Namespace",
  "CSI driver Pods (label selector varies by CSI implementation)":
    "Pod CSI-драйвера (селектор меток зависит от реализации CSI)",
  "Provisioner sidecar logs (NotFound, Quota, Auth errors)":
    "Журнальные сообщения sidecar csi-provisioner (ошибки NotFound, Quota, Auth)",
  // Resources (Debug K8s)
  "Read the last terminated state of a container to learn why it died, plus inspect previous logs.":
    "Поиск причины падения контейнера по его последнему состоянию завершения и предыдущим журнальным сообщениям.",
  "Exit code from last termination":
    "Код выхода при последнем завершении",
  "Termination reason (OOMKilled, Error, Completed)":
    "Причина завершения (OOMKilled, Error, Completed)",
  "Restart count per container":
    "Число перезапусков каждого контейнера",
  "Pods sorted by restart count (first container) to spot flappers":
    "Pod, отсортированные по числу перезапусков (первого контейнера), для поиска нестабильных",
  "Find Failed Pods in the current Namespace":
    "Найти Pod в статусе Failed в текущем Namespace",
  "Logs from a crashed/previous container":
    "Журнальные сообщения упавшего (предыдущего) контейнера",
  "Previous logs for a specific container in a multi-container Pod":
    "Предыдущие журнальные сообщения заданного контейнера в Pod с несколькими контейнерами",
  "Real-time CPU and memory usage per Pod, container and process. Requires metrics-server for kubectl top.":
    "Потребление CPU и памяти в реальном времени по Pod, контейнерам и процессам. Для kubectl top нужен metrics-server.",
  "Live CPU and memory usage by process inside the container":
    "Потребление CPU и памяти по процессам внутри контейнера в реальном времени",
  "CPU-heavy Pods across all Namespaces":
    "Pod с наибольшей нагрузкой на CPU во всех Namespace",
  "Memory-heavy Pods across all Namespaces":
    "Pod с наибольшим потреблением памяти во всех Namespace",
  "Per-container CPU/memory breakdown within a Pod":
    "Потребление CPU и памяти по контейнерам внутри Pod",
  "Current ResourceQuota usage vs hard limits in a Namespace":
    "Текущее потребление по ResourceQuota в сравнении с лимитами hard в Namespace",
  "Verify the actual cgroup limits set on a container vs what the spec declared.":
    "Сверка фактических лимитов cgroup контейнера с объявленными в спецификации.",
  "Node-wide memory stats (meminfo ignores the container cgroup limit)":
    "Статистика памяти всей Node (meminfo не учитывает лимит cgroup контейнера)",
  "Memory limit on cgroup v2":
    "Лимит памяти в cgroup v2",
  "CPU quota and period on cgroup v2":
    "Квота и период CPU в cgroup v2",
  "Current memory usage on cgroup v2":
    "Текущее потребление памяти в cgroup v2",
  "Declared requests and limits from the Pod spec":
    "Объявленные requests и limits из спецификации Pod",
  "Find evicted Pods and Node pressure conditions that caused them.":
    "Поиск вытесненных Pod и conditions нехватки ресурсов на Node, вызвавших вытеснение.",
  "All eviction events cluster-wide":
    "Все события вытеснения по всему кластеру",
  "Pod sandbox creation failures":
    "Сбои создания sandbox для Pod",
  "MemoryPressure condition per Node":
    "Condition MemoryPressure по каждой Node",
  "List evicted Pods across the cluster":
    "Список вытесненных Pod по всему кластеру",
  // Scheduling (Debug K8s)
  "Find Pods stuck Pending and read scheduler events that explain why they cannot be placed.":
    "Поиск Pod, зависших в Pending, и событий Scheduler, которые объясняют, почему их не удаётся разместить.",
  "Recent scheduling failures cluster-wide":
    "Последние сбои планирования по всему кластеру",
  "Scheduling failure events in current Namespace":
    "События сбоев планирования в текущем Namespace",
  "Pending Pods across all Namespaces":
    "Pod в статусе Pending во всех Namespace",
  "Find Pending Pods in current Namespace":
    "Найти Pod в статусе Pending в текущем Namespace",
  "Read taints on Nodes and tolerations, nodeSelector and affinity rules on Pods to spot mismatches.":
    "Изучение taints на Node, а также tolerations, nodeSelector и правил affinity на Pod для поиска несоответствий.",
  "Tab-separated taints per Node":
    "Taints по каждой Node, через табуляцию",
  "Pod affinity rules: nodeAffinity, podAffinity, podAntiAffinity":
    "Правила affinity Pod: nodeAffinity, podAffinity, podAntiAffinity",
  "Pod nodeSelector keys/values":
    "Ключи и значения nodeSelector Pod",
  "Tolerations: the taints the Pod tolerates":
    "Taints, которые допускает Pod (tolerations)",
  "See where Pods actually run and find uneven placement or unexpected Nodes.":
    "Проверка фактического размещения Pod, поиск неравномерного распределения и неожиданных Node.",
  "All Pods on a Node across all Namespaces":
    "Все Pod на Node во всех Namespace",
  "All Pods on a specific Node in current Namespace":
    "Все Pod на заданной Node в текущем Namespace",
  "Pods sorted by Node name to spot uneven placement":
    "Pod, отсортированные по имени Node, для поиска неравномерного распределения",
  // Helm (Debug Tools)
  "List and inspect failed or stuck Helm releases to understand the cause before attempting a rollback or reinstall.":
    "Список и изучение упавших или зависших релизов Helm, чтобы понять причину до отката или переустановки.",
  "Full revision history to spot failures":
    "Полная история ревизий для поиска сбоев",
  "Releases stuck in pending-install, pending-upgrade or pending-rollback":
    "Релизы, зависшие в pending-install, pending-upgrade или pending-rollback",
  "Failed releases across all Namespaces":
    "Упавшие релизы во всех Namespace",
  "List failed releases in current Namespace":
    "Список упавших релизов в текущем Namespace",
  "Release status and last deploy info":
    "Статус релиза и сведения о последнем деплое",
  "Retrieve notes, hooks, rendered manifests, and run chart test suites to pinpoint issues in a deployed release.":
    "Получение заметок, хуков, отрендеренных манифестов и запуск тестов чарта, чтобы найти проблему в развёрнутом релизе.",
  "All info: values, hooks, manifests, notes":
    "Всё сразу: значения, хуки, манифесты, заметки",
  "List hooks defined in the release":
    "Список хуков, определённых в релизе",
  "Rendered Kubernetes manifests of the release":
    "Отрендеренные манифесты Kubernetes релиза",
  "Show NOTES.txt output of release":
    "Показать заметки релиза (NOTES.txt)",
  "Simulate install and show debug output":
    "Сымитировать установку и показать отладочный вывод",
  "Check chart for errors and warnings":
    "Проверить чарт на ошибки и предупреждения",
  "Render templates with debug output":
    "Отрендерить шаблоны с отладочным выводом",
  "Run chart test suite":
    "Запустить набор тестов чарта",
  // Kustomize (Debug Tools)
  "Diagnose render failures and validate the output of an overlay before applying it to the cluster.":
    "Диагностика сбоев рендеринга и проверка вывода оверлея до применения к кластеру.",
  "Render overlay to see full output or error message":
    "Отрендерить оверлей и увидеть полный вывод или сообщение об ошибке",
  "Allow files outside the kustomization root (common path error)":
    "Разрешить файлы вне корня kustomization (частая ошибка путей)",
  "Enable plugins and KRM functions, including exec functions (trusted configs only)":
    "Включить плагины и KRM-функции, в том числе exec-функции (только для доверенных конфигураций)",
  "Preview the apply without persisting anything (client-side, still needs cluster access)":
    "Посмотреть результат apply без сохранения изменений (на стороне клиента, доступ к кластеру всё равно нужен)",
  "Server-side dry-run for Admission Webhook checks":
    "Dry-run на стороне сервера для проверок Admission Webhook",
  "Compare rendered output against the live cluster state and verify specific fields like images and Namespaces.":
    "Сравнение отрендеренного вывода с текущим состоянием кластера и проверка заданных полей, например образов и Namespace.",
  "Diff overlay against live cluster state":
    "Сравнить оверлей с текущим состоянием кластера",
  "List all resources the overlay manages":
    "Список всех ресурсов, которыми управляет оверлей",
  "Verify image substitutions in rendered output":
    "Проверить подстановку образов в отрендеренном выводе",
  "Check Namespace assignments in rendered output":
    "Проверить назначение Namespace в отрендеренном выводе",
  "Find a specific resource kind in rendered output":
    "Найти ресурс заданного kind в отрендеренном выводе",
  // K9s (Debug Tools)
  "Print K9s runtime paths and version, or enable debug logging to identify startup and connection issues.":
    "Вывод путей и версии утилиты K9s или включение отладочного журнала для поиска проблем при запуске и подключении.",
  "Print config, log, screen dump, skins, plugins and aliases paths":
    "Вывести пути к конфигурации, файлу журнала, дампам экрана, скинам, плагинам и алиасам",
  "Start K9s with debug logging enabled":
    "Запустить K9s с отладочным журналом",
  "Tail the K9s log file to inspect errors, panics, and connection traces. The path depends on your OS, run k9s info for the exact one.":
    "Просмотр файла журнала K9s в реальном времени для поиска ошибок, паник и проблем с подключением. Путь зависит от ОС, точный покажет k9s info.",
  "Follow K9s log on Linux":
    "Следить за файлом журнала K9s в Linux",
  "Follow K9s log on macOS":
    "Следить за файлом журнала K9s в macOS",
  "Filter error lines from K9s log on Linux":
    "Отфильтровать строки с ошибками из файла журнала K9s в Linux",
  "Filter error lines from K9s log on macOS":
    "Отфильтровать строки с ошибками из файла журнала K9s в macOS",
};
