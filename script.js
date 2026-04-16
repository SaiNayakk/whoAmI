function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === name);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ── HIDDEN MEME SOUNDBOARD ──
(function () {

  // ── synth fallback ──
  let _ctx = null;
  function ctx() {
    if (!_ctx || _ctx.state === 'closed') _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }
  function note(freq, t, dur, type, freqEnd, vol) {
    const c = ctx(), osc = c.createOscillator(), g = c.createGain();
    osc.connect(g); g.connect(c.destination);
    osc.type = type || 'sine'; vol = vol || 0.3;
    osc.frequency.setValueAtTime(freq, c.currentTime + t);
    if (freqEnd != null) osc.frequency.linearRampToValueAtTime(Math.max(freqEnd, 1), c.currentTime + t + dur);
    g.gain.setValueAtTime(vol, c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + dur);
    osc.start(c.currentTime + t); osc.stop(c.currentTime + t + dur + 0.05);
  }

  // ── cached audio, optional volume ──
  function mp3(url, vol) {
    const a = new Audio(url);
    if (vol !== undefined) a.volume = vol;
    return () => { a.currentTime = 0; a.play().catch(() => {}); };
  }

  // ── visual helpers ──
  function overlay(color, dur) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;inset:0;background:${color};z-index:99990;pointer-events:none;opacity:1;transition:opacity ${dur}ms ease;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '0'; }));
    setTimeout(() => el.remove(), dur + 100);
  }
  function shake(intensity, dur) {
    const start = Date.now();
    function step() {
      if (Date.now() - start >= dur) { document.body.style.transform = ''; return; }
      document.body.style.transform = `translate(${(Math.random()-.5)*intensity*2}px,${(Math.random()-.5)*intensity*2}px)`;
      requestAnimationFrame(step);
    }
    step();
    setTimeout(() => { document.body.style.transform = ''; }, dur + 50);
  }
  function bodyFilter(filter, dur) {
    document.body.style.transition = `filter ${dur/2}ms ease`;
    document.body.style.filter = filter;
    setTimeout(() => { document.body.style.filter = ''; }, dur / 2);
    setTimeout(() => { document.body.style.transition = ''; }, dur);
  }
  function bodyTransform(transform, dur) {
    document.body.style.transition = `transform ${dur/2}ms ease`;
    document.body.style.transform = transform;
    setTimeout(() => { document.body.style.transform = ''; }, dur / 2);
    setTimeout(() => { document.body.style.transition = ''; }, dur);
  }
  function flashbangFx() {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:white;z-index:99995;pointer-events:none;opacity:1;transition:opacity 1.6s ease;';
    document.body.style.filter = 'blur(5px)';
    document.body.style.transition = 'filter 1.6s ease';
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; document.body.style.filter = ''; }, 120);
    setTimeout(() => { el.remove(); document.body.style.transition = ''; }, 1800);
  }
  function confetti() {
    const cols = ['#ff0','#0f0','#f0f','#0ff','#f60','#fff','#ffd700'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;top:-12px;left:${Math.random()*100}vw;width:8px;height:8px;background:${cols[Math.floor(Math.random()*cols.length)]};z-index:99990;pointer-events:none;animation:meme-fall ${.7+Math.random()*1.2}s ease forwards;transform:rotate(${Math.random()*360}deg);`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
    }
  }
  function goldStars() {
    for (let i = 0; i < 24; i++) {
      const el = document.createElement('div');
      el.textContent = '★';
      el.style.cssText = `position:fixed;bottom:0;left:${Math.random()*100}vw;font-size:${1+Math.random()*1.5}rem;color:#ffd700;z-index:99990;pointer-events:none;animation:meme-rise ${.7+Math.random()}s ease forwards;text-shadow:0 0 8px #ffd700;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  }
  function popText(text, color) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);font-family:'IBM Plex Mono',monospace;font-size:3rem;font-weight:700;color:${color||'#fff'};z-index:99993;pointer-events:none;transition:transform .25s ease,opacity .25s ease;text-shadow:0 0 24px ${color||'rgba(255,255,255,.6)'};white-space:nowrap;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = 'translate(-50%,-50%) scale(1)'; }));
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translate(-50%,-50%) scale(1.4)'; }, 800);
    setTimeout(() => el.remove(), 1100);
  }
  function flicker() {
    const cols = ['rgba(255,0,0,.35)','rgba(0,255,0,.3)','rgba(0,100,255,.3)','rgba(255,255,0,.3)','rgba(255,0,255,.3)'];
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;z-index:99990;pointer-events:none;';
    document.body.appendChild(el);
    let i = 0;
    const iv = setInterval(() => { el.style.background = cols[i++ % cols.length]; if (i > 14) { clearInterval(iv); el.remove(); } }, 70);
  }
  function droopPage() {
    bodyFilter('sepia(90%)', 1200);
    bodyTransform('rotate(-3deg) translateY(8px)', 1200);
  }
  function minusHP() {
    overlay('rgba(255,0,0,0.45)', 300);
    shake(8, 400);
    const el = document.createElement('div');
    el.textContent = '-10 HP';
    el.style.cssText = `position:fixed;top:38%;left:50%;transform:translateX(-50%);font-family:'IBM Plex Mono',monospace;font-size:2.2rem;font-weight:700;color:#ff2222;z-index:99993;pointer-events:none;text-shadow:2px 2px 0 #000,3px 3px 0 #000;animation:meme-rise 0.9s ease forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
  function imposterScreen() {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:#0d0000;z-index:99993;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2rem;animation:appear 0.25s ease;';
    el.innerHTML = `<div style="font-size:5rem;line-height:1;">ඞ</div><div style="font-family:'IBM Plex Mono',monospace;font-size:2rem;color:#cc0000;font-weight:700;letter-spacing:0.08em;">YOU ARE THE IMPOSTOR.</div><div style="font-family:'IBM Plex Mono',monospace;font-size:0.8rem;color:#660000;letter-spacing:0.15em;">0 TASKS REMAINING</div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; }, 2600);
    setTimeout(() => el.remove(), 3200);
  }

  // ── amogus: strictly alternating vent / eject ──
  let amogusToggle = false;
  function amogusAnimation() {
    const isEject = amogusToggle;
    amogusToggle = !amogusToggle;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:#000010;z-index:99993;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;animation:appear 0.25s ease;';
    el.innerHTML = isEject
      ? `<div style="font-family:'IBM Plex Mono',monospace;font-size:0.85rem;color:#aaa;letter-spacing:0.12em;">EMERGENCY MEETING</div><div style="font-size:3rem;animation:meme-eject 2s ease forwards;display:inline-block;margin:1rem 0;">ඞ 🚀</div><div style="font-family:'IBM Plex Mono',monospace;font-size:1rem;color:#fff;">sai was not The Impostor.</div><div style="font-family:'IBM Plex Mono',monospace;font-size:0.7rem;color:#555;margin-top:0.3rem;">1 Impostor remains.</div>`
      : `<div style="font-size:3.5rem;animation:meme-vent 1.5s ease forwards;display:inline-block;">ඞ</div><div style="font-family:'IBM Plex Mono',monospace;font-size:0.85rem;color:#555;margin-top:1rem;">*venting...*</div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; }, 2600);
    setTimeout(() => el.remove(), 3200);
  }

  // ── sadge: hamster violin overlay ──
  function hamsterViolin() {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:99993;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.4rem;animation:appear 0.3s ease;pointer-events:none;';
    el.innerHTML = `<div style="font-size:5rem;animation:meme-violin-sway 0.45s ease-in-out infinite alternate;display:inline-block;">🐹</div><div style="font-size:2rem;margin-top:-0.4rem;">🎻</div><div style="font-family:'IBM Plex Mono',monospace;font-size:0.72rem;color:#888;font-style:italic;margin-top:0.6rem;letter-spacing:0.08em;">♪ &nbsp; sad violin &nbsp; ♪</div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.5s'; el.style.opacity = '0'; }, 2500);
    setTimeout(() => el.remove(), 3100);
  }

  // ── nooo: cursor text shrinks over voice note duration ──
  function noooCursorAnim() {
    const cur = document.getElementById('terminal-cursor');
    if (!cur) return;
    const stages = ['nooooooo','noooooo','nooooo','noooo','nooo','noo','no'];
    cur.style.background   = 'transparent';
    cur.style.width        = 'auto';
    cur.style.height       = 'auto';
    cur.style.fontSize     = '0.8rem';
    cur.style.lineHeight   = '1.8';
    cur.style.animation    = 'none';
    cur.style.opacity      = '1';
    cur.style.mixBlendMode = 'normal';
    cur.style.color        = '#ff3333';
    stages.forEach((text, i) => {
      setTimeout(() => { if (activeWord === 'nooo') cur.textContent = text; }, i * 380);
    });
    setTimeout(() => {
      if (activeWord !== 'nooo') return;
      cur.textContent        = '';
      cur.style.background   = cur.style.width  = cur.style.height = '';
      cur.style.fontSize     = cur.style.lineHeight = cur.style.animation = '';
      cur.style.opacity      = cur.style.color  = cur.style.mixBlendMode = '';
    }, stages.length * 380 + 300);
  }

  // ── omg: aim board ──
  let omgTarget = null;
  function spawnAimBoard() {
    if (omgTarget || activeWord !== 'omg') return;
    const x = 8 + Math.random() * 74, y = 12 + Math.random() * 68;
    const el = document.createElement('div');
    el.id = 'meme-aim-board';
    el.innerHTML = `<div class="aim-h"></div><div class="aim-v"></div><div class="aim-dot"></div>`;
    el.style.cssText = `position:fixed;left:${x}vw;top:${y}vh;width:64px;height:64px;border:2.5px solid #ff2200;border-radius:50%;z-index:99993;display:flex;align-items:center;justify-content:center;animation:aim-pulse 0.35s ease infinite alternate;`;
    document.body.appendChild(el);
    omgTarget = el;
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (SOUNDS['omg']) SOUNDS['omg']();
      el.remove(); omgTarget = null;
      setTimeout(() => spawnAimBoard(), 700);
    });
    setTimeout(() => {
      if (omgTarget !== el) return;
      el.style.transition = 'opacity 0.3s'; el.style.opacity = '0';
      setTimeout(() => { el.remove(); omgTarget = null; setTimeout(() => spawnAimBoard(), 800); }, 350);
    }, 2000);
  }

  // ── trail system ──
  let trailHandler = null, lastTrail = 0;
  function setTrail(type) {
    if (trailHandler) { document.removeEventListener('mousemove', trailHandler); trailHandler = null; }
    if (!type) return;
    trailHandler = e => {
      const now = Date.now();
      if (now - lastTrail < 55) return;
      lastTrail = now;
      const el = document.createElement('div');
      if (type === 'fart') {
        el.textContent = '💨';
        const off = (Math.random() - 0.5) * 18;
        el.style.cssText = `position:fixed;left:${e.clientX+off}px;top:${e.clientY+off}px;font-size:${0.75+Math.random()*0.7}rem;z-index:99985;pointer-events:none;opacity:0.65;transition:all ${0.55+Math.random()*0.35}s ease;`;
        document.body.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.opacity = '0';
          el.style.transform = `translate(${(Math.random()-.5)*25}px,${-15-Math.random()*20}px)`;
        }));
      } else if (type === 'sadge') {
        el.textContent = '💧';
        el.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;font-size:0.65rem;z-index:99985;pointer-events:none;opacity:0.75;transition:all 0.5s ease;`;
        document.body.appendChild(el);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
        }));
      }
      setTimeout(() => el.remove(), 900);
    };
    document.addEventListener('mousemove', trailHandler);
  }

  // ── cursor system ──
  const CURSORS = {
    'faaah':'⚡','bruh':'💀','bonk':'🍗','pipes':'📏','nani':'🥷',
    'yeet':'🏌🏾','sus':'ඞ','amogus':'ඞ','gg':'🎮',
    'undertaker':'⚰️','messi':'⚽','xqc':'👃','lizard':'🦎',
  };
  function setCursor(word) {
    const cur = document.getElementById('terminal-cursor');
    if (!cur) return;
    const emoji = word ? CURSORS[word] : null;
    if (emoji) {
      cur.textContent    = emoji;
      cur.style.background   = 'transparent';
      cur.style.width        = 'auto';
      cur.style.height       = 'auto';
      cur.style.fontSize     = '1.5rem';
      cur.style.lineHeight   = '1';
      cur.style.animation    = 'none';
      cur.style.opacity      = '1';
      cur.style.mixBlendMode = 'normal';
    } else {
      cur.textContent        = '';
      cur.style.background   = cur.style.width  = cur.style.height = '';
      cur.style.fontSize     = cur.style.lineHeight = cur.style.animation = '';
      cur.style.opacity      = cur.style.mixBlendMode = '';
    }
  }

  // ── sounds ──
  const SOUNDS = {
    'faaah':      mp3('https://www.myinstants.com/media/sounds/fahhh_KcgAXfs.mp3'),
    'fart':       mp3('https://www.myinstants.com/media/sounds/fart-with-reverb.mp3'),
    'bruh':       mp3('https://www.myinstants.com/media/sounds/movie_1.mp3'),
    'oof':        mp3('https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3'),
    'bonk':       mp3('https://www.myinstants.com/media/sounds/bonk_BEtiM8g.mp3'),
    'pipes':      mp3('https://www.myinstants.com/media/sounds/metal-pipe-go-bonk.mp3', 0.35),
    'nani':       mp3('https://www.myinstants.com/media/sounds/nani_nXW4gbB.mp3', 0.4),
    'yeet':       mp3('https://www.myinstants.com/media/sounds/yeet_znS2yxt.mp3'),
    'sus':        mp3('https://www.myinstants.com/media/sounds/53b1bab6-a8c3-4a1a-82db-7110ce1c29ef_6KNDGWD.mp3'),
    'amogus':     mp3('https://www.myinstants.com/media/sounds/record-online-voice-recorder_kIwejRI.mp3'),
    'gg':         mp3('https://www.myinstants.com/media/sounds/gg.mp3'),
    'undertaker': mp3('https://www.myinstants.com/media/sounds/undertaker-bell-repeat.mp3'),
    'messi':      mp3('https://www.myinstants.com/media/sounds/vpuxsya-vgi-00_00_03.mp3'),
    'xqc':        mp3('https://www.myinstants.com/media/sounds/sem-titulo_8HSgutI.mp3'),
    'sadge':      mp3('https://www.myinstants.com/media/sounds/sad-hamster.mp3'),
    'nooo':       mp3('https://www.myinstants.com/media/sounds/no-god-please-no-noooooooooo.mp3'),
    'omg':        mp3('https://www.myinstants.com/media/sounds/inhuman-reactions_1.mp3'),
    'lol':        mp3('https://www.myinstants.com/media/sounds/running.mp3', 0.4),
    'lizard':     mp3('https://www.myinstants.com/media/sounds/lizard-button.mp3'),
    'flashbang':  mp3('https://www.myinstants.com/media/sounds/throwing-flashbang-sound-effect-cs-go.mp3'),
  };

  // ── visual effects (screen/body) ──
  const EFFECTS = {
    'faaah':      () => { overlay('rgba(255,255,100,0.3)', 500); shake(4, 300); },
    'fart':       null,
    'bruh':       () => bodyFilter('grayscale(100%)', 1400),
    'oof':        minusHP,
    'bonk':       () => { overlay('rgba(255,140,0,0.45)', 350); shake(8, 200); },
    'pipes':      () => { bodyTransform('rotate(6deg)', 500); overlay('rgba(150,150,150,0.2)', 300); },
    'nani':       () => bodyTransform('scaleX(-1)', 700),
    'yeet':       () => bodyTransform('translateX(40px) rotate(3deg)', 400),
    'sus':        imposterScreen,
    'amogus':     amogusAnimation,
    'gg':         () => { confetti(); overlay('rgba(0,200,100,0.2)', 500); },
    'undertaker': () => overlay('rgba(0,0,0,0.85)', 2200),
    'messi':      () => { overlay('rgba(255,215,0,0.35)', 700); popText('🐐', '#ffd700'); goldStars(); },
    'xqc':        flicker,
    'sadge':      () => { droopPage(); hamsterViolin(); },
    'nooo':       () => { shake(12, 900); bodyFilter('brightness(0.6)', 900); },
    'omg':        null,
    'lol':        () => {
      const ys = ['-12px','0','-7px','0','-3px','0'];
      ys.forEach((y,i) => setTimeout(() => {
        document.body.style.transform = `translateY(${y})`;
        if (i === ys.length-1) setTimeout(() => { document.body.style.transform = ''; }, 80);
      }, i * 90));
    },
    'lizard':     null,
    'flashbang':  flashbangFx,
  };

  // ── per-click odds of screen effect after first guaranteed ──
  const ODDS = {
    'nani':1/20, 'yeet':1/10, 'sus':1/15,  'amogus':1/10,
    'gg':1/10,   'undertaker':1/10, 'nooo':1/20, 'flashbang':1/15,
    'sadge':1/10,
  };

  // ── always-on per-click (cursor anims etc., not gated by odds) ──
  const ALWAYS = {
    'nooo': noooCursorAnim,
  };

  const REACTIONS = {
    'faaah':'FAAAH ⚡', 'fart':'fart 💨',    'bruh':'bruh 💀',    'oof':'OOF 😬',
    'bonk':'BONK 🍗',   'pipes':'pipes 📏',  'nani':'NANI 🥷',    'yeet':'YEET 🏌🏾',
    'sus':'impostor ඞ', 'amogus':'amogus ඞ', 'gg':'GG 🎮',        'undertaker':'⚰️',
    'messi':'MESSI ⚽',  'xqc':'xQc 👃',      'sadge':'sadge 😢',  'nooo':'NOOOO 😱',
    'omg':'OMG 🎯',     'lol':'lol 😂',      'lizard':'🦎',       'flashbang':'FLASHBANG 💥',
  };

  // ── first-open disclaimer (epilepsy / flash warning) ──
  function showDisclaimer(callback) {
    if (localStorage.getItem('meme_disc')) { callback(); return; }
    localStorage.setItem('meme_disc', '1');
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:rgba(17,16,9,0.97);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.1rem;padding:2rem;animation:appear 0.2s ease;';
    const title = document.createElement('div');
    title.style.cssText = 'font-family:"IBM Plex Mono",monospace;font-size:0.65rem;color:#d4894a;letter-spacing:0.1em;';
    title.textContent = '// secret.wav — before you proceed';
    const msg = document.createElement('div');
    msg.style.cssText = 'font-family:"IBM Plex Mono",monospace;font-size:0.82rem;color:#ede8dc;max-width:380px;text-align:center;line-height:1.9;';
    msg.innerHTML = '⚠️ some effects include <span style="color:#d4894a">flashing lights</span>, sudden bright whites, and intense screen shakes.<br><br>if you are photosensitive or prone to epileptic episodes, avoid <span style="color:#d4894a">flashbang</span> and <span style="color:#d4894a">xqc</span> modes.';
    const btn = document.createElement('button');
    btn.style.cssText = 'margin-top:0.4rem;background:#d4894a;color:#111009;border:none;padding:0.5rem 1.5rem;font-family:"IBM Plex Mono",monospace;font-size:0.75rem;font-weight:500;cursor:none;';
    btn.textContent = '→ got it';
    btn.onclick = () => { el.remove(); callback(); };
    el.appendChild(title); el.appendChild(msg); el.appendChild(btn);
    document.body.appendChild(el);
  }

  // ── panel UI ──
  const panel = document.createElement('div');
  panel.id = 'meme-panel';
  const hdr = document.createElement('div'); hdr.className = 'meme-header'; hdr.textContent = '// secret.wav';
  const inputLine = document.createElement('div'); inputLine.className = 'meme-input-line';
  const promptEl = document.createElement('span'); promptEl.className = 'meme-prompt'; promptEl.textContent = '>';
  const input = document.createElement('input');
  input.id = 'meme-input'; input.type = 'text';
  input.setAttribute('autocomplete','off'); input.setAttribute('autocorrect','off'); input.setAttribute('spellcheck','false');
  inputLine.appendChild(promptEl); inputLine.appendChild(input);
  const hintEl = document.createElement('div'); hintEl.className = 'meme-hint';
  hintEl.textContent = '\` to close \xb7 type + enter to activate';
  const deployOptions = document.createElement('div');
  deployOptions.className = 'meme-deploy-options';
  deployOptions.style.display = 'none';
  panel.appendChild(hdr); panel.appendChild(inputLine); panel.appendChild(hintEl); panel.appendChild(deployOptions);
  document.body.appendChild(panel);

  const indicator = document.createElement('div'); indicator.id = 'meme-indicator';
  document.body.appendChild(indicator);

  // ── state ──
  let activeWord = null, firstEffect = true;
  const TRAILS = { 'fart':'fart', 'sadge':'sadge' };

  function setActive(word) {
    activeWord = word; firstEffect = true;
    setCursor(word);
    setTrail(word ? TRAILS[word] : null);
    if (word === 'omg') setTimeout(spawnAimBoard, 300);
    else if (omgTarget) { omgTarget.remove(); omgTarget = null; }
    if (word) { indicator.textContent = REACTIONS[word] || word; indicator.classList.add('meme-ind-on'); }
    else indicator.classList.remove('meme-ind-on');
  }

  function stopAll() {
    setActive(null);
    document.body.style.transform = document.body.style.filter = '';
    document.body.style.transition = document.body.style.animation = '';
    document.querySelectorAll('#meme-aim-board').forEach(el => el.remove());
    const cur = document.getElementById('terminal-cursor');
    if (cur) {
      cur.textContent        = '';
      cur.style.background   = cur.style.width  = cur.style.height = '';
      cur.style.fontSize     = cur.style.lineHeight = cur.style.animation = '';
      cur.style.opacity      = cur.style.color  = cur.style.mixBlendMode = '';
    }
  }

  function shouldFire() {
    if (firstEffect) { firstEffect = false; return true; }
    return Math.random() < (ODDS[activeWord] || 1/9);
  }

  document.addEventListener('click', e => {
    if (!activeWord || e.target.closest('#meme-panel')) return;
    if (activeWord === 'omg') return; // aim board handles sound
    // always-on per-click (cursor anims etc.)
    if (ALWAYS[activeWord]) ALWAYS[activeWord]();
    // flashbang: both sound + effect gated together
    if (activeWord === 'flashbang') {
      if (shouldFire()) {
        SOUNDS['flashbang']();
        setTimeout(() => flashbangFx(), 1000);
      }
      return;
    }
    // sound plays every click; screen effect delayed 1s with odds
    if (SOUNDS[activeWord]) SOUNDS[activeWord]();
    if (EFFECTS[activeWord] && shouldFire()) {
      const fx = EFFECTS[activeWord];
      setTimeout(() => { if (activeWord) fx(); }, 1000);
    }
  });

  function tryActivate(val) {
    const lower = val.toLowerCase();
    const sorted = Object.keys(SOUNDS).sort((a, b) => b.length - a.length);
    for (const word of sorted) {
      if (lower.includes(word)) {
        setActive(word);
        if (ALWAYS[word]) ALWAYS[word]();
        if (SOUNDS[word]) SOUNDS[word]();
        if (EFFECTS[word]) EFFECTS[word]();
        firstEffect = false; // confirmation already fired it
        panel.classList.add('meme-flash');
        setTimeout(() => panel.classList.remove('meme-flash'), 200);
        return true;
      }
    }
    return false;
  }

  const DEPLOY_PROJECTS = [
    { id: 'eventsnap',  label: 'eventsnap' },
    { id: 'deploybot',  label: 'deploybot'  },
  ];

  function showDeployOptions() {
    deployOptions.innerHTML = '';
    DEPLOY_PROJECTS.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'meme-deploy-btn';
      btn.textContent = '→ ' + p.label;
      btn.onclick = () => { deployOptions.style.display = 'none'; togglePanel(false); deployProject(p.id); };
      deployOptions.appendChild(btn);
    });
    deployOptions.style.display = 'flex';
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.value.trim().toLowerCase();
      if (val === '' || val === 'stop') { stopAll(); togglePanel(false); return; }
      if (val === 'deploy') { input.value = ''; hintEl.textContent = 'pick a project:'; showDeployOptions(); return; }
      const matched = tryActivate(input.value);
      if (matched) togglePanel(false);
    }
    if (e.key === 'Escape') { e.preventDefault(); deployOptions.style.display = 'none'; togglePanel(false); }
    if (e.key === '`') { e.preventDefault(); deployOptions.style.display = 'none'; togglePanel(false); }
  });

  let isOpen = false;
  function doOpen() {
    isOpen = true;
    panel.classList.add('meme-open');
    input.value = '';
    hintEl.textContent = activeWord
      ? 'active: ' + (REACTIONS[activeWord] || activeWord) + ' \xb7 enter to change'
      : '\` to close \xb7 type + enter to activate';
    setTimeout(() => input.focus(), 30);
  }
  function togglePanel(force) {
    const opening = force !== undefined ? force : !isOpen;
    if (!opening) { isOpen = false; panel.classList.remove('meme-open'); deployOptions.style.display = 'none'; return; }
    showDisclaimer(doOpen);
  }

  document.addEventListener('keydown', e => {
    if (e.key !== '`' || e.ctrlKey || e.metaKey || e.altKey) return;
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') && active.id !== 'meme-input') return;
    e.preventDefault();
    togglePanel();
  });

  // ── mobile: 9 taps on nav-name opens panel ──
  (function () {
    const TARGET = 9, WINDOW = 3000;
    let taps = 0, timer = null;
    function resetTaps() { taps = 0; }
    document.addEventListener('touchstart', e => {
      const navName = e.target.closest('.nav-name');
      if (!navName) return;
      taps++;
      clearTimeout(timer);
      timer = setTimeout(resetTaps, WINDOW);
      if (taps >= TARGET) {
        taps = 0; clearTimeout(timer);
        togglePanel();
      }
    }, { passive: true });
  })();
})();

