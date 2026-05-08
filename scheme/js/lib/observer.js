export function onceVisible(el, handler, options = { rootMargin: '200px' }) {
  if (!('IntersectionObserver' in window)) {
    handler();
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        io.disconnect();
        handler();
        break;
      }
    }
  }, options);
  io.observe(el);
  return () => io.disconnect();
}
