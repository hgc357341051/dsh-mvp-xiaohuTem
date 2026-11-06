import { readdirSync, readFileSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CONTRACT = 'skills/mvp-team-workflow.md';

// `origin` distinguishes adapted third-party briefs from briefs authored by this bundle.
const ROLES = [
  { id: 'team-lead', file: 'role-team-lead', zh: '项目总监', en: 'Project director', maxTurns: 120, origin: 'adapted' },
  { id: 'pm', file: 'role-pm', zh: '产品经理', en: 'Product manager', maxTurns: 40, origin: 'adapted' },
  { id: 'designer', file: 'role-designer', zh: 'UI/UX 设计师', en: 'UI/UX designer', maxTurns: 50, origin: 'adapted' },
  { id: 'architect', file: 'role-architect', zh: '首席架构师', en: 'Chief architect', maxTurns: 40, origin: 'adapted' },
  { id: 'frontend', file: 'role-frontend', zh: '前端工程师', en: 'Frontend engineer', maxTurns: 60, origin: 'adapted' },
  { id: 'backend', file: 'role-backend', zh: '后端工程师', en: 'Backend engineer', maxTurns: 60, origin: 'adapted' },
  { id: 'qa', file: 'role-qa', zh: '测试工程师', en: 'QA engineer', maxTurns: 40, origin: 'adapted' },
  { id: 'devops', file: 'role-devops', zh: '运维工程师', en: 'DevOps engineer', maxTurns: 30, origin: 'adapted' },
  { id: 'recon', file: 'role-recon', zh: '逆向分析工程师', en: 'Reverse engineering analyst', maxTurns: 60, origin: 'bundle' },
];

const TOPICS = [
  { name: 'mvp-team-standards', dirs: ['references/01-standards'], zh: '11 篇工程纪律：规格即契约、评测驱动、验证者评审者、测试纪律、反作弊、失效模式、生产就绪记分卡、自学习记忆、悬而未决登记册、上下文工程、代码组织。', en: 'Eleven engineering-discipline standards: spec-as-contract, eval-driven delivery, verifier/critic, test discipline, anti-gaming, failure modes, readiness scorecard, memory, open decisions, context engineering, code organization.' },
  { name: 'mvp-team-design-systems', dirs: ['references/design-systems'], zh: '7 篇设计系统：四层 Token 标准、设计命令库、UI 风格库、行业设计系统、配色库、字体配对、落地页模式。', en: 'Seven design-system references: token standard, design commands, UI style library, industry systems, color palettes, typography pairings, landing patterns.' },
  { name: 'mvp-team-architecture', dirs: ['references/architecture', 'references/cost-models'], zh: '4 篇架构模式（MVP 技术栈 / RAG 知识库 / 多租户 SaaS / AI Agent 工程化）与开发成本模型。', en: 'Four architecture patterns (MVP stack, RAG, multi-tenant SaaS, AI agents) plus a development cost model.' },
  { name: 'mvp-team-industries', dirs: ['references/industries'], zh: '5 篇行业设计规范：SaaS/B2B、电商、内容平台、AI 原生、企业管理。', en: 'Five industry design guides: SaaS/B2B, ecommerce, content platforms, AI-native, enterprise.' },
  { name: 'mvp-team-platforms', dirs: ['references/platforms'], zh: '2 篇平台规范：微信小程序、鸿蒙 HarmonyOS NEXT。', en: 'Two platform guides: WeChat Mini Program and HarmonyOS NEXT.' },
  { name: 'mvp-team-recon', dirs: ['references/recon'], zh: 'REA 能力矩阵与选型基线：按目标类型选逆向手段、证据契约、合法边界与无 REA 时的降级路径。', en: 'REA capability matrix and selection baseline: choose reverse-engineering methods by target type, evidence contract, legal boundary and graceful degradation without REA.' },
];

// Phase 1R is conditional: the Lead seats it only when the project involves an
// existing closed target, a protocol/file format, or third-party interop.
const PHASES = [
  { id: 0, name: '需求澄清', en: 'Clarify', seats: [], gates: ['一次性一轮提问并总结为 3 句话', '评估快速路径（轻量 / 迷你 / 标准）', '判定是否触发 Phase 1R 逆向席位'], user: '被问 1 次' },
  { id: 0.5, name: '知识库探测', en: 'Knowledge base', seats: [], gates: ['可选 MCP；未配置即跳过', '调用前告知授权'], user: '仅授权告知' },
  { id: 1, name: '并行调研', en: 'Research', seats: ['pm', 'architect', 'designer'], gates: ['三文档落盘：docs/PRD.md、docs/ARCHITECTURE.md、docs/UIUX.md', '4 项一致性检查', 'P0 规则嵌入每份指令', '知识库全量表引用检查'], user: '唯一交互点：确认三文档' },
  { id: 1.25, name: '逆向分析（按需）', en: 'Reverse engineering (conditional)', seats: ['recon'], gates: ['授权确认（无授权即拒绝）', 'docs/recon/PLAN.md 定级与手段', 'docs/recon/REPORT.md 每条结论带 A/B/C 证据级别', '仅 A 级结论允许写入 Spec', '宿主能力探测：缺 REA 时按降级路径并降低证据级别'], user: '仅授权确认' },
  { id: 1.5, name: 'Spec 锁定', en: 'Spec lock', seats: [], gates: ['Lead 亲自生成 13 章 docs/SPEC.md 并落盘', '锁定一套图标库', 'OPEN-DECISIONS.md 与 DECISION-LOG.md 就位', '若启用 1R：把 A 级结论并入 Spec 并在第 13 章留痕'], user: '无' },
  { id: 2, name: '设计与测试设计', en: 'Design', seats: ['architect', 'designer', 'qa'], gates: ['openapi.yaml 存在（硬闸门）', 'design-tokens.json 存在（硬闸门）', 'DESIGN.md 9 节齐全', 'QA 产出测试用例与 EARS 验收映射', 'P0 扫描 + 反模式 13 项'], user: '仅进度' },
  { id: 3, name: '并行开发', en: 'Build', seats: ['frontend', 'backend'], gates: ['lint / type-check / test 自检 ≤3 轮', 'emoji 功能图标扫描', '代码组织门禁：分层 / 单文件 ≤300 行 / 单一职责 / 入口只装配', 'UI 11 项 + P0'], user: '仅进度' },
  { id: 4, name: '测试与交付', en: 'Ship', seats: ['qa', 'devops'], gates: ['QA 先于 DevOps，严格串行', 'P0 缺陷归零', 'delivery/TEST_REPORT.md', 'health endpoint + 核心流程验证', 'delivery/ 7 文件自包含'], user: '交付通知' },
];

// Capability-based triggers for the conditional recon seat. Keywords are matched
// case-insensitively against the user's idea / project description.
const RECON_CAPABILITIES = [
  { key: 'native-binary', match: ['binary', '二进制', '原生库', '.dll', '.so', 'dylib', '驱动', '固件', 'firmware', '反汇编', '汇编', '伪代码', 'decompil'], tools: '原生二进制：Hopper / Ghidra / IDA / Kuna / objdump / Rizin（须合法授权且已安装）', requires: '合法授权的原生分析引擎', artifacts: ['伪代码与汇编摘录', '符号/字符串/调用引用清单'] },
  { key: 'js-electron', match: ['electron', 'asar', 'vscode', 'notion', 'desktop app', '桌面应用', '客户端', 'js ', 'javascript', 'node_modules', 'ipc', 'preload'], tools: 'JS / Electron / ASAR：静态解包、模块与引用图、source map、路由与 IPC 关系', requires: 'Node.js + npm（Linux 另需 procps ps）', artifacts: ['模块/导入清单', 'IPC 与 native addon 关系图'] },
  { key: 'dotnet', match: ['.net', 'dotnet', 'cil', 'assembly', '程序集', 'csharp', 'c#'], tools: '.NET 程序集：元数据、CIL、声明的 native 依赖、构建对比（静态）', requires: '无（静态）', artifacts: ['类型/方法元数据', 'native 依赖清单'] },
  { key: 'website', match: ['website', 'web app', '网页', '网站', 'chromium', 'chrome', '浏览器', '前端复刻', '页面结构'], tools: '网站：有界页面结构、脚本、网络观测、按需截图', requires: 'Chrome 系浏览器', artifacts: ['页面/脚本结构', '网络请求清单'] },
  { key: 'network-capture', match: ['pcap', '抓包', '协议', 'protocol', 'tcp', 'udp', 'har', 'saz', 'tls', 'sni', 'dns', '报文', '封包'], tools: '离线 HAR/SAZ/pcap：请求响应、payload、端点、DNS、TLS SNI、协议分布、字段解码', requires: 'tshark + capinfos（Linux 验证）/ 离线录制文件', artifacts: ['字段与过滤规则', '端点与协议分布表'] },
  { key: 'android', match: ['apk', 'android', '安卓', 'jadx', 'apktool', 'flutter', 'il2cpp', 'unity', 'godot', 'pck', 'adb'], tools: 'APK / 签名 / 资源 / Flutter / IL2CPP / Godot PCK / adb 设备', requires: 'JADX+JDK、apktool 或 adb（按目标）', artifacts: ['Manifest 与反编译方法', '签名者/资源表', '设备侧观测'] },
  { key: 'file-format', match: ['文件格式', '存档', '存档格式', 'save file', 'gguf', 'safetensors', 'wasm', 'beam', 'sqlite', 'elf', 'pe ', 'mach-o', 'ips', 'elf notes', '证书'], tools: '文件格式静态解析：ELF/PE/Mach-O、GGUF/safetensors、WASM、BEAM、SQLite、IPS、内核模块、PE 证书、GPU code object', requires: '多为静态无前置；个别需 WABT / pwntools', artifacts: ['结构化字段清单', '加固/签名事实'] },
  { key: 'pyinstaller', match: ['pyinstaller', 'pyc', '打包的 python', 'python 打包'], tools: 'PyInstaller：CArchive 成员、Python 版本、入口脚本、提取字节码（静态）', requires: '无（静态）', artifacts: ['成员清单', '入口脚本与字节码'] },
  { key: 'process-runtime', match: ['进程行为', '运行对比', 'runtime behavior', 'ptY', '终端交互', '启动流程'], tools: '进程行为：有界 PTY 捕获终端输出、交互、退出与文件系统观测、运行对比', requires: 'Linux/macOS 原生 PTY', artifacts: ['运行对比表', '副作用清单'] },
  { key: 'go-rust', match: ['go binary', 'go 二进制', 'golang', 'rust binary', 'rust 二进制', 'cargo-auditable', '依赖版本'], tools: 'Go / Rust 二进制：编译器版本、模块、replace、crate 名/版本/来源/依赖边（内嵌元数据静态解析）', requires: '无（静态）', artifacts: ['依赖与版本清单'] },
];

const RESOURCE_BASE = { kind: 'directory', path: ROOT };
const SOURCE = 'dsh-mvp-xiaohutem';

function readSync(rel) {
  try { return readFileSync(join(ROOT, rel), 'utf8'); }
  catch (error) { return `Could not read ${rel}: ${error instanceof Error ? error.message : String(error)}`; }
}

async function safeRead(path) {
  try { return await readFile(path, 'utf8'); }
  catch (error) { return `Could not read ${path}: ${error instanceof Error ? error.message : String(error)}`; }
}

async function topicFiles(topic) {
  const parts = [];
  for (const dir of topic.dirs) {
    const entries = await readdir(join(ROOT, dir), { withFileTypes: true });
    for (const entry of entries.filter(e => e.isFile() && e.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name))) {
      parts.push(`- ${dir}/${entry.name}`);
    }
  }
  return parts;
}

