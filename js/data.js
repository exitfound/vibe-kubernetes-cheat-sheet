// ============================================================
//  K8s Cheat Sheet | data.js
// ============================================================

// ── Icons ────────────────────────────────────────────────────
const ICONS = {
  pod: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  deployment: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  service: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  namespace: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  config: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  volume: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  network: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  rbac: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  node: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
  'helm-releases': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="22" y2="12"/></svg>`,
  context: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  job: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  statefulset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="5" rx="1"/><rect x="2" y="10" width="20" height="5" rx="1"/><rect x="2" y="17" width="20" height="5" rx="1"/><line x1="6" y1="5.5" x2="6.01" y2="5.5"/><line x1="6" y1="12.5" x2="6.01" y2="12.5"/><line x1="6" y1="19.5" x2="6.01" y2="19.5"/></svg>`,
  daemonset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>`,
  'troubleshooting-cluster': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  'troubleshooting-network': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  'troubleshooting-storage': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>`,
  'troubleshooting-resources': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  'troubleshooting-scheduling': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  'cluster-health': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  'k9s-cli': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>`,
  'k9s-ui': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>`,
  'kustomize-manage': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>`,
  'kustomize-edit': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  'helm-charts': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  'troubleshooting-installation': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="12" y1="7" x2="12" y2="10"/><circle cx="12" cy="13" r="1" fill="currentColor" stroke="none"/></svg>`,
  'troubleshooting-k9s': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  'troubleshooting-kustomize': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="11.5" cy="14.5" r="2.5"/><polyline points="13.3 16.3 15 18"/></svg>`,
  'troubleshooting-helm': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
  kubeadm: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  k3s: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  k3d: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  kind: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 22v-4"/><path d="M17 22v-4"/><rect x="5" y="6" width="6" height="6" rx="1"/><rect x="13" y="6" width="6" height="6" rx="1"/><rect x="9" y="14" width="6" height="4" rx="1"/></svg>`,
  minikube: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`,
  crd: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><circle cx="5" cy="20" r="2"/><circle cx="19" cy="20" r="2"/><line x1="12" y1="6" x2="12" y2="13"/><polyline points="5 18 5 13 19 13 19 18"/></svg>`,
};

const COPY_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
const STAR_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const CONTACT_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const SPONSOR_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

