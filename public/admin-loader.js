/* Fetch private editor code only after verifying the account role. */
(async()=>{
 const status=document.getElementById('admin-status');
 try{
  const bridge=window.CRMOAuthBridge;
  if(!bridge)throw Error('לא ניתן לטעון את מנגנון ההתחברות.');
  await bridge.ready;
  if(!bridge.isLoggedIn()){
   const url=new URL('index.html',window.CRMO_ROOT_URL);url.searchParams.set('login','1');
   location.replace(url.href);return;
  }
  if(!bridge.canManage())throw Error('לחשבון המחובר אין הרשאת ניהול.');
  status.textContent='טוען את גרסת הניהול האחרונה…';
  const client=bridge.getSupabaseClient();
  const manifest=await client.storage.from('admin').download('latest.json');
  if(manifest.error)throw Error('לא ניתן לטעון את גרסת הניהול. נסה לרענן.');
  const release=JSON.parse(await manifest.data.text());
  if(!/^releases\/CRMO_v\d+\.html$/.test(release.path))throw Error('כתובת גרסת הניהול אינה תקינה.');
  const file=await client.storage.from('admin').download(release.path);
  if(file.error)throw Error('טעינת ממשק הניהול נכשלה. נסה לרענן.');
  const html=await file.data.text();
  if(!html.trimStart().toLowerCase().startsWith('<!doctype html>'))throw Error('קובץ הניהול אינו תקין.');

  // Release files can contain obsolete admin chrome. Normalize it on every load.
  const editorDocument=new DOMParser().parseFromString(html,'text/html');
  editorDocument.title='CRMO | sales oriented design';
  const legacyNotice=editorDocument.body.firstElementChild;
  if(legacyNotice?.tagName==='DIV'&&legacyNotice.textContent.trim().startsWith('מערכת ניהול ·')&&legacyNotice.querySelector('a[href="../index.html"]'))legacyNotice.remove();
  const headerStyle=editorDocument.createElement('style');
  headerStyle.id='crmo-admin-header-layout';
  headerStyle.textContent=`
    body header,body.role-admin header,body.role-master header{
      position:sticky!important;top:0!important;z-index:9999;
      background:#fff!important;isolation:isolate;
    }
    body header::before{
      content:"";position:absolute;top:0;bottom:0;
      left:calc((100% - 100vw)/2);right:calc((100% - 100vw)/2);
      background:#fff;z-index:-1;pointer-events:none;
      border-bottom:1px solid #e6e6e6;
    }
    body.role-admin main,body.role-master main{padding-top:0!important}
    body.role-admin section,body.role-master section{scroll-margin-top:96px!important}
  `;
  editorDocument.head.append(headerStyle);
  const editorHTML='<!DOCTYPE html>'+editorDocument.documentElement.outerHTML;
  bridge.dispose();delete window.CRMOAuthBridge;
  document.open();document.write(editorHTML);document.close();
 }catch(error){status.textContent=error.message||'לא ניתן לפתוח את ממשק הניהול.';status.setAttribute('role','alert');}
})();
