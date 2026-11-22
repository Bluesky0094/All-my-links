# Stefano Caccamo’s web workspace

This guide covers five sibling Git repositories. `All my links` is Stefano’s public hub. It links to his creative portfolio, his technology assistance service, and two demonstration sites, Cantiere 24 and Nord Legnami.

## Working across sites

- Start in the repository that owns the page or interaction. Check its `git status --short` before editing so existing work stays intact. Run commands from that repository’s root.
- Read the local guidance named below. It takes precedence for that site. Keep each site's visual identity, audience, language, and contact details when moving between repositories.
- Use relative URLs for pages and assets within a site, including from nested pages. Between sites, use the destination’s public URL. Local sibling-directory paths break when the repositories are published separately.
- When a public route or project name changes, check the references on both `All my links/index.html` and `All my links/profilo.html`. Use the existing profile and project sources for factual claims about Stefano’s work.
- The sites run on static HTML, CSS, and JavaScript. For a local HTTP preview, run `python3 -m http.server 8000 --bind 127.0.0.1` in the site root and open `http://127.0.0.1:8000/`. For UI changes, exercise the affected flow at phone and desktop widths, check keyboard operation, and inspect the browser console and failed asset requests.

## All my links · professional hub

Edit the root HTML and `static/`. The landing page uses `static/home.css` and `static/home.js`, with paper-scene controls and a static image fallback. The full profile uses `static/styles.css` and `static/script.js`. Check the landing-to-profile link after navigation changes, reduced motion and the image fallback after scene changes, and print preview after profile layout changes.

GitHub Pages serves the root files. Sites uses the copy in `dist/`. After changing publishable files, run `python3 scripts/package_static.py`. It replaces the entire output directory. If you add a root page, include it in the script’s page list.

## Portfolio · creative work

Read `project/codex-instruction/AGENTS.md` for the design brief. The root `index.html` features selected work. `src/pages/index.html` is the work index. Case studies live in `src/pages/projects/`, with project data in `src/assets/js/projects-data.js` and web-ready images in `src/assets/img/optimized/`. When changing a featured project, follow its link from the homepage and the work index and verify the case study’s text and images.

## Assistenza-tecnologica · technology assistance

Read the root `AGENTS.md` for service scope, contact channels, and the bilingual editing workflow. The Italian and English Markdown in `content/` is the source for service and about copy. Carry wording changes through to the relevant HTML and both language dictionaries. Check the affected page in both languages, including its WhatsApp message when relevant. Run the repository’s CI check locally with `bash scripts/check-conflict-markers.sh`.

## Ferramenta · Cantiere 24

`assets/js/products.js` defines the catalogue. `assets/js/main.js` uses product IDs to carry comparisons and quote selections across pages. Keep IDs stable when editing a model. For catalogue changes, select items on `products.html`, compare up to three models, open `quote.html`, and reload to verify the list and indicative total. The quote form opens an email draft to Stefano. Keep its demonstration disclosure visible.

## Legno · Nord Legnami

Read `AGENT.md` for routing, shared components, and Italian trade copy. Edit `components/header.html`, `components/footer.html`, or `data/content.json` for shared content. Then run `python3 scripts/package_content.py` and include the generated `assets/js/site-content.js`. Verify it with `python3 scripts/package_content.py --check`. After routing or catalogue changes, open the homepage and a nested page under `pages/` directly from disk as well as over HTTP. Both modes should load the navigation and material data.
