// Design notes: scheme/docs/CARDS.md, one "### poster" subsection per card id.
//
// One map per category folder, merged here. app.js looks a poster up by card id, so this is a
// plain merge with no order to preserve: what matters is that all 108 keys survive it and that
// no two categories claim the same id.
import { POSTERS as CLUSTER_POSTERS } from './schemes/cluster/posters.js';
import { POSTERS as WORKLOADS_POSTERS } from './schemes/workloads/posters.js';
import { POSTERS as NETWORK_POSTERS } from './schemes/network/posters.js';
import { POSTERS as STORAGE_POSTERS } from './schemes/storage/posters.js';

export const POSTERS = {
  ...CLUSTER_POSTERS,
  ...WORKLOADS_POSTERS,
  ...NETWORK_POSTERS,
  ...STORAGE_POSTERS,
};
