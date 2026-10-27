import './phoenix-scene.css';
import { phoenixParts, phoenixIdlePool } from './phoenix-behaviors.js';
import { createPhoenixMotion } from './phoenix-motion-engine.js';
import { resolvePhoenixInteraction } from './phoenix-interactions.js';

export function mountPhoenix() {
  const scene=document.querySelector('.phoenix-scene');
  if (!scene) return;
  const hero=scene.closest('.hero-full');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const lifecycle=new AbortController(), {signal}=lifecycle;
  const buttons=[...scene.querySelectorAll('[data-phx-part]')];
  // Hit geometry follows the artwork, including whole-body hops and limb rotation.
  const anchors={body:'.phx-attitude',tail:'.phx-tail','wing-left':'.phx-wing-left','wing-right':'.phx-wing-right',crest:'.phx-crest','foot-left':'.phx-foot-left','foot-right':'.phx-foot-right','eye-left':'.phx-eye-left','eye-right':'.phx-eye-right',mouth:'.phx-mouth','brow-left':'.phx-attitude','brow-right':'.phx-attitude','cheek-left':'.phx-attitude','cheek-right':'.phx-attitude'};
  buttons.forEach(button=>{
    const parent=scene.querySelector(anchors[button.dataset.phxPart]);
    if(button.dataset.phxPart==='body')parent.prepend(button);else parent.append(button);
  });
  const byPart=new Map(phoenixParts.map(part=>[part.id,part]));

  let visible=false, sleeping=false, frame=0, idleTimer=0, pointer=null;
  let lastInput=performance.now();
  const recentIdle=[];
  const playing=()=>visible && !document.hidden;
  const engine=createPhoenixMotion(scene,{canPlay:playing,canMove:()=>playing()&&!reduced.matches});
  const resetGaze=()=>{
    scene.style.removeProperty('--phx-look-x');scene.style.removeProperty('--phx-look-y');scene.style.removeProperty('--phx-lean');
  };
  function scheduleIdle() {
    clearTimeout(idleTimer);
    if (!playing() || reduced.matches || sleeping) return;
    idleTimer=setTimeout(()=>{
      if (!playing()) return;
      const quiet=performance.now()-lastInput;
      if (quiet>45000) {
        sleeping=true;scene.dataset.mood='asleep';engine.play('sleep',0);resetGaze();return;
      }
      if (quiet>1200) {
        const pool=phoenixIdlePool.filter(name=>!recentIdle.includes(name));
        const name=quiet>30000 && !recentIdle.includes('yawn')?'yawn':pool[Math.floor(Math.random()*pool.length)];
        engine.play(name,0);scene.dataset.idleBehavior=name;
        recentIdle.push(name);if(recentIdle.length>2)recentIdle.shift();
        scene.dataset.mood=quiet>30000?'drowsy':'awake';
      }
      scheduleIdle();
    },2600+Math.random()*2200);
  }
  function noteInput() {
    lastInput=performance.now();
    engine.stop('gaze');
    if (sleeping) {
      sleeping=false;scene.dataset.mood='awake';engine.stopIdle();engine.play('wake',1);scheduleIdle();
    }
  }
  function syncPlayback() {
    scene.dataset.playing=String(playing());
    clearTimeout(idleTimer);
    if (!playing() || reduced.matches) {
      engine.stopAll();cancelAnimationFrame(frame);frame=0;pointer=null;
      sleeping=false;scene.dataset.mood='awake';resetGaze();


    }
    lastInput=performance.now();
    if (playing()) scheduleIdle();
  }
  function drawGaze() {
    frame=0;
    if (!pointer || !playing() || reduced.matches || !fine.matches) return;
    const matrix=scene.getScreenCTM();if(!matrix)return;
    const p=new DOMPoint(pointer.x,pointer.y).matrixTransform(matrix.inverse());
    const x=Math.max(-7,Math.min(7,(p.x-625)/45)),y=Math.max(-4,Math.min(4,(p.y-170)/45));
    scene.style.setProperty('--phx-look-x',`${x.toFixed(2)}px`);
    scene.style.setProperty('--phx-look-y',`${y.toFixed(2)}px`);
    scene.style.setProperty('--phx-lean',`${(x/9).toFixed(2)}deg`);
  }
  hero.addEventListener('pointermove',event=>{
    if (!playing() || event.pointerType==='touch') return;
    noteInput();
    if(reduced.matches || !fine.matches)return;
    pointer={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(drawGaze);
  },{passive:true,signal});
  hero.addEventListener('pointerleave',()=>{pointer=null;resetGaze();},{signal});
  function touchPart(button) {
    if (!playing()) return;
    const part=byPart.get(button.dataset.phxPart);

    noteInput();
    const reaction=resolvePhoenixInteraction(part);
    engine.play(reaction.behavior,2,reaction.parameters);
    scene.dataset.lastPart=part.id;scene.dataset.lastBehavior=reaction.behavior;

  }
  buttons.forEach((button,index)=>{
    button.removeAttribute('aria-disabled');button.setAttribute('tabindex',index===0?'0':'-1');
    button.addEventListener('click',event=>{event.stopPropagation();touchPart(button);},{signal});
    button.addEventListener('pointerenter',event=>{
      if(event.pointerType==='touch'||!playing())return;
      noteInput();scene.dataset.hoverPart=button.dataset.phxPart;
    },{signal});
    button.addEventListener('pointerleave',()=>{delete scene.dataset.hoverPart;},{signal});
    button.addEventListener('focus',()=>{
      buttons.forEach(other=>other.setAttribute('tabindex',other===button?'0':'-1'));
      noteInput();
    },{signal});
    button.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();if(!event.repeat)touchPart(button);return;}
      let next;
      if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%buttons.length;
      if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index-1+buttons.length)%buttons.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;
      if(next!==undefined){event.preventDefault();buttons[next].focus();}
    },{signal});
  });
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;syncPlayback();
  },{threshold:0});
  observer.observe(scene);
  document.addEventListener('visibilitychange',syncPlayback,{signal});
  reduced.addEventListener('change',syncPlayback,{signal});
  fine.addEventListener('change',resetGaze,{signal});
  if(import.meta.hot)import.meta.hot.dispose(()=>{
    lifecycle.abort();observer.disconnect();engine.destroy();clearTimeout(idleTimer);cancelAnimationFrame(frame);
  });
}
