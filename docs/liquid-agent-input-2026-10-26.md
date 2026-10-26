# Liquid Agent 输入区与字体 · 2026-10-26

本轮处理五条新评论：Hero 字体、全页字体排查、按用户给的完整代码重做输入区、移除静态客户端标注，以及发送箭头执行复制。保留当前首屏插画、汇聚图、Dock 和 Arc 热力图；仓库私有，本地开发，没有部署。

## 来源和实际改动

- **Wensity：** 用户直接提供了 [Liquid Multimodal Input](https://21st.dev/@wensity/components/liquid-multimodal-input) 的完整代码。组件公开页面标注 MIT。本轮基于其表面、噪声、遮罩细边、textarea、toolbar、portal listbox、AnimatePresence 与 LayoutGroup 结构适配；现有 `motion/react` / Lucide 替代重复依赖，普通 scoped CSS 替代 Tailwind。源码入口 `src/components/liquid-agent-input.jsx`，来源/改动记录在相邻 `.source.json`；署名与 MIT 见 `licenses/Wensity-Liquid-Multimodal-Input-MIT.txt`。此前“仅参考预览、没有移植”的说法属于旧阶段。
- **UI Factory：** 实际检查 [AI Mascot Input](https://uithefactory.com/ai-mascot-input) 的空态和填字状态：填字后 mascot 位于输入框右上缘并压住边框。这里以约 64px 的品牌浮标取代机器人，压边约 6–7px；没有复制 UI Factory 源码或将其许可说成 MIT。
- **品牌和型号：** 原始本地 Lobe Icons SVG，10 个品牌轮换、8 个编程 Agent 可选；模型每家一个，8 家提供商。来源、核对日、固定 commit、图标哈希与官方型号依据见 [目录核对](agent-catalog-2026-10-26.md)。这不是在线调用或客户端兼容性验收，模型选择表示复制文本中的偏好。
- **发送：** 使用真实 [ReactDrops Chromatic Button](https://reactdrops.dev/components/button/chromatic-button)，44px 圆形上箭头，点击后复制当前编辑文字及所选 Agent/模型。保留原文，不清空输入。成功才显示短暂对勾；修改正文或选择项会失效旧请求回执。手机、减少动态效果及受限设备使用静态材质。ReactDrops 自定义 Component License 不变。
- **功能语义：** 移除静态 `Codex · Claude Code` 标注、可见的复制文字和复制图标，改为真正可操作的两个选择菜单与发送外观。没有终端框、多层外卡片、附件假按钮或模型 API 请求。Enter 复制，Shift+Enter 换行，中文 IME 组合 Enter 不提交；拒绝剪贴板时保留全文供手动复制。

## 字体处理

先用 CDP `CSS.getPlatformFontsForNode` 检查实际 glyph 来源。被评论的 Hero lede 与按钮原先已使用自托管 Noto Sans SC，不能把主观样式问题说成系统回退。采用的排印调整为：lede 中文 Noto Serif SC 400，两枚 CTA 中文真实 600，与标题呼应；普通正文和输入 UI 保持 Sans。

实际缺陷是文本箭头 `↗` 回退到系统字体，以及旧静态 Serif 400 无法供应 FAQ 的声明 500。现在两份 Noto 可变字体各覆盖 471 个请求字符、缺字 0，包含中文、全角标点和页面箭头；Serif 提供真实 400–700。3 张外部 SVG 的 9 段文字用本地 OFL 字体转成路径，解决外部图片无法继承网页字体的问题，其余插画代码保持一致。

全页 5 组明暗/尺寸的实际字体记录及原始 CDP JSON、cmap/轴、许可与来源见 [字体审计](font-audit-2026-10-26.md)。这覆盖发布文案、FAQ、textarea 原生编辑器和两个菜单，任意用户输入的额外字符仍可使用配置的回退字体。

## 实际验证

Windows 上独立 Chromium + Playwright CLI，dev 与最终生产预览；390px 使用 DPR 2、mobile/hasTouch 的独立 context。没有使用用户账号、凭据或真实业务数据。

| 检查 | 结果 |
| --- | --- |
| 821px Agent/模型菜单 | 均 8 项；Home/End/方向键/Enter 选择、Escape 返回 trigger 焦点、Tab/Shift+Tab 到相邻控件正常。 |
| 弹窗位置 | 实测上方与下方展开，均在视口 12px 边界内。手机实际 tap 可滚动选择最后的 TRAE / Doubao Seed 2.1 Pro。 |
| 真实复制 | 821px 与 390px 的剪贴板含所选 Agent、模型及当前完整文字；Shift+Enter 只换行、模拟 IME 组合 Enter 不复制、普通 Enter 一次复制。 |
| 失败回退 | 模拟 clipboard 拒绝，手动复制弹窗含完整上下文和正文；不误显示发送成功。 |
| 异步回执 | 故意延迟 writeText，再分别修改正文、Agent、模型，随后返回旧成功结果；三个情形均不把新状态标成已复制。 |
| Chromatic 圆按钮 | 发现 upstream 默认 `min-width:165.25px` 会挤出44px容器，已用产品级样式约束44px并实测；正常桌面真实 canvas 为1，手机静态替代为0。按下瞬间的 .94 缩放是原反馈，静止点击目标44px。 |
| Logo 生命周期 | 可见约3.1秒后从 Cline 变为 OpenCode；离屏、模拟 document.hidden、reduced 各3.1秒均保持同一logo，`data-logo-playing=false`。未声称实测操作系统切后台。 |
| 主题及减少动态效果 | 深色 logo 和文字可辨；手机 reduced 下 canvas 0、运行 DOM 动画0、logo暂停。 |
| 最终构建预览 | 1440×1000、821×719、390×844 均无横向溢出、无漏图，热力图90日期、物理canvas0、旧静态标注0；页面异常、console error和非导航中止的失败请求均0。 |
| 实际字体 | 1440明暗、821明、390明暗共5组，全页233/228文字记录（含6 FAQ正文、textarea编辑器及8+8菜单），系统glyph记录0。 |
| 构建及回归 | `npm run build` 通过；既有5项公开数据与4项真实弧面求解检查共9/9通过。底层渲染器未改，未把旧像素测试称为本轮新测。 |

这是本机 Chromium 桌面和触摸模拟，未覆盖真实 iOS/Safari、Android 硬件和公网部署。四份活跃字体总计373,840字节，新增16个SVG共27,272字节，没有导入整套图标库。仅在输入区可见时轮换品牌；不声称全页整体帧率或GPU基准。

原始交互记录：忽略目录 `output/playwright/liquid-agent-qa-desktop.txt`、`liquid-agent-qa-mobile.txt`、`liquid-copy-race-final.txt`、`liquid-production-final.txt`。实际参考截图在 `ref-prompt-v2-*`；字体证据在 `docs/qa/fonts/`。

## 当前截图

- [821px 首屏字体](qa/liquid-hero-821.jpg) · [1440px 首屏](qa/liquid-hero-1440.jpg) · [390px 首屏](qa/liquid-hero-390.jpg)
- [821px 输入区](qa/liquid-input-821.jpg) · [Agent 菜单](qa/liquid-agent-menu-821.jpg) · [模型菜单](qa/liquid-model-menu-821.jpg)
- [390px 输入区](qa/liquid-input-390.jpg) · [390px 模型菜单](qa/liquid-model-menu-390.jpg) · [390px 深色](qa/liquid-input-dark-390.jpg)
