// Centralized validation and step flow for 3-step signup
(() => {
  const stateKey = 'vx_signup_state_v1';
  const el = (id)=>document.getElementById(id);
  const qs = (s,root=document)=>root.querySelector(s);

  // initial state
  const defaultState = { step:1, personal:{username:'',fullName:'',email:'',phone:''}, location:{country:''}, security:{password:'',confirm:'',captcha:''} };
  let state = loadState();

  function loadState(){ try{ const raw=localStorage.getItem(stateKey); return raw?JSON.parse(raw):defaultState; }catch(e){return defaultState;} }
  function saveState(){ localStorage.setItem(stateKey, JSON.stringify(state)); }
  function goStep(n){ if(n<1||n>3) return; state.step=n; saveState(); render(); focusFirst(); }

  function focusFirst(){ const panel = qs('.step-panel.visible'); if(!panel) return; const first = panel.querySelector('input,select,button'); if(first) first.focus(); }

  function setProgress(){ for(let i=1;i<=3;i++){ const sEl=el('step-'+i); sEl.classList.remove('active','completed','inactive'); if(state.step>i) sEl.classList.add('completed'); else if(state.step===i) sEl.classList.add('active'); else sEl.classList.add('inactive'); } }

  function validatePersonal(){ const p = state.personal; const errors = {}; // username
    errors.username = (!p.username||p.username.length<3)?'Enter a username (min 3 chars)':'';
    errors.fullName = (!p.fullName)?'Enter your full name':'';
    errors.email = (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email))? '': 'Enter a valid email';
    errors.phone = (/^\+?[0-9\s\-()]{6,20}$/.test(p.phone))? '': 'Enter a valid phone number';
    return errors;
  }

  function validateLocation(){ return state.location.country?{}:{country:'Select your country'}; }

  function validateSecurity(){ const s = state.security; const e = {};
    e.password = s.password.length>=8 && /[a-z]/.test(s.password) && /[A-Z]/.test(s.password) && /[0-9\W]/.test(s.password) ? '': 'Password does not meet requirements';
    e.match = s.password===s.confirm? '':'Passwords must match';
    e.captcha = (s.captcha === qs('#captchaCode').textContent.trim())? '':'Enter the verification code exactly';
    e.tos = qs('#agreeTos').checked? '':'You must accept the Terms and Privacy';
    return e;
  }

  function anyErrors(obj){ return Object.values(obj).some(v=>v && v.length>0); }

  function renderPersonalErrors(){ const errs = validatePersonal(); ['username','fullName','email','phone'].forEach(k=>{ const elErr=el(k+'Err'); if(!elErr) return; elErr.textContent = errs[k]||''; el(k).setAttribute('aria-invalid', !!errs[k]); });
    el('continue1').disabled = anyErrors(errs);
  }

  function renderLocationErrors(){ const errs = validateLocation(); el('continue2').disabled = anyErrors(errs); const e = el('countryErr'); if(e) e.textContent = errs.country||''; }

  function renderSecurityErrors(){ const errs = validateSecurity(); el('createBtn').disabled = anyErrors(errs); // live rules
    // password rule indicators
    qsAll('.pw-rule').forEach(r=>{ const rule = r.dataset.rule; if(new RegExp(rule).test(state.security.password)) r.classList.add('valid'); else r.classList.remove('valid'); });
    // inline errors
    el('passwordErr').textContent = errs.password||''; el('confirmErr').textContent = errs.match||''; el('captchaErr').textContent = errs.captcha||''; el('tosErr').textContent = errs.tos||'';
  }

  function qsAll(s,root=document){ return Array.from(root.querySelectorAll(s)); }

  function render(){ // fill inputs from state
    el('username').value = state.personal.username||'';
    el('fullName').value = state.personal.fullName||'';
    el('email').value = state.personal.email||'';
    el('phone').value = state.personal.phone||'';
    el('countrySearch').value = state.location.country||'';
    el('password').value = state.security.password||'';
    el('confirm').value = state.security.confirm||'';
    el('captchaInput').value = state.security.captcha||'';

    // mark filled fields for floating labels
    ['username','fullName','email','phone','countrySearch','password','confirm','captchaInput'].forEach(id=>{ const i=el(id); if(!i) return; if(i.value && i.value.trim()!=='') i.classList.add('filled'); else i.classList.remove('filled'); });

    setProgress();
    // panels
    qsAll('.step-panel').forEach((p,i)=>{ const idx=i+1; if(state.step===idx){ p.classList.add('visible'); p.classList.remove('hidden'); } else { p.classList.add('hidden'); p.classList.remove('visible'); } });

    renderPersonalErrors(); renderLocationErrors(); renderSecurityErrors();
  }

  function attach(){ // personal
    ['username','fullName','email','phone'].forEach(id=>{ if(!el(id)) return; el(id).addEventListener('input', (e)=>{ state.personal[id]=e.target.value.trim(); saveState(); renderPersonalErrors(); }); });

    // ensure floating labels update on input for all relevant fields
    ['username','fullName','email','phone','countrySearch','password','confirm','captchaInput'].forEach(id=>{ const f=el(id); if(!f) return; f.addEventListener('input', (e)=>{ if(e.target.value && e.target.value.trim()!=='') e.target.classList.add('filled'); else e.target.classList.remove('filled'); }); });

    // country selection: enhanced searchable list with keyboard nav
    if(el('countrySearch')){
      const search = el('countrySearch');
      const list = qs('#countryList');
      let activeIndex = -1;

      function renderCountryResults(q){
        const val = (q||'').trim().toLowerCase();
        list.innerHTML='';
        const filtered = (window.COUNTRIES||[]).filter(c=> c.name.toLowerCase().includes(val) || c.code.toLowerCase().includes(val) ).slice(0,200);
        filtered.forEach((c, idx)=>{
          const it = document.createElement('div');
          it.tabIndex = 0; it.className = 'country-item';
          it.dataset.index = idx;
          it.dataset.code = c.code;
          it.dataset.name = c.name;
          const flag = `https://flagcdn.com/w20/${c.code.toLowerCase()}.png`;
          const nameHtml = `<div class="country-name">${escapeHtml(c.name)} <small class="small-muted">(${c.code})</small></div>`;
          it.innerHTML = `<img class="flag" src="${flag}" alt="${c.code}">` + nameHtml;
          it.addEventListener('click', ()=> selectCountry(c));
          it.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter') selectCountry(c); });
          list.appendChild(it);
        });
        activeIndex = -1;
      }

      function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

      search.addEventListener('input', (e)=>{ renderCountryResults(e.target.value); search.setAttribute('aria-expanded','true'); });

      // keyboard navigation within the list
      search.addEventListener('keydown', (ev)=>{
        const items = Array.from(list.querySelectorAll('.country-item'));
        if(ev.key === 'ArrowDown'){ ev.preventDefault(); if(items.length){ activeIndex = Math.min(items.length-1, activeIndex+1); items.forEach((it,i)=> it.classList.toggle('active', i===activeIndex)); const a=items[activeIndex]; if(a){ a.focus(); }} }
        else if(ev.key === 'ArrowUp'){ ev.preventDefault(); if(items.length){ activeIndex = Math.max(0, activeIndex-1); items.forEach((it,i)=> it.classList.toggle('active', i===activeIndex)); const a=items[activeIndex]; if(a){ a.focus(); }} }
        else if(ev.key === 'Escape'){ search.value=''; renderCountryResults(''); search.focus(); }
      });

      // capture arrow navigation when list has focus
      list.addEventListener('keydown', (ev)=>{
        const items = Array.from(list.querySelectorAll('.country-item'));
        const curr = items.indexOf(document.activeElement);
        if(ev.key==='ArrowDown'){ ev.preventDefault(); const ni = Math.min(items.length-1, curr+1); if(items[ni]) items[ni].focus(); }
        else if(ev.key==='ArrowUp'){ ev.preventDefault(); const ni = Math.max(0, curr-1); if(items[ni]) items[ni].focus(); }
        else if(ev.key==='Escape'){ search.focus(); }
      });

      // initial render (popular / all)
      renderCountryResults('');
    }

    // security inputs
    if(el('password')) el('password').addEventListener('input', (e)=>{ state.security.password=e.target.value; saveState(); renderSecurityErrors(); });
    if(el('confirm')) el('confirm').addEventListener('input', (e)=>{ state.security.confirm=e.target.value; saveState(); renderSecurityErrors(); });
    if(el('captchaInput')) el('captchaInput').addEventListener('input', (e)=>{ state.security.captcha=e.target.value.trim(); saveState(); renderSecurityErrors(); });
    if(el('agreeTos')) el('agreeTos').addEventListener('change', ()=>{ renderSecurityErrors(); });

    // nav buttons
    el('continue1').addEventListener('click', ()=>{ if(!anyErrors(validatePersonal())) goStep(2); else renderPersonalErrors(); });
    el('back2').addEventListener('click', ()=>goStep(1));
    el('continue2').addEventListener('click', ()=>{ if(!anyErrors(validateLocation())) goStep(3); else renderLocationErrors(); });
    el('back3').addEventListener('click', ()=>goStep(2));

    el('createBtn').addEventListener('click', async (ev)=>{
      ev.preventDefault();
      const serr = validateSecurity();
      if(anyErrors(serr)){
        renderSecurityErrors();
        return;
      }

      // Prepare payload
      const payload = {
        username: state.personal.username,
        fullName: state.personal.fullName,
        email: state.personal.email,
        phone: state.personal.phone,
        country: state.location.country,
        password: state.security.password
      };

      try{
        el('createBtn').disabled = true;
        const origText = el('createBtn').textContent;
        el('createBtn').textContent = 'Creating…';

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if(!res.ok){
          // show inline error without page refresh
          const msg = data && data.error ? data.error : 'Signup failed';
          const globalErr = el('signupGlobalErr') || el('captchaErr') || el('passwordErr') || el('usernameErr');
          if(globalErr){ globalErr.textContent = msg; globalErr.style.display='block'; }
          el('createBtn').disabled = false;
          el('createBtn').textContent = origText;
          return;
        }

        // success — server initialized session cookie
        // initialize local state and redirect to dashboard
        try{ localStorage.removeItem(stateKey); }catch(e){}
        window.location.href = (data && data.redirect) ? data.redirect : '/user/dashboard';
      }catch(err){
        console.error('Signup submit error', err);
        const globalErr = el('signupGlobalErr') || el('captchaErr') || el('passwordErr') || el('usernameErr');
        if(globalErr){ globalErr.textContent = 'Network error — please try again'; globalErr.style.display='block'; }
        el('createBtn').disabled = false;
        el('createBtn').textContent = 'Create Account';
      }
    });

    // regenerate captcha
    el('regenCaptcha').addEventListener('click', ()=>{ generateCaptcha(); renderSecurityErrors(); });
  }

  function selectCountry(c){ state.location.country=c.name; saveState(); el('countrySearch').value=c.name; qs('#countryList').innerHTML=''; renderLocationErrors(); }

  function generateCaptcha(){ const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<6;i++) s+=chars[Math.floor(Math.random()*chars.length)]; qs('#captchaCode').textContent = s; }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{
    // populate countries list if available
    if(window.COUNTRIES && el('countrySearch')){
      // prerender some
      window.COUNTRIES.slice(0,40).forEach(c=>{});
    }
    attach(); generateCaptcha(); render(); focusFirst();
  });

})();
