(()=>{
"use strict";
const VERSION='CRMO_v3287';

const CLOUD_SCHEMA = 'crmo-structured-content-v1';

const STORAGE_LAYOUT = window.CRMOStorage3281;

const TILES_PER_GALLERY = 6;

const MAX_TILES_PER_GALLERY = 24;

const STACK_TILE_LIMIT = 6;
const BRANDS_STACK_TILE_LIMIT = 18;

const BRANDS_GALLERY_BLUEPRINT = Object.freeze({
    galleryId: 'our-brands',
    label: 'our-brands',
    title: 'brands shape decisions',
    desc: 'ברשותנו ניסיון רב שנים עם מותגים מובילים בארץ ובעולם. אנו מראים איך ערך מותג הופך לבחירה ואיך עיצוב הופך לקנייה.'
  });

const MAIN_GALLERY_BLUEPRINTS = Object.freeze([
    { galleryId: 'intro', label: 'intro', title: 'Sales Oriented Design', desc: 'קריאייטיב מונסטר מתמחה בעיצוב מוטה מכירה S.O.D. אנו מלווים אתכם מהקונספט ועד ליישום בשטח, להגברת המכירות וליצירת מותגים מנצחים.' },
    { galleryId: 'intro-more', label: 'intro-more', title: 'decisions drive design', desc: 'אנו עובדים בשיטת dream. define. deliver. מקשיבים ומנסחים יחד את החזון. ממפים משימה, קהל יעד ומדדי הצלחה. מעצבים ומשיקים פתרון שהוא סיפור הצלחה מכירתי.' },
    { galleryId: 'stores', label: 'stores', title: 'עיצוב ותכנון חווית לקוח, הופכים חלל מסחרי למנוע מכירות.', desc: 'ממתחמים קמעונאיים וחנויות דגל ועד דוכני מכירה ממוקדים בקניונים, אנו מתכננים מסע לקוח המוביל לבחירה ולקנייה, ממקסם כל מטר ומחבר את סיפור המותג לחלל.' },
    { galleryId: 'branding', label: 'branding', title: 'שפה חזותית אחידה שמתחברת לכל נקודת מגע.', desc: 'אנחנו מגדירים אסטרטגיית מותג ומתרגמים אותה לשפה חזותית. זהות שמחזיקה את כל נקודות המגע של הלקוח, במדיה, נקודת המכירה ובכנס המקצועי.' },
    { galleryId: 'product-design', label: 'product-design', title: 'איפיון, פיתוח ועיצוב מוצרים שמוכרים יותר.', desc: 'פתרונות פרקטיים, יעילים ומוכרים. עיצוב המשלב פסיכולוגיה והנדסת אנוש, טכנולוגיה ויצירתיות.' },
    { galleryId: 'exhibitions', label: 'exhibitions', title: 'ביתן שמספר מהר ומשאיר רושם.', desc: 'בעולם של תערוכות, יש לכם שניות בודדות ללכוד תשומת לב. אנחנו מעצבים ביתנים ודוכנים עם מסר ברור, זרימה נכונה וחוויה שמייצרת עניין ולידים בשטח. מתכנון ועד הרכבה ופירוק.' },
    { galleryId: 'packaging', label: 'packaging', title: 'האריזה היא המוכר השקט על המדף.', desc: 'אריזה מוכרת היא עיצוב שמדבר. אנחנו מעצבים את הפנים והחוץ של המוצר, משפה חזותית ועד פתרונות מבניים, כדי לוודא שהמסר ברור והמוצר נבחר מול המתחרים.' },
    { galleryId: 'small-business', label: 'small-business', title: 'השפעה של מותג גדול, בתקציב חכם.', desc: 'מתודת ה-S.O.D מתאימה לכל עסק, ובמיוחד לכאלו בתחילת דרכם. אנו בונים זהות מסחרית, שפה מיתוגית וכלים חזותיים ממוקדי מכירה, כל מה שצריך כדי לבנות בסיס לצמיחה עסקית והגדלת מכירות.' }
  ]);

const POS_GALLERY_BLUEPRINTS = Object.freeze([
    { galleryId: 'all-works', label: 'all-works', buttonLabel: 'כל העבודות', title: 'פתרונות מדף, רצפה וחלל שממקסמים מכירה.', desc: 'אנחנו מעצבים סטנדים ומתקני תצוגה שמייצרים נוכחות בולטת, מספרים את סיפור המותג ומניעים לקנייה מדויקת, בכל נקודת מגע.' },
    { galleryId: 'shop-in-shop', label: 'shop-in-shop', buttonLabel: 'מתחמי מכירה', title: 'מתחמי מכירה', desc: 'מרחב ממותג שמרכז תשומת לב ומוביל להתנסות ולמכירה.' },
    { galleryId: 'floor-stands', label: 'floor-stands', buttonLabel: 'סטנדים רצפתיים', title: 'סטנדים רצפתיים', desc: 'הבמה של המותג. נוכחות שאי אפשר להתעלם ממנה.' },
    { galleryId: 'counter-displays', label: 'counter-displays', buttonLabel: 'סטנדים דלפקיים', title: 'סטנדים דלפקיים', desc: 'הסגירה האחרונה. קניית אימפולס ברגע הנכון.' },
    { galleryId: 'shelf-talkers', label: 'shelf-talkers', buttonLabel: 'כובשי מדף', title: 'כובשי מדף', desc: 'יתרון הראייה. בידול חד על המדף הצפוף.' },
    { galleryId: 'sampling-carts', label: 'sampling-carts', buttonLabel: 'עגלות קד"מ', title: 'עגלות קד"מ', desc: 'מפגש ישיר. מייצרים לידים ודגימות בשטח.' },
    { galleryId: 'product-platforms', label: 'product-platforms', buttonLabel: 'במות מוצר', title: 'במות מוצר', desc: 'פתרונות תצוגה שמבליטים את המוצר ברגע האמת.' },
    { galleryId: 'custom-solutions', label: 'custom-solutions', buttonLabel: 'מיוחדים', title: 'פתרונות מיוחדים', desc: 'פתרונות מיוחדים' }
  ]);

const POS_COPY_VERSION = '2026-09-26-pos-copy-1';

const POS_COPY = Object.freeze([
    { slug: 'all-works', name: 'כל העבודות', title: 'פתרונות מדף, רצפה וחלל שממקסמים מכירה.', desc: 'אנחנו מעצבים סטנדים ומתקני תצוגה שמייצרים נוכחות בולטת, מספרים את סיפור המותג ומניעים לקנייה מדויקת, בכל נקודת מגע.' },
    { slug: 'shop-in-shop', name: 'מתחמי מכירה', title: 'למותג יש מקום משלו בתוך החנות.', desc: 'מתחם שמחבר תצוגה, מסר והתנסות לחוויה אחת ברורה, גם כשהשטח מוגבל.' },
    { slug: 'floor-stands', name: 'סטנדים רצפתיים', title: 'יוצאים מהמדף. נכנסים לשדה הראייה.', desc: 'תצוגה עצמאית שמציבה מוצר ומסר במסלול התנועה של הלקוחות, תוך תכנון השטח, הגישה למוצר וההרכבה בשטח.' },
    { slug: 'counter-displays', name: 'סטנדים דלפקיים', title: 'הבחירה הקטנה שלפני התשלום.', desc: 'תצוגה קומפקטית שמבליטה מוצר או הצעה משלימה ברגע קצר, בלי להעמיס על הדלפק ובלי להפריע לעבודת הצוות.' },
    { slug: 'shelf-talkers', name: 'כובשי מדף', title: 'בדיוק במקום שבו משווים ובוחרים.', desc: 'אלמנטים שמבדילים את המוצר בתוך מדף עמוס ומחדדים את המסר שלו במבט אחד.' },
    { slug: 'sampling-carts', name: 'עגלות קד"מ', title: 'לא רק להציג. לתת להתנסות.', desc: 'עמדות ניידות לדגימה, להדגמה ולשיחה עם הקהל, המשלבות נראות מותג עם סביבת עבודה נוחה לצוות.' },
    { slug: 'product-platforms', name: 'במות מוצר', title: 'נותנים למוצר את מרכז הבמה.', desc: 'גובה, זווית וחומריות מכוונים את המבט אל הפרטים שהופכים את המוצר למעניין ומובן יותר.' },
    { slug: 'custom-solutions', name: 'מיוחדים', title: 'כשהפתרון הרגיל לא מתאים, מתכננים אחר.', desc: 'מתקני תצוגה שנולדים מצורך, חלל או מוצר לא שגרתי — עם רעיון בולט ופתרון שאפשר לייצר ולהתקין.' }
  ]);

const MAIN_RENDER_ORDER = Object.freeze(['intro','our-brands','intro-more','stores','pos','branding','product-design','exhibitions','packaging','small-business']);

const GALLERY_MANAGER_VERSION = 'v2-3272-expanded-single-control';

const EXPANDED_TILE_OPTIONS = [9,12,15,18,21,24];

const MIN_EXPANDED_FULL_TILES = 9;

const stage = document.querySelector('main.stage');

if (!stage) return;

const shell = document.createElement('section');

shell.className = 'crmo3045-shell';

shell.innerHTML = `
    <div id="crmo3047Status" class="crmo3045-note" style="margin:0 0 6px" hidden></div>
    <div class="crmo3047-stack" id="crmo3047GalleryStack"></div>
  `;

stage.appendChild(shell);

const lb = document.createElement('dialog');

lb.className = 'crmo3045-dialog';

lb.id = 'crmo3047Lightbox';

lb.innerHTML = `
    <div class="crmo3045-modal">
      <div class="crmo3045-lb-body">
        <div class="crmo3045-lb-view" id="crmo3047LbView">
          <button class="crmo3045-x" type="button" data-close-lightbox aria-label="Close lightbox"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>
          <button class="crmo3045-lb-arrow crmo3045-lb-prev" type="button" aria-label="Previous tile" id="crmo3047PrevTile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg></button>
          <button class="crmo3045-lb-arrow crmo3045-lb-next" type="button" aria-label="Next tile" id="crmo3047NextTile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg></button>
        </div>
        <aside class="crmo3045-lb-side">
          <div class="crmo3045-lb-kicker" id="crmo3047LbMeta"></div>
          <div class="crmo3045-lb-copy">
            <div class="crmo3045-lb-title" id="crmo3047LbTitle"></div>
            <div class="crmo3045-lb-desc" id="crmo3047LbDesc"></div>
            <a class="crmo3045-lb-link" id="crmo3047LbLink" hidden target="_blank" rel="noopener"></a>
          </div>
          <div class="crmo3045-strip" id="crmo3047ThumbStrip" hidden></div>
        </aside>
      </div>
    </div>`;

document.body.appendChild(lb);

const aboutDialog=null;

const contactDialog=null;

const footerDialog=null;

const accessibilityDialog=null;

const privacyDialog=null;

const privacyPanel = document.createElement('div');

privacyPanel.className = 'crmo3047-privacy-panel';

privacyPanel.id = 'crmo3047PrivacyPanel';

privacyPanel.innerHTML = `
    <div class="crmo3047-privacy-backdrop" data-close-privacy-panel="1"></div>
    <div class="crmo3047-privacy-card" role="dialog" aria-modal="true" aria-label="פרטיות ונתונים" dir="rtl">
      <button class="crmo3045-x" type="button" data-close-privacy-panel aria-label="סגירה">✕</button>
      <h3 class="crmo3047-privacy-title" id="crmo3047PrivacyPanelTitle"></h3>
      <p class="crmo3047-privacy-sub" id="crmo3047PrivacyPanelSubtitle"></p>
      <div class="crmo3047-privacy-body" id="crmo3047PrivacyPanelBody"></div>
      <button class="crmo3045-btn crmo3047-privacy-close" type="button" data-close-privacy-panel>סגור</button>
    </div>`;

document.body.appendChild(privacyPanel);

const galleryStack = document.getElementById('crmo3047GalleryStack');

const byId = (id) => document.getElementById(id);

const escape = (s) => String(s || '').replace(/[&<>\"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function getDefaultGalleryAdminLabelHe(gallery, index = 0) {
    const id = String(gallery?.galleryId || '').trim();
    const label = String(gallery?.meta?.label || '').trim();
    const key = label || id;
    const map = {
      'intro': 'פתיח ראשי',
      'our-brands': 'מותגים',
      'brands': 'מותגים',
      'intro-more': 'המשך פתיח',
      'stores': 'חנויות וחללי מסחר',
      'pos': 'נקודות מכירה',
      'branding': 'מיתוג עסקי',
      'product-design': 'עיצוב מוצר',
      'exhibitions': 'תערוכות',
      'packaging': 'אריזות',
      'small-business': 'עסקים קטנים',
      'all-works': 'כל העבודות',
      'shop-in-shop': 'מתחמי מכירה',
      'floor-stands': 'סטנדים רצפתיים',
      'counter-displays': 'סטנדים דלפקיים',
      'shelf-talkers': 'כובשי מדף',
      'sampling-carts': 'עגלות קד״מ',
      'product-platforms': 'במות מוצר',
      'custom-solutions': 'מיוחדים'
    };
    return String(gallery?.meta?.adminLabelHe || map[key] || gallery?.meta?.title || `גלריה ${index + 1}`);
  }

function canEdit(){return false;}

function ensureGalleryMeta(meta = {}) {
    const title = String(meta.title || '');
    const desc = String(meta.desc || '');
    const expandedCount = EXPANDED_TILE_OPTIONS.includes(Number(meta.expandedCount)) ? Number(meta.expandedCount) : 9;
    return {
      title,
      desc,
      label: String(meta.label || meta.slug || ''),
      slug: String(meta.slug || meta.label || ''),
      adminLabelHe: String(meta.adminLabelHe || meta.labelHe || meta.adminNameHe || ''),
      titleMobile: String(meta.titleMobile || title),
      titleDesktop: String(meta.titleDesktop || title),
      titleExpanded: String(meta.titleExpanded || title),
      descMobile: String(meta.descMobile || desc),
      descDesktop: String(meta.descDesktop || desc),
      descExpanded: String(meta.descExpanded || desc),
      visible: meta.visible !== false,
      visibleMobile: meta.visibleMobile !== false,
      visibleDesktop: meta.visibleDesktop !== false,
      visibleExpanded: meta.visibleExpanded !== false,
      showExpandedButton: meta.showExpandedButton === true,
      galleryType: String(meta.galleryType || ''),
      parentId: String(meta.parentId || ''),
      expandedEnabled: meta.expandedEnabled === true,
      expandedCount
    };
  }

function ensureAboutSection(section = {}) {
    const title = String(section.title || 'על הסטודיו');
    const desc = String(section.desc || 'אנחנו סטודיו לעיצוב מוטה מכירה. פיתחנו את מתודת Sales Oriented Design המחברת רעיון לביצוע מדויק ומקדמת מכירה. אנו עובדים בשיטת Dream Define Deliver כדי להפוך את האסטרטגיה לנראות עובדת בשטח: בחנות, בסטנד, בביתן ובאריזה. אנחנו מקשיבים ומנסחים את החזון והמסר שלכם, ממפים את המשימה, מגדירים תקציב ומדדי הצלחה. התוצאה: פתרונות עיצוב מנצחים שמובילים את קהל היעד לבחירה בכם.');
    return {
      sectionId: 'about',
      visible: true,
      title,
      desc,
      titleMobile: String(section.titleMobile || title),
      titleDesktop: String(section.titleDesktop || title),
      titleExpanded: String(section.titleExpanded || title),
      descMobile: String(section.descMobile || desc),
      descDesktop: String(section.descDesktop || desc),
      descExpanded: String(section.descExpanded || desc),
      showTitleMobile: section.showTitleMobile !== false,
      showTitleDesktop: section.showTitleDesktop !== false,
      showTitleExpanded: section.showTitleExpanded !== false,
      showTextMobile: section.showTextMobile !== false,
      showTextDesktop: section.showTextDesktop !== false,
      showTextExpanded: section.showTextExpanded !== false,
      logoSrcMobile: String(section.logoSrcMobile || section.logoSrc || ''),
      logoSrcDesktop: String(section.logoSrcDesktop || section.logoSrc || ''),
      logoSrcExpanded: String(section.logoSrcExpanded || section.logoSrc || ''),
      logoSrc: String(section.logoSrcDesktop || section.logoSrcMobile || section.logoSrcExpanded || section.logoSrc || ''),
      showMediaMobile: section.showMediaMobile !== false,
      showMediaDesktop: section.showMediaDesktop !== false,
      showMediaExpanded: section.showMediaExpanded !== false
    };
  }

function ensureContactSection(section = {}) {
    const title = String(section.title || 'tell us about you');
    const desc = String(section.desc || 'ספרו לנו בקצרה על העסק או הארגון שלכם. איפה אתם היום ולאן תרצו להגיע, מה החזון, מי קהל היעד ואיפה הוא פוגש אתכם, ומה הדבר שאתם הכי גאים בו. יש אתגר נקודתי? כתבו עליו בשורה.');
    const socials = section.socials && typeof section.socials === 'object' ? section.socials : {};
    const socialDefaults = {
      linkedin: { enabled: true, url: 'https://www.linkedin.com/company/creative-monster-sales-oriented-design', icon: 'assets/studio/icons/social/linkedin.svg' },
      facebook: { enabled: true, url: 'https://www.facebook.com/DCreativeMONSTER/', icon: 'assets/studio/icons/social/facebook.svg' },
      instagram: { enabled: true, url: 'https://www.instagram.com/creativemonsterstudio/', icon: 'assets/studio/icons/social/instagram.svg' }
    };
    const nextSocials = {};
    Object.keys(socialDefaults).forEach((key) => {
      const base = socialDefaults[key];
      const src = socials[key] && typeof socials[key] === 'object' ? socials[key] : {};
      nextSocials[key] = {
        enabled: src.enabled !== false,
        url: String(src.url || base.url),
        icon: String(src.icon || base.icon)
      };
    });
    return {
      sectionId: 'contact',
      visible: true,
      title,
      desc,
      titleMobile: String(section.titleMobile || title),
      descMobile: String(section.descMobile || desc),
      email: String(section.email || 'crmo@crmo.co.il'),
      whatsapp: String(section.whatsapp || '052-3346374'),
      whatsappIcon: String(section.whatsappIcon || 'assets/studio/icons/social/whatsapp.svg'),
      emailIcon: String(section.emailIcon || 'assets/studio/icons/social/email.svg'),
      socialText: String(section.socialText || 'בקרו אותנו גם בסושיאל'),
      socials: nextSocials
    };
  }

function ensureFooterSection(section = {}) {
    return {
      sectionId: 'footer',
      visible: section.visible !== false,
      creditText: String(section.creditText || 'Crafted by Creative Monster Studio | Sales Oriented Design'),
      iconSrc: String(section.iconSrc || 'assets/studio/logo/favicon.svg')
    };
  }

function ensureAccessibilitySection(section = {}) {
    return {
      sectionId: 'accessibility',
      visible: section.visible !== false,
      toggleLabel: String(section.toggleLabel || '+ הצהרת נגישות'),
      p1: String(section.p1 || 'Creative Monster פועלת להפוך את התוכן באתר לנגיש עבור כלל המשתמשים, לרבות אנשים עם מוגבלויות. האתר נבנה בהתאם להנחיות WCAG 2.0/2.1 ברמת AA במידת האפשר, ומותאם לשימוש במחשב ובמכשירים ניידים.'),
      p2: String(section.p2 || 'ניווט מקלדת מלא, היררכיית כותרות תקינה, יחס ניגודיות מספק וטפסים עם תוויות. תמיכה בקוראי מסך נפוצים (NVDA / JAWS) ובדפדפנים מובילים. תמונות כוללות טקסט חלופי היכן שרלוונטי; אנימציות/וידאו – ללא הבהובים מסוכנים.'),
      p3: String(section.p3 || 'סיוע ומשוב: אם נתקלתם בבעיה או שיש לכם הצעת שיפור, נשמח לדעת ולתקן בהקדם. כתובת מייל: crmo@crmo.co.il · טלפון / WhatsApp: 052‑3346374.')
    };
  }

function ensurePrivacySection(section = {}) {
    return {
      sectionId: 'privacy',
      visible: section.visible !== false,
      toggleLabel: String(section.toggleLabel || '+ מדיניות פרטיות'),
      title: String(section.title || 'פרטיות ונתונים'),
      subtitle: String(section.subtitle || 'שקיפות קצרה (בלי אותיות קטנות).'),
      body: String(section.body || 'אנחנו שומרים רק מידע מינימלי (שם, אימייל, תמונת פרופיל). בלי ספאם, בלי רשימות תפוצה. אפשר למחוק הכל בכל עת.')
    };
  }

function tileHasMeaningfulContent(tile) {
    if (!tile) return false;
    if (Array.isArray(tile.media) && tile.media.some((m) => m && m.src)) return true;
    const textParts = [tile?.meta?.client, tile?.meta?.brand, tile?.overlay?.title, tile?.overlay?.desc, tile?.overlay?.link]
      .map((v) => String(v || '').trim())
      .filter(Boolean);
    const nonDefault = textParts.filter((v) => v !== 'שם הפרויקט' && v !== 'תיאור קצר של הפרויקט');
    return nonDefault.length > 0;
  }

function getFullTileCountForExpanded(tiles = []) {
    return (Array.isArray(tiles) ? tiles : []).filter((tile) => tile?.isVisible !== false && tileHasMeaningfulContent(tile)).length;
  }

function applyFaviconLaw() {
    const href = window.CRMOStudioAssets.resolve('studio/logo/favicon.svg');
    let icon = document.querySelector('link[data-crmo-favicon="true"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.setAttribute('data-crmo-favicon', 'true');
      icon.rel = 'icon';
      icon.type = 'image/svg+xml';
      document.head.appendChild(icon);
    }
    icon.href = href;
    let shortcut = document.querySelector('link[data-crmo-favicon-shortcut="true"]');
    if (!shortcut) {
      shortcut = document.createElement('link');
      shortcut.setAttribute('data-crmo-favicon-shortcut', 'true');
      shortcut.rel = 'shortcut icon';
      shortcut.type = 'image/svg+xml';
      document.head.appendChild(shortcut);
    }
    shortcut.href = href;
  }

const makeTile = (galleryIndex, tileIndex) => ({
    tileId: `gallery-${galleryIndex + 1}-tile-${String(tileIndex + 1).padStart(2,'0')}`,
    meta: { client: '', brand: '' },
    overlay: { title: 'שם הפרויקט', desc: 'תיאור קצר של הפרויקט', link: '' },
    display: { openLinkInNewTab: false, showLinkInTile: false, multiItemMode: false, perImageText: false },
    media: []
  });

const makeGallery = (galleryIndex, blueprint = null) => ({
    galleryId: blueprint?.galleryId || `gallery-${galleryIndex + 1}`,
    meta: ensureGalleryMeta({
      title: blueprint?.title || `Gallery ${galleryIndex + 1}`,
      desc: blueprint?.desc || `Test gallery ${galleryIndex + 1} for gallery context + tile context`,
      label: blueprint?.label || `gallery-${galleryIndex + 1}`,
      slug: blueprint?.label || `gallery-${galleryIndex + 1}`,
      adminLabelHe: '',
      expandedEnabled: false,
      expandedCount: 9
    }),
    ui: { editMode: galleryIndex === 0 },
    tiles: Array.from({length:TILES_PER_GALLERY}, (_, tileIndex) => makeTile(galleryIndex, tileIndex))
  });

const makeBrandsGallery = () => ({
    galleryId: BRANDS_GALLERY_BLUEPRINT.galleryId,
    meta: ensureGalleryMeta({
      title: BRANDS_GALLERY_BLUEPRINT.title,
      desc: BRANDS_GALLERY_BLUEPRINT.desc,
      label: BRANDS_GALLERY_BLUEPRINT.label,
      slug: BRANDS_GALLERY_BLUEPRINT.label,
      adminLabelHe: 'מותגים',
      expandedEnabled: false,
      expandedCount: 9
    }),
    ui: { editMode: false },
    tiles: Array.from({length:TILES_PER_GALLERY}, (_, tileIndex) => normalizeTile({
      tileId: `brands-tile-${String(tileIndex + 1).padStart(2,'0')}`,
      meta: { client: '', brand: '' },
      overlay: { title: '', desc: '', link: '' },
      display: { openLinkInNewTab: false, showLinkInTile: false, multiItemMode: false, perImageText: false },
      media: []
    }, 0, tileIndex))
  });

const SUPER_GALLERY_ID = 'pos';

const SUPER_SUB_COUNT = POS_GALLERY_BLUEPRINTS.length;

const SUPER_SUB_PREFIX = `${SUPER_GALLERY_ID}-sub-`;

function getPosBlueprint(slotIndex) {
    return POS_GALLERY_BLUEPRINTS[slotIndex] || POS_GALLERY_BLUEPRINTS[0];
  }

function getSuperSubButtonLabel(slotIndex) {
    return String(getPosBlueprint(slotIndex)?.buttonLabel || `תת כפתור ${slotIndex + 1}`);
  }

function getSuperSubGalleryTitle(slotIndex) {
    return String(getPosBlueprint(slotIndex)?.title || `תת גלריה ${slotIndex + 1}`);
  }

const makeSuperSubGallery = (slotIndex) => {
    const blueprint = getPosBlueprint(slotIndex);
    return ({
      galleryId: `${SUPER_SUB_PREFIX}${slotIndex + 1}`,
      meta: ensureGalleryMeta({
        title: String(blueprint?.title || getSuperSubGalleryTitle(slotIndex)),
        desc: String(blueprint?.desc || 'הסבר הגלריה'),
        label: String(blueprint?.label || `super-gallery-${slotIndex + 1}`),
        slug: String(blueprint?.label || `super-gallery-${slotIndex + 1}`),
        adminLabelHe: String(blueprint?.buttonLabel || blueprint?.title || ''),
        galleryType: 'child',
        parentId: SUPER_GALLERY_ID,
        expandedEnabled: false,
        expandedCount: 9
      }),
      ui: { editMode: false },
      tiles: Array.from({length:TILES_PER_GALLERY}, (_, tileIndex) => normalizeTile({
        tileId: `${SUPER_SUB_PREFIX}${slotIndex + 1}-tile-${String(tileIndex + 1).padStart(2,'0')}`,
        meta: { client: '', brand: '' },
        overlay: { title: 'שם הפרויקט', desc: 'תיאור קצר על הפרויקט', link: '' },
        display: { openLinkInNewTab: false, showLinkInTile: false, multiItemMode: false, perImageText: false },
        media: []
      }, slotIndex + 100, tileIndex))
    });
  };

function isSuperSubGallery(gallery) {
    return String(gallery?.galleryId || '').indexOf(SUPER_SUB_PREFIX) === 0;
  }

function getSuperSubGalleries() {
    return galleries.filter((gallery) => isSuperSubGallery(gallery));
  }

function ensureSuperSubGalleries(rawGalleries) {
    const list = Array.isArray(rawGalleries) ? rawGalleries.slice() : [];
    const regular = list.filter((gallery) => !isSuperSubGallery(gallery));
    const supers = Array.from({length:SUPER_SUB_COUNT}, (_, slotIndex) => {
      const wantedId = `${SUPER_SUB_PREFIX}${slotIndex + 1}`;
      const existing = list.find((gallery) => String(gallery?.galleryId || '') === wantedId);
      return normalizeGallery(existing || makeSuperSubGallery(slotIndex), regular.length + slotIndex);
    });
    return [...regular, ...supers];
  }

function applyGalleryBlueprint(gallery, galleryIndex, blueprint) {
    const base = normalizeGallery(gallery || makeGallery(galleryIndex, blueprint), galleryIndex);
    const existingMeta = ensureGalleryMeta(base.meta || {});
    base.galleryId = blueprint.galleryId;
    base.meta = ensureGalleryMeta({
      ...existingMeta,
      title: String(existingMeta.title || blueprint.title || ''),
      desc: String(existingMeta.desc || blueprint.desc || ''),
      label: String(existingMeta.label || existingMeta.slug || blueprint.label || ''),
      slug: String(existingMeta.slug || existingMeta.label || blueprint.label || ''),
      adminLabelHe: String(existingMeta.adminLabelHe || getDefaultGalleryAdminLabelHe({ galleryId: blueprint.galleryId, meta: { label: blueprint.label, title: blueprint.title } }, galleryIndex)),
      titleMobile: String(existingMeta.titleMobile || existingMeta.title || blueprint.title || ''),
      titleDesktop: String(existingMeta.titleDesktop || existingMeta.title || blueprint.title || ''),
      titleExpanded: String(existingMeta.titleExpanded || existingMeta.title || blueprint.title || ''),
      descMobile: String(existingMeta.descMobile || existingMeta.desc || blueprint.desc || ''),
      descDesktop: String(existingMeta.descDesktop || existingMeta.desc || blueprint.desc || ''),
      descExpanded: String(existingMeta.descExpanded || existingMeta.desc || blueprint.desc || '')
    });
    return base;
  }

function getBrandGalleryContentScore(gallery) {
    if (!gallery) return -1;
    const rawTiles = Array.isArray(gallery?.tiles) ? gallery.tiles : [];
    let score = rawTiles.length ? 1 : 0;
    rawTiles.forEach((tile) => {
      const mediaCount = Array.isArray(tile?.media) ? tile.media.filter((m) => m?.src).length : 0;
      if (mediaCount) score += 20 + mediaCount;
      if (String(tile?.meta?.brand || '').trim()) score += 8;
      if (String(tile?.meta?.client || '').trim()) score += 5;
      if (String(tile?.overlay?.title || '').trim()) score += 3;
      if (Array.isArray(tile?.brandConfig?.attachedWorkRefs) && tile.brandConfig.attachedWorkRefs.length) score += 12 + tile.brandConfig.attachedWorkRefs.length;
    });
    return score;
  }

function ensureAllGalleries(rawGalleries) {
    const original = (Array.isArray(rawGalleries) ? rawGalleries : []).map((gallery, index) => normalizeGallery(gallery, index));
    return STORAGE_LAYOUT.remapReferences(original, ensureAllGalleriesCore(STORAGE_LAYOUT.prepare(original)));
  }

function ensureAllGalleriesCore(rawGalleries) {
    const list = Array.isArray(rawGalleries) ? rawGalleries.slice() : [];
    const used = new Set();
    const canonicalId = (gallery) => {
      const candidates = [gallery?.galleryId, gallery?.meta?.slug, gallery?.meta?.label]
        .map((v) => String(v || '').trim().toLowerCase())
        .filter(Boolean);
      if (candidates.some((id) => id === 'our-brands' || id === 'brands' || id === 'brands-gallery')) return 'our-brands';
      if (candidates.some((id) => id === 'pos' || id === SUPER_GALLERY_ID)) return SUPER_GALLERY_ID;
      for (const id of candidates) {
        const blueprintHit = MAIN_GALLERY_BLUEPRINTS.find((bp) => bp.galleryId === id || bp.label === id);
        if (blueprintHit) return blueprintHit.galleryId;
        const posHit = POS_GALLERY_BLUEPRINTS.find((bp) => bp.galleryId === id || bp.label === id);
        if (posHit) return `${SUPER_SUB_PREFIX}${POS_GALLERY_BLUEPRINTS.indexOf(posHit) + 1}`;
      }
      return candidates[0] || '';
    };
    const findSourceFor = (wantedId) => {
      const matches = list
        .map((gallery, idx) => ({ gallery, idx }))
        .filter(({ gallery, idx }) => !used.has(idx) && canonicalId(gallery) === wantedId);
      if (!matches.length) return null;
      let selected = matches[0];
      if (wantedId === 'our-brands') {
        selected = matches.slice().sort((a, b) => getBrandGalleryContentScore(b.gallery) - getBrandGalleryContentScore(a.gallery))[0];
      }
      used.add(selected.idx);
      return selected.gallery;
    };
    const brandsSource = findSourceFor('our-brands') || makeBrandsGallery();
    const brandsGallery = applyGalleryBlueprint(brandsSource, 0, BRANDS_GALLERY_BLUEPRINT);
    brandsGallery.meta = ensureGalleryMeta({
      ...brandsGallery.meta,
      label: 'our-brands',
      slug: 'our-brands',
      adminLabelHe: String(brandsGallery.meta?.adminLabelHe || 'מותגים')
    });
    const mappedRegulars = MAIN_GALLERY_BLUEPRINTS.map((blueprint, idx) => {
      const source = findSourceFor(blueprint.galleryId);
      return applyGalleryBlueprint(source || makeGallery(idx + 1, blueprint), idx + 1, blueprint);
    });
    const extras = list
      .map((gallery, idx) => ({ gallery, idx, id: canonicalId(gallery) }))
      .filter(({ gallery, idx, id }) => {
        if (used.has(idx)) return false;
        if (!gallery) return false;
        if (id === 'our-brands' || id === SUPER_GALLERY_ID) return false;
        if (isSuperSubGallery(gallery)) return false;
        if (MAIN_GALLERY_BLUEPRINTS.some((bp) => bp.galleryId === id || bp.label === id)) return false;
        return true;
      })
      .map(({ gallery }, extraIndex) => normalizeGallery(gallery, MAIN_GALLERY_BLUEPRINTS.length + extraIndex + 1));
    return ensureSuperSubGalleries([brandsGallery, ...mappedRegulars, ...extras, ...list.filter(isSuperSubGallery)]);
  }

const normalizeMedia = (m, galleryIndex, tileIndex, mediaIndex) => ({
    id: String(m?.id || `${Date.now()}-${galleryIndex}-${tileIndex}-${mediaIndex}`),
    type: String(m?.type || 'image'),
    src: String(m?.src || ''),
    title: String(m?.title || ''),
    desc: String(m?.desc || ''),
    useOwnText: m?.useOwnText === true,
    fileName: String(m?.fileName || m?.name || ''),
    storageBucket: String(m?.storageBucket || ''),
    storagePath: String(m?.storagePath || ''),
    isVisible: m?.isVisible !== false,
    isEnabled: m?.isEnabled !== false
  });

const normalizeTile = (tile, galleryIndex, tileIndex) => ({
    tileId: tile?.tileId || `gallery-${galleryIndex + 1}-tile-${String(tileIndex + 1).padStart(2,'0')}`,
    meta: { client: String(tile?.meta?.client || ''), brand: String(tile?.meta?.brand || '') },
    overlay: {
      title: String(tile?.overlay?.title || 'שם הפרויקט'),
      desc: String(tile?.overlay?.desc || 'תיאור קצר של הפרויקט'),
      link: String(tile?.overlay?.link || '')
    },
    display: { openLinkInNewTab: tile?.display?.openLinkInNewTab === true, showLinkInTile: tile?.display?.showLinkInTile === true, multiItemMode: tile?.display?.multiItemMode === true, perImageText: tile?.display?.perImageText === true },
    brandConfig: {
      enableLightbox: tile?.brandConfig?.enableLightbox === true || (tile?.brandConfig?.enableLightbox == null && ((Array.isArray(tile?.media) && tile.media.some((m) => m?.src)) || (Array.isArray(tile?.brandConfig?.attachedWorkRefs) && tile.brandConfig.attachedWorkRefs.length))),
      attachedWorkRefs: Array.isArray(tile?.brandConfig?.attachedWorkRefs) ? tile.brandConfig.attachedWorkRefs.map((ref) => ({ galleryIndex: Number(ref?.galleryIndex || 0), tileIndex: Number(ref?.tileIndex || 0) })).filter((ref) => Number.isFinite(ref.galleryIndex) && Number.isFinite(ref.tileIndex)).slice(0, 18) : []
    },
    isVisible: tile?.isVisible !== false,
    media: Array.isArray(tile?.media) ? tile.media.map((m, i) => normalizeMedia(m, galleryIndex, tileIndex, i)).filter((m) => m.src) : []
  });

const normalizeGallery = (gallery, galleryIndex) => {
    const meta = ensureGalleryMeta({
      ...gallery?.meta,
      title: String(gallery?.meta?.title || `Gallery ${galleryIndex + 1}`),
      desc: String(gallery?.meta?.desc || ''),
      label: String(gallery?.meta?.label || gallery?.meta?.slug || `gallery-${galleryIndex + 1}`),
      slug: String(gallery?.meta?.slug || gallery?.meta?.label || `gallery-${galleryIndex + 1}`),
      adminLabelHe: String(gallery?.meta?.adminLabelHe || gallery?.meta?.labelHe || gallery?.meta?.adminNameHe || ''),
      titleMobile: gallery?.meta?.titleMobile,
      titleDesktop: gallery?.meta?.titleDesktop,
      titleExpanded: gallery?.meta?.titleExpanded,
      descMobile: gallery?.meta?.descMobile,
      descDesktop: gallery?.meta?.descDesktop,
      descExpanded: gallery?.meta?.descExpanded,
      expandedEnabled: gallery?.meta?.expandedEnabled,
      expandedCount: gallery?.meta?.expandedCount
    });
    const rawTiles = Array.isArray(gallery?.tiles) ? gallery.tiles.slice(0, MAX_TILES_PER_GALLERY) : [];
    const targetCount = Math.max(TILES_PER_GALLERY, rawTiles.length || TILES_PER_GALLERY);
    return {
      galleryId: gallery?.galleryId || `gallery-${galleryIndex + 1}`,
      meta,
      ui: { editMode: !!gallery?.ui?.editMode },
      tiles: Array.from({length:targetCount}, (_, tileIndex) => normalizeTile(rawTiles[tileIndex], galleryIndex, tileIndex))
    };
  };

const emptyGalleries = () => ensureAllGalleries([makeBrandsGallery(), ...MAIN_GALLERY_BLUEPRINTS.map((blueprint, galleryIndex) => makeGallery(galleryIndex + 1, blueprint))]);

function ensureSiteState(site = {}) {
    return {
      sectionFamily: 'sections',
      about: ensureAboutSection(site.about || site.aboutSection || {}),
      contact: ensureContactSection(site.contact || site.contactSection || {}),
      footer: ensureFooterSection(site.footer || site.footerSection || {}),
      accessibility: ensureAccessibilitySection(site.accessibility || site.accessibilitySection || {}),
      privacy: ensurePrivacySection(site.privacy || site.privacySection || {}),
      ui: site && typeof site.ui === 'object' ? { ...site.ui } : {},
      mediaFamilies: Array.isArray(site?.mediaFamilies) ? site.mediaFamilies.slice() : ['galleries','sections','brands','clients','ui','backups']
    };
  }

function isBrandGalleryObject(gallery) {
    const candidates = [gallery?.galleryId, gallery?.meta?.label, gallery?.meta?.slug]
      .map((v) => String(v || '').trim().toLowerCase())
      .filter(Boolean);
    return candidates.some((id) => id === 'our-brands' || id === 'brands' || id === 'brands-gallery');
  }

function getGalleryType(gallery) {
    if (isBrandGalleryObject(gallery)) return 'brands';
    const id = String(gallery?.galleryId || '');
    if (id === SUPER_GALLERY_ID) return 'master';
    if (isSuperSubGallery(gallery)) return 'child';
    return String(gallery?.meta?.galleryType || 'regular');
  }

function getGalleryParentId(gallery) {
    return isSuperSubGallery(gallery) ? SUPER_GALLERY_ID : String(gallery?.meta?.parentId || '');
  }

function ensureClientsState(clients = {}) {
    const items = clients && typeof clients.items === 'object' ? clients.items : {};
    return {
      items: { ...items },
      order: Array.isArray(clients?.order) ? clients.order.slice() : Object.keys(items)
    };
  }

function extractClientsState(currentGalleries) {
    const items = {};
    (Array.isArray(currentGalleries) ? currentGalleries : []).forEach((gallery) => {
      (Array.isArray(gallery?.tiles) ? gallery.tiles : []).forEach((tile) => {
        const value = String(tile?.meta?.client || '').trim();
        if (!value) return;
        const id = value.toLowerCase().replace(/[^a-z0-9֐-׿]+/g, '-').replace(/^-+|-+$/g, '') || `client-${Object.keys(items).length + 1}`;
        if (!items[id]) items[id] = { clientId: id, title: value, linkedBrandIds: [] };
      });
    });
    return ensureClientsState({ items, order: Object.keys(items) });
  }

function ensureBrandsState(brands = {}) {
    return {
      family: 'brands',
      title: String(brands?.title || ''),
      desc: String(brands?.desc || ''),
      items: Array.isArray(brands?.items) ? brands.items.map((item, idx) => ({
        brandId: String(item?.brandId || item?.id || `brand-${idx + 1}`),
        title: String(item?.title || ''),
        clientId: String(item?.clientId || ''),
        logoSrc: String(item?.logoSrc || item?.src || ''),
        storageBucket: String(item?.storageBucket || ''),
        storagePath: String(item?.storagePath || ''),
        attachedWorkRefs: Array.isArray(item?.attachedWorkRefs) ? item.attachedWorkRefs.map((ref) => ({ galleryId: String(ref?.galleryId || ''), tileId: String(ref?.tileId || '') })).filter((ref) => ref.galleryId || ref.tileId) : []
      })) : [],
      meta: brands && typeof brands.meta === 'object' ? { ...brands.meta } : {}
    };
  }

function extractBrandsState(currentGalleries) {
    const brandsGallery = (Array.isArray(currentGalleries) ? currentGalleries : []).find((gallery) => String(gallery?.galleryId || '').toLowerCase() === 'brands-gallery' || String(gallery?.meta?.label || '').toLowerCase() === 'our-brands');
    if (!brandsGallery) return ensureBrandsState({ items: [] });
    const items = (Array.isArray(brandsGallery.tiles) ? brandsGallery.tiles : []).map((tile, idx) => {
      const firstMedia = Array.isArray(tile?.media) ? tile.media.find((m) => m?.src) : null;
      return {
        brandId: String(tile?.tileId || `brand-${idx + 1}`),
        title: String(tile?.meta?.brand || tile?.overlay?.title || ''),
        clientId: String(tile?.meta?.client || ''),
        logoSrc: String(firstMedia?.src || ''),
        storageBucket: String(firstMedia?.storageBucket || ''),
        storagePath: String(firstMedia?.storagePath || ''),
        attachedWorkRefs: Array.isArray(tile?.brandConfig?.attachedWorkRefs) ? tile.brandConfig.attachedWorkRefs.map((ref) => {
          const galleryRef = currentGalleries?.[Number(ref?.galleryIndex || 0)]?.galleryId || '';
          const tileRef = currentGalleries?.[Number(ref?.galleryIndex || 0)]?.tiles?.[Number(ref?.tileIndex || 0)]?.tileId || '';
          return { galleryId: String(galleryRef || ''), tileId: String(tileRef || '') };
        }).filter((ref) => ref.galleryId || ref.tileId) : []
      };
    }).filter((item) => item.logoSrc || item.title);
    return ensureBrandsState({
      title: String(brandsGallery?.meta?.title || ''),
      desc: String(brandsGallery?.meta?.desc || ''),
      items,
      meta: { galleryId: String(brandsGallery?.galleryId || 'brands-gallery') }
    });
  }

function ensureRoutesState(routes = {}) {
    const items = routes && typeof routes.items === 'object' ? routes.items : {};
    return {
      items: { ...items },
      galleryOnlySectionOrder: Array.isArray(routes?.galleryOnlySectionOrder) ? routes.galleryOnlySectionOrder.slice() : ['header','contact','footer']
    };
  }

function extractRoutesState(currentGalleries) {
    const items = {};
    (Array.isArray(currentGalleries) ? currentGalleries : []).forEach((gallery) => {
      const type = getGalleryType(gallery);
      if (type === 'brands') return;
      const slug = String(gallery?.meta?.label || gallery?.galleryId || '').trim();
      if (!slug) return;
      items[slug] = {
        routeId: slug,
        slug,
        galleryId: String(gallery?.galleryId || ''),
        galleryType: type,
        enabled: gallery?.meta?.expandedEnabled === true || (Array.isArray(gallery?.tiles) && gallery.tiles.length >= 12),
        mode: 'gallery-only',
        minExpandedItems: 12
      };
    });
    return ensureRoutesState({ items });
  }

function buildStructuredGalleryState(currentGalleries) {
    const source = ensureAllGalleries(currentGalleries);
    const order = [];
    const items = {};
    source.forEach((gallery, galleryIndex) => {
      const id = String(gallery?.galleryId || `gallery-${galleryIndex + 1}`);
      const type = getGalleryType(gallery);
      if (type === 'brands') return;
      order.push(id);
      items[id] = {
        galleryId: id,
        type,
        parentId: getGalleryParentId(gallery),
        title: String(gallery?.meta?.title || ''),
        desc: String(gallery?.meta?.desc || ''),
        label: String(gallery?.meta?.label || ''),
        adminLabelHe: String(gallery?.meta?.adminLabelHe || ''),
        titleMobile: String(gallery?.meta?.titleMobile || ''),
        titleDesktop: String(gallery?.meta?.titleDesktop || ''),
        titleExpanded: String(gallery?.meta?.titleExpanded || ''),
        descMobile: String(gallery?.meta?.descMobile || ''),
        descDesktop: String(gallery?.meta?.descDesktop || ''),
        descExpanded: String(gallery?.meta?.descExpanded || ''),
        visible: gallery?.meta?.visible !== false,
        visibleMobile: gallery?.meta?.visibleMobile !== false,
        visibleDesktop: gallery?.meta?.visibleDesktop !== false,
        visibleExpanded: gallery?.meta?.visibleExpanded !== false,
        showExpandedButton: gallery?.meta?.showExpandedButton === true,
        expandedEnabled: gallery?.meta?.expandedEnabled === true,
        expandedCount: Number(gallery?.meta?.expandedCount || 9),
        routeSlug: String(gallery?.meta?.label || id),
        tileOrder: (Array.isArray(gallery?.tiles) ? gallery.tiles : []).map((tile) => String(tile?.tileId || '')),
        mediaFamily: 'galleries'
      };
    });
    return { order, items };
  }

function buildStructuredTilesState(currentGalleries) {
    const items = {};
    ensureAllGalleries(currentGalleries).forEach((gallery) => {
      const galleryId = String(gallery?.galleryId || '');
      (Array.isArray(gallery?.tiles) ? gallery.tiles : []).forEach((tile, tileIndex) => {
        const tileId = String(tile?.tileId || `${galleryId}-tile-${tileIndex + 1}`);
        items[tileId] = {
          tileId,
          galleryId,
          order: tileIndex,
          clientId: String(tile?.meta?.client || ''),
          brandId: String(tile?.meta?.brand || ''),
          title: String(tile?.overlay?.title || ''),
          shortDescription: String(tile?.overlay?.desc || ''),
          link: String(tile?.overlay?.link || ''),
          visible: tile?.isVisible !== false,
          brandConfig: tile?.brandConfig ? {...tile.brandConfig} : {},
          cover: String((Array.isArray(tile?.media) ? tile.media[0]?.src : '') || ''),
          files: Array.isArray(tile?.media) ? tile.media.map((media) => String(media?.src || '')).filter(Boolean) : [],
          filesMeta: Array.isArray(tile?.media) ? tile.media.map((media, mediaIndex) => ({
            id: String(media?.id || `${tileId}-media-${mediaIndex + 1}`),
            src: String(media?.src || ''),
            type: String(media?.type || 'image'),
            title: String(media?.title || ''),
            desc: String(media?.desc || ''),
            storageBucket: String(media?.storageBucket || ''),
            storagePath: String(media?.storagePath || ''),
            isVisible: media?.isVisible !== false
          })) : [],
          display: tile?.display && typeof tile.display === 'object' ? { ...tile.display } : {}
        };
      });
    });
    return { items };
  }

function hydrateWrapperShape(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const site = ensureSiteState(raw.site || {});
    const legacyGalleries = Array.isArray(raw.galleries) ? raw.galleries : null;
    const structuredGalleries = (!legacyGalleries && raw.galleries && typeof raw.galleries === 'object' && raw.galleries.items) ? raw.galleries : null;
    let nextGalleries = [];
    if (legacyGalleries) {
      nextGalleries = ensureAllGalleries(legacyGalleries);
    } else if (structuredGalleries) {
      const orderedIds = Array.isArray(structuredGalleries.order) ? structuredGalleries.order : Object.keys(structuredGalleries.items || {});
      const mapped = orderedIds.map((id, galleryIndex) => {
        const item = structuredGalleries.items?.[id] || {};
        return normalizeGallery({
          galleryId: item.galleryId || id,
          meta: {
            title: item.title || '',
            desc: item.desc || '',
            label: item.label || id,
            slug: item.routeSlug || item.slug || item.label || id,
            adminLabelHe: item.adminLabelHe || '',
            titleMobile: item.titleMobile || item.title || '',
            titleDesktop: item.titleDesktop || item.title || '',
            titleExpanded: item.titleExpanded || item.title || '',
            descMobile: item.descMobile || item.desc || '',
            descDesktop: item.descDesktop || item.desc || '',
            descExpanded: item.descExpanded || item.desc || '',
            expandedEnabled: item.expandedEnabled === true,
            expandedCount: item.expandedCount || 9,
            visible: item.visible !== false,
            visibleMobile: item.visibleMobile !== false,
            visibleDesktop: item.visibleDesktop !== false,
            visibleExpanded: item.visibleExpanded !== false,
            showExpandedButton: item.showExpandedButton === true,
            galleryType: item.type || item.galleryType || '',
            parentId: item.parentId || ''
          },
          tiles: (Array.isArray(item.tileOrder) ? item.tileOrder : Object.keys((raw.tiles || raw.tilesState)?.items || {}).filter(tileId => (raw.tiles || raw.tilesState).items[tileId]?.galleryId === (item.galleryId || id))).map(tileId => {
            const tile = (raw.tiles || raw.tilesState)?.items?.[tileId];
            if (!tile) return null;
            return {
              tileId, meta: {client: tile.clientId || '', brand: tile.brandId || ''},
              overlay: {title: tile.title || '', desc: tile.shortDescription || '', link: tile.link || ''},
              display: tile.display || {}, brandConfig: tile.brandConfig || {}, isVisible: tile.visible !== false,
              media: Array.isArray(tile.filesMeta) ? tile.filesMeta : (tile.files || []).map(src => ({src}))
            };
          }).filter(Boolean)
        }, galleryIndex);
      });
      nextGalleries = ensureAllGalleries(mapped);
    } else {
      nextGalleries = ensureAllGalleries(emptyGalleries());
    }
    return {
      ...raw,
      schema: raw.schema || CLOUD_SCHEMA,
      version: raw.version || VERSION,
      updatedAt: raw.updatedAt || '',
      source: raw.source || 'local',
      savedBy: raw.savedBy || '',
      syncMode: raw.syncMode || 'cloud-primary-local-fallback',
      site,
      aboutSection: site.about,
      contactSection: site.contact,
      footerSection: site.footer,
      accessibilitySection: site.accessibility,
      privacySection: site.privacy,
      galleries: nextGalleries,
      galleriesState: buildStructuredGalleryState(nextGalleries),
      tilesState: buildStructuredTilesState(nextGalleries),
      brandsState: ensureBrandsState(raw.brands || extractBrandsState(nextGalleries)),
      clientsState: ensureClientsState(raw.clients || extractClientsState(nextGalleries)),
      routesState: ensureRoutesState(raw.routes || extractRoutesState(nextGalleries))
    };
  }

function loadLocalWrapper(){return window.CRMO_RELEASE_SNAPSHOT || null;}

let localWrapper = loadLocalWrapper();

let siteState = ensureSiteState(localWrapper?.site || {});

let galleries = localWrapper?.galleries?.length ? ensureAllGalleries(localWrapper.galleries) : ensureAllGalleries(emptyGalleries());

let aboutSection = ensureAboutSection(localWrapper?.aboutSection || siteState.about || {});

let contactSection = ensureContactSection(localWrapper?.contactSection || siteState.contact || {});

let footerSection = ensureFooterSection(localWrapper?.footerSection || siteState.footer || {});

let accessibilitySection = ensureAccessibilitySection(localWrapper?.accessibilitySection || siteState.accessibility || {});

let privacySection = ensurePrivacySection(localWrapper?.privacySection || siteState.privacy || {});

let activeGalleryIndex = 0;

let activeSuperGalleryId = galleries.find((gallery) => isSuperSubGallery(gallery))?.galleryId || '';

const inlineExpandedGalleryIds = new Set();

try {
    const requestedPosCategory = getDedicatedRoute()?.posCategory || new URLSearchParams(window.location.search).get('posCategory');
    const requestedPosGallery = getSuperSubGalleries().find((gallery) =>
      requestedPosCategory && (gallery.galleryId === requestedPosCategory || gallery.meta?.slug === requestedPosCategory ||
        getPosBlueprint(Number(gallery.galleryId.slice(SUPER_SUB_PREFIX.length)) - 1)?.label === requestedPosCategory)
    );
    if (requestedPosGallery) activeSuperGalleryId = requestedPosGallery.galleryId;
  } catch (_) {}

let activeTileIndex = 0;

let activeMediaIndex = 0;

let tileEditorDraft = null;

let aboutEditorDraft = null;

let contactEditorDraft = null;

let footerEditorDraft = null;

let accessibilityEditorDraft = null;

let privacyEditorDraft = null;

let galleryManagerDraft = null;

const activeManagedMasterIds = {};

function mediaEl(item, cls = '') {
    if (!item?.src) return null;
    const isVideo = (item.type || '').startsWith('video') || /\.(mp4|webm|ogg)(\?|#|$)/i.test(item.src) || item.src.startsWith('data:video');
    const el = document.createElement(isVideo ? 'video' : 'img');
    if (isVideo) {
      el.src = item.src;
      el.controls = true;
      el.playsInline = true;
    } else {
      el.src = item.src;
      el.alt = item.title || '';
      el.loading = 'eager';
      el.decoding = 'async';
    }
    if (cls) el.className = cls;
    return el;
  }

function prettifyHoverUrl(url) {
    const clean = String(url || '').trim();
    if (!clean) return '';
    const wwwIndex = clean.search(/www\./i);
    const visible = wwwIndex >= 0 ? clean.slice(wwwIndex) : clean.replace(/^https?:\/\//i, '').replace(/^\/+/,'');
    return visible.replace(/\/$/, '');
  }

function isBrandGalleryIndex(galleryIndex) {
    return isBrandGalleryObject(galleries?.[galleryIndex]);
  }

function getTileTextForMedia(tile, galleryIndex, mediaIndex = 0) {
    if (isBrandGalleryIndex(galleryIndex)) {
      return {
        title: String(tile?.meta?.brand || tile?.overlay?.title || '').trim() || 'שם המותג',
        desc: String(tile?.meta?.client || '').trim()
      };
    }
    const overlayTitle = String(tile?.overlay?.title || tile?.meta?.brand || '').trim() || 'שם הפרויקט';
    const overlayDesc = String(tile?.overlay?.desc || '').trim() || 'תיאור קצר על הפרויקט';
    const media = Array.isArray(tile?.media) ? tile.media[mediaIndex] || null : null;
    const useOwnText = !!(tile?.display?.perImageText === true && media && media.useOwnText === true);
    return {
      title: useOwnText && String(media?.title || '').trim() ? String(media.title || '').trim() : overlayTitle,
      desc: useOwnText && String(media?.desc || '').trim() ? String(media.desc || '').trim() : overlayDesc
    };
  }

function getPrimaryTileName(tile, galleryIndex, mediaIndex = 0) {
    return getTileTextForMedia(tile, galleryIndex, mediaIndex).title;
  }

function getPrimaryTileDesc(tile, galleryIndex, mediaIndex = 0) {
    return getTileTextForMedia(tile, galleryIndex, mediaIndex).desc;
  }

function createGalleryCard(gallery, galleryIndex, tile, tileIndex, editEnabled) {
    const card = document.createElement('div');
    card.className = 'crmo3045-tile-wrap';
    const isBrandsGallery = isBrandGalleryObject(gallery);
    const first = tile.media[0] || null;
    const meta = [gallery.meta.label, tile.meta.client, tile.meta.brand].filter(Boolean).join(' · ');
    const brandInteractive = !isBrandsGallery || isBrandTileInteractive(tile);
    const hoverTitle = isBrandsGallery ? (tile.meta.brand || tile.overlay.title || 'מותג') : getPrimaryTileName(tile, galleryIndex);
    const hoverDesc = isBrandsGallery ? (brandInteractive ? 'צפיה בפרויקטי המותג' : '') : getPrimaryTileDesc(tile, galleryIndex);
    const hoverLink = prettifyHoverUrl(tile.overlay.link || '');
    card.innerHTML = `
      ${editEnabled ? `<button class="crmo3045-pencil" type="button" aria-label="Edit tile ${tileIndex + 1} in gallery ${galleryIndex + 1}">✎</button>` : ''}
      <article class="crmo3045-tile" tabindex="0" aria-label="Gallery ${galleryIndex + 1} tile ${tileIndex + 1}">
        ${first ? '' : `<div class="crmo3045-fallback">${isBrandsGallery ? 'BRAND' : 'CRMO TILE<br>16:9'}</div>`}
        <div class="crmo3045-hover">
          <div class="crmo3045-hover-title">${escape(hoverTitle)}</div>
          <div class="crmo3045-hover-desc">${escape(hoverDesc)}</div>
          <a class="crmo3045-hover-link${hoverLink && tile.display?.showLinkInTile !== false ? ' is-visible' : ''}" ${tile.overlay.link && tile.display?.showLinkInTile !== false ? `href="${escape(tile.overlay.link)}"${tile.display?.openLinkInNewTab !== false ? ' target="_blank" rel="noopener"' : ''}` : ''}>${escape(tile.display?.showLinkInTile !== false ? hoverLink : '')}</a>
        </div>
      </article>
      <div class="crmo3045-copy">
        <div class="crmo3045-meta">${escape(meta || tile.tileId)}</div>
        <div class="crmo3045-name">${escape(hoverTitle)}</div>
        <div class="crmo3045-desc">${escape(hoverDesc)}</div>
        <div class="crmo3045-count">${tile.media.length} media · G${galleryIndex + 1}/T${tileIndex + 1}</div>
      </div>
    `;
    const article = card.querySelector('.crmo3045-tile');
    if (first) {
      const preview = mediaEl(first, 'crmo3045-tile-media');
      if (preview?.tagName === 'IMG') {
        preview.loading = gallery.galleryId === 'intro' && tileIndex < 4 ? 'eager' : 'lazy';
        preview.fetchPriority = gallery.galleryId === 'intro' && tileIndex < 2 ? 'high' : 'auto';
      } else if (preview?.tagName === 'VIDEO') {
        preview.preload = 'metadata';
        preview.controls = false;
      }
      if (preview) article.appendChild(preview);
    }
    article.classList.toggle('is-disabled', !brandInteractive);
    if (!brandInteractive) {
      article.setAttribute('aria-disabled', 'true');
      article.tabIndex = -1;
    }
    const hoverLinkEl = card.querySelector('.crmo3045-hover-link');
    hoverLinkEl?.addEventListener('click', (e) => e.stopPropagation());
    const pencilBtn = card.querySelector('.crmo3045-pencil');
    pencilBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      void 0;
    });
    article.addEventListener('click', () => {
      if (!brandInteractive) return;
      openLightbox(galleryIndex, tileIndex, 0);
    });
    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!brandInteractive) return;
        openLightbox(galleryIndex, tileIndex, 0);
      }
    });
    return card;
  }

