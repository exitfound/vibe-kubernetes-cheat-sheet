// Russian for network-flat-pod-network: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "The Kubernetes network model, drawn as four Pods across three Nodes, where every Pod attaches to one flat cluster-wide address space, any Pod reaches any other Pod on any Node with no NAT barring intentional segmentation, the model promises the Kubelet only the Pods on its own Node, and the container runtime on each Node implements the model, almost always through a CNI plugin":
    "Сетевая модель Kubernetes, показанная на четырёх Pod и трёх Node, где каждый Pod подключён к одному плоскому адресному пространству на весь кластер, любой Pod связывается с любым другим Pod на любой Node без NAT, если сеть не сегментирована намеренно, модель обещает Kubelet только Pod на его собственной Node, а реализует модель среда выполнения контейнеров на каждой Node, почти всегда через CNI-плагин",

  "Rule one: every Pod not on hostNetwork gets its own IP, unique across the entire cluster. A Pod sees that same address as the one other Pods use to reach it, so there is no port mapping and no rewriting to reason about.":
    "По первому правилу каждый Pod без hostNetwork получает свой IP, уникальный во всём кластере. Pod видит тот же адрес, по которому к нему обращаются другие Pod, так что не нужно думать ни о пробросе портов, ни о подмене адресов.",

  "Rule two: any Pod can reach any other Pod on any Node directly, with no NAT on the way, barring intentional segmentation such as a NetworkPolicy. The source address that arrives is the real Pod IP, here 10.244.1.5, even when the packet crosses to another Node.":
    "По второму правилу любой Pod может напрямую связаться с любым другим Pod на любой Node, без NAT по пути, если сеть не сегментирована намеренно, например через NetworkPolicy. А в адресе источника до получателя доходит настоящий IP Pod, здесь 10.244.1.5, даже когда пакет переходит на другую Node.",

  "The address space is the same within one Node. Pod 10.244.1.5 reaches its neighbour on Node-1, Pod 10.244.1.6, with the same flat addressing and no NAT. The traffic never leaves the Node, and for the Pods it is the same model, with no special case.":
    "В пределах одной Node адресное пространство то же самое. Pod 10.244.1.5 обращается к своему соседу по Node-1, Pod 10.244.1.6, с той же плоской адресацией и без NAT. Трафик не покидает Node, и для Pod это та же самая модель, без особых случаев.",

  "Rule three is narrower, and it is about the guarantee and not the reach: the model promises the Kubelet only the Pods on its own Node. The Kubelet on Node-2 talks to Pod 10.244.2.7 to run the network probes that say whether that Pod is live and ready. Other Nodes are outside the promise.":
    "Третье правило более узкое, и оно про гарантию, а не про достижимость. Модель обещает Kubelet только Pod на его собственной Node. Kubelet на Node-2 обращается к Pod 10.244.2.7, чтобы выполнять сетевые пробы, которые говорят, жив ли Pod и готов ли он. Другие Node в это обещание не входят.",

  "Only a few parts of this live in the core. The container runtime on each Node implements the model, almost always through a CNI plugin such as Calico, Cilium or Flannel. Here the plugin lights the whole network. With another plugin in its place the model stays the same.":
    "В самом Kubernetes живёт лишь малая часть модели. Модель реализует среда выполнения контейнеров на каждой Node, почти всегда через CNI-плагин вроде Calico, Cilium или Flannel. Здесь плагин подсвечивает всю сеть. При замене плагина модель остаётся той же.",
};
