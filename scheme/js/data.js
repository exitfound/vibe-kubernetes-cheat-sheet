const ICON_NETWORK   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><line x1="8.5" y1="6" x2="15.5" y2="6"/><line x1="6" y1="8.5" x2="6" y2="15.5"/><line x1="8.5" y1="18" x2="15.5" y2="18"/><line x1="18" y1="8.5" x2="18" y2="15.5"/></svg>`;
const ICON_WORKLOADS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 3 21 8 12 13 3 8 12 3"/><polyline points="3 13 12 18 21 13"/></svg>`;
const ICON_STORAGE   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="2.5"/><path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5"/><path d="M4 11v8c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-8"/></svg>`;
const ICON_CONTROL   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/></svg>`;
const ICON_SCALING   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>`;
const ICON_SECURITY  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z"/></svg>`;
const ICON_LIFECYCLE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`;

export const CATEGORIES = [
  { key: 'all',       label: 'All' },
  { key: 'control',   label: 'Cluster',       sub: 'Cluster internals', icon: ICON_CONTROL },
  { key: 'network',   label: 'Networking',    sub: 'Traffic flow',      icon: ICON_NETWORK },
  { key: 'workloads', label: 'Workloads',     sub: 'Pod lifecycle',     icon: ICON_WORKLOADS },
  { key: 'storage',   label: 'Storage',       sub: 'Volume flow',       icon: ICON_STORAGE },
  { key: 'scaling',   label: 'Scaling',       sub: 'Autoscale flow',    icon: ICON_SCALING },
  { key: 'security',  label: 'Security',      sub: 'Policy flow',       icon: ICON_SECURITY },
  { key: 'lifecycle', label: 'Lifecycle',     sub: 'State flow',        icon: ICON_LIFECYCLE },
];

export const CATEGORY_ICONS = {
  network:   ICON_NETWORK,
  workloads: ICON_WORKLOADS,
  storage:   ICON_STORAGE,
  control:   ICON_CONTROL,
  scaling:   ICON_SCALING,
  security:  ICON_SECURITY,
  lifecycle: ICON_LIFECYCLE,
};

export const CATEGORY_SUB = {
  network:   'Traffic flow',
  workloads: 'Pod lifecycle',
  storage:   'Volume flow',
  control:   'Cluster internals',
  scaling:   'Autoscale flow',
  security:  'Policy flow',
  lifecycle: 'State flow',
};

export const SCHEMES = [
  {
    id: 'network-pod-to-pod-same-node',
    title: 'Pod-to-Pod (same node)',
    category: 'network',
    desc: 'How a packet travels from Pod A to Pod B on the same node via the CNI bridge and veth pairs.',
    k8sVersion: '1.32',
    module: './schemes/network-pod-to-pod-same-node.js',
    sources: [
      { label: 'K8s docs: Networking', href: 'https://kubernetes.io/docs/concepts/cluster-administration/networking/' },
    ],
  },
  {
    id: 'service-cluster-ip',
    title: 'Service: ClusterIP routing',
    category: 'network',
    desc: 'Selector matches Pods to Endpoints, kube-proxy installs DNAT rules so traffic to ClusterIP lands on a backing Pod.',
    k8sVersion: '1.32',
    module: './schemes/service-cluster-ip.js',
    sources: [
      { label: 'K8s docs: Service', href: 'https://kubernetes.io/docs/concepts/services-networking/service/' },
    ],
  },
  {
    id: 'deployment-rolling-update',
    title: 'Deployment rolling update',
    category: 'workloads',
    desc: 'maxSurge and maxUnavailable in action: new ReplicaSet scales up while the old one drains, keeping the service alive.',
    k8sVersion: '1.32',
    module: './schemes/deployment-rolling-update.js',
    sources: [
      { label: 'K8s docs: Deployments', href: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' },
    ],
  },
  {
    id: 'volume-pvc-binding',
    title: 'PVC → PV binding',
    category: 'storage',
    desc: 'A PersistentVolumeClaim asks for storage, provisioner creates a PV, the binding controller pairs them, and kubelet mounts.',
    k8sVersion: '1.32',
    module: './schemes/volume-pvc-binding.js',
    sources: [
      { label: 'K8s docs: Persistent Volumes', href: 'https://kubernetes.io/docs/concepts/storage/persistent-volumes/' },
    ],
  },
  {
    id: 'control-plane-architecture',
    title: 'Control Plane Architecture',
    category: 'control',
    subcategory: 'control-plane',
    desc: 'Where each control-plane component lives and which arrows connect them. apiserver is the sole gateway, etcd is the only durable store, and controllers, scheduler and kubelet all talk through apiserver.',
    k8sVersion: '1.32',
    module: './schemes/control-plane-architecture.js',
    sources: [
      { label: 'K8s docs: Components', href: 'https://kubernetes.io/docs/concepts/overview/components/' },
      { label: 'K8s docs: Architecture', href: 'https://kubernetes.io/docs/concepts/architecture/' },
    ],
  },
  {
    id: 'control-etcd-raft',
    title: 'ETCD Raft Consensus',
    category: 'control',
    subcategory: 'control-plane',
    desc: 'Leader takes writes, replicates entries via AppendEntries RPC, commits when quorum acks (2 of 3), then broadcasts commitIndex so Followers can apply.',
    k8sVersion: '1.32',
    module: './schemes/control-etcd-raft.js',
    sources: [
      { label: 'Raft algorithm', href: 'https://raft.github.io/' },
      { label: 'Raft paper', href: 'https://raft.github.io/raft.pdf' },
    ],
  },
  {
    id: 'control-api-structure',
    title: 'List-Watch and Informers',
    category: 'control',
    subcategory: 'control-plane',
    desc: 'Groups, versions, and resources, how clients list-then-watch, and how informers turn that stream into a local cache that controllers reconcile against.',
    k8sVersion: '1.32',
    module: './schemes/control-api-structure.js',
    sources: [
      { label: 'K8s docs: API concepts', href: 'https://kubernetes.io/docs/reference/using-api/api-concepts/' },
      { label: 'K8s docs: Kubernetes API', href: 'https://kubernetes.io/docs/concepts/overview/kubernetes-api/' },
    ],
  },
  {
    id: 'control-plane-apply-flow',
    title: 'Kubectl Apply Flow',
    category: 'control',
    subcategory: 'control-plane',
    desc: 'How a single kubectl apply travels through the Control Plane: client → ApiServer → ETCD → ControllerManager → Scheduler → Kubelet.',
    k8sVersion: '1.32',
    module: './schemes/control-plane-apply-flow.js',
    sources: [
      { label: 'K8s docs: Architecture', href: 'https://kubernetes.io/docs/concepts/architecture/' },
    ],
  },
  {
    id: 'control-plane-delete-flow',
    title: 'Kubectl Delete Flow',
    category: 'control',
    subcategory: 'control-plane',
    desc: 'How a kubectl delete works on the control-plane side: ApiServer marks deletionTimestamp in ETCD, GarbageCollector cascades through ownerReferences, finalizers gate the actual purge.',
    k8sVersion: '1.32',
    module: './schemes/control-plane-delete-flow.js',
    sources: [
      { label: 'K8s docs: Garbage Collection', href: 'https://kubernetes.io/docs/concepts/architecture/garbage-collection/' },
      { label: 'K8s docs: Owners and Dependents', href: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/' },
      { label: 'K8s docs: Finalizers', href: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/' },
    ],
  },
  {
    id: 'control-admission-webhooks',
    title: 'Admission chain',
    category: 'control',
    subcategory: 'worker-nodes',
    desc: 'Six stages between an API request and etcd. Built-in stages always run, webhook stages run only when configurations exist.',
    k8sVersion: '1.32',
    module: './schemes/control-admission-webhooks.js',
    sources: [
      { label: 'K8s docs: Admission Controllers', href: 'https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/' },
    ],
  },
  {
    id: 'control-scheduler-decision',
    title: 'Scheduler filter and score',
    category: 'control',
    subcategory: 'worker-nodes',
    desc: 'Filter phase drops nodes that fail predicates (taints, resources, affinity), score phase ranks survivors, and the winner gets a Binding.',
    k8sVersion: '1.32',
    module: './schemes/control-scheduler-decision.js',
    sources: [
      { label: 'K8s docs: Scheduler', href: 'https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/' },
    ],
  },
  {
    id: 'control-leader-election',
    title: 'Leader election via Lease',
    category: 'control',
    subcategory: 'worker-nodes',
    desc: 'controller-manager replicas race to PUT a Lease. Holder renews it, and on crash the Lease expires and another replica takes over via CAS.',
    k8sVersion: '1.32',
    module: './schemes/control-leader-election.js',
    sources: [
      { label: 'K8s docs: Leader Election', href: 'https://kubernetes.io/docs/concepts/architecture/leases/' },
    ],
  },
  {
    id: 'control-node-failure',
    title: 'Node failure and pod eviction',
    category: 'control',
    subcategory: 'worker-nodes',
    desc: 'From missed Lease heartbeats to NotReady, taint-based eviction, and reschedule. The exact timers that decide how fast workloads recover.',
    k8sVersion: '1.32',
    module: './schemes/control-node-failure.js',
    sources: [
      { label: 'K8s docs: Node status', href: 'https://kubernetes.io/docs/concepts/architecture/nodes/#node-status' },
      { label: 'K8s docs: Node taints', href: 'https://kubernetes.io/docs/reference/labels-annotations-taints/#node-kubernetes-io-unreachable' },
    ],
  },
  {
    id: 'network-dns-coredns',
    title: 'DNS via CoreDNS',
    category: 'network',
    desc: 'Pod resolv.conf points at kube-dns, and the query lands on a CoreDNS pod where the plugin chain (cache, kubernetes) returns the Service ClusterIP.',
    k8sVersion: '1.32',
    module: './schemes/network-dns-coredns.js',
    sources: [
      { label: 'K8s docs: DNS for Services and Pods', href: 'https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/' },
    ],
  },
  {
    id: 'network-ingress-routing',
    title: 'Ingress controller routing',
    category: 'network',
    desc: 'External LB to Ingress controller pod, Host/path match against Ingress rules, then proxy to the backend Service and Pod.',
    k8sVersion: '1.32',
    module: './schemes/network-ingress-routing.js',
    sources: [
      { label: 'K8s docs: Ingress', href: 'https://kubernetes.io/docs/concepts/services-networking/ingress/' },
    ],
  },
  {
    id: 'network-kube-proxy-iptables',
    title: 'kube-proxy iptables chains',
    category: 'network',
    desc: 'Packet to a ClusterIP traverses KUBE-SERVICES → KUBE-SVC-XXX (random pick by probability) → KUBE-SEP-YYY (DNAT) before egress.',
    k8sVersion: '1.32',
    module: './schemes/network-kube-proxy-iptables.js',
    sources: [
      { label: 'K8s docs: kube-proxy', href: 'https://kubernetes.io/docs/reference/networking/virtual-ips/' },
    ],
  },
  {
    id: 'lifecycle-node-drain',
    title: 'Node drain',
    category: 'lifecycle',
    desc: 'kubectl drain cordons the node, then evicts Pods one by one (respecting PodDisruptionBudgets) while skipping DaemonSet pods.',
    k8sVersion: '1.32',
    module: './schemes/lifecycle-node-drain.js',
    sources: [
      { label: 'K8s docs: Safely Drain a Node', href: 'https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/' },
    ],
  },
  {
    id: 'lifecycle-probes',
    title: 'Startup, liveness, readiness probes',
    category: 'lifecycle',
    desc: 'startupProbe gates the others, livenessProbe restarts on failure, and readinessProbe toggles the Pod IP in Service Endpoints without a restart.',
    k8sVersion: '1.32',
    module: './schemes/lifecycle-probes.js',
    sources: [
      { label: 'K8s docs: Configure Liveness, Readiness and Startup Probes', href: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/' },
    ],
  },
  {
    id: 'scaling-hpa-cycle',
    title: 'HPA scale-up cycle',
    category: 'scaling',
    desc: 'metrics-server feeds HPA controller, which computes desired replicas with a stabilization window and PATCHes the Deployment scale subresource.',
    k8sVersion: '1.32',
    module: './schemes/scaling-hpa-cycle.js',
    sources: [
      { label: 'K8s docs: Horizontal Pod Autoscaling', href: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/' },
    ],
  },
  {
    id: 'workloads-statefulset-ordered-startup',
    title: 'StatefulSet ordered rollout',
    category: 'workloads',
    desc: 'Pods start one at a time in ordinal order. Each gets a stable hostname web-N.web and a sticky PVC data-web-N that survives reschedule.',
    k8sVersion: '1.32',
    module: './schemes/workloads-statefulset-ordered-startup.js',
    sources: [
      { label: 'K8s docs: StatefulSets', href: 'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/' },
    ],
  },
  {
    id: 'security-rbac-authorization',
    title: 'RBAC authorization',
    category: 'security',
    desc: 'Request → SubjectAccessReview walks RoleBindings + ClusterRoleBindings, the first matching rule decides, and the decision is audit-logged.',
    k8sVersion: '1.32',
    module: './schemes/security-rbac-authorization.js',
    sources: [
      { label: 'K8s docs: RBAC Authorization', href: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/' },
    ],
  },
  {
    id: 'security-networkpolicy-enforcement',
    title: 'NetworkPolicy enforcement',
    category: 'security',
    desc: 'CNI plugin compiles ingress/egress policies into per-Pod iptables or eBPF rules. Allowed sources pass, and everything else falls into default-deny.',
    k8sVersion: '1.32',
    module: './schemes/security-networkpolicy-enforcement.js',
    sources: [
      { label: 'K8s docs: Network Policies', href: 'https://kubernetes.io/docs/concepts/services-networking/network-policies/' },
    ],
  },
  {
    id: 'storage-csi-attach-mount',
    title: 'CSI attach and mount',
    category: 'storage',
    desc: 'external-attacher (ControllerPublish) gets the cloud disk to the node, then csi-node-driver does NodeStage and NodePublish to bind-mount into the Pod namespace.',
    k8sVersion: '1.32',
    module: './schemes/storage-csi-attach-mount.js',
    sources: [
      { label: 'CSI spec', href: 'https://github.com/container-storage-interface/spec/blob/master/spec.md' },
    ],
  },
  {
    id: 'workloads-config-injection',
    title: 'ConfigMap injection paths',
    category: 'workloads',
    desc: 'env-var injection happens at process start (immutable until restart). Volume-mount projection is live-updated by kubelet on rotate.',
    k8sVersion: '1.32',
    module: './schemes/workloads-config-injection.js',
    sources: [
      { label: 'K8s docs: ConfigMap', href: 'https://kubernetes.io/docs/concepts/configuration/configmap/' },
    ],
  },
  {
    id: 'scaling-cluster-autoscaler',
    title: 'Cluster Autoscaler adds a node',
    category: 'scaling',
    desc: 'Pending pod (Unschedulable) is the trigger. CA simulates the fit, calls cloud API to scale up the node group, kubelet on the new node registers, scheduler binds.',
    k8sVersion: '1.32',
    module: './schemes/scaling-cluster-autoscaler.js',
    sources: [
      { label: 'Cluster Autoscaler FAQ', href: 'https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md' },
    ],
  },
  {
    id: 'network-pod-to-pod-cross-node',
    title: 'Pod-to-Pod across nodes',
    category: 'network',
    desc: 'cni0 has no FDB entry for the remote Pod, so the CNI plugin wraps the frame in VXLAN/UDP. node-2\'s kernel decapsulates and delivers via local cni0.',
    k8sVersion: '1.32',
    module: './schemes/network-pod-to-pod-cross-node.js',
    sources: [
      { label: 'K8s docs: Cluster Networking', href: 'https://kubernetes.io/docs/concepts/cluster-administration/networking/' },
    ],
  },
  {
    id: 'lifecycle-graceful-shutdown',
    title: 'Graceful Pod shutdown',
    category: 'lifecycle',
    desc: 'DELETE removes the Pod from Endpoints and runs preStop in parallel, then SIGTERM, then a grace-period countdown, then SIGKILL if the container is still alive.',
    k8sVersion: '1.32',
    module: './schemes/lifecycle-graceful-shutdown.js',
    sources: [
      { label: 'K8s docs: Termination of Pods', href: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination' },
    ],
  },
  {
    id: 'network-externaltrafficpolicy',
    title: 'ExternalTrafficPolicy: Cluster vs Local',
    category: 'network',
    desc: 'Cluster mode forwards via SNAT (extra hop, src IP lost). Local mode preserves src IP but drops if no local backend pod is on the node hit by the LB.',
    k8sVersion: '1.32',
    module: './schemes/network-externaltrafficpolicy.js',
    sources: [
      { label: 'K8s docs: ExternalTrafficPolicy', href: 'https://kubernetes.io/docs/reference/networking/virtual-ips/#external-traffic-policy' },
    ],
  },
  {
    id: 'workloads-init-containers-and-sidecars',
    title: 'Init containers and native sidecars',
    category: 'workloads',
    desc: 'init containers run sequentially to completion. Native sidecar (1.29+ initContainer with restartPolicy=Always) starts before main and runs alongside it.',
    k8sVersion: '1.32',
    module: './schemes/workloads-init-containers-and-sidecars.js',
    sources: [
      { label: 'K8s docs: Sidecar Containers', href: 'https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/' },
    ],
  },
  {
    id: 'workloads-job-parallelism',
    title: 'Job parallelism and completions',
    category: 'workloads',
    desc: 'parallelism caps live workers, completions counts successful runs. On failure Job spawns a replacement, and condition Complete=true once succeeded == completions.',
    k8sVersion: '1.32',
    module: './schemes/workloads-job-parallelism.js',
    sources: [
      { label: 'K8s docs: Jobs', href: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/' },
    ],
  },
  {
    id: 'storage-volume-snapshot',
    title: 'VolumeSnapshot lifecycle',
    category: 'storage',
    desc: 'VolumeSnapshot CR triggers external-snapshotter, which calls driver CreateSnapshot. VolumeSnapshotContent binds, readyToUse flips true, and new PVCs can dataSource it.',
    k8sVersion: '1.32',
    module: './schemes/storage-volume-snapshot.js',
    sources: [
      { label: 'K8s docs: Volume Snapshots', href: 'https://kubernetes.io/docs/concepts/storage/volume-snapshots/' },
    ],
  },
  {
    id: 'storage-statefulset-pvc-stickiness',
    title: 'StatefulSet PVC stickiness',
    category: 'storage',
    desc: 'When a StatefulSet pod is evicted, its PVC stays. The replacement pod with the same ordinal reattaches the same PV and sees the previous on-disk state.',
    k8sVersion: '1.32',
    module: './schemes/storage-statefulset-pvc-stickiness.js',
    sources: [
      { label: 'K8s docs: StatefulSet basics', href: 'https://kubernetes.io/docs/tutorials/stateful-application/basic-stateful-set/' },
    ],
  },
  {
    id: 'storage-emptydir-vs-pv',
    title: 'emptyDir vs PV on reschedule',
    category: 'storage',
    desc: 'emptyDir tied to the Pod and its host tmpfs: gone on reschedule. PV outlives the Pod and reattaches on the new node, preserving data.',
    k8sVersion: '1.32',
    module: './schemes/storage-emptydir-vs-pv.js',
    sources: [
      { label: 'K8s docs: Volumes', href: 'https://kubernetes.io/docs/concepts/storage/volumes/' },
    ],
  },
  {
    id: 'scaling-vpa-recommend-vs-auto',
    title: 'VPA recommend vs auto',
    category: 'scaling',
    desc: 'recommender writes status.recommended from observed usage. In Auto mode the updater evicts pods, and the admission webhook injects new requests on the replacement.',
    k8sVersion: '1.32',
    module: './schemes/scaling-vpa-recommend-vs-auto.js',
    sources: [
      { label: 'VPA design', href: 'https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler' },
    ],
  },
  {
    id: 'scaling-pdb-during-eviction',
    title: 'PDB gates eviction',
    category: 'scaling',
    desc: 'Eviction API checks PodDisruptionBudget. If granting would breach minAvailable, the request returns 429 and drain has to wait for replacements to become Ready.',
    k8sVersion: '1.32',
    module: './schemes/scaling-pdb-during-eviction.js',
    sources: [
      { label: 'K8s docs: PodDisruptionBudget', href: 'https://kubernetes.io/docs/concepts/workloads/pods/disruptions/' },
    ],
  },
  {
    id: 'security-tls-bootstrap',
    title: 'Kubelet TLS bootstrap',
    category: 'security',
    desc: 'kubelet uses a bootstrap token to POST a CSR. csr-approver auto-approves, then csr-signer signs with the cluster CA. kubelet stores the cert and rotates it before expiry.',
    k8sVersion: '1.32',
    module: './schemes/security-tls-bootstrap.js',
    sources: [
      { label: 'K8s docs: TLS Bootstrapping', href: 'https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/' },
    ],
  },
  {
    id: 'security-serviceaccount-token-projection',
    title: 'ServiceAccount token projection',
    category: 'security',
    desc: 'kubelet calls TokenRequest API per Pod for an audience-bound, expiring JWT. Token is written via atomic symlink swap into the Pod\'s projected volume and rotated before expiry.',
    k8sVersion: '1.32',
    module: './schemes/security-serviceaccount-token-projection.js',
    sources: [
      { label: 'K8s docs: Service Account Tokens', href: 'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/' },
    ],
  },
  {
    id: 'lifecycle-pod-phase-machine',
    title: 'Pod phase state machine',
    category: 'lifecycle',
    desc: 'Pending → Running → (Succeeded | Failed). CrashLoopBackOff is a waiting reason inside Running with exponential backoff retries from kubelet.',
    k8sVersion: '1.32',
    module: './schemes/lifecycle-pod-phase-machine.js',
    sources: [
      { label: 'K8s docs: Pod Lifecycle', href: 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/' },
    ],
  },
];

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.key, c.label]));

export const SUBCATEGORIES = {
  control: [
    { key: 'control-plane', label: 'Control Plane' },
    { key: 'worker-nodes',  label: 'Worker Nodes'  },
  ],
};