function roleContent(role) {
  const adapted = role.origin !== 'bundle';
  const provenance = adapted
    ? `Adapted brief: agents/${role.file}.md · suggested maxTurns ${role.maxTurns} (map to a goal/todo state machine in DSH).`
    : `Bundle-authored brief: agents/${role.file}.md · suggested maxTurns ${role.maxTurns} (map to a goal/todo state machine in DSH). This is a conditional seat added by this bundle.`;
  const note = adapted
    ? [
        'APPLICABILITY NOTE — this brief is professional guidance, not a runtime dependency:',
        '- Use DSH team mechanisms: spawn_teammate / team_task_* / send_message, or subagent / workflow as a fallback.',
        '- All `references/…` paths are relative to the plugin package root; load the matching mvp-team-* topic first, then read the file.',
        '- Write every deliverable to disk (see the artifact contract in docs/SPEC.md). Return RoleVerdict with evidence[].artifact_ref.',
        '- Optional private knowledge bases and third-party tools must be probed, never assumed.',
        '- The authoritative SOP is skill `mvp-team-workflow`, which overrides any conflicting phase / gate / P0 rule below.',
      ]
    : [
        'APPLICABILITY NOTE — this is a conditional seat:',
        '- The Lead seats it only when the project involves an existing closed target, a protocol/file format, or third-party interop (use mvp_team_recon_scope).',
        '- All paths in this brief are relative: `references/…` to the plugin package root, `docs/…` to the current project working directory.',
        '- REA and every third-party tool named here are optional capabilities, never dependencies. Probe the session tool list; degrade when absent.',
        '- Legal/authorization boundary and A/B/C evidence grading are mandatory, not advisory.',
        '- The authoritative SOP is skill `mvp-team-workflow`, which overrides any conflicting phase / gate / P0 rule below.',
      ];
  return [
    `# ${role.zh} / ${role.en} (${role.id})`,
    '',
    provenance,
    '',
    ...note,
    '',
    '---',
    '',
    readSync(`agents/${role.file}.md`),
  ].join('\n');
}