function getAboutDisplayMode() {
    if (getDedicatedRoute()) return 'expanded';
    const qp = new URLSearchParams(String(window.location.search || ''));
    const forced = String(qp.get('view') || qp.get('mode') || qp.get('display') || '').toLowerCase();
    if (forced === 'expanded' || forced === 'extended') return 'expanded';
    if (qp.get('expanded') === '1') return 'expanded';
    const width = Math.max(window.innerWidth || 0, document.documentElement?.clientWidth || 0);
    if (width <= 700) return 'mobile';
    return 'desktop';
  }

function getAboutLogoForMode(modeOverride, stateOverride) {
    const src = ensureAboutSection(stateOverride || aboutSection);
    const mode = ['mobile','desktop','expanded'].includes(String(modeOverride || '').toLowerCase()) ? String(modeOverride).toLowerCase() : getAboutDisplayMode();
    const map = { mobile: src.logoSrcMobile, desktop: src.logoSrcDesktop, expanded: src.logoSrcExpanded };
    return String(map[mode] || src.logoSrcDesktop || src.logoSrcMobile || src.logoSrcExpanded || src.logoSrc || '').trim();
  }

function getContactDisplayMode() {
    return window.matchMedia('(max-width: 700px)').matches ? 'mobile' : 'desktop';
  }

