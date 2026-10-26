# Agent 品牌与模型目录核对

核对日期：2026-10-26。目录在 `src/agent-catalog.js`；每个本地 SVG 的上游直链、SHA-256、字节数和许可证在 `public/brands/source.json`。本次没有查询用户账户、调用模型、验证某个客户端的 STU-MCP 安装，也没有新增图标包依赖。

## 图标

实际打开并检查了 [LobeHub Icons](https://icons.lobehub.com/) 的公开图标目录。仅下载 LobeHub 官方仓库的 16 个原始 SVG，共 27,272 字节；没有重画品牌图标或修改 SVG。固定版本为 `8b7bbc433d38437fa2b0cca58ae896917162b812`，源目录为 `packages/static-svg/icons/`。

- 10 个明确品牌：Codex、Claude Code、Cursor、WorkBuddy、Antigravity、Cline、OpenCode、TRAE、Grok、豆包。
- 前 8 个 `promptTarget: true`，供复制安装 Prompt 时选择本地 Agent/开发环境；这只代表公开产品的一般能力，不代表已测试 STU-MCP 兼容性。Grok 和豆包用于品牌轮换，`promptTarget: false`。
- dsh、Muse、Hark 含义不明，未猜测、未套用别的商标。官方确有独立的 [Grok Bot 产品文档](https://docs.x.ai/grok-bot/overview)，但本次没有把通用 Grok 标识擅自改名为 Grok Bot。
- `monochrome: true` 标注外部 SVG 中的单色图标，供深色主题选择适当的 CSS 显示方式；原 SVG 保持原样。
- [Lobe Icons MIT 原文](../licenses/Lobe-Icons-MIT.txt) 保留于仓库，并随静态站点输出为 `/brands/LICENSE-Lobe-Icons.txt`。品牌及商标归相应权利人，MIT 不代表商标授权或产品背书。

## 模型

每家选一个官方当前目录中明确的高能力通用模型，优先旗舰/最强推理档。以下名称和 API ID 来自实际公开页面，不依据日期推演型号，也不按模型数字大小猜测能力。不表示所选 Agent 必然提供这些模型；页面选择不发送 API 请求。

| 提供商 | 显示名称 | API ID | 官方依据 |
| --- | --- | --- | --- |
| OpenAI | GPT-6 Astra | `gpt-6-astra` | [模型目录](https://developers.openai.com/api/docs/models)：旗舰、复杂推理与编程档。 |
| Anthropic | Claude Fable 5.1 | `claude-fable-5-1` | [模型比较](https://platform.claude.com/docs/en/models/overview)：更高要求的推理和长程 Agent 工作；常规推荐的 Opus 5.5 属另一取舍。 |
| Google | Gemini 4 Argon | `gemini-4-argon` | [Gemini API 模型目录](https://ai.google.dev/gemini-api/docs/models)：Stable 旗舰推理模型。 |
| xAI | Grok 4.7 | `grok-4.7` | [官方模型目录](https://docs.x.ai/developers/models)：旗舰通用/编程模型。 |
| DeepSeek | DeepSeek V4.1 Flash | `deepseek-flash` | [当前型号与计费表](https://api-docs.deepseek.com/quick_start/pricing/)：实际版本为 `DeepSeek-V4.1-Flash-1017`；[发布说明](https://api-docs.deepseek.com/news/news260910/)描述其相较 V4-Pro 的能力提升。 |
| 阿里云 | Qwen3.8-Max | `qwen3.8-max` | [官方文本模型选型](https://help.aliyun.com/zh/model-studio/text-generation-model)：需要最强推理时的选择，另列 `qwen3.8-max-0902` 快照。 |
| Moonshot AI | Kimi K3.1 Pro | `kimi-k3.1-pro` | [官方型号说明及调用示例](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart)与[快速开始](https://platform.kimi.ai/docs/get-your-api-key)：当前高能力旗舰。 |
| 字节跳动 | Doubao Seed 2.1 Pro | `doubao-seed-2-1-pro-260915` | [ByteDance Seed2.1 官方页](https://seed.bytedance.com/en/seed2_1)确认 Pro/Turbo 系列；[方舟快速开始](https://docs.volcengine.com/docs/ark/quick-start?lang=en)的实际渲染页给出 `260915` Pro ID。 |

DeepSeek 的旧发布说明和当前计费表在 V4-Pro 的后续保留情况上有差异，目录依据当前计费表记录实际别名，不把旧说明中的迁移计划当成已完成事实。Kimi 型号页含占位评测文字，本次只采用明确产品名称、旗舰定位与 API ID，不引用其中的评测数字。

模型页面会变；本次保存的是上述核对日的目录，`verifiedAt` 不表示自动更新。更改型号时应重新打开对应提供商的官方目录和型号页，并同步这份记录与 `public/brands/source.json`。

## 验证范围

已检查 10 个 Agent、8 个模型条目的 ID 唯一性、本地文件存在、16 个 SVG 的根元素与内容安全性，以及来源/许可证记录。参考图标站与方舟快速开始用独立浏览器实际打开；本轮 UI 的组合、键盘、触控及响应式验收由主任务另行记录。
