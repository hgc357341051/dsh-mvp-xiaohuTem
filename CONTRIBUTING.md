# 贡献与发布

## 本地开发

这是一个零依赖的 Cordis bundle（只用 Node 标准库 + 浏览器 React 运行时），不需要构建。

```bash
# 语法自检（任意 Node ≥18）
node --check index.js && node --check client.js
# JSON 自检（用 UTF-8 读，别用 PowerShell 的 ANSI 默认编码）
node -e "for (const f of ['package.json','locale/en.json','locale/zh.json']) JSON.parse(require('fs').readFileSync(f,'utf8'))"
# 核对发布包实际文件清单
npm pack --dry-run
```

安装到当前 DSH profile：`plugin_manager` 的 `action=install_bundle`，`target` 传本仓库目录
（本地开发）或本仓库的 git URL（分发）。修改 `index.js` / `client.js` / `cordis.patch.yml`
后需要重新启用 bundle 才会重建 Client 模块图：`set_bundle(enabled=false)` → `set_bundle(enabled=true)`。
本地目录安装是 **link**，文件改动实时可见。

## 分发方式

本仓库本身就是一个可安装的 bundle（根目录 `package.json` 声明 `dsh.bundle.patch`），
**没有额外打包步骤**。别人可以用任一方式安装：

```
# 方式 A：直接 git 地址（installBundle 先 git ls-remote 检查，再交给 pnpm）
plugin_manager: action=install_bundle, target=https://github.com/hgc357341051/dsh-mvp-xiaohuTem

# 方式 B：克隆后本地目录
git clone https://github.com/hgc357341051/dsh-mvp-xiaohuTem
plugin_manager: action=install_bundle, target=<克隆目录>

# 方式 C：发到 npm 后按包名安装（可选，需自行 npm publish）
plugin_manager: action=install_bundle, target=dsh-mvp-xiaohutem
```

私有仓库/首次推送需要使用者本机的 GitHub 凭证可用。DSH 的 `installBundle` 对 GitHub
目标先跑 `git ls-remote`（默认 5s 超时），再由 pnpm 拉取；包内 `files` 白名单决定最终内容。

## 发布前检查

1. **不要写死任何绝对路径**。包内资源一律用 `import.meta.url` 推导（见 `index.js` 的 `ROOT`）；
   项目产物一律相对会话 `working_directory`。`/mvp-team status`、`mvp_team_catalog`、
   `mvp_team_brief` 的输出不得包含本机路径。
2. 若改 `package.json` 的 `name`，须同步 4 处：`cordis.patch.yml` 里 `mvp-team` 行的 `name`、
   `client.js` 里 `window.__ModuleLoader__.load({ id })`、`index.js` 里 `SOURCE`、
   以及 `README.md` 的安装示例。四处必须一致。
3. 替换 `LICENSE` 的版权行；**保留**所有第三方署名（`assets/LICENSE.upstream.txt`、
   各 `references/01-standards/*.md` 头部、REA 说明）——这是 MIT 要求。
4. 用 `npm pack --dry-run` 核对 `files` 白名单包含所有新增目录（尤其 `references/recon/`）。
   本地 link 安装不受 `files` 过滤，**压缩包/发布包才受**。
5. 不要提交任何 profile 目录、`node_modules`、会话日志或本机路径。见 `.gitignore`。

## 可移植性不变量（改动时请守住）

| 不变量 | 为什么 |
|---|---|
| 不引用本机盘符路径、用户主目录、profile 目录 | 别人的安装位置不同 |
| 不引用宿主安装包内部路径 / profile 的 `node_modules` 位置 | 随宿主版本与安装方式变化 |
| 不假设 REA / Hopper / JADX / adb / tshark / 私有知识库 MCP 已安装 | 用户环境不同；一律先探测、后降级 |
| 不假设 `spawn_teammate` 等 team 工具一定存在 | 提供 `subagent` / `workflow` 降级 |
| 不在 `engines.dsh` 写死版本下限 | 会让其他 DSH 版本被拒绝安装 |
| `resourceBase` 只用于**包内**资源 | 项目产物必须走 `working_directory` |
| 新增 skill / topic / 工具时同步更新 `README.md`、`locale/*.json`、`mvp_team_catalog` | 目录与能力要对得上 |

## 验证清单

- `node --check` 两个 JS 文件通过
- 三个 JSON 可解析，且 `locale/*.json` 的 `meta.title` / `meta.description` 有意义
- `icon.svg` ≤256 KiB、包内相对路径
- `plugin_manager install_bundle` 返回 `application: applied` 且 `warnings: []`
- `mvp_team_catalog` 能列出全部角色/主题/阶段（含条件 1R）
- `mvp_team_recon_scope` 对「纯 CRUD 想法」返回 `recommended: false`，对「复刻某 App 的协议」返回 `recommended: true`
- `mvp_team_reference` 拒绝 `../` 路径逃逸
- 换一个工作目录、换一个 profile（如能）重装，确认输出里没有旧路径
- `npm pack --dry-run` 的文件清单包含 `agents/role-*.md`、`references/recon/`、LICENSE
