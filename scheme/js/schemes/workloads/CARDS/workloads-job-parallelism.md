## workloads-job-parallelism

### layout

```
WHAT     A Job holds three workers running at once and fills a five slot completion ledger, and a
         run that fails fills nothing and spends a failure against a limit of six instead.
DEVIATES WL.L-06: no LAYOUT preset and no value chip. An instrument panel of four bands, where every
         number the subject owns is a length and each caption reads its own array length.
         WL.A-03: no Node frame. The worker slots are the parallelism cap drawn as a length, and a
         frame around them would say a Job promises its Pods share a Node.
         M-12: all three creates fly for CREATE_DUR, the outer taps' own routeDur, so one wave lands
         on one beat. Registered in render/motion.test.mjs PACING.
CONTENT  Sources: Parallel execution for Jobs, Job v1 (v1.35), job_controller.go.
         completions is 5: two drawn waves with one failure close on five and leave no run undrawn.
         `exceeding it marks the Job Failed`, never `reaching it`: under Never the controller tests
         failed > backoffLimit, and the page sentence saying `reaches` is the OnFailure case.
         `fail` names restartPolicy Never. A Pod that HAS SUCCEEDED is never restarted or reused.
         Two waves hold because the exits fall in one sync. SuccessCriteriaMet lands with Complete.
```
