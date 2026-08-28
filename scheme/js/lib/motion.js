// The SYSTEM preference, a different thing from `ctx.reduced`, which the Timeline also sets on a
// prev or reset replay: one static branch satisfies both (S-14). The guard is why Node can import it.
const mq = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false, addEventListener() {} };

export function reducedMotion() {
  return mq.matches;
}

export function onReducedMotionChange(handler) {
  if (mq.addEventListener) mq.addEventListener('change', handler);
}
