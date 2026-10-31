// Russian for workloads-controller-kinds: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Six workload controller kinds over one row of Pods, where a Deployment creates a ReplicaSet and a CronJob creates a Job, while ReplicaSet, StatefulSet, DaemonSet and Job create the Pods themselves, and three questions separate them: whether a replica carries a stable identity, whether the count follows the matching Node set, and whether the work ends":
    "Шесть типов контроллеров рабочих нагрузок над одним рядом Pod, где Deployment создаёт ReplicaSet, а CronJob создаёт Job, тогда как ReplicaSet, StatefulSet, DaemonSet и Job создают Pod сами, и различают их три вопроса: есть ли у реплики стабильное имя, следует ли число Pod за набором подходящих Node и заканчивается ли работа",

  "Six main built-in kinds manage Pods for you, and each one of them ends at the same thing, a Pod. Four create Pods directly. The other two create another controller instead, so their Pods always arrive through that controller.":
    "Шесть основных встроенных типов управляют Pod за вас, и каждый из них в итоге приводит к одному и тому же, к Pod. Четыре типа создают Pod напрямую. Два остальных вместо этого создают ещё один контроллер, поэтому их Pod всегда появляются через этот контроллер.",

  "A Deployment is the common case for a stateless app. It creates a ReplicaSet and the ReplicaSet creates the Pods, which is why you rarely write a ReplicaSet yourself. Those replicas are interchangeable and how many there are is a number you set.":
    "Deployment это обычный выбор для приложения без состояния. Он создаёт ReplicaSet, а ReplicaSet создаёт Pod, поэтому ReplicaSet вы редко пишете сами. Эти реплики взаимозаменяемы, а их число задаёте вы.",

  "First question, does a replica need an identity. A StatefulSet names each Pod after itself and an ordinal, so in a StatefulSet called web the Pod with ordinal 0 is web-0, and a replacement comes back under that name. A Deployment promises none of it.":
    "Первый вопрос в том, нужно ли реплике стабильное имя. StatefulSet называет каждый Pod по своему имени и порядковому номеру, так что у StatefulSet с именем web Pod с номером 0 зовётся web-0, и замена возвращается под тем же именем. Deployment ничего такого не обещает.",

  "Second question, does the Pod count follow the Nodes. A DaemonSet carries no replica number at all. It places one Pod on each Node that matches, so a matching Node joining the cluster gains a Pod, and a Node leaving takes its Pod away.":
    "Второй вопрос в том, следует ли число Pod за Node. У DaemonSet вообще нет числа реплик. Он ставит по одному Pod на каждую подходящую Node, так что подходящая Node, вошедшая в кластер, получает Pod, а ушедшая Node уносит свой Pod с собой.",

  "Third question, does the work end. A Job runs Pods until the work is done or the Job gives up, and then it stops. A ReplicaSet, a StatefulSet and a DaemonSet are each meant to keep running.":
    "Третий вопрос в том, заканчивается ли работа. Job запускает Pod, пока работа не будет выполнена или пока сама Job не сдастся, а затем останавливается. Каждый из ReplicaSet, StatefulSet и DaemonSet рассчитан на постоянную работу.",

  "A CronJob adds a schedule. On each tick it creates about one Job, not exactly one, and that Job creates the Pods. So a CronJob reaches a Pod through a second controller.":
    "CronJob добавляет расписание. В каждый срок она создаёт примерно одну Job, а не строго одну, и уже эта Job создаёт Pod. Так CronJob доходит до Pod через второй контроллер.",
};
