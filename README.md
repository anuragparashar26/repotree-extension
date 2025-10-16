# GitHub Repo Tree Generator Extension

Instantly generate and copy GitHub repository trees directly from any GitHub repository page, or open them in the full [github-repo-tree generator](https://repotree.anuragparashar.tech) web app.

## 🌟 Features

- 🌲 One-click generation of markdown-formatted repo trees
- 📋 Copy tree to clipboard instantly
- 🔗 Open the current repo in the full generator site
- 🦾 Works directly on GitHub repository pages
- 🛡️ Uses GitHub API for accurate results

## 🚀 Installation

1. Download or clone this repository.
```
git clone https://github.com/anuragparashar26/repotree-extension.git
```
2. Go to `chrome://extensions` (or your browser's extensions page).
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the `repotree-extension` folder.

## 🖥️ Usage

1. Navigate to any GitHub repository page.
2. Click the Repo Tree extension icon in your browser toolbar.
3. Use the popup to generate and copy the repo tree, or open it in the full generator site.

## 📦 Files

- `background.js`: Handles extension install and messaging
- `content.js`: Extracts repo info from GitHub pages
- `popup.html`, `popup.js`, `popup.css`: Extension popup UI and logic
- `manifest.json`: Chrome extension manifest (v3)
- `icons/`: Extension icons

## 🛠️ Development

Edit the files in this folder and reload the extension in your browser for changes to take effect.

## 🤝 Contributing

Pull requests and suggestions are welcome! For major changes, please open an issue first to discuss what you would like to change.
