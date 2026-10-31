import { reducedMotion } from './motion.js';
import { playedHold } from './tokens.js';

export class Timeline {
  constructor({ steps, scene, onSceneReset, onChange, onPlayingChange, narrationOf, posterFirst = false }) {
    this.steps = steps;
    this.scene = scene;
    this.idx = 0;
    this.playing = false;
    this.speed = 1;
    this.loop = true;
    this._timer = null;
    this._autoPlayTimer = null;
    this._anims = [];
    this._onChange = onChange || (() => {});
    this._onPlayingChange = onPlayingChange || (() => {});
    this._onSceneReset = onSceneReset || (() => {});
    // The text the reader is shown for a step, translated by the dialog while Russian is on. The
    // reading-time floor of the hold counts this text, not the English.
    this._narrationOf = narrationOf || ((s) => s.narration || '');
    // When true, steps[0] is a non-narrated "poster" rest frame: auto-play and loop
    // start at step 1 (the first action), and manual Next wraps the last step back to it.
    this.posterFirst = posterFirst;
    this._destroyed = false;
    // Set only when a run stops on its own at the last step: a Play after that starts over, a Play
    // after a pause on the last step plays that step again.
    this._finished = false;
    queueMicrotask(() => this._notifyChange());
  }

  get current() { return this.steps[this.idx]; }
  get total()   { return this.steps.length; }
  get isFirst() { return this.idx <= 0; }
  get isLast()  { return this.idx >= this.steps.length - 1; }

  _ctx(reduced) {
    const tl = this;
    return {
      reduced: reduced ?? reducedMotion(),
      speed: this.speed,
      register: (anim) => {
        if (anim) {
          try { anim.playbackRate = tl.speed; } catch (_) {}
          tl._anims.push(anim);
        }
        return anim;
      },
    };
  }

  _cancelAnims() {
    for (const a of this._anims) {
      try { a.cancel(); } catch (_) {}
    }
    this._anims = [];
  }

