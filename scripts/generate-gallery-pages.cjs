const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const origin = 'https://www.crmo.co.il';
const context = {window: {}, location: {pathname: '/', href: origin + '/', origin}, history: {replaceState() {}}, URL};
vm.runInNewContext(fs.readFileSync(path.join(root, 'public/gallery-routes.js'), 'utf8'), context);

const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const {entries, aliases} = context.window.CRMO_ROUTES;
const labels = new Map(entries.map(([slug, , label]) => [slug, label]));
const head = /<!-- portfolio-meta -->[\s\S]*?<!-- \/portfolio-meta -->/;
const intro = /<!-- portfolio-intro -->[\s\S]*?<!-- \/portfolio-intro -->/;
if (!head.test(template) || !intro.test(template)) throw Error('Missing editorial markers on the home page.');
function escape(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

for (const slug of [...labels.keys(), ...Object.keys(aliases)]) {
  const canonical = aliases[slug] || slug;
  const file = path.join(root, canonical, 'index.html');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  // Keep the canonical page's edited copy while updating the shared application shell.
  const label = escape(labels.get(canonical));
  const newHead = existing.match(head)?.[0] || [
    '<!-- portfolio-meta -->',
    '<title>' + label + ' | קריאייטיב מונסטר</title>',
    '<link rel="canonical" href="' + origin + '/' + canonical + '/">',
    '<meta name="robots" content="noindex,follow">',
    '<!-- /portfolio-meta -->',
  ].join('\n');
  const newIntro = existing.match(intro)?.[0] ||
    '<!-- portfolio-intro --><section id="crmo-loading"><h1>' + label + '</h1></section><!-- /portfolio-intro -->';
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'index.html'), template.replace(head, () => newHead).replace(intro, () => newIntro));
}
console.log('Generated ' + entries.length + ' standalone route pages.');
