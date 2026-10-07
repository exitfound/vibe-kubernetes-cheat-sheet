## workloads-cronjob

### layout

```
WHAT     A schedule drawn as a time axis, where every tick either produced one Job or stayed empty
         for a named reason.
DEVIATES WL.L-06: no LAYOUT preset. Two bands, a run row over a time axis, with neither a ladder
         nor a flanking chip column.
         WL.A-03: no Node frame. The slots are ticks and not places, so a frame around the row
         would say the runs share a Node, which a CronJob does not promise.
         M-12: `next` departs evenly at 450 apart and lets the arrivals fall uneven. The departure
         is the tick, and equal flights would need an explicit dur.
         M-19a: the three mute steps stand about 70 percent still. That is reading time for the
         longest narrations, and no ball may travel when no Job is created (M-10).
         L-08: the deepest step clears the bus by 22.8, less than a line, so no string may grow one.
CONTENT  Sources: CronJob, CronJob v1 (v1.35), controller utils.go and cronjob_controllerv2.go.
         A repeated create collides on the name. The desc says `a Job`, never `one Job`.
         A Forbid skip can still start inside startingDeadlineSeconds. The 100-miss check runs
         `deadline or not`, then warns TooManyMissedTimes and still starts the latest tick.
         Resume starts only the latest missed tick. The doc says otherwise on both and is stale.
         Suspend records no Event, so the chip holds MissSchedule. Job suffixes are UTC minutes.
OPEN     CENTRE and CENTRE-LOW: the counted blocks centre on 444, while the axis, cells and strip
         span 60..1140. Balancing reorders the story or draws empty ticks as boxes that exist.
```
