# Russian on kube.how: voice, rules, glossary

The Russian is a rendering of the English, never a second source of facts. The English is checked
against the docs by `card-facts`; the Russian is checked against the English here. This file is
what a writer reads before touching any Russian line: card descriptions (`diagrams/js/lang/ru.js`),
narration and aria (`diagrams/js/lang/steps/<id>.js`), the /cli/ lines (`cli/js/lang/ru.js`), the
dialog chrome (`UI_RU` in `diagrams/js/dialog.js`).

## 1. The voice: the site owner's own Russian

The owner writes technical Russian as one connected story: each sentence picks up what the previous
one left and carries it a step further. Lines from the owner's READMEs, the model to imitate:

- «Мотивацией к написанию данной утилиты послужил исключительно образовательный интерес, поэтому я
  не думаю, что сей инструмент хоть сколько-то можно использовать в производственной среде. Тем не
  менее когда у нас есть развернутый экземпляр Loki...»
- «Данная ошибка возникает потому, что по умолчанию контейнер работает из под пользователя jenkins
  с UID 1000. Из-за разницы в правах между пользователем на хосте и пользователем внутри контейнера
  и возникает данная ошибка.»
- «Но для чего это нужно? Дело в том, что уже давным давно существует ишью на GitHub...»
- «Поскольку мы используем бинарный формат, нам не нужен интерпретатор Python как такового. За счет
  этого удалось уменьшить финальный вариант образа в два раза.»
- «По умолчанию журнальные сообщения отправляются в stdout, но это можно изменить с помощью флага -s.»

What that means for every line:

- **A chain, not a list.** A sentence opens on what the previous one ended with («...сохраняется в
  ETCD. Дальше за ним следят контроллеры...»), or on a link word that says how it relates.
- **Link words, one or two per paragraph:** «Однако», «При этом», «Поэтому», «Тем не менее»,
  «Дело в том, что», «В таком случае», «Если же...», «Так или иначе», «то есть», «за счёт», «вплоть
  до», «в том числе», «а значит». Never one in every sentence.
- **Cause as a sentence.** «X происходит потому, что Y», «Из-за Y и возникает X». Never «X: Y».
- **An ending.** The last sentence lands a consequence or the point («...поэтому Pod так и остаётся
  в Pending»), never stops on a bare list.
- **A noun before a bare token:** «параметр --register-node», «поле spec.nodeName», «флаг -t»,
  «условие Ready». Split a glued value: «в значении по умолчанию, он же true». The complete
  natural phrase beats a clipped one: «об этом узле ничего не знает».
- **Not taken from the owner, because of the length budget:** «данный», «является», «т.д.»,
  «такого инструмента, как X» in every sentence. «такой X, как Y» once, where it reads well.
- **No AI phrasing:** «давайте разберёмся», «играет ключевую роль», «важно отметить», «в мире
  Kubernetes», «не просто X, а Y», triples by template, a moral at the end. The humanizer-ru
  skill (`.claude/skills/humanizer-ru/`) lists them all. Its rule "the author's sample beats the
  rules" applies: this section is the sample.

## 2. Hard rules

Tests check the first four (`unit/diagrams-i18n.test.mjs`, `unit/steps-i18n.test.mjs`,
`unit/cli-i18n.test.mjs`):

- No em dash, no en dash, no semicolon, no apostrophe or single quote. Quotes are «ёлочки».
- **Every sentence starts with a capital letter**, Latin or Cyrillic. A sentence that would open on
  a code token takes a noun first: «Параметр maxSurge...», «Компонент kube-proxy...», «Том
  emptyDir...», «Интерфейс eth0...», «Поле lastState...».
- Every flag, field path, status, reason, number, port, IP, unit, path and on-diagram label of the
  English stays verbatim.
- **A colon only where Russian grammar asks for one:** after a generalising word before a list
  («два режима: Cluster и Local»). Never as a joint between two facts. The target is none.
- Kubernetes kinds Latin, capitalised, undeclined: «удалить Pod», «три Pod», «на каждой Node».
  Gender: Node feminine, Pod / Service / Deployment / Namespace / ReplicaSet / Secret / ConfigMap /
  PVC / PV masculine, Job / CronJob feminine, every *Class masculine. A plural kind stays singular.
- «узел» for the physical machine in prose, «Node» for the API kind and wherever the diagram draws
  a Node box.

## 3. Length

| String | Budget |
|---|---|
| card `desc` | aim for four full lines at 1920 px (the 1600px grid), like the English. `tools/fit.mjs --widths=1920 --lines=4 --tail=0.75` measures it, 180 to 220 characters (`DESC_CHARS` in `diagrams/js/data.js`). A recommendation, not a gate: the test only fails a desc past 1.5 times the mean Russian desc (`descCap`). One line more or less is fine (owner, 2026-10-26), but within a section the shortest and longest desc, EN or RU, differ by one line at most. Never cut a phrase that makes the text read human just to save a line |
| narration | about the English character count, at most about 10% more: the panel covers the picture |
| /cli/ line | never longer than now by more than a few characters |

A `desc` also ends on a full line: at 1920 px the last line is at least 75% full and never wraps
a word onto a fifth line. Short of the line beats over it. Other widths are not tuned. One or two words wrapped onto an empty line read as unfinished. Fill
the line with a word the compression took out (a link word, a noun before a token) before you trim.

Length is won by choosing words, never by dropping a fact, a qualifier or a token. Shorter forms
that keep the meaning: «запускает» for «выполняет запуск», «сам» for «самостоятельно», «так» for
«таким образом», «если» for «в том случае, если», a participle for «который» once per sentence.

## 4. Facts: what a rewording may never move

Rewording is free, meaning is fixed. Before a rewrite list the anchors of the ENGLISH (not of the
old Russian): every token, number, actor (who does what to whom), condition, order of events, and
every scope word. The rewrite keeps each one.

| English | carries | Russian must keep |
|---|---|---|
| only, alone, the single | exclusivity | «только», «лишь», «никто, кроме» |
| by default | a default, overridable | «по умолчанию» |
| may, can, might | possibility | «может», «можно», «бывает» |
| usually, typically, commonly | the common case, not a law | «обычно», «как правило» |
| at most, at least, up to | a bound | «не больше», «не меньше», «до» |
| until, still, already, not yet | time and state | «пока», «всё ещё», «уже», «ещё не» |
| never, no, not, nothing | negation | the same negation, on the same verb |
| every, each, all | universality | «каждый», «все», «любой» |

### Synonym ledger

A synonym is safe when it keeps the actor, the verb strength and the scope. Each line below is a
rewording an audit of this site caught and reverted (wrong, then right, then why):

- «работает на Node-2», «размещён на Node-2»: "lives on", and the same sentence says the Pod
  cannot start.
- «решает среда выполнения», «зависит от среды выполнения»: the English is about what the runtime
  CAN mount, not what it chooses.
- «вызвать StopContainer», «выполнить StopContainer»: Kubelet makes the CRI call, «вызвать» makes
  the runtime the caller.
- «отложено», «не запущено»: "held back" promises no later run.
- «устраняет только расхождение», «устраняет расхождение»: «только» is a scope word the English
  does not have.
- «эндпоинты, выбранные селектором», «эндпоинты»: a Service without a selector has them too.
- «Модель простая», «Модель такая»: «простая» is an added judgement.
- «одиночные Pod», «работающие одиночные Pod»: the "running" qualifier decides the fact.
- «не отвечает ни один хост», «ни один отдельный хост»: "no single host", every Node handles it.
- «работают», «по-прежнему работают»: "still" carries the contrast.
- «должны получать 503», «следует отвечать 503»: "must" and "should" are two strengths.
- «стоит запроса A и AAAA», «двух запросов, A и AAAA»: the count.
- «срок аренды», «срок Lease»: the kind stays Latin.
- A condition moved to the end of a list («своя файловая система и своё дерево процессов, если...»)
  covers both items, while the English scopes it to one: keep a condition next to its item.

- «наперегонки занимают Lease», «борются за Lease»: "race to claim" is an attempt, not a win.
- «Лимит соблюдает cgroup», «За лимитом следит cgroup»: "enforces" imposes, «соблюдает» obeys.
- «чтобы процесс не падал подряд», «не перезапускался подряд»: backoff stops the restarts, not the
  crashes.
- «вплоть до шага CRI», «пока Kubelet не начнёт»: "until" excludes the step, «вплоть до» includes it.
- «он в лимите подключений», «он идёт в лимит»: "counts toward", not "is within".
- «Node за сетевым разрывом», «Node лишь за разрывом сети»: "merely" carries the contrast with
  "confirmed dead".
- «а Pod привязывается на их место», «Затем Pod привязывается»: "then" is a later step, an «а»
  clause makes it a consequence.
- Undeclined Latin on both sides of a verb reads subject first: «цикл будит PLEG» says the loop
  wakes PLEG. Put the actor first («PLEG будит цикл») or name the roles.
- A compression that drops "then, then" into «по X, по Y и по Z» turns an ordered tie-break into
  equal criteria: keep «потом» between them.

- «Мимо него идёт только static Pod», «Один из немногих путей в обход API»: "one of the few" is not
  exclusivity, and Bypass Risks lists the kubelet API, etcd and the runtime socket too.
- «Поле spec.hard задаёт потолок, а status.used текущую сумму», «а status.used хранит текущую
  сумму»: an ellipsis borrows the first verb, so the observed sum would seem to "set" something.
- «Их failurePolicy», «У webhook поле failurePolicy»: "Their" after a list of plugins, policies and
  webhooks reaches all of them in Russian, and the timeout belongs to the webhooks only.
- «Побеждает высшая оценка», «Побеждает наибольшая сумма»: when the step before calls each plugin
  value «оценка», the ranked total is «сумма», or "highest score" reads as one plugin.
- «Он шлёт POST» after «...для следующего Pod»: a pronoun after a sentence that ends on another
  masculine kind points to that kind. Name the actor.
- «merge, который заменяет server-side apply», «merge, на смену которому пришёл server-side apply»:
  the undeclined pair reversed who replaces whom.
- «каждого поля, которое задаёт apply», «каждого поля, заданного apply»: undeclined apply after
  «которое» reads as the object.
- «два участника задают одно значение», «два manager применяют одно значение»: only appliers share a
  field and conflict, «участник» widens it to any writer.
- «очередной apply может получить отказ», «apply может внезапно получить отказ»: "suddenly" is not
  "the next".
- «а иногда даже выгоняет», «а может даже выгнать»: "can" is a possibility, «иногда» is a frequency.
- «какой Pod она примет и оставит», «какой примет, а какой оставит»: "which ... and which" is two
  Pods, one «какой» merges them.
- «на назначенной Node», «на номинированной Node»: "nominated" is status.nominatedNodeName,
  «назначенная» reads as bound.
- «С классом Never», «С классом, где задан Never»: Never is the class preemptionPolicy, not its
  name.
- «реже нарушающих PDB», «не нарушающих PDB»: the doc speaks of PDBs not violated, «реже» adds a
  frequency.
- «в режиме foreground отправляет DELETE для ReplicaSet, затем для Pod», «отправляет DELETE для
  ReplicaSet в режиме foreground, затем для Pod»: a mode before the verb covers both items, the
  English gives it to the ReplicaSet only.
