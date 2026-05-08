import { reducedMotion } from './motion.js';

export class Timeline {
  constructor({ steps, scene, onSceneReset, onChange, onPlayingChange, defaultDuration = 2000 }) {
    this.steps = steps;
    this.scene = scene;
    this.idx = 0;
    this.playing = false;
    this.speed = 1;
    this.loop = true;
    this._timer = null;
    this._anims = [];
    this._onChange = onChange || (() => {});
    this._onPlayingChange = onPlayingChange || (() => {});
    this._onSceneReset = onSceneReset || (() => {});
    this._defaultDuration = defaultDuration;
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

  _setPlaying(p) {
    if (this.playing === p) return;
    this.playing = p;
    this._onPlayingChange(p);
  }

  _notifyChange() {
    this._onChange(this.idx, this.current, this.steps.length);
  }

  isPlaying() { return this.playing; }

  _enterStep(idx, opts = {}) {
    if (this._destroyed) return;
    const reduced = opts.reduced ?? reducedMotion();
    this._cancelAnims();
    this._clearTimer();
    const step = this.steps[idx];
    if (!step) return;
    try { step.enter && step.enter(this.scene, this._ctx(reduced)); }
    catch (e) { console.error('Timeline step enter:', e); }
    this.idx = idx;
    this._notifyChange();
    if (opts.withTimer && !reduced) {
      this._stepDur1x = step.duration || this._defaultDuration;
      this._stepConsumed1x = 0;
      this._stepResumeAt = performance.now();
      this._scheduleAdvance();
    }
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
        this._enterStep(0, { withTimer: true });
      } else {
        this._setPlaying(false);
      }
    }, real);
  }

  play() {
    if (this._destroyed) return;
    if (this.isLast && !this._timer) {
      this._onSceneReset();
      this.idx = 0;
    }
    this._setPlaying(true);
    this._enterStep(this.idx, { withTimer: true });
  }

  pause() {
    this._clearTimer();
    for (const a of this._anims) {
      try { a.pause(); } catch (_) {}
    }
    this._setPlaying(false);
  }

  step(dir = 'next') {
    this.pause();
    if (dir === 'next') {
      if (!this.isLast) this._enterStep(this.idx + 1, { withTimer: false });
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
