const KEY = 'kube-how:sidebar-collapsed:v1';

// '1' = the visitor hid the sidebar, '0' = the visitor showed it, absent = no choice yet.
// With no choice the CSS decides: shown on desktop, hidden at phone width (see the
// body:not(.sidebar-shown) block in styles.css). An explicit choice wins on any screen.
export function setupSidebar() {
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (_) {}
  if (stored === '1') document.body.classList.add('sidebar-collapsed');
  if (stored === '0') document.body.classList.add('sidebar-shown');

  const persist = (val) => {
    try { localStorage.setItem(KEY, val ? '1' : '0'); } catch (_) {}
  };

  document.getElementById('sideToggle')?.addEventListener('click', () => {
    document.body.classList.add('sidebar-collapsed');
    document.body.classList.remove('sidebar-shown');
    persist(true);
  });
  document.getElementById('sideExpand')?.addEventListener('click', () => {
    document.body.classList.remove('sidebar-collapsed');
    document.body.classList.add('sidebar-shown');
    persist(false);
  });
}
