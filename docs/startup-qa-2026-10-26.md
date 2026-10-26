# 首屏加载与全页检查

检查对象：本地 Vite 开发预览与 `npm run build` 后的本地生产预览；未部署线上服务。

## 首屏

- 开发预览原先需要等待 JS 模块注入全局样式；现在开发服务器在 HTML 中先提供样式链接。生产构建原本就输出样式链接，不代表生产环境也出现过无样式页面。
- Dock 和首页主按钮使用与 React 组件同尺寸的静态回退。首页说明不再被挂载动画重新隐藏；中文字体在首屏预加载，慢网仍可能有字体回退和切换。
- 生产预览使用独立无缓存 Chromium，拦截并延迟入口脚本，待字体加载后分别截图；放行前后 Dock、按钮及说明的矩形位置和尺寸一致。截图为 [放行前](qa/startup-production-before.jpg) 和 [放行后](qa/startup-production-after.jpg)。这项受控测试没有覆盖所有设备、网络条件或字体替换期间的逐帧表现。
- 禁用脚本检查桌面和 390px 的首屏导航、按钮回退及可见内容；禁用脚本不代表完整交互功能可用。

## 页面与交互

- 独立 Chromium 检查桌面 1440px、821px 和手机 390px，覆盖亮色、暗色以及减少动态效果；未发现横向溢出、断图或页面及控制台错误。保留 [手机亮色](qa/startup-mobile-light.jpg) 和 [手机暗色、减少动态效果](qa/startup-mobile-dark-reduced.jpg) 截图。
- 验证场景筛选、示例问句与编辑后的安装 Prompt 复制、FAQ、导航、Agent 和模型菜单及 Escape 关闭；390px 另测触摸操作。
- `npm run build` 成功；`node --test tests/ellipse-ground.test.mjs tests/activity-data.test.mjs` 通过 9 项。

检查使用本机浏览器和本地数据，不能代替真实手机、弱网或未来上线后的性能监测。
