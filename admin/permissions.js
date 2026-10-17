/* Roles are assigned by the server. user_metadata and browser preferences confer no privileges. */
(() => {
 let role='viewer',userId=null,request=0;
 const allowed=new Set(['admin','owner']);
 window.CRMOPermissions=Object.freeze({canEdit:()=>allowed.has(role),getRole:()=>role});
 const apply=()=>{
  const editable=allowed.has(role);document.body?.classList.toggle('crmo-authorized',editable);
  document.body?.classList.toggle('role-admin',editable);
  document.body?.classList.toggle('role-master',role==='owner');
  document.getElementById('adminDashboard')?.classList.toggle('visible',editable);
  window.dispatchEvent(new CustomEvent('crmo:permissions',{detail:{role,editable}}));
 };
 async function refresh(client){
  const seq=++request;role='viewer';apply();
  const {data,error}=await client.auth.getUser();
  if(seq!==request)return;
  userId=data?.user?.id||null;
  if(error||!userId){role='viewer';apply();return;}
  const result=await client.from('crmo_user_roles').select('role').eq('user_id',userId).maybeSingle();
  if(seq!==request)return;
  role=result.error?'registered':(result.data?.role||'registered');apply();
 }
 let bound=false;
 const timer=setInterval(()=>{
  const client=window.CRMOAuthBridge?.getSupabaseClient?.();
  if(!client||bound)return;bound=true;clearInterval(timer);
  client.auth.onAuthStateChange(()=>setTimeout(()=>refresh(client).catch(()=>{role='viewer';apply();}),0));
  refresh(client).catch(()=>{role='viewer';apply();});
 },100);
})();
