const INCLUDE_PATTERN = /^link:([^\[]+\.(?:mmd|mermaid))\[role=include\]\s*$/;
const PROCESSED_ATTR = 'data-mermaid-processed';

let renderIframe = null;
let renderResolvers = new Map();
let renderReady = false;

function getRenderIframe() {
  if (renderIframe && renderIframe.contentWindow) return renderIframe;
  renderIframe = document.createElement('iframe');
  renderIframe.src = chrome.runtime.getURL('src/renderer/index.html');
  renderIframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
  document.documentElement.appendChild(renderIframe);
  if (!window.__mermaidMessageListener) {
    window.__mermaidMessageListener = true;
    window.addEventListener('message', (e) => {
    const { type, id, svg, error } = e.data || {};
    if (type === 'mermaid-ready') renderReady = true;
    if (type === 'mermaid-svg' && renderResolvers.has(id)) {
      renderResolvers.get(id).resolve(svg);
      renderResolvers.delete(id);
    } else if (type === 'mermaid-error' && renderResolvers.has(id)) {
      renderResolvers.get(id).reject(new Error(error));
      renderResolvers.delete(id);
    }
  });
  }
  return renderIframe;
}

function renderMermaid(code) {
  const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const iframe = getRenderIframe();
  return new Promise((resolve, reject) => {
    renderResolvers.set(id, { resolve, reject });
    const send = () => {
      if (renderReady && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'mermaid-render', id, code }, '*');
      } else {
        setTimeout(send, 50);
      }
    };
    send();
    setTimeout(() => {
      if (renderResolvers.has(id)) {
        renderResolvers.delete(id);
        reject(new Error('Mermaid render timeout'));
      }
    }, 30000);
  });
}

function getRepoContext() {
  const rawLink = document.querySelector('a[href*="raw.githubusercontent.com"], a[href*="/raw/"]');
  if (rawLink) {
    const href = rawLink.href;
    const rawMatch = href.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/(.+)/);
    if (rawMatch) {
      const rest = rawMatch[3];
      const parts = rest.split('/');
      let ref, currentFilePath;
      if (parts[0] === 'refs' && parts[1] === 'heads') {
        ref = parts[2];
        currentFilePath = parts.slice(3).join('/');
      } else {
        ref = parts[0];
        currentFilePath = parts.slice(1).join('/');
      }
      return { owner: rawMatch[1], repo: rawMatch[2], ref, currentFilePath };
    }
    const githubRawMatch = href.match(/github\.com\/([^/]+)\/([^/]+)\/raw\/(.+)/);
    if (githubRawMatch) {
      const rest = githubRawMatch[3];
      const parts = rest.split('/');
      let ref, currentFilePath;
      if (parts[0] === 'refs' && parts[1] === 'heads') {
        ref = parts[2];
        currentFilePath = parts.slice(3).join('/');
      } else {
        ref = parts[0];
        currentFilePath = parts.slice(1).join('/');
      }
      return { owner: githubRawMatch[1], repo: githubRawMatch[2], ref, currentFilePath };
    }
  }

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length < 5 || pathParts[2] !== 'blob') {
    return null;
  }
  const [owner, repo, , ...afterBlob] = pathParts;
  let ref;
  let currentFilePath;
  if (afterBlob[0] === 'refs' && afterBlob[1] === 'heads') {
    ref = afterBlob[2];
    currentFilePath = afterBlob.slice(3).join('/');
  } else {
    ref = afterBlob[0];
    currentFilePath = afterBlob.slice(1).join('/');
  }
  return { owner, repo, ref, currentFilePath };
}

function resolvePath(relativePath, currentFilePath) {
  const dir = currentFilePath.includes('/') ? currentFilePath.replace(/\/[^/]+$/, '') : '';
  const baseUrl = `https://x/y/${dir}/`;
  try {
    const resolved = new URL(relativePath, baseUrl).pathname;
    return resolved.replace(/^\/y\/?/, '').replace(/^\//, '');
  } catch {
    return relativePath;
  }
}

async function fetchFromGitHub(owner, repo, ref, filePath, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${encodeURIComponent(ref)}`;
  const headers = {
    Accept: 'application/vnd.github.v3.raw',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  }
  return res.text();
}

async function processElement(preEl, repoContext, token) {
  const text = preEl.textContent?.trim() ?? '';
  const match = text.match(INCLUDE_PATTERN);
  if (!match) return false;

  const relativePath = match[1].trim();
  const resolvedPath = resolvePath(relativePath, repoContext.currentFilePath);

  const placeholder = document.createElement('div');
  placeholder.className = 'mermaid-preview-placeholder';
  placeholder.style.cssText = 'padding:1em;background:#f6f8fa;border-radius:6px;color:#57606a;';
  placeholder.textContent = 'Loading Mermaid diagram...';
  preEl.replaceWith(placeholder);

  try {
    const mermaidCode = await fetchFromGitHub(
      repoContext.owner,
      repoContext.repo,
      repoContext.ref,
      resolvedPath,
      token
    );

    const svg = await renderMermaid(mermaidCode);
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid-preview-rendered';
    wrapper.style.cssText = 'margin:1em 0;overflow:auto;';
    wrapper.innerHTML = svg;
    placeholder.replaceWith(wrapper);
  } catch (err) {
    placeholder.style.background = '#fff1f0';
    placeholder.style.color = '#cf1322';
    placeholder.textContent = `Mermaid error: ${err.message}`;
  }
  return true;
}

async function processDocument() {
  const repoContext = getRepoContext();
  if (!repoContext) return;

  const token = (await chrome.storage.local.get('githubToken')).githubToken || null;

  const pres = document.querySelectorAll('div[dir="auto"] pre, pre');
  for (const pre of pres) {
    if (pre.hasAttribute(PROCESSED_ATTR)) continue;
    const text = pre.textContent?.trim() ?? '';
    if (INCLUDE_PATTERN.test(text)) {
      pre.setAttribute(PROCESSED_ATTR, 'true');
      await processElement(pre, repoContext, token);
    }
  }
}

function init() {
  processDocument();

  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    for (const m of mutations) {
      if (m.addedNodes.length) {
        shouldProcess = true;
        break;
      }
    }
    if (shouldProcess) {
      processDocument();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