function formatWhatsappHref(raw) {
    const digits = String(raw || '').replace(/\D+/g, '');
    if (!digits) return '#';
    const normalized = digits.startsWith('972') ? digits : (digits.startsWith('0') ? `972${digits.slice(1)}` : digits);
    return `https://wa.me/${normalized}`;
  }

function renderContactSection(editEnabled) {
    const sectionState = (contactDialog && contactDialog.open && contactEditorDraft)
      ? ensureContactSection(contactEditorDraft)
      : ensureContactSection(contactSection);
    const mode = getContactDisplayMode();
    const titleText = String(mode === 'mobile' ? (sectionState.titleMobile || sectionState.title) : sectionState.title).trim();
    const descText = String(mode === 'mobile' ? (sectionState.descMobile || sectionState.desc) : sectionState.desc).trim();
    const section = document.createElement('section');
    section.className = 'crmo3047-contact-section';
    section.id = 'contact';
    const socials = ['linkedin','facebook','instagram'].map((key) => {
      const item = sectionState.socials[key];
      const classes = item.enabled && item.url ? '' : ' is-soon';
      const href = item.enabled && item.url ? escape(item.url) : '#';
      return `<a aria-label="${key}" href="${href}" class="${classes}"${item.enabled && item.url ? ' target="_blank" rel="noopener"' : ''}><img alt="" loading="lazy" decoding="async" src="${escape(item.icon)}"></a>`;
    }).join('');
    section.innerHTML = `
      <div class="crmo3047-contact-wrap">
        ${editEnabled ? `<button class="crmo3045-pencil crmo3045-contact-pencil" type="button" data-contact-editor aria-label="עריכת סקשן צור קשר">✎</button>` : ''}
        <div class="crmo3047-contact-narrow">
          <h2 class="crmo3047-contact-title">${escape(titleText)}</h2>
          <p class="crmo3047-contact-desc">${escape(descText)}</p>
        </div>
        <div class="crmo3047-contact-form-wrap">
          <form action="#" class="crmo3047-contact-form" method="post" onsubmit="return false;">
            <div class="crmo3047-contact-grid">
              <input placeholder="שם העסק">
              <input class="crmo3047-contact-select" dir="rtl" name="sector" list="crmo3047SectorList" required placeholder="מה תחום העיסוק שלכם?">
              <datalist id="crmo3047SectorList">
                <option value="מוצרי צריכה (FMCG)"></option>
                <option value="קמעונאות / רשתות שיווק"></option>
                <option value="הייטק / טכנולוגיה"></option>
                <option value="שירותים / פיננסים"></option>
                <option value="תעשייה / B2B"></option>
                <option value="אחר"></option>
              </datalist>
              <input class="crmo3047-contact-select" dir="rtl" name="service" list="crmo3047ServiceList" required placeholder="באיזה שירות אתם מעוניינים?">
              <datalist id="crmo3047ServiceList">
                <option value="עיצוב פנים מסחרי"></option>
                <option value="מיתוג וזהות עסקית"></option>
                <option value="תערוכות"></option>
                <option value="עיצוב מוצר"></option>
                <option value="סטנדים (POP/POS)"></option>
                <option value="אחר"></option>
              </datalist>
              <input placeholder="איש קשר">
              <input dir="ltr" inputmode="tel" type="tel" placeholder="טלפון">
              <input type="email" placeholder="מייל">
              <textarea class="autogrow" placeholder="כתבו כאן בקצרה על העסק, האתגר והחזון הנקודתי שלכם."></textarea>
            </div>
            <div class="crmo3047-contact-actions"><button class="crmo3047-contact-submit" type="submit">שלח</button></div>
          </form>
        </div>
      </div>
    `;
    section.querySelector('[data-contact-editor]')?.addEventListener('click', () => void 0);
    galleryStack.appendChild(section);

    const bar = document.createElement('section');
    bar.className = 'crmo3047-contact-bar';
    bar.id = 'contact-bar';
    bar.innerHTML = `
      <div class="crmo3047-contact-row">
        <div class="crmo3047-contact-phone"><a class="tel" dir="ltr" href="${escape(formatWhatsappHref(sectionState.whatsapp))}" rel="noopener" target="_blank"><img alt="" loading="lazy" decoding="async" src="${escape(sectionState.whatsappIcon)}"><span>${escape(sectionState.whatsapp)}</span></a></div>
        <div class="crmo3047-contact-mail"><a class="mail" href="mailto:${escape(sectionState.email)}"><img alt="" loading="lazy" decoding="async" src="${escape(sectionState.emailIcon)}"><span>${escape(sectionState.email)}</span></a></div>
      </div>
      <div class="crmo3047-contact-social-wrap">
        <div class="crmo3047-contact-social-text">${escape(sectionState.socialText)}</div>
        <div class="crmo3047-contact-icons">${socials}</div>
      </div>`;
    galleryStack.appendChild(bar);
  }

