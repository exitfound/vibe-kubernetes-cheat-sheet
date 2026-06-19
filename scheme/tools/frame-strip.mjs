#!/usr/bin/env node
// frame-strip.mjs — capture N frames of a scheme step and stitch them horizontally
// into one PNG per step. Reveals motion that a single end-of-step screenshot hides
// (animateAlong delays, packet trajectories).
//
// Frames are sampled DETERMINISTICALLY: each step's play-path is entered with no
// auto-advance, then every WAAPI animation is frozen at an exact logical time via
// currentTime seeking (frame i = i/(N-1) of the step's full span). No wall-clock
// sampling, so the frame you see is the frame you asked for, every run.
//
// Usage:
//   node frame-strip.mjs <scheme-id>                   # all steps, one strip PNG each
//   node frame-strip.mjs <scheme-id> 3                 # step 3 only (1-based)
//   node frame-strip.mjs <scheme-id> 3 --frames=12     # default 8
//   node frame-strip.mjs <scheme-id> --contact         # one labelled contact sheet for the whole card
//   node frame-strip.mjs <scheme-id> --inspect         # keep the grid overlay in frames
//   node frame-strip.mjs <scheme-id> --base=http://localhost:8888
//
// Output: scheme/tools/output/<id>/step-NN.png  (or <id>/contact.png with --contact)

import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, setInspect, stepCount, enterStep, seekStep, stepSpan } from './_shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_ROOT = join(__dirname, 'output');
const DIAGRAM = 'dialog.scheme-dialog svg.diagram';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  }),
);
const positional = args.filter(a => !a.startsWith('--'));
const schemeId = positional[0];
const stepArg  = positional[1];
const contact  = !!flags.contact;
const frames   = Math.max(1, parseInt(flags.frames || (contact ? '5' : '8'), 10) || 1);
const baseUrl  = (flags.base || 'http://localhost:8080').replace(/\/$/, '');
const showGrid = !!flags.inspect;

if (!schemeId) {
  console.error('Usage: node frame-strip.mjs <scheme-id> [step] [--frames=N] [--contact] [--inspect] [--base=URL]');
  process.exit(1);
}

