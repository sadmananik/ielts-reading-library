# Publish on GitHub Pages

1. Create a public GitHub repository named `ielts-reading`.
2. Upload the contents of this folder into the repository root. `index.html`, `app.js`, `data.js`, `style.css`, `theme.js`, `highlights.js`, all `source-NNN.html` pages, and `assets/` must keep their relative paths.
3. Open repository Settings → Pages. Choose Deploy from a branch, select main and /(root), then Save.
4. Open the URL GitHub displays, normally https://YOUR-USERNAME.github.io/ielts-reading/.

The .nojekyll file makes GitHub serve this as a plain static site. No server, dependency installation or build is required. Only publish this Reading folder, not the surrounding career and migration workspace.

The website and the public repository content are visible to everyone. Attempt summaries and one unfinished test draft remain in each browser’s local storage; they do not sync across devices. Existing file-based progress does not automatically transfer to the hosted URL.

Updating the files on main updates the site.
