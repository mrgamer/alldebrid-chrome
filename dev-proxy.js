var // node modules
  httpProxy = require('http-proxy'),
  express = require('express'),
  debug = require('debug');

var // node stdLib
  fs = require('fs'),
  path = require('path'),
  url = require('url');

var
  server = express(),
  ad = httpProxy.createProxyServer({ changeOrigin: true }),
  dbgForward = debug('proxy:forward'),
  dbgServe = debug('proxy:serve');

const baseDir = 'build';
var dirs = ['fonts', 'libs', ''];

ad.on('proxyRes', function (proxyRes, req, res, options) {
  dbgForward(proxyRes.headers);
  // proxyRes.setHeader('X-Special-Proxy-Header', 'foobar');
});

/**
 * This section creates a list of urls to be served manually
 * by this script.
 * The array itself is an URL form, ex: /style.css or /libs/angular.js
 */
var localFiles = ['/'];
dirs.forEach(function (d) {
  var dirListing = fs.readdirSync(path.join(__dirname, baseDir, d))
  .map(function (file) {
    return [d, file].join('/');
  });
  localFiles = localFiles.concat(dirListing);
});
localFiles = localFiles.map(function (file) {
  return (file[0] === '/') ? file : '/' + file;
});

server.use(function (req, res, next) {
  var parsedUrl = url.parse(req.url);
  var pathname = parsedUrl.pathname;
  if (localFiles.indexOf(pathname) === -1) return next();
  dbgServe('Serving', pathname, 'by hand.');
  res.sendFile(pathname, { root: path.join(__dirname, 'build') });
});

server.use(function (req, res) {
  dbgForward('Forwarding request:', req.url);
  ad.web(req, res, { target: 'http://www.alldebrid.com' });
});

if (require.main === module) {
  server.set('port', process.env.PORT || 3000);
  server.set('hostname', process.env.HOSTNAME || '127.0.0.1');

  var listen = server.listen(server.get('port'), server.get('hostname'), function () {
    console.log('\x1b[36m%s\x1b[0m %s', 'Express server listening on:', 'http://' + listen.address().address + ':' + listen.address().port + '/');
  });
}

module.exports = server;
