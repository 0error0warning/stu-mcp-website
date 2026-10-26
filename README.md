# STU-MCP website

STU-MCP 的独立作品介绍站。与 [stu-mcp](https://github.com/0error0warning/stu-mcp) 工具仓库分开维护，当前保持 **私有，仅本地开发**。

## 本地运行

```sh
npm ci
npm run dev
```

打开终端打印的本地地址（默认 `http://127.0.0.1:5173/`）。生产构建：

```sh
npm run build
npm run preview
```

场景交互复制示例问句，安装区提供基于 Wensity 源码的单层 Prompt 输入面。可选 Agent 与模型偏好，发送箭头复制当前完整文字和选择，交给用户自己的 Agent。没有终端模式、登录表单或在线 MCP 查询；唯一站点接口 `/api/activity` 只读取公开仓库提交。

## 设计与实现

- Side Quest Adoption Center 是真实源码底稿，原件保存在 `reference/side-quest/`。保留其 OKLCH 配色、排版、插画舞台、胶囊控件、颗粒与交互节奏。
- 主页面为 HTML + 原生 CSS/JS，Vite 构建。ReactDrops 用于等高线、纸页画廊、首屏光学按钮和安装区的圆形发送按钮；物理角色默认关闭，原光球和旧长条安装按钮不再挂载。
- Magic UI 的 Dock、Animated Beam、Border Beam、Animated Theme Toggler、Text Animate 用于页面；Terminal 源码保留但不挂载。固定于 `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c`，保留 MIT 许可；搭配 Lucide SVG 图标和本地中文界面字体。
- 提交热力图使用用户指定的真实 Arc Activity Heatmap，固定于 `fff39c044c6e3b86006e3a6acc9a32a821a80d99`，MIT 许可及来源在 `src/components/community/arc-activity/`。近 90 天按每天一格、每周一列展示，不再使用自写数字日历。
- Prompt 输入面基于用户提供的 Wensity Liquid Multimodal Input 完整 MIT 源码适配，保留表面、噪声、细边、工具栏和 portal 菜单结构；UI Factory 提供上缘 mascot 的视觉参考。10 个品牌 logo 来自本地化的 Lobe Icons，8 个编程 Agent 可选，模型目录逐家核对官方资料。汇聚节点参考 UI Layouts / ReUI；来源范围见第三方声明。
- ReactDrops 固定于 `b3924b92ebfce15152cf6f04ad85301c9f343672`，来源、许可及既有组件源码一并保留。它们使用自定义 Component License，不是 MIT。详见 [第三方声明](THIRD_PARTY_NOTICES.md)。本仓库不是可重发的组件库或模板。
- 本地补丁修复透明画布清屏和按钮的显示密度更新，新增可选亮度下限避免光学按钮大面积发黑；画廊按全部选中状态拟合宽度，物理画布覆盖首屏并对齐实际黄色弧面。
- 小角色掉落默认关闭：不挂载物理场、不加载物理引擎，也没有静态角色占位。未来按钮可调用 `src/hero-characters.js` 的 `setHeroCharactersEnabled(true)` 开启，传 `false` 关闭；目前没有添加开启按钮。
- 保留的可选物理场覆盖整个首屏，黄色椭圆上弧是真实碰撞地面；角色从顶部落下、向两侧滑滚。60% 跟随鼠标，数量为手机 4 / 中屏 6 / 大屏最多 10。启用后滚动或切后台暂停、返回续场景；关闭后释放，重新启用换种子。
- 首屏、提问示例和三张原则纸页均使用原创 SVG；暗色首屏有同几何的冷色插画版本。纸页文字转为本地 OFL 字体路径。字体本地托管，Sans/Serif 两份中文子集各覆盖 481 个请求字符、支持真实 400–700，URL 带内容哈希避免旧子集缓存。实际 CDP 字体审计见 `docs/font-audit-2026-10-26.md`。
- 已加载实例保留，避免滚动时重建着色器、重播画廊。亮色等高线仅绘静态帧；暗色首屏接入真实 React Bits Gradient ASCII，DPR 1、最多24次绘制帧/秒、关闭 halo，仅在暗色首屏可见且前台运行。手机/受限设备/减少动态效果使用静态字符背景。光学按钮仅交互时流动。信息光束、能力卡边光和品牌轮换在可见时循环，离屏、后台或减少动态效果时停止；文字仍为有限入场。
- 示例是产品用法的选段，03为独立的理论课表查询；旧六阶段卡片改为课程教务、校园生活、待办偏好三个真实能力领域。来源见 `docs/product-story-2026-10-26.md`。本地/VPS双视图仅记录在 `docs/roadmap.md`，当前信息流图未改。
- 顶部 Dock 为图标单行，悬停/键盘聚焦显示 tooltip，完整图标容器按距离弹簧放大；高度为 54px，手机为 50px。821px 头部为 74px 单行，390px 为 108px 两行，内外圆角按同一中心计算。深色切换通过圆形 View Transition，不支持或减少动态效果时直接切换，选择保存在本地。
- 不增加阻塞式载入动画：现阶段优先减少运行期开销，内容直接显示。性能取样及已知验证范围见 `docs/qa.md`。

## 产品事实与提交日历

当前内容依据开发时核对的 v0.7.1 文档及 50 个工具注册；不代表所有真实业务都已通过验收。安装、能力与来源范围以工具仓库为准。

```sh
npm run update:activity
```

开发与生产预览内置只读 `/api/activity`：公开 GitHub API、固定分支 SHA 分页、10 分钟缓存，无令牌。Arc 热力图显示近 90 个实际日期：90 个数据格、7 行、当前范围 14 个周列；月标、星期标和 tooltip 保留真实日期、次数和零值。离线回退真实快照，不添加页面小字说明。现有脚本仍可更新 365 天备用数据；上线 Node 服务时挂载 `server/activity.mjs` 的 handler，纯静态 `dist/` 需要另配此接口。详见 [数据口径](docs/activity-data.md)。

原版对照及各阶段验收记录见 `docs/qa.md`。最新 [暗色首屏与叙事修订](docs/night-refinement-2026-10-26.md)；此前输入区见 [Liquid Agent 输入区](docs/liquid-agent-input-2026-10-26.md)，图表/汇聚图/Dock 见 [参考复核](docs/reference-refinement-2026-10-26.md)。旧数字日历、Prompt 终端和单次边光记录仅描述历史状态。过程文件在忽略的 `output/playwright/`，交付截图在 `docs/qa/`。

连续渲染回归：在 dev 服务中打开 `http://127.0.0.1:5173/tests/physics-render.html`，自动检查真实画布清空、透明度、鼠标眼神、动画残影及 WebGL 显示密度更新。该测试页不包含在生产构建中。

弧面物理回归：`node --test tests/ellipse-ground.test.mjs`，验证真实求解器中的左右外滑、不穿地、浅坡继续运动及靠边停稳后休眠。