function topicContent(topic) {
  const files = [];
  for (const dir of topic.dirs) {
    try {
      for (const name of readdirSync(join(ROOT, dir)).filter(n => n.endsWith('.md')).sort()) files.push(`- ${dir}/${name}`);
    } catch { /* a missing directory is reported by the index only */ }
  }
  const referenceSection = topic.name === 'mvp-team-recon'
    ? [
        'Selection baseline (full matrix in the file above):',
        '',
        '- Choose methods by TARGET TYPE, not by tool name. REA / Hopper / adb / tshark are optional capabilities, never dependencies.',
        '- Static first, runtime second. Every finding needs command + input + output + time + evidence grade + limitation.',
        '- If the host lacks a capability, degrade with generic tools and LOWER the evidence grade; never guess.',
        '- Legal boundary: analyze only software you own or are authorized to examine; no license circumvention, no unauthorized access.',
      ]
    : [
        'Who reads what (upstream index, authoritative per references/README.md:49-60):',
        '',
        readSync('references/README.md'),
      ];
  return [
    `# ${topic.name}`,
    '',
    `${topic.zh}`,
    '',
    `Resource base: ${ROOT}`,
    '',
    'Files (resolve relative paths against the resource base; read only what you need):',
    ...files,
    '',
    ...referenceSection,
  ].join('\n');
}

