// Russian for cluster-admission-chain: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "The write path through the API, where authentication and authorization are followed by mutating admission, schema validation and validating admission, then the write to ETCD":
    "Путь записи через API, где за аутентификацией и авторизацией идут mutating admission, проверка по схеме и validating admission, а затем запись в ETCD",

  "Already done, not admission at all. Admission runs after authentication, so every caller has an identity, even system:anonymous. Authorizers run in configured order, usually Node then RBAC, and the first to allow or deny decides, so no later one runs. If none allows, the answer is 403.":
    "Этот этап уже пройден и к admission вообще не относится. Admission идёт после аутентификации, так что у каждого вызывающего уже есть имя пользователя, пусть даже это system:anonymous. Модули авторизации (authorizers) срабатывают в настроенном порядке, обычно Node, потом RBAC, и первый из них, кто разрешил или запретил, решает всё, а следующие не запускаются. Если никто не разрешил, ответ 403.",

  "Pluggable plus built-in. Default-on mutating plugins like ServiceAccount, LimitRanger and DefaultTolerationSeconds rewrite the Pod here, MutatingAdmissionPolicy runs CEL mutations in process, and MutatingWebhookConfiguration adds external policy webhooks (Kyverno, OPA Gatekeeper, sidecar injectors) on top, all before validation. A webhook failurePolicy decides if a timeout blocks the write.":
    "Подключаемый и встроенный этап. Включённые по умолчанию mutating-плагины вроде ServiceAccount, LimitRanger и DefaultTolerationSeconds здесь переписывают Pod. MutatingAdmissionPolicy выполняет CEL-мутации внутри процесса, а MutatingWebhookConfiguration добавляет поверх внешние webhook для политик (Kyverno, OPA Gatekeeper, инжекторы sidecar), и всё это до валидации. У webhook поле failurePolicy решает, блокирует ли таймаут запись.",

  "Built-in. The API validates the mutated object for its kind, so a missing required field or a value outside its allowed range fails here, before any validating webhook runs.":
    "Встроенный этап. API проверяет изменённый объект по правилам его kind, поэтому пропущенное обязательное поле или значение вне допустимого диапазона приводит к отказу уже здесь, до любого validating webhook.",

  "Pluggable plus built-in. LimitRanger is back to check min and max, ValidatingAdmissionPolicy runs in process, validating webhooks call out over HTTPS, and ResourceQuota runs after all of them. None may mutate, and any deny aborts the request. See the ResourceQuota and LimitRange card.":
    "Подключаемый и встроенный этап. Сюда возвращается LimitRanger, чтобы проверить min и max, ValidatingAdmissionPolicy работает внутри процесса, validating webhook вызываются по HTTPS, а ResourceQuota идёт после них всех. Никто из них не может менять объект, и любой отказ прерывает запрос. Подробнее в карточке ResourceQuota and LimitRange.",

  "Built-in. The API writes the final object to ETCD via Raft. Once ETCD commits, the API returns HTTP 201 Created to the client and every watch that matches the new Pod receives an ADDED event so informers can update their caches.":
    "Встроенный этап. API записывает итоговый объект в ETCD через Raft. Как только ETCD фиксирует запись, API возвращает клиенту HTTP 201 Created, а каждый watch, под который попадает новый Pod, получает событие ADDED, чтобы informer могли обновить кеши.",
};
