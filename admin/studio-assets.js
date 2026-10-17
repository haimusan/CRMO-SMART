/* Upload through the logged-in owner's existing Storage permissions. No privileged endpoint. */
(() => {
 const panel=document.createElement('section');panel.hidden=true;panel.dir='rtl';
 panel.style.cssText='padding:12px;margin:12px;border:1px solid #ccc;background:#fff;font:14px Arial';
 panel.innerHTML='<strong>נכסי הסטודיו</strong><p>בחר את תיקיית assets או studio כדי להעלות לוגו ואייקונים לענן. קבצים קיימים לא יוחלפו.</p><input type="file" webkitdirectory multiple><p data-upload-status role="status"></p>';
 const mount=()=>{if(!document.body)return;document.body.appendChild(panel);panel.hidden=!window.CRMOPermissions?.canEdit();};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
 window.addEventListener('crmo:permissions',()=>{panel.hidden=!window.CRMOPermissions?.canEdit();});
 panel.querySelector('input').addEventListener('change',async e=>{
  if(!window.CRMOPermissions?.canEdit())return;
  const client=window.CRMOAuthBridge?.getSupabaseClient?.();if(!client)return;
  const note=panel.querySelector('[data-upload-status]');const picker=e.target;picker.disabled=true;
  let uploaded=0,existing=0,failed=0;
  try{
   const files=[...picker.files].map(file=>{
    const relative=String(file.webkitRelativePath||'').replace(/\\/g,'/');
    const parts=relative.split('/');const i=parts.indexOf('studio');
    const path=i>=0?parts.slice(i).join('/'):'';
    return {file,path};
   }).filter(({file,path})=>path.startsWith('studio/')&&!path.split('/').some(s=>s==='..'||s==='.')&&/\.(svg|png|webp)$/i.test(path)&&file.size<=2000000);
   if(!files.length){note.textContent='לא נמצאו נכסי studio מתאימים בתיקייה שנבחרה.';return;}
   for(const {file,path}of files){
    if(!window.CRMOPermissions?.canEdit())throw Error('ההרשאה השתנתה; ההעלאה נעצרה.');
    note.textContent=`מעלה ${uploaded+existing+failed+1} מתוך ${files.length}`;
    const type=path.toLowerCase().endsWith('.svg')?'image/svg+xml':path.toLowerCase().endsWith('.png')?'image/png':'image/webp';
    const {error}=await client.storage.from('assets').upload(path,file,{upsert:false,contentType:type,cacheControl:'3600'});
    if(!error)uploaded++;else if(String(error.statusCode)==='409'||/already exists|duplicate/i.test(error.message||''))existing++;else failed++;
   }
   note.textContent=`הסתיים: ${uploaded} הועלו, ${existing} כבר קיימים, ${failed} נכשלו.`;
  }catch(error){note.textContent=error.message||'ההעלאה נכשלה.';}finally{picker.disabled=false;}
 });
})();
