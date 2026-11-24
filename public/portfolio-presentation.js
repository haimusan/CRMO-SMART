(() => {
  'use strict';

  const featuredProjects = [
    { gallery: 'intro', id: 'intro-huggies-babyland-2023', category: 'תערוכות', tone: 'red', cover: 'assets/portfolio/huggies/babyland-interactive-station.webp' },
    { gallery: 'intro', id: 'intro-nuts-factory-us', category: 'חנויות וחללי מסחר', tone: 'amber', detail: /NF_CONCEPT_MACRO_NUTS/i },
    { gallery: 'branding', id: 'intro-ariel-branding', category: 'מיתוג עסקי', tone: 'violet', detail: /ariel-croissant/i },
    { gallery: 'intro', id: 'intro-vodka-berlin-2013', category: 'נקודות מכירה', tone: 'mint', detail: /award-medal/i },
    { gallery: 'product-design', id: 'gallery-6-tile-04', category: 'עיצוב מוצר', tone: 'blue' }
  ];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const assetRoot = new URL('../', document.currentScript.src);
  let unmount = () => {};

  function animateImage(image) {
    if (motion.matches || image?.tagName !== 'IMG' || typeof image.animate !== 'function') return;
    image.decode().then(() => {
      if (!image.isConnected || motion.matches) return;
      image.animate([{ scale: '1.045' }, { scale: '1' }], {
        duration: 570, easing: 'cubic-bezier(.22,.7,.26,1)'
      });
    }).catch(() => {});
  }

  function mount({ stack, galleries, visible, getMedia, openProject }) {
    unmount();
    const slides = featuredProjects.flatMap(feature => {
      const galleryIndex = galleries.findIndex(gallery => gallery.galleryId === feature.gallery);
      const gallery = galleries[galleryIndex];
      if (!gallery || gallery.meta?.visible === false || gallery.meta?.published === false ||
        gallery.meta?.unpublished === true || !visible(feature.gallery)) return [];
      const tileIndex = gallery.tiles.findIndex(tile => tile.tileId === feature.id && tile.isVisible !== false);
      const tile = gallery.tiles[tileIndex];
      if (!tile) return [];
      const media = getMedia(tile);
      const isImage = item => item?.src && item.isVisible !== false && item.isEnabled !== false &&
        (/^image\//i.test(item.type || '') || /\.(?:avif|webp|png|jpe?g)(?:[?#]|$)/i.test(item.src));
      const detailIndex = feature.detail ? media.findIndex(item => isImage(item) && feature.detail.test(item.src)) : -1;
      const mediaIndex = detailIndex >= 0 ? detailIndex : media.findIndex(isImage);
      if (mediaIndex < 0) return [];
      return [{
        ...feature, title: String(tile.overlay?.title || tile.meta?.brand || feature.category),
        src: feature.cover ? new URL(feature.cover, assetRoot).href : media[mediaIndex].src,
        galleryIndex, tileIndex, mediaIndex
      }];
    });
    if (!slides.length) return;

    const section = document.createElement('section');
    section.id = 'crmo-portfolio-opening';
    section.className = 'crmo-opening';
    section.setAttribute('aria-labelledby', 'crmo-opening-title');
    section.innerHTML = `
      <div class="crmo-opening-copy">
        <p class="crmo-opening-signature" lang="en" dir="ltr">Sales Oriented Design</p>
        <h1 id="crmo-opening-title">עיצוב <br>שעובד<span>.</span></h1>
        <p class="crmo-opening-intro">עיצוב חנויות, תערוכות, מותגים ונקודות מכירה. מהרעיון ועד לפרט שמגיע לייצור.</p>
        <button class="crmo-opening-work" type="button">לעבודות נבחרות <span aria-hidden="true">↓</span></button>
      </div>
      <figure class="crmo-opening-figure">
        <button type="button" class="crmo-opening-frame"><img alt="" width="1600" height="900" fetchpriority="high"><span aria-hidden="true" class="crmo-opening-arrow">←</span></button>
        <figcaption class="crmo-opening-caption">
          <span class="crmo-opening-ident"><strong dir="auto"></strong><small></small></span>
          <span class="crmo-opening-controls">
            <button type="button" class="crmo-opening-play"></button>
            <button type="button" class="crmo-opening-next" aria-label="הפרויקט הבא">←</button>
          </span>
        </figcaption>
      </figure>`;
    stack.prepend(section);

    const frame = section.querySelector('.crmo-opening-frame');
    let image = frame.querySelector('img');
    const title = section.querySelector('strong');
    const category = section.querySelector('small');
    const playback = section.querySelector('.crmo-opening-play');
    const next = section.querySelector('.crmo-opening-next');
    const lifetime = new AbortController();
    const options = { signal: lifetime.signal };
    let index = 0;
    let playing = !motion.matches;
    let inView = !('IntersectionObserver' in window);
    let timer;
    let request = 0;
    let observer;

    function show(slide, replacement) {
      if (replacement) {
        image.replaceWith(replacement);
        image = replacement;
        animateImage(image);
      } else image.src = slide.src;
      section.dataset.tone = slide.tone;
      title.textContent = slide.title;
      category.textContent = slide.category;
      frame.setAttribute('aria-label', 'לצפייה בפרויקט ' + slide.title);
    }

    function schedule() {
      clearTimeout(timer);
      playback.textContent = playing ? 'עצירת המצגת' : 'הפעלת המצגת';
      if (playing && slides.length > 1 && inView && !document.hidden &&
        !document.getElementById('crmo3047Lightbox')?.open && !frame.matches(':hover, :focus-visible')) {
        timer = setTimeout(advance, 5400);
      }
    }

    async function advance() {
      clearTimeout(timer);
      const sequence = ++request;
      const candidate = (index + 1) % slides.length;
      for (let step = 0; step < slides.length - 1; step++) {
        const target = (candidate + step) % slides.length;
        const image = new Image(1600, 900);
        image.alt = '';
        image.src = slides[target].src;
        try {
          await image.decode();
        } catch {
          continue;
        }
        if (sequence !== request || lifetime.signal.aborted) return;
        index = target;
        show(slides[index], image);
        schedule();
        return;
      }
      if (sequence !== request || lifetime.signal.aborted) return;
      playing = false;
      schedule();
    }

    function stopAndSchedule() {
      ++request;
      schedule();
    }

    frame.addEventListener('click', () => {
      ++request;
      const { galleryIndex, tileIndex, mediaIndex } = slides[index];
      openProject(galleryIndex, tileIndex, mediaIndex);
      schedule();
    }, options);
    ['mouseenter', 'mouseleave', 'focus', 'blur'].forEach(event => frame.addEventListener(event, stopAndSchedule, options));
    playback.addEventListener('click', () => { playing = !playing; stopAndSchedule(); }, options);
    next.addEventListener('click', () => { playing = false; void advance(); }, options);
    section.querySelector('.crmo-opening-work').addEventListener('click', () => {
      const target = section.nextElementSibling;
      if (!target) return;
      target.scrollIntoView({ block: 'start', behavior: motion.matches ? 'instant' : 'smooth' });
      target.querySelector('.crmo3045-tile[tabindex="0"]')?.focus({ preventScroll: true });
    }, options);
    motion.addEventListener('change', () => { if (motion.matches) playing = false; stopAndSchedule(); }, options);
    document.addEventListener('visibilitychange', stopAndSchedule, options);
    document.getElementById('crmo3047Lightbox')?.addEventListener('close', schedule, options);
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; stopAndSchedule(); }, { threshold: .25 });
      observer.observe(section);
    }

    section.querySelector('.crmo-opening-controls').hidden = slides.length < 2;
    show(slides[0]);
    schedule();
    unmount = () => {
      lifetime.abort();
      observer?.disconnect();
      clearTimeout(timer);
    };
  }

  function projectSlideshow({ dialog, changeMedia }) {
    const control = document.createElement('button');
    control.className = 'crmo-project-playback';
    control.type = 'button';
    control.hidden = true;
    dialog.querySelector('.crmo3045-lb-side').append(control);
    let timer;
    let playing = false;
    let index = 0;
    let media = [];

    function update() {
      clearTimeout(timer);
      const images = media.flatMap((item, position) => {
        const isVideo = /^(video\/|data:video)/i.test(item.type || item.src || '') ||
          /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(item.src || '');
        return isVideo ? [] : [position];
      });
      control.hidden = images.length < 2;
      control.textContent = playing ? 'עצירת המצגת' : 'הפעלת המצגת';
      const next = images[(images.indexOf(index) + 1) % images.length];
      if (!control.hidden && playing && dialog.open && !document.hidden) timer = setTimeout(() => changeMedia(next), 4500);
    }

    function pause() {
      playing = false;
      update();
    }

    function resetOnScroll() {
      if (!dialog.open || !playing || media.length < 2) return;
      pause();
      if (index !== 0) changeMedia(0);
    }

    control.addEventListener('click', () => { playing = !playing; update(); });
    dialog.addEventListener('scroll', event => {
      if (!event.target.closest?.('.crmo3045-strip')) resetOnScroll();
    }, { capture: true, passive: true });
    dialog.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) resetOnScroll();
    }, { passive: true });
    dialog.addEventListener('close', pause);
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', () => { if (motion.matches) pause(); });

    return {
      start() { playing = !motion.matches; update(); },
      pause,
      render(items, selected) { media = items; index = selected; update(); }
    };
  }

  window.CRMOPortfolioPresentation = Object.freeze({ mount, unmount: () => unmount(), animateImage, projectSlideshow });
})();
