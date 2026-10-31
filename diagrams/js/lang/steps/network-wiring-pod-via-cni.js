// Russian for network-wiring-pod-via-cni: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "CNI plugin invocation: the Kubelet asks the CRI runtime for a Pod sandbox, the runtime runs the plugin list from the CNI config directory in order, the bridge plugin delegates addressing to the host-local IPAM plugin, the result of the chain comes up in the sandbox namespace as eth0, and on delete the runtime runs the same list in reverse with CNI_COMMAND=DEL":
    "Вызов CNI-плагинов: Kubelet просит sandbox Pod у среды выполнения CRI, среда выполнения по порядку запускает список плагинов из каталога конфигурации CNI, плагин bridge поручает адресацию плагину IPAM host-local, результат цепочки появляется в пространстве имён sandbox как eth0, а при удалении среда выполнения запускает тот же список в обратном порядке с CNI_COMMAND=DEL",

  "The Kubelet asks the CRI runtime (here containerd) for a Pod sandbox. The runtime first creates the Pod network namespace, with loopback only and no Pod IP, runs the plugin chain inside that same RunPodSandbox call, and only then starts the pause container in it.":
    "Kubelet просит у среды выполнения CRI (здесь это containerd) sandbox Pod. Среда выполнения сначала создаёт сетевое пространство имён Pod, только с loopback и без IP Pod, в том же вызове RunPodSandbox прогоняет цепочку плагинов и лишь потом запускает в этом пространстве контейнер pause.",

  "The runtime, not the Kubelet, reads the plugin list from /etc/cni/net.d and runs the first plugin as a plain executable. It gets CNI_COMMAND=ADD, the sandbox namespace path and CNI_IFNAME=eth0 in its environment, and the network config on stdin.":
    "Список плагинов из /etc/cni/net.d читает среда выполнения, а не Kubelet, и запускает первый плагин как обычный исполняемый файл. Через переменные окружения плагин получает CNI_COMMAND=ADD, путь к пространству имён sandbox и CNI_IFNAME=eth0, а сетевой конфиг на stdin.",

  "The bridge plugin does not hand out addresses itself. Its config names the IPAM plugin host-local, and bridge runs it as its delegate. The host-local plugin picks 10.244.1.5 from the range of this Node and returns it to the caller.":
    "Плагин bridge сам адреса не раздаёт. В его конфиге указан плагин IPAM host-local, и bridge запускает его как своего делегата. Плагин host-local берёт 10.244.1.5 из диапазона этой Node и возвращает адрес вызывающему.",

  "The runtime then runs the next plugin in the list. It passes the previous result in as prevResult, so portmap adds to what bridge already produced instead of starting over. That ordered list is what the word chain means here.":
    "Затем среда выполнения запускает следующий плагин списка и передаёт ему предыдущий результат как prevResult, так что portmap дополняет то, что уже сделал bridge, а не начинает заново. Этот упорядоченный список здесь и называется цепочкой.",

  "The last plugin prints one result on stdout: the interfaces the chain made, the addresses on them, the routes and the DNS. The one inside the sandbox namespace comes up as eth0 carrying 10.244.1.5, and the operation finishes as ADD ok.":
    "Последний плагин выводит на stdout один результат: интерфейсы, которые сделала цепочка, адреса на них, маршруты и DNS. Интерфейс внутри пространства имён sandbox появляется как eth0 с адресом 10.244.1.5, и операция завершается как ADD ok.",

  "Only now does the Kubelet start the app containers. They join the namespace that is already wired, so all of them answer on that one Pod IP. On delete the runtime runs the same list with CNI_COMMAND=DEL, in reverse order, and each plugin releases what it made.":
    "Только теперь Kubelet запускает контейнеры приложения. Они входят в пространство имён, уже подключённое к сети, поэтому все отвечают на одном IP Pod. При удалении среда выполнения запускает тот же список с CNI_COMMAND=DEL в обратном порядке, и каждый плагин освобождает то, что создал.",
};