- «как только список finalizers пустеет, API удаляет и эту запись», «как только у каждого из них
  пустеет список finalizers, API удаляет и его запись»: "each" is a scope word, and «эту» had no
  antecedent.
- «заново делает LIST», «делает re-LIST»: `re-LIST` is an on-diagram wire label, so it stays
  verbatim.
- «история сжата», «история уплотнена»: compaction drops old revisions, «сжатие» reads as
  compression.
- «передаёт каждое изменение», «потоком шлёт каждое изменение»: "streams" is an open stream, not a
  single reply.
- «Именно это не даёт репликам разойтись», «Поэтому принятый журнал совпадает с журналом Leader
  вплоть до записи 9»: the log check guarantees a match up to the new entry, not "never diverge".
- «перестаёт принимать записи», «перестаёт записывать»: the Leader still adds entry 10 to its log,
  only the commit stops.
- «пересылается Leader», «пересылается на Leader»: an undeclined Latin noun after a passive verb
  reads as the one doing the action.
- «Циклы управления запускает только лидер», «выполняет только лидер»: "runs" is ongoing work,
  «запускает» is the start, and the card draws `control loops starting` as its own state.
- «Цикл sync loop», «Цикл синхронизации»: "loop" said twice. One name for the sync loop across a
  card.
- «просит PLEG сделать relist и видит», «..., поэтому видит»: "so" is the cause the step exists for,
  «и» makes it a sequence.
- «Каталог задаёт staticPodPath», «Каталог задан полем staticPodPath»: an inanimate noun before a
  Latin token reads as the subject.
- «закрыта через cordon», «переведена в cordon»: the site form for "cordoned".
- «разве что этот образ он скачивал», «если только этот образ он не скачал»: "unless" is a hard
  exception, «разве что» softens it to "except perhaps".
- «все readinessGates в True», «все условия из readinessGates равны True»: the gates are a list of
  conditions, «в True» is clipped jargon.
- «должен покрывать память ядра», «ему следует покрывать»: the doc says "should reserve", a
  recommendation, not a duty.
- «Без hugepages», «Без выделенных hugepages»: "set aside" is a reservation, the Node may still have
  hugepages.
- «строкой total limits...», «словами total limits...»: the English paraphrases kubectl output,
  «строкой» claims a verbatim line.
- «действует на весь уровень», «действует на всю ветку»: "tier" is one QoS branch, «уровень» already
  means a depth of the tree.
- «обеспечивает потолок вытеснением», «удерживают его вытеснением»: "enforced by evicting" names no
  actor, the setting must not become the enforcer.
- «потолок, который купил limit», «limit купил ровно этот потолок»: in object-verb-subject order
  "the ceiling bought the limit" is possible.
- «и ограничивает его limit», «и упирается он в limit»: «его limit» reads as "its limit", the verb
  loses its subject.
- «засчитывает каждый байт», «засчитывает это потребление»: the kernel tracks listed memory types,
  not every byte.
- «оставив после себя лишь короткую причину», «оставив после себя короткую причину»: the dead
  instance keeps its logs (`--previous`), so "only" was false.
- «пока Ready False, первый Pod размещается», «пока Ready False, а первый Pod размещается»: in a
  comma chain a «пока» clause attaches to the clause after it, close it with «а».
- «если у них нет toleration ..., как у Pod DaemonSet», «кроме тех, у кого есть toleration ..., как
  у Pod DaemonSet»: a «как у X» after a negation can read as X lacking it too.
- «desiredHealthy, которое задаёт minAvailable», «desiredHealthy, заданному через minAvailable»:
  undeclined Latin around «которое», either can read as the subject.
- «готова к патчу», «можно безопасно отдать под патч»: "safe for" claims safety, «готова» only
  readiness.
- «Ready False это единственное condition», «Ready это единственное condition»: Unknown taints
  NoExecute too, so "the one condition" is Ready, not one of its values.
- «можно ли здесь запускать Pod», «могут ли здесь работать Pod»: "may run" also covers Pods already
  running.
- «Какие только не пускают», «Какие просто не пускают»: «какие только не» is the idiom "all sorts
  of".
- «envoy возрастом 41 день», «envoy, не используемый 41 день»: the label is `last used 41d`, and on
  an image-GC card age and last use are two different rules.
- «Компонент ... сам диск не измеряет», «не измеряет диск сам»: «сам» before an accusative noun
  attaches to the noun ("the disk itself").
- «Класс Burstable или Guaranteed Pod не спасает», «Класс Burstable или Guaranteed не спасает Pod»:
  a class name next to an undeclined kind reads as one compound, put the kind after the verb.
- «без нарушений Kubelet возвращает», «Kubelet возвращает ... без нарушений»: a noun before
  undeclined Latin reads as a genitive, the actor goes first.
- «Когда A и B или C», «A и B, или же C»: without the comma «или» binds to B, so a timeout that ends
  the group reads as one more condition of the unmount.
- «Kubelet и среда выполнения падают», «выключаются»: "go down" in a planned reboot is a stop, not a
  crash.
- «без чьего-либо участия», «без участия кого-то ещё»: "with nothing else involved" keeps the one
  actor that does act.
- «Heartbeat прекращаются», «Отправка heartbeat прерывается»: "pause" is temporary.
- «всё ещё держит осиротевший контейнер», «контейнер может всё ещё работать»: "may still run", a
  panicked Node runs none.
- «но только продление Lease приходит», «укладывается именно продление Lease»: "is the one that"
  points at one heartbeat and adds no «только».
- «taint не получает ни одна Node», «ни на одной Node нет taint»: "no Node is tainted" is a state,
  and the step has just lifted a taint.
- «должны работать всегда», «каждый ... рассчитан на постоянную работу»: "meant to keep running" is
  a design intent, «должны» adds a duty and «всегда» an absolute, and "each" keeps its «каждый».

- «При каждом значимом изменении», «При каждом касающемся его изменении»: "relevant" is "concerning
  it", «значимый» adds a size threshold.
- «действует только на разницу», «действует только по разнице»: «на» makes the difference the
  object acted upon.
- «Его удалили, или его Node отказала, и Pod вытеснили», «... или его Node отказала и Pod
  вытеснили»: the comma before «и» lets the eviction follow both branches.
- «Обратное действие.», «Обратное тому, как Pod забирают.»: after a deletion step "the reverse"
  with no object reads as the reverse of that deletion, not of adoption.

- «следующий перезапуск переживает только последнее завершение», «только последнее завершение
  переживает следующий перезапуск»: two inanimate nouns with the same nominative and accusative
  forms read subject first, so the subject goes first.
- «1 значит обычная ошибка приложения», «Код 1 это общая ошибка приложения»: "generic" is
  non-specific, «обычная» adds a frequency. A sentence that would start on a digit takes a noun
  first.
- «Где теперь можно узнать», «Где всё ещё можно выяснить»: "still" is a time-state scope word,
  «теперь» drops it.
- «Новое падение ... перезапускается сразу», «Новое падение считается первым, контейнер
  перезапускается сразу»: a crash is not restarted, the container is.
- «не даёт быстрому циклу падений перегрузить Node», «циклу перезапусков»: backoff limits the
  restart attempts (doc: "repeated restart attempts"), the crashes are not the load.
- «Job должна быть идемпотентной», «Job следует делать идемпотентной»: the doc says "should be
  idempotent", which is a recommendation.
- «и более старое пропускается», «и вышедшее за срок пропускается»: "older than that" means older
  than the deadline, while «более старое» compares with the tick just named.
- «Из-за обрезки истории kubectl get jobs», «Поэтому команда kubectl get jobs»: a noun before an
  undeclined command reads as a genitive.
- «Allow по умолчанию запустил бы вторую Job», «Режим по умолчанию Allow дал бы второй Job
  стартовать»: the policy lets a Job start, it starts nothing itself.
- «Что происходит по расписанию», «Что происходит в каждый срок»: "each" is a scope word.
- «Pod на Node-2 удаляет сборщик мусора», «Pod на Node-2 достаётся сборщику мусора»: an inanimate
  masculine noun after the verb is nominative or accusative, so the undeclined Pod can read as the
  one deleting.
- «numberReady падает ..., пока пересоздаётся Pod ..., и возвращается к четырём, когда Pod v2 ...»,
  «..., а когда Pod v2 становится Ready, счётчик снова равен четырём»: after a clause that ends on
  an undeclined kind, the next verb takes that kind as its subject.
- «как реплика Deployment», «в отличие от реплики Deployment»: after «не пересоздаётся», «как X»
  reads as X not being recreated either.
- «одной этой готовности хватает для второй команды», «одна эта готовность даёт ход второй команде»:
  "releases" is a trigger, «хватает» only says enough.
- «Pod завершается», «Pod завершён»: "finishes terminating" is a completed act, not one in progress.
- «пока удаление не прошло успешно», «пока удаление не пройдёт успешно»: a «пока ... не» clause
  takes the perfective future.
- «единственное число, которое этому Pod никогда не начисляют», «именно это число этому Pod не
  начисляют никогда»: "the one number" is emphasis, and other sums are never charged either.
- «Pod, который указывает RuntimeClass», «Pod, где указан RuntimeClass»: two undeclined masculine
  kinds around «который» let either be the subject.
- «запрос(ы) cpu», «requests на cpu»: resource requests stay Latin (glossary), the verb
  «запрашивать» stays Russian.
- «MY_POD_IP через downward API берёт поле», «указывает на поле»: the record says "names a field"
  because status.podIP may not hold yet, and «берёт» claims a read.
- «для каждого Service в этом Namespace, у которого есть cluster IP», «..., имеющего cluster IP»: «у
  которого» attaches to the nearer undeclined Namespace.
- «том downwardAPI так же после изменения размера», «обновляется так же после resize Pod»: next to
  «том», «изменение размера» reads as a volume resize, and the ellipsis borrowed «подхватил бы».
- «при следующей синхронизации», «позже, при синхронизации»: "a later sync" does not promise the
  very next one.
- «Отдельная метка», «Метка, указанная по имени»: the downward API passes a label referenced by its
  key.
- «подключиться к нему нечем, а ...», «так что подключиться к нему нечем»: "so" is the cause, a
  comma joint drops it.
- «Resources тоже запрещены», «Поле resources тоже запрещено»: a capitalised English word at a
  sentence start is still the field `resources`, it takes a noun.
- «Часы должны расходиться совсем немного», «В норме часы расходятся совсем немного»: the doc
  "should be very small" is an expectation, «должны» on a plural subject reads as a duty.
- «Ни один Pod не считался», «не учитывался»: "counted" is counted against a limit, bare «считаться»
  reads as "was regarded".
- «условие Job становится Complete», «Job получает условие Complete»: the condition is named
  «условие X», and the "so" linking it to the Pod exits stays «поэтому».
- «API ставит ... , и kubectl показывает Terminating», «..., поэтому kubectl показывает
  Terminating»: "so" is a cause, and «и» makes it a sequence.
