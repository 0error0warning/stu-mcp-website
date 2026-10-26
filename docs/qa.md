# 首版浏览器验收 · 2026-10-26

网站独立于 stu-mcp。仓库为私有，只在本机运行，没有部署到公网。

## 来源与保留的阶段

- 未改动的 Side Quest 原件：`reference/side-quest/index.html`，原 MIT 许可和源码署名均保留。基线提交 `699cb35`。
- 作品内容：本地 sibling stu-mcp 的 README、安装、功能与验证文档，开发时核对版本为 v0.7.1，50 个 MCP 工具注册。
- ReactDrops：固定 `b3924b92ebfce15152cf6f04ad85301c9f343672`，五个真实组件；上游源文件保留原样，修改只在网站适配层。
- 字体：Google 官方字体文件，本地托管；来源及 SHA-256 位于 `public/fonts/sources.json`。
- 提交日历：公开仓库 main 快照 `0fa321cdbe94decdf15e1918394e9f09d452cfdb`，365 个 UTC 日期，116 次提交、10 个活跃日。口径见 `activity-data.md`。

## 已验证

使用 Chromium 与 Playwright CLI 实际浏览、截图和操作，未调用真实 MCP 或登录来源服务。

- 桌面 1440×1000，六张卡片和两类筛选数量正确，无横向溢出。
- 场景复制流程（抽查通知问句），以及实际剪贴板中的完整安装指令。Windows 剪贴板会将换行标准化为 CRLF，比较时按等价换行核对。
- 模拟浏览器拒绝剪贴板写入时，手动复制弹窗显示正确内容，Escape 可关闭。
- FAQ 同时只展开一项；桌面采用两列布局。
- 365 个真实日期按钮；点击显示当天次数，方向键按天/周移动焦点。
- Fan Gallery 的桌面悬停与方向键选择。三张纸页在 1440px 和 390px 下均在容器内；已将大幅飞入的 deck 入场改成中心 stack 展开，保留官方组件。
- 390×844 手机模拟（启用触摸）：实际触摸事件滑动 355px，筛选、复制、FAQ、日历点击均通过。所有主要区段页面宽度保持 390px。
- 手机日历点击目标约 25×24px，日历自身可横向滚动。
- `prefers-reduced-motion: reduce` 下，页面画布数量和运行中 DOM 动画均为 0，安装复制仍可用。
- 桌面脚本收集到的页面异常与失败网络请求均为 0；手机页面异常为 0。运行时只请求本地资源。
- `npm run build` 通过；生产静态预览烟测通过，六场景、365 日期正常渲染，新页面首次 Tab 正确聚焦跳转链接。GitHub 构建 workflow 不包含部署步骤。

## 截图

- [原版首屏](qa/side-quest-hero.png)
- [STU-MCP 桌面首屏](qa/desktop-hero.png)
- [STU-MCP 手机首屏](qa/mobile-hero.png)
- [手机安装区：减少动态效果](qa/mobile-install-reduced.png)
- [修正后的纸页画廊](qa/gallery-desktop.png)

完整过程截图和浏览器检查脚本保存在本地忽略目录 `output/playwright/`，不包含用户账号、凭据或真实业务结果。

## 验证范围

浏览器验收为本机 Chromium 桌面及触摸模拟，尚未覆盖真实 iOS/Safari、Android 硬件和公网访问。网站展示的产品验证范围以 stu-mcp 的验证记录为准；本次没有操作真实账号、查询私人信息或提交报修。
