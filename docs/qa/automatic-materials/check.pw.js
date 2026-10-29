async (page) => {
  const browser=page.context().browser(),engine=browser.browserType().name(),results=[];
  for(const context of browser.contexts())if(context!==page.context())await context.close();
  const modes=engine==='firefox'?['normal','blocked','mobile','reduced','static']:['normal','black','denied','mobile','reduced'];
  for(const mode of modes){
    const mobile=mode==='mobile';
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,...(engine==='chromium'?{isMobile:mobile}:{}),reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    const p=await context.newPage(),errors=[];
    p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await p.addInitScript(({mode})=>{
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testCopiedPrompt=text}}});
      window.buttonContexts=0;
      const get=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(type,...rest){
        if(this.classList.contains('chromatic-surface')){window.buttonContexts++;if(mode==='blocked')throw new Error('Simulated unavailable canvas');}
        return get.call(this,type,...rest);
      };
      if(mode==='black'){
        const draw=WebGLRenderingContext.prototype.drawArrays;
        WebGLRenderingContext.prototype.drawArrays=function(...args){draw.apply(this,args);if(this.canvas.classList.contains('chromatic-surface')){this.clearColor(0,0,0,1);this.clear(this.COLOR_BUFFER_BIT)}};
      }
      if(mode==='denied'){
        const read=WebGLRenderingContext.prototype.readPixels;
        WebGLRenderingContext.prototype.readPixels=function(...args){if(this.canvas.classList.contains('chromatic-surface'))throw new DOMException('Simulated blocked pixels','SecurityError');return read.apply(this,args)};
      }
    },{mode});
    const response=await p.goto('http://127.0.0.1:4173/'+(mode==='static'?'?effects=static':''));
    await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1600);
    const inspect=()=>p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,buttonContexts:window.buttonContexts,buttons:[...document.querySelectorAll('.product-chromatic,.liquid-send-button')].map(b=>({shape:b.dataset.compatibleMaterial||'static',canvas:!!b.querySelector('canvas'),renderer:b.dataset.materialRenderer||b.querySelector('canvas')?.dataset.renderer,failed:b.querySelector('canvas')?.dataset.fallback,radius:getComputedStyle(b).borderRadius,imageVisible:b.querySelector('.chromatic-material')?getComputedStyle(b.querySelector('.chromatic-material')).visibility:null}))}));
    const hero=await inspect();
    await p.screenshot({path:`output/playwright/firefox/auto-${engine}-${mode}-hero.png`});
    const main=p.getByRole('button',{name:'试着接入',exact:true});
    if(mobile)await main.tap();else{await main.focus();await p.keyboard.press('Enter');}
    await p.locator('#install').scrollIntoViewIfNeeded();await p.waitForTimeout(1600);
    const install=await inspect();await p.screenshot({path:`output/playwright/firefox/auto-${engine}-${mode}-install.png`});
    const text=await p.getByRole('textbox',{name:'安装 Prompt',exact:true}).inputValue();
    const send=p.getByRole('button',{name:'发送安装 Prompt（复制到剪贴板）',exact:true});
    if(mobile)await send.tap();else{await send.focus();await p.keyboard.press('Enter');}
    await p.getByRole('button',{name:'Prompt 已复制',exact:true}).waitFor();
    const copied=await p.evaluate(text=>window.testCopiedPrompt?.endsWith(text.trim())&&window.testCopiedPrompt?.includes('目标 Agent：'),text);
    await p.evaluate(()=>scrollTo(0,0));await p.getByRole('button',{name:'切换到深色模式',exact:true}).click();await p.waitForTimeout(1200);
    await p.screenshot({path:`output/playwright/firefox/auto-${engine}-${mode}-dark.png`});
    const dark=await inspect();
    results.push({mode,status:response.status(),hero,install,dark,copied,errors});await context.close();
  }
  return {engine,version:browser.version(),results};
}
