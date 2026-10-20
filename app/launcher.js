(() => {
  'use strict';

  const config = window.LAUNCHER_CONFIG;
  const SERVICE_URL = 'ws://127.0.0.1:8081';
  const Events = { Ready: -1, GetModules: 4, LaunchModule: 5, Error: 8 };
  const KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, BACKSPACE: 8, ESCAPE: 27 };
  const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const FOCUS_KEY = 'launcher.focus';
  const DEFAULT_MODULE_COLOR = '#4F46E5';

  const $ = id => document.getElementById(id);
  const rowsEl = $('rows');

  let grid = [];               // grid[ligne][colonne] = { el, key, run }
  let pos = { r: 0, c: 0 };
  let installed = null;        // ids des applis installées (null = inconnu, on affiche tout)
  let modules = [];
  let socket = null;
  let socketRetries = 0;
  let pendingModule = null;    // module qui attend le feu vert du service avant navigation

  // --- Horloge ---

  const pad = n => (n < 10 ? '0' : '') + n;

  function updateClock() {
    const d = new Date();
    $('clock').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    $('date').textContent = DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    setTimeout(updateClock, (60 - d.getSeconds()) * 1000);
  }

  // --- Message temporaire ---

  let toastTimer = null;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }

  // --- Lancement ---

  function launchApp(app) {
    if (!window.tizen) return toast('Ouverture de ' + app.name + ' (hors TV)');
    try {
      tizen.application.launch(app.id, null, () => toast("Impossible d'ouvrir " + app.name));
    } catch (e) {
      toast("Impossible d'ouvrir " + app.name);
    }
  }

  function launchModule(mdl) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return toast('Service TizenBrew non connecté');
    for (const key of mdl.keys || []) {
      try { tizen.tvinputdevice.registerKey(key); } catch (e) { /* touche non enregistrable : on l'ignore */ }
    }
    send({ type: Events.LaunchModule, payload: mdl });
    if (mdl.evaluateScriptOnDocumentStart) pendingModule = mdl;
    else location.href = mdl.appPath;
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
        render();
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

  // --- Affichage ---

  function tile(label, color, textColor, sub) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.style.background = color;
    el.style.color = textColor || '#FFFFFF';
    el.textContent = label;
    if (sub) {
      const small = document.createElement('small');
      small.textContent = sub;
      el.appendChild(small);
    }
    return el;
  }

  function sections() {
    const result = [];
    if (modules.length) {
      result.push({
        title: config.modules.title,
        items: modules.map(m => {
          const label = config.modules.labels[m.fullName] || {};
          return {
            key: m.fullName,
            el: tile(label.name || m.appName, label.color || DEFAULT_MODULE_COLOR, label.text, label.sub),
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
        items: apps.map(a => ({ key: a.id, el: tile(a.name, a.color, a.text, a.sub), run: () => launchApp(a) }))
      });
    }
    return result;
  }

  function render() {
    const savedKey = localStorage.getItem(FOCUS_KEY);
    rowsEl.textContent = '';
    grid = [];

    for (const section of sections()) {
      const row = document.createElement('section');
      row.className = 'row';
      const title = document.createElement('h2');
      title.textContent = section.title;
      const tiles = document.createElement('div');
      tiles.className = 'tiles';
      for (const item of section.items) tiles.appendChild(item.el);
      row.appendChild(title);
      row.appendChild(tiles);
      rowsEl.appendChild(row);
      grid.push(section.items);
    }

    if (!grid.length) return;
    pos = { r: 0, c: 0 };
    grid.forEach((items, r) => items.forEach((item, c) => {
      if (item.key === savedKey) pos = { r, c };
    }));
    focus(pos.r, pos.c, false);
  }

  function focus(r, c, remember = true) {
    const current = grid[pos.r] && grid[pos.r][pos.c];
    if (current) current.el.classList.remove('focus');
    pos = { r, c };
    const item = grid[r][c];
    item.el.classList.add('focus');
    item.el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (remember) localStorage.setItem(FOCUS_KEY, item.key);
  }

  // --- Télécommande ---

  document.addEventListener('keydown', event => {
    if (!grid.length) return;
    const { r, c } = pos;
    switch (event.keyCode) {
      case KEY.LEFT: if (c > 0) focus(r, c - 1); break;
      case KEY.RIGHT: if (c < grid[r].length - 1) focus(r, c + 1); break;
      case KEY.UP: if (r > 0) focus(r - 1, Math.min(c, grid[r - 1].length - 1)); break;
      case KEY.DOWN: if (r < grid.length - 1) focus(r + 1, Math.min(c, grid[r + 1].length - 1)); break;
      case KEY.ENTER: grid[r][c].run(); break;
      case KEY.BACK:
      case KEY.ESCAPE:
        if (window.tizen) tizen.application.getCurrentApplication().exit();
        break;
      default: return;
    }
    event.preventDefault();
  });

  // --- Démarrage ---

  function loadInstalledApps(done) {
    if (!window.tizen) return done();
    try {
      tizen.application.getAppsInfo(list => {
        installed = {};
        for (const app of list) installed[app.id] = true;
        done();
      }, () => done());
    } catch (e) {
      done();
    }
  }

  updateClock();
  loadInstalledApps(render);
  connectService();
})();
