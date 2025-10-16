console.log('GitHub Repo Tree Generator extension loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractRepoInfo') {
    const repoInfo = extractCurrentRepoInfo();
    sendResponse(repoInfo);
  }
});

function extractCurrentRepoInfo() {
  const pathMatch = window.location.pathname.match(/^\/([^\/]+)\/([^\/]+)/);
  
  if (pathMatch) {
    return {
      owner: pathMatch[1],
      repo: pathMatch[2],
      url: window.location.href,
    };
  }
  
  return null;
}