function registerSkill(ctx, skill) {
  const skills = ctx.get('skills');
  if (!skills) return;
  try {
    const disposer = skills.register(skill);
    ctx.effect(() => disposer, `mvp-team:skill:${skill.name}`);
  } catch (error) {
    ctx.logger?.warn?.(`mvp-team: failed to register skill ${skill.name}: ${String(error)}`);
  }
}

const OUTPUT = { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] };

function definition(name, description, parameters, execute) {
  return { name, description, parameters, output: OUTPUT, execute };
}

function stringArg(name, description) {
  return { type: 'string', description };
}

export function apply(ctx) {
  // 1. Progressive skill catalog: 1 authoritative SOP + 8 role briefs + 5 knowledge-base indexes.
  registerSkill(ctx, {
    name: 'mvp-team-workflow',
    description: 'Authoritative DSH port of the MVP Dev Expert Team SOP: phases and gates, 8 standard roles plus a conditional reverse-engineering role, on-disk artifact contract, DSH tool mapping, portability rules and rulings on upstream contradictions. Load before any multi-phase MVP build.',
    whenToUse: 'When the user wants to build an MVP/product from an idea, or asks about the expert team workflow, phases, gates, roles or deliverables.',
    source: SOURCE,
    resourceBase: RESOURCE_BASE,
    content: readSync(CONTRACT),
  });
  for (const role of ROLES) {
    registerSkill(ctx, {
      name: `mvp-role-${role.id}`,
      description: `${role.zh} / ${role.en} brief for the MVP Dev Expert Team. Load when acting as or delegating to this role.${role.id === 'recon' ? ' CONDITIONAL seat: only when the project involves a closed target, a protocol/file format, or interop, and only with explicit authorization.' : ' Includes the DSH portability note.'}`,
      whenToUse: role.id === 'recon'
        ? 'Only when mvp_team_recon_scope recommends it; the target must be lawfully analyzable.'
        : `When working on ${role.en.toLowerCase()} tasks in an MVP build.`,
      source: SOURCE,
      resourceBase: RESOURCE_BASE,
      content: roleContent(role),
    });
  }
  for (const topic of TOPICS) {
    registerSkill(ctx, {
      name: topic.name,
      description: `Knowledge-base index: ${topic.zh} Load this index, then read only the reference files you need from the plugin package.`,
      whenToUse: 'When a role needs its engineering / design / architecture / industry / platform baseline.',
      source: SOURCE,
      resourceBase: RESOURCE_BASE,
      content: topicContent(topic),
    });
  }

  // 2. Parameterised model tools. Skills own the prose; these own exact lookups and gate checks.
  const tools = ctx.get('tools');
  if (tools) {
    for (const def of buildTools()) {
      try {
        const disposer = tools.register(def);
        ctx.effect(() => disposer, `mvp-team:tool:${def.name}`);
      } catch (error) {
        ctx.logger?.warn?.(`mvp-team: failed to register tool ${def.name}: ${String(error)}`);
      }
    }
  }

  // 3. A short always-visible pointer; the full SOP stays behind the skill.
  const systemPrompt = ctx.get('systemPrompt');
  if (systemPrompt) {
    const disposer = systemPrompt.section({
      name: 'mvp-team:brief',
      order: 250,
      interpolate: false,
      text: 'The "MVP 开发专家团 / MVP Dev Expert Team" plugin is installed. When the user asks to build an MVP or a product from an idea, load the skill `mvp-team-workflow` and use the mvp_team_* tools. That skill is the single authoritative SOP; it resolves upstream contradictions and requires all deliverables to be written to disk. When the project involves an existing closed target, a protocol/file format, or third-party interop, call mvp_team_recon_scope to decide whether to seat the conditional reverse-engineering role.',
    });
    ctx.effect(() => disposer, 'mvp-team:prompt-section');
  }

  // 4. Human command surface.
  const commands = ctx.get('commands');
  if (commands) {
    const disposer = commands.register({
      name: 'mvp-team',
      description: 'MVP 开发专家团 / MVP Dev Expert Team workflow, roles, phase gates and reverse-engineering scope.',
      input: { hint: '[brief|roles|phases|gate <phase>|recon <idea>|status]' },
      handler: ({ rawInput }) => ({ kind: 'success', text: commandText((rawInput ?? '').trim()) }),
    });
    ctx.effect(() => disposer, 'mvp-team:command');
  }
}

