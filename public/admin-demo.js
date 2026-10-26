/* Public sandbox, no auth SDK or private editor. Edits stay in memory. */
(() => {
 'use strict';let current,baseline,applying=false;
 const realFetch=window.fetch.bind(window);window.fetch=(url,options={})=>{const method=String(options.method||(url instanceof Request?url.method:'GET')).toUpperCase();return ['GET','HEAD'].includes(method)?realFetch(url,options):Promise.reject(Error('הדגמה בלבד — השינויים אינם נשלחים לאתר.'));};
 function capture(raw){current=structuredClone(raw);current.site??={};current.site.ui??={};current.site.ui.galleryManager??={items:{},order:[]};if(!applying)baseline=structuredClone(current);}
 const notify=text=>document.getElementById('crmo-demo-status').textContent=text;
 function apply(){applying=true;try{window.CRMO_VIEW.apply(structuredClone(current));}finally{applying=false;}}
 function dialog(title){document.getElementById('crmo-demo-dialog')?.remove();const d=document.createElement('dialog');d.id='crmo-demo-dialog';d.setAttribute('aria-label',title);const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent='השינויים זמניים ונשארים בדפדפן. האתר ובסיס הנתונים אינם משתנים.';const b=document.createElement('button');b.type='button';b.textContent='סגור';b.onclick=()=>d.close();d.append(h,p,b);document.body.append(d);return d;}
 function edit(gid,tid){const t=current.galleries.find(g=>g.galleryId===gid).tiles.find(t=>t.tileId===tid),d=dialog('עריכת פרויקט — הדגמה'),f=document.createElement('form');
  const tl=document.createElement('label');tl.textContent='שם הפרויקט';const title=document.createElement('input');title.value=t.overlay.title;tl.append(title);
  const dl=document.createElement('label');dl.textContent='תיאור הפרויקט';const desc=document.createElement('textarea');desc.value=t.overlay.desc;dl.append(desc);
  const vl=document.createElement('label');vl.textContent='הצג פרויקט';const visible=document.createElement('input');visible.type='checkbox';visible.checked=t.isVisible!==false;vl.prepend(visible);
  const save=document.createElement('button');save.type='submit';save.textContent='החל בהדגמה';f.append(tl,dl,vl,save);f.onsubmit=e=>{e.preventDefault();t.overlay.title=title.value;t.overlay.desc=desc.value;t.isVisible=visible.checked;t.display={...t.display,perImageText:false};d.close();apply();notify('השינוי הוחל בעותק ההדגמה בלבד.');};d.append(f);d.showModal();
 }
 function decorateCard(card,g,t){if(g.galleryId==='our-brands')return;const pencil=document.createElement('button');pencil.className='crmo-demo-edit';pencil.textContent='✎';pencil.type='button';pencil.setAttribute('aria-label','עריכת הדגמה — '+t.overlay.title);pencil.onclick=()=>edit(g.galleryId,t.tileId);card.prepend(pencil);
  const select=document.createElement('select');select.className='crmo-demo-move';select.setAttribute('aria-label','העבר לגלריה — '+t.overlay.title);const prompt=document.createElement('option');prompt.value='';prompt.textContent='העבר לגלריה…';select.append(prompt);
  for(const target of current.galleries){if(target.galleryId===g.galleryId||target.galleryId==='our-brands'||target.meta.galleryType==='master')continue;const o=document.createElement('option');o.value=target.galleryId;o.textContent=target.meta.adminLabelHe||target.meta.title||target.galleryId;select.append(o);}
  select.onchange=()=>{if(!select.value)return;window.CRMOProjectMove.moveProject(current.galleries,g.galleryId,select.value,t.tileId);apply();notify('הפרויקט הועבר בעותק ההדגמה בלבד.');};card.prepend(select);
 }
 function manage(){if(!current)return;const d=dialog('ניהול גלריות — הדגמה');
  for(const g of current.galleries){if(g.galleryId==='our-brands')continue;const row=document.createElement('div');row.className='crmo-demo-gallery-row';const label=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=g.meta.visible!==false&&current.site.ui.galleryManager.items[g.galleryId]?.visible!==false;label.append(check,document.createTextNode(g.meta.adminLabelHe||g.meta.title||g.galleryId));
   check.onchange=()=>{const target=current.galleries.find(x=>x.galleryId===g.galleryId);for(const key of ['visible','visibleDesktop','visibleMobile'])target.meta[key]=check.checked;current.site.ui.galleryManager.items[g.galleryId]={...current.site.ui.galleryManager.items[g.galleryId],visible:check.checked,visibleMobile:check.checked,visibleDesktop:check.checked};apply();notify('נראות הגלריה שונתה בהדגמה.');};
   const up=document.createElement('button');up.textContent='העלה למעלה';up.type='button';up.onclick=()=>{const order=current.site.ui.galleryManager.order,i=order.indexOf(g.galleryId);if(i>0){[order[i-1],order[i]]=[order[i],order[i-1]];apply();notify('סדר הגלריות עודכן בהדגמה.');}};row.append(label,up);d.append(row);
  }d.showModal();
 }
 window.CRMODemo=Object.freeze({capture,decorateCard});document.addEventListener('DOMContentLoaded',()=>{
  const bar=document.createElement('aside');bar.id='crmo-demo-bar';bar.setAttribute('aria-label','סביבת הדגמה');bar.innerHTML='<strong>סביבת הדגמה · השינויים זמניים בלבד</strong><button type="button" id="crmo-demo-manage">ניהול גלריות</button><button type="button" id="crmo-demo-reset">איפוס התנסות</button><a href="../?view=public">לאתר הציבורי</a><span id="crmo-demo-status" role="status">אפשר לערוך פרויקט ולהעביר אותו לגלריה אחרת.</span>';document.body.prepend(bar);document.getElementById('crmo-demo-manage').onclick=manage;document.getElementById('crmo-demo-reset').onclick=()=>{if(baseline){current=structuredClone(baseline);apply();notify('עותק ההדגמה אופס.');}};
  document.addEventListener('submit',e=>{if(e.target.closest('#crmo-demo-dialog'))return;e.preventDefault();e.stopImmediatePropagation();notify('שליחת טפסים אינה פעילה בסביבת ההדגמה.');},true);
 });
})();
