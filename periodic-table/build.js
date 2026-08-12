#!/usr/bin/env node
/*
  build.js — bundles periodic-table into a single self-contained HTML file
  at mobile/index.html. Run with: node build.js  (from periodic-table/)
*/
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'mobile');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const html   = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css    = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const i18nJs = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
const scienceJs = fs.readFileSync(path.join(ROOT, 'science.js'), 'utf8');
const sourcesJs = fs.readFileSync(path.join(ROOT, 'source-registry.js'), 'utf8');
const dataJs = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8');
const appJs  = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const brandCss = fs.readFileSync(path.join(ROOT, '..', 'assets', 'brand', 'brand.css'), 'utf8');
const brandSvg = fs.readFileSync(path.join(ROOT, '..', 'assets', 'brand', 'favicon.svg')).toString('base64');

function inlineMedia(source) {
  return source.replace(/\.\.\/assets\/media\/([A-Za-z0-9_.-]+)/g, (match, filename) => {
    const filePath = path.join(ROOT, '..', 'assets', 'media', filename);
    if (!fs.existsSync(filePath)) throw new Error(`Missing media asset: ${filename}`);
    const mime = path.extname(filename).toLowerCase() === '.jpg' ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
  });
}

function inlineFonts(source) {
  const fontDir = path.join(ROOT, '..', 'assets', 'fonts');
  const fontCss = fs.readFileSync(path.join(fontDir, 'fonts.css'), 'utf8')
    .replace(/url\("\.\/([^"]+)"\)/g, (match, file) => {
      const data = fs.readFileSync(path.join(fontDir, file)).toString('base64');
      return `url("data:font/woff2;base64,${data}")`;
    });
  return source.replace(
    /<link\s+rel="stylesheet"\s+href="\.\.\/assets\/fonts\/fonts\.css"\s*\/?>/,
    `<style>\n${fontCss}\n</style>`
  );
}

// Feature module sources (F1 overlays, D1 origins, B1 nuclide chart,
// F2 discovery timeline, C5 ligand-field colors)
const featCss   = fs.readFileSync(path.join(ROOT, 'features/features.css'), 'utf8');
const featI18n  = fs.readFileSync(path.join(ROOT, 'features/features-i18n.js'), 'utf8');
const featData  = fs.readFileSync(path.join(ROOT, 'features/features-data.js'), 'utf8');
const featOverlays = fs.readFileSync(path.join(ROOT, 'features/overlays.js'), 'utf8');
const featOrigins  = fs.readFileSync(path.join(ROOT, 'features/origins.js'), 'utf8');
const featNuclide  = fs.readFileSync(path.join(ROOT, 'features/nuclide.js'), 'utf8');
const featTimeline = fs.readFileSync(path.join(ROOT, 'features/timeline.js'), 'utf8');
const featLigand   = fs.readFileSync(path.join(ROOT, 'features/ligand.js'), 'utf8');

let out = html
  .replace(/<link\s+rel="stylesheet"\s+href="styles\.css"\s*\/?>/,     `<style>\n${css}\n${featCss}\n</style>`)
  .replace(/<link\s+rel="stylesheet"\s+href="features\/features\.css"\s*\/?>\s*/, '')
  .replace(/<link\s+rel="stylesheet"\s+href="\.\.\/assets\/brand\/brand\.css"\s*\/?>/, `<style>\n${brandCss}\n</style>`)
  .replace(/<link\s+rel="icon"\s+href="\.\.\/assets\/brand\/favicon\.svg"\s+type="image\/svg\+xml"\s*\/?>/, `<link rel="icon" href="data:image/svg+xml;base64,${brandSvg}" type="image/svg+xml">`)
  .replace(/<script\s+src="i18n\.js"><\/script>/, `<script>\n${i18nJs}\n</script>`)
  .replace(/<script\s+src="features\/features-i18n\.js"><\/script>/, `<script>\n${featI18n}\n</script>`)
  .replace(/<script\s+src="science\.js"><\/script>/, `<script>\n${scienceJs}\n</script>`)
  .replace(/<script\s+src="source-registry\.js"><\/script>/, `<script>\n${sourcesJs}\n</script>`)
  .replace(/<script\s+src="data\.js"><\/script>/, `<script>\n${dataJs}\n</script>`)
  .replace(/<script\s+src="features\/features-data\.js"><\/script>/, `<script>\n${featData}\n</script>`)
  .replace(/<script\s+src="app\.js"><\/script>/,  `<script>\n${appJs}\n</script>`)
  .replace(/<script\s+src="features\/overlays\.js"><\/script>/, `<script>\n${featOverlays}\n</script>`)
  .replace(/<script\s+src="features\/origins\.js"><\/script>/,  `<script>\n${featOrigins}\n</script>`)
  .replace(/<script\s+src="features\/nuclide\.js"><\/script>/,  `<script>\n${featNuclide}\n</script>`)
  .replace(/<script\s+src="features\/timeline\.js"><\/script>/, `<script>\n${featTimeline}\n</script>`)
  .replace(/<script\s+src="features\/ligand\.js"><\/script>/,   `<script>\n${featLigand}\n</script>`);
out = inlineMedia(out);
out = out.replace(/\.\.\/assets\/brand\/favicon\.svg/g, `data:image/svg+xml;base64,${brandSvg}`);
out = inlineFonts(out);
out = out.replace(/href="\.\.\/(?!https?:)/g, 'href="../../');

// Strip any remaining external CDN links so the file works fully offline.
out = out.replace(/<link\s+rel="preconnect"[^>]*>\s*/g, '');
out = out.replace(/<link\s+href="https:\/\/fonts\.googleapis\.com[^"]*"\s+rel="stylesheet"[^>]*>\s*/g, '');
out = out.replace(/<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>\s*/g, '');

const banner =
`<!--
  Periodic Table — SINGLE-FILE BUILD
  Generated by build.js from periodic-table source HTML/CSS/JavaScript modules
  Do NOT edit this file directly; edit the source files and re-run:
      node build.js
  Source: https://github.com/micwu-personal/Physics
-->
`;
out = out.replace(/^<!DOCTYPE html>/i, `<!DOCTYPE html>\n${banner}`);

const outPath1 = path.join(OUT_DIR, 'index.html');
const outPath2 = path.join(OUT_DIR, 'periodic-table.html');
fs.writeFileSync(outPath1, out);
fs.writeFileSync(outPath2, out);

const sizeKB = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
console.log(`✓ Wrote ${outPath1} (${sizeKB} KB)`);
console.log(`✓ Wrote ${outPath2} (${sizeKB} KB)`);
