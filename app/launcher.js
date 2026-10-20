(() => {
  'use strict';

  const config = window.LAUNCHER_CONFIG;
  const SERVICE_URL = 'ws://127.0.0.1:8081';    // service TizenBrew
  const APPS_URL = 'http://127.0.0.1:8095';      // service du lanceur (service.js)
  const Events = { Ready: -1, GetModules: 4, LaunchModule: 5, Error: 8 };
  const KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13 };
  const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const STORE = { focus: 'launcher.focus', recent: 'launcher.recent' };
  const RECENT_TITLE = 'Récents';
  const RECENT_MAX = 6;
  const ROW_HEIGHT = 262;
  const STEP = 300 + 30;                  // largeur de carte + espace
  const VIEW_WIDTH = 1920 - 2 * 96;
  const DEFAULT_BRAND = { bg: ['#4F46E5', '#1E1B4B'], glow: '#6366F1' };

  const $ = id => document.getElementById(id);

  let rows = [];               // [{ title, items: [item], el, track }]
  let current = 0;             // rangée sélectionnée
  let columns = [];            // colonne mémorisée pour chaque rangée
  let installed = null;        // ids des applis installées (null = pas encore connu, false = inconnu)
  let modules = null;          // modules TizenBrew (null = pas encore connu)
  let socket = null;
  let socketRetries = 0;
  let pendingModule = null;    // module qui attend le feu vert du service avant navigation
  let booted = false;

  // --- Utilitaires ---

  const pad = n => (n < 10 ? '0' : '') + n;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function rgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  let toastTimer = null;
  function toast(message) {
    const node = $('toast');
    node.textContent = message;
    node.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('on'), 3200);
  }

  // --- Horloge ---

  function updateClock() {
    const d = new Date();
    const h = d.getHours();
    $('greeting').textContent = h >= 5 && h < 12 ? 'Bonjour' : h >= 12 && h < 18 ? 'Bon après-midi' : 'Bonsoir';
    $('date').textContent = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    $('time').textContent = pad(h) + ':' + pad(d.getMinutes());
    setTimeout(updateClock, (60 - d.getSeconds()) * 1000);
  }

  // --- Visuel d'une marque : dégradé + logo (ou nom si le logo manque) ---

  function face(brand, name) {
    const node = el('div', 'face');
    const bg = brand.bg || DEFAULT_BRAND.bg;
    node.style.background = `linear-gradient(135deg, ${bg[0]} 0%, ${bg[1]} 100%)`;
    const fallback = () => {
      const monogram = el('div', 'monogram', name);
      monogram.style.color = brand.text || '#FFFFFF';
      node.appendChild(monogram);
    };
    if (brand.logo) {
      const img = el('img');
      img.decoding = 'async';
      img.alt = name;
      img.src = 'logos/' + brand.logo;
      if (brand.white) img.className = 'white';
      if (brand.logoHeight) img.style.maxHeight = brand.logoHeight + '%';
      img.onerror = () => { img.remove(); fallback(); };
      node.appendChild(img);
    } else {
      fallback();
    }
    if (brand.badge) node.appendChild(el('div', 'badge', brand.badge));
    return node;
  }

  // --- Lumière d'ambiance et mise en avant ---

  // Halo elliptique centré en (x, y), rayons (rx, ry), qui s'éteint à 70 % du rayon.
  function paintGlow(ctx, x, y, rx, ry, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx / ry, 1);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
    gradient.addColorStop(0, rgba(color, alpha));
    gradient.addColorStop(0.7, rgba(color, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(-ry * 2, -ry * 2, ry * 4, ry * 4);
    ctx.restore();
  }

  let ambientIndex = 0;
  function setAmbient(glow) {
    const layers = document.querySelectorAll('.ambient-layer');
    const next = layers[ambientIndex = 1 - ambientIndex];
    // Canvas en 192×108 (1/10 de l'écran) : voir .ambient-layer.
    const ctx = next.getContext('2d');
    ctx.clearRect(0, 0, 192, 108);
    paintGlow(ctx, 146, 32, 110, 76, glow, 0.38);
    paintGlow(ctx, 12, -4, 90, 70, glow, 0.16);
    next.classList.add('on');
    layers[1 - ambientIndex].classList.remove('on');
  }

  let artIndex = 0;
  let heroTimer = null;
  let heroKey = null;
  function showHero(item) {
    clearTimeout(heroTimer);
    // Petit délai : en maintenant une flèche, on n'anime que la destination finale.
    heroTimer = setTimeout(() => {
      if (item.key === heroKey) return;
      heroKey = item.key;

      $('hero-kicker').textContent = item.kicker;
      $('hero-title').textContent = item.name;
      $('hero-tagline').textContent = item.tagline || '';
      const meta = $('hero-meta');
      meta.textContent = '';
      const primary = el('span', 'chip primary');
      primary.appendChild(el('span', 'key', 'OK'));
      primary.appendChild(document.createTextNode('Ouvrir'));
      meta.appendChild(primary);
      if (item.meta) meta.appendChild(el('span', 'chip', item.meta));
      $('hero-text').animate(
        [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
        { duration: 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );

      const arts = document.querySelectorAll('.hero-art .art');
      const next = arts[artIndex = 1 - artIndex];
      next.textContent = '';
      next.appendChild(face(item.brand, item.name));
      next.classList.add('on');
      arts[1 - artIndex].classList.remove('on');

      setAmbient(item.brand.glow || DEFAULT_BRAND.glow);
    }, 90);
  }

  // --- Lancement ---

  // La page n'a pas accès à l'API tizen : lancement et liste des applis passent par service.js.
  function launchApp(app) {
    return fetch(APPS_URL + '/launch?id=' + encodeURIComponent(app.id))
      .then(res => { if (!res.ok) throw new Error(); });
  }

  // Les touches des modules sont enregistrées par TizenBrew à l'ouverture du lanceur (champ "keys" du package.json).
  function launchModule(mdl) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return Promise.reject(new Error());
    send({ type: Events.LaunchModule, payload: mdl });
    if (mdl.evaluateScriptOnDocumentStart) pendingModule = mdl;
    else location.href = mdl.appPath;
    return Promise.resolve();
  }

  let splashTimer = null;
  function hideSplash() {
    clearTimeout(splashTimer);
    $('splash').classList.remove('on');
  }

  function open(item) {
    item.tile.classList.add('pressed');
    setTimeout(() => item.tile.classList.remove('pressed'), 160);
    rememberRecent(item.key);

    const splash = $('splash');
    splash.textContent = '';
    splash.appendChild(face(item.brand, item.name));
    splash.classList.add('on');

    setTimeout(() => {
      item.run().catch(() => {
        hideSplash();
        toast(`Impossible d'ouvrir ${item.name}`);
      });
    }, 300);
    // Filet de sécurité si l'appli ne prend jamais la main.
    splashTimer = setTimeout(hideSplash, 8000);
  }

  // Retour sur le lanceur après une appli native.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) hideSplash(); });

  // --- Récents ---

  function recentKeys() {
    try { return JSON.parse(localStorage.getItem(STORE.recent)) || []; } catch (e) { return []; }
  }

  function rememberRecent(key) {
    const keys = [key].concat(recentKeys().filter(k => k !== key)).slice(0, RECENT_MAX);
    localStorage.setItem(STORE.recent, JSON.stringify(keys));
  }

  // --- Service TizenBrew (WebSocket local) ---

  function send(message) {
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }

  function connectService() {
    socket = new WebSocket(SERVICE_URL);
    socket.onopen = () => {
      socketRetries = 0;
      send({ type: Events.GetModules });
    };
    socket.onmessage = event => {
      const { type, payload } = JSON.parse(event.data);
      if (type === Events.GetModules) {
        if (payload === null) return setTimeout(() => send({ type: Events.GetModules }), 500);
        modules = payload.filter(m => m.appPath && !config.modules.hidden.includes(m.fullName));
        send({ type: Events.Ready });
        refresh();
      } else if (type === Events.LaunchModule && pendingModule) {
        location.href = pendingModule.appPath;
      } else if (type === Events.Error) {
        toast('TizenBrew : ' + payload);
      }
    };
    socket.onclose = () => {
      socket = null;
      if (++socketRetries <= 5) setTimeout(connectService, 2000);
    };
  }

  // service.js démarre en même temps que la page : on réessaie le temps qu'il soit prêt.
  function loadInstalledApps(attempt = 1) {
    fetch(APPS_URL + '/apps')
      .then(res => res.json())
      .then(ids => {
        installed = {};
        for (const id of ids) installed[id] = true;
        refresh();
      })
      .catch(() => { if (attempt < 20) setTimeout(() => loadInstalledApps(attempt + 1), 500); });
  }

  // --- Construction des rangées ---

  function buildRows() {
    const result = [];

    if (modules && modules.length) {
      result.push({
        title: config.modules.title,
        items: modules.map(m => {
          const brand = config.modules.brands[m.fullName] || DEFAULT_BRAND;
          return {
            key: m.fullName,
            name: brand.name || m.appName,
            tagline: brand.tagline || m.description,
            meta: 'Module TizenBrew',
            brand,
            run: () => launchModule(m)
          };
        })
      });
    }

    for (const section of config.sections) {
      const apps = section.apps.filter(a => !installed || installed[a.id]);
      if (!apps.length) continue;
      result.push({
        title: section.title,
        items: apps.map(a => ({ key: a.id, name: a.name, tagline: a.tagline, brand: a, run: () => launchApp(a) }))
      });
    }

    for (const row of result) for (const item of row.items) item.kicker = row.title;

    const byKey = {};
    for (const row of result) for (const item of row.items) byKey[item.key] = item;
    const recent = recentKeys().map(k => byKey[k]).filter(Boolean);
    if (recent.length) {
      result.unshift({ title: RECENT_TITLE, items: recent.map(i => Object.assign({}, i, { meta: 'Ouvert récemment' })) });
    }
    return result;
  }

  function render() {
    // Garde la sélection en cours si les données arrivent pendant qu'on navigue.
    const focused = rows[current] && rows[current].items[columns[current]];
    const keep = focused && { title: rows[current].title, key: focused.key };

    const container = $('rows');
    container.textContent = '';
    rows = buildRows();
    for (const row of rows) {
      row.el = el('section', 'row');
      row.el.appendChild(el('div', 'row-title', row.title));
      row.track = el('div', 'track');
      for (const item of row.items) {
        const tile = el('div', 'tile');
        const card = el('div', 'card');
        card.appendChild(face(item.brand, item.name));
        tile.appendChild(el('div', 'ring'));
        tile.appendChild(card);
        item.tile = tile;
        row.track.appendChild(tile);
      }
      row.el.appendChild(row.track);
      container.appendChild(row.el);
    }
    if (!rows.length) return;

    // Au démarrage : la dernière appli ouverte (« Récents »), sinon la dernière tuile choisie.
    columns = rows.map(() => 0);
    current = 0;
    const target = keep || (rows[0].title !== RECENT_TITLE && { key: localStorage.getItem(STORE.focus) });
    if (target) {
      rows.forEach((row, r) => {
        if (target.title && row.title !== target.title) return;
        const c = row.items.findIndex(item => item.key === target.key);
        if (c >= 0) { current = r; columns[r] = c; }
      });
    }
    focus(current, columns[current], false);
  }

  // Premier affichage dès que tout est connu (ou après un court délai), avec animation d'entrée.
  function refresh() {
    if (!booted && (modules === null || installed === null)) return;
    render();
    if (!booted) {
      booted = true;
      document.body.classList.replace('intro', 'boot');
      setTimeout(() => document.body.classList.remove('boot'), 1400);
    }
  }

  // --- Navigation ---

  function focus(r, c, remember = true) {
    const previous = rows[current] && rows[current].items[columns[current]];
    if (previous) previous.tile.classList.remove('focus');

    current = r;
    columns[r] = c;
    const row = rows[r];
    const item = row.items[c];
    item.tile.classList.add('focus');

    const maxOffset = Math.max(0, row.items.length * STEP - 30 - VIEW_WIDTH + 40);
    row.track.style.transform = `translateX(${-clamp((c - 1) * STEP, 0, maxOffset)}px)`;
    $('rows').style.transform = `translateY(${-r * ROW_HEIGHT}px)`;
    rows.forEach((other, i) => {
      other.el.classList.toggle('above', i < r);
      other.el.classList.toggle('current', i === r);
      other.el.classList.toggle('below', i > r);
    });

    showHero(item);
    if (remember && row.title !== RECENT_TITLE) localStorage.setItem(STORE.focus, item.key);
  }

  document.addEventListener('keydown', event => {
    if (!rows.length) return;
    const r = current;
    const c = columns[r];
    switch (event.keyCode) {
      case KEY.LEFT: if (c > 0) focus(r, c - 1); break;
      case KEY.RIGHT: if (c < rows[r].items.length - 1) focus(r, c + 1); break;
      case KEY.UP: if (r > 0) focus(r - 1, Math.min(columns[r - 1], rows[r - 1].items.length - 1)); break;
      case KEY.DOWN: if (r < rows.length - 1) focus(r + 1, Math.min(columns[r + 1], rows[r + 1].items.length - 1)); break;
      case KEY.ENTER: open(rows[r].items[c]); break;
      default: return;
    }
    event.preventDefault();
  });

  // --- Démarrage ---

  updateClock();
  loadInstalledApps();
  connectService();
  // Si un service tarde, on affiche quand même : les rangées se compléteront à son arrivée.
  setTimeout(() => {
    if (modules === null) modules = [];
    if (installed === null) installed = false;
    refresh();
  }, 1500);
})();
