import { phoenixBehaviors, phoenixChannels } from './phoenix-behaviors.js';

const rest = () => ({x:0,y:0,r:0,sx:1,sy:1,opacity:1});
// Semi-implicit integration in bounded substeps preserves velocity when retargeted.
export function springStep(position, velocity, target, dt, stiffness=180, damping=23) {
  for(let remaining=Math.min(dt,.05);remaining>0;) {
    const step=Math.min(remaining,1/240);
    velocity+=(stiffness*(target-position)-damping*velocity)*step;
    position+=velocity*step; remaining-=step;
  }
  return [position,velocity];
}
function pose(frame) {
  const result=rest(), text=typeof frame==='string'?frame:frame.transform??'';
  for(const match of text.matchAll(/(translateY|translateX|translate|rotate|scaleY|scaleX|scale)\(([^)]+)\)/g)) {
    const [a,b]=match[2].split(/[,\s]+/).map(parseFloat);
    if(match[1]==='translate') {result.x=a;result.y=b??0;}
    if(match[1]==='translateY')result.y=a;
    if(match[1]==='translateX')result.x=a;
    if(match[1]==='rotate')result.r=a;
    if(match[1]==='scale'){result.sx=a;result.sy=b??a;}
    if(match[1]==='scaleY')result.sy=a;
    if(match[1]==='scaleX')result.sx=a;
  }
  if(typeof frame==='object'&&frame.opacity!==undefined)result.opacity=frame.opacity;
  return result;
}
export function createPhoenixMotion(scene,{canMove,canPlay}) {
  const joints=new Map(); let raf=0,lastTime=0,lastTouch=0,energy=0;
  for(const [name,spec] of Object.entries(phoenixChannels)) {
    const elements=[...scene.querySelectorAll(spec.selector)].map(element=>{
      // A wrapper composes gestures with original SVG placement and ambient CSS.
      const wrapper=document.createElementNS('http://www.w3.org/2000/svg','g');
      element.before(wrapper);wrapper.append(element);
      wrapper.style.transformOrigin=getComputedStyle(element).transformOrigin;
      return wrapper;
    });
    joints.set(name,{spec,elements,p:rest(),v:Object.fromEntries(Object.keys(rest()).map(k=>[k,0])),plan:null});
  }
  function neutral(joint){ if(joint.spec.attribute)scene.dataset[joint.spec.attribute]=joint.spec.neutral; }
  function stop(name){const joint=joints.get(name);if(joint){joint.plan=null;neutral(joint);request();}}
  function request(){if(!raf&&canPlay()){lastTime=performance.now();raf=requestAnimationFrame(tick);}}
  function tick(now){
    raf=0;if(!canPlay())return;
    const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;let moving=false;
    for(const joint of joints.values()){
      let target=rest();const plan=joint.plan;
      if(plan){
        const elapsed=now-plan.start;
        if(!plan.hold&&elapsed>=plan.duration){joint.plan=null;neutral(joint);}
        else {
          const state=plan.states?.filter(s=>s.at<=elapsed).at(-1);
          if(state)scene.dataset[joint.spec.attribute]=state.value;
          for(const move of plan.moves??[]){
            const progress=(elapsed-move.at)/move.duration;
            if(progress<0||progress>1)continue;
            const index=progress*(move.frames.length-1),low=Math.floor(index),high=Math.min(low+1,move.frames.length-1),mix=index-low;
            const a=move.frames[low],b=move.frames[high];
            for(const key of Object.keys(target))target[key]=a[key]+(b[key]-a[key])*mix;
          }
          if(!plan.hold || elapsed<Math.max(0,...(plan.states??[]).map(s=>s.at)))moving=true;
        }
      }
      for(const key of Object.keys(target)){
        if(!canMove()){joint.p[key]=rest()[key];joint.v[key]=0;continue;}
        [joint.p[key],joint.v[key]]=springStep(joint.p[key],joint.v[key],target[key],dt);
        if(Math.abs(joint.p[key]-target[key])>.001||Math.abs(joint.v[key])>.01)moving=true;
      }
      const p=joint.p;
      for(const el of joint.elements){
        el.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.r}deg) scale(${p.sx},${p.sy})`;
        el.style.opacity=String(Math.max(0,Math.min(1,p.opacity)));
      }
    }
    if(moving)raf=requestAnimationFrame(tick);
  }
  function play(name,priority=0,parameters={}){
    const behavior=phoenixBehaviors[name];if(!behavior||!canPlay())return false;
    const now=performance.now();
    if(priority===2){energy=Math.min(1,energy*Math.exp(-(now-lastTouch)/900)+.22);lastTouch=now;}
    const strength=priority===2?1+energy*.35:.85+Math.random()*.25;
    const tempo=.9+Math.random()*.2;
    // A coordinated reaction is admitted as a whole, never as half a face.
    if(behavior.coordinated && Object.keys(behavior.tracks).some(name=>(joints.get(name)?.plan?.priority??-1)>priority))return false;
    for(const [name,track] of Object.entries(behavior.tracks)){
      const joint=joints.get(name);if(!joint||(joint.plan?.priority??-1)>priority)continue;
      // Never reset position or velocity on interruption. Only replace intentions.
      joint.plan={priority,start:now,duration:behavior.duration*tempo,hold:behavior.hold,
        states:track.states?.map(s=>({...s,at:(s.at??0)*tempo})),
        moves:track.moves?.map(m=>({at:(m.at??0)*tempo,duration:m.duration*tempo,frames:(priority===2 && m.frames.length>2 ? m.frames.slice(1) : m.frames).map(f=>{
          const p=pose(f);for(const k of ['x','y','r'])p[k]*=strength;
          if(track.directional){p.x*=parameters.direction??1;p.r*=parameters.direction??1;}
          return p;
        })}))};
    }
    request();return true;
  }
  function stopAll(){
    cancelAnimationFrame(raf);raf=0;
    for(const joint of joints.values()){joint.plan=null;neutral(joint);joint.p=rest();for(const k in joint.v)joint.v[k]=0;for(const el of joint.elements){el.style.transform='';el.style.opacity='';}}
  }
  function stopIdle(){for(const [name,joint] of joints)if(joint.plan?.priority===0)stop(name);}
  function destroy(){stopAll();for(const joint of joints.values())for(const wrapper of joint.elements){wrapper.replaceWith(...wrapper.childNodes);}}
  return {play,stop,stopAll,stopIdle,destroy};
}


