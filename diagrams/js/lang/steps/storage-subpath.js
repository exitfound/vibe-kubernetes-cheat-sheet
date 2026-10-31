// Russian for storage-subpath: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "subPath mounts: one config volume, two containers in one Pod. The web container mounts the whole volume at a directory, so every read resolves through the ..data symlink. The proxy container mounts only app.conf with subPath, and Kubelet resolves that path to the v1 file when the container starts. When the ConfigMap changes, Kubelet writes a v2 directory on its next sync, flips ..data and deletes the v1 directory: web now reads v2, and proxy keeps reading the v1 file its bind mount still holds until its container restarts.":
    "Монтирования subPath: один том config, два контейнера в одном Pod. Контейнер web монтирует весь том как каталог, поэтому каждое чтение проходит через симлинк ..data. Контейнер proxy монтирует через subPath только app.conf, и Kubelet при старте контейнера разрешает этот путь в файл v1. Когда ConfigMap меняется, Kubelet при следующей синхронизации пишет каталог v2, переключает ..data и удаляет каталог v1. Теперь web читает v2, а proxy, пока его контейнер не перезапустится, по-прежнему читает файл v1, всё ещё удерживаемый его bind mount.",

  "The web container mounts the whole config volume as a directory at /etc/app. Every read of app.conf goes through the ..data symlink, which points at the v1 directory, so web reads app.conf v1.":
    "Контейнер web монтирует весь том config как каталог в /etc/app. Каждое чтение app.conf идёт через симлинк ..data, который указывает на каталог v1, поэтому web читает app.conf v1.",

  "The proxy container needs only app.conf, and in /etc/nginx, next to the files its image ships. Mounting the whole volume there would hide those files, so proxy sets subPath: app.conf. When the container starts, Kubelet resolves that path to the v1 file and bind-mounts the file itself.":
    "Контейнеру proxy нужен только app.conf, причём в /etc/nginx, рядом с файлами из его образа. Если смонтировать туда весь том, он скроет эти файлы, поэтому proxy задаёт subPath: app.conf. При старте контейнера Kubelet разрешает этот путь в файл v1 и делает bind mount самого файла.",

  "The ConfigMap changes, but Kubelet does not edit the files in place. On its next sync it writes the new version into a fresh v2 directory, flips ..data to point at that directory, then deletes the v1 directory.":
    "ConfigMap меняется, но Kubelet не правит файлы на месте. При следующей синхронизации он записывает новую версию в свежий каталог v2, переключает ..data на этот каталог, а затем удаляет каталог v1.",

  "The web container reads app.conf again. Its path to the file still runs through ..data, so the same read now resolves into the v2 directory and web gets the new config without a restart.":
    "Контейнер web снова читает app.conf. Путь к файлу у web всё так же идёт через ..data, поэтому то же чтение теперь попадает в каталог v2, и web получает новую конфигурацию без перезапуска.",

  "Proxy reads app.conf too. But its bind mount never goes through ..data and still holds the v1 file, readable although its directory is deleted. So proxy gets v1. For ConfigMap, Secret, downward API and projected volumes alike, the docs say a subPath mount does not receive updates. Proxy sees v2 once its container restarts and Kubelet resolves the path again.":
    "Контейнер proxy тоже читает app.conf. Но bind mount контейнера proxy никогда не идёт через ..data и всё ещё держит файл v1, который можно прочесть, хотя его каталог удалён. Поэтому proxy получает v1. Для томов ConfigMap, Secret, downward API и projected документация одинаково говорит, что монтирование subPath не получает обновлений. Контейнер proxy увидит v2, когда перезапустится и Kubelet снова разрешит путь.",
};
