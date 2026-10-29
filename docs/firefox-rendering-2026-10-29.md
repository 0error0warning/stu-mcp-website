# Firefox 渲染异常保护

用户截图中首页背景发灰、主按钮变黑；文字和布局仍正常。独立干净配置 Firefox 156 未复现，本机 Firefox 158.0.1 的实际触发原因仍未确认，不能归因于整个 Firefox 浏览器。操作当前本机 Firefox 时，工具因不支持该浏览器的 URL 安全校验而停止，未继续访问该窗口。

## 修改

- 首页静止的等高线背景改为已有 SVG，不再创建背景 WebGL Canvas。
- ChromaticSurface 捕获上下文创建、初始化和绘制异常；针对有亮度下限的产品按钮，在显示前读取本组件的三个内部像素，检查透明/黑色输出。动画时最多每秒复核一次，尺寸变化时复核；失败隐藏 Canvas，停动画并使用已有 CSS 渐变按钮。像素读取被禁止时不反复尝试。上下文恢复时重新初始化和检查。
- `?effects=static` 在当前导航禁用 ReactDrops 与夜间 ASCII 的 Canvas 效果，使用现有静态样式；不保存偏好、不改浏览器设置。正常入口保留能够正常运行的动画。
- 保留组件许可证及第三方声明。没有改动相邻 stu-mcp 仓库。

## 实际验证范围

生产构建通过，现有 13 项 Node 测试通过。独立 Firefox 156 中模拟：WebGL 绘制后输出纯黑、像素读取抛 SecurityError、WebGL 不可用，均显示渐变按钮，键盘 Enter 仍能跳到安装区，无 pageerror；正常状态显示 WebGL。上述故障为注入测试，并非在用户的 Firefox 中复现原始故障。

独立 Chrome 检查 1440×1000 桌面、390×844 触摸手机、减少动态、兼容模式；深浅主题均无横向溢出，console error/pageerror 均 0，主按钮通过键盘或模拟触摸跳转。手机、减少动态、兼容模式深浅主题 Canvas 数量均为 0；正常桌面按钮 renderer=webgl。截图视觉复核通过。

截图保存于 `docs/qa/firefox-rendering/`：none-after / black-after / static-dark 来自 Firefox；chrome-* 来自 Chrome。兼容模式规避 Canvas 渲染，但不证明用户浏览器扩展、显卡或强制配色的根因已经查明。
