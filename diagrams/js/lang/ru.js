// Russian for the /diagrams/ card descriptions (the paragraph under each title on the grid), keyed by
// the English desc in the category cards.js and loaded only while Russian is on. Kinds, fields and
// component names stay Latin. unit/diagrams-i18n.test.mjs checks the keys against data.js.
export const RU = {
  // Cluster

  // Control Plane

  "A Kubernetes cluster runs many components on the control plane and every Node, yet none seems to talk to another directly. How do they interact, where does the cluster state live, and who is in charge?":
    "В кластере Kubernetes много компонентов в Control Plane и на каждой Node, но на первый взгляд они не общаются напрямую. Как же они взаимодействуют, где хранится состояние кластера и кто главный?",

  "You apply a single Deployment, and moments later a Pod runs on some Node, though you never created a ReplicaSet or picked the Node yourself. Who did all of that in between, and in what order did it happen?":
    "Вы применяете один-единственный Deployment, и вскоре на какой-то Node уже работает Pod, хотя ReplicaSet вы не создавали и Node сами не выбирали. Кто же проделал всю эту работу и в каком порядке?",

  "A write to the cluster can come back refused, or land in storage looking different from what you sent, with fields you never wrote. Who gets a say over every object before it is finally saved, and in what order?":
    "Запись в кластер могут отклонить или сохранить не в том виде, в каком вы её отправили, с полями, которых вы не указывали. Кто и в каком порядке может повлиять на каждый объект, прежде чем его сохранят?",

  "A Deployment stays one replica short, and the missing Pod is nowhere to be found, not even as a failed or Pending one, though the others were created. So where did it go, and what kept it from existing?":
    "Deployment так и недополучил одну реплику, а недостающего Pod нигде нет, даже в статусе Failed или Pending, хотя все остальные Pod были созданы. Куда же он делся и что не позволило этому Pod появиться?",

  "A controller needs a fresh picture of the cluster at all times, yet it does not keep asking the API for it, even in a cluster with thousands of objects. How does it learn of each change without hammering the API?":
    "Контроллеру всё время нужна свежая картина кластера, но он не опрашивает API без конца, даже в кластере с тысячами объектов. Как он узнаёт о каждом изменении, не перегружая при этом сам API?",

  "You and a controller write the same Deployment. Sometimes your apply is refused with a conflict, sometimes a field you set is quietly overwritten. Who owns each field, and who wins when both want it?":
    "Вы и контроллер пишете в один Deployment. Иногда ваш apply отклоняют из-за конфликта, иногда ваше поле тихо перезаписывают. Кому принадлежит каждое поле и кто побеждает, когда оно нужно обоим?",

  "A new Pod waits in Pending for a moment and then turns up on one Node out of many, though nobody told it where to go. How is that one Node chosen over the rest, and what rules some Nodes out first?":
    "Новый Pod ненадолго остаётся в Pending, а потом попадает на одну Node из многих, хотя никто не указал ему путь. Как выбирают именно эту Node среди остальных и что заранее отсеивает часть из них?",

  "A Node may refuse one Pod and happily take in another, and it can even throw out Pods that were already running there. What decides which Pod it takes in, which one it keeps and which one it sends away?":
    "Node может отказаться от одного Pod, но охотно принять другой, а может даже вытеснить Pod, которые уже на ней работали. От чего зависит, какой Pod она примет, какой оставит, а какой отправит прочь?",

  "An important Pod arrives on a full cluster with no room on any Node, and soon a less important Pod is gone from one of them. Who chose that victim, and does the newcomer always get the room that was freed?":
    "Важный Pod приходит в заполненный кластер, где нет места ни на одной Node, и вскоре с одной из них исчезает менее значимый Pod. Кто выбрал эту жертву и всегда ли новичок получает освободившееся место?",

  "You delete an object and the API answers at once, yet the object can still be listed afterwards and the command keeps waiting in your terminal. What is holding it back, and when is it finally gone for good?":
    "Вы удаляете объект, и API сразу отвечает, но объект всё ещё может быть виден в списке, а команда в терминале продолжает ждать. Что удерживает объект и когда он наконец исчезнет окончательно?",

  "One of three ETCD machines suddenly goes down, yet the cluster soon goes on accepting writes just as before. How do the remaining two stay consistent, and what happens if a second machine fails too?":
    "Один из трёх узлов с ETCD внезапно отказывает, но кластер вскоре снова принимает записи, как и прежде. Как два оставшихся узла сохраняют согласованность данных и что будет, если откажет и второй?",

  "You run three copies of a controller for safety, yet only one acts at a time, and when it crashes another takes over on its own. How do they agree on who leads, and how do the others notice that it is gone?":
    "Вы держите три копии контроллера для надёжности, но действует лишь одна, а когда она падает, её место сама занимает другая. Как они решают, кто лидер, и как остальные замечают, что лидера больше нет?",

  // Node Runtime

  "A Pod lands on a Node and its containers start, and if one dies later, it can come back on its own. What keeps comparing the Pod spec with the containers running on that Node, and fixes any difference?":
    "Pod попадает на Node, его контейнеры запускаются, и если один позже упадёт, он может вернуться сам. Что всё время сверяет spec Pod с работающими на Node контейнерами и устраняет любое расхождение?",

  "Containers in a Pod share one IP address and localhost, and the address outlives a restart of any of them, so it belongs to none. What does the Kubelet ask the runtime, such as containerd, to build before them?":
    "Контейнеры в Pod делят один IP-адрес и localhost, и адрес переживает перезапуск любого из них, так что не принадлежит ни одному. Что Kubelet просит среду выполнения, вроде containerd, создать раньше них?",

  "In many clusters the API server itself runs as a Pod, yet deleting that Pod with kubectl stops nothing at all, and it soon shows up again. Who started it before any API existed, and why does it simply ignore you?":
    "Во многих кластерах API Server работает как Pod, но удаление этого Pod через kubectl ничего не даёт, и вскоре он возвращается. Кто запустил его до появления API и почему он игнорирует команды?",

  "A Node reports plenty of memory in its capacity, yet a Pod that asks for less than that stays Pending with Insufficient memory. So how much of that memory is really open to Pods, and where did the rest of it go?":
    "Node сообщает о большом объёме памяти в capacity, но Pod, который просит меньше, остаётся в Pending с причиной Insufficient memory. Сколько памяти реально доступно для Pod и куда ушла остальная?",

  "You set CPU and memory limits on a Pod, and the Linux kernel on its Node must enforce them, yet the kernel never reads a Pod spec. So where do those numbers end up for the kernel to find, and who writes them?":
    "Вы задаёте Pod ограничения на CPU и память, и ядро Linux на его Node должно за ними следить, но spec Pod оно не читает. Так куда попадают эти числа, чтобы ядро их нашло, и кто их туда записывает?",

  "A container hits its CPU limit and nothing dies, yet its responses slow down and no event, status or restart in the cluster says why. What is the kernel doing to it, and for how long does it hold the container back?":
    "Контейнер упирается в свой CPU limit, и ничего не падает, но ответы тормозят, а ни событие, ни статус, ни перезапуск в кластере не говорят, почему. Что ядро делает с контейнером и как долго его сдерживает?",

  "A container grows past its memory limit and suddenly restarts, leaving a short reason and an exit code behind in its status. What killed it so abruptly, and who wrote down that reason for you afterwards?":
    "Контейнер выходит за свой лимит памяти и внезапно перезапускается, оставив после себя в статусе короткую причину и код выхода. Что так резко его убило и кто уже потом записал для вас эту причину?",

  "A Node slowly fills its disk with old images and dead containers, until some of them vanish without you deleting them. What goes first, what decides the order, and when does the cleanup actually start?":
    "Node постепенно забивает диск старыми образами и мёртвыми контейнерами, пока часть из них не исчезнет без вашего участия. Что уходит первым, что задаёт порядок и когда очистка на самом деле начинается?",

  // Node Lifecycle

  "A new machine joins the cluster and shows up as a Node right away, yet for a while no ordinary Pod lands on it. What has to happen on that machine before it can take ordinary Pods, and who decides it is ready?":
    "Новый узел входит в кластер и сразу виден как Node, однако какое-то время обычные Pod на него не попадают. Что должно случиться, прежде чем он начнёт их принимать, и кто решает, что узел готов?",

  "A Node has conditions like Ready and MemoryPressure. On a problem the control plane taints it against new Pods, and for one condition the taint evicts running ones too. Which one, and which Pods stay?":
    "У Node есть условия вроде Ready и MemoryPressure. При проблеме Control Plane ставит на неё taint против новых Pod, а taint одного условия вытесняет и работающие. Какое условие и какие Pod остаются?",

  "You need to take a Node down for maintenance, but the apps running on it must keep serving the whole time. How do you empty it without dropping a single one of them, and what can make it stall halfway?":
    "Node нужно вывести на обслуживание, но работающие на ней приложения должны всё это время продолжать отвечать. Как освободить её, не уронив ни одного из них, и что может застопорить это на полпути?",

  "A Node is told to power off while its Pods are still serving requests, and the system would normally just kill them all. Can they shut down cleanly first, in what order, and how long does each of them get?":
    "Node велено выключиться, пока её Pod ещё отвечают на запросы, и обычно система просто убила бы их всех. Могут ли они сначала корректно завершиться, и если да, то в каком порядке и сколько времени у каждого?",

  "A Node starts running out of memory or disk space, and its Pods begin to stop one by one, though nobody deleted them. Who decides which of them go first, and why do some of them survive to the very end?":
    "На Node заканчивается память или место на диске, и её Pod начинают один за другим останавливаться, хотя никто их не удалял. Кто решает, какие уйдут первыми, и почему некоторые доживают до самого конца?",

  "A Node reboots and comes back online, but some of the Pods that ran on it before may not be there again, and others return with fresh containers. What comes back on its own, and what is lost for good?":
    "Node перезагружается и снова выходит на связь, но часть её прежних Pod может так и не вернуться, а другие возвращаются с новыми контейнерами. Что возвращается само, а что пропадает навсегда?",

  "A Node suddenly goes silent, yet for several minutes its Pods stay listed on it and nothing replaces them, even with healthy Nodes left. How long until replacements run somewhere else, and why so slow?":
    "Node внезапно замолкает, но ещё несколько минут её Pod числятся на ней и на смену им ничего не приходит, хотя исправные Node ещё есть. Через сколько замены заработают в другом месте и почему так долго?",

  "A rack fails, and the node-lifecycle-controller taints its Nodes one at a time so their Pods can be evicted, and can go slower if much of their zone is down. Why so cautious, and when does it stop tainting?":
    "Стойка отказала, и node-lifecycle-controller по одной ставит на её Node taint, чтобы Pod с них вытеснили, а при многих отказах в зоне может и медленнее. Почему он так осторожен и когда перестаёт ставить taint?",

  // Workloads

  // Pods Bootstrap

  "A new Pod is not Running yet, and kubectl shows its STATUS going from Pending to Init:0/2 and then to PodInitializing. Which component is holding it at each step, and where should you look when it seems stuck?":
    "Новый Pod ещё не перешёл в Running, а его STATUS в kubectl меняется с Pending на Init:0/2, а затем и на PodInitializing. Какой компонент держит Pod на каждом шаге и куда смотреть, когда он кажется зависшим?",

  "A Pod was created a minute ago and still has no Node, yet the Scheduler has not even once tried to place it or marked it unschedulable. What is holding it back, and what lets the Scheduler make its first try?":
    "Pod был создан минуту назад и всё ещё не попал на Node, хотя Scheduler ни разу не пытался разместить его и не помечал неразмещаемым. Что удерживает Pod и что позволит Scheduler сделать первую попытку?",

  "A Pod is already on its Node and its containers seem to be starting, yet it still does not report Ready and gets no Service traffic. Which steps of its startup are unfinished, and who signs off each of them?":
    "Pod уже на своей Node, его контейнеры вроде бы запускаются, но в Ready он всё ещё не перешёл и трафика от Service не получает. Какие этапы запуска ещё не пройдены и кто отмечает каждый из них?",

  "A container cannot start until its image is on the Node, and a pull from a private registry may fail and back off between retries. Where does the Kubelet get credentials, and which layers must actually be pulled?":
    "Контейнер не запустится, пока его образа нет на Node, а загрузка из закрытого реестра может сорваться и повторяться всё реже. Где Kubelet берёт учётные данные и какие слои действительно нужно скачать?",

  "Regular init containers finish one by one before the app starts, while a sidecar runs beside it as long as the Pod lives. In what order do they start, who waits for whom, and who restarts the sidecar when it crashes?":
    "Обычные init-контейнеры по очереди завершаются до старта приложения, а sidecar работает рядом, пока живёт Pod. В каком порядке они стартуют, кто кого ждёт и кто перезапускает sidecar, если тот падает?",

  "You edit a ConfigMap, yet the running container still sees the old value in its environment however long you wait. When does a container get its variables, why does the edit miss it, and what makes it read them again?":
    "Вы правите ConfigMap, а работающий контейнер всё ещё видит в окружении старое значение, сколько ни жди. Когда контейнер получает переменные, почему правка его минует и что заставляет перечитывать их?",

  "A Pod with four containers reserves far less CPU than their requests add up to, and still holds all of it after one has finished. How is that amount worked out, and what do the Scheduler and the Kubelet do with it?":
    "Pod из четырёх контейнеров резервирует куда меньше CPU, чем они просят вместе, и всё ещё держит весь резерв, когда один уже завершился. Как считается эта величина и что с ней делают Scheduler и Kubelet?",

  "Three Pods differ only in CPU and memory requests and limits, which give each a QoS class. When the Node runs low on memory, two are evicted. Which class is each, when is it set, and does it decide the eviction order?":
    "Три Pod отличаются лишь requests и limits для CPU и памяти, и по ним каждый получает класс QoS. Когда на Node мало памяти, два из них вытесняют. Какой у кого класс, когда его ставят и решает ли он порядок?",

  // Pods Lifecycle

  "A container inside a Pod keeps crashing and restarting, yet the phase of the Pod stays Running the whole time. What does that phase tell you, what does it hide, and when does the Pod leave Running for good?":
    "Контейнер внутри Pod раз за разом падает и перезапускается, но статус Pod всё это время остаётся Running. Что тогда сообщает этот статус, о чём он умалчивает и когда Pod покидает Running насовсем?",

  "A container inside a running Pod exits, and sometimes it comes back, while at other times it stays down for good. What decides which of the two happens next, and what policy fits a long-lived app or a Job?":
    "Контейнер в работающем Pod завершается и иногда возвращается, а иногда больше не поднимается. От чего зависит, что из двух случится, и какая политика подходит долгоживущему приложению или Job?",

  "Each time the Kubelet restarts a broken container, the pause before the next try grows longer, until it hits a ceiling. Why the slowdown, what does kubectl show during the wait, and what finally resets the pause?":
    "Каждый раз, когда Kubelet перезапускает сломанный контейнер, пауза перед новой попыткой растёт, пока не упрётся в потолок. Зачем это замедление, что видно в kubectl во время паузы и что в итоге её сбрасывает?",

  "A container crashed and restarted on its own, and now it runs as if nothing had ever gone wrong. Where can you still find out what killed it the last time around, and for how many restarts does that answer last?":
    "Контейнер упал и сам перезапустился, и теперь работает так, будто ничего плохого и не случалось. Где всё ещё можно выяснить, что убило его в прошлый раз, и на сколько перезапусков этого ответа хватает?",

  "A container runs an image with no shell and no tools, so there is nothing to exec into, and restarting the Pod is not an option either. How do you look inside while it keeps running, and see its processes and files?":
    "В контейнере образ без оболочки и инструментов, так что подключиться к нему нечем, а перезапускать Pod тоже нельзя. Как заглянуть внутрь, не прерывая его работу, и увидеть процессы и файлы контейнера?",

  "A slow app can be killed mid boot, while another stays up but loses traffic. How does the Kubelet tell a slow start from a hang with startup, liveness and readiness probes, and what does each failure change?":
    "Медленное приложение могут убить до конца загрузки, а другое живо, но теряет трафик. Как Kubelet пробами startup, liveness и readiness отличает долгий старт от зависания и что меняет провал каждой?",

  "A running Pod is short on CPU, and you would rather not delete it and wait for a replacement just to give it more. Can its resources change while it keeps running, and what can still stand in the way of the change?":
    "Работающему Pod не хватает CPU, а удалять его и ждать замену только ради того, чтобы выдать ему больше, не хочется. Можно ли поменять ресурсы, пока Pod работает, и что всё же может этому помешать?",

  "With postStart and preStop hooks a container can run a command right after it starts and another before it stops, yet they behave nothing alike. Where does each sit, who waits for it, and what does a slow hook cost?":
    "Через хуки postStart и preStop контейнер может выполнить команду сразу после старта, а другую перед остановкой, но хуки совсем не похожи. Где место каждого, кто его ждёт и чего стоит медленный хук?",

  "You delete a Pod, yet it does not vanish at once and may keep serving requests for a moment longer. What happens between the delete and the time it is finally gone, and what if the app takes too long to exit?":
    "Вы удаляете Pod, но он исчезает не сразу и ещё недолго может обслуживать запросы. Что происходит между удалением и окончательным уходом Pod и что, если приложение завершается слишком долго?",

  "A Pod with several app and sidecar containers is shutting down, and the sidecars have to outlive the app. In what order are they stopped, who goes last, and what happens if the grace period runs out first?":
    "Pod с контейнерами приложения и sidecar завершается, и sidecar должны пережить приложение. В каком порядке их останавливают, кто уходит последним и что, если grace period истечёт раньше?",

  "A Node goes silent and its Pod hangs in Terminating indefinitely, while the StatefulSet will not start a replacement under the same name. Is it safe to force it out, and what can go wrong if the Node is still alive?":
    "Node замолкает, её Pod бессрочно зависает в Terminating, а StatefulSet не запускает замену под тем же именем. Безопасно ли удалить Pod принудительно и что может пойти не так, если Node всё ещё жива?",

  "Finished Pods pile up long after their containers exit, and most stay until their number passes a threshold. Who deletes them, which go first, and which Pods, finished or not, are deleted at any count?":
    "Завершённые Pod долго копятся после остановки контейнеров, и большинство ждёт, пока их не станет больше порога. Кто их удаляет, какие первыми и какие, завершённые или нет, удаляются при любом числе?",

  // Controllers

  "Deployment, ReplicaSet, StatefulSet, DaemonSet, Job and CronJob manage Pods for you, and at first they seem to do the same thing. Which one does your workload need, and which questions narrow it to one?":
    "Deployment, ReplicaSet, StatefulSet, DaemonSet, Job и CronJob управляют Pod за вас и поначалу будто делают одно и то же. Какой из них нужен вашей рабочей нагрузке и какие вопросы сужают выбор?",

  "A ReplicaSet replaces a deleted Pod, pulls in a bare Pod whose labels match its selector, and lets a Pod relabelled off the selector drop out and keep running. How does it keep count, and which Pods are its own?":
    "ReplicaSet заменяет удалённый Pod, забирает в набор одиночный Pod с подходящими метками и отпускает Pod, чьи метки перестали подходить, а тот работает дальше. Как он ведёт счёт и какие Pod считает своими?",

  "You ship a new image to a Deployment, and its Pods are swapped for new ones while the app keeps answering. How many may be extra or missing at any moment, and what has to happen before an old Pod may go?":
    "Вы выкатываете новый образ в Deployment, и его Pod сменяются новыми, а приложение отвечает и дальше. Сколько может быть лишних или недостающих Pod в любой момент и после чего старый Pod может уйти?",

  "A Deployment updates its Pods by the RollingUpdate or Recreate strategy. Under one two versions answer at once, under the other nothing serves for a while. Which is which, and in what order does each replace them?":
    "Deployment обновляет Pod по стратегии RollingUpdate или Recreate. При одной отвечают сразу две версии, а при другой какое-то время ответа нет. Какая к чему ведёт и в каком порядке каждая заменяет Pod?",

  "A new version of a Deployment turns out broken, and you need an earlier working one back fast. Where exactly is the old version kept, does going back build a new ReplicaSet, and how far back can you still go?":
    "Новая версия Deployment оказалась сломанной, и нужно быстро вернуть более раннюю рабочую. Где именно хранится старая версия, создаёт ли откат новый ReplicaSet и докуда ещё можно откатиться?",

  "By default a StatefulSet starts Pods one at a time, each waiting for the one before, and scales down in reverse. What exactly does each Pod wait for, and what stays behind when a Pod is replaced or removed?":
    "По умолчанию StatefulSet запускает Pod по одному, и каждый ждёт предыдущего, а при сокращении реплик удаляет их с конца. Чего именно ждёт каждый Pod и что остаётся после его замены или удаления?",

  "You edit the template of a running StatefulSet, and its Pods are replaced one by one from the highest ordinal down, all, some or none. What sets how far the update goes, and who decides when a Pod is replaced?":
    "Вы меняете шаблон работающего StatefulSet, и его Pod заменяются по одному с наибольшего номера, то все, то часть, то ни один. Что определяет, как далеко зайдёт обновление, и кто решает, когда заменят Pod?",

  "A new Node joins the cluster and may get no Pod from the DaemonSet until someone labels it. How does a DaemonSet decide where its Pods run, how many it needs, and what happens when a Node leaves?":
    "В кластер приходит новая Node, а Pod от DaemonSet там может не быть, пока на неё не повесят метку. Как DaemonSet решает, где работают его Pod и сколько их нужно, и что происходит, когда Node уходит?",

  "A Job needs 5 successful completions, runs up to 3 Pods at a time, and one Pod fails. How does the Job still reach the finish, what does that one failure change for the Pods it creates next, and when would it give up?":
    "Job нужно 5 успешных завершений, она запускает до 3 Pod сразу, и один Pod завершается неудачей. Как Job всё же доходит до конца, что одна эта неудача меняет для следующих Pod и когда Job сдалась бы?",

  "A Job has finished its work, yet the Job and all its Pods are still there in the cluster. How long do they stay there, from which moment is the wait counted, and what removes the Pods along with the Job?":
    "Job закончила работу, но и она сама, и все её Pod по-прежнему остаются в кластере. Как долго они там пробудут, с какого момента отсчитывается ожидание и благодаря чему Pod удаляются вместе с самой Job?",

  "A CronJob runs a backup every five minutes, and sometimes the previous run is still going when the next is due. What happens at each tick, why do some stay empty, and how many old runs does it keep?":
    "CronJob делает резервную копию каждые пять минут, и порой к сроку следующего запуска прошлый ещё идёт. Что происходит в каждый срок, почему иногда запуска нет и сколько старых запусков она хранит?",

  "What replaces a lost Pod depends on its owner, a ReplicaSet, StatefulSet, DaemonSet or Job from you or a CronJob. What does each bring back, what survives of the old Pod, and when does nothing return?":
    "Чем заменят пропавший Pod, зависит от владельца, будь то ReplicaSet, StatefulSet, DaemonSet или Job, созданная вами или CronJob. Что вернёт каждый, что останется от старого Pod и когда ничего не вернётся?",

  // Networking

  // Network Foundations

  "A Pod on one Node reaches a Pod on another with no address translation, so the receiver sees the real sender IP. What does the network model promise, what part of it is Kubernetes, and who does the rest?":
    "Пакет от Pod на одной Node доходит до Pod на другой без подмены адресов, и получатель видит настоящий IP отправителя. Что обещает сетевая модель, какая её часть в самом Kubernetes и кто делает остальное?",

  "Pods on many Nodes take IPs from one cluster range at once, yet no two get the same address. Who keeps two Nodes from handing out one IP, where does each Pod IP come from, and when does a Node get its range?":
    "Pod на многих Node разом берут IP из одного диапазона кластера, но ни один адрес не повторяется. Кто не даёт двум Node выдать один IP, откуда IP каждого Pod и когда Node получает свой диапазон?",

  "You create a Service with no clusterIP set, and it still gets a virtual IP no other Service holds. Who picks it, what stops two Services from landing on one address, and what happens when the range fills up?":
    "Вы создаёте Service без поля clusterIP, и он всё равно получает виртуальный IP, не занятый другими Service. Кто выбирает этот IP, что мешает двум Service занять один адрес и что будет, когда диапазон кончится?",

  "A cluster runs IPv4 and IPv6 side by side, and one Pod answers on an address of each family. How do Pods and Services get two addresses, which one does a client end up using, and where does each of them lead?":
    "В кластере IPv4 и IPv6 работают бок о бок, и один Pod отвечает по адресу каждого семейства. Как Pod и Service получают по два адреса, какой из них в итоге использует клиент и куда ведёт каждый адрес?",

  "A Pod usually acts like a separate machine, with its own address, routes and free ports. What gives a Pod this network stack, what does its second container get, and what is left of the stack once the Pod is deleted?":
    "Обычно Pod ведёт себя как отдельная машина, с адресом, маршрутами и свободными портами. Откуда у Pod сетевой стек, что получает второй контейнер Pod и что от стека остаётся, когда Pod удалён?",

  "A cluster grows to thousands of Services, and in some kube-proxy modes each one can slow new connections. How do the iptables and IPVS modes find a backend, and what replaces the deprecated IPVS?":
    "Кластер разрастается до тысяч Service, и в некоторых режимах kube-proxy каждый из этих Service может замедлять новые соединения. Как режимы iptables и IPVS находят бэкенд и что заменяет устаревший IPVS?",

  "A Pod has been deleted, yet for a short while kube-proxy rules can still send traffic to its old address. How long do those rules live on, what finally rewrites them, and what does the cluster gain by the wait?":
    "Pod уже удалён, но правила kube-proxy ещё недолго могут слать трафик на прежний адрес Pod. Сколько ещё живут эти правила, что их в итоге переписывает и что кластер выигрывает от этого ожидания?",

  "NAT rules on a Node send a new Service connection to one Pod, later packets usually follow, and replies come from the Service IP. How is the choice remembered, why do they skip NAT, and what limits that memory?":
    "NAT на Node шлёт новое соединение с Service в один Pod, следующие пакеты обычно идут туда же, а ответы приходят с IP Service. Как запоминается выбор, почему они минуют NAT и что ограничивает эту память?",

  "A packet from a Pod to a Service ClusterIP enters the Node kernel, which swaps its destination for a real Pod IP. Which netfilter hooks does it pass, why must that precede routing, and what happens to the reply?":
    "Пакет из Pod на ClusterIP у Service попадает в ядро Node, где адрес получателя меняется на IP настоящего Pod. Какие хуки netfilter проходит пакет, почему подмена нужна до выбора маршрута и что с ответом?",

  "Some clusters route traffic to Services with no kube-proxy running and not one Service rule in iptables. What does the work instead, when is the backend picked, and why does it stay fast in big clusters?":
    "Некоторые кластеры доводят трафик до Service без kube-proxy и без единого правила Service в iptables. Что заменяет kube-proxy, когда выбирается бэкенд и почему всё остаётся быстрым и в больших кластерах?",

  "A Pod sends a packet to one address, and the address alone decides if it goes to a Service, another Pod or the internet. What tells the three apart, in what order are the checks made, and what is done to each?":
    "Pod отправляет пакет на один адрес, и лишь от адреса зависит, уйдёт пакет к Service, к другому Pod или в интернет. Что отличает эти три случая, в каком порядке идут проверки и что делают с каждым?",

  "By default any Pod can reach any other, and now a database must take calls from the web Pods alone. What stops all the others, where does a refused call die, and who actually enforces the rule you wrote?":
    "По умолчанию все Pod доступны друг другу, а теперь база должна пускать лишь Pod веб-приложения. Что останавливает остальных, где обрывается отклонённый вызов и кто на самом деле применяет ваше правило?",

  // Pod Networking

  "An app and its sidecar run as separate containers, yet they talk over localhost and can clash over the same port. What exactly do the containers of one Pod share, and what does each of them still keep to itself?":
    "Приложение и его sidecar это разные контейнеры, но они общаются через localhost и могут столкнуться на одном порту. Что именно делят контейнеры одного Pod и что каждый из них всё же оставляет себе?",

  "Some Pods, like kube-proxy, answer right on their Node address via the field hostNetwork or hostPort. How does each field do it, what does the Pod give up, and why can no second copy run on that Node?":
    "Некоторые Pod, как kube-proxy, отвечают прямо на адресе своей Node через поле hostNetwork или hostPort. Как каждое поле это делает, чем Pod платит и почему вторая копия не встанет на ту же Node?",

  "A new Pod starts with only a loopback, and a moment later it has an address, a route and a working interface. Who sets it all up for the Pod, in what order, and who takes it apart again when the Pod is deleted?":
    "Новый Pod стартует лишь с loopback, а через мгновение у него уже есть адрес, маршрут и рабочий интерфейс. Кто всё это настраивает, в каком порядке и кто разбирает всё обратно, когда этот Pod удаляют?",

  "Inside a Pod the network interface has an address, yet it is only one end of a virtual cable, and the end on the Node has none. How does a packet cross the cable, and why does the IP belong to the Pod, not a container?":
    "Внутри Pod у сетевого интерфейса есть адрес, но это лишь один конец виртуального канала, а у второго, на Node, адреса нет. Как пакет проходит по этому каналу и почему IP принадлежит Pod, а не контейнеру?",

  "Two Pods on one Node talk, and with the bridge plugin the packet never touches the network card of the machine. How does it get across, how does the sender find the other Pod, and why is nothing rewritten?":
    "Два Pod на одной Node общаются, и с плагином bridge пакет так ни разу и не касается сетевой карты узла. Как он добирается до соседа, как отправитель находит другой Pod и почему ничего не переписывается?",

  "A packet goes from a Pod to a Pod on another Node, though the network between Nodes may know only Node addresses. How does it cross, what does an outer header around it cost, and can it go unwrapped?":
    "Пакет идёт из Pod в Pod на другой Node, хотя сеть между узлами может знать только адреса узлов. Как он туда доходит, чего стоит внешний заголовок вокруг него и может ли он пройти без обёртки?",

  "Ping between two Pods answers, yet sending a lot of data between them can hang. Where do the big packets go, why does the sending Node never learn they are too big, and how is it fixed without ICMP?":
    "Ping между двумя Pod отвечает, а передача большого объёма данных может зависнуть. Где теряются крупные пакеты, почему Node-отправитель так и не узнаёт, что они слишком велики, и как это исправить без ICMP?",

  "A Pod opens a connection to a server on the internet and gets its answer, though no route out there leads back to a Pod address. How does the reply find its way home, and who rewrites the addresses on the way?":
    "Pod открывает соединение с сервером в интернете и получает от него ответ, хотя ни один маршрут снаружи не ведёт к адресу Pod. Как ответ находит дорогу обратно к Pod и кто по пути переписывает адреса?",

  // Services & Endpoints

  "Kubernetes has several kinds of Service, and some get a virtual IP while others are answered by DNS alone. How do they build on each other, which ones open to clients outside the cluster, and which stand apart?":
    "В Kubernetes несколько видов Service, одни получают виртуальный IP, а за других отвечает только DNS. Как они надстраиваются друг над другом, какие открыты клиентам вне кластера и какие стоят особняком?",

  "No Pod holds a Service ClusterIP and no single host answers for it, yet each connection to it reaches a Pod behind the Service. Who turns that address into a Pod IP, and why does a connection stay on one Pod?":
    "ClusterIP у Service не принадлежит ни одному Pod, и ни один отдельный хост за него не отвечает, но соединения доходят до Pod. Кто превращает адрес в IP Pod и почему соединение остаётся на одном Pod?",

  "The Service exists and its name resolves, yet the app behind it never receives a single request from any client. Where along the path from the name to the Pod does the chain break, and how do you find it?":
    "Service создан, и его имя разрешается, но приложение за ним так и не получает ни одного запроса ни от одного клиента. Где на пути от имени до Pod обрывается цепочка и как отыскать это место?",

  "Every Pod matches the selector of a Service, yet one of them gets no traffic at all while its container keeps running. Who decides which Pods are serving right now, and how does every Node find out about it?":
    "Все Pod подходят под селектор Service, но один вовсе не получает трафика, хотя его контейнер продолжает работать. Кто решает, какие Pod сейчас обслуживают запросы, и как об этом узнаёт каждая Node?",

  "A rolling update can delete a Pod behind a Service without a single request to it failing, not even a long one that is still running. How does that Pod stop taking new traffic and still finish all of its work in time?":
    "Поэтапное обновление может удалить Pod за Service так, что ни один запрос к Pod не оборвётся, даже долгий и ещё идущий. Как Pod перестаёт брать новый трафик и всё же успевает доделать всё начатое?",

  "Two connections from the same client to one Service can land on Pods in different zones. Which backend does each one reach, how can you steer that choice, and what if the client zone has no ready Pod?":
    "Два соединения одного клиента с одним Service могут попасть в Pod из разных зон. К какому бэкенду уходит каждое из них, как можно повлиять на этот выбор и что будет, если в зоне клиента нет готового Pod?",

  "A Pod calls a DaemonSet agent through a Service, and the call can land on the agent of another Node across the cluster network. How do you keep it local, and what happens to the call if the local agent is down?":
    "Pod обращается к агенту DaemonSet через Service, и вызов может уйти через сеть кластера к агенту на другой Node. Как удержать вызов на своей Node и что с ним случится, если местный агент недоступен?",

  "A Service can lead out of the cluster as an ExternalName with a DNS name, or with no selector and hand-set endpoints. How does each reach the server, and why can TLS fail once the ExternalName resolves?":
    "Service может вести наружу как ExternalName с DNS-именем или без селектора с ручными эндпоинтами. Как каждый вариант доходит до сервера и почему TLS может сорваться, когда ExternalName разрешился?",

  // External Traffic

  "A client outside the cluster dials a NodePort Service on a Node with none of its Pods, and by default still gets an answer from a Pod on another Node. Who passes the connection on, and what does a load balancer add?":
    "Внешний клиент обращается к Service типа NodePort на Node без его Pod и по умолчанию всё равно получает ответ от Pod на другой Node. Кто передаёт соединение дальше и что добавит балансировщик?",

  "Behind a load balancer the app sees a Node IP by default, not the client. Local instead of Cluster in the Service externalTrafficPolicy fixes that but can load Pods unevenly. What does each value cost?":
    "Приложение за балансировщиком по умолчанию видит IP Node, а не клиента. Смена externalTrafficPolicy у Service с Cluster на Local это исправляет, но может неравно нагрузить Pod. Чем платит каждое значение?",

  "On bare metal a LoadBalancer Service just stays pending, as no cloud is there to give it an address. Who hands one out, how does the router learn where it lives, and what happens when the Node that holds it fails?":
    "На голом железе Service типа LoadBalancer так и висит в ожидании, ведь облака, дающего адрес, нет. Кто его выдаёт, как маршрутизатор узнаёт, где адрес, и что будет, если откажет держащая его Node?",

  "Traffic from a load balancer can hop through a second Node before it reaches a Pod, losing the client address on the way. How can it go straight to the Pods instead, and what happens when one Pod is replaced?":
    "Трафик от балансировщика может пройти через вторую Node, прежде чем дойти до Pod, и по пути потерять адрес клиента. Как взамен вести трафик сразу в Pod и что будет, когда один Pod заменят?",

  "You create an Ingress full of host and path rules, and on its own it serves nothing at all. What receives the traffic then, how does it usually pick a Pod, and what answers a request for a host that no rule names?":
    "Вы создаёте Ingress с правилами по хостам и путям, но сам он вообще ничего не обслуживает. Кто же тогда принимает трафик, как обычно выбирает Pod и что ответит на запрос к хосту, которого нет в правилах?",

  "A team attaches its HTTPRoute to a shared Gateway in another namespace and points it at a Service in a third. Yet the route fails or answers HTTP 500. Whose permissions does it need, and where is each written?":
    "Команда подключает свой HTTPRoute к общему Gateway в другом Namespace и ведёт к Service в третьем. Но маршрут не работает или отдаёт HTTP 500. Чьи разрешения ему нужны и где записано каждое?",

  "A new version of the app is ready, and only a small share of requests should reach it at first, the rest staying on the old one. How does a Gateway split traffic, and what if the new backend vanishes?":
    "Новая версия приложения готова, и поначалу до неё должна доходить лишь малая часть запросов, а остальные остаются на старой. Как Gateway делит трафик и что будет, если новый бэкенд пропадёт?",

  "An Ingress or Gateway edge proxy forwards requests to the app from its own address. Where is the client address lost, how can it still arrive, and how far can the app trust a header like X-Forwarded-For?":
    "Пограничный прокси Ingress или Gateway передаёт запросы приложению со своего адреса. Где теряется адрес клиента, как он всё же может дойти и насколько верить заголовку вроде X-Forwarded-For?",

  // DNS & Service Discovery

  "An app connects to a Service by its short name alone, and the name becomes an address though the app knows nothing about DNS servers. Who answers the query, and where does the address come from?":
    "Приложение подключается к Service по одному лишь короткому имени, и это имя превращается в адрес, хотя о серверах DNS приложение ничего не знает. Кто отвечает на запрос и откуда берётся адрес?",

  "A lookup for a Service can come back as one address, as a list of Pod addresses or with a port attached, and a single Pod can have a name too. What decides the shape of the answer the cluster DNS gives?":
    "DNS-запрос о Service может вернуть один адрес, список адресов Pod или ответ с указанным портом, а своё имя может быть и у отдельного Pod. От чего зависит, какую форму примет ответ DNS кластера?",

  "Two Pods in one cluster can resolve the same name differently, because their /etc/resolv.conf files differ. Where do the lines in that file come from, and how much of them can the Pod spec change?":
    "Два Pod в одном кластере могут по-разному разрешать одно и то же имя, ведь файл /etc/resolv.conf у них разный. Откуда берутся его строки и сколько из них может изменить spec Pod?",

  "A Pod looks up one external name, api.example.com, and the cluster DNS gets eight queries for it, then eight more on the next call. Why does one lookup cost so many, and how do you cut them down to two?":
    "Pod ищет одно внешнее имя api.example.com, а DNS кластера получает на него восемь запросов и ещё восемь при следующем вызове. Почему одному поиску нужно столько запросов и как сократить их до двух?",

  "A Pod gets an egress policy and suddenly stops resolving names, though connections to allowed addresses still go out, so it looks half broken. What is missing, and why does DNS need both UDP and TCP?":
    "Pod с политикой egress вдруг перестаёт разрешать имена, хотя к допустимым адресам соединения всё ещё идут, так что он выглядит наполовину сломанным. Чего не хватает и почему для DNS нужны и UDP, и TCP?",

  "Under load, DNS lookups from Pods can stall for seconds, and some of them end in a timeout. What does a DNS cache on every Node change about the path a lookup takes, and what still goes to CoreDNS?":
    "Под нагрузкой DNS-запросы из Pod могут подвисать на секунды, а часть запросов заканчивается таймаутом. Что кеш DNS на каждой Node меняет в пути DNS-запроса и что по-прежнему уходит в CoreDNS?",

  "A cluster grows from 16 Nodes to 48, and the CoreDNS replica count can grow from 2 to 6 along with it while nobody touches the Deployment. Who decides how many to run, and what does it count to get there?":
    "Кластер вырастает с 16 Node до 48, и число реплик CoreDNS может вместе с ним вырасти с 2 до 6, хотя Deployment никто не трогает. Кто решает, сколько их должно работать, и из чего складывается это число?",

  "A StatefulSet replica comes back with a new IP, yet once ready, clients still reach it by the same DNS name. What does a Service with clusterIP None give instead of a virtual IP, and who picks between the replicas?":
    "Реплика StatefulSet возвращается с новым IP, но, когда она готова, клиенты находят её по тому же DNS-имени. Что даёт Service с clusterIP None вместо виртуального IP и кто выбирает между репликами?",

  // Storage

  // Volume Foundations

  "An init container writes a file and exits, then the app crashes and restarts, yet the other containers of the Pod still find the file. Who does it belong to, and how long does it last while containers come and go?":
    "Init-контейнер записывает файл и завершается, потом приложение падает и перезапускается, а файл всё ещё видят остальные контейнеры Pod. Чей это файл и сколько он живёт, пока контейнеры сменяются?",

  "A Pod keeps data in its container and five volumes, two emptyDir, a hostPath, a ConfigMap and a PVC. A container restart, a deleted Pod and a lost Node each take a part. Where do these six keep it, and how long?":
    "Pod хранит данные в контейнере и пяти томах, это два emptyDir, hostPath, ConfigMap и PVC. Перезапуск контейнера, удаление Pod и потеря Node уносят по своей части. Где эти шесть мест их хранят и как долго?",

  "A file written inside a container is gone once that container is replaced by a fresh one from the same image, while a file in its mounted volume stays put. Where did the first file live, and why did it go?":
    "Файл, записанный внутри контейнера, пропадает, как только этот контейнер заменяют новым из того же образа, а файл в смонтированном томе остаётся на месте. Где жил первый файл и почему он исчез?",

  "A Pod keeps scratch files in its emptyDir through a container restart, but a replacement Pod gets a new, empty one. When is the volume created, when is it thrown away, and what changes if it lives in memory?":
    "Pod сохраняет временные файлы в томе emptyDir при перезапуске контейнера, но Pod на замену получает новый, пустой том. Когда такой том создаётся, когда его удаляют и что меняется, если он в памяти?",

  "A Pod writes into a directory of its Node, unchecked by its own disk limit, and the files outlive it, but a replacement on another Node finds a different directory or none. Why is the data stuck there?":
    "Pod пишет в каталог своей Node вне собственного лимита диска, и файлы переживают сам Pod, но замена на другой Node находит другой каталог или ничего. Почему эти данные привязаны к одному узлу?",

  "A ConfigMap is updated while the app reads its files from a volume, yet on Linux the app never catches a half-written file, and nobody restarts the app. How does the new version land at once, and how soon?":
    "ConfigMap обновляют, пока приложение читает файлы из тома, и никто приложение не перезапускает, но на Linux оно ни разу не застаёт недописанный файл. Как новая версия появляется разом и как скоро?",

  "Someone relabels a running Pod, and a file in its container picks up the new labels while an environment variable keeps the old value. Why does only the file follow, and which fields reach the app each way?":
    "Работающему Pod меняют метки, и файл в контейнере подхватывает новые, а переменная окружения держит старое значение. Почему за сменой следит лишь файл и какие поля каким путём идут в приложение?",

  "An app reads config, Pod details and a token from one directory, and the token keeps changing on its own, even before it would expire. How do the three sources share one mount, and who renews the token?":
    "Приложение читает из одного каталога конфигурацию, данные о своём Pod и токен, а токен то и дело меняется сам, даже ещё до истечения срока. Как три источника делят одно монтирование и кто обновляет токен?",

  "A Pod needs the weights of a large ML model or a toolset that ships apart from the app image but must be in place before the app starts. How do you hand it over without baking it in, and how does a newer version reach the Pod?":
    "Pod нужны веса большой ML-модели или набор утилит, которые идут отдельно от образа приложения, но к старту приложения должны быть на месте. Как их передать, не вшивая в образ, и как в Pod придёт новая версия?",

  "A ConfigMap is updated, and one container of the Pod soon reads the new config while another keeps the old file until a restart, although both mount the same volume. Why does that file miss the update?":
    "ConfigMap обновили, и один контейнер Pod вскоре читает новую конфигурацию, а другой держит старый файл до перезапуска, хотя оба монтируют тот же том. Почему до этого файла не доходит обновление?",

  "The Kubelet evicts a Pod for using too much disk, even though the disk on its Node still has plenty of free space. What is that usage measured against, then, and why is the Pod not just restarted in place?":
    "Kubelet вытесняет Pod, который занимает слишком много дискового пространства, хотя диск его Node ещё далеко не заполнен. С чем же тогда сравнивают это потребление и почему Pod просто не перезапускают на месте?",

  "A Pod mounts a Node directory at /data with readOnly: true, yet its container still writes to a read-write tmpfs at /data/tmpfs. What does readOnly cover, and how do you make all mounts under /data read-only?":
    "Pod монтирует в /data каталог Node с readOnly: true, но контейнер всё же пишет в tmpfs, смонтированный на запись в /data/tmpfs. На что действует readOnly и как закрыть на запись все монтирования в /data?",

  // Volumes & Claims

  "A PVC asks for storage, and out of several free volumes in the cluster only one ends up bound to it, while a second, identical claim stays Pending. Who picks that one volume, and by what rules does it choose?":
    "PVC просит хранилище, и из нескольких свободных томов кластера к нему в итоге привязывается только один, а другой PVC с тем же запросом остаётся в Pending. Кто выбирает этот том и по каким правилам?",

  "A PVC without storageClassName can still end up with a StorageClass, while one with an empty string there never does. Who writes the class into the first, why not the second, and which wins if two classes are default?":
    "PVC без storageClassName всё равно может получить StorageClass, а с пустой строкой в этом поле никогда. Кто вписывает класс в первый, почему не во второй и какой победит, если классов по умолчанию два?",

  "A PVC asks for storage that no existing volume can give, and soon a new disk and a PV for it appear. Who builds them, and how does the claim end up bound to that new volume and not to some other one?":
    "PVC запрашивает хранилище, которое не может дать ни один существующий том, и вскоре появляются новый диск и PV для него. Кто их создаёт и как PVC привязывается к новому тому, а не к другому?",

  "A ReadWriteOnce disk is used by two Pods at once, yet a third Pod on another Node is refused. What does that mode actually limit, who enforces it, and what does it take to share one volume across several Nodes?":
    "Диск с режимом ReadWriteOnce используют сразу два Pod, а третьему Pod на другой Node отказывают. Что на самом деле ограничивает этот режим, кто за ним следит и как делить один том между Node?",

  "Two PVCs ask for identical disks, yet one container finds a ready directory and the other gets a bare device with no filesystem on it. What makes the difference, and can that be changed later on?":
    "Два PVC просят одинаковые диски, но один контейнер находит готовый каталог, а другой получает голое устройство без всякой файловой системы. Откуда такая разница и можно ли изменить это потом?",

  "In a cluster spread over several zones, a Pod can sit in Pending even though its disk is healthy and ready. Why does the disk end up where the Pod cannot follow, and how do you make it wait for the Pod instead?":
    "В кластере из нескольких зон Pod может висеть в Pending, хотя его диск исправен и готов. Почему этот диск оказывается там, куда Pod за ним пойти не может, и как заставить диск вместо этого ждать Pod?",

  "The Scheduler can send a Pod to a Node with too little local storage for its volume, so creating the volume fails and scheduling starts over, at times on that Node again. How can the Scheduler see the free space first?":
    "Scheduler может отправить Pod на Node, где его тому мало локального места, и тогда том не создаётся, а размещение идёт заново, порой на той же Node. Как Scheduler может увидеть свободное место заранее?",

  "You raise the storage request of a PVC from 5Gi to 20Gi, yet for a while df in its Pod still reports 5Gi. What has to happen before the extra room shows up, and why is shrinking it back afterwards refused outright?":
    "Вы увеличили запрос PVC с 5Gi до 20Gi, но df в его Pod какое-то время всё ещё показывает 5Gi. Что должно произойти, прежде чем появится новое место, и почему уменьшить PVC обратно и вовсе не дают?",

  "A PVC has been deleted, yet it hangs in Terminating with no sign of going away, while the app that still uses it goes on writing to its disk. What is holding it, and what has to leave before the delete can finish?":
    "PVC уже удалили, но он висит в Terminating и никак не исчезает, а приложение, которое им всё ещё пользуется, пишет на диск дальше. Что держит PVC и что должно уйти, чтобы удаление завершилось?",

  "A PVC is deleted, and sometimes its disk full of data goes with it, while other times the disk stays behind as an orphan nobody uses. What decides which one happens, and how do you keep the disk you need?":
    "PVC удаляют, и иногда диск, полный данных, уходит вместе с ним, а иногда остаётся бесхозным, и им больше никто не пользуется. Что решает, какой из вариантов случится, и как сохранить нужный диск?",

  "The status of a PV changes as claims come and go, and sometimes it sticks in Failed until someone steps in. Who moves it, what does each of its phases mean, and how does a retained volume get back to Available?":
    "Статус PV меняется, когда PVC появляются и исчезают, а иногда застревает в Failed, пока кто-нибудь не вмешается. Кто его меняет, что значит каждый статус и как сохранённый том снова становится Available?",

  "A disk kept after its PVC was deleted still holds valuable data, and it has to go to one new claim before any other grabs it. How do you reserve a volume like that, and why is naming it in that claim not enough?":
    "Диск, оставшийся после удаления PVC, всё ещё хранит ценные данные, и отдать его нужно одному новому PVC, пока его не заберёт другой. Как зарезервировать такой том и почему мало указать его в самом PVC?",

  // CSI & Mount Path

  "A cloud disk or a Ceph volume gets mounted into a Pod, though Kubernetes itself ships no driver for either. Who does the real work, from creating the disk to mounting it, and how does it talk to the cluster?":
    "Облачный диск или том Ceph монтируется в Pod, хотя в самом Kubernetes нет драйвера ни для одного из них. Кто тогда делает настоящую работу, от создания диска до монтирования, и как общается с кластером?",

  "A Pod mounts a disk and an NFS share through two CSI drivers. Only the disk is attached to the Node, and only the NFS driver is told which Pod the mount is for. Where does the cluster learn how to treat each driver?":
    "Pod монтирует диск и ресурс NFS через два драйвера CSI. К Node подключают только диск, и лишь драйверу NFS сообщают, для какого Pod монтирование. Где кластер узнаёт, как обращаться с каждым драйвером?",

  "A new PVC asks for a cloud disk, and before the app in its Pod can write a byte, the CSI driver is called several times. What does each call do, in what order, and which of them are undone when the Pod is deleted?":
    "Новый PVC просит облачный диск, и пока приложение в его Pod не записало ни байта, драйвер CSI вызывают несколько раз. Что делает каждый вызов, в каком порядке и какие откатываются, когда Pod удаляют?",

  "A cloud disk must be attached to a Node before a Pod mounts it, yet for a CSI volume the Kubelet attaches nothing. Who records the attachment, how does the Kubelet learn it is done, and what detaches the disk?":
    "Облачный диск нужно подключить к Node до монтирования в Pod, но для тома CSI Kubelet ничего не подключает. Кто записывает подключение, как Kubelet узнаёт, что оно готово, и что потом отключает диск?",

  "A CSI plugin container mounts a disk on the Node, and the same files show up at /data in the app container of another Pod. How does the mount get there, and which setting lets it out of the plugin container?":
    "Контейнер плагина CSI монтирует диск на Node, и те же файлы видны в /data у приложения в другом Pod. Как монтирование попадает к приложению и какая настройка выпускает его из контейнера плагина?",

  "A Pod needs a credential from an external store mounted as files, with no PV or PVC created for it. How can a driver hand over a volume that lives as long as the Pod, and what in the cluster has to allow it first?":
    "В Pod нужно смонтировать файлами учётные данные из внешнего хранилища, не создавая ни PV, ни PVC. Как драйвер может выдать том на всё время жизни Pod и что в кластере должно сначала это разрешить?",

  "A non-root container can hit permission denied on its volume, and the usual fix, fsGroup in the Pod, can stretch each Pod start on a big volume to minutes. Who changes the group of the volume files, and how often?":
    "Контейнер без прав root может получить на томе permission denied, а обычное решение, fsGroup в Pod, может растянуть каждый старт Pod с большим томом на минуты. Кто меняет группу файлов тома и как часто?",

  "A Pod stays Pending, its event saying all three Nodes exceed max volume count, though each still has spare CPU and memory. What limit is that, who sets it, and what has to happen before the Pod is placed?":
    "Pod остаётся в Pending, а событие сообщает, что все три Node превышают max volume count, хотя у каждой ещё есть свободные CPU и память. Что это за предел, кто его задаёт и что нужно, чтобы Pod разместили?",

  "During a rollout the new Pod lands on another Node and hangs in ContainerCreating, while the old one still runs with the disk the new one needs. Who is waiting on whom, and what breaks the loop from outside?":
    "Во время rollout новый Pod попадает на другую Node и зависает в ContainerCreating, а старый всё ещё работает с тем самым диском, который нужен новому. Кто кого ждёт и что разорвёт этот круг извне?",

  "A Node stops answering, and its volume stays attached to it for minutes or longer while a replacement Pod waits on a healthy Node. What is the cluster waiting for, and how can an operator cut that wait short?":
    "Node перестаёт отвечать, и её том минутами, а то и дольше, остаётся подключённым к этой Node, пока Pod на замену ждёт на исправной Node. Чего ждёт кластер и как оператор может сократить это ожидание?",

  // Stateful Data

  "Every replica of a StatefulSet gets a disk of its own and, once recreated, finds the same data on it again. How does each Pod find its own claim among the rest, and what stays behind when you scale down?":
    "Каждая реплика StatefulSet получает свой диск и после пересоздания снова находит на нём те же данные. Как каждый Pod находит свой PVC среди остальных и что остаётся при сокращении реплик?",

  "A StatefulSet is scaled down or deleted, and its PVCs either stay behind with their data or get deleted soon after. Who decides that, what does a replica find when you scale back up, and does the disk go too?":
    "StatefulSet уменьшают или удаляют, и его PVC либо остаются со своими данными, либо вскоре удаляются. Кто это решает, что найдёт реплика, когда число реплик снова вырастет, и уходит ли и сам диск?",

  "A Pod needs scratch space that goes away with it, but the space must have a fixed size on real storage instead of the Node disk. How do you get a volume like that, and what cleans it up after the Pod is gone?":
    "Pod нужно временное место, которое исчезнет вместе с ним, но фиксированного размера и на настоящем хранилище, а не на диске Node. Как получить такой том и что удалит его после того, как Pod уйдёт?",

  "A snapshot of a busy database volume can be ready in seconds, and it looks like the data is now safe. How can it be that fast, what does a restore from it actually bring back, and when is it not a real backup at all?":
    "Снимок тома нагруженной базы бывает готов за секунды, и кажется, что данные уже в безопасности. Почему так быстро, что вернёт восстановление из него и когда это вовсе не настоящая резервная копия?",

  "A new PVC should start as a full copy of an existing one, but the copy is made only if the two claims line up, and otherwise the new one sits Pending. What has to match, and does anything link them afterwards?":
    "Новый PVC должен появиться как полная копия существующего, но копия создаётся, только если два PVC совместимы, иначе новый остаётся в Pending. Что должно совпасть и связывает ли их что-то потом?",
};
