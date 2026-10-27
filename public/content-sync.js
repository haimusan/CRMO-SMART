/* One cloud revision for the public viewer and editor; never refresh open work. */
(() => {
  'use strict';
  let active;
  function start(adapter) {
    active?.stop();
    const config = window.CRMO_CONFIG;
    let revision = '', running = false, stopped = false, pending = false;
    let realtimeClient, realtimeChannel;
    const blocked = () => document.visibilityState === 'hidden' ||
      !!document.querySelector(adapter.allowLightbox ? 'dialog[open]:not(#crmo3047Lightbox), .crmo3047-privacy-panel.is-open' : 'dialog[open], .crmo3047-privacy-panel.is-open') ||
      !!document.activeElement?.closest('input,textarea,select,[contenteditable="true"]') ||
      adapter.canApply?.() === false;
    const accept = value => { if (value) {
      revision = String(value);
      document.documentElement?.setAttribute('data-crmo-content-revision', revision);
    } };
    const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('crmo-content-revisions') : null;
    const onRevision = event => {
      if (event?.data?.rowKey === config.contentRow && event.data.revision !== revision) void check();
    };
    if (channel) channel.onmessage = onRevision;
    const onStorage = event => {
      if (event.key !== 'crmo-content-revision-signal' || !event.newValue) return;
      try { onRevision({data: JSON.parse(event.newValue)}); } catch (_) {}
    };
    window.addEventListener('storage', onStorage);
    async function check() {
      if (stopped) return;
      if (running) { pending = true; return; }
      if (blocked()) return;
      pending = false;
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
        if (pending && !stopped && !blocked()) { pending = false; void check(); }
      }
    }
    // A dedicated anonymous connection does not compete with the editor's auth
    // session. Existing SELECT/RLS policies still authorize each change event.
    function connect() {
      if (stopped || realtimeChannel || !window.supabase?.createClient) return;
      realtimeClient = window.supabase.createClient(config.url, config.anonKey, {
        auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
      });
      realtimeChannel = realtimeClient.channel('crmo-content-' + config.contentRow)
        .on('postgres_changes', {event:'UPDATE',schema:'public',table:config.table,
          filter:(config.keyColumn || 'key') + '=eq.' + config.contentRow}, () => { void check(); })
        .subscribe(status => { if (status === 'SUBSCRIBED') void check(); });
    }
    const focus = () => { connect(); void check(); };
    window.addEventListener('focus', focus);
    window.addEventListener('online', focus);
    // SDK can finish loading after the viewer starts. Capture script load events.
    document.addEventListener('load', connect, true);
    // Apply a queued cloud change as soon as an editor/dialog loses its guard.
    document.addEventListener('close', focus, true);
    document.addEventListener('focusout', focus);
    document.addEventListener('visibilitychange', focus);
    const timer = setInterval(focus, 5000);
    connect();
    active = {
      accept, check,
      publish(savedRevision) {
        accept(savedRevision);
        const message = {rowKey:config.contentRow,revision:String(savedRevision || ''),at:Date.now()};
        channel?.postMessage(message);
        try { localStorage.setItem('crmo-content-revision-signal',JSON.stringify(message)); } catch (_) {}
      },
      stop() {
        stopped=true;clearInterval(timer);
        channel?.close();
        if (realtimeChannel) void realtimeClient.removeChannel(realtimeChannel);
        window.removeEventListener('storage',onStorage);
        window.removeEventListener('focus',focus);
        window.removeEventListener('online',focus);
        document.removeEventListener('load',connect,true);
        document.removeEventListener('close',focus,true);
        document.removeEventListener('focusout',focus);
        document.removeEventListener('visibilitychange',focus);
      }
    };
    return active;
  }
  // An atomic compare-and-swap: a stale editor can never replace a newer row.
  async function updateIfCurrent({client,table,keyColumn,rowKey,row,revision}) {
    if (!revision) throw new Error('לא נטענה גרסת ענן מאומתת. יש לרענן לפני שמירה. העריכה המקומית נשמרה.');
    const result = await client.from(table).update(row)
      .eq(keyColumn,rowKey).eq('updated_at',revision).select(keyColumn + ',updated_at').maybeSingle();
    if (result?.error) throw result.error;
    if (!result?.data) throw new Error('התוכן באתר עודכן בחלון אחר. השמירה נעצרה כדי לא לדרוס אותו. העריכה המקומית נשמרה; יש לטעון את התוכן העדכני לפני שמירה נוספת.');
    return result;
  }
  window.CRMOContentSync = Object.freeze({start,updateIfCurrent,stop:()=>active?.stop()});
})();
