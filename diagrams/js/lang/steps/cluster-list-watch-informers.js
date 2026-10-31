// Russian for cluster-list-watch-informers: its aria sentence, then its narration in step order, keyed by the English
// in the card module. Loaded by dialog.js only while Russian is on (S-58).
export const RU = {
  "How a controller stays in step with the API server, over the list-watch cycle. A client-go Client, the API, an Informer, an Indexer and ETCD stand around a group-version-resource catalogue and a row of watch events. The controller lists once, then holds one watch open for later changes, re-listing when history is compacted past the resourceVersion it knows.":
    "Как контроллер не отстаёт от API Server благодаря циклу list-watch. Client из client-go, API, Informer, Indexer и ETCD стоят вокруг каталога group-version-resource и ряда событий watch. Контроллер делает list один раз, а затем держит открытым один watch для последующих изменений и повторяет list, когда история уплотнена дальше resourceVersion, известного контроллеру.",

  "The controller first asks the API what it can talk to. GET /api and GET /apis return the discovery document, the catalogue of every group, version and resource the informer can list and watch.":
    "Сначала контроллер спрашивает у API, с чем может работать. GET /api и GET /apis возвращают discovery-документ, каталог всех групп, версий и ресурсов, для которых informer может делать list и watch.",

  "The informer fires the initial LIST at resourceVersion 0. The API keeps its watch cache filled from ETCD and answers the list straight from it, with no quorum read, so the full set lands in the Indexer at rv=842 and the controller reconciles from local memory.":
    "Informer отправляет начальный LIST с resourceVersion 0. API постоянно наполняет свой watch cache из ETCD и отвечает на list прямо из него, без кворумного чтения, поэтому весь набор попадает в Indexer на rv=842, а контроллер сверяет состояние по локальной памяти.",

  "The informer opens GET /api/v1/pods?watch=true&resourceVersion=842. The API streams every change since that RV as a chunked HTTP response. The connection stays open until its timeout, then the informer reopens it.":
    "Informer открывает GET /api/v1/pods?watch=true&resourceVersion=842. API потоком шлёт каждое изменение с этого RV в виде chunked HTTP-ответа. Соединение остаётся открытым до истечения таймаута, после чего informer открывает соединение заново.",

  "A new Pod lands in ETCD. The API pushes an ADDED event over the open watch (rv=843). The informer queues the event in order and writes it to the Indexer cache.":
    "В ETCD появляется новый Pod. API отправляет событие ADDED по открытому watch (rv=843). Informer ставит событие в очередь по порядку и записывает его в кеш Indexer.",

  "If the API has compacted history past the resourceVersion the informer holds, the next watch chunk returns HTTP 410 Gone. Then the informer drops its watch, re-LISTs to a fresh resourceVersion, and resumes the watch.":
    "Если API уплотнил историю дальше того resourceVersion, что есть у informer, следующий фрагмент watch вернёт HTTP 410 Gone. Тогда informer закрывает свой watch, делает re-LIST, получая свежий resourceVersion, и возобновляет watch.",

  "CRDs add their own group and version (example.com/v1). The API serves them under /apis like built-ins, and informers list and watch them the same way. Since 1.35 client-go opens that watch with the initial list on it, falling back to the LIST drawn here.":
    "CRD добавляют свою группу и версию (example.com/v1). API отдаёт эти ресурсы под /apis, как и встроенные, и informer делает для них list и watch тем же способом. С версии 1.35 client-go открывает этот watch сразу с начальным списком, а нарисованный здесь LIST остаётся запасным путём.",
};
