const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/content-sync.js','utf8');
const settle=()=>new Promise(r=>setImmediate(r));
function runtime(){
 const events={}, state={revision:'r1',renders:0,blocked:false,removed:0}, channels=[];
 const ctx={URLSearchParams,AbortController,setTimeout,clearTimeout,setInterval:()=>1,clearInterval(){},console,
  requestAnimationFrame:fn=>fn(),scrollX:0,scrollY:100,scrollTo(){},
  document:{visibilityState:'visible',activeElement:null,querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener:(n,f)=>events[n]=f,removeEventListener(){}},
  addEventListener:(n,f)=>events[n]=f,removeEventListener(){},
  fetch:async()=>({ok:true,json:async()=>[{updated_at:state.revision}]})};
 ctx.window=ctx;ctx.CRMO_CONFIG={url:'https://example.test',anonKey:'public',table:'content',contentRow:'main',keyColumn:'key'};
 ctx.supabase={createClient(url,key,options){assert.equal(options.auth.persistSession,false);return {
  channel(){const channel={on(type,filter,callback){assert.equal(type,'postgres_changes');assert.equal(filter.filter,'key=eq.main');this.change=callback;return this},subscribe(fn){this.status=fn;return this}};channels.push(channel);return channel},
  removeChannel(){state.removed++}
 }}};
 vm.runInNewContext(source,ctx);
 const sync=ctx.CRMOContentSync.start({canApply:()=>!state.blocked,refresh:async canApply=>{
  if(state.wait){await state.wait;state.wait=null;}
  if(!canApply())return false;
  const applied=state.revision;state.renders++;sync.accept(applied);
  if(state.afterApply)state.afterApply();return true;
 }});sync.accept('r1');return {ctx,state,sync,events,channels};
}
test('remote device update reaches viewer via realtime without polling',async()=>{
 const {state,sync,channels}=runtime();state.revision='r2';channels[0].change();await settle();assert.equal(state.renders,1);sync.stop();assert.equal(state.removed,1);
});
test('protected draft is retained and catches up immediately on editor close',async()=>{
 const {state,sync,channels,events}=runtime();state.blocked=true;state.revision='r2';channels[0].change();await settle();assert.equal(state.renders,0);
 state.blocked=false;events.close();await settle();assert.equal(state.renders,1);sync.stop();
});
test('change during an in-flight refresh is rechecked rather than dropped',async()=>{
 const {state,sync,channels}=runtime();state.revision='r2';let release;state.wait=new Promise(r=>release=r);
 state.afterApply=()=>{state.afterApply=null;state.revision='r3';channels[0].change()};
 const pending=sync.check();await settle();release();await pending;await settle();assert.equal(state.renders,2);sync.stop();
});
test('reconnect and online event catch missed changes; stopped connection cannot render',async()=>{
 const {state,sync,channels,events}=runtime();state.revision='r2';channels[0].status('SUBSCRIBED');await settle();assert.equal(state.renders,1);
 state.revision='r3';events.online();await settle();assert.equal(state.renders,2);sync.stop();state.revision='r4';channels[0].change();await settle();assert.equal(state.renders,2);
});
