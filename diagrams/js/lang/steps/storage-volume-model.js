// Russian for storage-volume-model: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Pod volume model: the Pod spec declares one emptyDir volume named cache under spec.volumes, and each container reaches it only through a volumeMounts entry of its own. The init container seed mounts cache at /work, writes config.json and exits. The app mounts the volume at /data and reads that file, the log shipper mounts cache read-only at /logs and reads the app.log the app writes. When the app crashes and restarts, the new container mounts the same volume and app.log is still there. A lifetime timeline shows the volume bar starting and running with the Pod bar while every container bar is shorter, because the volume belongs to the Pod, not to any container.":
    "Модель томов Pod: спецификация Pod объявляет в spec.volumes один том emptyDir с именем cache, и каждый контейнер получает к нему доступ только через свою запись volumeMounts. Init-контейнер seed монтирует cache в /work, пишет config.json и завершается. Контейнер app монтирует том в /data и читает этот файл, а log-shipper монтирует cache только для чтения в /logs и читает app.log, куда пишет app. Когда app падает и перезапускается, новый контейнер монтирует тот же том, и app.log всё ещё на месте. Временная шкала показывает, что полоса тома начинается и идёт вместе с полосой Pod, а полоса каждого контейнера короче, потому что том принадлежит Pod, а не какому-либо контейнеру.",

  "The Pod spec names one emptyDir volume, cache, under spec.volumes. It belongs to the Pod, not to a container: it is created empty when the Pod is assigned to a Node, before any container starts. Its bar starts with the Pod bar.":
    "Спецификация Pod объявляет в spec.volumes один том emptyDir с именем cache. Он принадлежит Pod, а не контейнеру, и создаётся пустым, когда Pod назначают на Node, до старта любого контейнера. Полоса тома начинается вместе с полосой Pod.",

  "The init container seed runs first, to completion. Its own volumeMounts entry puts cache at /work, where it writes config.json, then it exits. The seed bar ends and the mount goes with the container, but the file stays in the volume.":
    "Первым до конца выполняется init-контейнер seed. Через свою запись volumeMounts seed монтирует cache в /work, пишет туда config.json и завершается. Полоса seed заканчивается, и монтирование уходит вместе с контейнером, но файл остаётся в томе.",

  "Now app and log-shipper start, and each lists cache in a volumeMounts entry of its own. For app it is /data, for log-shipper /logs with readOnly set. App opens /data/config.json and finds the file seed left, although seed no longer runs.":
    "Теперь стартуют app и log-shipper, и каждый указывает cache в своей записи volumeMounts. Для app это /data, а для log-shipper это /logs с включённым readOnly. Контейнер app открывает /data/config.json и находит файл, оставленный seed, хотя seed уже не работает.",

  "Both containers see the same bytes under different paths. App writes app.log into /data, and log-shipper reads that very file at /logs through a mount that cannot write. That is the usual way two containers of one Pod share files.":
    "Оба контейнера видят одни и те же байты по разным путям. Контейнер app пишет app.log в /data, а log-shipper читает тот же самый файл в /logs через монтирование без права записи. Так два контейнера одного Pod обычно и делятся файлами.",

  "App crashes and, under restartPolicy Always, the default, is restarted in the same Pod, so its restart count goes to 1. The new container starts clean outside the volume, yet it mounts the same cache at /data and app.log is still there.":
    "Контейнер app падает и при restartPolicy Always, значении по умолчанию, перезапускается в том же Pod, поэтому счётчик перезапусков app становится равен 1. Новый контейнер начинает с чистого листа вне тома, но монтирует тот же cache в /data, и app.log всё ещё там.",

  "No container bar spans the whole story, and none of them ever owned the volume. The cache bar matches the Pod bar: this emptyDir lasts until the Pod leaves its Node, however many containers come and go inside it.":
    "Ни одна полоса контейнера не тянется через всю историю, и ни один контейнер никогда не владел томом. Полоса cache совпадает с полосой Pod, ведь emptyDir живёт, пока Pod не уйдёт со своей Node, сколько бы контейнеров в нём ни сменилось.",
};
