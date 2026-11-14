(() => {
  const mount = document.getElementById('crmo-editorial-home');
  const template = document.getElementById('crmo-editorial-template');
  if (!mount || !template || window.CRMO_ROUTES?.current()) return;
  mount.replaceChildren(template.content.cloneNode(true));
})();
