## workloads-job-parallelism

### layout

```
WHAT     A Job holds three workers running at once and fills a five slot completion ledger, and a
         run that fails fills nothing and spends a failure against a limit of six instead.
DEVIATES WL.A-03: no Node frame. The worker slots are the parallelism cap drawn as a length, and a
         frame around them would say a Job promises its Pods share a Node.
         M-12: all three creates fly for one fanTiming duration, the outer taps' own routeDur, with
         one trunk corner, so one ball rides the trunk and the wave lands on one beat. Registered in
         render/motion.test.mjs PACING.
CONTENT  Sources: Parallel execution for Jobs, Job v1 (v1.36), job_controller.go, backoff_utils.go.
         completions is 5: two waves with one failure close on five. `exceeding it marks the Job
         Failed`, never `reaching it`: the code tests failed > backoffLimit, `reaches` is OnFailure.
         A Succeeded Pod is never reused. SuccessCriteriaMet lands with Complete. Exits fall in one
         sync, which `fail` says (`At the same time`), so two waves hold and the back-off delays all
         three creations, counted since the last success. The cap is ten minutes, page and code.
```
