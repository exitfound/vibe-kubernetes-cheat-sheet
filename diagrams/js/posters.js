// Poster design notes sit in the comment above each poster in js/diagrams/<category>/posters.js (R-12).

// One map per category folder, merged by card id: order does not matter, every key surviving
// does. posters.js stays SEPARATE from cards.js, keeping markup out of the metadata tools' path.
import { POSTERS as CLUSTER_POSTERS } from './diagrams/cluster/posters.js';
import { POSTERS as WORKLOADS_POSTERS } from './diagrams/workloads/posters.js';
import { POSTERS as NETWORK_POSTERS } from './diagrams/network/posters.js';
import { POSTERS as STORAGE_POSTERS } from './diagrams/storage/posters.js';

export const POSTERS = {
  ...CLUSTER_POSTERS,
  ...WORKLOADS_POSTERS,
  ...NETWORK_POSTERS,
  ...STORAGE_POSTERS,
};
