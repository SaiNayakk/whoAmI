// ── ~/ : a tiny text adventure through sai's life ──
// Type commands or tap the suggestions. Everything here is true; the gaps are marked.
(function () {
  const root = document.getElementById('adv');
  if (!root) return;
  const out = document.getElementById('adv-out');
  const form = document.getElementById('adv-form');
  const input = document.getElementById('adv-in');
  const chips = document.getElementById('adv-chips');

  // Rooms, in the order life happened. `items` can be taken; `people` can be talked to.
  const W = {
    silvassa: {
      title: 'silvassa', tag: 'v0.1.0 · origin',
      desc: 'you wake up in silvassa. this is where the core was installed. a road leads north, to bengaluru.',
      items: { curiosity: 'weighs nothing. you will carry it everywhere.' },
      people: {},
      exits: { north: 'uvce' },
    },
    uvce: {
      title: 'uvce, bengaluru', tag: '2020 to 2024',
      desc: 'information science at uvce. four years of learning the theory behind things you were already building. home is south. a glass building glints to the east.',
      items: { transcript: 'cgpa 8.94. not bad for someone who would rather be shipping.' },
      people: {},
      exits: { south: 'silvassa', east: 'intern' },
    },
    intern: {
      title: 'fidelity, as an intern', tag: 'two stints, seven months',
      desc: 'an intern badge, twice. you are nervous in the orientation sessions. a new joiner by the door has been waiting days to get set up.',
      items: { 'offer letter': 'they offered. you stayed.' },
      people: { 'new joiner': 'they have been waiting days to get set up. you write a python tool so the next one will not have to.' },
      exits: { west: 'uvce', north: 'trainee' },
    },
    trainee: {
      title: 'fidelity, graduate trainee', tag: 'jul 2024 to aug 2025',
      desc: 'first job out of college, same company. you spend it fixing things that looked fine on paper but quietly were not.',
      items: { backoff: null }, // special: see take()
      people: {},
      exits: { south: 'intern', north: 'engineer' },
    },
    engineer: {
      title: 'fidelity, software engineer', tag: 'aug 2025 to now',
      desc: 'mainframe brokerage systems, becoming microservices. an intern is looking at you the way you once looked at everyone. there is a panel stage, and a tie on a hanger. a door east has your name on it; another, north, is unfinished.',
      items: {
        award: 'fmr india excellence award, culture & community champion, with the leap alumni core team. jan 2025.',
        tie: 'from tuck & tie day: interns who could not tie a tie walked out suited. you were on the team behind it.',
      },
      people: {
        intern: 'they are nervous. you remember that. you run the session you once sat in.',
        panel: 'the youngest voice on it. you came to share and left having learned just as much.',
      },
      exits: { south: 'trainee', east: 'home', north: 'next' },
    },
    home: {
      title: 'home', tag: 'aug 2, 2025',
      desc: 'you walk into your new home. then the emis start. a drawer in the corner hums quietly.',
      items: {
        keys: 'yours. so is the loan.',
        phone: 'your old phone. retired to this drawer. it did not stay retired.',
      },
      people: {},
      exits: { west: 'engineer' },
    },
    next: {
      title: 'next', tag: 'under construction',
      // DRAFT: where sai is headed. To be written with him.
      desc: 'the room is half built. there is more automation to write, and more people to hand the ladder down to. the blueprints are still being drawn.',
      items: {},
      people: {},
      exits: { south: 'engineer' },
    },
  };
  const ORDER = ['silvassa', 'uvce', 'intern', 'trainee', 'engineer', 'home', 'next'];
  const DIRS = { n: 'north', s: 'south', e: 'east', w: 'west' };

  let st = { room: 'silvassa', inv: [], seen: ['silvassa'], taken: [] };
  try { const saved = JSON.parse(localStorage.getItem('adv') || 'null'); if (saved && W[saved.room]) st = saved; } catch {}
  const save = () => { try { localStorage.setItem('adv', JSON.stringify(st)); } catch {} };

  function print(text, cls) {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.innerHTML = text;
    out.appendChild(p);
    while (out.children.length > 60) out.firstChild.remove();
    out.scrollTop = out.scrollHeight;
  }
  const room = () => W[st.room];
  const itemsHere = () => Object.keys(room().items).filter((k) => !st.taken.includes(`${st.room}:${k}`));

  function describe() {
    const r = room();
    print(`<span class="adv-room">${r.title}</span> <span class="adv-tag">${r.tag}</span>`);
    print(r.desc);
    const here = itemsHere(), people = Object.keys(r.people);
    if (here.length) print(`you see: ${here.map((i) => `<b>${i}</b>`).join(', ')}.`, 'adv-dim');
    if (people.length) print(`someone to talk to: ${people.map((p) => `<b>${p}</b>`).join(', ')}.`, 'adv-dim');
    print(`exits: ${Object.keys(r.exits).join(', ')}.`, 'adv-dim');
  }

  function go(dir) {
    dir = DIRS[dir] || dir;
    const to = room().exits[dir];
    if (!to) return print(`you can't go ${dir} from here.`, 'adv-dim');
    st.room = to;
    if (!st.seen.includes(to)) st.seen.push(to);
    save();
    describe();
    if (to === 'next' && st.seen.length === ORDER.length) print('you have seen every room. that is the whole story so far. type <b>hire sai</b> if you liked it.', 'adv-acc');
  }

  async function take(name) {
    const r = room();
    const key = Object.keys(r.items).find((k) => k === name || k.startsWith(name));
    if (!key || st.taken.includes(`${st.room}:${key}`)) return print(`there is no ${name} here.`, 'adv-dim');
    if (key === 'backoff') {
      busy = true;
      for (const s of [1, 2, 4]) { print(`you try to take it. it fails. retrying in ${s}s…`, 'adv-dim'); await new Promise((res) => setTimeout(res, s * 1000)); }
      print('got it. exponential backoff: how you shipped retry logic for micro-deposits.', 'adv-acc');
      busy = false;
    } else {
      print(`taken: <b>${key}</b>. ${r.items[key]}`);
    }
    st.taken.push(`${st.room}:${key}`);
    st.inv.push(key);
    save();
    if (key === 'phone') print('<a href="#server" onclick="showSection(\'server\')">see what it runs now →</a>', 'adv-acc');
  }

  function examine(name) {
    const r = room();
    const item = Object.keys(r.items).find((k) => k === name || k.startsWith(name));
    if (item && item !== 'backoff') return print(r.items[item]);
    if (item === 'backoff') return print('it keeps failing, then trying again a little later. very patient.');
    if (st.inv.includes(name)) return print(`you're carrying it. ${Object.values(W).map((w) => w.items[name]).find(Boolean) || ''}`);
    const person = Object.keys(r.people).find((k) => k === name || k.startsWith(name));
    if (person) return print(`${person}. maybe <b>talk ${person}</b>.`, 'adv-dim');
    describe();
  }

  function talk(name) {
    const r = room();
    const person = Object.keys(r.people).find((k) => k === name || k.startsWith(name));
    if (!person) return print(name ? `there's no ${name} here.` : 'talk to whom?', 'adv-dim');
    print(r.people[person]);
  }

  function map() {
    const line = ORDER.map((k) => (k === st.room ? `<b class="adv-acc">[${W[k].title.split(',')[0]}]</b>` : st.seen.includes(k) ? W[k].title.split(',')[0] : '???')).join(' → ');
    print(line);
  }

  const JOKES = {
    sudo: 'sai is not in the sudoers file. this incident will be reported.',
    xyzzy: 'a hollow voice says: the rest of the site is behind the nav bar.',
    dance: 'the whale at the bottom of the page does this better.',
    ls: 'you are in a life, not a directory. try <b>look</b>.',
    'rm -rf': 'nice try.',
  };

  let busy = false;
  async function run(raw) {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd || busy) return;
    print(`&gt; ${cmd.replace(/</g, '&lt;')}`, 'adv-cmd');
    const [verb, ...rest] = cmd.split(' ');
    const arg = rest.join(' ').replace(/^(at|to|the) /, '');
    if (['n', 's', 'e', 'w', 'north', 'south', 'east', 'west'].includes(verb)) go(verb);
    else if (verb === 'go' || verb === 'walk') go(arg);
    else if (verb === 'look' || verb === 'l') arg ? examine(arg) : describe();
    else if (['examine', 'x', 'read', 'inspect'].includes(verb)) examine(arg);
    else if (verb === 'take' || verb === 'get' || verb === 'pick') await take(arg.replace(/^up /, ''));
    else if (verb === 'talk' || verb === 'ask') talk(arg);
    else if (verb === 'inventory' || verb === 'i') print(st.inv.length ? `you carry: ${st.inv.join(', ')}.` : 'your pockets are empty. try <b>take</b>.', 'adv-dim');
    else if (verb === 'map') map();
    else if (verb === 'help' || verb === '?') print('look · north/south/east/west · take &lt;thing&gt; · talk &lt;someone&gt; · inventory · map · restart', 'adv-dim');
    else if (verb === 'restart') { st = { room: 'silvassa', inv: [], seen: ['silvassa'], taken: [] }; save(); out.innerHTML = ''; describe(); }
    else if (verb === 'clear') out.innerHTML = '';
    else if (verb === 'whoami') print('saishravan nitish nayak. you are playing as him.');
    else if (cmd === 'hire sai' || verb === 'hire' || verb === 'contact' || verb === 'email') print('good choice. <a href="mailto:sai31nayak@gmail.com">sai31nayak@gmail.com</a>', 'adv-acc');
    else if (JOKES[cmd] || JOKES[verb]) print(JOKES[cmd] || JOKES[verb], 'adv-dim');
    else print(`"${verb}" means nothing here. type <b>help</b>.`, 'adv-dim');
    renderChips();
  }

  // Tappable suggestions: what makes sense in this room right now.
  function renderChips() {
    const r = room();
    const opts = [
      'look',
      ...Object.keys(r.exits).map((d) => `${d}`),
      ...itemsHere().map((i) => `take ${i}`),
      ...Object.keys(r.people).map((p) => `talk ${p}`),
      st.inv.length ? 'inventory' : null,
      'map',
    ].filter(Boolean);
    chips.innerHTML = '';
    for (const o of opts) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = o;
      b.addEventListener('click', () => { run(o); });
      chips.appendChild(b);
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; run(v); });
  // Keep typing inside the game from steering the snake or opening other easter eggs.
  input.addEventListener('keydown', (e) => e.stopPropagation());
  root.addEventListener('click', (e) => { if (e.target === out || e.target.closest('#adv-out')) input.focus({ preventScroll: true }); });

  print(st.seen.length > 1 ? 'welcome back. picking up where you left off.' : "a short game about sai. type, or tap below. <b>help</b> lists commands.", 'adv-dim');
  describe();
  renderChips();

})();
