# 页面中轴与视觉重心修正（2026-10-27）

用户要求修正多处居中问题并更新正式网站；本次发布授权来自该请求。仓库保持 private，仅独立网站范围。

## 定位与变更

- 原有主要区块外框在 390/607/821/1440px 下已居中；问题主要在内部排版。保留正文和章节标题的左对齐设计。
- 首页两个按钮原宽 145/132px（手机）与 178/160px（桌面），间隙中点分别向右偏 6.5/9px。现在共享宽度，间隙中点偏差 0px；320px 下收缩为 134.5px，避免挤出容器。
- 标题行末全角标点改为悬挂排版，按文字主体居中，保留标点和无障碍文本。
- 凤凰整体骨架向左校正 19.016 个源 SVG 单位，使躯干中心与圆环中心对齐。脚、表情、特效、命中区域一起移动；视线锚点同步移动约 8 个场景单位。
- 侧边插画原仅在 <=412px 内缩，414–430px 下出现裁切；现在内缩随 420–520px 宽度平滑递减。实际触摸设备模拟截图还发现：SVG 同层 individual translate + transform 动画的绘制位置与 DOM 几何不同；改用静态外层负责内缩，内层负责浮动/动作，截图确认解决。
- 流程图三列改为等宽，中心 STU-MCP 节点居中；统计栏桌面四等分、手机三等分。

## 实际验证范围

Chrome / Playwright CLI，本地 Vite 开发服务与最终生产构建 preview。没有真机 Safari 验证。

- 390、414、430、607、681、821、1440px：按钮间隙中心偏差 0px，流程图中心节点偏差 0px，文档/气泡/日历/信封边界在屏内，页面无水平溢出。320px 补查按钮宽度 134.5px，无水平溢出。
- 390 与 1440px 逐段滚动加载，再测首页、特点栏、统计栏、场景、流程、生命周期、原则、进展、安装、Agent 输入、FAQ、页脚，外框中点偏差均为 0.00px；console error / pageerror 均为 0。
- Enter 触发摸脸：双颊 warm；减少动态模式 Space 同样可触发，凤凰运行中 Web Animations 数量 0。
- 390×844 的 isMobile + hasTouch 浏览器上下文：真实 touchscreen.tap 命中脸颊、双颊反应；主题按钮 tap 成功；场景按钮 tap 导航到 #ideas；场景 touch-action 为 pan-y。未把模拟触摸称为真机测试。
- 深浅主题切换后同一个 SVG 节点保留。已检查浅色桌面/手机、深色桌面/手机及流程图和统计栏截图。
- `node --test tests/*.test.mjs`：11/11 通过；最终 `npm run build` 通过。

阶段截图存于 `docs/qa/axis/`，包含修改前手机图、修改后两种主题的桌面/手机图、流程图、手机统计栏。动态截图的具体姿态会随时间变化；外框居中不表示所有三分之四侧脸的轮廓都完全对称。

## 正式站发布复核

已发布静态版本 `31d81b3` 至 https://stu-mcp.com，服务器 current 指向 `/opt/stu-mcp-site/releases/31d81b3`。归档 SHA-256：`c106b314647d78dcddd838cade0280494ad09e7a9a65fda6c0c746f709a87c5a`。旧版本 `198d729` 保留；Caddy 配置哈希未变，API 源码 diff 一致，caddy / stu-site-activity / stu-site-guard 均 active。

正式域名 Chrome 实测 HTTP 200，加载 `/assets/index-DgUd615I.css`，新的插画外层存在；1440px 流程图中心偏差 0px。390px 触摸上下文按钮宽度均 145px、间隙中点偏差 0px、无横向溢出、竖屏导航 Dock 隐藏；主题切换保持同一 SVG。检查过程中 console error / pageerror 均 0。`/api/activity` 返回 200，repository 为 `0error0warning/stu-mcp`，delivery 为 `live`。正式站截图 `live-desktop.png`、`live-mobile-light.png`、`live-mobile-dark.png` 已保存，手机深浅两图已视觉复核。