function buildTools() {
  return [
    definition(
      'mvp_team_brief',
      'Return the authoritative DSH workflow contract for the MVP Dev Expert Team, including rulings on the upstream contradictions, the artifact contract and the DSH tool mapping. Use before starting a multi-phase MVP build.',
      { type: 'object', properties: {}, additionalProperties: false },
      async () => safeRead(join(ROOT, CONTRACT)),
    ),
    definition(
      'mvp_team_catalog',
      'List the expert roles (8 upstream + 1 conditional reverse-engineering), knowledge-base topics, and workflow phases with their gates. Returns a compact directory; use a mvp-role-* / mvp-team-* skill, mvp_team_gate or mvp_team_recon_scope to load one in full.',
      { type: 'object', properties: {}, additionalProperties: false },
      async () => JSON.stringify({
        contract: 'skill:mvp-team-workflow',
        roles: ROLES.map(r => ({ id: r.id, zh: r.zh, skill: `mvp-role-${r.id}`, origin: r.origin, conditional: r.id === 'recon' })),
        topics: TOPICS.map(t => ({ name: t.name, zh: t.zh })),
        phases: PHASES.map(p => ({ id: p.id, name: p.name, seats: p.seats, conditional: p.id === 1.25, user: p.user })),
      }, null, 2),
    ),
    definition(
      'mvp_team_role',
      'Load one expert role brief (full agent markdown) plus the applicability note. Role ids: team-lead, pm, designer, architect, frontend, backend, qa, devops, recon. "recon" is a conditional seat authored by this bundle.',
      { type: 'object', properties: { role: stringArg('role', 'Exact role id, e.g. "architect"') }, required: ['role'], additionalProperties: false },
      async (args) => {
        const role = ROLES.find(r => r.id === args?.role);
        if (!role) return `Unknown role "${String(args?.role ?? '')}". Valid ids: ${ROLES.map(r => r.id).join(', ')}.`;
        return roleContent(role);
      },
    ),
    definition(
      'mvp_team_topic',
      'Load a knowledge-base topic index: mvp-team-standards, mvp-team-design-systems, mvp-team-architecture, mvp-team-industries, mvp-team-platforms or mvp-team-recon. Returns the resource base and every reference file; read only the files you need.',
      { type: 'object', properties: { topic: stringArg('topic', 'Exact topic name') }, required: ['topic'], additionalProperties: false },
      async (args) => {
        const key = String(args?.topic ?? '');
        const topic = TOPICS.find(t => t.name === key || t.name === `mvp-team-${key}`);
        if (!topic) return `Unknown topic "${key}". Valid: ${TOPICS.map(t => t.name).join(', ')}.`;
        return topicContent(topic);
      },
    ),
    definition(
      'mvp_team_reference',
      'Read one knowledge-base reference file from the plugin package by its relative path, e.g. "references/01-standards/spec-as-contract.md". Paths outside the package are rejected.',
      { type: 'object', properties: { path: stringArg('path', 'Package-relative path under references/ or agents/') }, required: ['path'], additionalProperties: false },
      async (args) => {
        const rel = String(args?.path ?? '').replace(/\\/g, '/');
        const abs = resolve(ROOT, rel);
        if (!abs.startsWith(ROOT + sep) && abs !== ROOT) return 'Rejected: path escapes the plugin package.';
        if (!(rel.startsWith('references/') || rel.startsWith('agents/') || rel === CONTRACT)) return 'Rejected: only references/, agents/ and the workflow contract are readable.';
        return safeRead(abs);
      },
    ),
    definition(
      'mvp_team_gate',
      'Return the gate checklist for one workflow phase (0, 0.5, 1, 1.25, 1.5, 2, 3, 4): required artifacts, hard sidecar gates, seats and the user interaction point. Use it to verify a phase before advancing.',
      { type: 'object', properties: { phase: stringArg('phase', 'Phase id: 0, 0.5, 1, 1.25, 1.5, 2, 3 or 4') }, required: ['phase'], additionalProperties: false },
      async (args) => {
        const phase = PHASES.find(p => String(p.id) === String(args?.phase));
        if (!phase) return `Unknown phase "${String(args?.phase ?? '')}". Valid: ${PHASES.map(p => p.id).join(', ')}.`;
        return JSON.stringify({
          phase: phase.id,
          name: `${phase.name} / ${phase.en}`,
          conditional: phase.id === 1.25,
          seats: phase.seats.map(id => `mvp-role-${id}`),
          userInteraction: phase.user,
          gates: phase.gates,
          artifacts: phaseArtifacts(phase.id),
          hardSidecars: phase.id === 2 ? ['docs/api/openapi.yaml', 'design-system/design-tokens.json'] : [],
          ruling: phase.id === 1.25
            ? 'Conditional seat. Skip it when the project has no closed target / protocol / interop need. Authorization is mandatory; only A-grade evidence may enter docs/SPEC.md. No REA installation is assumed.'
            : 'Artifacts must exist on disk. Members return RoleVerdict with evidence[].artifact_ref; no full documents in messages. Fast paths skipping the QA seat require Lead to personally run the P0 gate and sign it.',
        }, null, 2);
      },
    ),
    definition(
      'mvp_team_recon_scope',
      'Decide whether the conditional reverse-engineering seat (Phase 1R) should be assigned for a project idea, and which target capabilities it needs. Returns matched capabilities, host tools to probe, prerequisites, expected artifacts, degradation path and the authorization gate. No tool or install path is assumed.',
      { type: 'object', properties: { idea: stringArg('idea', 'The user\'s product idea or project description, in any language') }, required: ['idea'], additionalProperties: false },
      async (args) => {
        const text = String(args?.idea ?? '').toLowerCase();
        const matched = RECON_CAPABILITIES.filter(c => c.match.some(k => text.includes(k)));
        const hostToolsToProbe = ['glob', 'grep', 'read', 'read_image', 'pwsh / bash', 'web_fetch / web_search', 'MCP tool list (if any)'];
        return JSON.stringify({
          conditionalPhase: '1R / 1.25',
          role: 'mvp-role-recon',
          recommended: matched.length > 0,
          reason: matched.length > 0
            ? 'The idea mentions an existing closed target, a protocol/file format, or third-party interop.'
            : 'No reverse-engineering trigger found. Do not seat the recon role; a plain MVP build does not need it.',
          matchedCapabilities: matched.map(c => ({ key: c.key, methods: c.tools, prerequisites: c.requires, artifacts: c.artifacts })),
          hostToolsToProbe,
          prerequisitesNote: 'Probe the session\'s ACTUAL tool list first. REA (github.com/morluto/rea) and every third-party engine are optional; the plugin never installs them and never assumes a path.',
          authorizationGate: 'MANDATORY: analyze only targets the user owns or is explicitly authorized to examine. If authorization is unclear, ask. If absent, refuse and record the reason in docs/recon/REPORT.md.',
          degradation: 'Without REA / a native engine / adb / tshark: use generic file, shell and web tools, LOWER the evidence grade, and state which conclusions are unavailable. Never guess.',
          deliverables: ['docs/recon/PLAN.md', 'docs/recon/REPORT.md', 'docs/recon/evidence/', 'docs/recon/scripts/', 'RoleVerdict with evidence[].artifact_ref'],
          evidenceGrading: 'A (multiple independent sources) / B (single observation, TODO) / C (inference, not a basis for implementation). Report pass rates with denominators; "not observed" is not "does not exist".',
          reference: 'skill mvp-team-recon, or mvp_team_reference with path references/recon/rea-capability-matrix.md',
        }, null, 2);
      },
    ),
  ];
}

