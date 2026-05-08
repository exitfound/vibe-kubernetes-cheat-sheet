const KEY = 'kube-how:sidebar-collapsed:v1';

export function setupSidebar() {
  let collapsed = false;
  try { collapsed = localStorage.getItem(KEY) === '1'; } catch (_) {}
  if (collapsed) document.body.classList.add('sidebar-collapsed');

  const persist = (val) => {
    try { localStorage.setItem(KEY, val ? '1' : '0'); } catch (_) {}
  };

  document.getElementById('sideToggle')?.addEventListener('click', () => {
    document.body.classList.add('sidebar-collapsed');
    persist(true);
  });
  document.getElementById('sideExpand')?.addEventListener('click', () => {
    document.body.classList.remove('sidebar-collapsed');
    persist(false);
  });
}