function renderFooterSection(editEnabled) {
    const sectionState = (footerDialog && footerDialog.open && footerEditorDraft)
      ? ensureFooterSection(footerEditorDraft)
      : ensureFooterSection(footerSection);
    const footer = document.createElement('footer');
    footer.className = 'crmo3047-footer';
    footer.id = 'crmo-footer';
    footer.innerHTML = `
      <div class="crmo3047-footer-inner">
        ${editEnabled ? `<button class="crmo3045-pencil" type="button" data-footer-editor aria-label="עריכת פוטר">✎</button>` : ''}
        <div class="crmo3047-footer-top"></div>
        <div class="crmo3047-footer-bottom" dir="ltr">
          <img class="crmo3047-footer-favicon" src="${escape(sectionState.iconSrc)}" alt="Creative Monster favicon">
          <span class="crmo3047-footer-credit" id="crmo-footer-credit-text">${escape(sectionState.creditText)}</span>
          <span class="crmo3047-footer-version" id="crmo-footer-version">${escape(`CRMO_v${window.CRMO_CONFIG?.release || "3288"}`)}</span>
        </div>
      </div>`;
    footer.querySelector('[data-footer-editor]')?.addEventListener('click', () => void 0);
    galleryStack.appendChild(footer);
  }

function openPrivacyPanel() {
    const state = (privacyDialog && privacyDialog.open && privacyEditorDraft) ? ensurePrivacySection(privacyEditorDraft) : ensurePrivacySection(privacySection);
    byId('crmo3047PrivacyPanelTitle').textContent = state.title || '';
    byId('crmo3047PrivacyPanelSubtitle').textContent = state.subtitle || '';
    byId('crmo3047PrivacyPanelBody').textContent = state.body || '';
    byId('crmo3047PrivacyPanel').classList.add('is-open');
  }

