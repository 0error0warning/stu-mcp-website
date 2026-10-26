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

没有后端、登录表单或在线 MCP 查询。场景交互只复制示例问句；安装按钮复制公开安装 prompt。

## 设计与实现

- Side Quest Adoption Center 是真实源码底稿，原件保存在 `reference/side-quest/`。保留其 OKLCH 配色、排版、插画舞台、胶囊控件、颗粒与交互节奏。
- 主页面为 HTML + 原生 CSS/JS，Vite 构建。五个真实 ReactDrops 组件以 React islands 接入：Topographic Flow、Shape Physics、Fan Gallery、Liquid Glass Orb、Chromatic Button。
- ReactDrops 固定于 `b3924b92ebfce15152cf6f04ad85301c9f343672`，只保留实际使用的源文件。它们使用自定义 Component License，不是 MIT。详见 [第三方声明](THIRD_PARTY_NOTICES.md)。本仓库不是可重发的组件库或模板。
- 本地补丁修复透明画布清屏和按钮的显示密度更新；画廊按全部选中状态拟合宽度，物理画布覆盖首屏并对齐实际黄色弧面。
- 小角色掉落默认关闭：不挂载物理场、不加载物理引擎，也没有静态角色占位。未来按钮可调用 `src/hero-characters.js` 的 `setHeroCharactersEnabled(true)` 开启，传 `false` 关闭；目前没有添加开启按钮。
- 保留的可选物理场覆盖整个首屏，黄色椭圆上弧是真实碰撞地面；角色从顶部落下、向两侧滑滚。60% 跟随鼠标，数量为手机 4 / 中屏 6 / 大屏最多 10。启用后滚动或切后台暂停、返回续场景；关闭后释放，重新启用换种子。
- 首屏、六个场景和三张原则纸页均使用为本项目绘制的原创 SVG。字体本地托管，来源、哈希与 OFL 许可保留在仓库。
- 组件首次接近视口时懒加载，已加载实例保留，避免滚动时重建着色器、重播画廊。等高线仅绘静态帧；光球和安装按钮只在悬停或聚焦时流动，手机/省流量/低核心设备采用静态替代。卡片插画与连接虚线仅交互时运动，离屏或后台暂停；大块模糊云层静止。减少动态效果模式使用静态替代。
- 不增加阻塞式载入动画：现阶段优先减少运行期开销，内容直接显示。性能取样及已知验证范围见 `docs/qa.md`。

## 产品事实与提交日历

当前内容依据开发时核对的 v0.7.1 文档及 50 个工具注册；不代表所有真实业务都已通过验收。安装、能力与来源范围以工具仓库为准。

```sh
npm run update:activity
```

脚本通过公开 GitHub API 更新 `public/data/activity.json`，不使用令牌。统计指定默认分支快照的过去 365 个 UTC 日期，按 `commit.committer.date` 汇总；不是个人全站贡献。刷新失败保留旧快照，前端标注更新时间。详见 [数据口径](docs/activity-data.md)。

原版对照、桌面和手机验收记录见 `docs/qa.md`。浏览器过程文件保存在忽略的 `output/playwright/`；交付截图保存在 `docs/qa/`。

连续渲染回归：在 dev 服务中打开 `http://127.0.0.1:5173/tests/physics-render.html`，自动检查真实画布清空、透明度、鼠标眼神、动画残影及 WebGL 显示密度更新。该测试页不包含在生产构建中。

弧面物理回归：`node --test tests/ellipse-ground.test.mjs`，验证真实求解器中的左右外滑、不穿地、浅坡继续运动及靠边停稳后休眠。
