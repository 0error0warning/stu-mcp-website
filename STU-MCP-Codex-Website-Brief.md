# STU-MCP 官网设计与二开交接

为什么我要做这个网站，重点是为了发布这么一个工具，提高影响力，让更多的人知道这个STUMCP是什么，同时这个页面尽可能的展示项目特点，我也想做成一个“炫技”页面，所以我找了大量优秀设计师的开源前端组件或者模板，我们来用上去，打造一个非常高级非常有设计感的工具介绍页。后续这个网站会变成我们产品宣发过程中重要的引导页面，比如我在小红书上发了一个视频介绍stumcp的功能，那么我将留下这个网页端地址，让用户点进来能直接了解更多。（当前先不考虑部署网站，我们先本地开发，我的服务器域名还在ICP备案）。
> \*\*当前唯一主底稿：Side Quest Adoption Center。\*\* 基于其真实 HTML 原码制作 STU-MCP 独立开源项目介绍站；保留温暖明亮的配色、插画、排版、交互和细节质感，先忠实还原再替换为真实产品内容。\*\* 禁止重新生成泛 SaaS 首页或拼装旧原型。

## 1\. 产品背景与边界

* **唯一产品事实来源**：[STU-MCP 仓库](https://github.com/0error0warning/stu-mcp) · [README](https://github.com/0error0warning/stu-mcp/blob/main/README.md) · [功能清单](https://github.com/0error0warning/stu-mcp/blob/main/docs/campus-services.md) · [安装说明](https://github.com/0error0warning/stu-mcp/blob/main/docs/install.md)。
* STU-MCP项目在我们电脑本地的“H:\\杂项\\代码垃圾\\stu-mcp”中
* **定位**：个人独立开发的开源 **MCP 信息连接层**，把分散在 OA/通知、教务、MySTU、课程作业、附件及部分校园生活服务中的信息交给**用户自己的 Agent**；它不是另一款聊天机器人，也不托管学校账号。只是一个信息聚合mcp工具
* **核心故事**：**分散的信息源 → STU-MCP 检索/读取并标记来源 → 用户自己的 Agent 理解、整理和回答**；强调真实出处、信息可能不完整和刷新/缓存时间，而非“万能自动办事”。
* **版本边界**：仓库当前文档以 [v0.7.1 学生预览版](https://github.com/0error0warning/stu-mcp/blob/main/docs/releases/v0.7.1.md) 为准，记载 **50 项 MCP 工具**；页面中数字与功能以开发时实际版本和验收记录为准，不把未验证的入口、尚在开发的“机会雷达”或自动提交功能写成已上线。
* **隐私**：登录由用户在本地私密设置页/终端亲自完成，不向 Agent 或介绍站提交密码；可选个人偏好/画像默认关闭并由本地控制；私人 `school-hub` 与微信聊天资料**不属于**公开 STU-MCP，也不要出现在宣传素材里。
* **页面属性**：个人名义备案的**独立开源作品介绍页**（能力、示例、安装、源码、更新），不是学校官方门户、企业 SaaS 后台或线上代登录平台，所以页面尽量不要直接用文字提到“校园”“汕头大学”“学校”等等关键字。

## 2\. 唯一主底稿：Side Quest Adoption Center

* **演示**：[Side Quest 实际网页](https://instalanding.ai/demos/side-quest-adoption.html)；**源码**：[index.html](https://github.com/RayVelez27/instalanding.ai/blob/main/pages/side-quest-adoption-center-page/index.html)；**Agent 交接**：[PROMPT.md](https://github.com/RayVelez27/instalanding.ai/blob/main/pages/side-quest-adoption-center-page/PROMPT.md)；[README/页面结构](https://github.com/RayVelez27/instalanding.ai/blob/main/pages/side-quest-adoption-center-page/README.md)。
* **视觉须继承**：奶油黄渐变首屏、藏青灰文字、淡紫辅助色、圆润胶囊控件、Gloock 英文衬线大字、Schibsted Grotesk 正文、原创卡通 SVG、轻颗粒纹理、柔软的弹性与悬停反馈；以源码的 **OKLCH 变量**为准，不要改成黑底霓虹风或照搬 Sumwise 的橙紫印刷体系。
* **技术**：原版是约 99 KB 的 **单个 HTML + 原生 CSS/JS**，**不依赖 GSAP/Lenis/React**；互动使用 Web Animations API、IntersectionObserver、SVG 和 CSS 动画；字体从 Google Fonts 加载，中文需配置可读且授权合适的字体回退。
* **源码要点**：先读 `index.html` 开头 `MAP / ADAPTING`。功能卡片由 `adaptedIdeas` 和 `illustrations` 映射渲染；原始卡片数量“6”在多处硬编码，修改时同步核对；描边动画 `.ln`、`.brush path` 等依赖 `pathLength="1"`；原版「领养」状态仅存内存，刷新即清空，**不等于真实账号状态**。
* **实施**：先原样运行模板并截图确认，再保留结构和交互逐项换内容；除非确有必要，不要为使用其他动画组件而重构成 React。

## 3\. 页面映射：保留形态，替换叙事

|Side Quest 原区域|STU-MCP 改造|
|-|-|
|`nav` 顶部导航和胶囊 CTA|品牌 STU-MCP；入口指向「用途 / 使用方式 / GitHub / 文档」，主 CTA「试着接入」或「查看源码」，不设计虚构注册按钮。|
|`hero` 黄油色舞台、挥手吉祥物、标题|继续保留温暖插画舞台；设计**原创**「收集散落纸张/信号的小角色」或带书页、建筑几何隐喻的装置；标题讲信息从多入口进入**自己的 Agent**，不突出学校官方身份。|
|`stats` 数字徽章|可以展示真实版本、经过核实的工具数、接入来源数；取仓库最新证据，不可沿用模板虚构数量/采用人数。|
|`ideas` 六张可「领养」插画卡|改成 6 个**真实使用场景**：查通知与 PDF、课程作业、寻找比赛信息与出处、社区讨论、一卡通只读查询、报修预览与本人确认；每张用原创 SVG 和真实示例提示词。**“领养”按钮改为本地选择/复制询问句，不能假装已经执行查询。**|
|`how-it-works` 步骤|展示「多个来源 → STU-MCP 检索、读取、保留来源 → 用户自己的 Agent 理解和行动」；不要误写成 STU-MCP 自身是聊天 Agent。|
|`lifecycle` 生命周期|改成从发现信息、读取正文/附件、验证新鲜度到 Agent 使用的阶段；可延展为一次轻量信息流动动画。|
|`testimonials` 评价|改成个人开源动机、隐私原则、来源追溯、功能边界；无真实授权评价就**删掉证言**。|
|`pricing` 价格方案|改成「使用自己的 Agent」三步：安装/连接客户端、本人在本地配置认证、向 Agent 提问；不保留虚构套餐。|
|`faq`|解释是否需要模型 API Key、是否必须使用 Hermes、哪里输入账号、为什么查不到某条信息、来源及缓存时间等。|
|`footer`|GitHub、安装文档、更新记录、MIT 许可和**个人独立项目、非汕大官方服务**声明。|

**两项新增内容**：

1. **信息汇聚主视觉**：用多条细弧线、纸带或等高线分别从通知、教务、MySTU 等信息源汇入 **STU-MCP**，再流向 **Your Agent**；视觉必须适配 Side Quest 的手绘/插画气质，而非黑底拓扑图。放在 `hero` 周边或 `how-it-works`，不要破坏原模板的阅读节奏。
2. **GitHub 活动日历**：在项目进展部分加入与整站风格一致的方格日历；取公开仓库真实提交日期，不伪造活跃度，并将「该仓库 commit」与「个人账号贡献」区分。建议先独立实现 CSS Grid／SVG，不强行为此引入 React。

## 4\. 动效与组件资源（用到才集成）

* **ReactDrops**：[组件目录](https://reactdrops.dev/components) · [源码](https://github.com/crisjavr/reactdrops) · [自定义许可](https://github.com/crisjavr/reactdrops/blob/main/LICENSE)：偏精致材质/互动组件，**需要尊重 Side Quest 的圆润插画/温暖配色，不引入不协调的大型 WebGL 组件**。
* **物理互动**：[Shape Physics](https://reactdrops.dev/components/background/shape-physics)：用于少量可拖拽/抛掷的原创书页、便签、建筑几何；原版只内置球/锥/方块/云/水滴/花朵，**导入自定义 SVG/PNG 或 3D 模型要修改渲染和碰撞源码**。
* **视觉纹理**：[Topographic Flow](https://reactdrops.dev/components/background/topographic-flow) · [Topographic Terrain](https://reactdrops.dev/components/background/topographic-terrain)：可抽象山地等高线，只在局部使用，质感贴合 Side Quest，不要全屏乱动。
* **可选效果**：[Refracted Text](https://reactdrops.dev/components/text-effect/refracted-text)（玻璃文字） · [Fractal Glass](https://reactdrops.dev/components/image/fractal-glass)（折射图片） · [Fan Gallery](https://reactdrops.dev/components/gallery/fan-gallery)（扇形图片） · [Liquid Glass Logo](https://reactdrops.dev/components/text-reveal/liquid-glass-logo)（Logo 动画） · [Liquid Glass Orb](https://reactdrops.dev/components/ai/liquid-glass-orb)（Agent 状态） · [Chromatic Button](https://reactdrops.dev/components/button/chromatic-button)（光学按钮）；**挑一两个即可**。
* **线条汇聚可复用参考**：[Magic UI Animated Beam](https://magicui.design/docs/components/animated-beam)（多节点曲线路径流光） · [Dashmotion](https://github.com/csthink/dashmotion)（MIT、SVG 流程/架构流线）；如需使用，改写为 Side Quest 的浅暖色、柔和曲线和原生动效节奏。
* **活动日历**：[react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar) 或自己写 CSS Grid；数据取 [仓库公开提交 API](https://api.github.com/repos/0error0warning/stu-mcp/commits)，按日期汇总、缓存并标注“该仓库提交”，**不能误称用户 GitHub 全站贡献，也不要随机填绿格子**；无数据时明确显示暂无数据。

## 5\. 汕大与山海的**隐性视觉线索**

* **可抽象参考**：东海岸图书馆“智慧之环”的圆环/竖向百叶、桑浦山校区图书馆的书盒体块、真理钟的金属弧线、桑浦山等高线、海风/水纹、课表方格；**选 1–2 个贯穿设计**，不要变成学校宣传页。
* **参考来源**：[汕大官方校园景观](https://www.stu.edu.cn/xxgk/xyjg.htm) · [东海岸图书馆“智慧之环”](https://www.stu.edu.cn/info/1088/41056.htm) · [桑浦山校区建筑与真理钟](https://www.stu.edu.cn/info/1088/58776.htm)；仅研究轮廓与空间比例，**重画自己的抽象矢量，不直接复用校徽、官方宣传照或受保护的建筑图片**。
* **文案边界**：视觉尽量含蓄、不强调校方身份；功能介绍需要时仍应如实说明实际数据来源，页脚清晰写“个人独立开源项目，非汕头大学官方服务”。**不写校名不是备案合规的替代办法**，上线前需按个人主体实际站点内容复核要求。

## 6\. 备用灵感库（不得取代 Side Quest 主底稿）

* **前主底稿，仅作动效参考**：[Sumwise 演示](https://instalanding.ai/demos/sumwise-ai-accounting.html) · [源码](https://github.com/RayVelez27/instalanding.ai/tree/main/pages/sumwise-ai-accounting-firm-page)（双色插画飞出/滚动叙事；**不是**现行色彩或排版规范）。
* **与新底稿同类的插画/风格**：[Easel](https://instalanding.ai/demos/easel-artist-assistant.html)（双色印刷） · [Tokenhaus](https://instalanding.ai/demos/tokenhaus-design-academy.html)（几何拼贴） · [Dotdrum](https://8bsite.github.io/print-studio-website-template/)（印刷） · [Paper Sun](https://instalanding.ai/demos/daybreak-night-shift.html)（贴纸/纸片） · [Side Quest 源库](https://github.com/RayVelez27/instalanding.ai)。
* **汇聚线、信号、空间感**：[LED Metro](https://instalanding.ai/demos/meridian-led-storefront.html)（动态线路） · [Myriad](https://instalanding.ai/demos/myriad-agent-swarm.html)（粒子聚合） · [Corvane](https://instalanding.ai/demos/corvane-capital.html)（山脊线） · [GEO/LAB](https://instalanding.ai/demos/geolab-planetary-geography.html)（等高线） · [Icon-Cut Card Stack](https://instalanding.ai/demos/throughline-scroll-stack.html)（贯穿线） · [Instrument](https://github.com/namrasamanta/portfolio-template)（节点动画）。
* **其他完整底稿**：[CRAFT Studio](https://instalanding.ai/demos/craft-studio.html) · [Tarn](https://instalanding.ai/demos/tarn-file-transfer.html) · [FORMWORK](https://github.com/shellcat-com/formwork) · [8B 模板库](https://8b.com/templates/)；**建筑/版式**：[Bronxa](https://craftwork.design/product/bronxa-portfolio-framer-figma-template) · [Morrow House](https://www.framer.com/marketplace/templates/69771/) · [Kern](https://www.framer.com/marketplace/templates/kern/) · [DatumArc](https://www.framer.com/marketplace/templates/datumarc/) · [Arynza Figma](https://www.orbix.studio/resources/arynza-portfolio-landing-page) · [Arct Figma](https://templatesjungle.com/downloads/arct-figma/)。
* **授权须单独核对**：[AW-2025 Portfolio](https://github.com/AntoineW/AW-2025-Portfolio) 为非商业许可，不能直接用于商业项目；[Onda](https://github.com/8bsite/design-studio-website-template) 可参考版式；后续宣传片可研究 [telegram-style-video](https://github.com/moondiel/telegram-style-video)，其许可需要另核。

## 7\. Codex 操作与验收

1. **基线**：先复制 Side Quest 的 `index.html` 并在浏览器原样运行；读 `MAP / ADAPTING` 与 [模板 Agent 指南](https://github.com/RayVelez27/instalanding.ai/blob/main/AGENTS.md)，保留对应 CSS 变量、SVG、交互、响应式，先截图对照再改。
2. **文案/插画**：根据 STU-MCP 仓库最新 README、[功能说明](https://github.com/0error0warning/stu-mcp/blob/main/docs/campus-services.md) 与 [安装文档](https://github.com/0error0warning/stu-mcp/blob/main/docs/install.md) 替换虚构故事、价格和数字；先更新 `adaptedIdeas` 与 SVG，确认按钮真实有效。
3. **扩展**：再加入真实的数据汇聚示意与 GitHub 方格日历，最后少量挑选 ReactDrops；当前模板是无框架网页，**ReactDrops 原版是 React 组件，不可直接假装复制 JSX 就能在 HTML 运行**，如要用需合理引入 React 或单独实现同类型效果并遵守许可。
4. **事实与安全**：不改 STU-MCP Python/MCP 核心、不碰真实凭据、不同步用户隐私；展示示例明确为示意，不能宣称已接入、已验证的范围之外的能力；个人主体备案页面保持非官方定位。
5. **体验**：桌面、390px 手机和触摸交互检查；中文断行、字体回退、无横向溢出、无控制台错误、动画流畅、`prefers-reduced-motion`；动态效果不能牺牲内容可读性：不要做卡片嵌套，不要写特别多的小字说明：不要在卡片大标题下面又写一堆小字。
6. **阶段交付**：① 原版忠实复现 → ② STU-MCP 文案/原创插画 → ③ 信息流/真实日历 → ④ 少量视觉精修 → ⑤ 浏览器验收；每阶段保留可对照效果，先给用户审美确认。

**核心：Side Quest 是正式设计基线；把信息聚合讲清楚。**

