// Russian for workloads-crashloopbackoff: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "CrashLoopBackOff: the first restart is immediate, then Kubelet inserts an exponentially growing delay before each later restart, doubling to a default 300s cap":
    "CrashLoopBackOff: первый перезапуск идёт сразу, затем Kubelet добавляет перед каждым следующим перезапуском экспоненциально растущую задержку, удваивая её до потолка 300s по умолчанию",

  "The container process exits with a non-zero code, and Kubelet notices it. With restartPolicy Always, Kubelet restarts the container immediately the first time and arms a 10s base delay for the next one. Once the new container starts, restartCount becomes 1.":
    "Процесс контейнера завершается неудачей, с ненулевым кодом, и Kubelet это замечает. При restartPolicy Always первый раз Kubelet перезапускает контейнер сразу, а для следующего раза назначает базовую задержку 10s. Как только новый контейнер стартует, счётчик restartCount становится равен 1.",

  "The fresh container crashes again almost immediately. This second restart is the one that waits 10s, and it arms a doubled 20s for the next one. While Kubelet waits before the third restart, the container sits in Waiting with reason CrashLoopBackOff, which shows in kubectl get pods.":
    "Новый контейнер почти сразу снова падает. Как раз этот второй перезапуск и ждёт 10s, а следующему назначает удвоенные 20s. Пока Kubelet выжидает перед третьим перезапуском, контейнер стоит в состоянии Waiting с reason CrashLoopBackOff, и это видно в kubectl get pods.",

  "The container keeps crashing, and the backoff delay doubles with each restart, climbing to 40s, then 80s, then 160s. The restartCount grows on every attempt. The backoff is kept per container, and it stops a hot-looping process from saturating the Node.":
    "Контейнер продолжает падать, а задержка удваивается с каждым перезапуском, поднимаясь до 40s, потом до 80s и до 160s. Счётчик restartCount растёт с каждой попыткой. Задержка считается для каждого контейнера отдельно и не даёт быстрому циклу перезапусков перегрузить Node.",

  "The next doubling would exceed 300s, so the delay is clamped at the 300s ceiling, a per-Node default since 1.35, and stays there. Kubelet now retries the container at most once every 5 minutes for as long as it keeps failing. The restartCount continues to climb at this slow cadence.":
    "Следующее удвоение превысило бы 300s, поэтому задержка упирается в потолок 300s, который с 1.35 задан по умолчанию на уровне Node, и на нём остаётся. Теперь Kubelet перезапускает контейнер не чаще раза в 5 минут, пока тот продолжает падать. Счётчик restartCount растёт и дальше, но уже в этом медленном ритме.",

  "The bug is fixed and the new container runs stably. After 10 healthy minutes Kubelet resets the backoff. A new crash then counts as a first one: the container is restarted at once, and the next wait is 10s, not 300s. The container returns to Running and the CrashLoopBackOff reason clears.":
    "Ошибку исправили, и новый контейнер работает стабильно. Через 10 минут без сбоев Kubelet сбрасывает задержку. Тогда новое падение считается первым: контейнер перезапускается сразу, и следующая пауза будет 10s, а не 300s. Контейнер возвращается в Running, а reason CrashLoopBackOff исчезает.",
};
