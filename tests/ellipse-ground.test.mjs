import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const { createSolidWorld, createSolidBody } = await server.ssrLoadModule('/src/components/reactdrops/solid-world.ts');
const { solidShape } = await server.ssrLoadModule('/src/components/reactdrops/solid-shapes.ts');
const ellipse = { centerX: 720, centerY: 1380, radiusX: 1300, radiusY: 700 };
const surface = x => ellipse.centerY - ellipse.radiusY * Math.sqrt(1 - ((x - ellipse.centerX) / ellipse.radiusX) ** 2);
const settings = { gravity: 420, wind: 0, restitution: 0.25, friction: 0.55, damping: 0, depth: '2d' };

test('upper ellipse catches a falling body and gravity carries it outward', () => {
  for (const [startX, sign] of [[520, -1], [920, 1]]) {
    const world = createSolidWorld();
    world.setBounds(1440, 1000, 1, ellipse);
    const body = createSolidBody(1, solidShape('circle'), 35, startX, 80);
    world.add(body);
    let maxPenetration = 0;
    for (let frame = 0; frame < 600; frame++) {
      world.step(1 / 60, settings);
      maxPenetration = Math.max(maxPenetration, body.maxY - surface(body.x));
    }
    assert.ok((body.x - startX) * sign > 150, `Body failed to slide outward: ${startX} → ${body.x}`);
    assert.ok(maxPenetration < 5, `Body penetrated ellipse by ${maxPenetration}px`);
    assert.ok(body.maxY < 990, 'Body fell onto the old rectangular canvas floor');
  }
});

test('a shallow part of the arc does not go to sleep in the middle', () => {
  const world = createSolidWorld();
  world.setBounds(1440, 1000, 1, ellipse);
  const body = createSolidBody(1, solidShape('square'), 35, 810, 100);
  world.add(body);
  for (let frame = 0; frame < 900; frame++) world.step(1 / 60, settings);
  assert.ok(body.x > 1050, `Shallow-slope body got stuck at ${body.x}`);
});

test('a world without ground retains the original rectangular floor', () => {
  const world = createSolidWorld();
  world.setBounds(400, 300, 1);
  const body = createSolidBody(1, solidShape('circle'), 25, 200, 30);
  world.add(body);
  for (let frame = 0; frame < 400; frame++) world.step(1 / 60, settings);
  assert.ok(body.maxY <= 301 && body.maxY > 295);
});

test('a banked pile can sleep after reaching the outer wall', () => {
  const world = createSolidWorld();
  world.setBounds(1440, 1000, 1, ellipse);
  for (let i = 0; i < 4; i++) world.add(createSolidBody(i + 1, solidShape('circle'), 30, 180 + i * 95, 80));
  for (let frame = 0; frame < 2400; frame++) world.step(1 / 60, settings);
  assert.ok(world.bodies.every(body => body.x < 250), 'Bodies did not reach the left bank');
  assert.equal(world.awakeCount, 0, 'Settled banked pile still consumes active physics frames');
});

test.after(async () => { await server.close(); });
