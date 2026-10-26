import { createSolidEngine } from '../src/components/reactdrops/solid-engine.ts';
import { shapeDefaults } from '../src/components/reactdrops/shape-settings.ts';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ChromaticButton } from '../src/components/reactdrops/chromatic-button.tsx';

const results = document.getElementById('results');
const fixtures = document.getElementById('fixtures');
const pixelData = canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
const paintedPixels = canvas => {
  const pixels = pixelData(canvas);
  let count = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i]) count++;
  return count;
};

function check(name, background, assert) {
  const host = document.createElement('div');
  host.className = 'fixture';
  const canvas = document.createElement('canvas');
  host.append(canvas);
  fixtures.append(host);
  const engine = createSolidEngine(canvas, {
    ...shapeDefaults,
    background,
    paused: true,
    count: 0,
    shape: 'cloud',
    size: 32,
    seed: 1477,
    colors: ['#ccb6e4'],
  });
  const result = document.createElement('li');
  result.textContent = name;
  results.append(result);
  try {
    if (!engine) throw new Error('No 2D context');
    const details = assert(engine, canvas);
    result.dataset.result = 'pass';
    result.textContent += ` — PASS${details ? `: ${details}` : ''}`;
  } catch (error) {
    result.dataset.result = 'fail';
    result.textContent += ` — FAIL: ${error.message}`;
  } finally {
    engine?.destroy();
  }
}

class SkipCheck extends Error {}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const alphaCopy = canvas => {
  const pixels = pixelData(canvas);
  return Uint8Array.from({ length: pixels.length / 4 }, (_, i) => pixels[i * 4 + 3]);
};

// Both the frame loop and its fallback timer terminate, including in background tabs.
function animationFrames(minFrames, minElapsed = 0, timeout = 1600) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    let frames = 0;
    let frame = 0;
    const timer = setTimeout(() => {
      cancelAnimationFrame(frame);
      reject(new Error(`Animation did not advance ${minFrames} frames within ${timeout}ms`));
    }, timeout);
    const tick = () => {
      frames++;
      if (frames >= minFrames && performance.now() - started >= minElapsed) {
        clearTimeout(timer);
        resolve(frames);
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  });
}

async function waitFor(predicate, timeout, message) {
  const deadline = performance.now() + timeout;
  while (!predicate()) {
    if (performance.now() >= deadline) throw new Error(message);
    await delay(16);
  }
}

async function checkAsync(name, assertion) {
  const result = document.createElement('li');
  result.textContent = `${name} — RUNNING`;
  results.append(result);
  try {
    const details = await assertion();
    result.dataset.result = 'pass';
    result.textContent = `${name} — PASS${details ? `: ${details}` : ''}`;
  } catch (error) {
    const skipped = error instanceof SkipCheck;
    result.dataset.result = skipped ? 'skip' : 'fail';
    result.textContent = `${name} — ${skipped ? 'SKIP' : 'FAIL'}: ${error.message}`;
  }
}

