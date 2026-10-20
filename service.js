// Service Node.js exécuté par TizenBrew (Node 4 : ES5 uniquement).
// La page du lanceur n'a pas accès à l'API tizen ; ce service lui expose sur http://127.0.0.1:8095
// la liste des applis installées, leur lancement et l'état du réseau.
var http = require('http');
var url = require('url');
var os = require('os');

var PORT = 8095;
var VERSION = 2;    // à augmenter à chaque changement : une version plus récente remplace l'ancienne

function reply(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
}

// Type de connexion d'après les interfaces réseau, si l'API tizen ne répond pas.
function networkFromInterfaces() {
  var interfaces = os.networkInterfaces();
  var type = 'none';
  Object.keys(interfaces).forEach(function (name) {
    var connected = interfaces[name].some(function (a) { return a.family === 'IPv4' && !a.internal; });
    if (!connected) return;
    if (/^eth/.test(name)) type = 'ethernet';
    else if (/^wl/.test(name) && type !== 'ethernet') type = 'wifi';
  });
  return { type: type };
}

function networkStatus(done) {
  try {
    tizen.systeminfo.getPropertyValue('NETWORK', function (network) {
      var types = { ETHERNET: 'ethernet', WIFI: 'wifi', NONE: 'none' };
      done({ type: types[network.networkType] || 'other' });
    }, function () {
      done(networkFromInterfaces());
    });
  } catch (e) {
    done(networkFromInterfaces());
  }
}

var server = http.createServer(function (req, res) {
  var request = url.parse(req.url, true);

  if (request.pathname === '/apps') {
    tizen.application.getAppsInfo(function (apps) {
      reply(res, 200, apps.map(function (app) { return app.id; }));
    }, function (e) {
      reply(res, 500, { error: e.message });
    });
  } else if (request.pathname === '/launch' && request.query.id) {
    tizen.application.launch(request.query.id, function () {
      reply(res, 200, { ok: true });
    }, function (e) {
      reply(res, 500, { error: e.message });
    });
  } else if (request.pathname === '/status') {
    networkStatus(function (network) { reply(res, 200, { network: network }); });
  } else if (request.pathname === '/version') {
    reply(res, 200, { version: VERSION });
  } else if (request.pathname === '/shutdown') {
    reply(res, 200, { ok: true });
    server.close();
  } else {
    reply(res, 404, { error: 'not found' });
  }
});

// Le service tourne jusqu'au redémarrage de la TV. Si une version plus ancienne occupe déjà le port
// (lanceur mis à jour entre-temps), on lui demande de s'arrêter puis on prend sa place.
var attempts = 0;
function listen() {
  server.listen(PORT, '127.0.0.1');
}

server.on('error', function (e) {
  if (e.code !== 'EADDRINUSE' || ++attempts > 3) return;
  http.get({ host: '127.0.0.1', port: PORT, path: '/version' }, function (res) {
    var body = '';
    res.on('data', function (chunk) { body += chunk; });
    res.on('end', function () {
      var running = 0;
      try { running = JSON.parse(body).version || 0; } catch (err) {}
      if (running >= VERSION) return;
      http.get({ host: '127.0.0.1', port: PORT, path: '/shutdown' }, function () {}).on('error', function () {});
      setTimeout(listen, 500);
    });
  }).on('error', function () {
    setTimeout(listen, 500);
  });
});

listen();
