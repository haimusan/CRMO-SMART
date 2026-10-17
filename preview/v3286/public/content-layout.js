
(() => {
  'use strict';
  function isLocal() {
    return location.protocol === 'file:' || ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  }
  function base() {
    
    const conn = window.CRMOAuthBridge?.getConnection?.() || {};
    const url = conn.url || window.CRMO_CONFIG?.url;
    return url ? String(url).replace(/\/$/,'') + '/storage/v1/object/public/assets/' : (window.CRMO_PUBLIC_ASSET_BASE || 'assets/');
  }
  function resolve(value) {
    const source = String(value || '');
    if (!source || /^(data:|blob:)/.test(source)) return source;
    let path = source;
    const match = source.match(/\/storage\/v1\/object\/public\/assets\/(.*?)(?:[?#].*)?$/);
    if (match) path = match[1];
    else if (/^https?:/.test(source)) return source;
    path = path.replace(/^\.?\/?assets\//,'').replace(/^\//,'');
    path = path.replace(/^branding\//,'studio/');
    if (path === 'favicon.svg') path = 'studio/logo/favicon.svg';
    if (!path.startsWith('studio/')) return source;
    return base().replace(/\/?$/,'/') + path;
  }
  function refresh(node) {
    const elements = [];
    if (node?.matches?.('img[src],link[rel*="icon"][href]')) elements.push(node);
    node?.querySelectorAll?.('img[src],link[rel*="icon"][href]').forEach(el => elements.push(el));
    elements.forEach(el => {
      const attr = el.tagName === 'IMG' ? 'src' : 'href';
      const before = el.getAttribute(attr);
      const after = resolve(before);
      if (before !== after) el.setAttribute(attr, after);
    });
  }
  window.CRMOStudioAssets = Object.freeze({isLocal,base,resolve});
  const observer = new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes') refresh(record.target);
    else record.addedNodes.forEach(refresh);
  }));
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','href']});
  document.addEventListener('DOMContentLoaded',()=>refresh(document));
})();


(() => {
  'use strict';
  const pos = ['all-works','shop-in-shop','floor-stands','counter-displays','shelf-talkers','sampling-carts','product-platforms','custom-solutions'];
  const main = ['intro','intro-more','stores','branding','product-design','exhibitions','packaging','small-business'];
  const buckets = Object.freeze({ galleries: 'galleries', brands: 'our-brands', assets: 'assets', admin: 'admin' });
  const segment = (value, fallback = 'item') => String(value || '').trim().replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || fallback;
  function canonical(gallery) {
    const candidates = [gallery?.galleryId, gallery?.meta?.slug, gallery?.meta?.label].map(value => String(value || '').trim().toLowerCase());
    for (const id of candidates) {
      if (['our-brands','brands','brands-gallery'].includes(id)) return 'our-brands';
      if (/^pos-sub-[1-8]$/.test(id)) return id;
      const index = pos.indexOf(id.replace(/^pos\//, ''));
      if (index >= 0) return `pos-sub-${index + 1}`;
      if (main.includes(id)) return id;
    }
    return candidates[0] || 'gallery';
  }
  function tileKey(tile) {
    // Compare full project content within one gallery, never across categories.
    const copy = JSON.parse(JSON.stringify(tile || {}));
    delete copy.tileId;
    return JSON.stringify(copy);
  }
  function hasContent(tile) {
    return (tile?.media || []).some(media => media?.src) || !!(tile?.meta?.brand || tile?.meta?.client || tile?.overlay?.link) ||
      !!tile?.brandConfig?.attachedWorkRefs?.length ||
      (!!tile?.overlay?.title && tile.overlay.title !== 'שם הפרויקט') ||
      (!!tile?.overlay?.desc && !['תיאור קצר על הפרויקט','תיאור קצר של הפרויקט'].includes(tile.overlay.desc));
  }
  function prepare(raw) {
    const grouped = new Map();
    for (const gallery of raw || []) {
      if (!gallery) continue;
      const id = canonical(gallery);
      const copy = JSON.parse(JSON.stringify(gallery));
      copy.galleryId = id;
      if (/^pos-sub-[1-8]$/.test(id)) {
        const slug = pos[Number(id.slice(8)) - 1];
        copy.meta = {...copy.meta, slug, label: slug, galleryType: 'child', parentId: 'pos'};
      }
      if (!grouped.has(id)) { grouped.set(id, copy); continue; }
      const target = grouped.get(id);
      const existing = (target.tiles || []).filter(hasContent);
      const signatures = new Set(existing.map(tileKey));
      for (const tile of (copy.tiles || []).filter(hasContent)) {
        if (signatures.has(tileKey(tile))) continue;
        signatures.add(tileKey(tile));
        const next = JSON.parse(JSON.stringify(tile));
        if (existing.some(item => item.tileId === next.tileId)) next.tileId = `${id}-recovered-${existing.length + 1}`;
        existing.push(next);
      }
      if (!(target.tiles || []).some(hasContent) && (copy.tiles || []).some(hasContent)) target.meta = copy.meta;
      target.tiles = existing;
    }
    const result = [];
    for (const gallery of grouped.values()) {
      const tiles = gallery.tiles || [];
      result.push({...gallery, tiles: tiles.slice(0, 24)});
      // Preserve overflow as explicitly named recovery galleries instead of truncating projects.
      for (let start = 24; start < tiles.length; start += 24) {
        const id = `recovered-${gallery.galleryId}-${start / 24}`;
        result.push({...gallery, galleryId: id, meta: {...gallery.meta, slug: id, label: id, parentId: '', galleryType: 'regular', adminLabelHe: `${gallery.meta?.adminLabelHe || gallery.galleryId} — תוכן נוסף לשיוך`}, tiles: tiles.slice(start, start + 24)});
      }
    }
    return result;
  }
  function remapReferences(before, after) {
    after.forEach(gallery => (gallery.tiles || []).forEach(tile => {
      if (!tile?.brandConfig?.attachedWorkRefs) return;
      tile.brandConfig.attachedWorkRefs = tile.brandConfig.attachedWorkRefs.flatMap(ref => {
        const oldGallery = before[ref.galleryIndex];
        const oldTile = oldGallery?.tiles?.[ref.tileIndex];
        if (!oldTile) return [];
        const id = canonical(oldGallery);
        for (let gi = 0; gi < after.length; gi++) {
          if (after[gi].galleryId !== id && !after[gi].galleryId.startsWith(`recovered-${id}-`)) continue;
          const ti = after[gi].tiles.findIndex(candidate => candidate.tileId === oldTile.tileId && tileKey(candidate) === tileKey(oldTile));
          if (ti >= 0) return [{galleryIndex: gi, tileIndex: ti}];
          const byContent = after[gi].tiles.findIndex(candidate => tileKey(candidate) === tileKey(oldTile));
          if (byContent >= 0) return [{galleryIndex: gi, tileIndex: byContent}];
        }
        return [];
      });
    }));
    return after;
  }
window.CRMOStorage3281=Object.freeze({prepare,remapReferences});})();