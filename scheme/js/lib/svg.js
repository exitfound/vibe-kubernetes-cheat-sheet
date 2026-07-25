const NS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') node.setAttribute('class', v);
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      node.setAttribute(k, String(v));
    }
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export const svg  = (attrs, children) => el('svg', attrs, children);
export const g    = (attrs, children) => el('g',   attrs, children);
export const rect = (attrs, children) => el('rect', attrs, children);
export const path = (attrs, children) => el('path', attrs, children);
export const line = (attrs, children) => el('line', attrs, children);
export const circle = (attrs, children) => el('circle', attrs, children);
export const ellipse = (attrs, children) => el('ellipse', attrs, children);
export const text = (attrs, children) => el('text', attrs, children);
export const tspan = (attrs, children) => el('tspan', attrs, children);
export const defs = (children) => el('defs', {}, children);
export const marker = (attrs, children) => el('marker', attrs, children);
export const linearGradient = (attrs, children) => el('linearGradient', attrs, children);
export const stop = (attrs) => el('stop', attrs);
export const title = (txt) => el('title', { text: txt });
export const desc = (txt) => el('desc', { text: txt });
