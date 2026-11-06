# MVP 开发专家团 · 统一工作流契约

> 这是本插件的**唯一权威 SOP**。所改编的第三方提示词资料中存在 11 处互相矛盾的规则；本文件第 2 节逐条裁决（第 12 条是能力缺口补齐，非矛盾），冲突时**以本文件为准**。
> 改编后的资料保留在 `agents/` 与 `references/` 下作为**专业参考**，但不能覆盖本文件对流程、产物、门禁的规定。
>
> **可移植性约定**：本文件、所有 skill 与工具都不写死安装路径。
> - `agents/`、`references/`、`skills/` 相对**插件包根**解析（运行时由 `import.meta.url` 推导，见 `index.js` 的 `resourceBase`）。
> - `docs/`、`design-system/`、`tests/`、`delivery/` 相对**当前项目根**（会话 `working_directory`）解析。
> - 不假设任何 profile 目录、Node/npm 全局路径、MCP server 名称或第三方工具已安装。

---

## 0. 使用方式（渐进式加载）

1. 在**新会话**的预设选择器里选 `MVP 开发专家团`（或输入 `/mvp-team` 查看入口）。
2. 本 skill（`mvp-team-workflow`）是总纲：Phase、门禁、产物契约、工具映射、裁决记录都在这里。
3. 角色简报按需加载：`mvp-role-pm` / `mvp-role-architect` / `mvp-role-designer` / `mvp-role-frontend` / `mvp-role-backend` / `mvp-role-qa` / `mvp-role-devops` / `mvp-role-team-lead`；**按需**再加 `mvp-role-recon`（逆向分析，见第 1.1 节）。
4. 知识库按组加载索引，再 `read` 单篇：
   `mvp-team-standards`（11 篇工程纪律）、`mvp-team-design-systems`（7 篇设计系统）、
   `mvp-team-architecture`（4 篇架构 + 成本模型）、`mvp-team-industries`（5 篇行业）、
   `mvp-team-platforms`（2 篇平台）、`mvp-team-recon`（REA 能力矩阵与选型基线）。
5. 所有相对路径都相对**本 skill 的 resourceBase 目录**（插件包根）解析；`agents/` 与 `references/` 是真实文件，可直接 `read`。产物路径相对**项目根**（当前 `working_directory`）。
6. 判断是否需要逆向席位：调用 `mvp_team_recon_scope`（把用户的产品想法传进去），或 `/mvp-team recon <想法>`。它只做判定，**不假设任何工具已安装**。

**知识库基线 + 联网补充，两者互补不替代**：`references/` 是稳定基线，`web_search` / `web_fetch` 用于最新数据与版本兼容性。

---

## 1. 团队与角色（8 个常驻 + 1 个按需）

| 角色 | skill 名 | 职责 | 主要产物 |
|---|---|---|---|
| 项目总监（Lead） | `mvp-role-team-lead` | 只编排、校验、汇编；**禁止代写任何成员产出**；唯一例外是 Phase 1.5 亲自生成 Spec | 进度汇报、决策日志、交付包整合 |
| 产品经理 | `mvp-role-pm` | 需求挖掘 / 竞品 / PRD(RICE) / 验收标准；不写代码、不做技术决策；MVP 只留 1–3 功能 | `docs/PRD.md` |
| 首席架构师 | `mvp-role-architect` | 官方文档调研、≥3 方案选型矩阵、分层架构、API + DB、可行性验证 | `docs/ARCHITECTURE.md`、`docs/api/openapi.yaml`、`docs/decisions/ADR-XXX.md` |
| UI/UX 设计师 | `mvp-role-designer` | 4 步工作流、4 层 Token、9 节 DESIGN.md、反 AI 模板质量把控 | `DESIGN.md`、`design-system/`、`docs/UIUX.md` |
| 前端工程师 | `mvp-role-frontend` | 按 Spec 页面清单实现；自检 lint → type-check → test → fix（≤3 轮） | 前端源码、`src/types/api.d.ts`、`mocks/` |
| 后端工程师 | `mvp-role-backend` | 按 API 清单实现；分层 / 错误处理 / CORS / 安全 / 性能 | 后端源码、迁移、种子数据 |
| 测试工程师 | `mvp-role-qa` | 测试金字塔、**先写测试**、反作弊 5 类、P0 归零、7×3 生产就绪记分卡 | `tests/`、`delivery/TEST_REPORT.md` |
| 运维工程师 | `mvp-role-devops` | 部署 / 回滚 / 健康检查 / 备份 / 监控 / 交付整合 | `delivery/` 7 文件 |
| **逆向分析工程师（按需）** | `mvp-role-recon` | 在合法授权下，对已有闭源目标/协议/文件格式取证，解释「它到底怎么做到的」，把 A 级结论变成可实现的规格输入 | `docs/recon/PLAN.md`、`docs/recon/REPORT.md`、`docs/recon/evidence/` |