function renderLegalSection(editEnabled) {
    const accState = (accessibilityDialog && accessibilityDialog.open && accessibilityEditorDraft) ? ensureAccessibilitySection(accessibilityEditorDraft) : ensureAccessibilitySection(accessibilitySection);
    const privState = (privacyDialog && privacyDialog.open && privacyEditorDraft) ? ensurePrivacySection(privacyEditorDraft) : ensurePrivacySection(privacySection);
    const section = document.createElement('section');
    section.className = 'crmo3047-legal accessibility-statement';
    section.id = 'accessibility';
    section.innerHTML = `
      <div class="crmo3047-legal-inner">
        <div class="crmo3047-legal-head">
          <div class="crmo3047-legal-actions">
            <button class="crmo3047-legal-btn" type="button" data-acc-toggle aria-expanded="false">${escape(accState.toggleLabel)}</button>
            <button class="crmo3047-legal-btn" type="button" data-open-privacy>${escape(privState.toggleLabel)}</button>
            ${editEnabled ? `<button class="crmo3045-pencil" type="button" data-accessibility-editor aria-label="עריכת הצהרת נגישות">✎</button>` : ''}
            ${editEnabled ? `<button class="crmo3045-pencil" type="button" data-privacy-editor aria-label="עריכת מדיניות פרטיות">✎</button>` : ''}
          </div>
        </div>
        <div class="crmo3047-legal-body" data-acc-body hidden>
          <p>${escape(accState.p1)}</p>
          <p>${escape(accState.p2)}</p>
          <p>${escape(accState.p3)}</p>
        </div>
      </div>`;
    const accToggle = section.querySelector('[data-acc-toggle]');
    const accBody = section.querySelector('[data-acc-body]');
    accToggle?.addEventListener('click', () => {
      const open = accBody.hasAttribute('hidden');
      if (open) { accBody.removeAttribute('hidden'); accToggle.setAttribute('aria-expanded','true'); }
      else { accBody.setAttribute('hidden',''); accToggle.setAttribute('aria-expanded','false'); }
    });
    section.querySelector('[data-open-privacy]')?.addEventListener('click', openPrivacyPanel);
    section.querySelector('[data-accessibility-editor]')?.addEventListener('click', (()=>{}));
    section.querySelector('[data-privacy-editor]')?.addEventListener('click', (()=>{}));
    galleryStack.appendChild(section);
  }

