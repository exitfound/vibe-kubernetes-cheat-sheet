const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {} };

export function reducedMotion() {
  return mq.matches;
}

export function onReducedMotionChange(handler) {
  if (mq.addEventListener) mq.addEventListener('change', handler);
}