- «здесь вручную, а иначе это произошло бы автоматически», «вручную, как здесь, или автоматически»:
  "by hand here or automatically" names two paths. The conditional turns it into a counterfactual.
- «отдаёт освободившееся имя web-0 Pod B», «отдаёт Pod B на Node-2 освободившееся имя web-0»: an
  undeclined dative kind right after a token reads as part of the name.
- «Безопасно ли удалить его» after «StatefulSet не создаёт замену», «удалить Pod»: the pronoun
  points to the last masculine kind.
- «отправить сигнал остановки PID 1», «отправить PID 1 сигнал остановки»: a bare token after a noun
  reads as a genitive, and the recipient is lost.
- «обрывают после продления на 2s, а не ждут», «получает продление на 2s, а затем обрывается»: after
  the English dropped "not waited for", the negation goes too, and "then" keeps the order.
- «и только потом объект уходит», «а уже потом объект уходит»: "before" is an order, not an
  exclusivity.
- «Тег :latest или его отсутствие», «Тег :latest или отсутствие тега»: «его» makes it "no :latest
  tag", which is any other tag.
- «контейнер падает с ErrImageNeverPull», «получает ошибку ErrImageNeverPull»: the container never
  started, so «падает» claims a crash.
- «Её хранилище слоёв» after «...на Node.», «Хранилище слоёв среды выполнения»: a feminine pronoun
  after a sentence that ends on Node points to the Node.
- «скачивание идёт дальше», «скачивание начинается»: "goes ahead" is a start, not a continuation.
- «Правило то же, так что и он должен выйти», «Контейнер migrate-schema подчиняется тому же
  правилу»: «он» after a sentence whose subject is Kubelet reads as Kubelet. Name the container.
- «если его собственный или унаследованный restartPolicy», «если restartPolicy контейнера, свой или
  унаследованный,»: after «переводит Pod» the «его» is the Pod, whose policy is never inherited.
- «любого следующего», «любого последующего»: "any later" covers every container after it,
  «следующий» is the next one.
- «перезапускает его отдельно», «перезапускает его независимо»: the doc says "without affecting the
  main container", «отдельно» only says "separately".
- «Пока ничего не завершилось, поэтому», «Ничего ещё не завершилось, так что»: "not yet" is «ещё
  не», and a «Пока» clause before «поэтому» reads as "while".
- «пока столько из них не завершатся», «не завершится»: with «столько» the verb goes singular.
- «для следующего completion Job создаёт новый», «Job создаёт новый для следующего completion»:
  undeclined Latin side by side reads as a genitive pair, put the actor first.
- One gender for a Latin field noun across a card: «одно completion», «ни одного completion», «пятое
  completion».
- «а OnFailure успех не перезапускает», «а при OnFailure успех не перезапускается»: an undeclined
  policy name beside an accusative noun reads either way round.
- «частые быстрые падения», «повторные быстрые падения»: "repeated" is repetition, «частые» adds a
  frequency.
- «Ход init показывает только этот счётчик», «Из колонок строки ход init показывает только этот
  счётчик»: "the only column here" is scoped to the row, and without it «только» claims no other
  source shows init progress.
- «на четвёртой минуте», «через четыре минуты»: an ordinal minute is the minute before the number,
  and the AGE chip reads 4m10s.
- «без sidecar READY не сдвинется», «READY без sidecar не сдвинется»: two undeclined Latin tokens
  after a preposition read as one genitive phrase.
- «Эта метка ставится один раз», «Это значение ставится один раз»: «метка» is a k8s label in
  Russian, and status.qosClass is a status field.
- «превышает запрос», «превышает request»: resource requests stay Latin, «запрос» is an HTTP or API
  request.
- «и всё это отдельно от preemption», «и с preemption ... класс не связан»: "it" is the QoS class,
  and «всё это» widens it to the whole eviction.
- «заданы requests и limits для CPU и памяти больше нуля», «requests и limits ... заданы и больше
  нуля»: a bound after «памяти» reads as the memory's.
- «Отсюда ответы расходятся», «С этого момента ответы расходятся»: «Отсюда» first reads as "hence",
  making the shared moment the cause of the difference.
- «Job создаёт её», «Job создаёт свою»: «её» reached back to the previous sentence's ReplicaSet
  «замена».
- «StatefulSet ... сохраняет его PVC», «сохраняет тот же PVC»: a non-reflexive «его» cannot point to
  the subject, so it attached to the ordinal.
- «её Pod удалит сборщик мусора», «сборщик мусора удалит и её Pod»: undeclined Pod before the verb
  reads as the subject.
- «а не за заданным вами числом», «и никогда не задаётся вами»: "never" is stronger than a plain
  contrast.
- «с reason Deferred и повторными попытками», «выставляет условие PodResizePending с reason Deferred
  и продолжает пробовать»: "keeps retrying" is the Kubelet's action, a «с ... и ...» list makes the
  retries part of the condition.
- «каждый request должен оставаться равным limit», «равным своему limit»: "its limit" pairs each
  request with the limit of its own resource.
- «а с 1.36 так же отклоняется запрос больше allocatable», «а с 1.36 и тот, что просит больше»: on a
  card that draws request as a resource token, «запрос» for a patch reads as the resource request.
- «по одному и тому же графику, у каждого контейнера своему», «по одинаковому графику, а счёт у
  каждого контейнера свой»: "the same schedule" is its shape, "kept per container" is its state.
  Glued together they contradict.
- «никогда не перезапускается и в цикл не попадает», «..., поэтому и в цикл не попадает»: "so" is
  the cause, «и» makes it a list.
- «чтобы Pod оставался вне очереди», «чтобы удерживать Pod»: «вне очереди» is the idiom "out of
  turn", and a gated Pod is still in the scheduling queue, only not in activeQ.
- «Scheduler даже не пытался», «Scheduler ни разу не пытался»: "not even once" is a count.
- «Пока ничего не запущено, и ... Pending, поэтому», «Ничего пока не запущено, и ... Pending. Из-за
  этого»: a sentence-initial «Пока» reads as the conjunction "while", not "yet".
- «Затем проходит его readinessProbe» after «...за весь подъём», «Затем контейнер проходит
  readinessProbe»: the pronoun followed another masculine noun. Name the actor.
- «оставляет Pod в Running с ContainersReady в False», «а ContainersReady всё ещё в False»: "still
  False" carries the contrast, so keep «всё ещё».
- «Kubelet решает четыре из пяти», «Kubelet определяет четыре из пяти»: with an object, «решать»
  reads as "solves".
- «для всего, что живо на нуле», «SIGKILL, если на нуле что-то ещё живо»: "if anything is still
  alive" is a condition on the SIGKILL, and "still" carries it.
- «оставляет меньше окна», «оставляет меньшую часть окна»: a comparative plus a genitive reads as
  "less than the window".
- «пока не завершится» after «задерживает SIGTERM», «пока хук не завершится»: the undeclined object
  becomes the subject of the clause.
- «пока Pod не Ready», «пока контейнер не Ready»: the doc runs readiness early while the CONTAINER
  is not Ready, and the English names no Pod.
- «чаще своего периода», «раньше своего периода»: "ahead of its period" is a timing, «чаще» compares
  a frequency with an interval.
- «и по нему ... отличают», «и так ... отличают»: «нему» after «с каждым перезапуском» points at the
  restart, not the counter.
- «Старому Pod не нужно уходить первым», «Ни одному старому Pod не нужно»: "No old Pod" negates all
  of them.
- «Старых Pod больше нет», «Работающих старых Pod больше нет»: Complete is "no old replicas
  running".
- «слотом surge, который даёт maxSurge 25%», «слотом surge, разрешённым maxSurge 25%»: undeclined
  Latin after «который» can read as the object.
- «они не взаимозаменяемы, как реплики Deployment», «в отличие от реплик Deployment, они не
  взаимозаменяемы»: «как X» after a negation hands X the negation too.
- «уходят обратно», «уходят в обратном порядке»: «обратно» is "back", "in reverse" is an order.
- «Этот же порядок задаёт и порядок первого запуска», «служит и порядком»: "is ... as well" is
  identity, «задаёт» adds a cause.
- «и именно он превращает» after «spec.updateStrategy.type равен RollingUpdate», «и именно эта
  стратегия превращает»: a pronoun after a field and its value reads as the field.
- «выжидает ещё столько секунд», «выжидает ещё и этот срок»: «столько» with no «сколько» names no
  amount.
- «в том же порядке, что и при завершении», «...при завершении Pod»: the doc order is Pod
  termination.
- «реплики работают на предыдущей ревизии», «всё ещё работают»: "still" carries the contrast
  (confirms the existing «по-прежнему» line).
- «Из-за барьера порядок и устроен так», «Барьер держится для того, чтобы»: the gate waits on exits,
  so serving the app is its purpose, not its cause.
- «на который полагаться нельзя», «на который полагаться не следует»: "should" is a recommendation,
  «нельзя» a ban.
- «из одного бюджета Pod, так что если он кончится», «если бюджет кончится»: a pronoun after
  undeclined Pod points to the Pod.
- «Сверх этого он удаляет», «Сверх порога PodGC удаляет»: a «он» after a sentence about Pod points to
  the Pod, so name the actor.
- «больше о нём не сообщит», «не сообщит об этом Pod»: «нём» after «объект Node удалён» can point to
  the Node object.
- «пропущенное» for a tick past the deadline or during suspend, «упущенное»: skipped (Forbid) and
  missed are two outcomes on the same axis, so one card keeps one word for each.
- «В его пакетах» after «...Pod прокси Ingress или Gateway.», «В пакетах клиента»: the pronoun
  points to the last masculine kind. Name the owner.
- «и строка становится списком», «так что строка становится списком»: "so" is the cause, «и» makes
  it a sequence.
- «по сокету бэкенда клиента не видно», «клиента по сокету бэкенда не видно»: two genitives in a row
  read as one chain.
- «записывает адрес в сам запрос», «вместо этого записывает адрес в запрос»: "instead" carries the
  contrast with the socket.
- «а в ESTABLISHED запись переводит именно ответ», «а в ESTABLISHED запись переходит именно по
  ответу»: two inanimate nouns with nominative = accusative read subject first, so the entry seemed
  to flip the reply.
- «следующие пакеты, пока жива запись», «последующие пакеты того же потока»: "of that flow" is a
  scope word, other flows still pay the walk.
- «единственный интерфейс Pod, обращённый к сети», «единственный обращённый к сети интерфейс Pod»: a
  trailing participle reads as an add-on, so "the one" grows to every interface, and lo is drawn
  beside eth0.
- «В нём указан порт» after «...по адресу 10.244.1.5», «В вызове указан порт»: the pronoun reaches
  the last masculine noun, not the call.
- «принимать трафик ... на localhost, не выходя из Pod», «..., и трафик при этом не покидает Pod»: a
  gerund takes the sentence subject, so the proxy, not the traffic, stays in the Pod.
- «приложение, запросившее ту же пару, получит отказ», «получило бы отказ»: the English "would be
  refused" is a hypothetical, the app never asks on the picture.
- «отдельный контроллер, не часть CoreDNS. Его Pod», «отдельный от CoreDNS контроллер. Его Pod»:
  «Его» after a sentence that ends on CoreDNS reads as a CoreDNS Pod.
