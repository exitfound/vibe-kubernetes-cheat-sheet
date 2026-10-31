// Russian for workloads-container-restarts-laststate: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Container restarts and lastState: when Kubelet restarts a crashed container, the Terminated record rolls from state into lastState, the dead instance stays on the Node for kubectl logs --previous, and only the most recent termination survives the next restart":
    "Перезапуски контейнера и lastState: когда Kubelet перезапускает упавший контейнер, запись Terminated переходит из state в lastState, мёртвый экземпляр остаётся на Node для kubectl logs --previous, и только самое последнее завершение переживает следующий перезапуск",

  "The process hits its memory limit and the kernel kills it. Kubelet spots the dead container and writes state as Terminated: a record carrying exitCode 137, reason OOMKilled, startedAt and finishedAt. The record holds the live slot only until Kubelet turns to the restart, not until the new container runs.":
    "Процесс упирается в лимит памяти, и ядро его убивает. Kubelet замечает мёртвый контейнер и пишет в state запись Terminated с exitCode 137, reason OOMKilled, startedAt и finishedAt. Эта запись занимает текущий слот, только пока Kubelet не возьмётся за перезапуск, а не до запуска нового контейнера.",

  "A container can leave a note. Whatever it writes to terminationMessagePath, by default /dev/termination-log, goes into the message field of that Terminated record. The terminationMessagePolicy defaults to File, and FallbackToLogsOnError takes the log tail instead when the file is empty after a failed exit.":
    "Контейнер может оставить записку. Всё, что он запишет по пути terminationMessagePath, а по умолчанию это /dev/termination-log, попадает в поле message этой записи Terminated. По умолчанию поле terminationMessagePolicy равно File, а при FallbackToLogsOnError вместо файла берётся хвост журнальных сообщений, если после неудачного выхода файл пуст.",

  "Kubelet starts a fresh container in the same Pod and reports it. The records roll over. The state reads Running again, the Terminated record moves into lastState, and what lastState held before is dropped. The restartCount becomes 2. The dead instance stays on the Node, because container GC keeps one per container by default.":
    "Kubelet запускает новый контейнер в том же Pod и сообщает об этом. Записи сдвигаются. Поле state снова показывает Running, запись Terminated переходит в lastState, а прежнее содержимое lastState отбрасывается. Счётчик restartCount становится равен 2. Мёртвый экземпляр остаётся на Node, потому что GC контейнеров по умолчанию хранит по одному такому на контейнер.",

  "The live state reads Running, so the container is fine right now and the answer is not here. Running kubectl describe pod prints both records, State and Last State, and the answer is in Last State. It holds a Terminated record with exitCode 137 and reason OOMKilled, which explains why the previous instance died.":
    "Текущий state показывает Running, то есть прямо сейчас с контейнером всё в порядке, и ответа здесь нет. Команда kubectl describe pod выводит обе записи, State и Last State, и ответ как раз в Last State. Там хранится запись Terminated с exitCode 137 и reason OOMKilled, которая и объясняет, почему умер предыдущий экземпляр.",

  "The exitCode narrows the cause, and the reason beside it names that cause. 0 is Completed, a clean exit, and 1 is a generic application Error. Codes above 128 usually carry a signal number. So 137 is 128 plus 9 for SIGKILL, and if the kernel killed the process, the reason is OOMKilled. 143 is 128 plus 15 for SIGTERM.":
    "Поле exitCode сужает круг причин, а reason рядом с ним эту причину называет. Код 0 это Completed, чистый выход, а код 1 это общая ошибка приложения, Error. Коды выше 128 обычно несут номер сигнала. Так, 137 это 128 плюс 9 за SIGKILL, и если процесс убило ядро, рядом стоит reason OOMKilled. Код 143 это 128 плюс 15 за SIGTERM.",

  "The record has no log. Running kubectl logs --previous asks for the log of the previous instance, and Kubelet reads it off the dead container on the Node. It works for one generation only: the next restart makes this instance the older one, container GC removes it, and its lastState record is overwritten too.":
    "В записи нет журнальных сообщений. Команда kubectl logs --previous запрашивает их для предыдущего экземпляра, и Kubelet читает их с мёртвого контейнера на Node. Это работает только на одно поколение, ведь после следующего перезапуска этот экземпляр станет более старым, GC контейнеров его удалит, а его запись lastState тоже перезапишется.",
};
