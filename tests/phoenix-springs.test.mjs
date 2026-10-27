import test from 'node:test';
import assert from 'node:assert/strict';
import {springStep} from '../src/phoenix-motion-engine.js';
test('retargeting preserves momentum and converges without discontinuities',()=>{
  let p=0,v=0;
  for(let i=0;i<20;i++)[p,v]=springStep(p,v,30,1/120);
  const before=p,velocity=v;
  [p,v]=springStep(p,v,-20,1/120);
  assert.ok(Math.abs(p-before)<2,'retarget must not teleport to neutral or destination');
  assert.ok(velocity>0&&v>0,'initial momentum must survive reversal');
  for(let i=0;i<600;i++)[p,v]=springStep(p,v,-20,1/120);
  assert.ok(Math.abs(p+20)<.001);assert.ok(Math.abs(v)<.001);
});
test('rapid alternation and a delayed frame remain bounded',()=>{
 let p=0,v=0;
 for(let i=0;i<600;i++){
  [p,v]=springStep(p,v,i%8<4?35:-35,i===200?2:1/60);
  assert.ok(Number.isFinite(p)&&Number.isFinite(v));assert.ok(Math.abs(p)<50);
 }
});