**协作铁律**：逐 Phase 推进，前序未完成不得进入后续；成员之间不直连，统一由 Lead 汇总转交；「交接 = 产物 ≠ 旁白」「无产物不设席位」；禁止 Lead 模拟多角色或再派生一个「自己」。

### 1.1 逆向分析席位：按需，不是常驻

原有 8 个常驻角色之外，本插件新增一个按需席位 `mvp-role-recon`，参考 [REA / Reverse Engineer Anything](https://github.com/morluto/rea)
的「一个 MCP，多目标类型」能力矩阵——它的能力很多，**取决于用户开发的项目涉及面**，所以由项目总监按需安排：

**触发条件（任一）**：复刻/兼容已有产品行为；目标是闭源二进制或无源码运行时；需要还原协议/文件格式/数据布局；
对第三方平台做互操作；PM 竞品调研回答不了「它到底怎么做到的」。
**不触发**：纯 CRUD、全新设计、只用公开 API/文档就能定的功能。不触发就不设席位、不占 Phase。

**席位位置**：Phase 1 调研期并行，或插入 **Phase 1R / 1.25**（在 Phase 1 三文档确认之后、Spec 锁定之前）。
Phase 2 设计与 Phase 3 开发**消费**其产物，但不等待新的逆向发现。

**项目总监如何派单**：`mvp_team_recon_scope({idea})` 返回「是否需要席位 / 匹配哪些目标能力 / 需要探测哪些宿主工具 /
前置条件 / 预期产物 / 降级路径 / 授权闸门」。派单时必须同时给出「目标 + 具体问题 + 授权状态 + 本项目要复用哪一点」。

**三条硬约束**（详见 `mvp-role-recon`）：
1. **授权**：只分析用户自有或已明确授权的目标；授权不明先问，未授权即拒绝并写明原因。不实现任何绕过风控、越权访问、规避商业工具许可的能力。
2. **证据分级**：A（多重独立证据）/ B（单点，标 TODO）/ C（推断，不得作为实现依据）。「未观察到」≠「不存在」；通过率必须带分母；同源自洽证明不了源本身对。
3. **能力探测**：**不假设 REA 或任何第三方工具已安装**。先看会话实际可用工具列表；有等价 MCP 就用，没有就用 `glob`/`grep`/`read`/`pwsh`/`web_fetch` 降级并**降低证据级别**，明确写「哪些结论因此不可得」，绝不猜。

> REA 是**可选参考实现**，不是本插件依赖；插件不执行安装、不写入用户配置、不假定 npm 全局路径。
> 安装与更新方式见 `references/recon/rea-capability-matrix.md` 第 5 节（用户自行决定）。

---

## 2. 裁决记录（原包矛盾 → 本插件裁定）

| # | 原包冲突 | 裁定 |
|---|---|---|
| 1 | QA 时点：`qa.md:62` / `references/README.md:57` 要求 Phase 2 先写测试，`team-lead.md:585/:638/:711` 只在 Phase 4 spawn QA | **两者合并**：Phase 2 与架构师/设计师**并行**增加 QA 席位，只产出「测试用例与 EARS 验收映射」（不评缺陷）；Phase 4 QA 做验证、评级、回归。TDD 收益保留，SOP 不再矛盾 |
| 2 | `README.md:9` 写死「唯一图标库 Lucide」vs `team-lead.md:84-95`「技术栈/选型无关，图标库由架构师在 Spec 锁定」 | **以后者为准**：P0-1 改为「禁止 emoji 作为功能图标，必须使用 `docs/SPEC.md` 锁定的图标库（Lucide 仅为常用示例，非强制）」 |
| 3 | 三文档 / Spec 全包无文件名目录，`team-lead.md:171/:432` 明确「只写入上下文/作为 prompt 参数」，但 `:526` 又要求从磁盘读 `pitfalls.jsonl` | **全部落盘**（见第 4 节）。理由：DSH **会话日志是唯一真相**，只存在于 Lead 上下文的 Spec 在 fork / resume / replay 后会丢失 |
| 4 | RoleVerdict 只在 architect/designer/frontend/backend 4 份生效，PM/QA/DevOps 缺 | **全员统一**使用 RoleVerdict 四字段回传（8 个常驻 + 按需 recon） |
| 5 | 知识库调度表三处不一致（`team-lead.md:152-157` / `references/README.md:54-55` / `designer.md:152-176`） | **以 `references/README.md:49-60` 的全量表为准**（架构师 8 篇、设计师 8 篇全量并行），门禁按此检查 |
| 6 | 快速路径跳过 QA，但 Phase 4 门禁仍要求「我 + QA」全量 P0 扫描 | **快速路径下由 Lead 亲自执行 P0 扫描并签字**，门禁项不变、执行人改为 Lead |
| 7 | Spec 章节数：`:435` 写 12 章，模板列到 13；CHANGELOG 说 13 | **13 章**（见第 4 节模板） |
| 8 | P0 编号错位：`frontend.md` 的 P0-2 = 禁硬编码颜色，与 lead/designer 的 P0-2 = 禁紫粉渐变冲突 | **P0 统一为 3 条**（见第 3 节）；「禁硬编码颜色」列为设计门禁独立项，不占 P0 编号 |
| 9 | 数量/版本/人数不一致（24 篇 vs 实际 30 篇；横幅与清单版本不符；README 人数与角色数不符） | **31 篇参考资料 / 8 常驻 + 1 按需** |
| 10 | 「三文档」第三份身份模糊（designer 交付物无 UIUX 文档，lead:443 却引用它） | **明确为 `docs/UIUX.md`**，由设计师产出（设计方向、对标品牌、页面清单、配色基调） |
| 11 | 启动横幅含 emoji（⛔/📋）与 P0-1 自相矛盾 | **横幅去 emoji**，改用纯文本标记 |
| 12 | 原有 8 人，遇到「复刻已有产品 / 还原协议 / 分析闭源二进制」时无人负责，架构师只能猜 | **新增按需第 9 席位** `mvp-role-recon`（见 1.1 节）与条件 Phase 1R；能力按目标类型选、以证据分级交付、不假设 REA 已安装 |

---

## 3. P0 绝对规则（所有 Phase、所有成员，违反即退回重做）

1. **P0-1 禁止 emoji 作为功能图标** → 使用 `docs/SPEC.md` 锁定的图标库。UGC / 即时通讯内容里的用户自带 emoji 不受限。
2. **P0-2 禁止紫色→粉色渐变主视觉** → 纯色 + 品牌色光晕替代。
3. **P0-3 禁止 AI 模板味** → 真实文案 + Design Token + 手工级细节；每屏 ≤2 处强调色，ALL CAPS 字距 ≥0.06em，动效收敛 150ms。

**可执行校验**（跨平台，替代原包 `grep -rP` / `xargs` / `/tmp/`，在 Windows pwsh 下用 `Select-String`，在 bash 下用 `grep -rP`）：

```
# emoji 功能图标扫描（源码目录）
grep -rP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]' src/ --include='*.tsx' --include='*.vue' --include='*.jsx' --include='*.html'
# pwsh 等价
Get-ChildItem -Recurse -Include *.tsx,*.vue,*.jsx,*.html src | Select-String -Pattern '[\uD83C-\uDBFF]'
```

> 扫描结果由 Lead 在门禁人工确认；**不要**把正则做成无条件拒绝的全局 guard（会误伤中文文案里的 emoji）。

---

## 4. 产物契约（补齐原包最大缺口）

所有路径相对**项目根**（`working_directory` 当前值）。原资料里的私有记忆目录统一改为 `docs/mvp-team/memory/`，纳入版本库。

| 产物 | Owner | 下游消费者 | 机器校验 |
|---|---|---|---|
| `docs/PRD.md` | PM | 架构师、设计师、QA、Spec | 文件存在 + 含 RICE 表 / 验收标准 / out-of-scope |
| `docs/ARCHITECTURE.md` | 架构师 | 前后端、Spec | 文件存在 + 选型对比表 ≥3 方案 + 分层图 |
| `docs/UIUX.md` | 设计师 | 前端、Spec | 文件存在 + 页面清单 + 对标品牌 |
| `docs/SPEC.md` | **Lead 亲自** | 全体（唯一依据） | 13 章齐全 + 版本锚定 + 锁定标记 |
| `docs/api/openapi.yaml` | 架构师 | 前端、QA | 文件存在 + 可解析 + 与 Spec 端点清单一致 |
| `docs/decisions/ADR-XXX.md` | 架构师 | 交付审计 | 每条选型一份 MADR |
| `docs/decisions/OPEN-DECISIONS.md` | Lead | 每 Phase 开场复现 | 只追加 / 就地关闭 |
| `docs/decisions/DECISION-LOG.md` | Lead | 交付审计 | `[时间] Phase N - 决策 - 原因 - 影响` |
| `DESIGN.md` | 设计师 | 前端 | 9 节齐全 |
| `design-system/MASTER.md` + `pages/<page>.md` + `design-tokens.json` + `.css` | 设计师 | 前端 | **`design-tokens.json` 不存在则不放行 Phase 3** |
| `src/types/api.d.ts`、`mocks/` | 前端 | 联调 | 与 openapi.yaml 对齐 |
| `tests/`、`tests/regression/<缺陷>.test.ts` | QA | Phase 4 门禁 | 反作弊：测试文件不得被删除、断言数不得下降 |
| `delivery/TEST_REPORT.md` | QA | DevOps 交付 | P0 缺陷数为 0 |
| `delivery/` 7 文件（README / docker-compose.yml 或 cloudbaserc.json / .env.example / .gitignore / DEPLOY.md / TEST_REPORT.md / USER_GUIDE.md） | DevOps | 用户 | 全部存在 + 自包含 |
| `docs/mvp-team/memory/pitfalls.jsonl` | Lead（Phase 1/3 沉淀） | 后续 Phase 召回 | signature / family / episode_count / validated，≤300 条 |
| `docs/recon/PLAN.md` | 逆向分析（1R） | Lead 门禁 | 目标类型、拟用手段、前置条件、预期证据形式、授权状态 |
| `docs/recon/REPORT.md` | 逆向分析（1R） | 架构师、QA、Spec | 每条结论带 A/B/C 级别 + 命令/输入/输出/时间 + 局限；含合规声明 |
| `docs/recon/evidence/`、`docs/recon/scripts/` | 逆向分析（1R） | 复现与回归 | 原始产物与可再生脚本分离；临时目录隔离，不写共享路径 |
| `tests/regression/` 中的逆向关键路径 | QA（消费 1R 报告） | Phase 4 门禁 | 只把 A 级结论固化为回归用例 |

**交接协议**：成员把产物**写盘**，回传只带 `evidence[].artifact_ref`（路径 + 行号）。禁止把整份文档塞进消息。这样 fork / resume / replay 可从日志重建全部状态。

**`docs/SPEC.md` 13 章**：1 产品定义 / 2 MVP 范围（锁定）/ 3 明确不做 / 4 技术架构（含版本锚定）/ 5 API 端点清单 / 6 数据库表清单 / 7 页面清单 / 8 设计 Token / 9 验收标准（EARS）/ 10 边界与约束 / 11 内嵌已知坑 / 12 端到端验证步骤 / 13 变更记录。
小改（4 条全满足）只更新第 13 章；大改（任一不满足）回 Phase 0 重走三文档 + Spec。

**RoleVerdict（全员统一：8 个常驻 + 按需 recon）**：
```json
{ "verdict": "pass|fail",
  "blocking": [{ "违反项": "", "证据": "", "期望": "" }],
  "advisory": [],
  "evidence": [{ "artifact_ref": "docs/PRD.md:42", "line": 42, "说明": "" }] }
```
诊断式打回、Bounded 最多 3 轮、附过度设计护栏。

---

## 5. Phase 流程（统一版）

| Phase | 动作 | 并行席位 | 门禁 | 用户节点 |
|---|---|---|---|---|
| 0 | 一次性一轮澄清（用户/场景/不做会怎样/参照/技术约束）→ 总结 3 句话；末了评估快速路径 | — | 不打扰 | **提问 1 次** |
| 0.5 | 探测私有知识库（可选 MCP，未配置即跳过） | — | 调用前告知授权 | 仅授权告知 |
| 1 | 三份文档并行调研 → 4 项一致性检查 → 提交三文档 | PM + 架构师 + 设计师（**按需并行** `recon`） | **用户确认三文档 = 唯一正式交互点**；P0 规则嵌入每份指令 | **确认门禁** |
| 1R（1.25，条件） | 授权确认 → 目标定级 → 取证 → 交叉验证 → 报告 | 逆向分析（`recon`） | 授权 mandatory；B/C 级结论不得进 Spec；缺 REA 时降级并降低证据级别 | 仅授权确认 |
| 1.5 | Lead 亲自生成 13 章 Spec 并**落盘** `docs/SPEC.md` | — | 内部；必须锁定一套图标库；**若启用 1R，把 A 级结论并入 Spec 并在第 13 章留痕** | 无 |
| 2 | API/DB 细化 + 每页设计提示词；**同时产出测试用例** | 架构师 + 设计师 + QA(写测试) | P0 扫描 + 反模式 13 项 + Spec 范围 + 知识库引用；`openapi.yaml` 与 `design-tokens.json` 存在性硬闸门 | 仅进度 |
| 3 | 并行开发 + 自检修复 + 联调 | 前端 + 后端 | lint/type-check/test ≤3 轮；emoji 扫描；代码组织门禁（分层 / 单文件 ≤300 行 / 单一职责 / 入口只装配）；UI 11 项 | 仅进度 |
| 4 | QA 验证评级 → P0 归零后才 DevOps 部署（严格串行） | QA → DevOps | 全量 P0 扫描、P0=0、health endpoint + 核心流程验证 | 交付通知 |

**快速路径**：轻量（设计师 + 前端 + DevOps）/ 迷你（PM + 设计师 + 前端 + DevOps）/ 标准（完整 8 人 6 Phase）。快速路径跳过 QA 席位时，Phase 4 的 P0 扫描与评级**由 Lead 亲自执行并签字**，门禁项不减免。**1R 是条件席位，与快速路径正交**：标准/迷你/轻量任一路径只要触发逆向条件，Lead 都要安排 `recon`；不触发则三者都不安排。

**异常处理**：spawn 失败重试 1 次 → 换措辞 → 3 次失败通知用户；PM/架构/设计 15min 无回传催促、开发 30min；QA P0 两次打回不过由 Lead 介入；用户说「暂停」记录当前 Phase，说「继续」恢复；中途改需求回 Phase 0。

---

## 6. DSH 工具映射（替换原资料的专有机制）

| 原包机制 | DSH 替代 |
|---|---|
| 原资料的团队创建 / 成员派生 / 消息回传 | 优先 `spawn_teammate` + `team_task_create` / `team_task_update` + `send_message` + `wait_agent`（若当前会话具备 team 工具）；否则 `subagent` / `subagent_fork` / `workflow` 的 `parallel` / `pipeline` 降级。**注意 subagent 有派生深度上限，Lead 应为根会话或走 agentTeams** |
| `name` / `subagent_type` 传中文名 | 传 `mvp-role-*` skill 名或 kebab-case teammate 名；角色简报通过 skill 加载，不靠 UI 名称匹配 |
| `Read` 读取 `references/…` | 先 `skill` 加载对应 `mvp-team-*` 索引，再 `read` 插件包内绝对路径（resourceBase 目录） |
| `Bash` / `grep -rP` / `xargs` / `/tmp/` / `curl` | Windows 用 `pwsh` + `Select-String`；`grep` 工具；`web_fetch`；产物写工作区，不用 `/tmp/` |
| 私有知识库 MCP | **完全可选**：等价于通用 MCP server 工具；未配置即跳过，不影响主流程。凭据放 `credentials`，不写入 config/代码 |
| REA / 原生分析引擎 / adb / tshark / JADX | **全部可选，能力探测优先**：用会话实际工具列表决定；缺失时降级到 `glob`/`grep`/`read`/`pwsh`/`web_fetch` 并降低证据级别。插件不安装、不配置、不假定路径 |
| `Write` / `Edit` | `write` / `edit` / `glob` / `grep` |
| 用户询问 | `ask_user_question`；三文档确认可用 UI 审批卡 |
| `maxTurns`(120/40/…30) | `create_goal` + `todo_write` 状态机；跨会话提醒用 `schedule_create` |
| `git show HEAD~1:tests/` 反作弊 | `pwsh` 里 `git diff --name-status` + `git show`，删除/断言下降即判失败 |
| 原资料的私有记忆目录 | `docs/mvp-team/memory/` |

---

## 7. 门禁可执行化

文本门禁改为「Lead 查询 + 机器校验」：
- 用 `/mvp-team gate <phase>`（或 agent 侧 `mvp_team_gate` 工具，phase 支持 `1.25`）取得该 Phase 的门禁项、产物路径、校验命令，逐项执行后再推进。
- **不要**新增自定义 session event type；状态从已落盘产物与现有事件派生。
- 两个 sidecar（`openapi.yaml`、`design-tokens.json`）是**硬闸门**：文件不存在直接退回，不进入下一 Phase。
- **1R 门禁**：授权状态未确认 → 不开始；只有 A 级结论可进 `docs/SPEC.md`；报告缺证据引用或缺合规声明 → 退回。
- 判定是否需要 1R：`mvp_team_recon_scope({idea})`；它返回的是「建议 + 需探测的宿主工具」，不是「已安装能力清单」。

---

## 8. 方法论保留项（原文仍有效）

五层工程化体系、Harness Engineering（有 Harness 98% vs 60% 完成率）、五源对齐法（设计变量 + 设计元数据 + 截图 + 代码 + 渲染截图）、DDAD 文档驱动、4 层 Token（A1-identity → A2 → B-slot → C-extension）、DESIGN.md 9 节、Craft 工艺规范、7×3 生产就绪记分卡、测试完整性反作弊 5 类、6 类生成式代码失效模式、验证者/评审者模式、规格即契约 8 要素、悬而未决登记册、自学习记忆、上下文工程、代码组织规范、评测驱动交付、冲突解决表、决策日志格式。