// ── MODULES (live status) ──
const STATUS_MODULES = [
  {
    id: 'homeloan-calc',
    name: 'homeloan-calc',
    url: 'https://loancalc-saiworks.nncs.in/',
    displayUrl: 'loancalc-saiworks.nncs.in',
    stack: 'React · Vite · MUI · Recharts',
    infra: 'self-hosted · old Android phone',
    desc: 'EMI calculator with prepayment analysis, tax benefits, amortization, shareable links.',
  },
  {
    id: 'eventsnap',
    name: 'eventsnap',
    url: 'https://eventsnap-saiworks.nncs.in/',
    displayUrl: 'eventsnap-saiworks.nncs.in',
    stack: 'Next.js · Supabase · AWS Rekognition · Cloudflare R2',
    infra: 'GCP VM · Cloudflare · Supabase cloud',
    desc: 'Face-recognition photo delivery platform for Indian wedding photographers.',
  },
];

const STATUS_HISTORY_SIZE = 30;

function statusGetHistory(id) {
  try { return JSON.parse(localStorage.getItem('status_h_' + id) || '[]'); } catch { return []; }
}

function statusPushHistory(id, up) {
  let h = statusGetHistory(id);
  h.push(up ? 1 : 0);
  if (h.length > STATUS_HISTORY_SIZE) h = h.slice(-STATUS_HISTORY_SIZE);
  localStorage.setItem('status_h_' + id, JSON.stringify(h));
}

