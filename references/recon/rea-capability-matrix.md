# REA 能力矩阵与选型基线（参考文档，非依赖）

> 来源：[morluto/rea — Reverse Engineer Anything](https://github.com/morluto/rea)（MIT，REA-authored code）。
> 本文是**选型基线**，不是版本承诺，也不是本插件的依赖或安装说明。
> REA 是「一个本地 MCP，把逆向能力按目标类型铺开」；它的结果是「发现 + 证据 + 局限」，
> 分析在本地运行，不上传目标应用。

## 1. 使用原则

- **按目标类型选能力，不按工具名硬编码**。宿主有没有 REA、有没有某个 MCP server，由会话实际工具列表决定。
- **先静态，后运行时**；静态 JS / .NET 分析通常不需要原生分析引擎，运行时捕获才有副作用。
- **先选失效模式最单一的手段**：验证字段是否被校验，先改错值（只改几字节、结构不变），
  而不是先删字段——后者失败时无法区分「值不合法」和「结构不合法」。
- **证据优先**：每条结论要能回答「用什么命令、什么输入、什么时候、得到什么」，并标明局限与可证伪条件。
- **能力缺失要显式声明**：本环境没有 X ⇒ 「该结论未验证」，而不是猜一个结果。

## 2. 目标类型 → 能力表

| 目标 | 返回什么 | 主要手段 / 前置 |
|---|---|---|
| 桌面安装 | 运行时候选、支撑文件、组件标记、下一步探针 | 有界目录/头检查；无特殊前置 |
| 原生二进制 | 伪代码、汇编、字符串、符号、调用与引用 | Hopper / Ghidra / IDA / Kuna；须合法授权并已安装 |
| 离线 ELF 布局 | 节、段、原始符号/重定位、静态加固候选 | 静态解析；Linux x64 需 caller 提供 pwntools |
| Go 二进制 | 编译器版本、模块、replace、构建设置 | 内嵌元数据静态解析，无需 Go |
| GPU code objects | CUDA/HIP target、kernel 参数、PTX 文本 | ELF/PE/fatbin/CUBIN/PTX 静态解析 |
| 模型文件 | GGUF / safetensors 元数据、张量声明、派生总量 | 头静态解析，可选全文件哈希 |
| IL2CPP 元数据 | Unity 程序集镜像、类型与方法名、索引范围 | 静态解码 v24/27/29/31/39，无需 Unity |
| Godot PCK | 归档清单与提取、头/目录事实 | 静态格式 2/3/4，无需 Godot |
| Rust 二进制 | cargo-auditable crate 名/版本/来源/依赖边 | 内嵌元数据静态解析 |
| PE 证书 / 导入 | Authenticode 签名者、X.509 字段；导入 DLL/序号/IAT RVA | 静态 PE 解析 |
| ELF notes / 加固 | note owner/type、build-id、ABI tag；PIE/NX/RELRO/CFG | 静态头解析 |
| Apple IPS 崩溃 | 元数据、线程、镜像、寄存器、崩溃分类 | 静态 JSON |
| Linux 内核模块 | modinfo、__versions CRC、签名尾 | 静态 ELF |
| Erlang BEAM | IFF chunk、atom、export/import、lambda | 静态 BEAM |
| WASM / EVM | 校验、节、WAT 导入导出；dispatch selector 与参数推断 | WABT 1.0.42 / Linux x64 raw-hex carrier |
| SQLite | 表/列/索引/视图/触发器与选定行 | 本地 DB/WAL 快照；Node 24.15+ 或 26+ |
| 录制崩溃 | notes、各线程寄存器/信号、映射候选 | pwntools；可选 GDB/pwndbg |
| JavaScript / Electron / ASAR | 模块、导入、source map、路由、IPC、addon 关系 | Node.js + npm；Linux 需 procps `ps` |
| 网站 | 页面结构、脚本、网络观测、按需截图 | Chrome 系浏览器 |
| HAR / Fiddler SAZ | 请求响应、暴露的 payload、来源位置 | 离线解析；mitmdump for native mitmproxy |
| .NET 程序集 | 元数据、CIL、声明的 native 依赖、构建对比 | 静态，无前置 |
| Android APK | Manifest、类、反编译方法与引用 | JADX + 完整 JDK（Linux/macOS/Windows x64） |
| APK 签名 | v1/v2/v3/v3.1 签名者、指纹、密钥轮换、摘要自洽 | 静态，无前置 |
| Android 设备 | 设备/包/进程/日志/dump/截图/文件传输 | caller 提供 adb |
| JEB 工程 | 工程 unit、摘要、类型/方法伪代码 | caller 启动的 JEB MCP，`REA_JEB_MCP_URL` |
| Android 资源 | 解码 Manifest、字符串表、locale、版本事实 | caller 提供 apktool |
| Flutter | Dart snapshot 哈希、各 ABI 库摘要、引擎来源 | 静态 APK 解析 |
| 固件 | 分区、提取结果、原生分析交接 | binwalk / unblob（Linux） |
| 录制报文 / pcap 摘要 | 字段/过滤/decode-as；端点、DNS、SNI、协议分布 | TShark 4.x + prlimit / tshark + capinfos（Linux 验证） |
| 逻辑信号录制 | 解码注解、采样范围、诊断 | sigrok-cli 0.7.2 + prlimit（Linux） |
| 包与资源 | 文件清单、摘要、plist、Apple bundle 结构、资源提取 | 静态 |
| 进程行为 | 终端输出、交互、退出、FS 观测、运行对比 | 原生 PTY（Linux/macOS） |
| PyInstaller | CArchive 成员、Python 版本、入口脚本、字节码 | 静态，无前置 |

> 完整最新清单：[REA README](https://github.com/morluto/rea#what-you-can-analyze)、
> [MCP 工具目录](https://github.com/morluto/rea/blob/main/docs/mcp-contracts.md#generated-catalog)。
> 原生格式与宿主支持因 provider 而异；离线原生分析还可接 caller 提供的 GNU objdump / Rizin。

## 3. 结果契约（借用到本插件）

REA 的每次结果都应带：

1. **发现**：结构化事实，不是「我猜它可能…」
2. **证据**：命令 / 输入 / 输出 / 时间；原始产物可再生
3. **局限**：哪些没覆盖、哪些平台/版本不支持、结论的保鲜期
4. **下一步**：为把 B/C 级升到 A 级还需要什么样本

本插件的 `docs/recon/REPORT.md` 采用同一契约，并额外要求**证据级别 A/B/C** 与**合规声明**。

## 4. 合法边界（必须随结论一起引用）

REA 的定位是：合法研究、教育、互操作、软件保存，以及**对自有或已获授权的软件**进行分析。
它不授予商业工具（IDA Pro / Hex-Rays、Hopper、JEB）的许可证、密钥或激活权利；
破解副本、窃取/共享密钥、绕过许可限制均不在授权范围内。

本插件的逆向席位据此增加三条硬约束：

- 授权状态不明 → 先问，不动手；未授权 → 拒绝并在报告写明原因。
- 不实现任何绕过风控 / 越权访问 / 规避许可的能力。
- 运行时分析必须**有界**（超时、只读优先、隔离临时目录），对外部副作用先记工具指纹。

完整免责声明见 [REA DISCLAIMER](https://github.com/morluto/rea/blob/main/DISCLAIMER.md)。

## 5. 安装与更新（纯参考，用户自行决定）

```bash
# 注册 MCP server + 安装工作流指令（支持本地 MCP 的 agent）
npx rea-agents setup
# 全局 CLI（可选）
npm install --global rea-agents && rea --help
# 更新
rea update                    # 全局 CLI
npx rea-agents@latest setup   # 刷新 agent 注册
# 一次性静态 JS/Electron 分析示例（把路径换成用户自己的目标）
npx -y rea-agents@latest analyze-javascript-application "<用户目标目录>" --json
```

**本插件不执行上述命令、不写入用户配置、不假设 npm 全局路径或任何安装目录。**
REA 未安装时，逆向席位按 `mvp-role-recon` 第 4 节降级到宿主通用能力。
Node.js 要求（REA 侧）：22.x ≥22.23.4 / 24.x ≥24.22.1 / 26.12.1+，加 npm；
这些是 REA 的要求，不是本插件的要求。

## 6. 与本项目工程纪律的对应

| REA 概念 | 本项目纪律（见 `references/01-standards/`） |
|---|---|
| 证据 + 局限 | `verifier-critic-pattern.md`、`spec-as-contract.md`（活规格、决策留痕） |
| 静态 vs 运行时 | `generated-code-failure-modes.md`（先确认实际版本再按版本写） |
| 结论可证伪 | `PROGRESS.md` §7.2 证据分级 A/B/C、通过率带分母 |
| 「未观察到」措辞 | §7.2「未观察到 ≠ 不存在」 |
| 独立来源比对 | §7.2「独立来源 > 同源自洽」 |
| 抓包整套连续 | §7.4（时序结论不能用段式样本） |
