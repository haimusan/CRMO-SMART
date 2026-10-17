/* Use the matching packaged studio asset when its cloud copy is not available yet. */
(() => {
 window.addEventListener('error',event=>{
  const el=event.target;if(!el||!['IMG','LINK'].includes(el.tagName))return;
  const attr=el.tagName==='IMG'?'src':'href';const current=el.getAttribute(attr)||'';
  const match=current.match(/\/storage\/v1\/object\/public\/assets\/(studio\/[^?#]+)/);
  if(!match)return;
  el.setAttribute(attr,new URL('assets/'+match[1],window.CRMO_ROOT_URL).href);
 },true);
})();
