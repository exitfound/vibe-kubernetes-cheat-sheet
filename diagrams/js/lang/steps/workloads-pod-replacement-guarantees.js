// Russian for workloads-pod-replacement-guarantees: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Pod replacement guarantees: one Pod is lost under each of five controllers and the answers differ, a ReplicaSet, a Job and the Job a CronJob created hand back a new Pod with a new name while the CronJob itself starts nothing, a StatefulSet hands back the same ordinal with the same claim and a DaemonSet a fresh name on the same Node, and nothing comes back when the Node is gone":
    "Гарантии замены Pod: у каждого из пяти контроллеров теряется один Pod, и ответы у них разные. ReplicaSet, Job и Job, созданная CronJob, возвращают новый Pod с новым именем, а сама CronJob ничего не запускает, StatefulSet возвращает тот же порядковый номер с тем же PVC, DaemonSet новое имя на той же Node, а когда Node нет, не возвращается ничего",

  "The same thing happens to all five at one moment: the Pod is gone and the object leaves the API. That is equally true of every column, so nothing that follows depends on who noticed first. From here the answers differ, and what separates them is what each controller promises, not how fast it reacts.":
    "Со всеми пятью в один момент происходит одно и то же. Pod исчезает, и объект уходит из API. Это одинаково верно для каждой колонки, так что дальнейшее не зависит от того, кто заметил первым. С этого момента ответы расходятся, и разделяет их то, что обещает каждый контроллер, а не то, как быстро он реагирует.",

  "Three of them hand back a NEW Pod. A ReplicaSet replica is interchangeable, so its replacement comes at once with a fresh name. A Job makes one after a back-off delay while its completions are unmet, counting the loss against backoffLimit, 6 by default. The CronJob itself starts nothing before its next tick, but its Job does.":
    "Три из них возвращают НОВЫЙ Pod. Реплика ReplicaSet взаимозаменяема, поэтому замена приходит сразу и с новым именем. Job создаёт свою после задержки back-off, пока не набрано число completions, и засчитывает потерю в backoffLimit, который по умолчанию равен 6. Сама CronJob до следующего срабатывания ничего не запускает, но её Job запускает.",

  "Two of them hand back something the lost Pod already had. A StatefulSet returns the identical ordinal and keeps its claim, and the cluster attaches that volume to the Node the replacement lands on. A DaemonSet returns a fresh name, but only to the Node it lost one on, because its count follows the Nodes it targets and never a number you set.":
    "Два из них возвращают то, что у потерянного Pod уже было. StatefulSet возвращает тот же порядковый номер и сохраняет тот же PVC, и кластер подключает этот том к Node, на которую попала замена. DaemonSet возвращает новое имя, но только на ту Node, где потерял Pod, потому что число его Pod следует за целевыми Node и никогда не задаётся вами.",

  "The last answer is nothing at all, and here only the DaemonSet gives it. Once the Node is taken away, its Pod is garbage collected with it, and nothing is rescheduled elsewhere, because no other Node is short of one.":
    "Последний ответ в том, что не возвращается ничего, и здесь его даёт только DaemonSet. Когда Node убирают, сборщик мусора удаляет вместе с ней и её Pod, а в другом месте ничего заново не размещается, потому что на каждой другой Node свой Pod есть.",
};