async function withScheme(page, id) {
  await page.goto(`${baseUrl}/scheme/#scheme=${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__schemeCtl, null, { timeout: 5000 });
  await page.waitForSelector(DIAGRAM, { timeout: 5000 });
}

const grab = async (page) => {
  // The SVG node can be swapped mid-step (re-render), detaching a stale locator.
  // Re-resolve fresh and retry a couple times on detachment.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await page.locator(DIAGRAM).screenshot({ type: 'png', timeout: 4000 });
    } catch (e) {
      if (attempt === 3) throw e;
      await page.waitForTimeout(30);
    }
  }
};

async function captureStep(page, idx) {
  const ran = await enterStep(page, idx);
  await page.waitForTimeout(20);
  const span = await stepSpan(page);
  const n = span === 0 ? 1 : frames;          // poster / motionless step: one frame
  const shots = [];
  for (let i = 0; i < n; i++) {
    const off = n === 1 ? 0 : i / (n - 1);
    await seekStep(page, Math.round(span * off));
    shots.push(await grab(page));
  }
  const narration = await page.evaluate(
    () => document.querySelector('dialog.scheme-dialog .narration-text')?.textContent.trim() || '',
  );
  return { shots, span, narration, ran };
}

// Stitch buffers left-to-right into one PNG row (used for per-step strips).
function stitch(shots) {
  const pngs = shots.map(buf => PNG.sync.read(buf));
  const w = pngs[0].width, h = pngs[0].height, gutter = 4;
  const totalW = w * pngs.length + gutter * (pngs.length - 1);
  const out = new PNG({ width: totalW, height: h });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 17; out.data[i + 1] = 15; out.data[i + 2] = 31; out.data[i + 3] = 255;
  }
  pngs.forEach((p, idx) => {
    const dstX = idx * (w + gutter);
    for (let y = 0; y < h; y++) {
      const sStart = y * p.width * 4;
      const dStart = (y * totalW + dstX) * 4;
      p.data.copy(out.data, dStart, sStart, sStart + w * 4);
    }
  });
  return PNG.sync.write(out);
}

// Compose one labelled contact sheet (rows = steps) in the browser via a canvas, so
// real fonts render the step number + narration in a left gutter beside each row.
async function buildContact(page, steps) {
  const payload = steps.map(s => ({
    num: s.num,
    narration: s.narration,
    span: s.span,
    frames: s.shots.map(buf => `data:image/png;base64,${buf.toString('base64')}`),
  }));
  const dataUrl = await page.evaluate(async (steps) => {
    const load = (src) => new Promise((res, rej) => {
      const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src;
    });
    const imgs = await Promise.all(steps.map(s => Promise.all(s.frames.map(load))));
    const frameH = 150, gutterW = 320, padX = 16, padY = 14, gap = 6;
    const ratio = imgs[0][0].naturalWidth / imgs[0][0].naturalHeight;
    const frameW = Math.round(frameH * ratio);
    const rowH = frameH + padY * 2;
    const maxFrames = Math.max(...steps.map(s => s.frames.length));
    const sheetW = gutterW + maxFrames * (frameW + gap) + padX;
    const sheetH = rowH * steps.length;

    const cv = document.createElement('canvas');
    cv.width = sheetW; cv.height = sheetH;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#110f1f'; cx.fillRect(0, 0, sheetW, sheetH);
    cx.textBaseline = 'top';

    const wrap = (text, maxW, font) => {
      cx.font = font;
      const words = (text || '').split(/\s+/).filter(Boolean);
      const lines = []; let line = '';
      for (const w of words) {
        const t = line ? line + ' ' + w : w;
        if (cx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
        else line = t;
      }
      if (line) lines.push(line);
      return lines;
    };

    steps.forEach((s, r) => {
      const y0 = r * rowH;
      if (r) {
        cx.strokeStyle = 'rgba(255,255,255,0.08)';
        cx.beginPath(); cx.moveTo(0, y0); cx.lineTo(sheetW, y0); cx.stroke();
      }
      cx.fillStyle = '#ece9ff'; cx.font = '600 14px monospace';
      cx.fillText(`step ${String(s.num).padStart(2, '0')}  ${s.span}ms`, padX, y0 + padY);
      cx.fillStyle = 'rgba(236,233,255,0.62)';
      const font = '12px sans-serif';
      wrap(s.narration, gutterW - padX * 2, font).slice(0, 8)
        .forEach((ln, i) => { cx.font = font; cx.fillText(ln, padX, y0 + padY + 24 + i * 15); });
      imgs[r].forEach((im, i) => {
        cx.drawImage(im, gutterW + i * (frameW + gap), y0 + padY, frameW, frameH);
      });
    });
    return cv.toDataURL('image/png');
  }, payload);

  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    reducedMotion: 'no-preference',
  });
  await ctx.addInitScript(setInspect, showGrid ? 'grid' : 'expose');
  const page = await ctx.newPage();

  await withScheme(page, schemeId);
  const total = await stepCount(page);
  if (!total) {
    console.error(`No steps detected for ${schemeId}. Is the scheme loaded? base=${baseUrl}`);
    await browser.close();
    process.exit(2);
  }

  let targets;
  if (stepArg && !contact) {
    const s = parseInt(stepArg, 10);
    if (!Number.isInteger(s) || s < 1 || s > total) {
      console.error(`Step "${stepArg}" out of range (1..${total}) for ${schemeId}.`);
      await browser.close();
      process.exit(2);
    }
    targets = [s - 1];
  } else {
    targets = Array.from({ length: total }, (_, i) => i);
  }

  const outDir = join(OUT_ROOT, schemeId);
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

  let degraded = false;
  if (contact) {
    const steps = [];
    for (const idx of targets) {
      const cap = await captureStep(page, idx);
      if (!cap.ran) degraded = true;
      steps.push({ num: idx + 1, ...cap });
    }
    const png = await buildContact(page, steps);
    const out = join(outDir, 'contact.png');
    await writeFile(out, png);
    console.log(`  ${out}  (${steps.length} steps x ${frames} frames)`);
  } else {
    for (const idx of targets) {
      const cap = await captureStep(page, idx);
      if (!cap.ran) degraded = true;
      const out = join(outDir, `step-${String(idx + 1).padStart(2, '0')}.png`);
      await writeFile(out, stitch(cap.shots));
      console.log(`  ${out}  (${cap.shots.length} frames, span ${cap.span}ms)`);
    }
  }

  if (degraded) console.error('WARN: controller lacked _timeline; frames show static state (no motion).');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
