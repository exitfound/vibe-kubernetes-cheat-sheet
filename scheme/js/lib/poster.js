// The grid thumbnail of a card: the poster fragment from posters.js wrapped in its 320x180 svg root
// and the category tint. Its own module so the static card pages that tools/pages/build.mjs writes
// draw the exact poster the grid does. Pure: no DOM, no browser globals.
import { POSTERS } from '../posters.js';

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const POSTER_COLORS = {
  network:   '#4fe5ff',
  storage:   '#5eca94',
  workloads: '#5bb8ff',
  cluster:   '#7d86ff',
};

const FALLBACK_POSTER = `
  <g stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.9">
    <rect x="48"  y="58" width="74" height="64" rx="8"/>
    <rect x="198" y="58" width="74" height="64" rx="8"/>
    <line x1="122" y1="90" x2="198" y2="90" stroke-dasharray="4 4"/>
  </g>
  <circle cx="160" cy="90" r="5" fill="currentColor" opacity="0.95"/>
`;

export function renderPoster(scheme) {
  const color = POSTER_COLORS[scheme.category] || '#e0cdff';
  const gid = 'pg-' + scheme.id;
  const fg = POSTERS[scheme.id] || FALLBACK_POSTER;
  return `
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="${escapeHtml(gid)}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${color}" stop-opacity="0.22"/>
          <stop offset="1" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="180" fill="url(#${escapeHtml(gid)})"/>
      <g style="color:${color}">${fg}</g>
    </svg>
  `;
}