async function statusPingModule(mod) {
  const start = performance.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    await fetch(mod.url, { mode: 'no-cors', cache: 'no-cache', signal: ctrl.signal });
    clearTimeout(t);
    return { up: true, ms: Math.round(performance.now() - start) };
  } catch {
    clearTimeout(t);
    return { up: false, ms: null };
  }
}

function statusRender(states) {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;

  grid.innerHTML = STATUS_MODULES.map(mod => {
    const s = states[mod.id] || { status: 'checking', ms: null };
    const history = statusGetHistory(mod.id);

    const dotClass = s.status === 'up' ? 'status-dot-live'
                   : s.status === 'down' ? 'status-dot-down'
                   : 'status-dot-checking';
    const dotChar  = s.status === 'up' ? '●' : s.status === 'down' ? '●' : '○';
    const label    = s.status === 'up' ? 'online' : s.status === 'down' ? 'offline' : 'checking…';
    const latency  = s.ms != null ? `${s.ms}ms` : '—';

    const segs = Array.from({ length: STATUS_HISTORY_SIZE }, (_, i) => {
      const idx = history.length - STATUS_HISTORY_SIZE + i;
      if (idx < 0) return '<span class="status-uptime-seg"></span>';
      return `<span class="status-uptime-seg ${history[idx] ? 'up' : 'down'}"></span>`;
    }).join('');

    const checks = history.length;
    const pct    = checks ? Math.round((history.filter(x => x).length / checks) * 100) : null;
    const uptimeTxt = pct != null
      ? `${pct}% uptime · last ${checks} check${checks > 1 ? 's' : ''}`
      : 'no history yet';

    return `
      <div class="status-card">
        <div class="status-card-header">
          <div class="status-name-group">
            <div class="status-name">${mod.name}</div>
            <div class="status-url"><a href="${mod.url}" target="_blank">${mod.displayUrl} ↗</a></div>
          </div>
          <div class="status-badge">
            <span class="status-indicator ${dotClass}">${dotChar} ${label}</span>
            <span class="status-latency">${latency}</span>
          </div>
        </div>
        <div class="status-divider"></div>
        <div class="status-meta">
          <div class="status-meta-line">stack: <span>${mod.stack}</span></div>
          <div class="status-meta-line">infra: <span>${mod.infra}</span></div>
          <div class="status-meta-line">desc: <span>${mod.desc}</span></div>
        </div>
        <div class="status-uptime-bar" title="check history — oldest to newest">${segs}</div>
        <div class="status-uptime-label">${uptimeTxt}</div>
      </div>`;
  }).join('');
}