function renderAboutSection(editEnabled) {
    const sectionState = (aboutDialog && aboutDialog.open && aboutEditorDraft)
      ? ensureAboutSection(aboutEditorDraft)
      : ensureAboutSection(aboutSection);
    const mode = getAboutDisplayMode();
    const titleMap = { mobile: sectionState.titleMobile, desktop: sectionState.titleDesktop, expanded: sectionState.titleExpanded };
    const descMap = { mobile: sectionState.descMobile, desktop: sectionState.descDesktop, expanded: sectionState.descExpanded };
    const showTitleMap = { mobile: sectionState.showTitleMobile !== false, desktop: sectionState.showTitleDesktop !== false, expanded: sectionState.showTitleExpanded !== false };
    const showTextMap = { mobile: sectionState.showTextMobile !== false, desktop: sectionState.showTextDesktop !== false, expanded: sectionState.showTextExpanded !== false };
    const showMediaMap = { mobile: sectionState.showMediaMobile !== false, desktop: sectionState.showMediaDesktop !== false, expanded: sectionState.showMediaExpanded !== false };
    const titleText = String((titleMap[mode] || sectionState.titleDesktop || sectionState.titleMobile || sectionState.titleExpanded || sectionState.title || 'על הסטודיו')).trim();
    const descText = String((descMap[mode] || sectionState.descDesktop || sectionState.descMobile || sectionState.descExpanded || sectionState.desc || '')).trim();
    const showTitle = !!showTitleMap[mode];
    const showText = !!showTextMap[mode];
    const logoSrc = getAboutLogoForMode(mode, sectionState);
    const showMedia = !!showMediaMap[mode] && !!logoSrc;
    const section = document.createElement('section');
    section.className = 'crmo3047-gallery crmo3047-about-section';
    section.dataset.sectionId = 'about';
    section.id = 'about';
    const logoHtml = showMedia ? `<div class="crmo3047-about-logo"><img src="${escape(logoSrc)}" alt="" loading="lazy"></div>` : '';
    section.innerHTML = `
      ${editEnabled ? `<button class="crmo3045-pencil" type="button" data-about-editor aria-label="עריכת סקשן על הסטודיו">✎</button>` : ''}
      <div class="crmo3047-about-inner" data-about-mode="${escape(mode)}">
        ${logoHtml}
        ${showTitle ? `<h2 class="crmo3047-about-title">${escape(titleText || 'על הסטודיו')}</h2>` : ''}
        ${showText ? `<p class="crmo3047-about-text">${escape(descText || '')}</p>` : ''}
      </div>
    `;
    section.querySelector('[data-about-editor]')?.addEventListener('click', () => void 0);
    galleryStack.appendChild(section);
  }

function getGalleryLookupId(gallery) { return String(gallery?.galleryId || gallery?.meta?.label || '').trim(); }

function isManagedChildGallery(gallery) { return isSuperSubGallery(gallery) || (String(gallery?.meta?.galleryType || '') === 'child' && !!String(gallery?.meta?.parentId || '')); }

function isManagedMasterGallery(gallery) { return String(gallery?.meta?.galleryType || '') === 'master'; }

function getCanonicalManagerId(id) {
    const value = String(id || '').trim();
    const lowered = value.toLowerCase();
    if (!lowered) return '';
    if (lowered === 'brands' || lowered === 'brands-gallery' || lowered === 'our-brands') return 'our-brands';
    if (lowered === 'all-works' || lowered === 'כל העבודות') return '';
    if (lowered === SUPER_GALLERY_ID) return SUPER_GALLERY_ID;
    const stable = galleries.find((gallery) => !isManagedChildGallery(gallery) &&
      String(gallery?.galleryId || '').trim().toLowerCase() === lowered);
    if (stable) return getGalleryLookupId(stable);
    const matches = galleries.filter((gallery) => !isManagedChildGallery(gallery) &&
      [gallery?.meta?.slug, gallery?.meta?.label, gallery?.meta?.adminLabelHe]
        .some((candidate) => String(candidate || '').trim().toLowerCase() === lowered));
    return matches.length === 1 ? getGalleryLookupId(matches[0]) : '';
  }

function getDefaultManagerOrder() {
    const order = [];
    const push = (id) => { const clean = getCanonicalManagerId(id); if (clean && !order.includes(clean)) order.push(clean); };
    MAIN_RENDER_ORDER.forEach(push);
    galleries.forEach((gallery) => {
      if (!gallery || isManagedChildGallery(gallery) || isSuperSubGallery(gallery)) return;
      push(getGalleryLookupId(gallery));
    });
    return order;
  }

function normalizeGalleryManagerState(state = {}) {
    const defaultOrder = getDefaultManagerOrder();
    const isCurrentManager = state && state.version === GALLERY_MANAGER_VERSION;
    const rawItems = isCurrentManager && typeof state.items === 'object' ? state.items : {};
    const items = {};
    Object.keys(rawItems || {}).forEach((key) => {
      const clean = getCanonicalManagerId(key);
      if (clean && !items[clean]) items[clean] = { ...rawItems[key], visibleExpanded: true };
    });
    const collapsedMasters = {};
    if (isCurrentManager && state.collapsedMasters && typeof state.collapsedMasters === 'object') {
      Object.entries(state.collapsedMasters).forEach(([key, value]) => {
        const clean = getCanonicalManagerId(key);
        if (clean) collapsedMasters[clean] = value;
      });
    }
    const baseOrder = isCurrentManager && Array.isArray(state?.order) && state.order.length ? state.order.map(String) : defaultOrder;
    const order = [];
    const push = (id) => { const clean = getCanonicalManagerId(id); if (clean && !order.includes(clean)) order.push(clean); };
    baseOrder.forEach(push);
    defaultOrder.forEach(push);
    Object.keys(items).forEach((key) => { items[key].visibleExpanded = true; }); return { version: GALLERY_MANAGER_VERSION, order, items, collapsedMasters };
  }

function getGalleryManagerState() { siteState.ui = siteState.ui && typeof siteState.ui === 'object' ? siteState.ui : {}; siteState.ui.galleryManager = normalizeGalleryManagerState(siteState.ui.galleryManager || {}); return siteState.ui.galleryManager; }

function getManagerItem(id) { const manager = normalizeGalleryManagerState(galleryManagerDraft || siteState?.ui?.galleryManager || {}); return manager.items?.[id] || {}; }

function getCurrentViewMode() { return getAboutDisplayMode(); }

function isManagerItemVisible(id) { const item = getManagerItem(id); if (item.visible === false) return false; const mode = getCurrentViewMode(); if (mode === 'mobile' && item.visibleMobile === false) return false; if (mode === 'desktop' && item.visibleDesktop === false) return false; return true; }

function findGalleryByManagerId(id) { return galleries.find((gallery) => getGalleryLookupId(gallery) === id || String(gallery?.galleryId || '') === id) || null; }

function findGalleryIndexByManagerId(id) { return galleries.findIndex((gallery) => getGalleryLookupId(gallery) === id || String(gallery?.galleryId || '') === id); }

function getChildrenForMaster(masterId) { if (masterId === SUPER_GALLERY_ID) return getSuperSubGalleries(); return galleries.filter((gallery) => isManagedChildGallery(gallery) && String(gallery?.meta?.parentId || '') === masterId); }

function getManagerDisplayName(id) { if (id === SUPER_GALLERY_ID) return 'נקודות מכירה'; const gallery = findGalleryByManagerId(id); return String(gallery?.meta?.adminLabelHe || gallery?.meta?.title || gallery?.meta?.label || gallery?.galleryId || id).trim() || id; }

function getManagerRenderOrder() { return normalizeGalleryManagerState(siteState?.ui?.galleryManager || {}).order; }

function getSiteRootUrl(){const u=new URL(window.CRMO_ROOT_URL || new URL("./",location.href));u.search="";u.hash="";return u;}

function getDedicatedRoute() {
    if (window.location.protocol === 'file:') return null;
    const segments = window.location.pathname.split('/').filter(Boolean).map((part) => {
      try { return decodeURIComponent(part).toLowerCase(); } catch (_) { return ''; }
    });
    if (segments[0] === 'crmo-smart') segments.shift();
    if (!segments.length || segments.some((part) => !/^[a-z0-9-]+$/.test(part))) return null;
    if (segments[0] === 'pos' && segments.length <= 2) {
      const slug = segments[1] || 'all-works';
      if (!POS_GALLERY_BLUEPRINTS.some((item) => item.label === slug)) return null;
      return { managerId: SUPER_GALLERY_ID, posCategory: slug };
    }
    if (segments.length !== 1) return null;
    const gallery = galleries.find((item) =>
      !isManagedChildGallery(item) && !isSuperSubGallery(item) &&
      (item.galleryId === segments[0] || item.meta?.slug === segments[0])
    );
    return gallery ? { managerId: getGalleryLookupId(gallery), posCategory: '' } : null;
  }

function getExpandedRequestedManagerId() {
    const route = getDedicatedRoute();
    if (route) return route.managerId;
    if (getAboutDisplayMode() !== 'expanded') return '';
    try {
      const qp = new URLSearchParams(String(window.location.search || ''));
      const clean = getCanonicalManagerId(qp.get('gallery') || qp.get('section') || '');
      return clean && (clean === SUPER_GALLERY_ID ? getSuperSubGalleries().length > 0 : !!findGalleryByManagerId(clean)) ? clean : '';
    } catch (_) {
      return '';
    }
  }

function isExpandedTarget(id) {
    const target = getExpandedRequestedManagerId();
    return !!target && getCanonicalManagerId(id) === target;
  }

function getExpandedTileLimitFor(id, gallery, item = getManagerItem(id)) {
    const inlineKey = getInlineExpandedKey(id, gallery);
    const compactLimit = isBrandGalleryObject(gallery) ? BRANDS_STACK_TILE_LIMIT : STACK_TILE_LIMIT;
    if (!isExpandedTarget(id) && !inlineExpandedGalleryIds.has(inlineKey)) return compactLimit;
    const fullCount = getFullTileCountForExpanded(gallery?.tiles || []);
    if (fullCount <= compactLimit) return compactLimit;
    const requested = Number(gallery?.meta?.expandedCount || item?.expandedCount || 0);
    if (requested > compactLimit) return Math.min(requested, fullCount, MAX_TILES_PER_GALLERY);
    return Math.min(fullCount, MAX_TILES_PER_GALLERY);
  }

function getExpandedTileCountForManagerId(id) {
    let gallery = null;
    if (id === SUPER_GALLERY_ID) {
      const subs = getSuperSubGalleries();
      gallery = subs.find((g) => getGalleryLookupId(g) === activeSuperGalleryId) || subs[0] || null;
    } else {
      const candidate = findGalleryByManagerId(id);
      if (candidate && isManagedMasterGallery(candidate)) {
        const children = getChildrenForMaster(id);
        const activeId = activeManagedMasterIds[id] || getGalleryLookupId(children[0] || {});
        gallery = children.find((g) => getGalleryLookupId(g) === activeId) || children[0] || candidate;
      } else {
        gallery = candidate;
      }
    }
    return getFullTileCountForExpanded(gallery?.tiles || []);
  }

function isExpandedButtonEligible(id, item = getManagerItem(id)) {
    // Stores can expose a seventh published project while keeping six cards in the main grid.
    if (id === 'stores' && item?.showExpandedButton === true) {
      return getExpandedTileCountForManagerId(id) > STACK_TILE_LIMIT;
    }
    const min = Math.max(MIN_EXPANDED_FULL_TILES, Number(item?.expandedCount || item?.minExpandedItems || MIN_EXPANDED_FULL_TILES) || MIN_EXPANDED_FULL_TILES);
    return getExpandedTileCountForManagerId(id) >= min;
  }

function getInlineExpandedKey(id, gallery) {
    return id === SUPER_GALLERY_ID || isManagedMasterGallery(findGalleryByManagerId(id))
      ? `${id}:${gallery?.galleryId || ''}`
      : id;
  }

function getDisplayedGalleryForManagerId(id) {
    if (id === SUPER_GALLERY_ID) return getSuperSubGalleries().find((gallery) => gallery.galleryId === activeSuperGalleryId) || null;
    const gallery = findGalleryByManagerId(id);
    if (!isManagedMasterGallery(gallery)) return gallery;
    return getChildrenForMaster(id).find((child) => getGalleryLookupId(child) === activeManagedMasterIds[id]) || null;
  }

function addExpandedLinkIfNeeded(section, id) {
    if (getExpandedRequestedManagerId()) return;
    const item = getManagerItem(id);
    const gallery = id === SUPER_GALLERY_ID ? null : findGalleryByManagerId(id);
    const enabled = item.showExpandedButton === true || gallery?.meta?.expandedEnabled === true;
    if (!enabled) return;
    if (!isExpandedButtonEligible(id, item)) return;
    const grid = section.querySelector('[data-gallery-grid], [data-super-grid]');
    if (!grid) return;
    const row = document.createElement('div');
    row.className = 'crmo3263-expanded-link-row';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'crmo3263-expanded-link';
    const displayedGallery = getDisplayedGalleryForManagerId(id);
    const key = getInlineExpandedKey(id, displayedGallery);
    button.textContent = inlineExpandedGalleryIds.has(key) ? 'הצג פחות' : 'עבודות נוספות';
    button.addEventListener('click', () => {
      const selected = getDisplayedGalleryForManagerId(id);
      if (!selected) return;
      const selectedKey = getInlineExpandedKey(id, selected);
      if (inlineExpandedGalleryIds.has(selectedKey)) inlineExpandedGalleryIds.delete(selectedKey);
      else inlineExpandedGalleryIds.add(selectedKey);
      const galleryIndex = galleries.indexOf(selected);
      grid.replaceChildren();
      let rendered = 0;
      const limit = getExpandedTileLimitFor(id, selected, item);
      (selected.tiles || []).forEach((tile, tileIndex) => {
        if (rendered >= limit || tile?.isVisible === false) return;
        grid.appendChild(createGalleryCard(selected, galleryIndex, tile, tileIndex, canEdit()));
        rendered += 1;
      });
      button.textContent = inlineExpandedGalleryIds.has(selectedKey) ? 'הצג פחות' : 'עבודות נוספות';
    });
    row.appendChild(button);
    const parent = grid.closest('.crmo3047-super-body') || grid.parentElement || section;
    if (grid.parentElement === parent) parent.insertBefore(row, grid.nextSibling);
    else parent.appendChild(row);
  }

