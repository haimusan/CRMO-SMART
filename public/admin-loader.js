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
  bridge.dispose();delete window.CRMOAuthBridge;
  document.open();document.write(html);document.close();
 }catch(error){status.textContent=error.message||'לא ניתן לפתוח את ממשק הניהול.';status.setAttribute('role','alert');}
})();
