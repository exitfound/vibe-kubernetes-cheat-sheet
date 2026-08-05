// Design notes: scheme/docs/INTERNALS.md#schemejsdatajs
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

const byKey = (field) => Object.fromEntries(CATEGORIES.filter(c => c[field]).map(c => [c.key, c[field]]));
export const CATEGORY_ICONS = byKey('icon');
export const CATEGORY_TAGLINE = byKey('tagline');

// The catalogue itself lives with the cards, one manifest per category folder, so adding a card
// touches one folder instead of this file plus two others. This module stays the registry of what
// a category IS (order, label, tagline, icon), which is cross-category by nature and cannot be
// owned by any one of them.
//
// The concatenation order below is the CATEGORIES order, and it deliberately does NOT reproduce
// the old array order: workloads used to sit in two blocks, 2 cards at index 37 and 17 more at
// index 91, so no per-category split can rebuild it. That is safe, and it is checked rather than
// argued: buildUnits in app.js groups by category and then by subcategory, and inside a
// subcategory it filters, which preserves relative order among that category's own cards. All 15
// (category, subcategory) pairs render in exactly the order they did before.
import { CARDS as CLUSTER_CARDS, SUBCATEGORIES as CLUSTER_SUBS } from './schemes/cluster/cards.js';
import { CARDS as WORKLOADS_CARDS, SUBCATEGORIES as WORKLOADS_SUBS } from './schemes/workloads/cards.js';
import { CARDS as NETWORK_CARDS, SUBCATEGORIES as NETWORK_SUBS } from './schemes/network/cards.js';
import { CARDS as STORAGE_CARDS, SUBCATEGORIES as STORAGE_SUBS } from './schemes/storage/cards.js';

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
