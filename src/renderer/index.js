import mermaid from 'mermaid';

window.parent.postMessage({ type: 'mermaid-ready' }, '*');

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'default',
});

window.addEventListener('message', async (event) => {
  if (event.source !== window.parent) return;
  const { type, id, code } = event.data || {};
  if (type !== 'mermaid-render' || !id || !code) return;
  try {
    const { svg } = await mermaid.render(id, code);
    window.parent.postMessage({ type: 'mermaid-svg', id, svg }, '*');
  } catch (err) {
    window.parent.postMessage({ type: 'mermaid-error', id, error: err.message }, '*');
  }
});
