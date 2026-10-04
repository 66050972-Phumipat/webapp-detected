/* Detected · Deep Sea Mermaid theme loader
   - เพิ่มตัวเลือก "Deep Sea Mermaid" ในหน้าตั้งค่า (ไม่ต้องแก้ app.js)
   - ใช้ร่วมกับ bunny-candy.js / fairy-garden.js / elf-forest.js ได้ (key เดียวกัน)
   โหลดหลัง app.js */
(() => {
  const KEY = 'detected-skin', THEME = 'deepsea', root = document.documentElement;
  const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const isOn = () => get() === THEME;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[(Math.random() * a.length) | 0];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- ภาพวาด SVG ----------
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="dsTail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9b8ff"/><stop offset=".55" stop-color="#8cecf2"/><stop offset="1" stop-color="#5fd0d8"/></linearGradient>
    <linearGradient id="dsHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9ed2"/><stop offset="1" stop-color="#c9a8ff"/></linearGradient>
    <linearGradient id="dsJellyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd0ee" stop-opacity=".95"/><stop offset="1" stop-color="#b9a6ff" stop-opacity=".55"/></linearGradient>
    <linearGradient id="dsSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d4a4" stop-opacity=".85"/><stop offset="1" stop-color="#9a8660" stop-opacity=".9"/></linearGradient>
    <pattern id="dsScale" width="12" height="10" patternUnits="userSpaceOnUse"><path d="M0 10Q6 0 12 10" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/></pattern>
  </defs></svg>`;

  const eye = (x, y, r = 4.2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + .8}" cy="${y}" r="${r * .56}" fill="#1b2d4a"/><circle cx="${x + 1.6}" cy="${y - 1.2}" r="${r * .22}" fill="#fff"/>`;

  const tropical = (body, accent, belly) => `<svg viewBox="0 0 90 56" xmlns="http://www.w3.org/2000/svg">
    <g class="ds-tail"><path d="M24 28L2 8Q9 28 2 48z" fill="${accent}"/></g>
    <g class="ds-fin"><path d="M36 10Q52-6 70 10z" fill="${accent}"/></g>
    <ellipse cx="54" cy="28" rx="31" ry="20" fill="${body}"/>
    <ellipse cx="54" cy="39" rx="24" ry="9" fill="${belly}" opacity=".6"/>
    <path d="M47 9Q40 28 47 47M63 10Q58 28 63 46" stroke="#fff" stroke-opacity=".6" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M56 33Q47 41 56 44Q61 39 56 33z" fill="${accent}"/>
    ${eye(73, 23)}<path d="M82 31q3 2 0 4" stroke="#7a3a2a" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`;
  const angel = (body, accent) => `<svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
    <g class="ds-tail"><path d="M28 46L4 34 10 46 4 60z" fill="${accent}"/></g>
    <path d="M40 26Q42 4 56-6Q50 16 56 30z" fill="${accent}"/><path d="M40 64Q42 84 56 96Q50 74 56 60z" fill="${accent}"/>
    <ellipse cx="50" cy="46" rx="22" ry="25" fill="${body}"/>
    <path d="M44 22Q36 46 44 70M58 22Q52 46 58 70" stroke="#fff" stroke-opacity=".55" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    ${eye(62, 38, 4.4)}<path d="M70 50q3 2 0 4" stroke="#7a3a2a" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`;
  const puffer = (body, spot) => `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
    <g class="ds-tail"><path d="M18 30L4 20Q8 30 4 40z" fill="${spot}"/></g>
    <g fill="${spot}">${[[30, 11, -20], [40, 8, 0], [52, 9, 15], [62, 14, 30], [30, 51, 200], [42, 53, 180], [54, 51, 165]].map(([x, y, r]) => `<path d="M${x - 3} ${y}L${x} ${y - 6}L${x + 3} ${y}z" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g>
    <ellipse cx="42" cy="32" rx="27" ry="23" fill="${body}"/><ellipse cx="42" cy="44" rx="21" ry="10" fill="#fff6d0" opacity=".7"/>
    <g fill="${spot}" opacity=".7"><circle cx="30" cy="24" r="2.2"/><circle cx="42" cy="18" r="2.2"/><circle cx="52" cy="26" r="2.2"/></g>
    ${eye(58, 27, 5)}<circle cx="68" cy="37" r="2.6" fill="#ff9ec0" opacity=".7"/><path d="M66 38q3 2 6 0" stroke="#7a3a2a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M44 36q-6 6 0 8 4-3 0-8z" fill="${spot}"/></svg>`;
  const tiny = c => `<svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg"><g class="ds-tail"><path d="M12 10L1 2V18z" fill="${c}"/></g><ellipse cx="25" cy="10" rx="14" ry="7.5" fill="${c}"/><ellipse cx="25" cy="13" rx="11" ry="3.5" fill="#fff" opacity=".45"/><circle cx="32" cy="8.5" r="2" fill="#fff"/><circle cx="32.5" cy="8.5" r="1" fill="#16304f"/></svg>`;
  const jelly = (a, b) => `<svg viewBox="0 0 60 110" xmlns="http://www.w3.org/2000/svg">
    <g class="ds-tent" stroke="${b}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"><path d="M14 44Q8 60 16 72T14 100"/><path d="M24 46Q18 64 26 78T24 106"/><path d="M36 46Q42 64 34 78T36 106"/><path d="M46 44Q52 60 44 72T46 100"/></g>
    <g class="ds-bell"><path d="M5 44C5 6 55 6 55 44Q30 52 5 44z" fill="url(#dsJellyG)" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>
    <path d="M14 30Q30 10 46 30" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="22" cy="34" r="2.4" fill="${a}" opacity=".8"/><circle cx="38" cy="34" r="2.4" fill="${a}" opacity=".8"/></g></svg>`;
  const WHALE = `<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg"><path d="M290 60C290 30 240 14 170 16 100 18 50 36 30 52L6 30C4 50 4 70 6 90L30 68C50 88 100 104 170 102 240 100 290 90 290 60z" fill="#1d4f86"/><path d="M290 64C250 84 190 92 120 86 180 96 250 90 290 64z" fill="#3a78b8"/><circle cx="262" cy="52" r="3.2" fill="#0b2442"/><path d="M150 84L128 112 176 96z" fill="#17406f"/></svg>`;
  const TURTLE = `<svg viewBox="0 0 110 70" xmlns="http://www.w3.org/2000/svg">
    <path d="M78 44L100 64L84 64z" fill="#6cc9a0"/><path d="M34 44L12 62L30 62z" fill="#6cc9a0"/><path d="M22 46L6 48 20 54z" fill="#6cc9a0"/>
    <circle cx="96" cy="38" r="10" fill="#8fdcb6"/><circle cx="100" cy="35" r="2.2" fill="#16304f"/><path d="M98 43q3 2 6 0" stroke="#2f6b55" stroke-width="1.4" fill="none"/>
    <path d="M16 46C16 6 90 6 90 46z" fill="#4aa88a"/><path d="M28 40Q34 18 53 14M53 14Q72 18 78 40M53 14V42M36 42Q53 30 70 42" stroke="#d6f5e4" stroke-opacity=".6" stroke-width="2.2" fill="none"/>
    <ellipse cx="53" cy="46" rx="37" ry="5" fill="#f0e2b6"/></svg>`;
  const SEAHORSE = `<svg viewBox="0 0 50 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffb870" stroke-width="12" stroke-linecap="round"><path d="M26 24C12 34 12 54 24 66C32 76 28 88 18 90"/></g>
    <circle cx="28" cy="18" r="11" fill="#ffb870"/><path d="M36 20h12v6H36z" fill="#ffb870"/><path d="M24 8l-3-8 8 4zM34 10l3-8-8 4z" fill="#ff8f6b"/><circle cx="30" cy="15" r="2.6" fill="#16304f"/><circle cx="31" cy="14" r=".9" fill="#fff"/>
    <path d="M10 40Q2 46 10 52" stroke="#ff8f6b" stroke-width="4" fill="none" stroke-linecap="round"/><g stroke="#ff8f6b" stroke-width="1.6" opacity=".7"><path d="M14 38l10 2M12 48l10 2M13 58l9 2"/></g></svg>`;

  const KELP = c => `<svg viewBox="0 0 40 170" xmlns="http://www.w3.org/2000/svg"><path d="M20 170C8 140 32 118 20 92 10 70 30 52 20 16" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><g fill="${c}" opacity=".9"><path d="M20 140q-16-4-16-16 14 2 16 16zM20 100q16-4 16-16-14 2-16 16zM20 60q-16-4-16-16 14 2 16 16zM20 30q14-4 14-14-12 2-14 14z"/></g></svg>`;
  const CORAL = c => `<svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg"><g stroke="${c}" stroke-width="8" stroke-linecap="round" fill="none"><path d="M40 90V50M40 64Q22 56 22 30M40 56Q58 48 58 22M40 74Q58 70 66 54M40 76Q24 74 14 60"/></g><g fill="#fff" opacity=".55"><circle cx="22" cy="28" r="3.2"/><circle cx="58" cy="20" r="3.2"/><circle cx="66" cy="52" r="3"/><circle cx="14" cy="58" r="3"/><circle cx="40" cy="48" r="3.2"/></g></svg>`;
  const FAN = c => `<svg viewBox="0 0 90 80" xmlns="http://www.w3.org/2000/svg"><path d="M45 80V60M45 62C20 56 4 36 6 6Q45 24 84 6C86 36 70 56 45 62z" fill="${c}" opacity=".85"/><g stroke="#fff" stroke-opacity=".5" stroke-width="1.4" fill="none"><path d="M45 62L18 14M45 62L34 12M45 62L45 12M45 62L56 12M45 62L72 14"/></g></svg>`;
  const SHELL = `<svg viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg"><path d="M30 46C6 40 2 18 8 8Q30-2 52 8C58 18 54 40 30 46z" fill="#ffd9ec"/><g stroke="#ff9ed2" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M30 46L30 6M30 46L16 8M30 46L44 8M30 46L8 18M30 46L52 18"/></g><rect x="22" y="44" width="16" height="6" rx="3" fill="#ffc2de"/></svg>`;
  const STAR = `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><path d="M25 3l6.5 14.5L47 19l-11.5 10.5L39 45 25 37 11 45l3.5-15.5L3 19l15.5-1.5z" fill="#ff9d7a" stroke="#ffc2a8" stroke-width="2" stroke-linejoin="round"/><g fill="#fff" opacity=".7"><circle cx="25" cy="22" r="2"/><circle cx="25" cy="12" r="1.5"/><circle cx="14" cy="22" r="1.5"/><circle cx="36" cy="22" r="1.5"/></g></svg>`;

  // นางเงือกว่ายน้ำ (วาดเอง หันขวา)
  const MERMAID = `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
    <g class="ds-mtail"><path d="M132 50L118 52C90 62 60 56 36 44 26 40 14 28 4 18 6 34 6 52 4 70 18 64 30 60 40 60 62 68 94 72 120 64L132 64z" fill="url(#dsTail)"/><path d="M132 50L118 52C90 62 60 56 36 44 26 40 14 28 4 18 6 34 6 52 4 70 18 64 30 60 40 60 62 68 94 72 120 64L132 64z" fill="url(#dsScale)"/></g>
    <path d="M150 54L172 62" stroke="#ffe3d3" stroke-width="5" stroke-linecap="round"/>
    <path d="M116 46C126 38 142 40 150 46L148 62C140 68 124 66 116 62z" fill="#ffe3d3"/>
    <path d="M128 44a6 6 0 0 1 12 0 6 6 0 0 1-12 0zM140 44a6 6 0 0 1 12 0 6 6 0 0 1-12 0z" fill="#ff9ed2"/>
    <path d="M162 22C140 8 112 14 96 32 110 28 122 32 132 40 122 46 116 54 110 64 128 56 140 48 150 42z" fill="url(#dsHair)"/>
    <circle cx="158" cy="34" r="13" fill="#ffe3d3"/>
    <path d="M145 34C144 18 172 16 171 34 167 28 162 26 158 26 152 26 148 29 145 34z" fill="url(#dsHair)"/>
    <path d="M150 22l3-7 3 7-3 2zM158 20l3-8 3 8-3 2z" fill="#ffe29a" opacity=".95"/>
    <ellipse cx="164" cy="36" rx="1.9" ry="2.5" fill="#2a2a4a"/><circle cx="164.6" cy="35.2" r=".7" fill="#fff"/><circle cx="168" cy="41" r="2.6" fill="#ff9fb8" opacity=".6"/>
    <path d="M161 42q3 2.5 6 0" stroke="#c0509a" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`;

  const FISH_STYLES = [
    () => tropical('#ff8f6b', '#ffd45e', '#fff0c8'),
    () => tropical('#5fd0f0', '#2f7fd6', '#d8f7ff'),
    () => tropical('#ffd45e', '#ff8f6b', '#fff8d0'),
    () => tropical('#ff9ed2', '#b9a6ff', '#ffe6f4'),
    () => angel('#ffe08a', '#ff9d6b'),
    () => angel('#b9a6ff', '#ff9ed2'),
    () => puffer('#ffd86b', '#ff9d6b'),
    () => tropical('#7be0c0', '#2fa88a', '#e0fff4')
  ];

  // ---------- สร้างฉาก ----------
  let raf = 0, chasers = [], pointer = { x: innerWidth * .5, y: innerHeight * .5, t: 0 };
  function build() {
    const p = [DEFS, '<div class="ds-caustic"></div>'];
    // สัตว์ใหญ่ฉากหลัง
    p.push(`<div class="ds-big" style="top:16%;width:340px;left:-30vw;animation-duration:150s">${WHALE}</div>`);
    p.push(`<div class="ds-big" style="top:58%;width:130px;left:-18vw;animation-duration:110s;animation-delay:-40s">${TURTLE}</div>`);
    // นางเงือกสองตัว
    p.push(`<div class="ds-swim" style="top:30%;width:190px;animation-duration:72s;animation-delay:-20s;opacity:.92">${MERMAID}</div>`);
    p.push(`<div class="ds-swim ds-rev" style="top:64%;width:150px;animation-duration:96s;animation-delay:-60s;opacity:.8">${MERMAID}</div>`);
    // ปลาว่ายข้ามจอ
    for (let i = 0; i < 9; i++) {
      const rev = i % 3 === 1;
      p.push(`<div class="ds-swim${rev ? ' ds-rev' : ''}" style="top:${rnd(10, 84)}%;width:${rnd(46, 84)}px;animation-duration:${rnd(28, 52)}s;animation-delay:${-rnd(0, 50)}s;opacity:${rnd(.75, .95)}">${pick(FISH_STYLES)()}</div>`);
    }
    // ฝูงปลาเล็ก
    for (let g = 0; g < 2; g++) {
      const top = rnd(20, 70), dur = rnd(34, 48), delay = -rnd(0, 40), rev = g % 2 ? ' ds-rev' : '', c = pick(['#9fe8ff', '#b9f0d8']);
      for (let k = 0; k < 7; k++)
        p.push(`<div class="ds-swim${rev}" style="top:${top + rnd(-5, 5)}%;width:${rnd(20, 28)}px;animation-duration:${dur + rnd(-2, 2)}s;animation-delay:${delay + rnd(-3, 0)}s;opacity:.85">${tiny(c)}</div>`);
    }
    // แมงกะพรุน
    [[8, 20, 70], [88, 38, 56], [46, 8, 50], [70, 62, 62]].forEach(([l, t, w], i) =>
      p.push(`<div class="ds-jelly" style="left:${l}%;top:${t}%;width:${w}px;animation-duration:${rnd(8, 13)}s;animation-delay:${-i * 2.2}s">${jelly('#ff9ed2', '#d9b8ff')}</div>`));
    // พื้นทราย + ปะการัง
    p.push(`<div class="ds-floor"><svg viewBox="0 0 1000 130" preserveAspectRatio="none"><path d="M0 74C140 44 300 92 480 62 660 34 830 88 1000 56V130H0z" fill="url(#dsSand)"/><path d="M0 100C200 78 380 112 560 92 760 70 880 108 1000 90V130H0z" fill="#8a7650" opacity=".55"/></svg></div>`);
    const flora = [
      [3, 48, KELP('#4fbf9a')], [7, 38, KELP('#3aa886')], [12, 84, CORAL('#ff8f9f')], [18, 70, FAN('#ff9ed2')],
      [24, 60, CORAL('#ffb870')], [31, 40, KELP('#5fd1a8')], [38, 52, STAR], [44, 80, CORAL('#c9a8ff')],
      [52, 66, FAN('#ffb870')], [58, 42, KELP('#3aa886')], [64, 74, CORAL('#ff8f9f')], [70, 54, SHELL],
      [76, 96, FAN('#c9a8ff')], [83, 48, KELP('#4fbf9a')], [89, 80, CORAL('#ffb870')], [95, 38, KELP('#5fd1a8')]
    ];
    flora.forEach(([l, w, s], i) => {
      const still = s === STAR || s === SHELL;
      p.push(`<div class="${still ? 'ds-still' : 'ds-flora'}" style="left:${l}%;width:${w}px;bottom:${rnd(-6, 12)}px;animation-delay:${-rnd(0, 6)}s;animation-duration:${rnd(4.5, 8)}s">${s}</div>`);
    });
    p.push(`<div class="ds-seahorse" style="left:21%;bottom:120px;width:34px">${SEAHORSE}</div>`);
    // ฟอง
    for (let i = 0; i < 24; i++) {
      const s = rnd(6, 22);
      p.push(`<span class="ds-bub" style="left:${rnd(0, 100)}%;width:${s}px;height:${s}px;--dx:${rnd(-50, 50)}px;animation-duration:${rnd(10, 24)}s;animation-delay:${-rnd(0, 24)}s"></span>`);
    }
    // ปลาตามเมาส์ (JS ขยับ)
    [[tropical('#ff8f6b', '#ffd45e', '#fff0c8'), 62], [tropical('#5fd0f0', '#2f7fd6', '#d8f7ff'), 54], [angel('#ffe08a', '#ff9d6b'), 50], [puffer('#ffd86b', '#ff9d6b'), 52]].forEach(([s, w], i) =>
      p.push(`<div class="ds-chaser" data-i="${i}" style="width:${w}px"><div class="ds-flip">${s}</div></div>`));
    return p.join('');
  }

  function startChasers(el) {
    chasers = [...el.querySelectorAll('.ds-chaser')].map((n, i) => ({
      n, f: n.querySelector('.ds-flip'), w: n.offsetWidth || 56,
      x: innerWidth * (.2 + i * .2), y: innerHeight * (.3 + (i % 2) * .3), dir: 1, k: .014 + i * .006, ox: (i - 1.5) * 90, oy: ((i % 2) ? 1 : -1) * 46
    }));
    cancelAnimationFrame(raf);
    const tick = ts => {
      if (!document.querySelector('.deepsea-scene')) return;
      const idle = ts - pointer.t > 3500;
      chasers.forEach((c, i) => {
        const tx = idle ? innerWidth * (.5 + .38 * Math.sin(ts / 5200 + i * 1.7)) : pointer.x + c.ox;
        const ty = idle ? innerHeight * (.5 + .3 * Math.cos(ts / 6100 + i * 2.1)) : pointer.y + c.oy;
        const dx = tx - c.x;
        c.x += dx * c.k; c.y += (ty - c.y) * c.k;
        if (Math.abs(dx) > 14) c.dir = dx > 0 ? 1 : -1;
        const tilt = Math.max(-14, Math.min(14, (ty - c.y) * .12 * c.dir));
        c.n.style.transform = `translate3d(${c.x - c.w / 2}px,${c.y - c.w / 4}px,0)`;
        c.f.style.transform = `scaleX(${c.dir}) rotate(${tilt}deg)`;
      });
      raf = requestAnimationFrame(tick);
    };
    if (reduce) { chasers.forEach(c => { c.n.style.transform = `translate3d(${c.x}px,${c.y}px,0)`; }); return; }
    raf = requestAnimationFrame(tick);
  }
  addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); }, { passive: true });

  function scene(enabled) {
    let el = document.querySelector('.deepsea-scene');
    if (enabled && !el) {
      el = document.createElement('div');
      el.className = 'deepsea-scene';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = build();
      document.body.prepend(el);
      startChasers(el);
    } else if (!enabled && el) { cancelAnimationFrame(raf); el.remove(); }
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
    s.insertAdjacentHTML('beforeend', `<option value="${THEME}">🐠 Deep Sea Mermaid</option>`);
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

  // ตอนกดบันทึก ส่งค่าที่ server รู้จัก (light) แทน 'deepsea'
  document.addEventListener('click', e => {
    if (!e.target.closest('#save-settings')) return;
    const s = document.querySelector('#setting-theme');
    if (s && s.value === THEME) s.value = 'light';
  }, true);

  // คลิก = ฟองอากาศ + ประกาย
  document.addEventListener('click', e => {
    if (root.dataset.theme !== THEME || e.target.closest('input,select,textarea')) return;
    for (let i = 0; i < 7; i++) {
      const b = document.createElement('span'), s = rnd(8, 20);
      b.className = 'ds-pop';
      b.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;--dx:${rnd(-60, 60)}px;--dy:${rnd(-110, -30)}px`;
      document.body.append(b); setTimeout(() => b.remove(), 950);
    }
    for (let i = 0; i < 4; i++) {
      const t = document.createElement('span');
      t.className = 'ds-spark'; t.textContent = pick(['✦', '✧', '♡']);
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 60;
      t.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
      document.body.append(t); setTimeout(() => t.remove(), 950);
    }
  });

  inject(); sync();
})();