const _sState = {};
let _sCheckedOnce = false;

async function runStatusChecks() {
  const btn = document.getElementById('status-refresh-btn');
  if (btn) btn.disabled = true;

  STATUS_MODULES.forEach(m => { _sState[m.id] = { status: 'checking', ms: null }; });
  statusRender(_sState);

  await Promise.all(STATUS_MODULES.map(async mod => {
    const res = await statusPingModule(mod);
    statusPushHistory(mod.id, res.up);
    _sState[mod.id] = { status: res.up ? 'up' : 'down', ms: res.ms };
    statusRender(_sState);
  }));

  const now = new Date();
  const el = document.getElementById('status-last-time');
  if (el) el.textContent = 'last checked: ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  if (btn) btn.disabled = false;
}

// render checking state immediately so placeholder never shows
STATUS_MODULES.forEach(m => { _sState[m.id] = { status: 'checking', ms: null }; });
statusRender(_sState);

// kick off actual pings as soon as DOM is ready
document.addEventListener('DOMContentLoaded', runStatusChecks);

// re-run on modules nav click
document.querySelector('a[data-section="modules"]')
  ?.addEventListener('click', () => setTimeout(runStatusChecks, 50));

// re-check every 60s while modules section is active
setInterval(() => {
  const sec = document.getElementById('modules');
  if (sec && sec.classList.contains('active')) runStatusChecks();
}, 60000);

