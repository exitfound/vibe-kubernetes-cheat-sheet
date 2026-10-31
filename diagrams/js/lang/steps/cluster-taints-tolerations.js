// Russian for cluster-taints-tolerations: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "A taint on Node-1 and the tolerations on its Pods, the Scheduler that filters Node-1 out for a Pod with no tolerations under NoSchedule and merely scores it down under PreferNoSchedule, and the taint-eviction-controller that deletes the Pods with no matching toleration once a NoExecute taint is added, while the Pod with a toleration for this key stays bound":
    "Taint на Node-1 и tolerations у её Pod, Scheduler, который при NoSchedule отсеивает Node-1 для Pod без tolerations, а при PreferNoSchedule лишь снижает её оценку, и taint-eviction-controller, который после добавления taint NoExecute удаляет Pod без подходящей toleration, тогда как Pod с toleration на этот ключ остаётся привязанным",

  "A taint on the Node object carries a key, an optional value, and an effect. Node-1 gets dedicated=db:NoSchedule in spec.taints. Nothing on the Node changes, because NoSchedule acts at scheduling time and says nothing about the Pods already bound to it.":
    "В taint на объекте Node есть ключ, необязательное значение и effect. У Node-1 в поле spec.taints появляется dedicated=db:NoSchedule. На Node при этом ничего не меняется, потому что NoSchedule действует в момент планирования и ничего не говорит о Pod, уже привязанных к ней.",

  "A toleration is the matching field on the Pod. It matches when the keys are equal and the effects are equal, and the operator decides the value. Equal compares it, Exists ignores it. The toleration on Pod db-1 leaves the effect empty, so it matches every effect on that key. Pod web-1 has none.":
    "Парное к taint поле на Pod называется toleration. Она подходит, когда совпадают ключи и effect, а что делать со значением, решает operator. При Equal значение сравнивается, а при Exists игнорируется. У toleration на Pod db-1 effect не задан, поэтому она подходит к любому effect этого ключа. У Pod web-1 toleration нет.",

  "Pod web-2 carries no toleration, so the TaintToleration filter plugin drops Node-1 before scoring. Pod web-2 is marked Unschedulable and gets a FailedScheduling event. Nothing reaches the Node, and Pod web-1 keeps running untouched, because it was bound before the taint arrived.":
    "У Pod web-2 нет toleration, поэтому плагин фильтрации TaintToleration отсеивает Node-1 до оценки. Pod web-2 получает пометку Unschedulable и событие FailedScheduling. До Node ничего не доходит, а Pod web-1 спокойно работает дальше, потому что его привязали ещё до появления taint.",

  "The taint is rewritten with PreferNoSchedule. The same mismatch is now scored rather than filtered. The plugin marks Node-1 down among the Nodes that fit but does not remove it, so Pod web-2 can still land here. The control plane tries to avoid that and does not guarantee it.":
    "Taint переписан на PreferNoSchedule. То же несовпадение теперь влияет на оценку, а не на фильтрацию. Плагин ставит Node-1 ниже среди подходящих Node, но не убирает её, так что Pod web-2 всё ещё может сюда попасть. Control Plane старается этого избежать, но не гарантирует.",

  "A second taint, dedicated=db:NoExecute, is added. This effect is the only one that acts on Pods already running, so the taint-eviction-controller deletes Pod web-1 and Pod web-2, since neither tolerates it. Pod db-1 does, and with no tolerationSeconds this taint never evicts it.":
    "Добавлен второй taint, dedicated=db:NoExecute. Только этот effect действует на уже работающие Pod, поэтому taint-eviction-controller удаляет Pod web-1 и Pod web-2, ведь ни у одного из них нет подходящей toleration. У Pod db-1 такая toleration есть, а без tolerationSeconds этот taint никогда его не вытеснит.",

  "A NoExecute toleration may carry tolerationSeconds, and then the Pod stays that many seconds after the taint lands before eviction. If a Pod sets no toleration for a built-in not-ready or unreachable taint, it gets 300 seconds per such taint. That is the few minutes on the Node Failure and Pod Recovery card.":
    "У toleration для NoExecute может быть поле tolerationSeconds, и тогда Pod остаётся на Node заданное число секунд после появления taint, прежде чем его вытеснят. Если у Pod нет своей toleration на встроенный taint not-ready или unreachable, Pod получает по 300 секунд на каждый такой taint. Это и есть те несколько минут из карточки Node Failure and Pod Recovery.",
};
