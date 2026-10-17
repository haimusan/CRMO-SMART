

(function(){
  'use strict';
  if (window.CRMOAuthModal) return;

  function asset(path){ return window.CRMOStudioAssets.resolve(path); }
  function eyeSvg(open){
    return open
      ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 5c5.23 0 9.27 3.11 11 7-1.73 3.89-5.77 7-11 7S2.73 15.89 1 12c1.73-3.89 5.77-7 11-7Zm0 2C8.18 7 5.12 9.06 3.35 12 5.12 14.94 8.18 17 12 17s6.88-2.06 8.65-5C18.88 9.06 15.82 7 12 7Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m3.28 2.22 18.5 18.5-1.06 1.06-3.08-3.08A12.84 12.84 0 0 1 12 20c-5.23 0-9.27-3.11-11-7a13.9 13.9 0 0 1 4.2-4.86L2.22 3.28l1.06-1.06Zm4.1 7.22A4.49 4.49 0 0 0 7.5 12a4.5 4.5 0 0 0 6.06 4.2l-1.63-1.63A2.5 2.5 0 0 1 9.43 12c0-.35.07-.68.19-.99L7.38 9.44Zm4.46-3.42.16-.01c5.23 0 9.27 3.11 11 7a13.95 13.95 0 0 1-4.22 4.88l-2.91-2.91a4.5 4.5 0 0 0-5.85-5.85L8.03 7.14A13.16 13.16 0 0 1 12 6.02Zm0 3a2.5 2.5 0 0 1 2.5 2.5c0 .36-.07.69-.21 1l-3.29-3.29c.3-.13.64-.21 1-.21Z"></path></svg>';
  }

  const wrap = document.createElement('div');
  wrap.className = 'crmo-auth-modal';
  wrap.id = 'crmoAuthModal';
  wrap.hidden = true;
  wrap.innerHTML = `
    <div class="crmo-auth-modal__backdrop" data-auth-close></div>
    <div class="crmo-auth-modal__panel" role="dialog" aria-modal="true" aria-labelledby="crmoAuthModalTitle">
      <button type="button" class="crmo-auth-modal__close" aria-label="סגור" data-auth-close>×</button>
      <div class="crmo-auth-modal__header">
        <div class="crmo-auth-modal__head-grid">
          <div class="crmo-auth-modal__titlewrap">
            <p class="crmo-auth-modal__title" id="crmoAuthModalTitle">איזה כיף שחזרתם! מלאו את פרטי הקשר כדי להמשיך.<br>(ואם זה נראה מוכר — כנראה שלא סימנתם “זכור אותי” במחשב הזה 😉)</p>
          </div>
          <div class="crmo-auth-modal__mascot" aria-hidden="true">
            <img src="${asset('studio/creamo_characters/creamo_login_tumbnail.png')}" alt="CREAMO">
          </div>
        </div>
      </div>
      <div class="crmo-auth-modal__body">
        <div class="crmo-auth-modal__modebtns" aria-label="בחירת פעולה">
          <button type="button" class="crmo-auth-modal__modebtn is-active" data-auth-mode="login">כניסה</button>
          <button type="button" class="crmo-auth-modal__modebtn" data-auth-mode="register">הרשמה</button>
        </div>
        <div class="crmo-auth-modal__sso" aria-label="כניסה מהירה">
          <button type="button" class="crmo-auth-modal__sso-btn crmo-auth-modal__sso-btn--google" aria-label="התחברות עם Google"><img src="${asset('studio/icons/social/google.svg')}" alt="Google"></button>
          <button type="button" class="crmo-auth-modal__sso-btn crmo-auth-modal__sso-btn--linkedin" aria-label="התחברות עם LinkedIn"><img src="${asset('studio/icons/social/linkedin.svg')}" alt="LinkedIn"></button>
        </div>
        <p class="crmo-auth-modal__privacy">אנחנו שומרים רק מידע מינימלי (שם, אימייל, תמונת פרופיל). בלי ספאם, בלי רשימות תפוצה. אפשר למחוק הכל בכל עת.</p>
        <form class="crmo-auth-modal__form" id="crmoAuthForm" novalidate>
          <div class="crmo-auth-modal__field" id="crmoAuthNameRow" hidden>
            <div class="crmo-auth-modal__name-grid">
              <div>
                <label class="crmo-auth-modal__label" for="crmoAuthFirstName">שם פרטי</label>
                <input id="crmoAuthFirstName" class="crmo-auth-modal__input" type="text" autocomplete="given-name" placeholder="שם פרטי">
              </div>
              <div>
                <label class="crmo-auth-modal__label" for="crmoAuthLastName">שם משפחה</label>
                <input id="crmoAuthLastName" class="crmo-auth-modal__input" type="text" autocomplete="family-name" placeholder="שם משפחה">
              </div>
            </div>
          </div>
          <div class="crmo-auth-modal__field">
            <label class="crmo-auth-modal__label" for="crmoAuthEmail">אימייל</label>
            <input id="crmoAuthEmail" class="crmo-auth-modal__input crmo-auth-modal__input--ltr" type="email" autocomplete="email" placeholder="name@example.com">
          </div>
          <div class="crmo-auth-modal__field" id="crmoAuthPasswordField">
            <label class="crmo-auth-modal__label" for="crmoAuthPassword">סיסמה</label>
            <div class="crmo-auth-modal__password">
              <input id="crmoAuthPassword" class="crmo-auth-modal__password-input" type="password" autocomplete="current-password" placeholder="Password">
              <button type="button" class="crmo-auth-modal__password-toggle" id="crmoAuthPasswordToggle" aria-label="הצג סיסמה" aria-pressed="false">${eyeSvg(true)}</button>
            </div>
          </div>
          <div class="crmo-auth-modal__row">
            <a href="#" class="crmo-auth-modal__link" id="crmoAuthForgot">שכחתי סיסמה</a>
            <label class="crmo-auth-modal__remember"><span>זכור אותי במחשב זה</span><input type="checkbox" id="crmoAuthRemember"></label>
          </div>
          <button type="submit" class="crmo-auth-modal__submit" id="crmoAuthSubmit">כניסה</button>
          <div class="crmo-auth-modal__feedback" id="crmoAuthFeedback" aria-live="polite"></div>
          <div class="crmo-auth-modal__bottom"><span id="crmoAuthBottomText">אין לך חשבון?</span> <a href="#" class="crmo-auth-modal__link" id="crmoAuthBottomAction">להרשמה</a></div>
          <div class="crmo-auth-modal__status" id="crmoAuthLoggedInState"></div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const els = {
    wrap,
    form: wrap.querySelector('#crmoAuthForm'),
    email: wrap.querySelector('#crmoAuthEmail'),
    firstName: wrap.querySelector('#crmoAuthFirstName'),
    lastName: wrap.querySelector('#crmoAuthLastName'),
    nameRow: wrap.querySelector('#crmoAuthNameRow'),
    password: wrap.querySelector('#crmoAuthPassword'),
    passwordField: wrap.querySelector('#crmoAuthPasswordField'),
    passwordToggle: wrap.querySelector('#crmoAuthPasswordToggle'),
    remember: wrap.querySelector('#crmoAuthRemember'),
    feedback: wrap.querySelector('#crmoAuthFeedback'),
    submit: wrap.querySelector('#crmoAuthSubmit'),
    modeBtns: [...wrap.querySelectorAll('[data-auth-mode]')],
    forgot: wrap.querySelector('#crmoAuthForgot'),
    bottomText: wrap.querySelector('#crmoAuthBottomText'),
    bottomAction: wrap.querySelector('#crmoAuthBottomAction'),
    loggedInState: wrap.querySelector('#crmoAuthLoggedInState'),
    title: wrap.querySelector('#crmoAuthModalTitle'),
    mascot: wrap.querySelector('.crmo-auth-modal__mascot img')
  };

  let mode = 'login';
  let busy = false;
  let passwordVisible = false;
  const LOGIN_TEXT = 'איזה כיף שחזרתם! מלאו את פרטי הקשר כדי להמשיך.\n(ואם זה נראה מוכר — כנראה שלא סימנתם "זכור אותי" במחשב הזה 😉)';
  const REGISTER_TEXT = 'כיף שהגעת! נבקש רק כמה פרטים קטנים כדי לפתוח לך גישה. בלי ספאם, בלי דרמות. יאללה מתחילים 🙂';

  function setFeedback(message, kind=''){
    els.feedback.textContent = message || '';
    els.feedback.className = 'crmo-auth-modal__feedback' + (kind ? ' is-' + kind : '');
  }

  function setBusy(nextBusy){
    busy = !!nextBusy;
    els.submit.disabled = busy;
    els.email.disabled = busy;
    els.password.disabled = busy || mode === 'reset';
    els.passwordToggle.disabled = busy || mode === 'reset';
    if (els.firstName) els.firstName.disabled = busy || mode !== 'register';
    if (els.lastName) els.lastName.disabled = busy || mode !== 'register';
  }

  function updatePasswordUI(){
    els.password.type = passwordVisible ? 'text' : 'password';
    els.passwordToggle.innerHTML = eyeSvg(!passwordVisible);
    els.passwordToggle.setAttribute('aria-pressed', passwordVisible ? 'true' : 'false');
  }

  function setMode(nextMode){
    mode = nextMode;
    els.modeBtns.forEach(btn => btn.classList.toggle('is-active', btn.dataset.authMode === mode));
    const isReset = mode === 'reset';
    const isRegister = mode === 'register';
    if (els.title) {
      els.title.innerHTML = (isRegister ? REGISTER_TEXT : LOGIN_TEXT).replace(/\n/g,'<br>');
    }
    if (els.nameRow) els.nameRow.hidden = !isRegister;
    els.passwordField.hidden = isReset;
    els.forgot.hidden = isReset || isRegister;
    if (els.remember?.closest('.crmo-auth-modal__remember')) {
      els.remember.closest('.crmo-auth-modal__remember').hidden = isReset || isRegister;
    }
    els.submit.textContent = isReset ? 'שלח קישור איפוס' : (isRegister ? 'הרשמה' : 'כניסה');
    els.bottomText.textContent = isReset ? 'נזכרת בסיסמה?' : (isRegister ? 'כבר נרשמת?' : 'עוד לא נרשמת?');
    els.bottomAction.textContent = isReset ? 'חזרה לכניסה' : (isRegister ? 'כניסה' : 'הרשמה');
    setFeedback('');
    if (isReset) {
      els.password.value = '';
    }
  }

  async function submitForm(ev){
    ev?.preventDefault();
    const bridge = window.CRMOAuthBridge;
    if (!bridge) {
      setFeedback('תשתית ההתחברות עדיין לא עלתה.', 'error');
      return;
    }
    const email = els.email.value.trim();
    const password = els.password.value;
    const remember = !!els.remember.checked;
    setBusy(true);
    try {
      let result;
      if (mode === 'register') {
        result = await bridge.signUpWithPassword(email, password, remember, { firstName: els.firstName?.value?.trim() || '', lastName: els.lastName?.value?.trim() || '' });
      } else if (mode === 'reset') {
        result = await bridge.requestPasswordReset(email);
      } else {
        result = await bridge.loginWithPassword(email, password, remember);
      }
      setFeedback(result?.message || '', result?.ok ? 'success' : 'error');
      if (result?.ok && mode === 'login') {
        close();
      }
      if (result?.ok && mode === 'register' && bridge.isLoggedIn?.()) {
        close();
      }
    } finally {
      setBusy(false);
    }
  }

  function open(nextMode='login'){
    setMode(nextMode);
    els.remember.checked = !!window.CRMOAuthBridge?.getRememberPreference?.();
    if (els.firstName) els.firstName.value = '';
    if (els.lastName) els.lastName.value = '';
    wrap.hidden = false;
    document.body.classList.add('crmo-auth-modal-open');
    setTimeout(() => els.email.focus(), 20);
  }

  function close(){
    wrap.hidden = true;
    document.body.classList.remove('crmo-auth-modal-open');
  }

  function setLoggedInState(isLoggedIn, email){
    els.loggedInState.classList.toggle('is-visible', !!isLoggedIn);
    els.loggedInState.textContent = isLoggedIn ? ('מחובר כ־' + (email || 'אדמין')) : '';
  }

  wrap.querySelectorAll('[data-auth-close]').forEach(node => node.addEventListener('click', close));
  els.form.addEventListener('submit', submitForm);
  els.modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.authMode)));
  els.passwordToggle.addEventListener('click', () => { passwordVisible = !passwordVisible; updatePasswordUI(); });
  els.forgot.addEventListener('click', (e) => { e.preventDefault(); setMode('reset'); });
  els.bottomAction.addEventListener('click', (e) => {
    e.preventDefault();
    if (mode === 'login') setMode('register');
    else setMode('login');
  });
  wrap.addEventListener('click', (e) => {
    if (e.target === wrap) close();
  });
  document.addEventListener('keydown', (e) => {
    const authEditorOpen = !(document.getElementById('crmoAuthPopupEditor')?.hidden ?? true);
    const profileEditorOpen = !(document.getElementById('crmoProfilePopupEditor')?.hidden ?? true);
    if (e.key === 'Escape' && !wrap.hidden && !authEditorOpen && !profileEditorOpen) close();
  });
  wrap.querySelectorAll('.crmo-auth-modal__sso-btn').forEach(btn => btn.addEventListener('click', async () => {
    const provider = btn.getAttribute('aria-label')?.includes('LinkedIn') ? 'linkedin_oidc' : 'google';
    const bridge = window.CRMOAuthBridge;
    if (!bridge?.loginWithProvider) {
      setFeedback('חיבור חברתי עדיין לא זמין.', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await bridge.loginWithProvider(provider);
      if (result?.message) setFeedback(result.message, result.ok ? 'success' : 'error');
    } finally {
      setBusy(false);
    }
  }));
  updatePasswordUI();
  setMode('login');

  window.CRMOAuthModal = { open, close, setBusy, setLoggedInState };

window.CRMOForceOpenAuthModal = function(event){
  try {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
    if (window.CRMOAuthModal && typeof window.CRMOAuthModal.open === 'function') {
      window.CRMOAuthModal.open('login');
      return false;
    }
  } catch (err) {
    console.error('[CRMO] auth modal open failed', err);
  }
  return false;
};
})();

