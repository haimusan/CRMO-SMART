/* Shared studio asset resolver, available before either viewer or private editor boots. */
(() => {
 'use strict';
 const root=window.CRMO_ROOT_URL||new URL('../',document.currentScript?.src||location.href).href;
 const base=()=>new URL('assets/',root).href;
 function resolve(value){
  const source=String(value||'');
  if(!source||/^(?:data:|blob:|https?:|\/\/)/i.test(source))return source;
  let path=source.replace(/^(?:\.\.\/|\.\/)+/,'').replace(/^\//,'');
  path=path.replace(/^(?:admin\/)?assets\//,'').replace(/^branding\//,'studio/');
  if(path==='favicon.svg')path='studio/logo/favicon.svg';
  if(!path.startsWith('studio/')||path.split('/').some(part=>part==='..'))return source;
  return new URL(path,base()).href;
 }
 window.CRMOStudioAssets=Object.freeze({base,resolve,isLocal:()=>location.protocol==='file:'||['localhost','127.0.0.1','[::1]'].includes(location.hostname)});
 function refresh(node){
  const elements=[];
  if(node?.matches?.('img[src],link[rel*="icon"][href]'))elements.push(node);
  node?.querySelectorAll?.('img[src],link[rel*="icon"][href]').forEach(el=>elements.push(el));
  elements.forEach(el=>{const attr=el.tagName==='IMG'?'src':'href';const before=el.getAttribute(attr);const after=resolve(before);if(after!==before)el.setAttribute(attr,after);});
 }
 window.addEventListener('error',event=>{
  const el=event.target;if(!el||!['IMG','LINK'].includes(el.tagName))return;
  const attr=el.tagName==='IMG'?'src':'href';const current=el.getAttribute(attr)||'';
  const match=current.match(/\/storage\/v1\/object\/public\/assets\/(studio\/[^?#]+)/);
  if(match)el.setAttribute(attr,new URL(match[1],base()).href);
 },true);
 new MutationObserver(records=>records.forEach(record=>{
  if(record.type==='attributes')refresh(record.target);else record.addedNodes.forEach(refresh);
 })).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','href']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>refresh(document),{once:true});else refresh(document);
})();