- «насчитывает всего 48 Node», «насчитывает в сумме 48 Node»: before a number «всего» reads as
  "only", while "in total" is the total count.
- «ConfigMap, если его ещё нет», «если его нет»: «ещё» adds "not yet", and the autoscaler also
  re-creates a deleted ConfigMap.
- «попадают cordoned, draining и NotReady Node», «Node, переведённые в cordon, под drain и в
  состоянии NotReady»: English adjectives in Russian prose take the site form.
- «если Corefile не отключает кеш, как делает kubeadm», «кроме случая, когда Corefile отключает кеш,
  как это делает kubeadm»: «как X» after a negation hands X the negation.
- «и cache в нём стоит» after «...а не берётся из Corefile», «и в этом порядке cache стоит»: «нём»
  lands on the Corefile, the very thing the sentence rules out.
- «не обращаясь к нему на каждый запрос», «никогда не обращаясь к API при поиске имени»: a negation
  on «на каждый» reads as "not every time", while the English says "never".
- «Теперь у клиента есть адрес, и он открывает», «Теперь клиент знает адрес и открывает»: «он» lands
  on «адрес».
- «и рабочая нагрузка выглядит», «поэтому рабочая нагрузка выглядит»: "so" is a cause (confirms the
  existing rule).
- «половина TCP», «именно 53/TCP»: "the TCP half" read as "half of TCP". Name the port entry.
- «выбирает ... Pod по k8s-app=kube-dns, на порт 53», «..., с портом 53»: after a selection verb,
  «на порт» reads as a destination of the selecting.
- «поле protocol по умолчанию TCP», «по умолчанию равно TCP»: the site form for "defaults to".
- «имя спрашивается ... и только потом», «а уже потом»: "before" is an order (confirms the existing
  line). Same for «и только в конце как есть», «а в последнюю очередь как есть»: "last" is a
  position.
- «пишут имена полностью», «пишут имена с точкой в конце»: "fully qualify" is the trailing dot, and
  a name spelled out in full is still searched.
- «Это тот Service в Namespace shop, и он отвечает», «..., и отвечает»: «он» after a sentence ending
  on Namespace points to the Namespace.
- «Домены поиска Node, если они есть, добавляются после них», «добавляются в конец списка»: two
  plural pronouns in one sentence lose the order.
- «CoreDNS отвечает его ClusterIP», «возвращает его ClusterIP»: an undeclined token after «отвечает»
  reads as a dative.
- «spec Pod, который получает через watch», «spec Pod, который приходит через watch»: a «который»
  with a transitive verb makes the spec the receiver, and the Kubelet is the one receiving it.
- «откатывается к Default и получает файл Node», «..., поэтому получает файл Node»: "so" is the
  cause.
- «С dnsPolicy Default Kubelet копирует», «Kubelet при dnsPolicy Default копирует»: a value token
  right before an undeclined kind reads as one compound, so put the actor first.
- «хотя бы один nameserver, а его searches», «а searches»: «его» lands on the nearest masculine
  noun, the nameserver, not dnsConfig.
- «какой порт открывает Service», «какой порт открыт у Service»: two nouns with the same nominative
  and accusative forms read subject first, so the port seemed to open the Service.
- «CoreDNS отвечает по имени», «берёт адрес из самого имени»: "answers from the name" is the
  mechanism (IP from request), and «по имени» only says "for the name".
- «у плагина включены pods», «включён параметр pods»: a bare option token reads as the Pod kind in
  the plural.
- «При политике ClusterFirst по умолчанию resolv.conf», «При политике по умолчанию ClusterFirst файл
  resolv.conf»: after the token, «по умолчанию» attaches to the next verb.
- «создание Service сразу завершается ошибкой», «... и вовсе завершается ошибкой»: "outright" is
  "with no fallback" against PreferDualStack, «сразу» is a timing word.
- «IP Node каждого семейства», «IP Node для каждого семейства»: a genitive chain hands the family to
  the Node.
- «Работают обе: ..., каждый ..., оба ...», «Работают оба адреса, ...»: the gender of «обе» (the
  records) must not switch to the ClusterIPs mid-sentence.
- «Поиск остаётся за постоянное время», «Время поиска остаётся постоянным»: you cannot "stay behind"
  a time. Constant-time is a property of the lookup's duration.
- «даже когда в кластере тысячи Service», «по мере того как кластер растёт до тысяч Service»: "as
  the cluster grows" is growth, and «даже» adds a concession.
- «Что делает эту работу», «Что делает эту работу вместо него»: "instead" is the contrast the desc
  rests on.
- «балансировщик без весов», «балансировщик, не умеющий задавать веса целям»: "cannot weight its
  targets" is a capability, and «без весов» only says no weights are set.
- «С externalTrafficPolicy Local Node», «При externalTrafficPolicy Local каждая Node»: a policy
  value right before an undeclined kind reads as a compound ("Local Node", "Cluster Node").
- «платит лишний переход», «платит лишним переходом»: «платить что» is paying a bill, and the cost
  is «чем».
- «неровная нагрузка», «неравномерная нагрузка»: the Russian collocation for uneven load.
- «следит за ним» after «...на порту 5432», «следит за pg-ext»: a pronoun after «порт» points to the
  port. Name the object.
- «и он перечисляет» after «привязывает его к pg», «и pg-ext перечисляет»: «он» reaches the nearest
  masculine name.
- «ничего для него не пишет», «не пишет для него slice»: "no slice" names the object, «ничего»
  widens it.
- «оно про гарантию, а не про доступность», «а не про достижимость»: "reach" is reachability, and
  «доступность» reads as availability.
- «В самом Kubernetes живёт лишь малая часть этого», «малая часть модели»: a calqued "of this" with
  no antecedent. The doc names the model.
- «Его allowedRoutes оставлен по умолчанию» after «...с сертификатом в certificateRefs», «Поле
  allowedRoutes остаётся в значении по умолчанию»: «Его» points at the certificate.
- «Ссылка backendRef разрешается» after «разрешающий ReferenceGrant», «Ссылка backendRef
  действительна»: "resolves" and "allows" both land on «разрешать».
- «Service web, который выбирает Pod web», «Service web, чей селектор выбирает Pod web»: undeclined
  kinds on both sides of «который».
- «Реализация может отправить его» after «...у правила есть бэкенд», «отправить запрос»: the pronoun
  takes the last masculine noun.
- «и все его виды объектов это custom resources», «чьи виды объектов заданы как custom resources»:
  «все» is a scope word the English lacks.
- «запрос обязан получить HTTP 500», «запрос должен получить HTTP 500»: a MUST on an inanimate
  request is «должен».
- «Если бы X, его доля должна получать», «должна была бы получать»: a «если бы» clause takes a
  conditional main clause.
- «Эта часть не передаётся web-v1», «не достаётся web-v1»: undeclined Latin after a passive verb
  reads as the one doing the action, so «достаться» with a dative removes that reading.
- «берёт любой путь, и в нём один backendRef», «и в правиле один backendRef»: «нём» points to the
  nearest masculine noun, «путь».
- «маршрут показал бы ResolvedRefs False», «выставил бы условие ResolvedRefs False»: a condition is
  «условие X», and the verb is «выставлять».
- «Pod нет своего ... вовсе», «Pod не получает своего ...»: after the English dropped "at all",
  «вовсе» goes too, and "gets" keeps its verb.
- «второй Pod ... здесь не запустится», «здесь работать не сможет»: an undeclared hostNetwork port
  fails to bind after start, so "cannot run" is not "will not start".
- «второй Pod ..., а Pod видит», «а сам Pod видит»: a bare repeated Pod right after «второй Pod»
  reads as the same second Pod.
- «Всё остальное должно стоять за Service», «Всему остальному место за Service»: "belongs" is a
  placement, «должно» adds a duty.
- «Secret shop-tls, который запись TLS называет», «Secret shop-tls, названного ... в записи TLS»:
  «который» and «запись» have the same nominative and accusative forms, so the Secret can read as
  the one naming.
- «Этот контроллер отдаёт его своему default backend» after «оставляет ответ контроллеру», «отдаёт
  запрос»: «его» points to «ответ», and the request is what gets handed on.
- «запрос на ClusterIP Service», «на ClusterIP Service web»: a bare ClusterIP before Service reads
  as the Service type, not its cluster IP.
- «правило DROP в режиме iptables по умолчанию», «правило DROP в iptables, режиме по умолчанию»: a
  trailing «по умолчанию» reads as the default of the action, while the English scopes it to the
  mode.
- «Как удержать его» after «...к агенту другой Node», «Как удержать вызов»: the pronoun points to
  the last masculine noun, the agent.
- «хотя Pod на ней ещё нет, потому что блок вырезается при регистрации», «... ещё нет. Дело в том,
  что блок вырезается...»: a «потому что» after a «хотя» clause explains that clause, so the reason
  moved from the block onto the empty Node.
- «Так каждый IP Pod уникален, и любой Pod доступен», «Так что ..., и благодаря этому любой Pod
  доступен»: "which is what lets" is a cause, and «и» makes it a list.
- «Размер блока задаёт флаг --node-cidr-mask-size», «Флаг --node-cidr-mask-size задаёт размер
  блока»: two inanimate masculine nouns read subject first.
- «С флагом --allocate-node-cidrs controller-manager вырезает», «Когда задан флаг ...,
  controller-manager вырезает»: a flag token followed by an undeclined component reads as a genitive
  pair, and "set" is the enabled state.
- «единый пул», «единственный пул»: "the single pool" is one and only, «единый» reads as common or
  unified.
- «а выбирает его алгоритм планирования», «выбранный алгоритмом планирования»: «его» before a noun
  reads as "its", and "picked by" is a participle, not an «а» clause.
- «а заменяет его nftables», «а на смену ему приходит nftables»: undeclined Latin after «его» reads
  as "its nftables".
- «Любой режим ..., а ... между ними», «Оба режима»: "either mode ... they" needs a plural
  antecedent.
- «новые порты не выделяются, пока их не запросят», «не выделяется, если его не запросят»: "unless"
  is a condition, «пока не» a time limit.
- «делает DNAT и при политике Cluster по умолчанию SNAT», «и, при политике Cluster по умолчанию,
  SNAT»: without commas «по умолчанию» attaches to SNAT.
- «а это поле предназначено только для», «а это значение предназначено»: the doc restricts setting
  it false, not the field.
- «нестабильны, и если Node пропадает», «нестабильны, поэтому если Node пропадает»: an English colon
  that introduces a consequence is "so", and «и» makes it a list.
- «записывает его в status Service» after «из IPAddressPool, который объявил оператор», «записывает
  адрес»: «его» after a «который» clause points to the masculine kind or the actor in it.
- «маршрутизатор распределяет соединения», «хеширует соединения»: "hashes" is the mechanism a later
  step depends on, and «распределяет» loses it.
- «должен уметь BGP», «должен поддерживать BGP»: «уметь» takes an infinitive.
- «ставит бит ..., и на кадр, который Pod кладёт внутрь», «на внутренний кадр от Pod»: undeclined
  Pod after «который» reads as the object.
