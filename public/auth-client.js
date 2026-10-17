/* Public account authentication only. This bridge has no site-editing or Storage-write API. */
(() => {
 const config=window.CRMO_CONFIG;let session=null;
 const client=window.supabase?.createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 function update(next){session=next||null;const icon=document.getElementById('crmo-user-indicator');icon?.classList.toggle('is-authed',!!session);window.CRMOAuthModal?.setLoggedInState(!!session,session?.user?.email||'');}
 async function action(fn){if(!client)return {ok:false,message:'ספריית ההתחברות לא נטענה. רענן את העמוד ונסה שוב.'};try{const {data,error}=await fn();if(error)return {ok:false,message:error.message};if(data&&'session' in data)update(data.session);return {ok:true,message:data?.user&&!data?.session?'בדוק את הדוא״ל להמשך התהליך.':'הפעולה הושלמה.'};}catch(error){return {ok:false,message:error.message||'ההתחברות נכשלה.'};}}
 const redirect=()=>location.protocol==='file:'?undefined:new URL('index.html',window.CRMO_ROOT_URL).href;
 const remember=value=>localStorage.setItem('CRMO_AUTH_REMEMBER_PREF',value?'1':'0');
 window.CRMOAuthBridge=Object.freeze({
  loginWithPassword(email,password,keep=true){remember(keep);return action(()=>client.auth.signInWithPassword({email:String(email).trim(),password}));},
  signUpWithPassword(email,password,keep=true,profile={}){remember(keep);return action(()=>client.auth.signUp({email:String(email).trim(),password,options:{data:profile,emailRedirectTo:redirect()}}));},
  requestPasswordReset(email){return action(()=>client.auth.resetPasswordForEmail(String(email).trim(),{redirectTo:redirect()}));},
  loginWithProvider(provider){if(location.protocol==='file:')return Promise.resolve({ok:false,message:'לכניסה חברתית יש לפתוח את האתר בכתובת אינטרנט.'});return action(()=>client.auth.signInWithOAuth({provider,options:{redirectTo:redirect()}}));},
  logout(){return action(async()=>{const result=await client.auth.signOut();if(!result.error)update(null);return result;});},
  getRememberPreference:()=>localStorage.getItem('CRMO_AUTH_REMEMBER_PREF')!=='0',
  isLoggedIn:()=>!!session,getSession:()=>session,getUserEmail:()=>session?.user?.email||''
 });
 if(client){client.auth.onAuthStateChange((_event,next)=>update(next));client.auth.getSession().then(({data})=>update(data?.session)).catch(()=>update(null));}
 for(const id of ['crmo-user-indicator','login-trigger'])document.getElementById(id)?.addEventListener('click',event=>{event.preventDefault();window.CRMOAuthModal?.open('login');});
})();
