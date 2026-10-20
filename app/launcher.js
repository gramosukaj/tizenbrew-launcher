(() => {
  'use strict';

  const config = window.LAUNCHER_CONFIG;
  const SERVICE_URL = 'ws://127.0.0.1:8081';    // service TizenBrew
  const APPS_URL = 'http://127.0.0.1:8095';      // service du lanceur (service.js)
  const Events = { Ready: -1, GetModules: 4, LaunchModule: 5, Error: 8 };
  const KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESCAPE: 27 };
  const LONG_PRESS = 600;
  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const STORE = { favorites: 'launcher.favorites', recent: 'launcher.recent' };
  const MAX_FAVORITES = config.maxFavorites;
  const RECENT_TITLE = 'Récents';
  const RECENT_MAX = 6;
  const ROW_HEIGHT = 262;
  const STEP = 300 + 30;                  // largeur de carte + espace (toutes les applis)
  const VIEW_WIDTH = 1920 - 2 * 96;
  const DEFAULT_BRAND = { bg: ['#4F46E5', '#1E1B4B'], glow: '#6366F1' };

  // Pictogrammes maison (trait, grille 24×24).
  const ICONS = {
    input: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 13.5z"/><path d="M8 20h8M12 16v4"/>',
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.6 16a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19.2" r="1" fill="currentColor"/>',
    ethernet: '<path d="M7 4h10v7h3v9H4v-9h3z"/><path d="M9 20v-4M12 20v-4M15 20v-4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z" fill="currentColor" stroke="none"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    partly: '<path d="M9 4.5v1.3M3.9 6.6l.9.9M2 11.5h1.3M13.2 7.5l.9-.9"/><path d="M5.8 11.6a3.6 3.6 0 0 1 6.6-2.4"/><path d="M8.5 20h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.5 1.3A2.9 2.9 0 0 0 8.5 20z"/>',
    cloud: '<path d="M7 19h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.2 3.2 0 0 0 7 19z"/>',
    fog: '<path d="M4 9h16M3 13h18M5 17h14"/>',
    rain: '<path d="M7 15h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.2 3.2 0 0 0 7 15z"/><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5"/>',
    snow: '<path d="M7 15h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.2 3.2 0 0 0 7 15z"/><path d="M9 19h.01M12 21h.01M15 19h.01"/>',
    storm: '<path d="M7 15h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.2 3.2 0 0 0 7 15z"/><path d="M13 15l-2 3.5h3l-2 3.5"/>'
  };

  const $ = id => document.getElementById(id);

  let items = {};              // tout le catalogue, par clé (id d'appli ou nom de module)
  let favorites = [];          // clés des favoris, dans l'ordre du rail
  let dock = [];               // éléments affichés dans le rail
  let rows = [];               // rangées de « Toutes les applis » : [{ title, items, el, track }]
  let actions = [];            // raccourcis en haut à droite : [{ label, icon, app, el }]
  let zone = 'dock';           // 'actions' | 'dock' | 'library' | 'panel'
  let actionIndex = 0;
  let dockIndex = 0;
  let current = 0;             // rangée sélectionnée dans « Toutes les applis »
  let columns = [];            // colonne mémorisée pour chaque rangée
  let focusedEl = null;
  let panel = null;            // état du panneau « épingler sur l'accueil »
  let installed = null;        // ids des applis installées (null = pas encore connu, false = inconnu)
  let modules = null;          // modules TizenBrew (null = pas encore connu)
  let network = null;          // état réseau fourni par service.js
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

  function icon(name) {
    const holder = document.createElement('div');
    holder.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
    return holder.firstChild;
  }

  function animateIn(node) {
    node.animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
      { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  }

  let toastTimer = null;
  function toast(message) {
    const node = $('toast');
    node.textContent = message;
    node.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('on'), 3200);
  }

  // --- Heure et météo ---

  function updateClock() {
    const d = new Date();
    const h = d.getHours();
    const hello = h >= 5 && h < 18 ? 'Bonjour' : 'Bonsoir';
    $('greeting').textContent = config.user.name ? `${hello} ${config.user.name}` : hello;
    $('time').textContent = pad(h) + ':' + pad(d.getMinutes());
    $('date').textContent = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    setTimeout(updateClock, (60 - d.getSeconds()) * 1000);
  }

  // Codes météo WMO renvoyés par Open-Meteo.
  function weatherIcon(code, isDay) {
    if (code === 0) return isDay ? 'sun' : 'moon';
    if (code <= 2) return 'partly';
    if (code === 3) return 'cloud';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'storm';
    return 'rain';
  }

  function updateWeather() {
    const w = config.weather;
    if (!w) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${w.latitude}&longitude=${w.longitude}` +
          '&current=temperature_2m,weather_code,is_day&timezone=auto')
      .then(res => res.json())
      .then(data => {
        const node = $('weather');
        node.textContent = '';
        node.appendChild(icon(weatherIcon(data.current.weather_code, data.current.is_day)));
        node.appendChild(document.createTextNode(`${Math.round(data.current.temperature_2m)}° · ${w.city}`));
      })
      .catch(() => {});
    setTimeout(updateWeather, 30 * 60 * 1000);
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

  function tile(item, withMark) {
    const node = el('div', 'tile');
    const card = el('div', 'card');
    card.appendChild(face(item.brand, item.name));
    if (withMark && favorites.includes(item.key)) {
      const mark = el('div', 'fav-mark');
      mark.appendChild(icon('star'));
      card.appendChild(mark);
    }
    node.appendChild(el('div', 'ring'));
    node.appendChild(card);
    return node;
  }

  // --- Lumière d'ambiance ---

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
  let ambientColor = null;
  function setAmbient(glow) {
    if (glow === ambientColor) return;
    ambientColor = glow;
    const layers = document.querySelectorAll('.ambient-layer');
    const next = layers[ambientIndex = 1 - ambientIndex];
    // Canvas en 192×108 (1/10 de l'écran) : voir .ambient-layer.
    const ctx = next.getContext('2d');
    ctx.clearRect(0, 0, 192, 108);
    paintGlow(ctx, 70, 52, 80, 46, glow, 0.42);
    paintGlow(ctx, 150, 20, 70, 50, glow, 0.14);
    next.classList.add('on');
    layers[1 - ambientIndex].classList.remove('on');
  }

  // --- Textes de l'élément sélectionné ---

  let infoTimer = null;
  let infoKey = null;
  function showInfo(item) {
    clearTimeout(infoTimer);
    // Petit délai : en maintenant une flèche, on n'anime que la destination finale.
    infoTimer = setTimeout(() => {
      const key = zone + ':' + item.key;
      if (key === infoKey) return;
      infoKey = key;
      if (zone === 'library') {
        $('library-kicker').textContent = item.kicker;
        $('library-title').textContent = item.name;
        $('library-tagline').textContent = item.tagline || '';
        animateIn($('library-head'));
      } else {
        $('spotlight-name').textContent = item.name;
        $('spotlight-tagline').textContent = item.tagline || '';
        animateIn($('spotlight'));
      }
      setAmbient(item.brand.glow || DEFAULT_BRAND.glow);
    }, 90);
  }

  // --- Lancement ---

  // La page n'a pas accès à l'API tizen : lancement et liste des applis passent par service.js.
  function launchApp(id) {
    return fetch(APPS_URL + '/launch?id=' + encodeURIComponent(id))
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

  // --- Récents et favoris (gardés sur la TV) ---

  function stored(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }

  function rememberRecent(key) {
    const keys = [key].concat(stored(STORE.recent, []).filter(k => k !== key)).slice(0, RECENT_MAX);
    localStorage.setItem(STORE.recent, JSON.stringify(keys));
  }

  function saveFavorites(keys) {
    favorites = keys.slice(0, MAX_FAVORITES);
    localStorage.setItem(STORE.favorites, JSON.stringify(favorites));
  }

  // --- Services de la TV ---

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
        modules = payload.filter(m => m.appPath && !config.modules.hidden.some(prefix => m.fullName.startsWith(prefix)));
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
        loadNetwork();
      })
      .catch(() => { if (attempt < 20) setTimeout(() => loadInstalledApps(attempt + 1), 500); });
  }

  // Absent des anciennes versions de service.js : le raccourci réseau reste alors générique.
  function loadNetwork() {
    fetch(APPS_URL + '/status')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(status => {
        network = status.network;
        if (zone !== 'panel') renderActions();
      })
      .catch(() => {});
    setTimeout(loadNetwork, 60 * 1000);
  }

  // --- Catalogue ---

  function buildCatalogue() {
    const library = [];
    items = {};

    if (modules && modules.length) {
      library.push({
        title: config.modules.title,
        items: modules.map(m => {
          const brand = config.modules.brands[m.fullName] || DEFAULT_BRAND;
          return { key: m.fullName, name: brand.name || m.appName, tagline: brand.tagline || m.description, brand, run: () => launchModule(m) };
        })
      });
    }
    for (const section of config.sections) {
      const apps = section.apps.filter(a => !installed || installed[a.id]);
      if (apps.length) {
        library.push({
          title: section.title,
          items: apps.map(a => ({ key: a.id, name: a.name, tagline: a.tagline, brand: a, run: () => launchApp(a.id) }))
        });
      }
    }
    for (const row of library) {
      for (const item of row.items) {
        item.kicker = row.title;
        items[item.key] = item;
      }
    }

    const recent = stored(STORE.recent, []).map(k => items[k]).filter(Boolean);
    if (recent.length) library.unshift({ title: RECENT_TITLE, items: recent.map(i => Object.assign({}, i)) });
    return library;
  }

  // --- Affichage ---

  function renderActions() {
    const container = $('actions');
    container.textContent = '';
    actions = config.actions.map(action => {
      let label = action.label;
      let name = action.icon;
      if (action.network && network) {
        label = network.type === 'ethernet' ? 'Ethernet' : network.type === 'wifi' ? 'Wi-Fi' : action.label;
        name = network.type === 'ethernet' ? 'ethernet' : 'wifi';
      }
      const node = el('div', 'pill');
      node.appendChild(icon(name));
      node.appendChild(document.createTextNode(label));
      container.appendChild(node);
      return Object.assign({ el: node }, action);
    });
    if (zone === 'actions') highlight(actions[actionIndex].el);
  }

  function renderDock() {
    const container = $('dock');
    container.textContent = '';
    dock = favorites.map(k => items[k]).filter(Boolean).map(item => Object.assign({}, item));
    if (!dock.length) {
      container.appendChild(el('div', 'dock-empty', 'Maintiens OK sur une appli pour l\'épingler ici'));
      return;
    }
    for (const item of dock) {
      item.tile = tile(item, false);
      container.appendChild(item.tile);
    }
  }

  function renderLibrary() {
    const container = $('rows');
    container.textContent = '';
    for (const row of rows) {
      row.el = el('section', 'row');
      row.el.appendChild(el('div', 'row-title', row.title));
      row.track = el('div', 'track');
      for (const item of row.items) {
        item.tile = tile(item, true);
        row.track.appendChild(item.tile);
      }
      row.el.appendChild(row.track);
      container.appendChild(row.el);
    }
  }

  function render() {
    const focusedKey = currentItem() && currentItem().key;
    const libraryRow = zone === 'library' && rows[current] && rows[current].title;

    rows = buildCatalogue();
    renderActions();
    renderDock();
    renderLibrary();
    columns = rows.map(() => 0);

    // Remet la sélection sur le même élément si les données arrivent pendant qu'on navigue.
    focusedEl = null;
    if (zone === 'library' && rows.length) {
      let target = { r: 0, c: 0 };
      rows.forEach((row, r) => {
        const c = row.items.findIndex(i => i.key === focusedKey);
        if (c >= 0 && row.title === libraryRow) target = { r, c };
      });
      focusLibrary(target.r, target.c);
    } else if (zone === 'actions') {
      focusAction(actionIndex);
    } else if (dock.length) {
      const i = dock.findIndex(d => d.key === focusedKey);
      focusDock(i >= 0 ? i : clamp(dockIndex, 0, dock.length - 1));
    } else if (rows.length) {
      focusLibrary(0, 0);
    }
  }

  // Premier affichage dès que tout est connu (ou après un court délai), avec animation d'entrée.
  function refresh() {
    if (!booted && (modules === null || installed === null)) return;
    if (zone === 'panel') return;
    render();
    if (!booted) {
      booted = true;
      document.body.classList.replace('intro', 'boot');
      setTimeout(() => document.body.classList.remove('boot'), 1500);
    }
  }

  // --- Navigation ---

  function currentItem() {
    if (zone === 'dock') return dock[dockIndex];
    if (zone === 'library') return rows[current] && rows[current].items[columns[current]];
    return null;
  }

  function highlight(node) {
    if (focusedEl) focusedEl.classList.remove('focus');
    focusedEl = node;
    node.classList.add('focus');
  }

  function setScreen() {
    $('stage').classList.toggle('library-open', zone === 'library');
  }

  function focusAction(i) {
    zone = 'actions';
    actionIndex = i;
    highlight(actions[i].el);
    setScreen();
  }

  function focusDock(i) {
    zone = 'dock';
    dockIndex = i;
    highlight(dock[i].tile);
    setScreen();
    showInfo(dock[i]);
  }

  function focusLibrary(r, c) {
    zone = 'library';
    current = r;
    columns[r] = c;
    const row = rows[r];
    const item = row.items[c];
    highlight(item.tile);

    const maxOffset = Math.max(0, row.items.length * STEP - 30 - VIEW_WIDTH + 40);
    row.track.style.transform = `translateX(${-clamp((c - 1) * STEP, 0, maxOffset)}px)`;
    $('rows').style.transform = `translateY(${-r * ROW_HEIGHT}px)`;
    rows.forEach((other, i) => {
      other.el.classList.toggle('above', i < r);
      other.el.classList.toggle('current', i === r);
      other.el.classList.toggle('below', i > r);
    });
    setScreen();
    showInfo(item);
  }

  function goHome() {
    if (dock.length) focusDock(clamp(dockIndex, 0, dock.length - 1));
    else focusAction(0);
  }

  function move(code) {
    if (zone === 'actions') {
      if (code === KEY.LEFT && actionIndex > 0) focusAction(actionIndex - 1);
      else if (code === KEY.RIGHT && actionIndex < actions.length - 1) focusAction(actionIndex + 1);
      else if (code === KEY.DOWN) goHome();
    } else if (zone === 'dock') {
      if (code === KEY.LEFT && dockIndex > 0) focusDock(dockIndex - 1);
      else if (code === KEY.RIGHT && dockIndex < dock.length - 1) focusDock(dockIndex + 1);
      else if (code === KEY.UP) focusAction(actions.length - 1);
      else if (code === KEY.DOWN && rows.length) focusLibrary(current, columns[current] || 0);
    } else if (zone === 'library') {
      const r = current;
      const c = columns[r];
      if (code === KEY.LEFT && c > 0) focusLibrary(r, c - 1);
      else if (code === KEY.RIGHT && c < rows[r].items.length - 1) focusLibrary(r, c + 1);
      else if (code === KEY.DOWN && r < rows.length - 1) focusLibrary(r + 1, Math.min(columns[r + 1], rows[r + 1].items.length - 1));
      else if (code === KEY.UP && r > 0) focusLibrary(r - 1, Math.min(columns[r - 1], rows[r - 1].items.length - 1));
      else if (code === KEY.UP || code === KEY.BACK || code === KEY.ESCAPE) goHome();
    }
  }

  function activate() {
    if (zone === 'actions') {
      const action = actions[actionIndex];
      launchApp(action.app).catch(() => toast(`Impossible d'ouvrir ${action.label}`));
    } else {
      const item = currentItem();
      if (item) open(item);
    }
  }

  // --- Panneau « épingler sur l'accueil » ---

  // Ordre des favoris si l'élément est placé à la position choisie (et celui qui sortirait du rail).
  function panelLayout() {
    const order = panel.others.slice();
    order.splice(panel.index, 0, panel.item.key);
    return { kept: order.slice(0, MAX_FAVORITES), dropped: order[MAX_FAVORITES] };
  }

  function renderPanel() {
    const { kept, dropped } = panelLayout();
    const slots = $('slots');
    slots.textContent = '';
    for (const key of dropped ? kept.concat(dropped) : kept) {
      const isCandidate = key === panel.item.key;
      const slot = el('div', 'slot ' + (isCandidate ? 'candidate' : key === dropped ? 'dropped' : 'other'));
      const node = tile(items[key], false);
      if (isCandidate && !panel.onRemove) node.classList.add('focus');
      slot.appendChild(node);
      slot.appendChild(el('div', 'slot-number', key === dropped ? 'Retiré' : String(kept.indexOf(key) + 1)));
      slots.appendChild(slot);
    }
    $('panel-remove').classList.toggle('focus', panel.onRemove);
  }

  function keyHint(key, label) {
    const span = el('span');
    span.appendChild(el('span', 'key', key));
    span.appendChild(document.createTextNode(label));
    return span;
  }

  function openPanel(item) {
    const known = favorites.filter(k => items[k]);
    const wasFavorite = known.includes(item.key);
    const others = known.filter(k => k !== item.key);
    panel = {
      item,
      others,
      wasFavorite,
      returnZone: zone,
      onRemove: false,
      index: wasFavorite ? known.indexOf(item.key) : Math.min(others.length, MAX_FAVORITES - 1)
    };
    zone = 'panel';

    $('panel-title').textContent = wasFavorite ? `Déplacer ${item.name}` : `Épingler ${item.name} sur l'accueil`;
    $('panel-subtitle').textContent = others.length >= MAX_FAVORITES && !wasFavorite
      ? `Choisis sa place. Le rail est plein (${MAX_FAVORITES} applis) : le dernier favori en sortira.`
      : 'Choisis sa place dans le rail des favoris.';
    const keys = $('panel-keys');
    keys.textContent = '';
    keys.appendChild(keyHint('← →', 'Position'));
    keys.appendChild(keyHint('OK', 'Valider'));
    keys.appendChild(keyHint('RETOUR', 'Annuler'));
    const remove = $('panel-remove');
    remove.textContent = '';
    remove.appendChild(el('span', 'key', '↓'));
    remove.appendChild(document.createTextNode('Retirer des favoris'));
    remove.classList.toggle('hidden', !wasFavorite);

    renderPanel();
    $('overlay').classList.add('on');
  }

  // Sans changement (annulation), la sélection d'avant est intacte : rien à reconstruire.
  function closePanel(focusKey, changed) {
    $('overlay').classList.remove('on');
    zone = panel.returnZone;
    panel = null;
    if (!changed) return;
    const libraryKey = zone === 'library' && currentItem().key;
    renderDock();
    renderLibrary();
    focusedEl = null;
    if (zone === 'library') {
      const c = rows[current].items.findIndex(i => i.key === libraryKey);
      focusLibrary(current, Math.max(c, 0));
    } else if (dock.length) {
      const i = dock.findIndex(d => d.key === focusKey);
      focusDock(i >= 0 ? i : clamp(dockIndex, 0, dock.length - 1));
    } else {
      focusAction(0);
    }
  }

  function panelKey(code) {
    if (code === KEY.LEFT && !panel.onRemove && panel.index > 0) panel.index--;
    else if (code === KEY.RIGHT && !panel.onRemove && panel.index < Math.min(panel.others.length, MAX_FAVORITES - 1)) panel.index++;
    else if (code === KEY.DOWN && panel.wasFavorite) panel.onRemove = true;
    else if (code === KEY.UP) panel.onRemove = false;
    else if (code === KEY.BACK || code === KEY.ESCAPE) return closePanel(panel.item.key, false);
    else return;
    renderPanel();
  }

  function panelConfirm() {
    const { item, onRemove, others, wasFavorite } = panel;
    if (onRemove) {
      saveFavorites(others);
      toast(`${item.name} retiré des favoris`);
    } else {
      saveFavorites(panelLayout().kept);
      toast(wasFavorite ? `${item.name} déplacé` : `${item.name} épinglé sur l'accueil`);
    }
    closePanel(item.key, true);
  }

  // --- Télécommande : OK court = ouvrir, OK maintenu = épingler ---

  let enterDown = false;
  let enterTimer = null;
  let longPressed = false;

  function enterPressed() {
    if (enterDown) return;           // répétition automatique pendant l'appui
    enterDown = true;
    longPressed = false;
    const item = currentItem();
    if (!item) return;
    item.tile.classList.add('pressed');
    enterTimer = setTimeout(() => {
      longPressed = true;
      item.tile.classList.remove('pressed');
      openPanel(item);
    }, LONG_PRESS);
  }

  function enterReleased() {
    if (!enterDown) return;
    enterDown = false;
    clearTimeout(enterTimer);
    const item = currentItem();
    if (item) item.tile.classList.remove('pressed');
    if (longPressed) return;
    if (zone === 'panel') panelConfirm();
    else activate();
  }

  document.addEventListener('keydown', event => {
    if (!booted) return;
    const code = event.keyCode;
    if (code === KEY.ENTER) enterPressed();
    else if (zone === 'panel') panelKey(code);
    else move(code);
    event.preventDefault();
  });

  document.addEventListener('keyup', event => {
    if (event.keyCode === KEY.ENTER) enterReleased();
  });

  // --- Démarrage ---

  favorites = stored(STORE.favorites, config.favorites.slice());
  const hint = $('scroll-hint');
  hint.appendChild(icon('chevron'));
  hint.appendChild(document.createTextNode('Toutes les applis'));

  updateClock();
  updateWeather();
  loadInstalledApps();
  connectService();
  // Si un service tarde, on affiche quand même : les rangées se compléteront à son arrivée.
  setTimeout(() => {
    if (modules === null) modules = [];
    if (installed === null) installed = false;
    refresh();
  }, 1500);
})();
