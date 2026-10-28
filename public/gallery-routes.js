/* Public addresses describe content. Account roles alone select editing capabilities. */
(() => {
 'use strict';
 const entries = [
  ['selected-work','intro','עבודות נבחרות'],['more-work','intro-more','עבודות נוספות'],
  ['brands','our-brands','מותגים'],['stores','stores','חנויות וחללי מסחר'],
  ['branding','branding','מיתוג'],['product-design','product-design','עיצוב מוצר'],
  ['exhibitions','exhibitions','תערוכות'],['packaging','packaging','אריזות'],
  ['small-business','small-business','עסקים קטנים'],['pos-mix','gallery-18','POS MIX'],
  ['pos-all','pos','POS ALL'],['pos/chosen','pos-sub-1','POS CHOSEN'],
  ['pos/shop-in-shop','pos-sub-2','מתחמי מכירה'],['pos/floor-stands','pos-sub-3','סטנדים רצפתיים'],
  ['pos/counter-displays','pos-sub-4','סטנדים דלפקיים'],['pos/shelf-talkers','pos-sub-5','כובשי מדף'],
  ['pos/sampling-carts','pos-sub-6','עגלות קידום מכירות'],['pos/product-platforms','pos-sub-7','במות מוצר'],
  ['pos/custom-solutions','pos-sub-8','מיוחדים'],['about','about','על הסטודיו'],['contact','contact','צור קשר']
 ];
 const aliases = {'intro':'selected-work','intro-more':'more-work','our-brands':'brands','retail-pos':'pos-mix','pos':'pos-all','pos/all-works':'pos/chosen'};
 const byId = new Map(entries.map(([path,id])=>[id,path]));
 const href = id => '/' + (byId.get(id) || aliases[id] || id) + '/';
 function current(){
  let path;try{path=decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g,'');}catch(_){return null;}
  const entry=entries.find(([key])=>key===path);
  return entry?{path:entry[0],galleryId:entry[1],title:entry[2],kind:entry[1]==='pos'?'all':['about','contact'].includes(entry[1])?'section':'gallery'}:null;
 }
 function canonicalize(){
  const url=new URL(location.href);let path=url.pathname.replace(/^\/+|\/+$/g,'');
  if(path==='index.html')path='';
  const q=url.searchParams;const oldId=q.get('gallery')||q.get('section');
  if(oldId){
   path=byId.get(oldId)||aliases[oldId]||path;
   if(oldId==='pos'&&q.get('posCategory'))path=byId.get(q.get('posCategory'))||'pos/'+q.get('posCategory');
  }
  if(aliases[path])path=aliases[path];
  const hash=url.hash.slice(1);
  if(!path && (byId.has(hash)||aliases[hash])){path=byId.get(hash)||aliases[hash];url.hash='';}
  if(hash==='top')url.hash='';
  if(entries.some(([key])=>key===path)){url.pathname='/'+path+'/';url.hash='';}
  else if(!path)url.pathname='/';
  for(const key of ['view','mode','display','expanded','gallery','section','posCategory'])q.delete(key);
  if(url.href!==location.href)history.replaceState(history.state,'',url.href);
 }
 function decorate(){
  document.querySelectorAll('nav a[href],.crmo-mobile-links a[href]').forEach(link=>{
   const url=new URL(link.getAttribute('href'),location.href);
   if(url.origin!==location.origin)return;
   const id=url.hash.slice(1);
   if(id==='top')link.href='/';
   else if(byId.has(id)||aliases[id])link.href=href(id);
  });
 }
 function render(adapter){
  const route=current();if(!route)return false;
  const {stack,galleries,editable,visible,renderGallery,renderAll,renderAbout,renderContact,renderFooter,renderLegal}=adapter;
  const gallery=galleries.find(g=>g.galleryId===route.galleryId);
  const heading=document.createElement('h1');heading.className='crmo-route-name';heading.textContent=route.title;stack.appendChild(heading);
  const allowed=editable || (route.kind==='section' || (route.kind==='all'?visible('pos'):
    gallery && gallery.meta?.visible!==false && (gallery.meta?.parentId==='pos'||visible(gallery.galleryId))));
  if(!allowed){
   const message=document.createElement('p');message.setAttribute('role','status');message.textContent='הגלריה אינה זמינה לצפייה כרגע.';stack.appendChild(message);
  }else if(route.kind==='all')renderAll();
  else if(route.kind==='gallery')renderGallery(gallery,galleries.indexOf(gallery));
  const back=document.createElement('a');back.href='/';back.className='crmo-route-home';back.textContent='חזרה לעמוד הראשי';stack.appendChild(back);
  renderAbout();renderContact();renderFooter();renderLegal();decorate();
  return true;
 }
 canonicalize();
 window.CRMO_ROUTES=Object.freeze({entries,aliases,href,current,render,decorate,canonicalize});
})();