function renderManagedMasterSection(masterGallery, managerId, editEnabled) { const children = getChildrenForMaster(managerId).filter((child) => isManagerItemVisible(getGalleryLookupId(child))); if (!children.length) return; let activeId = activeManagedMasterIds[managerId] || getGalleryLookupId(children[0]); let activeGallery = children.find((gallery) => getGalleryLookupId(gallery) === activeId) || children[0]; activeManagedMasterIds[managerId] = getGalleryLookupId(activeGallery); const activeGalleryIndex = galleries.findIndex((gallery) => gallery === activeGallery); const section = document.createElement('section'); section.className = 'crmo3047-gallery is-super-gallery'; section.id = managerId; section.dataset.galleryIndex = 'managed-master'; section.innerHTML = `<div class="crmo3047-gallery-head"><div class="crmo3047-gallery-copy"><div class="crmo3047-gallery-title">${escape(getGalleryDisplayCopy(masterGallery).title || getManagerDisplayName(managerId))}</div><div class="crmo3047-gallery-desc">${escape(getGalleryDisplayCopy(masterGallery).desc)}</div></div></div><div class="crmo3047-super-gap"><div class="crmo3047-super-nav" data-super-nav></div><div class="crmo3047-super-body"><div class="crmo3047-super-tools">${editEnabled && activeGalleryIndex >= 0 ? `<button class="crmo3045-btn" type="button" data-managed-gallery-editor>ניהול גלריה</button>` : ``}</div><div class="crmo3045-grid" data-super-grid></div></div></div>`; const nav = section.querySelector('[data-super-nav]'); children.forEach((gallery) => { const gid = getGalleryLookupId(gallery); const btn = document.createElement('button'); btn.type = 'button'; btn.className = `crmo3047-super-btn${gid === activeManagedMasterIds[managerId] ? ' is-active' : ''}`; btn.textContent = String(gallery?.meta?.adminLabelHe || gallery?.meta?.title || gid); btn.addEventListener('click', () => { activeManagedMasterIds[managerId] = gid; renderGalleryStack(); }); nav.appendChild(btn); }); const grid = section.querySelector('[data-super-grid]'); let visibleRendered = 0; const renderLimit = getExpandedTileLimitFor(managerId, activeGallery); (activeGallery.tiles || []).forEach((tile, tileIndex) => { if (visibleRendered >= renderLimit) return; if (tile?.isVisible === false) return; grid.appendChild(createGalleryCard(activeGallery, activeGalleryIndex, tile, tileIndex, editEnabled)); visibleRendered += 1; }); section.querySelector('[data-managed-gallery-editor]')?.addEventListener('click', () => void 0); addExpandedLinkIfNeeded(section, managerId); galleryStack.appendChild(section); }

function renderSuperGallerySection(editEnabled) {
    const superSubs = getSuperSubGalleries();
    if (!superSubs.length) return;
    const displayCopy = getGalleryDisplayCopy;
    let activeGallery = superSubs.find((gallery) => gallery.galleryId === activeSuperGalleryId) || null;
    if (!activeGallery) {
      activeGallery = superSubs[0] || null;
      activeSuperGalleryId = activeGallery?.galleryId || '';
    }
    if (!activeGallery) return;
    const activeGalleryIndex = galleries.findIndex((gallery) => gallery.galleryId === activeGallery.galleryId);
    const section = document.createElement('section');
    section.className = 'crmo3047-gallery is-super-gallery';
    section.id = 'pos';
    section.dataset.galleryIndex = 'super';
    section.innerHTML = `
      <div class="crmo3047-gallery-head">
        <div class="crmo3047-gallery-copy">
          <div class="crmo3047-gallery-title">${escape(displayCopy(activeGallery).title)}</div>
          <div class="crmo3047-gallery-desc">${escape(displayCopy(activeGallery).desc)}</div>
        </div>
      </div>
      <div class="crmo3047-super-gap">
        <div class="crmo3047-super-nav" data-super-nav></div>
        <div class="crmo3047-super-body">
          <div class="crmo3047-super-tools">
            ${editEnabled && activeGalleryIndex >= 0 ? `<button class="crmo3045-btn" type="button" data-super-gallery-editor>ניהול גלריה</button>` : ``}
          </div>
          <div class="crmo3045-grid" data-super-grid></div>
        </div>
      </div>
    `;
    const nav = section.querySelector('[data-super-nav]');
    superSubs.forEach((gallery, slotIndex) => {
      const btn = document.createElement('a');
      btn.className = `crmo3047-super-btn${gallery.galleryId === activeSuperGalleryId ? ' is-active' : ''}`;
      btn.textContent = getSuperSubButtonLabel(slotIndex);
      btn.dataset.galleryId = gallery.galleryId;
      const slug = getPosBlueprint(slotIndex).label;
      const destination = new URL(slug === 'all-works' ? 'pos/' : `pos/${slug}/`, getSiteRootUrl());
      if (new URLSearchParams(location.search).get('view') === 'public') destination.searchParams.set('view', 'public');
      btn.href = destination.href;
      btn.style.textDecoration = 'none';
      btn.style.display = 'inline-block';
      nav.appendChild(btn);
    });
    const grid = section.querySelector('[data-super-grid]');
    function showSuperGallery(gallery) {
      activeSuperGalleryId = gallery.galleryId;
      if (getAboutDisplayMode() === 'expanded') {
        const url = new URL(window.location.href);
        if (getDedicatedRoute()?.managerId === SUPER_GALLERY_ID) {
          const slug = getPosBlueprint(Number(gallery.galleryId.slice(SUPER_SUB_PREFIX.length)) - 1)?.label;
          if (slug) url.pathname = getSiteRootUrl().pathname + (slug === 'all-works' ? 'pos' : `pos/${slug}`);
          window.history.replaceState(window.history.state, '', url.toString());
        } else if (url.searchParams.get('gallery') === SUPER_GALLERY_ID) {
          url.searchParams.set('posCategory', gallery.meta?.slug || gallery.galleryId);
          window.history.replaceState(window.history.state, '', url.toString());
        }
      }
      const copy = displayCopy(gallery);
      section.querySelector('.crmo3047-gallery-title').textContent = copy.title;
      section.querySelector('.crmo3047-gallery-desc').textContent = copy.desc;
      nav.querySelectorAll('.crmo3047-super-btn').forEach((button) => {
        const selected = button.dataset.galleryId === activeSuperGalleryId;
        button.classList.toggle('is-active', selected);
        if (selected) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      grid.replaceChildren();
      const galleryIndex = galleries.findIndex((item) => item.galleryId === gallery.galleryId);
      let visibleRendered = 0;
      const renderLimit = getExpandedTileLimitFor(SUPER_GALLERY_ID, gallery);
      gallery.tiles.forEach((tile, tileIndex) => {
        if (visibleRendered >= renderLimit) return;
        if (tile?.isVisible === false) return;
        grid.appendChild(createGalleryCard(gallery, galleryIndex, tile, tileIndex, editEnabled));
        visibleRendered += 1;
      });
      section.querySelector('.crmo3263-expanded-link-row')?.remove();
      addExpandedLinkIfNeeded(section, SUPER_GALLERY_ID);
    }
    section.querySelector('[data-super-gallery-editor]')?.addEventListener('click', () => {
      const index = galleries.findIndex((gallery) => gallery.galleryId === activeSuperGalleryId);
      if (index >= 0) void 0;
    });
    showSuperGallery(activeGallery);
    galleryStack.appendChild(section);
  }

function getGalleryDisplayCopy(gallery) {
    const meta = gallery?.meta || {};
    const width = Math.max(window.innerWidth || 0, document.documentElement?.clientWidth || 0);
    const mode = width <= 900 ? 'mobile' : getAboutDisplayMode();
    const suffix = mode.charAt(0).toUpperCase() + mode.slice(1);
    return {
      title: meta[`title${suffix}`] || meta.title || '',
      desc: meta[`desc${suffix}`] || meta.desc || ''
    };
  }

function renderSingleGallerySection(gallery, galleryIndex, editEnabled) {
    if (!gallery || isManagedChildGallery(gallery) || isManagedMasterGallery(gallery)) return;
    const section = document.createElement('section');
    const isBrandsGallery = isBrandGalleryObject(gallery);
    const visibleTileCount = (gallery.tiles || []).filter((tile) => tile?.isVisible !== false).length;
    const brandLogoCount = isBrandsGallery ? (gallery.tiles || []).filter((tile) => tile?.isVisible !== false && ((Array.isArray(tile?.media) && tile.media.some((media) => media?.src && media?.isVisible !== false)) || tile?.logoSrc || tile?.brandConfig?.logoSrc)).length : 0;
    const brandWallReady = isBrandsGallery && visibleTileCount >= 18 && brandLogoCount >= 15;
    section.className = `crmo3047-gallery${gallery.ui.editMode && editEnabled ? ' is-editing' : ''}${isBrandsGallery ? ' is-brands-gallery' : ''}${brandWallReady ? ' is-brand-wall-ready' : ''}`;
    section.dataset.galleryIndex = String(galleryIndex);
    section.id = String(gallery.meta?.label || gallery.galleryId || `gallery-${galleryIndex + 1}`);
    section.innerHTML = `
      <div class="crmo3047-gallery-head">
        <div class="crmo3047-gallery-copy">
          <div class="crmo3047-gallery-kicker">${escape(isBrandsGallery ? 'our-brands' : (gallery.meta?.label || gallery.galleryId || `gallery-${galleryIndex + 1}`))} · ${Math.min(isBrandsGallery ? BRANDS_STACK_TILE_LIMIT : STACK_TILE_LIMIT, visibleTileCount)} shown · ${visibleTileCount} active · ${gallery.tiles.length} total</div>
          <div class="crmo3047-gallery-title">${escape(getGalleryDisplayCopy(gallery).title || `Gallery ${galleryIndex + 1}`)}</div>
          <div class="crmo3047-gallery-desc">${escape(getGalleryDisplayCopy(gallery).desc)}</div>
        </div>
        <div class="crmo3047-gallery-tools">
          ${editEnabled ? `<button class="crmo3045-btn" type="button" data-gallery-editor>ניהול גלריה</button>` : ``}
        </div>
      </div>
      <div class="crmo3045-grid" data-gallery-grid></div>
    `;
    const grid = section.querySelector('[data-gallery-grid]');
    let visibleRendered = 0;
    const renderLimit = getExpandedTileLimitFor(getGalleryLookupId(gallery), gallery);
    gallery.tiles.forEach((tile, tileIndex) => {
      if (visibleRendered >= renderLimit) return;
      if (tile?.isVisible === false) return;
      grid.appendChild(createGalleryCard(gallery, galleryIndex, tile, tileIndex, editEnabled));
      visibleRendered += 1;
    });
    const galleryEditorBtn = section.querySelector('[data-gallery-editor]');
    galleryEditorBtn?.addEventListener('click', () => void 0);
    addExpandedLinkIfNeeded(section, getGalleryLookupId(gallery));
    galleryStack.appendChild(section);
  }

function renderGalleryStack() {
    galleryStack.innerHTML = '';
    let firstRenderedSection = true;
    const editEnabled = canEdit();
    const markFirst = () => {
      if (firstRenderedSection && galleryStack.lastElementChild) {
        galleryStack.lastElementChild.classList.add('is-first-stack-section');
        firstRenderedSection = false;
      }
    };
    const expandedTargetId = getExpandedRequestedManagerId();
    if (expandedTargetId) {
      const homeUrl = getSiteRootUrl();
      homeUrl.searchParams.delete('view');
      homeUrl.searchParams.delete('mode');
      homeUrl.searchParams.delete('display');
      homeUrl.searchParams.delete('expanded');
      homeUrl.searchParams.delete('gallery');
      homeUrl.searchParams.delete('section');
      homeUrl.searchParams.delete('posCategory');
      homeUrl.hash = '';
      const nav = document.querySelector('nav.nav');
      nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
        const original = link.getAttribute('href');
        if (!original || original === '#') return;
        const destination = new URL(homeUrl);
        if (original !== '#top') destination.hash = original;
        link.href = destination.toString();
      });
    }
    const renderOrder = expandedTargetId ? getManagerRenderOrder().filter((id) => getCanonicalManagerId(id) === expandedTargetId) : getManagerRenderOrder();
    renderOrder.forEach((id) => {
      if (!expandedTargetId && !isManagerItemVisible(id)) return;
      if (id === SUPER_GALLERY_ID) { renderSuperGallerySection(editEnabled); markFirst(); return; }
      const galleryIndex = findGalleryIndexByManagerId(id);
      const gallery = galleryIndex >= 0 ? galleries[galleryIndex] : null;
      if (!gallery) return;
      if (isManagedMasterGallery(gallery)) renderManagedMasterSection(gallery, id, editEnabled);
      else renderSingleGallerySection(gallery, galleryIndex, editEnabled);
      markFirst();
    });
    if (expandedTargetId) return;
    renderAboutSection(editEnabled);
    markFirst();
    renderContactSection(editEnabled);
    renderFooterSection(editEnabled);
    renderLegalSection(editEnabled);
  }

function getLightboxMedia(tile) {
    const source = Array.isArray(tile?.media) ? tile.media.filter((item) => item && item.src) : [];
    if (tile?.display?.multiItemMode === false) {
      const firstVisible = source.find((item) => item.isVisible !== false);
      return firstVisible ? [firstVisible] : (source[0] ? [source[0]] : []);
    }
    const activeOnly = source.filter((item) => item.isVisible !== false && item.isEnabled !== false);
    if (activeOnly.length) return activeOnly;
    const visibleOnly = source.filter((item) => item.isVisible !== false);
    return visibleOnly.length ? visibleOnly : source;
  }

