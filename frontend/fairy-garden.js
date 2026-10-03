/* Detected · Fairy Garden theme loader
   - เพิ่มตัวเลือก "🧚 Fairy Garden" ในหน้าตั้งค่า
   - ไม่ต้องแก้ app.js · ใช้ร่วมกับ bunny-candy.js ได้ (ใช้ key เดียวกัน เก็บชื่อสกินที่เลือก)
   โหลดหลัง app.js */
(() => {
  const KEY = 'detected-skin', THEME = 'fairy', root = document.documentElement;
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const isOn = () => get() === THEME;

  // ---- ภาพวาด SVG (ไม่ใช้ emoji) ----
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="fyWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".5" stop-color="#d9f5ff" stop-opacity=".75"/><stop offset="1" stop-color="#e3c9ff" stop-opacity=".7"/></linearGradient>
    <linearGradient id="fyDress" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7c4ff"/><stop offset="1" stop-color="#ff9fd2"/></linearGradient>
    <linearGradient id="fyBf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9fd2"/><stop offset="1" stop-color="#9fd8ff"/></linearGradient>
  </defs></svg>`;
  const FAIRY = `<svg viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">
    <g class="fy-wing fy-wl"><path d="M47 54C20 18 2 26 8 52c4 15 26 15 39 6z" fill="url(#fyWing)" stroke="#c9b6ff" stroke-width="1.5"/><path d="M47 60C26 60 12 76 22 90c11 7 22-14 25-26z" fill="url(#fyWing)" stroke="#c9b6ff" stroke-width="1.5"/></g>
    <g class="fy-wing fy-wr"><path d="M53 54C80 18 98 26 92 52c-4 15-26 15-39 6z" fill="url(#fyWing)" stroke="#c9b6ff" stroke-width="1.5"/><path d="M53 60C74 60 88 76 78 90c-11 7-22-14-25-26z" fill="url(#fyWing)" stroke="#c9b6ff" stroke-width="1.5"/></g>
    <path d="M44 50L33 63M56 50L69 42" stroke="#ffd9c4" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M69 42L82 27" stroke="#f5c542" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M84 17l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z" fill="#ffe27a" stroke="#f5c542" stroke-width="1"/>
    <path d="M47 86l-1 17M53 86l1 17" stroke="#ffd9c4" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="45.5" cy="104" rx="4.5" ry="2.8" fill="#ff8fc8"/><ellipse cx="54.5" cy="104" rx="4.5" ry="2.8" fill="#ff8fc8"/>
    <path d="M42 47h16l10 33c-8 6-28 6-36 0z" fill="url(#fyDress)"/>
    <path d="M32 80q6 11 12 1 6 11 12 0 6 10 12-1" fill="#ff9fd2" stroke="#ff9fd2" stroke-width="1" stroke-linejoin="round"/>
    <path d="M42 56h16" stroke="#fff" stroke-width="2" stroke-dasharray="1 3.5" stroke-linecap="round"/>
    <circle cx="50" cy="31" r="14" fill="#ffe3d3"/>
    <path d="M35 33c-2-17 28-17 30 0-3-6-8-9-15-9s-12 3-15 9z" fill="#f08fcf"/>
    <path d="M36 34c-3 8-1 15 3 19-1-7 0-12 2-15zM64 34c3 8 1 15-3 19 1-7 0-12-2-15z" fill="#f08fcf"/>
    <circle cx="50" cy="15" r="7" fill="#f08fcf"/><path d="M44 18l-6 3 7 1zM56 18l6 3-7 1z" fill="#ffc4e1"/>
    <path d="M40 22l5-9 5 7 5-7 5 9z" fill="#ffe27a" stroke="#f5c542" stroke-width="1" stroke-linejoin="round"/>
    <ellipse cx="44.5" cy="35" rx="2.2" ry="2.8" fill="#4b3a6b"/><ellipse cx="55.5" cy="35" rx="2.2" ry="2.8" fill="#4b3a6b"/>
    <circle cx="45.2" cy="34" r=".8" fill="#fff"/><circle cx="56.2" cy="34" r=".8" fill="#fff"/>
    <circle cx="40" cy="40" r="3" fill="#ff9fb8" opacity=".6"/><circle cx="60" cy="40" r="3" fill="#ff9fb8" opacity=".6"/>
    <path d="M47 41q3 3 6 0" stroke="#c0509a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </svg>`;
  const BFLY = `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg"><g class="fy-flap">
    <path d="M20 14C14 2 3 1 3 9c0 7 9 8 17 5z" fill="url(#fyBf)"/><path d="M20 16C12 17 6 24 11 28c5 2 9-6 9-12z" fill="url(#fyBf)" opacity=".85"/>
    <path d="M20 14C26 2 37 1 37 9c0 7-9 8-17 5z" fill="url(#fyBf)"/><path d="M20 16C28 17 34 24 29 28c-5 2-9-6-9-12z" fill="url(#fyBf)" opacity=".85"/>
    <circle cx="10" cy="9" r="2" fill="#fff" opacity=".8"/><circle cx="30" cy="9" r="2" fill="#fff" opacity=".8"/></g>
    <ellipse cx="20" cy="15" rx="1.6" ry="7" fill="#7d6a9c"/><path d="M19 8q-3-5-5-5M21 8q3-5 5-5" stroke="#7d6a9c" stroke-width="1" fill="none" stroke-linecap="round"/></svg>`;
  const SHROOM = `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path d="M19 28h12l2 18H17z" fill="#fff3e0"/><path d="M4 30C4 8 46 8 46 30c0 3-6 4-21 4S4 33 4 30z" fill="#ff8fc8"/><circle cx="15" cy="23" r="3.5" fill="#fff"/><circle cx="27" cy="17" r="4" fill="#fff"/><circle cx="37" cy="26" r="3" fill="#fff"/><circle cx="22" cy="40" r="1.2" fill="#4b3a6b"/><circle cx="28" cy="40" r="1.2" fill="#4b3a6b"/><path d="M23 43q2 2 4 0" stroke="#c0509a" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`;
  const TULIP = `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg"><path d="M20 58V28" stroke="#6cc79a" stroke-width="3" stroke-linecap="round"/><path d="M20 50C10 48 8 40 8 36c9 0 12 6 12 14zM20 44c9-1 12-7 12-12-8 0-12 5-12 12z" fill="#8fe0b4"/><path d="M8 10c0 14 6 20 12 20s12-6 12-20l-6 6-6-10-6 10z" fill="#ff9fd2"/><path d="M20 6l-6 10v14c4 0 6-3 6-3z" fill="#ffc4e1"/></svg>`;
  const BLOSSOM = `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg"><path d="M20 58V26" stroke="#6cc79a" stroke-width="3" stroke-linecap="round"/><path d="M20 48c-8-1-11-7-11-11 7 0 11 5 11 11z" fill="#8fe0b4"/><g transform="translate(20 18)" fill="#ffc4e1" stroke="#ff9fd2" stroke-width="1"><ellipse rx="5.5" ry="8" transform="translate(0 -7)"/><ellipse rx="5.5" ry="8" transform="rotate(72) translate(0 -7)"/><ellipse rx="5.5" ry="8" transform="rotate(144) translate(0 -7)"/><ellipse rx="5.5" ry="8" transform="rotate(216) translate(0 -7)"/><ellipse rx="5.5" ry="8" transform="rotate(288) translate(0 -7)"/></g><circle cx="20" cy="18" r="3.5" fill="#ffe27a"/></svg>`;
  const DAISY = `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg"><path d="M20 58V24" stroke="#6cc79a" stroke-width="3" stroke-linecap="round"/><path d="M20 46c8-1 11-7 11-11-7 0-11 5-11 11z" fill="#8fe0b4"/><g transform="translate(20 16)" fill="#fff" stroke="#d9c9ff" stroke-width="1"><ellipse rx="3.2" ry="7.5" transform="translate(0 -6)"/><ellipse rx="3.2" ry="7.5" transform="rotate(45) translate(0 -6)"/><ellipse rx="3.2" ry="7.5" transform="rotate(90) translate(0 -6)"/><ellipse rx="3.2" ry="7.5" transform="rotate(135) translate(0 -6)"/><ellipse rx="3.2" ry="7.5" transform="rotate(180) translate(0 -6)"/><ellipse rx="3.2" ry="7.5" transform="rotate(225) translate(0 -6)"/><ellipse rx="3.2" ry="7.5" transform="rotate(270) translate(0 -6)"/><ellipse rx="3.2" ry="7.5" transform="rotate(315) translate(0 -6)"/></g><circle cx="20" cy="16" r="4.5" fill="#ffd86b"/></svg>`;

  const ITEMS = [
    ['fy-fairy fy-a1', FAIRY],['fy-fairy fy-a2', FAIRY],
    ['fy-bfly fy-b1', BFLY],['fy-bfly fy-b2', BFLY],
    ...[1,2,3,4,5,6,7,8].map(i => [`fy-glow fy-g${i}`, '']),
    ['fy-plant fy-p1', SHROOM],['fy-plant fy-p2', TULIP],['fy-plant fy-p3', BLOSSOM],
    ['fy-plant fy-p4', SHROOM],['fy-plant fy-p5', DAISY],
    ['fy-star fy-s1','✦'],['fy-star fy-s2','✧'],['fy-star fy-s3','✦'],['fy-star fy-s4','✧']
  ];
  function scene(enabled) {
    let el = document.querySelector('.fairy-scene');
    if (enabled && !el) {
      el = document.createElement('div');
      el.className = 'fairy-scene';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = DEFS + ITEMS.map(([c, t]) => `<span class="${c}">${t}</span>`).join('');
      document.body.prepend(el);
    } else if (!enabled && el) el.remove();
  }
  function sync() {
    if (isOn() && root.dataset.theme !== THEME) root.dataset.theme = THEME;
    scene(isOn() && root.dataset.theme === THEME);
  }

  // app.js ตั้ง data-theme ทับได้ → บังคับกลับเมื่อเปิดสกินนี้อยู่
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  function inject() {
    const s = document.querySelector('#setting-theme');
    if (!s || s.querySelector(`option[value="${THEME}"]`)) return;
    s.insertAdjacentHTML('beforeend', `<option value="${THEME}">🧚 Fairy Garden</option>`);
    if (isOn()) s.value = THEME;
  }
  const vc = document.querySelector('#view-content');
  if (vc) new MutationObserver(inject).observe(vc, { childList: true, subtree: true });

  document.addEventListener('change', e => {
    if (e.target.id !== 'setting-theme') return;
    if (e.target.value === THEME) {
      e.stopImmediatePropagation(); // กัน app.js แปลงค่าที่ไม่รู้จักเป็น dark
      try { localStorage.setItem(KEY, THEME); } catch {}
      root.dataset.theme = THEME; sync();
    } else if (isOn()) {
      try { localStorage.removeItem(KEY); } catch {}
    }
  }, true);

  // ตอนกดบันทึก ส่งค่าที่ server รู้จัก (light) แทน 'fairy'
  document.addEventListener('click', e => {
    if (!e.target.closest('#save-settings')) return;
    const s = document.querySelector('#setting-theme');
    if (s && s.value === THEME) s.value = 'light';
  }, true);

  // ประกายตอนคลิก
  const EMO = ['✦','✧','❀','✿','❋'], COL = ['#ffd86b','#ff9fd2','#b58cf0','#8fe0b4','#9fd8ff'];
  document.addEventListener('click', e => {
    if (root.dataset.theme !== THEME || e.target.closest('input,select,textarea')) return;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = 'fairy-pop';
      s.textContent = EMO[(Math.random() * EMO.length) | 0];
      s.style.color = COL[(Math.random() * COL.length) | 0];
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 70;
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d - 25 + 'px');
      document.body.append(s); setTimeout(() => s.remove(), 1000);
    }
  });

  inject(); sync();
})();
