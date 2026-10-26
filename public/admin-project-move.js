/* Development-only project transfer controls. Never loaded by the public viewer. */
(() => {
  'use strict';
  function moveProject(galleries,sourceId,targetId,tileId) {
    const source=galleries.find(g=>g.galleryId===sourceId);
    const target=galleries.find(g=>g.galleryId===targetId);
    if(!source||!target||source===target)throw Error('יש לבחור גלריית יעד אחרת.');
    if([source,target].some(g=>g.galleryId==='our-brands'||g.meta?.galleryType==='master'))throw Error('יש לבחור גלריית פרויקטים.');
    const index=source.tiles.findIndex(t=>t.tileId===tileId);
    if(index<0||target.tiles.some(t=>t.tileId===tileId))throw Error('הפרויקט כבר הועבר או שגלריית המקור השתנתה.');
    // Legacy brand links use array positions. Preserve their target identities
    // when removing a tile shifts the other projects in its source gallery.
    const links=galleries.flatMap(g=>g.tiles.flatMap(t=>(t.brandConfig?.attachedWorkRefs||[]).map(ref=>({ref,target:galleries[ref.galleryIndex]?.tiles?.[ref.tileIndex]}))));
    const [tile]=source.tiles.splice(index,1);target.tiles.push(tile);
    for(const link of links) {
      if(!link.target)continue;
      for(let gi=0;gi<galleries.length;gi++) {
        const ti=galleries[gi].tiles.indexOf(link.target);
        if(ti>=0){link.ref.galleryIndex=gi;link.ref.tileIndex=ti;break;}
      }
    }
    return tile;
  }
  function createControl({galleries,sourceId,tileId,title,onMove}) {
    const select=document.createElement('select');select.className='crmo-project-move';
    select.setAttribute('aria-label','העבר לגלריה — '+title);
    const prompt=document.createElement('option');prompt.value='';prompt.textContent='העבר לגלריה…';select.append(prompt);
    for(const gallery of galleries) {
      if(gallery.galleryId===sourceId||gallery.galleryId==='our-brands'||gallery.meta?.galleryType==='master')continue;
      const option=document.createElement('option');option.value=gallery.galleryId;
      option.textContent=gallery.meta?.adminLabelHe||gallery.meta?.title||gallery.galleryId;
      if(gallery.meta?.parentId==='pos')option.textContent='POS · '+option.textContent;
      select.append(option);
    }
    select.addEventListener('click',event=>event.stopPropagation());
    select.addEventListener('change',async()=>{
      const targetId=select.value;if(!targetId)return;select.disabled=true;
      try{await onMove(targetId);notify('הפרויקט הועבר וההעברה אומתה באתר.');}
      catch(error){notify(error.message||'ההעברה לא נשמרה.',true);select.value='';select.disabled=false;}
    });
    return select;
  }
  function notify(message,error=false) {
    let el=document.getElementById('crmo-project-move-status');
    if(!el){el=document.createElement('div');el.id='crmo-project-move-status';el.setAttribute('role','status');document.body.append(el);}
    el.textContent=message;el.style.color=error?'#a11':'#173b24';
  }
  window.CRMOProjectMove=Object.freeze({moveProject,createControl});
})();
