(() => {
  'use strict';
  const nav = document.querySelector('header nav.nav');
  if (!nav || document.getElementById('crmo-mobile-menu')) return;
  const mobile = matchMedia('(max-width:900px)');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'crmo-menu-toggle';
  toggle.setAttribute('aria-label', 'פתיחת תפריט');
  toggle.setAttribute('aria-controls', 'crmo-mobile-menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  nav.append(toggle);
  const menu = document.createElement('dialog');
  menu.id = 'crmo-mobile-menu';
  menu.className = 'crmo-mobile-menu';
  menu.setAttribute('aria-labelledby', 'crmo-mobile-menu-title');
  menu.innerHTML = '<div class="crmo-mobile-menu-head"><span id="crmo-mobile-menu-title">תפריט</span><button type="button" aria-label="סגירת תפריט">×</button></div><nav class="crmo-mobile-links" aria-label="ניווט באתר"></nav>';
  document.body.append(menu);
  const closeMenu = () => menu.close();
  menu.querySelector('button').addEventListener('click', closeMenu);
  menu.addEventListener('click', event => { if (event.target === menu) closeMenu(); });
  menu.addEventListener('close', () => {
    document.body.classList.remove('crmo-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
  toggle.addEventListener('click', () => {
    const links = menu.querySelector('nav');
    links.replaceChildren();
    nav.querySelectorAll('a:not(.logo):not(#crmo-user-indicator)').forEach(original => {
      const link = document.createElement('a');
      link.textContent = original.textContent;
      link.href = original.href;
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        closeMenu();
        original.click();
      });
      links.append(link);
    });
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('crmo-menu-open');
    menu.showModal();
  });
  mobile.addEventListener('change', () => { if (!mobile.matches && menu.open) closeMenu(); });

  function enhanceCards() {
    document.querySelectorAll('.crmo3047-stack .crmo3045-tile-wrap').forEach(card => {
      const tile = card.querySelector('.crmo3045-tile');
      if (!tile || tile.getAttribute('aria-disabled') === 'true' || card.querySelector('.crmo-mobile-caption')) return;
      const title = card.querySelector('.crmo3045-hover-title')?.textContent?.trim() || 'צפייה בפרויקט';
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', title);
      tile.setAttribute('aria-haspopup', 'dialog');
      const caption = document.createElement('button');
      caption.type = 'button';
      caption.className = 'crmo-mobile-caption';
      caption.setAttribute('aria-label', 'צפייה בפרויקט: ' + title);
      const text = document.createElement('span');
      text.textContent = title;
      caption.append(text);
      const count = Number.parseInt(card.querySelector('.crmo3045-count')?.textContent || '0', 10);
      if (count > 1) {
        const more = document.createElement('small');
        more.textContent = '+' + (count - 1);
        more.setAttribute('aria-hidden', 'true');
        caption.append(more);
      }
      caption.addEventListener('click', () => tile.click());
      card.append(caption);
    });

  }
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhanceCards(); });
  };
  const stage = document.querySelector('main.stage');
  if (stage) new MutationObserver(schedule).observe(stage, {childList:true,subtree:true});
  enhanceCards();

  const lb = document.getElementById('crmo3047Lightbox');
  const view = document.getElementById('crmo3047LbView');
  const strip = document.getElementById('crmo3047ThumbStrip');
  if (!lb || !view || !strip) return;
  const controls = document.createElement('div');
  controls.className = 'crmo-mobile-media-controls';
  controls.innerHTML = '<button type="button" aria-label="תמונה קודמת בפרויקט">הקודם</button><output aria-live="polite"></output><button type="button" aria-label="תמונה הבאה בפרויקט">הבא</button>';
  view.after(controls);
  const [prev, next] = controls.querySelectorAll('button');
  const status = controls.querySelector('output');
  function mediaState() {
    const items = Array.from(strip.querySelectorAll('button'));
    return {items, index:Math.max(0, items.findIndex(item => item.classList.contains('active')))};
  }
  function updateControls() {
    const {items,index} = mediaState();
    controls.hidden = items.length < 2;
    prev.disabled = index === 0;
    next.disabled = index >= items.length - 1;
    status.textContent = (index + 1) + ' / ' + items.length;
    items.forEach((item,i) => { item.setAttribute('aria-label', 'פריט ' + (i+1) + ' בפרויקט'); item.setAttribute('aria-current', String(i === index)); });
  }
  function moveMedia(delta) {
    const {items,index} = mediaState();
    items[index + delta]?.click();
  }
  prev.addEventListener('click', () => moveMedia(-1));
  next.addEventListener('click', () => moveMedia(1));
  new MutationObserver(updateControls).observe(strip, {childList:true});
  updateControls();
  let start = null;
  view.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !event.isPrimary || event.target.closest('button,a,video')) { start = null; return; }
    start = {x:event.clientX,y:event.clientY,id:event.pointerId};
  });
  view.addEventListener('pointerup', event => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)*1.5) moveMedia(dx < 0 ? 1 : -1);
  });
  view.addEventListener('pointercancel', () => { start = null; });
})();
