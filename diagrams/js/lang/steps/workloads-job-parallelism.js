// Russian for workloads-job-parallelism: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "Job parallelism and completions: at most 3 Pods run at once and 5 successful Pod runs are needed, each success records one completion while each failure counts against a backoffLimit of 6 that would mark the Job Failed on exceeding it, and the Job is marked Complete when the fifth completion is recorded":
    "Поля parallelism и completions у Job: одновременно работают не больше 3 Pod, нужно 5 успешных запусков Pod, каждый успех записывает одно completion, а каждая неудача идёт в счёт backoffLimit 6, превышение которого пометило бы Job как Failed, и Job помечается Complete, когда записано пятое completion",

  "A Job with a fixed completion count runs Pods until that many of them succeed. This one asks for 5 successful runs and allows 3 at once, so the controller sees 0 Pods running against a parallelism of 3 and creates 3 from one Pod template. Nothing has finished yet, so no completion is recorded and .status.active is 3.":
    "Job с заданным числом completions запускает Pod, пока столько из них не завершится успешно. Эта Job просит 5 успешных запусков и допускает 3 одновременно, поэтому контроллер видит 0 работающих Pod при parallelism 3 и создаёт 3 из одного шаблона Pod. Ничего ещё не завершилось, так что ни одного completion не записано, а .status.active равно 3.",

  "Two runs, resize-images-x7k2p and resize-images-m4qbz, finish cleanly with exit code 0. A successful Pod run counts once toward .spec.completions, so .status.succeeded moves from 0 to 2. A Pod that has succeeded is never restarted or reused, so the Job creates a new one for the next completion.":
    "Два запуска, resize-images-x7k2p и resize-images-m4qbz, завершаются чисто с кодом 0. Успешный запуск Pod один раз идёт в счёт .spec.completions, поэтому .status.succeeded растёт с 0 до 2. Успешно завершённый Pod никогда не перезапускается и не переиспользуется, поэтому Job создаёт новый для следующего completion.",

  "At the same time the third run, resize-images-t9dhw, fails with exit 1. Under restartPolicy Never such a Pod reaches phase Failed, so .status.failed increments, no completion is recorded, and the failure counts against .spec.backoffLimit, 6 by default. The Pod object is not deleted, so its logs and exit code stay readable.":
    "В то же время третий запуск, resize-images-t9dhw, завершается неудачей с кодом 1. При restartPolicy Never такой Pod переходит в статус Failed, поэтому .status.failed растёт, completion не записывается, а неудача идёт в счёт .spec.backoffLimit, по умолчанию 6. Объект Pod не удаляется, так что его журнальные сообщения и код выхода остаются доступны.",

  "Three completions are still owed and no Pod is running, so the controller creates 3 new Pods, up to the parallelism cap again. The failure delayed all three, not only the retry. The back-off after one failure since the last success is 10s, then 20s, 40s and on, capped at ten minutes.":
    "Нужно ещё три completion, а ни один Pod не работает, поэтому контроллер создаёт 3 новых Pod, снова до предела parallelism. Неудача задержала все три Pod, а не только повторный запуск. Задержка после одной неудачи, считая с последнего успеха, равна 10s, затем 20s, 40s и так далее, до десяти минут.",

  "The last three Pods exit 0, and .status.succeeded reaches 5, which equals .spec.completions. The controller stops creating Pods and records the condition Complete=True. The one earlier failure stays counted, and the Job and its Pods stay until deleted, or until ttlSecondsAfterFinished runs out if set.":
    "Последние три Pod выходят с кодом 0, и .status.succeeded доходит до 5, что равно .spec.completions. Контроллер перестаёт создавать Pod и записывает условие Complete=True. Та единственная неудача остаётся в счёте, а Job и её Pod остаются, пока их не удалят или пока не истечёт срок ttlSecondsAfterFinished, если это поле задано.",
};
