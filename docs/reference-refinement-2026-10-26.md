# 参考复核与四处重做 · 2026-10-26

后续更新：用户提供 Wensity 完整代码后，输入区已再次按源码重做；字体升级为双可变子集并做 CDP 实测。当前这两项见 [Liquid 输入区](liquid-agent-input-2026-10-26.md)与[字体审计](font-audit-2026-10-26.md)。以下保留本阶段的真实记录，旧“未移植源码”和 444 字数据仅描述当时状态。

本轮对应最新六条浏览器评论：热力图、Agent Prompt、汇聚图与节点、Dock 比例及圆角。仓库保持私有，仅本地开发，没有部署。本记录取代上一阶段的数字日期日历、Prompt 终端、多层安装卡片、双行文字 Dock 和单次信息光束。

## 实际参考与采用范围

先打开公开页面及交互预览，查看悬停、输入、光束与 Dock 的变化，再决定实现。没有将只看见预览的组件称为源码移植。

| 用户给的参考 | 实际采用 |
| --- | --- |
| [Arc Activity Heatmap](https://21st.dev/@kuratlielia/components/activity-heatmap) 与 [ContribKit](https://contribkit.app/?user=torvalds) | 接入 Arc 真实 MIT 组件源码；使用七行周历、小方格、月份/周几轴、详情浮层、键盘和触摸选择。保留真实零值及日期，未伪造提交频次。 |
| [Liquid Multimodal Input](https://21st.dev/@wensity/components/liquid-multimodal-input) | 实际查看公开预览及输入状态。源码需要登录，因此采用公开可见的单层磨砂输入面、可增长文本区和底部动作栏，产品代码自行实现；没有复制未取得的源码。省略页面并不支持的附件、模型和发送功能。 |
| [UI Layouts Hover Cards](https://www.ui-layouts.com/components/hover-cards) | 实际查看 Creative Hover Card 的静止和悬停状态，并核对公开 MIT 源码。采用单节点表面、紧凑信息层级、几何背景及悬停抬升内部插画；不移动端口，不复制演示图片或 GIF，不替换产品标签。 |
| [ReUI / Sean Statistics Card 2](https://21st.dev/@sean0205/components/statistics-card-2) | 查看公开交互预览，参考小标题、主要文字、分隔线与底部说明的层级。未复制受登录限制的完整源码、演示业务数字或素材。 |
| [Magic UI Dock](https://magicui.design/docs/components/dock) | 复核官方预览及已固定的官方源码。使用图标栏、全容器弹簧放大和 tooltip；压缩外壳，居中定位，按同一圆心关系设置内外圆角。 |
| [Magic UI Animated Beam](https://magicui.design/docs/components/animated-beam) | 保留真实组件的 SVG 渐变技术，改为按每根连线实际端点移动。光波在可见时持续循环，离屏、后台和减少动态效果时停止。 |

Arc 固定版本为 `fff39c044c6e3b86006e3a6acc9a32a821a80d99`，源码、完整 MIT 许可、registry 地址与 SHA-256 位于 `src/components/community/arc-activity/`。UI Layouts 核对版本为 `88d827d7ec342917ca06f6894e5add65fabbe5d8`，MIT 保留在 `licenses/UI-Layouts-MIT.txt`。Magic UI 仍固定于 `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c`。ReactDrops 的自定义 Component License 保持不变。

参考检查截图及原始结果保留在本地忽略目录 `output/playwright/ref-*`。这些外部演示页面的第三方网络错误不计作产品页面错误。

## 改动结果

- **热力图：** 移除外层大卡片、巨型 116、日期数字格和 30/90 天切换。使用最近 90 个真实日期，14 周列 × 7 行，18px 格子和 4px 间距。总数和实际范围置于一行；月份、周几、图例与详情由真实组件提供。仍读取原有只读公开 API，校验及离线回退不变。
- **安装：** 一层可编辑 Prompt 输入面，下方仅复制动作。复制使用当前编辑全文，支持 Ctrl/Command+Enter，空白禁用。保留剪贴板拒绝时的手动复制弹窗。安装文档链接位于输入面外；不把自然语言 Prompt 当成 Shell。旧 Terminal 源码保留但不挂载。
- **信息汇聚：** 三个来源连接 STU-MCP，再连接 Your Agent。桌面平滑横向，手机平滑纵向；端口独立引用并按真实 DOM 几何测量，文字与图标不会影响连线对齐。节点内部几何插画悬停抬升，外框和端口保持静止。
- **光束：** 原先渐变扫过整张 SVG，短连线在多数周期内没有光波；现在按各线起终点移动，使用清晰彩色主线和低透明度底光。可见时循环，离屏或后台停止。减少动态效果时仅保留静态底线。这一行为有意替代上一阶段的单次入场，不能继续引用上一阶段的“可见信息区空闲 0 RAF”作为当前结果。
- **Dock：** 图标加 tooltip，默认高度 54px，手机 50px。821px 头部从 126px 降到 74px；仅不超过 640px 的手机需要两行，390px 高度 108px。静止时外圆角 16px = 内圆角 9px + 6px 内边距 + 1px 边框；手机为 14 = 9 + 4 + 1。减少动态效果与触摸不放大。
- **字体：** 更新本地 Noto Sans SC 界面子集至 444 个请求字符，覆盖新组件和日期标签；126,440 字节，SHA-256 `9822429ef603b0fc2626fdfc341757618144279ed396d163a3c807d77f6d2f83`。请求字符缺失数为 0，保留来源和 OFL。

## 实际验证

在本机 Windows Chromium，通过 Playwright CLI 的隔离浏览器执行。包括 dev 与最终 `npm run build` 的生产预览；未操作用户真实账号或查询私人数据。

| 项目 | 观察结果 |
| --- | --- |
| 最终构建预览 1440×1000、821×719、390×844 | 页面宽度分别为 1440、821、390；无横向溢出；各有 90 个真实日期单元；无旧安装外层卡片。 |
| Dock | 三个尺寸中心误差 0px；高度分别 54、54、50px，头部 74、74、108px。开发检查另覆盖 1169、709、641px；悬停保持居中，tooltip 可用。 |
| 键盘 | 跳转链接、品牌、Dock 的实际 Tab 顺序正常；焦点 tooltip 出现，Enter 跳转后标题位于固定头部下方。热力图 Right 从第 0 到第 7 格、Down 到第 8 格，Enter 选择成功。 |
| Prompt | 821px 和 390px 编辑后全文与真实剪贴板一致；拒绝剪贴板后，弹窗含当前全文，Escape 关闭。手机按钮高 44px；最终默认文本区 clientHeight 与 scrollHeight 同为 129px。 |
| 热力图触摸 | 在启用触摸的独立浏览器中实际 tap；最终预览日期单元 `aria-selected=true`。详情抽查 10 月 21 日显示真实 41 次提交。 |
| 连线几何 | 821px 四条线端点最大误差小于 0.00004px；390px 四条线首尾误差均为 0，方向均向下。 |
| 连续光波 | 间隔约 9 秒后再取样，渐变坐标仍改变，不受旧单次入场计时器限制。 |
| 暂停与恢复 | 滚动离屏后相隔 700ms 坐标不变；模拟 `document.hidden` 与 visibilitychange 后相隔 500ms 坐标不变，返回继续。这里模拟了页面可见性，未声称实测操作系统切后台。 |
| 减少动态效果 | 运行时切换后 `data-playing=false`，每条 SVG 仅 1 条静态路径；手机最终预览 canvas 为 0，无溢出。 |
| 主题 | 821px 实际切换浅/深色并查看节点与 Prompt 截图，文字、端口和动作保持可辨认。 |
| 默认掉落 | 三个构建预览尺寸均为 0 物理 canvas、0 物理模块请求；保持默认关闭。 |
| 错误 | 最终生产预览页面异常、控制台 error、非导航中止的失败请求均为 0。 |
| 构建与自动检查 | `npm run build` 通过；4 项真实弧面求解器及 5 项公开提交数据检查共 9/9 通过。未改底层渲染器，未把历史 7 项像素检查说成本轮新测。 |

构建主脚本 452.72 kB（gzip 147.51 kB）、CSS 103.95 kB（gzip 23.98 kB）；物理和原光球仍为可选懒加载模块。未进行本轮整体 FPS/GPU 基准，不能据此承诺所有设备流畅。尚未覆盖真实 iOS/Safari、Android 硬件或公网部署。

原始检查：`output/playwright/ref-production-final.txt`、`ref-beam-final.txt`、`ref-prompt-integrated.txt`、`ref-dock-*-results.txt`、`ref-heatmap-qa.txt` 与 `review-layout-*`。

## 保留截图

- [821px Dock 与首屏](qa/reference-dock-821.jpg) · [1440px 首屏](qa/reference-hero-1440.jpg)
- [821px 信息汇聚](qa/reference-connection-821.jpg) · [390px 信息汇聚](qa/reference-connection-390.jpg) · [深色信息汇聚](qa/reference-connection-dark-821.jpg)
- [821px Prompt](qa/reference-prompt-821.jpg) · [390px Prompt](qa/reference-prompt-390.jpg) · [深色 Prompt](qa/reference-prompt-dark-821.jpg)
- [821px 热力图](qa/reference-activity-821.jpg) · [390px 热力图](qa/reference-activity-390.jpg)
- [手机减少动态效果](qa/reference-reduced-390.jpg)
