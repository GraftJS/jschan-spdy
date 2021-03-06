
'use strict';

var abstractSession = require('jschan/test/abstract_session');
var spdy = require('..');
var fs = require('fs');

describe('spdy session', function() {

  var server;

  before(function(done) {
    server = spdy.server({
      key: fs.readFileSync(__dirname + '/certificates/key.pem'),
      cert: fs.readFileSync(__dirname + '/certificates/cert.pem'),
      ca: fs.readFileSync(__dirname + '/certificates/csr.pem')
    });

    server.on('listening', done);

    server.listen(0);
  });

  abstractSession(function(cb) {

    var outSession = spdy.clientSession({
      host: server.address().host,
      port: server.address().port,
      rejectUnauthorized: false
    });

    server.once('session', function(session) {
      cb(null, session, outSession);
    });
  });

  after(function shutdownServer(done) {
    server.close(done);
  });
});

describe('spdy session with auto certificates', function() {
  this.timeout(5000);

  var server;

  before(function(done) {
    server = spdy.server();
    server.on('listening', done);
    server.listen(0);
  });

  abstractSession(function(cb) {

    var outSession = spdy.clientSession({
      host: server.address().host,
      port: server.address().port
    });

    server.once('session', function(session) {
      cb(null, session, outSession);
    });
  });

  after(function shutdownServer(done) {
    server.close(done);
  });
});
