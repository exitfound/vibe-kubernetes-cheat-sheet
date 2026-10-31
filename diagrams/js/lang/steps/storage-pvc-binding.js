// Russian for storage-pvc-binding: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "PersistentVolumeClaim to PersistentVolume binding: a claim states the capacity, access mode and class it needs, and the binding controller scans the available volumes and rejects the ones that do not fit. The controller binds the claim to the one that does, writing the link on the volume first and then on the claim. Only then can Kubelet mount the volume into the Pod, and a second claim asking for the same thing stays Pending until a matching volume appears":
    "Привязка PersistentVolumeClaim к PersistentVolume: PVC указывает, какие ёмкость, режим доступа и класс ему нужны, а контроллер привязки просматривает доступные тома и отбрасывает неподходящие. Контроллер привязывает PVC к подходящему тому и записывает связь сначала в PV, а потом в PVC. Только после этого Kubelet может смонтировать том в Pod, а второй PVC с тем же запросом остаётся в Pending, пока не появится подходящий том",

  "A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at least 5Gi, ReadWriteOnce access, and the fast StorageClass. Under the default Immediate binding mode, the Pod cannot be scheduled while the claim it references is still unbound.":
    "PersistentVolumeClaim это запрос, а не хранилище. В нём указано лишь то, что нужно рабочей нагрузке, а именно не меньше 5Gi, доступ ReadWriteOnce и StorageClass fast. В режиме привязки по умолчанию, Immediate, Pod нельзя разместить, пока PVC, на который ссылается этот Pod, ещё не привязан.",

  "The binding controller watches every claim in the cluster. This one is new and still unbound, so the controller reads what the claim asks for: capacity, access mode and StorageClass.":
    "Контроллер привязки следит за всеми PVC в кластере. Этот PVC новый и ещё не привязан, поэтому контроллер читает, что в PVC запрошено, а это ёмкость, режим доступа и StorageClass.",

  "The controller checks every Available volume in one sweep. PV a01 is only 2Gi, which is under what the claim asks for, and PV b22 belongs to the slow class rather than fast. PV x73a is the only one that fits the claim, so it is the candidate. Had several fit, the smallest would win.":
    "Контроллер за один проход проверяет все тома в статусе Available. У PV a01 всего 2Gi, меньше запрошенного, а PV b22 относится к классу slow, а не fast. Запросу подходит только PV x73a, поэтому кандидат именно он. Если бы подошли несколько томов, выиграл бы наименьший.",

  "The controller writes the binding to the volume first. PV x73a gets a claimRef pointing at data-claim and turns Bound, so no other claim can take it. Only then does the claim get a volumeName pointing back at PV x73a and turn Bound as well, and each object now names the other.":
    "Сначала контроллер записывает привязку в сам том. PV x73a получает claimRef на data-claim и становится Bound, так что другой PVC забрать его не может. Только потом PVC получает поле volumeName, указывающее обратно на PV x73a, и тоже становится Bound. Теперь каждый объект ссылается на другой.",

  "Only now can the Pod run. It is scheduled onto a Node, and Kubelet there resolves the claim to its bound volume and mounts that volume for the Pod. The container starts with the volume at /data. The Pod holds the claim, and the volume behind the claim stores the bytes.":
    "Только теперь Pod может работать. Pod размещают на Node, и Kubelet на ней по PVC находит привязанный к нему том и монтирует этот том для Pod. Контейнер стартует с томом в /data. Pod держит PVC, а сами байты хранит том, стоящий за этим PVC.",

  "Binding is one to one, and once made it is exclusive. A second claim asking for exactly the same thing cannot have PV x73a, which already carries a claimRef. These volumes were pre-created by an administrator and the class has no dynamic provisioner, so nothing builds a new one. The controller records a ProvisioningFailed event, and the claim stays Pending until a matching volume appears.":
    "Привязка идёт один к одному и, раз сделана, эксклюзивна. Второй PVC с точно таким же запросом не может получить PV x73a, на котором уже стоит claimRef. Эти тома заранее создал администратор, а у класса нет динамического провизионера, так что новый том никто не создаст. Контроллер записывает событие ProvisioningFailed, и PVC остаётся в Pending, пока не появится подходящий том.",
};
