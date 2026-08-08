// Design notes: js/schemes/<category>/CARDS.md, one "### poster" subsection per card id.

// One map per category folder, merged by card id: order does not matter, all 108 keys surviving
// does. posters.js stays SEPARATE from cards.js, keeping markup out of the metadata tools' path.
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