- «возвращает Node ICMP type 3 code 4», «возвращает на Node ICMP ...»: an undeclined recipient
  before a bare token reads as the object.
- «оператор её не заметит», «число у NIC её не показывает»: "the number does not show it" is a fact
  about the number, not a prediction about the operator.
- «мелкие пакеты проходят», «по-прежнему проходят»: "keep crossing" carries the contrast.
- «Без него обходится только Pod с hostNetwork», «Без своего пространства имён обходится»: «него»
  after a clause about the pause container reads as the container.
- «так и не появляются, а друг до друга они достают», «..., и по той же причине контейнеры достают»:
  "which is why ... and why" is two consequences. «а» drops the second, and «они» after a plural
  token pair reads as that pair.
- «Этот блок в ряду единственный не хук», «В отличие от соседей, этот блок не хук»: eth0 on the same
  row is not a hook either, so «единственный» was false.
- «До POSTROUTING он не доходит» after «...его получает локальный сокет», «Такой пакет до
  POSTROUTING не доходит»: «он» after a sentence ending on a masculine noun points to that noun.
- «Так бывает с бэкендом на hostNetwork», «Так происходит»: "as it does for" is a stated case, and
  «бывает» reads as may.
- «Через какие этапы он идёт» after «...настоящий Pod», «Через какие этапы идёт пакет»: a pronoun
  after a kind.
- «почему подмена стоит первой», «почему ... должна быть первой»: "must" is a necessity.
- «пересылает имя кластера», «пересылает кластерное имя»: «имя кластера» is the name of the cluster,
  while the English means a name in the cluster domain.
- «Адрес 10.96.0.10 он уже держит» after «...в CoreDNS», «агент уже держит»: «он» after a sentence
  that ends on undeclined CoreDNS points to CoreDNS. Name the actor.
- «в пределах от 5 до 30 секунд, отрицательный 5 секунд», «..., а отрицательный 5 секунд»: after a
  comma-set range, an ellipsis with no «а» reads as one more list item.
- «мог выпасть 10.244.3.9», «могло выбрать 10.244.3.9»: the English actor is the rule, and «выпасть»
  turns its pick into chance.
- «порт Node по умолчанию сохраняется», «по умолчанию порт Node сохраняется»: «по умолчанию» right
  after a noun reads as "the default port".
- «на готовый Pod, ..., и пересылает его», «и пересылает соединение»: «его» after an undeclined
  masculine kind points to the kind.
- «уйдёт он к Service» after «от адреса зависит», «уйдёт пакет к Service»: «он» after «адрес» points
  to the address.
- «Как различить три случая», «Что отличает три случая»: "what tells apart" names the distinguishing
  thing, not the reader's method.
- «, и его забирает маршрут по умолчанию», «, так что его забирает»: "so" is the cause (confirms the
  existing «так что» line).
- «Сервер отвечает на 192.168.1.20», «ответ возвращается на 192.168.1.20»: the address is RFC 1918,
  an edge NAT rewrites it, and the server never sees it.
- «ответ разворачивается по записи», «ответ получает обратную трансляцию»: the translation is
  reversed, not the reply.
- «на хуке на выходе Node проходит», «Node проходит ... на хуке на выходе»: a noun before undeclined
  Node reads as a genitive and leaves the verb without a subject.
- «это и значит master cni0», «о чём и говорит master cni0»: undeclined Latin after «значит» reads
  as the subject, so the label "means" the enslavement backwards.
- «Порт ни за что не отвечает», «ни на что не отвечает»: «отвечать за» is "be responsible for". A
  port that answers no traffic is «ни на что».
- «Он входит в один конец пары» after «единственный интерфейс ..., смотрящий наружу», «Пакет
  входит»: the pronoun points to the last masculine noun.
- «Внутри пространства имён eth0 несёт», «...интерфейс eth0 несёт»: a noun before an undeclined
  token reads as a genitive.
- «пакет вне подсети», «пакет для другой подсети»: "off-subnet" is where the packet is bound, and
  «вне» places the packet itself outside.
- «Это тот же последний шаг», «Последний шаг тот же»: a sentence-initial «Это» takes in the whole
  previous sentence, while the English matches only the last hop.
- «анонсирует подсеть Pod каждой Node своим BGP-пирам», «анонсирует своим BGP-пирам подсеть Pod
  каждой Node»: before a dative, «каждой» reads as dative, which gives "to each Node".
- «но underlay должна знать», «но взамен underlay должна знать»: "at the price of" is a trade-off,
  and a bare «но» is only a contrast.
- «накладные расходы MTU», «потери MTU»: kept because it is the sibling card's subject name.
- «Он проходит по veth» after «как unicast», «Кадр проходит по veth»: an undeclined masculine token
  before the pronoun takes it.
- «... ровно в этот порт, и его не касаются ни NAT», «и кадра не касаются»: «его» after a port reads
  as the port.
- «Маршрут идёт без шлюза, и кадр уходит», «..., так что кадр уходит»: an English colon that
  explains a consequence is a cause, and «и» makes it a sequence.
- «пройти должны и egress, и ingress», «пропустить его должны»: "pass it" is a check approving the
  connection, and «пройти» makes the checks the travellers.
- «Обе его пропускают» after «...ingress получателя», «Обе пропускают соединение»: «его» after a
  masculine genitive noun points to the receiver.
- «а ядро трогает уже resync», «а ядра касается уже resync»: an inanimate noun with the same
  nominative and accusative before undeclined Latin reads as the subject.
- «Минимум задаёт minSyncPeriod», «Этот минимум и есть minSyncPeriod»: "is" is identity, and
  «задаёт» reverses the roles.
- «эндпоинт, который API Server уже убрал», «эндпоинт, уже убранный API Server»: undeclined Latin
  after «который» can read as the object.
- «очистки, которую не запускает ни одно изменение», «очистки, которые не запускает ни одно
  отдельное изменение»: the singular attaches to the last noun only, and "single" is a scope word.
- «хранит selector и никакого списка бэкендов», «хранит selector, а списка бэкендов в нём нет»: a
  genitive «никакого» needs a negated verb.
- «Он пишет правила Service» after «...и никогда за Pod», «следит за EndpointSlice и никогда за Pod,
  а правила Service пишет»: the pronoun after a sentence ending on Pod points to the Pod.
- «это failureThreshold по умолчанию», «это значение failureThreshold по умолчанию»: the number is
  the field's value, not the field.
- «записью в ETCD объекта IPAddress», «объект IPAddress ... записывается в ETCD»: an undeclined
  store name before a genitive reads as "the ETCD of the object".
- «у двух объектов не может быть одного имени», «общего имени»: «одного» reads as "a single name",
  and "share one name" means the same one.
- «Тот смотрит в полосу», «Тот ищет в полосе»: "looks in" is a search, «смотреть в» is a gaze.
- «разворачивает трансляцию», «отменяет трансляцию»: "reverses" means undo. «разворачивать» reads as
  "deploy", and the network cards say «отменяет».
- «видит только ClusterIP и никогда адрес Pod», «и никогда не видит адрес Pod»: an ellipsis drops
  the «не» that «никогда» needs on its verb.
- «нет ни у одного отдельного узла», «за который не отвечает ни один отдельный хост»: "answers for"
  is the doc's "answered by", and "has" is a different claim.
- «Сам kube-proxy пишет правила и никогда не пересылает», «Компонент kube-proxy пишет правила и сам
  никогда не пересылает»: «сам» goes with the verb it modifies.
- «Pod находится в Ready ..., чтобы EndpointSlice его обслуживал», «..., так что EndpointSlice
  обслуживает Pod»: "so" is a consequence, «чтобы» makes it a purpose, and «его» after a parenthesis
  ending on Service points to the Service.
- «а targetPort по-прежнему 9376» after «контейнер слушает 8080», «а targetPort по-прежнему равен
  9376»: the ellipsis borrows «слушает».
- «за Service никого нет, и вызов не доходит», «..., поэтому вызов так и не доходит»: "with nothing
  behind" is the cause, and "never" is «так и не».
- «по установленной записи TCP conntrack», «по записи conntrack установленного TCP-соединения»:
  "established" is the TCP state, «установленная запись» reads as "installed".
- «запрос ..., новое соединение ..., и каждое закреплено», «и каждый из них закреплён»: "each" over
  nouns of mixed gender takes the masculine.
- «В этом окне 5s kube-proxy», «Пока идут эти 5s, kube-proxy»: two bare tokens side by side read as
  one phrase.
- «так что SIGKILL не отправляется», «поэтому SIGKILL так и не отправляется»: "never" (confirms
  «никогда не задаётся вами»).
- «пересылает на порт Node 31000», «на порт 31000 на Node»: a number after an undeclined kind reads
  as the kind's name.
- «CoreDNS отвечает CNAME на api.example.com», «возвращает CNAME на»: «отвечать на X» reads as
  replying to X.
- «нет ни ... ни правил Service для него» after «поле clusterIP», «у такого Service нет»: «него»
  points to the nearest masculine token, the field.
- «Нагрузка распределяется ровно», «распределяется равномерно»: «ровно» reads as "exactly". The doc
  says "evenly".
- «Соединение пересекает зоны, а не падает», «вместо сбоя соединение пересекает зоны»: "failing" is
  a failed connection, and «падает» is crash jargon.
- «эндпоинты с подсказкой для его зоны» after «заставляет kube-proxy», «для своей зоны»: a
  non-reflexive «его» cannot point to the actor of the infinitive.
- «дополняет сделанное bridge», «дополняет то, что уже сделал bridge»: "already" is a time-state
  scope word, and a bare undeclined Latin noun after a participle loses its agent role.
- «прогоняет цепочку в том же вызове ... и запускает в нём pause», «в этом пространстве»: «нём»
  after «вызове» points to the call, not to the namespace.
- «не пишет для него правил» after «Виртуального IP нет», «не пишет правил для Service»: «него»
  points to the IP, not the Service.
- «к IP Pod, который выбрал сам», «сам выбирает IP одного Pod»: an undeclined Pod before «который»
  reads as the one choosing, and "one" was lost.
- «с selector Control Plane», «с селектором Control Plane»: undeclined Latin side by side reads as a
  genitive pair.
- «StatefulSet web запускает три Pod», «У StatefulSet web три Pod»: "runs" is the ongoing state, not
  a launch.
- «будут делить его вместе с IPC и UTS», «будут делить его, а также IPC и UTS»: «вместе с» makes IPC
  and UTS co-sharers, while the English means more shared namespaces.
- «В рамках того же RunPodSandbox», «В том же вызове RunPodSandbox»: RunPodSandbox is one CRI call, and
  «в рамках» without «вызова» reads as a phase.

- «NodeUnpublishVolume снимает его bind-монтирование» after «...в обратном порядке», «снимает
  bind-монтирование Pod A»: «его» points to «порядке».
- «Если на Node том больше не использует ни один Pod», «Если ни один другой Pod на Node не
  использует том»: nominative = accusative, so «том» first reads as the subject, and "no other"
  keeps «другой».
- «NodeStageVolume, если драйвер делает staging, форматирует его», «форматирует устройство»: «его»
  points to «драйвер».
