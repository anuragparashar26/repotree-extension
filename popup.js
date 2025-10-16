const CONFIG = {
  SITE_URL: 'https://repotree.anuragparashar.tech',
  API_BASE: 'https://api.github.com',
};

const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const successEl = document.getElementById('success');
const actionsEl = document.getElementById('actions');
const copyBtn = document.getElementById('copyBtn');
const openBtn = document.getElementById('openBtn');
const repoInfoEl = document.getElementById('repoInfo');
const repoNameEl = document.getElementById('repoName');
const repoUrlEl = document.getElementById('repoUrl');
const previewEl = document.getElementById('preview');
const previewContentEl = document.getElementById('previewContent');

let currentRepo = null;
let currentTree = '';

document.addEventListener('DOMContentLoaded', () => {
  initializeExtension();
});

async function initializeExtension() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!isGitHubRepoPage(tab.url)) {
      showError('This extension only works on GitHub repository pages.');
      disableActions();
      return;
    }

    const repoInfo = extractRepoInfo(tab.url);
    if (!repoInfo) {
      showError('Could not extract repository information from this page.');
      disableActions();
      return;
    }

    currentRepo = repoInfo;
    updateRepoInfo();
    
    await generateTree();
  } catch (error) {
    showError(`Error initializing extension: ${error.message}`);
    disableActions();
  }
}

function isGitHubRepoPage(url) {
  const repoPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+(?:\/|$)/;
  return repoPattern.test(url);
}

function extractRepoInfo(url) {
  const match = url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      url: `https://github.com/${match[1]}/${match[2]}`,
    };
  }
  return null;
}

function updateRepoInfo() {
  if (!currentRepo) return;
  
  repoNameEl.textContent = `${currentRepo.owner}/${currentRepo.repo}`;
  repoUrlEl.textContent = currentRepo.url;
  repoInfoEl.classList.remove('hidden');
}

async function generateTree() {
  showLoading(true);
  clearError();
  clearSuccess();

  try {
    const structure = await fetchRepoStructure(currentRepo.owner, currentRepo.repo);
    currentTree = generateMarkdownTree(structure, currentRepo.repo);
    
    showLoading(false);
    enableActions();
    showPreview();
  } catch (error) {
    showLoading(false);
    showError(`Failed to generate tree: ${error.message}`);
    disableActions();
  }
}

async function fetchRepoStructure(owner, repo, path = '') {
  const url = `${CONFIG.API_BASE}/repos/${owner}/${repo}/contents/${path}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'GitHub-Repo-Tree-Extension',
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else if (response.status === 404) {
        throw new Error('Repository not found.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    const nodes = [];
    for (const item of data) {
      const node = { path: item.path, type: item.type };
      
      if (item.type === 'dir') {
        try {
          node.children = await fetchRepoStructure(owner, repo, item.path);
        } catch (err) {
          console.warn(`Failed to fetch subdirectory ${item.path}: ${err.message}`);
          node.children = [];
        }
      }
      
      nodes.push(node);
    }
    
    return nodes;
  } catch (error) {
    throw error;
  }
}

function generateMarkdownTree(nodes, repoName, indentLevel = 0, prefix = '') {
  let result = '';
  
  if (indentLevel === 0) {
    result += `${repoName}/\n`;
  }
  
  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const name = node.path.split('/').pop();
    const connector = isLast ? '└── ' : '├── ';
    
    result += `${prefix}${connector}${name}${node.type === 'dir' ? '/' : ''}\n`;
    
    if (node.children && node.children.length > 0) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      result += generateMarkdownTree(node.children, repoName, indentLevel + 1, childPrefix);
    }
  });
  
  return result;
}

function showPreview() {
  if (!currentTree) return;
  
  const lines = currentTree.split('\n').slice(0, 10).join('\n');
  previewContentEl.textContent = lines + (currentTree.split('\n').length > 10 ? '\n...' : '');
  previewEl.classList.remove('hidden');
}

function showLoading(show) {
  if (show) {
    loadingEl.classList.remove('hidden');
  } else {
    loadingEl.classList.add('hidden');
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

function clearError() {
  errorEl.classList.add('hidden');
}

function showSuccess(message) {
  successEl.textContent = message;
  successEl.classList.remove('hidden');
  setTimeout(() => clearSuccess(), 2000);
}

function clearSuccess() {
  successEl.classList.add('hidden');
}

function enableActions() {
  copyBtn.disabled = false;
  openBtn.disabled = false;
}

function disableActions() {
  copyBtn.disabled = true;
  openBtn.disabled = true;
}

copyBtn.addEventListener('click', () => {
  if (!currentTree) return;
  
  navigator.clipboard.writeText(currentTree).then(() => {
    showSuccess('✓ Tree copied to clipboard!');
  }).catch(() => {
    showError('Failed to copy to clipboard');
  });
});

openBtn.addEventListener('click', () => {
  if (!currentRepo) return;
  
  const params = new URLSearchParams({
    owner: currentRepo.owner,
    repo: currentRepo.repo,
  });
  
  const generatorUrl = `${CONFIG.SITE_URL}?${params.toString()}`;
  chrome.tabs.create({ url: generatorUrl });
});
