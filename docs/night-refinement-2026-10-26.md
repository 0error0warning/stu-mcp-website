# 暗色首屏与产品叙事 · 2026-10-26

对应最新七条批注。保留亮色配色及页面大体结构，重做暗色首屏、修正按钮与页脚，并按公开资料替换旧叙事。没有部署，仓库保持私有。

## 逐项结果

| 批注 | 本轮处理 |
| --- | --- |
| 1 · 按钮文字未居中 | 原来居中的是文字加箭头的组合，文字相对按钮轴线左偏21.5px/14px。改为文字自身居中、箭头独立在尾侧；两按钮外尺寸、字号、亮色颜色保持。主按钮仍是真实 Chromatic Button。 |
| 2 · 暗色首屏暗黄 | 深蓝底、冷青/紫 ASCII、蓝紫弧面及同几何的冷色插画。亮色保留原配色和插画。保留圆形 View Transition，手机/受限设备/减少动态效果使用静态字符背景。 |
| 3 · 暗色页脚看不清 | 页脚采用独立的蓝紫深底及清晰浅字，修正主文案、链接、线、插画和 CTA 的配色。 |
| 4 · 六步骤与项目不符、边光定格 | 删除六阶段、序号和连线，改为课程教务、校园生活、待办偏好三个并列的真实能力领域；边光用冷青/淡紫循环，可见时运行，离屏/后台/reduced停并隐藏亮段，返回续相位。 |
| 5 · 本地/VPS双视图 | **本轮未实现**。记录在 [roadmap](roadmap.md)，`#how` 整段HTML与修改前相同；以后先核实部署、传输和认证边界，再画双视图。 |
| 6 · 用法不止六种 | 删除“六种真实使用场景”，改为提问示例叙事，不把六张展示位当成完整能力清单。 |
| 7 · 03与通知重复 | 03改为理论课表：按星期查询课程、周次、节次和教室；同时将旗帜插画改为原创课表与小钟，与01通知/附件、02作业区分。 |

产品事实固定到公开 stu-mcp 提交 `0fa321cdbe94decdf15e1918394e9f09d452cfdb`，依据及采用边界见 [产品核对](product-story-2026-10-26.md)。网站只复制提问示例，没有查询学校账号或运行这些业务。

## 背景源码与运行开销

实际打开 [React Bits Gradient ASCII](https://www.reactbits.dev/backgrounds/gradient-ascii) 的预览，并核对真实上游源码。组件固定 `e12c22192ac7b4b452c5e2feb9b586d74765d696`，源文件、SHA-256、改动范围在 `src/components/reactbits/source.json`；**MIT + Commons Clause** 全文保留在 `licenses/React-Bits-LICENSE.md`，没有将它标成纯 MIT 或作为独立组件库重发。

保留原 WebGL 字形图集、渐变场和合成技术；产品调低速度、DPR固定1、最高24绘制帧/秒、关闭halo（每帧只画场和最终合成）。组件增加暂停、绘制频率、ready与失上下文停止；指针事件在读取布局之前先检查暂停/可见性。仅桌面暗色首屏在视口内且前台时加载/运行，浅色首次打开与手机不请求该shader模块。静态字符背景也覆盖初次懒加载及WebGL不可用/丢失的情况。未添加阻塞式加载页。

当前scope不是整个页面的FPS/GPU基准。在本机Chromium对夜景canvas的实际GL调用计数：可见1秒48次draw（2pass×24帧）；离屏、模拟document.hidden、亮色、reduced的稳定取样均0。返回后重新出现draw。修复早期的指针性能尾巴后，离屏鼠标移动对该背景的`getBoundingClientRect`读取为0。

色彩切换实测：点击后100ms，主题已经更换且View Transition标记为active；完成后标记清除。图片保持同一几何，暗色使用`hero-collector-night.svg`，另一张用display隐藏。首屏还把`overflow:hidden`改成`clip`：旧容器在`.hero-stage.scrollIntoView()`后内部scrollTop曾变成187，导致返回页顶仍截标题；现在只裁切，不成为可内部滚动的容器。此修改不改变亮色配色。

## 验证和保留证据

Windows Chromium，通过独立Playwright CLI浏览器；生产预览为最终`npm run build`输出。390px上下文启用DPR2、mobile和touch。没有真实iOS/Safari/Android硬件或公网部署验收。

- **按钮：** 1440/821/390 × 浅/暗六组，文字自身水平中心偏差均0px；Canvas字形墨迹纵向偏差最大约0.006px。按钮仍为桌面178×58 / 160×56，手机145×52 / 132×52。最小文字到SVG盒间隔4px，无裁切。实际Tab、focus和手机tap导航通过。[详细记录](hero-footer-qa.md)。
- **亮色：** 禁用新按钮/页脚CSS后的所选颜色、背景、边框、字号与宽高一致。暗色专用规则不覆盖亮色配色；按钮只修正内容位置。
- **页脚：** 正文/小字对比度13.38:1 / 9.12:1；考虑纹理和光晕的保守复合底色，仍为7.81:1 / 5.33:1。未把这些选点测量当成全站无障碍认证。
- **边光：** 实际观察15秒超过两个6秒循环，offsetDistance继续变化；离屏、模拟后台、runtime reduced时相位稳定且亮段隐藏，返回续动。[详细记录](border-story-2026-10-26.md)。
- **布局/资源：** 最终生产1440×1000、821×719、390×844宽度均等于视口，无漏图；3个并列能力、旧stage为0、90日期、物理canvas0。浅色首次夜景canvas0、shader请求0；手机静态夜景也为0请求。reduced手机canvas0，无横向溢出。
- **03复制：** 实际剪贴板为“查我本学期的理论课表，按星期整理课程、上课周次、节次和教室。”，没有旧竞赛通知内容。
- **字体：** 双子集更新至481字，cmap缺字0；新标题、03问句与能力说明共12项CDP抽查均为custom字体。Sans134,908字节、Serif172,172字节，字体URL增加内容哈希，避免旧页面缓存上一版子集。[字体记录](font-audit-2026-10-26.md)。
- **错误/构建：** 最终生产页面异常、console error、非导航中止的失败请求均0；`npm run build`与既有9项数据/物理检查通过。本轮未改底层物理渲染器，未宣称历史像素回归是新测。

原始过程：`output/playwright/night-background-qa-final.txt`、`night-production-final.txt`、`hero-footer-final-metrics.json`、`hero-footer-final-interactions.json`、`border-story-*`。外部参考页的网络错误不计作产品错误。

## 当前阶段截图

主验收为821×719及390×844。为了完整展示较高的卡片，页脚821截图使用900px高，手机能力卡/页脚阶段使用1100px高；未临时隐藏固定头部或修改产品CSS。

- [亮色按钮](qa/night-light-821.jpg) · [暗色821首屏](qa/night-hero-821.jpg) · [暗色1440首屏](qa/night-hero-1440.jpg) · [手机静态夜景](qa/night-hero-390.jpg)
- [蓝紫弧面](qa/night-arc-821.jpg) · [暗色页脚](qa/night-footer-821.jpg) · [手机页脚](qa/night-footer-390.jpg)
- [三个真实能力领域](qa/night-story-821.jpg) · [手机能力说明](qa/night-story-390.jpg) · [新03课表示例](qa/night-scenario03-821.jpg)
