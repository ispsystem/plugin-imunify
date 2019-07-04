const http = require('http');
const httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

proxy.on('proxyRes', function(proxyRes, req, res) {
  res.setHeader('access-control-allow-origin', '*');
});

// Listen for the `error` event on `proxy`.
proxy.on('error', function(err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});

const server = http.createServer(function(req, res) {

  // console.log(req.headers);

  proxy.web(req, res, {
    target: 'https://vepp-1.vepp.evm.ru',
    secure: false
  });
});

console.log('The proxy dev server is listening on port 8000');
server.listen(8000);
