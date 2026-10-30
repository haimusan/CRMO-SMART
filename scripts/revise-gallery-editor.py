"""Build the private CRMO editor revision. Input stays outside the public repository."""
import re, sys
from pathlib import Path
source, destination = map(Path, sys.argv[1:3])
s = source.read_text()
def once(old,new):
 global s
 if s.count(old)!=1: raise ValueError('Editor marker changed: '+old[:90])
 s=s.replace(old,new)
once('function isManagerItemVisible(id) { return canEdit() || isGalleryPubliclyVisible(id); }','function isManagerItemVisible(id) { return isGalleryPubliclyVisible(id); }')
start=s.index('  function attachInlineGalleryControls(section, id) {')
end=s.index('  function renderManagedMasterSection(',start)
s=s[:start]+'''  function attachInlineGalleryControls(section, id) {
    if (!canEdit()) return;
    const button = section.querySelector('[data-gallery-editor], [data-super-gallery-editor], [data-managed-gallery-editor]');
    const head = section.querySelector('.crmo3047-gallery-head');
    if (!button || !head) return;
    button.classList.add('crmo-gallery-pencil');
    button.setAttribute('aria-label', 'עריכת גלריה — ' + getManagerDisplayName(id));
    button.title = 'עריכת גלריה';
    head.append(button);
    section.querySelectorAll('.crmo3047-gallery-tools:empty,.crmo3047-super-tools:empty').forEach(el => el.remove());
  }
'''+s[end:]
once('  let galleryEditorDraft = null;', '  let galleryEditorDraft = null;\n  let galleryVisibilityDraft = null;')
once('    galleryEditorDraft = ensureGalleryTileCapacity(structuredClone(galleries[galleryIndex]));','    galleryEditorDraft = ensureGalleryTileCapacity(structuredClone(galleries[galleryIndex]));\n    galleryVisibilityDraft = structuredClone(getManagerItem(getGalleryLookupId(galleries[galleryIndex])));')
once('    galleryEditorDraft = null;','    galleryEditorDraft = null;\n    galleryVisibilityDraft = null;')
once('        manager.items[gid] = manager.items[gid] || {};','        manager.items[gid] = {...manager.items[gid], ...galleryVisibilityDraft};')
start=s.index('        <div class="crmo3045-editor-top crmo3047-gallery-form">')
end=s.index('        <div class="crmo3047-gallery-tools-row">',start)
s=re.sub(r'<label class="crmo3047-inline-check crmo3272-gallery-editor-expanded-hidden" hidden>.*?</label>', '', s)
columns=[]
for mode,title,flag in [('Mobile','מובייל','visibleMobile'),('Desktop','דסקטופ','visibleDesktop'),('Expanded','מורחב','showExpandedButton')]:
 columns.append(f'''<section class="crmo-gallery-column" aria-label="{title}">
 <div class="crmo-gallery-column-heading"><h3>{title}</h3><label><input type="checkbox" data-gallery-visibility="{flag}" {'id="crmo3047ExpandedEnabled"' if mode=='Expanded' else ''} aria-label="הצגת גלריה — {title}"> הצגה</label></div>
 <label class="crmo3045-field"><span>כותרת · {title}</span><input id="crmo3047GalleryTitle{mode}" type="text" dir="auto" placeholder="כותרת {title}"></label>
 <label class="crmo3045-field"><span>תיאור · {title}</span><textarea id="crmo3047GalleryDesc{mode}" dir="auto" placeholder="תיאור {title}"></textarea></label>
 {'<label class="crmo-gallery-desc-option"><input id="crmo-ux-hide-desc-mobile" type="checkbox"> כותרת בלבד, ללא תיאור</label>' if mode=='Mobile' else ''}
 </section>''')
s=s[:start]+'''        <label class="crmo-gallery-overall"><input type="checkbox" data-gallery-visibility="visible"> הצגת הגלריה באתר</label>
        <div class="crmo3045-editor-top crmo3047-gallery-form">'''+''.join(columns)+'</div>\n'+s[end:]
once("    byId('crmo3047ExpandedEnabled').checked = meta.expandedEnabled === true;", """    byId('crmo3047ExpandedEnabled').checked = meta.expandedEnabled === true;
    galleryDialog.querySelectorAll('[data-gallery-visibility]').forEach(input => {
      input.checked = input.dataset.galleryVisibility === 'showExpandedButton' ? meta.expandedEnabled === true : galleryVisibilityDraft?.[input.dataset.galleryVisibility] !== false;
    });
    const descChoice = byId('crmo-ux-hide-desc-mobile');
    descChoice.checked = byId('crmo3047GalleryDescMobile').value.startsWith('\\u2063');
    byId('crmo3047GalleryDescMobile').disabled = descChoice.checked;
""")
marker="  function syncGalleryDraftFromFields() {"
once(marker,"""  galleryDialog.addEventListener('change', event => {
    const flag = event.target.dataset.galleryVisibility;
    if (flag && galleryVisibilityDraft) galleryVisibilityDraft[flag] = event.target.checked;
    if (event.target.id === 'crmo-ux-hide-desc-mobile') {
      const field = byId('crmo3047GalleryDescMobile');
      const text = field.value.replace(/^\\u2063/, '');
      field.value = event.target.checked ? '\\u2063' + text : text;
      field.disabled = event.target.checked;
      field.dispatchEvent(new Event('input', {bubbles:true}));
    }
  });
"""+marker)
# Drop obsolete admin-only spacing; the public geometry remains the baseline.
s=re.sub(r'<style id="crmo3339-inline-controls">.*?</style>','',s,flags=re.S)
css='''
.crmo3047-gallery-head{position:relative}
.crmo-gallery-pencil{position:absolute!important;right:0!important;left:auto!important;top:0!important;width:36px!important;height:36px!important;min-width:36px!important;padding:0!important;border:0!important;background:transparent!important;color:inherit!important;font-size:0!important;z-index:20}
.crmo-gallery-pencil::before{content:"✎";font:28px/1 sans-serif;color:currentColor}
.crmo-gallery-pencil:focus-visible{outline:2px solid currentColor;outline-offset:3px}
.crmo3047-gallery-form{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;align-items:start!important;gap:24px!important}
.crmo-gallery-column{display:flex;flex-direction:column;gap:14px;min-width:0;margin:0;padding:0;direction:rtl}
.crmo-gallery-column-heading{display:flex;align-items:center;gap:14px;min-height:44px}
.crmo-gallery-column-heading h3{margin:0;font:inherit;font-weight:500}
.crmo-gallery-column-heading label,.crmo-gallery-overall,.crmo-gallery-desc-option{display:flex;align-items:center;gap:8px;min-height:44px;cursor:pointer}
.crmo-gallery-column input[type=checkbox],.crmo-gallery-overall input{width:18px;height:18px;accent-color:currentColor}
.crmo-gallery-column textarea{min-height:136px;resize:vertical}
.crmo-gallery-column input[type=text],.crmo-gallery-column textarea{direction:inherit;text-align:start}
.crmo-gallery-column [dir=auto]{unicode-bidi:plaintext;direction:revert;text-align:start}
.crmo-gallery-column input:disabled,.crmo-gallery-column textarea:disabled{opacity:.55}
@media(max-width:760px){.crmo3047-gallery-form{grid-template-columns:1fr!important;gap:20px!important}}
'''
s=s.replace('</body>','<style id="crmo-gallery-editor-revision">'+css+'</style></body>')
s=s.replace('CRMO_v3339','CRMO_v3340')
destination.write_text(s)
print(destination)
