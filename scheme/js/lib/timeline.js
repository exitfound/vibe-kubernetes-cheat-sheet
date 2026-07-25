import { reducedMotion } from './motion.js';
import { PULSE_BLOCK } from './tokens.js';
// Design notes: scheme/docs/INTERNALS.md#schemejslibtimelinejs

export class Timeline {
  constructor({ steps, scene, onSceneReset, onChange, onPlayingChange, defaultDuration = 2000, posterFirst = false, autoPulse = true }) {
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
    this._defaultDuration = defaultDuration;
    // When true, steps[0] is a non-narrated "poster" rest frame: auto-play and loop
    // start at step 1 (the first action), and manual Next wraps the last step back to it.
    this.posterFirst = posterFirst;
    this.autoPulse = autoPulse;
    this._destroyed = false;
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
      meta.posterText = this.steps[1].narration || '';
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

    const svgRoot = this._sceneSvg();
    const prevHighlights = svgRoot ? new Set(svgRoot.querySelectorAll('.highlight')) : new Set();

    try { step.enter && step.enter(this.scene, this._ctx(reduced)); }
    catch (e) { console.error('Timeline step enter:', e); }

    if (!reduced && svgRoot && this.autoPulse) {
      const curr = svgRoot.querySelectorAll('.highlight');
      for (const el of curr) {
        if (prevHighlights.has(el)) continue;
        try {
          const a = el.animate(
            [
              { filter: 'brightness(1)' },
              { filter: `brightness(${PULSE_BLOCK.bright})` },
              { filter: 'brightness(1)' },
            ],
            { duration: PULSE_BLOCK.ms, iterations: 1, easing: PULSE_BLOCK.easing }
          );
          a.playbackRate = this.speed;
          this._anims.push(a);
        } catch (_) {}
      }
    }

    this.idx = idx;
    this._notifyChange();
    if (opts.withTimer && !reduced) {
      const baseDur = step.duration || this._defaultDuration;
      let maxAnimEnd = 0;
      for (const a of this._anims) {
        try {
          const t = a.effect && a.effect.getTiming();
          if (!t) continue;
          // Skip infinite-iteration animations: network-model's marchWire is one, and waiting
          // on it would hang the step forever. Do not remove this guard.
          if (!isFinite(t.iterations)) continue;
          const iters = t.iterations || 1;
          const dur   = t.duration   || 0;
          const delay = t.delay      || 0;
          const end   = delay + dur * iters + (t.endDelay || 0);
          if (isFinite(end) && end > maxAnimEnd) maxAnimEnd = end;
        } catch (_) {}
      }
      this._stepDur1x = Math.max(baseDur, maxAnimEnd + 60);
      this._stepConsumed1x = 0;
      this._stepResumeAt = performance.now();
      this._scheduleAdvance();
    }
  }

  _sceneSvg() {
    if (!this.scene) return null;
    return this.scene.refs?.svg
      || (this.scene.host && this.scene.host.querySelector('svg'))
      || null;
  }

  // Apply the poster (steps[0]) resting state without animation, so a following
  // first-action step builds on the correct baseline. Used by play()/loop/Next-wrap.
  _applyPoster() {
    try { this.steps[0] && this.steps[0].enter && this.steps[0].enter(this.scene, this._ctx(true)); }
    catch (_) {}
  }

  _scheduleAdvance() {
    const remaining1x = Math.max(0, this._stepDur1x - this._stepConsumed1x);
    const real = remaining1x / Math.max(0.1, this.speed);
    this._timer = setTimeout(() => {
      this._timer = null;
      if (this.idx < this.steps.length - 1) {
        this._enterStep(this.idx + 1, { withTimer: true });
      } else if (this.loop) {
        this._onSceneReset();
        this._cancelAnims();
        if (this.posterFirst) {
          this._applyPoster();
          this._enterStep(1, { withTimer: true });
        } else {
          this._enterStep(0, { withTimer: true });
        }
      } else {
        this._setPlaying(false);
      }
    }, real);
  }

  play() {
    if (this._destroyed) return;
    this._clearAutoPlay();
    if (this.isLast && !this._timer) {
      this._onSceneReset();
      this.idx = 0;
    }
    this._setPlaying(true);
    if (this.posterFirst && this.idx === 0) {
      // The poster is a rest frame: apply its state, then play the first action step.
      this._applyPoster();
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

  step(dir = 'next') {
    this.pause();
    if (dir === 'next') {
      if (this.posterFirst && this.isLast) {
        // Wrap from the last action back to the blank poster (rest state).
        this._onSceneReset();
        this._cancelAnims();
        this._applyPoster();
        this.idx = 0;
        this._notifyChange();
      } else if (!this.isLast) {
        this._enterStep(this.idx + 1, { withTimer: false });
      }
    } else {
      if (this.isFirst) return;
      const target = this.idx - 1;
      this._onSceneReset();
      this._cancelAnims();
      for (let j = 0; j <= target; j++) {
        const step = this.steps[j];
        try { step.enter && step.enter(this.scene, this._ctx(true)); } catch (_) {}
      }
      this.idx = target;
      this._notifyChange();
    }
  }

  reset() {
    this.pause();
    this._onSceneReset();
    this._cancelAnims();
    this.idx = 0;
    try {
      const step = this.steps[0];
      step.enter && step.enter(this.scene, this._ctx(true));
    } catch (_) {}
    this._notifyChange();
  }

  restart() {
    this.pause();
    this._onSceneReset();
    this._cancelAnims();
    this.idx = 0;
    this.play();
  }

  gotoStep(target) {
    this.pause();
    if (target < 0 || target >= this.steps.length) return;
    this._onSceneReset();
    this._cancelAnims();
    for (let j = 0; j <= target; j++) {
      const step = this.steps[j];
      try { step.enter && step.enter(this.scene, this._ctx(true)); } catch (_) {}
    }
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
