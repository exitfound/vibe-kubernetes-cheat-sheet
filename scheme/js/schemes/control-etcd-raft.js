import { svg, g, line, text } from '../lib/svg.js';
import { arrowDefs, box, cylinder, arrow, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, routePacket, segmentPacket, makeInit, clearHighlights, clearWires, setWire } from '../lib/control-kit.js';

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 -75 1200 620',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'ETCD Raft Consensus: replicate, ack, commit',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Laid out at scale 1.0 (no shrink wrapper) so every block and its text match
    // the size in the other cards pixel-for-pixel. translate keeps ~20px margins.
    const content = g({ transform: 'translate(-20, 32)' });

    // ETCD replicas spaced 200 apart (40px gaps) so they read as distinct nodes.
    const e1 = cylinder({ x: 380, y: 40, w: 160, h: 130, label: 'ETCD-1', cat: 'control' });
    const e2 = cylinder({ x: 580, y: 40, w: 160, h: 130, label: 'ETCD-2', cat: 'control' });
    const e3 = cylinder({ x: 780, y: 40, w: 160, h: 130, label: 'ETCD-3', cat: 'control' });
    content.appendChild(e1); content.appendChild(e2); content.appendChild(e3);

    // term/acks/quorum: chain step-row height (rowH 32, gap 10), same as every
    // other card now that the shrink wrapper is gone. Width 240 keeps the right margin.
    const termChip   = valChip({ x: 960, y: 40,  w: 240, h: 32, name: 'term',             value: '4' });
    const acksChip   = valChip({ x: 960, y: 82,  w: 240, h: 32, name: 'acks (entry 9)', value: 'idle' });
    const quorumChip = valChip({ x: 960, y: 124, w: 240, h: 32, name: 'quorum',           value: '2 of 3' });
    content.appendChild(termChip); content.appendChild(acksChip); content.appendChild(quorumChip);

    const r1 = valChip({ x: 380, y: 190, w: 160, name: 'role', value: 'Leader' });
    const r2 = valChip({ x: 580, y: 190, w: 160, name: 'role', value: 'Follower' });
    const r3 = valChip({ x: 780, y: 190, w: 160, name: 'role', value: 'Follower' });
    content.appendChild(r1); content.appendChild(r2); content.appendChild(r3);

    const l1 = valChip({ x: 380, y: 230, w: 160, name: 'log/commit', value: '8 / 8' });
    const l2 = valChip({ x: 580, y: 230, w: 160, name: 'log/commit', value: '8 / 8' });
    const l3 = valChip({ x: 780, y: 230, w: 160, name: 'log/commit', value: '8 / 8' });
    content.appendChild(l1); content.appendChild(l2); content.appendChild(l3);

    const api = box({ x: 40, y: 320, w: 220, h: 80, label: 'Api', cat: 'control' });
    content.appendChild(api);

    content.appendChild(pathArrow({ points: [[260, 360], [320, 360], [320, 105], [380, 105]], dim: true, dashed: true, color: 'control' }));
    content.appendChild(arrow({ x1: 540, y1: 105, x2: 580, y2: 105, dim: true, dashed: true, color: 'control' }));
    content.appendChild(pathArrow({ points: [[460, 40], [460, 8], [860, 8], [860, 40]], dim: true, dashed: true, color: 'control' }));

    // Tie each ETCD replica to the role chip directly below it (a binding, not flow).
    content.appendChild(line({ class: 'scheme-arrow scheme-arrow-control', x1: 460, y1: 170, x2: 460, y2: 190 }));
    content.appendChild(line({ class: 'scheme-arrow scheme-arrow-control', x1: 660, y1: 170, x2: 660, y2: 190 }));
    content.appendChild(line({ class: 'scheme-arrow scheme-arrow-control', x1: 860, y1: 170, x2: 860, y2: 190 }));

    const wireProposal  = text({ class: 'scheme-label code dim', x: 0, y: -6, 'text-anchor': 'middle', transform: 'translate(320, 240) rotate(-90)' }, [' ']);
    const wireReplicate = text({ class: 'scheme-label code dim', x: 660, y: -2,  'text-anchor': 'middle' }, [' ']);
    content.appendChild(wireProposal); content.appendChild(wireReplicate);

    const packetLayer = g({ id: 'packetLayer' });
    content.appendChild(packetLayer);

    root.appendChild(content);
    this.host.appendChild(root);
    this.refs = {
      svg: root, api, e1, e2, e3, r1, r2, r3, l1, l2, l3, termChip, acksChip, quorumChip,
      wires: { proposal: wireProposal, replicate: wireReplicate },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function clearHL(s) {
  clearHighlights(s, ['api','e1','e2','e3','r1','r2','r3','l1','l2','l3','termChip','acksChip','quorumChip']);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Three ETCD replicas form the cluster behind the Api: one elected Leader and two Followers, all on the same term 4, the logical clock that counts leader elections. Every replica holds an identical log of 8 committed entries, so all three already agree on the current state. A write needs a quorum of 2 of 3 replicas to be durable, which is what lets the cluster keep running when one Node fails.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.r1, 'Leader');
      setVal(s.refs.r2, 'Follower');
      setVal(s.refs.r3, 'Follower');
      setVal(s.refs.l1, '8 / 8');
      setVal(s.refs.l2, '8 / 8');
      setVal(s.refs.l3, '8 / 8');
      setVal(s.refs.termChip, '4');
      setVal(s.refs.acksChip, 'idle');
      setVal(s.refs.quorumChip, '2 of 3');
    },
  },
  {
    id: 'proposal',
    duration: 1900,
    narration: 'The Api issues a write for a new Pod, the only path by which Kubernetes state ever reaches ETCD. Every write is funneled through the Leader so the cluster has a single point that orders all changes. A request that lands on a Follower is not served there but forwarded to the Leader internally, so clients never observe a split view.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      s.refs.api.classList.add('highlight');
      s.refs.e1.classList.add('highlight');
      setWire(s, 'proposal', 'write Pod · via Leader');
      if (ctx.reduced) return;
      routePacket(s, ctx, [[260, 360], [320, 360], [320, 105], [380, 105]]);
    },
  },
  {
    id: 'append-log',
    duration: 1700,
    narration: 'The Leader appends the write as entry 9 in its own log, right after the 8 entries already stored. For now the entry lives on a single replica and stays uncommitted, so commitIndex is still 8 and the new Pod is invisible to readers. Nothing becomes durable until a majority of replicas also hold it.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l1, '9 / 8');
      setVal(s.refs.acksChip, '0');
      s.refs.e1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
    },
  },
  {
    id: 'replicate',
    duration: 2100,
    narration: 'The Leader sends an AppendEntries RPC carrying entry 9 to both Followers at once. Each Follower verifies that the term matches and that its log already lines up at index 8 before accepting, which is what keeps the replicas from ever diverging. After writing entry 9 to its own log, each Follower returns an ack to the Leader.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l2, '9 / 8');
      setVal(s.refs.l3, '9 / 8');
      setVal(s.refs.acksChip, '1 (then 2)');
      setWire(s, 'replicate', 'AppendEntries · entry 9');
      s.refs.e1.classList.add('highlight');
      s.refs.e2.classList.add('highlight');
      s.refs.e3.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l3.classList.add('highlight');
      if (ctx.reduced) return;
      // Both AppendEntries leave together: a short hop to the near Follower and
      // the over-the-top route to the far one, each at natural travel speed.
      segmentPacket(s, ctx, { from: [540, 105], to: [580, 105] });
      routePacket(s, ctx, [[460, 40], [460, 8], [860, 8], [860, 40]]);
    },
  },
  {
    id: 'quorum',
    duration: 1900,
    narration: 'The Leader counts how many replicas now hold entry 9: itself plus at least one Follower makes 2 of 3, which meets quorum. With a majority persisted, entry 9 is committed and can no longer be lost, so the Leader advances commitIndex to 9 and reports the write back to the Api as durable.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l1, '9 / 9');
      setVal(s.refs.acksChip, '2 / 3 ✓');
      s.refs.e1.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.acksChip.classList.add('highlight');
      s.refs.quorumChip.classList.add('highlight');
    },
  },
  {
    id: 'apply',
    duration: 1900,
    narration: 'On the next heartbeat the Leader carries the new commitIndex to the Followers, signalling that entry 9 is safe to apply. Each Follower applies entry 9 to its state machine, the key-value view that clients actually read from. All three replicas now hold the Pod at index 9, and every read from here on returns it consistently.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setVal(s.refs.l2, '9 / 9');
      setVal(s.refs.l3, '9 / 9');
      s.refs.e1.classList.add('highlight');
      s.refs.e2.classList.add('highlight');
      s.refs.e3.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l3.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