// ── DEPLOY ──
async function deployProject(deployId) {
  let key = sessionStorage.getItem('deploy_key');
  if (!key) {
    key = prompt('deploy key:');
    if (!key) return;
    sessionStorage.setItem('deploy_key', key);
  }

  const modal = document.getElementById('deploy-modal');
  const output = document.getElementById('deploy-modal-output');
  const title = document.getElementById('deploy-modal-title');
  title.textContent = '$ deploy ' + deployId;
  output.textContent = '';
  modal.style.display = 'flex';

  try {
    const res = await fetch('https://deploy-saiworks.nncs.in/deploy/' + deployId, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key },
    });

    if (res.status === 401) {
      sessionStorage.removeItem('deploy_key');
      output.textContent = '✕ wrong key. try again.';
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output.textContent += decoder.decode(value);
      output.scrollTop = output.scrollHeight;
    }
  } catch (e) {
    output.textContent += '\n✕ error: ' + e.message;
  }
}

function closeDeployModal() {
  document.getElementById('deploy-modal').style.display = 'none';
}

// terminal block cursor
(function () {
  const cur = document.createElement('div');
  cur.id = 'terminal-cursor';
  document.body.appendChild(cur);

  document.addEventListener('mousemove', e => {
    cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  document.addEventListener('mouseleave', () => { cur.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cur.style.opacity = '1'; });
})();
