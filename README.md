# MVP 开发专家团 · DSH 插件

一个面向 [DeepSeek Harness](https://github.com/deepseek-ai) 的 Cordis bundle：把「一句话想法 →
可交付 MVP」拆成 8 个常驻角色 + 1 个按需逆向分析席位，用分阶段门禁、落盘产物契约与证据纪律约束执行。

**零依赖**：只用 Node 标准库与浏览器已有的 React 运行时，不需要构建，不需要安装任何 npm 包。

## 安装

本插件是**纯文件**的 Cordis bundle（零依赖、无构建、无安装脚本），因此只要把文件放到本机，
用「本地目录」安装就一定能成功。三种方式按可靠性排序：

### 方式 1（最稳，不需要 git）：下载 ZIP → 解压 → 本地目录安装

GitHub 仓库页 → **Code** → **Download ZIP** → 解压，然后把解压出来的目录作为 `target`：

```
plugin_manager: action=install_bundle
target: <解压后的目录，例如 D:\plugins\dsh-mvp-xiaohuTem-main>
```

> ZIP 里没有 `.git`、没有 `prepare` 脚本，解压即可用。这条路径不依赖 git、SSH、npm、网络代理。

### 方式 2（需要 git，但只需 HTTPS）：克隆后本地目录安装

```
git clone https://github.com/hgc357341051/dsh-mvp-xiaohuTem
plugin_manager: action=install_bundle, target=<克隆后的目录>
```

### 方式 3（最省事，但对本机环境有要求）：直接用 git 地址安装

```
plugin_manager: action=install_bundle
target: github:hgc357341051/dsh-mvp-xiaohuTem
```

⚠️ 这条路径会调用 `git`，并可能回落到 `git+ssh://git@github.com/...`。**机器上没有 git、
或 GitHub 没配 SSH 密钥时必然失败**（见下方排障）。不确定就用方式 1。

### 装好后

- 新会话预设选择器里选 **MVP 开发专家团**；
- 或直接加载 skill `mvp-team-workflow` / 输入 `/mvp-team`。

### 安装后必须做的两件事

1. **开一个新会话**。已经打开的会话保留启动时的插件/preset 修订，看不到新装的 preset，也看不到新注册的工具与 skill。
2. **如果新会话仍看不到，重启宿主进程**（HMR 只重载已激活的模块，preset 与 Client 模块图的变更需要重启才完全生效）。

### 排障

| 现象 | 含义与处理 |
|---|---|
| **「无法从依赖变更中确定安装了哪一个包」** | 不是安装失败，而是**它早就装好了**。见下方专门说明。 |
| **`git ls-remote "git+ssh://git@github.com/..."` 退出码 1，或 `Host key verification failed`，或 `'git' 不是内部或外部命令`** | 本机缺 git 或没配 GitHub SSH 密钥。**改用方式 1（ZIP）**；或给该机器装 git 并 `ssh-keyscan github.com >> %USERPROFILE%\.ssh\known_hosts`（仍需 SSH 私钥）。 |
| 预设选不了 / 列表里没有 | 确认安装返回 `application: applied`；开新会话；重启宿主后再看 |
| skill / `mvp_team_*` 工具报错 | 确认 `list_plugins` 里 `include:mvp-team` 与 `include:preset-mvp-dev-expert-team` 都是 `fiberPhase: active`；用 `mvp_team_catalog` 验证 |
| 安装返回 `already-installed` | 已装过。要重装/升级先 `remove_bundle`，再 `install_bundle` |
| 安装返回 `network` / `failedAt: spec-host` | 仓库不可达、无凭证或代理问题 |

### 为什么会出现「无法从依赖变更中确定安装了哪一个包」

这个包在 profile 里已保存为 `github:hgc357341051/dsh-mvp-xiaohuTem`。如果再用**另一种写法**
（例如 `https://github.com/hgc357341051/dsh-mvp-xiaohuTem`）去安装：

1. `installBundle` 的「已安装」判断比对 spec 字符串，两种写法不相等，所以没有提前拦截；
2. pnpm 实际解析到**同一个 commit**，输出 `Already up to date`、`added 0`；
3. 依赖没有任何变化，管理器无法从变更里识别出「装的是哪个包」，于是报这个错。

**处理办法**：什么都不用做——插件已经在运行。直接开新会话使用；要换版本先 `remove_bundle` 再装。

`plugin_manager` 的 `list_bundles` 里 `dsh-mvp-xiaohutem` 的 `enabled` 只代表保存的选择，不代表已成功加载；有 `error` 字段才是真的失败。

## 交付了什么

| 能力 | 落点 |
|---|---|
| 统一工作流契约（门禁 + 产物落盘契约 + 可移植性约定） | `skills/mvp-team-workflow.md` → skill `mvp-team-workflow` |
| 8 个常驻角色简报 | `agents/role-*.md` → `mvp-role-{team-lead,pm,designer,architect,frontend,backend,qa,devops}` |
| 按需逆向分析席位 | `agents/role-recon.md` → `mvp-role-recon` |
| 31 篇知识库 | `references/**` → 6 个索引 skill：`mvp-team-standards` / `-design-systems` / `-architecture` / `-industries` / `-platforms` / `-recon` |
| 7 个模型工具 | `mvp_team_brief` / `catalog` / `role` / `topic` / `reference` / `gate` / `recon_scope` |
| 人类命令 | `/mvp-team [brief\|roles\|phases\|gate <phase>\|recon <idea>\|status]` |
| Agent 预设 | `MVP 开发专家团`（项目总监人格），新会话预设选择器可选 |
| 显示资源 | `locale/{en,zh}.json`、原创 `icon.svg` |

无 Web UI 组件：本插件刻意不注册任何界面。SOP / 角色 / 门禁全部通过 skill 与工具按需加载，
一个静态的「流程展示卡片」对使用者没有实际帮助（不能读会话状态、不能触发动作），所以不做。

渐进式加载：常驻 system prompt 只有一句指针，SOP / 角色 / 知识库按需 `skill` 加载，精确查询走工具。

## 逆向分析席位（按需）

参考 [REA / Reverse Engineer Anything](https://github.com/morluto/rea) 的「一个 MCP，多目标类型」思路。
它的能力很多，**取决于用户开发的项目涉及面**，所以做成条件席位而非常驻第 9 人：

- **触发**：复刻/兼容已有产品、闭源目标、还原协议/文件格式、第三方互操作、竞品调研答不出「它怎么做到的」。
- **不触发**：纯 CRUD、全新设计、公开 API/文档就够的功能 → 不设席位、不占 Phase。
- **派单**：`mvp_team_recon_scope({idea})` 或 `/mvp-team recon <想法>`，返回是否安排、匹配哪些目标能力、
  需探测哪些宿主工具、前置条件、预期产物、降级路径、授权闸门。
- **位置**：条件 Phase **1R / 1.25**；产物 `docs/recon/PLAN.md`、`REPORT.md`、`evidence/`、`scripts/`；
  只有 A 级证据可写进 `docs/SPEC.md`。
- **三条硬约束**：合法授权（未授权即拒绝）；A/B/C 证据分级（「未观察到」≠「不存在」、通过率带分母）；
  **能力探测优先**——不假设 REA / Hopper / JADX / adb / tshark 已安装，缺失就降级到宿主通用工具并降低证据级别。

REA 是**可选参考实现，不是依赖**；插件不执行安装、不写入用户配置、不假定 npm 全局路径。
详见 `references/recon/rea-capability-matrix.md`。

## 工作流要点

- **产物必须落盘**：DSH 的会话日志是唯一真相，只放在对话上下文里的 Spec 在 fork / resume / replay 后会丢。
  `docs/PRD.md`、`docs/ARCHITECTURE.md`、`docs/UIUX.md`、`docs/SPEC.md`（13 章）、`docs/api/openapi.yaml`、
  `DESIGN.md`、`design-system/design-tokens.json`、`tests/`、`delivery/` 都声明了 owner / 消费者 / 机器校验。
- **门禁**：Phase 0 澄清 → 1 三文档（唯一用户确认点）→ 1R 按需逆向 → 1.5 Spec 锁定 → 2 设计与测试设计 →
  3 并行开发 → 4 测试与交付。用 `mvp_team_gate(phase)` 逐项核验后再推进。
- **交接协议**：成员写盘，回传只带 `RoleVerdict` 与 `evidence[].artifact_ref`，不把整份文档塞进消息。
- **P0**：禁止 emoji 作功能图标（使用 Spec 锁定的图标库）、禁止紫粉渐变主视觉、禁止 AI 模板味。

## 可移植性

| 类别 | 解析方式 |
|---|---|
| `agents/`、`references/`、`skills/` | 相对**插件包根**；`index.js` 用 `import.meta.url` 运行时推导 `ROOT` |
| `docs/`、`design-system/`、`tests/`、`delivery/` | 相对**当前项目根**（会话 `working_directory`） |
| 安装目录 / profile 目录 / `node_modules` 位置 | 完全不引用 |
| MCP server 名、npm 全局路径、第三方工具路径 | 完全不假定；用会话实际工具列表探测 |
| DSH 版本 | 不设 `engines.dsh` 下限，避免其他版本被拒绝安装 |
| team 工具 | 优先 `spawn_teammate` / `team_task_*`，缺失时降级 `subagent` / `workflow` |

`mvp_team_reference` 只接受包内 `references/` / `agents/` 相对路径，带路径逃逸防护。

## 打包与发布

本仓库就是一个可直接安装的 bundle（根目录 `package.json` 声明 `dsh.bundle.patch`），
**不需要额外构建步骤**。`files` 白名单决定发布包内容；本地目录安装不受其过滤，
发布前请用 `npm pack --dry-run` 核对实际清单。

发布前检查见 `CONTRIBUTING.md`：改包名需同步 3 处（`package.json`、`cordis.patch.yml`、
`index.js` 的 `SOURCE`），并替换 `LICENSE` 版权行。

## 已知边界

- 门禁是「项目总监查询 + 机器校验 + 人工签字」，不是无条件全局拒绝的 guard；emoji 正则会误伤中文文案。
- 原资料作为**专业参考**改编保留，与统一契约冲突处以契约为准。

## 许可与来源

- 本插件自有代码与文档：MIT，见 `LICENSE`。
- `agents/role-*.md`（8 份）与 `references/**`（30 篇）改编自一份以 MIT 许可发布的 MVP 团队协作提示词资料集，
  原作者 weiyou；版权声明保留在 `assets/LICENSE.upstream.txt`，改编说明见 `assets/CHANGELOG.upstream.md`。
- `references/01-standards/` 中 10 篇改编自 [UmaDev](https://github.com/umacloud/umadev)（MIT），各文件头部保留来源标注。
- `references/recon/rea-capability-matrix.md` 描述 [REA](https://github.com/morluto/rea)（MIT）作为可选参考，
  **未 vendored 任何 REA 代码**；商业工具（IDA / Hopper / JEB）需用户自行合法取得授权。

上述第三方版权声明依 MIT 要求保留，不代表与本插件有隶属、背书或运行时依赖关系。
