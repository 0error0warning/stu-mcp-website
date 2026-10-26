# 产品能力叙事核对 · 2026-10-26

本轮把 `#lifecycle` 的六阶段流程改为三个并列的真实能力领域，并把场景 03 从另一种通知检索改为本人理论课表。页面示例仍然复制 Prompt 到接入后的 Agent，不在网站查询学校数据。

## 来源和版本

公开仓库 `0error0warning/stu-mcp` 的 main 在本轮核对时为 [`0fa321cdbe94decdf15e1918394e9f09d452cfdb`](https://github.com/0error0warning/stu-mcp/commit/0fa321cdbe94decdf15e1918394e9f09d452cfdb)，提交时间 2026-10-24T03:07:43Z。只读 sibling 的 HEAD 与该公开版本一致；使用范围仅限 README 与公开 docs。另实际打开公网的 README、课表文档和充电文档，未读取凭据、私有数据或学校账号内容，未修改 sibling。

本轮通过 shared-agent-memory skill 的客户端刷新项目记忆时返回 `transport_unavailable`，没有取得当前已发布记忆；页面事实依据当前公开项目资料和用户反馈。

## 三个并列能力领域

| 页面文案 | 公开事实依据 | 采用的范围 |
| --- | --- | --- |
| 课程与教务：本人理论课表、成绩、考试安排、MySTU 作业与资料 | [README](https://github.com/0error0warning/stu-mcp/blob/0fa321cdbe94decdf15e1918394e9f09d452cfdb/README.md)、[教务](https://github.com/0error0warning/stu-mcp/blob/0fa321cdbe94decdf15e1918394e9f09d452cfdb/docs/academic.md)、[课表](https://github.com/0error0warning/stu-mcp/blob/0fa321cdbe94decdf15e1918394e9f09d452cfdb/docs/timetable.md) | 已接入的本人理论课安排与课程信息，不声称覆盖实验课或自动生成完整学期日历。 |
| 校园生活：一卡通余额与历史流水、已接入充电设备的插座状态 | [一卡通](https://github.com/0error0warning/stu-mcp/blob/0fa321cdbe94decdf15e1918394e9f09d452cfdb/docs/smartcard.md)、[充电](https://github.com/0error0warning/stu-mcp/blob/0fa321cdbe94decdf15e1918394e9f09d452cfdb/docs/charging.md) | 只读查询；充电按已核验设备清单，不宣传全校覆盖、预约插座或控制充电。 |
| 待办与偏好：本地待办、学院和兴趣 | [README](https://github.com/0error0warning/stu-mcp/blob/0fa321cdbe94decdf15e1918394e9f09d452cfdb/README.md) | 用户自己提供的可选背景与本地待办，不暗示自动读取个人聊天记录或向学校提交任务。 |

三个 `article.capability-item` 是并列内容，没有序号、阶段、箭头或因果链。`#lifecycle` 与 `#magic-border` 保留，供既有边光及新卡片布局使用；原 `#timeline`、`.stage` DOM 已移除，`src/main.js` 的观察选择器同步移除过时的 `#timeline`。

## 场景示例

页面不再用“六种真实使用场景”定义产品能力范围，改为“比如，你可以这样问。”。现有六张展示位只是提问示例，不是全部能力清单。

场景 03 改为：

> 课表，问清下一节。
>
> 教务 · 理论课表
>
> 查我本学期的理论课表，按星期整理课程、上课周次、节次和教室。

`get_academic_timetable` 的公开说明明确返回课程、每组安排的星期/周次/节次、教师/地点，以及未排课与待核实项。示例不要求推导实际钟点，不声称全部安排完整，也不触发导出。最新有效校历、节次时刻、专项调课和实际 App 导入仍须分别核对。

`src/illustrations.js` 的 03 图由竞赛旗帜改为原创课表网格与小钟，复用网站的 Side Quest 暖色 SVG 渐变、描边和轻浮动语言，没有添加新图片资产或动画循环。

## 检查范围

本轮检查了新增叙事与公开版本文档的对应关系，以及 scenarios 图标 key、卡片 ID 和保留 DOM 钩子。最终响应式、键盘/触控、暗色边光和截图由整页验收记录维护，本文不把文案核对当作学校业务或真实客户端验收。
