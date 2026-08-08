const ICON_NETWORK   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><line x1="8.5" y1="6" x2="15.5" y2="6"/><line x1="6" y1="8.5" x2="6" y2="15.5"/><line x1="8.5" y1="18" x2="15.5" y2="18"/><line x1="18" y1="8.5" x2="18" y2="15.5"/></svg>`;
const ICON_WORKLOADS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 3 21 8 12 13 3 8 12 3"/><polyline points="3 13 12 18 21 13"/></svg>`;
const ICON_STORAGE   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="2.5"/><path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5"/><path d="M4 11v8c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-8"/></svg>`;
const ICON_CLUSTER   = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/></svg>`;

export const CATEGORIES = [
  { key: 'all',       label: 'All' },
  { key: 'cluster',   label: 'Cluster',       tagline: 'Cluster internals',   icon: ICON_CLUSTER },
  { key: 'workloads', label: 'Workloads',     tagline: 'Pods and controllers', icon: ICON_WORKLOADS },
  { key: 'network',   label: 'Networking',    tagline: 'Traffic flow',        icon: ICON_NETWORK },
  { key: 'storage',   label: 'Storage',       tagline: 'Volume flow',         icon: ICON_STORAGE },
];

// PROJECTIONS of CATEGORIES, not data of their own, so a new category is typed once, above.
// `tagline` is deliberately not `sub`: one word for both left app.js a dead `sc.sub ||` branch.
const byKey = (field) => Object.fromEntries(CATEGORIES.filter(c => c[field]).map(c => [c.key, c[field]]));
export const CATEGORY_ICONS = byKey('icon');
export const CATEGORY_TAGLINE = byKey('tagline');

// The catalogue lives with the cards. This is the registry of what a CATEGORY is, which no one
// folder can own. Each SUBCATEGORIES list is an ORDER: an editorial argument, never alphabetical.
import { CARDS as CLUSTER_CARDS, SUBCATEGORIES as CLUSTER_SUBS } from './schemes/cluster/cards.js';
import { CARDS as WORKLOADS_CARDS, SUBCATEGORIES as WORKLOADS_SUBS } from './schemes/workloads/cards.js';
import { CARDS as NETWORK_CARDS, SUBCATEGORIES as NETWORK_SUBS } from './schemes/network/cards.js';
import { CARDS as STORAGE_CARDS, SUBCATEGORIES as STORAGE_SUBS } from './schemes/storage/cards.js';

// Concatenation order is the CATEGORIES order. The grid does not depend on it: buildUnits groups by
// category then subcategory, which is what preserves relative order among one category's own cards.
export const SCHEMES = [
  ...CLUSTER_CARDS,
  ...WORKLOADS_CARDS,
  ...NETWORK_CARDS,
  ...STORAGE_CARDS,
];


export const CATEGORY_LABEL = byKey('label');

export const SUBCATEGORIES = {
  cluster: CLUSTER_SUBS,
  workloads: WORKLOADS_SUBS,
  network: NETWORK_SUBS,
  storage: STORAGE_SUBS,
};