- «Обычно он делает bind» after «по одному на Pod», «Последний вызов, по одному на Pod, это
  NodePublishVolume. Обычно он...»: a pronoun after a kind.
- «До старта контейнера он записывает» after «...через API Server.», «Kubelet записывает»: a pronoun
  after a sentence ending on a masculine kind points to that kind.
- «Watch обновляет кеш», «Поток watch обновляет кеш»: a capitalised English word at a sentence start
  takes a noun (confirms the Resources line).
- «читает новый файл, когда откроет его», «прочтёт новый файл»: the main verb follows the future
  tense of its «когда» clause.
- «удаляется вслед за старым контейнером», «стирается при удалении старого контейнера»: "once the
  old container is removed" ties the deletion to the removal, not to the exit or the replacement.
- «Overlayfs сначала копирует», «Файловая система overlayfs сначала копирует»: a capitalised token
  at a sentence start still takes a noun.
- «В upperdir и в слое app его нет, поэтому файл отдаёт базовый слой», «этого пути нет, поэтому файл
  берётся из базового слоя»: «его» pointed to «слой», and two inanimate masculine nouns read subject
  first.
- «NodeStageVolume, если драйвер делает staging, затем NodePublishVolume», «NodePublishVolume, а
  перед ним NodeStageVolume, если драйвер делает staging»: in a comma chain the condition reaches
  the next call too. Keep it beside its own item.
- «называет его драйвер» after «новый том», «называет драйвер этого sidecar»: the pronoun lands on
  the last masculine noun.
- «Вторая половина это DaemonSet node plugin», «node plugin в виде DaemonSet»: undeclined Latin side
  by side reads as a genitive pair.
- «и не запускает драйвер производителя», «и никакой драйвер производителя в нём не работает»: "runs
  no" is ongoing and a negation over all (confirms the «запускает» line).
- «и приложение пишет через него» after «в контейнер», «через этот bind»: «него» lands on the
  container.
- «С другим драйвером виды объектов остаются те же», «За те же виды объектов встаёт и другой
  драйвер»: "fits behind" is the driver plugging in, not the kinds staying.
- «Кто делает всю работу», «настоящую работу»: «всю» is a scope word the English lacks.
- «класс привязывается в режиме WaitForFirstConsumer», «у класса режим привязки
  WaitForFirstConsumer»: "the class binds WFFC" is its volumeBindingMode, and the class is never
  bound.
- «На этапе фильтрации он сравнивает» after «...нужен новый том», «... Scheduler сравнивает»: the
  pronoun points to the last masculine noun.
- «но Scheduler об этом никто не сообщает», «но до Scheduler эти сведения не доходят»: an undeclined
  dative kind at the head of a clause reads as its subject, and "nothing" is not «никто».
- «Pod могут отправить ..., том не создаётся, и всё начинается заново», «Pod может попасть ...,
  остаться без тома и начать всё заново»: a modal on the first verb only turns the rest into facts.
- «Когда Pod удалён ... и только потом исчезает объект Pod», «Когда Pod удаляют»: "is deleted" is
  the request, and the object outlives the unpublish.
- «по пути, который дал Kubelet, его атрибуты», «по пути, полученному от Kubelet. Атрибуты тома»:
  «его» after a clause ending on Kubelet points to Kubelet.
- «id тома, который Kubelet считает хешем», «Kubelet добавляет и id тома, хеш от...»: «считать X
  Y-ом» is "to regard as", and Kubelet stood after «который».
- «Атрибуты драйвера», «Атрибуты тома»: volumeAttributes come from the Pod author, so «драйвера»
  reads as the driver's own settings.
- «Когда его контейнеры остановились» after «...удаляет том», «Когда контейнеры Pod остановлены»:
  «его» lands on «том».
- «и false у драйвера NFS, поэтому не пишет ничего», «а у драйвера NFS читает false и поэтому не
  пишет ни одного»: the ellipsis borrowed the nearer «пишет», and «ничего» widens "none" (one
  VolumeAttachment).
- «этот драйвер не запускает external-attacher», «работает без external-attacher»: "runs" is a
  standing state, «запускает» a launch (confirms the control-loops line).
- «поэтому при File Kubelet меняет», «поэтому Kubelet при File меняет»: a value token right before
  an undeclined kind reads as a compound (confirms the dnsPolicy line).
- «как attached, shared остаётся», «как attached, том shared остаётся»: a bare token after a status
  word reads as a second status.
- «привязывается к тому без класса», «к PV без класса»: at first sight «к тому» reads as the
  demonstrative "to that one".
- «плагин её не трогает, а PVC с ней не просит класса», «..., то есть PVC не просит класса»: the EN
  colon explains, and «а» makes it a contrast.
- «может связать его» after «...не просит класса», «связать такой PVC»: the pronoun lands on
  «класса».
- «и data-c получает fast», «поэтому data-c получает fast»: "so" is a cause (confirms the existing
  line).
- «PVC без StorageClass всё равно его получает», «всё равно может его получить»: "can still end up"
  is a possibility, because with no default the class stays unset.
- «эта метка позволяет ReplicaSet», «пометка на удаление позволяет»: the mark is deletionTimestamp,
  and «метка» is a k8s label (confirms the existing line).
- «создать замену на Node-2, которая зависает», «создать на Node-2 замену, которая»: «которая» right
  after feminine Node reads as the Node.
- «Для StatefulSet он ещё важнее» after «...без шестиминутного таймера», «этот выход ещё нужнее»:
  the pronoun lands on the timer.
- «сбой сети», «короткий сбой сети»: "blip" is brief, set against "dead".
- «по-прежнему running», «по-прежнему показывают running»: a status value with no verb is clipped
  jargon.
- «а ZONE в окружении по-прежнему east» after «приложение читает west», «а переменная окружения ZONE
  по-прежнему равна east»: the ellipsis borrows «читает», which makes the variable the reader.
- «и тот просит» after «вызывает у драйвера CreateVolume», «и драйвер просит»: «тот» takes the
  last-named noun, the undeclined call.
- «поставил на нём claimRef» after «для этого PVC», «поставил на томе claimRef»: «нём» reaches the
  nearest masculine kind, so the claimRef seemed to sit on the claim.
- «том выигрывает сразу», «выигрывает безоговорочно»: "outright" is "without contest", «сразу» is
  timing (confirms the «и вовсе» line).
- «Бэкенд выделяет его» after «диск запрошенного размера», «выделяет диск»: «его» reaches the nearer
  «размера».
- «Pod на замену web-b», «замена, Pod web-b,»: «на замену X» means "replacing X", so the new Pod
  read as web-b's replacement.
- «замена этого Pod на другой Node», «на другой Node замена этого Pod»: «замена X на Y» is the idiom
  "replace X with Y".
- «его замена» after «при перезапуске контейнера», «замена этого Pod»: the pronoun lands on the
  container.
- «до старта любого контейнера Kubelet создаёт», «Kubelet до старта любого контейнера создаёт»: a
  noun before undeclined Latin reads as a genitive (confirms the existing line).
- «каждый контейнер, который его монтирует» after «читает part-1», «монтирующий этот том»: the
  pronoun lands on the file.
- «лимитом памяти Pod, если он меньше», «если этот лимит меньше»: a pronoun after undeclined Pod
  points to the Pod.
- «Две суммы упираются в одну линию 1Gi», «Две суммы сравнивают с одной линией 1Gi»: "meet the line"
  is measured against it, and «упираться» puts the sum that stays inside at the line.
- «Pod добавляет emptyDir, и его 1100Mi», «Pod добавляет emptyDir и набирает 1100Mi»: «его» after
  emptyDir hands the total to the volume.
- «Места на диске Node-1 хватало всегда», «Нехватки диска на Node-1 не было никогда»: "never short"
  keeps its negation.
- «Для Pod считаются все три», «В счёт Pod идут все три»: confirms the «считаться» line.
- «поэтому его выбирают заранее» after «должно совпадать с томом», «поэтому режим выбирают заранее»:
  «его» can land on «том».
- «с fsType из тома или по умолчанию драйвера», «а иначе с тем, что драйвер задаёт по умолчанию»:
  «по умолчанию» takes no genitive, and «драйвера по умолчанию» reads as "the default driver".
- «нет файлов, которым ставить права», «на которые ставить права»: permissions are set на files.
- «У web-0 это Filesystem», «Для web-0 это Filesystem»: the Pod carries no volumeMode, the claim
  does.
- «разве что драйвер ... делает это сам», «если только драйвер ... не делает это сам»: "unless" is a
  hard exception (confirms the existing line).
- «пропускает обход, если он уже совпадает», «если каталог уже совпадает»: «он» lands on the nearest
  masculine noun, «обход».
- «не даёт ... добавлять минуты, как это делает политика Always», «а при политике Always так и
  происходит»: after a negation, «как X» hands X the negation (confirms).
- «Драйвер CSI, который заявляет VOLUME_MOUNT_GROUP», «заявляющий VOLUME_MOUNT_GROUP»: undeclined
  Latin after «который» can read as the subject (confirms).
- «Обойти это позволяет настройка», «Этого избегает настройка»: "avoids" is the setting acting, and
  «позволяет» weakens it to a possibility.
- «с тем, что просит fsGroup», «с тем, о чём просит fsGroup»: «что» has the same nominative and
  accusative forms, so the token can read as the one being asked.
- «PVC с таким именем, которым Pod не владеет», «PVC с таким именем, не принадлежащий Pod»:
  «которым» is also the instrumental of «имя» and attaches to the nearer noun.
- «Эфемерным его делает ownerReference», «Именно ownerReference делает этот PVC эфемерным»: a
  pronoun with no antecedent in the line, and "is what makes" is «именно».
- «фиксированный размер, который Pod не превысит», «выйти за который Pod не может»: "cannot exceed"
  is a capability, «не превысит» a prediction.
- «пишет cache.db, который попадает прямо на диск Node-1, и растит его», «и растит файл»: «его»
  lands on the nearest masculine noun, the disk.
- «проверка падает с FailedMount», «проверка даёт ошибку FailedMount»: a failed check does not
  crash.
- «тома Secret всех Pod на Node-1», «тома Secret её Pod»: «всех» is a scope word the English lacks.
- «довести Node до disk pressure», «до нехватки диска»: the English words are prose, not a label, so
  they take the Russian.
- «и файлы переживают его» after «в каталог своей Node», «переживают сам Pod»: the pronoun took
  «каталог».
- «поставляются отдельным образом», «в собственном образе»: «отдельным образом» is also the adverb
  "separately, in another way".
- «IfNotPresent его скачивает», «при IfNotPresent его скачивают»: the policy is a condition and the
  kubelet pulls (confirms the Allow line).
- «из которого запускают контейнер», «из которого можно запустить контейнер»: "can run" is a
  possibility.
- «даёт ему своё пространство имён», «даёт ему отдельное»: «своё» is reflexive to the subject, so
  the namespace became the runtime's.
- «mountPropagation None по умолчанию rprivate», «по умолчанию mountPropagation None означает
  rprivate»: after a value, «по умолчанию» reads as "the default value", and the hedge is lost.
