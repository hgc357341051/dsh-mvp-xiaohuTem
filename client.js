window.__ModuleLoader__.load({
  id: 'dsh-mvp-xiaohutem',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // Manual compaction button in the composer tool row. Clicking runs the
    // host's /compact command through the commands Remote surface; the result
    // text is shown in a small transient line under the button. The button is
    // a thin trigger over the host command: no compaction logic lives here.
    // The ctx/host builtins are injected into apply(), not into component scope.
    // Capture the client context here so the button closure can use it.
    let capturedCtx = null;

    function CompactButton() {
      const [state, setState] = React.useState({ phase: 'idle', message: '' });

      const run = async () => {
        if (state.phase === 'running') return;
        setState({ phase: 'running', message: '' });
        try {
          const c = capturedCtx;
          const candidates = [];
          if (c && c.remote && c.remote.commands && typeof c.remote.commands.execute === 'function') {
            candidates.push(['ctx.remote.commands.execute', () => c.remote.commands.execute('/compact')]);
          }
          if (c && c.commands && typeof c.commands.execute === 'function') {
            candidates.push(['ctx.commands.execute', () => c.commands.execute('/compact')]);
          }
          if (c && c.remote && typeof c.remote.commands === 'function') {
            candidates.push(['ctx.remote.commands(fn)', () => c.remote.commands('/compact')]);
          }
          if (!candidates.length) {
            const shape = c ? `ctx keys: [${Object.keys(c).join(', ')}]`
              + (c.remote ? ` | remote keys: [${Object.keys(c.remote).join(', ')}]` : ' | no ctx.remote')
              : 'no client ctx captured';
            throw new Error(`no command surface found. ${shape}`);
          }
          let lastError = null;
          for (const [name, attempt] of candidates) {
            try {
              const result = await attempt();
              const text = result && typeof result.text === 'string' ? result.text
                : (result === undefined || result === null) ? '已触发压缩。' : JSON.stringify(result);
              setState({ phase: 'done', message: `${name}: ${text}` });
              return;
            } catch (error) {
              lastError = `${name}: ${String(error && error.message || error)}`;
            }
          }
          throw new Error(lastError || 'all attempts failed');
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
      inject: ['slots', 'remote', 'remote.commands'],
      apply(clientCtx) {
        capturedCtx = clientCtx;
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
