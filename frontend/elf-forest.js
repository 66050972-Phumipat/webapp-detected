/* Detected · Elf Forest theme loader
   - เพิ่มตัวเลือก "Elf Forest" ในหน้าตั้งค่า (ไม่ต้องแก้ app.js)
   - ใช้ร่วมกับ bunny-candy.js / fairy-garden.js ได้ (key เดียวกัน เก็บชื่อสกินที่เลือก)
   โหลดหลัง app.js */
(() => {
  const KEY = 'detected-skin', THEME = 'elf', root = document.documentElement;
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const isOn = () => get() === THEME;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];

  // ---------- ภาพวาด SVG (เขียว · ขาว · น้ำตาล) ----------
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="elBark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a5c3e"/><stop offset=".5" stop-color="#a98660"/><stop offset="1" stop-color="#6e5238"/></linearGradient>
    <linearGradient id="elLeafG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6e0a4"/><stop offset="1" stop-color="#5ea36a"/></linearGradient>
    <linearGradient id="elBf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe9bf"/></linearGradient>
  </defs></svg>`;

  const TREE = `<svg viewBox="0 0 160 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 0C52 120 28 240 44 360C50 460 22 540 0 600H160C132 540 118 470 116 380C110 250 128 120 112 0Z" fill="url(#elBark)"/>
    <path d="M44 150C20 140 8 120 0 100M112 230C136 220 150 200 160 176" stroke="#8a6a4a" stroke-width="10" fill="none" stroke-linecap="round"/>
    <g fill="#8fc77f" opacity=".9"><ellipse cx="6" cy="96" rx="22" ry="12" transform="rotate(-30 6 96)"/><ellipse cx="154" cy="172" rx="24" ry="12" transform="rotate(30 154 172)"/><ellipse cx="30" cy="400" rx="20" ry="9" transform="rotate(-20 30 400)"/><ellipse cx="128" cy="470" rx="22" ry="10" transform="rotate(25 128 470)"/></g>
    <g fill="#fff" opacity=".9"><circle cx="8" cy="86" r="4"/><circle cx="152" cy="162" r="4"/><circle cx="22" cy="392" r="3.5"/></g>
  </svg>`;
  const TREE2 = `<svg viewBox="0 0 100 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M30 0C40 140 22 280 34 400C38 500 18 560 6 600H94C78 560 70 500 68 410C64 280 76 140 66 0Z" fill="#9d7c58"/></svg>`;

  const VINE = `<svg viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 14C90 8 150 44 190 110C220 160 214 230 230 290" stroke="#6e9f5e" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M0 52C70 50 112 82 134 128C150 160 146 196 156 232" stroke="#8a6a4a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <g fill="url(#elLeafG)">
      <ellipse cx="60" cy="22" rx="20" ry="9" transform="rotate(14 60 22)"/><ellipse cx="108" cy="36" rx="22" ry="9" transform="rotate(34 108 36)"/>
      <ellipse cx="158" cy="72" rx="22" ry="9" transform="rotate(58 158 72)"/><ellipse cx="196" cy="128" rx="22" ry="9" transform="rotate(78 196 128)"/>
      <ellipse cx="216" cy="190" rx="21" ry="9" transform="rotate(92 216 190)"/><ellipse cx="228" cy="252" rx="20" ry="8" transform="rotate(96 228 252)"/>
      <ellipse cx="34" cy="64" rx="18" ry="8" transform="rotate(10 34 64)"/><ellipse cx="86" cy="76" rx="18" ry="8" transform="rotate(42 86 76)"/>
      <ellipse cx="122" cy="124" rx="18" ry="8" transform="rotate(70 122 124)"/><ellipse cx="144" cy="188" rx="17" ry="8" transform="rotate(88 144 188)"/>
    </g>
    <g fill="#fff" stroke="#e8e3cf" stroke-width="1">
      <g transform="translate(130 56)"><circle r="5" cy="-7"/><circle r="5" cx="7" cy="-2"/><circle r="5" cx="4" cy="6"/><circle r="5" cx="-4" cy="6"/><circle r="5" cx="-7" cy="-2"/><circle r="3" fill="#fff0a8" stroke="none"/></g>
      <g transform="translate(206 158)"><circle r="5" cy="-7"/><circle r="5" cx="7" cy="-2"/><circle r="5" cx="4" cy="6"/><circle r="5" cx="-4" cy="6"/><circle r="5" cx="-7" cy="-2"/><circle r="3" fill="#fff0a8" stroke="none"/></g>
      <g transform="translate(76 52)"><circle r="4" cy="-6"/><circle r="4" cx="6" cy="-2"/><circle r="4" cx="3" cy="5"/><circle r="4" cx="-3" cy="5"/><circle r="4" cx="-6" cy="-2"/><circle r="2.5" fill="#fff0a8" stroke="none"/></g>
      <g transform="translate(150 206)"><circle r="4" cy="-6"/><circle r="4" cx="6" cy="-2"/><circle r="4" cx="3" cy="5"/><circle r="4" cx="-3" cy="5"/><circle r="4" cx="-6" cy="-2"/><circle r="2.5" fill="#fff0a8" stroke="none"/></g>
    </g></svg>`;

  const petals = (n, rx, ry, off, fill, stroke) => Array.from({ length: n }, (_, i) =>
    `<ellipse rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * i}) translate(0 ${-off})" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`).join('');
  const STEM = `<path d="M20 100V30" stroke="#6ea65f" stroke-width="3.2" stroke-linecap="round"/><path d="M20 82c-9-1-13-8-13-13 8 0 13 6 13 13zM20 70c9-1 13-8 13-13-8 0-13 6-13 13z" fill="#8fc77f"/>`;
  const DAISY = `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">${STEM}<g transform="translate(20 24)">${petals(10, 3.2, 8.5, 7.5, '#fff', '#dfe8d0')}<circle r="5.2" fill="#ffe27a"/><circle r="2" cx="1" cy="-1" fill="#e8b94a"/></g></svg>`;
  const BLOSSOM = `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">${STEM}<g transform="translate(20 24)">${petals(5, 7, 9, 8, '#fff', '#d9e6cc')}<circle r="3.6" fill="#fff2a6"/><g fill="#c9a97f"><circle r=".9" cx="2" cy="1"/><circle r=".9" cx="-2" cy="-1"/><circle r=".9" cx="0" cy="-3"/></g></g></svg>`;
  const LILY = `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg"><path d="M12 100C12 60 14 30 28 18" stroke="#6ea65f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M12 92c-10-4-12-16-8-22 8 4 11 12 8 22zM13 84c9-3 14-12 12-20-8 2-13 10-12 20z" fill="#8fc77f"/>
    <g fill="#fff" stroke="#dfe8d0" stroke-width="1"><path d="M27 20c-8 1-10 10-6 14 5-1 8-6 6-14z"/><path d="M22 36c-8 0-9 9-5 13 5-1 8-5 5-13z"/><path d="M17 54c-7 0-8 8-4 12 4-1 7-5 4-12z"/></g></svg>`;
  const MUSH = `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path d="M19 28h12l2 18H17z" fill="#fff8e6"/><path d="M4 30C4 8 46 8 46 30c0 3-6 4-21 4S4 33 4 30z" fill="#a98660"/><circle cx="15" cy="23" r="3.5" fill="#fff8e6"/><circle cx="27" cy="17" r="4" fill="#fff8e6"/><circle cx="37" cy="26" r="3" fill="#fff8e6"/></svg>`;
  const CLOVER = `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg"><path d="M20 58V36" stroke="#6ea65f" stroke-width="3" stroke-linecap="round"/><g fill="#8fc77f"><circle cx="13" cy="26" r="9"/><circle cx="27" cy="26" r="9"/><circle cx="20" cy="14" r="9"/></g><circle cx="20" cy="22" r="3" fill="#fff"/></svg>`;
  const FERN = `<svg viewBox="0 0 50 100" xmlns="http://www.w3.org/2000/svg"><path d="M25 100C25 70 24 40 34 6" stroke="#6ea65f" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g fill="#9ccf8a">${[0, 1, 2, 3, 4, 5, 6].map(i => `<ellipse cx="${27 + i * 1.2}" cy="${88 - i * 12}" rx="12" ry="4" transform="rotate(${-30 - i * 3} ${27 + i * 1.2} ${88 - i * 12})"/><ellipse cx="${25 + i * 1.2}" cy="${82 - i * 12}" rx="12" ry="4" transform="rotate(${210 + i * 3} ${25 + i * 1.2} ${82 - i * 12})"/>`).join('')}</g></svg>`;
  const GRASS = `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g stroke="#79b36b" stroke-width="3.2" stroke-linecap="round" fill="none"><path d="M10 60C10 40 6 28 2 18"/><path d="M22 60C22 36 22 22 26 8"/><path d="M34 60C36 38 42 26 50 16"/><path d="M46 60C46 46 52 38 58 34"/></g></svg>`;
  const FLOWERS = [[DAISY, 3], [BLOSSOM, 3], [LILY, 2], [CLOVER, 2], [FERN, 2], [GRASS, 3], [MUSH, 1]]
    .flatMap(([s, n]) => Array(n).fill(s));

  const leafSvg = c => `<svg viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C32 12 30 32 15 40C0 32-2 12 15 0z" fill="${c}"/><path d="M15 4V38" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/></svg>`;
  const LEAVES = ['#9ccf8a', '#79b36b', '#c9a97f', '#b6e0a4', '#8a6a4a'];

  const BFLY = `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg"><g class="el-flap">
    <path d="M20 14C14 2 3 1 3 9c0 7 9 8 17 5z" fill="url(#elBf)" stroke="#cfe9bf" stroke-width=".8"/><path d="M20 16C12 17 6 24 11 28c5 2 9-6 9-12z" fill="url(#elBf)" stroke="#cfe9bf" stroke-width=".8"/>
    <path d="M20 14C26 2 37 1 37 9c0 7-9 8-17 5z" fill="url(#elBf)" stroke="#cfe9bf" stroke-width=".8"/><path d="M20 16C28 17 34 24 29 28c-5 2-9-6-9-12z" fill="url(#elBf)" stroke="#cfe9bf" stroke-width=".8"/></g>
    <ellipse cx="20" cy="15" rx="1.6" ry="7" fill="#8a6a4a"/></svg>`;

  // เอลฟ์: หูแหลม มงกุฎใบไม้ ถือธนู
  const ELF = `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 54L68 54L78 104L22 104Z" fill="#fffdf2" stroke="#e5e0c8" stroke-width="1.5"/>
    <path d="M37 52h26l5 42H32z" fill="#7fbe70"/>
    <path d="M32 94q18 8 36 0" stroke="#5ea36a" stroke-width="2" fill="none"/>
    <rect x="35" y="72" width="30" height="6" rx="2" fill="#8a6a4a"/><circle cx="50" cy="75" r="3.2" fill="#fff3b8" stroke="#c9a97f" stroke-width="1"/>
    <path d="M43 94v16M57 94v16" stroke="#6b4f36" stroke-width="6" stroke-linecap="round"/>
    <path d="M38 112q5-5 10 0v4H38zM52 112q5-5 10 0v4H52z" fill="#8a6a4a"/>
    <path d="M38 56L26 72M62 56L76 62" stroke="#ffe7d0" stroke-width="4" stroke-linecap="round"/>
    <path d="M80 40Q100 68 80 98" stroke="#8a6a4a" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M80 40L80 98" stroke="#fff" stroke-width="1"/>
    <path d="M37 33L14 22L36 43Z" fill="#ffe7d0"/><path d="M63 33L86 22L64 43Z" fill="#ffe7d0"/>
    <circle cx="50" cy="35" r="14" fill="#ffe9d6"/>
    <path d="M35 34C34 17 66 17 65 34C61 27 56 25 50 25S39 27 35 34z" fill="#fffaf0" stroke="#e5dcc4" stroke-width="1"/>
    <path d="M36 34c-5 14-1 26 5 32-2-10-1-18 1-24zM64 34c5 14 1 26-5 32 2-10 1-18-1-24z" fill="#fffaf0" stroke="#e5dcc4" stroke-width="1"/>
    <g fill="#79b36b"><ellipse cx="38" cy="25" rx="6" ry="2.6" transform="rotate(-32 38 25)"/><ellipse cx="62" cy="25" rx="6" ry="2.6" transform="rotate(32 62 25)"/><ellipse cx="46" cy="20" rx="6" ry="2.6" transform="rotate(-12 46 20)"/><ellipse cx="54" cy="20" rx="6" ry="2.6" transform="rotate(12 54 20)"/></g>
    <circle cx="50" cy="21" r="3.4" fill="#fff"/><circle cx="50" cy="21" r="1.4" fill="#ffe27a"/>
    <ellipse cx="44.5" cy="37" rx="2" ry="2.6" fill="#3b2a1c"/><ellipse cx="55.5" cy="37" rx="2" ry="2.6" fill="#3b2a1c"/>
    <circle cx="45.2" cy="36" r=".8" fill="#fff"/><circle cx="56.2" cy="36" r=".8" fill="#fff"/>
    <circle cx="40" cy="42" r="3" fill="#f7b6a0" opacity=".55"/><circle cx="60" cy="42" r="3" fill="#f7b6a0" opacity=".55"/>
    <path d="M47 43q3 3 6 0" stroke="#a5654a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </svg>`;

  // ---------- สร้างฉาก ----------
  function build() {
    const parts = [DEFS];
    parts.push(`<div class="el-tree2 el-t2l">${TREE2}</div><div class="el-tree2 el-t2r">${TREE2}</div>`);
    parts.push(`<div class="el-tree el-tl">${TREE}</div><div class="el-tree el-tr">${TREE}</div>`);
    parts.push(`<div class="el-vine el-vl">${VINE}</div><div class="el-vine el-vr">${VINE}</div>`);
    parts.push(`<div class="el-ground"></div>`);
    for (let i = 0; i < 34; i++) {
      const w = rnd(26, 54), tall = 1;
      parts.push(`<div class="el-flower" style="left:${(i / 34) * 100 + rnd(-1.2, 1.2)}%;width:${w}px;bottom:${rnd(-8, 14)}px;animation-delay:${-rnd(0, 5)}s;animation-duration:${rnd(4, 7)}s;opacity:${rnd(.78, 1)}">${pick(FLOWERS)}</div>`);
    }
    for (let i = 0; i < 26; i++) {
      const s = rnd(3, 8);
      parts.push(`<span class="el-mote" style="left:${rnd(0, 100)}%;width:${s}px;height:${s}px;--dx:${rnd(-70, 70)}px;animation-duration:${rnd(14, 30)}s;animation-delay:${-rnd(0, 30)}s"></span>`);
    }
    for (let i = 0; i < 9; i++) {
      parts.push(`<div class="el-leaf" style="left:${rnd(0, 100)}%;width:${rnd(14, 26)}px;--dx:${rnd(-90, 90)}px;animation-duration:${rnd(16, 28)}s;animation-delay:${-rnd(0, 26)}s">${leafSvg(pick(LEAVES))}</div>`);
    }
    for (let i = 0; i < 9; i++) {
      parts.push(`<span class="el-glow" style="left:${rnd(4, 94)}%;top:${rnd(12, 80)}%;animation-delay:${-rnd(0, 6)}s;animation-duration:${rnd(5, 9)}s"></span>`);
    }
    parts.push(`<div class="el-bfly el-b1">${BFLY}</div><div class="el-bfly el-b2">${BFLY}</div>`);
    parts.push(`<div class="el-elf">${ELF}</div><div class="el-elf el-elf2">${ELF}</div>`);
    return parts.join('');
  }
  function scene(enabled) {
    let el = document.querySelector('.elf-scene');
    if (enabled && !el) {
      el = document.createElement('div');
      el.className = 'elf-scene';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = build();
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
    s.insertAdjacentHTML('beforeend', `<option value="${THEME}">🍃 Elf Forest</option>`);
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

  // ตอนกดบันทึก ส่งค่าที่ server รู้จัก (light) แทน 'elf'
  document.addEventListener('click', e => {
    if (!e.target.closest('#save-settings')) return;
    const s = document.querySelector('#setting-theme');
    if (s && s.value === THEME) s.value = 'light';
  }, true);

  // ประกายใบไม้/ดอกไม้ตอนคลิก
  const EMO = ['✿', '❀', '❦', '✦', '❋'], COL = ['#ffffff', '#9bd08b', '#5ea36a', '#c9a97f', '#fff3a8'];
  document.addEventListener('click', e => {
    if (root.dataset.theme !== THEME || e.target.closest('input,select,textarea')) return;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = 'elf-pop';
      s.textContent = pick(EMO);
      s.style.color = pick(COL);
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 70;
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.setProperty('--dx', Math.cos(a) * d + 'px');
      s.style.setProperty('--dy', Math.sin(a) * d - 25 + 'px');
      document.body.append(s); setTimeout(() => s.remove(), 1000);
    }
  });

  inject(); sync();
})();
