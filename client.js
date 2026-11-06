window.__ModuleLoader__.load({
  id: 'dsh-mvp-xiaohutem',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    let hostCtx;

    const css = `
.mvp-team-dock {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  line-height: 1.5;
}
.mvp-team-dock * { box-sizing: border-box; }
.mvp-team-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mvp-team-title { font-weight: 600; font-size: 13px; }
.mvp-team-badge {
  padding: 1px 7px; border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.mvp-team-toggle {
  margin-left: auto; padding: 3px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  cursor: pointer; font-size: 11px; font-family: inherit;
}
.mvp-team-toggle:hover { border-color: var(--dsw-alias-brand-primary); }
.mvp-team-phases { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.mvp-team-phase {
  flex: 1 1 92px; min-width: 92px;
  padding: 7px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base);
  cursor: pointer; text-align: left;
  color: var(--dsw-alias-label-primary);
  font-family: inherit; font-size: 11px;
}
.mvp-team-phase[data-active="true"] { border-color: var(--dsw-alias-brand-primary); }
.mvp-team-phase b { display: block; font-size: 12px; font-weight: 600; }
.mvp-team-phase span { color: var(--dsw-alias-label-secondary); }
.mvp-team-detail {
  margin-top: 10px; padding-top: 9px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
}
.mvp-team-detail ul { margin: 6px 0 0; padding-left: 18px; }
.mvp-team-detail li { margin: 2px 0; }
.mvp-team-note { margin-top: 8px; color: var(--dsw-alias-label-secondary); font-size: 11px; }
.mvp-team-hard { color: var(--dsw-alias-state-warn-primary); }
.mvp-team-ok { color: var(--dsw-alias-state-success-primary); }
`;

    const phases = [
      { id: '0', zh: '需求澄清', en: 'Clarify', seats: [], gates: ['一轮提问 → 3 句话', '评估快速路径'], user: 'One clarification round' },
      { id: '0.5', zh: '知识库探测', en: 'Knowledge base', seats: [], gates: ['Optional MCP; skip if absent', '告知授权'], user: 'Authorization notice' },
      { id: '1', zh: '并行调研', en: 'Research', seats: ['pm', 'architect', 'designer'], gates: ['docs/PRD.md', 'docs/ARCHITECTURE.md', 'docs/UIUX.md', '一致性检查'], user: '唯一交互点：确认三文档' },
      { id: '1R', zh: '逆向分析（按需）', en: 'Recon (conditional)', seats: ['recon'], conditional: true, gates: ['授权确认（无授权即拒绝）', 'docs/recon/PLAN.md 定级', 'docs/recon/REPORT.md 带 A/B/C 证据', '仅 A 级结论可进 Spec', '不假设 REA 已安装'], user: '仅授权确认' },
      { id: '1.5', zh: 'Spec 锁定', en: 'Spec lock', seats: [], gates: ['13 章 docs/SPEC.md 落盘', '锁定图标库', 'OPEN-DECISIONS / DECISION-LOG'], user: 'None' },
      { id: '2', zh: '设计与测试设计', en: 'Design', seats: ['architect', 'designer', 'qa'], gates: ['openapi.yaml（硬闸门）', 'design-tokens.json（硬闸门）', 'DESIGN.md 9 节', 'QA 写测试'], user: 'Progress only' },
      { id: '3', zh: '并行开发', en: 'Build', seats: ['frontend', 'backend'], gates: ['lint/type-check/test ≤3 轮', 'emoji 扫描', '代码组织门禁'], user: 'Progress only' },
      { id: '4', zh: '测试与交付', en: 'Ship', seats: ['qa', 'devops'], gates: ['QA → DevOps 串行', 'P0=0', 'delivery/ 7 文件'], user: 'Delivery notice' },
    ];

    const zh = {
      title: 'MVP 开发专家团', badge: 'DSH bundle 1.1.0',
      open: '展开', close: '收起',
      hint: '选一个 Phase 查看席位、门禁与用户交互点。P1R 是按需席位：仅在涉及闭源目标/协议/互操作时安排。完整 SOP 见 skill `mvp-team-workflow`。',
      seats: '席位', gates: '门禁', user: '用户节点', none: '无',
      hard: '硬闸门', auto: '自动推进', confirm: '三文档确认是唯一正式交互点',
      conditional: '按需席位', reconHint: '逆向席位需授权与证据分级；不假设 REA 或任何工具已安装。',
    };
    const en = {
      title: 'MVP Dev Expert Team', badge: 'DSH bundle 1.1.0',
      open: 'Expand', close: 'Collapse',
      hint: 'Pick a phase to see seats, gates and the user interaction point. P1R is conditional: seat it only for a closed target, a protocol or interop. Full SOP: skill `mvp-team-workflow`.',
      seats: 'Seats', gates: 'Gates', user: 'User', none: 'none',
      hard: 'Hard gate', auto: 'Auto-advance', confirm: 'Three-document confirmation is the only formal interaction point',
      conditional: 'Conditional seat', reconHint: 'The recon seat requires authorization and evidence grading; no REA or third-party tool is assumed.',
    };

    function Board() {
      const [expanded, setExpanded] = React.useState(false);
      const [active, setActive] = React.useState('1');
      const [dict, setDict] = React.useState(zh);

      React.useEffect(() => {
        const locale = hostCtx && hostCtx.get ? hostCtx.get('locale') : undefined;
        if (!locale) return;
        const sync = () => {
          try {
            const snap = locale.getSnapshot ? locale.getSnapshot() : locale.getLocale();
            setDict(String(snap && (snap.id || snap.locale) || '').toLowerCase().startsWith('zh') ? zh : en);
          } catch { setDict(en); }
        };
        sync();
        const disposer = locale.subscribe ? locale.subscribe(sync) : undefined;
        return () => { if (typeof disposer === 'function') disposer(); };
      }, []);

      const phase = phases.find(p => p.id === active) || phases[2];
      const isHard = phase.id === '2';

      return h('div', { className: 'mvp-team-dock', role: 'region', 'aria-label': dict.title },
        h('div', { className: 'mvp-team-head' },
          h('span', { className: 'mvp-team-title' }, dict.title),
          h('span', { className: 'mvp-team-badge' }, dict.badge),
          h('span', { className: 'mvp-team-badge', 'data-tone': 'ok' }, dict.confirm),
          h('button', {
            type: 'button', className: 'mvp-team-toggle',
            'aria-expanded': expanded,
            onClick: () => setExpanded(v => !v),
          }, expanded ? dict.close : dict.open),
        ),
        h('div', { className: 'mvp-team-phases' },
          ...phases.map(p => h('button', {
            type: 'button', key: p.id, className: 'mvp-team-phase',
            'data-active': p.id === active,
            onClick: () => { setActive(p.id); setExpanded(true); },
          },
            h('b', null, `P${p.id} ${p.zh}${p.conditional ? ' *' : ''}`),
            h('span', null, p.seats.length ? `${p.seats.length} seats` : dict.auto),
          )),
        ),
        expanded ? h('div', { className: 'mvp-team-detail' },
          h('div', null, `${dict.seats}: ${phase.seats.length ? phase.seats.map(s => `mvp-role-${s}`).join(', ') : dict.none}`),
          h('div', null, `${dict.gates}:`),
          h('ul', null, ...phase.gates.map(g => h('li', {
            key: g,
            className: isHard && (g.includes('openapi') || g.includes('design-tokens')) ? 'mvp-team-hard' : undefined,
          }, g))),
          h('div', { className: 'mvp-team-note' }, `${dict.user}: ${phase.user}`),
          phase.conditional ? h('div', { className: 'mvp-team-note mvp-team-hard' }, `${dict.conditional}: ${dict.reconHint}`) : null,
          h('div', { className: 'mvp-team-note' }, dict.hint),
          isHard ? h('div', { className: 'mvp-team-note mvp-team-hard' }, `${dict.hard}: docs/api/openapi.yaml + design-system/design-tokens.json`) : null,
        ) : null,
      );
    }

    return {
      inject: ['slots'],
      apply(clientCtx) {
        hostCtx = clientCtx;
        const disposeStyles = styles.insert(css);
        const disposeSlot = clientCtx.slots.inject('conversation.composer.dock', () =>
          clientCtx.slots.register({
            name: 'conversation.composer.dock',
            id: 'mvp-team-phase-board',
            order: 20,
            label: 'MVP Dev Expert Team phases',
          }, Board));
        return () => { disposeSlot(); disposeStyles(); };
      },
    };
  },
});