function phaseArtifacts(id) {
  switch (String(id)) {
    case '1': return ['docs/PRD.md', 'docs/ARCHITECTURE.md', 'docs/UIUX.md'];
    case '1.25': return ['docs/recon/PLAN.md', 'docs/recon/REPORT.md', 'docs/recon/evidence/', 'docs/recon/scripts/'];
    case '1.5': return ['docs/SPEC.md', 'docs/decisions/OPEN-DECISIONS.md', 'docs/decisions/DECISION-LOG.md'];
    case '2': return ['docs/api/openapi.yaml', 'docs/decisions/ADR-XXX.md', 'DESIGN.md', 'design-system/MASTER.md', 'design-system/design-tokens.json', 'design-system/design-tokens.css', 'tests/ (QA test cases)'];
    case '3': return ['src/types/api.d.ts', 'mocks/', 'frontend + backend source', 'docs/mvp-team/memory/pitfalls.jsonl'];
    case '4': return ['delivery/TEST_REPORT.md', 'delivery/README.md', 'delivery/DEPLOY.md', 'delivery/USER_GUIDE.md', 'delivery/.env.example', 'delivery/.gitignore', 'delivery/docker-compose.yml | 平台配置文件'];
    default: return [];
  }
}

function commandText(arg) {
  if (arg === 'roles') return ROLES.map(r => `${r.id.padEnd(10)} ${r.zh} / ${r.en}  skill: mvp-role-${r.id}${r.id === 'recon' ? '  [conditional]' : ''}`).join('\n');
  if (arg === 'phases') return PHASES.map(p => `Phase ${String(p.id).padEnd(5)} ${p.name.padEnd(16)} seats: ${p.seats.join(', ') || '-'}${p.id === 1.25 ? '  [conditional]' : ''}\n  gates: ${p.gates.join(' | ')}`).join('\n\n');
  if (arg.startsWith('gate')) {
    const id = arg.split(/\s+/)[1];
    const p = PHASES.find(x => String(x.id) === id);
    return p ? `Phase ${p.id} ${p.name}${p.id === 1.25 ? ' [conditional]' : ''}\nSeats: ${p.seats.join(', ') || '-'}\nUser: ${p.user}\nGates:\n- ${p.gates.join('\n- ')}\nArtifacts:\n- ${(phaseArtifacts(p.id).join('\n- ') || 'none')}` : `Unknown phase. Valid: ${PHASES.map(x => x.id).join(', ')}`;
  }
  if (arg.startsWith('recon')) {
    const idea = arg.slice(5).trim();
    if (!idea) return 'Usage: /mvp-team recon <your product idea>. Or call mvp_team_recon_scope with the idea.';
    const text = idea.toLowerCase();
    const matched = RECON_CAPABILITIES.filter(c => c.match.some(k => text.includes(k)));
    if (!matched.length) return `No reverse-engineering trigger in "${idea}". Do not seat the recon role.`;
    return `Recommended: seat mvp-role-recon (Phase 1R, conditional).\nMatched capabilities:\n${matched.map(c => `- ${c.key}: ${c.tools}\n  prerequisites: ${c.requires}`).join('\n')}\nAuthorization is mandatory; probe actual host tools; degrade without REA. See skill mvp-team-recon.`;
  }
  if (arg === 'status') return 'MVP Dev Expert Team plugin is installed. Load skill `mvp-team-workflow` for the authoritative SOP; use mvp_team_catalog for the directory and mvp_team_recon_scope for conditional reverse-engineering scope.';
  return [
    `MVP 开发专家团 / MVP Dev Expert Team (DSH port, ${ROLES.length} roles)`,
    '',
    'Entry: select the "MVP 开发专家团" agent preset in a new session, or load the skill `mvp-team-workflow`.',
    'Commands: /mvp-team brief | roles | phases | gate <phase> | recon <idea> | status',
    '',
    `Roles (${ROLES.length - 1} standard + 1 conditional): ${ROLES.map(r => r.id).join(', ')}`,
    `Topics (${TOPICS.length}): ${TOPICS.map(t => t.name).join(', ')}`,
    `Phases: ${PHASES.map(p => p.id).join(' -> ')}  (1.25 = conditional reverse engineering)`,
    '',
    'All deliverables are written to disk relative to the current project root; docs/SPEC.md is locked at Phase 1.5. No install path, profile path or host tool is assumed. The workflow contract resolves upstream contradictions; do not follow the upstream SOP when it conflicts with the contract.',
  ].join('\n');
}
