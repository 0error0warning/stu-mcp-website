# 自动产品资料同步

产品仓库：公开的 `0error0warning/stu-mcp`。发布事实以已发布 Release 为准，包含 prerelease，不用遗漏预览版的 releases/latest 接口，不使用不断变化的 main 工作树。

`scripts/sync-product.py` 从公开发行列表选最高三段版本号，解析 tag 对应 commit，再在同一 commit 读取 pyproject.toml、server.py 和版本文档。以 AST 统计 build_server 下 @tool 注册函数，验证注册包装器与文档提供的数量。不执行远端 Python，不导入 MCP，不读取认证信息。现有适配器遇到目录或注册方式变化应失败并人工更新，不能猜数量。

数据统一保存到 public/data/product.json，含版本、工具数量/名称、版本类型、标题、原始链接、发布提交、发布时间与检查时间。Vite 构建时填充所有 data-product 标记；浏览器用同源 /data/product.json 重新校验并整体更新，失败保留首屏内容。上游文本通过 textContent/HTML 转义写入，链接限制到固定仓库和提交。

服务器 stu-site-product.timer 每小时调用同步（最多额外随机延迟两分钟），同时原子替换 JSON 和带标记的首页 HTML，因此无 JS / 搜索引擎首屏也会刷新，不用重新打包前端。单个文件原子替换；两个文件间极短的发布时间差由浏览器整份 JSON 更新收敛。异常不覆盖有效 JSON；HTML 更新失败会导致任务失败，需查看日志，JSON 仍可能已成功更新。

手动同步：`python scripts/sync-product.py`（Python 3 标准库）；服务端立即同步：`sudo systemctl start stu-site-product.service`。状态：`systemctl status stu-site-product.timer`；失败原因：`journalctl -u stu-site-product.service`。停用：`sudo systemctl disable --now stu-site-product.timer`。没有 webhook 密钥、令牌或额外进程常驻。每次五个公开请求；匿名 GitHub 配额不足时留旧、下次重试。

本地匿名请求曾返回 403 限流，未写入损坏文件；服务器实际成功同步 v0.7.3、51 项，commit 31fd2863a41e5e6f2ad13341b85b04e3f4eb2642。主项目发布流程无需改动。若未来使用四段版本或 rc 标签，需显式扩展选择策略。API 第一页最多100条发行，仅支持当前仓库的三段版本发布约定。

自动范围：版本号、工具数、预览/正式标签、发行标题、发行链接。场景文案、产品定位、认证/写入权限、安全限制不自动生成，新增能力仍需人工审核。以后部署仍要保留 timer 和同步脚本，部署后主动启动一次以避免构建快照短暂回退。开发仓库里的快照可手动同步后提交；服务器同步不会反向修改 Git 仓库。
