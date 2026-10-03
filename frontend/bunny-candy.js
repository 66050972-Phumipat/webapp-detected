/* Detected · Bunny Candy theme loader
   - เพิ่มตัวเลือก "🐰 Bunny Candy" ในหน้าตั้งค่า
   - ไม่ต้องแก้ app.js (เก็บธีมแยกใน localStorage 'detected-skin')
   โหลดหลัง app.js */
(() => {
  const KEY = 'detected-skin', THEME = 'bunny', root = document.documentElement;
  const isOn = () => { try { return localStorage.getItem(KEY) === THEME; } catch { return false; } };

  const ITEMS = [
    ['bn-cloud bn-c1','☁️'],['bn-cloud bn-c2','☁️'],['bn-cloud bn-c3','☁️'],
    ['bn-float bn-f1','🐰'],['bn-float bn-f2','🍓'],['bn-float bn-f3','🧁'],
    ['bn-float bn-f4','🌸'],['bn-float bn-f5','🎀'],['bn-float bn-f6','🍭'],
    ['bn-star bn-s1','✦'],['bn-star bn-s2','✧'],['bn-star bn-s3','✦'],['bn-star bn-s4','✧']
  ];
  function scene(enabled) {
    let el = document.querySelector('.bunny-scene');
    if (enabled && !el) {
      el = document.createElement('div');
      el.className = 'bunny-scene';
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

  // เพิ่มตัวเลือกใน select ธีม
  function inject() {
    const s = document.querySelector('#setting-theme');
    if (!s || s.querySelector(`option[value="${THEME}"]`)) return;
    s.insertAdjacentHTML('beforeend', `<option value="${THEME}">🐰 Bunny Candy</option>`);
    if (isOn()) s.value = THEME;
  }
  const vc = document.querySelector('#view-content');
  if (vc) new MutationObserver(inject).observe(vc, { childList: true, subtree: true });

  document.addEventListener('change', e => {
    if (e.target.id !== 'setting-theme') return;
    if (e.target.value === THEME) {
      e.stopImmediatePropagation(); // กันไม่ให้ applyTheme('bunny') ถูกแปลงเป็น dark
      try { localStorage.setItem(KEY, THEME); } catch {}
      root.dataset.theme = THEME; sync();
    } else {
      try { localStorage.removeItem(KEY); } catch {}
    }
  }, true);

  // ตอนกดบันทึก ส่งค่าที่ server รู้จัก (light) แทน 'bunny'
  document.addEventListener('click', e => {
    if (!e.target.closest('#save-settings')) return;
    const s = document.querySelector('#setting-theme');
    if (s && s.value === THEME) s.value = 'light';
  }, true);

  // ป๊อปหัวใจตอนคลิก
  const EMO = ['💖','🌸','✨','🍓','🎀','⭐'];
  document.addEventListener('click', e => {
    if (root.dataset.theme !== THEME || e.target.closest('input,select,textarea')) return;
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('span');
      s.className = 'bunny-pop';
      s.textContent = EMO[(Math.random() * EMO.length) | 0];
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 60;
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d - 25 + 'px');
      document.body.append(s); setTimeout(() => s.remove(), 950);
    }
  });

  inject(); sync();
})();
