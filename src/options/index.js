const tokenInput = document.getElementById('token');
const saveBtn = document.getElementById('save');
const testBtn = document.getElementById('test');
const clearBtn = document.getElementById('clear');
const statusEl = document.getElementById('status');

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = 'status ' + (isError ? 'error' : 'success');
  statusEl.style.display = 'block';
}

async function loadToken() {
  const { githubToken } = await chrome.storage.local.get('githubToken');
  if (githubToken) {
    tokenInput.value = githubToken;
  }
}

saveBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    showStatus('トークンを入力してください。', true);
    return;
  }
  await chrome.storage.local.set({ githubToken: token });
  showStatus('保存しました。');
});

testBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    showStatus('トークンを入力してからテストしてください。', true);
    return;
  }
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const user = await res.json();
    showStatus(`接続成功: ${user.login}`);
  } catch (e) {
    showStatus(`接続失敗: ${e.message}`, true);
  }
});

clearBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove('githubToken');
  tokenInput.value = '';
  showStatus('トークンを削除しました。');
});

loadToken();
