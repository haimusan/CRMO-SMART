/* One cloud revision for the public viewer and editor; never refresh open work. */
(() => {
  'use strict';
  let active;
  function start(adapter) {
    active?.stop();
    const config = window.CRMO_CONFIG;
    let revision = '', running = false, stopped = false;
    const blocked = () => document.visibilityState === 'hidden' ||
      !!document.querySelector('dialog[open], .crmo3047-privacy-panel.is-open') ||
      !!document.activeElement?.closest('input,textarea,select,[contenteditable="true"]') ||
      adapter.canApply?.() === false;
    const accept = value => { if (value) revision = String(value); };
    async function check() {
      if (stopped || running || blocked()) return;
      running = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const query = new URLSearchParams({select:'updated_at',key:'eq.' + config.contentRow});
        const response = await fetch(config.url + '/rest/v1/' + config.table + '?' + query, {
          headers:{apikey:config.anonKey,Authorization:'Bearer ' + config.anonKey},
          cache:'no-store',signal:controller.signal
        });
        if (!response.ok) throw new Error('Content revision HTTP ' + response.status);
        const rows = await response.json();
        const latest = rows[0]?.updated_at;
        if (!latest || latest === revision || blocked()) return;
        // Do not replace content the user has begun editing while a request was in flight.
        const sections = Array.from(document.querySelectorAll('#crmo3047GalleryStack > section'));
        const anchor = sections.find(el => el.getBoundingClientRect().bottom > 100);
        const anchorId = anchor?.id;
        const anchorTop = anchor?.getBoundingClientRect().top;
        const x = window.scrollX, y = window.scrollY;
        const applied = await adapter.refresh(() => !blocked());
        if (applied === false || stopped) return;
        const restore = () => {
          const next = anchorId && document.getElementById(anchorId);
          const top = next ? window.scrollY + next.getBoundingClientRect().top - anchorTop : y;
          window.scrollTo({left:x,top,behavior:'instant'});
        };
        restore();
        requestAnimationFrame(restore);
      } catch (error) {
        // Keep the last rendered cloud content. Never substitute an old local draft here.
        console.warn('[CRMO] Content freshness check failed:', error.message);
      } finally {
        clearTimeout(timeout);
        running = false;
      }
    }
    const focus = () => { void check(); };
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', focus);
    const timer = setInterval(focus, 30000);
    active = {accept,check,stop(){stopped=true;clearInterval(timer);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);}};
    return active;
  }
  // An atomic compare-and-swap: a stale editor can never replace a newer row.
  async function updateIfCurrent({client,table,keyColumn,rowKey,row,revision}) {
    if (!revision) throw new Error('לא נטענה גרסת ענן מאומתת. יש לרענן לפני שמירה. העריכה המקומית נשמרה.');
    const result = await client.from(table).update(row)
      .eq(keyColumn,rowKey).eq('updated_at',revision).select(keyColumn).maybeSingle();
    if (result?.error) throw result.error;
    if (!result?.data) throw new Error('התוכן באתר עודכן בחלון אחר. השמירה נעצרה כדי לא לדרוס אותו. העריכה המקומית נשמרה; יש לטעון את התוכן העדכני לפני שמירה נוספת.');
    return result;
  }
  window.CRMOContentSync = Object.freeze({start,updateIfCurrent});
})();
