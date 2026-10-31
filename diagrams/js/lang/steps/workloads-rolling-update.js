// Russian for workloads-rolling-update: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Deployment rolling update. ReplicaSet RS-v1 owns three Pods in the left region, and the right region holds the three slots RS-v2 fills. The setting maxSurge 1 lets the fleet run up to 4 live Pods while a new Pod starts, and maxUnavailable 0 holds every old Pod until its replacement is Ready, one at a time until the whole fleet has crossed to RS-v2":
    "Поэтапное обновление Deployment. ReplicaSet RS-v1 владеет тремя Pod в левой области, а в правой три слота, которые заполняет RS-v2. Параметр maxSurge 1 позволяет набору дорасти до 4 живых Pod, пока стартует новый, а maxUnavailable 0 удерживает каждый старый Pod, пока его замена не станет Ready, и так по одному, пока весь набор не перейдёт на RS-v2",

  "You run kubectl set image deployment/web app=web:v2.0, which PATCHes .spec.template. The Deployment hashes that template into a new pod-template-hash and creates a second ReplicaSet, RS-v2, already at replicas 1, the one surge slot the 25% maxSurge allows. RS-v1 still owns all 3 live Pods.":
    "Вы запускаете kubectl set image deployment/web app=web:v2.0, и команда делает PATCH .spec.template. Deployment вычисляет из этого шаблона новый pod-template-hash и создаёт второй ReplicaSet, RS-v2, сразу с replicas 1, то есть с единственным слотом surge, разрешённым maxSurge 25%. RS-v1 по-прежнему владеет всеми 3 живыми Pod.",

  "RS-v2 wants 1 replica and owns no Pod yet, so the ReplicaSet controller creates one through the API, in the RS-v2 column. No old Pod has to leave first, because that create already spent the surge slot. While the new Pod starts, the fleet runs to 4 live Pods, one over .spec.replicas.":
    "RS-v2 хочет 1 реплику, а Pod у него ещё нет, поэтому контроллер ReplicaSet создаёт Pod через API в колонке RS-v2. Ни одному старому Pod не нужно уходить первым, потому что это создание уже заняло слот surge. Пока новый Pod стартует, набор вырастает до 4 живых Pod, на один больше .spec.replicas.",

  "The new Pod passes its readinessProbe and RS-v2 reports Ready 1. At the default minReadySeconds 0 the Pod counts as available at once. Since maxUnavailable is 0, the Deployment may not touch RS-v1 until a replacement is Ready, and that is exactly what keeps 3 Pods serving throughout.":
    "Новый Pod проходит readinessProbe, и RS-v2 сообщает Ready 1. При minReadySeconds 0, значении по умолчанию, Pod сразу считается доступным. Раз maxUnavailable равен 0, Deployment не вправе трогать RS-v1, пока замена не станет Ready, и именно поэтому всё время отвечают 3 Pod.",

  "Only now does the Deployment scale RS-v1 from 3 to 2 through the API, and the ReplicaSet controller deletes one old RS-v1 Pod, which starts graceful termination. Terminating Pods do not count as available, so the 3 Pods that maxUnavailable 0 requires are the 2 old Ready Pods plus the new one.":
    "Только теперь Deployment через API уменьшает RS-v1 с 3 до 2, и контроллер ReplicaSet удаляет один старый Pod из RS-v1, и тот начинает корректно завершаться. Завершающиеся Pod не считаются доступными, поэтому 3 Pod, которых требует maxUnavailable 0, складываются из 2 старых Pod в Ready и нового.",

  "The same trio runs again for the second replica. RS-v2 grows to 2 and the new Pod starts in the next slot, and only once that Pod reports Ready does RS-v1 drop to 1 and let another old Pod go. The window of live Pods has slid one slot to the right and never narrowed below 3.":
    "Та же тройка шагов повторяется для второй реплики. RS-v2 вырастает до 2, новый Pod стартует в следующем слоте, и только когда этот Pod сообщает Ready, RS-v1 опускается до 1 и отпускает ещё один старый Pod. Окно живых Pod сдвинулось на один слот вправо и ни разу не сузилось ниже 3.",

  "The last replica crosses the same way. RS-v2 reaches 3 Ready and RS-v1 ends at replicas 0, kept up to revisionHistoryLimit so kubectl rollout undo can roll back. No old Pod is running any more, so the rollout is complete, with Available=True and Progressing NewReplicaSetAvailable.":
    "Последняя реплика переходит так же. RS-v2 доходит до 3 Ready, а RS-v1 остаётся с replicas 0 и хранится в пределах revisionHistoryLimit, чтобы kubectl rollout undo мог сделать откат. Работающих старых Pod больше нет, поэтому rollout завершён, и у Deployment выставлены условия Available=True и Progressing NewReplicaSetAvailable.",
};