- «делает bind каждого из монтирования хоста», «каждого каталога из монтирования хоста»: «каждый из»
  plus a singular genitive reads as "each of that one mount".
- «иначе его делает shared Kubelet», «иначе Kubelet делает его shared»: a value token right before
  an undeclined kind reads as a compound.
- «делает bind записи хоста для каталога Pod в /data», «делает bind в /data записи хоста ...»: a
  trailing target attaches to the nearest noun.
- «монтирование, которое хост позже добавит», «позже добавленное хостом»: same nominative and
  accusative forms around «который».
- «Если бы в volumeMounts плагина был None, его монтирования», «монтирования плагина»: «его» after a
  value token points to the value.
- «До 1.36.3 там было», «Вплоть до 1.36.3 там было»: "up to" a version includes it, while «до» reads
  as exclusive.
- «Scheduler размещает его» after «до удаления старого», «размещает новый Pod»: the pronoun points
  to the last masculine kind.
- «maxUnavailable по умолчанию округляется», «значение maxUnavailable по умолчанию округляется»: «по
  умолчанию» after a token attaches to the verb, so the rounding became the default.
- «отказывается писать второй» after «Pod на замену», «второй VolumeAttachment»: a bare ordinal
  takes the nearest masculine kind.
- «подменяет его в том же файле», «записывает его в тот же файл»: «подменить X» makes X the thing
  replaced, so the fresh token read as swapped out.
- «старый токен из Secret», «токен старого образца из Secret»: on a card with token 1 and token 2,
  «старый» reads as the expired token, while "legacy" is the older mechanism.
- «Получатель ... должен его отклонить», «Получателю ... следует отклонить токен»: the doc says
  "should reject", and «его» after undeclined audience pointed to the audience.
- «Если бы Pod использовал старый токен из Secret, тот», «..., токен никогда бы»: «тот» takes the
  last masculine noun, the Secret.
- «записывает PVC в его claimRef», «в claimRef тома»: «его» after an undeclined PVC points to the
  claim.
- «сам удаляет объект PV», «удаляет и сам объект PV»: "the object itself" is a contrast on the
  object, and «сам» before the verb moves it onto the actor.
- «статус записать некуда», «записывать статус нечего»: "no phase left to write" means there is no
  phase, while «некуда» means there is nowhere to put one.
- «с pv-data в volumeName и storageClassName, равным пустой строке», «с volumeName, равным pv-data,
  и storageClassName, равным пустой строке»: one «в X и Y» puts the value in both fields.
- «Для соперника app/scratch с пустым storageClassName, которому том подошёл бы», «Сопернику, PVC
  app/scratch с пустым storageClassName, том подошёл бы»: «которому» attaches to the nearer
  undeclined field.
- «пока другой не забрал его первым», «пока его не заберёт другой»: «пока ... не» takes the
  perfective future (confirms the existing line).
- «другой PVC его уже не заберёт», «другой PVC забрать его не может»: "can" is a possibility, the
  future perfective is a prediction, and «уже» was added.
- «каждый объект называет другой», «каждый объект ссылается на другой»: "names" is a reference, and
  «называть» plus a bare accusative reads as "calls something else".
- «раз сделана, исключительна», «раз сделана, эксклюзивна»: the short form «исключительна» reads
  first as "exceptional".
- «находит том, к которому привязан PVC, и монтирует его», «по PVC находит привязанный к нему том и
  монтирует его»: «его» after a «который» clause lands on the kind inside it.
- «новый PersistentVolumeClaim clone-1 ... подхватывает external-provisioner», «external-provisioner
  подхватывает новый PersistentVolumeClaim clone-1»: undeclined Latin on both sides of the verb
  reads subject first.
- «Раз он Bound» after «...в своём StorageClass rbd-retain», «Теперь, когда clone-1 Bound»: the
  pronoun takes the last masculine kind.
- «а от роста CSI позволяет», «а CSI позволяет драйверу от роста отказаться»: a noun before an
  undeclined token reads as a genitive.
- «finalizer защиты клонирования», «finalizer cloning-protection»: a finalizer name is a token.
- «VolumeSnapshot не создаётся», «Объект VolumeSnapshot не создаётся»: the record rules out "no
  snapshot", so "object" stays.
- «использует ли PVC ещё какой-нибудь Pod», «использует ли ещё какой-нибудь Pod этот PVC»:
  undeclined Latin on both sides of the verb reads subject first, so the PVC seemed to use the Pod.
- «на этом удаление и заканчивается», «удаление этим и ограничивается»: "that is all a delete does"
  limits the delete, and «заканчивается» reads as the delete completing.
- «показывает его в Used By» after «...который всё ещё на него ссылается», «показывает этот Pod»:
  the pronoun takes the PVC from the clause before, not the Pod object.
- «команда kubectl вот-вот вернётся», «вот-вот завершится»: "returns" for a command is its exit, and
  «вернётся» reads as "comes back".
- «его пустой том появляется после Pod», «пустой том нового PVC появляется после Pod»: «его» after
  «раньше Pod» points to the Pod, while the English "its" is the fresh claim.
- «у каждого из них значение Retain», «у каждого поля значение Retain»: «них» after a list ending on
  undeclined PVC reaches the claims, which on a storage card can carry Retain too.
- «когда Pod уходит, сборщик мусора удаляет», «когда Pod уйдёт, ... удалит»: "once the Pod is gone"
  is a completed exit.
- «При Retain он ничего не вызывает» after «..., а PV удаляется.», «При Retain провизионер ничего не
  вызывает»: the pronoun after a sentence that ends on PV points to the PV.
- «и ничто в кластере само его больше не тронет» after «claimRef на PVC, которого больше нет», «и
  этот том ничто в кластере само больше не тронет»: «его» after a clause on PVC points to the PVC.
- «а при Delete PV, удалённый раньше», «а PV с политикой Delete, удалённый раньше»: a policy value
  before an undeclined kind reads as one compound (confirms the externalTrafficPolicy Local Node
  line).
- «каталог Node /mnt», «каталог /mnt с Node»: a path right after undeclined Node reads as the Node's
  name.
- «поддержка в CRI и среде выполнения OCI», «в средах выполнения CRI и OCI»: the English means two
  runtimes, and a bare CRI reads as the interface.
- «API Server принимает это поле» after «а mountPropagation не задают», «принимает поле
  recursiveReadOnly»: «это поле» reaches the nearest field.
- «единственный признак этого на Pod это status», «на Pod об этом говорит лишь поле status»: avoid
  the double «это».
- «держит файл v1, который всё ещё держит его bind mount», «файл v1, всё ещё удерживаемый его bind
  mount»: undeclined Latin after «который» can read as the object, so the file seemed to hold the
  mount.
- «хотя его каталог удалён, поэтому proxy получает v1», «... удалён. Поэтому proxy получает v1»: a
  «поэтому» after a «хотя» clause takes that clause as the cause.
- «Proxy тоже читает», «Контейнер proxy тоже читает»: a sentence that would open on a lowercase
  on-diagram name takes a noun first.
- «слот держит VolumeAttachment», «слот занят VolumeAttachment»: an inanimate noun with nominative =
  accusative before undeclined Latin reads as the subject, so the slot seemed to hold the object.
- «которые ни один из них не использует» after «тома её Pod плюс любые VolumeAttachment», «которые
  не использует ни один её Pod»: «из них» after three plural nouns can take any of them, name the
  Pods.
- «фильтр Scheduler NodeVolumeLimits», «фильтр NodeVolumeLimits в Scheduler»: two bare tokens side
  by side read as one name.
- «доступны ноль из трёх Node», «доступно ноль из трёх Node»: with «ноль» the verb goes neuter
  singular.
- «пока у Node в zone-a не освободится место», «не появится место»: "has room" also covers a Node
  that joins later, while «освободится» only frees space on an existing one.
- «с новым классом WaitForFirstConsumer», «с новым классом в режиме WaitForFirstConsumer»: the value
  is volumeBindingMode, not the class name.
- «и привязки тома по умолчанию ждут до 600s», «Планирование ... ждёт привязки тома»: the genitive
  «привязки» reads as a plural subject, and the actor is lost.
- «так что без такого Pod она ждёт» after «на Node, где Pod ...», «работа ждёт»: a feminine pronoun
  after a clause about a Node points to the Node.
- «сжать файловую систему», «уменьшить файловую систему»: for a filesystem «сжать» reads as
  compression.
- «Этот шаг драйвер может пропустить», «драйвер может пропустить этот шаг»: two inanimate masculine
  nouns read subject first.
- «ёмкость PV следует за ним», «следует за устройством»: a pronoun right after undeclined PV points
  to the PV.
- «Его полоса начинается» after «...до старта любого контейнера», «Полоса тома начинается»: the
  pronoun points to the container.
- «запись volumeMounts монтирует cache в /work, там он пишет», «seed монтирует cache в /work, пишет
  туда»: «он» after an undeclined masculine token reads as that token.
- «а не какому-то контейнеру», «а не какому-либо контейнеру»: "not to any" is no container at all.
- «Кому же он принадлежит?» after «...контейнеры Pod.», «Кому же принадлежит файл?»: a pronoun after
  a kind.
- «связывает их один к одному» after «создаёт VolumeSnapshotContent», «создаёт для snap-1
  VolumeSnapshotContent ... и связывает их»: "the two" needs both objects in the sentence, and «к
  нему» after «уровня кластера» lands on the cluster.
- «снимок становится замороженной картой», «то есть снимок это замороженная карта»: an explanatory
  colon is «то есть», and "is" is not "becomes".
- «Поэтому он и бывает готов» after «включая C v2», «Поэтому снимок и бывает готов»: the pronoun
  takes the last masculine token.
- «Живой том читает C v3», «показывает C v3»: "reads" of a state is "shows", «читает» makes the
  volume the reader.
- «Все три kind», «Все три вида объектов»: the site term for kinds.
- «snap-1 и его content ... называют данные», «ссылаются на данные»: "naming" is a reference,
  «называть» a calque.
- «VolumeAttachment csi-7f3a записывает контроллер», «контроллер ... записывает VolumeAttachment
  csi-7f3a»: an undeclined object before the verb and an inanimate masculine subject after it read
  subject-first.
- «и записывает это не Kubelet», «а Kubelet ... это не записывает»: "does not record" keeps its
  negation on the verb, and moving it to the actor claims someone else records it.
- «решает, что тому CSI нужно подключение», «что том CSI нужно подключить»: «тому» also reads as the
  dative of «тот».
- «создаёт PVC или берёт существующий, а затем его Pod», «..., а затем создаёт Pod с этим номером»:
  an ellipsis after two verbs borrows the nearer one («берёт»), and «его» lands on the PVC.
- «и никогда к PV web-1», «но никогда не к PV web-1»: an ellipsis drops the «не» that «никогда»
  needs (confirms the «никогда адрес Pod» line).
- «две реплики никогда не делят диск», «никакие две реплики не делят один диск»: "no two" is a
  universal, and «никогда» adds a time word.
- «уменьшение числа реплик по умолчанию оставляет», «по умолчанию уменьшение числа реплик
  оставляет»: after «числа реплик», «по умолчанию» reads as "the default replica count".
