<p align="center">
  <a href="https://kube.how/diagrams/"><img src="../.github/readme/diagrams-header.svg" width="100%" alt="kube.how Diagrams: how Kubernetes works, one step at a time, in four categories: Cluster, Workloads, Networking and Storage"></a>
</p>

The diagram half of [kube.how](https://kube.how/): animated diagrams of how Kubernetes actually works inside. Each card opens a dialog that plays the mechanism step by step, with a narration panel explaining what moves and why, and the Kubernetes documentation it is based on. Live at **[kube.how/diagrams](https://kube.how/diagrams/)**.

[← Back to the main README](../README.md) · [Русский](./README.ru.md)

<p align="center">
  <img src="../.github/readme/diagrams-grid.webp" width="100%" alt="The Diagrams grid: Control Plane cards such as Cluster Architecture, Object Create Path and Admission Chain, each with a poster, a description and a k8s version label">
</p>

## What it covers

| Category | Colour | Sections |
|---|---|---|
| **Cluster** | indigo | Control Plane, Node Runtime, Node Lifecycle |
| **Workloads** | sky blue | Pods Bootstrap, Pods Lifecycle, Controllers |
| **Networking** | cyan | Network Foundations, Pod Networking, Services & Endpoints, External Traffic, DNS & Service Discovery |
| **Storage** | jade | Volume Foundations, Volumes & Claims, CSI & Mount Path, Stateful Data |

Every card is checked against the Kubernetes release it names (`k8s 1.36` on the card) and links its sources. Every diagram also has its own static page, for example [kube.how/diagrams/card/cluster-architecture/](https://kube.how/diagrams/card/cluster-architecture/): the poster, the full step-by-step explanation and the sources, readable on any screen. [kube.how/diagrams/card/](https://kube.how/diagrams/card/) lists them all.

## How to use it

- **Click a card** to open its diagram. It starts on a still poster, then plays the first step.
- **Flip between diagrams** without closing the dialog, with the side arrows or `Shift` + `←` / `→`.
- **Star a diagram** from its card or from inside the open diagram to collect it in the Starred view.
- **Report a problem** from inside a diagram: the flag button opens a GitHub issue that already names the card and the step you are on.
- **Save it for your slides** from the download button in the dialog header: the step on screen as a PNG, or the whole animation as a GIF.
- **Two grid views**: detailed cards with the full description, or compact tiles that fit three to five times as many on a screen. The switch sits at the right end of the category row and is remembered.
- **Search and filter** by category, or search across titles and descriptions. New diagrams since your last visit carry a `NEW` badge until you open them.
- **Deep links**: `kube.how/diagrams/#diagram=<id>` opens a diagram, and the address follows the step you are on, so you can share it as is. The link icon beside a section title copies `kube.how/diagrams/#at=<section>`.
- **English or Russian**: the language button at the right end of the header switches the card descriptions, the dialog buttons and the narration. Labels drawn inside a diagram stay English, as in the Kubernetes documentation.
- **Reduced motion** is respected: with `prefers-reduced-motion` each step snaps to its end state.
- **Desktop first**: on a phone the page shows a short notice with a link to the static pages, which read fine on any screen.

### Keyboard

| Key | Action |
|---|---|
| `Space` | Play or pause |
| `←` / `→` | Previous or next step |
| `Shift` + `←` / `→` | Previous or next diagram |
| `R` | Restart |
| `L` | Loop |
| `F` | Fullscreen |
| `Esc` | Close the diagram, or clear the search in the catalogue |
| `Enter` | Open the focused card |
| `/` | Jump to search |
| `?` | Show every shortcut |

The letter keys work on a Russian keyboard layout too.

## How it is built

Every diagram is hand-built SVG, moved by the Web Animations API inside a native `<dialog>`. No diagram library, no canvas, no WebGL, no build step.

```
diagrams/
  index.html
  js/app.js                    grid and hash routing
  js/dialog.js                 the card dialog, its player and keys
  js/data.js                   the category registry and the four card catalogues
  js/posters.js                the four poster maps, merged
  js/lib/                      SVG helpers, primitives, timeline, motion, layout tokens, PNG and GIF export
  js/lang/                     Russian descriptions and narration, loaded only while Russian is on
  js/diagrams/<category>/      one folder per category:
    cards.js                     the catalogue: id, title, description, version, sources
    posters.js                   the grid thumbnails
    <category>-kit.js            the category tint and drawing helpers
    <id>.js                      one module per diagram
  css/                         tokens (category colours), layout, SVG classes, static pages
  card/                        generated static page and poster SVG per diagram (build output, not in git)
  test/                        the test suite (never shipped)
  CANON.md                     the rulebook every diagram is held to
```

### A diagram is data

Each `<id>.js` is loaded only when its dialog opens and exports a scene, its steps and an `init` built from them:

```js
export const SCENE = {
  'aria-label': '...',
  parts: [ /* boxes, lanes, pods, chips, in z-order */ ],
};
export const STEPS_SPEC = [
  {
    id: 'api',
    duration: 3600,
    narration: 'The API is the only way in for clients and controllers...',
    flow: [ /* balls, tags, pulses, fades */ ],
  },
];
export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
```

`SCENE.parts` draws the picture, in order. Each step states its labels and values, and its `flow` is the motion program, played in list order: a ball rides a lane, carries its tag, and pulses the Pod it lands on. The same steps drive the reduced-motion path and the text of the static card page.

## Adding a diagram

A new diagram is a one-folder change inside `js/diagrams/<category>/`. Read [`CANON.md`](./CANON.md) and that folder's existing cards first: build on its `<category>-kit.js` and copy an exemplar's shape rather than starting from scratch.

1. Write `<id>.js`. The id starts with the category, for example `network-dns-coredns`. Under its imports goes exactly one pointer comment to its own record, `// Design notes for this card: ./CARDS/<id>.md`: an exemplar copied whole carries the exemplar's pointer, and the gate rejects it.
2. Write that record, `CARDS/<id>.md`, in the shape of its neighbours: what the card shows, and any rule it breaks on purpose.
3. Add its entry to `cards.js`: title, subcategory, a three-sentence description, the Kubernetes version and the sources.
4. Draw its grid poster in `posters.js`.
5. Generate the static page and the sitemap entry, then run the gate. The generator also updates `js/revisions.js` and `tools/pages/dates.json`, which are committed with the card:

```bash
node tools/pages/build.mjs                  # from the repository root
python3 -m http.server 8888                 # from the repository root, in a second terminal
cd diagrams/test && npm ci && npx playwright install chromium
npm test                                    # unit tests plus a browser walk through every step
```

`DIAGRAM_IDS=<id> npm test` narrows the browser walk to one card while you work, and `npm run docs:sync` updates the counts in the main README. Then look at the diagram itself in a browser: a lane ending in empty space or a label drifting off its ball is invisible to every check. Adding `?inspect=1` to the page URL draws a coordinate grid over the diagram.
