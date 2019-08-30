const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const httpProxy = require('http-proxy');

/**
 * Proxy config object
 */
let SETTINGS = {
  cookie: 'ses6=***********',
  host: 'vepp-1.vepp.evm.ru',
  port: 8000,
};
const customSettingsPath = path.join(process.cwd(), 'proxy.conf.json');

try {
  SETTINGS = require(customSettingsPath);
} catch (error) {
  fs.writeJsonSync(customSettingsPath, SETTINGS, { spaces: 2 });
  // eslint-disable-next-line no-console
  console.log(customSettingsPath, 'successfully created!');
}

/** debug settings */
// eslint-disable-next-line no-console
console.log('Proxy config object:', SETTINGS);
/************************************************************************/

/**
 *
 *
 * Create a proxy server with custom application logic
 *
 */
const proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('Origin', 'https://' + SETTINGS.host);
  proxyReq.setHeader('Referer', 'https://' + SETTINGS.host + '/');
  proxyReq.setHeader('cookie', SETTINGS.cookie);
});

proxy.on('proxyReqWs', function(proxyReqWs, req, res, options) {
  proxyReqWs.setHeader('Origin', 'https://' + SETTINGS.host);
  proxyReqWs.setHeader('Referer', 'https://' + SETTINGS.host + '/');
  proxyReqWs.setHeader('cookie', SETTINGS.cookie);
});

proxy.on('proxyRes', function(proxyRes, req, res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
  }
});

// Listen for the `error` event on `proxy`.
proxy.on('error', function(err, req, res) {
  console.warn(req.headers.origin + req.url);

  if (req.headers.origin && req.url) {
    res.setHeader('access-control-allow-origin', '*');
    res.writeHead(301, { Location: req.headers.origin + req.url });
    res.end();
  } else {
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
  }
});

const server = http.createServer(function(req, res) {
  proxy.web(req, res, {
    target: 'https://' + SETTINGS.host,
    secure: false,
    changeOrigin: true,
  });
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
server.on('upgrade', function(req, socket, head) {
  proxy.ws(req, socket, head, {
    target: 'wss://' + SETTINGS.host,
    secure: false,
    changeOrigin: true,
  });
});

// eslint-disable-next-line no-console
console.log(`The proxy dev server is listening on port ${SETTINGS.port}...`);
server.listen(SETTINGS.port);
