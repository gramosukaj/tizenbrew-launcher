// Service Node.js exécuté par TizenBrew (Node 4 : ES5 uniquement).
// La page du lanceur n'a pas accès à l'API tizen ; ce service lui expose la liste
// des applis installées et leur lancement sur http://127.0.0.1:8095.
var http = require('http');
var url = require('url');

var PORT = 8095;

function reply(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
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
  } else {
    reply(res, 404, { error: 'not found' });
  }
});

// Port déjà pris : une instance précédente du service tourne encore, elle répondra à notre place.
server.on('error', function () {});
server.listen(PORT, '127.0.0.1');
