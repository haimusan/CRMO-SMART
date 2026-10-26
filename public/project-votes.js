/* Votes live in Postgres. Anonymous visitors see aggregate counts only. */
(() => {
 'use strict';
 const providers=[['google','Google'],['facebook','Facebook'],['linkedin_oidc','LinkedIn']];
 const counts=new Map(),liked=new Set(),buttons=new Set(),busy=new Set(),projects=new Map();
 let loaded=false,inflight=null,login;
 const bridge=()=>window.CRMO_VOTING_CONTEXT||window.CRMOAuthBridge;
 const user=()=>bridge()?.getSession?.()?.user;
 const client=()=>bridge()?.getSupabaseClient?.();
 function social(u){const m=u?.app_metadata||{},p=Array.isArray(m.providers)?m.providers:[];return ['google','facebook','linkedin','linkedin_oidc'].some(x=>m.provider===x||p.includes(x));}
 function csvCell(value){const s=String(value??'');return '"'+(/^[=+@\-\t\r]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}
 function notify(text,error=false){let el=document.getElementById('crmo-vote-status');if(!el){el=document.createElement('div');el.id='crmo-vote-status';el.setAttribute('role','status');document.body.append(el);}el.textContent=text;el.classList.toggle('is-error',error);}
 function paint(){for(const b of buttons){if(!b.isConnected){buttons.delete(b);continue;}const id=b.dataset.projectId,on=liked.has(id);b.disabled=busy.has(id);b.setAttribute('aria-pressed',String(on));b.classList.toggle('is-liked',on);b.setAttribute('aria-label',(on?'ביטול לייק — ':'אהבתי — ')+(projects.get(id)?.title||id));b.querySelector('span').textContent=loaded?String(counts.get(id)||0):'…';}}
 async function refresh(){
  if(inflight)return inflight;const db=client();if(!db)return;const uid=user()?.id;
  inflight=(async()=>{const total=await db.from('crmo_project_vote_totals').select('project_id,vote_count').limit(1000);if(total.error)throw total.error;
   const own=uid?await db.from('crmo_project_votes').select('project_id').eq('user_id',uid).limit(1000):{data:[]};if(own.error)throw own.error;if(user()?.id!==uid)return;
   counts.clear();liked.clear();for(const r of total.data||[])counts.set(r.project_id,Number(r.vote_count));for(const r of own.data||[])liked.add(r.project_id);loaded=true;paint();
  })().finally(()=>{inflight=null;});return inflight;
 }
 async function vote(id,wanted){
  const u=user();if(!u||!social(u)){await openLogin(id);return false;}if(busy.has(id))return false;busy.add(id);paint();
  try{const db=client();const r=wanted?await db.from('crmo_project_votes').insert({project_id:id,user_id:u.id}):await db.from('crmo_project_votes').delete().eq('project_id',id).eq('user_id',u.id);
   if(r.error&&!(wanted&&r.error.code==='23505'))throw r.error;
   const check=await db.from('crmo_project_votes').select('project_id').eq('project_id',id).eq('user_id',u.id).maybeSingle();if(check.error||!!check.data!==wanted)throw Error('ההצבעה לא אומתה. נסו שוב.');
   if(inflight)await inflight;await refresh();notify(wanted?'הבחירה שלכם נשמרה. תודה שהשפעתם!':'הלייק בוטל.');return true;
  }catch(error){notify(error.code==='42501'?'לא ניתן לשמור את ההצבעה. התחברו באמצעות חשבון חברתי ונסו שוב.':error.message||'ההצבעה לא נשמרה.',true);throw error;}finally{busy.delete(id);paint();}
 }
 async function openLogin(projectId){
  if(!login){login=document.createElement('dialog');login.className='crmo-vote-login';login.setAttribute('aria-labelledby','crmo-vote-title');login.innerHTML='<button class="crmo-vote-close" aria-label="סגור התחברות להצבעה" type="button">×</button><h2 id="crmo-vote-title">מי שמצביע משפיע</h2><p>בחרו את העבודות שאהבתם. כדי להצביע, מתחברים בלחיצה.</p><div class="crmo-vote-providers"></div><p role="status"></p><small>בלי טופס הרשמה ובלי רשימת תפוצה. הצבעה אחת לכל חשבון בכל פרויקט.</small>';login.querySelector('button').onclick=()=>login.close();document.body.append(login);}
  const holder=login.querySelector('.crmo-vote-providers'),status=login.querySelector('[role=status]');holder.replaceChildren();status.textContent='בודק אפשרויות התחברות…';if(!login.open)login.showModal();
  try{const c=window.CRMO_CONFIG,r=await fetch(c.url+'/auth/v1/settings',{headers:{apikey:c.anonKey},cache:'no-store'});if(!r.ok)throw Error('לא ניתן לבדוק את ההתחברות כרגע.');const settings=(await r.json()).external||{};let available=0;
   for(const [provider,label] of providers){const b=document.createElement('button');b.type='button';b.textContent='המשך עם '+label;b.disabled=!settings[provider];if(!b.disabled)available++;else b.title='החיבור עדיין לא הופעל';b.onclick=async()=>{b.disabled=true;try{sessionStorage.setItem('CRMO_PENDING_VOTE',JSON.stringify({projectId,at:Date.now()}));const redirectTo=new URL('index.html?view=public',window.CRMO_ROOT_URL).href;const result=await client().auth.signInWithOAuth({provider,options:{redirectTo}});if(result.error)throw result.error;}catch(e){sessionStorage.removeItem('CRMO_PENDING_VOTE');status.textContent=e.message;b.disabled=false;}};holder.append(b);}
   status.textContent=available?'בחרו חשבון כדי להמשיך.':'ההתחברות החברתית תיפתח בקרוב. ההצבעה שלכם עדיין לא נשמרה.';
  }catch(e){status.textContent=e.message;}
 }
 function createControl({projectId,title,galleryId,galleryTitle}){
  projects.set(projectId,{title,galleryId,galleryTitle});const b=document.createElement('button');b.type='button';b.className='crmo-project-vote';b.dataset.projectId=projectId;b.setAttribute('aria-label','אהבתי — '+title);b.setAttribute('aria-pressed',String(liked.has(projectId)));
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2 3.8 12.4C-1.2 7.4 5.8.1 12 6.1 18.2.1 25.2 7.4 20.2 12.4Z"/></svg><span>'+(loaded?String(counts.get(projectId)||0):'…')+'</span>';
  b.onclick=e=>{e.preventDefault();e.stopPropagation();void vote(projectId,!liked.has(projectId)).catch(()=>{});};b.onkeydown=e=>e.stopPropagation();buttons.add(b);return b;
 }
 function mountLightbox(tile,gallery){const title=document.getElementById('crmo3047LbTitle');document.getElementById('crmo-lightbox-vote')?.remove();if(!title||gallery.galleryId==='our-brands')return;const slot=document.createElement('div');slot.id='crmo-lightbox-vote';slot.append(createControl({projectId:tile.tileId,title:tile.overlay.title,galleryId:gallery.galleryId,galleryTitle:gallery.meta.adminLabelHe||gallery.meta.title}));title.after(slot);}
 async function report(){
  if(!bridge()?.canManage?.())return;try{await refresh();for(const g of bridge().getProjects?.()||[])if(g.galleryId!=='our-brands')for(const t of g.tiles||[])projects.set(t.tileId,{title:t.overlay.title,galleryTitle:g.meta.adminLabelHe||g.meta.title});
   document.getElementById('crmo-vote-report')?.remove();const d=document.createElement('dialog');d.id='crmo-vote-report';d.className='crmo-vote-login';d.setAttribute('aria-label','תוצאות הצבעה');
   const rows=[...counts].map(([id,count])=>({id,count,...projects.get(id)})).sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id));
   const h=document.createElement('h2');h.textContent='מי שמצביע משפיע — תוצאות';const p=document.createElement('p');p.textContent=rows.reduce((n,r)=>n+r.count,0)+' הצבעות שמורות';
   const close=document.createElement('button');close.textContent='סגור';close.onclick=()=>d.close();const csv=document.createElement('button');csv.textContent='ייצוא תוצאות CSV';csv.onclick=()=>{const data=[['מזהה פרויקט','פרויקט','גלריה','לייקים'],...rows.map(r=>[r.id,r.title||r.id,r.galleryTitle||'',r.count])];const url=URL.createObjectURL(new Blob(['\ufeff'+data.map(r=>r.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='CRMO-voting-results.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
   d.append(h,p,csv,close);const table=document.createElement('table');for(const row of [['פרויקט','גלריה','לייקים'],...rows.map(r=>[r.title||r.id,r.galleryTitle||'',r.count])]){const tr=document.createElement('tr');for(const value of row){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}table.append(tr);}d.append(table);if(!rows.length){const empty=document.createElement('p');empty.textContent='עדיין אין הצבעות. התוצאות יופיעו לאחר ההצבעה הראשונה.';d.append(empty);}document.body.append(d);d.showModal();
  }catch(e){notify('לא ניתן לטעון תוצאות: '+e.message,true);}
 }
 function adminButton(){const panel=document.getElementById('adminDashboard');if(!panel||!bridge()?.canManage?.()||document.getElementById('crmo-vote-report-button'))return;const b=document.createElement('button');b.type='button';b.id='crmo-vote-report-button';b.textContent='תוצאות הצבעה';b.onclick=report;panel.append(b);}
 async function changed(){try{liked.clear();paint();await refresh();adminButton();let pending;try{pending=JSON.parse(sessionStorage.getItem('CRMO_PENDING_VOTE')||'null');}catch(_){}if(pending&&social(user())&&Date.now()-pending.at<600000){sessionStorage.removeItem('CRMO_PENDING_VOTE');await vote(pending.projectId,true);}}catch(e){console.warn('[CRMO] Vote refresh failed:',e.message);}}
 window.CRMOProjectVotes=Object.freeze({createControl,mountLightbox,refresh,setVote:vote,report,social,csvCell});
 window.addEventListener('crmo:account',()=>void changed());window.addEventListener('crmo:permissions',()=>void changed());window.addEventListener('focus',()=>void changed());document.addEventListener('DOMContentLoaded',()=>{void changed();const panel=document.getElementById('adminDashboard');if(panel)new MutationObserver(adminButton).observe(panel,{childList:true});});
})();
