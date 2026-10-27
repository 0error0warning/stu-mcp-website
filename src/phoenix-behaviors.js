// Data only: shared by the SVG generator and the browser behavior controller.
export const phoenixParts = [
  { id:'body', label:'肚子：逗一逗凤凰', area:[548,610,115,100], behavior:'delighted' },
  { id:'tail', label:'尾羽：摇摇尾巴', area:[316,512,68,88], behavior:'tail-swish' },
  { id:'wing-left', label:'左翅膀：伸个懒腰', area:[420,586,58,48], behavior:'stretch-left' },
  { id:'wing-right', label:'右翅膀：挥手打招呼', area:[735,520,38,72], behavior:'wave-right' },
  { id:'crest', label:'羽冠：摸摸头', area:[540,336,70,77], behavior:'crest-poke' },
  { id:'foot-left', label:'左脚：轻轻跺脚', area:[438,739,43,27], behavior:'tap-left' },
  { id:'foot-right', label:'右脚：踮踮脚尖', area:[609,739,43,27], behavior:'tap-right' },
  { id:'brow-left', label:'左眉毛：挑挑眉', area:[523,446,25,16], behavior:'brow-left' },
  { id:'brow-right', label:'右眉毛：好奇一下', area:[629,429,24,16], behavior:'brow-right' },
  { id:'cheek-left', label:'左脸颊：摸摸脸', area:[500,536,24,18], behavior:'affection' },
  { id:'cheek-right', label:'右脸颊：摸摸脸', area:[651,516,23,18], behavior:'affection' },
  { id:'eye-left', label:'左眼：眨眨眼', area:[525,495,30,28], behavior:'blink-left' },
  { id:'eye-right', label:'右眼：眨一下眼', area:[629,474,28,27], behavior:'wink-right' },
  { id:'mouth', label:'嘴巴：啾啾回应', area:[582.5,503.4,23,26], behavior:'chirp' },
];

export const phoenixChannels = {
  body:{ selector:'.phx-hop' }, attitude:{ selector:'.phx-attitude' },
  crest:{ selector:'.phx-crest' }, tail:{ selector:'.phx-tail' },
  wingLeft:{ selector:'.phx-wing-left' }, wingRight:{ selector:'.phx-wing-right' },
  footLeft:{ selector:'.phx-foot-left' }, footRight:{ selector:'.phx-foot-right' },
  gaze:{ selector:'.phx-gaze' },
  eyeLeft:{ selector:'.phx-eye-left .phx-lid', attribute:'eyeLeft', neutral:'open' },
  eyeRight:{ selector:'.phx-eye-right .phx-lid', attribute:'eyeRight', neutral:'open' },
  mouth:{ selector:'.phx-mouth', attribute:'mouth', neutral:'rest' },
  browLeft:{ selector:'.phx-brow-left', attribute:'browLeft', neutral:'rest' },
  browRight:{ selector:'.phx-brow-right', attribute:'browRight', neutral:'rest' },
  cheekLeft:{ selector:'.phx-cheek-left', attribute:'cheekLeft', neutral:'rest' },
  cheekRight:{ selector:'.phx-cheek-right', attribute:'cheekRight', neutral:'rest' },
  delight:{ selector:'.phx-delight' },
};
const rotations = values => values.map(value => `rotate(${value}deg)`);
const move = (frames, duration, at=0) => ({ frames, duration, at });
const turn = (values, duration, at=0) => move(rotations(values), duration, at);
const state = (value, at=0) => ({ value, at });
const smile = (at=0) => ({ states:[state('smile',at),state('open',at+850)] });
const warm = (at=0) => ({ states:[state('warm',at),state('rest',at+1050)] });
const raised = (at=0) => ({ states:[state('raised',at),state('rest',at+950)] });
const blink = (at=0) => ({ moves:[move(['scaleY(1)','scaleY(.07)','scaleY(1)','scaleY(.1)','scaleY(1)'],530,at)] });

