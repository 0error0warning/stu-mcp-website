# Chrome 首页按钮回退

在用户现有 Chrome 标签页 `http://127.0.0.1:5173/#top` 中直接观察到“试着接入”底色发白、左上角出现损坏标记。DOM 中不是损坏图片，而是没有 `data-renderer`、仍为默认 300×150 像素的 canvas；按钮 CSS 渐变和文字布局正常。未确定该次 WebGL 初始化未完成的浏览器或驱动原因。

修复在保留 ReactDrops 许可的组件内完成：

- 未就绪的按钮 canvas 默认隐藏，保留 CSS 渐变回退，避免损坏画布覆盖背景。
- WebGL 就绪标记改为第一次成功绘制后设置，创建上下文、编译着色器或绘制失败均保留回退；上下文丢失后继续隐藏画布。
- 在用户 Chrome 中刷新页面，确认按钮恢复正常。保留 [实际 Chrome 截图](qa/chrome-button-fixed.jpg)。

独立 Chrome 自动化检查正常渲染、无法创建上下文、着色器失败、GL 绘制错误及上下文丢失。前三类失败保留 CSS 渐变，文字、178px 按钮宽度和 Enter 跳转正常，没有页面异常。保留 [无法创建上下文的截图](qa/chromatic-no-context.jpg)。

另测 390px、触摸和减少动态效果：无横向溢出，“试着接入”可触摸跳转到安装部分，保留 [手机截图](qa/chromatic-mobile-reduced.jpg)。`npm run build` 成功。上述故障模拟不等同于逐一覆盖所有显卡驱动。
