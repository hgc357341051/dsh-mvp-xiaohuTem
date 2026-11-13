window.__ModuleLoader__.load({
  id: 'dsh-mvp-xiaohutem',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // Manual compaction button in the composer tool row. Clicking runs the
    // host's /compact command through the commands Remote surface; the result
    // text is shown in a small transient line under the button. The button is
    // a thin trigger over the host command: no compaction logic lives here.
    function CompactButton() {
      const [state, setState] = React.useState({ phase: 'idle', message: '' });

      const run = async () => {
        if (state.phase === 'running') return;
        setState({ phase: 'running', message: '' });
        try {
          const remote = (typeof ctx !== 'undefined' && ctx.remote) ? ctx.remote : undefined;
          if (!remote || !remote.commands) throw new Error('commands remote unavailable');
          const result = await remote.commands.execute('/compact');
          const text = result && typeof result.text === 'string' ? result.text
            : (result === undefined || result === null) ? '已触发压缩。' : JSON.stringify(result);
          setState({ phase: 'done', message: text });
        } catch (error) {
          setState({ phase: 'error', message: String(error && error.message || error) });
        }
      };

      const label = state.phase === 'running' ? '压缩中…' : '压缩上下文';
      return h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } },
        h('button', {
          type: 'button',
          title: '手动压缩会话上下文（等价 /compact）',
          'aria-label': '手动压缩会话上下文',
          disabled: state.phase === 'running',
          onClick: run,
          style: {
            padding: '3px 10px',
            border: '1px solid var(--dsw-alias-border-l2)',
            borderRadius: 6,
            background: 'var(--dsw-alias-bg-base)',
            color: 'var(--dsw-alias-label-primary)',
            fontSize: 11,
            fontFamily: 'inherit',
            cursor: state.phase === 'running' ? 'default' : 'pointer',
            opacity: state.phase === 'running' ? 0.7 : 1,
          },
        }, label),
        state.message ? h('span', {
          style: {
            fontSize: 10,
            color: state.phase === 'error'
              ? 'var(--dsw-alias-state-error-primary)'
              : 'var(--dsw-alias-label-secondary)',
            maxWidth: 420,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
          title: state.message,
        }, state.message) : null,
      );
    }

    return {
      inject: ['slots'],
      apply(clientCtx) {
        return clientCtx.slots.inject('conversation.input.left', () =>
          clientCtx.slots.register({
            name: 'conversation.input.left',
            id: 'mvp-team-compact-button',
            order: 40,
            label: '手动压缩上下文',
          }, CompactButton));
      },
    };
  },
});
