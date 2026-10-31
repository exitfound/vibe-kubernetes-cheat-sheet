## workloads-cronjob

### layout

```
WHAT     A schedule drawn as a time axis, where every tick either produced one Job or stayed empty
         for a named reason.
DEVIATES WL.A-03: no Node frame. The slots are ticks and not places, so a frame around the row
         would say the runs share a Node, which a CronJob does not promise.
         M-12: `next` departs evenly at 450 apart and lets the arrivals fall uneven. The departure
         is the tick, and equal flights would need an explicit dur.
         M-19a: the three mute steps stand about 75 percent still. That is reading time for the
         longest narrations, and no ball may travel when no Job is created (M-10).
CONTENT  Sources: CronJob, CronJob v1 (v1.36), controller utils.go and cronjob_controllerv2.go.
         A repeated create collides on the name. Say `a Job`, never `one Job`. A Forbid
         skip can still start inside startingDeadlineSeconds. Past 100 misses, counted inside the
         deadline when set, it warns and still starts the latest tick, and resume starts only the
         latest tick: the doc says otherwise on both, the code rules. A tick past the deadline or
         suspended records no Event (MissSchedule cannot fire). Suffixes: epoch minutes, UTC.
OPEN     CENTRE and CENTRE-LOW: the counted blocks centre on 444, while the axis, cells and strip
         span 60..1140. Balancing reorders the story or draws empty ticks as boxes that exist.
```