// ── Data ──────────────────────────────────────────────────────
const SECTIONS = [
  // ── INSTALLATION — KUBEADM ──────────────────────────────────
  {
    id: 'install-kubeadm', title: 'Kubeadm', icon: ICONS.kubeadm, sub: 'Installation',
    groups: [
      {
        title: 'Install',
        desc: 'Install kubeadm, kubelet, and kubectl on each node. These steps are required before initializing or joining a cluster.',
        cmds: [
          { cmd: 'apt-get update && apt-get install -y apt-transport-https ca-certificates curl', desc: 'Install prerequisites on Debian/Ubuntu' },
          { cmd: 'curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.32/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg', desc: 'Add the Kubernetes apt repository signing key' },
          { cmd: 'echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.32/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list', desc: 'Add the Kubernetes apt repository' },
          { cmd: 'apt-get update && apt-get install -y kubelet kubeadm kubectl',  desc: 'Install kubelet, kubeadm, and kubectl' },
          { cmd: 'apt-mark hold kubelet kubeadm kubectl',                              desc: 'Prevent automatic upgrades of Kubernetes packages' },
          { cmd: 'systemctl enable --now kubelet',                                      desc: 'Enable and start the kubelet service' },
        ]
      },
      {
        title: 'Manage',
        desc: 'Initialize the control plane, join worker nodes, tear down clusters, and manage the upgrade lifecycle.',
        cmds: [
          { cmd: 'kubeadm init --pod-network-cidr=<cidr>',                            desc: 'Initialize the control plane with a pod network CIDR' },
          { cmd: 'kubeadm init --control-plane-endpoint=<endpoint>',                  desc: 'Initialize with a shared load-balancer endpoint (HA)' },
          { cmd: 'kubeadm init --kubernetes-version=<version>',                       desc: 'Initialize with a specific Kubernetes version' },
          { cmd: 'kubeadm init --cri-socket /run/containerd/containerd.sock',         desc: 'Initialize with a specific CRI socket' },
          { cmd: 'kubeadm token create --print-join-command',                               desc: 'Generate a new join command for worker nodes' },
          { cmd: 'kubeadm join <control-plane-endpoint> --token <token> --discovery-token-ca-cert-hash sha256:<hash>', desc: 'Join a worker node to the cluster' },
          { cmd: 'kubeadm join <control-plane-endpoint> --token <token> --discovery-token-ca-cert-hash sha256:<hash> --control-plane --certificate-key <key>', desc: 'Join a secondary control plane node (HA)' },
          { cmd: 'kubeadm reset',                                                      desc: 'Revert changes made by init or join on this node' },
          { cmd: 'kubeadm reset --force',                                              desc: 'Force reset without confirmation prompts' },
          { cmd: 'kubeadm upgrade plan',                                               desc: 'Check which versions are available to upgrade to' },
          { cmd: 'kubeadm upgrade apply v<version>',                                   desc: 'Upgrade the control plane to a new version' },
          { cmd: 'kubeadm upgrade node',                                               desc: 'Upgrade a worker or secondary control plane node' },
        ]
      },
      {
        title: 'Configure',
        desc: 'Upload configs, manage certificates, and generate kubeconfig files for cluster access.',
        cmds: [
          { cmd: 'mkdir -p $HOME/.kube && cp /etc/kubernetes/admin.conf $HOME/.kube/config && chown $(id -u):$(id -g) $HOME/.kube/config', desc: 'Set up kubeconfig for the admin user after init' },
          { cmd: 'kubeadm init phase upload-config kubeadm',                                desc: 'Upload the kubeadm configuration to the cluster ConfigMap' },
          { cmd: 'kubeadm config print init-defaults',                                      desc: 'Print default init configuration YAML' },
          { cmd: 'kubeadm config print join-defaults',                                      desc: 'Print default join configuration YAML' },
          { cmd: 'kubeadm certs certificate-key',                                      desc: 'Generate a certificate key for HA control plane join' },
          { cmd: 'kubeadm certs renew all',                                            desc: 'Renew all control plane certificates' },
          { cmd: 'kubeadm certs check-expiration',                                     desc: 'Check certificate expiration dates' },
          { cmd: 'kubeadm init phase upload-certs --upload-certs',                     desc: 'Upload control plane certificates to the cluster for HA join' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'View tokens, node statuses, and cluster configuration details.',
        cmds: [
          { cmd: 'kubeadm token list',                                                      desc: 'List all bootstrap tokens' },
          { cmd: 'kubectl get cm kubeadm-config -n kube-system -o yaml',                    desc: 'View the kubeadm configuration stored in the cluster' },
        ]
      },
    ]
  },

  // ── INSTALLATION — K3S ──────────────────────────────────────
  {
    id: 'install-k3s', title: 'k3s', icon: ICONS.k3s, sub: 'Installation',
    groups: [
      {
        title: 'Install',
        desc: 'Install k3s as a single binary. The server (control plane) and agent (worker) modes are selected via subcommands.',
        cmds: [
          { cmd: 'curl -sfL https://get.k3s.io | sh -',                                      desc: 'Install k3s server (control plane + worker)' },
          { cmd: 'curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION=<version> sh -',       desc: 'Install a specific k3s version' },
          { cmd: 'curl -sfL https://get.k3s.io | K3S_URL=https://<server>:6443 K3S_TOKEN=<token> sh -', desc: 'Install k3s agent and join an existing server' },
          { cmd: 'curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --cluster-init" sh -', desc: 'Install server in HA mode with embedded etcd' },
          { cmd: 'curl -sfL https://get.k3s.io | INSTALL_K3S_SKIP_START=true sh -',         desc: 'Install binary without starting the service' },
          { cmd: 'brew install k3s',                                                          desc: 'Install k3s via Homebrew (macOS/Linux)' },
        ]
      },
      {
        title: 'Manage',
        desc: 'Start, stop, and remove k3s services. Access the embedded kubectl and manage server/agent lifecycle.',
        cmds: [
          { cmd: 'systemctl start k3s',                                                 desc: 'Start the k3s server service' },
          { cmd: 'systemctl stop k3s',                                                  desc: 'Stop the k3s server service' },
          { cmd: 'systemctl restart k3s',                                               desc: 'Restart the k3s server service' },
          { cmd: 'systemctl enable k3s',                                                desc: 'Enable k3s to start on boot' },
          { cmd: 'systemctl disable k3s',                                               desc: 'Disable k3s from starting on boot' },
          { cmd: '/usr/local/bin/k3s kubectl get nodes',                                     desc: 'Use the embedded kubectl binary' },
          { cmd: 'k3s server --disable traefik',                                        desc: 'Start server with specific components disabled' },
          { cmd: 'k3s server --disable-agent',                                          desc: 'Run as control plane only (no workloads on this node)' },
          { cmd: '/usr/local/bin/k3s-uninstall.sh',                                          desc: 'Uninstall k3s server and all data' },
          { cmd: '/usr/local/bin/k3s-agent-uninstall.sh',                                    desc: 'Uninstall k3s agent' },
        ]
      },
      {
        title: 'Configure',
        desc: 'Access kubeconfig, retrieve the node token, and configure k3s via environment variables and config files.',
        cmds: [
          { cmd: 'cat /etc/rancher/k3s/k3s.yaml',                                      desc: 'Print the kubeconfig file' },
          { cmd: 'mkdir -p $HOME/.kube && cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config && chown $(id -u):$(id -g) $HOME/.kube/config', desc: 'Copy kubeconfig for kubectl access' },
          { cmd: 'cat /var/lib/rancher/k3s/server/node-token',                          desc: 'Print the node token (needed for agent join)' },
          { cmd: 'cat /etc/rancher/k3s/config.yaml',                                   desc: 'View the k3s server config file' },
          { cmd: 'curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --write-kubeconfig-mode 644" sh -', desc: 'Install with world-readable kubeconfig' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'Check k3s version, service status, and running processes.',
        cmds: [
          { cmd: 'k3s --version',                                                            desc: 'Print k3s version' },
          { cmd: 'systemctl status k3s',                                                desc: 'Check k3s server service status' },
          { cmd: 'journalctl -u k3s -f',                                               desc: 'Follow k3s server logs' },
          { cmd: 'journalctl -u k3s-agent -f',                                         desc: 'Follow k3s agent logs' },
        ]
      },
    ]
  },

  // ── INSTALLATION — K3D ──────────────────────────────────────
  {
    id: 'install-k3d', title: 'k3d', icon: ICONS.k3d, sub: 'Installation',
    groups: [
      {
        title: 'Install',
        desc: 'Install k3d, a lightweight wrapper that runs k3s clusters in Docker containers.',
        cmds: [
          { cmd: 'brew install k3d',                                                          desc: 'Install k3d via Homebrew' },
          { cmd: 'curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash', desc: 'Install k3d via official script' },
          { cmd: 'k3d version',                                                              desc: 'Print k3d version' },
        ]
      },
      {
        title: 'Manage',
        desc: 'Create, start, stop, and delete lightweight Kubernetes clusters using k3d.',
        cmds: [
          { cmd: 'k3d cluster create <name>',                                                 desc: 'Create a k3d cluster' },
          { cmd: 'k3d cluster create <name> --agents <n>',                                    desc: 'Create a multi-agent cluster' },
          { cmd: 'k3d cluster create <name> --servers <n>',                                   desc: 'Create a multi-server (HA) cluster' },
          { cmd: 'k3d cluster create <name> -p "8081:80@loadbalancer"',                       desc: 'Create cluster with port mapping' },
          { cmd: 'k3d cluster create <name> --registry-create <registry-name>',               desc: 'Create cluster with a local registry' },
          { cmd: 'k3d cluster create <name> --k3s-arg "--disable=traefik@server:0"',          desc: 'Create cluster with custom k3s args' },
          { cmd: 'k3d cluster create <name> --image <image>',                                 desc: 'Create with a specific k3s image' },
          { cmd: 'k3d cluster delete <name>',                                                 desc: 'Delete a k3d cluster' },
          { cmd: 'k3d cluster delete --all',                                                  desc: 'Delete all k3d clusters' },
          { cmd: 'k3d cluster start <name>',                                                  desc: 'Start a stopped k3d cluster' },
          { cmd: 'k3d cluster stop <name>',                                                   desc: 'Stop a running k3d cluster' },
        ]
      },
      {
        title: 'Nodes & Registries',
        desc: 'Manage individual k3d nodes and container registries for local image distribution.',
        cmds: [
          { cmd: 'k3d node create <name> --cluster <cluster>',                               desc: 'Add a node to an existing cluster' },
          { cmd: 'k3d node delete <name>',                                                   desc: 'Delete a k3d node' },
          { cmd: 'k3d node list',                                                             desc: 'List all k3d nodes' },
          { cmd: 'k3d registry create <name> --port <port>',                                 desc: 'Create a local container registry' },
          { cmd: 'k3d registry delete <name>',                                                desc: 'Delete a k3d registry' },
          { cmd: 'k3d registry list',                                                          desc: 'List all k3d registries' },
        ]
      },
      {
        title: 'Images',
        desc: 'Import local container images into k3d clusters for testing without a registry.',
        cmds: [
          { cmd: 'k3d image import <image> -c <cluster>',                                    desc: 'Import an image into a cluster' },
          { cmd: 'k3d image import <image1> <image2> -c <cluster>',                         desc: 'Import multiple images' },
          { cmd: 'k3d image import <tar> -c <cluster>',                                     desc: 'Import from a tar archive' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'List clusters, nodes, registries, and retrieve kubeconfig for cluster access.',
        cmds: [
          { cmd: 'k3d cluster list',                                                           desc: 'List all k3d clusters' },
          { cmd: 'k3d node list',                                                             desc: 'List all k3d nodes' },
          { cmd: 'k3d kubeconfig get <name>',                                                 desc: 'Get kubeconfig for a cluster' },
          { cmd: 'k3d kubeconfig merge <name> --switch-context',                              desc: 'Merge kubeconfig and switch context' },
        ]
      },
    ]
  },

  // ── INSTALLATION — KIND ─────────────────────────────────────
  {
    id: 'install-kind', title: 'KinD', icon: ICONS.kind, sub: 'Installation',
    groups: [
      {
        title: 'Install',
        desc: 'Install kind (Kubernetes IN Docker), a tool for running local Kubernetes clusters using Docker containers as nodes.',
        cmds: [
          { cmd: 'brew install kind',                                                          desc: 'Install kind via Homebrew' },
          { cmd: 'curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/', desc: 'Install kind binary on Linux amd64' },
          { cmd: 'kind version',                                                              desc: 'Print kind version' },
        ]
      },
      {
        title: 'Manage',
        desc: 'Create and delete kind clusters, configure multi-node topologies, and manage cluster lifecycle.',
        cmds: [
          { cmd: 'kind create cluster --name <name>',                                          desc: 'Create a named kind cluster' },
          { cmd: 'kind create cluster --config <kind.yaml>',                                   desc: 'Create cluster from config file (multi-node, HA)' },
          { cmd: 'kind create cluster --image <node-image>',                                   desc: 'Create cluster with a specific node image' },
          { cmd: 'kind create cluster --retain',                                               desc: 'Create cluster and retain nodes on failure for debugging' },
          { cmd: 'kind delete cluster --name <name>',                                          desc: 'Delete a named kind cluster' },
          { cmd: 'kind delete clusters <name1> <name2>',                                      desc: 'Delete multiple clusters' },
        ]
      },
      {
        title: 'Images & Logs',
        desc: 'Load container images into kind nodes and export cluster logs for debugging.',
        cmds: [
          { cmd: 'kind load docker-image <image> --name <name>',                             desc: 'Load a Docker image into a cluster' },
          { cmd: 'kind load docker-image <image> --name <name> --nodes <node1>,<node2>',     desc: 'Load image into specific nodes' },
          { cmd: 'kind load image-archive <tar> --name <name>',                              desc: 'Load an image from a tar archive' },
          { cmd: 'kind build node-image --image <tag>',                                      desc: 'Build a custom node image' },
          { cmd: 'kind export logs --name <name>',                                           desc: 'Export cluster logs to a local directory' },
          { cmd: 'kind export logs --name <name> --outdir <dir>',                            desc: 'Export logs to a specific directory' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'List clusters and retrieve kubeconfig for cluster access.',
        cmds: [
          { cmd: 'kind get clusters',                                                          desc: 'List all kind clusters' },
          { cmd: 'kind get nodes --name <name>',                                              desc: 'List nodes in a kind cluster' },
          { cmd: 'kind get kubeconfig --name <name>',                                          desc: 'Get kubeconfig for a specific cluster' },
          { cmd: 'kind export kubeconfig --name <name>',                                       desc: 'Export kubeconfig and set current context' },
        ]
      },
    ]
  },

  // ── INSTALLATION — MINIKUBE ─────────────────────────────────
  {
    id: 'install-minikube', title: 'Minikube', icon: ICONS.minikube, sub: 'Installation',
    groups: [
      {
        title: 'Install',
        desc: 'Install minikube, a tool that runs a single-node Kubernetes cluster locally using a VM or container runtime.',
        cmds: [
          { cmd: 'brew install minikube',                                                      desc: 'Install minikube via Homebrew' },
          { cmd: 'curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube', desc: 'Install minikube binary on Linux amd64' },
          { cmd: 'minikube version',                                                          desc: 'Print minikube version' },
        ]
      },
      {
        title: 'Manage',
        desc: 'Start, stop, delete, and manage minikube clusters with support for multiple profiles and drivers.',
        cmds: [
          { cmd: 'minikube start --driver docker',                                            desc: 'Start a cluster with the Docker driver' },
          { cmd: 'minikube start --driver podman',                                            desc: 'Start a cluster with the Podman driver' },
          { cmd: 'minikube start --driver virtualbox',                                        desc: 'Start a cluster with the VirtualBox driver' },
          { cmd: 'minikube start --driver qemu2',                                             desc: 'Start a cluster with the QEMU driver (Linux)' },
          { cmd: 'minikube start --driver hyperkit',                                          desc: 'Start a cluster with the HyperKit driver (macOS)' },
          { cmd: 'minikube start --kubernetes-version <version>',                             desc: 'Start with a specific Kubernetes version' },
          { cmd: 'minikube start -p <profile>',                                               desc: 'Start a named profile (multi-cluster)' },
          { cmd: 'minikube start --nodes <n>',                                                desc: 'Start a multi-node cluster' },
          { cmd: 'minikube start --cpus <n> --memory <mb>',                                   desc: 'Start with custom CPU and memory' },
          { cmd: 'minikube start --container-runtime containerd',                             desc: 'Start with containerd runtime' },
          { cmd: 'minikube stop',                                                              desc: 'Stop the current minikube cluster' },
          { cmd: 'minikube stop -p <profile>',                                                desc: 'Stop a specific profile' },
          { cmd: 'minikube delete',                                                            desc: 'Delete the current minikube cluster' },
          { cmd: 'minikube delete -p <profile>',                                              desc: 'Delete a specific profile' },
          { cmd: 'minikube delete --all',                                                     desc: 'Delete all profiles and purge config' },
        ]
      },
      {
        title: 'Addons & Access',
        desc: 'Enable addons (ingress, dashboard, metrics-server), expose services, and open the dashboard.',
        cmds: [
          { cmd: 'minikube addons list',                                                      desc: 'List all addons and their status' },
          { cmd: 'minikube addons enable ingress',                                            desc: 'Enable the NGINX ingress controller' },
          { cmd: 'minikube addons enable metrics-server',                                     desc: 'Enable metrics-server for kubectl top' },
          { cmd: 'minikube addons enable registry',                                           desc: 'Enable the local Docker registry addon' },
          { cmd: 'minikube addons enable dashboard',                                          desc: 'Enable the Kubernetes dashboard' },
          { cmd: 'minikube addons enable <addon>',                                            desc: 'Enable an addon' },
          { cmd: 'minikube addons disable <addon>',                                           desc: 'Disable an addon' },
          { cmd: 'minikube dashboard',                                                        desc: 'Open the Kubernetes dashboard in browser' },
          { cmd: 'minikube dashboard --url',                                                  desc: 'Print dashboard URL without opening' },
          { cmd: 'minikube service <service>',                                                desc: 'Open a service endpoint in browser' },
          { cmd: 'minikube service <service> --url',                                          desc: 'Print service URL without opening' },
          { cmd: 'minikube tunnel',                                                           desc: 'Create a network tunnel for LoadBalancer services' },
        ]
      },
      {
        title: 'Images & Files',
        desc: 'Load local images into minikube, SSH into the node, copy files, and build images inside the cluster.',
        cmds: [
          { cmd: 'minikube image load <image>',                                               desc: 'Load a local image into minikube' },
          { cmd: 'minikube image load <image> --overwrite',                                   desc: 'Load image, overwriting if it exists' },
          { cmd: 'minikube image list',                                                       desc: 'List images in the minikube container runtime' },
          { cmd: 'minikube image build -t <tag> <dir>',                                      desc: 'Build an image inside minikube' },
          { cmd: 'minikube ssh',                                                              desc: 'SSH into the minikube node' },
          { cmd: 'minikube ssh -- <command>',                                                 desc: 'Run a command on the minikube node' },
          { cmd: 'minikube cp <src> <dest>',                                                  desc: 'Copy files to/from minikube node' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'Check cluster status, list profiles, view services, and manage persistent configuration.',
        cmds: [
          { cmd: 'minikube status',                                                            desc: 'Show cluster status and health' },
          { cmd: 'minikube profile list',                                                      desc: 'List all minikube profiles' },
          { cmd: 'minikube profile <name>',                                                   desc: 'Switch to a specific profile' },
          { cmd: 'minikube service list',                                                     desc: 'List services and their URLs' },
          { cmd: 'minikube config view',                                                     desc: 'View all config values' },
          { cmd: 'minikube config set driver <driver>',                                      desc: 'Set the default driver' },
          { cmd: 'minikube config set memory <mb>',                                          desc: 'Set default memory in MB' },
          { cmd: 'minikube config set cpus <n>',                                             desc: 'Set default CPU count' },
        ]
      },
    ]
  },


  // ── CLUSTER HEALTH ────────────────────────────────────────
  {
    id: 'cluster-health', title: 'Cluster Health', icon: ICONS['cluster-health'], sub: 'Cluster',
    groups: [
      {
        title: 'API Discovery',
        desc: 'Explore supported API resource types, versions, and field-level documentation.',
        cmds: [
          { cmd: 'kubectl api-resources',                                           desc: 'List all available resource types' },
          { cmd: 'kubectl api-resources --namespaced=false',                        desc: 'Cluster-scoped resources only' },
          { cmd: 'kubectl api-resources --namespaced=true',                         desc: 'Namespaced resources only' },
          { cmd: 'kubectl api-versions',                                            desc: 'All API groups and versions supported' },
          { cmd: 'kubectl explain <resource>',                                      desc: 'API documentation for a resource type' },
          { cmd: 'kubectl explain <resource>.spec',                                 desc: 'Docs for a specific field path' },
        ]
      },
      {
        title: 'Quotas & Limits',
        desc: 'Inspect resource quotas, limit ranges, disruption budgets, and priority classes across the cluster.',
        cmds: [
          { cmd: 'kubectl describe limitrange <name> -n <namespace>',              desc: 'Limit range details and defaults' },
          { cmd: 'kubectl describe pdb <name> -n <namespace>',                     desc: 'PDB details and disruption allowance' },
          { cmd: 'kubectl describe resourcequota <name> -n <namespace>',           desc: 'Quota details and current usage' },
          { cmd: 'kubectl get limitrange -A',                                      desc: 'Container and pod limit ranges' },
          { cmd: 'kubectl get pdb -A',                                             desc: 'Pod disruption budgets cluster-wide' },
          { cmd: 'kubectl get priorityclass',                                      desc: 'Pod priority classes' },
          { cmd: 'kubectl get resourcequota -A',                                   desc: 'Resource quotas across all namespaces' },
        ]
      },
      {
        title: 'Admission Webhooks',
        desc: 'List and inspect validating and mutating admission webhook configurations.',
        cmds: [
          { cmd: 'kubectl describe mutatingwebhookconfiguration <name>',            desc: 'Mutation rules, namespaces, and endpoint' },
          { cmd: 'kubectl describe validatingwebhookconfiguration <name>',          desc: 'Validation rules, namespaces, and endpoint' },
          { cmd: 'kubectl get mutatingwebhookconfigurations',                       desc: 'Mutating admission webhooks' },
          { cmd: 'kubectl get validatingwebhookconfigurations',                     desc: 'Validating admission webhooks' },
        ]
      },
      {
        title: 'Certificates',
        desc: 'Manage certificate signing requests (CSRs). Nodes and users submit CSRs to obtain signed certificates; a cluster admin approves or denies them.',
        cmds: [
          { cmd: 'kubectl certificate approve <name>',                              desc: 'Approve a certificate signing request' },
          { cmd: 'kubectl certificate deny <name>',                                 desc: 'Deny a certificate signing request' },
          { cmd: 'kubectl delete csr <name>',                                       desc: 'Delete a processed CSR' },
          { cmd: 'kubectl describe csr <name>',                                     desc: 'Inspect CSR details and requestor' },
          { cmd: 'kubectl get csr',                                                 desc: 'List all certificate signing requests' },
        ]
      },
    ]
  },

  // ── NODES ─────────────────────────────────────────────────
  {
    id: 'node', title: 'Nodes', icon: ICONS.node, sub: 'Cluster',
    groups: [
      {
        title: 'Resource Usage',
        desc: 'Monitor real-time CPU and memory consumption across nodes and pods.',
        cmds: [
          { cmd: 'kubectl top node <name>',                                         desc: 'CPU and memory usage for a specific node' },
          { cmd: 'kubectl top nodes',                                              desc: 'CPU and memory usage per node' },
          { cmd: 'kubectl top nodes --sort-by=cpu',                                desc: 'Nodes sorted by CPU usage' },
          { cmd: 'kubectl top nodes --sort-by=memory',                             desc: 'Nodes sorted by memory usage' },
          { cmd: 'kubectl top pods -A',                                            desc: 'CPU and memory for all pods' },
          { cmd: 'kubectl top pods -n <namespace> --sort-by=cpu',                  desc: 'Pods sorted by CPU usage' },
          { cmd: 'kubectl top pods -n <namespace> --sort-by=memory',               desc: 'Pods sorted by memory usage' },
        ]
      },
      {
        title: 'Scheduling',
        desc: 'Control which nodes accept new workloads using cordon, uncordon, and drain.',
        cmds: [
          { cmd: 'kubectl cordon <node>',                                          desc: 'Mark node as unschedulable' },
          { cmd: 'kubectl drain <node> --ignore-daemonsets --dry-run=client',      desc: 'Simulate drain without evicting any pods' },
          { cmd: 'kubectl drain <node> --force --ignore-daemonsets',               desc: 'Force drain (removes unmanaged pods)' },
          { cmd: 'kubectl drain <node> --ignore-daemonsets --delete-emptydir-data', desc: 'Drain including emptyDir pods' },
          { cmd: 'kubectl drain <node> --ignore-daemonsets',                       desc: 'Evict all pods from a node' },
          { cmd: 'kubectl uncordon <node>',                                        desc: 'Mark node as schedulable again' },
          { cmd: 'kubectl wait --for=condition=Ready node/<name> --timeout=60s',   desc: 'Wait until node becomes Ready' },
        ]
      },
      {
        title: 'Taints, Labels & Annotations',
        desc: 'Repel or attract pods using taints; organise nodes with labels and store metadata via annotations.',
        cmds: [
          { cmd: 'kubectl annotate node <node> <key>-',                            desc: 'Remove an annotation from a node' },
          { cmd: 'kubectl annotate node <node> <key>=<value>',                     desc: 'Add or update a node annotation' },
          { cmd: 'kubectl get nodes -l <key>=<value>',                             desc: 'Filter nodes by label' },
          { cmd: 'kubectl label nodes <node> <key>-',                              desc: 'Remove a label from a node' },
          { cmd: 'kubectl label nodes <node> <key>=<value>',                       desc: 'Add a label to a node' },
          { cmd: 'kubectl taint nodes <node> <key>:NoSchedule-',                   desc: 'Remove a taint from node' },
          { cmd: 'kubectl taint nodes <node> <key>=<value>:NoExecute',             desc: 'Add NoExecute taint to node' },
          { cmd: 'kubectl taint nodes <node> <key>=<value>:NoSchedule',            desc: 'Add NoSchedule taint to node' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'View node details, status, internal IP, OS, and container runtime version.',
        cmds: [
          { cmd: 'kubectl describe node <name>',                                   desc: 'Node details, conditions, capacity' },
          { cmd: 'kubectl get node <name> -o yaml',                                desc: 'Get node manifest as YAML' },
          { cmd: 'kubectl get nodes -o custom-columns=NAME:.metadata.name,VER:.status.nodeInfo.kubeletVersion,OS:.status.nodeInfo.osImage', desc: 'Custom columns: name, version, and OS' },
          { cmd: 'kubectl get nodes --show-labels',                                desc: 'Nodes with all their labels' },
          { cmd: 'kubectl get nodes -o wide',                                      desc: 'Nodes with IP, OS, container runtime' },
          { cmd: 'kubectl get nodes',                                              desc: 'List all nodes in the cluster' },
        ]
      },
    ]
  },

  // ── CUSTOM RESOURCES ──────────────────────────────────────
  {
    id: 'crd', title: 'Custom Resources', icon: ICONS.crd, sub: 'Cluster',
    groups: [
      {
        title: 'Manage',
        desc: 'Install, update, and remove Custom Resource Definitions that extend the Kubernetes API with new resource types.',
        cmds: [
          { cmd: 'kubectl apply -f crd.yaml',                                        desc: 'Install or update a CRD' },
          { cmd: 'kubectl delete crd <name>',                                        desc: 'Remove a CRD and all its custom resources' },
          { cmd: 'kubectl edit crd <name>',                                          desc: 'Edit CRD in $EDITOR' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'List installed CRDs and inspect their versions, schema, and acceptance status.',
        cmds: [
          { cmd: 'kubectl describe crd <name>',                                      desc: 'Full CRD details, versions, schema, and conditions' },
          { cmd: 'kubectl get crd',                                                  desc: 'List all Custom Resource Definitions' },
          { cmd: 'kubectl get crd <name> -o jsonpath=\'{.spec.versions[*].name}\'', desc: 'List all API versions defined by a CRD' },
          { cmd: 'kubectl get crd <name> -o yaml',                                  desc: 'Get full CRD manifest as YAML' },
          { cmd: 'kubectl get <custom-resource> -A',                                desc: 'List all instances of a custom resource' },
          { cmd: 'kubectl get <custom-resource> <name> -n <namespace> -o yaml',     desc: 'Get a custom resource instance as YAML' },
        ]
      },
      {
        title: 'API Discovery',
        desc: 'Explore all available API resources and versions, and inspect resource field schemas directly from the API server.',
        cmds: [
          { cmd: 'kubectl api-resources',                                            desc: 'List all available API resources' },
          { cmd: 'kubectl api-resources --api-group=<group>',                       desc: 'Resources in a specific API group' },
          { cmd: 'kubectl api-resources --namespaced=false',                        desc: 'Cluster-scoped resources only' },
          { cmd: 'kubectl api-resources --namespaced=true',                         desc: 'Namespace-scoped resources only' },
          { cmd: 'kubectl api-versions',                                             desc: 'List all API versions in the cluster' },
          { cmd: 'kubectl explain <resource>',                                       desc: 'Describe a resource and its top-level fields' },
          { cmd: 'kubectl explain <resource> --recursive',                           desc: 'Show full nested field tree' },
          { cmd: 'kubectl explain <resource>.spec.<field>',                          desc: 'Explain a specific nested field' },
        ]
      },
    ]
  },

  // ── CONTEXTS ──────────────────────────────────────────────
  {
    id: 'context', title: 'Contexts', icon: ICONS.context, sub: 'Cluster',
    groups: [
      {
        title: 'Manage Contexts',
        desc: 'Create, update, rename, switch, and delete contexts in kubeconfig.',
        cmds: [
          { cmd: 'kubectl config delete-context <name>',                           desc: 'Delete a context' },
          { cmd: 'kubectl config rename-context <old> <new>',                      desc: 'Rename a context' },
          { cmd: 'kubectl config set-context --current --cluster=<name>',           desc: 'Change cluster for current context' },
          { cmd: 'kubectl config set-context --current --namespace=<ns>',          desc: 'Set default namespace for current context' },
          { cmd: 'kubectl config set-context <name> --cluster=<cluster> --user=<user> --namespace=<ns>', desc: 'Create or update a context' },
          { cmd: 'kubectl config unset contexts.<name>',                           desc: 'Remove a context entry from kubeconfig' },
          { cmd: 'kubectl config use-context <name>',                              desc: 'Switch to a different context' },
        ]
      },
      {
        title: 'Clusters & Credentials',
        desc: 'Add, update, and remove cluster endpoints and user credentials in kubeconfig.',
        cmds: [
          { cmd: 'kubectl config delete-cluster <name>',                           desc: 'Remove a cluster from kubeconfig' },
          { cmd: 'kubectl config delete-user <name>',                              desc: 'Remove a user from kubeconfig' },
          { cmd: 'kubectl config set-cluster <name> --server=<url>',               desc: 'Add or update a cluster endpoint' },
          { cmd: 'kubectl config set-cluster <name> --insecure-skip-tls-verify=true', desc: 'Disable TLS verification for cluster' },
          { cmd: 'kubectl config set-credentials <name> --client-certificate=<cert> --client-key=<key>', desc: 'Add certificate-based credentials' },
          { cmd: 'kubectl config set-credentials <name> --token=<token>',          desc: 'Add token-based user credentials' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'Inspect kubeconfig, list available contexts, clusters, and users.',
        cmds: [
          { cmd: 'kubectl config current-context',                                 desc: 'Show active context' },
          { cmd: 'kubectl config get-clusters',                                    desc: 'List all clusters in kubeconfig' },
          { cmd: 'kubectl config get-contexts',                                    desc: 'List all kubeconfig contexts' },
          { cmd: 'kubectl config get-users',                                       desc: 'List all users in kubeconfig' },
          { cmd: 'kubectl config view --flatten',                                  desc: 'Flatten kubeconfig (useful for sharing)' },
          { cmd: 'kubectl config view --minify',                                   desc: 'View current context config only' },
          { cmd: 'kubectl config view --raw',                                      desc: 'Full kubeconfig including credentials (for backup/migration)' },
          { cmd: 'kubectl config view',                                            desc: 'View full kubeconfig' },
        ]
      },
    ]
  },

  // ── PODS ──────────────────────────────────────────────────
  {
    id: 'pod', title: 'Pods', icon: ICONS.pod, sub: 'Workloads',
    groups: [
      {
        title: 'Manage',
        desc: 'Apply manifests, run standalone pods imperatively, and remove them by name, file, or label.',
        cmds: [
          { cmd: 'kubectl apply -f <pod.yaml>',                                    desc: 'Create or update pod from manifest' },
          { cmd: 'kubectl delete -f <pod.yaml>',                                   desc: 'Delete pod defined in manifest' },
          { cmd: 'kubectl delete pod <name>',                                      desc: 'Delete a pod gracefully' },
          { cmd: 'kubectl delete pod <name> --force --grace-period=0',             desc: 'Force-delete a stuck pod' },
          { cmd: 'kubectl delete pods -l <key>=<value>',                           desc: 'Delete pods by label selector' },
          { cmd: 'kubectl diff -f <pod.yaml>',                                     desc: 'Preview changes before applying pod manifest' },
          { cmd: 'kubectl run <name> --image=<image>',                             desc: 'Create a standalone pod' },
          { cmd: 'kubectl run <name> --image=<image> --rm -it -- bash',            desc: 'Ephemeral debug pod (auto-deletes)' },
        ]
      },
      {
        title: 'Access',
        desc: 'Get inside a running pod to execute commands, transfer files, or forward ports locally.',
        cmds: [
          { cmd: 'kubectl cp ./local <pod>:/path/to/file',                         desc: 'Copy file from local to pod' },
          { cmd: 'kubectl cp <pod>:/path/to/file ./local',                         desc: 'Copy file from pod to local' },
          { cmd: 'kubectl exec -it <pod> -- bash',                                 desc: 'Open interactive shell in pod' },
          { cmd: 'kubectl exec -it <pod> -c <container> -- sh',                   desc: 'Shell into a specific container' },
          { cmd: 'kubectl exec <pod> -- <command>',                                desc: 'Run a one-off command in pod' },
          { cmd: 'kubectl port-forward pod/<name> 8080:80',                        desc: 'Forward localhost:8080 → pod:80' },
          { cmd: 'kubectl port-forward pod/<name> <local>:<remote>',               desc: 'Forward local port to pod' },
          { cmd: 'kubectl attach -it <pod>',                                         desc: 'Attach to a running process in a pod' },
          { cmd: 'kubectl attach -it <pod> -c <container>',                        desc: 'Attach to a specific container' },
          { cmd: 'kubectl port-forward svc/<name> 8080:80',                        desc: 'Forward localhost:8080 → service:80' },
        ]
      },
      {
        title: 'Logs',
        desc: 'Stream, filter, and retrieve logs from pod containers including previous instances.',
        cmds: [
          { cmd: 'kubectl logs -l app=<name> --all-containers=true',               desc: 'Logs from all pods matching label' },
          { cmd: 'kubectl logs <pod> --since=1h',                                  desc: 'Logs from the last hour' },
          { cmd: 'kubectl logs <pod> --tail=100',                                  desc: 'Print last 100 lines' },
          { cmd: 'kubectl logs <pod> -c <container>',                              desc: 'Logs from a specific container' },
          { cmd: 'kubectl logs <pod> -f',                                          desc: 'Follow / stream pod logs' },
          { cmd: 'kubectl logs <pod>',                                             desc: 'Print pod logs (stdout)' },
        ]
      },
      {
        title: 'List',
        desc: 'List pods across namespaces with filtering by label, field selector, or output format.',
        cmds: [
          { cmd: 'kubectl get pods',                                               desc: 'List pods in current namespace' },
          { cmd: 'kubectl get pods -A',                                            desc: 'List all pods across all namespaces' },
          { cmd: 'kubectl get pods -A --field-selector=status.phase!=Running',     desc: 'Find all non-Running pods across cluster' },
          { cmd: 'kubectl get pods --field-selector=status.phase=Running',         desc: 'Filter pods by field selector' },
          { cmd: 'kubectl get pods -l <key>=<value>',                              desc: 'Filter pods by label selector' },
          { cmd: 'kubectl get pods -n <namespace>',                                desc: 'Pods in a specific namespace' },
          { cmd: 'kubectl get pods -o wide',                                       desc: 'Show IP, node and nominated node' },
          { cmd: 'kubectl get pods --watch',                                        desc: 'Watch pod status changes in real time' },
        ]
      },
      {
        title: 'Inspect',
        desc: 'Examine a specific pod, including its manifest, container layout, node placement, and resource usage.',
        cmds: [
          { cmd: 'kubectl describe pod <name>',                                    desc: 'Full pod details, events and status' },
          { cmd: 'kubectl get pod <name> -o jsonpath=\'{.spec.containers[*].name}\'', desc: 'List all container names in a pod' },
          { cmd: 'kubectl get pod <name> -o jsonpath=\'{.spec.nodeName}\'',        desc: 'Which node the pod is running on' },
          { cmd: 'kubectl get pod <name> -o jsonpath=\'{.status.podIP}\'',         desc: 'Get pod IP as a one-liner' },
          { cmd: 'kubectl get pod <name> -o yaml',                                 desc: 'Get pod manifest as YAML' },
          { cmd: 'kubectl top pod',                                                desc: 'CPU and memory usage for pods' },
          { cmd: 'kubectl top pod --sort-by=cpu',                                  desc: 'Sort pods by CPU usage' },
          { cmd: 'kubectl wait --for=condition=Ready pod/<name> --timeout=60s',   desc: 'Wait until pod is Ready' },
          { cmd: 'kubectl wait --for=condition=Ready pod -l <key>=<value>',       desc: 'Wait for all matching pods to be Ready' },
        ]
      },
    ]
  },

  // ── DEPLOYMENTS ───────────────────────────────────────────
  {
    id: 'deployment', title: 'Deployments', icon: ICONS.deployment, sub: 'Workloads',
    groups: [
      {
        title: 'Manage',
        desc: 'Apply manifests, create and modify deployments imperatively, and remove them from the cluster.',
        cmds: [
          { cmd: 'kubectl apply -f <directory>/',                                  desc: 'Apply all manifests in a directory' },
          { cmd: 'kubectl apply -f <file.yaml>',                                   desc: 'Apply a manifest from file' },
          { cmd: 'kubectl create deployment <name> --image=<image>',               desc: 'Create a deployment imperatively' },
          { cmd: 'kubectl create deployment <name> --image=<image> --replicas=<n>', desc: 'Create deployment with replica count' },
          { cmd: 'kubectl delete -f <file.yaml>',                                  desc: 'Delete resources defined in file' },
          { cmd: 'kubectl delete deploy --all -n <namespace>',                     desc: 'Delete all deployments in namespace' },
          { cmd: 'kubectl delete deployment <name>',                               desc: 'Delete a deployment' },
          { cmd: 'kubectl diff -f <file.yaml>',                                    desc: 'Preview changes before applying deployment' },
          { cmd: 'kubectl edit deployment <name>',                                 desc: 'Edit deployment in $EDITOR' },
          { cmd: 'kubectl patch deploy/<name> -p \'{"spec":{"replicas":3}}\'',     desc: 'Patch deployment with JSON' },
          { cmd: 'kubectl set env deploy/<name> <KEY>=<VALUE>',                     desc: 'Set or update environment variable' },
          { cmd: 'kubectl set image deploy/<name> <container>=<image>',            desc: 'Update container image' },
          { cmd: 'kubectl set resources deploy/<name> --limits=cpu=500m,memory=512Mi', desc: 'Set resource limits on containers' },
        ]
      },
      {
        title: 'Scale',
        desc: 'Adjust replica count manually or automatically with a Horizontal Pod Autoscaler.',
        cmds: [
          { cmd: 'kubectl autoscale deploy/<name> --min=2 --max=10 --cpu-percent=80', desc: 'Create Horizontal Pod Autoscaler' },
          { cmd: 'kubectl delete hpa <name>',                                      desc: 'Delete an autoscaler' },
          { cmd: 'kubectl get hpa',                                                desc: 'List Horizontal Pod Autoscalers' },
          { cmd: 'kubectl scale deploy/<name> --replicas=<n>',                     desc: 'Scale deployment to N replicas' },
        ]
      },
      {
        title: 'Rollout',
        desc: 'Track, pause, resume, and roll back deployment updates across revisions.',
        cmds: [
          { cmd: 'kubectl rollout history deploy/<name>',                          desc: 'Show revision history' },
          { cmd: 'kubectl rollout pause deploy/<name>',                            desc: 'Pause an in-progress rollout' },
          { cmd: 'kubectl rollout restart deploy/<name>',                          desc: 'Trigger a rolling restart' },
          { cmd: 'kubectl rollout resume deploy/<name>',                           desc: 'Resume a paused rollout' },
          { cmd: 'kubectl rollout status deploy/<name>',                           desc: 'Watch rollout progress' },
          { cmd: 'kubectl rollout status deploy/<name> --timeout=<duration>',      desc: 'Wait for rollout with bounded timeout (CI-friendly)' },
          { cmd: 'kubectl rollout undo deploy/<name> --to-revision=<n>',           desc: 'Rollback to specific revision' },
          { cmd: 'kubectl annotate deploy/<name> kubernetes.io/change-cause="<message>"', desc: 'Set change cause shown in rollout history' },
          { cmd: 'kubectl rollout undo deploy/<name>',                             desc: 'Rollback to previous revision' },
          { cmd: 'kubectl wait --for=condition=Available deployment/<name>',       desc: 'Wait until deployment is Available' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'View deployments and their current state, replica count, and age.',
        cmds: [
          { cmd: 'kubectl describe deployment <name>',                             desc: 'Full deployment details and events' },
          { cmd: 'kubectl get deploy -A',                                          desc: 'All deployments across namespaces' },
          { cmd: 'kubectl get deploy -n <namespace>',                              desc: 'Deployments in a specific namespace' },
          { cmd: 'kubectl get deployment <name> -o yaml',                          desc: 'Get deployment manifest as YAML' },
          { cmd: 'kubectl get deployments',                                        desc: 'List deployments in current namespace' },
        ]
      },
    ]
  },

  // ── STATEFULSETS ──────────────────────────────────────────
  {
    id: 'statefulset', title: 'StatefulSets', icon: ICONS.statefulset, sub: 'Workloads',
    groups: [
      {
        title: 'Manage',
        desc: 'Create, update, scale, and delete StatefulSets and their associated pods.',
        cmds: [
          { cmd: 'kubectl apply -f statefulset.yaml',                              desc: 'Apply StatefulSet from manifest' },
          { cmd: 'kubectl delete statefulset <name>',                              desc: 'Delete a StatefulSet' },
          { cmd: 'kubectl delete statefulset <name> --cascade=orphan',             desc: 'Delete StatefulSet, keep its pods' },
          { cmd: 'kubectl edit statefulset <name>',                                desc: 'Edit StatefulSet in $EDITOR' },
          { cmd: 'kubectl scale statefulset/<name> --replicas=<n>',                desc: 'Scale to N replicas' },
        ]
      },
      {
        title: 'Rollout',
        desc: 'Track, restart, and roll back StatefulSet updates.',
        cmds: [
          { cmd: 'kubectl rollout history statefulset/<name>',                     desc: 'Show revision history' },
          { cmd: 'kubectl rollout restart statefulset/<name>',                     desc: 'Trigger a rolling restart' },
          { cmd: 'kubectl rollout status statefulset/<name>',                      desc: 'Watch rollout progress' },
          { cmd: 'kubectl rollout undo statefulset/<name>',                        desc: 'Rollback to previous revision' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'View StatefulSets and their replica count, age, and current state.',
        cmds: [
          { cmd: 'kubectl describe statefulset <name>',                            desc: 'Full StatefulSet details and events' },
          { cmd: 'kubectl get statefulset <name> -o yaml',                         desc: 'Get StatefulSet manifest as YAML' },
          { cmd: 'kubectl get statefulsets',                                       desc: 'List StatefulSets in current namespace' },
          { cmd: 'kubectl get statefulsets -A',                                    desc: 'All StatefulSets across namespaces' },
          { cmd: 'kubectl get statefulsets -n <namespace>',                        desc: 'StatefulSets in a specific namespace' },
          { cmd: 'kubectl get sts',                                                desc: 'Short alias for get statefulsets' },
        ]
      },
    ]
  },

  // ── DAEMONSETS ────────────────────────────────────────────
  {
    id: 'daemonset', title: 'DaemonSets', icon: ICONS.daemonset, sub: 'Workloads',
    groups: [
      {
        title: 'Manage',
        desc: 'Create, update, and delete DaemonSets. Control which nodes they run on using node selectors.',
        cmds: [
          { cmd: 'kubectl apply -f daemonset.yaml',                                desc: 'Apply DaemonSet from manifest' },
          { cmd: 'kubectl delete daemonset <name>',                                desc: 'Delete a DaemonSet and all its pods' },
          { cmd: 'kubectl edit daemonset <name>',                                  desc: 'Edit DaemonSet in $EDITOR' },
          { cmd: 'kubectl set image ds/<name> <container>=<image>',                desc: 'Update container image' },
        ]
      },
      {
        title: 'Rollout',
        desc: 'Track, restart, and roll back DaemonSet updates across all nodes.',
        cmds: [
          { cmd: 'kubectl rollout history daemonset/<name>',                       desc: 'Show revision history' },
          { cmd: 'kubectl rollout restart daemonset/<name>',                       desc: 'Trigger a rolling restart on all nodes' },
          { cmd: 'kubectl rollout status daemonset/<name>',                        desc: 'Watch rollout progress across nodes' },
          { cmd: 'kubectl rollout undo daemonset/<name>',                          desc: 'Rollback to previous revision' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'View DaemonSets and how many pods are scheduled, ready, and available across nodes.',
        cmds: [
          { cmd: 'kubectl describe daemonset <name>',                              desc: 'Full DaemonSet details and events' },
          { cmd: 'kubectl get daemonset <name> -o yaml',                           desc: 'Get DaemonSet manifest as YAML' },
          { cmd: 'kubectl get daemonsets',                                         desc: 'List DaemonSets in current namespace' },
          { cmd: 'kubectl get daemonsets -A',                                      desc: 'All DaemonSets across namespaces' },
          { cmd: 'kubectl get daemonsets -n <namespace>',                          desc: 'DaemonSets in a specific namespace' },
          { cmd: 'kubectl get ds',                                                 desc: 'Short alias for get daemonsets' },
        ]
      },
    ]
  },

  // ── SERVICES ──────────────────────────────────────────────
  {
    id: 'service', title: 'Services', icon: ICONS.service, sub: 'Workloads',
    groups: [
      {
        title: 'Manage',
        desc: 'Create services imperatively or from manifests, edit, and remove them from the cluster.',
        cmds: [
          { cmd: 'kubectl apply -f service.yaml',                                  desc: 'Apply service from manifest' },
          { cmd: 'kubectl create svc clusterip <name> --tcp=80:8080',              desc: 'Create ClusterIP imperatively' },
          { cmd: 'kubectl create svc loadbalancer <name> --tcp=80:8080',           desc: 'Create LoadBalancer imperatively' },
          { cmd: 'kubectl create svc nodeport <name> --tcp=80:8080',               desc: 'Create NodePort imperatively' },
          { cmd: 'kubectl delete -f service.yaml',                                 desc: 'Delete service from manifest' },
          { cmd: 'kubectl delete svc --all -n <namespace>',                        desc: 'Delete all services in namespace' },
          { cmd: 'kubectl delete svc <name>',                                      desc: 'Delete a service' },
          { cmd: 'kubectl edit svc <name>',                                        desc: 'Edit service in $EDITOR' },
        ]
      },
      {
        title: 'Expose & Port Forward',
        desc: 'Expose deployments as services or forward a local port for direct access without external exposure.',
        cmds: [
          { cmd: 'kubectl expose deploy/<name> --port=80 --target-port=8080',      desc: 'Create ClusterIP service' },
          { cmd: 'kubectl expose deploy/<name> --type=LoadBalancer --port=80',     desc: 'Create LoadBalancer service' },
          { cmd: 'kubectl expose deploy/<name> --type=NodePort --port=80',         desc: 'Create NodePort service' },
          { cmd: 'kubectl port-forward deploy/<name> <local>:<remote>',            desc: 'Forward local port to deployment' },
          { cmd: 'kubectl port-forward svc/<name> <local>:<remote>',               desc: 'Forward local port to service' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'View services, their type, cluster IP, ports, and resolved endpoints.',
        cmds: [
          { cmd: 'kubectl describe svc <name>',                                    desc: 'Service details, selectors, endpoints' },
          { cmd: 'kubectl get endpoints <name>',                                   desc: 'View resolved endpoints for service' },
          { cmd: 'kubectl get endpointslices',                                     desc: 'Modern alternative to endpoints (EndpointSlice API)' },
          { cmd: 'kubectl get ep',                                                 desc: 'Short alias for get endpoints' },
          { cmd: 'kubectl get services',                                           desc: 'List services in current namespace' },
          { cmd: 'kubectl get svc -A',                                             desc: 'All services across namespaces' },
          { cmd: 'kubectl get svc -n <namespace>',                                 desc: 'Services in a specific namespace' },
          { cmd: 'kubectl get svc -o wide',                                        desc: 'Show selector and external IP' },
          { cmd: 'kubectl get svc <name> -o yaml',                                 desc: 'Get service manifest as YAML' },
        ]
      },
    ]
  },

  // ── CONFIGMAPS & SECRETS ─────────────────────────────────
  {
    id: 'config', title: 'ConfigMaps & Secrets', icon: ICONS.config, sub: 'Workloads',
    groups: [
      {
        title: 'Manage',
        desc: 'Create ConfigMaps and Secrets from literals, files, or manifests, edit them in-place, and remove them.',
        cmds: [
          { cmd: 'kubectl apply -f configmap.yaml',                                desc: 'Apply ConfigMap from manifest' },
          { cmd: 'kubectl create configmap <name> --from-env-file=.env',           desc: 'Create from .env file' },
          { cmd: 'kubectl create configmap <name> --from-file=<file>',             desc: 'Create from file (filename = key)' },
          { cmd: 'kubectl create configmap <name> --from-literal=<key>=<value>',   desc: 'Create from key=value literal' },
          { cmd: 'kubectl delete configmap <name>',                                desc: 'Delete a ConfigMap' },
          { cmd: 'kubectl edit configmap <name>',                                  desc: 'Edit ConfigMap in-place' },
          { cmd: 'kubectl apply -f secret.yaml',                                   desc: 'Apply secret from manifest' },
          { cmd: 'kubectl create secret docker-registry <name> --docker-server=<server> --docker-username=<user> --docker-password=<pass>', desc: 'Create image pull secret' },
          { cmd: 'kubectl create secret docker-registry <name> --from-file=.dockerconfigjson=<path>', desc: 'Create pull secret from existing docker config' },
          { cmd: 'kubectl create secret generic <name> --from-file=<file>',        desc: 'Create generic secret from file' },
          { cmd: 'kubectl create secret generic <name> --from-literal=<key>=<value>', desc: 'Create generic secret from literal' },
          { cmd: 'kubectl create secret tls <name> --cert=<cert> --key=<key>',     desc: 'Create TLS secret from cert/key files' },
          { cmd: 'kubectl delete secret <name>',                                   desc: 'Delete a secret' },
          { cmd: 'kubectl edit secret <name>',                                     desc: 'Edit secret in-place (base64 values)' },
        ]
      },
      {
        title: 'ConfigMaps Inspect',
        desc: 'List ConfigMaps and read their keys and values across namespaces.',
        cmds: [
          { cmd: 'kubectl describe configmap <name>',                              desc: 'ConfigMap details and data keys' },
          { cmd: 'kubectl get cm',                                                 desc: 'Short alias for get configmaps' },
          { cmd: 'kubectl get cm -n <namespace>',                                  desc: 'ConfigMaps in a namespace' },
          { cmd: 'kubectl get configmap <name> -o jsonpath=\'{.data.<key>}\'',     desc: 'Read a specific value from ConfigMap' },
          { cmd: 'kubectl get configmap <name> -o yaml',                           desc: 'Get full ConfigMap as YAML' },
          { cmd: 'kubectl get configmaps',                                         desc: 'List ConfigMaps in current namespace' },
          { cmd: 'kubectl get configmaps -A',                                      desc: 'All ConfigMaps across namespaces' },
        ]
      },
      {
        title: 'Secrets Inspect',
        desc: 'List Secrets and extract or decode their base64-encoded values.',
        cmds: [
          { cmd: 'kubectl describe secret <name>',                                 desc: 'Secret metadata (values are hidden)' },
          { cmd: "kubectl get secret <name> -o jsonpath='{.data.<key>}' | base64 -d", desc: 'Decode a secret value directly' },
          { cmd: "kubectl get secret <name> -o jsonpath='{.data.<key>}'",          desc: 'Extract a base64-encoded value' },
          { cmd: 'kubectl get secret <name> -o yaml',                              desc: 'Get full secret as YAML' },
          { cmd: 'kubectl get secrets',                                            desc: 'List secrets in current namespace' },
          { cmd: 'kubectl get secrets -A',                                         desc: 'All secrets across namespaces' },
          { cmd: 'kubectl get secrets -n <namespace>',                             desc: 'Secrets in a specific namespace' },
        ]
      },
    ]
  },

  // ── JOBS & CRONJOBS ───────────────────────────────────────
  {
    id: 'job', title: 'Jobs & CronJobs', icon: ICONS.job, sub: 'Workloads',
    groups: [
      {
        title: 'Jobs Manage',
        desc: 'Create jobs imperatively, trigger CronJobs manually, and clean up completed runs.',
        cmds: [
          { cmd: 'kubectl apply -f job.yaml',                                      desc: 'Apply job from manifest' },
          { cmd: 'kubectl create job <name> --from=cronjob/<cron>',               desc: 'Trigger a CronJob manually as a one-off job' },
          { cmd: 'kubectl create job <name> --image=<image>',                     desc: 'Create a simple job imperatively' },
          { cmd: 'kubectl delete job <name>',                                      desc: 'Delete job and its pods' },
          { cmd: 'kubectl delete jobs --all -n <namespace>',                      desc: 'Delete all jobs in a namespace' },
        ]
      },
      {
        title: 'CronJobs Manage',
        desc: 'Create, edit, suspend, resume, and delete CronJobs.',
        cmds: [
          { cmd: 'kubectl apply -f cronjob.yaml',                                  desc: 'Apply CronJob from manifest' },
          { cmd: "kubectl create cronjob <name> --image=<image> --schedule='*/5 * * * *'", desc: 'Create a CronJob imperatively' },
          { cmd: 'kubectl delete cronjob <name>',                                  desc: 'Delete CronJob (running jobs are unaffected)' },
          { cmd: 'kubectl delete cronjobs --all -n <namespace>',                   desc: 'Delete all CronJobs in a namespace' },
          { cmd: 'kubectl edit cronjob <name>',                                    desc: 'Edit CronJob in $EDITOR' },
          { cmd: "kubectl patch cronjob <name> -p '{\"spec\":{\"suspend\":false}}'", desc: 'Resume a suspended CronJob' },
          { cmd: "kubectl patch cronjob <name> -p '{\"spec\":{\"suspend\":true}}'",  desc: 'Suspend a CronJob (stops new runs)' },
        ]
      },
      {
        title: 'Jobs List & Inspect',
        desc: 'List jobs, inspect their status, and find the pods they created.',
        cmds: [
          { cmd: 'kubectl describe job <name>',                                    desc: 'Full job details including conditions, pod statuses, and events' },
          { cmd: 'kubectl get job <name> -o yaml',                                 desc: 'Get job manifest as YAML' },
          { cmd: 'kubectl get jobs',                                               desc: 'List jobs in current namespace' },
          { cmd: 'kubectl get jobs -A',                                            desc: 'List all jobs across all namespaces' },
          { cmd: 'kubectl get jobs -n <namespace>',                                desc: 'Jobs in a specific namespace' },
          { cmd: 'kubectl get pods --selector=job-name=<name>',                   desc: 'Find all pods created by a job' },
          { cmd: 'kubectl logs -l job-name=<name>',                               desc: 'Logs from all pods of a job by label' },
          { cmd: 'kubectl wait --for=condition=Complete job/<name> --timeout=120s', desc: 'Wait until job completes successfully' },
          { cmd: 'kubectl wait --for=condition=Failed job/<name>',                desc: 'Wait until job fails (useful in CI to catch errors)' },
        ]
      },
      {
        title: 'CronJobs List & Inspect',
        desc: 'List CronJobs, check their schedule and last execution, and view the full spec.',
        cmds: [
          { cmd: 'kubectl describe cronjob <name>',                               desc: 'Schedule, last run time, and events' },
          { cmd: 'kubectl get cj',                                                 desc: 'Short alias for get cronjobs' },
          { cmd: 'kubectl get cronjob <name> -o yaml',                            desc: 'Get CronJob manifest as YAML' },
          { cmd: 'kubectl get cronjobs',                                           desc: 'List CronJobs in current namespace' },
          { cmd: 'kubectl get cronjobs -A',                                        desc: 'List all CronJobs across all namespaces' },
          { cmd: 'kubectl get cronjobs -n <namespace>',                            desc: 'CronJobs in a specific namespace' },
        ]
      },
    ]
  },

  // ── VOLUMES ───────────────────────────────────────────────
  {
    id: 'volume', title: 'Volumes', icon: ICONS.volume, sub: 'Workloads',
    groups: [
      {
        title: 'PersistentVolumes',
        desc: 'Cluster-wide storage resources provisioned by admins. Created via manifests only, as there is no imperative create command.',
        cmds: [
          { cmd: 'kubectl apply -f pv.yaml',                                       desc: 'Create or update a PersistentVolume' },
          { cmd: 'kubectl delete pv <name>',                                       desc: 'Delete a PersistentVolume' },
          { cmd: 'kubectl describe pv <name>',                                     desc: 'PV details, capacity, claim, and status' },
          { cmd: 'kubectl edit pv <name>',                                         desc: 'Edit PV in-place' },
          { cmd: 'kubectl get pv -o wide',                                         desc: 'PVs with capacity, access modes, claim' },
          { cmd: 'kubectl get pv <name> -o yaml',                                  desc: 'Get PV manifest as YAML' },
          { cmd: 'kubectl get pv',                                                 desc: 'List all PersistentVolumes' },
          { cmd: 'kubectl patch pv <name> -p \'{"spec":{"persistentVolumeReclaimPolicy":"Retain"}}\'', desc: 'Change reclaim policy to Retain' },
        ]
      },
      {
        title: 'PersistentVolumeClaims',
        desc: 'Request and bind storage for workloads. Includes fix for PVCs stuck in Terminating state.',
        cmds: [
          { cmd: 'kubectl apply -f pvc.yaml',                                      desc: 'Create or update a PVC from manifest' },
          { cmd: 'kubectl delete pvc <name>',                                      desc: 'Delete a PVC' },
          { cmd: 'kubectl delete pvc <name> --wait=false',                         desc: 'Delete PVC without waiting (non-blocking)' },
          { cmd: 'kubectl describe pvc <name>',                                    desc: 'PVC details, bound PV and events' },
          { cmd: 'kubectl edit pvc <name>',                                        desc: 'Edit PVC in-place' },
          { cmd: 'kubectl get pvc -A',                                              desc: 'All PVCs across namespaces' },
          { cmd: 'kubectl get pvc -n <namespace>',                                 desc: 'PVCs in a specific namespace' },
          { cmd: 'kubectl get pvc <name> -o yaml',                                 desc: 'Get PVC manifest as YAML' },
          { cmd: 'kubectl get pvc',                                                desc: 'List PVCs in current namespace' },
          { cmd: 'kubectl patch pvc <name> -p \'{"metadata":{"finalizers":null}}\'', desc: 'Remove finalizers to unblock stuck Terminating PVC' },
          { cmd: 'kubectl patch pvc <name> -p \'{"spec":{"resources":{"requests":{"storage":"10Gi"}}}}\'', desc: 'Resize PVC to a new storage size' },
        ]
      },
      {
        title: 'StorageClass',
        desc: 'Define dynamic storage provisioners. Set or change the default StorageClass for the cluster.',
        cmds: [
          { cmd: 'kubectl annotate sc <name> storageclass.kubernetes.io/is-default-class=true', desc: 'Mark StorageClass as default' },
          { cmd: 'kubectl apply -f storageclass.yaml',                             desc: 'Create or update a StorageClass' },
          { cmd: 'kubectl delete sc <name>',                                       desc: 'Delete a StorageClass (short alias)' },
          { cmd: 'kubectl delete storageclass <name>',                             desc: 'Delete a StorageClass' },
          { cmd: 'kubectl describe storageclass <name>',                           desc: 'StorageClass details and provisioner' },
          { cmd: 'kubectl edit storageclass <name>',                               desc: 'Edit StorageClass in $EDITOR' },
          { cmd: 'kubectl get sc -o wide',                                         desc: 'StorageClasses with extra columns' },
          { cmd: 'kubectl get sc <name> -o yaml',                                  desc: 'Get StorageClass manifest as YAML' },
          { cmd: 'kubectl get sc',                                                 desc: 'Short alias for get storageclass' },
          { cmd: 'kubectl get storageclass',                                       desc: 'List all StorageClasses' },
        ]
      },
    ]
  },

  // ── NETWORKING ────────────────────────────────────────────
  {
    id: 'network', title: 'Networking', icon: ICONS.network, sub: 'Workloads',
    groups: [
      {
        title: 'GatewayClass',
        desc: 'Manage GatewayClass resources that define which controller implements a Gateway.',
        cmds: [
          { cmd: 'kubectl delete gatewayclass <name>',                                          desc: 'Delete a GatewayClass' },
          { cmd: 'kubectl describe gatewayclass <name>',                                        desc: 'GatewayClass details and controller' },
          { cmd: 'kubectl get gatewayclass',                                                    desc: 'List all GatewayClasses (cluster-wide)' },
          { cmd: 'kubectl get gatewayclass -o wide',                                            desc: 'List with controller and status columns' },
          { cmd: 'kubectl get gatewayclass <name> -o yaml',                                     desc: 'Get GatewayClass manifest as YAML' },
          { cmd: 'kubectl get gatewayclass <name> -o jsonpath=\'{.status.conditions}\'',        desc: 'Show acceptance conditions' },
          { cmd: 'kubectl annotate gatewayclass <name> <key>=<value>',                          desc: 'Add or update an annotation' },
        ]
      },
      {
        title: 'Gateway API',
        desc: 'Manage Gateways that define the entry points for cluster traffic in the Gateway API model.',
        cmds: [
          { cmd: 'kubectl apply -f gateway.yaml',                                               desc: 'Apply Gateway from manifest' },
          { cmd: 'kubectl delete gateway <name> -n <namespace>',                                desc: 'Delete a Gateway' },
          { cmd: 'kubectl describe gateway <name> -n <namespace>',                              desc: 'Gateway listeners, status, and attached routes' },
          { cmd: 'kubectl edit gateway <name> -n <namespace>',                                  desc: 'Edit Gateway in $EDITOR' },
          { cmd: 'kubectl get gateways -A',                                                     desc: 'All Gateways across namespaces' },
          { cmd: 'kubectl get gateways -n <namespace>',                                         desc: 'Gateways in a namespace' },
          { cmd: 'kubectl get gateways -o wide',                                                desc: 'List with class and address columns' },
          { cmd: 'kubectl get gateway <name> -n <namespace> -o yaml',                           desc: 'Get Gateway manifest as YAML' },
          { cmd: 'kubectl get gateway <name> -n <namespace> -o jsonpath=\'{.status.addresses}\'', desc: 'Show assigned addresses' },
          { cmd: 'kubectl annotate gateway <name> -n <namespace> <key>=<value>',                desc: 'Add or update an annotation' },
        ]
      },
      {
        title: 'HTTPRoutes',
        desc: 'Manage HTTPRoutes and ReferenceGrants for routing traffic to services across namespaces.',
        cmds: [
          { cmd: 'kubectl apply -f httproute.yaml',                                             desc: 'Apply HTTPRoute from manifest' },
          { cmd: 'kubectl apply -f referencegrant.yaml',                                        desc: 'Apply ReferenceGrant from manifest' },
          { cmd: 'kubectl delete httproute <name> -n <namespace>',                              desc: 'Delete an HTTPRoute' },
          { cmd: 'kubectl delete referencegrant <name> -n <namespace>',                         desc: 'Delete a ReferenceGrant' },
          { cmd: 'kubectl describe httproute <name> -n <namespace>',                            desc: 'HTTPRoute rules, parent refs, and status' },
          { cmd: 'kubectl describe referencegrant <name> -n <namespace>',                       desc: 'ReferenceGrant allowed cross-namespace refs' },
          { cmd: 'kubectl edit httproute <name> -n <namespace>',                                desc: 'Edit HTTPRoute in $EDITOR' },
          { cmd: 'kubectl get httproutes -A',                                                   desc: 'All HTTPRoutes across namespaces' },
          { cmd: 'kubectl get httproutes -n <namespace>',                                       desc: 'HTTPRoutes in a namespace' },
          { cmd: 'kubectl get httproutes -o wide',                                              desc: 'List with hostnames and parent refs columns' },
          { cmd: 'kubectl get httproute <name> -n <namespace> -o yaml',                         desc: 'Get HTTPRoute manifest as YAML' },
          { cmd: 'kubectl get httproute <name> -n <namespace> -o jsonpath=\'{.spec.rules}\'',   desc: 'Show routing rules as JSON' },
          { cmd: 'kubectl get referencegrants -n <namespace>',                                  desc: 'ReferenceGrants for cross-namespace routing' },
        ]
      },
      {
        title: 'Ingress',
        desc: 'Manage HTTP/HTTPS routing rules to expose services externally via an ingress controller.',
        cmds: [
          { cmd: 'kubectl apply -f ingress.yaml',                                                             desc: 'Apply Ingress from manifest' },
          { cmd: 'kubectl delete ingress <name>',                                                             desc: 'Delete an Ingress' },
          { cmd: 'kubectl describe ingress <name>',                                                           desc: 'Ingress rules and backend details' },
          { cmd: 'kubectl describe ingress <name> -n <namespace>',                                           desc: 'Ingress details in a specific namespace' },
          { cmd: 'kubectl edit ingress <name>',                                                              desc: 'Edit Ingress in $EDITOR' },
          { cmd: 'kubectl annotate ingress <name> <key>=<value>',                                            desc: 'Add or update an annotation' },
          { cmd: 'kubectl annotate ingress <name> <key>-',                                                   desc: 'Remove an annotation' },
          { cmd: 'kubectl get ing -A',                                                                       desc: 'All Ingresses across namespaces' },
          { cmd: 'kubectl get ingress',                                                                      desc: 'List Ingresses in current namespace' },
          { cmd: 'kubectl get ingress -n <namespace>',                                                       desc: 'Ingresses in a specific namespace' },
          { cmd: 'kubectl get ingress -o wide',                                                              desc: 'List with hosts and address columns' },
          { cmd: 'kubectl get ingress <name> -o yaml',                                                       desc: 'Get Ingress manifest as YAML' },
          { cmd: 'kubectl get ingress <name> -o jsonpath=\'{.spec.rules}\'',                                 desc: 'Show routing rules as JSON' },
          { cmd: 'kubectl patch ingress <name> --type=merge -p \'{"spec":{"ingressClassName":"<class>"}}\'', desc: 'Set IngressClass on an existing Ingress' },
        ]
      },
      {
        title: 'IngressClass',
        desc: 'Manage IngressClass resources that define which controller handles a given Ingress.',
        cmds: [
          { cmd: 'kubectl delete ingressclass <name>',                                                                          desc: 'Delete an IngressClass' },
          { cmd: 'kubectl describe ingressclass <name>',                                                                        desc: 'IngressClass details and controller' },
          { cmd: 'kubectl get ingressclass',                                                                                    desc: 'List all IngressClasses' },
          { cmd: 'kubectl get ingressclass -o wide',                                                                            desc: 'List with controller column' },
          { cmd: 'kubectl get ingressclass <name> -o yaml',                                                                     desc: 'Get IngressClass manifest as YAML' },
          { cmd: 'kubectl annotate ingressclass <name> ingressclass.kubernetes.io/is-default-class=true',                       desc: 'Mark IngressClass as cluster default' },
          { cmd: 'kubectl annotate ingressclass <name> ingressclass.kubernetes.io/is-default-class-',                           desc: 'Remove default-class annotation' },
        ]
      },
      {
        title: 'Network Policies',
        desc: 'Define rules to control ingress and egress traffic between pods and namespaces.',
        cmds: [
          { cmd: 'kubectl apply -f netpol.yaml',                                   desc: 'Apply NetworkPolicy from manifest' },
          { cmd: 'kubectl delete networkpolicy <name>',                            desc: 'Delete a NetworkPolicy' },
          { cmd: 'kubectl describe networkpolicy <name>',                          desc: 'Policy details, pod/namespace selectors' },
          { cmd: 'kubectl edit networkpolicy <name>',                              desc: 'Edit NetworkPolicy in $EDITOR' },
          { cmd: 'kubectl get netpol -A',                                          desc: 'All NetworkPolicies across namespaces' },
          { cmd: 'kubectl get netpol -n <namespace>',                              desc: 'NetworkPolicies in a namespace' },
          { cmd: 'kubectl get networkpolicies',                                    desc: 'List NetworkPolicies' },
          { cmd: 'kubectl get networkpolicy <name> -o yaml',                       desc: 'Get NetworkPolicy manifest as YAML' },
        ]
      },
    ]
  },

  // ── RBAC ──────────────────────────────────────────────────
  {
    id: 'rbac', title: 'RBAC', icon: ICONS.rbac, sub: 'Workloads',
    groups: [
      {
        title: 'Manage Roles & Bindings',
        desc: 'Create and delete namespaced and cluster-wide roles, then bind them to users, groups, or service accounts.',
        cmds: [
          { cmd: 'kubectl create clusterrole <name> --verb=get,list,watch --resource=pods', desc: 'Create a ClusterRole' },
          { cmd: 'kubectl create clusterrolebinding <name> --clusterrole=<role> --serviceaccount=<ns>:<sa>', desc: 'Bind ClusterRole to ServiceAccount' },
          { cmd: 'kubectl create clusterrolebinding <name> --clusterrole=<role> --user=<user>', desc: 'Bind ClusterRole to a user' },
          { cmd: 'kubectl create role <name> --verb=get,list,watch --resource=pods', desc: 'Create a namespaced Role' },
          { cmd: 'kubectl create rolebinding <name> --clusterrole=<role> --user=<user> -n <namespace>', desc: 'Bind ClusterRole in namespace scope' },
          { cmd: 'kubectl create rolebinding <name> --role=<role> --serviceaccount=<ns>:<sa>', desc: 'Bind Role to a ServiceAccount' },
          { cmd: 'kubectl create rolebinding <name> --role=<role> --user=<user>',  desc: 'Bind Role to a user' },
          { cmd: 'kubectl delete clusterrole <name>',                              desc: 'Delete a ClusterRole' },
          { cmd: 'kubectl delete clusterrolebinding <name>',                       desc: 'Delete a ClusterRoleBinding' },
          { cmd: 'kubectl delete role <name> -n <namespace>',                      desc: 'Delete a namespaced Role' },
          { cmd: 'kubectl delete rolebinding <name> -n <namespace>',               desc: 'Delete a RoleBinding' },
        ]
      },
      {
        title: 'ServiceAccounts',
        desc: 'Manage pod identities used for authenticating to the Kubernetes API.',
        cmds: [
          { cmd: 'kubectl create serviceaccount <name>',                           desc: 'Create a ServiceAccount' },
          { cmd: 'kubectl create serviceaccount <name> -n <namespace>',            desc: 'Create a ServiceAccount in a namespace' },
          { cmd: 'kubectl delete serviceaccount <name>',                           desc: 'Delete a ServiceAccount' },
          { cmd: 'kubectl describe sa <name>',                                     desc: 'ServiceAccount details and secrets' },
          { cmd: 'kubectl edit serviceaccount <name>',                             desc: 'Edit ServiceAccount in $EDITOR' },
          { cmd: 'kubectl get sa -A',                                              desc: 'All ServiceAccounts across namespaces' },
          { cmd: 'kubectl get sa -n <namespace>',                                  desc: 'ServiceAccounts in a namespace' },
          { cmd: 'kubectl get sa <name> -o yaml',                                  desc: 'Get ServiceAccount manifest as YAML' },
          { cmd: 'kubectl create token <name>',                                   desc: 'Create a short-lived API token for a ServiceAccount' },
          { cmd: 'kubectl create token <name> --duration=24h',                    desc: 'Create a token with custom expiry' },
          { cmd: 'kubectl create token <name> --bound-object-kind=Pod --bound-object-name=<pod>', desc: 'Bound token tied to a specific pod lifetime' },
          { cmd: 'kubectl get serviceaccounts',                                    desc: 'List ServiceAccounts in namespace' },
        ]
      },
      {
        title: 'Check Permissions',
        desc: 'Identify yourself and verify what actions a user, group, or service account is allowed to perform.',
        cmds: [
          { cmd: 'kubectl auth can-i --list --as=<user>',                          desc: 'List all permissions as another user' },
          { cmd: 'kubectl auth can-i --list -n <namespace>',                       desc: 'List your permissions in a namespace' },
          { cmd: 'kubectl auth can-i --list',                                      desc: 'List all your current permissions' },
          { cmd: 'kubectl auth can-i <verb> <resource> --as=<user>',               desc: 'Check permission as another user' },
          { cmd: 'kubectl auth can-i <verb> <resource> -n <namespace>',            desc: 'Check permission in a specific namespace' },
          { cmd: 'kubectl auth can-i <verb> <resource>',                           desc: 'Check your own permission' },
          { cmd: 'kubectl auth can-i get pods/log --as=<user>',                   desc: 'Check subresource permission' },
          { cmd: 'kubectl auth can-i create pods --as=system:serviceaccount:<ns>:<sa>', desc: 'Check ServiceAccount permission' },
          { cmd: 'kubectl auth whoami',                                             desc: 'Show current user identity (k8s 1.28+)' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'Inspect existing roles, bindings, and the permissions they grant.',
        cmds: [
          { cmd: 'kubectl describe clusterrole <name>',                            desc: 'ClusterRole details and rules' },
          { cmd: 'kubectl describe clusterrolebinding <name>',                     desc: 'ClusterRoleBinding subjects and role ref' },
          { cmd: 'kubectl describe role <name> -n <namespace>',                    desc: 'Role details and allowed verbs/resources' },
          { cmd: 'kubectl describe rolebinding <name> -n <namespace>',             desc: 'RoleBinding subjects and role ref' },
          { cmd: 'kubectl get clusterrole <name> -o yaml',                         desc: 'Get ClusterRole manifest as YAML' },
          { cmd: 'kubectl get clusterrolebindings',                                desc: 'List ClusterRoleBindings' },
          { cmd: 'kubectl get clusterrolebindings -o wide',                        desc: 'ClusterRoleBindings with subjects' },
          { cmd: 'kubectl get clusterroles',                                       desc: 'List ClusterRoles (cluster-wide)' },
          { cmd: 'kubectl get role <name> -o yaml',                                desc: 'Get Role manifest as YAML' },
          { cmd: 'kubectl get rolebindings -A',                                    desc: 'All RoleBindings across namespaces' },
          { cmd: 'kubectl get rolebindings -n <namespace>',                        desc: 'RoleBindings in a namespace' },
          { cmd: 'kubectl get roles -n <namespace>',                               desc: 'Roles in a namespace' },
        ]
      },
    ]
  },

  // ── NAMESPACES ────────────────────────────────────────────
  {
    id: 'namespace', title: 'Namespaces', icon: ICONS.namespace, sub: 'Workloads',
    groups: [
      {
        title: 'Manage',
        desc: 'Create and remove namespaces from the cluster.',
        cmds: [
          { cmd: 'kubectl apply -f namespace.yaml',                                desc: 'Apply namespace from manifest' },
          { cmd: 'kubectl create namespace <name>',                                desc: 'Create a new namespace' },
          { cmd: 'kubectl delete namespace <name>',                                desc: 'Delete a namespace and all its resources' },
          { cmd: 'kubectl label namespace <name> <key>=<value>',                  desc: 'Add or update a label on a namespace' },
          { cmd: 'kubectl label namespace <name> <key>-',                         desc: 'Remove a label from a namespace' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'List namespaces and inspect their resources, quotas, and limits.',
        cmds: [
          { cmd: 'kubectl describe namespace <name>',                              desc: 'Namespace details and resource quotas' },
          { cmd: 'kubectl describe resourcequota -n <namespace>',                  desc: 'Current quota usage vs limits' },
          { cmd: 'kubectl get all -A',                                              desc: 'All resources across all namespaces' },
          { cmd: 'kubectl get all -n <namespace>',                                 desc: 'All resources in a namespace' },
          { cmd: 'kubectl get limitrange -n <namespace>',                          desc: 'Default CPU/memory limits for namespace' },
          { cmd: 'kubectl get namespace <name> -o yaml',                           desc: 'Get namespace manifest as YAML' },
          { cmd: 'kubectl get namespaces',                                         desc: 'List all namespaces' },
          { cmd: 'kubectl get ns',                                                 desc: 'Short alias for get namespaces' },
          { cmd: 'kubectl get resourcequota -n <namespace>',                       desc: 'Resource quotas for a namespace' },
        ]
      },
    ]
  },

  // ── HELM — RELEASES ───────────────────────────────────────
  {
    id: 'helm-releases', title: 'Releases', icon: ICONS['helm-releases'], sub: 'Helm',
    groups: [
      {
        title: 'Install Helm',
        desc: 'Helm is the Kubernetes package manager. Install the CLI via Homebrew or the official script, then verify with helm version.',
        cmds: [
          { cmd: 'brew install helm',                                                                              desc: 'Install via Homebrew (macOS / Linux with brew)' },
          { cmd: 'curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash',              desc: 'Install via official script (Linux / macOS)' },
          { cmd: 'helm version',                                                                                  desc: 'Verify installation and show build info' },
        ]
      },
      {
        title: 'Manage',
        desc: 'Deploy, remove, and modify Helm releases using install and uninstall commands with common flags.',
        cmds: [
          { cmd: 'helm install <release> <chart> --create-namespace -n <namespace>', desc: 'Install and create namespace if missing' },
          { cmd: 'helm install <release> <chart> --dry-run',                        desc: 'Simulate install without applying resources' },
          { cmd: 'helm install <release> <chart> --set <key>=<value>',             desc: 'Install with inline value override' },
          { cmd: 'helm install <release> <chart> --version <ver>',                 desc: 'Install a specific chart version' },
          { cmd: 'helm install <release> <chart> -f values.yaml',                  desc: 'Install with custom values file' },
          { cmd: 'helm install <release> <chart> -n <namespace>',                  desc: 'Install into a specific namespace' },
          { cmd: 'helm install <release> <chart> --atomic',                         desc: 'Install with automatic rollback on failure' },
          { cmd: 'helm install <release> <chart> -f values1.yaml -f values2.yaml', desc: 'Install with multiple values files (last wins)' },
          { cmd: 'helm install <release> <chart>',                                 desc: 'Install a chart' },
          { cmd: 'helm uninstall <release> --keep-history',                        desc: 'Uninstall but keep release history' },
          { cmd: 'helm uninstall <release>',                                       desc: 'Delete a release and all its resources' },
        ]
      },
      {
        title: 'Upgrade & Rollback',
        desc: 'Update a running release to a new chart version and revert on failure.',
        cmds: [
          { cmd: 'helm rollback <release> 0',                                      desc: 'Rollback to previous revision' },
          { cmd: 'helm rollback <release> <revision>',                             desc: 'Rollback to a specific revision' },
          { cmd: 'helm upgrade --install <release> <chart>',                       desc: 'Upgrade or install if not present' },
          { cmd: 'helm upgrade <release> <chart> --atomic',                        desc: 'Upgrade with automatic rollback on failure' },
          { cmd: 'helm upgrade <release> <chart> --cleanup-on-fail',               desc: 'Delete new resources if upgrade fails' },
          { cmd: 'helm upgrade <release> <chart> --reset-values',                  desc: 'Reset values to chart defaults' },
          { cmd: 'helm upgrade <release> <chart> --reuse-values',                  desc: 'Reuse last release values, merge new ones' },
          { cmd: 'helm upgrade <release> <chart> --version <ver> -f values.yaml',  desc: 'Upgrade to a specific chart version' },
          { cmd: 'helm upgrade <release> <chart> --wait',                          desc: 'Wait for all resources to be ready' },
          { cmd: 'helm upgrade <release> <chart> -f values.yaml',                  desc: 'Upgrade with custom values' },
          { cmd: 'helm upgrade <release> <chart>',                                 desc: 'Upgrade a release to a new chart version' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'List deployed releases and inspect their rendered manifests and values.',
        cmds: [
          { cmd: 'helm get manifest <release>',                                    desc: 'Get rendered Kubernetes manifests' },
          { cmd: 'helm get values <release> --all',                                desc: 'Show all computed values (merged)' },
          { cmd: 'helm get values <release>',                                      desc: 'Show user-supplied values for release' },
          { cmd: 'helm list -A',                                                   desc: 'List all releases across namespaces' },
          { cmd: 'helm list -n <namespace>',                                       desc: 'List releases in a namespace' },
          { cmd: 'helm list',                                                      desc: 'List releases in current namespace' },
        ]
      },
    ]
  },

  // ── HELM — CHARTS ─────────────────────────────────────────
  {
    id: 'helm-charts', title: 'Charts', icon: ICONS['helm-charts'], sub: 'Helm',
    groups: [
      {
        title: 'Repositories',
        desc: 'Add, update, search, and remove Helm chart repositories.',
        cmds: [
          { cmd: 'helm repo add <name> <url>',                                     desc: 'Add a chart repository' },
          { cmd: 'helm repo list',                                                 desc: 'List configured repositories' },
          { cmd: 'helm repo remove <name>',                                        desc: 'Remove a repository' },
          { cmd: 'helm repo update',                                               desc: 'Update all configured repos' },
          { cmd: 'helm search hub <keyword>',                                      desc: 'Search charts on Artifact Hub' },
          { cmd: 'helm search repo <keyword>',                                     desc: 'Search charts in configured repos' },
          { cmd: 'helm search repo <keyword> --versions',                          desc: 'List all available versions of a chart' },
        ]
      },
      {
        title: 'Development',
        desc: 'Scaffold, validate, render, and package charts locally before publishing.',
        cmds: [
          { cmd: 'helm create <name>',                                             desc: 'Scaffold a new chart directory' },
          { cmd: 'helm dependency build <chart-dir>',                              desc: 'Rebuild dependencies from Chart.lock (deterministic)' },
          { cmd: 'helm dependency list <chart-dir>',                               desc: 'List chart dependencies and their status' },
          { cmd: 'helm dependency update <chart-dir>',                             desc: 'Update / download chart dependencies' },
          { cmd: 'helm package <chart-dir>',                                       desc: 'Package chart as a .tgz archive' },
          { cmd: 'helm template <release> <chart> -f values.yaml',                 desc: 'Render templates with custom values' },
          { cmd: 'helm template <release> <chart>',                                desc: 'Render templates to stdout locally' },
        ]
      },
      {
        title: 'Chart Info',
        desc: 'Inspect chart metadata, default values, and README before installing.',
        cmds: [
          { cmd: 'helm env',                                                       desc: 'Show Helm environment variables' },
          { cmd: 'helm pull <chart> --untar',                                      desc: 'Download and extract chart directory' },
          { cmd: 'helm pull <chart> --version <ver>',                              desc: 'Download a specific chart version' },
          { cmd: 'helm pull <chart>',                                              desc: 'Download chart archive to current dir' },
          { cmd: 'helm show chart <chart>',                                        desc: 'Display chart metadata (Chart.yaml)' },
          { cmd: 'helm show readme <chart>',                                       desc: 'Display chart README' },
          { cmd: 'helm show values <chart>',                                       desc: 'Display chart default values' },
        ]
      },
      {
        title: 'OCI & Plugins',
        desc: 'Push charts to OCI registries and manage Helm plugins that extend CLI functionality.',
        cmds: [
          { cmd: 'helm plugin install <url>',                                      desc: 'Install a plugin from a URL or path' },
          { cmd: 'helm plugin list',                                               desc: 'List installed plugins' },
          { cmd: 'helm plugin uninstall <name>',                                   desc: 'Remove an installed plugin' },
          { cmd: 'helm plugin update <name>',                                      desc: 'Update an installed plugin' },
          { cmd: 'helm push <chart.tgz> oci://<registry>/<repo>',                 desc: 'Push a packaged chart to OCI registry' },
          { cmd: 'helm registry login <host>',                                     desc: 'Log in to an OCI registry' },
          { cmd: 'helm registry logout <host>',                                    desc: 'Log out from an OCI registry' },
          { cmd: 'helm show chart oci://<registry>/<repo>/<chart>',               desc: 'Show metadata for an OCI chart' },
        ]
      },
    ]
  },

  // ── KUSTOMIZE — BUILD & APPLY ─────────────────────────────
  {
    id: 'kustomize-manage', title: 'Manage', icon: ICONS['kustomize-manage'], sub: 'Kustomize',
    groups: [
      {
        title: 'Install Kustomize',
        desc: 'Kustomize customizes raw Kubernetes YAML without templates. It is built into kubectl (apply -k) and available as a standalone CLI.',
        cmds: [
          { cmd: 'brew install kustomize',                                                                                                     desc: 'Install via Homebrew (macOS / Linux with brew)' },
          { cmd: 'curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash',              desc: 'Install via official script (Linux / macOS)' },
          { cmd: 'kustomize version',                                                                                                          desc: 'Verify installation and show build info' },
        ]
      },
      {
        title: 'Manage',
        desc: 'Render a kustomization overlay and apply it to the cluster. Use kubectl -k flags for the native built-in path, or pipe kustomize build for full control.',
        cmds: [
          { cmd: 'kustomize build <dir>',                                              desc: 'Render overlay to stdout' },
          { cmd: 'kustomize build <dir> | kubectl apply -f -',                         desc: 'Render and apply to cluster' },
          { cmd: 'kustomize build <dir> | kubectl apply --server-side -f -',           desc: 'Render and apply with server-side apply (avoids annotation size limits)' },
          { cmd: 'kustomize build <dir> | kubectl delete -f -',                        desc: 'Render and delete from cluster' },
          { cmd: 'kustomize build <dir> --enable-helm',                                desc: 'Render overlay with embedded Helm chart support' },
          { cmd: 'kustomize build <dir> > output.yaml',                                desc: 'Write rendered manifests to a file' },
          { cmd: 'kubectl apply -k <dir>',                                             desc: 'Apply overlay using kubectl built-in kustomize' },
          { cmd: 'kubectl delete -k <dir>',                                            desc: 'Delete resources defined by overlay' },
          { cmd: 'kubectl kustomize <dir> | kubectl apply -f -',                       desc: 'Render with kubectl built-in, then apply' },
        ]
      },
      {
        title: 'List & Inspect',
        desc: 'Inspect rendered output, diff against the live cluster, and list resources managed by an overlay.',
        cmds: [
          { cmd: 'kubectl kustomize <dir>',                                            desc: 'Render overlay with kubectl built-in (no apply)' },
        ]
      },
    ]
  },

  // ── KUSTOMIZE — EDIT ──────────────────────────────────────
  {
    id: 'kustomize-edit', title: 'Edit', icon: ICONS['kustomize-edit'], sub: 'Kustomize',
    groups: [
      {
        title: 'Resources & Patches',
        desc: 'Add or remove resource files and strategic merge patches directly in kustomization.yaml.',
        cmds: [
          { cmd: 'kustomize edit add resource <file.yaml>',                            desc: 'Add a resource file to kustomization' },
          { cmd: 'kustomize edit remove resource <file.yaml>',                         desc: 'Remove a resource from kustomization' },
          { cmd: 'kustomize edit add patch --path <patch.yaml>',                       desc: 'Add a strategic merge patch' },
          { cmd: 'kustomize edit add patch --path <patch.yaml> --kind <Kind>',         desc: 'Add a patch scoped to a specific resource kind' },
          { cmd: 'kustomize edit remove patch --path <patch.yaml>',                    desc: 'Remove a patch from kustomization' },
        ]
      },
      {
        title: 'Images & Transformers',
        desc: 'Override images, set namespace, add name prefix or suffix, and attach common labels and annotations.',
        cmds: [
          { cmd: 'kustomize edit fix',                                                 desc: 'Auto-migrate kustomization.yaml to current syntax' },
          { cmd: 'kustomize edit set image <name>=<new-image>:<tag>',                  desc: 'Override image name and tag' },
          { cmd: 'kustomize edit set image <name>:<tag>',                              desc: 'Override only the tag of an image' },
          { cmd: 'kustomize edit set namespace <ns>',                                  desc: 'Set namespace for all resources' },
          { cmd: 'kustomize edit set nameprefix <prefix>-',                            desc: 'Add prefix to all resource names' },
          { cmd: 'kustomize edit set namesuffix -<suffix>',                            desc: 'Add suffix to all resource names' },
          { cmd: 'kustomize edit set replicas <name>=<count>',                         desc: 'Override replica count for a resource' },
          { cmd: 'kustomize edit add label <key>:<value>',                             desc: 'Add a common label to all resources' },
          { cmd: 'kustomize edit add annotation <key>:<value>',                        desc: 'Add a common annotation to all resources' },
        ]
      },
      {
        title: 'Generators',
        desc: 'Register ConfigMap and Secret generators that produce resources from literals, files, or env files.',
        cmds: [
          { cmd: 'kustomize edit add configmap <name> --from-literal=<key>=<value>',   desc: 'Add a ConfigMap generator from a literal value' },
          { cmd: 'kustomize edit add configmap <name> --from-file=<file>',             desc: 'Add a ConfigMap generator from a file' },
          { cmd: 'kustomize edit add configmap <name> --from-env-file=<file>',         desc: 'Add a ConfigMap generator from an env file' },
          { cmd: 'kustomize edit add secret <name> --from-literal=<key>=<value>',      desc: 'Add a Secret generator from a literal value' },
          { cmd: 'kustomize edit add secret <name> --from-file=<file>',               desc: 'Add a Secret generator from a file' },
          { cmd: 'kustomize edit remove configmap <name>',                             desc: 'Remove a ConfigMap generator' },
          { cmd: 'kustomize edit remove secret <name>',                               desc: 'Remove a Secret generator' },
        ]
      },
    ]
  },

  // ── K9S — CLI & LAUNCH ───────────────────────────────────
  {
    id: 'k9s-cli', title: 'CLI & Launch', icon: ICONS['k9s-cli'], sub: 'K9s',
    groups: [
      {
        title: 'Install K9s',
        desc: 'K9s is a terminal UI that lets you explore resources, view logs, exec into containers, and port-forward directly from the terminal.',
        cmds: [
          { cmd: 'brew install derailed/k9s/k9s',                                                                                          desc: 'Install via Homebrew (macOS / Linux with brew)' },
          { cmd: 'curl -sS https://webinstall.dev/k9s | bash',                                                                             desc: 'Install via official webi script (Linux / macOS)' },
          { cmd: 'curl -LO https://github.com/derailed/k9s/releases/latest/download/k9s_Linux_amd64.tar.gz && tar xzf k9s_Linux_amd64.tar.gz && sudo mv k9s /usr/local/bin/', desc: 'Install from GitHub release tarball (Linux amd64)' },
          { cmd: 'k9s version',                                                                                                            desc: 'Verify installation and show build info' },
        ]
      },
      {
        title: 'Launch Options',
        desc: 'Start K9s targeting a specific context, namespace, or resource. All flags can be combined.',
        cmds: [
          { cmd: 'k9s',                                                           desc: 'Launch K9s with the current context' },
          { cmd: 'k9s -A',                                                        desc: 'Launch with all namespaces visible' },
          { cmd: 'k9s --command pods',                                            desc: 'Open directly on a specific resource type' },
          { cmd: 'k9s --cluster <name>',                                          desc: 'Use a specific cluster from kubeconfig' },
          { cmd: 'k9s --context <name>',                                         desc: 'Launch using a specific kubeconfig context' },
          { cmd: 'k9s --insecure-skip-tls-verify',                              desc: 'Skip TLS certificate validation for the server' },
          { cmd: 'k9s --kubeconfig <path>',                                      desc: 'Use a specific kubeconfig file' },
          { cmd: 'k9s -n <namespace>',                                           desc: 'Launch scoped to a specific namespace' },
          { cmd: 'k9s --readonly',                                               desc: 'Launch in read-only mode (no mutations allowed)' },
          { cmd: 'k9s --user <name>',                                            desc: 'Use a specific user from kubeconfig' },
        ]
      },
    ]
  },

  // ── K9S — UI SHORTCUTS ───────────────────────────────────
  {
    id: 'k9s-ui', title: 'UI Shortcuts', icon: ICONS['k9s-ui'], sub: 'K9s',
    groups: [
      {
        title: 'Global Shortcuts',
        desc: 'Shortcuts available in any view. Use these to navigate, search, save, and toggle K9s panels.',
        cmds: [
          { cmd: ':',                                                             desc: 'Enter command mode, type a resource name, and press Enter' },
          { cmd: '/',                                                             desc: 'Enter filter mode and type to narrow visible rows' },
          { cmd: '?',                                                             desc: 'Show help and full key binding reference' },
          { cmd: 'Ctrl+a',                                                        desc: 'Show aliases view with all available resource shortcuts' },
          { cmd: 'Ctrl+e',                                                        desc: 'Toggle the top header bar' },
          { cmd: 'Ctrl+g',                                                        desc: 'Toggle breadcrumb trail (crumbs)' },
          { cmd: 'Ctrl+r',                                                        desc: 'Refresh / reload the current view' },
          { cmd: 'Ctrl+s',                                                        desc: 'Save current view output to a file' },
          { cmd: 'Ctrl+u',                                                        desc: 'Clear the command input field' },
          { cmd: 'Ctrl+z',                                                        desc: 'Toggle faults highlighting (shows errored resources)' },
          { cmd: 'Esc',                                                           desc: 'Go back or clear the active filter' },
          { cmd: ':q',                                                            desc: 'Quit K9s' },
        ]
      },
      {
        title: 'Table Navigation',
        desc: 'Vim-style movement and selection within any resource table.',
        cmds: [
          { cmd: 'j',                                                            desc: 'Move cursor down one row' },
          { cmd: 'k',                                                            desc: 'Move cursor up one row' },
          { cmd: 'h',                                                            desc: 'Scroll table left' },
          { cmd: 'l',                                                            desc: 'Scroll table right' },
          { cmd: 'g',                                                            desc: 'Jump to the top of the list' },
          { cmd: 'Shift+g',                                                      desc: 'Jump to the bottom of the list' },
          { cmd: 'Ctrl+f',                                                       desc: 'Page down' },
          { cmd: 'Ctrl+b',                                                       desc: 'Page up' },
          { cmd: 'Tab',                                                          desc: 'Move to the next column / field' },
          { cmd: 'Backtab',                                                      desc: 'Move to the previous column / field' },
          { cmd: 'Space',                                                        desc: 'Mark the selected resource' },
          { cmd: 'Ctrl+Space',                                                   desc: 'Mark a range of resources' },
          { cmd: 'Ctrl+\\',                                                      desc: 'Clear all marks' },
        ]
      },
      {
        title: 'Resource Views',
        desc: 'Jump to any resource by typing its name or short alias in command mode (press : first, then Enter).',
        cmds: [
          { cmd: ':configmaps',                                                  desc: 'ConfigMaps view' },
          { cmd: ':contexts',                                                    desc: 'Contexts view, switch active context' },
          { cmd: ':cronjobs',                                                    desc: 'CronJobs view' },
          { cmd: ':daemonsets',                                                  desc: 'DaemonSets view' },
          { cmd: ':deployments',                                                 desc: 'Deployments view' },
          { cmd: ':events',                                                      desc: 'Cluster events view' },
          { cmd: ':ingresses',                                                   desc: 'Ingresses view' },
          { cmd: ':jobs',                                                        desc: 'Jobs view' },
          { cmd: ':namespaces',                                                  desc: 'Namespaces view, switch active namespace' },
          { cmd: ':nodes',                                                       desc: 'Nodes view' },
          { cmd: ':pods',                                                        desc: 'Pods view' },
          { cmd: ':pvcs',                                                        desc: 'PersistentVolumeClaims view' },
          { cmd: ':secrets',                                                     desc: 'Secrets view' },
          { cmd: ':services',                                                    desc: 'Services view' },
        ]
      },
      {
        title: 'Resource Actions',
        desc: 'General actions available on any selected resource row.',
        cmds: [
          { cmd: 'c',                                                            desc: 'Copy resource name to clipboard' },
          { cmd: 'd',                                                            desc: 'Describe the selected resource' },
          { cmd: 'e',                                                            desc: 'Edit resource YAML in the built-in editor' },
          { cmd: 'Enter',                                                        desc: 'Drill into / open the selected resource' },
          { cmd: 'y',                                                            desc: 'View the full resource YAML' },
          { cmd: 'Shift+a',                                                      desc: 'Sort table by API group' },
          { cmd: 'Shift+c',                                                      desc: 'Sort table by command / name' },
          { cmd: 'Shift+r',                                                      desc: 'Sort table by resource type' },
        ]
      },
      {
        title: 'Pod Actions',
        desc: 'Extra keys available when a pod row is selected in the pods view.',
        cmds: [
          { cmd: 'a',                                                            desc: 'Attach to a running container' },
          { cmd: 'f',                                                            desc: 'Port-forward from the selected pod' },
          { cmd: 'k',                                                            desc: 'Kill (delete) the selected pod' },
          { cmd: 'l',                                                            desc: 'Open log viewer for the selected pod' },
          { cmd: 's',                                                            desc: 'Shell into a container (exec -it)' },
          { cmd: 'Shift+f',                                                      desc: 'Show active port-forward sessions' },
          { cmd: 'Shift+k',                                                      desc: 'Force-kill pod with no grace period' },
        ]
      },
      {
        title: 'Log View',
        desc: 'Shortcuts inside the log viewer. Open with l on a pod.',
        cmds: [
          { cmd: '0',                                                            desc: 'Show merged logs from all containers' },
          { cmd: '1-9',                                                          desc: 'Switch to a specific container by index' },
          { cmd: 'f',                                                            desc: 'Toggle follow mode (auto-scroll to tail)' },
          { cmd: 'p',                                                            desc: 'Toggle previous (terminated) container logs' },
          { cmd: 's',                                                            desc: 'Save current logs to a file' },
          { cmd: 'Shift+f',                                                      desc: 'Toggle full-screen log view' },
          { cmd: 'w',                                                            desc: 'Toggle word wrap' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — INSTALLATION ──────────────────────────
  {
    id: 'troubleshooting-installation', title: 'Installation', icon: ICONS['troubleshooting-installation'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'Kubeadm',
        desc: 'Diagnose control plane and kubelet issues in kubeadm clusters: service health, certificate state, CRI container status, and control plane logs.',
        cmds: [
          { cmd: 'systemctl status kubelet',                                                      desc: 'Check kubelet service state' },
          { cmd: 'journalctl -u kubelet -f',                                                      desc: 'Stream kubelet logs (primary source for join and startup failures)' },
          { cmd: 'journalctl -u kubelet --since "10 minutes ago" | grep -i error',               desc: 'Recent kubelet errors' },
          { cmd: 'kubectl describe node <node>',                                                  desc: 'Node conditions, taints, and event history' },
          { cmd: "kubectl get events -n kube-system --sort-by='.lastTimestamp'",                  desc: 'Recent control plane events sorted by time' },
          { cmd: 'kubectl logs -n kube-system <pod>',                                             desc: 'Logs from a control plane component' },
          { cmd: 'kubectl logs -n kube-system <pod> --previous',                                  desc: 'Logs from a crashed control plane container' },
          { cmd: 'crictl ps -a',                                                                  desc: 'All containers via CRI (works when kubectl is unreachable)' },
          { cmd: 'crictl logs <container-id>',                                                    desc: 'Container logs via CRI without kubectl' },
          { cmd: 'openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -dates',              desc: 'Check API server certificate validity dates' },
        ]
      },
      {
        title: 'k3s',
        desc: 'Debug k3s server and agent failures: service health, configuration validation, and system event inspection.',
        cmds: [
          { cmd: 'systemctl status k3s-agent',                                                    desc: 'k3s agent service state' },
          { cmd: 'journalctl -u k3s --since "5 minutes ago" | grep -i error',                    desc: 'Recent k3s server errors' },
          { cmd: 'journalctl -u k3s-agent --since "5 minutes ago" | grep -i error',              desc: 'Recent k3s agent errors' },
          { cmd: 'k3s check-config',                                                              desc: 'Validate host kernel modules and cgroups required by k3s' },
          { cmd: 'k3s kubectl get pods -n kube-system',                                           desc: 'System pod status via embedded kubectl' },
          { cmd: "k3s kubectl get events -n kube-system --sort-by='.lastTimestamp'",              desc: 'Recent system events sorted by time' },
        ]
      },
      {
        title: 'k3d',
        desc: 'Inspect k3d cluster state and Docker container logs for k3s clusters running inside Docker.',
        cmds: [
          { cmd: 'docker ps -a | grep k3d',                                                      desc: 'Check k3d Docker container states' },
          { cmd: 'docker logs k3d-<cluster>-server-0',                                            desc: 'Logs from the k3s server container' },
          { cmd: 'docker logs k3d-<cluster>-agent-0',                                             desc: 'Logs from a k3s agent container' },
          { cmd: 'docker inspect k3d-<cluster>-server-0',                                         desc: 'Full container inspect: network, mounts, and env' },
          { cmd: 'kubectl get nodes',                                                              desc: 'Node status after setting kubeconfig' },
          { cmd: "kubectl get events -n kube-system --sort-by='.lastTimestamp'",                  desc: 'Recent system events' },
        ]
      },
      {
        title: 'KinD',
        desc: 'Debug KinD clusters by inspecting Docker node containers and diagnosing startup failures.',
        cmds: [
          { cmd: 'docker ps -a | grep kind',                                                     desc: 'Check kind Docker container states' },
          { cmd: 'docker logs <kind-node-container>',                                             desc: 'Logs from a kind node container' },
          { cmd: 'docker inspect <kind-node-container>',                                           desc: 'Full container inspect: mounts and networking' },
          { cmd: 'kubectl cluster-info --context kind-<name>',                                    desc: 'API server endpoint for the cluster' },
          { cmd: 'kubectl get nodes',                                                              desc: 'Node status' },
          { cmd: 'kubectl describe node <node>',                                                  desc: 'Node conditions and event history' },
          { cmd: 'kubectl get pods -n kube-system',                                               desc: 'System pod status' },
          { cmd: "kubectl get events --sort-by='.lastTimestamp'",                                 desc: 'Cluster events sorted by time' },
        ]
      },
      {
        title: 'Minikube',
        desc: 'Diagnose minikube failures: stream cluster logs, inspect the node, and check system pod health.',
        cmds: [
          { cmd: 'minikube logs',                                                                  desc: 'Print all minikube logs' },
          { cmd: 'minikube logs | grep -i error',                                                  desc: 'Filter error lines from minikube logs' },
          { cmd: 'minikube ssh -- journalctl -u kubelet -f',                                       desc: 'Stream kubelet logs from inside the minikube node' },
          { cmd: 'minikube ssh -- crictl ps -a',                                                   desc: 'All container states inside the minikube node' },
          { cmd: 'minikube ssh -- df -h',                                                          desc: 'Disk usage inside the minikube node' },
          { cmd: 'minikube kubectl -- get pods -n kube-system',                                    desc: 'System pod status using bundled kubectl' },
          { cmd: "minikube kubectl -- get events --sort-by='.lastTimestamp'",                      desc: 'Cluster events using bundled kubectl' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — CLUSTER ─────────────────────────────
  {
    id: 'troubleshooting-cluster', title: 'Cluster', icon: ICONS['troubleshooting-cluster'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'Events',
        desc: 'Inspect cluster events to understand what happened to resources: warnings, restarts, scheduling failures.',
        cmds: [
          { cmd: 'kubectl events --watch --types=Warning',                         desc: 'Stream warning events live (kubectl 1.27+)' },
          { cmd: 'kubectl events -n <namespace> --types=Warning',                  desc: 'Modern events CLI: filter by Warning type' },
          { cmd: 'kubectl get events --field-selector=involvedObject.name=<name>', desc: 'Events for a specific object' },
          { cmd: 'kubectl get events --field-selector=type=Warning',               desc: 'Only Warning events' },
          { cmd: "kubectl get events -A --sort-by='.lastTimestamp'",               desc: 'All events sorted by time' },
          { cmd: 'kubectl get events -n <namespace> --watch',                      desc: 'Stream events in real time' },
          { cmd: 'kubectl get events -n <namespace>',                              desc: 'Events in a namespace' },
        ]
      },
      {
        title: 'Live Debug',
        desc: 'Spawn ephemeral containers, debug copies of pods, or get a privileged shell on a node without modifying the original workload.',
        cmds: [
          { cmd: 'kubectl debug <pod> -it --image=busybox --copy-to=<debug-pod> --share-processes', desc: 'Debug copy with shared PID namespace between debug and target containers' },
          { cmd: 'kubectl debug <pod> -it --image=busybox --copy-to=<debug-pod>', desc: 'Debug copy of a pod (when ephemeral containers are not supported)' },
          { cmd: 'kubectl debug -it <pod> --image=alpine --profile=baseline',     desc: 'Default safe profile (no extra capabilities)' },
          { cmd: 'kubectl debug -it <pod> --image=alpine --profile=netadmin',     desc: 'Debug with NET_ADMIN capability profile' },
          { cmd: 'kubectl debug -it <pod> --image=alpine --profile=restricted',   desc: 'Most restrictive profile' },
          { cmd: 'kubectl debug -it <pod> --image=alpine --profile=sysadmin',     desc: 'Debug with SYS_ADMIN capability profile' },
          { cmd: 'kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container>', desc: 'Ephemeral sidecar sharing target PID and net namespace, ideal for distroless images' },
          { cmd: 'kubectl debug node/<node> -it --image=busybox',                 desc: 'Interactive shell on a node via privileged pod' },
        ]
      },
      {
        title: 'Cluster Health',
        desc: 'Check API server reachability, control plane component statuses, and version compatibility.',
        cmds: [
          { cmd: 'kubectl cluster-info dump',                                      desc: 'Full cluster state dump to stdout' },
          { cmd: 'kubectl cluster-info',                                           desc: 'Show API server and DNS endpoints' },
          { cmd: 'kubectl get apiservices',                                        desc: 'APIService resources and their availability state' },
          { cmd: "kubectl get --raw='/livez?verbose'",                             desc: 'API server liveness probe with per-check breakdown' },
          { cmd: "kubectl get --raw='/readyz?verbose'",                            desc: 'API server readiness probe with per-check breakdown' },
          { cmd: 'kubectl get pods -A | grep -v Running',                          desc: 'Show all non-Running pods cluster-wide' },
          { cmd: "kubectl get pods -A --sort-by='.metadata.creationTimestamp'",    desc: 'All pods sorted by creation time' },
          { cmd: 'kubectl get pods -n kube-system',                                desc: 'Status of all control plane component pods' },
          { cmd: 'kubectl logs -n kube-system <pod> --previous',                   desc: 'Logs from a crashed control plane container' },
          { cmd: 'kubectl logs -n kube-system <pod>',                              desc: 'Logs of a control plane component (apiserver, scheduler…)' },
          { cmd: 'kubectl version',                                                desc: 'Client and server versions' },
        ]
      },
      {
        title: 'API Discovery',
        desc: 'Discover what resources the cluster exposes and inspect their schemas. Mirrored from Cluster Health for in-flow debugging.',
        cmds: [
          { cmd: 'kubectl api-resources --api-group=<group>',                      desc: 'Resources in a specific API group' },
          { cmd: 'kubectl api-resources --namespaced=false',                       desc: 'Cluster-scoped resources only' },
          { cmd: 'kubectl api-resources --namespaced=true',                        desc: 'Namespace-scoped resources only' },
          { cmd: 'kubectl api-resources',                                          desc: 'List all available API resources' },
          { cmd: 'kubectl explain <resource> --recursive',                         desc: 'Show full nested field tree' },
          { cmd: 'kubectl explain <resource>.spec.<field>',                        desc: 'Explain a specific nested field' },
          { cmd: 'kubectl explain <resource>',                                     desc: 'Describe a resource and its top-level fields' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — NETWORK ─────────────────────────────
  {
    id: 'troubleshooting-network', title: 'Network', icon: ICONS['troubleshooting-network'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'DNS Resolution',
        desc: 'Verify cluster DNS is working from inside a pod, find the right name for a service, and inspect CoreDNS state.',
        cmds: [
          { cmd: 'kubectl exec -it <pod> -- cat /etc/resolv.conf',                 desc: 'Inspect DNS config inside pod (search domains, nameservers)' },
          { cmd: 'kubectl exec -it <pod> -- dig +short <svc>.<ns>.svc.cluster.local', desc: 'Compact DNS lookup using dig' },
          { cmd: 'kubectl exec -it <pod> -- nslookup <svc>.<ns>.svc.cluster.local', desc: 'Resolve a service FQDN' },
          { cmd: 'kubectl exec -it <pod> -- nslookup kubernetes.default',          desc: 'Test in-cluster DNS resolution' },
          { cmd: 'kubectl get configmap coredns -n kube-system -o yaml',           desc: 'Inspect CoreDNS Corefile config' },
          { cmd: 'kubectl get pods -n kube-system -l k8s-app=kube-dns',            desc: 'List CoreDNS pods serving cluster DNS' },
          { cmd: 'kubectl logs -n kube-system -l k8s-app=kube-dns --tail=100',     desc: 'Recent CoreDNS logs (resolution errors, NXDOMAIN)' },
        ]
      },
      {
        title: 'Service Probes',
        desc: 'Probe services from inside a pod and verify the service has actual ready backends.',
        cmds: [
          { cmd: 'kubectl exec -it <pod> -- curl -I http://<service>',             desc: 'HTTP HEAD to check status code and headers only' },
          { cmd: 'kubectl exec -it <pod> -- curl -v http://<service>:<port>',      desc: 'Verbose HTTP to see full request and response headers' },
          { cmd: 'kubectl exec -it <pod> -- curl http://<service>:<port>',         desc: 'Test HTTP connectivity to service' },
          { cmd: 'kubectl exec -it <pod> -- nc -zv <host> <port>',                 desc: 'Test TCP port reachability' },
          { cmd: 'kubectl exec -it <pod> -- wget -qO- http://<service>',           desc: 'HTTP request with wget from pod (alpine images)' },
          { cmd: 'kubectl get endpointslices -l kubernetes.io/service-name=<service>', desc: 'Modern endpoint slices, replaces the Endpoints API' },
          { cmd: "kubectl get service <name> -o jsonpath='{.spec.selector}'",      desc: 'Service selector (must match pod labels for endpoints to populate)' },
          { cmd: 'kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller --tail=100', desc: 'Recent ingress-nginx controller logs' },
        ]
      },
      {
        title: 'Live Capture',
        desc: 'Spawn a debug pod or attach an ephemeral container that shares the target pod network namespace, then capture or inspect traffic.',
        cmds: [
          { cmd: 'kubectl debug -it <pod> --image=nicolaka/netshoot --target=<container>', desc: 'Ephemeral container in the target net namespace, lets netshoot tcpdump/ss/curl see traffic from the pods perspective' },
          { cmd: 'kubectl exec -it <pod> -- netstat -tlnp',                        desc: 'Listening TCP ports inside the container' },
          { cmd: 'kubectl exec -it <pod> -- ss -tlnp',                             desc: 'Socket stats as a modern alternative to netstat' },
          { cmd: 'kubectl run netshoot --rm -it --image=nicolaka/netshoot -- bash', desc: 'Standalone debug pod with full network toolset (curl, dig, nc, ss, tcpdump…)' },
          { cmd: 'kubectl run netshoot --rm -it --image=nicolaka/netshoot -- tcpdump -i any port <port>', desc: 'Live packet capture from a debug pod' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — STORAGE ─────────────────────────────
  {
    id: 'troubleshooting-storage', title: 'Storage', icon: ICONS['troubleshooting-storage'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'PV and PVC State',
        desc: 'Find PVCs stuck Pending/Lost and trace how PVs map to claims and StorageClasses.',
        cmds: [
          { cmd: 'kubectl get pvc -A | grep -v Bound',                             desc: 'Find non-Bound PVCs across the cluster' },
          { cmd: 'kubectl get pv -o jsonpath=\'{range .items[*]}{.metadata.name}{"\\t"}{.status.phase}{"\\t"}{.spec.claimRef.name}{"\\n"}{end}\'', desc: 'Tab-separated mapping PV → claim → phase' },
          { cmd: 'kubectl get pods -o jsonpath=\'{range .items[*]}{.metadata.name}{":"}{.spec.volumes[*].persistentVolumeClaim.claimName}{"\\n"}{end}\'', desc: 'Map every pod to the PVCs it mounts' },
          { cmd: 'kubectl get storageclass -o jsonpath=\'{.items[?(@.metadata.annotations.storageclass\\.kubernetes\\.io/is-default-class=="true")].metadata.name}\'', desc: 'Find the default StorageClass name' },
        ]
      },
      {
        title: 'Mount Verification',
        desc: 'Verify a volume is actually mounted inside the container with the right size, contents and write permission.',
        cmds: [
          { cmd: 'kubectl exec -it <pod> -- cat /proc/mounts',                     desc: 'Full mount table inside the container' },
          { cmd: 'kubectl exec -it <pod> -- df -h',                                desc: 'Disk space on all mounts to spot full volumes' },
          { cmd: 'kubectl exec -it <pod> -- ls -la <mount-path>',                  desc: 'List mount path contents and permissions' },
          { cmd: 'kubectl exec -it <pod> -- mount | grep <vol>',                   desc: 'Verify a specific volume is mounted' },
          { cmd: 'kubectl exec -it <pod> -- stat <mount-path>',                    desc: 'Inode and ownership details for a path' },
          { cmd: 'kubectl exec -it <pod> -- touch <mount-path>/.write-test && rm <mount-path>/.write-test', desc: 'Verify write permission to a mounted volume' },
        ]
      },
      {
        title: 'Provisioner Debug',
        desc: 'Look at CSI driver pods and provisioning events when PVCs do not get bound.',
        cmds: [
          { cmd: 'kubectl get events --field-selector=reason=ProvisioningFailed -A', desc: 'Provisioning failure events across all namespaces' },
          { cmd: 'kubectl get pods -n kube-system -l app=csi',                     desc: 'CSI driver pods (label selector varies by CSI implementation)' },
          { cmd: 'kubectl logs -n kube-system <csi-pod> -c csi-provisioner --tail=100', desc: 'Provisioner sidecar logs (NotFound, Quota, Auth errors)' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — RESOURCES ───────────────────────────
  {
    id: 'troubleshooting-resources', title: 'Resources', icon: ICONS['troubleshooting-resources'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'Crash Forensics',
        desc: 'Read the last terminated state of a container to learn why it died, plus inspect previous logs.',
        cmds: [
          { cmd: "kubectl get pod <name> -o jsonpath='{.status.containerStatuses[*].lastState.terminated.exitCode}'", desc: 'Exit code from last termination' },
          { cmd: "kubectl get pod <name> -o jsonpath='{.status.containerStatuses[*].lastState.terminated.reason}'", desc: 'Termination reason (OOMKilled, Error, Completed)' },
          { cmd: "kubectl get pod <name> -o jsonpath='{.status.containerStatuses[*].restartCount}'", desc: 'Restart count per container' },
          { cmd: "kubectl get pods -A --sort-by='.status.containerStatuses[0].restartCount'", desc: 'Pods sorted by restart count to spot flappers' },
          { cmd: 'kubectl get pods --field-selector=status.phase=Failed',          desc: 'Find all Failed pods' },
          { cmd: 'kubectl logs <pod> --previous',                                  desc: 'Logs from a crashed/previous container' },
          { cmd: 'kubectl logs <pod> -p -c <container>',                           desc: 'Previous logs for a specific container in a multi-container pod' },
        ]
      },
      {
        title: 'Live Resource Usage',
        desc: 'Real-time CPU and memory usage per pod, container and process. Requires metrics-server for kubectl top.',
        cmds: [
          { cmd: 'kubectl exec -it <pod> -- top',                                  desc: 'Live CPU and memory usage by process inside the container' },
          { cmd: 'kubectl top pod -A --sort-by=cpu',                               desc: 'CPU-heavy pods across all namespaces' },
          { cmd: 'kubectl top pod -A --sort-by=memory',                            desc: 'Memory-heavy pods across all namespaces' },
          { cmd: 'kubectl top pod <name> --containers',                            desc: 'Per-container CPU/memory breakdown within a pod' },
          { cmd: 'kubectl describe quota -n <namespace>',                          desc: 'Current ResourceQuota usage vs hard limits in a namespace' },
        ]
      },
      {
        title: 'Container Limits',
        desc: 'Verify the actual cgroup limits set on a container vs what the spec declared.',
        cmds: [
          { cmd: 'kubectl exec -it <pod> -- cat /proc/meminfo',                    desc: 'Detailed memory stats from inside the container' },
          { cmd: 'kubectl exec -it <pod> -- cat /sys/fs/cgroup/memory.max',        desc: 'Memory limit on cgroup v2' },
          { cmd: 'kubectl exec -it <pod> -- cat /sys/fs/cgroup/memory/memory.limit_in_bytes', desc: 'Memory limit on cgroup v1' },
          { cmd: 'kubectl exec -it <pod> -- cat /sys/fs/cgroup/memory/memory.usage_in_bytes', desc: 'Current memory usage on cgroup v1' },
          { cmd: "kubectl get pod <name> -o jsonpath='{.spec.containers[*].resources}'", desc: 'Declared requests and limits from the pod spec' },
        ]
      },
      {
        title: 'Eviction and Pressure',
        desc: 'Find evicted pods and node pressure conditions that caused them.',
        cmds: [
          { cmd: 'kubectl get events --field-selector=reason=Evicted -A',          desc: 'All eviction events cluster-wide' },
          { cmd: 'kubectl get events --field-selector=reason=FailedToCreatePodSandbox', desc: 'Pod sandbox creation failures' },
          { cmd: 'kubectl get nodes -o jsonpath=\'{range .items[*]}{.metadata.name}{"\\t"}{.status.conditions[?(@.type=="MemoryPressure")].status}{"\\n"}{end}\'', desc: 'MemoryPressure condition per node' },
          { cmd: 'kubectl get pods -A --field-selector=status.phase=Failed -o wide | grep Evicted', desc: 'List evicted pods across the cluster' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — SCHEDULING ──────────────────────────
  {
    id: 'troubleshooting-scheduling', title: 'Scheduling', icon: ICONS['troubleshooting-scheduling'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'Pending Pods',
        desc: 'Find pods stuck Pending and read scheduler events that explain why they cannot be placed.',
        cmds: [
          { cmd: "kubectl get events --field-selector=reason=FailedScheduling -A --sort-by='.lastTimestamp'", desc: 'Recent scheduling failures cluster-wide' },
          { cmd: 'kubectl get events --field-selector=reason=FailedScheduling',    desc: 'Scheduling failure events in current namespace' },
          { cmd: 'kubectl get pods --field-selector=status.phase=Pending -A',      desc: 'Pending pods across all namespaces' },
          { cmd: 'kubectl get pods --field-selector=status.phase=Pending',         desc: 'Find Pending pods in current namespace' },
        ]
      },
      {
        title: 'Constraints Inspection',
        desc: 'Read taints on nodes and tolerations, nodeSelector and affinity rules on pods to spot mismatches.',
        cmds: [
          { cmd: 'kubectl get nodes -o jsonpath=\'{range .items[*]}{.metadata.name}{"\\t"}{.spec.taints}{"\\n"}{end}\'', desc: 'Tab-separated taints per node' },
          { cmd: "kubectl get pod <name> -o jsonpath='{.spec.affinity}'",          desc: 'Pod affinity / anti-affinity rules' },
          { cmd: "kubectl get pod <name> -o jsonpath='{.spec.nodeSelector}'",      desc: 'Pod nodeSelector keys/values' },
          { cmd: "kubectl get pod <name> -o jsonpath='{.spec.tolerations}'",       desc: 'Tolerations the pod is willing to accept' },
        ]
      },
      {
        title: 'Pod Placement',
        desc: 'See where pods actually run and find uneven placement or unexpected nodes.',
        cmds: [
          { cmd: 'kubectl get pods -A -o wide --field-selector=spec.nodeName=<node>', desc: 'All pods on a node across all namespaces' },
          { cmd: 'kubectl get pods -o wide --field-selector=spec.nodeName=<node>', desc: 'All pods on a specific node in current namespace' },
          { cmd: "kubectl get pods -o wide --sort-by='{.spec.nodeName}'",          desc: 'Pods sorted by node name to spot uneven placement' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — HELM ────────────────────────────────
  {
    id: 'troubleshooting-helm', title: 'Helm', icon: ICONS['troubleshooting-helm'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'Failed Releases',
        desc: 'List and inspect failed or stuck Helm releases to understand the cause before attempting a rollback or reinstall.',
        cmds: [
          { cmd: 'helm history <release>',                                         desc: 'Full revision history to spot failures' },
          { cmd: 'helm list --all -A',                                             desc: 'All releases including failed/uninstalled' },
          { cmd: 'helm list --failed -A',                                          desc: 'Failed releases across all namespaces' },
          { cmd: 'helm list --failed',                                             desc: 'List failed releases in current namespace' },
          { cmd: 'helm status <release>',                                          desc: 'Release status and last deploy info' },
        ]
      },
      {
        title: 'Inspect & Debug',
        desc: 'Retrieve notes, hooks, rendered manifests, and run chart test suites to pinpoint issues in a deployed release.',
        cmds: [
          { cmd: 'helm get all <release>',                                         desc: 'All info: values, hooks, manifests, notes' },
          { cmd: 'helm get hooks <release>',                                       desc: 'List hooks defined in the release' },
          { cmd: 'helm get manifest <release>',                                    desc: 'Rendered Kubernetes manifests of release' },
          { cmd: 'helm get notes <release>',                                       desc: 'Show NOTES.txt output of release' },
          { cmd: 'helm install <release> <chart> --dry-run --debug',               desc: 'Simulate install and show debug output' },
          { cmd: 'helm lint <chart-dir>',                                          desc: 'Check chart for errors and warnings' },
          { cmd: 'helm template <release> <chart> --debug',                        desc: 'Render templates with debug output' },
          { cmd: 'helm test <release>',                                            desc: 'Run chart test suite' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — KUSTOMIZE ──────────────────────────
  {
    id: 'troubleshooting-kustomize', title: 'Kustomize', icon: ICONS['troubleshooting-kustomize'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'Debug Build',
        desc: 'Diagnose render failures and validate the output of an overlay before applying it to the cluster.',
        cmds: [
          { cmd: 'kustomize build <dir>',                                              desc: 'Render overlay to see full output or error message' },
          { cmd: 'kustomize build --load-restrictor=LoadRestrictionsNone <dir>',       desc: 'Allow files outside the kustomization root (common path error)' },
          { cmd: 'kustomize build --enable-alpha-plugins <dir>',                       desc: 'Enable exec and KRM function plugins if they fail to load' },
          { cmd: 'kubectl apply -k <dir> --dry-run=client',                            desc: 'Validate rendered manifests against local schema' },
          { cmd: 'kubectl apply -k <dir> --dry-run=server',                            desc: 'Server-side dry-run for admission webhook checks' },
        ]
      },
      {
        title: 'Inspect & Diff',
        desc: 'Compare rendered output against the live cluster state and verify specific fields like images and namespaces.',
        cmds: [
          { cmd: 'kubectl diff -k <dir>',                                              desc: 'Diff overlay against live cluster state' },
          { cmd: 'kubectl get -k <dir>',                                               desc: 'List all resources the overlay manages' },
          { cmd: 'kustomize build <dir> | grep \'image:\'',                            desc: 'Verify image substitutions in rendered output' },
          { cmd: 'kustomize build <dir> | grep \'namespace:\'',                        desc: 'Check namespace assignments in rendered output' },
          { cmd: 'kustomize build <dir> | grep -A5 \'kind: <Kind>\'',                  desc: 'Find a specific resource kind in rendered output' },
        ]
      },
    ]
  },

  // ── TROUBLESHOOTING — K9S ─────────────────────────────────
  {
    id: 'troubleshooting-k9s', title: 'K9s', icon: ICONS['troubleshooting-k9s'], sub: 'Troubleshooting',
    groups: [
      {
        title: 'Diagnose K9s',
        desc: 'Print K9s runtime paths and version, or enable debug logging to identify startup and connection issues.',
        cmds: [
          { cmd: 'k9s info',                                                         desc: 'Print config file path, log path, screen dump dir, and plugin dir' },
          { cmd: 'k9s --logLevel debug',                                             desc: 'Start K9s with debug logging enabled' },
        ]
      },
      {
        title: 'K9s Logs',
        desc: 'Tail the K9s log file to inspect errors, panics, and connection traces. The path depends on your OS.',
        cmds: [
          { cmd: 'tail -f ~/.local/share/k9s/k9s.log',                              desc: 'Follow K9s log on Linux' },
          { cmd: 'tail -f ~/Library/Logs/k9s/k9s.log',                              desc: 'Follow K9s log on macOS' },
          { cmd: 'cat ~/.local/share/k9s/k9s.log | grep -i error',                  desc: 'Filter error lines from K9s log on Linux' },
          { cmd: 'cat ~/Library/Logs/k9s/k9s.log | grep -i error',                  desc: 'Filter error lines from K9s log on macOS' },
        ]
      },
    ]
  },

];

export { COPY_ICON, CHECK_ICON, STAR_ICON, CONTACT_ICON, SPONSOR_ICON, SECTIONS };
