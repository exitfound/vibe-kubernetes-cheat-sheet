// Russian for storage-volumeclaimtemplates: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "StatefulSet volumeClaimTemplates. Deployment replicas all share any claim their template names, while a StatefulSet mints one PersistentVolumeClaim per ordinal, each with a deterministic name derived from the Pod identity. So a Pod that is deleted and recreated mounts the same claim and disk, the claim outlives the Pod, and by default scaling down leaves the claims behind":
    "Поле volumeClaimTemplates у StatefulSet. Реплики Deployment все делят любой PVC, указанный в их шаблоне, а StatefulSet создаёт по одному PersistentVolumeClaim на каждый порядковый номер, и у каждого PVC предсказуемое имя, выведенное из имени Pod. Поэтому удалённый и пересозданный Pod монтирует тот же самый PVC и тот же диск, PVC переживает Pod, а по умолчанию уменьшение числа реплик оставляет PVC на месте",

  "For each ordinal the StatefulSet creates the claim, or reuses one of that name, and then its Pod. The claim name is the template name joined to the Pod name: data-web-0, data-web-1, data-web-2. Drawn as one pass, but under the default OrderedReady policy web-1 waits until web-0 is Running and Ready.":
    "Для каждого номера StatefulSet создаёт PVC или берёт существующий с таким именем, а затем создаёт Pod с этим номером. Имя PVC складывается из имени шаблона и имени Pod, то есть data-web-0, data-web-1, data-web-2. На схеме это один проход, но при политике по умолчанию OrderedReady реплика web-1 ждёт, пока web-0 не станет Running и Ready.",

  "Each claim is bound to its own PersistentVolume, ordinal 0 to PV web-0 and never to PV web-1. Drawn as one phase, but by default each ordinal binds and mounts before the next is created, so a claim stuck Pending stalls every later one. The claim is the durable name, the disk holds the bytes.":
    "Каждый PVC привязан к своему PersistentVolume, номер 0 к PV web-0, но никогда не к PV web-1. На схеме это один этап, но по умолчанию каждый номер привязывается и монтируется до создания следующего, так что PVC, зависший в Pending, стопорит все последующие. PVC служит долговечным именем, а байты хранит диск.",

  "Each Pod mounts the volume behind its own claim before its app starts. Replica web-0 reads and writes data-web-0, web-1 data-web-1, and so on. Each replica names a different claim and a claim binds exactly one PV, so no two replicas share a disk.":
    "Каждый Pod монтирует том своего PVC до старта приложения. Реплика web-0 читает и пишет data-web-0, web-1 работает с data-web-1, и так далее. Каждая реплика ссылается на свой PVC, а PVC привязывается ровно к одному PV, так что никакие две реплики не делят один диск.",

  "When web-1 is deleted, the StatefulSet recreates it, possibly on another Node that can reach PV web-1. The claim data-web-1 is not deleted with the Pod and stays Bound to PV web-1. The new Pod derives the same claim name from its ordinal, so it mounts the same disk and data.":
    "Когда web-1 удаляют, StatefulSet пересоздаёт его, возможно, на другой Node, откуда доступен PV web-1. PVC data-web-1 не удаляется вместе с Pod и остаётся в Bound, привязанным к PV web-1. Новый Pod выводит из своего номера то же имя PVC, поэтому монтирует тот же самый диск с теми же данными.",

  "When web is scaled down to two, Pod web-2 is removed, but claim data-web-2 stays Bound with its data. That is the default whenScaled policy, Retain, which the StatefulSet PVC Retention card covers. Scaled back up, web-2 reuses the same claim, but a scale-down nobody cleans up leaves disks behind.":
    "При уменьшении web до двух реплик Pod web-2 удаляется, но PVC data-web-2 остаётся Bound со своими данными. Так работает политика whenScaled по умолчанию, Retain, которой посвящена карточка StatefulSet PVC Retention. При возврате реплик web-2 берёт тот же PVC. Но уменьшение, после которого никто не прибирается, оставляет за собой диски.",
};
