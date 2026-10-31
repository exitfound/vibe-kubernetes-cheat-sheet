// Russian for cluster-graceful-node-shutdown: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Graceful Node shutdown, where the Kubelet holds a delay inhibitor lock, systemd signals it over D-Bus, and the Kubelet sets NotReady, terminates non-critical Pods first, then critical ones, and releases the lock":
    "Graceful Node shutdown, при котором Kubelet держит inhibitor lock типа delay, systemd подаёт ему сигнал через D-Bus, а Kubelet ставит NotReady, завершает сначала некритичные Pod, затем критичные и отпускает lock",

  "The Node is about to shut down (poweroff, reboot, or halt), and systemd emits PrepareForShutdown over D-Bus. Kubelet catches the signal via its logind subscription. Its delay-type inhibitor lock makes systemd pause the actual shutdown, so Kubelet can enter shutdown mode rather than let the OS kill processes outright.":
    "Node вот-вот выключится (poweroff, reboot или halt), и systemd отправляет PrepareForShutdown через D-Bus. Kubelet ловит сигнал через подписку на logind. Inhibitor lock типа delay, которым владеет Kubelet, заставляет systemd приостановить само выключение, поэтому Kubelet может перейти в режим shutdown, а не дать ОС сразу убить процессы.",

  "Kubelet sets the Node NotReady with reason KubeletNotReady and the message node is shutting down. The Scheduler stops placing anything here, and the Kubelet admission handler rejects even Pods tolerating the not-ready taint. Pods are bucketed by priority: at or above 2,000,000,000 is critical, the rest non-critical.":
    "Kubelet переводит Node в NotReady с reason KubeletNotReady и сообщением node is shutting down. Scheduler перестаёт что-либо сюда размещать, а admission handler самого Kubelet отклоняет даже Pod с toleration для taint not-ready. По приоритету Pod делятся на критичные, с 2,000,000,000 и выше, и некритичные, то есть все остальные.",

  "As it sets NotReady, Kubelet also kills every non-critical Pod in parallel, preStop hook first if any, then SIGTERM. The window is the 60s budget less the 20s kept for critical Pods, so 40s, or the Pod terminationGracePeriodSeconds if shorter. Each ends with the status reason Terminated.":
    "Вместе с NotReady Kubelet параллельно убивает все некритичные Pod, сначала вызывая хук preStop, если он есть, а затем посылая SIGTERM. Окно равно бюджету 60s минус 20s, оставленных критичным Pod, то есть 40s, или terminationGracePeriodSeconds Pod, если это значение меньше. Каждый такой Pod завершается со status reason Terminated.",

  "Once the non-critical Pods are killed and their volumes unmounted, or the 40s runs out, Kubelet kills the system-critical Pods the same way, in parallel. Their window is shutdownGracePeriodCriticalPods (20s here), also capped by terminationGracePeriodSeconds. DaemonSet infra like CNI or kube-proxy usually sits here.":
    "Когда некритичные Pod убиты и их тома отмонтированы, или же истекли 40s, Kubelet так же параллельно убивает системно-критичные Pod. Их окно задаёт shutdownGracePeriodCriticalPods (здесь 20s), и оно тоже ограничено terminationGracePeriodSeconds. Обычно в эту группу попадает инфраструктура на DaemonSet, например CNI или kube-proxy.",

  "The critical Pods are done or their 20s ran out. Kubelet releases the inhibitor lock, and systemd resumes the shutdown. After the monitor grace period with no Lease renewal, the node-lifecycle-controller turns Ready from False to Unknown and swaps the not-ready taint for unreachable, NoSchedule and NoExecute alike.":
    "Критичные Pod завершились, или истекли отведённые им 20s. Тогда Kubelet отпускает inhibitor lock, и systemd продолжает выключение. Если за monitor grace period Lease так и не продлили, node-lifecycle-controller меняет Ready с False на Unknown, а taint not-ready на unreachable, причём и для NoSchedule, и для NoExecute.",
};