function renderLightbox() {
    const gallery = galleries[activeGalleryIndex];
    const tile = gallery.tiles[activeTileIndex];
    const view = byId('crmo3047LbView');
    const strip = byId('crmo3047ThumbStrip');
    const isBrandTile = isBrandGalleryIndex(activeGalleryIndex);
    const brandItems = isBrandTile ? getBrandLightboxItems(tile) : [];
    const activeMedia = isBrandTile ? brandItems.map((item) => item.media).filter(Boolean) : getLightboxMedia(tile);
    if (activeMediaIndex < 0 || activeMediaIndex >= activeMedia.length) activeMediaIndex = 0;
    const item = activeMedia[activeMediaIndex] || null;
    const brandItem = isBrandTile ? brandItems[activeMediaIndex] || null : null;
    view.classList.toggle('has-strip', activeMedia.length > 1);
    view.querySelectorAll('img,video,.crmo3045-fallback').forEach((n) => n.remove());
    if (item) {
      view.appendChild(mediaEl(item, 'crmo3045-lb-media'));
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'crmo3045-fallback';
      fallback.innerHTML = isBrandTile ? 'אין עבודות משויכות למותג הזה' : 'No active media in this tile';
      view.appendChild(fallback);
    }
    byId('crmo3047LbMeta').textContent = isBrandTile ? 'מותג' : '';
    byId('crmo3047LbTitle').textContent = isBrandTile ? (brandItem?.title || (tile.meta.brand || 'מותג')) : getPrimaryTileName(tile, activeGalleryIndex, activeMediaIndex);
    byId('crmo3047LbDesc').textContent = isBrandTile ? (brandItem?.desc || ' ') : (getPrimaryTileDesc(tile, activeGalleryIndex, activeMediaIndex) || ' ');
    const link = byId('crmo3047LbLink');
    const rawLink = isBrandTile ? (brandItem?.link || '') : (tile.overlay.link || '');
    const prettyLink = prettifyHoverUrl(rawLink);
    const showLink = isBrandTile ? (!!prettyLink && brandItem?.showLink !== false) : (!!prettyLink && tile.display?.showLinkInTile !== false);
    if (showLink) {
      link.hidden = false;
      link.href = rawLink;
      link.target = isBrandTile ? (brandItem?.openInNewTab !== false ? '_blank' : '_self') : (tile.display?.openLinkInNewTab !== false ? '_blank' : '_self');
      link.rel = link.target === '_blank' ? 'noopener' : '';
      link.textContent = prettyLink;
    } else {
      link.hidden = true;
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.textContent = '';
    }
    strip.innerHTML = '';
    strip.hidden = activeMedia.length <= 1;
    activeMedia.forEach((media, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'crmo3045-thumb' + (idx === activeMediaIndex ? ' active' : '');
      btn.setAttribute('aria-label', `Media ${idx + 1}`);
      const thumb = mediaEl(media);
      if (thumb) btn.appendChild(thumb);
      btn.addEventListener('click', () => { activeMediaIndex = idx; renderLightbox(); });
      strip.appendChild(btn);
    });
    const showTileNav = !isBrandTile && gallery.tiles.length > 1;
    byId('crmo3047PrevTile').hidden = !showTileNav;
    byId('crmo3047NextTile').hidden = !showTileNav;
  }

function getNavigableTileIndexes(galleryIndex) {
    const gallery = galleries[galleryIndex];
    const tiles = Array.isArray(gallery?.tiles) ? gallery.tiles : [];
    const brandGallery = isBrandGalleryIndex(galleryIndex);
    const indexes = [];
    tiles.forEach((tile, tileIndex) => {
      if (tile?.isVisible === false) return;
      if (brandGallery && !isBrandTileInteractive(tile)) return;
      indexes.push(tileIndex);
    });
    return indexes;
  }

function openLightbox(galleryIndex, tileIndex, mediaIndex) {
    const tile = galleries[galleryIndex].tiles[tileIndex];
    if (tile?.isVisible === false) return;
    if (isBrandGalleryIndex(galleryIndex) && !isBrandTileInteractive(tile)) return;
    activeGalleryIndex = galleryIndex;
    activeTileIndex = tileIndex;
    const activeMedia = isBrandGalleryIndex(galleryIndex) ? getBrandLightboxItems(tile).map((item) => item.media).filter(Boolean) : getLightboxMedia(tile);
    activeMediaIndex = Math.max(0, Math.min(mediaIndex || 0, Math.max((activeMedia.length || 1) - 1, 0)));
    renderLightbox();
    document.body.classList.add('lightbox-open');
    lb.showModal();
  }

function shiftTile(delta) {
    const tileIndexes = getNavigableTileIndexes(activeGalleryIndex);
    if (!tileIndexes.length) return;
    const currentPos = Math.max(0, tileIndexes.indexOf(activeTileIndex));
    const nextPos = (currentPos + delta + tileIndexes.length) % tileIndexes.length;
    activeTileIndex = tileIndexes[nextPos];
    activeMediaIndex = 0;
    renderLightbox();
  }

function normalizeBrandKey(value) {
    return String(value || '').trim().toLocaleLowerCase('he');
  }

function getAutoBrandWorkOptions(tile = tileEditorDraft) {
    const normalizedBrand = normalizeBrandKey(tile?.meta?.brand || '');
    if (!normalizedBrand) return [];
    const out = [];
    galleries.forEach((gallery, galleryIndex) => {
      if (isBrandGalleryIndex(galleryIndex)) return;
      (gallery.tiles || []).forEach((candidate, tileIndex) => {
        if (!tileHasMeaningfulContent(candidate)) return;
        if (normalizeBrandKey(candidate?.meta?.brand || '') !== normalizedBrand) return;
        const first = getLightboxMedia(candidate)[0] || candidate.media?.[0] || null;
        out.push({
          ref: { galleryIndex, tileIndex },
          key: `${galleryIndex}:${tileIndex}`,
          title: getPrimaryTileName(candidate, galleryIndex),
          meta: [gallery.meta?.titleDesktop || gallery.meta?.title || `Gallery ${galleryIndex + 1}`, candidate.meta?.client, candidate.meta?.brand].filter(Boolean).join(' · '),
          tile: candidate,
          media: first
        });
      });
    });
    return out.slice(0, 18);
  }

function getBrandAttachedWorkOptions(tile = tileEditorDraft) {
    const autoItems = getAutoBrandWorkOptions(tile);
    const autoMap = new Map(autoItems.map((item) => [item.key, item]));
    const refs = Array.isArray(tile?.brandConfig?.attachedWorkRefs) ? tile.brandConfig.attachedWorkRefs : [];
    const ordered = [];
    refs.forEach((ref) => {
      const key = `${Number(ref?.galleryIndex || 0)}:${Number(ref?.tileIndex || 0)}`;
      const item = autoMap.get(key);
      if (item) {
        ordered.push(item);
        autoMap.delete(key);
      }
    });
    autoItems.forEach((item) => {
      if (autoMap.has(item.key)) ordered.push(item);
    });
    return ordered.slice(0, 18).map((item, idx) => ({ ...item, orderIndex: idx }));
  }

function getBrandLightboxItems(tile) {
    const out = [];
    getBrandAttachedWorkOptions(tile).forEach((item) => {
      const medias = getLightboxMedia(item.tile);
      const fallback = item.media ? [item.media] : [];
      const source = (Array.isArray(medias) && medias.length ? medias : fallback).filter(Boolean);
      source.forEach((media, mediaIndex) => {
        out.push({
          media,
          mediaIndex,
          title: getPrimaryTileName(item.tile, item.ref.galleryIndex, mediaIndex),
          desc: getPrimaryTileDesc(item.tile, item.ref.galleryIndex, mediaIndex),
          link: item.tile?.overlay?.link || '',
          openInNewTab: item.tile?.display?.openLinkInNewTab !== false,
          showLink: item.tile?.display?.showLinkInTile !== false,
          ref: item.ref,
          tile: item.tile
        });
      });
    });
    return out.filter((item) => item.media);
  }

function isBrandTileInteractive(tile) {
    const enabled = tile?.brandConfig?.enableLightbox === true;
    if (!enabled) return false;
    const hasWorks = getBrandLightboxItems(tile).length > 0;
    return hasWorks;
  }

function applyPosCopyOnce() {
    siteState.ui = siteState.ui && typeof siteState.ui === 'object' ? siteState.ui : {};
    if (siteState.ui.posCopyVersion === POS_COPY_VERSION) return false;
    POS_COPY.forEach((copy, index) => {
      const gallery = galleries.find((item) => item.galleryId === `${SUPER_SUB_PREFIX}${index + 1}`);
      if (!gallery) return;
      gallery.meta = ensureGalleryMeta({
        ...gallery.meta,
        label: copy.slug,
        slug: copy.slug,
        adminLabelHe: copy.name,
        title: copy.title,
        titleDesktop: copy.title,
        titleMobile: copy.title,
        titleExpanded: copy.title,
        desc: copy.desc,
        descDesktop: copy.desc,
        descMobile: copy.mobileDesc || copy.desc,
        descExpanded: copy.desc
      });
    });
    siteState.ui.posCopyVersion = POS_COPY_VERSION;
    return true;
  }

const MAIN_ORDER_VERSION = '2026-10-11-main-order-3282';

function applyRequestedGalleryOrderOnce() {
    siteState.ui = siteState.ui && typeof siteState.ui === 'object' ? siteState.ui : {};
    if (siteState.ui.mainOrderVersion === MAIN_ORDER_VERSION) return false;
    const manager = getGalleryManagerState();
    const current = manager.order.slice();
    const desired = MAIN_RENDER_ORDER.filter((id) => current.includes(id));
    manager.order = [...desired, ...current.filter((id) => !desired.includes(id))];
    siteState.ui.galleryManager = manager;
    siteState.ui.mainOrderVersion = MAIN_ORDER_VERSION;
    return true;
  }

function applyOurBrandsCopyOnce3283() {
    siteState.ui = siteState.ui && typeof siteState.ui === 'object' ? siteState.ui : {};
    if (siteState.ui.ourBrandsCopyVersion === '3283-approved') return;
    const gallery = galleries.find(item => item.galleryId === 'our-brands');
    if (!gallery) return;
    const title = BRANDS_GALLERY_BLUEPRINT.title;
    const desc = BRANDS_GALLERY_BLUEPRINT.desc;
    gallery.meta = ensureGalleryMeta({...gallery.meta, title, titleMobile:title, titleDesktop:title, titleExpanded:title, desc, descMobile:desc, descDesktop:desc, descExpanded:desc});
    siteState.ui.ourBrandsCopyVersion = '3283-approved';
  }

function applyAllWorksCopyOnce3284() {
    siteState.ui = siteState.ui && typeof siteState.ui === 'object' ? siteState.ui : {};
    if (siteState.ui.allWorksCopyVersion === '3284-approved') return false;
    const gallery = galleries.find(item => item.galleryId === `${SUPER_SUB_PREFIX}1`);
    if (!gallery) return false;
    const title = 'פתרונות מדף, רצפה וחלל שממקסמים מכירה.';
    const desc = 'אנחנו מעצבים סטנדים ומתקני תצוגה שמייצרים נוכחות בולטת, מספרים את סיפור המותג ומניעים לקנייה מדויקת, בכל נקודת מגע.';
    gallery.meta = ensureGalleryMeta({...gallery.meta, adminLabelHe:'כל העבודות', title, titleDesktop:title, titleMobile:title, titleExpanded:title, desc, descDesktop:desc, descMobile:desc, descExpanded:desc});
    siteState.ui.allWorksCopyVersion = '3284-approved';
    return true;
  }

function applyWrapper(raw){
 const next=hydrateWrapperShape(raw); if(!next) throw Error('Invalid site content');
 siteState=ensureSiteState(next.site||{});galleries=ensureAllGalleries(next.galleries||[]);
 aboutSection=ensureAboutSection(next.aboutSection||siteState.about||{});
 contactSection=ensureContactSection(next.contactSection||siteState.contact||{});
 footerSection=ensureFooterSection(next.footerSection||siteState.footer||{});
 accessibilitySection=ensureAccessibilitySection(next.accessibilitySection||siteState.accessibility||{});
 privacySection=ensurePrivacySection(next.privacySection||siteState.privacy||{});
 applyPosCopyOnce();applyOurBrandsCopyOnce3283();applyAllWorksCopyOnce3284();applyRequestedGalleryOrderOnce();
 document.getElementById('crmo-loading')?.remove();renderGalleryStack();applyFaviconLaw();return {galleries,site:siteState};
 }

function closePrivacyPanel() { byId('crmo3047PrivacyPanel')?.classList.remove('is-open'); }

byId('crmo3047PrevTile').addEventListener('click',()=>shiftTile(-1));
byId('crmo3047NextTile').addEventListener('click',()=>shiftTile(1));
lb.querySelector('[data-close-lightbox]').addEventListener('click',()=>lb.close());
lb.addEventListener('close',()=>document.body.classList.remove('lightbox-open'));
privacyPanel.addEventListener('click',e=>{if(e.target.closest('[data-close-privacy-panel]'))closePrivacyPanel();});
window.addEventListener('keydown',e=>{if(lb.open&&e.key==='ArrowLeft')shiftTile(-1);if(lb.open&&e.key==='ArrowRight')shiftTile(1);});
window.CRMO_VIEW = {apply:applyWrapper,summary:()=>({galleryIds:galleries.map(g=>g.galleryId),order:getManagerRenderOrder(),tiles:galleries.map(g=>g.tiles.length)})};
if(window.CRMO_RELEASE_SNAPSHOT)applyWrapper(window.CRMO_RELEASE_SNAPSHOT);
const contentSync = window.CRMOContentSync?.start({refresh:refreshPublicContent});
async function refreshPublicContent(canApply = () => true){
 const c=window.CRMO_CONFIG;const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),10000);
 try{const query=new URLSearchParams({select:'payload,updated_at',key:'eq.'+c.contentRow});
 const r=await fetch(c.url+'/rest/v1/'+c.table+'?'+query,{headers:{apikey:c.anonKey,Authorization:'Bearer '+c.anonKey},cache:'no-store',signal:ctl.signal});
 if(!r.ok)throw Error('Content HTTP '+r.status);const data=await r.json();if(!data[0]?.payload||!canApply())return false;
 applyWrapper(data[0].payload);contentSync?.accept(data[0].updated_at);return true;
 }catch(e){console.warn('Content fetch failed:',e.message);const msg=document.getElementById('crmo-loading');if(msg)msg.textContent='לא ניתן לטעון את התוכן כרגע. בדוק את החיבור ונסה לרענן.';return false;}finally{clearTimeout(timer);}}
// Load content on navigation or an explicit page refresh. Rebuilding the gallery
// on window focus collapses the page and resets the visitor's scroll position.
refreshPublicContent();

})();
