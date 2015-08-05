# jschan&nbsp;&nbsp;[![Build Status](https://travis-ci.org/GraftJS/jschan.png)](https://travis-ci.org/GraftJS/jschan)

__jschan__ is a JavaScript port of [libchan](https://github.com/docker/libchan) based around node streams

[Find out more about Graft](https://github.com/GraftJS/graft)

## Status

The jschan API should be stable at this point, but libchan is a developing standard and there may be breaking changes in future.  

When used over the standard SPDY transport, jschan is compatible with the current Go reference implementation.  

We also have a websocket transport to allow us to run jschan on the browser. This feature is not covered by the spec, and is not compatible with other implementations.  


## Install

```bash
npm install jschan-spdy --save
```

## Example

This example exposes a service over SPDY.
It is built to be interoperable with the original libchan version
[rexec](https://github.com/dmcgowan/libchan/tree/rexec_tls_support/examples/rexec).

### Server

The server opens up a jschan server to accept new sessions, and then
execute the requests that comes through the channel.

```js
'use strict';

var jschan = require('jschan');
var childProcess = require('child_process');
var server = require('jschan-spdy').server;

server.listen(9323);

function handleReq(req) {
  var child = childProcess.spawn(
    req.Cmd,
    req.Args,
    {
      stdio: [
        'pipe',
        'pipe',
        'pipe'
      ]
    }
  );

  req.Stdin.pipe(child.stdin);
  child.stdout.pipe(req.Stdout);
  child.stderr.pipe(req.Stderr);

  child.on('exit', function(status) {
    req.StatusChan.write({ Status: status });
  });
}

function handleChannel(channel) {
  channel.on('data', handleReq);
}

function handleSession(session) {
  session.on('channel', handleChannel);
}

server.on('session', handleSession);
```

### Client

```js
'use strict';

var usage = process.argv[0] + ' ' + process.argv[1] + ' command <args..>';

if (!process.argv[2]) {
  console.log(usage)
  process.exit(1)
}

var jschan = require('jschan');
var session = require('jschan-spdy').clientSession({ port: 9323 });
var sender = session.WriteChannel();

var cmd = {
  Args: process.argv.slice(3),
  Cmd: process.argv[2],
  StatusChan: sender.ReadChannel(),
  Stderr: process.stderr,
  Stdout: process.stdout,
  Stdin: process.stdin
};

sender.write(cmd);

cmd.StatusChan.on('data', function(data) {
  sender.end();
  setTimeout(function() {
    console.log('ended with status', data.Status);
    process.exit(data.Status);
  }, 500);
})
```

## Contributors

* [Adrian Rossouw](http://github.com/Vertice)
* [Peter Elger](https://github.com/pelger)
* [Matteo Collina](https://github.com/mcollina)

## License

MIT
