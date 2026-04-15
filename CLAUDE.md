# CLAUDE.md

## Running

```bash
python3 -m http.server 8888 --bind 0.0.0.0
```

No build step. Static HTML/CSS/JS. Deployed to GitHub Pages at `kube.how`.

Docker (nginx):
```bash
docker build -t kube-cheatsheet .
docker run -d --name kube-cheatsheet -p 8080:80 kube-cheatsheet
```

## Architecture

Single-page app, no framework, no bundler. Dependencies: Google Fonts only (Space Grotesk + JetBrains Mono).

**`data.js`** — all content: `SECTIONS` array, `ICONS` object, `COPY_ICON`/`CHECK_ICON` SVGs.

**`app.js`** — runtime logic:
- `CATEGORIES` maps nav keys (`cluster`, `workloads`, `helm`, `kustomize`, `k9s`, `installation`, `troubleshooting`) to section ID arrays
- `SUB_LABELS` is auto-derived from `SECTIONS` — no manual maintenance
- `hl()` tokenizes commands into highlighted HTML spans
- `sortCmds()` sorts commands by subcommand, then flag count, then full string
- All content rendered into `<main id="main">` on `init()`

**Navigation:** two levels. Top row: All | Installation | Cluster | Workloads | Helm | Kustomize | K9s | Troubleshooting. Sub-nav generated dynamically from `CATEGORIES` + `SUB_LABELS`.

**Keyboard:** `1`–`8` switch top tabs, `/` focuses search, `Esc` clears.

## Sections

| id | title | category |
|---|---|---|
| `cluster-health` | Cluster Health | cluster |
| `node` | Nodes | cluster |
| `context` | Contexts | cluster |
| `crd` | Custom Resources | cluster |
| `pod` | Pods | workloads |
| `deployment` | Deployments | workloads |
| `statefulset` | StatefulSets | workloads |
| `daemonset` | DaemonSets | workloads |
| `service` | Services | workloads |
| `config` | ConfigMaps & Secrets | workloads |
| `job` | Jobs & CronJobs | workloads |
| `volume` | Volumes | workloads |
| `network` | Networking | workloads |
| `rbac` | RBAC | workloads |
| `namespace` | Namespaces | workloads |
| `helm-releases` | Releases | helm |
| `helm-charts` | Charts | helm |
| `kustomize-manage` | Manage | kustomize |
| `kustomize-edit` | Edit | kustomize |
| `k9s-cli` | CLI & Launch | k9s |
| `k9s-ui` | UI Shortcuts | k9s |
| `install-kubeadm` | Kubeadm | installation |
| `install-k3s` | k3s | installation |
| `install-k3d` | k3d | installation |
| `install-kind` | KinD | installation |
| `install-minikube` | Minikube | installation |
| `troubleshooting-installation` | Installation | troubleshooting |
| `troubleshooting-kubectl` | Kubectl | troubleshooting |
| `troubleshooting-helm` | Helm | troubleshooting |
| `troubleshooting-kustomize` | Kustomize | troubleshooting |
| `troubleshooting-k9s` | K9s | troubleshooting |

Array order in `SECTIONS` = display order in "All" view. Current order: Installation, Cluster, Workloads, Helm, Kustomize, K9s, Troubleshooting (always last).

The `sub` field on each section is the category label shown in the section header (e.g. `'Workloads'`, `'Cluster'`). Always capitalised.

## Editing content

**Adding commands:** edit only `SECTIONS` in `data.js`. Each group has `cmds: [{ cmd, desc }]`. Every group needs a `desc`. Commands are sorted automatically.

**Adding a workloads sub-section:**
1. Add section to `SECTIONS` in `data.js` at the correct position
2. Add its ID to `CATEGORIES.workloads` in `app.js`

**Adding a new top-level category:**
1. Add sections to `SECTIONS` in `data.js`
2. Add to `CATEGORIES` in `app.js`
3. Add keyboard shortcut to `TOP_KEYS` in `app.js`
4. Add `<button class="nav-btn top-btn top-<name>" data-top="<name>" aria-expanded="false">` in `index.html`
5. Add `--<cat>-color`, `--<cat>-glow`, `--<cat>-border` vars in `:root` in `styles.css`
6. Add `.top-<name>.active` + `.section[data-cat="<name>"]` color rules in `styles.css`
7. Add `#navSub[data-cat="<name>"] .nav-btn.active` rule in `styles.css`

## Conventions

**Group names:** use "Manage" (not "Create & Delete") for mutation-heavy groups; use "List & Inspect" (not "View") for read-only groups, always placed last.

**No em-dashes** anywhere in the project — not in group titles, desc fields, or any user-visible text. Rephrase instead.

**Duplicate commands:** troubleshooting sections take priority. Remove duplicates from main sections, keep in troubleshooting. Exceptions: `kubectl describe pod` stays in Pods; `kubectl get all -n` stays in Namespaces; `helm history` and `helm status` live only in `troubleshooting-helm`.

## Color system

All colors are CSS custom properties in `:root` in `styles.css`. Every category has three vars: `--<cat>-color`, `--<cat>-glow`, `--<cat>-border`. When changing a category color, update all three vars AND grep for two hardcoded rgba values used in gradient rules (`section-header::after` and `card-desc::after`) — CSS can't vary opacity on a custom property inside a gradient.

Category colors: workloads `#79acff`, cluster `#c0bcff`, helm `#7e83ff`, kustomize `#c0ff8d`, k9s `#ffc27c`, installation `#63ffdd`, troubleshooting `#ff7c61`.

Syntax highlighting tokens (in `hl()`): pos 0 = `hl-cmd` (binary), pos 1 non-flag = `hl-sub`, pos 2 lowercase = `hl-res`, `--flag` = `hl-flag`, `--flag=val` splits to `hl-flag` + `hl-val`, `<placeholder>` = `hl-ph`, `'str'`/`{json}` = `hl-str`, `-- | > >>` = `hl-sep`.

`--workloads-color` drives UI chrome. `--hl-cmd` is only for syntax highlighting. Intentionally separate.

## Troubleshooting philosophy

Troubleshooting cards must be genuinely diagnostic, not simple duplicates of `get`/`describe`. Prefer:
- `exec`-based commands (DNS checks, volume verification, traffic diagnostics)
- Unique flags not elsewhere (`--previous`, jsonpath for `lastState`/`restartCount`)
- Debug tools (`kubectl debug`, `nicolaka/netshoot`)
- Cluster-wide one-liners (events by time, pods by restart count)
