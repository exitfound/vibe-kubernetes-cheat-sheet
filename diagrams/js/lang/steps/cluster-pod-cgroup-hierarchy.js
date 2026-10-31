// Russian for cluster-pod-cgroup-hierarchy: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Pod cgroup hierarchy on a Node: the unified cgroup v2 tree at /sys/fs/cgroup, kubepods.slice under it holding every end-user Pod, the BestEffort and Burstable QoS slices beside a Guaranteed Pod slice, one slice per Pod below Burstable, and the container leaf where the runtime writes cpu.max, memory.max and cpu.weight":
    "Иерархия cgroup Pod на Node: единое дерево cgroup v2 в /sys/fs/cgroup, под ним kubepods.slice со всеми пользовательскими Pod, QoS-slice BestEffort и Burstable рядом со slice Guaranteed Pod, по одному slice на Pod под Burstable и лист контейнера, куда среда выполнения пишет cpu.max, memory.max и cpu.weight",

  "On a cgroup v2 Node the whole tree is one unified hierarchy mounted at /sys/fs/cgroup, and stat -fc %T on that path answers cgroup2fs. The Kubelet and the container runtime both write into it, so they have to agree on one cgroup driver, and with cgroup v2 that is the systemd driver on both.":
    "На Node с cgroup v2 всё дерево образует единую иерархию, смонтированную в /sys/fs/cgroup, и команда stat -fc %T по этому пути выводит cgroup2fs. В неё пишут и Kubelet, и среда выполнения контейнеров, поэтому им нужно договориться об одном драйвере cgroup, и с cgroup v2 это драйвер systemd у обоих.",

  "Under that root the Kubelet creates kubepods.slice and parents every end-user Pod below it, which is what cgroupsPerQOS does and it is on by default. The default enforceNodeAllocatable setting then makes Allocatable the ceiling over that whole subtree, enforced by evicting once the Pods together pass it.":
    "Под этим корнем Kubelet создаёт kubepods.slice и помещает под него каждый пользовательский Pod. Это и делает параметр cgroupsPerQOS, включённый по умолчанию. Затем настройка enforceNodeAllocatable в значении по умолчанию делает Allocatable потолком для всего этого поддерева, и этот потолок удерживают вытеснением, когда Pod вместе его превышают.",

  "One level down, kubepods.slice has three kinds of child. Burstable Pods go under kubepods-burstable.slice and BestEffort Pods under kubepods-besteffort.slice, so a value written on one QoS cgroup reaches the whole tier below it. A Guaranteed Pod gets no QoS slice: its own slice hangs straight off kubepods.slice.":
    "Уровнем ниже у kubepods.slice три вида потомков. Burstable Pod идут под kubepods-burstable.slice, а BestEffort Pod под kubepods-besteffort.slice, поэтому значение, записанное в одну QoS cgroup, действует на всю ветку под ней. Guaranteed Pod своего QoS slice не получает, и его собственный slice висит прямо на kubepods.slice.",

  "When Pod web-0 starts, the Kubelet gives it a slice of its own inside the tier its QoS class picked, named for the Pod uid. That slice is the parent of every container in the Pod, so the Pod is accounted in one place whatever its containers do inside it.":
    "Когда стартует Pod web-0, Kubelet даёт ему собственный slice, названный по uid Pod, внутри ветки, которую выбрал его класс QoS. Этот slice служит родителем всех контейнеров Pod, поэтому Pod учитывается в одном месте, что бы ни делали в нём его контейнеры.",

  "The container runtime creates the last level, one leaf cgroup per container, and writes the values into it: cpu.max from limits.cpu, memory.max from limits.memory in bytes, cpu.weight from requests.cpu. On runc 1.3.2 and crun 1.23 or later, 250m maps to weight 35, on older ones to 10. The no-internal-process rule keeps processes on the leaves, so this is the cgroup the app runs in.":
    "Среда выполнения контейнеров создаёт последний уровень, по одной листовой cgroup на контейнер, и пишет в неё значения: cpu.max из limits.cpu, memory.max из limits.memory в байтах, cpu.weight из requests.cpu. В runc 1.3.2 и crun 1.23 или новее 250m даёт weight 35, а в более старых 10. Правило no-internal-process держит процессы на листьях, так что приложение работает именно в этой cgroup.",

  "The tree only holds the numbers. Two cards show what acts on them: CPU Throttling and CFS Quota takes cpu.max as the budget a container may spend inside each period, and Container OOMKill takes memory.max as the cap that gets a container killed.":
    "Само дерево только хранит числа, а что на них действует, показывают две карточки. Карточка CPU Throttling and CFS Quota берёт cpu.max как бюджет, который контейнер может потратить в каждом периоде, а Container OOMKill берёт memory.max как лимит, сверх которого контейнер убивают.",
};
