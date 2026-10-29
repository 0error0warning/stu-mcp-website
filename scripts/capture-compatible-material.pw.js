// Run with playwright-cli run-code after starting Vite on 127.0.0.1:5174.
// The capture page uses the original licensed ReactDrops shader and palette.
async (page) => {
  const context = await page.context().browser().newContext({viewport:{width:500,height:200},deviceScaleFactor:2});
  const capture = await context.newPage();
  await capture.goto('http://127.0.0.1:5174/scripts/material-capture.html');
  await capture.waitForFunction(() => typeof window.materialFrame === 'function');
  for (const shape of ['pill', 'circle']) {
    for (let i=0;i<64;i++) {
      await capture.evaluate(({shape,time}) => window.materialFrame(shape,time), {shape,time:i/63*1.32});
      await capture.waitForFunction(() => document.querySelector('canvas')?.dataset.renderer === 'webgl');
      await capture.locator('canvas').screenshot({path:`output/playwright/material-frames/${shape}-${String(i).padStart(2,'0')}.png`,omitBackground:true});
    }
  }
  await context.close();
  return {frames:128};
}
