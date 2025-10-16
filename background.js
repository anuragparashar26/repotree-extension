chrome.runtime.onInstalled.addListener(() => {
  console.log('GitHub Repo Tree Generator extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRepoInfo') {
    sendResponse({ success: true });
  }
});