export const phoenixBehaviors = {
  'crest-poke':{ duration:1450, tracks:{
    crest:{moves:[turn([0,-12,7,-5,0],1100)]}, browLeft:raised(100), eyeRight:smile(260),
  }},
  'tail-swish':{ duration:1300, tracks:{ tail:{moves:[turn([0,10,-6,7,-2,0],1200)]} }},
  'stretch-left':{ duration:1500, tracks:{ wingLeft:{moves:[turn([0,-23,-27,-12,0],1400)]}, cheekLeft:warm(250) }},
  'wave-right':{ duration:1550, tracks:{ wingRight:{moves:[turn([0,-22,6,-18,3,-10,0],1350)]}, eyeRight:smile(210) }},
  'tap-left':{ duration:1000, tracks:{ footLeft:{moves:[turn([0,-10,0,-7,0],880)]} }},
  'tap-right':{ duration:1100, tracks:{ footRight:{moves:[turn([0,9,0,6,0],950)]} }},
  'blink-left':{ duration:750, tracks:{eyeLeft:blink()} },
  'wink-right':{ duration:1100, tracks:{eyeRight:smile(),browRight:raised(120)} },
  'brow-left':{ duration:1150, tracks:{browLeft:raised()} },
  'brow-right':{ duration:1200, tracks:{browRight:raised(),eyeRight:{states:[state('wide',120),state('open',900)]}} },
  affection:{ duration:1800, coordinated:true, tracks:{
    attitude:{directional:true,moves:[turn([0,2.8,1.4,0],1550)]},
    eyeLeft:smile(100),eyeRight:smile(125),
    cheekLeft:warm(160),cheekRight:warm(160),
    mouth:{states:[state('rest')]},
    wingLeft:{moves:[turn([0,-8,-5,0],1400,110)]},
    wingRight:{moves:[turn([0,5,3,0],1400,140)]},
    crest:{moves:[turn([0,3,-1,0],1550,150)]},
  }},
  chirp:{ duration:1250, tracks:{mouth:{states:[state('round'),state('rest',250),state('round',440),state('rest',740)],moves:[move(['scale(1)','scale(.96,1.1)','scale(1)'],650,140)]}} },
  delighted:{ duration:1600, tracks:{
    body:{moves:[move(['translateY(0) scale(1)','translateY(0) scale(1.025,.975)','translateY(-46px) rotate(-3deg)','translateY(0) scale(1.02,.98)','translateY(0) scale(1)'],1050)]},
    wingRight:{moves:[turn([0,-17,6,-8,0],940,100)]},
    eyeLeft:smile(320), eyeRight:smile(390), cheekLeft:warm(400), cheekRight:warm(480),
    delight:{moves:[move([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(-14px)'},{opacity:0,transform:'translateY(-35px)'}],1150,100)]},
  }},
  look:{ duration:2700, tracks:{
    gaze:{moves:[move(['translate(0,0)','translate(-6px,-2px)','translate(-6px,-2px)','translate(5px,-1px)','translate(5px,-1px)','translate(0,0)'],2500)]},
    browLeft:raised(140),browRight:raised(1100),
  }},
  preen:{ duration:2200, tracks:{
    wingLeft:{moves:[turn([0,-16,-10,-19,0],1850)]}, crest:{moves:[turn([0,5,-5,0],1400,450)]},eyeLeft:smile(500),
  }},
  stretch:{ duration:2600, tracks:{
    wingLeft:{moves:[turn([0,-21,-24,0],2300)]},wingRight:{moves:[turn([0,-15,-19,0],2100,170)]},
    attitude:{moves:[turn([0,-1.4,.6,0],2300)]},eyeLeft:smile(600),eyeRight:smile(670),
  }},
  shuffle:{ duration:1800, tracks:{
    footLeft:{moves:[turn([0,-7,0],660)]},footRight:{moves:[turn([0,6,0],660,740)]},
    attitude:{moves:[turn([0,-.8,.8,0],1700)]},
  }},
  yawn:{ duration:3100, tracks:{
    eyeLeft:{states:[state('closed',160),state('open',2600)]},eyeRight:{states:[state('closed',220),state('open',2660)]},
    mouth:{states:[state('round',350),state('rest',2350)]},crest:{moves:[turn([0,6,3,0],2700,100)]},
  }},
  sleep:{ hold:true, tracks:{
    eyeLeft:{states:[state('closed')]},eyeRight:{states:[state('closed',70)]},mouth:{states:[state('rest')]},
  }},
  wake:{ duration:1400, tracks:{
    eyeLeft:{states:[state('wide'),state('open',950)]},eyeRight:{states:[state('wide',70),state('open',1020)]},
    browLeft:raised(),browRight:raised(80),crest:{moves:[turn([0,-8,2,0],1100)]},
  }},
};

export const phoenixIdlePool = ['look','look','preen','stretch','shuffle','tail-swish','blink-left','wink-right','crest-poke','yawn'];

// Scene gestures use the same interruptible joints, including neighbouring objects.
phoenixChannels.letter={selector:'.phx-letter'};
phoenixChannels.conversation={selector:'.phx-conversation'};
phoenixChannels.document={selector:'.phx-document'};
phoenixBehaviors['paper-breeze']={duration:2800,tracks:{
  wingLeft:{moves:[turn([0,-32,8,-29,0],1900)]},
  attitude:{moves:[turn([0,-4,2,0],2400)]},
  tail:{moves:[turn([0,12,-8,0],2200,150)]},
  letter:{moves:[move(['translate(0,0)','translate(36px,-27px) rotate(-9deg)','translate(52px,-12px) rotate(6deg)','translate(0,0)'],2500,180)]},
  document:{moves:[turn([0,-5,4,0],2100,330)]},eyeLeft:smile(400),
}};
phoenixBehaviors['chat-back']={duration:2500,tracks:{
  mouth:{states:[state('round',100),state('rest',400),state('round',680),state('rest',970)]},
  gaze:{moves:[move(['translate(0,0)','translate(7px,-3px)','translate(7px,-3px)','translate(0,0)'],2200)]},
  wingRight:{moves:[turn([0,-28,7,-20,0],1800,150)]},
  conversation:{moves:[move(['scale(1)','scale(1.10,.92)','scale(.97,1.06)','scale(1)'],1600,650)]},
  browRight:raised(300),
}};
phoenixParts.find(p=>p.id==='wing-left').behavior='paper-breeze';
phoenixParts.find(p=>p.id==='mouth').behavior='chat-back';
phoenixIdlePool.push('paper-breeze','chat-back');
