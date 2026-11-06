window.__ModuleLoader__.load({
  id: 'dsh-mvp-xiaohutem',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const phases = [
      { id: '0', zh: '需求澄清', seats: [], gates: ['一轮提问 → 3 句话', '评估快速路径'], user: '被问 1 次' },
      { id: '1', zh: '并行调研', seats: ['pm', 'architect', 'designer'], gates: ['docs/PRD.md', 'docs/ARCHITECTURE.md', 'docs/UIUX.md', '一致性检查'], user: '唯一交互点：确认三文档' },
      { id: '1R', zh: '逆向分析（按需）', seats: ['recon'], conditional: true, gates: ['授权确认（无授权即拒绝）', 'docs/recon/PLAN.md 定级', 'docs/recon/REPORT.md 带 A/B/C 证据', '仅 A 级结论可进 Spec', '不假设 REA 已安装'], user: '仅授权确认' },
      { id: '1.5', zh: 'Spec 锁定', seats: [], gates: ['13 章 docs/SPEC.md 落盘', '锁定图标库', 'OPEN-DECISIONS / DECISION-LOG'], user: '无' },
      { id: '2', zh: '设计与测试设计', seats: ['architect', 'designer', 'qa'], gates: ['openapi.yaml（硬闸门）', 'design-tokens.json（硬闸门）', 'DESIGN.md 9 节', 'QA 写测试'], user: '仅进度' },
      { id: '3', zh: '并行开发', seats: ['frontend', 'backend'], gates: ['lint/type-check/test ≤3 轮', 'emoji 扫描', '代码组织门禁'], user: '仅进度' },
      { id: '4', zh: '测试与交付', seats: ['qa', 'devops'], gates: ['QA → DevOps 串行', 'P0=0', 'delivery/ 7 文件'], user: '交付通知' },
    ];

    const zh = {
      title: 'MVP 开发专家团', badge: 'DSH bundle 1.1.0',
      open: '展开', close: '收起', seats: '席位', gates: '门禁', user: '用户节点', none: '无',
      hint: '选一个阶段查看席位、门禁与用户交互点。P1R 是按需席位。完整 SOP 见 skill mvp-team-workflow。',
      hard: '硬闸门', auto: '自动推进', conditional: '按需席位',
      reconHint: '逆向席位需授权与证据分级；不假设 REA 或任何工具已安装。',
    };
    const en = {
      title: 'MVP Dev Expert Team', badge: 'DSH bundle 1.1.0',
      open: 'Expand', close: 'Collapse', seats: 'Seats', gates: 'Gates', user: 'User', none: 'none',
      hint: 'Pick a phase to see seats, gates and the user interaction point. P1R is conditional. Full SOP: skill mvp-team-workflow.',
      hard: 'Hard gate', auto: 'Auto-advance', conditional: 'Conditional seat',
      reconHint: 'The recon seat requires authorization and evidence grading; no REA or third-party tool is assumed.',
    };

    // Inline styles keep this plugin independent of the host stylesheet API and
    // avoid any global CSS side effect. Theme tokens are used where available.
    const s = {
      dock: { boxSizing: 'border-box', width: '100%', padding: '10px 12px', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', fontSize: 12, lineHeight: 1.5 },
      head: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
      title: { fontWeight: 600, fontSize: 13 },
      badge: { padding: '1px 7px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-secondary)', fontSize: 11 },
      toggle: { marginLeft: 'auto', padding: '3px 10px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-label-primary)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' },
      row: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 },
      phase: { flex: '1 1 92px', minWidth: 92, padding: '7px 8px', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 6, background: 'var(--dsw-alias-bg-base)', cursor: 'pointer', textAlign: 'left', color: 'var(--dsw-alias-label-primary)', fontFamily: 'inherit', fontSize: 11 },
      phaseActive: { borderColor: 'var(--dsw-alias-brand-primary)' },
      b: { display: 'block', fontSize: 12, fontWeight: 600 },
      span: { color: 'var(--dsw-alias-label-secondary)' },
      detail: { marginTop: 10, paddingTop: 9, borderTop: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-secondary)' },
      ul: { margin: '6px 0 0', paddingLeft: 18 },
      note: { marginTop: 8, color: 'var(--dsw-alias-label-secondary)', fontSize: 11 },
      warn: { color: 'var(--dsw-alias-state-warn-primary)' },
    };

    function Board() {
      const [expanded, setExpanded] = React.useState(false);
      const [active, setActive] = React.useState('1');
      const phase = phases.find(p => p.id === active) || phases[1];
      // Language detection has no Cordis dependency: it degrades to Chinese.
      let dict = zh;
      try {
        const lang = typeof navigator !== 'undefined' ? String(navigator.language || '') : '';
        if (lang && !lang.toLowerCase().startsWith('zh')) dict = en;
      } catch (_) { /* keep the default dictionary */ }
      const isHard = phase.id === '2';

      return h('div', { style: s.dock, role: 'region', 'aria-label': dict.title },
        h('div', { style: s.head },
          h('span', { style: s.title }, dict.title),
          h('span', { style: s.badge }, dict.badge),
          h('button', { type: 'button', style: s.toggle, 'aria-expanded': expanded, onClick: () => setExpanded(v => !v) }, expanded ? dict.close : dict.open),
        ),
        h('div', { style: s.row },
          ...phases.map(p => h('button', {
            type: 'button', key: p.id,
            style: p.id === active ? { ...s.phase, ...s.phaseActive } : s.phase,
            onClick: () => { setActive(p.id); setExpanded(true); },
          },
            h('b', { style: s.b }, `P${p.id} ${p.zh}${p.conditional ? ' *' : ''}`),
            h('span', { style: s.span }, p.seats.length ? `${p.seats.length} seats` : dict.auto),
          )),
        ),
        expanded ? h('div', { style: s.detail },
          h('div', null, `${dict.seats}: ${phase.seats.length ? phase.seats.map(x => `mvp-role-${x}`).join(', ') : dict.none}`),
          h('div', null, `${dict.gates}:`),
          h('ul', { style: s.ul }, ...phase.gates.map(g => h('li', {
            key: g,
            style: isHard && (g.includes('openapi') || g.includes('design-tokens')) ? s.warn : undefined,
          }, g))),
          h('div', { style: s.note }, `${dict.user}: ${phase.user}`),
          phase.conditional ? h('div', { style: { ...s.note, ...s.warn } }, `${dict.conditional}: ${dict.reconHint}`) : null,
          h('div', { style: s.note }, dict.hint),
          isHard ? h('div', { style: { ...s.note, ...s.warn } }, `${dict.hard}: docs/api/openapi.yaml + design-system/design-tokens.json`) : null,
        ) : null,
      );
    }

    return {
      inject: ['slots'],
      apply(clientCtx) {
        return clientCtx.slots.inject('conversation.composer.dock', () =>
          clientCtx.slots.register({
            name: 'conversation.composer.dock',
            id: 'mvp-team-phase-board',
            order: 20,
            label: 'MVP Dev Expert Team phases',
          }, Board));
      },
    };
  },
});
