document.getElementById('options').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

chrome.storage.local.get('githubToken', ({ githubToken }) => {
  document.getElementById('tokenStatus').textContent = githubToken
    ? 'トークン: 設定済み (プライベート対応)'
    : 'トークン: 未設定 (パブリックのみ)';
});