async function checkMovingFrame() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches)
    throw new SkipCheck('Reduced motion disables the real animation; rerun with no-preference');
  const host = document.createElement('div');
  host.className = 'fixture';
  const canvas = document.createElement('canvas');
  host.append(canvas);
  fixtures.append(host);
  host.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  const settings = {
    ...shapeDefaults,
    background: 'transparent',
    paused: true,
    count: 0,
    shape: 'cloud',
    depth: '2d',
    faces: false,
    followCursor: false,
    size: 24,
    sizeVariation: 0,
    gravity: 650,
    spin: 0,
    seed: 1477,
    colors: ['#ccb6e4'],
  };
  const engine = createSolidEngine(canvas, settings);
  try {
    if (!engine) throw new Error('No 2D context');
    // Starting paused places a complete body inside the frame, then real rAF physics moves it.
    if (!engine.add()) throw new Error('Fixture did not create a body');
    const initial = alphaCopy(canvas);
    if (!initial.some(Boolean)) throw new Error('Initial body was not painted');
    engine.update({ ...settings, paused: false });
    const frames = await animationFrames(14, 550);
    const animated = alphaCopy(canvas);
    let movedPixels = 0;
    for (let i = 0; i < initial.length; i++)
      if (Math.abs(initial[i] - animated[i]) > 16) movedPixels++;
    if (movedPixels < 50) throw new Error(`No meaningful body movement (${movedPixels} changed pixels)`);

    // Pause synchronously before the next frame. Produce an uncontaminated reference by
    // clearing the backing buffer, then ask the same engine to repaint the same body pose.
    // A transparent full repaint alone would preserve old trails in the broken renderer.
    engine.update(settings);
    const context = canvas.getContext('2d');
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    engine.update(settings);
    const reference = alphaCopy(canvas);
    let stale = 0, changed = 0, referencePixels = 0;
    for (let i = 0; i < reference.length; i++) {
      if (reference[i]) referencePixels++;
      if (animated[i] > 8 && reference[i] <= 4) stale++;
      if (Math.abs(animated[i] - reference[i]) > 16) changed++;
    }
    if (!referencePixels) throw new Error('Fresh reference did not paint the paused body');
    const allowance = Math.max(12, Math.ceil(referencePixels * 0.005));
    if (stale > allowance || changed > allowance)
      throw new Error(`${stale} stale path pixels, ${changed} alpha differences; allowance ${allowance}`);
    return `${frames} real frames; ${movedPixels} moving pixels; ${stale} stale pixels, ${changed} alpha differences`;
  } finally {
    engine?.destroy();
  }
}

async function checkChromaticDpr() {
  const original = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
  if (original && !original.configurable)
    throw new SkipCheck('This browser does not allow a temporary DPR override');
  const host = document.createElement('div');
  host.className = 'fixture chromatic-fixture';
  fixtures.append(host);
  host.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  let root;
  try {
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 1 });
    root = createRoot(host);
    flushSync(() => root.render(createElement(ChromaticButton, {
      paused: true,
      entrance: 'none',
      hoverEffect: 'none',
      grain: 0,
      style: { width: '220px', minWidth: '220px', height: '60px', minHeight: '60px' },
    }, 'Actual ChromaticButton')));
    await waitFor(() => host.querySelector('canvas'), 1000, 'Component did not mount a canvas');
    const canvas = host.querySelector('canvas');
    if (!canvas.getContext('webgl')) throw new SkipCheck('WebGL context is unavailable; CSS fallback remains usable');
    await waitFor(() => canvas.dataset.renderer === 'webgl', 1200, 'WebGL was available but the real shader did not initialize');
    // Flush the initial ResizeObserver delivery before changing only DPR. Otherwise an
    // outstanding first observer callback could hide the missing resize listener bug.
    await animationFrames(2, 0, 700);
    const css = { width: canvas.clientWidth, height: canvas.clientHeight };
    const before = { width: canvas.width, height: canvas.height };
    if (css.width !== 220 || css.height !== 60 || before.width !== 220 || before.height !== 60)
      throw new Error(`DPR 1 fixture dimensions differ: CSS ${css.width}×${css.height}, buffer ${before.width}×${before.height}`);
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 2 });
    window.dispatchEvent(new Event('resize'));
    if (canvas.clientWidth !== css.width || canvas.clientHeight !== css.height)
      throw new Error('CSS size changed, so this was not a DPR-only regression');
    if (canvas.width !== css.width * 2 || canvas.height !== css.height * 2)
      throw new Error(`DPR 2 kept ${canvas.width}×${canvas.height}; expected ${css.width * 2}×${css.height * 2}`);
    return `CSS stays ${css.width}×${css.height}; buffer ${before.width}×${before.height} → ${canvas.width}×${canvas.height}`;
  } finally {
    if (root) flushSync(() => root.unmount());
    if (original) Object.defineProperty(window, 'devicePixelRatio', original);
    else delete window.devicePixelRatio;
    window.dispatchEvent(new Event('resize'));
    host.dataset.dprRestored = String(window.devicePixelRatio);
  }
}

