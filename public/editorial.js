(() => {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const featured = [
    ['intro', 'gallery-4-tile-02', 'חנויות וחללי מסחר'],
    ['intro', 'intro-vodka-berlin-2013', 'מיתוג'],
    ['intro', 'intro-huggies-babyland-2023', 'תערוכות'],
    ['product-design', 'thomy-sauce-carrier', 'עיצוב מוצר']
  ];
  const heroTemplates = `
    <div class="crmo-opening-story">
      <h1 dir="ltr">Sales <br>Oriented <br>Design<span>.</span></h1>
      <p>עיצוב לעולם המסחר, מהרעיון ועד למפגש עם הלקוח.</p>
      <a href="#intro">עבודות נבחרות <span aria-hidden="true">↓</span></a>
    </div>
    <figure class="crmo-opening-frame">
      <button class="crmo-opening-project" type="button">
        <img alt="" decoding="async" fetchpriority="high">
        <span class="crmo-opening-caption"><span data-category></span><strong dir="auto"></strong></span>
      </button>
      <figcaption class="crmo-opening-controls">
        <button type="button" data-previous aria-label="הפרויקט הקודם">→</button>
        <button type="button" data-next aria-label="הפרויקט הבא">←</button>
        <button type="button" data-pause aria-label="השהיית ההחלפה">השהיה</button>
      </figcaption>
    </figure>`;
  let stop = () => {};

  function images(tile) {
    const media = Array.isArray(tile?.media) ? tile.media : [];
    return media.filter(item => item?.src && item.isVisible !== false && item.isEnabled !== false &&
      !/^video/i.test(item.type || '') && !/^data:video|\.(mp4|webm|ogg)([?#]|$)/i.test(item.src));
  }

  function unmount() { stop(); }

  function mount(stack, galleries, openProject) {
    stop();
    const intro = stack.querySelector('#intro');
    if (!intro) return;
    const slides = featured.flatMap(([id, tileId, category]) => {
      const gi = galleries.findIndex(gallery => gallery.galleryId === id && gallery.meta?.visible !== false);
      const ti = galleries[gi]?.tiles.findIndex(tile => tile.tileId === tileId && tile.isVisible !== false) ?? -1;
      const tile = galleries[gi]?.tiles[ti];
      const [cover] = images(tile);
      return cover ? [{gi, ti, category, cover, title: tile.overlay?.title || tile.meta?.brand || category}] : [];
    });
    if (!slides.length) return;

    const hero = document.createElement('section');
    hero.className = 'crmo-opening';
    hero.innerHTML = heroTemplates;
    const picture = hero.querySelector('img');
    const project = hero.querySelector('.crmo-opening-project');
    const category = hero.querySelector('[data-category]');
    const title = hero.querySelector('strong');
    const pauseButton = hero.querySelector('[data-pause]');
    let index = 0;
    let requested = 0;
    let timer;
    let onscreen = false;
    let paused = motion.matches;
    let focused = false;
    let hovered = false;

    function show(slide) {
      picture.src = slide.cover.src;
      title.textContent = slide.title;
      category.textContent = slide.category;
    }

    function schedule() {
      clearTimeout(timer);
      if (slides.length > 1 && onscreen && !paused && !focused && !hovered && !document.hidden) {
        timer = setTimeout(() => change(1), 5300);
      }
    }

    function change(direction) {
      const next = (requested + direction + slides.length) % slides.length;
      requested = next;
      clearTimeout(timer);
      const preload = new Image();
      preload.src = slides[next].cover.src;
      preload.decode().then(() => {
        if (requested !== next || !hero.isConnected) return;
        index = next;
        show(slides[index]);
        schedule();
      }).catch(() => {
        if (requested !== next) return;
        requested = index;
        schedule();
      });
    }

    function updatePause() {
      pauseButton.textContent = paused ? 'הפעלת החלפה' : 'השהיה';
      pauseButton.setAttribute('aria-label', paused ? 'הפעלת ההחלפה' : 'השהיית ההחלפה');
      schedule();
    }

    show(slides[index]);
    updatePause();
    hero.querySelector('.crmo-opening-controls').hidden = slides.length < 2;
    hero.querySelector('[data-next]').onclick = () => change(1);
    hero.querySelector('[data-previous]').onclick = () => change(-1);
    pauseButton.onclick = () => { paused = !paused; updatePause(); };
    project.onclick = () => openProject(slides[index].gi, slides[index].ti, 0);
    hero.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    hero.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    hero.addEventListener('focusin', () => { focused = true; schedule(); });
    hero.addEventListener('focusout', event => { focused = hero.contains(event.relatedTarget); schedule(); });
    document.addEventListener('visibilitychange', schedule);
    const heading = intro.querySelector('.crmo3047-gallery-title');
    if (heading) heading.textContent = 'עבודות נבחרות';
    intro.before(hero);
    const observer = new IntersectionObserver(([entry]) => {
      onscreen = entry.intersectionRatio >= 0.35;
      schedule();
    }, {threshold: 0.35});
    observer.observe(hero);
    stop = () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', schedule);
      clearTimeout(timer);
      hero.remove();
    };
  }

  const previews = new Map();
  const previewObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const play = previews.get(entry.target);
      if (play) play(entry.intersectionRatio >= 0.65);
    }
  }, {threshold: 0.65});

  function clearCards() {
    for (const play of previews.values()) play(false);
    previews.clear();
    previewObserver.disconnect();
  }

  function addCard(card, tile) {
    const picture = card.querySelector('img.crmo3045-tile-media');
    if (!picture || tile.display?.multiItemMode === false) return;
    const stills = images(tile).slice(0, 3);
    if (stills.length < 2 || picture.src !== new URL(stills[0].src, document.baseURI).href) return;
    let timer;
    let cycle = 0;
    let visible = false;
    let played = false;
    const cover = picture.src;

    function play(active) {
      visible = active;
      if (!active) {
        clearTimeout(timer);
        cycle += 1;
        if (picture.src !== cover) picture.src = cover;
        return;
      }
      if (played || motion.matches || document.hidden) return;
      const run = ++cycle;
      let position = 1;

      function next() {
        if (!visible || cycle !== run || !picture.isConnected) return;
        if (position === stills.length) {
          picture.src = cover;
          played = true;
          previewObserver.unobserve(card);
          previews.delete(card);
          return;
        }
        const preload = new Image();
        preload.src = stills[position++].src;
        preload.decode().then(() => {
          if (visible && cycle === run && picture.isConnected && !document.hidden) picture.src = preload.src;
        }).catch(() => {}).finally(() => {
          if (visible && cycle === run) timer = setTimeout(next, 1550);
        });
      }
      timer = setTimeout(next, 1100);
    }
    previews.set(card, play);
    previewObserver.observe(card);
  }

  window.CRMOEditorial = {mount, unmount, addCard, clearCards};
})();