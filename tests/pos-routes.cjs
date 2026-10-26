const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'public/viewer.js'), 'utf8');
const blueprint = code.match(/const POS_GALLERY_BLUEPRINTS = Object.freeze\(\[[\s\S]*?\n  \]\);/)[0];
const route = code.slice(code.indexOf('function getDedicatedRoute()'), code.indexOf('function getExpandedRequestedManagerId()'));
const slugs = ['all-works','shop-in-shop','floor-stands','counter-displays','shelf-talkers','sampling-carts','product-platforms','custom-solutions'];
for (const prefix of ['', '/crmo-smart']) {
  for (const slug of slugs) {
    const pathname = prefix + (slug === 'all-works' ? '/pos/' : `/pos/${slug}/`);
    const context = {window: {location: {protocol: 'https:', pathname}}, galleries: [], SUPER_GALLERY_ID: 'pos'};
    vm.createContext(context);
    vm.runInContext(blueprint + route + '\nresult=getDedicatedRoute();', context);
    assert.equal(context.result.managerId, 'pos');
    assert.equal(context.result.posCategory, slug);
    const relative = slug === 'all-works' ? 'pos/index.html' : `pos/${slug}/index.html`;
    const html = fs.readFileSync(path.join(root, relative), 'utf8');
    const base = html.match(/<base href="([^"]+)"/)[1];
    const resource = new URL('public/viewer.js', new URL(base, 'https://www.crmo.co.il' + pathname));
    assert.equal(resource.pathname, prefix + '/public/viewer.js');
    assert.match(html, /<main class="stage">/);
  }
}
const context = {window: {location: {protocol: 'https:', pathname: '/pos/not-a-category/'}}, galleries: [], SUPER_GALLERY_ID: 'pos'};
vm.createContext(context);
vm.runInContext(blueprint + route + '\nresult=getDedicatedRoute();', context);
assert.equal(context.result, null);
assert.match(code, /document.createElement\('a'\)/);
assert.match(code, /btn.href = destination.href/);
console.log('Passed: 16 category/root cases, matching static entry files and asset roots, invalid category rejection, real navigation links.');