async function run() {
  const runButton = document.getElementById('run');
  if (runButton.disabled) return;
  runButton.disabled = true;
  document.body.dataset.result = 'running';
  results.replaceChildren();
  fixtures.replaceChildren();
  check('Transparent canvas: clearing removes every old body pixel', 'transparent', (engine, canvas) => {
    engine.add();
    const before = paintedPixels(canvas);
    if (!before) throw new Error('Fixture did not paint a shape');
    engine.clear();
    const after = paintedPixels(canvas);
    if (after !== 0) throw new Error(`${after} stale pixels remain (painted ${before})`);
  });
  check('Transparent canvas: reset also removes previous shapes', 'transparent', (engine, canvas) => {
    engine.add();
    if (!paintedPixels(canvas)) throw new Error('Fixture did not paint a shape');
    engine.reset();
    const after = paintedPixels(canvas);
    if (after) throw new Error(`${after} old pixels survive reset`);
  });
  check('Translucent background: alpha does not accumulate over repaints', 'rgba(238, 210, 130, 0.25)', (engine, canvas) => {
    for (let i = 0; i < 8; i++) { engine.add(); engine.clear(); }
    const pixels = pixelData(canvas);
    let min = 255, max = 0;
    for (let i = 3; i < pixels.length; i += 4) { min = Math.min(min, pixels[i]); max = Math.max(max, pixels[i]); }
    if (min !== 64 || max !== 64) throw new Error(`Expected uniform alpha 64; got ${min}…${max}`);
  });
  check('Opaque background: removed shapes restore the exact background', '#f2dfa1', (engine, canvas) => {
    engine.add(); engine.clear();
    const pixels = pixelData(canvas);
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] !== 242 || pixels[i + 1] !== 223 || pixels[i + 2] !== 161 || pixels[i + 3] !== 255) {
        throw new Error('Background color or opacity differs');
      }
    }
  });
  check('Mouse gaze: paused eyes follow left/right at a sharp backing resolution', 'transparent', (engine, canvas) => {
    engine.update({
      ...shapeDefaults,
      background: 'transparent', paused: true, count: 0, shape: 'cloud', depth: '2d',
      size: 32, seed: 1477, colors: ['#ccb6e4'], faceColor: '#24323d',
      followCursor: true, cursorFollowRatio: 1,
    });
    if (!engine.add()) throw new Error('Fixture did not place the face');
    const ratio = Math.min(canvas.width / canvas.clientWidth, canvas.height / canvas.clientHeight);
    if (ratio < 2) throw new Error(`Backing resolution fell to ${ratio.toFixed(2)}x; expected at least 2x`);
    const bounds = canvas.getBoundingClientRect();
    const look = clientX => window.dispatchEvent(new PointerEvent('pointermove', {
      pointerType: 'mouse', clientX, clientY: bounds.top + bounds.height / 2,
    }));
    look(bounds.left - 500);
    const left = new Uint8ClampedArray(pixelData(canvas));
    look(bounds.right + 500);
    const right = pixelData(canvas);
    let changed = 0;
    for (let i = 0; i < left.length; i += 4)
      if (Math.abs(left[i] - right[i]) + Math.abs(left[i + 1] - right[i + 1]) + Math.abs(left[i + 2] - right[i + 2]) > 24) changed++;
    if (changed < 8) throw new Error(`Mouse directions changed only ${changed} face pixels`);
    window.dispatchEvent(new PointerEvent('pointerout', { pointerType: 'mouse', relatedTarget: null }));
    return `${changed} eye pixels respond to mouse directions; ${ratio.toFixed(2)}x backing resolution`;
  });
  try {
    await checkAsync('Real animation: moving paths match a clean paused full repaint', checkMovingFrame);
    await checkAsync('ChromaticButton: DPR-only resize updates the real WebGL backing buffer', checkChromaticDpr);
  } finally {
    document.body.dataset.result = results.querySelector('[data-result="fail"]') ? 'fail' : 'pass';
    document.body.dataset.checks = String(results.children.length);
    document.body.dataset.skipped = String(results.querySelectorAll('[data-result="skip"]').length);
    runButton.disabled = false;
    results.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
}
document.getElementById('run').addEventListener('click', run);
run();
