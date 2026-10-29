# 正常网址的 Firefox 自动材质兼容

用户在上一发行后继续提供两张截图：首页胶囊按钮发黑，安装区发送形复制按钮出现黑色方块。上一轮只检查 WebGL 内部像素，没有验证浏览器的最终合成；安装区也未接入 `effects=static`。因此不能声称第一次处理已经解决用户环境的问题。

## 本次处理与设计来源

正常首页自动识别 Gecko（`-moz-appearance` 特性及 Firefox UA）；两种产品按钮使用由原 ChromaticSurface 着色器生成的 WebP 材质帧，不创建按钮 Canvas。无需参数、另一个网址或更改浏览器设置。其他浏览器保留实时 WebGL；WebGL 失败时也回退到这些材质帧。

这不是恢复原来黑色组件默认样式，也不是把全站改成静态版本。沿用本项目的 `#c5b8f0 / #a9cfea / #ead9f1`、brightnessFloor=.76、intensity=1.08、grain=.018、seed=7。胶囊和圆形分别用原组件渲染为 178×58 / 44×44 的二倍像素帧，每种64帧。CSS播放该场的前进/返回序列，悬停与键盘焦点时播放、提亮，离开或不可见时暂停；减少动态与手机沿用既有静态分支。兼容分支使用有限帧循环，不能描述成与实时着色器无限时间演化完全相同。

材质来自仓库内带完整许可证的 `chromatic-surface.tsx`、`chromatic-shaders.ts`、`chromatic-field.ts`，上游 ReactDrops 源版本 b3924b92ebfce15152cf6f04ad85301c9f343672。保留 `licenses/ReactDrops-LICENSE.txt` 与 THIRD_PARTY_NOTICES.md。两个 WebP 共153,758字节，只作为本网站产品美术使用。

背景从上一轮手写简化波浪线恢复为原 Topographic Flow 的地形等高线：seed=42、scale=560、density=4、distortion=.9、lineWidth=.8、opacity=.25。以原始 elevation/trace/round/spline 函数离线生成 SVG。原背景本来 speed=0、paused=true，所以不需要页面内 GPU 动画。SVG 使用原始等高线场与平滑算法；光栅化与GPU版抗锯齿可能有细微差异。

## 可重现生成

以 Vite 本地开发服务器打开 `scripts/material-capture.html`，它隐藏文案并只捕获原按钮材质，背景透明；将 `scripts/capture-compatible-material.pw.js` 内容传给 playwright-cli run-code（其中地址是127.0.0.1:5174），生成 output/playwright/material-frames。然后运行 `python scripts/pack-compatible-material.py`（Pillow）打包WebP和CSS关键帧。等高线执行 `node --experimental-strip-types scripts/generate-hero-contours.mjs`。生成器不读取用户图片、账号或浏览器配置。

## 已验证范围

- 构建成功，13项既有Node测试通过。
- 独立 Firefox 156：普通入口自动选择 image；按钮 getContext 调用0。即使注入按钮 Canvas 创建抛异常，也不触发该接口。首页及安装区按钮形状分别999px/50%，两个材质均可见。
- Chrome 156.0.8078.48：正常时保留两处WebGL；注入纯黑输出或readPixels拒绝时，两处均回退到原材质图片。
- 两浏览器的1440×1000桌面、390×844手机/触摸模拟、减少动态、深浅主题检查，无横向溢出，console error/pageerror 均0。Firefox另检查旧static参数下安装区也无按钮Canvas。
- 键盘Enter/模拟触摸到安装区并触发复制，收到完整的Agent偏好和输入Prompt，显示“Prompt已复制”。剪贴板写入在独立测试页替换为内存捕获；没有读写用户系统剪贴板，也没有查询学校或发送消息。
- Firefox悬停时材质关键帧在运行、背景位置改变；空闲/离开视口时暂停。桌面、手机及深浅主题截图视觉复核。

截图及测试脚本保存在 `docs/qa/automatic-materials/`，user-before-* 为用户本次原始截图，auto-* 为独立测试浏览器结果。尚未在用户当前 Firefox 158.0.1 配置下现场验收，不把推测的显卡、隐私扩展或合成器原因写成已确认根因。

技术边界参考：[WebGL Drawing Buffer规范](https://registry.khronos.org/webgl/specs/1.0.3/#5.2)：WebGL绘制缓冲与呈现给页面合成器是不同阶段，成功读回像素不等于最终画面已验证。这是本次兼容路径选择的理由，不是对用户环境根因的证明。

## 正式站复核

已发布3f76032，current=/opt/stu-mcp-site/releases/3f76032；旧6421cde保留。归档SHA-256：8ec1a151b7b50f9f31fcaed2056451895097879b8789696583d98bc79533b1a9。Caddy配置哈希与API server/src未变，caddy/activity/guard/product timer均active；即时产品同步Result=success / ExecMainStatus=0。

独立Firefox从 https://stu-mcp.com/ 普通入口加载新index-rYpYAPQT.js；首页胶囊和安装区圆形按钮renderer=image、Canvas各0，材质可见；背景SVG已加载。两WebP和SVG均HTTP200，深浅主题无横向溢出，console error/pageerror均0。正式站三张live-auto-*截图已保存，安装区截图视觉复核通过。源材质首帧与压缩WebP在不透明区域的RGB平均绝对误差分别0.745/0.849（0–255范围）。未改变用户浏览器配置。