- «задерживает все последующие», «стопорит все последующие»: "stalls" is a halt, and «задерживает»
  only delays.
- «слой контейнера, и он уходит, когда удаляют контейнер», «и слой уходит, когда удаляют этот
  контейнер»: «он» reaches the nearest masculine noun, the container.
- «живёт ровно столько, сколько диск», «живёт лишь столько»: "only as long as" is a bound, and
  «ровно» says "exactly".
- «записываемый слой его контейнера» after «ни один том», «слой контейнера приложения»: «его»
  reaches the last masculine noun.
- «объект API, который API Server хранит», «объект API, хранимый API Server»: confirms the
  «эндпоинт, уже убранный API Server» line.

- «пишете в один Deployment», «пишете в общий Deployment»: "the same" is a shared object, «один» reads as "a single one".
- «даже среди упавших», «даже среди сбойных»: a failed Pod did not crash.
- «пропавшего Pod», «недостающего Pod»: "missing" is absent, «пропавший» claims it existed and vanished.
- «Как выбирают эту Node среди прочих», «среди остальных»: «среди прочих» also reads as the idiom "among other things".
- «не перегружая его» after «о каждом изменении», «не перегружая API»: «его» lands on «изменение».
- «Вы запускаете три копии контроллера», «Вы держите три копии»: "run" is a standing state.
- «не меняется, даже когда один из них падает», «остаётся прежним, когда»: «даже» adds a concession the English "when" lacks.
- «кластер продолжает принимать записи как ни в чём не бывало», «вскоре кластер снова принимает записи, как и прежде»: writes queue during a Leader election, "soon goes on" admits the gap.
- «ничего не меняет», «ничего не останавливает»: the delete removes the API object, what it leaves alone is the running container.
- «всё равно в Pending», «остаётся в Pending»: a status with no verb is clipped jargon.
- «Что с ним делает ядро» after «...перезапуск в кластере...», «Что ядро делает с контейнером»: the pronoun lands on the last masculine noun.
- «Node велят выключиться», «Node велено выключиться»: an undeclined singular kind before a plural impersonal verb reads as its subject.
- «сама по себе ... лишь одна из них» after «видах неполадок», «сам по себе ... лишь один из них»: «них» goes back to «видов», masculine.
- «и никто их не заменяет», «и на смену им ничего не приходит»: "nothing replaces" is not «никто».
- «тихо теряет трафик», «тихо лишается трафика»: «терять трафик» is packet loss, the doc says the Pod stops receiving traffic.
- «и что всё ещё может помешать», «и что всё же может помешать»: "still" here is the concession "even so", not a time-state word.
- «Что его удерживает» after «...Scheduler ни разу не пытался его разместить», «Что удерживает Pod»: the pronoun can reach the last masculine kind, the Scheduler.
- «благодаря чему Scheduler сделает первую попытку», «что позволит Scheduler сделать первую попытку»: "lets" is a permission, «благодаря чему ... сделает» is a cause plus a promise.
- «когда его задают» for the QoS class, «когда его ставят»: «задавать» is a user writing the spec, the class is set at creation.
- «где работать его Pod», «где работают его Pod»: "where its Pods run" is indicative, the infinitive reads stilted.
- «к общему Gateway другой команды, а её запросы», «а запросы»: «её» lands on «другой команды», the nearest feminine noun.
- «а часть из них заканчивается таймаутом» after «запросы DNS из Pod ... на секунды», «а часть запросов»: «них» after several plural nouns can take Pod or «секунды».
- «Кто решает, сколько их запускать», «сколько их должно работать»: "how many to run" is a standing state.
- «когда бы Job сдалась», «когда Job сдалась бы»: «когда бы» at the head of a clause reads as the archaic «если бы».
- «Контейнер в работающем Pod завершается, и иногда он возвращается», «завершается и иногда возвращается»: «он» after an undeclined Pod points to the Pod.
- «что придёт ему на смену» after «Pod, которым владеет контроллер», «на смену Pod»: «ему» reaches the nearest masculine noun, «контроллер».
- «Кто его выбирает» after «...не занятый другими Service», «Кто выбирает этот IP»: the pronoun points to the last masculine kind, not to the IP.
- «где-то в Node его получателем становится настоящий Pod», «где-то в Node получателем становится»: «его» skips the feminine Node and lands on the Pod.
- «почему последующие пакеты минуют NAT», «минуют правила NAT»: later packets are still translated, only the rules are skipped.
- «Какой нужен вашей нагрузке», «Какой нужен рабочей нагрузке»: a bare «нагрузка» reads as traffic load (glossary workload).
- «на время не отвечает никто», «какое-то время ответа нет»: "nothing serves" is not «никто».
- «Сколько их может быть лишними», «Сколько может быть лишних ... Pod»: after «сколько» the genitive, not the instrumental.
- «Какой компонент держит его» with статус and kubectl in the sentence, «держит Pod»: «его» lands on the nearest masculine noun.
- «запрос к нему не оборвётся» after «Pod за Service», «запрос к Pod не оборвётся»: the pronoun lands on the last masculine kind.
- «узнаёт, где он» after «маршрутизатор», «где адрес»: «он» takes the nearest masculine noun.
- «вести его сразу в Pod» after «потерять адрес клиента», «вести трафик»: the pronoun lands on the address.
- «Что принимает трафик, как обычно выбирает Pod», «как оно обычно выбирает Pod»: without a subject, «как обычно» reads as the idiom "as usual".
- «балансировщик перед Node» after «на другой Node», «балансировщик нагрузки на входе»: a bare singular kind repeated after «другой Node» reads as that one Node.
- «на адресе своего узла», «на адресе своей Node»: when the card draws a Node box and its steps say Node, the desc follows them.
- «есть адрес, а второму его концу», «а второму концу»: «его» after «адрес» points at the address.
- «кто разбирает всё это», «кто разбирает всё»: avoid a doubled «всё это» in one question.
- «Pod вытесняют из-за нехватки диска», «Pod вытеснен из-за нехватки диска»: an undeclined singular kind before a plural impersonal verb reads as its subject.
- «Что в таком случае защищает этот режим», «Что этот режим в таком случае защищает»: «что» and an inanimate masculine noun share nominative and accusative, the subject goes first.
- «из нескольких свободных томов кластера к нему», «к PVC»: «нему» lands on the nearest masculine noun, «кластера».
- «Что должно произойти, чтобы появилось», «прежде чем появится»: "before" is an order, «чтобы» turns it into a purpose.
- «не упираясь в свой лимит диска», «вне собственного лимита диска»: "unchecked by" means the limit does not count the usage, «не упираться» reads as usage staying under it.
- «даже до истечения его срока», «даже до истечения срока»: a non-reflexive «его» cannot point to the clause subject (the token), so it lands on Pod.
- «ни разу не застаёт недописанный файл, и никто его не перезапускает», «и никто приложение не перезапускает»: «его» lands on the nearest masculine noun, the file.
- «как оставленный том», «как сохранённый том»: "retained" is kept under Retain, «оставленный» reads as "abandoned".
- «Откуда кластер знает», «Где кластер узнаёт»: "Where does it learn" is a lookup the cluster does, «знает» is a state.
- «что в итоге его завершает» after «как Kubelet узнаёт о его готовности», «как Kubelet узнаёт, что оно готово, и что в итоге его завершает»: the neuter «оно» fixes the attachment as the antecedent.
- «В какой предел он упёрся» after «свободных CPU и памяти», «упёрся Pod»: «он» lands on undeclined CPU, the nearest masculine noun.
- «полно свободных CPU», «свободного CPU»: CPU as a resource is singular, the plural reads as cores.
- «что найдёт реплика, когда число реплик снова растёт», «вырастет»: the «когда» clause follows the future tense of the main verb.
- «уходит ли с ними сам диск» after «число реплик», «уходит ли и сам диск»: «ними» lands on the nearest plural, the replicas.
- «при уменьшении StatefulSet», «при сокращении реплик»: "scale down" is a replica count, the bare kind reads as the object shrinking.
Add a line here after every audit that reverts or confirms a rewording.

## 5. Glossary

- logs = журнальные сообщения (never «логи»), log file = файл журнала, access logs = журналы доступа
- specific = заданный (never «конкретный»), recent = Последние, stream / follow = «Следить за...»
- workload(s) = рабочая нагрузка / рабочие нагрузки, usage = потребление, health = состояние
- stuck = зависший, shell = оболочка, values = значения, hooks = хуки, notes = заметки
- controller = контроллер, reconcile = сверять / приводить к желаемому состоянию
- desired state = желаемое состояние, observed / actual state = фактическое состояние
- schedule = планировать / разместить, scheduling = планирование, the Scheduler = Scheduler
- evict = вытеснить, eviction = вытеснение, mount = смонтировать, volume = том
- phase (Pod, PV, PVC: `status.phase`) = статус («статус Running», «конечный статус», «в статусе
  Released»), never «фаза». A phase of a process (admission, expansion, init) = этап
- claim: in storage cards «PVC», elsewhere `claim` as the field
- provision = выделить (динамически выделить том), provisioner = провизионер
- Endpoints objects = эндпоинты, a server address = адрес
- rollout = rollout, rolling update = поэтапное обновление, ready = готов / Ready (the condition)
- container runtime = среда выполнения контейнеров, short «среда выполнения»
- request (HTTP or API) = запрос, requests / limits (resources) = requests / limits
- packet = пакет, connection = соединение, lookup = поиск / DNS-запрос
- virtual cable (a veth pair) = «виртуальный канал» or «пара veth», never «кабель»: the owner reads
  the literal «виртуальный кабель» as a dumb calque. Not «соединение» either, that word is a TCP
  connection on the network cards
- a metaphorical gate = «барьер», the field stays `schedulingGates`
- API Server and Control Plane capitalised; "the API" alone = «API»
- attach / detach controller = контроллер attach и detach, sandbox = sandbox, reclaim policy =
  reclaim policy
- /cli/: describe = «Полное описание», details = «Подробности», renew = Продлить, disable =
  Отключить, multi-node = «с несколькими Node»

## 6. Shapes

- **Card `desc`:** one or more sentences of a situation a reader would meet, then the question the
  card answers («Где обрывается цепочка?»). The situation may name the actors and objects (the
  controller, the conditions) so the reader knows who and what, and mirrors the English sentence for
  sentence. Kinds named in the English stay. The answer is in the steps.
  It must stand on its own for a reader who sees only the title and the desc: name the options the
  card compares (the two fields, the three probes), set up a term before the question uses it, no
  «туда», «каждый из них» or «они» without an antecedent in the desc. Length: 4 lines at 1920, at
  most 5 at 1600 and 1536, at most 6 at 1440 (`fit.mjs --widths=1920,1600,1536,1440`), so no grid
  row shows two empty lines beside a taller neighbour.
- **Narration:** short, spoken, the pace of the English. On-diagram labels verbatim, because the
  reader sees them in English on the picture.
- **aria:** one sentence describing the whole picture.
- **/cli/:** a group paragraph is a noun phrase («Применение манифестов...»), a command line an
  infinitive («Показать Pod во всех Namespace»). Lines in sections named "(Debug Tools)" are the
  owner's own wording: change them only for a real error.