  _clearTimer() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
  }

  // Auto-play after the opening poster dwell, owned by the Timeline so any explicit action cancels
  // it: no playback after the reader has interacted, and no race with a headless step probe.
  autoPlay(ms) {
    this._clearAutoPlay();
    this._autoPlayTimer = setTimeout(() => {
      this._autoPlayTimer = null;
      if (!this._destroyed) this.play();
    }, ms);
  }
  _clearAutoPlay() {
    if (this._autoPlayTimer) { clearTimeout(this._autoPlayTimer); this._autoPlayTimer = null; }
  }

  _setPlaying(p) {
    if (this.playing === p) return;
    this.playing = p;
    this._onPlayingChange(p);
  }

  _notifyChange() {
    const meta = { posterFirst: this.posterFirst };
    // On the poster, preview the first action step's text so it shows immediately on
    // open (only the diagram animation waits for the dwell).
    if (this.posterFirst && this.idx === 0 && this.steps[1]) {
      meta.posterText = this._narrationOf(this.steps[1]);
    }
    this._onChange(this.idx, this.current, this.steps.length, meta);
  }

  isPlaying() { return this.playing; }

  _enterStep(idx, opts = {}) {
    if (this._destroyed) return;
    const reduced = opts.reduced ?? reducedMotion();
    this._cancelAnims();
    this._clearTimer();
    const step = this.steps[idx];
    if (!step) return;
    this._finished = false;

    // A throw inside enter() is SWALLOWED into console.error, so one broken step cannot take the
    // dialog down. The cost: a missing import reads as a step that stops after its first packet.
    try { step.enter && step.enter(this.scene, this._ctx(reduced)); }
    catch (e) { console.error('Timeline step enter:', e); }

    this.idx = idx;
    this._notifyChange();
    // The reduced path plays too, as still frames: it registers no animation, so the hold is the
    // reading time alone.
    if (opts.withTimer) {
      const baseDur = step.duration;
      let maxAnimEnd = 0;
      for (const a of this._anims) {
        try {
          const t = a.effect && a.effect.getTiming();
          if (!t) continue;
          // Skip infinite-iteration animations: network-flat-pod-network's marchWire is one, and waiting
          // on it would hang the step forever. Do not remove this guard.
          if (!isFinite(t.iterations)) continue;
          const iters = t.iterations || 1;
          const dur   = t.duration   || 0;
          const delay = t.delay      || 0;
          const end   = delay + dur * iters + (t.endDelay || 0);
          if (isFinite(end) && end > maxAnimEnd) maxAnimEnd = end;
        } catch (_) {}
      }
      const hold = playedHold(baseDur, maxAnimEnd, this._narrationOf(step).length);
      this._stepDur1x = Math.max(hold, maxAnimEnd + 60);
      this._stepConsumed1x = 0;
      this._stepResumeAt = performance.now();
      this._scheduleAdvance();
    }
  }

  // A fresh scene with the first `count` steps entered at once. Their highlight changes would each
  // run the 0.3s CSS transition from the fresh tree, a pulse on blocks the next step never touches,
  // so transitions are off until the rebuilt state is computed. `hold` leaves them off for the caller.
  _rebuild(count, hold = false) {
    const host = this.scene && this.scene.host;
    if (host) host.classList.add('diagram-instant');
    this._onSceneReset();
    this._cancelAnims();
    for (let j = 0; j < count; j++) {
      const step = this.steps[j];
      try { step.enter && step.enter(this.scene, this._ctx(true)); } catch (_) {}
    }
    if (!hold) this._endInstant();
  }

  _endInstant() {
    const host = this.scene && this.scene.host;
    if (!host) return;
    void host.offsetWidth;
    host.classList.remove('diagram-instant');
  }

  _scheduleAdvance() {
    const remaining1x = Math.max(0, this._stepDur1x - this._stepConsumed1x);
    const real = remaining1x / Math.max(0.1, this.speed);
    this._timer = setTimeout(() => {
      this._timer = null;
      if (this.idx < this.steps.length - 1) {
        this._enterStep(this.idx + 1, { withTimer: true });
      } else if (this.loop) {
        this._rebuild(this.posterFirst ? 1 : 0);
        this._enterStep(this.posterFirst ? 1 : 0, { withTimer: true });
      } else {
        this._finished = true;
        this._setPlaying(false);
      }
    }, real);
  }

  play() {
    if (this._destroyed) return;
    this._clearAutoPlay();
    if (this.isLast && this._finished) {
      this._rebuild(0);
      this.idx = 0;
    }
    this._setPlaying(true);
    if (this.posterFirst && this.idx === 0) {
      // The poster is a rest frame: apply its state, then play the first action step.
      this._rebuild(1);
      this._enterStep(1, { withTimer: true });
    } else {
      this._enterStep(this.idx, { withTimer: true });
    }
  }

  pause() {
    this._clearAutoPlay();
    this._clearTimer();
    for (const a of this._anims) {
      try { a.pause(); } catch (_) {}
    }
    this._setPlaying(false);
  }

  // Prev, Next and a step dot all PLAY the step they land on, from the finished state of the one
  // before it, and keep playing if the player was. Next on the last step of a poster card wraps to
  // the poster, which is a rest frame.
  step(dir = 'next') {
    if (dir === 'next') {
      if (this.posterFirst && this.isLast) this._animateTo(0);
      else if (!this.isLast) this._animateTo(this.idx + 1);
    } else if (!this.isFirst) {
      this._animateTo(this.idx - 1);
    }
  }

  playStep(target) {
    if (target >= 0 && target < this.steps.length) this._animateTo(target);
  }

  // The step on screen once more. On the poster that is the first action step.
  replay() {
    this._animateTo(this.posterFirst && this.idx === 0 ? 1 : this.idx);
  }

  _animateTo(target) {
    if (this._destroyed) return;
    const keep = this.playing;
    this._clearAutoPlay();
    this._clearTimer();
    if (this.posterFirst && target === 0) {
      this._rebuild(1);
      this.idx = 0;
      this._setPlaying(false);
      this._notifyChange();
      return;
    }
    // Every move rebuilds, so Next pressed mid-flight still starts from the finished step (S-14 holds
    // the rebuilt frame equal to the played one). Only Next keeps the transitions: a replay, Prev or a
    // jump lands on a state the reader was not looking at, where a fading highlight reads as a pulse.
    const onward = target === this.idx + 1;
    this._rebuild(target, !onward);
    this._enterStep(target, { withTimer: keep });
    if (!onward) this._endInstant();
    if (!keep) this._setPlaying(false);
  }

  reset() {
    this.pause();
    this._rebuild(1);
    this.idx = 0;
    this._notifyChange();
  }

  restart() {
    this.pause();
    this._rebuild(0);
    this.idx = 0;
    this.play();
  }

  gotoStep(target) {
    this.pause();
    if (target < 0 || target >= this.steps.length) return;
    this._rebuild(target + 1);
    this.idx = target;
    this._notifyChange();
  }

  setLoop(enabled) { this.loop = !!enabled; }
  isLooping() { return !!this.loop; }

  setSpeed(rate) {
    if (rate === this.speed) return;
    const wasRate = this.speed;
    for (const a of this._anims) {
      try { a.playbackRate = rate; } catch (_) {}
    }
    if (this._timer && this.playing) {
      const wallElapsed = performance.now() - this._stepResumeAt;
      this._stepConsumed1x += wallElapsed * wasRate;
      this._stepResumeAt = performance.now();
      clearTimeout(this._timer);
      this._timer = null;
      this.speed = rate;
      this._scheduleAdvance();
    } else {
      this.speed = rate;
    }
  }

  destroy() {
    this._destroyed = true;
    this.pause();
    this._cancelAnims();
    this.scene = null;
  }
}
