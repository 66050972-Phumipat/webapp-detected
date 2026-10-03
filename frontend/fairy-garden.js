/* Detected · Fairy Garden theme loader
   - เพิ่มตัวเลือก "🧚 Fairy Garden" ในหน้าตั้งค่า
   - ไม่ต้องแก้ app.js · ใช้ร่วมกับ bunny-candy.js ได้ (ใช้ key เดียวกัน เก็บชื่อสกินที่เลือก)
   โหลดหลัง app.js */
(() => {
  const KEY = 'detected-skin', THEME = 'fairy', root = document.documentElement;
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const isOn = () => get() === THEME;

  const ITEMS = [
    ['fy-fairy fy-a1','🧚‍♀️'],['fy-fairy fy-a2','🧚'],
    ['fy-bfly fy-b1','🦋'],['fy-bfly fy-b2','🦋'],
    ...[1,2,3,4,5,6,7,8].map(i => [`fy-glow fy-g${i}`, '']),
    ['fy-plant fy-p1','🍄'],['fy-plant fy-p2','🌷'],['fy-plant fy-p3','🌸'],
    ['fy-plant fy-p4','🍄'],['fy-plant fy-p5','🌼'],
    ['fy-star fy-s1','✦'],['fy-star fy-s2','✧'],['fy-star fy-s3','✦'],['fy-star fy-s4','✧']
  ];
  function scene(enabled) {
    let el = document.querySelector('.fairy-scene');
    if (enabled && !el) {
      el = document.createElement('div');
      el.className = 'fairy-scene';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = ITEMS.map(([c, t]) => `<span class="${c}">${t}</span>`).join('');
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
  const EMO = ['✨','🌸','🦋','💫','🌷','⭐'];
  document.addEventListener('click', e => {
    if (root.dataset.theme !== THEME || e.target.closest('input,select,textarea')) return;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = 'fairy-pop';
      s.textContent = EMO[(Math.random() * EMO.length) | 0];
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 70;
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d - 25 + 'px');
      document.body.append(s); setTimeout(() => s.remove(), 1000);
    }
  });

  inject(); sync();
})();
